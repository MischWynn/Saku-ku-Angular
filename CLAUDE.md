# CLAUDE.md - Angular Challenge Project

This file provides project-specific guidance to Claude Code when working with the Sakuku Loan Management System (Angular).

## Quick Reference

- **Framework**: Angular 21 (standalone components)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Testing**: Vitest + Jasmine
- **Auth**: Auth0 integration + localStorage role-based access
- **Package Manager**: npm 11.6.2
- **Node Version**: 18+ recommended
- **API Base**: `http://localhost:8080/api/v1/`

## Development Commands

```bash
# Start dev server (http://localhost:4200)
npm start

# Serve production build
npm run start:prod

# Build for production
npm run build

# Build for development
npm run build:dev

# Watch mode (rebuild on file changes)
npm run watch

# Run tests
npm test

# Format code
npx prettier --write .
```

## Project Architecture

### Overall Structure

```
src/
├── app/
│   ├── core/                    # Business logic & infrastructure
│   │   ├── services/            # API services
│   │   │   ├── auth.service/
│   │   │   ├── loan-queue.service/
│   │   │   ├── users.service/
│   │   │   └── recipe.service/
│   │   ├── guards/              # Route protection
│   │   │   └── auth.guards.ts   # roleGuard(['role1', 'role2'])
│   │   ├── interceptors/        # HTTP interceptors
│   │   │   └── auth.interceptor/
│   │   └── models/              # DTOs & Interfaces
│   │       ├── auth.dto/
│   │       └── loan-application.ts
│   │
│   ├── pages/                   # Page components (one per route)
│   │   ├── auth/
│   │   │   └── login/
│   │   ├── superadmin/
│   │   │   ├── overview/
│   │   │   ├── pengajuan/
│   │   │   ├── approval/
│   │   │   └── roles/
│   │   ├── marketing/
│   │   │   ├── dashboard/
│   │   │   ├── plafond/
│   │   │   └── review-pinjaman/
│   │   ├── branchmanager/
│   │   ├── backoffice/
│   │   └── landingpage/
│   │
│   ├── layout/                  # Shared layout components
│   │   ├── dashboard-layout/    # Sidebar layout for admin roles
│   │   ├── customer-navbar/     # Public navbar
│   │   ├── customer-home/       # Landing page
│   │   ├── navbar/
│   │   ├── sidebar/
│   │   └── simulation-calculator/
│   │
│   ├── features/                # Feature-specific components
│   │   ├── marketing/
│   │   │   └── marketing-queue/
│   │   ├── branch-manager/
│   │   │   └── bm-queue/
│   │   └── backoffice/
│   │       └── bo-queue/
│   │
│   ├── shared/                  # Reusable components
│   │   └── components/
│   │       ├── loan-queue-list/
│   │       └── loan-review-drawer/
│   │
│   ├── app.ts                   # Root component
│   ├── app.routes.ts            # All route definitions
│   ├── app.config.ts            # App bootstrap config
│   ├── app.html / app.css
│   └── ...
│
├── environments/                # Environment configs
│   ├── environment.ts
│   └── environment.development.ts
│
├── main.ts                      # Bootstrap entry point
├── styles.css                   # Global Tailwind styles
└── index.html
```

### Key Architectural Decisions

1. **Standalone Components Only**
   - No NgModules anywhere
   - Each component declares its own imports
   - Services provided at root level

2. **Lazy-Loaded Routes**
   - All feature pages use `loadComponent()`
   - Reduces initial bundle size
   - Example: `loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent)`

3. **Role-Based Access Control**
   - Roles: `superadmin`, `marketing`, `branchmanager`, `backoffice`
   - Route protection: `canActivate: [roleGuard(['superadmin'])]`
   - Role stored in localStorage after login
   - Auth0 integration exists but needs completion

4. **HTTP Interception**
   - Auth interceptor adds credentials to all requests
   - Token management happens in interceptor
   - Consider adding token refresh logic

5. **Shared Components for Loans**
   - `loan-queue-list`: Displays queued loans (data-driven)
   - `loan-review-drawer`: Review/approve individual loans
   - Used across marketing, branchmanager, backoffice

## Important Implementation Details

### Authentication Flow

```
1. User visits /login → LoginComponent
2. User submits credentials → AuthService.login()
3. Backend returns token + role
4. Role stored in localStorage (key: 'userRole')
5. Redirect to role-specific dashboard
6. roleGuard checks localStorage['userRole'] on every protected route
7. Logout: clear localStorage
```

⚠️ **Known Issue**: No token validation on page refresh. Consider persisting token and validating it on app bootstrap.

### Service Layer

All services should:
- Use dependency injection
- Return Observables (not Promises)
- Handle errors appropriately
- Use strong typing for requests/responses

