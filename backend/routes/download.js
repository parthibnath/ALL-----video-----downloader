const express = require('express');
const router  = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs   = require('fs');
const os   = require('os');
const { validateUrl, detectPlatform } = require('../utils/ytdlp');

const YT_DLP_PATH       = process.env.YT_DLP_PATH  || 'yt-dlp';
const MAX_DOWNLOAD_SIZE = parseInt(process.env.MAX_DOWNLOAD_SIZE || '2147483648');

/* ─────────────────────────────────────────────────────────────────────────
   Platform-aware format string builder
   Facebook / Instagram serve DASH streams — video-only + audio-only.
   We must ALWAYS merge with bestaudio and re-encode to mp4 via ffmpeg.
   For all other platforms the same merge approach is used for safety.
───────────────────────────────────────────────────────────────────────── */
function buildFormatString(type, quality, formatId, platform) {
  if (type === 'audio') {
    return 'bestaudio/best';
  }

  const h = quality ? quality.replace('p', '') : '1080';

  // ── Facebook & Instagram: always use generic best-merge, never raw format IDs
  //    because their DASH format IDs are session-specific and often stale by
  //    the time the download request arrives.
  const dashPlatforms = ['Facebook', 'Instagram'];
  if (dashPlatforms.includes(platform)) {
    return (
      `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]/` +
      `bestvideo[height<=${h}]+bestaudio/` +
      `best[height<=${h}][ext=mp4]/` +
      `best[height<=${h}]/best`
    );
  }

  // ── TikTok: often has a single combined stream
  if (platform === 'TikTok') {
    return `best[ext=mp4]/best`;
  }

  // ── Generic: use provided formatId (already paired as "video+audio" by ytdlp.js)
  if (formatId && formatId !== 'bestvideo+bestaudio/best') {
    return (
      `${formatId}/` +
      `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]/` +
      `bestvideo[height<=${h}]+bestaudio/` +
      `best[height<=${h}]/best`
    );
  }

  // ── Fallback generic
  return (
    `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]/` +
    `bestvideo[height<=${h}][ext=webm]+bestaudio[ext=webm]/` +
    `bestvideo[height<=${h}]+bestaudio/` +
    `best[height<=${h}]/best`
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Temp-file downloader
   yt-dlp downloads + merges to a temp file, we stream it, then delete it.
   This is the ONLY reliable way to get merged audio+video output.
───────────────────────────────────────────────────────────────────────── */
function downloadWithTempFile({ url, formatString, type, filename, platform, res, req }) {
  const tmpDir  = os.tmpdir();
  const tmpBase = path.join(tmpDir, `avd_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const tmpOut  = `${tmpBase}.%(ext)s`;

  const args = [
    '--no-playlist',
    '--no-warnings',
    '--socket-timeout', '60',
    '--retries', '5',
    '--fragment-retries', '10',    // ← important for DASH/HLS fragments (Facebook)
    '--concurrent-fragments', '4', // faster DASH segment download
    '-f', formatString,
    '-o', tmpOut,
    '--merge-output-format', 'mp4', // always output mp4
  ];

  if (type === 'audio') {
    // Remove merge flag for audio, add extraction flags instead
    args.splice(args.indexOf('--merge-output-format'), 2);
    args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
  }

  // Facebook / Instagram often need extra headers / workarounds
  const dashPlatforms = ['Facebook', 'Instagram'];
  if (dashPlatforms.includes(platform)) {
    args.push(
      '--add-header', 'Accept-Language:en-US,en;q=0.9',
      '--no-check-certificates',
    );
  }

  // Custom ffmpeg path
  if (process.env.FFMPEG_PATH && process.env.FFMPEG_PATH !== 'ffmpeg') {
    args.push('--ffmpeg-location', process.env.FFMPEG_PATH);
  }

  args.push(url);

  console.log(`[download] Platform: ${platform}`);
  console.log(`[download] Format:   ${formatString}`);
  console.log(`[download] URL:      ${url}`);

  let proc;
  try {
    proc = spawn(YT_DLP_PATH, args, {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });
  } catch (err) {
    console.error('[download] spawn error:', err);
    return res.status(503).json({ error: 'Download service unavailable.' });
  }

  let errorOutput = '';

  proc.stderr.on('data', d => {
    const msg = d.toString();
    errorOutput += msg;
    if (
      msg.includes('[download]') || msg.includes('[ffmpeg]') ||
      msg.includes('Merging')   || msg.includes('[hlsnative]') ||
      msg.includes('[dash]')
    ) {
      process.stdout.write('\r' + msg.trim().slice(0, 140));
    }
  });

  proc.on('error', err => {
    console.error('[download] spawn error:', err);
    if (!res.headersSent) res.status(503).json({ error: 'Download service unavailable.' });
    cleanTmp(tmpBase);
  });

  proc.on('close', code => {
    console.log(`\n[download] yt-dlp exit code: ${code}`);

    if (code !== 0) {
      let msg = 'Download failed. Please try again.';
      if (errorOutput.includes('private'))         msg = 'This video is private.';
      if (errorOutput.includes('not available'))   msg = 'This video is not available.';
      if (errorOutput.includes('Unsupported URL')) msg = 'This URL is not supported.';
      if (errorOutput.includes('login required') || errorOutput.includes('Login'))
        msg = 'This video requires login to download.';
      console.error('[download] Error output:', errorOutput.slice(-500));
      if (!res.headersSent) res.status(400).json({ error: msg });
      cleanTmp(tmpBase);
      return;
    }

    // Find the output file — try mp4 first, then fallbacks
    const ext        = type === 'audio' ? 'mp3' : 'mp4';
    const candidates = [
      `${tmpBase}.${ext}`,
      `${tmpBase}.mkv`,
      `${tmpBase}.webm`,
      `${tmpBase}.m4a`,
      `${tmpBase}.mp4`,
    ];
    const found = candidates.find(p => {
      try { return fs.existsSync(p) && fs.statSync(p).size > 0; } catch { return false; }
    });

    if (!found) {
      console.error('[download] No output file found. Checked:', candidates);
      if (!res.headersSent) res.status(500).json({ error: 'Downloaded file not found on server.' });
      cleanTmp(tmpBase);
      return;
    }

    const stat = fs.statSync(found);
    if (stat.size > MAX_DOWNLOAD_SIZE) {
      if (!res.headersSent) res.status(413).json({ error: 'File too large.' });
      cleanTmp(tmpBase);
      return;
    }

    const mime       = type === 'audio' ? 'audio/mpeg' : 'video/mp4';
    const actualExt  = path.extname(found);
    const sendName   = filename.replace(/\.[^.]+$/, actualExt);

    console.log(`[download] Sending: ${found} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);

    res.setHeader('Content-Disposition', `attachment; filename="${sendName}"`);
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');

    const stream = fs.createReadStream(found);
    stream.pipe(res);

    stream.on('end', ()  => { console.log('[download] Done.'); cleanTmp(tmpBase); });
    stream.on('error', err => { console.error('[download] Stream error:', err); cleanTmp(tmpBase); });
    req.on('close', ()  => { stream.destroy(); cleanTmp(tmpBase); });
  });

  req.on('close', () => { if (proc && !proc.killed) proc.kill('SIGKILL'); });
}

