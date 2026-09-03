# CLAUDE.md — Saku-Ku Project Context

> Source of truth gabungan (merged 1 Sept 2026). Taruh di root project Angular (`angular-challenge/CLAUDE.md`).
> Kalau ada Claude Code instance lain (device beda) yang update project ini, **update file ini juga** sebelum sesi berakhir — jangan biarkan dua device punya versi context yang beda lagi.

## Tentang Project

**Saku-Ku** (dulu KreditPro) — capstone bootcamp Binar Academy (Agustus–September 2026), platform manajemen pinjaman fintech gaya paylater. Simulasi bootcamp, bukan produk finansial berlisensi. Target: siap Demo Day (akhir September 2026).

3 layer: **Backend** (Spring Boot 4.1), **Web dashboard staff** (Angular 21), **Android customer/Nasabah** (Kotlin — belum mulai).

Gaya kerja: casual, Bahasa Indonesia campur English, step-by-step ("pelan-pelan"), review kode aktual (bukan contoh abstrak), koreksi/sanggahan dari user welcome.

---

## Tech Stack & Gotcha Penting

| Layer | Stack |
|---|---|
| Backend | Java, Spring Boot 4.1, JPA/Hibernate, JWT custom (BUKAN Auth0), PostgreSQL (schema **`vili`**, bukan `public`) |
| Frontend | Angular 21, standalone, signal-based (`input()`/`output()`/`signal()`/`httpResource()`) |
| Icons | `@lucide/angular` (bukan `lucide-angular`) — icon diimport sebagai **component class** (`LucideCheckCircle2` dst), dipasang ke `<svg [lucideIcon]="IconClass">`, butuh `LucideDynamicIcon` di `imports` component |
| Testing | Vitest via `@angular/build:unit-test` (builder baru Angular 21, BUKAN Karma/Jasmine) |
| Node | v25 (BUKAN LTS — "odd numbered", ada bug dikenal, lihat di bawah) |
| DB tooling | DBeaver |

