# PesanTerakhir.id

Aplikasi pengelolaan pesan rahasia otomatis berbasis Laravel 13, React (Inertia.js), dan Tailwind CSS v4 dengan tema Dark Mode & Glassmorphism.

---

## 🆕 Update Terbaru (v1.1.0)
Telah dilakukan perbaikan massal pada sistem keamanan, stabilitas, dan antarmuka pengguna (UI/UX) berdasarkan hasil audit sistem:
- **Keamanan (P0 Kritis)**: Perlindungan *dispatch* pesan agar tidak salah sasaran untuk pengguna baru, penyimpanan file rahasia yang dipindah ke *private storage* (`local`), verifikasi PIN penerima menggunakan backend endpoint, dan tautan penerima publik tanpa *auth* menggunakan **Laravel Signed URLs** yang memiliki expiry 72 jam demi keamanan.
- **Peningkatan Fitur (P1)**: Penambahan input email penerima, penanganan performa memory (audio/video *stream cleanup*), perbaikan validasi format file saat *upload*, dan notifikasi sukses/gagal (Toast/Flash Message).
- **UI/UX & Stabilitas (P2)**: Penyesuaian layout ponsel (*responsive design*), *state loading* saat pengiriman form, terjemahan label ke Bahasa Indonesia, dan perbaikan tampilan kalender tenggang waktu.
- **Skalabilitas & Keandalan (Sprint 4)**: Migrasi dari pengiriman *synchronous* berbasis Cron loop ke pemrosesan *asynchronous* menggunakan Laravel Queues (`SendWhatsAppMessageJob`) dengan chunking memori, retry, dan validasi standar E.164.

---

## 🚀 Instalasi & Setup

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd PesanTerakhir

composer install
npm install
cp .env.example .env
php artisan key:generate
```

### 2. Database
Proyek ini menggunakan **SQLite** secara default:
```bash
touch database/database.sqlite   # Unix/Mac
# atau buat file kosong di Windows
php artisan migrate
```

### 3. Storage (Local File Storage)
Agar file audio/video/dokumen yang diupload bisa diakses dari browser:
```bash
php artisan storage:link
```

Maksimal ukuran file (hingga 1GB untuk paket premium) dikontrol di `php.ini`:
```ini
upload_max_filesize = 1024M
post_max_size = 1024M
```

### 4. Konfigurasi WhatsApp API (Fonnte)
Untuk mengirim pesan WhatsApp (notifikasi ping & pesan rahasia), aplikasi menggunakan API dari **[Fonnte](https://fonnte.com)**.

1. Daftar di [Fonnte.com](https://fonnte.com)
2. Dapatkan API Token
3. Masukkan token tersebut di `.env`:
```env
FONNTE_TOKEN=token-anda-disini
```

> **Catatan**: Pengiriman menggunakan Laravel Queues di backend untuk menghindari blocking cron.

### 5. Worker & Scheduler (Cron Job)
Aplikasi bergantung pada Laravel Task Scheduler dan Queue Worker:
- **HeartbeatPing** (bulanan): Mengirim ping konfirmasi ke user via WA. Filtered by ping_schedule and checking status.
- **DispatchMessages** (harian): Mengecek user yang melewati batas `trigger_days` dan men-dispatch pesan ke queue worker.
- **Queue Worker**: Memproses API call ke WA secara paralel dengan Retry/Backoff.

Pada server production, jalankan Queue Worker dengan Supervisor dan Cron Scheduler:
```bash
# Cron:
* * * * * cd /path-ke-project && php artisan schedule:run >> /dev/null 2>&1

# Queue Worker (jalankan via supervisor/pm2):
php artisan queue:work --tries=3 --backoff=5,10,30
```

### 6. Menjalankan Aplikasi Lokal
```bash
# Terminal 1 — Backend
php artisan serve

# Terminal 2 — Frontend (Vite dev server)
npm run dev

