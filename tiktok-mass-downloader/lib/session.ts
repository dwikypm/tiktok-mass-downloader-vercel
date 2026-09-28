import {cookies} from "next/headers";

const KEY="tiktok_access_token";

export async function saveToken(token:string){
  const c=await cookies();
  c.set(KEY,token,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:60*60*24});
}
export async function getToken(){
  const c=await cookies();
  return c.get(KEY)?.value || null;
}