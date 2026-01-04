# Open WebUI Integration Guide

## Architecture Overview

Word GPT Plus integrates with Open WebUI using **JWT token authentication** for a stable and robust connection.

## Access Methods

### 1. External Access (Production)
```
Base URL: https://wordai.hekanet.de
Endpoints:
  - Models: https://wordai.hekanet.de/api/models
  - Chat: https://wordai.hekanet.de/api/v1/chat/completions
```

### 2. Localhost Access (Development)
```
Base URL: http://localhost:3000
Endpoints:
  - Models: http://localhost:3000/api/models
  - Chat: http://localhost:3000/api/v1/chat/completions
```

## Authentication

### JWT Token (Recommended ✅)
- **Why**: More stable, longer-lived, native Open WebUI authentication
- **How to get**:
  1. Login to Open WebUI web interface
  2. Open browser DevTools (F12)
  3. Go to Application → Local Storage
  4. Copy the value of the `token` key (starts with `eyJ...`)

### API Key (Not Supported ❌)
- API keys only work with `/openai/v1` endpoints
- Those endpoints are NOT exposed through the nginx reverse proxy
- JWT tokens are required for `/api` endpoints

## Network Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Docker Network                       │
│                bhk-rag-network                       │
│                                                      │
│  ┌──────────────────┐      ┌──────────────────┐    │
│  │  word-gpt-plus   │      │  bhk-open-webui  │    │
│  │                  │      │                  │    │
│  │  Port: 3100→80   │      │  Port: 3000→8080 │    │
│  └──────────────────┘      └──────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
                      ↓
              Nginx Reverse Proxy
                      ↓
          https://wordai.hekanet.de
```

## Endpoints

### Model Fetching
```typescript
// src/api/openwebui.ts
GET {baseURL}/api/models
Headers:
  - Authorization: Bearer {JWT_TOKEN}
  - Content-Type: application/json
```

### Chat Completions
```typescript
// src/api/union.ts
POST {baseURL}/api/v1/chat/completions
Headers:
  - Authorization: Bearer {JWT_TOKEN}
  - Content-Type: application/json
Body:
  {
    "model": "llama3.2:latest",
    "messages": [...],
    "temperature": 0.7,
    "max_tokens": 1024
  }
```

## Code Structure

### Key Files
1. **src/api/openwebui.ts** - Model fetching logic
2. **src/api/union.ts** - Chat completion integration
3. **src/i18n/locales/en.json** - UI labels (English)
4. **src/i18n/locales/zh-cn.json** - UI labels (Chinese)
5. **docker-compose.yml** - Container orchestration

### Configuration Flow
```
User Input (Settings Page)
    ↓
  localStorage
    ↓
  settingForm
    ↓
  OpenWebUIOptions
    ↓
  ChatOpenAI Client
    ↓
  Open WebUI API
```

## Deployment

### Build & Deploy
```bash
# Build without cache
docker-compose -f ./docker-compose.yml down
docker-compose -f ./docker-compose.yml up -d --build

# Verify
docker ps | grep word-gpt-plus
docker logs word-gpt-plus
```

### Network Configuration
The `docker-compose.yml` uses an external network:
```yaml
networks:
  word-gpt-network:
    name: bhk-rag-network
    external: true
```

This allows Word GPT Plus to communicate with other services on the same network.

## Troubleshooting

### Issue: 404 Not Found
**Cause**: Nginx not proxying `/api` or `/openai` paths
**Solution**: Ensure nginx configuration includes:
```nginx
location /api/ {
    proxy_pass http://bhk-open-webui:8080/api/;
    # ... proxy headers
}
```

### Issue: 403 Forbidden
**Cause**: Using API key instead of JWT token
**Solution**: Use JWT token from browser localStorage

### Issue: 401 Unauthorized
**Cause**: JWT token expired or invalid
**Solution**: Re-login to Open WebUI and get fresh JWT token

### Issue: CORS Errors
**Cause**: Open WebUI CORS configuration
**Solution**: Ensure `CORS_ALLOW_ORIGIN` includes your domain:
```bash
docker exec bhk-open-webui env | grep CORS
# Should include: http://localhost:3100;https://wordai.hekanet.de
```

### Issue: Old files cached
**Solution**:
1. Hard refresh browser: `Ctrl+Shift+R`
2. Run PowerShell cache cleaner: `.\clear-office-cache.ps1`
3. Restart Microsoft Word

## Testing

### Test Model Fetching
```bash
curl -X GET https://wordai.hekanet.de/api/models \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Chat Completion
```bash
curl -X POST https://wordai.hekanet.de/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:latest",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## Best Practices

1. **JWT Token Management**
   - Store securely in browser localStorage
   - Don't expose in logs or error messages
   - Refresh when expired

2. **Base URL Configuration**
   - Always remove trailing slashes
   - Support both localhost and domain access
   - Log the final constructed URL for debugging

3. **Error Handling**
   - Catch and log API errors
   - Provide user-friendly error messages
   - Include troubleshooting URLs

4. **Caching**
   - Cache model list in localStorage
   - Include last fetch timestamp
   - Provide manual refresh option

## Future Improvements

- [ ] Auto-refresh JWT token before expiration
- [ ] Support for multiple Open WebUI instances
- [ ] Automatic model discovery on connection
- [ ] Health check endpoint
- [ ] Metrics and monitoring

## References

- [Open WebUI Documentation](https://docs.openwebui.com/)
- [LangChain JS Documentation](https://js.langchain.com/)
- [Docker Compose Networking](https://docs.docker.com/compose/networking/)
