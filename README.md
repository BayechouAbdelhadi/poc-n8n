# 🚀 SaaS Platform with Embedded n8n Workflows - Technical Implementation Guide

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [OIDC and SSO Setup](#oidc-and-sso-setup)
3. [Infrastructure Setup](#infrastructure-setup)
4. [Frontend Embedding](#frontend-embedding)
5. [Security Considerations](#security-considerations)
6. [Multi-Tenancy Approach](#multi-tenancy-approach)
7. [Local Development Setup](#local-development-setup)
8. [Future Scaling Plan](#future-scaling-plan)

---

## 1. Architecture Overview

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Browser                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              React SaaS Application                        │  │
│  │  ┌──────────────────┐    ┌──────────────────────────┐    │  │
│  │  │  Auth Pages      │    │  n8n Embedded UI         │    │  │
│  │  │  (Login/Register)│    │  (iframe/reverse proxy)  │    │  │
│  │  └──────────────────┘    └──────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Gateway / Nginx                        │
│              (Reverse Proxy + SSL Termination)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
┌───────────────────────────┐  ┌──────────────────────────┐
│    NestJS Backend API     │  │    n8n Instance          │
│  ┌─────────────────────┐  │  │  ┌────────────────────┐ │
│  │  OIDC Provider      │  │  │  │  OIDC Client       │ │
│  │  (JWT issuer)       │  │  │  │  (JWT consumer)    │ │
│  └─────────────────────┘  │  │  └────────────────────┘ │
│  ┌─────────────────────┐  │  │  ┌────────────────────┐ │
│  │  User Management    │  │  │  │  Workflow Engine   │ │
│  └─────────────────────┘  │  │  └────────────────────┘ │
│  ┌─────────────────────┐  │  │  ┌────────────────────┐ │
│  │  Tenant Management  │  │  │  │  Webhook Handler   │ │
│  └─────────────────────┘  │  │  └────────────────────┘ │
└───────────────────────────┘  └──────────────────────────┘
                 │                         │
                 └────────────┬────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                          │
│  ┌──────────────────┐    ┌──────────────────────────────┐      │
│  │  SaaS Tables     │    │  n8n Tables                  │      │
│  │  (users, tenants)│    │  (workflows, executions)     │      │
│  └──────────────────┘    └──────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Authentication Flow
1. **User Login** → React app → NestJS API
2. **OIDC Token Generation** → NestJS issues JWT with user/tenant claims
3. **Token Storage** → Secure HTTP-only cookie + localStorage for client
4. **n8n Access** → Token forwarded to n8n via reverse proxy headers
5. **n8n Validation** → n8n validates JWT and loads user workspace

#### Workflow Execution Flow
1. **User Creates Workflow** → n8n UI (embedded)
2. **Workflow Save** → n8n backend → PostgreSQL (with tenant_id)
3. **Workflow Trigger** → n8n webhook/scheduler
4. **Execution** → n8n engine → Results stored with tenant_id
5. **Monitoring** → React app queries NestJS API for execution logs

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | SaaS UI + n8n embedding |
| **Backend** | NestJS + TypeScript | API, Auth, OIDC provider |
| **Workflow Engine** | n8n (self-hosted) | Workflow automation |
| **Authentication** | OIDC/OAuth2 + JWT | SSO between services |
| **Database** | PostgreSQL 15 | Persistent storage |
| **Identity Provider** | Keycloak (dev) / Auth0 (prod) | OIDC provider (optional) |
| **Reverse Proxy** | Nginx | Routing, SSL, security headers |
| **Containerization** | Docker + Docker Compose | Local development |
| **Orchestration** | Kubernetes (production) | Scaling and deployment |

---

## 2. OIDC and SSO Setup

### OIDC Architecture

In this POC, we'll use two approaches:

**Option A: NestJS as OIDC Provider**
- NestJS acts as the identity provider
- Issues JWT tokens for both React and n8n
- Simpler setup, full control

**Option B: External OIDC Provider (Keycloak/Auth0)**
- Dedicated identity provider
- NestJS and n8n are both OIDC clients
- Better separation of concerns

### JWT Token Structure

```json
{
  "iss": "https://api.yoursaas.com",
  "sub": "user-uuid-12345",
  "aud": ["api.yoursaas.com", "n8n.yoursaas.com"],
  "exp": 1735689600,
  "iat": 1735686000,
  "email": "user@example.com",
  "tenant_id": "tenant-uuid-67890",
  "roles": ["user", "workflow_editor"],
  "n8n_user_id": "n8n-user-123"
}
```

### NestJS OIDC Provider Setup

**Key Dependencies:**
```json
{
  "@nestjs/passport": "^10.0.3",
  "@nestjs/jwt": "^10.2.0",
  "passport-jwt": "^4.0.1",
  "oidc-provider": "^8.4.6"
}
```

**Implementation Steps:**

1. **Create OIDC Module** (see `backend/src/auth/oidc.module.ts`)
2. **Configure JWT Strategy** (see `backend/src/auth/strategies/jwt.strategy.ts`)
3. **Implement Token Endpoint** (see `backend/src/auth/auth.controller.ts`)
4. **User Info Endpoint** (see `backend/src/auth/userinfo.controller.ts`)

### n8n OIDC Client Configuration

**Environment Variables for n8n:**

```bash
N8N_EDITOR_BASE_URL=https://workflows.yoursaas.com
N8N_PROTOCOL=https
N8N_HOST=workflows.yoursaas.com

# OIDC/SSO Configuration
N8N_SSO_OIDC_ENABLED=true
N8N_SSO_OIDC_ISSUER_URL=https://api.yoursaas.com/auth/oidc
N8N_SSO_OIDC_CLIENT_ID=n8n-client
N8N_SSO_OIDC_CLIENT_SECRET=your-secure-secret-here
N8N_SSO_OIDC_SCOPE=openid profile email
N8N_SSO_OIDC_REDIRECT_URL=https://workflows.yoursaas.com/rest/oauth2-credential/callback

# Map OIDC claims to n8n user fields
N8N_SSO_OIDC_CLAIM_EMAIL=email
N8N_SSO_OIDC_CLAIM_FIRST_NAME=given_name
N8N_SSO_OIDC_CLAIM_LAST_NAME=family_name

# Auto-create users on first login
N8N_SSO_OIDC_AUTO_CREATE_USER=true
```

### Keycloak Setup (Development Alternative)

If using Keycloak as OIDC provider:

1. **Create Realm:** `saas-platform`
2. **Create Clients:**
   - `react-app` (public client, PKCE enabled)
   - `nestjs-api` (confidential client)
   - `n8n` (confidential client)
3. **Configure Client Scopes:**
   - `email`, `profile`, `tenant_id`, `roles`
4. **User Federation:** Connect to your PostgreSQL database

**Keycloak Configuration Export:** See `infrastructure/keycloak/realm-export.json`

---

## 3. Infrastructure Setup

### Docker Compose Architecture

Our local development stack includes:
- PostgreSQL (shared database)
- Redis (session storage and caching)
- Keycloak (OIDC provider - optional)
- n8n (workflow engine)
- NestJS API (backend)
- React App (frontend)
- Nginx (reverse proxy)

See `docker-compose.yml` for complete configuration.

### Database Schema Design

**SaaS Schema (managed by NestJS):**

```sql
-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  plan VARCHAR(50) DEFAULT 'free',
  n8n_database_schema VARCHAR(63) UNIQUE, -- PostgreSQL schema for isolation
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  tenant_id UUID REFERENCES tenants(id),
  n8n_user_id INTEGER, -- Maps to n8n's user ID
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API Keys for programmatic access
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  key_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**n8n Schema (managed by n8n):**
- Uses default n8n schema with modifications
- Added `tenant_id` to key tables for isolation

### n8n Database Customization

To support multi-tenancy, we'll modify n8n's database:

```sql
-- Add tenant_id to n8n tables
ALTER TABLE workflow_entity ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE execution_entity ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE credentials_entity ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Create indexes for performance
CREATE INDEX idx_workflow_tenant ON workflow_entity(tenant_id);
CREATE INDEX idx_execution_tenant ON execution_entity(tenant_id);
CREATE INDEX idx_credentials_tenant ON credentials_entity(tenant_id);
```

### Docker Networking

```yaml
networks:
  saas-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

All services communicate on this internal network, with only Nginx exposed externally.

---

## 4. Frontend Embedding

### Embedding Strategies

#### Option A: iframe Embedding (Recommended for POC)

**Pros:**
- Simple implementation
- Security isolation
- No CORS issues

**Cons:**
- Limited parent-child communication
- Responsive design challenges
- Some features may be restricted by CSP

**Implementation:**

```tsx
// src/components/WorkflowEditor.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const WorkflowEditor: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { token } = useAuth();
  const [iframeUrl, setIframeUrl] = useState<string>('');

  useEffect(() => {
    // Generate signed URL with embedded token
    const url = new URL(`${process.env.REACT_APP_N8N_URL}/workflow/new`);
    url.searchParams.set('token', token);
    setIframeUrl(url.toString());
  }, [token]);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        title="n8n Workflow Editor"
      />
    </div>
  );
};

export default WorkflowEditor;
```

#### Option B: Reverse Proxy with Token Injection

**Nginx Configuration:**

```nginx
location /workflows/ {
    # Remove /workflows prefix and proxy to n8n
    rewrite ^/workflows/(.*)$ /$1 break;
    
    proxy_pass http://n8n:5678;
    
    # Inject authentication header
    proxy_set_header Authorization "Bearer $http_x_auth_token";
    proxy_set_header X-Tenant-ID $http_x_tenant_id;
    
    # Standard proxy headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket support for real-time updates
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

**React Axios Configuration:**

```typescript
// src/api/axiosConfig.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // Include cookies
});

// Inject token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  const tenantId = localStorage.getItem('tenant_id');
  
  if (token) {
    config.headers['X-Auth-Token'] = token;
  }
  
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
  }
  
  return config;
});

export default api;
```

### Communication Between React and n8n

**PostMessage API for iframe:**

```typescript
// Parent (React App)
const sendMessageToN8n = (message: any) => {
  iframeRef.current?.contentWindow?.postMessage(
    message,
    process.env.REACT_APP_N8N_URL
  );
};

// Listen for messages from n8n
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== process.env.REACT_APP_N8N_URL) return;
    
    console.log('Message from n8n:', event.data);
    // Handle workflow save, execution status, etc.
  };
  
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

