import {NextResponse} from "next/server";
import {createAdminDb,DRIVE_FOLDERS,getAccessToken,getConnection,requireStaff} from "@/lib/google-drive/server";
export const runtime="nodejs";
async function driveJson(url:string,token:string,init?:RequestInit){const r=await fetch(url,{...init,headers:{Authorization:"Bearer "+token,"Content-Type":"application/json",...(init?.headers||{})}});const data=await r.json();if(!r.ok)throw new Error(data.error?.message||"Google Drive API request failed.");return data;}
export async function POST(request:Request){
 try{
  const {user,organizationId}=await requireStaff();const body=await request.json();const folderId=String(body.folderId||"").trim();if(!folderId)throw new Error("Select a Drive folder first.");
  const connection=await getConnection(organizationId);const token=await getAccessToken(connection);
  const folder=await driveJson("https://www.googleapis.com/drive/v3/files/"+encodeURIComponent(folderId)+"?fields=id,name,mimeType,trashed,capabilities(canAddChildren)",token);
  if(folder.mimeType!=="application/vnd.google-apps.folder"||folder.trashed||folder.capabilities?.canAddChildren!==true)throw new Error("Selected folder is invalid or does not allow file creation.");
  const folderMap:Record<string,string>={};
  for(const name of DRIVE_FOLDERS){
   const created=await driveJson("https://www.googleapis.com/drive/v3/files?fields=id,name",token,{method:"POST",body:JSON.stringify({name,mimeType:"application/vnd.google-apps.folder",parents:[folderId]})});
   folderMap[name]=created.id;
  }
  const db=createAdminDb();const {error}=await db.rpc("brs_google_drive_set_folder",{p_organization_id:organizationId,p_root_folder_id:folderId,p_root_folder_name:String(folder.name),p_folder_map:folderMap});
  if(error)throw new Error(error.message);
  return NextResponse.json({ok:true,folderName:folder.name,subfolders:Object.keys(folderMap)});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to save Drive folder."},{status:400});}
}
