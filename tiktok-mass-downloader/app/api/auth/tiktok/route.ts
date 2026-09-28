import {NextResponse} from "next/server";
import {authUrl} from "../../../../lib/tiktok";

export async function GET(){
  if(!process.env.TIKTOK_CLIENT_KEY || !process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI){
    return NextResponse.json({error:"TIKTOK_CLIENT_KEY dan NEXT_PUBLIC_TIKTOK_REDIRECT_URI belum diatur."},{status:500});
  }
  return NextResponse.redirect(authUrl());
}