# Forum API

Backend RESTful API untuk aplikasi forum diskusi yang dibangun menggunakan arsitektur **Clean Architecture**, prinsip **Test-Driven Development (TDD)**, dan **Automated Testing** dengan Node.js dan PostgreSQL. Proyek submission untuk kelas **Menjadi Back-End Developer Expert dengan JavaScript** di Dicoding Academy.

---

## Fitur

### 1. Autentikasi & Pengguna
- Registrasi Pengguna (`POST /users`)
- Login Pengguna (`POST /authentications`)
- Memperbarui Access Token (`PUT /authentications`)
- Logout Pengguna (`DELETE /authentications`)

### 2. Threads
- Menambahkan Thread baru (`POST /threads`) — *membutuhkan autentikasi*
- Melihat Detail Thread beserta komentar & balasan terformat (`GET /threads/{threadId}`) — *publik*

### 3. Komentar (Comments)
- Menambahkan Komentar pada Thread (`POST /threads/{threadId}/comments`) — *membutuhkan autentikasi*
- Menghapus Komentar dengan Soft Delete (`DELETE /threads/{threadId}/comments/{commentId}`) — *hanya oleh pemilik komentar*

### 4. Balasan Komentar (Replies) (Fitur Opsional)
- Menambahkan Balasan pada Komentar (`POST /threads/{threadId}/comments/{commentId}/replies`) — *membutuhkan autentikasi*
- Menghapus Balasan dengan Soft Delete (`DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}`) — *hanya oleh pemilik balasan*

---

## Arsitektur Proyek (Clean Architecture)

Struktur proyek dibagi menjadi 4 layer utama yang terisolasi dengan Dependency Injection Container:

```
src/
├── Applications/            # Layer Bisnis / Use Cases & Security Interface
│   ├── security/            # Abstraksi enkripsi & token manager
│   └── use_case/            # Implementasi orchestrator alur logika aplikasi
├── Commons/                 # Helper, Exceptions, DomainErrorTranslator, Config
│   └── exceptions/          # ClientError, InvariantError, NotFoundError, dll.
├── Domains/                 # Layer Entitas Bisnis & Repository Interface
│   ├── authentications/
│   ├── comments/
│   ├── replies/
│   ├── threads/
│   └── users/
├── Infrastructures/         # Layer Frameworks & Drivers (PostgreSQL, Express, JWT, Bcrypt)
│   ├── database/postgres/   # Database connection pool
│   ├── http/                # Server setup & Global Error Handler
│   ├── repository/          # Implementasi konkret Repository PostgreSQL
│   └── security/            # Implementasi konkret Bcrypt & JWT Manager
└── Interfaces/              # Layer Interface Adapters / Delivery Mechanism (REST API)
    └── http/api/            # Handlers & Routers per resource
```

---

## Persyaratan Sistem

- Node.js (v18.x atau lebih baru)
- PostgreSQL (v14.x atau lebih baru)

---

## Panduan Memulai

### 1. Kloning & Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment
Salin berkas konfigurasi environment dan sesuaikan kredensial database PostgreSQL Anda:

- Buat file `.env` untuk server aplikasi:
  ```env
  # HTTP SERVER
  HOST=localhost
  PORT=5000

  # POSTGRES
  PGHOST=localhost
  PGUSER=your_postgres_user
  PGDATABASE=forumapi
  PGPASSWORD=your_postgres_password
  PGPORT=5432

  # TOKENIZE
  ACCESS_TOKEN_KEY=your_access_token_secret_key
  REFRESH_TOKEN_KEY=your_refresh_token_secret_key
  ACCESS_TOKEN_AGE=3000
  ```

- Buat file `.test.env` untuk automated testing:
  ```env
  # HTTP SERVER
  HOST=localhost
  PORT=5000

  # POSTGRES
  PGHOST=localhost
  PGUSER=your_postgres_user
  PGDATABASE=forumapi_test
  PGPASSWORD=your_postgres_password
  PGPORT=5432

  # TOKENIZE
  ACCESS_TOKEN_KEY=your_access_token_secret_key
  REFRESH_TOKEN_KEY=your_refresh_token_secret_key
  ACCESS_TOKEN_AGE=3000
  ```

### 3. Menjalankan Database Migration
Jalankan migrasi pada database utama dan database testing:
```bash
# Migrasi database utama (forumapi)
npm run migrate

# Migrasi database pengujian (forumapi_test)
npm run migrate:test
```

### 4. Menjalankan Server
```bash
# Mode development (live-reload dengan nodemon)
npm run start:dev

# Mode production
npm start
```
Server akan aktif di `http://localhost:5000`.

---

## Pengujian (Testing)

Proyek ini dilengkapi dengan **100% Test Coverage** yang mencakup Unit Test, Integration Test, dan Functional Test (HTTP Server):

```bash
# Menjalankan seluruh automation test
npm test

# Menjalankan test coverage report
npm run test:coverage

# Memeriksa kepatuhan code style dengan ESLint (0 errors, 0 warnings)
npm run lint
```

---

## Pengujian dengan Postman

1. Buka aplikasi **Postman**.
2. Import file koleksi dan environment dari folder pengujian:
   - `Forum API V1 Test.postman_collection.json`
   - `Forum API V1 Test.postman_environment.json`
3. Pilih environment **Forum API V1 Test**.
4. Jalankan **Collection Runner** pada koleksi tersebut. Seluruh skenario pengujian akan lolos (*Pass*).
