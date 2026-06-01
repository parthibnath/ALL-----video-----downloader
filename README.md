# video downloader 🎬

**A modern, free, open-source video downloader powered by yt-dlp.**

Download MP4 videos and MP3 audio from YouTube, TikTok, Instagram, Twitter/X, Vimeo, Reddit, and 1000+ other sites. No API keys, no sign-in, no ads.

![video downloader Preview](https://via.placeholder.com/800x450/050508/00f5ff?text=all+video+downloader)

---

## ✨ Features

- 🔗 **Paste any URL** — supports 1000+ sites via yt-dlp
- 🎬 **MP4 video** in multiple qualities (4K, 1080p, 720p, 480p, 360p...)
- 🎵 **MP3 audio** extraction (High/Medium/Low quality)
- 🖼️ **Thumbnail + metadata** preview before downloading
- ⚡ **Fast streaming** — files streamed directly from server to browser
- 📱 **Mobile-first** responsive design
- 🕐 **Download history** stored in localStorage
- 🌐 **No API keys required** — uses yt-dlp directly
- 🔒 **Secure backend** with rate limiting, CORS, and input validation
- 🐳 **Docker support** included
- 🚀 **Ready to deploy** on Render, Railway, or Vercel

---

## 🗂️ Project Structure

```
video-downloader/
├── backend/                 # Node.js + Express API
│   ├── routes/
│   │   ├── info.js         # POST /api/info - fetch video metadata
│   │   ├── download.js     # GET /api/download - stream file
│   │   └── status.js       # GET /api/status - API health
│   ├── utils/
│   │   └── ytdlp.js        # yt-dlp wrapper + URL validation
│   ├── server.js           # Express app entry
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── frontend/                # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── Background.jsx    # Animated gradient background
│   │   │   ├── Navbar.jsx        # Top nav with API status
│   │   │   ├── Hero.jsx          # Landing hero section
│   │   │   ├── DownloadCard.jsx  # URL input + fetch logic
│   │   │   ├── ResultCard.jsx    # Video info + download options
│   │   │   ├── HistorySection.jsx # Download history
│   │   │   ├── LoadingSpinner.jsx # Animated spinner
│   │   │   └── ApiStatus.jsx     # API health indicator
│   │   ├── utils/
│   │   │   └── api.js            # API calls + local storage
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   │   └── favicon.svg
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── vercel.json
│   └── package.json
│
├── docker-compose.yml       # Full-stack Docker setup
├── render.yaml              # Render deployment config
├── railway.toml             # Railway deployment config
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js** 18+
- **yt-dlp** installed: `pip install yt-dlp` (or see [yt-dlp docs](https://github.com/yt-dlp/yt-dlp#installation))
- **ffmpeg** installed (optional but recommended for merging video+audio)
  - macOS: `brew install ffmpeg`
  - Ubuntu: `sudo apt install ffmpeg`
  - Windows: [Download from ffmpeg.org](https://ffmpeg.org/download.html)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/streamdrop.git
cd streamdrop

# Install backend
cd backend
npm install
cp .env.example .env

# Install frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
YT_DLP_PATH=yt-dlp       # or full path like /usr/local/bin/yt-dlp
FFMPEG_PATH=ffmpeg        # or full path
YT_DLP_TIMEOUT=30000
```

**Frontend** (`frontend/.env`):
```env
# Leave empty in development (Vite proxy handles it)
VITE_API_URL=
```

### 3. Run

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API running at http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🐳 Docker (Full Stack)

```bash
# Build and run everything
docker-compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

---

## ☁️ Deployment

### Option A: Render (Recommended - Free Tier)

1. Fork this repo to your GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your repo (Render reads `render.yaml`)
4. Set env vars in Render dashboard:
   - `ALLOWED_ORIGINS` → your frontend URL
5. Deploy!

**Manual Render setup:**
1. Create **Web Service** (Docker) → point to `backend/Dockerfile`
2. Create **Static Site** → build command: `cd frontend && npm install && npm run build`, publish: `frontend/dist`
3. Set `VITE_API_URL` to your backend URL

### Option B: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Set environment variables in Railway dashboard:
- `NODE_ENV=production`
- `ALLOWED_ORIGINS=https://your-frontend.vercel.app`

### Option C: Vercel (Frontend) + Render (Backend)

**Frontend on Vercel:**
```bash
cd frontend
npx vercel --prod
# Set VITE_API_URL=https://your-backend.onrender.com/api
```

**Backend on Render:**
- Create Docker Web Service
- Set all env vars from `.env.example`

### Option D: VPS / Self-hosted

```bash
# On your server
git clone https://github.com/yourusername/streamdrop
cd streamdrop

# Install yt-dlp and ffmpeg
pip install yt-dlp
apt install ffmpeg  # or brew install ffmpeg

# Setup backend
cd backend && npm install
cp .env.example .env && nano .env  # Edit your settings
NODE_ENV=production node server.js

# Build and serve frontend
cd ../frontend && npm install
VITE_API_URL=https://yourdomain.com/api npm run build
# Serve dist/ with nginx or caddy
```

---

## 📡 API Reference

### `POST /api/info`
Fetch video metadata and available formats.

**Request:**
```json
{ "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
```

**Response:**
```json
{
  "url": "...",
  "platform": "YouTube",
  "title": "Video Title",
  "duration": 212,
  "durationFormatted": "3:32",
  "thumbnail": "https://...",
  "uploader": "Channel Name",
  "viewCount": 1234567,
  "formats": {
    "video": [
      { "formatId": "137", "quality": "1080p", "qualityLabel": "1080p Full HD", "ext": "mp4", "hasAudio": false }
    ],
    "audio": [
      { "formatId": "140", "quality": "high", "qualityLabel": "High Quality (320kbps)", "ext": "mp3" }
    ]
  }
}
```

### `GET /api/download`
Stream the download directly to the browser.

**Query params:**
- `url` — video URL
- `type` — `video` or `audio`
- `formatId` — format ID from `/api/info`
- `quality` — quality string (e.g. `1080p`)

### `GET /api/status`
Returns yt-dlp availability and server health.

### `GET /health`
Simple health check endpoint.

---

## ⚖️ Legal Notice

StreamDrop is for **personal use only**. Only download content:
- That you own the rights to
- That is licensed for free redistribution
- For which you have explicit permission from the creator

Downloading copyrighted content without permission may violate the platform's Terms of Service and applicable law. The developers are not responsible for misuse.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Downloader | yt-dlp |
| Media Processing | ffmpeg |
| Deployment | Docker, Render, Railway, Vercel |

---

## 📝 License

MIT — see [LICENSE](LICENSE) for details.

---

Made with ❤️ using [yt-dlp](https://github.com/yt-dlp/yt-dlp)
