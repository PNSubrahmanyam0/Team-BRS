import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { getDriveConfig, GOOGLE_DRIVE_SCOPES, makeOAuthState, requireStaff } from "@/lib/google-drive/server";
export const runtime="nodejs";
export async function GET(request:Request) {
 try {
  const {user,organizationId}=await requireStaff();
  const {clientId,redirectUri}=getDriveConfig();
  const nonce=randomBytes(24).toString("base64url");
  const state=makeOAuthState({nonce,userId:user.id,organizationId,issuedAt:Date.now()});
  const jar=await cookies();
  jar.set("brs_google_oauth_state",state,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:600});
  const url=new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id",clientId);url.searchParams.set("redirect_uri",redirectUri);
  url.searchParams.set("response_type","code");url.searchParams.set("scope",GOOGLE_DRIVE_SCOPES.join(" "));
  url.searchParams.set("access_type","offline");url.searchParams.set("prompt","consent");
  url.searchParams.set("include_granted_scopes","true");url.searchParams.set("state",nonce);
  return NextResponse.redirect(url);
 } catch(e) { return NextResponse.json({error:e instanceof Error?e.message:"Unable to start Google OAuth."},{status:400}); }
}
