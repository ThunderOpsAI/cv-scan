# Architecture

## Overview

CVScan uses a web-first architecture centered on a Next.js application in [`app/`](/Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/app). The product combines UI routes, API routes, shared libraries, database scripts, and external integrations.

## Repository Architecture

- [`app/app/`](/Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/app/app) contains the Next.js app router pages and API routes
- [`app/components/`](/Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/app/components) contains reusable UI components
- [`app/lib/`](/Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/app/lib) contains shared application logic and service integrations
- [`app/database/`](/Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/app/database) contains SQL and schema assets tied to the app implementation
- [`app/tests/`](/Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/app/tests) contains automated tests
- [`docs/`](/Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/docs) contains product, architecture, and operational references

## Runtime Components

- Next.js application server and route handlers
- Supabase for auth-adjacent data and application persistence
- AI provider integrations for scoring, tailoring, and coaching flows
- Stripe for credit purchases and billing
- Resend for transactional email
- External job data providers for discovery features

## Integration Boundaries

- UI routes call internal API routes or server-side logic
- Shared libraries isolate provider-specific behavior
- Database SQL assets define or evolve persisted structures
- Environment variables control access to external services

## Current Architectural Notes

- The repo is now organized with a root project shell and a nested runnable application
- This keeps project docs, contracts, agents, and automation separate from the runtime codebase
- Existing implementation files were preserved rather than rewritten during the restructure
