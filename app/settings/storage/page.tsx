import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {AdminShell} from "@/components/admin-shell";
import {GoogleDriveSettings} from "@/components/google-drive-settings";
import {createAdminDb} from "@/lib/google-drive/server";
export default async function StorageSettings({searchParams}:{searchParams:Promise<{connected?:string;error?:string}>}){
 const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect("/login");
 const {data:p}=await s.from("profiles").select("email,role,organization_id").eq("id",user.id).maybeSingle();if(!p||!["owner","admin"].includes(p.role)||!p.organization_id)redirect("/dashboard");
 const db=createAdminDb();const {data:c}=await db.from("google_drive_connections").select("google_email,root_folder_name,status").eq("organization_id",p.organization_id).maybeSingle();
 const params=await searchParams;
 return <AdminShell email={p.email??user.email??""}><h1 className="mb-2 text-3xl font-bold">Storage settings</h1><p className="muted mb-6 text-sm">Connect BRS to a dedicated private Google Drive folder.</p>{params.error&&<p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{params.error}</p>}{params.connected&&<p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Google account connected. Now select the existing BRS folder.</p>}<GoogleDriveSettings connected={c?.status==="connected"} googleEmail={c?.google_email} rootFolderName={c?.root_folder_name}/></AdminShell>;
}
