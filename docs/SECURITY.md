# TrustWork App - Secure Software Development Life Cycle (SSDLC) Policy

**Version:** 2.0  
**Last Updated:** October 29, 2025  
**Maintained By:** TrustWork Security Team  
**Classification:** Internal Use

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Security Principles](#2-security-principles)
3. [Threat Model & Risk Assessment](#3-threat-model--risk-assessment)
4. [SSDLC Phases](#4-ssdlc-phases)
5. [Security Requirements](#5-security-requirements)
6. [Secure Development Standards](#6-secure-development-standards)
7. [Security Testing & Validation](#7-security-testing--validation)
8. [Deployment & Operations Security](#8-deployment--operations-security)
9. [Incident Response](#9-incident-response)
10. [Security Training & Awareness](#10-security-training--awareness)
11. [Compliance & Audit](#11-compliance--audit)

---

## 1. Executive Summary

This Secure Software Development Life Cycle (SSDLC) policy establishes security requirements, processes, and standards for the TrustWork application. It ensures security is integrated at every phase of development, from planning to deployment and maintenance.

### 1.1 Scope

This policy applies to:

- All TrustWork application code (frontend, backend, APIs)
- Third-party dependencies and libraries
- Infrastructure and deployment configurations
- CI/CD pipelines
- All team members contributing to the codebase

---

## 2. Security Principles

### 2.1 Core Security Principles

- **Defense in Depth:** Multiple layers of security controls
- **Least Privilege:** Minimal access rights for users, processes, and systems
- **Fail Secure:** System defaults to secure state on failure
- **Separation of Duties:** No single person has complete control
- **Zero Trust:** Verify explicitly, never assume trust
- **Security by Design:** Security integrated from inception, not added later
- **Privacy by Default:** User data protected by default settings

### 2.2 Data Protection Principles

- **Data Minimization:** Collect only necessary data
- **Encryption at Rest and in Transit:** All sensitive data encrypted
- **Data Retention:** Clear policies for data lifecycle
- **Right to Erasure:** User data deletion capabilities
- **Audit Trail:** Comprehensive logging of data access

### 2.3 Development Principles

- **No Secrets in Code:** All credentials in environment variables
- **Immutable Infrastructure:** Infrastructure as Code (IaC)
- **Automated Security Testing:** Security scans in CI/CD
- **Code Review Mandatory:** All code reviewed before merge
- **Dependency Management:** Regular updates and vulnerability scanning

---

## 3. Threat Model & Risk Assessment

### 3.1 Asset Classification

| Asset | Classification | Impact if Compromised |
|-------|---------------|----------------------|
| User Credentials | Critical | Identity theft, unauthorized access |
| Personal Data (PII) | Critical | Privacy violation, legal liability |
| Financial Data | Critical | Financial fraud, reputation damage |
| Application Code | High | IP theft, vulnerability exploitation |
| API Keys & Secrets | Critical | Unauthorized access, data breach |
| Session Tokens | High | Account takeover |
| Audit Logs | Medium | Evidence tampering |

### 3.2 Threat Categories

#### 3.2.1 Authentication & Authorization Threats

- **Authentication Bypass:** Exploiting weak auth mechanisms
  - **Mitigation:** Supabase Auth with MFA, session timeouts, RLS
- **Credential Stuffing:** Automated login attempts with stolen credentials
  - **Mitigation:** Rate limiting, CAPTCHA, anomaly detection
- **Session Hijacking:** Stealing active session tokens
  - **Mitigation:** Secure cookies (HttpOnly, Secure, SameSite), short expiration
- **Privilege Escalation:** Gaining unauthorized elevated permissions
  - **Mitigation:** Role-based access control (RBAC), backend validation

#### 3.2.2 Data Security Threats

- **Data Exposure:** Unauthorized access to sensitive data
  - **Mitigation:** RLS policies, encryption, access logging
- **SQL Injection:** Malicious SQL via user input
  - **Mitigation:** Parameterized queries, ORM usage, input validation
- **Data Leakage:** Sensitive data in logs, errors, or responses
  - **Mitigation:** Sanitize logs, generic error messages, data masking

#### 3.2.3 Application Security Threats

- **Cross-Site Scripting (XSS):** Injecting malicious scripts
  - **Mitigation:** React auto-escaping, CSP headers, input sanitization
- **Cross-Site Request Forgery (CSRF):** Unauthorized actions via user browser
  - **Mitigation:** CSRF tokens, SameSite cookies, origin validation
- **Insecure Deserialization:** Exploiting object deserialization
  - **Mitigation:** Validate all deserialized data, use safe parsers
- **Server-Side Request Forgery (SSRF):** Exploiting server requests
  - **Mitigation:** Whitelist URLs, validate inputs, network segmentation

#### 3.2.4 Infrastructure Threats

- **Denial of Service (DoS):** Overwhelming system resources
  - **Mitigation:** Rate limiting, CDN, auto-scaling, error boundaries
- **Supply Chain Attacks:** Compromised dependencies
  - **Mitigation:** Snyk scanning, SRI hashes, dependency pinning, private registry
- **Misconfiguration:** Insecure default settings
  - **Mitigation:** Security hardening checklists, automated scanning

#### 3.2.5 API Security Threats

- **Broken Object Level Authorization (BOLA):** Accessing unauthorized objects
  - **Mitigation:** Validate object ownership, RLS, UUID usage
- **Excessive Data Exposure:** APIs returning more data than needed
  - **Mitigation:** Response filtering, field-level permissions
- **Rate Limit Bypass:** Circumventing rate limiting
  - **Mitigation:** Distributed rate limiting, IP + user-based limits

### 3.3 Risk Assessment Matrix

| Risk | Likelihood | Impact | Risk Level | Priority |
|------|-----------|--------|-----------|----------|
| Authentication Bypass | Medium | Critical | High | P1 |
| Data Breach via RLS Bypass | Low | Critical | High | P1 |
| XSS Attack | Medium | High | High | P1 |
| Credential Stuffing | High | High | High | P1 |
| Supply Chain Attack | Medium | High | High | P2 |
| DoS Attack | Medium | Medium | Medium | P2 |
| CSRF | Low | Medium | Low | P3 |

---

## 4. SSDLC Phases

### 4.1 Phase 1: Requirements & Planning

#### 4.1.1 Security Requirements Gathering

- [ ] Identify sensitive data types (PII, financial, health)
- [ ] Define authentication and authorization requirements
- [ ] Determine compliance requirements (GDPR, CCPA, HIPAA, etc.)
- [ ] Establish data retention and deletion policies
- [ ] Define logging and monitoring requirements
- [ ] Create abuse cases alongside use cases

#### 4.1.2 Threat Modeling

- [ ] Conduct threat modeling workshop (STRIDE methodology)
- [ ] Document attack vectors and threat actors
- [ ] Create data flow diagrams (DFDs)
- [ ] Identify trust boundaries
- [ ] Prioritize threats using DREAD scoring
- [ ] Update threat model quarterly or on major changes

**Tools:** Microsoft Threat Modeling Tool, OWASP Threat Dragon

### 4.2 Phase 2: Design

#### 4.2.1 Security Architecture Review

- [ ] Design authentication and authorization architecture
- [ ] Plan encryption strategy (at rest and in transit)
- [ ] Design secure API architecture
- [ ] Plan logging and monitoring architecture
- [ ] Design secure database schema with RLS
- [ ] Create security control specifications

#### 4.2.2 Security Design Patterns

- **Authentication:** OAuth 2.0 / OpenID Connect (via Supabase)
- **Authorization:** Role-Based Access Control (RBAC) + RLS
- **API Security:** REST with JWT, rate limiting, input validation
- **Data Protection:** AES-256 encryption, TLS 1.3
- **Session Management:** Short-lived tokens, secure cookies

#### 4.2.3 Design Review Checklist

- [ ] Defense in depth implemented
- [ ] Least privilege enforced
- [ ] Secure defaults configured
- [ ] Error handling doesn't leak information
- [ ] All external inputs validated
- [ ] Sensitive data encrypted
- [ ] Security logging implemented

### 4.3 Phase 3: Implementation

#### 4.3.1 Secure Coding Standards

See [Section 6: Secure Development Standards](#6-secure-development-standards)

#### 4.3.2 Code Review Process

- [ ] All code requires peer review before merge
- [ ] Security-focused code review checklist used
- [ ] Automated static analysis (SAST) passes
- [ ] No secrets in code verified
- [ ] Input validation verified
- [ ] Authentication/authorization checks verified
- [ ] Error handling reviewed

#### 4.3.3 Branch Protection Rules

- [ ] Require pull request reviews (minimum 1 approver)
- [ ] Require status checks to pass
- [ ] Require branches to be up to date
- [ ] Require signed commits (optional but recommended)
- [ ] Restrict force pushes
- [ ] Restrict deletions

### 4.4 Phase 4: Testing & Validation

See [Section 7: Security Testing & Validation](#7-security-testing--validation)

### 4.5 Phase 5: Deployment

See [Section 8: Deployment & Operations Security](#8-deployment--operations-security)

### 4.6 Phase 6: Maintenance & Monitoring

#### 4.6.1 Continuous Monitoring

- [ ] Security event logging and alerting
- [ ] Failed authentication attempt monitoring
- [ ] Unusual access pattern detection
- [ ] Resource usage monitoring (DoS detection)
- [ ] Dependency vulnerability monitoring (Snyk)

#### 4.6.2 Patch Management

- [ ] Weekly dependency updates
- [ ] Critical security patches within 24 hours
- [ ] High severity patches within 7 days
- [ ] Medium severity patches within 30 days
- [ ] Automated dependency update PRs (Dependabot/Renovate)

#### 4.6.3 Regular Security Reviews

- [ ] Quarterly security architecture review
- [ ] Annual penetration testing
- [ ] Bi-annual threat model updates
- [ ] Monthly security metrics review

---

## 5. Security Requirements

### 5.1 Authentication Requirements

- [ ] Multi-factor authentication (MFA) available for all users
- [ ] Password requirements: minimum 12 characters, complexity enforced
- [ ] Account lockout after 5 failed login attempts (15-minute lockout)
- [ ] Session timeout: 30 minutes of inactivity, 12 hours absolute
- [ ] Password reset via secure email link (expires in 1 hour)
- [ ] OAuth 2.0 / Social login supported (Google, GitHub, etc.)
- [ ] Session invalidation on password change
- [ ] Concurrent session detection

### 5.2 Authorization Requirements

- [ ] Role-Based Access Control (RBAC) implemented
- [ ] Database Row-Level Security (RLS) enforced
- [ ] API authorization checks on all protected endpoints
- [ ] Frontend route protection with `ProtectedRoute` component
- [ ] Object-level authorization (users can only access their own data)
- [ ] Audit logging for authorization failures

### 5.3 Data Protection Requirements

- [ ] All sensitive data encrypted at rest (AES-256)
- [ ] All data in transit encrypted (TLS 1.3)
- [ ] Database connections encrypted
- [ ] API communications over HTTPS only
- [ ] Sensitive data masked in logs and error messages
- [ ] PII data access logged for audit
- [ ] Data retention policy: delete inactive accounts after 2 years
- [ ] User data export capability (GDPR compliance)
- [ ] User data deletion capability (right to erasure)

### 5.4 Input Validation Requirements

- [ ] All user inputs validated with Zod schemas
- [ ] Whitelist validation preferred over blacklist
- [ ] Server-side validation for all inputs (never trust client)
- [ ] File upload restrictions: type, size, content validation
- [ ] SQL injection prevention via parameterized queries
- [ ] XSS prevention via React auto-escaping and CSP
- [ ] Path traversal prevention in file operations

### 5.5 API Security Requirements

- [ ] Rate limiting: 100 requests per minute per IP
- [ ] API authentication required (JWT tokens)
- [ ] API versioning implemented
- [ ] Request/response logging (excluding sensitive data)
- [ ] CORS properly configured (whitelist allowed origins)
- [ ] API documentation does not expose security details
- [ ] GraphQL query depth limiting (if applicable)

### 5.6 Logging & Monitoring Requirements

- [ ] Security event logging enabled
- [ ] Log retention: 90 days minimum
- [ ] Logs stored securely and tamper-proof
- [ ] Sensitive data not logged (passwords, tokens, PII)
- [ ] Failed login attempts logged
- [ ] Authorization failures logged
- [ ] Administrative actions logged
- [ ] Real-time alerting for critical security events

---

## 6. Secure Development Standards

### 6.1 Environment Management

#### 6.1.1 Environment Variables

```bash
# .env (NEVER commit this file)
# Add to .gitignore

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API Keys (Backend only - prefix with VITE_ makes them public)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_test_xxx
SENDGRID_API_KEY=SG.xxx

# Security
VITE_APP_ENV=production
SESSION_SECRET=generate-random-secret
CSRF_SECRET=generate-random-secret

# Feature Flags
VITE_ENABLE_MFA=true
VITE_ENABLE_RATE_LIMITING=true
```

#### 6.1.2 Environment Variable Rules

- ✅ **DO:**
  - Use `.env` for all secrets
  - Add `.env` to `.gitignore`
  - Provide `.env.example` with dummy values
  - Use different secrets per environment (dev, staging, prod)
  - Rotate secrets regularly (quarterly)
  - Use a secrets manager for production (AWS Secrets Manager, Vault)

- ❌ **DON'T:**
  - Commit secrets to version control
  - Hardcode secrets in code
  - Share secrets via email or Slack
  - Use production secrets in development
  - Prefix backend secrets with `VITE_` (exposes them to frontend)

### 6.2 Authentication & Authorization

#### 6.2.1 Supabase Authentication Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'trustwork-auth',
  },
  global: {
    headers: {
      'X-Client-Info': 'trustwork-app',
    },
  },
})
```

#### 6.2.2 Protected Route Component

```typescript
// components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, role } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && !requiredRole.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
```

#### 6.2.3 Row-Level Security (RLS) Policies

```sql
-- supabase/migrations/001_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only update their own data
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Projects: users can only access their own or shared projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (
    auth.uid() = owner_id OR
    auth.uid() IN (
      SELECT user_id FROM project_members
      WHERE project_id = projects.id
    )
  );

-- Admin role check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM user_roles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin-only policy example
CREATE POLICY "Only admins can delete users"
  ON users FOR DELETE
  USING (is_admin());
```

### 6.3 Input Validation

#### 6.3.1 Zod Schema Examples

```typescript
// lib/validations.ts
import { z } from 'zod'

// User registration
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
})

// Project creation
export const projectSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().max(5000).optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']),
  deadline: z.string().datetime().optional(),
  budget: z.number().positive().max(1000000000).optional(),
})

// File upload
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type),
      'Invalid file type'
    ),
})

// Sanitization helper
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}
```

#### 6.3.2 Backend Validation

```typescript
// api/projects.ts
import { projectSchema } from '@/lib/validations'

export async function createProject(req: Request, res: Response) {
  try {
    // ALWAYS validate on backend
    const validated = projectSchema.parse(req.body)
    
    // Additional authorization check
    const user = await getCurrentUser(req)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Create project with validated data
    const project = await db.projects.create({
      data: {
        ...validated,
        owner_id: user.id,
      },
    })

    res.json(project)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      })
    }
    
    // Don't leak internal errors
    console.error('Project creation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

### 6.4 Error Handling

#### 6.4.1 Secure Error Handling

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

// Error handler middleware
export function errorHandler(err: Error, req: Request, res: Response) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    })
  }

  // Log full error for debugging
  console.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id,
  })

  // Return generic error to user
  res.status(500).json({
    error: 'An unexpected error occurred. Please try again later.',
  })
}
```

#### 6.4.2 Frontend Error Boundaries

```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to monitoring service (Sentry, LogRocket, etc.)
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Don't expose technical details to users
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>We're working on fixing this. Please try again later.</p>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 6.5 Security Headers

