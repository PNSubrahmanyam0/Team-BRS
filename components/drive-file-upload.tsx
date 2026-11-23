"use client";
import {useState} from "react";
type Props={category:"resume"|"candidate_document"|"vacancy_poster"|"other";candidateId?:string;vacancyId?:string;documentType?:string;label?:string};
export function DriveFileUpload({category,candidateId,vacancyId,documentType="other",label="Choose file"}:Props){
 const [file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function upload(){
  if(!file)return;setBusy(true);setMessage("");
  try{
   const form=new FormData();form.set("file",file);form.set("category",category);
   if(candidateId)form.set("candidateId",candidateId);if(vacancyId)form.set("vacancyId",vacancyId);form.set("documentType",documentType);
   const response=await fetch("/api/google-drive/upload",{method:"POST",body:form});
   const result=await response.json();if(!response.ok)throw new Error(result.error||"Upload failed.");
   setMessage("Uploaded securely to Google Drive: "+result.fileName);setFile(null);
  }catch(e){setMessage(e instanceof Error?e.message:"Upload failed.");}
  finally{setBusy(false);}
 }
 return <div className="space-y-2"><label className="block text-sm font-medium">{label}<input className="field mt-1" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e=>setFile(e.target.files?.[0]??null)}/></label><button type="button" className="btn" disabled={!file||busy} onClick={upload}>{busy?"Uploading…":"Upload to Google Drive"}</button>{message&&<p className="text-xs text-slate-600">{message}</p>}<p className="muted text-xs">PDF, DOC, DOCX, JPG or PNG; maximum 25 MB.</p></div>;
}
