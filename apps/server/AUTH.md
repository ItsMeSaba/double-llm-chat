# Authentication System

This server implements a secure JWT-based authentication system with refresh token rotation and family ID tracking.

## Overview

The authentication system uses a dual-token approach:

- **Access Tokens**: Short-lived (15 minutes) for API requests
- **Refresh Tokens**: Long-lived (7 days) for obtaining new access tokens

## Security Features

### 1. Token Rotation

- When a new refresh token is issued, the previous one is marked as "rotated"
- Only the latest refresh token is valid for each user
- Prevents token replay attacks

### 2. Family ID System

- Each refresh token belongs to a "family" identified by a unique `familyId`
- If a compromised token is detected, all tokens in that family are revoked
- Provides protection against token theft scenarios

### 3. Secure Storage

- Refresh tokens are hashed with bcrypt before database storage
- Access tokens are stateless and not stored
- HTTP-only cookies prevent XSS attacks

## Token Lifecycle

### Login Flow

1. User provides email/password
2. Server validates credentials
3. Generates access token (15min) and refresh token (7d)
4. Stores hashed refresh token in database with family ID
5. Returns access token to client, sets refresh token as HTTP-only cookie

### Token Refresh Flow

1. Client sends refresh token (from cookie)
2. Server verifies token and checks if it's active
3. If valid: generates new access token and optionally new refresh token
4. If compromised: revokes entire token family

### Logout Flow

1. Client sends logout request
2. Server marks refresh token as "revoked"
3. Client clears access token

## Database Schema

```sql
refresh_tokens:
- id: Primary key
- userId: Foreign key to users table
- tokenHash: Bcrypt hashed refresh token
- familyId: Unique family identifier
- status: 'active' | 'rotated' | 'revoked'
- expiresAt: Token expiration timestamp
- createdAt: Token creation timestamp
```

## Security Considerations

- **JWT Secret**: Must be strong and kept secure
- **HTTPS Only**: In production, all tokens should be transmitted over HTTPS
- **Token Expiration**: Short access token lifetime limits exposure window
- **Family Revocation**: Compromised tokens trigger family-wide revocation
- **Input Validation**: All authentication inputs are validated and sanitized

## Environment Variables

```env
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production  # Enables secure cookie settings
```

## API Endpoints

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout (revokes tokens)
