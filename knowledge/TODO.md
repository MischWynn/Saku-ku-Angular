# TODO.md - Project Progress Tracker

**Project**: Sakuku Loan Management System  
**Last Updated**: 2026-08-31  
**Progress**: Phase 1 (Auth + Basic Queue) - ~40% Complete

---

## Overview

| Phase | Status | Target Date |
|-------|--------|-------------|
| Phase 1: Auth + Loan Queue | 🔄 In Progress | 2026-09-14 |
| Phase 2: Approval Workflow | ⏳ Planned | 2026-09-28 |
| Phase 3: Plafond + Admin | ⏳ Planned | 2026-10-12 |
| Phase 4: Polish & Launch | ⏳ Planned | 2026-10-26 |

---

## Phase 1: Authentication & Basic Loan Queue (Current)

### Authentication (70% Complete)
- [x] Login form component created
- [x] AuthService with basic login (email/password)
- [x] RoleGuard for route protection
- [x] Auth interceptor for request credentials
- [x] localStorage for role persistence
- [ ] **Token Refresh Logic** - BLOCKED: Needs backend refresh endpoint
- [ ] **Session Validation** - TODO: Validate role on app bootstrap
- [ ] **Auth0 Full Integration** - TODO: Replace email/password with Auth0 OAuth2
- [ ] **Logout Functionality** - TODO: Clear tokens and redirect

### Loan Queue Display (60% Complete)
- [x] LoanQueueService created
- [x] LoanApplication model/interface defined
- [x] Loan queue list component (basic table)
- [x] Loan review drawer component skeleton
- [ ] **Loan List Pagination** - TODO: Paginate large loan lists
- [ ] **Loan Search/Filter** - TODO: Filter by status, amount, date
- [ ] **Loan Details** - TODO: Show full loan application details
- [ ] **Real-time Updates** - TODO: WebSocket for live status changes

### Role-Based Dashboards (40% Complete)
- [x] DashboardLayout component with sidebar
- [x] Marketing dashboard route
- [x] Superadmin dashboard route
- [x] Branchmanager dashboard route
- [x] Backoffice dashboard route
- [ ] **Superadmin Overview** - TODO: Statistics, KPIs, system health
- [ ] **Marketing Dashboard** - TODO: Quota, plafond info, pending approvals
- [ ] **Branchmanager Dashboard** - TODO: Branch-specific statistics
- [ ] **Backoffice Dashboard** - TODO: Approval queue, SLA tracking

### UI/UX (50% Complete)
- [x] Tailwind CSS configured
- [x] Basic styling with utility classes
- [x] Lucide Angular icons available
- [ ] **Responsive Design** - TODO: Test on mobile/tablet
- [ ] **Accessibility** - TODO: ARIA labels, keyboard navigation
- [ ] **Dark Mode** - TODO: Optional dark theme support
- [ ] **Loading States** - TODO: Spinners for async operations
- [ ] **Error States** - TODO: Error messages and recovery UI

---

## Phase 2: Approval Workflow & Audit Logging

### Approval Workflow
- [ ] Approve loan button functionality
- [ ] Reject loan button functionality
- [ ] Comment/reason field for rejections
- [ ] Approval status transitions (pending → approved/rejected)
- [ ] Escalation paths (Marketing → Branch → Backoffice)
- [ ] SLA tracking (time in each approval stage)

### Audit & Logging
- [ ] Audit log model (who, what, when, why)
- [ ] Log every approval/rejection
- [ ] Store approval comments
- [ ] View audit history for each loan
- [ ] Export audit logs (CSV/PDF)

### Backend Integration
- [ ] Define API contract with backend team
- [ ] PUT /api/v1/loans/{id}/approve endpoint
- [ ] PUT /api/v1/loans/{id}/reject endpoint
- [ ] GET /api/v1/loans/{id}/audit-log endpoint
- [ ] Handle approval conflicts (concurrent approvals)

---

## Phase 3: Plafond Management & Admin Features

### Plafond (Credit Limit) Management
- [ ] View current plafond by marketing manager
- [ ] View plafond consumption
- [ ] Update plafond (admin only)
- [ ] Plafond history/audit trail
- [ ] Alert when plafond low

### User Role Management (Admin)
- [ ] List all users
- [ ] Create new user
- [ ] Update user role
- [ ] Deactivate/delete user
- [ ] User activity log

