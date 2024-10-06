# YouTube Video Downloader App

## Introduction

**Tired of using sketchy, ad-filled websites to download YouTube videos?** We’ve all been there: annoying pop-ups, fake download buttons, captchas, and endless redirects. These sites make a simple task complicated and risky for your computer.

That’s why we built the **YouTube Video Downloader App** — a fast, ad-free solution that you can run locally. Forget dealing with shady websites and enjoy hassle-free downloads right from your desktop.

## Features

- **No Ads or Pop-ups**: Completely free of any advertisements or annoying pop-ups.
- **Fast and Secure Downloads**: Download your videos directly without waiting or worrying about malware.
- **Single Format Support**: Videos are downloaded in a reliable, commonly-used format (e.g., MP4).
- **Run Locally**: Keep full control over the download process with this locally hosted app.

## How to Use

### Step 1: Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/tseringn/ytdl.git
cd youtube-downloader
```

### Step 2: Install Dependencies

Install the required dependencies for both the backend (Node.js) and frontend (React):
For the Node.js Backend:

```bash

cd server
yarn install
```

For the React Frontend:

```bash

cd ../client
yarn install
```

### Step 3: Running the Application

Now that everything is set up, follow these steps to run the app:
Start the Node.js Backend:

From the /server directory, run:

```bash

yarn start
```

This will start the backend server (default port: 5000).
Start the React Frontend:

From the /client directory, run:

```bash

npm start
```

This will start the React app (default port: 3000).

### Step 4: Download Videos

- **Open the App: Open your browser and go to http://localhost:3000.**
- **Paste the YouTube URL: Copy the URL of the video you want and paste it into the input field.**
- **Download: Click the download button, and the video will be saved to your computer in the supported format (e.g., MP4) — simple and quick!**

### Why Use This App?

Online video downloaders can be a pain:

- **Ads Everywhere: Pop-ups and redirects get in your way.**
- **Unreliable: Broken links and failed downloads waste your time.**
- **Security Risks: You never know what you're downloading along with your video.**

Our app solves these issues by running locally and providing a seamless download experience, with no unwanted surprises.

### Tech Stack

- **Backend: Node.js (Express)**
- **Frontend: React**

### License
