# SKILL.md - Reusable Prompt Patterns

**Project**: Sakuku Loan Management System  
**Purpose**: Store common patterns/prompts to avoid repeating them  
**Last Updated**: 2026-08-31

---

## Skill 1: Add New Component

**When to use**: Creating a new page, dialog, or shared component  
**Pattern**:

```
Create a new [Component Type] called [ComponentName] with these specs:

Location: [src/app/pages/role/feature/ OR src/app/shared/components/]
Responsibility: [What does it do?]
Inputs: @Input() [property]: [type];
Outputs: @Output() [event] = new EventEmitter<[type]>();
Styling: Tailwind CSS (no custom CSS unless necessary)
Template: [HTML structure - keep it simple]

Add tests:
- [ ] Component creates
- [ ] [specific behavior test]

After: Update ARCHITECTURE.md if new route added
```

---

## Skill 2: Create New Service

**When to use**: Adding API integration or business logic  
**Pattern**:

```
Create a new service [ServiceName] with these capabilities:

Location: src/app/core/services/[service-name]/
Responsibilities:
  - [What it does]
  - [What it manages]

Methods to implement:
  - [methodName](params): Observable<ReturnType>
  - [methodName](params): Observable<ReturnType>

API Endpoints:
  - GET /api/v1/endpoint → returns []
  - POST /api/v1/endpoint → creates new
  - PUT /api/v1/endpoint/{id} → updates

Models/Interfaces needed:
  - [interface name] in src/app/core/models/

Error Handling:
  - Catch HTTP errors and log
  - Return meaningful error messages

Tests:
  - [ ] HTTP call made correctly
  - [ ] Observable chain works
  - [ ] Error handling works
  - Coverage: 90%+

After: 
  - Update ARCHITECTURE.md if new architecture
  - Add to TODO.md if it's a tracked task
```

---

## Skill 3: Add Route with Role Guard

**When to use**: Adding new page/feature with role-based access  
**Pattern**:

```
Add route for [Feature Name] with role access:

Route Path: /[role]/[feature]
Allowed Roles: ['role1', 'role2']
Component: [ComponentName] (lazy-loaded)

Update app.routes.ts:
{
  path: '[role]',
  component: DashboardLayoutComponent,
  canActivate: [roleGuard(['role1', 'role2'])],
  children: [
    {
      path: '[feature]',
      loadComponent: () => import('./pages/[role]/[feature]/[feature]').then(m => m.[ComponentName])
    }
  ]
}

Test:
- [ ] Access with correct role → succeeds
- [ ] Access with wrong role → redirects to /login
- [ ] No role in localStorage → redirects to /login

After:
  - Update ARCHITECTURE.md routing section
  - Update TODO.md if tracked task
  - Test all affected roles
```

---

## Skill 4: Write Service Tests

**When to use**: Adding tests for API services  
**Pattern**:

```typescript
// Location: src/app/core/services/[name]/[name].service.spec.ts

describe('[ServiceName]', () => {
  let service: [ServiceName];
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [[ServiceName], provideHttpClient()]
    });
    service = TestBed.inject([ServiceName]);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch loans from API', (done) => {
    const mockLoans = [{ id: '1', status: 'pending' }];
    
    service.getLoans().subscribe(result => {
      expect(result).toEqual(mockLoans);
      done();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/loans');
    expect(req.request.method).toBe('GET');
    req.flush(mockLoans);
  });

  it('should handle API error gracefully', (done) => {
    service.getLoans().subscribe(
      () => fail('should have failed'),
      (error) => {
        expect(error).toBeTruthy();
        done();
      }
    );

    const req = httpMock.expectOne('http://localhost:8080/api/v1/loans');
    req.error(new ErrorEvent('Network error'));
  });

  // Add more test cases...
});
```

---

## Skill 5: Write Component Tests

**When to use**: Testing component interactions and data binding  
**Pattern**:

```typescript
// Location: src/app/[path]/[component]/[component].spec.ts

describe('[ComponentName]', () => {
  let component: [ComponentName];
  let fixture: ComponentFixture<[ComponentName]>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [[ComponentName], /* other imports */]
    }).compileComponents();

    fixture = TestBed.createComponent([ComponentName]);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display loan data when loan input is provided', () => {
    component.loan = { id: '1', status: 'pending', amount: 5000 };
    fixture.detectChanges();
    
    const titleElement = fixture.nativeElement.querySelector('h2');
    expect(titleElement.textContent).toContain('Loan ID: 1');
  });

  it('should emit approved event when approve button clicked', () => {
    spyOn(component.approved, 'emit');
    component.loan = { id: '1', status: 'pending' };
    fixture.detectChanges();

    const approveBtn = fixture.nativeElement.querySelector('.btn-approve');
    approveBtn.click();

    expect(component.approved.emit).toHaveBeenCalledWith('1');
  });
});
```

---

## Skill 6: Update Component for New Feature

**When to use**: Adding new functionality to existing component  
**Pattern**:

```
Update [ComponentName] to support [New Feature]:

Current: [describe current state]
Change: [what are we adding?]

Components affected:
  - [Component] (template changes)
  - [Component] (logic changes)

Data flow:
  [Source] → [Service] → [Component] → [Output]

Changes needed:
  1. [ ] Add @Input/@Output decorators
  2. [ ] Update template HTML
  3. [ ] Add methods in TypeScript
  4. [ ] Update service if API call needed
  5. [ ] Add tests for new behavior
  6. [ ] Verify no regression in existing tests

Styling:
  - [ ] Mobile responsive
  - [ ] Dark mode compatible (if applicable)

After:
  - Run npm test
  - Commit with descriptive message
  - Update TODO.md
```

