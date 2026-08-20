# Forum API

Backend RESTful API untuk aplikasi forum diskusi yang dibangun menggunakan arsitektur **Clean Architecture**, prinsip **Test-Driven Development (TDD)**, dan **Automated Testing** dengan **Node.js**, **Express.js**, dan **PostgreSQL**. Proyek submission untuk kelas **Menjadi Back-End Developer Expert dengan JavaScript** di Dicoding Academy.

---

## 🚀 Fitur & Endpoint API

### 1. Pengguna (Users) & Autentikasi (Authentications)
- `POST /users` — Registrasi akun pengguna baru
- `POST /authentications` — Login pengguna dan mendapatkan *Access Token* & *Refresh Token*
- `PUT /authentications` — Memperbarui *Access Token* menggunakan *Refresh Token*
- `DELETE /authentications` — Menghapus *Refresh Token* (Logout)

### 2. Threads
- `POST /threads` — Membuat thread diskusi baru *(Membutuhkan Autentikasi)*
- `GET /threads/{threadId}` — Melihat detail thread lengkap beserta daftar komentar dan balasannya *(Publik)*

### 3. Komentar (Comments)
- `POST /threads/{threadId}/comments` — Menambahkan komentar pada thread *(Membutuhkan Autentikasi)*
- `DELETE /threads/{threadId}/comments/{commentId}` — Menghapus komentar dengan metode *soft delete* *(Hanya pemilik komentar)*

### 4. Balasan Komentar (Replies) *(Kriteria Opsional)*
- `POST /threads/{threadId}/comments/{commentId}/replies` — Menambahkan balasan pada komentar *(Membutuhkan Autentikasi)*
- `DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}` — Menghapus balasan dengan metode *soft delete* *(Hanya pemilik balasan)*

---

## 🏛️ Arsitektur Proyek (Clean Architecture)

Proyek ini mengadopsi prinsip **Clean Architecture** (Uncle Bob) yang membagi kode menjadi 4 layer terpisah untuk menjaga *Separation of Concerns* (SoC) dan memudahkan pengujian:

```
src/
├── Applications/            # Layer Bisnis / Use Cases & Interface Security
│   ├── security/            # Abstraksi enkripsi password & token manager
│   └── use_case/            # Orchestrator logika bisnis aplikasi
├── Commons/                 # Helper, Exceptions, DomainErrorTranslator, Config
│   ├── config.js
│   └── exceptions/          # ClientError, InvariantError, NotFoundError, AuthorizationError, dll.
├── Domains/                 # Layer Entitas Bisnis & Repository Interface
│   ├── authentications/
│   ├── comments/
│   ├── replies/
│   ├── threads/
│   └── users/
├── Infrastructures/         # Layer Frameworks & Drivers
│   ├── database/postgres/   # Pool koneksi PostgreSQL
│   ├── http/                # Express Server setup & Global Error Handler
│   ├── repository/          # Implementasi konkret Repository PostgreSQL
│   └── security/            # Implementasi konkret Bcrypt & JWT Manager
└── Interfaces/              # Layer Delivery Mechanism (REST API)
    └── http/api/            # Routes & Handlers per endpoint
```

---

## 🛠️ Teknologi & Dependensi

- **Runtime & Framework:** Node.js (ES Module), Express.js
- **Database:** PostgreSQL, `node-pg-migrate`, `pg`
- **Security:** `bcrypt`, `jsonwebtoken`
- **Dependency Injection:** `instances-container`
- **Testing & Quality:** `vitest`, `supertest`, `@vitest/coverage-v8`, `eslint`

---

## 📋 Persyaratan Sistem

- **Node.js:** v18.x atau lebih baru
- **PostgreSQL:** v14.x atau lebih baru
- **npm:** v9.x atau lebih baru

---

## ⚡ Panduan Menjalankan Aplikasi

### 1. Instalasi Dependensi

```bash
npm install
```

### 2. Konfigurasi Environment Variable

Buat dua berkas konfigurasi environment di root project:

1. **`.env`** (untuk environment development & production):
   ```env
   # HTTP SERVER
   HOST=localhost
   PORT=5000

   # POSTGRES
   PGHOST=localhost
   PGUSER=postgres
   PGDATABASE=forumapi
   PGPASSWORD=postgres
   PGPORT=5432

   # TOKENIZE
   ACCESS_TOKEN_KEY=your_access_token_secret_key
   REFRESH_TOKEN_KEY=your_refresh_token_secret_key
   ACCESS_TOKEN_AGE=3000
   ```

2. **`.test.env`** (khusus untuk automated testing):
   ```env
   # HTTP SERVER
   HOST=localhost
   PORT=5000

   # POSTGRES
   PGHOST=localhost
   PGUSER=postgres
   PGDATABASE=forumapi_test
   PGPASSWORD=postgres
   PGPORT=5432

   # TOKENIZE
   ACCESS_TOKEN_KEY=your_access_token_secret_key
   REFRESH_TOKEN_KEY=your_refresh_token_secret_key
   ACCESS_TOKEN_AGE=3000
   ```

> **Catatan:** Pastikan kedua database (`forumapi` dan `forumapi_test`) sudah dibuat di PostgreSQL Anda.

### 3. Menjalankan Database Migration

Jalankan migrasi tabel ke database development dan testing:

```bash
# Migrasi database utama (forumapi)
npm run migrate

# Migrasi database testing (forumapi_test)
npm run migrate:test
```

### 4. Menjalankan Server

```bash
# Menjalankan dalam mode development (live reload dengan nodemon)
npm run start:dev

# Menjalankan dalam mode production
npm start
```

Server akan aktif dan berjalan di `http://localhost:5000`.

---

## 🧪 Pengujian (Testing) & Code Quality

Proyek ini dibangun menggunakan pendekatan **Test-Driven Development (TDD)** dengan cakupan pengujian unit, integration, dan functional testing:

```bash
# Menjalankan seluruh automation test
npm test

# Menjalankan automation test dalam mode watch
npm run test:watch

# Melihat laporan code coverage
npm run test:coverage

# Memeriksa standard kode dengan ESLint
npm run lint
```

---

## 📬 Pengujian dengan Postman

1. Buka aplikasi **Postman**.
2. Import koleksi dan environment dari folder pengujian (misalnya folder `Forum API V1 Test`):
   - `Forum API V1 Test.postman_collection.json`
   - `Forum API V1 Test.postman_environment.json`
3. Pilih environment **Forum API V1 Test**.
4. Jalankan pengujian menggunakan **Collection Runner**. Seluruh skenario pengujian akan lolos (*Pass*).

