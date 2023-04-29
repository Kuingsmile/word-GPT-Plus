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

- 使用GPT-3.5 API生成文本并支持选择模型
- 支持设置access token调用chatGPT web接口（使用该方法免费，建议配合chatGPT-plus）
- 内置用于翻译、总结、润色和学术写作的提示
- 支持多种语言
- 可以自定义提示并保存以供将来使用
- 允许用户设置temperature和max tokens
- 支持代理

![230424 091554](https://user-images.githubusercontent.com/96409857/233878627-6b5abdfd-7ff6-4818-8b26-d78f74ea0e85.gif)
![230424 091221](https://user-images.githubusercontent.com/96409857/233878368-3a793d8b-3740-4471-822b-0e062415b704.gif)

## 环境要求

- Microsoft Word 2016/2019 零售版，Microsoft Word 2021 或 Microsoft 365
- Edge WebView2 Runtime [https://developer.microsoft.com/en-us/microsoft-edge/webview2/](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
- 如果你使用自己搭建的服务，你需要 Node.js 16+

**注意：office 插件只能在 docx 文件中使用，不支持 doc 文件。**

## 快速开始

有两种方法可以安装 Word GPT Plus：通过我的免费web服务，或者自己搭建服务。

我强烈建议使用我的web服务，因为它安装简单快捷，也不需要安装额外的依赖项。此外，你将随时可以访问到最新版本的 Word GPT Plus。

由于所有数据都是使用localStorage保存的，所以你的隐私是受到保护的。

但是，如果你想要更快的速度，并且具有Node.js的专业知识，自己搭建服务也是一个选择。

### 由我提供的服务

这项服务是使用 Cloudflare Pages 构建的，域名: [https://word.msq.pub](https://word.msq.pub)

** 中国用户可能会遇到网络问题，请使用 `ping word.msq.pub` 查看是否可以访问该域名。**  
** 你可以将 `msq.pub` 添加到你的代理软件的规则中，或者使用自己搭建的服务。**

1. 下载`manifest.xml`文件并保存到你的电脑上，例如 `C:\Users\username\Documents\WordGPT`.
  - 下载: [release/other/manifest.xml](https://release.piclist.cn/release/other/manifest.xml)
2. 按照下面的 [旁加载插件](#旁加载插件) 说明安装插件。

### 自己搭建服务

如果你想要自己搭建服务，你需要克隆这个仓库并安装依赖项，然后运行项目。需要 Node.js 16+。

```bash
git clone https://github.com/Kuingsmile/Word-GPT-Plus.git
yarn
yarn run serve
```

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

## 如何获取access token

### email + password 账户

为了使用 ChatGPT web API，你需要一个来自 ChatGPT webapp 的 OpenAI access token。你可以使用以下任何方法，这些方法都需要一个 email 和 password 并返回一个 access token：

- Node.js libs
  - [ericlewis/openai-authenticator](https://github.com/ericlewis/openai-authenticator)
  - [michael-dm/openai-token](https://github.com/michael-dm/openai-token)
  - [allanoricil/chat-gpt-authenticator](https://github.com/AllanOricil/chat-gpt-authenticator)
- Python libs
  - [acheong08/OpenAIAuth](https://github.com/acheong08/OpenAIAuth)

这些库适用于 email + password 账户（也就是说，它们不支持通过 Microsoft / Google 进行身份验证的账户）。

### Microsoft / Google 账户

如果你使用的是 Microsoft / Google 账户，你可以通过登录 ChatGPT webapp 并打开 `https://chat.openai.com/api/auth/session` 来手动获取 accessToken，这将返回一个包含你的 accessToken 字符串的 JSON 对象。

**Access token 只有几天的有效期。**

## 贡献

如果你希望贡献代码，请 fork 这个仓库并创建一个 pull request。

## License

MIT License

## 请给个 ⭐️ 吧

如果这个项目帮助到了你，请给个 ⭐️ 吧！
