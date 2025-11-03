# TrustWork API Documentation

## 1. Overview

TrustWork uses Supabase as its backend. All API requests are made via REST endpoints or Supabase client libraries. Authentication is required for most endpoints.

---

## 2. Authentication

- **Method:** Supabase Auth (JWT)
- **Login:** `POST /auth/signin`
- **Signup:** `POST /auth/signup`
- **Session:** JWT sent in `Authorization: Bearer <token>` header
- **Logout:** `POST /auth/signout`
- **Password Reset:** `POST /auth/reset`
- **Social Auth:** Supported via Supabase providers

---

## 3. Common Endpoints

### User Profile

- `GET /profile` — Get current user profile
- `PUT /profile` — Update user profile
- `GET /profile/:id` — Get profile by user ID

### Assignments

- `GET /assignments` — List assignments
- `POST /assignments` — Create assignment
- `GET /assignments/:id` — Get assignment details
- `PUT /assignments/:id` — Update assignment
- `DELETE /assignments/:id` — Delete assignment

### Notifications

- `GET /notifications` — List notifications
- `POST /notifications/read` — Mark notifications as read

### Payments

- `GET /payments` — List payments
- `POST /payments` — Create payment
- `GET /payments/:id` — Get payment details

---

## 4. Request & Response Format

- **Content-Type:** `application/json`
- **All requests:** Use HTTPS
- **Success Response:**

  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```

- **Error Response:**

  ```json
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE",
      "message": "Error message"
    }
  }
  ```

---

## 5. Error Handling

- All errors return HTTP status codes (400, 401, 403, 404, 500)
- Error messages are never verbose; sensitive details are not exposed
- Common error codes:
  - `AUTH_REQUIRED`: User not authenticated
  - `INVALID_INPUT`: Validation failed
  - `NOT_FOUND`: Resource not found
  - `FORBIDDEN`: Insufficient permissions
  - `SERVER_ERROR`: Unexpected error

---

## 6. Rate Limiting & Security

### Rate Limits

- **Global rate limit:** 100 requests per minute per IP address
- **Authentication endpoints:** 5 requests per minute per IP
- **Write operations:** 50 requests per minute per user
- **Read operations:** 100 requests per minute per user

**Rate Limit Headers:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699564800
```

**Rate Limit Exceeded Response:**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
```

### Security

- All requests validated with Zod schemas
- RLS (Row-Level Security) enforced on all tables
- No secrets in requests or responses
- HTTPS/TLS 1.3 required for all connections
- CORS enabled for whitelisted origins only

---

## 7. API Versioning

- Current version: `v1`
- Version included in base URL: `/api/v1/`
- Breaking changes will increment version number
- Previous versions supported for 6 months after new version release

---

## 8. Pagination

All list endpoints support pagination using the following query parameters:

- `page` — Page number (default: 1)
- `limit` — Items per page (default: 20, max: 100)
- `sort` — Sort field (e.g., `created_at`)
- `order` — Sort order (`asc` or `desc`, default: `desc`)

**Example Request:**

```http
GET /api/v1/assignments?page=2&limit=50&sort=created_at&order=desc
```

**Paginated Response:**

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total_items": 250,
    "total_pages": 5,
    "has_next": true,
    "has_prev": true
  }
}
```

---

## 9. Filtering & Search

List endpoints support filtering via query parameters:

- `status` — Filter by status (e.g., `?status=active`)
- `search` — Full-text search (e.g., `?search=project+name`)
- `created_after` — Filter by creation date (ISO 8601)
- `created_before` — Filter by creation date (ISO 8601)

**Example:**

```http
GET /api/v1/assignments?status=active&search=frontend&created_after=2025-01-01T00:00:00Z
```

---

## 10. Detailed Endpoint Documentation

### Authentication Endpoints

#### Login

```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "freelancer",
      "created_at": "2025-01-15T10:30:00Z"
    },
    "session": {
      "access_token": "jwt_token_here",
      "refresh_token": "refresh_token_here",
      "expires_at": "2025-01-15T22:30:00Z"
    }
  }
}
```

#### Signup

