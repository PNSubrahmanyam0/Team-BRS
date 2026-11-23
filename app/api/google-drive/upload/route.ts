import {NextResponse} from "next/server";
import {createAdminDb,getAccessToken,getConnection,requireStaff} from "@/lib/google-drive/server";
export const runtime="nodejs";
const MAX_FILE_SIZE=25*1024*1024;
const ALLOWED=new Set(["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","image/jpeg","image/png"]);
async function uploadToDrive(file:File,folderId:string,token:string){
 const metadata={name:file.name.replace(/[\\/\\0]/g,"_").slice(0,180),mimeType:file.type,parents:[folderId]};
 const start=await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,webViewLink",{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json; charset=UTF-8","X-Upload-Content-Type":file.type,"X-Upload-Content-Length":String(file.size)},body:JSON.stringify(metadata)});
 if(!start.ok)throw new Error("Google Drive upload could not be initialized.");
 const location=start.headers.get("location");if(!location)throw new Error("Google Drive did not return an upload URL.");
 const uploaded=await fetch(location,{method:"PUT",headers:{"Content-Type":file.type},body:await file.arrayBuffer()});
 const data=await uploaded.json();if(!uploaded.ok)throw new Error(data.error?.message||"Google Drive upload failed.");return data;
}
export async function POST(request:Request){
 let createdFileId:string|undefined;
 try{
  const {user,organizationId}=await requireStaff();const form=await request.formData();
  const file=form.get("file");const category=String(form.get("category")||"");const candidateId=String(form.get("candidateId")||"");const vacancyId=String(form.get("vacancyId")||"");const documentType=String(form.get("documentType")||"other");
  if(!(file instanceof File)||file.size===0||file.size>MAX_FILE_SIZE)throw new Error("Choose a file up to 25 MB.");
  if(!ALLOWED.has(file.type))throw new Error("Only PDF, DOC, DOCX, JPG and PNG files are allowed.");
  if(!["resume","candidate_document","vacancy_poster","other"].includes(category))throw new Error("Unsupported upload category.");
  const sessionDb=(await import("@/lib/supabase/server")).createClient;const s=await sessionDb();
  if(category==="resume"||category==="candidate_document"){
   if(!candidateId)throw new Error("Candidate ID is required.");
   const {data:c}=await s.from("candidates").select("id").eq("id",candidateId).eq("organization_id",organizationId).maybeSingle();if(!c)throw new Error("Candidate not found in this organization.");
  }
  if(category==="vacancy_poster"){
   if(!vacancyId)throw new Error("Vacancy ID is required.");
   const {data:v}=await s.from("vacancies").select("id").eq("id",vacancyId).eq("organization_id",organizationId).maybeSingle();if(!v)throw new Error("Vacancy not found in this organization.");
  }
  const connection=await getConnection(organizationId);if(!connection.root_folder_id)throw new Error("Choose the dedicated Google Drive folder in Storage Settings first.");
  const folderName=category==="resume"?"01_Candidate_Resumes":category==="candidate_document"?"02_Candidate_Documents":category==="vacancy_poster"?"03_Vacancy_Posters":"02_Candidate_Documents";
  const folderId=connection.folder_map?.[folderName];if(!folderId)throw new Error("Drive subfolder configuration is missing.");
  const token=await getAccessToken(connection);const driveFile=await uploadToDrive(file,folderId,token);createdFileId=driveFile.id;
  const db=createAdminDb();let recordError:any=null;
  if(category==="resume"){
   const {data:existing}=await db.from("resumes").select("version_number").eq("candidate_id",candidateId).order("version_number",{ascending:false}).limit(1);
   const version=(existing?.[0]?.version_number||0)+1;
   await db.from("resumes").update({is_current:false}).eq("candidate_id",candidateId);
   const {error}=await db.from("resumes").insert({candidate_id:candidateId,drive_file_id:driveFile.id,original_filename:file.name,mime_type:file.type,file_size:file.size,version_number:version,is_current:true});
   recordError=error;
  }else if(category==="candidate_document"){
   const {error}=await db.from("candidate_documents").insert({candidate_id:candidateId,document_type:documentType,drive_file_id:driveFile.id,original_filename:file.name,verification_status:"pending"});
   recordError=error;
  }else if(category==="vacancy_poster"){
   const {error}=await db.from("vacancy_posters").insert({vacancy_id:vacancyId,drive_file_id:driveFile.id,original_filename:file.name,uploaded_by:user.id});
   recordError=error;
  }else{
   const {error}=await db.from("drive_file_records").insert({organization_id:organizationId,entity_type:"general",entity_id:null,drive_file_id:driveFile.id,filename:file.name,mime_type:file.type,file_size:file.size,uploaded_by:user.id});
   recordError=error;
  }
  if(recordError){await fetch("https://www.googleapis.com/drive/v3/files/"+encodeURIComponent(createdFileId),{method:"DELETE",headers:{Authorization:"Bearer "+token}});throw new Error(recordError.message);}
  return NextResponse.json({ok:true,fileId:driveFile.id,fileName:file.name,size:file.size});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Upload failed."},{status:400});}
}
