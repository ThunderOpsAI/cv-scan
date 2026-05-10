---
name: build-summary
description: Provides context on what has been built, current project state, and completed features
---

# Build Summary Skill

## Purpose
This skill helps you understand the current state of the CVScan project, what features have been implemented, and what remains to be done.

## When to Use This Skill
- At the start of a new work session
- When you need to understand what's already built
- Before planning new features to avoid duplication
- When debugging to understand the current architecture

## How to Use

### 1. Check Current Build State
Review the build documentation to understand:
- What features are currently implemented
- What the current architecture looks like
- What dependencies are in use
- What deployment configuration exists

**Reference**: `docs/BUILD.md`

### 2. Review Completed Features
Look at the codebase to identify:
- Implemented pages and routes (check `/app` directory)
- Existing components and utilities (check `/lib` directory)
- Database tables and functions (check `docs/SCHEMA_ADDITIONS.sql`)
- API integrations (check for API route handlers)

### 3. Identify Gaps
Compare the current state against:
- `docs/MVP_BLUEPRINT.md` - for planned features
- `docs/BUSINESS_PLAN_AND_DECISION_MATRIX.md` - for business requirements
- User requests - for new feature requests

### 4. Provide Summary
When asked about build state, provide:
- **Completed**: What's working and deployed
- **In Progress**: What's partially implemented
- **Pending**: What's planned but not started
- **Blockers**: Any issues preventing progress

## Key Files to Reference
- `docs/BUILD.md` - Build and deployment instructions
- `package.json` - Dependencies and scripts
- `docs/SCHEMA_ADDITIONS.sql` - Database schema
- `/app` directory - Implemented pages
- `/lib` directory - Utility functions and integrations

## Output Format
When providing a build summary, structure it as:

```markdown
## Current Build State

### ✅ Completed Features
- [Feature 1]: Description
- [Feature 2]: Description

### 🚧 In Progress
- [Feature 3]: What's done, what remains

### 📋 Pending
- [Feature 4]: Not yet started

### ⚠️ Known Issues
- [Issue 1]: Description and impact
```

## Important Notes
- Focus on factual, observable state (code that exists)
- Don't assume features are complete without verification
- Check git history if needed to understand recent changes
- Keep summaries concise and actionable
