# Technical Context: Trendcaster Application

## Project Overview
Trendcaster is a monorepo application built with NextJS, featuring a web frontend, server backend, and AI-powered workflows using Mastra.

## Architecture
- **Monorepo Structure**: Using pnpm workspaces with Turbo for build orchestration
- **Frontend**: NextJS 15 web application
- **Backend**: NextJS 15 API server with oRPC
- **AI Workflows**: Mastra framework for AI agent orchestration

## Frontend Technologies (apps/web)

### Core Framework
- **Next.js**: `15.3.0` with Turbopack for development
- **React**: `^19.1.1` (React 19)
- **TypeScript**: `^5.9.2`

### UI & Styling
- **Tailwind CSS**: `^4.1.12` with PostCSS integration
- **Radix UI**: `^1.4.3` for accessible components
- **Lucide React**: `^0.487.0` for icons
- **Class Variance Authority**: `^0.7.1` for component variants
- **clsx**: `^2.1.1` for conditional classes
- **tw-animate-css**: `^1.3.6` for animations

### State Management & Data Fetching
- **TanStack React Query**: `^5.85.3` for server state management
- **TanStack React Form**: `^1.19.2` for form handling
- **oRPC**: `^1.8.1` for type-safe API calls
  - `@orpc/client`: `^1.8.1`
  - `@orpc/server`: `^1.8.1`
  - `@orpc/tanstack-query`: `^1.8.1`

### AI Integration
- **Vercel AI SDK**: `ai@^5.0.14`
- **AI SDK React**: `@ai-sdk/react@^2.0.14`

### Authentication
- **Better Auth**: `^1.3.6` for authentication system

### Utilities
- **Zod**: `^4.0.17` for schema validation
- **Sonner**: `^2.0.7` for toast notifications
- **Tailwind Merge**: `^3.3.1` for class merging

## Backend Technologies (apps/server)

### Core Framework
- **Next.js**: `15.3.0` with Turbopack
- **React**: `^19.1.1` (for SSR/API routes)
- **TypeScript**: `^5.9.2`

### AI & Workflow Engine
- **Mastra**: `latest` - AI agent orchestration framework
  - `@mastra/core`: Core framework
  - `@mastra/libsql`: SQLite integration
  - `@mastra/loggers`: Logging system
  - `@mastra/memory`: Memory management
- **Vercel AI SDK**: `ai@^5.0.14`
- **AI SDK Providers**:
  - `@ai-sdk/google`: `^2.0.6` for Google AI
  - `@ai-sdk/openai`: `^1.3.24` for OpenAI

### Database & ORM
- **Drizzle ORM**: `^0.44.4` for database operations
- **Drizzle Kit**: `^0.31.4` for migrations and schema management
- **LibSQL**: `@libsql/client@^0.15.11` (Turso database client)

### API & Communication
- **oRPC**: `^1.8.1` for type-safe RPC
  - `@orpc/client`: `^1.8.1`
  - `@orpc/server`: `^1.8.1`

### Authentication
- **Better Auth**: `^1.3.6` for authentication system

### Utilities
- **Zod**: `^3.25.76` for schema validation
- **dotenv**: `^17.2.1` for environment variables
- **exa-js**: `^1.8.27` for file operations

## Development Tools

### Build & Development
- **Turbo**: `^2.5.5` for monorepo build orchestration
- **Biome**: `^2.2.0` for linting and formatting
- **pnpm**: `10.14.0` as package manager

### Database Development
- **Turso**: Local SQLite development database
- **Drizzle Studio**: Database management interface

## Development Environment

### Requirements
- **Node.js**: v20+ recommended
- **Package Manager**: pnpm 10.14.0+
- **Database**: Turso (LibSQL) for local development

### Scripts
- `pnpm dev`: Start all applications
- `pnpm dev:web`: Start web frontend only
- `pnpm dev:server`: Start server backend only
- `pnpm db:push`: Push database schema changes
- `pnpm db:studio`: Open Drizzle Studio
- `pnpm check`: Run Biome linting and formatting

## Key Features

### AI-Powered Workflows
- **Research Agent**: Web search and content analysis
- **Learning Extraction**: Knowledge extraction from content
- **Report Generation**: Automated report creation
- **Evaluation**: Result assessment and validation
- **Web Summarization**: Content summarization from web sources

### Type Safety
- Full TypeScript implementation
- oRPC for end-to-end type safety
- Zod schemas for runtime validation

### Modern Development Experience
- Turbopack for fast development builds
- Hot reloading across the monorepo
- Integrated linting and formatting
- Database schema management tools

## Technical Constraints

- **Database**: SQLite-based (LibSQL/Turso)
- **Authentication**: Better Auth with JWT support
- **AI Integration**: Multiple AI providers (OpenAI, Google)
- **Monorepo**: Shared dependencies and build optimization
- **Type Safety**: Strict TypeScript configuration
