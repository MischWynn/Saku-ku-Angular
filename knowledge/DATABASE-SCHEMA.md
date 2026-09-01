# Database Schema Reference - Saku-Ku

**Source**: PostgreSQL live database  
**Last Updated**: 2026-08-31

This file is a quick reference for the database structure used by Saku-Ku backend.

---

## Quick Reference: Table Overview

| Table | Purpose | Key Columns |
|-------|---------|------------|
| `tbl_customer` | Loan applicants/borrowers | id_customer, nik, email, plafond |
| `tbl_user` | Staff members | id_user, id_role, username, email |
| `tbl_role` | Role definitions | id_role, nama_role (MARKETING, BM, BACK_OFFICE) |
| `tbl_menu` | Menu items for dashboard | id_menu, nama_menu, path, parent_id |
| `tbl_role_menu` | Permission mapping | id_role, id_menu, can_view/create/update/delete |
| `tbl_pengajuan` | Loan applications | id_pengajuan, id_customer, status, nominal_pengajuan |
| `tbl_review_log` | Audit trail | id_pengajuan, id_user, action, status_from, status_to |
| `tbl_notifikasi` | Notifications | id_notifikasi, id_customer, id_pengajuan, pesan |
| `tbl_bunga_tenor` | Interest rates | id_bunga_tenor, tenor, interest_rate |

---

## Table Details

### 1. tbl_customer
Stores loan applicants (nasabah).

