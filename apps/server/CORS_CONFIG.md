# CORS Configuration

This document explains the CORS (Cross-Origin Resource Sharing) configuration for the server.

## Current Configuration

The server is configured with a whitelist approach that allows requests from specific origins:

### Default Allowed Origins

- `http://localhost:5173` - Vite development server (default)
- `http://localhost:3000` - Server itself (if needed)
- `http://127.0.0.1:5173` - Alternative localhost
- `http://127.0.0.1:3000` - Alternative server

## Customizing CORS

### Option 1: Environment Variable

Set the `ALLOWED_ORIGINS` environment variable with a comma-separated list:

```bash
# .env file
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com,https://app.yourdomain.com

# Or in your shell
export ALLOWED_ORIGINS="http://localhost:5173,https://yourdomain.com"
```

### Option 2: Modify the Configuration File

Edit `src/config/cors.ts` to change the default allowed origins:

```typescript
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "https://yourdomain.com", // Production domain
  "https://app.yourdomain.com", // App subdomain
];
```

## CORS Features

- **Origin Whitelisting**: Only specified origins are allowed
- **Credentials Support**: Cookies and authorization headers are supported
- **Flexible Methods**: GET, POST, PUT, DELETE, OPTIONS are allowed
- **Standard Headers**: Common headers like Authorization, Content-Type are allowed
- **Logging**: Blocked requests are logged for debugging

## Security Benefits

1. **Origin Restriction**: Prevents unauthorized domains from accessing your API
2. **Credential Protection**: Ensures cookies and auth headers are only sent to trusted origins
3. **Method Control**: Limits HTTP methods to only what's necessary
4. **Header Validation**: Ensures only expected headers are sent

## Testing CORS

### Allowed Origin (should work)

```bash
curl -H "Origin: http://localhost:5173" \
     -H "Content-Type: application/json" \
     -X POST http://localhost:3000/auth/login \
     -d '{"email":"test@example.com","password":"password"}'
```

### Blocked Origin (should fail)

```bash
curl -H "Origin: http://malicious-site.com" \
     -H "Content-Type: application/json" \
     -X POST http://localhost:3000/auth/login \
     -d '{"email":"test@example.com","password":"password"}'
```

## Troubleshooting

### Common Issues

1. **CORS Error in Browser**: Check if your frontend origin is in the allowed list
2. **Credentials Not Sent**: Ensure `credentials: true` is set in your frontend fetch calls
3. **Preflight Fails**: Verify that OPTIONS method is allowed and headers are correct

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=cors
```

## Production Considerations

For production, consider:

1. **HTTPS Only**: Only allow HTTPS origins
2. **Specific Domains**: Limit to your actual production domains
3. **Environment Separation**: Different origins for staging vs production
4. **Monitoring**: Log CORS violations for security monitoring

## Example Production Configuration

```bash
# Production .env
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com,https://admin.yourdomain.com
NODE_ENV=production
```
