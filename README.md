# Integration Sync Panel

A Web App Integration Sync Panel for B2B SaaS platforms that connects to multiple external services (Salesforce, HubSpot, Stripe, etc.).

The system supports **bidirectional data synchronization** with safe conflict detection, resolution, and full version history.

---

## Table of Contents

- [Quick Start with Docker](#quick-start-with-docker)
- [Prerequisites](#prerequisites)
- [Docker Setup](#docker-setup)
- [Local Development](#local-development)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [Features](#features)
- [API Integration](#api-integration)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)

---

## Quick Start with Docker

Get the application running in under 2 minutes:

```bash
# 1. Clone the repository
git clone <repository-url>
cd sync-panel

# 2. Build and run with Docker Compose
docker compose up -d

# 3. Open the application
open http://localhost:3000
```

That's it! The application will be available at `http://localhost:3000`.

---

## Prerequisites

### Required

| Tool                                                       | Version | Installation                                      |
| ---------------------------------------------------------- | ------- | ------------------------------------------------- |
| [Docker](https://docs.docker.com/get-docker/)              | 20.10+  | [Install Guide](https://docs.docker.com/desktop/) |
| [Docker Compose](https://docs.docker.com/compose/install/) | 2.0+    | Included with Docker Desktop                      |

### Optional (for local development without Docker)

| Tool                    | Version |
| ----------------------- | ------- |
| Node.js                 | 20+     |
| npm / yarn / pnpm / bun | Latest  |

---

## Docker Setup

### Option 1: Docker Compose (Recommended)

Docker Compose handles building, networking, and health checks automatically.

```bash
# Build and start the container in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop the container
docker compose down

# Rebuild after code changes
docker compose up -d --build
```

### Option 2: Manual Docker Build

```bash
# Build the image
docker build -t sync-panel .

# Run the container
docker run -p 3000:3000 \
  -e API_BASE_URL=https://portier-takehometest.onrender.com/api/v1 \
  sync-panel
```

### Option 3: Using npm Scripts

The project includes convenient npm scripts for Docker operations:

```bash
# Build and run (detached)
npm run docker:up

# Build and run (foreground with logs)
npm run docker:dev

# Build image only
npm run docker:build

# Stop containers
npm run docker:down

# Clean up (remove containers, volumes, images)
npm run docker:clean
```

---

## Local Development

### Without Docker

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### With Docker (Development Mode)

For live reloading during development:

```bash
# Run in foreground with log streaming
npm run docker:dev

# Or manually with volume mounting
docker run -p 3000:3000 \
  -v $(pwd):/app \
  -w /app \
  node:20-alpine \
  sh -c "npm install && npm run dev"
```

---

## Testing

### Unit Tests (Vitest)

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run with coverage report
npm run test:coverage

# Open Vitest UI
npm run test:ui
```

### Code Coverage 🏆

This project maintains **100% unit test coverage** across all critical modules (UI Components, Server Actions, Library utils, and API adapters).

To see the coverage metrics:

```bash
# Output coverage metrics to the console
npm run test:coverage
```

Upon running, you can open `coverage/index.html` in your browser for a detailed visual breakdown.

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Test Structure

```
src/
├── lib/
│   └── utils.test.ts                 # Utility function tests
└── test/
    ├── setup.ts                       # Test configuration & mocks
    ├── unit/
    │   ├── StatusBadge.test.tsx       # Component tests
    │   ├── SyncButton.test.tsx        # Component tests
    │   └── api.test.ts                # API utility tests
    └── e2e/
        └── integrations.spec.ts       # E2E page tests
```

### Writing Tests

- Unit tests go in `*.test.ts` or `*.test.tsx` files alongside the code they test
- E2E tests go in `src/test/e2e/`
- Vitest is configured with jsdom for React component testing
- Playwright tests run against the dev server at localhost:3000

---

## Environment Variables

Create a `.env.local` file in the project root (or use the `.env.example` as a template):

```bash
cp .env.example .env.local
```

### Available Variables

| Variable       | Required | Default                                            | Description               |
| -------------- | -------- | -------------------------------------------------- | ------------------------- |
| `API_BASE_URL` | No       | `https://portier-takehometest.onrender.com/api/v1` | Base URL for the sync API |

### Docker Environment

When running with Docker Compose, set environment variables in `.env` or pass them directly:

```bash
# Using .env file
echo "API_BASE_URL=https://your-api-url.com/api/v1" > .env
docker compose up -d

# Or via command line
docker run -p 3000:3000 \
  -e API_BASE_URL=https://your-api-url.com/api/v1 \
  sync-panel
```

---

## Features

### 4.1 Integrations List (`/integrations`)

- Overview of all connected integrations
- Status indicators:
  - **Synced** (green) - All data is synchronized
  - **Syncing** (blue) - Sync in progress
  - **Conflict** (amber) - Conflicts require resolution
  - **Error** (red) - Sync failed
- Key metadata: Last sync time, Version
- Search and filter by status

### 4.2 Integration Detail (`/integrations/[id]`)

- Integration summary with key metrics
- **Sync Now** button to trigger synchronization
- Preview of incoming changes before applying
- Quick actions: View History, Resolve Conflicts

### 4.3 Sync History & Versioning (`/integrations/[id]/history`)

- List of past sync events with timestamps
- Version tracking for each sync
- Source indicator (System or External)
- Expandable rows showing change details
- Click to view version diff

### 4.4 Version Diff (`/integrations/[id]/version-diff`)

- Detailed view of changes in a specific version
- Change statistics (added, updated, deleted)
- Field-level change comparison
- Visual diff with previous/new values

### 4.5 Conflict Resolution (`/integrations/[id]/conflicts`)

- Field-level conflict detection
- Side-by-side comparison (Local vs External)
- Per-field resolution choice
- Bulk actions: Accept All Local, Accept All External
- Progress indicator showing resolution status
- Clear merge action when all conflicts resolved

---

## API Integration

### Endpoint

```
GET /data/sync?application_id=<integration-id>
```

Base URL is configured via `API_BASE_URL` environment variable.

### Example Response

```json
{
  "code": "SUCCESS",
  "message": "successfully retrieve the data",
  "data": {
    "sync_approval": {
      "application_name": "HubSpot",
      "changes": [
        {
          "id": "change_001",
          "field_name": "user.email",
          "change_type": "UPDATE",
          "current_value": "john@old.com",
          "new_value": "john@company.com"
        }
      ]
    },
    "metadata": {}
  }
}
```

### Error Handling

The UI handles the following error states with user-friendly messages:

| Status Code | Error Type          | User Message                                     |
| ----------- | ------------------- | ------------------------------------------------ |
| 4xx         | Configuration Error | "Please check your integration settings."        |
| 500         | Server Error        | "Internal server error. Please try again later." |
| 502         | Gateway Error       | "Integration service is currently unavailable."  |

### Fallback Behavior

When the API is unavailable, the application gracefully falls back to mock sync preview data so users can still explore the interface.

---

## Architecture

```
src/
├── app/
│   ├── error.tsx                    # Global error boundary
│   ├── loading.tsx                  # Global loading state
│   ├── page.tsx                     # Redirects to /integrations
│   ├── layout.tsx                   # Root layout with navigation
│   ├── globals.css                  # Global styles + Tailwind
│   └── integrations/
│       ├── page.tsx                 # Integrations list
│       ├── loading.tsx               # Integrations loading skeleton
│       ├── error.tsx                # Integrations error boundary
│       └── [id]/
│           ├── page.tsx             # Integration detail
│           ├── loading.tsx           # Detail loading skeleton
│           ├── error.tsx            # Detail error boundary
│           ├── conflicts/
│           │   ├── page.tsx         # Conflict resolution
│           │   ├── loading.tsx      # Conflicts loading skeleton
│           │   └── error.tsx        # Conflicts error boundary
│           ├── history/
│           │   ├── page.tsx         # Sync history
│           │   ├── loading.tsx      # History loading skeleton
│           │   └── error.tsx        # History error boundary
│           └── version-diff/
│               ├── page.tsx        # Version diff view
│               ├── loading.tsx     # Version diff loading skeleton
│               └── error.tsx        # Version diff error boundary
├── actions/
│   ├── sync.action.ts               # Server action for sync operations
│   └── conflicts.action.ts           # Server action for conflict resolution
├── components/
│   ├── conflict/
│   │   ├── ConflictsClient.tsx      # Conflict page client component
│   │   └── ConflictResolver.tsx     # Conflict resolution UI
│   ├── integrations/
│   │   ├── IntegrationDetail.tsx    # Integration detail view
│   │   ├── IntegrationsClient.tsx   # Integrations list client
│   │   ├── IntegrationIcon.tsx     # Integration icon component
│   │   ├── StatusBadge.tsx          # Status indicator badge
│   │   ├── StatCard.tsx             # Statistic card component
│   │   └── hystory/
│   │       └── HistoryTable.tsx      # Sync history table
│   ├── sync/
│   │   └── SyncButton.tsx           # Sync trigger button + preview dialog
│   └── ui/                          # Shared UI primitives (shadcn)
│       ├── button.tsx
│       ├── badge.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── table.tsx
│       └── ...
├── lib/
│   ├── api.ts                       # API fetch wrapper + response types
│   ├── mock-data.ts                 # Mock integrations/history/conflicts
│   └── utils.ts                     # Utility functions
├── services/
│   └── sync.service.ts              # Server-only sync/data access layer
├── types/
│   └── sync.ts                      # TypeScript types for sync domain
└── test/
    ├── setup.ts                     # Test configuration & mocks
    └── e2e/                         # Playwright E2E tests
```

### Key Design Decisions

**1. Separation of Concerns**

- UI components (`/components`) are isolated from business logic
- Server actions (`/actions`) handle mutations securely
- Services (`/services`) abstract data access

**2. Error Boundaries**

- Each route segment has its own error and loading boundaries
- Prevents full-page crashes from component errors
- Graceful degradation with retry options

**3. API Abstraction**

- `lib/api.ts` wraps fetch with typed responses
- `lib/mock-data.ts` provides demo data when API is unavailable
- Strict `ApiResponse<T>` contract for all API calls

**4. Conflict Resolution Flow**

1. User clicks "Sync Now"
2. System fetches preview with changes
3. Changes displayed in approval dialog
4. User reviews and approves
5. Sync applied and history updated

---

## Troubleshooting

### Common Issues

#### 1. Port 3000 Already in Use

```bash
# Find and kill the process using port 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use a different port
docker run -p 3001:3000 sync-panel
```

#### 2. Docker Build Fails

```bash
# Clean Docker cache and rebuild
docker system prune -a
docker compose up -d --build
```

#### 3. API Connection Issues

The application will still work with mock data if the API is unavailable. To verify API connectivity:

```bash
# Check if API is reachable
curl -I https://portier-takehometest.onrender.com/api/v1/data/sync?application_id=salesforce

# Override API URL if needed
docker run -p 3000:3000 \
  -e API_BASE_URL=https://your-api.com/api/v1 \
  sync-panel
```

#### 4. Container Won't Start

```bash
# View container logs for errors
docker compose logs web

# Check if container is running
docker compose ps

# Restart with fresh build
docker compose down
docker compose up -d --build
```

#### 5. Permission Denied on Linux

```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
# Log out and back in, or run:
newgrp docker
```

### Health Check

The Docker setup includes a health check. Verify container health:

```bash
docker compose ps
```

A healthy container shows `healthy` under the Status column.

### Need Help?

If you encounter issues not covered here:

1. Check the [Docker documentation](https://docs.docker.com/)
2. Review the [Next.js documentation](https://nextjs.org/docs)
3. Open an issue on the project repository

---

## License

Private - All rights reserved
