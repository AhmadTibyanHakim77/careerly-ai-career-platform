<div align="center">

# Careerly

### AI Resume & Career Analyzer

Dashboard karier bilingual untuk membaca CV, mengenali keterampilan, dan membandingkannya dengan kebutuhan pekerjaan.

![React](https://img.shields.io/badge/React-19-149eca?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-13-f9322c?style=for-the-badge&logo=laravel&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-SQLite%20%7C%20MySQL-4479a1?style=for-the-badge&logo=mysql&logoColor=white)

**Repository description:** Careerly — resume analyzer and career matcher built with React, Laravel, and SQL.

</div>

---

## Tentang Project

Careerly membantu pencari kerja memahami keterampilan pada CV, membandingkannya dengan lowongan, menyimpan posisi, dan mengelola langkah lamaran. Akun memiliki ruang kerja privat sendiri. Analisis AI tersedia secara opsional setelah pengguna memberi persetujuan.

Project ini dibuat sebagai portofolio full-stack dengan frontend React + TypeScript dan REST API Laravel. Antarmuka tersedia dalam Bahasa Indonesia dan Bahasa Inggris.

## Fitur

- Unggah CV PDF atau DOCX hingga 10 MB.
- Ekstraksi teks PDF/DOCX di backend Laravel dan penyimpanan file pada disk privat.
- Deteksi keterampilan dari teks CV dan profil yang dapat diedit.
- Perhitungan skor CV dan persentase kecocokan keterampilan terhadap lowongan.
- Hapus seluruh file CV privat dan riwayat analisis dari pengaturan analisis CV.
- Rekomendasi dari sampel lokal dan lowongan live provider eksternal dengan tautan langsung ke sumber lamaran.
- Setelah CV dianalisis, dashboard membuka daftar kecocokan dengan filter remote, hybrid, di kantor, tipe pekerjaan, ambang skor CV, pencarian, dan pengurutan.
- Pelacak posisi: simpan, lihat detail, dan tandai sebagai sedang dilamar.
- Pendaftaran, login sesi, logout, pembatasan percobaan, dan pemulihan kata sandi.
- Dashboard dapat dilihat lebih dulu dalam mode pratinjau; form login/daftar muncul sebagai dialog saat pengguna memilih unggah CV. Setelah masuk, dialog unggah langsung terbuka.
- Ruang kerja serta file CV dipisahkan per akun.
- Analisis AI OpenAI opsional dengan persetujuan sebelum teks CV dikirim.
- Pemberitahuan lowongan harian dan ringkasan karier mingguan jika diaktifkan.
- Tombol uji email dan konfigurasi SMTP.
- Dashboard profil, preferensi, notifikasi dalam aplikasi, dan rencana perkembangan karier.
- Ekspor lengkap data workspace ke JSON dan indikator sinkronisasi database dengan tombol coba lagi.
- Riwayat skor dan data workspace disimpan ke database SQL; teks mentah CV dibuang setelah analisis.
- Pilihan bahasa Indonesia dan Inggris.
- SQLite untuk pemakaian lokal; konfigurasi MySQL tersedia.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8 |
| UI | Tailwind CSS 4, Framer Motion, Lucide React, Recharts |
| Backend | Laravel 13, PHP 8.3+ |
| Database | SQLite lokal, MySQL opsional |
| Pembaca CV | `smalot/pdfparser`, PHP ZipArchive dan DOM/XML untuk DOCX |

## Arsitektur

Browser memakai sesi Laravel dan token CSRF untuk mengakses API. Laravel menyimpan data workspace per user di SQLite atau MySQL, mengekstrak teks CV sementara, membaca lowongan dari provider eksternal, dan dapat mengirim email melalui SMTP. Analisis AI hanya aktif setelah API key dikonfigurasi dan pengguna menyetujui pengiriman teks CV.

### Cara kerja analisis

Jika AI tidak diaktifkan atau tidak disetujui, skor CV memakai aturan transparan: skor awal 35, tambahan 5 poin untuk setiap keterampilan yang dikenali, dan 15 poin bila teks menunjukkan bagian pengalaman, pendidikan, atau proyek (maksimum 100). Jika OPENAI_API_KEY diatur dan pengguna memberi persetujuan saat unggah, layanan juga dapat menghasilkan ringkasan, kekuatan, dan saran. Teks CV mentah tidak disimpan aplikasi.

Kecocokan posisi dihitung dari keahlian dan target karier; ini perkiraan kata kunci, bukan penilaian perekrut atau jaminan diterima kerja. Sampel lokal diberi label. Provider gratis Arbeitnow tidak memerlukan API key dan saat ini terutama berisi posisi Eropa/remote; verifikasi lokasi, kelayakan, dan ketersediaan pada sumber sebelum melamar.

## Menjalankan Secara Lokal

### Persyaratan

- Node.js dan npm
- PHP 8.3 atau lebih baru
- Composer
- Ekstensi PHP `pdo_sqlite`, `zip`, `xml`, `mbstring`, dan `fileinfo`
- `pdo_mysql` jika ingin memakai MySQL

### Langkah

1. Buka folder project di VS Code.
2. Jalankan `npm install` satu kali.
3. Jalankan `npm run dev`.
4. Buka alamat Vite yang ditampilkan di terminal.

Launcher menyiapkan dependensi Laravel bila belum tersedia, membuat kunci aplikasi lokal, menjalankan migrasi dan seeder, lalu menyalakan Laravel API dan Vite. Tekan `Ctrl+C` di terminal untuk menghentikan server. Gunakan Vite melalui `npm run dev`; ekstensi Live Server/Go Live tidak menjalankan backend Laravel.

Database SQLite dibuat otomatis di `backend/database/database.sqlite`. File `.env` lokal dibuat dari `backend/.env.example` dan tidak perlu dimasukkan ke repository.

### Menggunakan MySQL

Buat database MySQL, lalu ubah nilai berikut di `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=careerly
DB_USERNAME=root
DB_PASSWORD=
```

Jalankan ulang `npm run dev`. Jangan commit `.env` atau kredensial database.

## Deploy dengan Docker

Project sudah memiliki Compose untuk menjalankan React, Laravel, MySQL, queue worker, dan scheduler pada satu domain. Data MySQL dan unggahan CV disimpan di volume terpisah; database tidak diekspos langsung ke internet. Untuk domain publik, arahkan reverse proxy/hosting HTTPS ke port aplikasi (default `8080`).

### Persiapan hosting

- Server atau platform yang mendukung Docker Compose v2 dan menyediakan HTTPS/domain.
- Salin `deploy/env.production.example` menjadi `deploy/.env.production`, lalu isi domain, kata sandi database yang kuat, dan kredensial SMTP. Berkas `.env.production` diabaikan Git dan jangan pernah diunggah.
- Email SMTP diperlukan agar reset kata sandi dan notifikasi email benar-benar sampai. Tanpa SMTP, fitur inti tetap berjalan tetapi email tidak terkirim.
- `OPENAI_API_KEY` opsional. Tanpa API key, pencocokan dan skor aturan tetap tersedia.

### Menjalankan

Dari direktori utama project, jalankan:

```bash
cp deploy/env.production.example deploy/.env.production
# Edit deploy/.env.production dan ganti seluruh nilai contoh/rahasia
docker compose --env-file deploy/.env.production build
docker compose --env-file deploy/.env.production run --rm --no-deps --entrypoint php api artisan key:generate --show
```

Salin kunci yang ditampilkan ke `APP_KEY` dalam `deploy/.env.production`, lalu mulai layanan:

```bash
docker compose --env-file deploy/.env.production up -d
docker compose --env-file deploy/.env.production ps
docker compose --env-file deploy/.env.production logs -f api web scheduler
```

API menjalankan migrasi database dan seeder saat pertama mulai. Untuk pembaruan, simpan backup database dan volume CV terlebih dahulu, tarik versi kode terbaru, lalu jalankan kembali `docker compose --env-file deploy/.env.production up -d --build`. Volume tetap dipertahankan selama tidak dihapus secara manual. Jangan gunakan `docker compose down -v` pada instalasi berisi data karena perintah tersebut menghapus volume.

Sebelum membuka situs untuk publik, pastikan DNS dan HTTPS reverse proxy sudah aktif, `APP_URL` berisi alamat HTTPS yang benar, `SESSION_SECURE_COOKIE=true`, kata sandi database telah diganti, serta tes pendaftaran, unggah CV, email reset kata sandi, dan pemulihan backup. Provider hosting tetap harus menyediakan mesin Docker dan penyimpanan persisten; berkas ini menyiapkan aplikasi, tetapi tidak membuat akun hosting/domain atau mengisi rahasia layanan.

### Catatan produksi

- Buat backup terjadwal untuk database **dan** volume `careerly-resumes`; backup database saja tidak menyertakan file CV. Simpan backup di lokasi terpisah dari server aplikasi.
- Scheduler menggunakan zona waktu `Asia/Jakarta`. SMTP perlu diuji dari menu pengaturan email setelah situs berjalan.
- Lowongan aktual memerlukan akses jaringan keluar ke provider Arbeitnow dan dapat kosong saat provider membatasi atau gagal merespons.
- Gunakan HTTPS dan rahasia unik di environment hosting. Jangan commit `deploy/.env.production`, kunci AI, kata sandi, database, atau file unggahan.

## REST API

Endpoint workspace, lowongan, email uji, dan CV mensyaratkan sesi login. Permintaan perubahan dilindungi token CSRF.

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET | /api/health | Status API, database, dan ketersediaan konfigurasi AI |
| GET | /api/auth/csrf | Memulai sesi browser dan memperoleh token CSRF |
| POST | /api/auth/register | Membuat akun dan workspace privat |
| POST | /api/auth/login | Membuka sesi akun |
| GET | /api/auth/me | Membaca akun yang sedang login |
| POST | /api/auth/logout | Menutup sesi akun |
| POST | /api/auth/forgot-password | Mengirim tautan pemulihan melalui email |
| POST | /api/auth/reset-password | Mengganti kata sandi dari tautan pemulihan |
| POST | /api/account/test-email | Menguji transport email |
| GET | /api/workspace | Membaca workspace akun |
| PUT | /api/workspace | Menyimpan perubahan workspace |
| GET | /api/jobs | Membaca lowongan dan menghitung kecocokan |
| POST | /api/resumes | Mengunggah dan menganalisis CV PDF/DOCX |
| DELETE | /api/resumes | Menghapus CV dan riwayat milik akun aktif |

## Struktur Folder

```text
ai-resume-analyzer/
├── backend/                 # Laravel API, migrasi, seeder, dan file CV privat
├── scripts/dev.mjs          # Menyiapkan database dan menjalankan frontend, API, dan scheduler
├── src/App.tsx              # Dashboard React, fitur, dan integrasi API
├── .env.example             # Alamat API frontend
└── README.md
```

## Privasi dan Konfigurasi Layanan

- File environment, database SQLite, vendor, node_modules, hasil build, dan file CV privat dikecualikan dari Git.
- Setiap akun memiliki data workspace dan unggahan CV sendiri. File CV disimpan pada disk privat Laravel; teks hasil ekstraksi tidak ditulis ke database.
- Analisis AI mati secara default. Isi CV hanya dikirim ke OpenAI jika OPENAI_API_KEY diatur dan pengguna mencentang persetujuan pada dialog unggah. store=false digunakan untuk Responses API; kebijakan retensi penyedia tetap berlaku.
- MAIL_MAILER=log adalah setelan lokal awal; email dicatat di log Laravel, bukan dikirim ke inbox. Atur host, port, username, password, dan alamat pengirim SMTP pada backend untuk pengiriman nyata.
- Job alerts dan weekly digest dijalankan oleh scheduler ketika launcher development berjalan. Pada deployment, gunakan scheduler Laravel yang berjalan terus-menerus.
- Lowongan live berasal dari provider eksternal, dapat kosong saat provider tidak tersedia, dan saat ini berfokus pada Eropa/remote. Sampel lokal diberi label dan bukan lowongan terverifikasi.
- Untuk deployment publik, atur HTTPS, domain CORS yang tepat, backup database dan file, SMTP, storage privat, serta kunci API hanya melalui environment aman.

## Lisensi dan Izin

Project ini menggunakan lisensi proprietary **All Rights Reserved**. Source code ditampilkan untuk keperluan melihat portofolio. Sebelum memakai, menyalin, mengubah, menerbitkan ulang, menyebarkan, atau menjalankan project ini, minta izin tertulis kepada Ahmad Tibyan Hakim melalui [GitHub](https://github.com/AhmadTibyanHakim77). Lihat berkas [`LICENSE`](LICENSE) untuk ketentuannya.

Jika Anda ingin menyetujui setiap akses sebelum seseorang dapat melihat atau mengunduh source code, atur repository GitHub menjadi **private** dan undang hanya kolaborator yang disetujui. Repository publik tetap dapat dilihat dan diunduh sesuai ketentuan GitHub; lisensi membatasi penggunaan kode, bukan mengunci tombol unduh.

## Pengembang

**Ahmad Tibyan Hakim** · [GitHub](https://github.com/AhmadTibyanHakim77)

> Sebelum repo dipublikasikan, tambahkan screenshot dashboard dan tautan demo setelah deployment tersedia.
