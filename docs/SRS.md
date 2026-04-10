# Software Requirements Specification

## System Scope

CVScan is a Next.js web application backed by Supabase, third-party AI providers, payment infrastructure, and email services.

## Functional Requirements

### Authentication

- Users must be able to sign in securely
- Authenticated users must have isolated access to their own data
- Consent and legal surfaces must be available during signup and usage

### Resume And Job Analysis

- Users must be able to submit resume content and target job descriptions
- The system must generate ATS-style scoring and feedback
- The system should identify keyword gaps and improvement opportunities

### Tailored Content Generation

- Users must be able to generate tailored resume bullets and cover letters
- Generated output must consume credits according to product rules
- Export flows should support downloadable output formats where implemented

### Job Discovery And Research

- The system should aggregate job data from configured providers
- Users should be able to review company or role context before applying

### Interview Preparation

- Users must be able to access interview coaching and practice flows
- The system should preserve conversational context where relevant

### Application Tracking

- Users must be able to store and review application progress
- The dashboard should centralize scan, generation, and tracking workflows

### Payments And Credits

- Users must be able to purchase credits through Stripe
- Credit deduction and balance updates must be recorded consistently

## Non-Functional Requirements

- The app should support modern desktop and mobile browsers
- Sensitive keys must be provided through environment variables, not source control
- User data access must respect Supabase RLS policies
- Core app routes should build and run under the Next.js app router
- Documentation should remain usable by both humans and agents

## External Dependencies

- Supabase
- NextAuth
- Google OAuth
- Gemini / AI model providers
- Stripe
- Resend
- Job APIs such as Adzuna and RapidAPI-backed providers

## Operational Constraints

- Missing environment variables will degrade or block several product flows
- Build and runtime verification should be performed from the [`app/`](/Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/app) directory
