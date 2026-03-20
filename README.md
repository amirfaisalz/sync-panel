# Integration Sync Panel

A Web App Integration Sync Panel for B2B SaaS platforms that connects to multiple external services (Salesforce, HubSpot, Stripe, etc.).

## Features

- **Integrations List** - Overview of all integrations with status indicators (Synced, Syncing, Conflict, Error)
- **Integration Detail** - Summary, Sync Now trigger, preview of incoming changes
- **Sync History & Versioning** - Past sync events with version tracking and change inspection
- **Conflict Resolution** - Side-by-side comparison UI with per-field resolution choices

## Tech Stack

- **Framework**: Next.js 16.2.0 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: @base-ui/react, shadcn, lucide-react, sonner
- **Runtime**: Node.js 20+

## Getting Started

### Prerequisites

- Node.js 20+
- npm, yarn, pnpm, or bun

### Environment Variables

Create a local env file (for example `.env.local`) and set:

- **`API_BASE_URL`**: Base URL for the sync API. Default: `https://portier-takehometest.onrender.com/api/v1`

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Docker

```bash
# Build and run with Docker Compose
npm run docker:up # then open http://localhost:3000

# Run compose in the foreground (build + logs)
npm run docker:dev

# Or build the image manually
npm run docker:build
docker run -p 3000:3000 sync-panel

# Stop containers
npm run docker:down

# Clean up (remove volumes and images)
npm run docker:clean
```

## API

The application integrates with the Portier sync API:

- **Endpoint**: `GET /data/sync?application_id=<id>` (base URL is `API_BASE_URL`)
- **Fallback**: Uses mock sync preview data when the API is unavailable

### Error Handling

The UI handles the following error states:

- `4xx` - Client errors (bad request, unauthorized, etc.)
- `500` - Internal server error
- `502` - Gateway error (integration service down)
- `503` - Service unavailable
- Network/operational failures - surfaced as an error response and may fall back to mock data when available

## Architecture

```
src/
├── app/
│   ├── page.tsx                           # Redirects to /integrations
│   └── integrations/
│       ├── page.tsx                       # Integrations list
│       └── [id]/
│           ├── page.tsx                   # Integration detail
│           ├── conflicts/page.tsx         # Conflict resolution screen
│           ├── history/page.tsx           # Sync history screen
│           └── version-diff/page.tsx      # Version diff screen
├── components/
│   ├── integrations/          # Integration-specific components
│   ├── sync/                  # Sync/conflict resolution UI
│   └── ui/                    # Shared UI primitives
├── lib/
│   ├── api.ts                 # API response helpers + fetch wrapper
│   ├── mock-data.ts           # Mock integrations/history/conflicts
│   └── utils.ts               # Shared utilities
├── services/
│   └── sync.service.ts         # Server-only sync/data access layer
└── types/
    └── sync.ts                 # TypeScript types for sync domain
```

## Design Decisions

### Why @base-ui/react?

Used @base-ui/react for the Button primitive component as it provides:

- Accessible components out of the box
- Unstyled base primitives that work seamlessly with Tailwind
- Consistent behavior across the application

### Error Handling Strategy

1. API calls return a strict `ApiResponse<T>` contract
2. Error messages are mapped to common HTTP failures (4xx/500/502)
3. Graceful fallback to mock data for sync preview when the API is unavailable
4. Clear UI states for conflict/error/syncing

### Conflict Resolution Flow

1. User clicks "Sync Now"
2. System fetches preview with changes and detects conflicts
3. Conflicts displayed with side-by-side comparison
4. User resolves each conflict (keep local, use external, or custom value)
5. User confirms sync when all conflicts resolved