---

## Skill 7: Debug Auth Flow Issue

**When to use**: When login, role guard, or auth interceptor has issues  
**Pattern**:

```
Debug auth flow issue: [Description of problem]

Check these in order:
1. [ ] Login endpoint returning correct response? 
   → Check browser DevTools → Network → POST /login
   → Response should have {token, role, user}

2. [ ] Role stored in localStorage?
   → Check DevTools → Application → localStorage
   → Key 'userRole' should have correct value

3. [ ] Route guard checking role correctly?
   → src/app/core/guards/auth.guards.ts
   → Line X: roleGuard checks localStorage.getItem('userRole')

4. [ ] Auth interceptor adding credentials?
   → src/app/core/interceptors/auth.interceptor.ts
   → Should add 'withCredentials: true' to requests

5. [ ] Component receiving correct data?
   → Check browser console → logs
   → Verify service Observable emitting correct data

Debugging steps:
1. Add console.log() in auth flow
2. Check browser DevTools
3. Verify API response format
4. Test with different roles
5. Check for localStorage corruption

Common fixes:
- Clear localStorage and login again
- Check if localStorage.getItem('userRole') is null
- Verify role name matches in code (case-sensitive!)
- Check if AuthService is provided at root
```

---

## Skill 8: Performance Optimization

**When to use**: When page is slow or bundle is large  
**Pattern**:

```
Optimize [feature/page] for performance:

Current state:
- Bundle size: [X] KB
- Load time: [X] ms
- Lighthouse score: [X]/100

Optimization plan:
1. [ ] Analyze bundle: ng build --stats-json
   → Find large imports
   → Remove unused code

2. [ ] Lazy load routes:
   → loadComponent() instead of imports
   → Verify in app.routes.ts

3. [ ] Optimize images:
   → Compress JPG/PNG
   → Use modern formats (WebP)

4. [ ] Implement OnPush change detection:
   → changeDetection: ChangeDetectionStrategy.OnPush
   → Only update when inputs change

5. [ ] Cache API responses:
   → Use shareReplay() in services
   → Avoid redundant API calls

6. [ ] Virtual scroll for long lists:
   → ScrollingModule for loan lists

Testing:
- [ ] Bundle size reduced
- [ ] Load time improved
- [ ] Lighthouse score improved
- [ ] No functional regressions
```

---

## Skill 9: Add Error Handling

**When to use**: When API calls need better error messages  
**Pattern**:

```
Add error handling to [Service/Component]:

Current: API calls without error handling
Goal: User-friendly error messages + logging

Implementation:
1. [ ] Create error handling function:
   ```typescript
   private handleError(error: HttpErrorResponse) {
     let message = 'An error occurred';
     if (error.error instanceof ErrorEvent) {
       message = error.error.message;
     } else {
       message = `Error Code: ${error.status}\\nMessage: ${error.message}`;
     }
     return throwError(() => new Error(message));
   }
   ```

2. [ ] Apply to service methods:
   ```typescript
   getLoans(): Observable<LoanApplication[]> {
     return this.http.get<LoanApplication[]>(url)
       .pipe(catchError(err => this.handleError(err)));
   }
   ```

3. [ ] Display to user in component:
   ```typescript
   this.service.getLoans().subscribe(
     (data) => this.loans = data,
     (error) => this.errorMessage = error.message
   );
   ```

4. [ ] Add to template:
   ```html
   <div *ngIf="errorMessage" class="text-red-600">
     {{errorMessage}}
   </div>
   ```

Tests:
- [ ] HTTP error returns error message
- [ ] Network error handled
- [ ] User sees error message
- [ ] Component doesn't crash
```

---

## Skill 10: Security Review Checklist

**When to use**: Before committing auth-related or sensitive code  
**Pattern**:

```
Security review for [Feature]:

Code review:
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] No sensitive data in localStorage (without encryption)
- [ ] User input sanitized/escaped
- [ ] No eval() or dynamic code execution
- [ ] HTTPS enforced for API calls
- [ ] Credentials sent in request body (not URL)

Auth/Authorization:
- [ ] Route guards protect sensitive pages
- [ ] Backend validates all permissions (don't trust frontend)
- [ ] Token validation implemented
- [ ] Logout clears all user data
- [ ] No token in URLs or cookies without secure flags

Data Protection:
- [ ] Sensitive data not logged
- [ ] No PII in error messages
- [ ] User data encrypted if persisted
- [ ] Third-party dependencies checked for CVEs

Testing:
- [ ] Test with invalid token → redirect to login
- [ ] Test with wrong role → forbidden
- [ ] Test API call without auth → 401 error
- [ ] Test concurrent requests → no race conditions

After:
- [ ] All checks passed
- [ ] Code reviewed by user
- [ ] Commit with security notes
```

---

## How to Use This File

1. **Find relevant skill** based on your task
2. **Copy the pattern** as template
3. **Replace placeholders** (shown in [brackets])
4. **Follow the checklist** in order
5. **After completion**, reference the skill name in commit message

**Example commit**:
```
feat: add loan review drawer component

Implemented using "Skill 1: Add New Component" pattern.
Location: src/app/shared/components/loan-review-drawer/
Tests: 3 test cases passing (create, display, emit)
Coverage: 100%

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

---

## Adding New Skills

When discovering a reusable pattern:
1. Document it as a new skill
2. Include: When to use, Pattern, Checklist
3. Add to this file
4. Reference it in future similar work

---

**Note**: These skills assume familiarity with Angular, TypeScript, and RxJS. For basic Angular questions, refer to [https://angular.dev](https://angular.dev).
