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
- Support for multiple languages
- Custom prompts can be set and saved for future use
- Ability for users to set temperature and max tokens
- Proxy support

![230424 091554](https://user-images.githubusercontent.com/96409857/233878627-6b5abdfd-7ff6-4818-8b26-d78f74ea0e85.gif)
![230424 091221](https://user-images.githubusercontent.com/96409857/233878368-3a793d8b-3740-4471-822b-0e062415b704.gif)

## Getting Started

At first, clone this repo and install dependencies, the run the project.

```bash
git clone https://github.com/Kuingsmile/Word-GPT-Plus.git
yarn
yarn run serve
```

To get started with Word GPT Plus, you will need to sideload the add-in into Microsoft Word. Sideloading allows you to install and test add-ins that are not yet available on the Microsoft Store.

To sideload WordGPT, you will need to follow the instructions provided by Microsoft. You can find these instructions at the following link: [sideload office add-ins](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins)

### How to get access token

#### email + password accounts

To use ChatGPT web API, you'll need an OpenAI access token from the ChatGPT webapp. To do this, you can use any of the following methods which take an email and password and return an access token:

- Node.js libs
  - [ericlewis/openai-authenticator](https://github.com/ericlewis/openai-authenticator)
  - [michael-dm/openai-token](https://github.com/michael-dm/openai-token)
  - [allanoricil/chat-gpt-authenticator](https://github.com/AllanOricil/chat-gpt-authenticator)
- Python libs
  - [acheong08/OpenAIAuth](https://github.com/acheong08/OpenAIAuth)

These libraries work with email + password accounts (e.g., they do not support accounts where you auth via Microsoft / Google).

#### Microsoft / Google accounts

Alternatively, you can manually get an accessToken by logging in to the ChatGPT webapp and then opening `https://chat.openai.com/api/auth/session`, which will return a JSON object containing your accessToken string.

**Access tokens last for days.**

## Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request.

## License

MIT License

## Show your support

Give a ⭐️ if this project helped you!
