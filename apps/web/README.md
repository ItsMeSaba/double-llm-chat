# Web App

This is the frontend React application for the Supernova Task project.

## Setup

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Create a `.env` file in the root of this directory with:

```env
VITE_SERVER_URL=http://localhost:3000
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## Features

- **Authentication**: Login and registration with JWT tokens
- **Chat Interface**: Dual chat interface for comparing AI models
- **Responsive Design**: Modern UI with SCSS styling

## Auth Services

The app includes authentication services that communicate with the backend:

- `login(credentials)`: Authenticates user and returns access token
- `register(credentials)`: Creates new user account and returns access token
- Automatic token management and refresh handling
- Secure HTTP client with automatic authorization headers

## Development

- Built with React 19, TypeScript, and Vite
- Uses React Router for navigation
- SCSS for styling
- ESLint for code quality
