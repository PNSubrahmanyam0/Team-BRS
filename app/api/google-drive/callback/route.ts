import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminDb, encryptToken, getDriveConfig, requireStaff, verifyOAuthState } from "@/lib/google-drive/server";
export const runtime="nodejs";
export async function GET(request:Request) {
 const url=new URL(request.url), code=url.searchParams.get("code"), state=url.searchParams.get("state"), oauthError=url.searchParams.get("error");
 const jar=await cookies(), cookieState=jar.get("brs_google_oauth_state")?.value;
 jar.delete("brs_google_oauth_state");
 const fail=(message:string)=>NextResponse.redirect(new URL("/settings/storage?error="+encodeURIComponent(message),url.origin));
 try {
  if(oauthError) return fail("Google authorization was cancelled.");
  const payload=cookieState?verifyOAuthState(cookieState):null;
  if(!payload||!state||payload.nonce!==state||Date.now()-Number(payload.issuedAt)>600000) return fail("OAuth state validation failed. Please try again.");
  const {user,organizationId}=await requireStaff();
  if(user.id!==payload.userId||organizationId!==payload.organizationId) return fail("Signed-in account changed during Google authorization.");
  if(!code) return fail("Google did not return an authorization code.");
  const {clientId,clientSecret,redirectUri}=getDriveConfig();
  const tokenResponse=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:clientId,client_secret:clientSecret,redirect_uri:redirectUri,grant_type:"authorization_code"})});
  const tokens=await tokenResponse.json();
  if(!tokenResponse.ok||!tokens.refresh_token) return fail("Google did not issue a refresh token. Reconnect and approve offline access.");
  const profileResponse=await fetch("https://www.googleapis.com/oauth2/v2/userinfo",{headers:{Authorization:"Bearer "+tokens.access_token}});
  const googleProfile=await profileResponse.json();
  if(!profileResponse.ok||!googleProfile.email) return fail("Could not verify the connected Google account.");
  const encrypted=encryptToken(String(tokens.refresh_token));
  const db=createAdminDb();
  const {error}=await db.from("google_drive_connections").upsert({organization_id:organizationId,connected_by:user.id,google_email:String(googleProfile.email),refresh_token_ciphertext:encrypted.ciphertext,refresh_token_iv:encrypted.iv,refresh_token_auth_tag:encrypted.tag,scopes:String(tokens.scope||"").split(" "),status:"connected",updated_at:new Date().toISOString()},{onConflict:"organization_id"});
  if(error) throw new Error(error.message);
  return NextResponse.redirect(new URL("/settings/storage?connected=1",url.origin));
 } catch(e) { return fail(e instanceof Error?e.message:"Google Drive connection failed."); }
}
