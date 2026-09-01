# WORKFLOW.md - Working Rules & Agreements

**Project**: Sakuku Loan Management System  
**Audience**: Claude Code instances working on this project  
**Last Updated**: 2026-08-31

---

## Rule 1: Always Read Knowledge First

**When**: Before answering ANY question or proposing ANY code change  
**Where**: Check files in this `knowledge/` folder:
- `PRD.md` - What are we building?
- `ARCHITECTURE.md` - How is it built?
- `TODO.md` - What's the status?
- `CLAUDE.md` - Project-specific rules (in project root)
- Global `C:\Users\User\.claude\CLAUDE.md` + knowledge folder

**How**: 
1. Map the request to the right knowledge file
2. Read relevant sections
3. Use that as context for your answer/implementation

**Why**: Prevents repeating old decisions, losing context, or undoing completed work.

---

## Rule 2: Don't Implement Without Asking

**Situations requiring ASK FIRST**:
1. Feature not listed in PRD.md MVP section
2. Architecture change (new folder, new service, changing routing)
3. Adding new dependencies
4. Breaking changes to existing APIs
5. Changes to auth flow
6. Changes to approved role definitions

**How to Ask**:
- Show the user the current state (from ARCHITECTURE.md/TODO.md)
- Propose the change with rationale
- Wait for explicit approval ("yes, do it")

**Exceptions** (can implement without asking):
- Bug fixes for issues in TODO.md marked `[x] Start`
- Code style/refactoring if no behavior changes
- Adding tests for untested code
- Docs/comments improvements
- Small optimizations

**Why**: Prevents going off-road and wasting effort on unapproved features.

---

## Rule 3: Update TODO.md After Every Change

**When**: Immediately after completing a task  
**What to Update**:
1. Mark checkbox `[ ]` → `[x]`
2. Update phase progress % if applicable
3. Add note in "Notes & Observations" section
4. Move any related bugs from Open to Fixed

**Format**: Keep it clean, use consistent emoji/status:
```markdown
- [x] LoginComponent created
- 🟡 Token refresh - in progress (blocked by API)
- 🔴 CRITICAL: Session lost on refresh (bug)
```