Example:
```typescript
@Injectable({ providedIn: 'root' })
export class LoanQueueService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1';

  getLoans(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.apiUrl}/loans`);
  }
}
```

### Component Guidelines

- Keep components focused (one responsibility)
- Use signals for component state
- Pass data via @Input, emit via @Output
- Move complex logic to services
- Lazy-load only if route-specific

```typescript
@Component({
  selector: 'app-loan-review',
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-review.html',
  styleUrl: './loan-review.css'
})
export class LoanReview {
  @Input() loan: LoanApplication;
  @Output() approved = new EventEmitter<LoanApplication>();
  
  protected status = signal('pending');
  
  onApprove() {
    this.approved.emit(this.loan);
  }
}
```

### Styling with Tailwind

- Global styles in `src/styles.css`
- Use Tailwind utility classes (avoid custom CSS when possible)
- Component-level CSS only for complex/dynamic styles
- Lucide Angular icons available for UI elements

Example:
```html
<button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Approve
</button>
```

## Knowledge Folder (Project-Specific)

Before starting any work, read the `knowledge/` folder:
- **[knowledge/README.md](./knowledge/README.md)** - Index and quick start guide
- **[knowledge/PRD.md](./knowledge/PRD.md)** - What are we building?
- **[knowledge/ARCHITECTURE.md](./knowledge/ARCHITECTURE.md)** - How is it built?
- **[knowledge/TODO.md](./knowledge/TODO.md)** - What's the status?
- **[knowledge/WORKFLOW.md](./knowledge/WORKFLOW.md)** - How do we work?
- **[knowledge/SKILL.md](./knowledge/SKILL.md)** - Reusable patterns

**Most Important**: Read [knowledge/WORKFLOW.md](./knowledge/WORKFLOW.md) for rules. Read [knowledge/TODO.md](./knowledge/TODO.md) to know current status before starting work.

---

## Global Rules

**ALSO refer to the global CLAUDE.md rules:**

1. Read [C:\Users\User\.claude\knowledge\coding-rules.md]
2. Follow commit guidelines from [C:\Users\User\.claude\knowledge\commit-guidelines.md]
3. Check security requirements in [C:\Users\User\.claude\knowledge\security-checklist.md]
4. Follow testing standards from [C:\Users\User\.claude\knowledge\testing-standards.md]

## Project-Specific Best Practices

### For Auth-Related Work

- All auth logic must go through AuthService
- Never store raw passwords anywhere
- Token expiration must be handled gracefully
- Test both authenticated and non-authenticated flows
- Check [security-checklist.md](../.claude/knowledge/security-checklist.md) before implementing auth changes

### For Loan Queue / Approval Workflow

- Loan state should never be modified on frontend alone
- Always validate on backend before accepting state changes
- Approval/rejection actions must trigger backend update
- Audit logs should capture who approved/rejected and when

### For New Role-Based Pages

1. Create page component in `src/app/pages/<role>/<feature>/`
2. Add route in `app.routes.ts` with roleGuard
3. Create service if needed in `src/app/core/services/`
4. Use shared `loan-queue-list` or `loan-review-drawer` if applicable
5. Write tests

### For Shared Components

- Put in `src/app/shared/components/`
- Use @Input for data, @Output for events
- No direct API calls (get data from parent)
- Reusable across multiple roles/pages

## Testing Strategy

- **Services**: Full coverage (90%+)
  - Test API calls with HttpClientTestingModule
  - Test observable chains
  - Test error handling

- **Components**: Core logic tested (60-70%)
  - Test user interactions
  - Test data binding
  - Mock services

- **Routes/Guards**: Test access control
  - Test authorized access
  - Test unauthorized redirect

Run tests:
```bash
npm test
npm test -- --coverage
npm test -- --watch
```

## Environment Configuration

- **Development**: `environment.development.ts`
- **Production**: `environment.ts`
- Backend API URL should be in environment config (not hardcoded in services)

## Known Issues & TODOs

- [ ] Complete Auth0 integration (partially configured)
- [ ] Add token refresh logic to auth interceptor
- [ ] Validate role on app bootstrap (session recovery)
- [ ] Add loading states to all async operations
- [ ] Complete loan review workflow testing
- [ ] Add end-to-end tests for approval flows

See [C:\Users\User\code\bb-frontend\angular-challenge\knowledge\] for project-specific issues (if any).

## Deployment Notes

- Production build: `npm run build:prod`
- Check bundle size before deploying
- Test in production config locally: `npm run start:prod`
- Ensure all environment variables are set

## Getting Help

- Refer to global knowledge files first
- Check Angular documentation: https://angular.dev
- Check Tailwind docs: https://tailwindcss.com
- For Auth0: https://auth0.com/docs

---

**Last Updated**: 2026-08-31
