<div align="center">
  <a href="https://github.com/Kuingsmile/word-GPT-Plus">
    <img src="https://user-images.githubusercontent.com/96409857/233920113-b6919e19-484e-4a4b-82ff-5c72f7314025.png" alt="Logo" height="100">
  </a>

  <h2 align="center">Word GPT Plus</h2>
  <p align="center">
    将 AI 直接集成到 Microsoft Word
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
    <a href="#功能特点">功能特点</a> •
    <a href="#开始使用">开始使用</a> •
    <a href="#安装说明">安装说明</a> •
    <a href="#使用方法">使用方法</a>
  </p>
</div>

简体中文 | [English](https://github.com/Kuingsmile/word-GPT-Plus/blob/master/README.md)

## 📋 简介

Word GPT Plus 是一款将 AI 模型无缝集成到 Microsoft Word 中的插件，使您能够在文档中直接生成、翻译、总结和润色文本。增强您的写作流程，无需离开 Word 环境。

![Image](https://github.com/user-attachments/assets/303bafff-a53a-4c76-aa17-4e637a13387a)

## ✨ 功能特点

- **多种 AI 模型支持**：
  - OpenAI API（兼容 DeepSeek 和其他 OpenAI 兼容接口）
  - Azure OpenAI API
  - Google Gemini Pro API
  - Ollama（用于本地部署）
  - Groq API

- **Agent模式**：
  - 支持多步骤分析和结果合成
  - 可配置的分析步骤限制

- **内置模板**：
  - 翻译（支持 40+ 种语言）
  - 文本润色和改进
  - 学术写作增强
  - 内容摘要生成
  - 语法检查

- **自定义选项**：
  - 保存自定义提示以便重复使用
  - 调整温度和最大令牌数
  - 支持代理设置
  - 本地存储保护隐私

- **高级格式化**：
  - **自动 Word 格式化**：AI 响应会自动应用适当的 Word 样式（标题、粗体、斜体、列表、代码块）
  - 多种插入模式（替换、追加、新行）
  - Markdown 解析并转换为 Word 格式

## 🚀 开始使用

### 环境要求

#### 软件

- Microsoft Word 2016/2019 零售版、Word 2021 或 Microsoft 365
- [Edge WebView2 运行时](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
- Node.js 20+（仅用于自托管）

> **注意**：仅适用于 .docx 文件（不兼容旧版 .doc 格式）

#### API 访问

- **OpenAI**：从 [OpenAI Platform](https://platform.openai.com/account/api-keys) 获取 API 密钥
- **Azure OpenAI**：在 [Azure OpenAI Service](https://go.microsoft.com/fwlink/?linkid=2222006) 申请访问权限
- **Google Gemini**：从 [Google AI Studio](https://developers.generativeai.google/) 请求 API 访问
- **Groq**：从 [Groq Console](https://console.groq.com/keys) 获取 API 密钥

## 💻 安装说明

选择最适合的安装方式：

### 方式一：即刻使用（推荐）

*适合大多数用户，无需编写代码。*

1. 下载 `release/instant-use/manifest.xml` [manifest.xml](https://github.com/Kuingsmile/word-GPT-Plus/blob/master/release/instant-use/manifest.xml)。
2. 将其保存到计算机上的专用文件夹中（例如：`C:\Users\username\Documents\WordGPT`）。
3. 继续阅读下方的 [旁加载插件指南](#旁加载插件)。

> **中国用户注意**：如果遇到连接问题，请尝试将 `msq.pub` 添加到您的代理规则，或使用自托管选项。

### 方式二：自托管（高级）

*适合开发人员或需要私有后端的用户。*

<details>
<summary><strong>Docker 部署</strong></summary>

1. 拉取并运行 Docker 镜像：

   ```bash
   docker pull kuingsmile/word-gpt-plus
   docker run -d -p 3000:80 kuingsmile/word-gpt-plus
   ```

2. 下载 [manifest.xml](https://github.com/Kuingsmile/word-GPT-Plus/blob/master/release/self-hosted/manifest.xml)。
3. 编辑 `manifest.xml`：将所有 `http://localhost:3000` 替换为您的服务器地址。
4. 继续阅读下方的 [旁加载插件指南](#旁加载插件)。

</details>

<details>
<summary><strong>源码构建</strong></summary>

*需要 Node.js 20+*

1. 克隆并启动项目：

   ```bash
   git clone https://github.com/Kuingsmile/Word-GPT-Plus.git
   cd Word-GPT-Plus
   yarn
   yarn run serve
   ```

2. 使用 [自托管 manifest.xml](https://github.com/Kuingsmile/word-GPT-Plus/blob/master/release/self-hosted/manifest.xml)。
3. 继续阅读下方的 [旁加载插件指南](#旁加载插件)。

</details>

<details>
<summary><strong>部署到腾讯 EdgeOne</strong></summary>

[![使用 EdgeOne Pages 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?repository-url=https%3A%2F%2Fgithub.com%2FKuingsmile%2FWord-GPT-Plus%2Ftree%2Fmaster&build-command=npm%20run%20build&output-directory=.%2Fdist&install-command=yarn%20install)

</details>

## 旁加载插件

为了开始使用 Word GPT Plus，你需要将插件旁加载到 Microsoft Word 中。

你可以在下面的链接中找到微软提供的说明：[sideload office add-ins](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins)

1. 打开你保存了 `manifest.xml` 文件的文件夹，例如 `C:\Users\username\Documents\WordGPT`.
2. 右键点击文件夹打开菜单，选择 **属性**.
3. 在 **属性** 对话框中，选择 **共享** 选项卡，然后选择 **共享**.
![image](https://learn.microsoft.com/en-us/office/dev/add-ins/images/sideload-windows-properties-dialog.png)
4. 在 **网络访问** 对话框中，添加你自己和任何你想要共享的其他用户，选择 **共享** 按钮，当你看到你的文件夹被共享的确认信息时，注意显示在文件夹名称后面的 **完整网络路径**.
![image](https://learn.microsoft.com/en-us/office/dev/add-ins/images/sideload-windows-network-access-dialog.png)
5. 在 Word 中打开一个新文档，选择 **文件** 选项卡，然后选择 **选项**.
6. 选择 **信任中心**，然后选择 **信任中心设置** 按钮.
7. 选择 **信任的目录**.
8. 在 **目录 URL** 框中，输入 **完整网络路径**，然后选择 **添加目录**.
9. 选择 **在菜单中显示** 复选框，然后选择 **确定**.
![image](https://learn.microsoft.com/en-us/office/dev/add-ins/images/sideload-windows-trust-center-dialog.png)
10. 关闭并重新启动 Word.
11. 点击**插入** -> **获取加载项** -> **共享目录**，选择 **Word GPT**.
12. 享受 Word GPT Plus 的强大功能吧！
![image](https://user-images.githubusercontent.com/96409857/234744280-9d9f13cf-536b-4fb5-adfa-cbec262d56a2.png)

## 如何填写API key

进入Word GPT Plus后，点击主页的橙色`设置`按钮，进入设置页面，即可切换API和填写API key。

## 🔒 隐私与安全

- **本地存储**：您的 API 密钥和自定义提示词存储在浏览器本地存储中（在 Word 插件环境内）。它们永远不会发送到我们的服务器。
- **直接连接**：插件直接与 AI 提供商（OpenAI、Azure 等）或您的本地 Ollama 实例通信。除非您使用自定义代理，否则没有中间服务器处理您的数据。

## 贡献

如果你希望贡献代码，请 fork 这个仓库并创建一个 pull request。

## License

MIT License

## 请给个 ⭐️ 吧

如果这个项目帮助到了你，请给个 ⭐️ 吧！
