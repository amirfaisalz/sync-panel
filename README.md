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
- **UI Components**: @base-ui/react, lucide-react
- **Runtime**: Node.js 20+

## Getting Started

### Prerequisites

- Node.js 20+
- npm, yarn, pnpm, or bun

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
npm run docker:up

# Or build the image manually
npm run docker:build
docker run -p 3000:3000 nextjs-app

# View logs
npm run docker:logs

# Stop containers
npm run docker:down

# Clean up (remove volumes and images)
npm run docker:clean
```

## API

The application integrates with the Portier sync API:

- **Endpoint**: `POST https://portier-takehometest.onrender.com/api/v1/data/sync`
- **Fallback**: Uses mock data when API is unavailable

### Error Handling

The UI handles the following error states:

- `4xx` - Client errors (bad request, unauthorized, etc.)
- `500` - Internal server error
- `502` - Gateway error (integration service down)
- `503` - Service unavailable
- `timeout` - Request timeout

## Architecture

```
src/
├── app/
│   ├── integrations/
│   │   ├── page.tsx           # Integrations list
│   │   └── [id]/page.tsx      # Integration detail
│   └── layout.tsx             # Root layout
├── components/
│   ├── integrations/          # Integration-specific components
│   ├── sync/                  # Sync/conflict resolution UI
│   └── ui/                    # Shared UI primitives
├── hooks/
│   └── useSync.ts             # Sync state management
└── lib/
    ├── api.ts                 # API client with error handling
    ├── mock-data.ts           # Mock data for development
    └── types.ts               # TypeScript type definitions
```

## Design Decisions

### Why @base-ui/react?

Used @base-ui/react for the Button primitive component as it provides:

- Accessible components out of the box
- Unstyled base primitives that work seamlessly with Tailwind
- Consistent behavior across the application

### Error Handling Strategy

1. API calls include timeout handling (10s default, 15s for sync)
2. Graceful fallback to mock data when API is unavailable
3. User-friendly error messages mapped to HTTP status codes
4. Clear visual indicators for different error types

### Conflict Resolution Flow

1. User clicks "Sync Now"
2. System fetches preview with changes and detects conflicts
3. Conflicts displayed with side-by-side comparison
4. User resolves each conflict (keep local, use external, or custom value)
5. User confirms sync when all conflicts resolved

## Assumptions

## Future Improvements
