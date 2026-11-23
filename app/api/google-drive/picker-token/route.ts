import {NextResponse} from "next/server";
import {requireStaff,getConnection,getAccessToken} from "@/lib/google-drive/server";
export const runtime="nodejs";
export async function GET(){
 try {const {organizationId}=await requireStaff();const connection=await getConnection(organizationId);const accessToken=await getAccessToken(connection);return NextResponse.json({accessToken,googleEmail:connection.google_email,folderSelected:Boolean(connection.root_folder_id)} ,{headers:{"Cache-Control":"no-store"}});}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to obtain Drive access."},{status:400,headers:{"Cache-Control":"no-store"}});}
}
