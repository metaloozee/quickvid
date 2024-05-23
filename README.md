<h1 align="center">QuickVid - Summarize & Verify any YouTube video in seconds</h1>

<p align="center">
  <a href="https://twitter.com/metaloozee">
    <img src="https://img.shields.io/twitter/follow/metaloozee?style=flat&label=%40metaloozee&logo=twitter&color=0bf&logoColor=fff" alt="Twitter" />
  </a>
  <a href="https://github.com/metaloozee/quickvid/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/metaloozee/quickvid?label=license&logo=github&color=f80&logoColor=fff" alt="License" />
  </a>
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#installation"><strong>Installation</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a>
</p>

<br />

## Introduction

QuickVid is here to revolutionize how you interact with YouTube content. It's simple:

1. Paste a YouTube link.
2. Get lightning-fast summaries.
3. Now, verify videos with internet facts!

## Installation

### Local Installation

1. Clone the Repository
    ```bash
    git clone https://github.com/metaloozee/quickvid.git
    cd quickvid
    ```
2. Install Dependencies
    ```bash
    [pnpm | npm | yarn] install
    ```
3. Set Environment Variables

4. Run the Application
    ```bash
    [pnpm | npm | yarn] run dev
    ```
    this will launch the application, and you can access it by visiting `http://localhost:3000` in your web browser.

### Docker Installation

1. Clone the Repository
    ```bash
    git clone https://github.com/metaloozee/quickvid
    cd quickvid
    ```
2. Set Environment Variables

3. Build the Docker Image
    ```bash
    docker build -t quickvid .
    ```
4. Run the Docker Container
    ```bash
    docker run -p 3000:3000 --env-file .env.local quickvid
    ```
    this will launch the Next.js application inside the Docker container, and you can access it by visiting http://localhost:3000 in your web browser.

## Tech Stack

-   [Next.js](https://nextjs.org/) – Framework
-   [Typescript](https://www.typescriptlang.org/) – Language
-   [Whisper](https://openai.com/research/whisper) - Speech-to-Text
-   [LangChain](https://docs.langchain.com/docs/) - AI Orchestration
-   [Neon](https://neon.com/) – Database
-   [shadcn/ui](https://ui.shadcn.com/) - UI Component Library

## Contributing

We love our contributors! Here's how you can contribute:

-   [Open an issue](https://github.com/metaloozee/quickvid/issues) if you believe you've encountered a bug.
-   Make a [pull request](https://github.com/metaloozee/quickvid/pulls) to add new features/make quality-of-life improvements/fix bugs.

## Author

-   Ayan ([@metaloozee](https://twitter.com/metaloozee))

## License:

QuickVid is open-sourced under the GNU General Public License Version 3 (GPLv3) or any later version. You can [find it here](https://github.com/metaloozee/quickvid/blob/main/LICENSE.md)