```http
POST /auth/signup
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "freelancer"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "newuser@example.com",
      "name": "John Doe",
      "role": "freelancer",
      "created_at": "2025-11-03T10:30:00Z"
    },
    "message": "Verification email sent"
  }
}
```

### User Profile Endpoints

#### Get Current User Profile

```http
GET /api/v1/profile
Authorization: Bearer {access_token}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "freelancer",
    "avatar_url": "https://cdn.trustwork.com/avatars/uuid.jpg",
    "bio": "Full-stack developer",
    "skills": ["React", "Node.js", "TypeScript"],
    "hourly_rate": 75.00,
    "verified": true,
    "rating": 4.8,
    "completed_projects": 42,
    "created_at": "2024-06-15T10:30:00Z",
    "updated_at": "2025-11-02T14:20:00Z"
  }
}
```

#### Update Profile

```http
PUT /api/v1/profile
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "John Smith",
  "bio": "Senior full-stack developer",
  "skills": ["React", "Node.js", "TypeScript", "Python"],
  "hourly_rate": 85.00
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Smith",
    "bio": "Senior full-stack developer",
    "skills": ["React", "Node.js", "TypeScript", "Python"],
    "hourly_rate": 85.00,
    "updated_at": "2025-11-03T15:45:00Z"
  }
}
```

### Assignment Endpoints

#### List Assignments

```http
GET /api/v1/assignments?page=1&limit=20&status=active
Authorization: Bearer {access_token}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Build React Dashboard",
      "description": "Need a responsive dashboard with charts",
      "status": "active",
      "budget": 5000.00,
      "deadline": "2025-12-31T23:59:59Z",
      "client": {
        "id": "uuid",
        "name": "Tech Corp",
        "avatar_url": "https://cdn.trustwork.com/avatars/client.jpg"
      },
      "required_skills": ["React", "TypeScript", "D3.js"],
      "applications_count": 12,
      "created_at": "2025-11-01T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 45,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

#### Create Assignment

```http
POST /api/v1/assignments
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Mobile App Development",
  "description": "Build a React Native app for iOS and Android",
  "budget": 10000.00,
  "deadline": "2026-03-31T23:59:59Z",
  "required_skills": ["React Native", "TypeScript", "Firebase"]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Mobile App Development",
    "description": "Build a React Native app for iOS and Android",
    "status": "draft",
    "budget": 10000.00,
    "deadline": "2026-03-31T23:59:59Z",
    "required_skills": ["React Native", "TypeScript", "Firebase"],
    "created_at": "2025-11-03T16:00:00Z"
  }
}
```

#### Get Assignment Details

```http
GET /api/v1/assignments/{assignment_id}
Authorization: Bearer {access_token}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Build React Dashboard",
    "description": "Need a responsive dashboard with charts and real-time data",
    "status": "active",
    "budget": 5000.00,
    "deadline": "2025-12-31T23:59:59Z",
    "client": {
      "id": "uuid",
      "name": "Tech Corp",
      "email": "contact@techcorp.com",
      "avatar_url": "https://cdn.trustwork.com/avatars/client.jpg",
      "verified": true,
      "rating": 4.9
    },
    "required_skills": ["React", "TypeScript", "D3.js"],
    "applications": [
      {
        "id": "uuid",
        "freelancer": {
          "id": "uuid",
          "name": "Jane Developer",
          "avatar_url": "https://cdn.trustwork.com/avatars/jane.jpg",
          "rating": 4.8
        },
        "proposal": "I have 5 years experience...",
        "bid_amount": 4500.00,
        "estimated_duration": "4 weeks",
        "status": "pending",
        "created_at": "2025-11-02T10:30:00Z"
      }
    ],
    "attachments": [
      {
        "id": "uuid",
        "filename": "requirements.pdf",
        "url": "https://cdn.trustwork.com/files/uuid.pdf",
        "size": 245678
      }
    ],
    "created_at": "2025-11-01T09:00:00Z",
    "updated_at": "2025-11-02T14:20:00Z"
  }
}
```

### Notification Endpoints

#### List Notifications

```http
GET /api/v1/notifications?page=1&limit=20&unread=true
Authorization: Bearer {access_token}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "assignment_application",
      "title": "New Application Received",
      "message": "Jane Developer applied to your assignment",
      "read": false,
      "data": {
        "assignment_id": "uuid",
        "application_id": "uuid"
      },
      "created_at": "2025-11-03T15:30:00Z"
    }
  ],
  "unread_count": 5
}
```

#### Mark Notifications as Read

```http
POST /api/v1/notifications/read
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "notification_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "marked_read": 3
  }
}
```

---

## 11. Realtime Subscriptions

TrustWork uses Supabase Realtime for live updates.

### Subscribe to Notifications

```typescript
import { supabase } from '@/lib/supabaseClient'