### Responsive Design

```css
/* src/styles/workflow-editor.css */
.workflow-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 64px); /* Account for header */
  overflow: hidden;
}

.workflow-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}

@media (max-width: 768px) {
  .workflow-container {
    height: calc(100vh - 56px);
  }
}
```

---

## 5. Security Considerations

### Authentication Security

#### HTTP-Only Cookies for Token Storage

**NestJS Configuration:**

```typescript
// backend/src/auth/auth.controller.ts
@Post('login')
async login(@Body() loginDto: LoginDto, @Res() response: Response) {
  const { accessToken, refreshToken, user } = await this.authService.login(loginDto);
  
  // Set HTTP-only cookie for access token
  response.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  
  // Set HTTP-only cookie for refresh token
  response.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  
  return response.json({ user });
}
```

### CORS Configuration

```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://app.yoursaas.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
});
```

### Content Security Policy (CSP)

**Nginx Headers:**

```nginx
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.yoursaas.com wss://workflows.yoursaas.com;
  frame-src 'self' https://workflows.yoursaas.com;
  frame-ancestors 'self';
" always;

add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Token Validation

**NestJS JWT Guard:**

```typescript
// backend/src/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

### Rate Limiting

```typescript
// backend/src/main.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

app.use('/auth/', limiter);
```

