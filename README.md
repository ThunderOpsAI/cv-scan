# CVScan

CVScan now follows the standard project layout for this workspace.

## Structure

```text
cv-scan/
├── app/                  # runnable Next.js codebase
├── docs/                 # product, system, and reference docs
├── contracts/            # JSON schemas for agent-readable project metadata
├── agents/               # project-specific agent/tooling config
├── data/                 # local test data and artifacts
├── scripts/              # automation and pipeline scripts
├── tasks.json            # active project work
├── decisions.json        # architectural/product decisions
├── patterns.json         # reusable project patterns
└── README.md
```

## Public Beta Mode

**This branch is running in public beta mode.**

- No authentication or login is required.
- All features are open and free to use.
- Payments and credits are disabled.

## Running The App

The application itself lives in [`app/`](/Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/app).

```bash
cd app
npm install
npm run dev
```

## Core Docs

- [`docs/PRD.md`](/Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/docs/PRD.md)
- [`docs/SRS.md`](/Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/docs/SRS.md)
- [`docs/architecture.md`](/Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/docs/architecture.md)

Older planning and build notes were preserved in [`docs/`](/Users/thunderopsai/Documents/Workspace/01_Projects/cv-scan/docs).
