# PRD - Saku-Ku Fintech Platform

**Project Name**: Saku-Ku (Indonesian for "My Wallet")  
**Type**: Capstone Project - Loan Management & Approval Workflow Platform  
**Bootcamp**: Binar Academy (Agustus-September 2026)  
**Status**: MVP Phase - Web Dashboard Staff (Angular)  
**Last Updated**: 2026-08-31

**Note**: This is the **Web Dashboard (Staff)** layer of the broader Saku-Ku platform (also includes Spring Boot backend & Kotlin Android app)

---

## Problem Statement

Loan approval processes in Indonesia are typically slow, fragmented, and involve multiple stakeholders (superadmin, marketing, branch managers, backoffice staff). There's no unified platform for:
- Tracking loan applications through approval pipeline
- Managing role-specific dashboards and workflows
- Controlling credit plafond (credit limits) by marketing
- Enabling transparent, auditable approval processes

**Sakuku solves this** by providing a centralized, role-based platform for managing the entire loan lifecycle.

---

## Target Users

1. **Superadmin**
   - Oversees entire system
   - Manages user roles and permissions
   - Reviews high-level approvals
   - Manages plafond allocations

2. **Marketing Team**
   - Creates/submits loan applications
   - Manages plafond (credit limits)
   - Reviews customer eligibility
   - Submits loans for further approval

3. **Branch Managers**
   - Reviews loan applications from their branch
   - Can approve/reject at branch level
   - Escalates to backoffice if needed

4. **Backoffice/Credit Team**
   - Final approval authority
   - Reviews all criteria
   - Approves or rejects loans
   - Maintains audit logs

---

## Core Features (MVP)

### Authentication & Authorization
- ✅ Login with email/password
- ✅ Role-based access control (RBAC)
- ⏳ Auth0 integration (in progress)
- ⏳ Token refresh on session expiry

### Loan Application Management
- ✅ Display loan queue by role
- ⏳ Create new loan application
- ⏳ Update loan status
- ⏳ View loan details/history

### Approval Workflow
- ✅ Role-specific dashboards
- ⏳ Approve/reject functionality with comments
- ⏳ Audit logging (who approved/rejected, when, why)
- ⏳ Escalation paths

### Marketing Features
- ⏳ Plafond management (set credit limits)
- ⏳ Plafond consumption tracking
- ⏳ Customer eligibility check

### Admin Features
- ⏳ User role management
- ⏳ System monitoring dashboard
- ⏳ Approval policies configuration
- ⏳ Audit logs viewer

### Loan Simulation
- ✅ Basic simulation calculator (component exists)
- ⏳ Interest rate calculations
- ⏳ Repayment schedule generator

---

## Out of Scope (v1)

- Mobile app (web-only for MVP)
- API documentation/developer portal
- Multi-language support (Indonesian only)
- Advanced analytics/reporting
- Loan disbursement management
- Customer self-service portal
- SMS/email notifications (basic logging only)
- Integration with third-party banking APIs
- KYC/AML compliance (assumed backend handles)

---

## Success Criteria

### Technical
- All core workflows functional
- 90%+ test coverage on services
- Performance: Page load < 3s
- Zero critical security issues

### Business
- Reduce approval time by 50% vs manual process
- Zero data loss during approval workflow
- 100% audit trail for compliance
- Support 10,000+ concurrent users (scaling concern for v2)

---

## Tech Stack

- **Frontend**: Angular 21, Tailwind CSS v4
- **Backend**: Node.js/Spring Boot (assumed, not in scope)
- **Auth**: Auth0
- **Database**: PostgreSQL (backend, not frontend concern)
- **Hosting**: TBD
- **Testing**: Vitest + Jasmine

---

## Architecture Approach

- Standalone Angular components (no NgModules)
- Lazy-loaded feature routes
- Centralized service layer with dependency injection
- RxJS for async operations
- localStorage for role-based access (interim solution)

---

## Risks & Assumptions

### Risks
- Auth0 integration incomplete—token refresh needed
- No session validation on page refresh
- Backend API not yet fully specified
- Role permissions hardcoded in frontend (should be backend-driven)

### Assumptions
- Backend provides REST APIs following this contract
- All data validation happens on backend
- Users have stable internet connection
- Firefox/Chrome/Safari browser support sufficient

---

## Timeline (Estimated)

- **Phase 1 (Current)**: Core auth + basic loan queue (2-4 weeks)
- **Phase 2**: Approval workflows + audit logs (3-4 weeks)
- **Phase 3**: Plafond management + admin features (2-3 weeks)
- **Phase 4**: Polish, security review, launch prep (1-2 weeks)

---

## Next Steps

1. Complete Auth0 integration
2. Finalize backend API contract
3. Implement approve/reject workflow
4. Add audit logging
5. Security review before launch
