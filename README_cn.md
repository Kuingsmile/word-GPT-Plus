<div align="center">
  <a href="https://github.com/Kuingsmile/word-GPT-Plus">
    <img src="https://user-images.githubusercontent.com/96409857/233920113-b6919e19-484e-4a4b-82ff-5c72f7314025.png" alt="Logo" height="100">
  </a>

  <h2 align="center">Word GPT Plus</h2>
  <p align="center">
    将 AI 直接集成到 Microsoft Word
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

<p align="center">
  <img src="https://user-images.githubusercontent.com/96409857/233878627-6b5abdfd-7ff6-4818-8b26-d78f74ea0e85.gif" width="45%" alt="Word GPT Plus 演示" />
  <img src="https://user-images.githubusercontent.com/96409857/233878368-3a793d8b-3740-4471-822b-0e062415b704.gif" width="45%" alt="Word GPT Plus 演示" />
</p>

## ✨ 功能特点

- **多种 AI 模型支持**：
  - OpenAI API（兼容 DeepSeek 和其他 OpenAI 兼容接口）
  - Azure OpenAI API
  - Google Gemini Pro API
  - Ollama（用于本地部署）
  - Groq API

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

## 🚀 开始使用

### 环境要求

#### 软件

- Microsoft Word 2016/2019 零售版、Word 2021 或 Microsoft 365
- [Edge WebView2 运行时](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
- Node.js 18+（仅用于自托管）

> **注意**：仅适用于 .docx 文件（不兼容旧版 .doc 格式）

#### API 访问

- **OpenAI**：从 [OpenAI Platform](https://platform.openai.com/account/api-keys) 获取 API 密钥
- **Azure OpenAI**：在 [Azure OpenAI Service](https://go.microsoft.com/fwlink/?linkid=2222006) 申请访问权限
- **Google Gemini**：从 [Google AI Studio](https://developers.generativeai.google/) 请求 API 访问
- **Groq**：从 [Groq Console](https://console.groq.com/keys) 获取 API 密钥

## 💻 安装说明

选择以下安装方法之一：

### 方案一：使用托管服务（推荐）

1. 下载 [manifest.xml](https://github.com/Kuingsmile/word-GPT-Plus/blob/master/release/instant-use/manifest.xml)
2. 保存到您计算机上的目录（例如：`C:\Users\用户名\Documents\WordGPT`）
3. 按照下方[旁加载插件](#旁加载插件)操作

> **中国用户注意**：如果遇到连接问题，请尝试将 `msq.pub` 添加到您的代理规则，或使用自托管选项。

### 方案二：Docker 部署

#### 本地运行

如果你想要自己搭建服务，你需要克隆这个仓库并安装依赖项，然后运行项目。需要 Node.js 18+。

```bash
git clone https://github.com/Kuingsmile/Word-GPT-Plus.git
yarn
yarn run serve
```

[manifest.xml](https://github.com/Kuingsmile/word-GPT-Plus/blob/master/release/self-hosted/manifest.xml)

#### docker运行

你也可以使用docker运行服务，首先docker pull镜像，然后运行容器。

```bash
docker pull kuingsmile/word-gpt-plus
docker run -d -p 3000:80 kuingsmile/word-gpt-plus
```

manifest.xml需要修改所有的`[localhost:3000](http://localhost:3000)`为你的服务器地址。

然后，按照下面的 [旁加载插件](#旁加载插件) 说明安装插件。

### 旁加载插件

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

## 贡献

如果你希望贡献代码，请 fork 这个仓库并创建一个 pull request。

## License

MIT License

## 请给个 ⭐️ 吧

如果这个项目帮助到了你，请给个 ⭐️ 吧！
