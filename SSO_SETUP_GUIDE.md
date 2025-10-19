# 🔐 SSO Setup Guide - Keycloak OIDC Integration

This guide explains how to use the professional SSO setup with Keycloak for n8n, frontend, and backend authentication.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Keycloak OIDC Provider                   │
│                    (localhost:8080)                          │
│                                                              │
│  Realm: saas-platform                                       │
│  ├─ Client: n8n-client (n8n SSO)                           │
│  ├─ Client: backend-api (Backend auth)                      │
│  └─ Client: frontend-app (Frontend auth)                    │
└──────────────┬───────────────┬──────────────┬───────────────┘
               │               │              │
               ▼               ▼              ▼
         ┌──────────┐    ┌─────────┐   ┌──────────┐
         │   n8n    │    │ Backend │   │ Frontend │
         │  :5678   │    │  :3001  │   │  :3000   │
         └──────────┘    └─────────┘   └──────────┘
```

---

## 📋 Prerequisites

1. **Hosts file configured** with domain entries
2. **Docker Desktop running**
3. **All ports available** (80, 3000, 3001, 5678, 8080)

---

## 🚀 Quick Start

### 1. Start All Services

```bash
docker compose up -d
```

Wait for all services to be healthy (about 2-3 minutes):

```bash
docker compose ps
```

### 2. Access Keycloak Admin Console

1. Go to: **http://localhost:8080**
2. Click "Administration Console"
3. Login:
   - **Username:** `admin`
   - **Password:** `admin`

### 3. Verify Realm Configuration

1. In Keycloak admin, select **"saas-platform"** realm (top-left dropdown)
2. Go to **Clients** → You should see:
   - ✅ `n8n-client`
   - ✅ `backend-api`
   - ✅ `frontend-app`
3. Go to **Users** → You should see:
   - ✅ `admin` (admin@saas.local)
   - ✅ `testuser` (test@saas.local)

---

## 🧪 Test the SSO Integration

### Option 1: Login to n8n with SSO

1. **Go to:** http://n8n.saas.local
2. **Click:** "Login with SSO" button
3. **You'll be redirected to Keycloak**
4. **Login with:**
   - Email: `admin@saas.local`
   - Password: `admin123`
5. **You'll be redirected back to n8n** - logged in! 🎉

### Option 2: Access via Frontend (Embedded n8n)

1. **Go to:** http://app.saas.local
2. **Login** (this uses your backend auth, not Keycloak directly)
3. **Click "Create Workflow"**
4. **n8n loads in iframe** - SSO should auto-authenticate! 🎉

---

## 🔑 Default Credentials

### Keycloak Admin
- **URL:** http://localhost:8080
- **Username:** `admin`
- **Password:** `admin`

### Keycloak Users (for SSO login)
| User | Email | Password | Role |
|------|-------|----------|------|
| admin | admin@saas.local | admin123 | admin, user |
| testuser | test@saas.local | test123 | user |

---

## ⚙️ Configuration Details

### n8n OIDC Settings

In `docker-compose.yml`:

```yaml
N8N_SSO_ENABLED: "true"
N8N_SSO_OIDC_ENABLED: "true"
N8N_SSO_OIDC_CONFIG_ISSUER: "http://localhost:8080/realms/saas-platform"
N8N_SSO_OIDC_CONFIG_CLIENT_ID: "n8n-client"
N8N_SSO_OIDC_CONFIG_CLIENT_SECRET: "n8n-client-secret-change-in-production"
N8N_SSO_OIDC_CONFIG_REDIRECT_URL: "http://n8n.saas.local/rest/sso/oidc/callback"
```

### Keycloak Client Configuration

**n8n-client:**
- **Client ID:** `n8n-client`
- **Client Secret:** `n8n-client-secret-change-in-production`
- **Valid Redirect URIs:**
  - `http://n8n.saas.local/*`
  - `http://n8n.saas.local/rest/sso/oidc/callback`
- **Access Type:** confidential
- **Standard Flow:** Enabled

---

## 🔧 Customization

### Add New Users

1. **Go to Keycloak Admin:** http://localhost:8080
2. **Select realm:** saas-platform
3. **Go to:** Users → Add user
4. **Fill in:**
   - Username
   - Email
   - First/Last Name