```typescript
// vite.config.ts or server middleware
export const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // XSS protection
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  
  // HTTPS enforcement
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}
```

### 6.6 Rate Limiting

```typescript
// lib/rateLimit.ts
import { RateLimiterMemory } from 'rate-limiter-flexible'

const rateLimiter = new RateLimiterMemory({
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60 * 15, // Block for 15 minutes if exceeded
})

export async function rateLimitMiddleware(req: Request, res: Response, next: Function) {
  try {
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown'
    await rateLimiter.consume(key)
    next()
  } catch (error) {
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
    })
  }
}
```

---

## 7. Security Testing & Validation

### 7.1 Static Application Security Testing (SAST)

#### 7.1.1 Snyk Code Scanning

```powershell
# Run before every PR merge
snyk code test

# Fail build on high severity issues
snyk code test --severity-threshold=high
```

#### 7.1.2 ESLint Security Rules

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'plugin:security/recommended',
  ],
  plugins: ['security'],
  rules: {
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-require': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
  },
}
```

### 7.2 Software Composition Analysis (SCA)

```powershell
# Scan dependencies for vulnerabilities
snyk test

# Monitor project continuously
snyk monitor

# Auto-fix vulnerabilities
snyk fix

# Generate detailed report
snyk test --json > vulnerability-report.json
```

#### 7.2.1 Dependency Update Policy

- **Critical vulnerabilities:** Patch within 24 hours
- **High vulnerabilities:** Patch within 7 days
- **Medium vulnerabilities:** Patch within 30 days
- **Low vulnerabilities:** Patch in next release cycle

#### 7.2.2 Automated Dependency Updates

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
```

