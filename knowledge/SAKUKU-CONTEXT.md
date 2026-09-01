# Saku-Ku Context - Full Project Overview

**Source**: Handoff document dari user  
**Last Updated**: 2026-08-31  
**This document** collects all non-code context about the Saku-Ku project

---

## Project Definition

**Saku-Ku** (Indonesian: "My Wallet") adalah capstone project bootcamp **Binar Academy** (Agustus-September 2026).

**Tujuan**: Platform manajemen pinjaman fintech bergaya paylater (mirip Shopee PayLater), simulasi bootcamp, **BUKAN produk finansial berlisensi**. Target: siap Demo Day.

**Skala**: Simulasi produksi real (database struktur proper, auth dual-path, state machine loan, audit trail), tapi sandbox/pembelajaran bootcamp.

---

## Architecture: 3 Layer

Saku-Ku terdiri dari 3 layer yang dikerjakan terpisah:

### 1. Backend (Spring Boot 4.1) - Paling Matang
- **Tech**: Java, Spring Boot 4.1, JPA/Hibernate, JWT custom, PostgreSQL
- **Maturity**: Inti sudah lengkap (auth, RBAC, loan state machine, review log, notification)
- **Key Features**:
  - Dual auth path: `tbl_user` (staff) & `tbl_customer` (nasabah)
  - Role hierarchy: SUPERADMIN > MARKETING/BM/BACK_OFFICE
  - Loan state machine: SUBMITTED → MARKETING_REVIEW → BM_REVIEW → BACKOFFICE_REVIEW → DISBURSED (+ CANCELLED)
  - `ReviewLog` audit trail otomatis di tiap transisi
  - `Notifikasi` trigger di tiap state change
  - JWT stateless reset password (claim `"purpose"`, expiry 15 menit, no DB token storage)
  - Security config: `authenticationEntryPoint` (401) & `accessDeniedHandler` (403) eksplisit

### 2. Web Dashboard (Angular 21) - Sedang Dikerjakan (THIS LAYER)
- **Tech**: Angular 21, standalone components, signal-based (`input()`/`output()`/`signal()`/`httpResource()`)
- **Maturity**: Partial
  - Landing page (customer-facing): glassmorphism, mesh blob ambient, done ✅
  - Login page staff: form + glass card, done ✅
  - Dashboard layout: started ✅
  - Queue/Drawer pattern (Strategy Pattern): sedang dibangun
  - Master Data (Role/User/Menu): belum
  - Sisanya: belum

### 3. Android App (Kotlin) - Belum Mulai
- **Tech**: Kotlin, Material 3, MVVM (rencana)
- **Status**: 🔴 Belum dikerjakan

---

## Backend: Status & Key Design

### Database (PostgreSQL, sudah live)

**Tabel Utama**:
- `tbl_customer` - nasabah/borrower
- `tbl_user` - staff
- `tbl_role` - role definition (MARKETING, BM, BACK_OFFICE)
- `tbl_menu` + `tbl_role_menu` - menu & permission per role (schema siap, implementasi service/controller belum)
- `tbl_pengajuan` - loan application (state machine)
- `tbl_review_log` - audit trail (siapa review apa kapan)
- `tbl_notifikasi` - notification trigger
- `tbl_bunga_tenor` - interest rate per tenor (snapshot di pengajuan)

### Identified Database Gaps

#### 1. Plafond Management Tables (PERLU DIBUAT)
```sql
CREATE TABLE tbl_plafond (
    id_plafond UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_plafond VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    tipe VARCHAR(50),
    limit_maksimal NUMERIC(18,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE tbl_user_plafond (
    id_user_plafond UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_customer UUID NOT NULL REFERENCES tbl_customer(id_customer),
    id_plafond UUID NOT NULL REFERENCES tbl_plafond(id_plafond),
    limit_efektif NUMERIC(18,2),
    tanggal_daftar TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);
```

**Context**: Saat ini `tbl_customer.plafond` cuma kolom angka tunggal. `tbl_bunga_tenor` itu konsep lain (bunga per tenor, bukan katalog plafond). Perlu 2 tabel baru buat mengelola plafond sebagai entitas + assignment ke customer.

### Loan State Machine (Sudah Implemented Backend)
```
SUBMITTED
  ↓
MARKETING_REVIEW
  ├─ MARKETING_APPROVED
  │   ↓
  │ BM_REVIEW
  │   ├─ BM_APPROVED
  │   │   ↓
  │   │ BACKOFFICE_REVIEW
  │   │   ↓
  │   │ DISBURSED
  │   │
  │   └─ BM_REJECTED
  │
  └─ MARKETING_REJECTED
  
(+ CANCELLED anytime)
```

