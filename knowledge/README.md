# Knowledge Folder - Sakuku Project

**Purpose**: Central repository of project knowledge for Claude Code and team members  
**Last Updated**: 2026-08-31  

---

## 📚 What's In This Folder?

This folder contains the project's collective memory. Instead of relying on chat history, Claude reads these files to understand what to do, what's been done, and what matters.

### Files Overview

| File | Purpose | When to Read |
|------|---------|--------------|
| **PRD.md** | Product requirements, scope, success criteria | Planning features, understanding business goals |
| **ARCHITECTURE.md** | Technical design, data flow, folder structure | Writing new code, understanding system design |
| **TODO.md** | Progress tracker, bug list, blockers | Starting work, checking status, updating progress |
| **WORKFLOW.md** | Rules and working agreements | Before every session, when unsure what to do |
| **SKILL.md** | Reusable prompt patterns | Implementing common tasks (components, tests, etc) |
| **SAKUKU-CONTEXT.md** | Full project context & history | Understanding the bigger picture, project decisions |
| **DATABASE-SCHEMA.md** | PostgreSQL table reference | Working with backend data models |
| **README.md** | This file - index and guide | Navigating the knowledge base |

---

## 🎯 Quick Start

### If You're Claude (AI)
1. Read **WORKFLOW.md** first (10 min) - learn the rules
2. Read **PRD.md** - understand what we're building (5 min)
3. Read **ARCHITECTURE.md** - understand how it's built (15 min)
4. Read **TODO.md** - know current status (5 min)
5. Check **SKILL.md** for pattern when doing specific task

**Total**: 35 min to be fully oriented

### If You're a Team Member
1. Read **PRD.md** - what are we building?
2. Read **ARCHITECTURE.md** - how is it built?
3. Read **TODO.md** - what's the status?
4. Read **WORKFLOW.md** - how do we work with Claude?

---

## 📖 How to Use Each File

### PRD.md
**Read this to understand**:
- ✅ What problem are we solving?
- ✅ Who are the target users?
- ✅ What features are MVP (in scope)?
- ✅ What's out of scope?
- ✅ Success criteria?

**Example questions**:
- "Is plafond management in MVP?" → Check PRD.md Features section
- "Who are the users?" → Check Target Users section
- "What's our definition of success?" → Check Success Criteria section

---

### ARCHITECTURE.md
**Read this to understand**:
- ✅ How is the code organized?
- ✅ Where do new components go?
- ✅ How do services communicate?
- ✅ What's the data model?
- ✅ What API endpoints exist?
- ✅ How does auth flow work?

**Example questions**:
- "Where should I put the new loan review component?" → Check Folder Structure
- "How do services call the backend?" → Check Key Services section
- "What's the loan data model?" → Check Data Models section
- "How does the approval workflow work?" → Check Component Interaction Map

---

### TODO.md
**Read this to understand**:
- ✅ What's been completed?
- ✅ What's in progress?
- ✅ What's blocked and why?
- ✅ What are known bugs?
- ✅ Are there dependencies to resolve?

**Example questions**:
- "Is token refresh done?" → Check Phase 1 progress
- "Why can't we deploy yet?" → Check Critical Bugs section
- "What's blocking plafond feature?" → Check Dependencies section

**After completing work**:
- ✅ Update checkboxes `[ ]` → `[x]`
- ✅ Add note in Notes section
- ✅ Update phase progress %
- ✅ Move bugs from Open to Fixed

---

### WORKFLOW.md
**Read this to understand**:
- ✅ What are the working rules?
- ✅ When should I ask before implementing?
- ✅ How do I know a feature is "done"?
- ✅ What's off-limits?
- ✅ How do I communicate progress?

**10 Core Rules**:
1. Always read knowledge first
2. Don't implement without asking (for major changes)
3. Update TODO.md after every change
4. Never break existing tests
5. Respect component structure
6. Security first
7. Keep commits clean
8. Ask before force operations
9. Feature completeness checklist
10. Reference knowledge in decisions

**Example**:
- Unsure about scope? → Check WORKFLOW.md Rule 2
- How to report progress? → Check Communication section
- When is feature complete? → Check Rule 9 checklist

---

### SKILL.md
**Read this when**:
- ✅ Adding a new component
- ✅ Creating a new service
- ✅ Adding tests
- ✅ Implementing common patterns
- ✅ Debugging auth issues
- ✅ Optimizing performance

**10 Reusable Patterns**:
1. Add New Component
2. Create New Service
3. Add Route with Role Guard
4. Write Service Tests
5. Write Component Tests
6. Update Component for New Feature
7. Debug Auth Flow Issue
8. Performance Optimization
9. Add Error Handling
10. Security Review Checklist

**How to use**:
- Find relevant skill based on task
- Copy pattern as template
- Replace placeholders
- Follow checklist
- Reference skill name in commit

---

## 🔄 Workflow: How Claude Uses This Folder

### At Session Start
```
1. Read WORKFLOW.md Rule 1 (Always read knowledge first)
2. Map task to relevant knowledge files
3. Read files in this order: PRD → ARCHITECTURE → TODO → SKILL
4. Understand context and constraints
5. Ask user if anything is unclear
```

