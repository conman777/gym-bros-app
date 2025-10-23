# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security vulnerabilities by:

1. **Email**: security@yourdomain.com (or project maintainer)
2. **Private disclosure**: Contact project maintainers directly

### What to Include

When reporting a vulnerability, please include:

- **Description**: Clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Impact**: Potential impact if exploited
- **Affected Versions**: Which versions are affected
- **Suggested Fix**: If you have a suggestion for fixing it

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Every 7 days until resolved
- **Fix Timeline**: Critical issues within 7 days, others within 30 days

## Security Measures

### Authentication & Authorization

- **Cookie-Based Sessions**: HTTP-only, SameSite=Lax, Secure in production
- **Password Hashing**: bcryptjs with 10 salt rounds
- **Middleware Protection**: All protected routes verified by middleware
- **API Authentication**: All sensitive endpoints check userId cookie

### Input Validation

- **Type Safety**: TypeScript for compile-time type checking
- **Runtime Validation**: API routes validate all inputs
- **Prisma ORM**: Parameterized queries prevent SQL injection
- **Schema Validation**: Database constraints enforce data integrity

### Data Protection

- **Password Storage**: Never stored in plain text, always hashed
- **Sensitive Data**: Passwords excluded from all API responses
- **Logging**: Sensitive data never logged to console/files
- **Environment Variables**: Secrets in `.env` files (never committed)

### API Security

- **CORS**: Same-origin policy enforced
- **Rate Limiting**: (Planned) Prevent abuse of API endpoints
- **Error Handling**: Generic error messages to prevent information leakage
- **HTTPS Only**: Enforced in production via secure cookie flag

### Database Security

- **Connection Pooling**: Managed by Prisma
- **Prepared Statements**: All queries parameterized
- **Least Privilege**: Database user has minimal required permissions
- **Backup Strategy**: Regular automated backups (production)

## Known Security Considerations

### Current Limitations

1. **No Email Verification**: Email addresses are optional and unverified
2. **No 2FA**: Two-factor authentication not yet implemented
3. **No Rate Limiting**: API requests not currently rate-limited
4. **No CAPTCHA**: No protection against automated bot registration
5. **Session Management**: No session invalidation on password change

### Planned Improvements

- [ ] Implement email verification
- [ ] Add two-factor authentication (TOTP)
- [ ] Implement API rate limiting (per IP and per user)
- [ ] Add CAPTCHA on registration/login
- [ ] Implement session management with invalidation
- [ ] Add Content Security Policy (CSP) headers
- [ ] Implement audit logging for sensitive operations

## Security Best Practices for Contributors

### Code Review Checklist

Before submitting code:

- [ ] No passwords or secrets in code
- [ ] All user inputs validated
- [ ] Database queries use parameterized statements
- [ ] Error messages don't leak sensitive information
- [ ] Authentication/authorization properly implemented
- [ ] Sensitive data excluded from logs and responses

### Dependencies

- **Regular Updates**: Keep dependencies up to date
- **Vulnerability Scanning**: Use `npm audit` before releases
- **Trusted Sources**: Only use well-maintained packages
- **Minimal Dependencies**: Avoid unnecessary packages

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if safe)
npm audit fix

# Manual review for breaking changes
npm audit fix --force
```

### Environment Variables

**Never commit `.env` files!**

Required environment variables:

- `DATABASE_URL`: Database connection string
- `NODE_ENV`: Environment (development/production)

Optional but recommended:

- `SESSION_SECRET`: For signing session cookies
- `RATE_LIMIT_MAX`: Max requests per window
- `RATE_LIMIT_WINDOW`: Time window for rate limiting

## Secure Development Workflow

### Local Development

```bash
# 1. Use separate .env for development
cp .env.example .env.development.local

# 2. Never use production credentials locally
DATABASE_URL="file:./dev.db"  # Use local SQLite

# 3. Run security checks before commit
npm audit
npm run test
```

### Production Deployment

```bash
# 1. Use environment variables (not .env files)
# Set via hosting platform (Vercel, Railway, etc.)

# 2. Enable all security features
NODE_ENV="production"  # Enables secure cookies, etc.

# 3. Regular security updates
npm audit
npm update
```

## Incident Response Plan

### If a Security Issue is Discovered

1. **Contain**: Immediately patch or temporarily disable affected feature
2. **Assess**: Determine scope and impact of vulnerability
3. **Fix**: Develop and test fix
4. **Deploy**: Deploy fix to production ASAP
5. **Notify**: Inform affected users if data was compromised
6. **Document**: Update CHANGELOG.md and this SECURITY.md

### User Notification Template

If user data is compromised:

```
Subject: Security Notice - [Brief Description]

Dear User,

We discovered a security issue on [DATE] that may have affected your account.

What happened:
[Description of issue]

What information was affected:
[List of affected data]

What we've done:
[Actions taken to fix]

What you should do:
[Actions users should take]

Questions? Contact: security@yourdomain.com
```

## Security Headers

Recommended HTTP security headers (add via middleware):

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}
```

## Compliance

### GDPR Considerations

If serving EU users:

- [ ] Implement data export functionality
- [ ] Implement data deletion (right to be forgotten)
- [ ] Add cookie consent banner
- [ ] Create privacy policy
- [ ] Implement data processing agreement

### HIPAA Considerations

If handling health data (rehab exercises may qualify):

- [ ] Encrypt data at rest and in transit
- [ ] Implement audit logging
- [ ] Add BAA (Business Associate Agreement)
- [ ] Implement access controls
- [ ] Regular security assessments

**Note**: Current implementation is NOT HIPAA-compliant. Consult legal counsel before handling Protected Health Information (PHI).

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)

## Contact

For security concerns, contact:

- **Email**: security@yourdomain.com
- **PGP Key**: [Link to public key]

---

Last updated: 2025-01-15
