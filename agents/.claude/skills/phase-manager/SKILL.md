---
name: phase-manager
description: Manages multi-phase implementation work, tracking progress and next steps
---

# Phase Manager Skill

## Purpose
This skill helps you break down complex features into manageable phases, track progress, and ensure systematic implementation.

## When to Use This Skill
- When implementing large features that span multiple files/components
- When a task requires database changes + backend + frontend work
- When you need to coordinate changes across multiple systems
- When the user requests a complex feature that needs planning

## How to Use

### 1. Break Down the Work
When given a complex task, identify the phases:

**Typical Phase Structure:**
1. **Planning & Design** - Understand requirements, design approach
2. **Database/Schema** - Create or modify database tables/functions
3. **Backend/API** - Implement server-side logic, API routes, Edge Functions
4. **Frontend/UI** - Build user interface components
5. **Integration** - Connect frontend to backend
6. **Testing & Verification** - Test the complete flow
7. **Documentation** - Update docs and comments

### 2. Execute Phases Sequentially
- Complete one phase before moving to the next
- Verify each phase works before proceeding
- Document any issues or deviations from plan

### 3. Track Progress
Keep track of:
- ✅ Completed phases
- 🚧 Current phase and progress
- 📋 Remaining phases
- ⚠️ Blockers or issues

### 4. Adapt as Needed
- If you discover issues in a completed phase, backtrack and fix
- If requirements change, re-plan remaining phases
- If a phase is more complex than expected, break it into sub-phases

## Phase Templates

### Database Phase
```markdown
**Phase: Database Schema**
- [ ] Design table structure
- [ ] Write migration SQL
- [ ] Test schema locally
- [ ] Document schema in docs/SCHEMA_ADDITIONS.sql
```

### Backend Phase
```markdown
**Phase: Backend Implementation**
- [ ] Create API route or Edge Function
- [ ] Implement business logic
- [ ] Add error handling
- [ ] Test with sample data
```

### Frontend Phase
```markdown
**Phase: Frontend Implementation**
- [ ] Create UI components
- [ ] Implement state management
- [ ] Connect to API
- [ ] Add loading/error states
- [ ] Style with TailwindCSS
```

### Integration Phase
```markdown
**Phase: Integration & Testing**
- [ ] Test complete user flow
- [ ] Verify error handling
- [ ] Check responsive design
- [ ] Test edge cases
```

## Communication with User

### When Starting Multi-Phase Work
Inform the user:
```markdown
This feature requires multiple phases:
1. [Phase 1 name]
2. [Phase 2 name]
3. [Phase 3 name]

I'll complete each phase sequentially and update you on progress.
```

### During Implementation
Update the user after each phase:
```markdown
✅ Completed: [Phase name]
🚧 Current: [Phase name] - [brief status]
📋 Next: [Phase name]
```

### When Blocked
If you encounter issues:
```markdown
⚠️ Blocker in [Phase name]:
- Issue: [description]
- Impact: [what's affected]
- Need: [what's needed to proceed]
```

## Key References
- `docs/MVP_BLUEPRINT.md` - Feature specifications (use only when needed)
- `docs/BUILD.md` - Build and deployment process
- `docs/SCHEMA_ADDITIONS.sql` - Database schema reference

## Best Practices
- **Don't rush**: Complete each phase properly before moving on
- **Verify early**: Test after each phase to catch issues early
- **Document changes**: Update relevant docs as you go
- **Communicate clearly**: Keep the user informed of progress
- **Be flexible**: Adapt the plan if you discover new requirements

## Example: Adding a New Feature

```markdown
## Feature: CV Upload and Analysis

### Phase 1: Planning ✅
- Reviewed requirements in MVP_BLUEPRINT.md
- Identified needed database tables
- Planned API structure

### Phase 2: Database 🚧
- [x] Created cv_uploads table
- [x] Added analysis_results table
- [ ] Testing schema locally

### Phase 3: Backend 📋
- [ ] Create upload API route
- [ ] Implement OpenAI integration
- [ ] Add error handling

### Phase 4: Frontend 📋
- [ ] Build upload component
- [ ] Create results display
- [ ] Add loading states

### Phase 5: Integration 📋
- [ ] End-to-end testing
- [ ] Error handling verification
```