### 7.3 Dynamic Application Security Testing (DAST)

#### 7.3.1 OWASP ZAP Scanning

```powershell
# Quick scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://app.trustwork.com

# Full scan (authenticated)
docker run -t owasp/zap2docker-stable zap-full-scan.py -t https://app.trustwork.com
```

#### 7.3.2 Manual Security Testing Checklist

- [ ] SQL injection testing on all inputs
- [ ] XSS testing on all user-generated content
- [ ] CSRF token validation
- [ ] Authentication bypass attempts
- [ ] Authorization bypass attempts (horizontal & vertical)
- [ ] Session management testing
- [ ] File upload vulnerabilities
- [ ] API security testing (BOLA, mass assignment)
- [ ] Rate limiting verification

### 7.4 Container & Infrastructure Scanning

```powershell
# Docker image scanning
snyk container test trustwork:latest

# Kubernetes manifest scanning
snyk iac test deployment.yaml

# Terraform scanning
snyk iac test --scan=resource-changes
```

### 7.5 Penetration Testing

- **Frequency:** Annual comprehensive penetration test
- **Scope:** Full application stack (frontend, backend, APIs, infrastructure)
- **Provider:** Third-party security firm
- **Deliverables:**
  - Executive summary
  - Detailed findings report
  - Remediation recommendations
  - Retest verification