### Input Validation

```typescript
// backend/src/auth/dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

### Secrets Management

**Development:** Use `.env` files (never commit!)
**Production:** Use AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault

```typescript
// backend/src/config/secrets.service.ts
import { Injectable } from '@nestjs/common';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

@Injectable()
export class SecretsService {
  private client: SecretsManagerClient;

  constructor() {
    this.client = new SecretsManagerClient({ region: 'us-east-1' });
  }

  async getSecret(secretName: string): Promise<string> {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await this.client.send(command);
    return response.SecretString;
  }
}
```

---

## 6. Multi-Tenancy Approach

### Tenant Isolation Strategies

We'll implement **Schema-based Multi-tenancy** for optimal balance between isolation and cost.

#### Strategy Comparison

| Strategy | Pros | Cons | Use Case |
|----------|------|------|----------|
| **Database per Tenant** | Maximum isolation, easy backups | High cost, complex management | Enterprise customers |
| **Schema per Tenant** | Good isolation, moderate cost | Schema management overhead | Mid-market customers |
| **Row-level Isolation** | Cost-effective, simple | Security risks, slower queries | SMB/startups |

### PostgreSQL Schema-Based Isolation

```sql
-- Create schema for each tenant
CREATE SCHEMA tenant_67890;

-- Set search path for n8n connection
SET search_path TO tenant_67890, public;

