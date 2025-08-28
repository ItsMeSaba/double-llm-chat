# Supernova Task Server

Express.js server with TypeScript for the Supernova Task application.

## Features

- 🚀 Express.js server with TypeScript
- 🔒 Security middleware (Helmet, CORS)
- 📝 Request logging with Morgan
- 🏥 Health check endpoints
- ⚡ Hot reload during development
- 🎯 Error handling middleware
- 📦 Modular route structure

## Quick Start

### Prerequisites

- Node.js 18+
- Yarn package manager

### Installation

1. Install dependencies:

```bash
yarn install
```

2. Copy environment file:

```bash
cp env.example .env
```

3. Start development server:

```bash
yarn dev
```

The server will start on `http://localhost:3000`

## Available Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn typecheck` - Run TypeScript type checking
- `yarn lint` - Run ESLint
- `yarn test` - Run tests

## API Endpoints

### Health Checks

- `GET /health` - Server status
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### API Routes

- `GET /api/example` - Example GET endpoint
- `POST /api/example` - Example POST endpoint

### Root

- `GET /` - Welcome message

## Project Structure

```
src/
├── index.ts          # Main server file
├── routes/           # Route definitions
│   ├── index.ts      # Route setup
│   ├── healthRoutes.ts
│   └── apiRoutes.ts
└── middleware/       # Custom middleware
    ├── errorHandler.ts
    └── notFoundHandler.ts
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Development

The server uses `tsx` for development, which provides fast TypeScript compilation and hot reloading.

## Production

Build the project with `yarn build` and start with `yarn start`. The compiled JavaScript will be in the `dist/` folder.
