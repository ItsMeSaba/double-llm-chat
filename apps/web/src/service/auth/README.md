# Authentication Services

This directory contains authentication-related services for the web application.

## Services

### Login Service (`login.ts`)

Handles user authentication by calling the backend `/auth/login` endpoint.

**Usage:**

```typescript
import { login } from "./auth";

const result = await login({
  email: "user@example.com",
  password: "password123",
});

if (result.success) {
  // Store the access token
  setAccessToken(result.accessToken);
  // Redirect to dashboard
} else {
  // Handle error
  console.error(result.error);
}
```

### Register Service (`register.ts`)

Handles user registration by calling the backend `/auth/register` endpoint.

**Usage:**

```typescript
import { register } from "./auth";

const result = await register({
  email: "newuser@example.com",
  password: "password123",
  repeatPassword: "password123",
});

if (result.success) {
  // Store the access token
  setAccessToken(result.accessToken);
  // Redirect to dashboard
} else {
  // Handle error
  console.error(result.error);
}
```

## Response Types

Both services return a response object with:

- `success`: boolean indicating if the operation succeeded
- `accessToken`: JWT token for authenticated requests (if successful)
- `user`: user information (if successful)
- `error`: error message (if failed)

## Error Handling

The services handle various error scenarios:

- Network errors
- Backend validation errors
- Server errors
- Authentication failures

## Security Features

- Automatic token management
- Secure HTTP client with credentials
- Automatic token refresh handling
- Input validation and sanitization