-- n8n tables will be created in tenant schema
-- Copy of n8n schema structure for each tenant
```

### NestJS Tenant Middleware

```typescript
// backend/src/common/middleware/tenant.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant from JWT token
    const token = req.cookies?.access_token;
    const decoded = this.jwtService.decode(token);
    
    // Add tenant context to request
    req['tenantId'] = decoded?.tenant_id;
    req['tenantSchema'] = `tenant_${decoded?.tenant_id}`;
    
    next();
  }
}
```

### n8n Tenant Isolation

**Custom n8n Middleware:**

```javascript
// n8n-custom/middleware/tenant-isolation.js
module.exports = function tenantIsolation(req, res, next) {
  const tenantId = req.user?.tenant_id;
  
  if (!tenantId) {
    return res.status(403).json({ error: 'Tenant context required' });
  }
  
  // Set PostgreSQL schema for this request
  req.dbConnection.query(`SET search_path TO tenant_${tenantId}, public`);
  
  next();
};
```

### Dynamic Database Connection

```typescript
// backend/src/database/tenant-connection.service.ts
import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class TenantConnectionService {
  private connectionPools: Map<string, Pool> = new Map();

  getConnection(tenantId: string): Pool {
    if (!this.connectionPools.has(tenantId)) {
      const pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        schema: `tenant_${tenantId}`,
        max: 10,
      });
      
      this.connectionPools.set(tenantId, pool);
    }
    
    return this.connectionPools.get(tenantId);
  }
}
```

### Resource Quotas

```typescript
// backend/src/tenants/tenant.entity.ts
@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'free' })
  plan: string;

  // Resource limits
  @Column({ default: 10 })
  maxWorkflows: number;

  @Column({ default: 1000 })
  maxExecutionsPerMonth: number;

  @Column({ default: 5 })
  maxUsers: number;

  @Column({ type: 'bigint', default: 1073741824 }) // 1GB
  storageLimit: number;
}
```

---

## 7. Local Development Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Docker Desktop
- Git

### Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd saas-n8n-poc

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# 4. Start infrastructure (PostgreSQL, Redis, Keycloak, n8n)
docker-compose up -d

# 5. Wait for services to be ready (30-60 seconds)
docker-compose logs -f

# 6. Run database migrations
cd backend
npm run migration:run

# 7. Seed initial data
npm run seed

# 8. Start backend
npm run start:dev

# 9. Start frontend (in new terminal)
cd frontend
npm start
```

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| React App | http://localhost:3000 | admin@test.com / password123 |
| NestJS API | http://localhost:3001 | N/A |
| n8n | http://localhost:5678 | SSO via React app |
| Keycloak Admin | http://localhost:8080 | admin / admin |
| PostgreSQL | localhost:5432 | postgres / postgres |

### Environment Variables

**Backend (.env):**

```bash
# Application
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# OIDC Configuration
OIDC_ISSUER=http://localhost:3001/auth/oidc
OIDC_CALLBACK_URL=http://localhost:3001/auth/callback

# n8n Configuration
N8N_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Keycloak (optional)
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=saas-platform
KEYCLOAK_CLIENT_ID=nestjs-api
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret
```

**Frontend (.env):**

```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_N8N_URL=http://localhost:5678
REACT_APP_ENVIRONMENT=development
```

### Docker Compose Services

See `docker-compose.yml` for full configuration.

### Troubleshooting

#### n8n Not Starting
```bash
# Check logs
docker-compose logs n8n

# Restart service
docker-compose restart n8n
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose ps postgres

# Connect to database
docker-compose exec postgres psql -U postgres -d saas_db
```

#### Port Conflicts
```bash
# Check what's using port
# Windows
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

---

## 8. Future Scaling Plan

### Phase 1: POC (Current)
- Single server
- Docker Compose
- ~100 users
- Basic monitoring

### Phase 2: Production MVP (3-6 months)

#### Infrastructure
- **Load Balancer:** AWS ALB / Nginx
- **Application Servers:** 2-3 instances (auto-scaling)
- **Database:** PostgreSQL RDS with read replicas
- **Cache:** Redis Cluster
- **File Storage:** AWS S3 / Azure Blob
- **CDN:** CloudFlare

#### Architecture Changes
```
[CloudFlare CDN]
        ↓
[AWS ALB / Load Balancer]
        ↓
   ┌────┴────┐
   ↓         ↓
[NestJS-1] [NestJS-2] [NestJS-N]
   ↓         ↓
   └────┬────┘
        ↓
[PostgreSQL RDS]
        ↓
[Read Replicas]
```

#### Monitoring & Observability
- **APM:** New Relic / DataDog
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Metrics:** Prometheus + Grafana
- **Alerting:** PagerDuty / Opsgenie
- **Error Tracking:** Sentry

```typescript
// backend/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Phase 3: Scale (6-12 months)

#### Kubernetes Migration

**Deployment Architecture:**

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs-api
spec:
  replicas: 5
  selector:
    matchLabels:
      app: nestjs-api
  template:
    metadata:
      labels:
        app: nestjs-api
    spec:
      containers:
      - name: nestjs-api
        image: yoursaas/nestjs-api:latest
        ports:
        - containerPort: 3001
        env:
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: host
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: nestjs-api
spec:
  selector:
    app: nestjs-api
  ports:
  - port: 80
    targetPort: 3001
  type: LoadBalancer