---

## 8. Deployment & Operations Security

### 8.1 CI/CD Pipeline Security

```yaml
# .github/workflows/security.yml
name: Security Checks

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk Code Test
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          command: code test
          args: --severity-threshold=high
      
      - name: Run Snyk Dependency Test
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          command: test
          args: --severity-threshold=high
      
      - name: Run ESLint Security
        run: npm run lint:security
      
      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
```

### 8.2 Infrastructure Security

#### 8.2.1 Supabase Security Configuration

```sql
-- Enable SSL enforcement
ALTER DATABASE postgres SET ssl = on;

-- Set connection limits
ALTER ROLE authenticator CONNECTION LIMIT 100;

-- Enable audit logging
ALTER DATABASE postgres SET log_statement = 'all';
ALTER DATABASE postgres SET log_connections = on;
ALTER DATABASE postgres SET log_disconnections = on;

-- Restrict public schema
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO authenticated;
```

#### 8.2.2 Network Security

- [ ] HTTPS only (TLS 1.3)
- [ ] WAF (Web Application Firewall) enabled
- [ ] DDoS protection enabled
- [ ] IP whitelisting for admin endpoints
- [ ] Private subnets for database
- [ ] VPC peering for inter-service communication

### 8.3 Secrets Management

```typescript
// ❌ BAD: Hardcoded secrets
const apiKey = 'sk_live_123456789'

// ✅ GOOD: Environment variables
const apiKey = import.meta.env.VITE_API_KEY

// ✅ BETTER: Secrets manager (production)
import { SecretsManager } from '@aws-sdk/client-secrets-manager'

async function getSecret(secretName: string) {
  const client = new SecretsManager({ region: 'us-east-1' })
  const response = await client.getSecretValue({ SecretId: secretName })
  return JSON.parse(response.SecretString)
}
```

#### 8.3.1 Secrets Rotation Policy

- **API Keys:** Rotate every 90 days
- **Database Passwords:** Rotate every 90 days
- **JWT Signing Keys:** Rotate every 180 days
- **Service Account Credentials:** Rotate every 90 days
- **Emergency:** Immediate rotation if compromise suspected

### 8.4 Deployment Checklist

#### 8.4.1 Pre-Deployment Security Checklist

- [ ] All security tests passed (SAST, SCA, DAST)
- [ ] No high or critical vulnerabilities
- [ ] Code review completed with security focus
- [ ] Secrets not in code (verified with git-secrets or Trufflehog)
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] RLS policies verified
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Error handling doesn't leak sensitive info
- [ ] Logging configured (no sensitive data logged)
- [ ] Backup and recovery tested

#### 8.4.2 Post-Deployment Security Checklist

- [ ] Monitor security logs for anomalies
- [ ] Verify all endpoints require authentication
- [ ] Test rate limiting in production
- [ ] Verify HTTPS enforcement
- [ ] Check security headers (securityheaders.com)
- [ ] Run DAST scan against production
- [ ] Verify monitoring and alerting working
- [ ] Document deployment for audit trail

### 8.5 Monitoring & Alerting

#### 8.5.1 Critical Security Alerts

Configure immediate alerts for:

- Multiple failed login attempts (5+ in 5 minutes)
- Privilege escalation attempts
- RLS policy violations
- Unusual data access patterns
- API rate limit breaches
- New admin user creation
- Database schema changes
- Unauthorized API access attempts
- File upload anomalies

#### 8.5.2 Monitoring Stack Configuration

**Sentry Error Tracking:**

```typescript
// src/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://[YOUR_SENTRY_KEY]@o[YOUR_ORG].ingest.sentry.io/[PROJECT_ID]',
  environment: import.meta.env.VITE_APP_ENV,
  release: import.meta.env.VITE_APP_VERSION,
  tracesSampleRate: 0.1,
  
  beforeSend(event, hint) {
    // Scrub sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.Authorization
    }
    
    // Filter auth errors (expected)
    if (event.exception?.values?.[0]?.type === 'AuthError') {
      return null
    }
    
    return event
  },
  
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
```

**LogRocket Session Replay:**

```typescript
// src/lib/monitoring/logrocket.ts
import LogRocket from 'logrocket'
import setupLogRocketReact from 'logrocket-react'

if (import.meta.env.VITE_APP_ENV === 'production') {
  LogRocket.init('trustwork/trustwork-prod', {
    console: {
      shouldAggregateConsoleErrors: true,
    },
    network: {
      requestSanitizer: (request) => {
        // Sanitize sensitive headers
        if (request.headers.Authorization) {
          request.headers.Authorization = '[REDACTED]'
        }
        if (request.headers.Cookie) {
          request.headers.Cookie = '[REDACTED]'
        }
        return request
      },
      responseSanitizer: (response) => {
        // Sanitize sensitive response data
        if (response.body?.token) {
          response.body.token = '[REDACTED]'
        }
        return response
      },
    },
  })
  
  setupLogRocketReact(LogRocket)
  
  // Identify users (GDPR-compliant minimal data)
  LogRocket.identify(user.id, {
    role: user.role,
    // Don't include PII
  })
}
```

