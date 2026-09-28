/**
 * Optional adapter point for an authorized third-party downloader.
 * Keep credentials server-side.
 *
 * The official TikTok Display API exposes video metadata/embed links,
 * not a bulk MP4 download endpoint. Do not scrape or bypass access controls here.
 */
export async function downloadAuthorizedVideo(_url:string){
  const endpoint=process.env.DOWNLOADER_API_URL;
  if(!endpoint) throw new Error("MP4 downloader adapter belum dikonfigurasi.");
  throw new Error("Implementasikan adapter sesuai API provider downloader yang kamu gunakan.");
}