const subscription = supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New notification:', payload.new)
    }
  )
  .subscribe()

// Unsubscribe when done
subscription.unsubscribe()
```

### Subscribe to Assignment Updates

```typescript
const subscription = supabase
  .channel(`assignment:${assignmentId}`)
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'assignments',
      filter: `id=eq.${assignmentId}`
    },
    (payload) => {
      console.log('Assignment updated:', payload.new)
    }
  )
  .subscribe()
```

---

## 12. Error Code Reference

| Code | HTTP Status | Description | Resolution |
|------|-------------|-------------|------------|
| `AUTH_REQUIRED` | 401 | User not authenticated | Login or refresh token |
| `INVALID_TOKEN` | 401 | JWT token invalid or expired | Refresh token or login again |
| `INVALID_INPUT` | 400 | Validation failed | Check request body against schema |
| `NOT_FOUND` | 404 | Resource not found | Verify resource ID |
| `FORBIDDEN` | 403 | Insufficient permissions | Check user role and permissions |
| `CONFLICT` | 409 | Resource already exists | Use different identifier |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Wait before retrying (see `retry_after`) |
| `SERVER_ERROR` | 500 | Unexpected server error | Contact support or retry later |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily down | Retry with exponential backoff |
| `VALIDATION_ERROR` | 422 | Semantic validation failed | Fix business logic issues |

---

## 13. Code Examples

### JavaScript/TypeScript with Fetch

```typescript
// Login example
async function login(email: string, password: string) {
  const response = await fetch('https://api.trustwork.com/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error.message)
  }

  const { data } = await response.json()
  return data
}

// Get assignments with auth
async function getAssignments(accessToken: string) {
  const response = await fetch('https://api.trustwork.com/api/v1/assignments?page=1&limit=20', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch assignments')
  }

  const { data } = await response.json()
  return data
}
```

### Supabase Client

```typescript
import { supabase } from '@/lib/supabaseClient'

// Get current user profile
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId)
  .single()

// Create assignment
const { data: assignment, error } = await supabase
  .from('assignments')
  .insert({
    title: 'New Assignment',
    description: 'Description here',
    budget: 5000,
    deadline: '2026-01-31',
  })
  .select()
  .single()

// Update profile
const { data, error } = await supabase
  .from('profiles')
  .update({ bio: 'Updated bio' })
  .eq('user_id', userId)
```

### cURL Examples

```bash
# Login
curl -X POST https://api.trustwork.com/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Get assignments
curl https://api.trustwork.com/api/v1/assignments?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create assignment
curl -X POST https://api.trustwork.com/api/v1/assignments \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mobile App Development",
    "description": "Build a React Native app",
    "budget": 10000,
    "deadline": "2026-03-31T23:59:59Z",
    "required_skills": ["React Native", "TypeScript"]
  }'
```

---

## 14. Webhooks (Future)

Webhook support is planned for the following events:

- `assignment.created`
- `assignment.updated`
- `assignment.deleted`
- `application.submitted`
- `payment.completed`
- `payment.failed`

Documentation will be added when webhooks are implemented.

---

## 15. References

- [Supabase REST API Docs](https://supabase.com/docs/guides/api)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Project Workflow Instructions](../.github/instructions/project_workflow.instructions.md)
- [Security Policy](./SECURITY.md)
- [Database Documentation](./DATABASE.md)

---

**Document Version:** 2.0  
**Last Updated:** November 3, 2025  
**Maintained By:** TrustWork API Team

_For questions or issues with the API, contact <api-support@trustwork.com>_