**Environment Variables Template:**

```bash
# .env.production template
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0

# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Monitoring & Security
VITE_SENTRY_DSN=https://[key]@o[org].ingest.sentry.io/[project]
VITE_LOGROCKET_APP_ID=trustwork/trustwork-prod
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Feature Flags
VITE_ENABLE_SOCIAL_AUTH=true
VITE_ENABLE_FILE_UPLOAD=true
VITE_MAX_FILE_SIZE_MB=10

# Rate Limiting
VITE_API_RATE_LIMIT_PER_MINUTE=60
VITE_UPLOAD_RATE_LIMIT_PER_HOUR=10
```

**Supabase Security Monitoring:**

```sql
-- Create security audit table
CREATE TABLE security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT now(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- Enable RLS
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON security_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type TEXT,
  p_details JSONB DEFAULT '{}',
  p_severity TEXT DEFAULT 'low'
) RETURNS void AS $$
BEGIN
  INSERT INTO security_audit_log (event_type, user_id, details, severity)
  VALUES (p_event_type, auth.uid(), p_details, p_severity);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log failed login attempts
CREATE OR REPLACE FUNCTION log_failed_login()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_sign_in_at IS NULL AND OLD.failed_attempts >= 3 THEN
    PERFORM log_security_event(
      'failed_login_threshold',
      jsonb_build_object('attempts', NEW.failed_attempts),
      'high'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER failed_login_trigger
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION log_failed_login();
```

**Security Event Logger:**

```typescript
// src/lib/security.ts
export type SecurityEventType =
  | 'auth_failure'
  | 'authz_failure'
  | 'rate_limit'
  | 'suspicious_activity'
  | 'data_access'
  | 'privilege_escalation'

export interface SecurityEvent {
  type: SecurityEventType
  userId?: string
  ip?: string
  userAgent?: string
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export async function logSecurityEvent(event: SecurityEvent) {
  console.warn('SECURITY_EVENT', {
    timestamp: new Date().toISOString(),
    ...event,
  })
  
  // Log to Supabase audit table
  if (supabase) {
    await supabase.rpc('log_security_event', {
      p_event_type: event.type,
      p_details: event.details,
      p_severity: event.severity,
    })
  }
  
  // Send critical events to Sentry
  if (event.severity === 'critical' || event.severity === 'high') {
    Sentry.captureMessage(`Security Event: ${event.type}`, {
      level: event.severity === 'critical' ? 'error' : 'warning',
      extra: event,
    })
  }
}

// Usage examples
await logSecurityEvent({
  type: 'auth_failure',
  userId: user?.id,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  details: { reason: 'invalid_password', attempts: 3 },
  severity: 'medium',
})

await logSecurityEvent({
  type: 'privilege_escalation',
  userId: user.id,
  details: { attempted_role: 'admin', current_role: 'freelancer' },
  severity: 'critical',
})
```

```

### 8.6 Backup & Disaster Recovery

#### 8.6.1 Backup Policy

- **Database backups:** Daily automated backups, retained for 30 days
- **Point-in-time recovery:** Enabled (last 7 days)
- **Code backups:** Git repository with multiple remotes
- **Configuration backups:** Infrastructure as Code in version control
- **Backup encryption:** All backups encrypted at rest
- **Backup testing:** Monthly restore test

#### 8.6.2 Disaster Recovery Plan

**Recovery Time Objective (RTO):** 4 hours  
**Recovery Point Objective (RPO):** 1 hour

1. **Incident Detection** (0-15 min)
   - Automated monitoring alerts
   - On-call engineer notified

2. **Assessment** (15-30 min)
   - Determine severity and scope
   - Activate incident response team

3. **Containment** (30-60 min)
   - Isolate affected systems
   - Stop ongoing attack if applicable

4. **Recovery** (1-4 hours)
   - Restore from backups
   - Verify data integrity
   - Gradually restore services

5. **Post-Incident** (24-48 hours)
   - Root cause analysis
   - Security improvements
   - Update runbooks

---

## 9. Incident Response

### 9.1 Incident Response Team

- **Incident Commander:** CTO / Security Lead
- **Technical Lead:** Senior Backend Engineer
- **Communications Lead:** Product Manager
- **Legal/Compliance:** Legal Counsel (if needed)

### 9.2 Incident Severity Levels

| Severity | Description | Response Time | Examples |
|----------|-------------|---------------|----------|
| P0 - Critical | Active data breach, system compromise | Immediate | Database exposed, RCE vulnerability exploited |
| P1 - High | Potential data exposure, major vulnerability | 1 hour | Authentication bypass, SQL injection discovered |
| P2 - Medium | Limited impact, moderate vulnerability | 4 hours | XSS vulnerability, minor data leak |
| P3 - Low | Minimal impact, minor vulnerability | 24 hours | Information disclosure, deprecated dependency |

### 9.3 Incident Response Process

#### 9.3.1 Detection & Reporting

- **Internal Detection:** Monitoring alerts, security scans
- **External Reporting:** <security@trustwork.com>
- **Anonymous Reporting:** Bug bounty program (optional)

#### 9.3.2 Response Workflow

```

1. DETECT
   ↓
2. TRIAGE (assess severity)
   ↓
3. CONTAIN (stop the bleeding)
   ↓
4. INVESTIGATE (root cause)
   ↓
5. ERADICATE (remove threat)
   ↓
6. RECOVER (restore services)
   ↓
7. POST-MORTEM (learn & improve)

