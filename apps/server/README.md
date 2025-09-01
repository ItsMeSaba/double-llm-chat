# Supernova Task Server

Express.js server with TypeScript for the Supernova Task application.

## Features

- 🚀 Express.js server with TypeScript
- 🔒 Security middleware (Helmet, CORS)
- 🍪 Cookie parsing with cookie-parser
- 📝 Request logging with Morgan
- 🏥 Health check endpoints
- ⚡ Hot reload during development
- 🎯 Error handling middleware
- 📦 Modular route structure
- 🌐 Configurable CORS with origin whitelisting

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
- `yarn test-cors` - Test CORS configuration

## API Endpoints

### Health Checks

- `GET /health` - Server status
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout (revokes refresh token)

### Cookie Testing (Development)

- `GET /cookie-test/test-cookies` - Set test cookies
- `GET /cookie-test/read-cookies?cookieName=name` - Read specific cookies

### Root

- `GET /` - Welcome message

## Project Structure

```
src/
├── index.ts          # Main server file
├── config/           # Configuration files
│   └── cors.ts       # CORS configuration
├── routes/           # Route definitions
│   ├── index.ts      # Route setup
│   ├── healthRoutes.ts
│   ├── auth.ts       # Authentication routes
│   ├── cookie-test.ts # Cookie testing routes
│   └── apiRoutes.ts
├── middleware/       # Custom middleware
│   ├── errorHandler.ts
│   └── notFoundHandler.ts
└── base/             # Base utilities
    └── helpers/      # Helper functions
        └── auth/     # Authentication helpers
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT tokens
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins

## CORS Configuration

The server uses a whitelist approach for CORS. By default, it allows requests from:

- `http://localhost:5173` - Vite development server
- `http://localhost:3000` - Server itself
- `http://127.0.0.1:5173` - Alternative localhost
- `http://127.0.0.1:3000` - Alternative server

### Customizing CORS

You can customize allowed origins by setting the `ALLOWED_ORIGINS` environment variable:

```bash
# .env file
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com,https://app.yourdomain.com
```

For more details, see [CORS_CONFIG.md](./CORS_CONFIG.md).

## Cookie Handling

The server uses `cookie-parser` middleware to handle cookies properly. This is essential for:

- **Authentication**: Storing and reading refresh tokens
- **Session Management**: Managing user sessions
- **Security**: Proper cookie validation and parsing

### Cookie Features

- **HTTP-Only Cookies**: Secure cookie storage
- **Signed Cookies**: Tamper-proof cookies for sensitive data
- **Secure Cookies**: HTTPS-only in production
- **SameSite Policy**: CSRF protection
- **Expiration**: Configurable cookie lifetimes

### Testing Cookies

Use the cookie test routes to verify cookie functionality:

```bash
# Set test cookies
curl http://localhost:3000/cookie-test/test-cookies

# Read specific cookies
curl "http://localhost:3000/cookie-test/read-cookies?cookieName=test-cookie"
```

## Development

The server uses `tsx` for development, which provides fast TypeScript compilation and hot reloading.

## Production

Build the project with `yarn build` and start with `yarn start`. The compiled JavaScript will be in the `dist/` folder.

### Production CORS Considerations

- Only allow HTTPS origins
- Limit to your actual production domains
- Monitor CORS violations for security
- Use environment-specific configurations

### Production Cookie Considerations

- Use HTTPS in production for secure cookies
- Set appropriate SameSite policies
- Configure proper cookie expiration times
- Use signed cookies for sensitive data