**Review Log**: Setiap transisi state create entry di `tbl_review_log` dengan `{role_name, action, status_from, status_to, catatan, created_at}`.

**Notification**: Setiap approval/rejection auto-create `tbl_notifikasi` entry untuk customer.

### Dummy Data for Testing
Ada seed data file: `sakuku-dummy-review-data.sql`
- 4 staff (2 marketing, 1 BM, 1 back office)
- 18 customer
- 6 pengajuan per approval bucket (MARKETING_REVIEW, BM_REVIEW, BACKOFFICE_REVIEW)
- Lengkap dengan review_log history
- **All test accounts password**: `Password123!` (bcrypt hash valid untuk login beneran)

### Key Backend Decisions (Sudah Diambil)
1. **Register Staff**: Lewat SUPERADMIN dulu (MVP), bukan self-register
   - Endpoint SUPERADMIN-only ada, self-register kemungkinan added akhir jika requirement resmi minta
2. **Master Data Menu**: DB schema complete (`tbl_menu` + `tbl_role_menu` dengan `can_view/create/update/delete`)
   - Belum: repository/service/controller backend + UI Angular

---

## Frontend (Angular 21): Status & Key Design

### Tech Stack Specifics (PENTING!)

- **Angular**: v21 (NOT v25 - doesn't exist yet in Aug 2026)
- **Signal-based APIs**: `input()`, `output()`, `signal()`, `computed()`, `httpResource()` - **STABLE in v21**
- **Signal Forms**: ⚠️ **Still experimental** - don't use for critical forms yet; stick with Reactive Forms until stable in v22
- **Change Detection**: Zoneless & OnPush - default in v21 new projects
- **Node**: v25
- **IDE**: VSCode (frontend), IntelliJ IDEA (backend)

### Existing Work (Completed)

1. **Customer-Facing Landing Page**: ✅
   - Glassmorphism design, mesh blob ambient, dot-grid overlay
   - Production-ready

2. **Login Page (Staff)**: ✅
   - Form + glass card styling
   - Already connected to backend

3. **Staff Dashboard Layout**: ✅ (started)
   - HTTP interceptor migrated: cookie-based → Bearer token
   - Backend support fallback httpOnly cookie

### Design Pattern Being Built: Queue List + Review Drawer

**Strategy Pattern** + **Container/Presentational Component** split:

**Shared "Dumb" Components**:
- `LoanQueueListComponent` - presentational, doesn't know which role
- `LoanReviewDrawerComponent` - presentational drawer for approve/reject

**Per-Role Strategy Classes** (implement `LoanReviewStrategy` interface):
```typescript
export interface LoanReviewStrategy {
  getQueueEndpoint(): string;
  getActions(pengajuan: Pengajuan): ReviewAction[];
  getStatusLabel(status: string): string;
  onAction(action: ReviewAction, pengajuan: Pengajuan): Observable<void>;
}
```

- `MarketingReviewStrategy`
- `BMReviewStrategy`
- `BackOfficeReviewStrategy`

**Per-Role Container Components**:
- `MarketingQueueComponent` → inject MarketingReviewStrategy → pass to shared queue-list
- `BMQueueComponent` → inject BMReviewStrategy → pass to shared queue-list
- `BackOfficeQueueComponent` → inject BackOfficeReviewStrategy → pass to shared queue-list

**Queue List Reactive Fetching**:
```typescript
readonly strategy = input.required<LoanReviewStrategy>();
protected readonly queue = httpResource<Pengajuan[]>(() => this.strategy().getQueueEndpoint());
```

### Folder Structure (Actual, per 31 Aug 2026)

```
.
├── public/
├── src/
│   ├── app/
│   │   ├── features/
│   │   │   ├── backoffice/
│   │   │   │   └── backoffice-queue/
│   │   │   ├── bm/
│   │   │   │   └── bm-queue/
│   │   │   └── marketing/
│   │   │       └── marketing-queue/
│   │   └── shared/
│   │       ├── components/
│   │       │   ├── loan-queue-list/
│   │       │   └── loan-review-drawer/
│   │       └── models/
│   │           ├── loan-review-strategy.ts
│   │           ├── pengajuan.model.ts
│   │           └── review-action.model.ts
│   └── core/
│       └── interceptors/
│           └── auth.interceptors.ts
```

**Deviations from Original Plan**:
- `core/` is sibling to `app/` (under `src/`), not nested in `src/app/core/`
- Strategy interface: `loan-review-strategy.ts` (not `.interface.ts`)
- Interceptor: `auth.interceptors.ts` (plural)
- Per-role strategy classes likely go inside each `{role}-queue/` folder, not separate folder

### Design Tokens (Source of Truth)

From landing page & login, establish colors globally:

```css
/* Base */
--bg-base: #020617;                    /* slate-950 */
--bg-card: rgba(17, 24, 39, 0.7);      /* slate-900 glass */
--border-subtle: rgba(255, 255, 255, 0.08);

/* Brand */
--accent-primary: #10B981;             /* emerald-500 */
--accent-light: #6EE7B7;               /* emerald-300 / mint */
--accent-dark: #047857;                /* emerald-700 */
--accent-darker: #064e3b;              /* emerald-900 */

/* Text */
--text-primary: #ffffff;
--text-secondary: #94a3b8;             /* slate-400 */
--text-label: #cbd5e1;                 /* slate-300 */
```

### Status Badge Mapping (Already Approved)

For queue list, status → color mapping:
- `MARKETING_REVIEW` → amber (`#eab308`)
- `BM_REVIEW` → cyan (`#38bdf8`)
- `BACKOFFICE_REVIEW` → mint (`#6EE7B7`)
- `DISBURSED` → emerald solid (`#10B981`)
- `REJECTED`/`CANCELLED` → red-400 (`#f87171`)

### Design Philosophy for Dashboard vs Landing Page

**Landing page**: OK to be decorative (mesh blob, heavy blur, animations) - seen once for "wow factor"

**Work pages (queue, drawer)**: Must be **flat & scannable** - brand colors OK, but reduce heavy decorative effects because staff uses it hours/day

CSS for queue/drawer (status badge, table, drawer panel, action buttons) already designed → ready to move to component `.css` files

### Known Frontend Gaps / TODOs

- [ ] Master Data UI (Role/User/Menu management)
- [ ] Login API integration with backend token
- [ ] Queue list fully wired to strategy
- [ ] Drawer approve/reject implementation
- [ ] Form validation
- [ ] Error handling & user feedback
- [ ] Responsive design (mobile)

---

## Key Frontend Decisions (Sudah Diambil)

1. **Landing page staff**: Opsional, not prioritized
2. **Auth**: Dual path (staff vs customer) handled by single JWT filter with role check
3. **Queue/Drawer pattern**: Strategy Pattern for code reuse across 3 roles
4. **Signal Forms**: NOT for critical forms yet (wait for v22)
5. **httpResource()**: OK untuk fetch queue data (stable v21)

---

## FRD (Functional Requirement Document)

**Status**: Section 1-3 complete
- Section 1: Introduction ✅
- Section 2: Tujuan & Success Metrics ✅
- Section 3: Scope/Assumptions ✅
- Section 4+: User Stories, Product Requirements, Business Rules, NFR, Acceptance Criteria, Glossary, Risks & Dependencies - **BELUM**

**Input**: Requirement resmi dari bootcamp sudah lengkap (MVP scope backend/frontend/Android, user roles per role, scoring rubric) → bisa jadi basis User Stories & Product Requirements.

---

## Project Sandbox Companion

**Karyawan Project** (employee management) - dipakai untuk eksperimen pattern sebelum apply ke Saku-Ku.

---

## Communication Style (Important!)

Gaya komunikasi developer Saku-Ku:
- Casual, Bahasa Indonesia campur English
- Prefer step-by-step explanation
- Review kode aktual, bukan contoh abstrak
- Pragmatik: apakah ini solve problema? Jangan over-engineer.

---

## Next Steps (Priority Order)

1. **Backend**: Tulis entity `PlafondEntity` + `UserPlafondEntity` + repository/service (Java)
2. **Frontend**: Implement interface `LoanReviewStrategy` + 3 strategy class + 2 shared component (queue-list, review-drawer)
3. **Backend**: Service/controller buat `tbl_menu`/`tbl_role_menu` (Master Data Menu)
4. **Document**: Lanjutkan FRD: User Stories & Product Requirements
5. **APIs**: Swagger/Postman API docs
6. **Later** (not MVP radar): Redis cache, unit test coverage, CI/CD

---

## Important Reminders for Claude

- **Always check database schema** (db-sakuku.txt) when designing features
- **Respect the state machine** - pengajuan must follow defined transitions
- **Use dummy data** for local testing (password: `Password123!`)
- **Signal Forms**: Stick with Reactive Forms for now
- **Interview with user** on scope questions - pragmatism > over-engineering
- **Backend decisions already made** - check CLAUDE.md to avoid re-deciding