```sql
CREATE TABLE tbl_customer (
    id_customer UUID PRIMARY KEY,
    nama_lengkap VARCHAR(150) NOT NULL,
    nik VARCHAR(16) NOT NULL UNIQUE,
    no_hp VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150),
    alamat TEXT,
    plafond NUMERIC(18,2) NOT NULL DEFAULT 0,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Note**: `plafond` column is just a single number. See [[#Gap: Plafond Management]] for proper plafond tracking.

---

### 2. tbl_user
Stores staff members (marketing, BM, back office).

```sql
CREATE TABLE tbl_user (
    id_user UUID PRIMARY KEY,
    id_role UUID NOT NULL REFERENCES tbl_role(id_role),
    nama_lengkap VARCHAR(150) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 3. tbl_role
Role definitions (MARKETING, BM, BACK_OFFICE + SUPERADMIN).

```sql
CREATE TABLE tbl_role (
    id_role UUID PRIMARY KEY,
    nama_role VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial roles:
INSERT INTO tbl_role (nama_role, description) VALUES
    ('MARKETING', 'Marketing officer yang melakukan review pengajuan'),
    ('BM', 'Branch Manager yang melakukan approval'),
    ('BACK_OFFICE', 'Back Office yang melakukan proses pencairan');
```

---

### 4. tbl_menu
Menu items shown in dashboard (hierarchical, parent_id for nesting).

```sql
CREATE TABLE tbl_menu (
    id_menu UUID PRIMARY KEY,
    nama_menu VARCHAR(100) NOT NULL,
    path VARCHAR(255),
    icon VARCHAR(100),
    parent_id UUID REFERENCES tbl_menu(id_menu),
    urutan INTEGER DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Note**: Menu hierarchy + permission assignment already designed, waiting for implementation.

---

### 5. tbl_role_menu
Maps roles to menus with granular permissions.

```sql
CREATE TABLE tbl_role_menu (
    id_role_menu UUID PRIMARY KEY,
    id_role UUID NOT NULL REFERENCES tbl_role(id_role) ON DELETE CASCADE,
    id_menu UUID NOT NULL REFERENCES tbl_menu(id_menu) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT FALSE,
    can_create BOOLEAN DEFAULT FALSE,
    can_update BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_role, id_menu)
);
```

**Usage**: When displaying menu, filter by `can_view = true` for current user's role. When user performs action, check `can_create/update/delete`.

---

### 6. tbl_pengajuan
Loan applications. **Core table for loan state machine.**

```sql
CREATE TABLE tbl_pengajuan (
    id_pengajuan UUID PRIMARY KEY,
    id_customer UUID NOT NULL REFERENCES tbl_customer(id_customer),
    id_bunga_tenor UUID NOT NULL REFERENCES tbl_bunga_tenor(id_bunga_tenor),
    
    nominal_pengajuan NUMERIC(18,2) NOT NULL,
    tenor INTEGER NOT NULL,                      -- snapshot
    interest_rate NUMERIC(7,4) NOT NULL,         -- snapshot
    
    nominal_disetujui NUMERIC(18,2),             -- filled when BM approves
    
    status VARCHAR(30) CHECK (status IN (
        'SUBMITTED',
        'MARKETING_REVIEW', 'MARKETING_APPROVED', 'MARKETING_REJECTED',
        'BM_REVIEW', 'BM_APPROVED', 'BM_REJECTED',
        'BACKOFFICE_REVIEW', 'DISBURSED',
        'CANCELLED'
    )),
    
    tanggal_pengajuan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Constraints**:
- `nominal_disetujui <= nominal_pengajuan` (approved can't be more than requested)
- `nominal_disetujui` filled only when BM approves

**State Transitions** (enforced by backend):
```
SUBMITTED → MARKETING_REVIEW
MARKETING_REVIEW → MARKETING_APPROVED | MARKETING_REJECTED
MARKETING_APPROVED → BM_REVIEW
BM_REVIEW → BM_APPROVED | BM_REJECTED
BM_APPROVED → BACKOFFICE_REVIEW
BACKOFFICE_REVIEW → DISBURSED | CANCELLED
```

---

### 7. tbl_review_log
**Audit trail**. Every approval/rejection creates an entry here.

```sql
CREATE TABLE tbl_review_log (
    id_review_log UUID PRIMARY KEY,
    id_pengajuan UUID NOT NULL REFERENCES tbl_pengajuan(id_pengajuan) ON DELETE CASCADE,
    id_user UUID NOT NULL REFERENCES tbl_user(id_user),
    
    role_name VARCHAR(50) NOT NULL,              -- snapshot of reviewer's role
    action VARCHAR(30) CHECK (action IN (
        'SUBMIT', 'APPROVE', 'REJECT', 'REVIEW', 'DISBURSE', 'CANCEL'
    )),
    
    status_from VARCHAR(30),                     -- previous status
    status_to VARCHAR(30),                       -- new status
    
    catatan TEXT,                                -- reviewer's notes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Used for**: Audit trail display in UI, history tracking, compliance.

**Automatic**: Backend creates entry on every state change.

---

### 8. tbl_notifikasi
Notifications sent to customers (push, email, etc.).

```sql
CREATE TABLE tbl_notifikasi (
    id_notifikasi UUID PRIMARY KEY,
    id_customer UUID NOT NULL REFERENCES tbl_customer(id_customer) ON DELETE CASCADE,
    id_pengajuan UUID REFERENCES tbl_pengajuan(id_pengajuan) ON DELETE SET NULL,
    
    judul VARCHAR(150) NOT NULL,
    pesan TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Automatic**: Backend creates entry when pengajuan status changes (approval, rejection, disbursement).

---

### 9. tbl_bunga_tenor
Interest rate per tenor (6mo, 12mo, 18mo, 24mo).

```sql
CREATE TABLE tbl_bunga_tenor (
    id_bunga_tenor UUID PRIMARY KEY,
    tenor INTEGER NOT NULL UNIQUE,
    interest_rate NUMERIC(7,4) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial data:
INSERT INTO tbl_bunga_tenor (tenor, interest_rate) VALUES
    (6, 5.0000),
    (12, 8.0000),
    (18, 10.0000),
    (24, 12.0000);
```

**Snapshot**: When pengajuan is created, `tenor` and `interest_rate` copied to `tbl_pengajuan` (immutable history).

---

## Database Gaps (Not Yet Implemented)

### Gap 1: Plafond Management

**Problem**: Currently, `tbl_customer.plafond` is just a single number. No way to:
- Define plafond catalogs/tiers
- Track plafond assignment per customer
- Track plafond consumption
- Manage plafond history

**Solution**: Add 2 tables:

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

**Status**: ⏳ TODO - Backend needs to implement this

---

## Indexes (for performance)

Already created:
- `idx_pengajuan_customer` on `tbl_pengajuan(id_customer)`
- `idx_pengajuan_status` on `tbl_pengajuan(status)`
- `idx_pengajuan_tanggal` on `tbl_pengajuan(tanggal_pengajuan)`
- `idx_review_pengajuan` on `tbl_review_log(id_pengajuan)`
- `idx_review_user` on `tbl_review_log(id_user)`
- `idx_review_created` on `tbl_review_log(created_at)`
- `idx_notifikasi_customer` on `tbl_notifikasi(id_customer)`
- `idx_notifikasi_unread` on `tbl_notifikasi(id_customer, is_read)`

---

## Testing Data

**Seed file**: `sakuku-dummy-review-data.sql`

Contains:
- 4 staff (2 marketing, 1 BM, 1 back office)
- 18 customers
- 6 pengajuan per approval bucket (MARKETING_REVIEW, BM_REVIEW, BACKOFFICE_REVIEW)
- Full review_log history

**Login credentials** (all accounts):
- Username: [various]
- Password: `Password123!`

---

## Key Relationships (Visual)

```
tbl_customer
  ↓ (many) --has--> pengajuan (one)
  ↓ (one) <--receives-- tbl_notifikasi
  ↓ (one) <--tracks-- tbl_user_plafond [FUTURE]

tbl_user
  ↓ (many) --has-role--> tbl_role (one)
  ↓ (many) --creates--> tbl_review_log (one)

tbl_role
  ↓ (many) --permits--> tbl_role_menu (many)
  ↓ (many) --to--> tbl_menu (many)

tbl_pengajuan
  ↓ (one) --snaps--> tbl_bunga_tenor
  ↓ (one) --reviewed-in--> tbl_review_log
  ↓ (one) --triggers--> tbl_notifikasi
```

---

## Notes for Frontend Developers

1. **Query pengajuan**: Expect `status` to be one of the state machine values
2. **Display reviewer info**: Get from `tbl_review_log.id_user` → join with `tbl_user` to show reviewer name
3. **Track approval history**: Query `tbl_review_log` for a pengajuan, sorted by `created_at`
4. **Permission checking**: Frontend can suggest UI elements based on role, but **always validate on backend** (never trust frontend permission check alone)
5. **Notification**: Pengajuan status changes auto-create `tbl_notifikasi` rows for customers
6. **Tenor/Interest snapshot**: Don't query `tbl_bunga_tenor` for display - use values already in `tbl_pengajuan.tenor` and `tbl_pengajuan.interest_rate`

---

## Commands (for reference)

**Dump schema** (if you need to update this file):
```bash
pg_dump -h localhost -U user -d sakuku --schema-only > sakuku-schema.sql
```

**Seed dummy data**:
```bash
psql -h localhost -U user -d sakuku < sakuku-dummy-review-data.sql
```

**Check current data** (basic queries):
```sql
SELECT COUNT(*) FROM tbl_customer;                   -- see how many customers
SELECT COUNT(*) FROM tbl_pengajuan WHERE status = 'MARKETING_REVIEW';  -- pending review
SELECT * FROM tbl_review_log WHERE id_pengajuan = '[uuid]' ORDER BY created_at DESC;
```
