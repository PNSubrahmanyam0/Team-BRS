"use client";
import {useState} from "react";
export function GoogleDriveSettings({configured,connected,googleEmail,rootFolderName}:{configured:boolean;connected:boolean;googleEmail?:string|null;rootFolderName?:string|null}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function connect(){window.location.href="/api/google-drive/connect";}
 async function chooseFolder(){
  setBusy(true);setMessage("");
  try{
   const tokenResponse=await fetch("/api/google-drive/picker-token",{cache:"no-store"});const tokenData=await tokenResponse.json();if(!tokenResponse.ok)throw new Error(tokenData.error||"Connect Google first.");
   const apiKey=process.env.NEXT_PUBLIC_GOOGLE_API_KEY,appId=process.env.NEXT_PUBLIC_GOOGLE_APP_ID;
   if(!apiKey||!appId)throw new Error("Google Picker API key and Google Cloud project number are not configured yet.");
   const loadScript=(src:string)=>new Promise<void>((resolve,reject)=>{const s=document.createElement("script");s.src=src;s.onload=()=>resolve();s.onerror=()=>reject(new Error("Could not load Google Picker."));document.head.appendChild(s);});
   await loadScript("https://apis.google.com/js/api.js");
   await new Promise<void>(resolve=>(window as any).gapi.load("picker",{callback:resolve}));
   const picker=(window as any).google.picker;
   const view=new picker.DocsView(picker.ViewId.FOLDERS).setIncludeFolders(true).setSelectFolderEnabled(true);
   const ui=new picker.PickerBuilder().setAppId(appId).setDeveloperKey(apiKey).setOAuthToken(tokenData.accessToken).addView(view).setCallback(async(data:any)=>{
    if(data.action!==picker.Action.PICKED)return;
    try{const selected=data.docs?.[0];if(!selected?.id)return;
     const save=await fetch("/api/google-drive/select-folder",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({folderId:selected.id})});
     const result=await save.json();if(!save.ok)throw new Error(result.error||"Folder selection failed.");
     setMessage("Connected folder: "+result.folderName+". Six private subfolders are ready.");window.location.reload();
    }catch(e){setMessage(e instanceof Error?e.message:"Folder selection failed.");}
   }).build();
   ui.setVisible(true);
  }catch(e){setMessage(e instanceof Error?e.message:"Could not open folder picker.");}
  finally{setBusy(false);}
 }
 return <section className="panel max-w-2xl space-y-4 p-6">
  <div><h2 className="text-lg font-semibold">Google Drive connection</h2><p className="muted mt-1 text-sm">Use your personal Google account and select an existing private folder. The app receives access only to files and folders you authorize.</p></div>
  {!configured?<p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900"><strong>Google Drive is not configured yet.</strong><br />This optional integration needs server-side credentials before resumes can be stored in Drive. The BRS login and recruitment dashboard continue to work normally.</p>:connected?<div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Connected as <strong>{googleEmail}</strong>{rootFolderName&&<div className="mt-1">Storage folder: {rootFolderName}</div>}</div>:<p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Google Drive is not connected yet.</p>}
  <div className="flex flex-wrap gap-3"><button onClick={connect} disabled={!configured} className="btn disabled:cursor-not-allowed disabled:opacity-50">{connected?"Reconnect Google account":"Connect Google account"}</button><button onClick={chooseFolder} disabled={!configured||!connected||busy} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">{busy?"Opening Picker…":"Choose existing Drive folder"}</button></div>
  {message&&<p className="text-sm text-slate-700">{message}</p>}
  <p className="muted text-xs">Access is restricted to the files the app creates or the folder you select. Your Google password is never shared with BRS.</p>
 </section>;
}
declare global {interface Window {gapi:any;google:any;}}