# Terminal 3 — Queue Worker (WAJAR AKTIF AGAR PESAN TERKIRIM)
php artisan queue:work
```

Kunjungi **http://localhost:8000**, buat akun (Register), dan mulai menggunakan Brankas Pesan.

---

## 🏗️ Arsitektur & Fitur

### Tech Stack
| Layer | Teknologi |
|-------|-----------|
| Backend | Laravel 13 |end | Laravel 11 |
| Frontend | React 18 + TypeScript (Inertia.js) |
| Styling | Tailwind CSS v4 + Custom Glassmorphism |
| Database | SQLite (default) / MySQL / PostgreSQL |
| Auth | Laravel Breeze |
| WA API | Fonnte |

### Fitur Utama
- ✅ **Brankas Pesan** — Buat, edit, hapus pesan teks/audio/video/dokumen
- ✅ **Rekam Suara & Video** — Langsung dari browser (MediaRecorder API)
- ✅ **Upload Dokumen** — Drag & drop atau file picker
- ✅ **Dead Man's Switch** — Trigger otomatis jika tidak check-in selama X hari
- ✅ **Kontak Wali** — Verifikator sekunder (Verifikasi Lapis 2)
- ✅ **3 Paket Langganan** — 1 Tahun (Rp49.000), 5 Tahun (Rp149.000), Lifetime (Rp299.000)
- ✅ **Simulasi Pembayaran QRIS** — Mock payment gateway
- ✅ **Preview/Simulasi** — Lihat seperti apa pesan yang diterima oleh ahli waris
- ✅ **Mode Darurat** — Kirim semua pesan secara instan (Emergency Override)
- ✅ **Dark Mode + Glassmorphism** — UI premium dengan micro-animation
- ✅ **Responsive** — Desktop sidebar + Mobile bottom nav

### Keamanan (OWASP)
- **CSRF**: Dilindungi otomatis oleh Laravel middleware
- **XSS**: React auto-escapes HTML entities
- **Rate Limiting**: Endpoint `/messages` dibatasi 10 request/menit
- **File Validation**: Tipe dan ukuran file divalidasi di backend

---

## 📂 Struktur Direktori Utama

```
app/
├── Console/Commands/
│   ├── HeartbeatPing.php        # Cron: ping bulanan ke user
│   └── DispatchMessages.php     # Cron: kirim pesan jika trigger terpenuhi
├── Http/Controllers/
│   ├── DashboardController.php  # Brankas utama + statistik
│   ├── MessageController.php    # CRUD pesan + file upload
│   ├── SettingsController.php   # Pengaturan keamanan
│   └── SubscriptionController.php # Langganan + simulasi bayar
├── Models/
│   ├── User.php
│   ├── Message.php
│   ├── MessageRecipient.php     # Penerima pesan (nama, hubungan, WA)
│   ├── CheckIn.php              # Log check-in user
│   └── Subscription.php
└── Services/
    └── WhatsAppService.php      # Integrasi Fonnte API

resources/js/
├── Components/
│   └── Icons.tsx                # SVG icon library
├── Layouts/
│   └── AppLayout.tsx            # Shell utama (sidebar + mobile nav)
└── Pages/
    ├── Auth/
    │   ├── Login.tsx             # Dark mode login
    │   └── Register.tsx          # Dark mode register
    ├── Dashboard.tsx             # Brankas + statistik + wizard
    ├── Settings.tsx              # Pengaturan keamanan
    ├── Subscription.tsx          # Paket & pembayaran
    └── RecipientView.tsx         # Tampilan ahli waris
```

---

## 📊 Database Schema

| Tabel | Kunci Kolom |
|-------|-------------|
| `users` | name, email, wa_number, guardian_contact, ping_schedule, grace_period_enabled, default_trigger_days |
| `messages` | user_id, content_text, content_audio_path, content_video_path, content_file_path, trigger_days, pin_hash, status |
| `message_recipients` | message_id, name, relationship, wa_number, email |
| `check_ins` | user_id, status, checked_in_at |
| `subscriptions` | user_id, plan_id, active_until, is_lifetime |
