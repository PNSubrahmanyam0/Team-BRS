import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { createClient as createSessionClient } from "@/lib/supabase/server";

const scopes = ["https://www.googleapis.com/auth/drive.file","https://www.googleapis.com/auth/userinfo.email"];
export const DRIVE_FOLDERS = ["01_Candidate_Resumes","02_Candidate_Documents","03_Vacancy_Posters","04_Offer_Letters","05_Service_Agreements","06_Receipts"] as const;

export function getDriveConfig() {
 const clientId=process.env.GOOGLE_CLIENT_ID, clientSecret=process.env.GOOGLE_CLIENT_SECRET, redirectUri=process.env.GOOGLE_REDIRECT_URI;
 if(!clientId||!clientSecret||!redirectUri) throw new Error("Google OAuth environment variables are not configured.");
 return {clientId,clientSecret,redirectUri};
}
function getEncryptionKey() {
 const raw=process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
 if(!raw) throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY is not configured.");
 const key=/^[a-f0-9]{64}$/i.test(raw)?Buffer.from(raw,"hex"):Buffer.from(raw,"base64");
 if(key.length!==32) throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes.");
 return key;
}
export function encryptToken(token:string) {
 const iv=randomBytes(12), cipher=createCipheriv("aes-256-gcm",getEncryptionKey(),iv);
 const ciphertext=Buffer.concat([cipher.update(token,"utf8"),cipher.final()]);
 return {ciphertext:ciphertext.toString("base64"),iv:iv.toString("base64"),tag:cipher.getAuthTag().toString("base64")};
}
export function decryptToken(ciphertext:string,iv:string,tag:string) {
 const decipher=createDecipheriv("aes-256-gcm",getEncryptionKey(),Buffer.from(iv,"base64"));
 decipher.setAuthTag(Buffer.from(tag,"base64"));
 return Buffer.concat([decipher.update(Buffer.from(ciphertext,"base64")),decipher.final()]).toString("utf8");
}
export function createAdminDb() {
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key) throw new Error("Server-side Supabase service key is not configured.");
 return createSupabaseClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
}
export async function requireStaff() {
 const supabase=await createSessionClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user) throw new Error("Authentication required.");
 const {data:profile}=await supabase.from("profiles").select("role,organization_id,status").eq("id",user.id).maybeSingle();
 if(!profile||!["owner","admin","recruiter"].includes(profile.role)||profile.status!=="active"||!profile.organization_id) throw new Error("BRS staff access required.");
 return {user,organizationId:profile.organization_id};
}
export async function getConnection(organizationId:string) {
 const db=createAdminDb();
 const {data,error}=await db.from("google_drive_connections").select("*").eq("organization_id",organizationId).eq("status","connected").maybeSingle();
 if(error) throw new Error(error.message);
 if(!data) throw new Error("Google Drive is not connected for this organization.");
 return data;
}
export async function getAccessToken(connection:any) {
 const refreshToken=decryptToken(connection.refresh_token_ciphertext,connection.refresh_token_iv,connection.refresh_token_auth_tag);
 const {clientId,clientSecret}=getDriveConfig();
 const response=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,refresh_token:refreshToken,grant_type:"refresh_token"})});
 const body=await response.json();
 if(!response.ok||!body.access_token) throw new Error("Google Drive authorization expired. Reconnect Google Drive.");
 return String(body.access_token);
}
export function makeOAuthState(payload:Record<string,unknown>) {
 const secret=process.env.GOOGLE_OAUTH_STATE_SECRET;
 if(!secret||secret.length<32) throw new Error("GOOGLE_OAUTH_STATE_SECRET must be at least 32 characters.");
 const body=Buffer.from(JSON.stringify(payload)).toString("base64url");
 const signature=createHash("sha256").update(secret+"."+body).digest("base64url");
 return body+"."+signature;
}
export function verifyOAuthState(value:string) {
 const [body,signature]=value.split(".");
 const secret=process.env.GOOGLE_OAUTH_STATE_SECRET;
 if(!body||!signature||!secret) return null;
 const expected=createHash("sha256").update(secret+"."+body).digest("base64url");
 if(signature!==expected) return null;
 try { return JSON.parse(Buffer.from(body,"base64url").toString("utf8")); } catch { return null; }
}
export { scopes as GOOGLE_DRIVE_SCOPES, randomBytes };
