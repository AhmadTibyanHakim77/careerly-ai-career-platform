<div align="center">

# Careerly

### AI Career Platform

**Kenali potensi CV, temukan peluang kerja yang relevan, dan kelola langkah karier dalam satu ruang kerja.**

Careerly adalah aplikasi full-stack untuk membantu pencari kerja memahami profil profesional dan mengeksplorasi kecocokan dengan lowongan.

![React](https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-13-f9322c?style=flat-square&logo=laravel&logoColor=white)
![Database](https://img.shields.io/badge/Database-SQLite%20%7C%20MySQL-4479a1?style=flat-square&logo=mysql&logoColor=white)

</div>

---

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Cara Kerja Analisis](#cara-kerja-analisis)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Menggunakan MySQL](#menggunakan-mysql)
- [Deploy dengan Docker](#deploy-dengan-docker)
- [REST API](#rest-api)
- [Struktur Project](#struktur-project)
- [Privasi dan Batasan](#privasi-dan-batasan)
- [Lisensi](#lisensi)

## Gambaran Umum

Careerly menggabungkan analisis CV, pencocokan keterampilan dengan lowongan, dan pelacakan lamaran. Pengguna dapat melihat dashboard dalam mode pratinjau, lalu masuk atau membuat akun saat ingin mengunggah CV. Setiap akun memiliki ruang kerja dan berkas CV privat.

Antarmuka tersedia dalam Bahasa Indonesia dan Bahasa Inggris. Proyek ini dibuat sebagai portofolio full-stack menggunakan React, TypeScript, Laravel, dan database SQL.

## Fitur Utama

### Analisis CV dan kecocokan kerja

- Unggah CV berformat PDF atau DOCX hingga 10 MB.
- Ekstrak teks CV di backend Laravel dan deteksi keterampilan yang dapat ditinjau serta diedit.
- Tampilkan skor CV, ringkasan, kekuatan, dan saran perbaikan.
- Bandingkan keterampilan dengan lowongan dan urutkan hasil berdasarkan tingkat kecocokan.
- Saring lowongan berdasarkan lokasi kerja remote, hybrid, atau di kantor, jenis pekerjaan, pencarian, dan ambang kecocokan.

### Ruang kerja karier

- Simpan lowongan, lihat detailnya, dan tandai posisi yang sedang dilamar.
- Kelola profil, preferensi, notifikasi, dan rencana pengembangan karier.
- Lihat riwayat skor, ekspor data ruang kerja ke JSON, dan coba kembali sinkronisasi jika diperlukan.
- Atur pemberitahuan lowongan harian dan ringkasan karier mingguan.

### Akun dan pengaturan

- Daftar, masuk, keluar, dan pulihkan kata sandi.
- Pisahkan ruang kerja serta berkas CV untuk setiap akun.
- Uji konfigurasi email dan SMTP dari pengaturan.
- Gunakan SQLite untuk pengembangan lokal atau MySQL untuk deployment.

## Teknologi

| Area | Teknologi |
| --- | --- |
| Frontend | React 19, TypeScript 6, Vite 8 |
| UI | Tailwind CSS 4, Framer Motion, Lucide React, Recharts |
| Backend | Laravel 13, PHP 8.3+ |
| Database | SQLite atau MySQL |
| Pemrosesan CV | `smalot/pdfparser`, PHP ZipArchive, DOM/XML |
| Deployment | Docker Compose, Nginx, MySQL |

## Cara Kerja Analisis

Analisis dasar berjalan dengan aturan aplikasi dan tidak memerlukan API AI. Skor dimulai dari 35, bertambah 5 poin untuk setiap keterampilan yang dikenali, dan bertambah 15 poin jika CV memuat bagian pengalaman, pendidikan, atau proyek. Skor maksimum adalah 100.

Integrasi OpenAI bersifat opsional dan tidak aktif secara default. Jika API key dikonfigurasi, teks CV hanya dikirim untuk analisis AI setelah pengguna memberikan persetujuan pada saat mengunggah. Teks CV mentah tidak disimpan ke database aplikasi.

> Skor dan kecocokan merupakan perkiraan berbasis aturan serta kata kunci. Hasilnya bukan penilaian perekrut dan tidak menjamin panggilan wawancara atau penerimaan kerja.

## Menjalankan Secara Lokal

### Persyaratan

- Node.js dan npm
- PHP 8.3 atau lebih baru
- Composer
- Ekstensi PHP `pdo_sqlite`, `zip`, `xml`, `mbstring`, dan `fileinfo`
- Ekstensi `pdo_mysql` jika menggunakan MySQL

### Langkah

1. Unduh dan ekstrak project, lalu buka foldernya di VS Code.
2. Buka terminal di folder utama project.
3. Pasang dependency frontend:

   ```bash
   npm install
   ```

4. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

5. Buka alamat lokal yang muncul di terminal.

Perintah `npm run dev` menyiapkan dependency Laravel jika diperlukan, membuat konfigurasi lokal dan kunci aplikasi, menjalankan migrasi serta seeder, kemudian memulai API Laravel, Vite, dan scheduler. Tekan `Ctrl+C` di terminal untuk menghentikan layanan.

Database SQLite lokal dibuat di `backend/database/database.sqlite`. Konfigurasi `backend/.env` dibuat dari `backend/.env.example`. Jangan mengunggah file `.env` atau kredensial ke GitHub.

> Gunakan `npm run dev` untuk menjalankan aplikasi lengkap. Ekstensi Live Server atau tombol **Go Live** hanya menyajikan file statis dan tidak menjalankan backend Laravel.

## Menggunakan MySQL

Buat database MySQL, jalankan aplikasi satu kali agar `backend/.env` dibuat, lalu sesuaikan konfigurasi database berikut:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=careerly
DB_USERNAME=root
DB_PASSWORD=
```

Simpan perubahan dan mulai ulang aplikasi dengan `npm run dev`. Jangan commit kata sandi database atau file `.env`.

## Deploy dengan Docker

Docker Compose menyiapkan frontend, Laravel API, MySQL, queue worker, dan scheduler. Aplikasi web menggunakan port `8080` secara default. Untuk penggunaan publik, sediakan domain, HTTPS, reverse proxy, dan penyimpanan persisten pada server atau platform yang mendukung Docker Compose v2.

### Konfigurasi awal

1. Salin `deploy/env.production.example` menjadi `deploy/.env.production`.
2. Isi domain, kata sandi database yang kuat, dan konfigurasi layanan yang diperlukan. Jangan unggah file `.env.production`.
3. Bangun image dan buat kunci Laravel:

   ```bash
   docker compose --env-file deploy/.env.production build
   docker compose --env-file deploy/.env.production run --rm --no-deps --entrypoint php api artisan key:generate --show
   ```

4. Salin kunci yang dihasilkan ke nilai `APP_KEY` di `deploy/.env.production`, lalu mulai layanan:

   ```bash
   docker compose --env-file deploy/.env.production up -d
   docker compose --env-file deploy/.env.production ps
   ```

Untuk melihat log layanan:

```bash
docker compose --env-file deploy/.env.production logs -f api web scheduler
```

Migrasi dan seeder dijalankan saat API pertama kali dimulai. Sebelum pembaruan, cadangkan database dan volume `careerly-resumes`. Backup database saja tidak mencakup berkas CV. Jangan gunakan `docker compose down -v` pada instalasi berisi data karena perintah tersebut menghapus volume.

Untuk deployment publik, isi `APP_URL` dengan domain HTTPS yang benar, aktifkan `SESSION_SECURE_COOKIE=true`, gunakan rahasia unik, dan uji pendaftaran, unggah CV, pengiriman email, serta pemulihan backup. Email reset kata sandi dan notifikasi email memerlukan SMTP. `OPENAI_API_KEY` opsional; skor dasar dan pencocokan tetap dapat digunakan tanpanya.

## REST API

API menggunakan sesi Laravel dan token CSRF untuk permintaan browser. Endpoint workspace, lowongan, email uji, dan CV memerlukan autentikasi.

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| `GET` | `/api/health` | Status API, database, dan konfigurasi AI |
| `GET` | `/api/auth/csrf` | Memulai sesi dan memperoleh token CSRF |
| `POST` | `/api/auth/register` | Membuat akun dan ruang kerja privat |
| `POST` | `/api/auth/login` | Membuka sesi pengguna |
| `POST` | `/api/auth/logout` | Menutup sesi pengguna |
| `POST` | `/api/auth/forgot-password` | Meminta tautan pemulihan kata sandi |
| `POST` | `/api/auth/reset-password` | Mengatur ulang kata sandi |
| `GET` / `PUT` | `/api/workspace` | Membaca atau menyimpan ruang kerja |
| `GET` | `/api/jobs` | Memuat lowongan dan menghitung kecocokan |
| `POST` / `DELETE` | `/api/resumes` | Mengunggah, menganalisis, atau menghapus CV |
| `POST` | `/api/account/test-email` | Menguji konfigurasi email |

## Struktur Project

```text
careerly/
├── backend/                 # API Laravel, migrasi, seeder, dan penyimpanan privat
├── deploy/                  # Konfigurasi Docker, Nginx, dan contoh environment produksi
├── scripts/dev.mjs          # Launcher pengembangan frontend dan backend
├── src/App.tsx              # Dashboard React dan integrasi API
├── Dockerfile.api
├── Dockerfile.web
├── docker-compose.yml
└── README.md
```

## Privasi dan Batasan

- Berkas CV disimpan pada disk privat Laravel dan dipisahkan per akun. Teks hasil ekstraksi digunakan untuk analisis, lalu tidak disimpan sebagai teks CV di database.
- Analisis AI dinonaktifkan secara default. Jika pengguna mengaktifkannya, pemrosesan tetap bergantung pada konfigurasi dan kebijakan retensi penyedia AI.
- `MAIL_MAILER=log` adalah konfigurasi lokal awal. Untuk mengirim email sungguhan, isi pengaturan SMTP di environment backend.
- Lowongan langsung berasal dari provider eksternal Arbeitnow. Ketersediaan dapat berubah dan hasil saat ini cenderung berisi posisi Eropa atau remote. Periksa lokasi, kelayakan, dan status lowongan di situs sumber sebelum melamar.
- Sampel lowongan lokal diberi label dan bukan lowongan terverifikasi.
- Untuk produksi, aktifkan HTTPS, batasi CORS ke domain yang benar, atur SMTP, serta buat backup berkala untuk database dan berkas CV.

## Lisensi

Careerly menggunakan lisensi proprietary **All Rights Reserved**. Source code tersedia untuk ditinjau sebagai portofolio. Penggunaan, penyalinan, perubahan, penerbitan ulang, distribusi, atau pemakaian project memerlukan izin tertulis dari pemilik hak cipta. Baca [`LICENSE`](LICENSE) untuk ketentuan lengkap.

Repository publik tetap memungkinkan orang melihat dan mengunduh source code. Jika akses harus disetujui sebelum source dapat dilihat, ubah visibilitas repository menjadi **private** dan undang hanya kolaborator yang disetujui.

## Pengembang

**Ahmad Tibyan Hakim** · [GitHub](https://github.com/AhmadTibyanHakim77)
