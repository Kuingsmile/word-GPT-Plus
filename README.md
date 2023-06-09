<div align="center">
  <a href="https://github.com/Kuingsmile/word-GPT-Plus">
    <img src="https://user-images.githubusercontent.com/96409857/233920113-b6919e19-484e-4a4b-82ff-5c72f7314025.png" alt="Logo" height="100">
  </a>

<br />
  <h3 align="center">Word & chatGPT</h3>

</div>

English | [简体中文](https://github.com/Kuingsmile/word-GPT-Plus/blob/master/README_cn.md)

## Introduction

Word GPT Plus is a word add-in which integrates the chatGPT model into Microsoft Word. It allows you to generate text based on the text you have written in your document. You can use it to translate, summarize, polish or even write a whole document from zero.

## Features

- Utilize the GPT-3.5 API to generate text and support select models
- Support chatGPT web api using access Token, it's FREE!
- Built-in prompts for translation, summarization, polishing, and academic writing
- Support Azure OpenAI API
- Support for multiple languages
- Custom prompts can be set and saved for future use
- Ability for users to set temperature and max tokens
- Proxy support

![230424 091554](https://user-images.githubusercontent.com/96409857/233878627-6b5abdfd-7ff6-4818-8b26-d78f74ea0e85.gif)
![230424 091221](https://user-images.githubusercontent.com/96409857/233878368-3a793d8b-3740-4471-822b-0e062415b704.gif)

## Requirements

### software

- Microsoft Word 2016/2019 retail version , Microsoft Word 2021 or Microsoft 365
- Edge WebView2 Runtime [https://developer.microsoft.com/en-us/microsoft-edge/webview2/](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
- if you use self-hosted service, you need Node.js 16+

**Note: office add-in can only used in docx file, not support doc file.**

### account

Official API need an OpenAI api key, you can get it from [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)

Web API need an access token of chatGPT website, you can get it from [access token](#how-to-get-access-token)

You need to apply for qualification first, please go to [Azure OpenAI API application website](https://go.microsoft.com/fwlink/?linkid=2222006&clcid=0x409&culture=en-us&country=us) to apply for qualification.

## Getting Started

There are two ways to install Word GPT Plus: through my free hosting service, or by self-hosting it.

I highly recommend utilizing my hosting service as it is both user-friendly and requires no installation of additional dependencies. Furthermore, you will have access to the most up-to-date version of Word GPT Plus at all times.

Rest assured that your privacy is protected as all data is saved using localStorage.

However, if you desire faster speeds and possess expertise with Node.js, self-hosting is also an option.

### Service hosted by me

This service is built using Cloudflare Pages, domain name: [https://word.msq.pub](https://word.msq.pub)

**For China users, there maybe some network problems, please use `ping word.msq.pub` to see if you can access the domain.**

**You can add `msq.pub` to your proxy software's rules, or use self-hosted.**

1. Download the add-in `manifest.xml` file and Save it to a directory on your computer, such as `C:\Users\username\Documents\WordGPT`.

  - download: [release/other/manifest.xml](https://release.piclist.cn/release/other/manifest.xml)

2. Follow the [Sideload add-in](#sideload-add-in) instructions below to install the add-in.

### Self-hosted

If you want to host the add-in yourself, you will need to clone this repo and install dependencies, then run the project. Need Node.js 16+.

```bash
git clone https://github.com/Kuingsmile/Word-GPT-Plus.git
yarn
yarn run serve
```

Then, follow the [Sideload add-in](#sideload-add-in) instructions below to install the add-in.

### Sideload add-in

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

## How to get access token

### email + password accounts

To use ChatGPT web API, you'll need an OpenAI access token from the ChatGPT webapp. To do this, you can use any of the following methods which take an email and password and return an access token:

- Node.js libs
  - [ericlewis/openai-authenticator](https://github.com/ericlewis/openai-authenticator)
  - [michael-dm/openai-token](https://github.com/michael-dm/openai-token)
  - [allanoricil/chat-gpt-authenticator](https://github.com/AllanOricil/chat-gpt-authenticator)
- Python libs
  - [acheong08/OpenAIAuth](https://github.com/acheong08/OpenAIAuth)

These libraries work with email + password accounts (e.g., they do not support accounts where you auth via Microsoft / Google).

### Microsoft / Google accounts

Alternatively, you can manually get an accessToken by logging in to the ChatGPT webapp and then opening `https://chat.openai.com/api/auth/session`, which will return a JSON object containing your accessToken string.

**Access tokens last for days.**

## Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request.

## License

MIT License

## Show your support

Give a ⭐️ if this project helped you!
