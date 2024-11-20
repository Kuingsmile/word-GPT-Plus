<div align="center">
  <a href="https://github.com/Kuingsmile/word-GPT-Plus">
    <img src="https://user-images.githubusercontent.com/96409857/233920113-b6919e19-484e-4a4b-82ff-5c72f7314025.png" alt="Logo" height="100">
  </a>

<br />
  <h3 align="center">Word & chatGPT</h3>

</div>

简体中文 | [English](https://github.com/Kuingsmile/PicList/blob/master/README.md)

## 简介

Word GPT Plus 是一个集成了 chatGPT 模型的 Word 插件。它允许你基于你在文档中写的内容生成文本。你可以使用它来翻译、总结、润色或者从零开始写一篇文章。

## 特色功能

- 内置用于翻译、总结、润色和学术写作的提示
- 多平台支持
  - OpenAI API
  - Azure OpenAI API
  - Ollama2
  - Google Gemini Pro API
  - Groq
- 支持多种语言
- 可以自定义提示并保存以供将来使用
- 允许用户设置temperature和max tokens
- 支持代理

![230424 091554](https://user-images.githubusercontent.com/96409857/233878627-6b5abdfd-7ff6-4818-8b26-d78f74ea0e85.gif)
![230424 091221](https://user-images.githubusercontent.com/96409857/233878368-3a793d8b-3740-4471-822b-0e062415b704.gif)

## 环境要求

### 软件要求

- Microsoft Word 2016/2019 零售版，Microsoft Word 2021 或 Microsoft 365
- Edge WebView2 Runtime [https://developer.microsoft.com/en-us/microsoft-edge/webview2/](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
- 如果你使用自己搭建的服务，你需要 Node.js 18+

**注意：office 插件只能在 docx 文件中使用，不支持 doc 文件。**

### 账户要求

官方API需要一个OpenAI api key，你可以从[https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)获取。

Azure OpenAI需要首先申请资格，请前往[Azure OpenAI API申请网址](https://go.microsoft.com/fwlink/?linkid=2222006&clcid=0x409&culture=en-us&country=us)申请资格。

Google Gemini Pro API需要前往[Google AI](https://developers.generativeai.google/)申请，目前免费版限制次数一分钟60个请求。

Groq的api key可以在[https://console.groq.com/keys](https://console.groq.com/keys)申请。

## 快速开始

有两种方法可以安装 Word GPT Plus：通过我的免费web服务，或者自己搭建服务。

我建议使用我的web服务，因为它安装简单快捷，也不需要安装额外的依赖项。此外，你将随时可以访问到最新版本的 Word GPT Plus。

由于所有数据都是使用localStorage保存的，所以你的隐私是受到保护的。

但是，如果你想要更快的速度，并且具有Node.js的专业知识，自己搭建服务也是一个选择。

### 由我提供的服务

这项服务是使用 Cloudflare Pages 构建的，域名: [https://word.msq.pub](https://word.msq.pub)

**中国用户可能会遇到网络问题，请使用 `ping word.msq.pub` 查看是否可以访问该域名。**  

**你可以将 `msq.pub` 添加到你的代理软件的规则中，或者使用自己搭建的服务。**

1. 下载`manifest.xml`文件并保存到你的电脑上，例如 `C:\Users\username\Documents\WordGPT`.
  - 下载: [manifest.xml](https://github.com/Kuingsmile/word-GPT-Plus/blob/master/release/instant-use/manifest.xml)
2. 按照下面的 [旁加载插件](#旁加载插件) 说明安装插件。

### 自己搭建服务

#### 本地运行

如果你想要自己搭建服务，你需要克隆这个仓库并安装依赖项，然后运行项目。需要 Node.js 16+。

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
