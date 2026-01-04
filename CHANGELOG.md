##  (2026-01-04)

* :bug: Fix(custom): resolve issue where eslint not triggering and remove new Func usage 82204df
* :hammer: Refactor(custom): add css and json lint a037bfc
* :sparkles: Feature(custom): change default and max iteration limit 42b6789
* Add renovate.json (#123) fb66c8a, closes #123
* fix insertParagraph function (#128) b3e131d, closes #128
* fix issue127 (#130) af92ce5, closes #130
* Update dependency vue-i18n to v11.2.8 (#131) 037792a, closes #131
* Update dependency zod to v4.3.5 (#132) ff97f9b, closes #132
* Fix:  Resolve 'System message should be the first one' error on subsequent prompts (#126) b3abe94, closes #126 #125 #125



##  (2025-12-28)

* :arrow_up: Upgrade(custom): upgrade deps 659831b
* :bug: Fix(custom): fix an issue that custom models can't be used d290374
* :bug: Fix(custom): fix css error in setting page 6c2223f
* :bug: Fix(custom): handle JSON parsing error for saved prompts e035f1a
* :construction: WIP(custom): re-write with langchain 1982842
* :construction: WIP(custom): remove mcp related code, due to cors issue 90a0175
* :hammer: Refactor(custom): use langchain to refactor, remove agent mode for completely rewrite af0d083
* :pencil: Docs(custom): fix typo in readme 9a522a1
* :pencil: Docs(custom): update readme 8f6508b
* :sparkles: Feature(custom): add gpt-5.2 into model list 8ac70b0
* :sparkles: Feature(custom): add prompt selection functionality 395d574
* :sparkles: Feature(custom): add web fetch and search tool c9ca3c0
* :sparkles: Feature(custom): add word tools and mcp support, a rewritten agent mode 36e28d8
* :sparkles: Feature(custom): allow user to enable/disable tools 7a090d0
* :sparkles: Feature(custom): allow user to modify built-in prompts c606042
* :sparkles: Feature(custom): hide system prompt in chat 2e0f905
* :sparkles: Feature(custom): imporve type for setting preset list 90cf9cd
* :sparkles: Feature(custom): optimize i18n fields ecc9893
* :sparkles: Feature(custom): optimize message and add new i18n fields f9b5f02
* :sparkles: Feature(custom): rename the baseurl label a3a5849
* :sparkles: Feature(custom): support add multiple custom models a18116d, closes #111
* :sparkles: Feature(custom): support remove contents in think tag 8f6fd9e
* :sparkles: Feature(custom): update actions/checkout version and correct icon path in HTML and manife 50ad8db
* :sparkles: Feature(custom): update built-in prompts for better performance faa79e0
* :sparkles: Feature(custom): update deps, model list and lint rules c06d1a2
* :zap: Perf(custom): replace enum with object for localStorage keys and update related references bdaef28
* Merge pull request #118 from Kuingsmile/renovate/node-22.x f60d084, closes #118



##  (2025-11-13)

* :arrow_up: Upgrade(custom): upgrade google sdk fc6c8e3
* :bug: Fix(custom): fix max_token error 233aa66, closes #109
* :bug: Fix(custom): fix word formatting bug c335aa8, closes #105 #108
* :package: Chore(custom): add element-plus deps 47c4e8f
* :sparkles: Feature(custom): add custom msg component 1ed0df8
* :sparkles: Feature(custom): update groq sdk and models 086a3c9



##  (2025-09-03)

* :sparkles: Feature(custom): update model list 9138979



##  (2025-07-15)

* feat: add agent mode and markdown to word format support 27e94d0
* :arrow_up: Upgrade(custom): upgrade deps c13de8a
* :pencil: Docs(custom): add tencent edgeone deploy guide 8d1d9c3



##  (2025-07-01)

* :bug: Fix(custom): fix page ui props error 7607286
* :hammer: Refactor(custom): remove unused deps e9e7db0
* :package: Chore(custom): fix eslint a1d2cd8
* :package: Chore(custom): migrate to vite c63b236
* :sparkles: Feature(custom): remove password show for setting page e0ede90



# :tada: 0.5.0 (2025-06-07)


### :sparkles: Features

* **custom:** enhance UI of home page ([b6925d9](https://github.com/Kuingsmile/word-GPT-Plus/commit/b6925d9))
* **custom:** new UI of setting page ([2de3b10](https://github.com/Kuingsmile/word-GPT-Plus/commit/2de3b10))


### :pencil: Documentation

* **custom:** add alt text to images and update installation guide links in README files ([4d02191](https://github.com/Kuingsmile/word-GPT-Plus/commit/4d02191))
* **custom:** add new image for readme ([27e64fb](https://github.com/Kuingsmile/word-GPT-Plus/commit/27e64fb))


### :package: Chore

* **custom:** add mcp server configuration file ([5868654](https://github.com/Kuingsmile/word-GPT-Plus/commit/5868654))



## :tada: 0.4.13 (2025-06-05)


### :sparkles: Features

* **custom:** add support for gemini 2.0 and migrate to new gemini sdk ([9bc81ad](https://github.com/Kuingsmile/word-GPT-Plus/commit/9bc81ad))


### :bug: Bug Fixes

* **custom:** fix node version and el-input ([3d42391](https://github.com/Kuingsmile/word-GPT-Plus/commit/3d42391))
* **custom:** fix typos ([061a585](https://github.com/Kuingsmile/word-GPT-Plus/commit/061a585))
* **custom:** update font family in App.vue and adjust layout in HomePage.vue ([05b20d5](https://github.com/Kuingsmile/word-GPT-Plus/commit/05b20d5))


### :package: Chore

* **custom:** change bat file path ([8659da0](https://github.com/Kuingsmile/word-GPT-Plus/commit/8659da0))



## :tada: 0.4.12 (2025-03-03)


### :sparkles: Features

* **custom:** add deepseek r1 and optimize the prompt ([5ef40b0](https://github.com/Kuingsmile/word-GPT-Plus/commit/5ef40b0))


### :pencil: Documentation

* **custom:** update readme ([128dc03](https://github.com/Kuingsmile/word-GPT-Plus/commit/128dc03))
* **custom:** update README to include DeepSeek ([8e261c4](https://github.com/Kuingsmile/word-GPT-Plus/commit/8e261c4))



## :tada: 0.4.11 (2024-11-20)


### :sparkles: Features

* **custom:** add models for gemini ([f369ab7](https://github.com/Kuingsmile/word-GPT-Plus/commit/f369ab7))
* **custom:** remove support of palm ([84dc623](https://github.com/Kuingsmile/word-GPT-Plus/commit/84dc623))
* **custom:** remove unavaliable models of openai ([ee25614](https://github.com/Kuingsmile/word-GPT-Plus/commit/ee25614))
* **custom:** upgrade google sdk ([e420f82](https://github.com/Kuingsmile/word-GPT-Plus/commit/e420f82))


### :pencil: Documentation

* **custom:** require node 18+ ([a069918](https://github.com/Kuingsmile/word-GPT-Plus/commit/a069918))



## :tada: 0.4.10 (2024-10-23)


### :sparkles: Features

* **custom:** add o1 and o1 mini ([eedcb96](https://github.com/Kuingsmile/word-GPT-Plus/commit/eedcb96))



## :tada: 0.4.9 (2024-08-14)


### :sparkles: Features

* **custom:** add gpt-4o-mini ([fd716f6](https://github.com/Kuingsmile/word-GPT-Plus/commit/fd716f6))
* **custom:** imporve academic prompt ([f40df00](https://github.com/Kuingsmile/word-GPT-Plus/commit/f40df00)), closes [#72](https://github.com/Kuingsmile/word-GPT-Plus/issues/72)



## :tada: 0.4.8 (2024-07-16)


### :sparkles: Features

* **custom:** add groq support ([23e16d8](https://github.com/Kuingsmile/word-GPT-Plus/commit/23e16d8)), closes [#64](https://github.com/Kuingsmile/word-GPT-Plus/issues/64)


### :bug: Bug Fixes

* **custom:** fix a bug  system and home prompt not saved ([638ced4](https://github.com/Kuingsmile/word-GPT-Plus/commit/638ced4))


### :pencil: Documentation

* **custom:** add Groq API key application link to README files ([37a2695](https://github.com/Kuingsmile/word-GPT-Plus/commit/37a2695))


### :package: Chore

* **custom:** remove endofline in prettierrc ([7d73f68](https://github.com/Kuingsmile/word-GPT-Plus/commit/7d73f68))



## :tada: 0.4.7 (2024-06-24)


### :bug: Bug Fixes

* **custom:** fix offical setting bug ([48fed10](https://github.com/Kuingsmile/word-GPT-Plus/commit/48fed10))



## :tada: 0.4.6 (2024-06-22)



## :tada: 0.4.3 (2024-05-14)


### :sparkles: Features

* **custom:** add gpt-4o ([da4f5de](https://github.com/Kuingsmile/word-GPT-Plus/commit/da4f5de))



## :tada: 0.3.4 (2024-03-03)


### :sparkles: Features

* **custom:** add grammar button and functionality ([7ba38ca](https://github.com/Kuingsmile/word-GPT-Plus/commit/7ba38ca)), closes [#47](https://github.com/Kuingsmile/word-GPT-Plus/issues/47)



## :tada: 0.3.1 (2024-01-15)


### :bug: Bug Fixes

* **custom:** fix forward domain bug ([34052a4](https://github.com/Kuingsmile/word-GPT-Plus/commit/34052a4)), closes [#36](https://github.com/Kuingsmile/word-GPT-Plus/issues/36)



# :tada: 0.3.0 (2023-12-14)


### :sparkles: Features

* **custom:** add support for google gemini pro api ([591b78d](https://github.com/Kuingsmile/word-GPT-Plus/commit/591b78d))


### :pencil: Documentation

* **custom:** remove support for web api ([1b4b035](https://github.com/Kuingsmile/word-GPT-Plus/commit/1b4b035))



## :tada: 0.2.6 (2023-06-18)


### :sparkles: Features

* **custom:** add support for PALM2 API ([2f091fc](https://github.com/Kuingsmile/word-GPT-Plus/commit/2f091fc))



## :tada: 0.2.5 (2023-06-14)


### :sparkles: Features

* **custom:** add gpt 3.5 16k model ([0881018](https://github.com/Kuingsmile/word-GPT-Plus/commit/0881018))



## :tada: 0.2.4 (2023-06-09)


### :sparkles: Features

* **custom:** add support for azure openai api ([61226d1](https://github.com/Kuingsmile/word-GPT-Plus/commit/61226d1))
* **custom:** optimize azure openai api ([72e9ffa](https://github.com/Kuingsmile/word-GPT-Plus/commit/72e9ffa))


### :bug: Bug Fixes

* **custom:** remove timeout ([ddf6f05](https://github.com/Kuingsmile/word-GPT-Plus/commit/ddf6f05))



## :tada: 0.2.3 (2023-05-06)


### :bug: Bug Fixes

* **custom:** fix 404 bug after changing model ([a262415](https://github.com/Kuingsmile/word-GPT-Plus/commit/a262415))


### :pencil: Documentation

* **custom:** add requirements ([9d9fdc3](https://github.com/Kuingsmile/word-GPT-Plus/commit/9d9fdc3)), closes [#3](https://github.com/Kuingsmile/word-GPT-Plus/issues/3)
* **custom:** fix format error ([6ab3952](https://github.com/Kuingsmile/word-GPT-Plus/commit/6ab3952))
* **custom:** update account requirement ([f68486b](https://github.com/Kuingsmile/word-GPT-Plus/commit/f68486b))
* **custom:** update instruction for China users to install ([fe45629](https://github.com/Kuingsmile/word-GPT-Plus/commit/fe45629))


### :package: Chore

* **custom:** add issue template ([4ed5653](https://github.com/Kuingsmile/word-GPT-Plus/commit/4ed5653))



## :tada: 0.2.2 (2023-04-28)


### :bug: Bug Fixes

* **custom:** change default maxTokens from 100 to 400 ([dcae188](https://github.com/Kuingsmile/word-GPT-Plus/commit/dcae188))
* **custom:** fix token and api key bug ([dfb70a2](https://github.com/Kuingsmile/word-GPT-Plus/commit/dfb70a2))


### :pencil: Documentation

* **custom:** delete china server due to tech issue ([16cd6a9](https://github.com/Kuingsmile/word-GPT-Plus/commit/16cd6a9))
* **custom:** update manifest.xml download link ([772c1d9](https://github.com/Kuingsmile/word-GPT-Plus/commit/772c1d9))



## :tada: 0.2.1 (2023-04-27)


### :bug: Bug Fixes

* **custom:** fix api storage bug ([07f8200](https://github.com/Kuingsmile/word-GPT-Plus/commit/07f8200))
* **custom:** fix json parse bug, newline insert bug ([c94c1c4](https://github.com/Kuingsmile/word-GPT-Plus/commit/c94c1c4))


### :pencil: Documentation

* **custom:** add describe for how to get access token ([0ec50c1](https://github.com/Kuingsmile/word-GPT-Plus/commit/0ec50c1))
* **custom:** add instruction for how to install ([6d4039a](https://github.com/Kuingsmile/word-GPT-Plus/commit/6d4039a))
* **custom:** fix typos ([ef4851e](https://github.com/Kuingsmile/word-GPT-Plus/commit/ef4851e))
* **custom:** update install instruction ([9962ebd](https://github.com/Kuingsmile/word-GPT-Plus/commit/9962ebd))



# :tada: 0.2.0 (2023-04-25)


### :sparkles: Features

* **custom:** add support for chatGPT web API, using accessToken ([8768f9e](https://github.com/Kuingsmile/word-GPT-Plus/commit/8768f9e))


### :pencil: Documentation

* **custom:** add support of web api using access token ([4faa1bb](https://github.com/Kuingsmile/word-GPT-Plus/commit/4faa1bb))
* **custom:** fix docs ([6010124](https://github.com/Kuingsmile/word-GPT-Plus/commit/6010124))
* **custom:** update README ([77ddaa8](https://github.com/Kuingsmile/word-GPT-Plus/commit/77ddaa8))