- **Auth: custom JWT saja, TIDAK ada Auth0.** Sempat dipertimbangkan (mentor/PDC flag sebagai eksplorasi opsional), diputuskan tetap custom JWT.
- **Spring Boot 4.1 = Jackson 3.x** → import `tools.jackson.*`, BUKAN `com.fasterxml.jackson.*`
- **Angular 21**: `input()`/`output()`/`signal()`/`httpResource()` stable — **pakai ini, bukan `@Input()`/`@Output()` decorator style lama**. Signal Forms masih **experimental** — pakai Reactive Forms untuk form kritikal.
- **Environment**: generate via `ng generate environments`. Import HARUS dari `environment` tanpa suffix `.development` — kalau nggak, API URL localhost kebawa ke production build.
- **DB schema `vili`**: `hibernate.default_schema` cuma otomatis kepakai untuk query JPQL/method-name. Native `@Query(nativeQuery=true)` HARUS di-qualify manual (`FROM vili.tbl_pengajuan`), kalau nggak dapet error "relation does not exist".
- **🐛 Node v25 + Vitest + localStorage**: Node v25 ngaktifin Web Storage API global yang belum lengkap implementasinya, bentrok sama `localStorage` versi jsdom Vitest → `TypeError: localStorage.setItem is not a function`. Fix cepat: `NODE_OPTIONS="--localstorage-file=./tmp-localstorage.db"` sebelum run test. Fix permanen: downgrade ke Node LTS (versi genap, misal 24). (Referensi: [vitest-dev/vitest#8757](https://github.com/vitest-dev/vitest/issues/8757))

---

## ⚠️ Multi-device workflow note

Project ini dikerjain dari 2 device (kadang via Claude chat, kadang Claude Code di PC/VSC). Pernah kejadian PC-side Claude Code jalan pakai versi `CLAUDE.md` yang generic/outdated (masih nyebut Auth0, Jasmine, `@Input()/@Output()`) sehingga generate kode yang nggak match sama field/konvensi yang udah settled (contoh: field API pakai `namaLengkap` bukan `name`). **Selalu pastikan CLAUDE.md di root project ini yang dipakai, dan sinkronkan balik ke sini kalau ada perubahan besar dari sesi manapun.**

---

## Backend

### Auth & RBAC — solid, sudah diverifikasi lengkap
Dual path: staff (`tbl_user`) & customer (`tbl_customer`), JWT generik 1 filter. Role hierarchy SUPERADMIN → MARKETING/BM/BACK_OFFICE. Role-guard per endpoint via URL matcher di `SecurityConfig` (`hasRole(...)`), BUKAN `@PreAuthorize` — sudah lengkap untuk semua action `PengajuanController`. Reset password JWT-stateless (claim `"purpose"`, 15 menit).

**`CustomerEntity.passwordHash` dan `UserEntity` — sudah ditambah `@JsonIgnore`.** ✅ Resolved.

### PengajuanController — matang, endpoint tersedia
`MARKETING_REVIEW → BM_REVIEW → BACKOFFICE_REVIEW → DISBURSED` (+ `MARKETING_REJECTED`/`BM_REJECTED`/`CANCELLED`), `ReviewLog` audit trail otomatis, `Notifikasi` trigger tiap transisi (khusus customer, staff TIDAK pakai sistem ini — lihat bagian Navbar).

Endpoint (`ApiResponse<T>` wrapper: `{ statusCode, message, data? }`, field entity balik pakai `id` polos, BUKAN `idPengajuan`/`idReviewLog`):

| Endpoint | Role | Catatan |
|---|---|---|
| `GET /api/v1/pengajuan/status/{status}` | Staff | Dipakai queue-list per role |
| `PATCH .../marketing-approve` \| `/marketing-reject` | Marketing | |
| `PATCH .../bm-approve` \| `/bm-reject` | BM | approve wajib `nominalDisetujui` ≤ nominal pengajuan |
| `PATCH .../disburse` | Back Office | **Tidak ada endpoint reject untuk Back Office** |
| `GET .../{id}/history` | Staff | Review log per pengajuan |

**Rencana terbuka**: custom exception (ganti `BusinessRuleException` generic) — arah belum didiskusikan.

### DashboardController — baru, sudah jalan ✅
`GET /api/v1/dashboard/superadmin/summary` (stat cards + loan trend 7 hari + status breakdown) dan `GET /api/v1/dashboard/superadmin/aktivitas` (10 review log terbaru, dengan nested `pengajuan.customer`). Backend `DashboardService` pakai native query untuk trend harian (butuh qualify schema `vili` manual, lihat gotcha di atas).

**Bug yang sempat ditemukan & sudah difix:**
- `PengajuanRepository.countByStatus` sempat salah nama (`countByCustomer`) — parameter mismatch, app gagal start
- `LoanTrendPoint` mapping sempat pakai cast `java.sql.Date` — driver Postgres versi baru return `java.time.LocalDate` langsung, harus cast ke situ
- `ReviewLogEntity.createdAt` pernah NULL di data dummy lama (bukan bug kode — kolom DB emang punya `DEFAULT CURRENT_TIMESTAMP` tapi row lama ke-insert sebelum itu aktif). Sudah di-backfill manual.

### Skema DB (PostgreSQL, schema `vili`)
Ada: `tbl_customer`, `tbl_role`, `tbl_user`, `tbl_menu`, `tbl_role_menu`, `tbl_bunga_tenor`, `tbl_pengajuan`, `tbl_review_log`, `tbl_notifikasi`.

**Gap — Daftar Plafond**: `tbl_plafond` & `tbl_user_plafond` belum ada. Sudah didesain (lihat riwayat chat kalau perlu SQL persis), belum dieksekusi. `limit_efektif` nanti jadi basis "plafond naik kalau riwayat bayar lancar".

**Master Data Menu**: `tbl_menu`+`tbl_role_menu` (dengan `can_view/create/update/delete`) sudah ada skemanya di DB. Backend service/controller + UI Angular **belum digarap** — next task besar.

**Migration siap jalan, belum dieksekusi** (`sakuku-migration-customer-pengajuan-fields.sql`):
- `tbl_customer`: `tanggal_lahir`, `tipe_pekerjaan` (enum KARYAWAN/WIRASWASTA/LAINNYA, untuk logic scoring), `pekerjaan` (teks bebas, display), `lama_bekerja_bulan` (generik kerja/usaha), `pendapatan_bulanan`, `utang_berjalan`
- `tbl_pengajuan`: `tujuan_pinjaman` (enum)
- Dokumen KTP/OCR: **defer, di luar MVP**

### Dummy data
`sakuku-dummy-review-data.sql`: 4 staff + 18 customer, 6 pengajuan/bucket, password semua `Password123!`. **Perlu di-update** setelah migration field baru dijalankan.

---

## Frontend (Angular 21)

### Struktur folder aktual (as of 1 Sept 2026)

```
src/app/
├── core/
│   ├── guards/auth.guards.ts            # roleGuard(['role1', 'role2'])
│   ├── interceptors/auth.interceptor/   # Bearer token dari localStorage key 'auth_token' (final)
│   ├── models/auth.dto/                 # ⚠️ legacy, verify before use
│   └── services/
│       ├── api.service.ts               # generic get/post/put/patch/delete wrapper
│       ├── auth.service.ts
│       ├── master-admin.ts
│       ├── users.service.ts
│       └── loan-queue.ts                # ⚠️ empty stub, unused
│
├── features/                            # ⚠️ legacy Strategy-pattern draft, UNUSED
│   ├── backoffice/bo-queue/             # superseded by pages/{role}/review-pinjaman/ + shared/base
│   ├── branch-manager/bm-queue/
│   └── marketing/marketing-queue/
│
├── layout/
│   ├── sidebar/, navbar/, dashboard-layout/
│   ├── customer-footer/, customer-home/, customer-layout/, customer-navbar/
│   └── simulation-calculator/
│
├── pages/
│   ├── auth/login/, landingpage/
│   ├── superadmin/
│   │   ├── overview/       ✅ full dashboard (stat cards, charts, activity)
│   │   ├── pengajuan/      stub
│   │   ├── approval/       stub
│   │   └── roles/          stub
│   ├── marketing/
│   │   ├── review-pinjaman/  ✅ wired
│   │   ├── dashboard/        stub, blocked on backend endpoint
│   │   └── plafond/
│   ├── branchmanager/
│   │   ├── review-pinjaman/  ✅ wired
│   │   └── dashboard/        stub, blocked on backend endpoint
│   └── backoffice/
│       ├── review-pinjaman/  ✅ wired
│       └── dashboard/        stub, blocked on backend endpoint
│
├── shared/
│   ├── base/
│   │   └── review-queue.base.ts     # shared fetch/select/submit logic for the 3 review-pinjaman containers
│   ├── components/
│   │   ├── loan-queue-list/         # .ts/.html/.css terpisah (preferensi user)
│   │   └── loan-review-drawer/
│   ├── config/
│   │   ├── activity-icon.config.ts
│   │   ├── queue-role.config.ts     # role → status filter + approve/reject endpoint paths
│   │   ├── review-action.config.ts  # ROLE_REVIEW_CONFIG (drawer title/labels/actions per role)
│   │   └── status-badge.config.ts   # STATUS_BADGE_STYLES
│   └── models/
│       ├── api-response.ts
│       ├── dashboard-summary.ts
│       ├── loan-application.ts      # LoanApplication, UserRole, LoanStatus, ReviewActionPayload
│       └── pengajuan.model.ts       # ⚠️ appears unused, check before adding a 2nd loan model
│
├── models/dashboard-summary.ts      # ⚠️ DUPLICATE of shared/models/dashboard-summary.ts — verify before editing either
├── util/apicall.ts                  # ⚠️ check for overlap with core/services/api.service.ts
├── app.ts, app.routes.ts, app.config.ts, app.html, app.css
```

**⚠️ File duplikat/legacy yang ditandai — belum dihapus, verify dulu sama user sebelum delete (destructive change butuh konfirmasi):**
- `shared/config/review-log.config.ts` (versi lama `ROLE_REVIEW_CONFIG` sudah digantikan `review-action.config.ts`) — kalau sudah dihapus, hapus baris ini
- `models/dashboard-summary.ts` vs `shared/models/dashboard-summary.ts`
- `util/apicall.ts` vs `core/services/api.service.ts`
- `core/services/loan-queue.ts`, `core/service.ts` — empty stubs
- `features/*` — seluruh folder, superseded total

**Pola berulang yang perlu diinget**: kalau nemu error TS aneh soal property tidak ada di interface padahal kodenya kelihatan benar, **cek dulu ada file duplikat dengan isi beda** sebelum debug lebih jauh — ini sudah kejadian berkali-kali.

### Konvensi komponen (WAJIB diikuti — bukan draft)
- **Standalone components only**, no NgModules
- **Signal-based**: `input()` / `output()` / `signal()` — **BUKAN** decorator `@Input()`/`@Output()` lama
- `httpResource()` untuk data fetching di container components
- Reactive Forms untuk form kritikal (Signal Forms masih experimental)
- Lazy-loaded routes via `loadComponent()`
- File `.ts`/`.html`/`.css` terpisah (bukan inline template/style)

### Auth flow (real, custom JWT)
```
1. User visits /login → LoginComponent
2. AuthService.login() → backend return JWT + role
3. Token disimpan localStorage key 'auth_token'
4. HttpInterceptor attach Bearer token (BUKAN withCredentials/cookie — sudah dimigrasi)
5. Role dipakai roleGuard(['ROLE1','ROLE2']) di app.routes.ts
6. Logout: clear localStorage
```
**Tidak ada Auth0 di project ini.** Kalau ada referensi Auth0 di kode/config manapun (mis. `environment.development.ts`), itu sisa draft lama — flag ke user, jangan asumsikan aktif.

### Shared components — LoanQueueListComponent & LoanReviewDrawerComponent ✅
Card-based (bukan table). Pattern: **config object per role** (`ROLE_REVIEW_CONFIG` di `review-action.config.ts`), bukan Strategy class. `RoleActionConfig.actions` array `{ type: 'APPROVE'|'REJECT', label, style }[]` — Back Office cuma 1 action (`Cairkan Dana`), reject di-comment karena backend belum ada endpoint-nya.

`UserRole` FE = `'MARKETING' | 'BM' | 'BACK_OFFICE'`, match persis `tbl_role.nama_role`. `LoanStatus` include `MARKETING_REJECTED`/`BM_REJECTED` terpisah (bukan `REJECTED` generik).

Styling: Tailwind utility inline (emerald-500/300/700/900 persis sama hex design token). Tema: **dark**, final.

**Field API penting** (dari response `GET /api/v1/pengajuan/status/{status}`): nama customer ada di `customer.namaLengkap` — **BUKAN** `customer.name`. Tidak ada field `name` polos di response manapun untuk entity ini.

### Superadmin Overview Dashboard — ✅ SELESAI
Stat cards, Loan Trends (line chart), Status Breakdown (donut), Aktivitas Terbaru (card besar berjarak, icon per action via `ACTIVITY_ICON_CONFIG`). Chart pakai `chart.js` + `ng2-charts` (provider `provideCharts(withDefaultRegisterables())` di `app.config.ts`).

Model penting (field API pakai `id` polos, bukan prefixed):
```typescript
// shared/models/dashboard-summary.ts
export interface ReviewActivity {
  id: string;
  action: string; catatan: string | null; createdAt: string | null;
  pengajuan: { id: string; nominalPengajuan: number; nominalDisetujui: number | null; customer: { namaLengkap: string } };
  user: { namaLengkap: string };
}
```

### Belum digarap
- Dashboard Marketing/BM/Back Office (versi lebih simple dari Superadmin) — stub, blocked on backend endpoint
- Master Data Menu/Access/Users UI (Master Role sudah ada, sisanya belum)
- Riwayat Review per staff (baru, lihat keputusan Sidebar di bawah)

### 🆕 [1 Sept 2026] Adapter pattern — API asli vs model UI
`shared/models/loan-application.ts` (`LoanApplication`, `ApplicantDetail`, `LoanDetail`) didesain untuk field **pasca-migration** (`sakuku-migration-customer-pengajuan-fields.sql` — belum dieksekusi, lihat bagian Migration di atas). Backend SEKARANG masih balikin skema lama (`customer.namaLengkap`, `nominalPengajuan`, dst — bukan `applicant.name`/`loan.requestedAmount`).

Ini sempat bikin bug nyata: `httpResource` di `review-queue.base.ts` di-*type* seolah backend balikin `LoanApplication[]` langsung, padahal cuma klaim TypeScript tanpa transform runtime → `Cannot read properties of undefined (reading 'name')` di `loan-queue-list.html` (item.applicant undefined).

**Fix**: file baru `shared/models/pengajuan-api.model.ts` — `ApiPengajuan` (bentuk asli response backend) + `mapApiPengajuanToLoanApplication()` (adapter). Dipasang di `review-queue.base.ts`, di titik `items` computed:
```typescript
protected readonly queueResource = httpResource<ApiResponse<ApiPengajuan[]>>(...);
protected readonly items = computed(
  () => (this.queueResource.value()?.data ?? []).map(mapApiPengajuanToLoanApplication)
);
```
Field yang belum ada di backend (dob, age, employmentType, occupation, employmentLengthMonths, monthlyIncome, existingDebts, loan.category, loan.estInstallment) diisi placeholder kosong/0 di mapper, ditandai TODO. **Begitu migration dieksekusi**: update `ApiPengajuan` interface + isi mapper dengan field asli, komponen UI (queue-list, drawer) TIDAK perlu diubah lagi.

**Pelajaran**: kalau Claude Code (device manapun) desain interface "mengantisipasi masa depan" tanpa ngecek response API asli dulu, gampang lolos compile tapi meledak di runtime. Selalu cross-check `LoanApplication`-family model terhadap response JSON asli sebelum dipakai di `httpResource`.

---

## Keputusan Sidebar & Navbar (1 September 2026)

**Sidebar — restrukturisasi grup menu:**
- **RBAC dihapus sebagai item terpisah**, digabung ke grup **"Master Data"**: Master Role, Master Menu, Master Access, **Master Users** (termasuk register staff — SUPERADMIN input, sesuai keputusan lama, endpoint `POST /api/v1/user` sudah ada)
- Superadmin **tidak perlu suffix nama** — halaman-halamannya udah unik (`Semua Pengajuan`, `Review Antrian`) beda dari nama role lain, nggak ada tabrakan
- **Per role staff (Marketing/BM/Back Office): 2 komponen, bukan 3.** `LoanQueueListComponent` yang udah ada SUDAH merangkap "Review Pinjaman" + "list bucket" (nampilin queue + klik row buka drawer). Final:
  1. **Review Pinjaman** (queue-list + drawer, reuse existing)
  2. **Riwayat Review Saya** (BARU — histori review yang staff itu udah lakuin, dari `tbl_review_log` filtered by user login. Backend endpoint belum ada, perlu dibikin: `GET /api/v1/review-log/me` atau serupa)

**Navbar:**
- Breadcrumbs — generate dari route path
- Profile widget: **nama + jabatan saja, TANPA foto** (foto profile di-defer, sama alasannya kayak KTP — butuh keputusan file storage yang belum diprioritaskan)
- Settings: ganti nama & password saja (endpoint `updateOwnProfile` sudah ada untuk nama/email; **endpoint ganti password saat login — beda dari forgot-password — belum ada**, perlu verifikasi password lama dulu)
- **Notifikasi: TIDAK bikin sistem terpisah.** `tbl_notifikasi` didesain khusus customer (`saved.getCustomer()`), staff nggak punya infra ini. Keputusan: reuse pattern "Aktivitas Terbaru" dari `tbl_review_log`, difilter by user login yang sedang aktif — sama sumbernya dengan "Riwayat Review Saya" di atas, jadi 1 endpoint baru bisa dipakai untuk 2 kebutuhan (riwayat + notifikasi feed).

### 🆕 [1 Sept 2026] Implementasi Sidebar/Navbar — status & unifikasi role naming

**Root cause ditemukan**: sebelum refactor ini, `sidebar.ts` dan `navbar.ts` masing-masing punya `menuConfig`/breadcrumb-logic sendiri-sendiri (gak sinkron), dan ada **3 bentuk role berbeda** tersebar di codebase:
- Backend/JWT claim: `SUPERADMIN` | `MARKETING` | `BM` | `BACK_OFFICE` (persis `tbl_role.nama_role`)
- `shared/models/loan-application.ts` → `UserRole`: subset yang sama tapi didefinisikan ulang terpisah
- `sidebar.ts` (versi lama) → `UserRole` juga tapi isi beda total: `'superadmin'|'marketing'|'branchmanager'|'backoffice'` (lowercase, dipakai buat routing/folder `pages/{role}/`)

**Fix — 2 file config baru jadi source of truth:**
- `shared/config/role.config.ts` — `BusinessRole` (persis backend), `SidebarRole` (lowercase, buat routing), `BUSINESS_TO_SIDEBAR_ROLE` mapping, `ROLE_DISPLAY_NAME` (label rapi buat UI), `toSidebarRole()` helper
- `shared/config/sidebar-menu.config.ts` — `MENU_CONFIG` (dipakai sidebar UNTUK filter items DAN navbar UNTUK breadcrumb, jadi otomatis sinkron), import `SidebarRole` dari `role.config.ts`

**Sidebar** (`sidebar.ts`): grup direname `SYSTEM MANAGEMENT → RBAC (Roles)` jadi `MASTER DATA → Master Role`. Ditambah entry Dashboard untuk BM & Backoffice yang sebelumnya kelupaan (cuma Marketing yang punya). `Master Menu`/`Master Access`/`Master Users` masih di-comment di config — nunggu backend/route-nya ada, biar gak jadi link mati.

**Navbar** (`navbar.ts`): `userProfile` sekarang connect ke `AuthService.currentUser()` (bukan hardcode 'Jane Doe' lagi) — lihat bagian Auth `/me` di bawah. `breadcrumb` ambil section dari role user login asli (via AuthService), page dari match path terpanjang di `MENU_CONFIG`. Avatar image dihapus dari `navbar.html` (keputusan: no foto), tinggal icon statis.

**Belum:** Settings (ganti nama/password) belum ada action — nunggu endpoint ganti password. "Riwayat Review Saya" belum ditambah ke sidebar — nunggu `GET /api/v1/review-log/me`. `hasNotification` masih hardcode `true` — nunggu endpoint yang sama.

### 🆕 [1 Sept 2026, akhir sesi] Status testing manual — hasil & gotcha

**✅ WORKING**: Adapter pattern (`pengajuan-api.model.ts`) sudah dipasang & diverifikasi — list Review Pinjaman Marketing/BM/Backoffice semua render data asli (nama, nominal, tenor, status badge) tanpa crash. Endpoint `/me` sudah jalan end-to-end, login flow sudah redirect sesuai role.

**🐛 Gotcha yang ketemu & fix-nya** (penting buat next session, field name mismatch gampang kejadian lagi):
- Backend `UserProfileDTO` balikin field **`roleName`**, BUKAN `role` seperti yang diasumsikan pas desain DTO pertama kali. Semua tempat FE yang baca profile (`auth.service.ts` `UserProfileResponse` interface, `login.ts` routing logic, `navbar.ts` `userProfile`+`breadcrumb` computed) harus pakai `.roleName`, sudah difix.
- **Pelajaran umum**: kalau bikin DTO/interface baru di backend, SELALU cross-check response JSON asli (Network tab) sebelum nulis interface FE yang consume-nya — jangan asumsi nama field dari inget-ingetan/nebak konvensi.
- Sempat ada 1 insiden compile error di `review-queue.base.ts` gara-gara instruksi "ganti baris X" bikin import `UserRole`/`ReviewActionPayload` ikut kehapus gak sengaja. **Preferensi baru**: kalau minta bantuan edit file existing, kasih/minta isi FILE LENGKAP dulu, jangan cuma potongan baris — biar gak ada yang keslip.

**⏳ BELUM BERES (lanjut besok):**
1. **Breadcrumb masih nampilin `... > Review Pinjaman`** — section role-nya (`Marketing`/`Branch Manager`/dst) gak muncul, padahal `navbar.ts` udah diupdate baca `.roleName`. Dugaan: hot-reload `ng serve` gak nangkep perubahan bersih (banyak edit beruntun hari ini), atau cache browser. Coba dulu: cek isi `navbar.ts` `breadcrumb` computed beneran baca `.roleName`, hard refresh (`Ctrl+Shift+R`), kalau masih gagal restart `ng serve` dari awal.
2. Dashboard Marketing/BM/Backoffice — lihat rencana redesign besar di bawah, gak lagi halaman stub terpisah.
3. Navbar Settings (ganti nama/password) — belum ada action sama sekali.

### 🆕 [1 Sept 2026, akhir sesi] Rencana redesign visual — Review Pinjaman & staff pages

**Masalah yang diangkat**: card `loan-queue-list` sekarang full emerald-tinted (background + avatar + badge semua hijau), jadi status badge yang harusnya beda warna per status (sesuai design token: amber/cyan/mint/emerald/red) keliatan "tenggelam" — gak ada kontras. Terinspirasi dari referensi UI (invoice table dengan status badge warna-warni di atas card netral, dan list pasien dengan row layout horizontal rapi).

**Keputusan desain (mockup sudah divalidasi user via Visualizer):**
1. **Card background netral gelap** (`slate-800`/`rgba(30,41,59,0.55)` + backdrop-blur), BUKAN emerald-tinted lagi. Avatar circle juga netral (abu-abu), bukan emerald.
2. **Status badge pakai warna asli sesuai token** (BM_REVIEW=cyan, DISBURSED=emerald solid, MARKETING_REJECTED/BM_REJECTED=red, dst) — sekarang kepakai maksimal karena background udah netral, bukan ketelen hijau.
3. **Layout row jadi 1 baris horizontal**: avatar → nama+ID → nominal+tenor → status badge di ujung kanan. (Sebelumnya: avatar+nama sebaris, badge status di baris terpisah bawah.)
4. Emerald tetap dipakai tapi perannya lebih spesifik: warna brand/CTA utama + warna status "Disbursed" — bukan disebar ke semua elemen.
5. **Background texture buat staff pages** (`dashboard-layout`, bukan per-komponen): 2 blob radial samar (emerald ~14% opacity + cyan ~8% opacity) di pojok, statis (no animasi) + dot-grid pattern halus nyebar. Tujuannya biar glassmorphism blur kerasa (background solid = blur invisible). Tetap "flat & scannable" — bukan sedekoratif landing page, cuma cukup buat kasih blur sesuatu buat di-blend.

**Keputusan struktural terkait (bukan cuma visual):**
- **Dashboard staff DIGABUNG ke Review Pinjaman**, bukan halaman terpisah lagi. Alasan: Review Pinjaman dibuka berkali-kali sehari oleh staff, dashboard terpisah cuma nambah 1 klik gak perlu. Bentuknya: strip statistik ringkas (3-4 angka, TANPA chart — beda skala dari Superadmin Overview) nempel di atas list. **Konsekuensi**: entry sidebar "Dashboard" utk Marketing/BM/Backoffice di `sidebar-menu.config.ts` MENU_CONFIG rencananya dihapus, Review Pinjaman jadi halaman home/utama per role staff.
- **"Riwayat Review Saya" tetap tab/route terpisah** (bukan digabung ke list yang sama dengan sorting) — alasan: Review Pinjaman = action-oriented (kerjaan pending), History = record-oriented (udah selesai), campur berresiko staff kelewat pengajuan baru ketimbun riwayat lama. Teknis: reuse `LoanQueueListComponent` yang sama, mode read-only (klik row buka detail view-only, gak ada drawer approve/reject).

**Urutan eksekusi besok:**
1. Background texture di `dashboard-layout` (sekali pasang, otomatis kepakai semua halaman staff)
2. Redesign `loan-queue-list.html`/`.css` + `loan-review-drawer` biar konsisten (netral+badge warna-warni+layout horizontal)
3. Tambah stat strip ke Review Pinjaman container per role + hapus entry sidebar "Dashboard" yang terpisah
4. Halaman History baru, reuse `LoanQueueListComponent` mode read-only, nunggu `GET /api/v1/review-log/me` juga selesai dibikin (lihat item next steps #3 lama)

### 🆕 [1 Sept 2026] Endpoint `/me` — profil user login
JWT cuma bawa `subject` (username) + claim `role` (key mentah kayak `MARKETING`) — **TIDAK bawa `namaLengkap`**. `AppUserEntity` (implements `UserDetails`, dipakai khusus proses login/Security) juga sengaja minimal, gak nyimpen nama lengkap. Makanya perlu endpoint baru buat navbar bisa nampilin nama asli:

`GET /api/v1/user/me` (di `UserController`, sudah ada) — ambil username dari `SecurityContextHolder`, query `UserRepository.findByUsername()` (tabel asli `tbl_user`), balikin `UserProfileDTO { namaLengkap, role }`. Return type polos `ApiResponse<UserProfileDTO>` (BUKAN `ResponseEntity<ApiResponse<...>>`) — konsisten sama endpoint lain di controller yang sama, pakai `ApiResponse.success(dto, message)` static factory (constructor manual `new ApiResponse<>(...)` sempat error "cannot infer type arguments").

Frontend: `AuthService.fetchCurrentUser()` — dipanggil abis `login()` sukses & di root `app.ts ngOnInit` kalau `isLoggedIn()` true (biar tetep keisi pas refresh). Simpan ke `AuthService.currentUser` signal, sekalian nulis `localStorage['userRole']` versi sidebar-friendly via `toSidebarRole()`.

**Catatan scope**: endpoint ini query `tbl_user`, jadi kalau suatu saat ada customer yang somehow manggil ini juga, bakal error not-found (customer ada di `tbl_customer`). Aman untuk sekarang karena cuma dipanggil dari navbar staff, dan route staff udah dijamin role-guard staff-only.

### 🆕 [2 Sept 2026] Redesign & responsive — implementasi lengkap ✅

Seluruh rencana redesign dari sesi 1 Sept udah dieksekusi dan diverifikasi jalan. Ringkasan per bagian:

**1. Background texture (`dashboard-layout.css`)** — `bg-decor`: 5 layer radial-gradient (blob emerald+cyan merata di 4 pojok + tengah, opacity 5-10%) + dot-grid pattern (opacity 0.06, spacing 22px), `position: fixed`, `pointer-events: none`. Dipasang sekali di `dashboard-layout`, otomatis kepakai semua halaman staff.

**2. 🐛 Z-index stacking context — pelajaran penting buat ke depan**: nambahin `z-index` eksplisit ke elemen (`content-shell { position: relative; z-index: 1; }`) bikin dia jadi **stacking context sendiri** — semua descendant di dalemnya (termasuk drawer modal `z-40`) jadi "kekurung", cuma dibandingin nilai `z-index` ancestor-nya (`1`) pas ketemu sibling di luar (`mobile-header` = `z-30`). Akibatnya drawer keliatan ketutup padahal nominal z-index-nya lebih tinggi. **Fix**: `content-shell` di-set ke `z-index: 35` (di antara `mobile-header`=30 dan `mobile-backdrop`=40) — bukan `1`. **Aturan umum**: kalau ada elemen fixed/modal yang harusnya nutup elemen lain tapi keliatan ketutup duluan, curigai dulu apakah ada ancestor yang bikin stacking context baru sebelum debug tempat lain.

**3. `dashboard-layout.ts`** — hamburger icon (`lucideMenu`) sempat gak muncul (kotak kosong) karena `LucideMenu` di-comment di import, gak ada di `imports` array meski dipakai di template. Fixed.

**4. Card `loan-queue-list` — 2 iterasi sampai stabil:**
   - Iterasi 1: 1 baris horizontal kaku (avatar+nama+ID+nominal+badge sejajar) — pecah di layar sempit (iPhone XR), kolom nama diperas sampai nyaris 0px, ID (UUID penuh) wrap ke banyak baris karena lupa `truncate`.
   - Iterasi 2: `flex-wrap` — masih gak konsisten, tinggi card beda-beda tergantung panjang nominal (nominal digit banyak = wrap ke baris 2, nominal kecil = 1 baris).
   - **Final (stabil)**: `flex-col sm:flex-row` — deterministik, SELALU 2 baris di mobile (baris 1: avatar+nama+ID, baris 2: nominal+badge dengan `justify-between`) apapun panjang kontennya, SELALU 1 baris di `sm:` ke atas. ID dipendekin jadi 8 karakter terakhir aja (`...{{ appId.slice(-8) }}`), bukan UUID penuh.
   - **Pelajaran**: buat card/row berulang, desain mobile-first `flex-col`/`flex-row` dengan breakpoint eksplisit itu lebih predictable daripada ngandelin `flex-wrap` organik — konsistensi tinggi antar-item lebih penting daripada "hemat baris kalau muat".

**5. `review-pinjaman.html`** — drawer review jadi **fullscreen overlay** di mobile (`fixed inset-0`, backdrop gelap blur) biar gak berebut ruang sejajar sama list dalam 1 flex row (`sm:static` balik normal di layar besar). Loading skeleton disamain warnanya ke netral (`slate`, sebelumnya masih emerald sisa desain lama).

**6. `navbar.css`** — mode compact di mobile: `breadcrumb-section` (nama role) + separator + `profile-info` (nama+jabatan) + `divider-v` semua `hidden sm:flex`/`sm:block`. Alasan: konten navbar (breadcrumb+2 tombol+divider+avatar+nama+jabatan) kalkulasi ~400px+, melebihi lebar HP standar (~360-390px) → overflow risk. Di mobile cuma tampil: nama halaman (truncate) + tombol aksi + avatar bulat (tanpa nama/jabatan). `mobile-header` (hamburger+brand) dan `app-navbar` (compact) sengaja tetap 2 bar terpisah di mobile — bukan didobel/dihide salah satu — karena settings/notif/profile gak ada penggantinya di `mobile-header`.

**7. `loan-review-drawer.html`** — field yang masih placeholder dari mapper (DOB, employment, income, debts, est. installment, category — nunggu migration) sekarang nampilin teks netral ("Belum tersedia" / section note) alih-alih `"0 bulan"`/`"Rp 0"` yang kelihatan kayak data rusak pas demo. Logic: `occupation` kosong dipakai sebagai flag buat nyembunyiin seluruh section Employment & Financial (karena field-field itu selalu kosong bareng dari mapper), DOB & Est. Installment dicek individual di blok masing-masing.

**8. Dashboard staff digabung ke Review Pinjaman — dieksekusi:**
   - `sidebar-menu.config.ts`: entry "Dashboard" Marketing/BM/Backoffice dihapus dari `MENU_CONFIG` (Superadmin "Overview" tetap ada)
   - `app.routes.ts`: default redirect Marketing diganti dari `'dashboard'` ke `'review-pinjaman'` (match BM/Backoffice yang emang udah gitu dari awal), child route `'dashboard'` dihapus total
   - `shared/base/review-queue.base.ts`: 3 `computed()` baru — `totalCount`, `totalAmount`, `avgAmount`, dihitung dari `items()` yang udah ke-fetch, **gak perlu endpoint baru**
   - 🆕 Komponen `shared/components/queue-stats-strip/` (`.ts`/`.html`/`.css`) — 3 kartu mini (Menunggu Review, Total Nominal Diajukan, Rata-rata Nominal), `grid-cols-1 sm:grid-cols-3` (mobile-first stack dari awal, gak ngulang kesalahan card kemarin)
   - `review-pinjaman.html` (3 role) di-restructure jadi `flex flex-col`: stat strip di atas, list di bawah pakai `flex-1 min-h-0`
   - `review-pinjaman.ts` (3 role) tambah import `QueueStatsStripComponent` di `imports` array

**Status keseluruhan**: semua item di atas ✅ diverifikasi jalan di browser (termasuk mobile view iPhone XR).

---

## 🆕 [2 Sept 2026] Halaman Master Staff (superadmin) — ✅ SELESAI & verified end-to-end

`pages/superadmin/staff/` — table read-only daftar seluruh staff (`tbl_user`), sidebar entry "Master Staff" di grup MASTER DATA, route `/admin/staff` di-guard `superadmin`. Pattern: `httpResource` langsung di component (sama kayak `overview.ts`), bukan lewat service terpisah. Endpoint: `GET /api/v1/user` (base path singular, konsisten sama `/user/login`, `/user/me`, `POST /api/v1/user`) — **confirmed ada & jalan**, verified pakai response JSON asli dari user (2 Sept).

**Gotcha yang ketemu (2 iterasi sampai match response asli):**
1. Path awal ditebak `GET /api/v1/users` (plural, dari draft ARCHITECTURE.md lama) → `404 NoResourceFoundException`. Dikoreksi ke singular `/api/v1/user`.
2. Field `role` awalnya ditebak flat string `roleName` (ngikutin konvensi `UserProfileDTO` di endpoint `/me`) — **ternyata beda**, `role` di response list ini adalah **nested object hasil serialize entity Hibernate langsung** (`{ id, namaRole, description, createdDate, deletedDate, updatedDate, hibernateLazyInitializer }`), bukan DTO flat. Field role yang dipakai FE: `role.namaRole`. **Pelajaran sama yang udah ditulis berkali-kali di MD ini**: jangan asumsikan penamaan field konsisten antar-endpoint meski sama-sama soal user/role — selalu cross-check response asli per endpoint.
3. Response juga bawa `deletedDate` (soft-delete marker, nullable) yang nggak diantisipasi awal — ada row dummy (`Test Marketing Baru`, `deletedDate` terisi + `status: BLOCKED`) yang berarti akun sudah "dihapus". FE filter row dengan `deletedDate` terisi biar nggak nongol di Master Staff.

Model FE final (`shared/models/staff.model.ts`), sudah match response asli:
```typescript
export interface StaffRoleInfo {
  id: string;
  namaRole: 'SUPERADMIN' | 'MARKETING' | 'BM' | 'BACK_OFFICE';
  description: string;
}
export interface Staff {
  id: string;
  namaLengkap: string;
  username: string;
  email: string;
  role: StaffRoleInfo;          // nested, BUKAN flat roleName
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
  deletedDate: string | null;   // non-null = soft-deleted, di-filter dari list FE
}
```
`staff.ts` `staffList` computed: `.filter(staff => !staff.deletedDate)`. Response full punya field lain (`hibernateLazyInitializer` di dalam `role`, `createdDate`/`updatedDate` versi lama di `role` juga) yang sengaja diabaikan FE — bukan bug, memang nggak dipakai.

**Belum diputuskan**: apakah row soft-deleted sebaiknya tetap ditampilkan dengan badge "Dihapus" alih-alih disembunyikan total — saat ini di-hide, revisit kalau user minta.

### 🆕 [2 Sept 2026, lanjutan] Full CRUD + koreksi desain Pengajuan superadmin

**Master Staff sekarang full CRUD**, bukan cuma list. Backend (`saku-ku` — repo terpisah, path `C:\Users\User\code\saku-ku`) ternyata sudah nyediain semuanya:
- `POST /api/v1/user` (`RegisterRequest`: namaLengkap, username, password, email, roleName) — `hasRole("SUPERADMIN")`
- `PATCH /api/v1/user/{id}` (`UpdateUserRequest`: namaLengkap, email, status, roleName — semua optional, partial update) — `hasRole("SUPERADMIN")`
- `DELETE /api/v1/user/{id}` — **soft delete** (`UserService.deleteUserById` cuma set `deletedDate`, bukan hard delete)

Frontend baru: `shared/components/staff-form-modal/` (modal reusable create+edit, Reactive Forms, signal `input()`/`output()` — ngikutin pola `Sharing Component Communications` di requirement doc asli). `staff.ts` tambah `HttpClient` inject langsung (pola sama kayak `review-queue.base.ts`, bukan lewat `ApiService`) buat POST/PATCH/DELETE + `staffResource.reload()` abis sukses. Username **gak bisa diedit** (gak ada di `UpdateUserRequest`), field itu disabled di form edit. Password **gak ditampilin di form edit** (ganti password staff itu jalur terpisah — `forgot-password`/`reset-password`, bukan lewat superadmin edit).

**Rencana ke depan (dikonfirmasi user)**: `PATCH /api/v1/user/me` (`updateOwnProfile`, sudah ada, cuma namaLengkap+email) kemungkinan besar bakal disambung ke halaman Settings staff (self-service edit profil) — terpisah dari CRUD superadmin ini, gak akan bentrok.

**🚨 Security gap ditemukan di backend** (`saku-ku/.../config/SecurityConfig.java`) — `GET /api/v1/user/{id}` dan `DELETE /api/v1/user/{id}` **gak punya rule role sama sekali**, jatuh ke `.anyRequest().authenticated()` → staff manapun yang login (bukan cuma superadmin) bisa lihat profil lengkap staff lain / hapus akun staff lain. User udah tau, mau ditangani terpisah (bukan scope Angular ini). Fix yang direkomendasikan:
```java
.requestMatchers(HttpMethod.GET, "/api/v1/user/{id}").hasRole("SUPERADMIN")
.requestMatchers(HttpMethod.DELETE, "/api/v1/user/{id}").hasRole("SUPERADMIN")
```
Catatan penting biar gak salah paham lagi: `RoleHierarchy` (`SUPERADMIN implies MARKETING/BM/BACK_OFFICE`) **gak otomatis nutup gap ini** — hierarchy cuma nambah izin ke atas (superadmin dapet akses staff), bukan ngurangin akses staff ke endpoint yang gak ada rule-nya. Dua mekanisme beda, tetep butuh baris eksplisit di atas.

**Koreksi desain — superadmin & approval pengajuan**: requirement doc asli (`saku-ku requirement.txt`) jelas: approve/reject/disburse itu wewenang Marketing→BM→BackOffice doang, superadmin cuma monitoring. Dikonfirmasi di `PengajuanController`: satu-satunya action khusus superadmin itu `PATCH /{id}/cancel-admin` (force-cancel override), sisanya read-only (`GET /pengajuan`, `/status/{status}`, `/{id}`, `/{id}/history`). **"Review Antrian" di sidebar udah di-comment** (`sidebar-menu.config.ts`) — dulu link testing ke route yang gak pernah didaftarin (`/admin/review-antrian`, 404 kalau diklik). Rencana ke depan: "Semua Pengajuan" = table semua status (monitoring + mungkin tombol Cancel admin override), belum dibangun (masih stub `pages/superadmin/pengajuan/`).

**Desain/tema sementara dipertahankan apa adanya** — user lagi cari referensi buat kemungkinan redesign visual, tapi prioritas saat ini nyelesain fungsionalitas MVP dulu. Font: Plus Jakarta Sans (Google Fonts). Tema dark final, emerald `#10B981` brand, status badge per-status (lihat `status-badge.config.ts`).

---

## 🆕 [2 Sept 2026, sesi keempat] CORS PATCH bug, List Request Pinjaman, Lupa/Reset Password

**🐛 Bug besar ketemu & FIXED**: `SecurityConfig.java` (backend) CORS `allowedMethods` gak include `"PATCH"` — semua action PATCH (marketing-approve, bm-approve, bm-reject, disburse, updateOwnProfile `/me`, updateUserBySuperadmin `/{id}`) diblokir browser sebelum sempat nyampe controller. Ini penyebab asli laporan "gagal menyimpan perubahan" pas edit staff. Fixed: `PATCH` ditambahin ke `allowedMethods`. Sekalian ditambahin rule eksplisit `hasRole("SUPERADMIN")` buat `GET`/`DELETE /api/v1/user/{id}` (gap yang ditemukan sesi sebelumnya) — user pilih fix eksplisit ini, bukan andalin `RoleHierarchy` (yang emang gak nutup gap ini, cuma nambah izin ke atas). Diverifikasi: preflight PATCH/DELETE/GET ke `/api/v1/user/{id}` sekarang lolos CORS (dapet 401 dari validasi token, bukan diblokir CORS lagi).

**Keputusan RBAC**: user pilih **pertahankan boolean flags** (`tbl_role_menu`) buat MVP, normalize ke `tbl_permission` terpisah jadi enhancement nanti. Diagram perbandingan dibikin & dipublish sebagai Artifact buat referensi (lihat riwayat chat kalau perlu link-nya lagi).

**List Request Pinjaman (superadmin) — ✅ SELESAI**: `pages/superadmin/pengajuan/` (`Pengajuan` class, sebelumnya stub) sekarang full — `httpResource` ke `GET /api/v1/pengajuan` (getAll, endpoint udah ada, gak perlu backend baru), reuse `LoanQueueListComponent` + adapter `mapApiPengajuanToLoanApplication` yang sama kayak Review Pinjaman, **read-only** (gak ada `selectItem` binding, gak ada drawer approve/reject — sesuai keputusan superadmin cuma monitoring). Ada filter status (`ALL` + 7 status) dihitung dari data yang udah di-fetch, gak perlu endpoint baru. Sidebar entry direname dari "Semua Pengajuan" jadi **"List Request Pinjaman"** biar match nama di checkpoint sheet FE user.

**Lupa Password + Reset Password — ✅ SELESAI, backend endpoint-nya udah lama ada tapi FE-nya belum pernah dibikin**:
- `pages/auth/forgot-password/` — form email → `POST /api/v1/user/forgot-password`. **Catatan penting**: backend belum ada pengiriman email beneran (gak ada integrasi SMTP), jadi endpoint ini literally balikin reset token JWT langsung di response body (`ApiResponse<String>`). FE nampilin token itu langsung ke user (dengan disclaimer "karena belum ada pengiriman email beneran di simulasi ini") + tombol lanjut ke halaman reset yang otomatis ke-prefill email+token via query param.
- `pages/auth/reset-password/` — form email+token+password baru → `POST /api/v1/user/reset-password`. Token JWT-stateless, berlaku 15 menit (klaim `"purpose"`).
- `auth.service.ts` tambah `forgotPassword()`/`resetPassword()`. `auth.dto.ts` tambah `ForgotPasswordRequest`/`ResetPasswordRequest`, DAN fix `AuthResponseDTO` yang ternyata salah dari awal (`{token, role, email}` di FE vs `{token, type}` beneran di backend — field `role`/`email` gak pernah kepakai/ada, sekarang udah dibetulin match backend asli).
- Link "Lupa sandi?" di `login.html` yang tadinya `href="#"` mati, sekarang `routerLink="/forgot-password"`.
- **Verified live** — dicoba beneran ke backend asli pakai email `superadmin@example.com`, dapet token JWT valid balik. **Sengaja gak submit form reset-nya** (itu bakal beneran ganti password superadmin di DB live, di luar scope "coba retest").
- Gotcha testing: spec baru (`forgot-password.spec.ts`, `reset-password.spec.ts`) awalnya gagal `NG0201: No provider found for ActivatedRoute` — component pakai `RouterLink`/`inject(Router)`/`inject(ActivatedRoute)` tapi test module gak provide router. Fix: tambah `providers: [provideRouter([])]` di `TestBed.configureTestingModule`, pola yang sama persis kayak `login.spec.ts`.

**Belum dikerjakan (nunggu giliran, semua butuh backend BARU bukan cuma wiring)**:
- **Master Role CRUD** — backend cuma punya `RoleEntity`/`RoleRepository`/`RoleService`/`roleDTO`/`RoleRequest`, **TAPI GAK ADA `RoleController`** — nol endpoint REST buat role. Kudu bikin controller baru dulu sebelum FE bisa jalan (mirip pola `UserController`: GET all/by id, POST, PATCH, DELETE).
- **Master Menu + Master Access** — backend `tbl_menu`/`tbl_role_menu` masih cuma skema DB doang, controller/service belum ada sama sekali. Paling besar dari 3 item ini.
- **Ganti Password** (beda dari lupa password — ganti pas udah login, perlu verifikasi password lama) — endpoint-nya beneran belum ada di backend, CORS fix gak nolongin ini karena bukan soal CORS, endpoint-nya sendiri belum dibuat.

**UT (unit testing)** — sengaja ditunda per permintaan user, jangan disentuh dulu.

### 🆕 [2 Sept 2026, lanjutan sesi keempat] Drawer view-only superadmin + halaman Settings

**Superadmin bisa lihat drawer detail pengajuan, tapi gak ada tombol approve/reject/cairkan** — sesuai wacana. Implementasi:
- `UserRole` (`loan-application.ts`) ditambah `'SUPERADMIN'`
- `ROLE_REVIEW_CONFIG.SUPERADMIN` (`review-action.config.ts`) — `title: 'Detail Pengajuan'`, `actions: []`
- `loan-review-drawer.html` — textarea catatan + action bar sekarang di-`@if (config().actions.length > 0)`, otomatis hilang total kalau `actions` kosong (gak perlu logic tambahan di komponen manapun yang makai drawer ini)
- `pengajuan.ts`/`pengajuan.html` (List Request Pinjaman) — tambah `selectedId`/`selectedItem`/`selectItem()`/`closeDrawer()`, drawer dirender dengan `role="SUPERADMIN"`, gak ada `(actionSubmit)` binding
- **Breaking-change kecil yang harus di-fix**: nambah `'SUPERADMIN'` ke `UserRole` bikin `QUEUE_ROLE_CONFIG` (`Record<UserRole, ...>`) sama `ReviewQueueBase.role` (abstract `UserRole`) gagal compile karena SUPERADMIN gak punya entry/gak relevan di situ. Fix: `QUEUE_ROLE_CONFIG` di-type `Record<Exclude<UserRole,'SUPERADMIN'>, QueueRoleConfig>`, `ReviewQueueBase.role` juga di-narrow ke `Exclude<UserRole,'SUPERADMIN'>`, 3 subclass (`marketing`/`branchmanager`/`backoffice` review-pinjaman) ganti `protected readonly role: UserRole = 'X'` jadi `protected readonly role = 'X' as const` (biar TS infer literal type, bukan widen ke `UserRole`). **Pelajaran**: kalau nambah varian ke union type yang dipakai luas, cek semua `Record<TheUnion, ...>` yang ada — bisa jadi butuh `Exclude<>` di tempat yang gak semua varian relevan.

**Halaman Settings (`pages/settings/`) — ✅ SELESAI, staff mana pun bisa edit profil sendiri**:
- Route baru `/settings` (top-level, `DashboardLayoutComponent` + `roleGuard(['superadmin','marketing','branchmanager','backoffice'])` — sengaja gak di bawah `/admin` biar semua role bisa akses, bukan cuma superadmin)
- Form: Nama Lengkap (wajib, pre-fill dari `AuthService.currentUser()`) + Email Baru (opsional — **backend `/me` GET cuma balikin `{namaLengkap, roleName}`, gak ada email**, jadi field email sengaja dikosongin dengan placeholder "kosongkan kalau gak mau ganti", bukan di-prefill)
- Submit → `AuthService.updateOwnProfile()` (baru) → `PATCH /api/v1/user/me` (endpoint lama, baru kebuka gara-gara fix CORS PATCH). Payload email di-`undefined`-in kalau kosong (bukan string kosong `""`) biar `JSON.stringify` buang key-nya sama sekali — backend `updateOwnProfile` service treat field `null` sebagai "jangan diubah", tapi `""` beneran bakal nge-set email jadi kosong kalau dikirim.
- Setelah sukses, `authService.fetchCurrentUser()` dipanggil ulang biar navbar (nama+breadcrumb+avatar) langsung ke-refresh reaktif tanpa reload manual — **diverifikasi jalan** (submit nama baru → navbar re-render otomatis).
- Tombol Settings di navbar (`navbar.html`) yang tadinya gak ada `routerLink` sama sekali, sekarang `routerLink="/settings"`.
- Card "Ganti Kata Sandi" di halaman ini sengaja cuma pesan placeholder ("sedang disiapkan, sementara pakai Lupa Password") — endpoint ganti password beneran belum ada (lihat item "Belum dikerjakan" di atas).
- Gotcha testing (pola sama kayak forgot/reset-password): `navbar.spec.ts` (**PRE-EXISTING file**, bukan baru) sempat ikut gagal `NG0201: No provider found for ActivatedRoute` gara-gara `navbar.ts` ditambah import `RouterLink` — fix: tambah `provideRouter([])` ke `navbar.spec.ts` juga.
- `pengajuan.spec.ts` juga sempat gagal (`Resource is currently in an error state`) gara-gara `selectedItem` computed baru di-render unconditionally di template (di luar guard `isLoading()/hasError()`), jadi `httpResource` yang gagal (gak ada mock di test) langsung throw pas diakses `.value()`. Fix: `pengajuan.spec.ts` diubah ke pola `provideHttpClient()` + `HttpTestingController` + `.flush(...)` kayak `review-pinjaman.spec.ts`, bukan dibiarkan bare tanpa HTTP mock.

**Catatan flakiness test**: `forgot-password.spec.ts` vs `reset-password.spec.ts` kadang gantian gagal antar run full-suite (tapi selalu PASS kalau dijalanin sendirian/isolated) — sepertinya isu isolasi Vitest antar file yang sama-sama pakai `provideRouter([])`, bukan bug di kode. Belum ditriase lebih jauh, masuk kategori sama kayak 6 file lain yang emang udah flaky dari awal.

### 🆕 [2 Sept 2026, lanjutan sesi keempat] Master Role — ✅ SELESAI, backend + frontend full CRUD

**Temuan penting**: `RoleService` (backend) udah punya method CRUD LENGKAP dari awal (`createRole`, `getAllRoles`, `updateRole`, `deleteRoleById`) — cuma emang belum pernah di-expose lewat `@RestController`. Jadi kerjaannya jauh lebih kecil dari perkiraan (Master Menu/Access beda cerita, itu beneran nol dari awal).

**Backend baru**: `controller/RoleController.java` (`@RequestMapping("/api/v1/role")`, base path singular konsisten sama `/api/v1/user`):
- `GET /api/v1/role` — list semua
- `POST /api/v1/role` — create (body `RoleRequest { nama, description }` — **field `nama`, BUKAN `namaRole`**, meski response entity-nya pakai `namaRole`. Beda nama field request vs entity ini quirk asli dari `RoleRequest.java` yang udah ada sebelumnya, bukan sesuatu yang saya bikin)
- `PATCH /api/v1/role/{id}` — update (`RoleRequest` sama)
- `DELETE /api/v1/role/{id}` — **hard delete** (`roleRepository.delete(role)`, BEDA dari User yang soft-delete). Kalau role masih dipakai staff aktif (FK `tbl_user.id_role`), delete bakal gagal kena constraint violation — FE nangkep sebagai error generik ("kemungkinan masih dipakai staff aktif"), belum ada pesan error spesifik dari backend buat kasus ini.
- `SecurityConfig.java` — `.requestMatchers("/api/v1/role/**").hasRole("SUPERADMIN")`
- **Diverifikasi live**: abis `mvn compile`, devtools auto-restart backend, `GET /api/v1/role` langsung kereach (401 dari token, bukan 404) tanpa perlu restart manual.

**Frontend baru**:
- 🆕 `shared/models/role.model.ts` — `Role` (response shape, field `namaRole`), `RoleRequest` (request shape, field `nama` — beda sengaja, ngikutin backend)
- 🆕 `shared/components/role-form-modal/` — modal create+edit, pola sama persis kayak `staff-form-modal`
- ✏️ `pages/superadmin/roles/roles.ts`/`.html` — dari stub (`<p>roles works!</p>`) jadi full CRUD table, pola sama kayak `staff.ts`

**Diverifikasi end-to-end** (mocked network, backend beneran udah confirmed reachable terpisah): create/edit/delete semua jalan, list render dengan 4 role asli (SUPERADMIN/MARKETING/BM/BACK_OFFICE) + deskripsinya.

### 🆕 [2 Sept 2026, lanjutan] Master Menu + Master Access — ✅ SELESAI, ke-4 Master Data lengkap

**Semua 4 Master Data yang diminta user sekarang ada**: Master Staff (User), Master Role, Master Menu, Master Access.

**Backend baru dari nol** (beda dari Role yang service-nya udah ada — ini bener-bener nol sebelumnya):
- `entity/MenuEntity.java` (`tbl_menu`) — `parentId` sengaja disimpen sebagai UUID polos, BUKAN relasi `@ManyToOne` self-referencing, biar gak ribet soal recursive serialization Jackson buat menu bertingkat. Kalau nanti butuh breadcrumb/tree beneran, baru dipikirin ulang.
- `entity/RoleMenuEntity.java` (`tbl_role_menu`) — `@ManyToOne` ke `RoleEntity` & `MenuEntity` (pola sama kayak `UserEntity.role`), 4 kolom boolean `canView/canCreate/canUpdate/canDelete`.
- `repository/MenuRepository.java`, `repository/RoleMenuRepository.java` (`findByRole_Id`, `findByRole_IdAndMenu_Id`)
- `dto/MenuRequest.java`, `dto/RoleMenuRequest.java`
- `service/MenuService.java` (CRUD standar) + `service/RoleMenuService.java` — pola **upsert**: `upsert()` cari baris role+menu yang udah ada (unique constraint di DB), kalau belum ada baru dibikin baris baru, baru overwrite 4 flag boolean-nya. `upsertBulk()` buat nyimpen semua checkbox 1 role sekaligus dalam 1 request.
- `controller/MenuController.java` (`/api/v1/menu` — GET/POST/PATCH/DELETE) + `controller/RoleMenuController.java` (`/api/v1/role-menu` — `GET /role/{roleId}`, `PUT` bulk array)
- `SecurityConfig.java` — `/api/v1/menu/**` dan `/api/v1/role-menu/**` superadmin-only
- **Diverifikasi live**: devtools auto-restart, `GET /api/v1/menu`/`/api/v1/role` langsung reachable.

**Frontend baru**:
- `shared/models/menu.model.ts`, `shared/models/role-menu.model.ts`
- `shared/components/menu-form-modal/` — CRUD form Menu (nama, path, icon, parent dropdown dari menu lain, urutan, status)
- `pages/superadmin/master-menu/` — table CRUD, di-sort by `urutan`, kolom "Parent" resolve nama dari `parentId`
- `pages/superadmin/master-access/` — **halaman matrix**: dropdown pilih role di atas → tabel semua menu × 4 checkbox (view/create/update/delete). Pola state: `matrix` signal lokal di-reset via `effect()` tiap kali `accessResource` (hasil `GET /role/{roleId}`) berubah, checkbox diedit di local state dulu, "Simpan Akses" baru kirim SEMUA baris (bukan cuma yang diubah) via `PUT` bulk. `httpResource` buat `accessResource` pakai pola conditional-fetch: url function balikin `undefined` kalau belum ada role dipilih, jadi gak nge-fetch apa-apa sampai user pilih role.
- Sidebar: `Master Menu` (icon `LucideLayers`, sebelumnya udah diimport tapi gak kepake) dan `Master Access` (icon `LucideShieldCheck`, baru) masuk ke grup MASTER DATA.

**Diverifikasi end-to-end** (mocked network): Master Menu CRUD jalan, Master Access — pilih role nampilin akses existing yang bener, toggle checkbox + simpan sukses, data ke-refresh reaktif.

**🚨 Batasan penting, WAJIB dipahami sebelum next session lanjut kerja di area ini**: Master Menu/Master Access ini SAAT INI cuma ngatur DATA di `tbl_menu`/`tbl_role_menu` — **belum ada koneksi apapun ke sistem menu/permission yang beneran dipakai app**. Sidebar asli (`shared/config/sidebar-menu.config.ts` → `MENU_CONFIG`) masih hardcoded di frontend, `roleGuard()` di `app.routes.ts` juga masih hardcoded array role per route. Toggle checkbox di Master Access **TIDAK** mengubah apa yang staff bisa lihat/akses beneran — itu kerjaan besar terpisah (bikin sidebar dynamic dari `GET /api/v1/menu` + `GET /api/v1/role-menu/role/{roleId}` user login, plus route guard yang baca permission dari situ juga) yang belum dikerjain dan belum diminta eksplisit. Kalau user nanya "kok saya uncheck tapi menu-nya masih muncul", ini penyebabnya — bukan bug.

### 🆕 [2 Sept 2026] Rencana: Sinkronisasi Master Access ke sistem beneran

**Status**: user udah confirmed mau ("gapapa kalau mau disinkron"), tapi **sengaja belum dieksekusi** — baru dicatat rencananya dulu per permintaan user, lanjut kerjain di sesi berikutnya. Ini bukan kerjaan kecil, jangan asal langsung mulai tanpa align ulang sama user dulu soal detail di bawah.

**Kenapa ini belum bisa langsung jalan (open question yang perlu diputuskan dulu)**:
1. `MENU_CONFIG` (FE, `sidebar-menu.config.ts`) itemnya adalah `{title, route, icon, roles: SidebarRole[]}` — role di situ pakai `SidebarRole` (lowercase: `superadmin`/`marketing`/`branchmanager`/`backoffice`). Sedangkan `tbl_role`/`tbl_menu`/`tbl_role_menu` pakai `BusinessRole` (UPPERCASE: `SUPERADMIN`/`MARKETING`/`BM`/`BACK_OFFICE`) dan `path` sebagai string bebas. Buat nyambungin, `tbl_menu.path` harus PERSIS sama karakter dengan `MENU_CONFIG[].route` (mis. `/admin/staff`) — kalau beda dikit (trailing slash, dsb) match-nya gagal diem-diem.
2. **Belum ada data seeding** — `tbl_menu` sekarang kosong (halaman Master Menu baru dibikin, belum ada yang isi data via halaman itu). Sebelum sidebar bisa baca dari situ, someone (user atau saya, based on instruction) harus create semua menu yang ada di `MENU_CONFIG` sekarang lewat halaman Master Menu, DAN isi `tbl_role_menu` buat tiap role lewat Master Access — kalau enggak, begitu sidebar dialihin ke dynamic, semua orang bakal lihat sidebar KOSONG (gak ada row role_menu = gak ada akses).
3. **Guard butuh strategi caching/timing** — `roleGuard()` sekarang cuma baca `localStorage['userRole']` secara sinkron (gak ada `async`/HTTP call). Kalau guard mau baca permission dari `tbl_role_menu`, itu butuh data yang udah di-fetch DULU (kemungkinan pas login/`fetchCurrentUser()`, disimpen di `AuthService` sebagai signal), bukan fetch on-the-fly di guard (bikin race condition/flicker). Perlu nambah step: abis login sukses → fetch role-menu buat role itu → simpen di service → baru guard & sidebar boleh baca dari situ.
4. **Menu yang gak per-role** (kayak "Overview" yang cuma superadmin, atau breadcrumb-only entries) — apa tetap didaftarin ke `tbl_menu` juga demi konsistensi, atau dibiarin hardcoded karena toh cuma 1 role yang akses? Belum diputuskan sama user.

**Rencana teknis kalau udah di-align**:
1. Seed `tbl_menu` dari `MENU_CONFIG` yang ada sekarang (lewat halaman Master Menu, atau bisa juga lewat SQL langsung kalau lebih cepat — tanya user preferensinya)
2. Seed `tbl_role_menu` buat 4 role sesuai `MENU_CONFIG[].roles` sekarang (lewat Master Access, per role)
3. `AuthService` — abis `fetchCurrentUser()` sukses, sekalian fetch `GET /api/v1/role-menu/role/{roleId}`, simpen sebagai `myMenuAccess` signal
4. `sidebar.ts` — `filteredMenuGroups` computed baca dari `myMenuAccess` (filter `canView=true`) gabungan sama data menu (`nama_menu`, `path`, `icon` — icon-nya string nama lucide, perlu mapping balik ke component class kayak yang udah ada di `menu-form-modal` placeholder "LucideUsers" dst)
5. Route guard — pertimbangkan bikin guard baru `menuAccessGuard()` yang cek `myMenuAccess` punya `canView=true` buat path yang lagi diakses, dipasang di route yang butuh granular control (bisa jalan bareng `roleGuard` yang udah ada, gak perlu gantiin total)
6. `MENU_CONFIG` hardcoded — TIDAK dihapus langsung, biar ada fallback kalau `tbl_menu` kosong/gagal fetch (defensive), atau baru dihapus total setelah yakin migrasinya stabil

**Jangan mulai eksekusi ini tanpa nanya user dulu**: konfirmasi urutan seeding (siapa yang isi data), dan apakah semua menu perlu didaftarin atau cuma sebagian.

### 🆕 [3 Sept 2026] Seeding selesai — data `tbl_menu`+`tbl_role_menu` udah siap sync

**Keputusan desain Master Access**: dipertahankan pola "pilih 1 role dulu, baru muncul checkbox" (bukan semua role sejajar kayak referensi Stitch user) — user udah confirm ini yang dipilih.

**Seeding dikerjain manual sama user lewat UI** (bukan saya, karena DB-nya ternyata **remote** — `129.226.195.9`, kemungkinan shared infra Binar, bukan localhost — jadi saya sengaja gak nembak SQL langsung ke situ, dan saya juga gak punya kredensial buat lewat API asli):
- `tbl_menu`: 9 baris, persis nyalin `MENU_CONFIG` yang ada sekarang (Overview, List Request Pinjaman, 3x Review Pinjaman per role, Master Role, Master Staff, Master Menu, Master Access). Semua `parentId` kosong (grouping visual "MAIN DASHBOARD"/dst sengaja di-skip dulu, belum diputuskan mau direpresentasiin gimana).
- `tbl_role_menu`: 4 role × 9 menu = 36 baris. `canView` diisi sesuai `roles` array di `MENU_CONFIG` asli, `canCreate`/`canUpdate`/`canDelete` semua `false` (belum ada fitur yang baca flag itu).
- **Diverifikasi 100% cocok** — user kirim hasil `GET /api/v1/role-menu/role/{roleId}` buat ke-4 role, saya cross-check manual satu-satu, gak ada yang meleset.

### 🆕 [3 Sept 2026] Sidebar dinamis — ✅ SELESAI, sync sidebar↔Master Access jalan

**Backend baru**: `GET /api/v1/role-menu/me` (`RoleMenuController`) — resolve role user login dari JWT (`SecurityContextHolder` → `UserRepository.findByUsername` → `user.getRole().getId()`), balikin akses menu buat role itu. Beda dari `/role/{roleId}` yang superadmin-only, endpoint `/me` ini `hasAnyRole(SUPERADMIN,MARKETING,BM,BACK_OFFICE)` — dipasang **di atas** rule wildcard `/api/v1/role-menu/**` superadmin-only (pola "spesifik sebelum wildcard" yang sama kayak `/user/me`).

**Frontend**:
- `AuthService` — signal baru `myMenuAccess` + method `fetchMyMenuAccess()` (GET `/role-menu/me`), di-reset kosong pas logout.
- Dipanggil di 2 tempat: `app.ts` `ngOnInit()` (buat kasus refresh/buka app baru, kalau `isLoggedIn()`), dan `login.ts` abis login sukses (fire-and-forget, gak nge-block redirect).
- `sidebar.ts` `filteredMenuGroups` — **desain hybrid**, bukan full rewrite: `MENU_CONFIG` tetap dipakai sebagai "katalog tampilan" (title/route/icon/`groupName` buat grouping visual "MAIN DASHBOARD"/dst — karena `tbl_menu` gak punya konsep group/parentId yang dipakai, itu keputusan yang sengaja di-defer), TAPI filter aksesnya sekarang baca dari `myMenuAccess()` (match by `route === menu.path && canView`), bukan dari array `roles` di `MENU_CONFIG` lagi. **Fallback**: kalau `myMenuAccess` masih kosong (belum sempat fetch / gagal / network error), balik pakai filter `roles` hardcode lama — sidebar gak pernah blank total.

**Diverifikasi**: signal `myMenuAccess` kebukti nyimpen data asli dari mock response, dan `filteredMenuGroups()` kebukti return hasil yang match persis (termasuk kasus override — kasih `Overview` akses ke role Marketing lewat mock, padahal `MENU_CONFIG` bilang itu `roles: ['superadmin']` doang, hasilnya tetep muncul karena sumber kebenaran sekarang data, bukan hardcode). Verifikasi visual di browser sempat kejegal 1 hal teknis (lihat gotcha di bawah), tapi computed signal-nya sendiri udah kebukti benar via invoke langsung.

**🐛 Gotcha testing (device manapun, kalau perlu manual-trigger service dari browser console buat debugging)**: nge-timpa `window.fetch` manual dari luar app (buat mocking pas testing) bikin function itu jadi **gak zone-patched** — `NgZone` gak pernah tau ada task async yang selesai, jadi CD gak ke-trigger walau signal-nya sendiri udah bener-bener keupdate (`comp.filteredMenuGroups()` manggil langsung kebukti benar, tapi DOM/screenshot gak keliatan berubah). Ini murni artifact cara testing (monkey-patch `fetch` di console), BUKAN bug beneran — di app asli, `fetch` tetep zone-patched normal dari awal render, jadi CD jalan seperti biasa.

**🚨 Batasan yang masih ada — belum dikerjain sesi ini**: sidebar sekarang udah nyembunyiin item yang gak diizinkan, TAPI **route guard belum ngecek permission per-menu**. Kalau staff Marketing tau/nebak URL `/admin/staff` langsung dari address bar, `roleGuard(['superadmin'])` di route itu tetep nolak dia (guard per-role masih jalan seperti biasa) — jadi itu AMAN. Yang belum kesync itu skenario yang lebih halus: staff dalam role yang SAMA tapi di-uncheck akses ke 1 menu spesifik lewat Master Access (misal Marketing tapi `canView=false` buat Review Pinjaman) — staff itu tetap bisa buka `/marketing/review-pinjaman` langsung via URL walau sidebar-nya udah nyembunyiin link itu, karena `roleGuard(['marketing'])` di route itu cuma cek role, bukan cek `canView` per-menu. Kalau butuh proteksi level itu, perlu guard baru (`menuAccessGuard`) yang baca `myMenuAccess` — belum dibangun, next task kalau user minta.

**File yang berubah**: `RoleMenuController.java` (`+getMyAccess()`), `SecurityConfig.java` (+rule `/role-menu/me`), `auth.service.ts` (+`myMenuAccess` signal, `+fetchMyMenuAccess()`), `app.ts` (ngOnInit fetch), `login.ts` (fetch abis login sukses), `sidebar.ts` (`filteredMenuGroups` baca data, bukan hardcode lagi).

### 🆕 [3 Sept 2026] Ganti Password — ✅ SELESAI

Endpoint baru yang emang dari awal belum ada (beda dari lupa password): `PATCH /api/v1/user/change-password`, body `{oldPassword, newPassword}`. Backend: `UserManagementService.changePassword()` (verifikasi `passwordEncoder.matches(old, hash)` dulu sebelum `encode(new)` — pola sama kayak `resetPassword()`/`createUser()` yang udah ada di file yang sama), endpoint di `UserController`, `SecurityConfig` rule spesifik di atas wildcard `{id}` (pola sama kayak `/me`).

Frontend: `AuthService.changePassword()`, card "Ganti Kata Sandi" di `pages/settings/` yang tadinya placeholder sekarang form beneran (old/new/confirm password, validator custom `passwordsMatchValidator` buat cek new===confirm). Diverifikasi: endpoint reachable (401 dari token, bukan 404), validasi mismatch jalan di browser. **Sengaja gak disubmit form-nya buat testing** (bakal beneran ganti password akun real).

### 🆕 [3 Sept 2026] Migration `tujuan_pinjaman` di `tbl_pengajuan` — ✅ SELESAI, verified live

**Cara eksekusi migration ini beda dari yang didokumentasikan sebelumnya**: bukan jalanin `sakuku-migration-customer-pengajuan-fields.sql` manual, tapi manfaatin `spring.jpa.hibernate.ddl-auto=update` (udah ada di `application.properties` dari awal, baru ketauan sesi ini) — cukup tambah field di JPA Entity, Hibernate otomatis `ALTER TABLE ADD COLUMN` sendiri begitu backend restart. Nggak perlu nyentuh DB remote (`129.226.195.9`) langsung sama sekali, lebih aman dari raw SQL manual.

**Backend**: `PengajuanEntity` +field `tujuanPinjaman` (`String`, kolom `tujuan_pinjaman`, nullable — pola sama kayak `status` yaitu plain String bukan JPA `@Enumerated`, nilai valid disepakati: `MODAL_USAHA`/`KONSUMTIF`/`PENDIDIKAN`/`KESEHATAN`/`RENOVASI`/`LAINNYA`, tapi nggak divalidasi enum-strict di level entity). `PengajuanRequest` (dipakai `POST /api/v1/pengajuan`, customer create) +field `tujuanPinjaman`, **sengaja dibiarin opsional (nggak ada `@NotNull`)** karena Android app customer belum ada yang manggil endpoint ini — begitu Android app jalan dan selalu ngirim field ini, boleh diketatin jadi wajib. `PengajuanService.create()` diupdate nyimpen field ini dari request.

**Frontend**: `ApiPengajuan` (`pengajuan-api.model.ts`) +field `tujuanPinjaman: string | null`, `mapApiPengajuanToLoanApplication()` diupdate: `loan.category` sekarang `raw.tujuanPinjaman ?? ''` (sebelumnya hardcode `''`). **Nggak perlu ubah komponen UI manapun** — `loan-review-drawer.html` udah dari awal punya guard `@if (app.loan.category)` yang otomatis nyembunyiin badge kalau kosong, jadi begitu data asli ada, badge langsung muncul sendiri tanpa perubahan template.

**Status verifikasi**: `mvn clean compile` backend sukses bersih (exit 0). Backend sempat mati pas sesi berlangsung, user restart, **diverifikasi LIVE** lewat browser (login superadmin, `GET /api/v1/pengajuan`) — response beneran balikin `"tujuanPinjaman":null` di semua 18 baris data lama. Kolom di DB remote (`129.226.195.9`) udah kebuat otomatis lewat `ddl-auto=update`, gak ada SQL manual yang dijalanin. `null` di semua baris itu expected (belum ada klien yang ngirim field ini — nunggu Android app).

**Scope note**: ini CUMA bagian `tujuan_pinjaman` dari migration yang lebih besar. Field-field `tbl_customer` (`tanggal_lahir`, `tipe_pekerjaan`, `pekerjaan`, `lama_bekerja_bulan`, `pendapatan_bulanan`, `utang_berjalan`) di `sakuku-migration-customer-pengajuan-fields.sql` **masih belum dikerjain** — user sengaja minta fokus `tujuan_pinjaman` dulu. Kalau lanjut ke field customer itu, pendekatannya sama (tambah field ke `CustomerEntity`, manfaatin `ddl-auto=update`), bukan raw SQL.

### 🆕 [3 Sept 2026] Riwayat Review Saya — ✅ backend + frontend selesai, ⏳ nunggu seeding Master Menu/Access biar sidebar-nya muncul

**Backend**: `GET /api/v1/review-log/me` (`ReviewLogController`, baru) — resolve user login dari `SecurityContextHolder` (pola sama kayak `/user/me` dan `/role-menu/me`), delegasi ke `ReviewLogService.getByUser(userId)` (method baru) → `ReviewLogRepository.findByUser_IdOrderByCreatedAtDesc()` (query method baru). Balikin `List<ReviewLogEntity>` mentah (pola sama kayak `getRecentActivity()` buat Aktivitas Terbaru superadmin — entity langsung, bukan DTO). `SecurityConfig` rule baru `hasAnyRole("MARKETING","BM","BACK_OFFICE")` — **superadmin sengaja TIDAK dikasih akses**, soalnya `cancelBySuperadmin()` di `PengajuanService` gak pernah manggil `reviewLogService.record()`, jadi riwayatnya bakal selalu kosong buat role itu.

**Frontend — refactor kecil dulu**: ternyata "Riwayat Review Saya" butuh tampilan yang PERSIS sama kayak "Aktivitas Terbaru" (icon + pesan + timestamp per baris), yang sebelumnya markup-nya nge-inline langsung di `overview.html`. Daripada copy-paste ulang blok yang sama, di-extract jadi 🆕 `shared/components/activity-feed/` (`.ts`/`.html`/`.css`) — komponen reusable, input `activities: ReviewActivity[]` + `emptyMessage` (opsional, buat kustomisasi pesan kosong per halaman). `overview.ts`/`.html` di-refactor pakai komponen ini (hapus `activityIcon()`/`shortId()` yang pindah ke situ, hapus `formatActivityMessage()` yang ternyata emang gak kepake dari awal — dead code).

**Halaman baru**: 🆕 `pages/staff/riwayat-review/` (`.ts`/`.html`/`.css`) — **1 komponen dipakai bareng buat 3 role** (Marketing/BM/Backoffice), bukan 3 file terpisah kayak `review-pinjaman` — soalnya kontennya 100% identik (endpoint `/me` udah resolve identitas dari JWT sendiri, gak butuh config per-role apapun). Didaftarin di `app.routes.ts` 3x di 3 child-route berbeda (`/marketing/riwayat-review`, `/branchmanager/riwayat-review`, `/backoffice/riwayat-review`), masing-masing tetep di bawah `roleGuard` role-nya sendiri.

**🚨 Belum kelar — sidebar-nya belum muncul sampai di-seed manual**: `sidebar-menu.config.ts` (`MENU_CONFIG`) udah ditambah 3 entry "Riwayat Review Saya" (icon `LucideHistory`), TAPI karena sidebar sekarang baca `myMenuAccess` (data live dari `tbl_role_menu`, lihat section "Sidebar dinamis" di atas) dan BUKAN fallback `roles` array lagi (staff yang udah login pasti `myMenuAccess` udah keisi, gak nge-trigger fallback), 3 route baru ini **gak bakal muncul di sidebar sampai** ada yang nambahin data ini lewat UI (user pilih ngerjain sendiri, bukan saya lewat browser otomatis):
1. **Master Menu** — tambah 3 baris baru: nama `Riwayat Review Saya`, icon `LucideHistory`, path masing-masing persis: `/marketing/riwayat-review`, `/branchmanager/riwayat-review`, `/backoffice/riwayat-review` (parent kosong, urutan bebas)
2. **Master Access** — buka role **MARKETING**, centang View di baris yang path-nya `/marketing/riwayat-review` (JANGAN yang path lain), simpan. Ulangi buat role **BM** → path `/branchmanager/riwayat-review`, dan **BACK_OFFICE** → path `/backoffice/riwayat-review`.

Kalau langkah ini kelewat, halamannya tetap bisa diakses langsung lewat URL (route+guard-nya udah aktif dari kode), cuma link-nya gak nongol di sidebar.

**Verifikasi sesi ini**: backend `mvn clean compile` sukses bersih. Frontend `tsc --noEmit` clean, gak ada error tipe. **Belum diverifikasi visual di browser** (koneksi browser tool sempat kedeny pas sesi ini) — next session/user disaranin buka salah satu route `riwayat-review` langsung lewat URL buat mastiin datanya kebaca bener dari endpoint baru.

---

## Testing (Vitest — BUKAN Jasmine/Karma)

Setup: `@angular/build:unit-test` builder, scripts `npm run test` (watch), `test:ci` (sekali jalan), `test:coverage` (butuh `npm install -D @vitest/coverage-v8`).

**Status per 1 September**: dari 35 file spec, 28 passed. Yang failed & prioritas:
- ✅ `auth.interceptor.spec.ts` — FIXED (root cause: Node v25 localStorage bug, lihat gotcha di atas)
- ⏳ `auth.guards.spec.ts` — **masih pakai syntax Jasmine** (`jasmine.createSpyObj`, `.and.returnValue`), harus dikonversi ke Vitest (`{ method: vi.fn() }`, `.mockReturnValue(...)`). User lagi belajar konversi ini sendiri.
- ⏳ 6 file lain failed, belum ditriase — kemungkinan besar `.spec.ts` bawaan `ng generate` yang component-nya udah berubah (butuh dependency baru) tapi spec-nya belum diupdate. **Sengaja ditunda**, prioritas ke FE feature dulu.

DTO backend: **tidak perlu ditest** kalau cuma polos (Lombok getter/setter). Baru worth ditest kalau ada custom validation/method.

---

## Roadmap Outside MVP & Enhancement

**Outside MVP**: (1) flow cicilan/bayar per bulan — butuh tabel baru; (2) plafond naik kalau lancar — `limit_efektif` sudah didesain; (3) scoring — field income/debts jadi bahan mentah; (4) kamera KTP — defer.

**Enhancement**: (1) validasi error login — quick win; (2) konsolidasi API call; (3) limitasi token reset password (Redis/opsional); (4) OTP verifikasi email (baru, titik implementasi belum diputuskan).

**🆕 Enhancement UI/UX (ditemukan 2 Sept, belum dikerjakan):**
- `loan-review-drawer` masih full emerald-tinted (belum ikut redesign netral kayak `loan-queue-list`) — kandidat kuat buat direstyle biar konsisten satu tema di seluruh Review Pinjaman
- Ambiguitas nilai 0 di field employment/financial: begitu migration jalan, `existingDebts: 0` bisa jadi nilai asli (customer beneran gak punya utang) ATAU placeholder kosong — perlu keputusan desain, mungkin backend butuh nullable bukan default 0, biar frontend bisa bedain "beneran 0" vs "belum diisi"
- Navbar Settings (ganti nama/password) belum ada action — nunggu endpoint ganti password (lihat Next Steps #3)
- Toggle grid/list view buat queue (opsional, terinspirasi referensi UI, bukan prioritas)
- Filter bar di atas Review Pinjaman (by tenor/nominal range) — fase lanjutan setelah stat strip stabil

**Urutan kerja**: selesaikan core MVP dulu → Enhancement #1 (quick win) → sisanya jadi "roadmap ke depan" pas presentasi.

---

## FRD

Section 1–3 selesai. Belum: User Stories, Product Requirements, Business Rules, NFR, Acceptance Criteria, Glossary, Risks & Dependencies.

---

## Next Steps (urutan prioritas)

1. ✅ ~~`Cannot read properties of undefined (reading 'name')` di loan-queue-list~~ — FIXED via adapter pattern (`pengajuan-api.model.ts`)
2. ✅ ~~Restrukturisasi sidebar~~ — FIXED (grup Master Data, role naming di-unify, entry Dashboard staff dihapus 2 Sept)
3. ✅ ~~Navbar: breadcrumbs + profile widget~~ — FIXED, connect ke `AuthService.currentUser()` via endpoint `/me`. Compact mode mobile FIXED (2 Sept). Settings (ganti nama/password) masih belum ada action — lihat #4.
4. **Backend baru**: endpoint `GET /api/v1/review-log/me` (riwayat review staff, dipakai dobel untuk halaman "Riwayat Review Saya" DAN Navbar notifikasi feed) + endpoint ganti password saat login
5. ✅ ~~Dashboard Marketing/BM/Back Office~~ — FIXED (2 Sept), digabung jadi stat strip (`queue-stats-strip`) di atas Review Pinjaman, halaman terpisah dihapus total (route + sidebar entry)
6. ✅ ~~Responsive check (navbar/drawer/queue-list/sidebar)~~ — FIXED (2 Sept), lihat detail lengkap di atas
7. **Halaman "Riwayat Review Saya"** — belum dikerjakan, blocked di endpoint #4. Rencana teknis: reuse `LoanQueueListComponent` mode read-only (klik row buka detail view-only, gak ada drawer approve/reject), route baru per role staff
8. Run migration `sakuku-migration-customer-pengajuan-fields.sql` → update entity Java → update dummy data → **update `ApiPengajuan` + mapper di `pengajuan-api.model.ts`** biar field yang tadinya placeholder (dob, employmentType, category, dst) keisi beneran → sekalian cabut logic "Belum tersedia" placeholder di `loan-review-drawer.html` begitu data asli ada
9. ✅ ~~Entity `PlafondEntity`+`UserPlafondEntity`~~ — Plafond masih belum (di luar MVP, lihat Roadmap). **Master Data Menu backend+UI — SELESAI** (2 Sept, sesi keempat), lihat detail lengkap di section "Master Menu + Master Access" di atas.
10. Testing: convert `auth.guards.spec.ts` ke Vitest syntax, triase 6 file failed lainnya
11. Enhancement UI/UX (lihat Roadmap di atas): restyle `loan-review-drawer` ke tema netral, keputusan nullable vs default-0 buat field financial
12. Cleanup pass: hapus file duplikat/legacy yang ditandai ⚠️ di atas (konfirmasi ke user dulu per file)
13. FRD lanjutan, Swagger/Postman docs, Redis/coverage/CI-CD — prioritas rendah
14. ✅ ~~Halaman Master Staff~~ — SELESAI (2 Sept), `GET /api/v1/user` confirmed jalan, model FE sudah match response asli
15. **🆕 Sinkronin Master Access ke sistem beneran** — user udah confirmed mau ("gapapa kalau mau disinkron"), tapi belum dieksekusi, ini next-next priority setelah istirahat. Rencana teknis (lihat rincian lengkap di section "Rencana: Sinkronisasi Master Access" di bawah):
    - Sidebar dinamis: `sidebar.ts` fetch `GET /api/v1/menu` + `GET /api/v1/role-menu/role/{roleId}` (role user login) alih-alih baca `MENU_CONFIG` hardcoded
    - Route guard baca permission dari situ juga (bukan cuma `roleGuard(['role1','role2'])` hardcoded)
    - Perlu mikirin: gimana `MENU_CONFIG.route` (string path Angular) nyambung ke `tbl_menu.path` (harus persis sama polanya), gimana fallback kalau staff punya `can_view=false` tapi coba akses langsung via URL (guard harus nolak, bukan cuma sembunyiin sidebar item)
    - Belum diputuskan: apa SEMUA sidebar item harus didaftarin ke `tbl_menu` dulu (termasuk yang sifatnya gak per-role kayak Overview), atau cuma yang emang butuh access control granular

### File baru/berubah — 1 Sept 2026 (sesi chat pertama)
- 🆕 `shared/models/pengajuan-api.model.ts` — `ApiPengajuan` + `mapApiPengajuanToLoanApplication()`
- 🆕 `shared/config/role.config.ts` — `BusinessRole`/`SidebarRole` unifikasi
- 🆕 `shared/config/sidebar-menu.config.ts` — `MENU_CONFIG` shared sidebar+navbar
- ✏️ `shared/base/review-queue.base.ts` — pasang mapper di `items` computed
- ✏️ `layout/sidebar/sidebar.ts` — pakai `MENU_CONFIG` + `SidebarRole` dari config baru
- ✏️ `layout/navbar/navbar.ts`, `navbar.html` — connect ke `AuthService`, hapus avatar, breadcrumb dari `MENU_CONFIG`
- ✏️ `core/services/auth.service.ts` — tambah `currentUser` signal + `fetchCurrentUser()`
- ✏️ Backend `UserController.java` — endpoint `GET /api/v1/user/me`, fix `ApiResponse<>` type inference error
- 🆕 Backend `dto/UserProfileDTO.java`

### File baru/berubah — 2 Sept 2026 (sesi chat kedua: redesign + responsive)
- ✏️ `layout/dashboard-layout/dashboard-layout.html` — `bg-decor` texture layer, fix closing tag, `content-shell` wrapper
- ✏️ `layout/dashboard-layout/dashboard-layout.css` — blob+grid texture, `content-shell` z-index (1→35, fix stacking context bug)
- ✏️ `layout/dashboard-layout/dashboard-layout.ts` — fix import `LucideMenu` (hamburger icon)
- ✏️ `shared/components/loan-queue-list/loan-queue-list.html` — redesign netral + layout `flex-col sm:flex-row` deterministik
- ✏️ `shared/components/loan-review-drawer/loan-review-drawer.html` — neutral placeholder buat field kosong
- ✏️ `pages/{marketing,branchmanager,backoffice}/review-pinjaman/review-pinjaman.html` — drawer fullscreen overlay mobile, integrasi stat strip
- ✏️ `pages/{marketing,branchmanager,backoffice}/review-pinjaman/review-pinjaman.ts` — import `QueueStatsStripComponent`
- ✏️ `layout/navbar/navbar.css` — compact mode mobile (hidden sm:flex di beberapa elemen)
- ✏️ `shared/config/sidebar-menu.config.ts` — hapus entry Dashboard staff
- ✏️ `app.routes.ts` — default redirect Marketing `dashboard`→`review-pinjaman`, hapus child route `dashboard`
- ✏️ `shared/base/review-queue.base.ts` — tambah `totalCount`/`totalAmount`/`avgAmount` computed
- 🆕 `shared/components/queue-stats-strip/` (`.ts`/`.html`/`.css`) — komponen stat strip baru

### File baru/berubah — 2 Sept 2026 (sesi chat ketiga: Master Staff)
- 🆕 `pages/superadmin/staff/` (`.ts`/`.html`/`.css`/`.spec.ts`) — halaman list staff, `httpResource` ke `GET /api/v1/user`
- 🆕 `shared/models/staff.model.ts` — `Staff`, `StaffRole`, `StaffStatus`
- 🆕 `shared/config/staff-status-badge.config.ts` — `STAFF_STATUS_BADGE_STYLES`, `STAFF_ROLE_LABELS`
- ✏️ `app.routes.ts` — route `admin/staff` (guard superadmin)
- ✏️ `shared/config/sidebar-menu.config.ts` — entry "Master Staff" di grup MASTER DATA
- ✏️ Root `CLAUDE.md` — diganti isinya pakai versi merged ini (menggantikan versi generic/outdated lama)

### File baru/berubah — 2 Sept 2026 (sesi chat keempat: CORS fix, List Request Pinjaman, Lupa/Reset Password, Settings, Master Role, Master Menu + Access)

**Backend (`saku-ku`)**
- ✏️ `config/SecurityConfig.java` — **fix bug besar**: CORS `allowedMethods` tambah `PATCH` (sebelumnya blokir semua action approve/reject/disburse/update-profile dari browser). Tambah `hasRole("SUPERADMIN")` eksplisit buat `GET`/`DELETE /api/v1/user/{id}` (gap security lama). Tambah rule buat `/api/v1/role/**`, `/api/v1/menu/**`, `/api/v1/role-menu/**` (semua superadmin-only).
- 🆕 `controller/RoleController.java` — expose `RoleService` yang udah ada lewat REST (`/api/v1/role`, GET/POST/PATCH/DELETE)
- 🆕 `entity/MenuEntity.java`, `entity/RoleMenuEntity.java`
- 🆕 `repository/MenuRepository.java`, `repository/RoleMenuRepository.java`
- 🆕 `dto/MenuRequest.java`, `dto/RoleMenuRequest.java`
- 🆕 `service/MenuService.java`, `service/RoleMenuService.java` (pola upsert)
- 🆕 `controller/MenuController.java` (`/api/v1/menu`), `controller/RoleMenuController.java` (`/api/v1/role-menu`)

**Frontend (`angular-challenge`)**
- ✏️ `shared/models/loan-application.ts` — `UserRole` +`'SUPERADMIN'`
- ✏️ `shared/config/review-action.config.ts` — entry `SUPERADMIN` (actions kosong = drawer view-only)
- ✏️ `shared/config/queue-role.config.ts`, `shared/base/review-queue.base.ts` — type di-narrow `Exclude<UserRole,'SUPERADMIN'>`
- ✏️ 3x `pages/{marketing,branchmanager,backoffice}/review-pinjaman/review-pinjaman.ts` — role jadi literal const
- ✏️ `shared/components/loan-review-drawer/loan-review-drawer.html` — sembunyiin notes+aksi kalau `actions` kosong
- ✏️ `pages/superadmin/pengajuan/pengajuan.ts`/`.html`/`.spec.ts` — dari stub jadi List Request Pinjaman full (fetch semua pengajuan, filter status, drawer view-only superadmin)
- ✏️ `shared/config/sidebar-menu.config.ts` — "Semua Pengajuan"→"List Request Pinjaman", tambah "Master Menu"+"Master Access"
- 🆕 `pages/auth/forgot-password/`, `pages/auth/reset-password/` (`.ts`/`.html`/`.css`/`.spec.ts` masing-masing)
- ✏️ `app.routes.ts` — route `/forgot-password`, `/reset-password`, `/settings`, `/admin/master-menu`, `/admin/master-access`
- ✏️ `pages/auth/login/login.html` — link "Lupa sandi?" disambungin
- ✏️ `core/services/auth.service.ts` — `forgotPassword()`, `resetPassword()`, `updateOwnProfile()`
- ✏️ `core/models/auth.dto/auth.dto.ts` — tambah `ForgotPasswordRequest`/`ResetPasswordRequest`, fix `AuthResponseDTO` (`{token,type}` bukan `{token,role,email}`)
- 🆕 `pages/settings/` (`.ts`/`.html`/`.css`/`.spec.ts`) — staff edit profil sendiri
- ✏️ `layout/navbar/navbar.ts`/`.html`/`.spec.ts` — Settings button disambungin ke `/settings`
- 🆕 `shared/models/role.model.ts`, `shared/components/role-form-modal/`
- ✏️ `pages/superadmin/roles/roles.ts`/`.html` — dari stub jadi Master Role full CRUD
- 🆕 `shared/models/menu.model.ts`, `shared/models/role-menu.model.ts`
- 🆕 `shared/components/menu-form-modal/`
- 🆕 `pages/superadmin/master-menu/` (`.ts`/`.html`/`.css`/`.spec.ts`)
- 🆕 `pages/superadmin/master-access/` (`.ts`/`.html`/`.css`/`.spec.ts`)
- ✏️ `pages/superadmin/pengajuan/pengajuan.spec.ts`, `layout/navbar/navbar.spec.ts` — fix `provideRouter([])`/`HttpTestingController` (regresi kecil dari perubahan di atas, langsung dibetulin)
- 🆕 Diagram Artifact "RBAC Schema Options" — perbandingan boolean flags vs entity Permission (link di riwayat chat)

**Belum dikerjakan (urutan next steps ada di section Next Steps di atas)**: sinkronisasi Master Access ke sidebar/guard beneran (poin #15), Ganti Password (endpoint backend belum ada), Riwayat Review Saya (blocked endpoint `/review-log/me`), UT (sengaja ditunda).

---

## Global Rules Reference (device-specific, PC/VSC only)

Kalau kerja dari Claude Code di PC:
1. `C:\Users\User\.claude\knowledge\coding-rules.md`
2. `C:\Users\User\.claude\knowledge\commit-guidelines.md`
3. `C:\Users\User\.claude\knowledge\security-checklist.md`
4. `C:\Users\User\.claude\knowledge\testing-standards.md`
5. Project-local `knowledge/` folder (gitignored): `README.md`, `PRD.md`, `ARCHITECTURE.md`, `TODO.md`, `WORKFLOW.md`, `SKILL.md` — baca `WORKFLOW.md` dulu (rules), lalu `TODO.md` (status).

**Last Updated**: 2026-09-03 (sesi kelima — Ganti Password selesai, migration `tujuan_pinjaman` selesai & verified live, Riwayat Review Saya selesai [backend+FE, nunggu seeding Master Menu/Access manual biar nongol di sidebar]. Sinkronisasi Master Access ke sidebar/guard beneran masih rencana, belum dieksekusi — lihat Next Steps #15.)