### During Work
```
1. Reference knowledge files when making decisions
2. Check SKILL.md for reusable patterns
3. Verify work doesn't violate WORKFLOW.md rules
4. Test thoroughly before committing
```

### After Work
```
1. Update TODO.md with completion
2. Commit with descriptive message
3. Report to user: "Implemented X, updated TODO.md, see commit abc123"
4. Link to relevant knowledge in explanation
```

---

## 📝 How to Update Knowledge Files

### When Adding New Feature
1. Update **PRD.md** if scope changed
2. Update **ARCHITECTURE.md** with new folder/service structure
3. Add task to **TODO.md**
4. Add pattern to **SKILL.md** if reusable

### When Completing Feature
1. Mark `[x]` in **TODO.md**
2. Add note to "Notes & Observations"
3. Commit code with reference to knowledge files

### When Finding Bug
1. Add to **TODO.md** Bug Tracker
2. If blocking, move to Critical section
3. Reference in commit message

### When Changing Rules
1. Update **WORKFLOW.md**
2. Explain WHY in "Why" section
3. Update last modified date

### When Updating Architecture
1. Update **ARCHITECTURE.md** diagrams/sections
2. Note breaking changes
3. Update **TODO.md** dependencies if needed

---

## 🎓 Principles Behind This System

### Why Written Knowledge?
- ✅ **Persistent**: Doesn't disappear when chat scrolls
- ✅ **Searchable**: Easy to find information
- ✅ **Trackable**: Changes are recorded in git
- ✅ **Shareable**: Team can read same truth
- ✅ **AI-Friendly**: Claude can read files reliably

### Why These Specific Files?
- **PRD.md** - WHAT we're building (product truth)
- **ARCHITECTURE.md** - HOW we're building it (technical truth)
- **TODO.md** - WHERE we are (progress truth)
- **WORKFLOW.md** - RULES for how we work (process truth)
- **SKILL.md** - PATTERNS we repeat (efficiency truth)

### Why Not Chat History?
- ❌ Gets lost when session ends
- ❌ Hard to search through scrollback
- ❌ Decisions get forgotten
- ❌ Context not always clear
- ✅ Knowledge files avoid all of this

---

## 🔍 Finding Information

### I want to know...

**What are we building?**
→ Read PRD.md

**How is the code organized?**
→ Read ARCHITECTURE.md Folder Structure

**Is [feature] in scope?**
→ Read PRD.md Features section

**What's the status of [feature]?**
→ Read TODO.md and search for feature name

**How do I implement [thing]?**
→ Read SKILL.md for matching pattern

**What are the rules?**
→ Read WORKFLOW.md

**Why did we decide [X]?**
→ Search README/ARCHITECTURE/TODO for decision context

**What's blocking us?**
→ Read TODO.md Dependencies & Blockers sections

**Is this change in scope?**
→ Check PRD.md or ask per WORKFLOW.md Rule 2

---

## 📊 File Statistics

| File | Type | Size | Update Frequency |
|------|------|------|------------------|
| PRD.md | Requirements | 2-3KB | When scope changes |
| ARCHITECTURE.md | Design | 5-8KB | When structure changes |
| TODO.md | Progress | 3-5KB | After every task |
| WORKFLOW.md | Processes | 4-6KB | When rules change |
| SKILL.md | Patterns | 6-8KB | When new patterns found |
| README.md | Index | 3-4KB | Occasionally |

**Total**: ~25-35KB of knowledge (very lean!)

---

## 🚀 Version Control

These files are tracked in git. **When you update them**:
1. Commit separately from code changes
2. Use clear commit message: "docs: update TODO.md progress"
3. Reference in code commits: "See knowledge/TODO.md for task context"

**Example commit chain**:
```
docs: update TODO.md - mark loan approval feature complete

feat: implement loan approval drawer component

test: add tests for loan approval

docs: update ARCHITECTURE.md with new component diagram
```

---

## ❓ FAQ

**Q: Which file do I read first?**  
A: WORKFLOW.md (rules), then PRD.md (goals), then ARCHITECTURE.md (design)

**Q: How often should I update these files?**  
A: PRD/ARCHITECTURE rarely; TODO after every task; WORKFLOW when rules change

**Q: Can I update these files?**  
A: Yes! Keep them current. Stale knowledge is worse than no knowledge.

**Q: What if I find missing information?**  
A: Add it! If it's project-specific, add to relevant file. If it's a pattern, add to SKILL.md.

**Q: What if files contradict each other?**  
A: Trust the most recent (check git history). Then update outdated file and notify team.

**Q: How do I know if knowledge is still valid?**  
A: Check "Last Updated" date and git history. If too old, verify before relying on it.

---

## 📞 Questions or Suggestions?

If something is:
- **Missing**: Add it to the appropriate file
- **Unclear**: Rewrite for clarity and update last modified date
- **Wrong**: Correct it and note the fix
- **Incomplete**: Finish it or add a TODO

---

**Remember**: These files are the project's institutional memory. Keep them current, and future you (and future Claude) will thank you.

**Last Updated**: 2026-08-31  
**Next Review**: When major feature completes or when TODO reaches 50%+ completion