```

#### n8n Scaling Strategy

**Option A: n8n Queue Mode**
- Separate n8n instances for UI and workers
- Workers scale based on queue length
- Redis/PostgreSQL for queue management

```yaml
# k8s/n8n-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: n8n-main
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: n8n
        image: n8nio/n8n:latest
        env:
        - name: EXECUTIONS_MODE
          value: "queue"
        - name: QUEUE_BULL_REDIS_HOST
          value: "redis-service"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: n8n-worker
spec:
  replicas: 5
  template:
    spec:
      containers:
      - name: n8n-worker
        image: n8nio/n8n:latest
        env:
        - name: EXECUTIONS_MODE
          value: "queue"
        - name: N8N_WORKER_MODE
          value: "worker"
        - name: QUEUE_BULL_REDIS_HOST
          value: "redis-service"
```

#### Database Scaling

**Sharding Strategy:**
- Shard by tenant_id
- Dedicated database clusters for large tenants
- Read/write splitting

```typescript
// backend/src/database/shard-resolver.service.ts
@Injectable()
export class ShardResolverService {
  getShardForTenant(tenantId: string): string {
    // Consistent hashing
    const hash = crypto.createHash('sha256').update(tenantId).digest('hex');
    const shardIndex = parseInt(hash.substring(0, 8), 16) % this.totalShards;
    return `shard-${shardIndex}`;
  }
}
```

#### Caching Strategy

```typescript
// backend/src/common/cache/cache.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    const client = this.redisService.getClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    const client = this.redisService.getClient();
    await client.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const client = this.redisService.getClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  }
}
```

### Phase 4: Enterprise (12+ months)

#### Features
- Multi-region deployment
- Disaster recovery
- 99.99% SLA
- Advanced security (SOC 2, ISO 27001)
- Dedicated tenant clusters
- White-label options

#### Global Architecture

```
[Global DNS / Traffic Manager]
        ↓
   ┌────┴────┐
   ↓         ↓
[US-East]  [EU-West]
Region-1   Region-2
   ↓         ↓
[Full Stack] [Full Stack]
        ↓
[Cross-region Replication]
```

### CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t yoursaas/backend:${{ github.sha }} ./backend
          docker build -t yoursaas/frontend:${{ github.sha }} ./frontend
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push yoursaas/backend:${{ github.sha }}
          docker push yoursaas/frontend:${{ github.sha }}
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/backend backend=yoursaas/backend:${{ github.sha }}
          kubectl set image deployment/frontend frontend=yoursaas/frontend:${{ github.sha }}
          kubectl rollout status deployment/backend
          kubectl rollout status deployment/frontend
```

### Performance Targets

| Metric | POC | MVP | Scale | Enterprise |
|--------|-----|-----|-------|-----------|
| **Concurrent Users** | 100 | 1,000 | 10,000 | 100,000+ |
| **API Response Time** | <500ms | <200ms | <100ms | <50ms |
| **Uptime** | 95% | 99% | 99.9% | 99.99% |
| **Max Workflows** | 1K | 100K | 1M | 10M+ |
| **Max Executions/day** | 10K | 1M | 10M | 100M+ |

### Cost Estimation

**Monthly Infrastructure Costs:**

| Phase | AWS Cost | Other Services | Total |
|-------|----------|----------------|-------|
| **POC** | $50 | $0 | $50 |
| **MVP** | $500-1K | $200 (monitoring) | $700-1.2K |
| **Scale** | $3-5K | $1K (monitoring, CDN) | $4-6K |
| **Enterprise** | $20-50K | $5K (enterprise tools) | $25-55K |

---

## 🎯 Next Steps

1. **Clone and Setup**
   ```bash
   npm run setup
   ```

2. **Configure Environment**
   - Copy `.env.example` files
   - Update with your credentials

3. **Start Services**
   ```bash
   docker-compose up -d
   npm run dev
   ```

4. **Test Integration**
   - Create a test user
   - Build a workflow in n8n
   - Verify SSO works

5. **Customize**
   - Update branding
   - Configure OIDC provider
   - Add custom workflows

---

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [OIDC Specification](https://openid.net/connect/)
- [PostgreSQL Multi-tenancy](https://www.postgresql.org/docs/current/ddl-schemas.html)

---

## 🤝 Support & Contributing

For questions or issues:
- Open a GitHub issue
- Contact: support@yoursaas.com

---

**Built with ❤️ for the SaaS community**

#   p o c - n 8 n  
 