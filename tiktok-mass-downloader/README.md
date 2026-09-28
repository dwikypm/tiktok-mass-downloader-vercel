# TikTok Mass Video Manager — Next.js + Vercel

Project ini adalah starter yang siap di-upload ke GitHub dan dideploy ke Vercel.

## Penting

TikTok Display API resmi membutuhkan:
- TikTok Developer account
- Login Kit + TikTok API/Display API approval
- scopes `user.info.basic` dan `video.list`
- OAuth authorization

API resmi menyediakan metadata video, thumbnail, share URL, dan embed link. API ini **bukan endpoint bulk MP4 downloader**. Karena itu project ini tidak menyertakan scraper/circumvention. Untuk MP4, gunakan adapter/provider yang kamu miliki hak dan izin untuk gunakan.

## 1. Jalankan lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

## 2. Konfigurasi TikTok Developer

Buat aplikasi di TikTok for Developers dan aktifkan Login Kit/Display API sesuai proses approval TikTok.

Atur Redirect URI:

```text
http://localhost:3000/api/auth/tiktok/callback
```

Isi `.env.local`:

```env
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...
NEXT_PUBLIC_TIKTOK_REDIRECT_URI=http://localhost:3000/api/auth/tiktok/callback
```

## 3. Deploy ke Vercel

1. Push project ke GitHub.
2. Import repository di Vercel.
3. Tambahkan Environment Variables:
   - `TIKTOK_CLIENT_KEY`
   - `TIKTOK_CLIENT_SECRET`
   - `NEXT_PUBLIC_TIKTOK_REDIRECT_URI`
4. Ganti redirect URI menjadi URL production:
   `https://DOMAIN-KAMU/api/auth/tiktok/callback`
5. Deploy.

Vercel mendukung Next.js secara zero-config.

## 4. Alur aplikasi

Login TikTok -> OAuth -> access token httpOnly cookie -> `/api/videos` -> TikTok `/v2/video/list/` -> tampilkan video -> pilih video -> buka share/embed link.

## 5. Pagination

TikTok mengembalikan maksimal 20 video per request. Untuk mengambil halaman berikutnya, panggil `/v2/video/list/` lagi dengan `cursor` yang diberikan TikTok. UI starter ini mengambil halaman pertama agar tetap ringan di Vercel.

## 6. Jika membutuhkan MP4 massal

Tambahkan provider downloader yang:
- kamu punya izin untuk gunakan,
- memiliki API resmi,
- mengizinkan penggunaan sesuai syarat layanannya.

Implementasi adapter dapat diletakkan di:

`lib/downloader.ts`

Jangan menaruh API key provider di client-side.

## 7. Catatan Vercel

Jangan gunakan filesystem lokal Vercel sebagai penyimpanan permanen. Untuk file besar/ZIP gunakan object storage atau proses download langsung di browser/provider yang mendukungnya.

## Lisensi

Kode starter ini dapat kamu modifikasi untuk project pribadi/komersial. Kamu bertanggung jawab atas kepatuhan terhadap TikTok Terms, hak cipta, dan kebijakan provider yang digunakan.
