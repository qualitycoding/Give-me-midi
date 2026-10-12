# DocPlan Executor

Interactive execution, task breakdown, and progress tracking dashboard for Google Docs plans.

## Overview

DocPlan Executor turns static Google Docs plan documents into an interactive engineering execution workspace. It securely connects to Google Workspace via client-side OAuth, parses document structures into deliverables and milestones, and provides bidirectional synchronization and export to Google Drive.

## Features

- **Google Workspace OAuth Integration**: Secure client-side authentication supporting both Firebase Auth and Google Identity Services (`gsi/client`) token client with ephemeral in-memory credential storage.
- **Intelligent Google Docs Parser**: Automatically extracts headings, paragraphs, bullet points, checklists, tables, and revision history into actionable plan items.
- **Interactive Kanban Execution Board**: 4-stage workflow (*To Do*, *In Progress*, *In Review*, *Done*) with subtask checklists, stage advances, and direct completion checkboxes.
- **Phased Milestone Roadmap**: Phased progress bars, target dates, and direct deliverable check-off controls.
- **Full Plan Document Reader**: In-document keyword search, dynamic Table of Contents, table viewer, and one-click "+ Turn into Task" extraction.
- **Executive Analytics & Reporting**: Real-time progress metrics, priority risk breakdown, and multi-format exports:
  - **Export to Google Docs Folder**: Automatically creates a dedicated Google Drive folder with 4 formatted Google Docs (Executive Status Brief, Deliverables Matrix, Roadmap Specification, Plan Archive).
  - **Markdown Status Report** (`.md`)
  - **Structured Plan Data** (`.json`)
  - **Tasks Spreadsheet** (`.csv`) for Google Sheets and Excel
  - **Print / Save as PDF Executive Brief**

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Icons**: Lucide React
- **Authentication**: Firebase Authentication + Google Identity Services (GIS)
- **APIs**: Google Docs API v1, Google Drive API v3

## Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Runs the development server on `http://localhost:3000`.

### Production Build

```bash
npm run build
```

## Security & Privacy

- **In-Memory Token Lifecycle**: OAuth access tokens are stored strictly in memory and cleared on sign-out or session end. Tokens are never persisted to localStorage or sessionStorage.
- **User Confirmation**: All write operations to Google Drive (folder creation and Google Docs export) require explicit user confirmation before executing.
