# Custom AI Provider Plugins for Word GPT Plus

This fork adds support for two additional AI providers as first-class integrations:

## 🎯 New Providers

### 1. Mistral AI
Full integration with Mistral's native API, avoiding CORS issues that occur when using OpenAI-compatible endpoints.

### 2. Open WebUI
First-class integration treating Open WebUI as a standalone multi-backend AI gateway, with dynamic model discovery.

---

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Mistral AI Setup](#mistral-ai-setup)
  - [Open WebUI Setup](#open-webui-setup)
- [Architecture](#architecture)
- [Pull Request Summary](#pull-request-summary)
- [Technical Implementation](#technical-implementation)

---

## ✨ Features

### Mistral AI Provider
- ✅ Native Mistral API implementation (no OpenAI adapter)
- ✅ Custom `MistralChat` class to avoid CORS issues
- ✅ Support for all Mistral models (mistral-large, ministral, codestral, etc.)
- ✅ Streaming responses
- ✅ Custom model support
- ✅ Temperature and token controls
- ✅ Full i18n support (English & Chinese)

### Open WebUI Provider
- ✅ First-class provider (not treated as OpenAI variant)
- ✅ **Dynamic model discovery** from Open WebUI API
- ✅ Refresh button to fetch latest available models
- ✅ Supports all Open WebUI backends (Ollama, OpenAI, Mistral, Gemini, etc.)
- ✅ Model caching for performance
- ✅ OpenAI-compatible streaming via LangChain
- ✅ Custom model support
- ✅ Full i18n support (English & Chinese)

---

## 🚀 Installation

### From Source

```bash
# Clone this fork
git clone https://github.com/YOUR_USERNAME/word-GPT-Plus.git
cd word-GPT-Plus

# Install dependencies
npm install

# Build
npm run build

# Deploy (copy dist folder to your deployment location)
```

### From Release

Download the latest release from the Releases page and follow the standard Word GPT Plus installation instructions.

---

## ⚙️ Configuration

### Mistral AI Setup

1. **Get API Key**:
   - Visit https://console.mistral.ai/
   - Create an account or sign in
   - Navigate to API Keys section
   - Generate a new API key

2. **Configure in Word GPT Plus**:
   - Open Word GPT Plus settings
   - Select **Mistral** as the provider
   - Enter your Mistral API key
   - Select a model from the dropdown (or enter a custom model)
   - Adjust temperature and max tokens as needed
   - Save settings

3. **Available Models**:
   - `mistral-large-latest` - Most capable model
   - `mistral-small-latest` - Fast and efficient
   - `ministral-8b-latest` - Edge-optimized
   - `ministral-3b-latest` - Ultra-lightweight
   - `codestral-latest` - Code-specialized
   - `codestral-mamba-latest` - Code generation

### Open WebUI Setup

1. **Prerequisites**:
   - Running Open WebUI instance (local or remote)
   - Admin access to Open WebUI

2. **Get API Key**:
   - Open Open WebUI in browser
   - Go to Settings → Account
   - Navigate to API Keys section
   - Click "Create new API key"
   - Copy the generated key

3. **Configure in Word GPT Plus**:
   - Open Word GPT Plus settings
   - Select **openwebui** as the provider
   - Enter Base URL:
     - For local: `http://localhost:3000/api`
     - For remote: `https://your-domain.com/api`
   - Enter your API key
   - Click the **refresh icon** (🔄) next to Model dropdown
   - Wait for models to load
   - Select your desired model
   - Adjust temperature and max tokens
   - Save settings

4. **Model Discovery**:
   - Models are fetched dynamically from Open WebUI
   - Click refresh to update the list
   - Supports models from all configured backends:
     - Ollama models (llama3.1, qwen, etc.)
     - OpenAI models (gpt-4, gpt-3.5-turbo, etc.)
     - Mistral models
     - Gemini models
     - Custom models you've added to Open WebUI

5. **CORS Configuration** (for remote instances):

   If using Open WebUI on a different domain, configure CORS:

   ```yaml
   # docker-compose.yml or environment variables
   environment:
     - CORS_ALLOW_ORIGIN=https://your-word-gpt-domain.com;http://localhost:3100
   ```

   If using nginx reverse proxy:

   ```nginx
   location /api/ {
       proxy_pass http://open-webui:8080/api/;
       proxy_set_header Origin $http_origin;
       # Let Open WebUI handle CORS headers
   }
   ```

---

## 🏗️ Architecture

### Why Separate Providers?

Both Mistral and Open WebUI could technically use OpenAI-compatible endpoints, but we implemented them as first-class providers for these reasons:

#### Mistral AI
- **CORS Issues**: Mistral's OpenAI-compatible endpoint has CORS restrictions
- **Native API**: Using Mistral's native client library provides better compatibility
- **Feature Parity**: Future Mistral-specific features can be easily added

#### Open WebUI
- **Multi-Backend Gateway**: Open WebUI routes to different backends based on model ID
- **Model Discovery**: Dynamic model list depends on user's configured backends
- **Not Just OpenAI**: Using generic OpenAI integration would miss backend-specific features
- **Flexibility**: Users can add/remove backends without reconfiguring Word GPT Plus

### Provider Implementation

Both providers follow Word GPT Plus's provider pattern:

```typescript
// src/api/types.ts - Interface definitions
export interface MistralOptions extends BaseChatCompletionOptions {
  provider: 'mistral'
  mistralAPIKey: string
  mistralModel: string
}

export interface OpenWebUIOptions extends BaseChatCompletionOptions {
  provider: 'openwebui'
  openwebuiBaseURL: string
  openwebuiAPIKey: string
  openwebuiModel: string
}

// src/api/union.ts - Factory implementation
const ModelCreators: Record<string, (opts: any) => BaseChatModel> = {
  mistral: (opts: MistralOptions) => new MistralChat({ ... }),
  openwebui: (opts: OpenWebUIOptions) => new ChatOpenAI({ ... })
}
```

---

## 📝 Pull Request Summary

### Changes Overview

This PR adds two new AI provider integrations to Word GPT Plus:

**Files Added:**
- `src/api/mistralChat.ts` - Custom Mistral API client
- `src/api/openwebui.ts` - Open WebUI model fetching utility

**Files Modified:**
- `src/api/types.ts` - Added provider interfaces
- `src/api/union.ts` - Registered providers in factory
- `src/utils/constant.ts` - Added to `availableAPIs` and model lists
- `src/utils/enum.ts` - Added localStorage keys
- `src/utils/settingPreset.ts` - Settings configuration
- `src/utils/common.ts` - Authentication validation
- `src/pages/HomePage.vue` - Provider configurations
- `src/pages/SettingsPage.vue` - Dynamic model fetching UI
- `src/pages/SettingsPage.css` - Refresh button styling
- `src/i18n/locales/en.json` - English translations
- `src/i18n/locales/zh-cn.json` - Chinese translations

### Commit History

1. **Mistral AI Integration** (commits 43c0c1d - fe4fa9a)
   - Complete Mistral provider implementation
   - Added authentication checks
   - Fixed CORS compatibility
   - Added i18n labels and debug logging

2. **Open WebUI Integration** (commit f17b2cb)
   - First-class provider implementation
   - OpenAI-compatible chat endpoint
   - Settings UI configuration

3. **Upstream Merge** (commit b29d6f4)
   - Merged Word GPT Plus v2.0.0 release
   - Preserved custom integrations
   - Resolved merge conflicts

4. **Dynamic Model Fetching** (commit fc0bade)
   - Open WebUI `/api/models` endpoint integration
   - Refresh button with loading states
   - Model caching to localStorage
   - Error handling and user feedback

### Testing

Both providers have been tested with:
- ✅ Model selection and switching
- ✅ Streaming responses
- ✅ Custom model support
- ✅ Temperature and token controls
- ✅ CORS handling (local and remote)
- ✅ Error handling
- ✅ i18n translations
- ✅ Settings persistence

### Backward Compatibility

- ✅ No breaking changes to existing providers
- ✅ All existing Word GPT Plus features work unchanged
- ✅ Settings from v2.0.0 are preserved

---

## 🔧 Technical Implementation

### Mistral AI

**Custom Implementation** (`src/api/mistralChat.ts`):
```typescript
import { Mistral } from '@mistralai/mistralai'

export class MistralChat extends BaseChatModel {
  constructor(fields: MistralChatInput) {
    this.client = new Mistral({ apiKey: fields.apiKey })
  }

  async *_streamResponseChunks(messages, options) {
    const stream = await this.client.chat.stream({
      model: this.model,
      messages: this._convertMessages(messages),
      temperature: this.temperature,
      maxTokens: this.maxTokens
    })

    for await (const chunk of stream) {
      yield new ChatGenerationChunk({
        message: new AIMessageChunk({
          content: chunk.data.choices[0]?.delta?.content || ''
        })
      })
    }
  }
}
```

### Open WebUI

**Dynamic Model Fetching** (`src/api/openwebui.ts`):
```typescript
export async function fetchOpenWebUIModels(
  baseURL: string,
  apiKey: string
): Promise<string[]> {
  const modelsURL = `${baseURL}/api/models`
  const response = await fetch(modelsURL, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  })

  const data = await response.json()
  return data.data.map((model) => model.id)
}
```

**UI Integration** (`src/pages/SettingsPage.vue`):
- Refresh button next to model dropdown
- Loading spinner animation
- Error message display
- Automatic model list update

### CORS Handling

Both providers handle CORS properly:

**Mistral**: Uses native client library that handles CORS internally

**Open WebUI**:
- Requires CORS configuration on Open WebUI server
- Nginx proxy passes through CORS headers
- Works with both same-origin and cross-origin requests

---

## 📊 Comparison with Upstream

| Feature | Upstream v2.0.0 | This Fork |
|---------|----------------|-----------|
| Providers | OpenAI, Azure, Gemini, Ollama, Groq | + Mistral, Open WebUI |
| Model Lists | Static/hardcoded | Dynamic for Open WebUI |
| Mistral Support | Via OpenAI adapter (CORS issues) | Native implementation |
| Open WebUI Support | Via OpenAI adapter | First-class with model discovery |
| Multi-backend Support | No | Yes (via Open WebUI) |

---

## 🤝 Contributing

This fork is intended to be contributed back to the main Word GPT Plus repository via pull request. If you have suggestions or improvements:

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project maintains the same license as the original Word GPT Plus project.

---

## 🙏 Acknowledgments

- **Word GPT Plus** - Original project by [Kuingsmile](https://github.com/Kuingsmile/word-GPT-Plus)
- **Mistral AI** - For providing excellent AI models and API
- **Open WebUI** - For creating a fantastic multi-backend AI gateway
- **Claude Code** - For assistance in implementing these integrations

---

## 📞 Support

For issues specific to these provider integrations, please open an issue in this repository. For general Word GPT Plus issues, refer to the [main repository](https://github.com/Kuingsmile/word-GPT-Plus).
