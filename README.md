<div align="center">
  <a href="https://github.com/Kuingsmile/word-GPT-Plus">
    <img src="https://user-images.githubusercontent.com/96409857/233920113-b6919e19-484e-4a4b-82ff-5c72f7314025.png" alt="Logo" height="100">
  </a>

  <h2 align="center">Word GPT Plus</h2>
  <p align="center">
    Integrate AI directly into Microsoft Word
    <br />
    <a href="https://github.com/Kuingsmile/word-GPT-Plus/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/Kuingsmile/word-GPT-Plus?style=flat-square" alt="license" />
    </a>
    <a href="https://github.com/Kuingsmile/word-GPT-Plus/releases">
      <img src="https://img.shields.io/github/v/release/Kuingsmile/word-GPT-Plus?style=flat-square" alt="release" />
    </a>
    <a href="https://github.com/Kuingsmile/word-GPT-Plus/stargazers">
      <img src="https://img.shields.io/github/stars/Kuingsmile/word-GPT-Plus?style=flat-square" alt="stars" />
    </a>
    <br />
    <a href="#features">Features</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#installation">Installation</a> •
    <a href="#usage">Usage</a>
  </p>
</div>

English | [简体中文](https://github.com/Kuingsmile/word-GPT-Plus/blob/master/README_cn.md)

## 📋 Introduction

Word GPT Plus seamlessly integrates AI models into Microsoft Word, allowing you to generate, translate, summarize, and polish text directly within your documents. Enhance your writing workflow without leaving your Word environment.

![Image](https://github.com/user-attachments/assets/303bafff-a53a-4c76-aa17-4e637a13387a)

## ✨ Features

- **Multiple AI Models Support**:
  - OpenAI API (compatible with DeepSeek and other OpenAI-compatible endpoints)
  - Azure OpenAI API
  - Google Gemini Pro API
  - Ollama (for local deployment)
  - Groq API

- **Agent Mode**:
  - Supports multi-step analysis and result synthesis
  - Configurable analysis step limits

- **Built-in Templates**:
  - Translation (40+ languages)
  - Text polishing and improvement
  - Academic writing enhancement
  - Content summarization
  - Grammar checking

- **Customization Options**:
  - Save custom prompts for repeated use
  - Adjust temperature and max tokens
  - Support for proxies
  - Local storage for privacy

- **Advanced Formatting**:
  - **Automatic Word Formatting**: AI responses are automatically formatted with proper Word styles (headers, bold, italic, lists, code blocks)
  - Multiple insertion modes (replace, append, new line)
  - Markdown parsing and conversion to Word formatting

## 🚀 Getting Started

### Requirements

#### Software

- Microsoft Word 2016/2019 (retail version), Word 2021, or Microsoft 365
- [Edge WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
- Node.js 20+ (only for self-hosting)

> **Note**: Works only with .docx files (not compatible with older .doc format)

#### API Access

- **OpenAI**: Obtain an API key from [OpenAI Platform](https://platform.openai.com/account/api-keys)
- **Azure OpenAI**: Apply for access at [Azure OpenAI Service](https://go.microsoft.com/fwlink/?linkid=2222006)
- **Google Gemini**: Request API access from [Google AI Studio](https://developers.generativeai.google/)
- **Groq**: Get your API key from [Groq Console](https://console.groq.com/keys)

## 💻 Installation

Choose the method that best suits your needs:

### Method 1: Instant Use (Recommended)

*Best for most users. No coding required.*

1. Download `release/instant-use/manifest.xml` [manifest.xml](https://github.com/Kuingsmile/word-GPT-Plus/blob/master/release/instant-use/manifest.xml).
2. Save it to a dedicated folder on your computer (e.g., `C:\Users\username\Documents\WordGPT`).
3. Proceed to the [Add-in Installation Guide](#add-in-installation-guide).

> **Note for users in China**: If you experience connectivity issues, try adding `msq.pub` to your proxy rules or use the self-hosted option.

### Method 2: Self-Hosted (Advanced)

*For developers or those requiring a private backend.*

<details>
<summary><strong>Docker Deployment</strong></summary>

1. Pull and run the Docker image:

   ```bash
   docker pull kuingsmile/word-gpt-plus
   docker run -d -p 3000:80 kuingsmile/word-gpt-plus
   ```

2. Download [manifest.xml](https://github.com/Kuingsmile/word-GPT-Plus/blob/master/release/self-hosted/manifest.xml).
3. Edit `manifest.xml`: Replace all instances of `http://localhost:3000` with your server's address.
4. Proceed to the [Add-in Installation Guide](#add-in-installation-guide).

</details>

<details>
<summary><strong>Build from Source</strong></summary>

*Requires Node.js 20+*

1. Clone and start the project:

   ```bash
   git clone https://github.com/Kuingsmile/Word-GPT-Plus.git
   cd Word-GPT-Plus
   yarn
   yarn run serve
   ```

2. Use the [self-hosted manifest.xml](https://github.com/Kuingsmile/word-GPT-Plus/blob/master/release/self-hosted/manifest.xml).
3. Proceed to the [Add-in Installation Guide](#add-in-installation-guide).

</details>

<details>
<summary><strong>Deploy to Tencent EdgeOne</strong></summary>

[![Deploy to Tencent EdgeOne](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?repository-url=https%3A%2F%2Fgithub.com%2FKuingsmile%2FWord-GPT-Plus%2Ftree%2Fmaster&build-command=npm%20run%20build&output-directory=.%2Fdist&install-command=yarn%20install)

</details>

## Add-in Installation Guide

To get started with Word GPT Plus, you will need to sideload the add-in into Microsoft Word.

You can find instructions provided by MicroSoft at the following link: [sideload office add-ins](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins)

1. Go to the folder where you saved the `manifest.xml` file, for example `C:\Users\username\Documents\WordGPT`.
2. Open the context menu for the folder(right-click the folder) and select **Properties**.
3. Within the **Properties** dialog box, select the **Sharing** tab, and then select **Share**.
![image](https://learn.microsoft.com/en-us/office/dev/add-ins/images/sideload-windows-properties-dialog.png)
4. Within the **Network access** dialog box, add yourself and any other users you want to share, choose the **Share** button, When you see confirmation that Your folder is shared, note the **full network path** that's displayed immediately following the folder name.
![image](https://learn.microsoft.com/en-us/office/dev/add-ins/images/sideload-windows-network-access-dialog.png)
5. Open a new document in Word, choose the **File** tab, and then choose **Options**.
6. Choose **Trust Center**, and then choose the **Trust Center Settings** button.
7. Choose **Trusted Add-in Catalogs**.
8. In the **Catalog Url** box, enter the **full network path** and then choose **Add Catalog**.
9. Select the **Show in Menu** check box, and then choose **OK**.
![image](https://learn.microsoft.com/en-us/office/dev/add-ins/images/sideload-windows-trust-center-dialog.png)
10. Close and then restart Word.
11. Click **Insert** > **My Add-ins** > **Shared Folder**, choose **GPT Plus**, and then choose **Add**.
12. Enjoy it!
![image](https://user-images.githubusercontent.com/96409857/234744280-9d9f13cf-536b-4fb5-adfa-cbec262d56a2.png)

## How to fill in API key

After entering Word GPT Plus, click the orange `Settings` button on the homepage to enter the settings page, where you can switch APIs and fill in API keys.

## Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request.

## License

MIT License

## Show your support

Give a ⭐️ if this project helped you!