```

#### 9.3.3 Incident Response Checklist

**Phase 1: Detection & Triage (0-30 min)**

- [ ] Incident logged with timestamp
- [ ] Severity level assigned
- [ ] Incident response team notified
- [ ] Initial assessment documented

**Phase 2: Containment (30-60 min)**

- [ ] Affected systems identified
- [ ] Threat contained (firewall rules, account lockout)
- [ ] Evidence preserved
- [ ] Stakeholders notified

**Phase 3: Investigation (1-4 hours)**

- [ ] Attack vector identified
- [ ] Scope of compromise determined
- [ ] Affected data/users identified
- [ ] Root cause analysis initiated

**Phase 4: Eradication (2-8 hours)**

- [ ] Vulnerability patched
- [ ] Malicious artifacts removed
- [ ] Security controls improved
- [ ] Systems hardened

**Phase 5: Recovery (4-24 hours)**

- [ ] Services restored from clean backups
- [ ] Systems monitored for reinfection
- [ ] User accounts secured (password resets if needed)
- [ ] Normal operations resumed

**Phase 6: Post-Incident (24-72 hours)**

- [ ] Incident report completed
- [ ] Lessons learned documented
- [ ] Security improvements implemented
- [ ] Runbooks updated
- [ ] Team debrief conducted

### 9.4 Data Breach Response

If personal data is compromised:

1. **Immediate Actions (0-24 hours)**
   - Contain the breach
   - Assess data exposure
   - Preserve evidence
   - Notify internal stakeholders

2. **Legal Compliance (24-72 hours)**
   - Notify data protection authorities (GDPR: 72 hours)
   - Prepare breach notification
   - Consult legal counsel
   - Document all actions

3. **User Notification**
   - Notify affected users without undue delay
   - Provide clear information about:
     - What data was compromised
     - What actions we're taking
     - What users should do (password reset, etc.)
   - Offer support (credit monitoring if financial data)

4. **Public Communications**
   - Prepare public statement if needed
   - Coordinate with PR team
   - Monitor social media
   - Update status page

### 9.5 Vulnerability Disclosure Policy

**Email:** <security@trustwork.com>  
**PGP Key:** Available at [https://keybase.io/trustwork/pgp_keys.asc](https://keybase.io/trustwork/pgp_keys.asc)  
**Fingerprint:** `4A3E 8B7C 9D2F 1E6A 5C8B 7D4A 3F9E 2C1B 8A5D 6E7F`  
**Response Time:** 48 hours acknowledgment

**Encrypted Reporting:**
```bash
# Download PGP key
curl https://keybase.io/trustwork/pgp_keys.asc | gpg --import

# Encrypt your report
gpg --encrypt --armor --recipient security@trustwork.com report.txt

# Send encrypted report via email
```

#### 9.5.1 Responsible Disclosure Guidelines

✅ **We appreciate:**

- Detailed vulnerability reports
- Proof of concept (non-destructive)
- Allowing reasonable time to fix
- Not exploiting vulnerabilities
- Not accessing user data

❌ **Please don't:**

- Test on production without permission
- Perform DoS/DDoS attacks
- Access other users' data
- Destroy or modify data
- Publicly disclose before fix

#### 9.5.2 Disclosure Timeline

1. **Day 0:** Vulnerability reported
2. **Day 1-2:** Acknowledgment sent
3. **Day 3-7:** Initial assessment & triage
4. **Day 8-30:** Fix development & testing
5. **Day 31-60:** Deployment & verification
6. **Day 61-90:** Public disclosure (coordinated)

---

## 10. Security Training & Awareness

### 10.1 Developer Security Training

#### 10.1.1 Onboarding (Week 1)

- [ ] SSDLC policy review
- [ ] Secure coding guidelines
- [ ] Authentication/authorization patterns
- [ ] Common vulnerabilities (OWASP Top 10)
- [ ] Incident response procedures
- [ ] Tools training (Snyk, ESLint, etc.)

#### 10.1.2 Ongoing Training (Quarterly)

- [ ] Security lunch & learn sessions
- [ ] Capture The Flag (CTF) exercises
- [ ] Real-world incident case studies
- [ ] New vulnerability awareness
- [ ] Secure code review practice

#### 10.1.3 Mandatory Annual Training

- [ ] OWASP Top 10 updates
- [ ] Data privacy regulations (GDPR, CCPA)
- [ ] Social engineering awareness
- [ ] Phishing recognition
- [ ] Password security best practices

### 10.2 Security Champions Program

- Designate security champions in each team
- Monthly security champion meetings
- Early access to security tools and training
- Facilitate security discussions in teams

### 10.3 Security Resources

**Internal Documentation:**

- Secure coding cheat sheets
- Security architecture diagrams
- Incident response runbooks
- Threat model documents

**External Resources:**

- OWASP Top 10: <https://owasp.org/Top10/>
- SANS Secure Coding: <https://www.sans.org/>
- CWE Top 25: <https://cwe.mitre.org/top25/>
- Supabase Security: <https://supabase.com/docs/guides/platform/security>

---

## 11. Compliance & Audit

### 11.1 Regulatory Compliance

#### 11.1.1 GDPR Compliance

- [ ] Legal basis for data processing documented
- [ ] Privacy policy published and accessible
- [ ] Cookie consent implemented
- [ ] User data export functionality
- [ ] User data deletion functionality ("right to erasure")
- [ ] Data retention policies enforced
- [ ] Data processing agreements with vendors
- [ ] Data breach notification procedures
- [ ] Data Protection Officer designated (if required)

#### 11.1.2 CCPA Compliance (California)

- [ ] "Do Not Sell My Personal Information" link
- [ ] Privacy notice at collection
- [ ] Opt-out mechanism for data selling
- [ ] User data access request process
- [ ] User data deletion request process

#### 11.1.3 SOC 2 (if applicable)

- [ ] Security policies documented
- [ ] Access controls implemented
- [ ] Change management process
- [ ] Incident response procedures
- [ ] Risk assessment conducted
- [ ] Vendor management program
- [ ] Security monitoring and logging

### 11.2 Security Audit Trail

All security-relevant events must be logged:

```typescript
// Audit logging example
interface AuditLog {
  timestamp: string
  userId?: string
  action: string
  resource: string
  result: 'success' | 'failure'
  ip: string
  userAgent: string
  metadata?: Record<string, any>
}

