<div align="center">
  <a href="https://github.com/Kuingsmile/word-GPT-Plus">
    <img src="./public/logo.svg" alt="Logo" height="100">
  </a>

  <h2 align="center">Word GPT Plus - Enhanced Fork</h2>
  <p align="center">
    Word GPT Plus with additional AI provider integrations (Mistral AI & Open WebUI)
    <br />
    <a href="https://github.com/Kuingsmile/word-GPT-Plus">
      <img src="https://img.shields.io/badge/Based%20On-Kuingsmile%2Fword--GPT--Plus-blue?style=flat-square" alt="original repo" />
    </a>
  </p>
</div>

## 🙏 About This Fork

A fork of the excellent [Word GPT Plus](https://github.com/Kuingsmile/word-GPT-Plus) by [Kuingsmile](https://github.com/Kuingsmile), with added support for:

- **Mistral AI** - Native API integration (no CORS issues)
- **Open WebUI** - Multi-backend AI gateway with dynamic model discovery

See [PLUGIN_PROVIDERS.md](./PLUGIN_PROVIDERS.md) for details.

---

## 🚀 Quick Start

### 1. Build from Source

```bash
git clone <your-fork-url>
cd word-GPT-Plus
npm install
npm run build
```

### 2. Install in Word

**Option A - Quick Upload:**
1. Open Word → **Insert** → **Get Add-ins** → **Upload My Add-in**
2. Select: `release/instant-use/manifest.xml`

**Option B - Self-Hosted:**
1. Copy manifest: `release/self-hosted/manifest.xml`
2. Edit manifest: Replace `http://localhost:3000` with your server URL
3. Upload to Word using the same process

See [README_org.md](./README_org.md#add-in-installation-guide) for detailed sideload instructions.

### 3. Configure Provider

Open Word GPT Plus → **Settings** tab → Select AI provider and enter API key:

| Provider | Where to Get API Key |
|----------|---------------------|
| Mistral AI | https://console.mistral.ai |
| Open WebUI | Your Open WebUI instance → Settings → API Keys |
| OpenAI | https://platform.openai.com/account/api-keys |
| Azure OpenAI | https://portal.azure.com |
| Google Gemini | https://ai.google.dev |
| Groq | https://console.groq.com/keys |
| Ollama | Local instance (no key needed) |

---

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Copy and customize the template
cp docker-compose.template.yml docker-compose.yml

# Edit docker-compose.yml (optional customizations):
# - Change port from 80 to 8080 if needed
# - Adjust resource limits
# - Enable Nginx reverse proxy for HTTPS

# Start the service
docker-compose up -d

# Access at http://localhost
```

The template includes:
- Production-ready Node.js + Nginx setup
- Resource limits and health checks
- Optional Nginx reverse proxy for SSL/TLS
- Comprehensive configuration comments

See [docker-compose.template.yml](./docker-compose.template.yml) for all options.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [README_org.md](./README_org.md) | Complete original documentation - features, usage, all AI providers |
| [README_cn.md](./README_cn.md) | 简体中文版本 |
| [PLUGIN_PROVIDERS.md](./PLUGIN_PROVIDERS.md) | New provider integrations (Mistral AI & Open WebUI) - configuration & architecture |
| [CONTRIBUTING_FORK.md](./CONTRIBUTING_FORK.md) | Development setup, building from source, contributing |

---

## 🔧 Development

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Linting
npm run lint
npm run lint:fix
```

---

## 📜 License

MIT License - Same as original [Word GPT Plus](https://github.com/Kuingsmile/word-GPT-Plus)

---

**Updated**: January 2025
