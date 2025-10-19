# 🔐 JWT-Based SSO Setup Guide (n8n Embed Pattern)

This guide implements **single sign-on between your app and n8n using JWT tokens** - following the n8n Embed authentication pattern.

---

## 🎯 Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    Authentication Flow                    │
└──────────────────────────────────────────────────────────┘

1. User logs in to YOUR APP
   ↓
2. Backend generates JWT with user info:
   {
     "sub": "user-id-123",
     "email": "user@example.com",
     "firstName": "John",
     "lastName": "Doe",
     "role": "user"
   }
   ↓
3. React app embeds n8n with JWT in iframe:
   <iframe src="http://n8n.saas.local?token=JWT_HERE" />
   ↓
4. n8n validates JWT using shared secret
   ↓
5. n8n auto-creates/retrieves user
   ↓
6. User is logged into n8n automatically! ✅
```

---

## ⚙️ Configuration

### 1. Shared JWT Secret

Both your backend and n8n must use the **same secret** to sign/verify JWTs.

**In `docker-compose.yml`:**

```yaml
backend:
  environment:
    # Your app's JWT secret
    JWT_SECRET: your-jwt-secret-must-match-backend-secret-min-32-chars
    # n8n-specific JWT secret (same value!)
    N8N_JWT_SECRET: your-jwt-secret-must-match-backend-secret-min-32-chars

n8n:
  environment:
    # JWT Authentication enabled
    N8N_JWT_AUTH_ACTIVE: "true"
    # Shared secret for JWT verification
    N8N_USER_MANAGEMENT_JWT_SECRET: your-jwt-secret-must-match-backend-secret-min-32-chars
    # Auto-create users from valid JWTs
    N8N_AUTO_CREATE_USERS: "true"
    # Disable built-in authentication
    N8N_BASIC_AUTH_ACTIVE: "false"
```

---

## 🔧 Backend Implementation

### Step 1: Create n8n JWT Service

Create `backend/src/n8n/n8n-jwt.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class N8nJwtService {
  private readonly n8nJwtSecret: string;
  private readonly n8nJwtExpiration: string;

  constructor(private configService: ConfigService) {
    this.n8nJwtSecret = this.configService.get<string>('N8N_JWT_SECRET');
    this.n8nJwtExpiration = this.configService.get<string>('N8N_JWT_EXPIRATION') || '1h';
  }

  /**
   * Generate JWT token for n8n authentication
   */
  generateN8nToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.roles?.[0]?.name || 'user',
      tenantId: user.tenantId,
    };

    return jwt.sign(payload, this.n8nJwtSecret, {
      expiresIn: this.n8nJwtExpiration,
      issuer: 'your-app',
      audience: 'n8n',
    });
  }

  /**
   * Verify n8n JWT token
   */
  verifyN8nToken(token: string): any {
    try {
      return jwt.verify(token, this.n8nJwtSecret, {
        issuer: 'your-app',
        audience: 'n8n',
      });
    } catch (error) {
      throw new Error('Invalid n8n JWT token');
    }
  }
}
```

### Step 2: Add n8n Token Endpoint

Update `backend/src/workflows/workflows.controller.ts`:

```typescript
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { N8nJwtService } from '../n8n/n8n-jwt.service';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  constructor(
    private readonly n8nJwtService: N8nJwtService,
  ) {}

  @Get('n8n-token')
  generateN8nToken(@Req() req) {
    const user = req.user;
    const n8nToken = this.n8nJwtService.generateN8nToken(user);
    
    return {
      token: n8nToken,
      expiresIn: 3600, // 1 hour
    };
  }

  @Get('n8n-url')
  getN8nUrl(@Req() req) {
    const user = req.user;
    const n8nToken = this.n8nJwtService.generateN8nToken(user);
    const n8nUrl = process.env.N8N_URL || 'http://n8n.saas.local';
    
    // You can add a path parameter for specific workflows
    const path = req.query.path || '/';
    
    return {
      url: `${n8nUrl}${path}?token=${n8nToken}`,
    };
  }
}
```

---

## ⚛️ Frontend Implementation

### Step 1: Update WorkflowEditor Component

Update `frontend/src/pages/WorkflowEditor.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { workflowsApi } from '../api/workflows';
import Header from '../components/Header';
import './WorkflowEditor.css';

const WorkflowEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [n8nUrl, setN8nUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadN8nUrl();
  }, [id]);

  const loadN8nUrl = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get n8n URL with JWT token from backend
      const path = id ? `/workflow/${id}` : '/workflow/new';
      const { url } = await workflowsApi.getN8nUrl(path);
      
      setN8nUrl(url);
    } catch (err: any) {
      console.error('Error loading n8n URL:', err);
      setError('Failed to load workflow editor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workflow-editor">
      <Header />

      <main className="workflow-editor-content">
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading workflow editor...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-message">{error}</div>
            <button onClick={loadN8nUrl} className="button button-primary">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && n8nUrl && (
          <iframe
            src={n8nUrl}
            className="n8n-iframe"
            title="n8n Workflow Editor"
            allow="clipboard-read; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
          />
        )}
      </main>
    </div>
  );
};