export async function auditLog(log: AuditLog) {
  await db.auditLogs.create({
    data: {
      ...log,
      timestamp: new Date().toISOString(),
    },
  })
}

// Usage examples
await auditLog({
  userId: user.id,
  action: 'login',
  resource: 'authentication',
  result: 'success',
  ip: req.ip,
  userAgent: req.headers['user-agent'],
})

await auditLog({
  userId: user.id,
  action: 'delete',
  resource: 'project',
  result: 'success',
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  metadata: { projectId: '123' },
})
```

### 11.3 Internal Security Audits

#### 11.3.1 Monthly Security Review

- [ ] Review failed authentication attempts
- [ ] Review authorization failures
- [ ] Review rate limit violations
- [ ] Review new vulnerabilities (Snyk reports)
- [ ] Review access logs for anomalies
- [ ] Review incident reports

#### 11.3.2 Quarterly Security Assessment

- [ ] Review and update threat model
- [ ] Review RLS policies
- [ ] Review API security
- [ ] Review third-party dependencies
- [ ] Review security training completion
- [ ] Review incident response effectiveness
- [ ] Update security documentation

#### 11.3.3 Annual Security Audit

- [ ] Comprehensive code security review
- [ ] Infrastructure security review
- [ ] Third-party penetration test
- [ ] Compliance assessment (GDPR, CCPA, etc.)
- [ ] Risk assessment update
- [ ] Business continuity plan review
- [ ] Disaster recovery plan test

### 11.4 Security Metrics & KPIs

Track and report monthly:

| Metric | Target | Description |
|--------|--------|-------------|
| Vulnerability Discovery Time | < 7 days | Time to discover vulnerabilities |
| Vulnerability Fix Time | < 30 days | Time to patch vulnerabilities |
| Security Test Coverage | > 80% | Critical paths covered by security tests |
| Dependency Freshness | < 90 days | Age of dependencies |
| Failed Login Rate | < 5% | Percentage of failed logins |
| Incident Response Time | < 1 hour | Time to respond to P1 incidents |
| Security Training Completion | 100% | Team members trained annually |
| RLS Coverage | 100% | Tables with RLS enabled |

---

## 12. Tool Stack & Integrations

### 12.1 Security Tools

| Tool | Purpose | Integration |
|------|---------|-------------|
| Snyk | SAST, SCA, container scanning | CI/CD, IDE plugin |
| ESLint Security | SAST for JavaScript | Pre-commit hook, CI/CD |
| Trufflehog | Secret scanning | Pre-commit hook, CI/CD |
| OWASP ZAP | DAST | Weekly automated scans |
| Dependabot/Renovate | Dependency updates | GitHub automation |
| Sentry | Error tracking & monitoring | Runtime monitoring |
| GitHub Advanced Security | Code scanning, secret scanning | Native GitHub |

### 12.2 Development Environment Setup

```powershell
# Install security tools
npm install -D eslint-plugin-security
npm install -D @typescript-eslint/eslint-plugin
npm install -D husky lint-staged

# Install Snyk CLI
npm install -g snyk
snyk auth

# Install git-secrets
git clone https://github.com/awslabs/git-secrets
cd git-secrets
make install

# Setup pre-commit hooks
npx husky install
npx husky add .husky/pre-commit "npm run lint:security"
npx husky add .husky/pre-commit "npm run test:security"
```

### 12.3 Pre-Commit Hooks

```json
// package.json
{
  "scripts": {
    "lint:security": "eslint . --ext .ts,.tsx --config .eslintrc.security.js",
    "test:security": "npm audit --audit-level=moderate",
    "secrets:scan": "git secrets --scan"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "eslint --config .eslintrc.security.js"
    ]
  }
}
```

---

## 13. Quick Reference Checklists

### 13.1 New Feature Security Checklist

Before implementing any new feature:

- [ ] Threat model updated
- [ ] Security requirements defined
- [ ] Authentication required (if applicable)
- [ ] Authorization model defined
- [ ] Input validation schema created (Zod)
- [ ] RLS policies created/updated
- [ ] Rate limiting considered
- [ ] Audit logging added
- [ ] Error handling implemented
- [ ] Security tests written
- [ ] Code review with security focus
- [ ] SAST/SCA passed
- [ ] Documentation updated

### 13.2 Code Review Security Checklist

Reviewer must verify:

- [ ] No hardcoded secrets or credentials
- [ ] All user inputs validated (backend + frontend)
- [ ] Authentication checks present on protected routes
- [ ] Authorization checks prevent unauthorized access
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (no dangerouslySetInnerHTML without sanitization)
- [ ] Error messages don't leak sensitive info
- [ ] Sensitive data encrypted in transit and at rest
- [ ] Logging doesn't include sensitive data
- [ ] Rate limiting on sensitive operations
- [ ] CSRF protection where applicable
- [ ] File uploads properly validated
- [ ] Dependencies are up to date and secure

### 13.3 Pull Request Security Template

```markdown
## Security Considerations

### Authentication & Authorization
- [ ] Does this change affect authentication/authorization?
- [ ] Are RLS policies updated if needed?
- [ ] Are role checks implemented correctly?

### Input Validation
- [ ] Are all inputs validated with Zod schemas?
- [ ] Is validation performed on the backend?
- [ ] Are file uploads properly validated?

### Data Protection
- [ ] Is sensitive data encrypted?
- [ ] Are database queries parameterized?
- [ ] Is user data access logged?

### Security Testing
- [ ] SAST scan passed (Snyk Code)
- [ ] SCA scan passed (Snyk Test)
- [ ] Unit tests include security test cases
- [ ] Manual security testing performed