5. **Save**
6. **Go to:** Credentials tab
7. **Set Password** (uncheck "Temporary")

### Add New Client

1. **Go to:** Clients → Create
2. **Fill in:**
   - Client ID: `your-app`
   - Client Protocol: `openid-connect`
3. **Save**
4. **Configure:**
   - Access Type: `confidential`
   - Valid Redirect URIs: `http://your-app/*`
   - Web Origins: `http://your-app`
5. **Get Client Secret:** Credentials tab

### Modify n8n SSO Settings

To change n8n's SSO configuration:

1. **Edit `docker-compose.yml`**
2. **Update n8n environment variables**
3. **Restart n8n:**
   ```bash
   docker compose restart n8n
   ```

---

## 🐛 Troubleshooting

### Issue: "Login with SSO" button not showing in n8n

**Solution:**
1. Check n8n logs:
   ```bash
   docker compose logs n8n | grep SSO
   ```
2. Verify environment variables are set
3. Restart n8n:
   ```bash
   docker compose restart n8n
   ```

### Issue: SSO login redirects but fails

**Possible causes:**
1. **Keycloak not fully started** - Wait 2-3 minutes after `docker compose up`
2. **Wrong redirect URI** - Check Keycloak client configuration
3. **Client secret mismatch** - Verify n8n config matches Keycloak

**Check:**
```bash
# Keycloak health
curl http://localhost:8080/health/ready

# n8n SSO config
docker compose exec n8n env | grep SSO
```

### Issue: 401 Unauthorized after SSO login

**Solution:**
1. **Clear n8n data:**
   ```bash
   docker compose down
   docker volume rm n8npoc_n8n_data
   docker compose up -d
   ```
2. **Try SSO login again**

### Issue: Can't access Keycloak admin

**Solution:**
1. **Check Keycloak is running:**
   ```bash
   docker compose ps keycloak
   ```
2. **Check logs:**
   ```bash
   docker compose logs keycloak --tail 50
   ```
3. **Restart if needed:**
   ```bash
   docker compose restart keycloak
   ```

---

## 🔒 Security Notes

### ⚠️ For POC/Development Only

The current configuration is for **development/POC purposes**. For production:

1. **Change all secrets:**
   - Keycloak admin password
   - Client secrets
   - n8n encryption key

2. **Use HTTPS:**
   - Get SSL certificates
   - Configure nginx for HTTPS
   - Update all URLs to `https://`

3. **Secure Keycloak:**
   - Use external database (not in same postgres)
   - Enable HTTPS
   - Configure proper realm settings
   - Set up 2FA/MFA

4. **Network Security:**
   - Don't expose Keycloak directly (use reverse proxy)
   - Use internal Docker networks
   - Implement rate limiting
   - Add WAF (Web Application Firewall)

---

## 📊 SSO Flow Diagram

```
User clicks "Login with SSO" in n8n
        ↓
n8n redirects to Keycloak auth URL
        ↓
User enters credentials in Keycloak
        ↓
Keycloak validates user
        ↓
Keycloak generates authorization code
        ↓
Keycloak redirects back to n8n callback
        ↓
n8n exchanges code for access token
        ↓
n8n retrieves user info from Keycloak
        ↓
n8n creates/updates user account
        ↓
User is logged into n8n! 🎉
```

---

## 🔗 Useful Links

- **Keycloak Documentation:** https://www.keycloak.org/documentation
- **n8n SSO Documentation:** https://docs.n8n.io/hosting/authentication/sso/
- **OIDC Specification:** https://openid.net/specs/openid-connect-core-1_0.html

---

## 🎯 Next Steps

1. ✅ Test SSO login to n8n
2. ✅ Create additional users in Keycloak
3. ✅ Configure tenant-specific permissions
4. ✅ Integrate backend authentication with Keycloak
5. ✅ Implement frontend Keycloak integration
6. ✅ Set up proper production security

---

## 💡 Tips

- **Always test SSO** after configuration changes
- **Check Keycloak logs** for authentication errors
- **Use Keycloak admin console** to debug client issues
- **Keep client secrets secure** - don't commit to git
- **Monitor session timeouts** and adjust as needed

---

**Your SSO-enabled n8n SaaS platform is ready!** 🚀

