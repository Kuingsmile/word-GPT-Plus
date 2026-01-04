# Contributing to Word GPT Plus Fork

This is a fork of [Kuingsmile/word-GPT-Plus](https://github.com/Kuingsmile/word-GPT-Plus) with additional features.

## Development Setup

### Prerequisites
- Node.js 20+
- npm or pnpm
- Git

### Installation

```bash
# Clone your fork
git clone <your-fork-url>
cd word-GPT-Plus

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## Current Extensions

### Mistral AI Integration

**What was added:**
- Custom `MistralChat` implementation to avoid CORS issues
- Full LangChain compatibility
- Streaming support via SSE (Server-Sent Events)
- Settings UI for API key and model selection

**Why custom implementation?**
- OpenAI SDK adds custom headers (`x-stainless-*`) that Mistral API doesn't allow in CORS
- Using `ChatOpenAI` with `baseURL` causes CORS errors
- Direct `fetch()` implementation avoids all SDK dependencies

**Files added/modified:**
```
src/api/mistralChat.ts         # NEW: Custom Mistral implementation
src/api/union.ts               # Modified: Added Mistral provider
src/api/types.ts               # Modified: Added MistralOptions
src/utils/settingPreset.ts     # Modified: Mistral settings
src/utils/constant.ts          # Modified: Added to availableAPIs
src/utils/enum.ts              # Modified: Mistral localStorage keys
src/i18n/locales/en.json       # Modified: English translations
src/i18n/locales/zh-cn.json    # Modified: Chinese translations
src/pages/HomePage.vue         # Modified: Provider config
src/pages/SettingsPage.vue     # Modified: Custom models
```

## Testing Your Changes

### 1. Local Development
```bash
npm run dev
# Opens at http://localhost:5173
```

### 2. Production Build Test
```bash
npm run build

# Copy to deployment directory
cp -r dist ../word-gpt-plus-deployment/

# Deploy with Docker
cd ../word-gpt-plus-deployment
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 3. Test in Microsoft Word
- Sideload the manifest.xml
- Test all features thoroughly
- Check browser console for errors

## Creating a Pull Request to Upstream

### Before Creating PR

**1. Ensure code quality:**
```bash
# Lint code
npm run lint

# Type check
npm run type-check

# Build successfully
npm run build
```

**2. Test thoroughly:**
- [ ] Settings page loads correctly
- [ ] API key can be saved
- [ ] Chat works with Mistral API
- [ ] Streaming responses work
- [ ] No CORS errors in console
- [ ] Works in both browser and Word

**3. Clean commit history:**
```bash
# Review your changes
git status
git diff

# Stage changes
git add src/api/mistralChat.ts
git add src/api/union.ts
# ... add other files

# Create meaningful commit
git commit -m "feat: Add Mistral AI provider with CORS workaround

- Implement custom MistralChat class using direct fetch
- Avoid CORS issues from OpenAI SDK's custom headers
- Add Mistral settings UI and translations (EN, ZH-CN)
- Support streaming via Server-Sent Events
- Maintain full LangChain compatibility

Fixes #<issue-number> (if applicable)"
```

### PR Template

```markdown
## Description
Add Mistral AI as a new LLM provider with custom implementation to avoid CORS issues.

## Motivation
Mistral API is OpenAI-compatible but using `ChatOpenAI` causes CORS errors due to custom headers added by the OpenAI SDK. This implementation uses direct `fetch()` to avoid these issues while maintaining full LangChain compatibility.

## Changes
- Add `MistralChat` class with direct fetch implementation
- Integrate into provider factory pattern
- Add settings UI for API key and model selection
- Add translations for EN and ZH-CN
- Support streaming via SSE

## Testing
- [x] Tested in browser environment
- [x] Tested in Microsoft Word
- [x] No CORS errors
- [x] Streaming works correctly
- [x] Settings persist correctly

## Screenshots
(Add screenshots of settings UI and working chat)

## Related Issues
Closes #<issue-number>

## Checklist
- [x] Code follows project style guidelines
- [x] Tested locally and in production
- [x] Updated documentation (if applicable)
- [x] No breaking changes
- [x] Added translations for all supported languages
```

### Submit PR

```bash
# Push to your fork
git push origin mistral-integration

# Go to GitHub and create PR
# Base: Kuingsmile/word-GPT-Plus:master
# Compare: <your-fork>:mistral-integration
```

## Code Style Guidelines

### Follow existing patterns
- Use existing provider implementations as reference
- Match naming conventions (camelCase for variables, PascalCase for classes)
- Add TypeScript types for all new code
- Include JSDoc comments for public APIs

### Mistral-specific considerations
```typescript
// ✅ Good: Direct fetch, minimal headers
const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  }
})

// ❌ Bad: Using ChatOpenAI (causes CORS)
const client = new ChatOpenAI({
  configuration: { baseURL: 'https://api.mistral.ai/v1' }
})
```

## Documentation

All documentation is in `/projects/production/word-gpt-plus-deployment/`:
- `README.md` - Deployment guide
- `ARCHITECTURE.md` - System architecture
- `ADD_LLM_PROVIDER.md` - Guide for adding providers

Update these if you make architectural changes.

## Questions?

- Check [ARCHITECTURE.md](../word-gpt-plus-deployment/ARCHITECTURE.md) for design decisions
- Check [ADD_LLM_PROVIDER.md](../word-gpt-plus-deployment/ADD_LLM_PROVIDER.md) for implementation guide
- Open an issue for discussion before major changes

## License

This fork maintains the same license as the upstream project.
