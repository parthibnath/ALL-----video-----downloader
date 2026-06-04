# video downloader 🎬

**A modern, free, open-source video downloader powered by yt-dlp.**

Download MP4 videos and MP3 audio from YouTube, TikTok, Instagram, Twitter/X, Vimeo, Reddit, and 1000+ other sites. No sign-in, no ads.



---

## ✨ Features

- 🔗 **Paste any URL** — supports 1000+ sites via yt-dlp
- 🎬 **MP4 video** in multiple qualities (4K, 1080p, 720p, 480p, 360p...)
- 🎵 **MP3 audio** extraction (High/Medium/Low quality)
- 🕐 **Download history** stored in localStorage
- 
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
  - macOS: `brew install ffmpeg'
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

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Downloader | yt-dlp |
| Media Processing | ffmpeg |
| Deployment | Docker, Render, Railway, Vercel |

---

Made with ❤️ from Parthib Nath 
