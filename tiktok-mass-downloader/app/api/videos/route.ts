import {NextResponse} from "next/server";
import {getToken} from "../../../lib/session";
import {getVideos,getUser} from "../../../lib/tiktok";

export async function GET(){
  const token=await getToken();
  if(!token) return NextResponse.json({error:"Belum login TikTok."},{status:401});
  try{
    const [data,user]=await Promise.all([getVideos(token),getUser(token)]);
    return NextResponse.json({videos:data.videos||[],has_more:!!data.has_more,cursor:data.cursor,username:user.display_name||""});
  }catch(e:any){
    return NextResponse.json({error:e.message||"Gagal mengambil video."},{status:502});
  }
}