function cleanTmp(base) {
  ['.mp4', '.mkv', '.webm', '.mp3', '.m4a', '.opus', '.part', '.ytdl', '.f*'].forEach(ext => {
    try { fs.unlinkSync(base + ext); } catch {}
  });
  // Also remove any partial fragment files
  try {
    const dir   = path.dirname(base);
    const bname = path.basename(base);
    fs.readdirSync(dir)
      .filter(f => f.startsWith(bname))
      .forEach(f => { try { fs.unlinkSync(path.join(dir, f)); } catch {} });
  } catch {}
}

/* ─────────────────────────────────────────────────────────────────────────
   Route: GET /api/download?url=...&type=video|audio&quality=...&formatId=...
───────────────────────────────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  const { url, type, formatId, quality } = req.query;

  if (!url)  return res.status(400).json({ error: 'URL is required' });
  if (!type || !['video', 'audio'].includes(type))
    return res.status(400).json({ error: 'Invalid type. Must be "video" or "audio"' });

  const trimmedUrl = url.trim();
  const validation = validateUrl(trimmedUrl);
  if (!validation.valid) return res.status(400).json({ error: validation.reason });

  const platform     = detectPlatform(trimmedUrl);
  const formatString = buildFormatString(type, quality, formatId, platform);
  const ext          = type === 'audio' ? 'mp3' : 'mp4';
  const filename     = `all-video-downloader-${Date.now()}.${ext}`;

  downloadWithTempFile({ url: trimmedUrl, formatString, type, filename, platform, res, req });
});

module.exports = router;
