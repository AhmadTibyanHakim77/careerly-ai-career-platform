# Laravel API

Backend untuk dashboard Careerly. Petunjuk instalasi dan konfigurasi SQL ada di [README project](../README.md).

API:

- `GET /api/health` — status layanan dan driver database.
- `GET|PUT /api/workspace` — profil, preferensi, notifikasi, pekerjaan tersimpan, pelacak lamaran, dan tahapan karier.
- `GET /api/jobs` — daftar lowongan dengan nilai kecocokan keterampilan.
- `POST /api/resumes` — membaca PDF/DOCX, menyimpan file secara privat, dan membuat hasil analisis.
- `DELETE /api/resumes` — menghapus seluruh file CV dan riwayat analisis workspace.

Gunakan API ini sebagai workspace lokal satu pengguna. Tambahkan autentikasi dan otorisasi sebelum menggunakannya untuk beberapa pengguna atau membuka server ke internet.