**Why**: This file is your (AI's) memory. It prevents repeating work and gives user progress visibility.

---

## Rule 4: Never Break Existing Tests

**Before Committing**:
1. Run `npm test`
2. Ensure all tests pass
3. If tests fail, fix the code or tests (not just delete them)

**If You Break Tests**:
- Fix the underlying issue, not the test
- Never remove/comment out tests to make them pass
- Ask user if test seems wrong

**When Adding Code**:
- Add tests for new services (90%+ coverage)
- Add tests for complex component logic
- Unit test > Integration test > E2E test (in that priority)

**Why**: Tests are your safety net. They catch bugs and prevent regressions.

---

## Rule 5: Respect the Component Structure

**Don't**:
- Add logic to components that should be in services
- Put data fetching in component constructors
- Store shared state in component properties (use services)
- Use two-way binding (ngModel) more than necessary

**Do**:
- Keep components focused on UI/presentation
- Use services for business logic and data
- Use RxJS Observables for async operations
- Use @Input for data in, @Output for events out

**Component Responsibilities**:
```
- Display data (from @Input or service Observable)
- Handle user interactions (clicks, form submissions)
- Emit events (@Output)
- Delegate business logic to services
```

**Service Responsibilities**:
```
- API calls
- Data transformation
- Business logic
- Shared state management
```

**Example** ✅ GOOD:
```typescript
// Component
export class LoanList {
  loans$ = inject(LoanQueueService).loans$;
  
  onApprove(loan: LoanApplication) {
    inject(LoanQueueService).approveLoan(loan.id);
  }
}

// Service
@Injectable({providedIn: 'root'})
export class LoanQueueService {
  loans$ = this.loansSubject.asObservable();
  
  approveLoan(id: string) {
    // API call + state update
  }
}
```

**Example** ❌ BAD:
```typescript
export class LoanList {
  loans: LoanApplication[] = [];
  
  ngOnInit() {
    this.http.get('/loans').subscribe(data => {
      this.loans = data;
      // business logic here
    });
  }
}
```

**Why**: Keeps code organized, testable, and reusable.

---

## Rule 6: Security First

**Before Committing Code**:
1. Check `C:\Users\User\.claude\knowledge\security-checklist.md`
2. No hardcoded credentials or API keys
3. No sensitive data in localStorage (without encryption)
4. No XSS vulnerabilities (sanitize user input)
5. Auth interceptor on all requests
6. Role checks on backend (don't trust frontend only)

**For Auth Changes**:
- Notify user even if "small" change
- Test with different roles
- Verify route guards are working

**For Data Changes**:
- Validate on backend
- Log sensitive operations
- Don't expose error details to users

**Why**: Security breaches destroy trust and violate user data.

---

## Rule 7: Keep Commits Clean

**Before Committing**:
1. Review changes: `git status`, `git diff`
2. No secrets, API keys, or credentials
3. No commented-out code (use git history instead)
4. No unrelated changes (one commit = one logical change)

**Commit Message Format**:
```
<type>: <subject>

<body>

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code reorganization (no behavior change)
- `test`: Tests only
- `docs`: Documentation

**Example**:
```
feat: add loan approval drawer component

- Created reusable drawer for reviewing loans
- Integrated with loan-queue-list component
- Added approve/reject buttons with confirmation

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

**Why**: Clean history makes debugging and understanding code easier.

---

## Rule 8: Ask User Before Force Operations

**Operations Requiring ASK FIRST**:
- Force push (`git push --force`)
- Deleting files/branches
- Destructive refactoring (removing large chunks)
- Resetting git history
- Running migrations that can't be undone

**How**: "I'm about to do X. Proceed? [yes/no]"

**Why**: Destructive operations can't be undone. Better to confirm first.

---

## Rule 9: Feature Completeness Checklist

Before saying "Feature X is complete", verify:

```
[ ] Code written
[ ] Tests added (or existing tests pass)
[ ] Committed to git
[ ] TODO.md updated
[ ] No linting errors (if applicable)
[ ] Works in development
[ ] Doesn't break other features
[ ] Follows project conventions
[ ] Documented (comments/README if needed)
```

**Status Meanings**:
- ✅ **Complete**: All above done, can ship
- 🟡 **In Progress**: Started, tests passing, more work needed
- 🔴 **Blocked**: Can't proceed without external input

**Why**: Clear definition prevents "done" meaning different things.

---

## Rule 10: Reference Knowledge in Decisions

**When You Need To**:
- Reference PRD.md for "Is this in scope?"
- Reference ARCHITECTURE.md for "Where does this go?"
- Reference TODO.md for "What's blocking us?"
- Reference CLAUDE.md for "What are the conventions?"
- Reference global knowledge for "What are the global rules?"

**How To Reference**:
In your reasoning/comments, cite the file:
- "Per ARCHITECTURE.md, services go in core/services/"
- "TODO.md shows token refresh is blocked by backend"
- "PRD.md says plafond management is Phase 3, not MVP"

**Why**: Makes decisions traceable and helps user understand your reasoning.

---

## Special Cases

### When Backend API Changes
1. Update ARCHITECTURE.md data models + contracts
2. Update services in code
3. Update TODO.md with new endpoints
4. Notify user of breaking changes

### When PRD/Scope Changes
1. Ask user to update PRD.md
2. Update ARCHITECTURE.md accordingly
3. Update TODO.md priorities
4. Re-prioritize work

### When Tests Fail
1. Check if it's a real bug or test issue
2. Fix the code, not the test
3. If test seems wrong, ask user
4. Update TODO.md status

### When You're Unsure
1. Re-read relevant knowledge files
2. Ask user for clarification
3. Don't guess or assume

---

## Communication with User

### What to Report
✅ Completed tasks (with commit hash)  
✅ Blockers or dependencies needed  
✅ Questions about unclear requirements  
✅ Suggestions for better approaches  
✅ Test failures or warnings  

### What NOT to Report
❌ Obvious/trivial changes (linting, formatting)  
❌ Work-in-progress that's not ready  
❌ Speculation about future tasks  
❌ Debugging output or logs  

### How to Report
- **Completed**: "Implemented X, committed as abc123, updated TODO.md"
- **Blocked**: "Can't proceed without Y from Z (see TODO.md)"
- **Question**: "PRD is unclear on Z. Should we include X or not?"
- **Risk**: "This change affects Y. Should I test both roles?"

---

## Escalation Paths

### If Unclear What To Do
1. Check knowledge files (PRD/ARCHITECTURE/TODO)
2. Ask user for clarification
3. Wait for response (don't guess)

### If Something Doesn't Work
1. Diagnose the issue
2. Check if it's in TODO.md as known issue
3. Fix if it's a bug you introduced
4. Report if it's pre-existing or blocked

### If You Find a Better Approach
1. Explain current approach (from ARCHITECTURE.md)
2. Explain proposed improvement
3. Show tradeoffs
4. Wait for user approval

---

## Success Metrics

You're working well if:
- ✅ TODO.md stays updated
- ✅ Tests always pass
- ✅ User rarely needs to redirect you
- ✅ Decisions are traceable to knowledge files
- ✅ No surprises (user knows what you're doing)

---

## Checklist for Session Start

When starting a new session:
1. [ ] Read PRD.md - understand the goal
2. [ ] Read ARCHITECTURE.md - understand the structure
3. [ ] Read TODO.md - understand current status
4. [ ] Read project's CLAUDE.md - project-specific rules
5. [ ] Read global CLAUDE.md - global conventions
6. [ ] Ask user what they want to work on
7. [ ] Reference knowledge files while working

---

**Remember**: Knowledge files are your source of truth. When in doubt, check them first.