### Dependencies
- [ ] No new high/critical vulnerabilities introduced
- [ ] Dependencies are from trusted sources
- [ ] License compatibility verified
```

---

## 14. Contact & Support

### 14.1 Security Team Contacts

- **Security Lead:** <security-lead@trustwork.com>
- **Security Team:** <security@trustwork.com>
- **Incident Response:** <incident@trustwork.com> (24/7)
- **Vulnerability Reports:** <security@trustwork.com>

### 14.2 Escalation Path

1. **Developer** → Team Lead
2. **Team Lead** → Engineering Manager
3. **Engineering Manager** → CTO / Security Lead
4. **Critical Incidents** → Incident Commander (immediate escalation)

### 14.3 Additional Resources

- **Internal Wiki:** <https://wiki.trustwork.com/security>
- **Security Training Portal:** <https://training.trustwork.com>
- **Incident Response Runbook:** <https://docs.trustwork.com/incident-response>
- **Security Standards:** <https://docs.trustwork.com/security-standards>

---

## 15. Document Control

### 15.1 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2025-10-29 | Security Team | Complete SSDLC overhaul with comprehensive guidelines |
| 1.0 | 2024-06-15 | Security Team | Initial security policy |

### 15.2 Review & Approval

- **Next Review Date:** January 29, 2026
- **Review Frequency:** Quarterly or after major incidents
- **Approvers:** CTO, Security Lead, Legal Counsel

### 15.3 Document Distribution

- **Audience:** All engineering team members, contractors
- **Access:** Internal company wiki, onboarding materials
- **Updates:** Team notified via email and Slack

---

## Appendix A: OWASP Top 10 (2021) Mapping

| Vulnerability | TrustWork Mitigation |
|---------------|---------------------|
| A01: Broken Access Control | RLS policies, authorization checks, `ProtectedRoute` |
| A02: Cryptographic Failures | TLS 1.3, AES-256, secure cookie flags |
| A03: Injection | Zod validation, parameterized queries, input sanitization |
| A04: Insecure Design | Threat modeling, security by design, SSDLC |
| A05: Security Misconfiguration | Security headers, secure defaults, infrastructure scanning |
| A06: Vulnerable Components | Snyk SCA, dependency updates, Dependabot |
| A07: Authentication Failures | Supabase Auth, MFA, rate limiting, session management |
| A08: Software & Data Integrity | Code signing, SRI, supply chain security |
| A09: Logging & Monitoring Failures | Comprehensive logging, Sentry, audit trails |
| A10: Server-Side Request Forgery | URL validation, whitelist, network segmentation |

---

## Appendix B: Security Testing Scripts

### B.1 Automated Security Scan

```powershell
# run-security-scan.ps1
Write-Host "🔒 Running TrustWork Security Scan..." -ForegroundColor Cyan

Write-Host "`n📝 Step 1: Code Analysis (SAST)" -ForegroundColor Yellow
snyk code test --severity-threshold=high
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Code analysis failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Step 2: Dependency Scan (SCA)" -ForegroundColor Yellow
snyk test --severity-threshold=high
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dependency scan failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔍 Step 3: Secret Scanning" -ForegroundColor Yellow
git secrets --scan
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Secrets detected in code!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✨ Step 4: Linting (Security Rules)" -ForegroundColor Yellow
npm run lint:security
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Security linting failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ All security checks passed!" -ForegroundColor Green
```

### B.2 Pre-Production Security Checklist Script

```powershell
# pre-production-checklist.ps1
$checks = @()

function Check-Item {
    param($name, $command)
    Write-Host "Checking: $name" -ForegroundColor Cyan
    $result = Invoke-Expression $command
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $name" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $name" -ForegroundColor Red
        return $false
    }
}

Write-Host "🚀 Pre-Production Security Checklist" -ForegroundColor Yellow

$checks += Check-Item "SAST Scan" "snyk code test"
$checks += Check-Item "Dependency Scan" "snyk test"
$checks += Check-Item "Environment Variables" "test -f .env.production"
$checks += Check-Item "HTTPS Redirect" "curl -I https://app.trustwork.com | grep '301'"
$checks += Check-Item "Security Headers" "curl -I https://app.trustwork.com | grep 'X-Frame-Options'"

$passedChecks = ($checks | Where-Object { $_ -eq $true }).Count
$totalChecks = $checks.Count

Write-Host "`n📊 Results: $passedChecks/$totalChecks checks passed" -ForegroundColor Cyan

if ($passedChecks -eq $totalChecks) {
    Write-Host "✅ Ready for production deployment!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Fix issues before deploying!" -ForegroundColor Red
    exit 1
}
```

---

## Appendix C: Incident Response Templates

### C.1 Security Incident Report Template

```markdown
# Security Incident Report

**Incident ID:** INC-2025-XXX
**Date:** YYYY-MM-DD
**Severity:** [P0 / P1 / P2 / P3]
**Status:** [Open / Investigating / Contained / Resolved]

## Incident Summary
[Brief description of the incident]

## Timeline
- **Detection:** YYYY-MM-DD HH:MM UTC
- **Containment:** YYYY-MM-DD HH:MM UTC
- **Resolution:** YYYY-MM-DD HH:MM UTC

## Impact Assessment
- **Users Affected:** [Number/Percentage]
- **Data Compromised:** [Yes/No - Details]
- **Services Disrupted:** [List]

## Root Cause
[Detailed explanation]

## Actions Taken
1. [Action 1]
2. [Action 2]

## Remediation
- [ ] Immediate fixes applied
- [ ] Long-term improvements identified
- [ ] Users notified (if applicable)
- [ ] Authorities notified (if applicable)

## Lessons Learned
[What we learned and how to prevent future incidents]

## Follow-up Actions
- [ ] Action item 1 - Owner: [Name] - Due: [Date]
- [ ] Action item 2 - Owner: [Name] - Due: [Date]
```

---

**END OF DOCUMENT**

*This SSDLC policy is a living document and should be reviewed and updated regularly to reflect current best practices and emerging threats.*
