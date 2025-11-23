# TrustWork Architecture

This document provides comprehensive architecture diagrams and technical documentation for the TrustWork platform.

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [System Components](#system-components)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Sequence Diagrams](#sequence-diagrams)
5. [Database Schema](#database-schema)
6. [Deployment Architecture](#deployment-architecture)
7. [Security Architecture](#security-architecture)
8. [Scalability Considerations](#scalability-considerations)

---

## High-Level Architecture

### Tech Stack Overview

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **CDN:** Static hosting for built assets
- **Monitoring:** Sentry/LogRocket for error tracking and user analytics
- **Payment:** Third-party payment provider integration (Stripe/PayPal)
- **Email:** SendGrid for transactional emails

### System Architecture Diagram

```mermaid
flowchart TB
  subgraph Client["Client Layer"]
    A[Browser]
    B[Mobile App]
  end

  subgraph CDN["Content Delivery Network"]
    C[CloudFlare CDN]
  end

  subgraph Frontend["Frontend Application"]
    D[React + Vite]
    E[Service Worker PWA]
    F[TanStack Query Cache]
  end

  subgraph Backend["Backend Services - Supabase"]
    G[PostgreSQL Database]
    H[Auth Service]
    I[Storage S3]
    J[Realtime Subscriptions]
    K[Edge Functions]
  end

  subgraph External["External Services"]
    L[Stripe API]
    M[SendGrid Email]
    N[Sentry Monitoring]
  end

  A --> C
  B --> C
  C --> D
  D --> E
  D --> F
  D -->|REST API| G
  D -->|JWT Auth| H
  D -->|File Upload| I
  D -->|WebSocket| J
  D -->|Serverless| K
  K --> G
  D --> L
  K --> M
  D --> N
  G --> N
```

---

## System Components

### Frontend Components

#### React Application

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite (fast HMR, optimized production builds)
- **State Management:**
  - TanStack Query for server state
  - React Context for UI state
  - Local storage for persistence
- **Routing:** React Router v6
- **UI Library:** shadcn/ui + Tailwind CSS
- **Forms:** React Hook Form + Zod validation

#### Service Worker (PWA)

- Offline-first capabilities
- Background sync for failed requests
- Push notification support
- Asset caching strategy

### Backend Components

#### Supabase PostgreSQL

- **Database:** PostgreSQL 15
- **Features:**
  - Row-Level Security (RLS) policies
  - Full-text search with `ts_vector`
  - JSON/JSONB support
  - Triggers and functions
- **Extensions:**
  - `uuid-ossp` for UUID generation
  - `pg_trgm` for fuzzy search
  - `pgcrypto` for encryption

#### Authentication Service

- **Provider:** Supabase Auth
- **Features:**
  - Email/password authentication
  - OAuth 2.0 (Google, GitHub)
  - Magic link authentication
  - Multi-factor authentication (MFA)
  - Session management with JWT
- **Token Types:**
  - Access token (short-lived, 1 hour)
  - Refresh token (long-lived, 30 days)

#### Storage Service

- **Provider:** Supabase Storage (S3-compatible)
- **Buckets:**
  - `avatars` - User profile images
  - `attachments` - Project files
  - `documents` - Legal documents
- **Security:**
  - RLS policies on buckets
  - Signed URLs for private files
  - File type validation
  - Size limits enforced

#### Realtime Service

- **Technology:** WebSocket connections
- **Use Cases:**
  - Live notifications
  - Chat messages
  - Collaborative editing
  - Assignment status updates
- **Channels:**
  - User-specific channels
  - Assignment-specific channels
  - Global announcement channel

---

## Data Flow Diagrams

### User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Supabase Auth
    participant D as Database

    U->>F: Enter credentials
    F->>A: POST /auth/signin
    A->>D: Verify credentials
    D-->>A: User data
    A->>A: Generate JWT tokens
    A-->>F: Access + Refresh tokens
    F->>F: Store in localStorage
    F->>D: Fetch user profile
    D-->>F: Profile data
    F-->>U: Redirect to dashboard
```

### Assignment Creation Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant V as Validation
    participant API as Supabase API
    participant DB as Database
    participant RT as Realtime

    C->>F: Create assignment form
    F->>V: Validate with Zod
    V-->>F: Validation result
    F->>API: POST /assignments
    API->>DB: INSERT with RLS check
    DB-->>API: Created assignment
    API-->>F: Assignment data
    F->>RT: Subscribe to updates
    RT-->>F: Realtime connection
    F-->>C: Show success + redirect
```

### Payment Processing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant EF as Edge Function
    participant S as Stripe API
    participant DB as Database
    participant E as Email Service

    U->>F: Initiate payment
    F->>EF: Create payment intent
    EF->>S: Create PaymentIntent
    S-->>EF: Client secret
    EF-->>F: Payment details
    F->>S: Confirm payment (client-side)
    S->>EF: Webhook: payment_succeeded
    EF->>DB: Update payment status
    EF->>E: Send receipt email
    EF-->>S: Acknowledge webhook
    F-->>U: Payment success
```

---

## Sequence Diagrams

### Sign-In Flow

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant SupabaseAuth
    participant Database
    participant Dashboard

    User->>LoginPage: Navigate to /login
    User->>LoginPage: Enter email & password
    LoginPage->>LoginPage: Validate inputs (Zod)
    LoginPage->>SupabaseAuth: signInWithPassword()
    SupabaseAuth->>Database: Check credentials + RLS
    Database-->>SupabaseAuth: User + Session
    SupabaseAuth-->>LoginPage: { user, session }
    LoginPage->>LoginPage: Store session in localStorage
    LoginPage->>Database: Fetch user profile
    Database-->>LoginPage: Profile data
    LoginPage->>Dashboard: Navigate based on role
    Dashboard-->>User: Display dashboard
```

### Assignment Submission Flow

```mermaid
sequenceDiagram
    participant Freelancer
    participant AssignmentPage
    participant Validation
    participant SupabaseAPI
    participant Database
    participant Client
    participant NotificationService

    Freelancer->>AssignmentPage: Click "Apply"
    AssignmentPage->>Freelancer: Show application form
    Freelancer->>AssignmentPage: Fill proposal & submit
    AssignmentPage->>Validation: Validate form (Zod)
    Validation-->>AssignmentPage: Valid
    AssignmentPage->>SupabaseAPI: POST /applications
    SupabaseAPI->>Database: INSERT with RLS check
    Database->>Database: Check permissions
    Database-->>SupabaseAPI: Application created
    SupabaseAPI->>NotificationService: Trigger notification
    NotificationService->>Database: INSERT notification
    NotificationService->>Client: Realtime notification
    SupabaseAPI-->>AssignmentPage: Success
    AssignmentPage-->>Freelancer: Show success message
```

### OAuth Login Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant SupabaseAuth
    participant GoogleOAuth
    participant Database

    User->>Frontend: Click "Sign in with Google"
    Frontend->>SupabaseAuth: signInWithOAuth({ provider: 'google' })
    SupabaseAuth-->>User: Redirect to Google
    User->>GoogleOAuth: Authorize TrustWork
    GoogleOAuth-->>SupabaseAuth: Authorization code
    SupabaseAuth->>GoogleOAuth: Exchange for tokens
    GoogleOAuth-->>SupabaseAuth: User info + tokens
    SupabaseAuth->>Database: Create/update user
    Database-->>SupabaseAuth: User record
    SupabaseAuth-->>Frontend: Redirect with session
    Frontend->>Frontend: Store session
    Frontend-->>User: Redirect to dashboard
```

---

## Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ profiles : has
    users ||--o{ assignments : creates
    users ||--o{ applications : submits
    users ||--o{ notifications : receives
    users ||--o{ payments : makes
    
    assignments ||--o{ applications : receives
    assignments ||--o{ attachments : has
    
    applications ||--o{ messages : contains
    
    profiles {
        uuid id PK
        uuid user_id FK
        string name
        string bio
        string[] skills
        decimal hourly_rate
        string avatar_url
        boolean verified
        decimal rating
        int completed_projects
        timestamp created_at
        timestamp updated_at
    }
    
    assignments {
        uuid id PK
        uuid client_id FK
        string title
        text description
        string status
        decimal budget
        timestamp deadline
        string[] required_skills
        timestamp created_at
        timestamp updated_at
    }
    
    applications {
        uuid id PK
        uuid assignment_id FK
        uuid freelancer_id FK
        text proposal
        decimal bid_amount
        string estimated_duration
        string status
        timestamp created_at
    }
    
    notifications {
        uuid id PK
        uuid user_id FK
        string type
        string title
        text message
        boolean read
        jsonb data
        timestamp created_at
    }
    
    payments {
        uuid id PK
        uuid assignment_id FK
        uuid payer_id FK
        uuid payee_id FK
        decimal amount
        string status
        string stripe_payment_id
        timestamp created_at
    }
```

### Key Tables

For detailed schema, see [DATABASE.md](./DATABASE.md)

---

## Deployment Architecture

### Environment Separation

```mermaid
flowchart TB
    subgraph Dev["Development"]
        D1[Local Vite Server]
        D2[Supabase Dev Project]
        D3[Dev Database]
    end
    
    subgraph Staging["Staging"]
        S1[Vercel Staging]
        S2[Supabase Staging Project]
        S3[Staging Database]
    end
    
    subgraph Prod["Production"]
        P1[Vercel Production]
        P2[CloudFlare CDN]
        P3[Supabase Production]
        P4[Production Database]
        P5[Read Replicas]
    end
    
    Dev -->|PR Merged| Staging
    Staging -->|Manual Deploy| Prod
    P4 --> P5
```

### CI/CD Pipeline

```mermaid
flowchart LR
    A[Git Push] --> B[GitHub Actions]
    B --> C{Branch?}
    C -->|feature/*| D[Run Tests]
    C -->|main| E[Deploy Staging]
    C -->|release| F[Deploy Production]
    
    D --> G[Type Check]
    G --> H[Lint]
    H --> I[Unit Tests]
    I --> J[Snyk Scan]
    J --> K[Build]
    
    E --> K
    E --> L[E2E Tests]
    L --> M[Staging Ready]
    
    F --> K
    F --> N[Production Deploy]
    N --> O[Health Check]
    O --> P[Smoke Tests]
```

### Infrastructure

- **Frontend Hosting:** Vercel (automatic deployments from Git)
- **CDN:** CloudFlare (global edge network)
- **Backend:** Supabase (managed PostgreSQL + services)
- **Monitoring:** Sentry (error tracking) + LogRocket (session replay)
- **Analytics:** Google Analytics 4 + Supabase Analytics

---

## Security Architecture

### Security Layers

```mermaid
flowchart TB
    subgraph Layer1["Layer 1: Network Security"]
        L1A[HTTPS/TLS 1.3]
        L1B[WAF - CloudFlare]
        L1C[DDoS Protection]
    end
    
    subgraph Layer2["Layer 2: Authentication"]
        L2A[Supabase Auth]
        L2B[JWT Tokens]
        L2C[MFA Optional]
    end
    
    subgraph Layer3["Layer 3: Authorization"]
        L3A[RLS Policies]
        L3B[Role-Based Access]
        L3C[Object-Level Permissions]
    end
    
    subgraph Layer4["Layer 4: Data Security"]
        L4A[Encryption at Rest]
        L4B[Encryption in Transit]
        L4C[Input Validation Zod]
    end
    
    subgraph Layer5["Layer 5: Application Security"]
        L5A[SAST Snyk]
        L5B[SCA Dependency Scan]
        L5C[Security Headers]
    end
    
    Layer1 --> Layer2
    Layer2 --> Layer3
    Layer3 --> Layer4
    Layer4 --> Layer5
```

### Data Protection

- **At Rest:** AES-256 encryption (Supabase default)
- **In Transit:** TLS 1.3 for all connections
- **Secrets:** Environment variables, never in code
- **PII:** Encrypted columns for sensitive data
- **Backups:** Daily automated backups, encrypted

---

## Scalability Considerations

### Current Capacity

- **Users:** Designed for 100K+ concurrent users
- **Database:** PostgreSQL with connection pooling
- **Storage:** Unlimited (S3-compatible)
- **Realtime:** 500 concurrent connections per channel

### Scaling Strategies

#### Horizontal Scaling

- Frontend: Automatically scaled by Vercel
- Database: Read replicas for queries
- Storage: CDN for static assets

#### Vertical Scaling

- Database: Upgrade Supabase plan for more resources
- Edge Functions: Serverless auto-scaling

#### Caching Strategy

```mermaid
flowchart LR
    A[Client Request] --> B{Cache Hit?}
    B -->|Yes| C[Return from Cache]
    B -->|No| D[Fetch from API]
    D --> E[Store in Cache]
    E --> F[Return to Client]
    C --> G[Client]
    F --> G
```

**Cache Layers:**

1. **Browser Cache:** Static assets (24 hours)
2. **CDN Cache:** Images, fonts (7 days)
3. **TanStack Query Cache:** API responses (5 minutes)
4. **Database Query Cache:** Expensive queries (1 minute)

### Performance Optimization

- **Code Splitting:** Lazy-load routes
- **Image Optimization:** WebP format, lazy loading
- **Bundle Size:** Target < 200KB initial load
- **API Optimization:** GraphQL for complex queries (future)
- **Database Indexing:** All foreign keys and query columns

---

## Third-Party Integrations

```mermaid
flowchart TB
    A[TrustWork App] --> B[Stripe Payment]
    A --> C[SendGrid Email]
    A --> D[Sentry Monitoring]
    A --> E[Google Analytics]
    A --> F[CloudFlare CDN]
    A --> G[OAuth Providers]
    
    G --> H[Google]
    G --> I[GitHub]
    G --> J[LinkedIn]
```

### Integration Details

| Service | Purpose | API Type | Auth Method |
|---------|---------|----------|-------------|
| Stripe | Payment processing | REST | API Key |
| SendGrid | Transactional emails | REST | API Key |
| Sentry | Error tracking | SDK | DSN |
| Google Analytics | User analytics | SDK | Measurement ID |
| CloudFlare | CDN + Security | DNS | API Token |
| OAuth Providers | Social login | OAuth 2.0 | Client ID/Secret |

---

## Disaster Recovery

### Backup Strategy

- **Database:** Daily full backups, 30-day retention
- **Point-in-Time Recovery:** Last 7 days
- **Storage:** S3 versioning enabled
- **Code:** Git repository (GitHub)

### Recovery Procedures

**RTO (Recovery Time Objective):** 4 hours  
**RPO (Recovery Point Objective):** 1 hour

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed recovery procedures.

---

## References

- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Security Policy](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Supabase Architecture](https://supabase.com/docs/guides/platform/architecture)

---

**Document Version:** 2.0  
**Last Updated:** November 3, 2025  
**Maintained By:** TrustWork Engineering Team

_This architecture is designed for scalability, security, and developer productivity._
