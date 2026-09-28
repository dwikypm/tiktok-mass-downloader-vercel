 "use client";

import {useEffect, useMemo, useState} from "react";

type Video = {
  id:string; title?:string; video_description?:string;
  cover_image_url?:string; share_url?:string; embed_link?:string;
  duration?:number; create_time?:number;
};

export default function TikTokApp(){
  const [username,setUsername]=useState("");
  const [videos,setVideos]=useState<Video[]>([]);
  const [selected,setSelected]=useState<string[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{
    const p=new URLSearchParams(location.search);
    if(p.get("error")) setError(p.get("error")||"OAuth gagal.");
  },[]);

  const count=selected.length;
  const allSelected=videos.length>0 && count===videos.length;

  async function loadVideos(){
    setError("");
    setLoading(true);
    try{
      const r=await fetch("/api/videos",{cache:"no-store"});
      const d=await r.json();
      if(!r.ok) throw new Error(d.error||"Gagal mengambil video.");
      setVideos(d.videos||[]);
      setSelected([]);
      if(username.trim() && d.username && d.username.toLowerCase()!==username.replace("@","").trim().toLowerCase()){
        setError("Token TikTok aktif bukan untuk username tersebut. API resmi TikTok mengembalikan video dari akun yang memberi otorisasi.");
      }
    }catch(e:any){setError(e.message||"Terjadi kesalahan.");}
    finally{setLoading(false)}
  }

  function login(){
    window.location.href="/api/auth/tiktok";
  }

  function toggle(id:string){
    setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  }

  function toggleAll(){
    setSelected(allSelected?[]:videos.map(v=>v.id));
  }

  const chosen=useMemo(()=>videos.filter(v=>selected.includes(v.id)),[videos,selected]);

  return <div className="wrap">
    <section className="hero">
      <div className="badge">NEXT.JS • VERCEL READY</div>
      <h1>TikTok Mass Video Manager</h1>
      <p>Kelola video TikTok dengan API resmi TikTok.</p>
    </section>

    <section className="card">
      <div className="search">
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="@username TikTok"/>
        <button className="btn primary" onClick={login}>Login TikTok</button>
        <button className="btn secondary" onClick={loadVideos} disabled={loading}>{loading?"Memuat...":"Ambil Video"}</button>
      </div>
      <div className="hint">Catatan: username hanya menjadi label pencarian. Untuk API resmi, pemilik akun harus mengotorisasi aplikasi.</div>
      {error && <div className="error">{error}</div>}

      {videos.length>0 ? <>
        <div className="toolbar">
          <strong>{videos.length} video • {count} dipilih</strong>
          <div style={{display:"flex",gap:8}}>
            <button className="btn secondary" onClick={toggleAll}>{allSelected?"Batalkan Semua":"Pilih Semua"}</button>
            {chosen.length>0 && <button className="btn primary" onClick={()=>chosen.forEach(v=>window.open(v.share_url||v.embed_link,"_blank"))}>Buka yang Dipilih</button>}
          </div>
        </div>
        <div className="videos">
          {videos.map(v=><article className="video" key={v.id}>
            {v.cover_image_url ? <img className="thumb" src={v.cover_image_url} alt={v.title||"TikTok video"}/> : <div className="thumb"/>}
            <div className="vbody">
              <div className="title">{v.title||v.video_description||"TikTok video"}</div>
              <div className="meta">{v.duration ? `${v.duration}s`:""}{v.create_time?` • ${new Date(v.create_time*1000).toLocaleDateString("id-ID")}`:""}</div>
              <label className="check"><input type="checkbox" checked={selected.includes(v.id)} onChange={()=>toggle(v.id)}/> Pilih</label>
            </div>
          </article>)}
        </div>
      </> : <div className="empty">Belum ada video. Login dengan akun TikTok yang memiliki izin <b>video.list</b>, lalu klik “Ambil Video”.</div>}

      <div className="note">
        <b>Tentang download MP4:</b> Display API resmi TikTok menyediakan metadata video dan embed link, bukan endpoint MP4 untuk bulk downloader. Project ini sengaja tidak menyertakan scraper/circumvention. Jika kamu memiliki layanan downloader yang berizin, isi <code>DOWNLOADER_API_URL</code> dan implementasikan adapter di <code>lib/downloader.ts</code>.
      </div>
    </section>
    <div className="footer">Gunakan hanya untuk konten yang kamu miliki atau berhak simpan/unduh.</div>
  </div>
}