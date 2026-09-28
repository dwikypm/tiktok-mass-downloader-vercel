import {NextRequest,NextResponse} from "next/server";
import {exchangeCode, getUser} from "../../../../../lib/tiktok";
import {saveToken} from "../../../../../lib/session";

export async function GET(req:NextRequest){
  const code=req.nextUrl.searchParams.get("code");
  const err=req.nextUrl.searchParams.get("error");
  if(err || !code) return NextResponse.redirect(new URL("/?error=Otorisasi%20TikTok%20dibatalkan",req.url));
  try{
    const token=await exchangeCode(code);
    await saveToken(token.access_token);
    return NextResponse.redirect(new URL("/",req.url));
  }catch(e:any){
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(e.message||"OAuth gagal")}`,req.url));
  }
}