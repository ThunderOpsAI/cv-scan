# CVScan - Claude Code Instructions

## Project Overview
CVScan is a Next.js application that helps users scan and analyze CVs/resumes. The application uses Supabase for backend services, authentication, and database management.

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), React, TypeScript, TailwindCSS
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **AI/ML**: OpenAI API for CV analysis
- **Deployment**: Vercel

## Key Directories
- `/app` - Next.js app router pages and layouts
- `/lib` - Utility functions, API clients, Supabase client
- `/database` - Database schema and migration files
- `/docs` - Project documentation and specifications
- `/types` - TypeScript type definitions

## Development Workflow

### Before Starting Any Task
1. Check `docs/MVP_BLUEPRINT.md` for feature specifications (only when needed for clarification)
2. Review `docs/BUILD.md` for build and deployment instructions
3. Consult `docs/SCHEMA_ADDITIONS.sql` for database schema reference

### Skills Available
Use the skills system to guide your work:
- **build-summary**: For understanding the current build state and what's been completed
- **phase-manager**: For managing multi-phase implementation work

### Code Standards
- Use TypeScript for all new code
- Follow Next.js 14+ App Router conventions
- Use Supabase client from `/lib/supabase/client.ts`
- Keep components modular and reusable
- Write clear, descriptive commit messages

### Database Changes
- All schema changes should be documented in `database/` directory
- Reference `docs/SCHEMA_ADDITIONS.sql` for the current schema
- Test database changes locally before deploying

### Testing
- Test all features locally before committing
- Verify Supabase integration works correctly
- Check responsive design on multiple screen sizes

## Important Notes
- **Do NOT** read `docs/MVP_BLUEPRINT.md` by default - only when explicitly needed for spec clarification
- **Do NOT** make breaking changes without discussing first
- **Always** check existing patterns before implementing new features
- **Keep** token usage minimal by focusing on relevant files only

## Getting Help
If you need clarification on:
- **Business requirements**: Check `docs/BUSINESS_PLAN_AND_DECISION_MATRIX.md`
- **Monetization strategy**: Check `docs/Automated_App_Monetization_Plan.md`
- **Database schema**: Check `docs/SCHEMA_ADDITIONS.sql`
- **Build process**: Check `docs/BUILD.md`