### Admin Dashboard
- [ ] System statistics
- [ ] Approval metrics (avg time, approval rate)
- [ ] User activity
- [ ] System health

### Simulation Calculator Enhancement
- [ ] Integration with loan form
- [ ] Interest rate calculation
- [ ] Repayment schedule generation
- [ ] Save simulation history

---

## Phase 4: Polish, Testing & Launch Prep

### Testing
- [ ] Unit tests for all services (90%+ coverage)
- [ ] Component tests for critical UI (60%+ coverage)
- [ ] Integration tests for workflows
- [ ] E2E tests for approval flow
- [ ] Performance testing (load testing)

### Security Review
- [ ] OWASP Top 10 review
- [ ] XSS vulnerability scan
- [ ] CSRF token implementation
- [ ] SQL injection prevention (API level)
- [ ] Secrets management review
- [ ] Penetration testing

### Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] User manual/guide
- [ ] Developer setup guide
- [ ] Deployment guide
- [ ] Troubleshooting guide

### Performance Optimization
- [ ] Bundle size optimization
- [ ] Lazy loading verification
- [ ] Tree-shaking unused code
- [ ] Image optimization
- [ ] HTTP caching strategy

### DevOps & Deployment
- [ ] CI/CD pipeline setup
- [ ] Staging environment
- [ ] Production environment
- [ ] Rollback procedures
- [ ] Monitoring & alerting

---

## Bug Tracker

### Critical (Blocking Release)
| Bug | Status | Assigned | Notes |
|-----|--------|----------|-------|
| Token refresh not implemented | 🔴 Open | TBD | No mechanism to refresh expired tokens |
| Session lost on page refresh | 🔴 Open | TBD | Role persists but should be re-validated |

### High (Should Fix Soon)
| Bug | Status | Assigned | Notes |
|-----|--------|----------|-------|
| Auth0 incomplete | 🔴 Open | TBD | Should use Auth0 instead of email/password |
| No error handling for failed API calls | 🔴 Open | TBD | Generic error messages needed |

### Medium (Can Fix Later)
| Bug | Status | Assigned | Notes |
|-----|--------|----------|-------|
| Loan list not paginated | 🟡 Open | TBD | Loads all loans at once |
| No loading indicators | 🟡 Open | TBD | User doesn't know when data is loading |

---

## Dependencies & Blockers

### Blocked By Backend
- [ ] Token refresh endpoint
- [ ] API error format specification
- [ ] Approval workflow endpoints
- [ ] Audit log endpoints

### Blocked By Design/Product
- [ ] Final approval workflow specification
- [ ] Plafond calculation rules
- [ ] SLA targets per approval stage

### Blocked By Infrastructure
- [ ] Staging environment setup
- [ ] Database schema finalization
- [ ] Auth0 configuration

---

## Code Quality & Refactoring

### Refactoring Needed
| Task | Priority | Details |
|------|----------|---------|
| Consolidate duplicate services | Medium | RecipeService, UsersService have overlaps |
| Remove commented code | Low | Clean up old/unused code |
| Type Safety | High | Replace `any` types with proper interfaces |
| Error Handling | High | Centralized error handling service needed |

### Technical Debt
- No centralized logging service
- No state management (OK for MVP, may need NgRx later)
- Component tests incomplete
- E2E tests missing

---

## Notes & Observations

### 2026-08-31 - Initial Setup
- Created CLAUDE.md, ARCHITECTURE.md, PRD.md
- Analyzed existing codebase
- Routes, guards, and basic auth flow are good foundation
- Main blockers: Token refresh, session validation, backend API contract

### Known Assumptions
- Backend follows REST conventions
- All validation happens on backend
- Users have stable internet (no offline mode)
- Firefox/Chrome/Safari only (no IE support)

---

## How to Update This File

When completing a task:
1. Change status from `[ ]` to `[x]`
2. Update corresponding **Phase Progress %** above
3. Add note in **Notes & Observations** section
4. Link related bug/dependency if applicable
5. Update `Last Updated` date

**Format**: Keep markdown clean, use consistent checkbox/status icons:
- `[ ]` = Not started
- `🟡` = In progress
- `[x]` / `✅` = Complete
- `🔴` = Blocked/Critical
- `⏳` = Planned/Waiting
