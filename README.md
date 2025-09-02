# Greeting Card Generator

Static web app untuk membuat kartu ucapan dengan nama kustom, termasuk halaman admin untuk mengunggah background custom.

## Struktur
- `index.html` – Generator kartu + canvas
- `script.js` – Render canvas, auto-fit teks, download PNG
- `admin.html` – Dashboard admin (upload, pratinjau, pengaturan password)
- `admin.js` – Logika admin (localStorage, hash password, modal password)
- `design.png` – Background default

## Cara menjalankan lokal
Gunakan server lokal agar fitur canvas dan font berjalan sempurna.

Python:
```bash
python -m http.server 8080
```
Buka `http://localhost:8080`.

## Deploy ke Cloudflare Pages
1. Push repo ini ke GitHub (`abudi64/GreetingsCardGenerator`).
2. Cloudflare Dashboard → Pages → Create Project → Connect to Git → pilih repo ini.
3. Build settings:
   - Framework preset: None
   - Build command: (kosongkan)
   - Output directory: (root)
4. Deploy.

## Proteksi /admin.html dengan Cloudflare Access
1. Buka Zero Trust → Access → Applications → Add application → Self-hosted.
2. Domain: domain Pages Anda (mis. `your-project.pages.dev`).
3. Path: `/admin.html`.
4. Policy: Allow → Include Everyone → Require Passcode (set passcode, mis. `admin123`).
5. Simpan. Kini `admin.html` memerlukan passcode di edge.

Catatan: Aplikasi juga memiliki login client-side. Dengan Access aktif, login lokal bisa dipertahankan sebagai lapisan tambahan atau dinonaktifkan jika tidak diperlukan.

## Penamaan file unduhan
Unduhan akan bernama: `Greeting Card - {Nama}.png`.
