# ARCHITECTURE.md - Technical Implementation Plan

**Project**: Sakuku Loan Management System  
**Platform**: Angular 21 Frontend  
**Last Updated**: 2026-08-31

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Client                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Angular 21 SPA Application                  │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │  Pages      │  │  Shared      │  │  Features  │ │  │
│  │  │ (Auth,      │  │  Components  │  │  (Queues,  │ │  │
│  │  │  Dashboards)│  │  (Loan Queue,│  │   Approval)│ │  │
│  │  │             │  │   Drawer)    │  │            │ │  │
│  │  └─────────────┘  └──────────────┘  └────────────┘ │  │
│  │         ↓              ↓                ↓           │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │      Core Services (DI at root)             │  │  │
│  │  │  • AuthService                              │  │  │
│  │  │  • LoanQueueService                         │  │  │
│  │  │  • UsersService                             │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │         ↓              ↓                           │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │    HTTP + Interceptors + Guards             │  │  │
│  │  │  • Auth Interceptor (credentials)           │  │  │
│  │  │  • RoleGuard (route protection)             │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↓ HTTP ↓                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│           Backend API (http://localhost:8080)              │
│  /api/v1/user/login                                       │
│  /api/v1/loans (GET list, POST create)                    │
│  /api/v1/loans/{id} (GET, PUT, DELETE)                    │
│  /api/v1/loans/{id}/approve                               │
│  /api/v1/loans/{id}/reject                                │
│  /api/v1/users                                            │
│  /api/v1/plafond                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Folder Structure & Responsibilities

```
src/app/
├── core/                          # Business logic & infrastructure
│   ├── services/
│   │   ├── auth.service.ts       # Login, token management
│   │   ├── loan-queue.service.ts # Loan operations
│   │   ├── users.service.ts      # User management
│   │   └── recipe.service.ts     # (Review & consolidate)
│   ├── guards/
│   │   └── auth.guards.ts        # roleGuard(['role'])
│   ├── interceptors/
│   │   └── auth.interceptor.ts   # Add credentials to requests
│   ├── models/
│   │   ├── auth.dto.ts           # Login request/response types
│   │   └── loan-application.ts   # Loan entity interface
│   └── review-log.config.ts      # Audit log configuration
│
├── pages/                         # Full-page route components
│   ├── auth/
│   │   └── login/                # Login form
│   ├── superadmin/
│   │   ├── overview/             # Dashboard
│   │   ├── pengajuan/            # Application list
│   │   ├── approval/             # Approve/reject
│   │   └── roles/                # User role management
│   ├── marketing/
│   │   ├── dashboard/
│   │   ├── plafond/              # Credit limit management
│   │   └── review-pinjaman/      # Loan review
│   ├── branchmanager/
│   │   └── (similar to marketing)
│   ├── backoffice/
│   │   └── (final approval authority)
│   └── landingpage/
│
├── layout/                        # Shared layout wrappers
│   ├── dashboard-layout/          # Sidebar + nav for admin roles
│   ├── customer-navbar/           # Public navbar
│   ├── customer-home/             # Landing page
│   └── (sidebar, navbar, footer)
│
├── features/                      # Feature-specific components
│   ├── marketing/
│   │   └── marketing-queue/
│   ├── branch-manager/
│   │   └── bm-queue/
│   └── backoffice/
│       └── bo-queue/
│
├── shared/                        # Reusable components
│   └── components/
│       ├── loan-queue-list/       # Displays loans in table
│       └── loan-review-drawer/    # Approve/reject modal
│
├── app.ts                         # Root component
├── app.routes.ts                  # Route definitions
├── app.config.ts                  # Bootstrap config
└── app.html / app.css
```

---

## Data Flow Diagrams

### Login Flow

```
User Input
   ↓
LoginComponent
   ↓
AuthService.login(credentials)
   ↓
POST /api/v1/user/login
   ↓
Backend returns {token, role, user}
   ↓
localStorage.setItem('userRole', role)
   ↓
Router.navigate(['/marketing']) [or other dashboard]
```

### Loan Approval Workflow

```
LoanQueueComponent (displays loans)
   ↓
User clicks "Review" → LoanReviewDrawer opens
   ↓
User clicks "Approve"
   ↓
Component emits event → Parent component
   ↓
Parent calls LoanQueueService.approveLoan(loanId)
   ↓
PUT /api/v1/loans/{id}/approve
   ↓
Backend updates status + audit log
   ↓
Component refreshes list
   ↓
Toast notification "Approved successfully"
```

---

## Component Interaction Map

### Superadmin Dashboard
```
DashboardLayout (layout + sidebar)
├── Overview (statistics)
├── Pengajuan (all applications)
│   └── LoanQueueList (table of loans)
│       └── LoanReviewDrawer (approve/reject)
├── Approval (pending approvals)
│   └── LoanQueueList
│       └── LoanReviewDrawer
└── Roles (user management)
```

### Marketing Dashboard
```
DashboardLayout
├── Dashboard (statistics, quota info)
├── Plafond (manage credit limits)
└── ReviewPinjaman (loans to review)
    └── LoanQueueList
        └── LoanReviewDrawer
```

---

## Key Services & Their Contracts

### AuthService
```typescript
// Location: src/app/core/services/auth.service/auth.service.ts

login(credentials: {email, password}): Observable<{token, role, user}>
// POST /api/v1/user/login

logout(): void
// Clear localStorage['userRole']

getCurrentRole(): string | null
// Read from localStorage
```

### LoanQueueService
```typescript
// Location: src/app/core/services/loan-queue.service.ts

getLoans(): Observable<LoanApplication[]>
// GET /api/v1/loans

getLoan(id: string): Observable<LoanApplication>
// GET /api/v1/loans/{id}

approveLoan(id: string, comment: string): Observable<void>
// PUT /api/v1/loans/{id}/approve

rejectLoan(id: string, reason: string): Observable<void>
// PUT /api/v1/loans/{id}/reject

updateLoan(id: string, data: Partial<LoanApplication>): Observable<LoanApplication>
// PUT /api/v1/loans/{id}
```

### UsersService
```typescript
getUsers(): Observable<User[]>
// GET /api/v1/users

updateUserRole(userId: string, role: string): Observable<User>
// PUT /api/v1/users/{id}/role
```

---

## Data Models

### LoanApplication (Core Domain Entity)
```typescript
interface LoanApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  phone: string;
  idNumber: string;
  
  requestedAmount: number;           // in IDR
  loanType: 'personal' | 'business' | 'home';
  loanTerm: number;                  // months
  interestRate: number;              // %
  
  status: 'pending' | 'marketing_review' | 'branch_review' | 
          'backoffice_review' | 'approved' | 'rejected' | 'disbursed';
  
  currentApprover: string;           // User ID of current approval level
  approvalHistory: ApprovalLog[];
  
  createdAt: Date;
  updatedAt: Date;
  submittedBy: string;               // User ID
}

interface ApprovalLog {
  approvedBy: string;                // User name
  action: 'approved' | 'rejected';
  comment: string;
  timestamp: Date;
}
```

### AuthResponse
```typescript
interface AuthResponseDTO {
  token: string;
  role: 'superadmin' | 'marketing' | 'branchmanager' | 'backoffice';
  user: {
    id: string;
    email: string;
    name: string;
  };
  expiresIn: number;                 // seconds
}
```

---

## Routing Structure

```
/ (public)
├── / → CustomerHome (landing page)
└── /login → LoginComponent

/marketing (protected, role: marketing)
├── /marketing/ → Dashboard
├── /marketing/dashboard → Dashboard
├── /marketing/plafond → Plafond Management
└── /marketing/review-pinjaman → ReviewPinjaman

/admin (protected, role: superadmin)
├── /admin/overview → Overview
├── /admin/pengajuan → Pengajuan (all apps)
├── /admin/approval → Approval (pending)
└── /admin/roles → Roles Management

/branchmanager (protected, role: branchmanager)
└── /branchmanager/review-pinjaman → ReviewPinjaman

/backoffice (protected, role: backoffice)
└── /backoffice/review-pinjaman → ReviewPinjaman

** → redirect to /
```

---

## Integration Points

### 1. Backend API Contract (TBD - needs specification)
- Base URL: `http://localhost:8080/api/v1/`
- Auth method: Bearer token in Authorization header
- Error format: `{error: string, code: string, timestamp: string}`

### 2. Auth0 Integration (In Progress)
- Currently: Email/password via custom backend
- Goal: Replace with Auth0 OAuth2 flow
- Status: Partially configured, needs completion

### 3. Database (Backend Only)
- PostgreSQL assumed
- Loan, User, Plafond, AuditLog tables
- Frontend doesn't access DB directly

---

## State Management Strategy

**Current**: Component-level state + Service-level observables  
**Tool**: RxJS Observables  
**No NgRx/Akita yet** (can be added if complexity increases)

### Why:
- Simpler for current scope
- Less boilerplate
- Easy to understand
- Can migrate to NgRx v2 if needed

### How:
```typescript
// Service provides observable
@Injectable({providedIn: 'root'})
export class LoanQueueService {
  private loansSubject = new BehaviorSubject<LoanApplication[]>([]);
  loans$ = this.loansSubject.asObservable();
  
  loadLoans() {
    this.http.get<LoanApplication[]>('/api/v1/loans')
      .subscribe(loans => this.loansSubject.next(loans));
  }
}

// Component subscribes
export class LoanQueueList {
  loans$ = inject(LoanQueueService).loans$;
}
```

---

## Performance Considerations

### Bundle Size
- Lazy-load feature routes
- Tree-shake unused code
- Monitor bundle: `ng build --stats-json`

### Network
- Paginate large loan lists
- Debounce search/filter
- Cache frequently accessed data (users, roles)

### Rendering
- Use OnPush change detection for complex components
- Virtual scroll for large lists
- Avoid frequent DOM queries

---

## Security Architecture

### Authentication
- ✅ Auth0 JWT tokens (goal)
- ✅ Token stored in memory (not localStorage for sensitive data)
- ⏳ Token refresh logic

### Authorization
- ✅ Route guards (roleGuard)
- ⏳ Endpoint-level guards for sensitive operations
- ⏳ Audit logging of all approvals

### Data Protection
- ✅ HTTPS required
- ✅ Auth interceptor on all requests
- ⏳ Sanitize user input
- ⏳ CSRF tokens if needed

---

## Testing Strategy

### Unit Tests (Services)
- Mock HTTP calls
- Test business logic
- Coverage: 90%+

### Component Tests
- Test user interactions
- Test data binding
- Mock services
- Coverage: 60%+

### E2E Tests (Future)
- Test full workflows
- Test multi-role scenarios
- Browser compatibility

---

## Deployment & Environments

### Development
- `npm start` → localhost:4200
- Backend: localhost:8080
- Environment: `environment.development.ts`

### Production
- `npm run build:prod`
- Environment: `environment.ts`
- API: `https://api.sakuku.id` (TBD)

### Environment Config
```typescript
// environment.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.sakuku.id/api/v1',
  auth0Domain: 'sakuku.auth0.com',
  auth0ClientId: 'xxx'
};
```

---

## Known Technical Debt

1. **Auth Token Refresh**: No mechanism to refresh expired tokens
2. **Session Validation**: Role not re-validated on page refresh
3. **Error Handling**: Generic error messages, needs improvement
4. **Type Safety**: Some `any` types should be replaced with proper interfaces
5. **Shared Services**: RecipeService and other duplicate services should be consolidated
6. **Backend API**: Not fully specified—needs OpenAPI/Swagger contract
7. **E2E Tests**: No E2E tests yet
8. **Logging**: No centralized logging service

---

## Future Enhancements (Not MVP)

1. **State Management**: Migrate to NgRx for complex state
2. **Real-time Updates**: WebSocket for live loan updates
3. **Mobile App**: React Native or Flutter
4. **Analytics**: Tableau/Metabase integration
5. **Automation**: Rules engine for auto-approval
6. **Notifications**: Email/SMS alerts
7. **API Documentation**: OpenAPI/Swagger UI
8. **Load Testing**: Support 10K+ concurrent users

---

## Success Criteria for Implementation

- [ ] All routes protected by roleGuard
- [ ] Loan approval workflow end-to-end functional
- [ ] Audit log for every approval/rejection
- [ ] 90%+ service test coverage
- [ ] No type errors (strict TypeScript)
- [ ] Page load time < 3s
- [ ] Security review passed
- [ ] Ready for beta testing
