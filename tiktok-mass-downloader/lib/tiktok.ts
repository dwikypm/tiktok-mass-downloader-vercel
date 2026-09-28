const API="https://open.tiktokapis.com/v2";

export function authUrl(){
  const params=new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY || "",
    response_type:"code",
    scope:"user.info.basic,video.list",
    redirect_uri: process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI || ""
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

export async function exchangeCode(code:string){
  const body=new URLSearchParams({
    client_key:process.env.TIKTOK_CLIENT_KEY||"",
    client_secret:process.env.TIKTOK_CLIENT_SECRET||"",
    code,
    grant_type:"authorization_code",
    redirect_uri:process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI||""
  });
  const r=await fetch("https://open.tiktokapis.com/v2/oauth/token/",{
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body
  });
  const d=await r.json();
  if(!r.ok || !d.access_token) throw new Error(d.error_description||d.message||"Token exchange gagal");
  return d;
}

export async function getVideos(token:string){
  const fields=["id","create_time","cover_image_url","share_url","video_description","duration","title","embed_link"].join(",");
  const r=await fetch(`${API}/video/list/?fields=${fields}`,{
    method:"POST",
    headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
    body:JSON.stringify({max_count:20})
  });
  const d=await r.json();
  if(!r.ok || d.error?.code && d.error.code!=="ok") throw new Error(d.error?.message||"TikTok API error");
  return d.data;
}

export async function getUser(token:string){
  const fields="open_id,display_name,avatar_url,profile_deep_link";
  const r=await fetch(`${API}/user/info/?fields=${fields}`,{headers:{Authorization:`Bearer ${token}`}});
  const d=await r.json();
  if(!r.ok || !d.data?.user) throw new Error(d.error?.message||"User API error");
  return d.data.user;
}