export default WorkflowEditor;
```

---

## 🧪 Testing the JWT SSO

### 1. Start Services

```bash
docker compose up -d
```

### 2. Login to Your App

1. Go to: **http://app.saas.local**
2. Login with: `admin@test.com` / `password123`
3. Your backend generates a regular JWT for your app

### 3. Access n8n

1. Click **"Create Workflow"** button
2. Frontend requests **n8n-specific JWT** from backend
3. Backend returns URL: `http://n8n.saas.local/workflow/new?token=JWT_HERE`
4. Iframe loads n8n with JWT
5. n8n validates JWT and auto-creates/logs in user
6. **You're in n8n without any login prompt!** ✅

---

## 🔍 JWT Token Structure

### Your App's JWT (for frontend/backend)

```json
{
  "sub": "user-id-123",
  "email": "user@example.com",
  "tenantId": "tenant-uuid",
  "roles": ["user"],
  "iat": 1736998400,
  "exp": 1737002000,
  "iss": "http://api.saas.local"
}
```

### n8n's JWT (for n8n authentication)

```json
{
  "sub": "user-id-123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "tenantId": "tenant-uuid",
  "iat": 1736998400,
  "exp": 1737002000,
  "iss": "your-app",
  "aud": "n8n"
}
```

**Key differences:**
- n8n needs `firstName`, `lastName` for user profile
- Use `iss: "your-app"` and `aud: "n8n"` for proper token validation
- Both use the **same secret** for signing

---

## 🔒 Security Best Practices

### 1. Token Expiration

Use **short-lived tokens** (1 hour recommended):

```typescript
JWT_EXPIRATION=1h
N8N_JWT_EXPIRATION=1h
```

### 2. Token Refresh

When n8n token expires:
1. Frontend detects 401 response
2. Calls backend for new n8n token
3. Reloads iframe with new token

```typescript
// Add refresh logic
const refreshN8nToken = async () => {
  const { url } = await workflowsApi.getN8nUrl(currentPath);
  setN8nUrl(url);
};
```

### 3. Secure Secret Storage

**Never commit secrets to git!**

Use environment variables:
```bash
JWT_SECRET=$(openssl rand -base64 32)
N8N_JWT_SECRET=$JWT_SECRET  # Same secret!
```

### 4. HTTPS in Production

```yaml
N8N_PROTOCOL: https
N8N_HOST: n8n.yourcompany.com
N8N_SECURE_COOKIE: "true"
```

---

## 🎭 User Management

### Auto-Create Users

When a user accesses n8n for the first time:

1. n8n validates JWT
2. Checks if user exists by `email`
3. If not, **auto-creates** user with info from JWT
4. User can immediately start using n8n

**No manual user creation needed!**

### Sync User Updates

If user changes name in your app:

1. Generate new JWT with updated info
2. Next time user accesses n8n, info is updated

### Deactivate Users

If you deactivate a user in your app:

1. Stop generating JWTs for them
2. Optionally, call n8n API to disable their account:

```bash
DELETE http://n8n.saas.local/api/v1/users/{userId}
Authorization: Bearer {N8N_API_KEY}
```

---

## 🐛 Troubleshooting

### Issue: "401 Unauthorized" in n8n iframe

**Causes:**
1. JWT secret mismatch between backend and n8n
2. JWT expired
3. JWT missing required fields

**Solution:**
```bash
# Check secrets match
docker compose exec backend env | grep JWT_SECRET
docker compose exec n8n env | grep JWT_SECRET

# Check JWT payload
jwt.io  # Paste your token to inspect
```

### Issue: User not auto-created

**Causes:**
1. `N8N_AUTO_CREATE_USERS` not set to "true"
2. JWT missing email field
3. Invalid JWT format

**Solution:**
```bash
# Verify n8n config
docker compose exec n8n env | grep AUTO_CREATE

# Check n8n logs
docker compose logs n8n | grep -i "user"
```

### Issue: Token expires too quickly

**Solution:**
Increase expiration:
```yaml
N8N_JWT_EXPIRATION: 4h  # or 8h, 24h
```

---

## 📊 Complete Flow Diagram

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Login (email/password)
       ▼
┌──────────────┐
│  Backend API │
└──────┬───────┘
       │ 2. Generate JWT
       │    {sub, email, roles}
       ▼
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │ 3. Click "Create Workflow"
       │
       │ 4. Request n8n token
       ▼
┌──────────────┐
│  Backend API │
└──────┬───────┘
       │ 5. Generate n8n JWT
       │    {sub, email, firstName, lastName}
       ▼
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │ 6. Load iframe
       │    <iframe src="n8n.local?token=JWT">
       ▼
┌──────────────┐
│     n8n      │
│              │
│ 7. Validate JWT (shared secret)
│ 8. Auto-create/get user
│ 9. Start session
│              │
│ ✅ User logged in!
└──────────────┘
```

---

## ✅ Checklist

- [ ] Same JWT secret in backend and n8n
- [ ] Backend generates n8n-compatible JWTs
- [ ] Frontend requests n8n URL from backend
- [ ] Iframe loads with JWT token
- [ ] n8n auto-creates users enabled
- [ ] Tested end-to-end flow
- [ ] JWT expiration configured
- [ ] Error handling implemented

---

## 🚀 Next Steps

1. **Test the flow** - Login → Click "Create Workflow" → Should see n8n without login
2. **Implement token refresh** - Auto-refresh before expiration
3. **Add user sync** - Update n8n when users change in your app
4. **Monitor JWT usage** - Log token generation/validation
5. **Prepare for production** - HTTPS, secure secrets, monitoring

---

**Your JWT-based SSO is ready!** No Keycloak needed - just clean JWT authentication! 🎉

