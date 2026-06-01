const { spawn, execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

const YT_DLP_PATH = process.env.YT_DLP_PATH || 'yt-dlp';
const TIMEOUT_MS  = parseInt(process.env.YT_DLP_TIMEOUT || '30000');

/* ── Check yt-dlp availability ── */
async function checkYtDlp() {
  try {
    const { stdout } = await execFileAsync(YT_DLP_PATH, ['--version'], { timeout: 5000 });
    return { available: true, version: stdout.trim() };
  } catch {
    return { available: false, version: null };
  }
}

/* ── URL validation ── */
function validateUrl(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, reason: 'Only HTTP/HTTPS URLs are supported' };
    }
    const blockedHosts   = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    const privateRanges  = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;
    if (blockedHosts.includes(parsed.hostname) || privateRanges.test(parsed.hostname)) {
      return { valid: false, reason: 'Invalid URL' };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }
}

/* ── Platform detection ── */
function detectPlatform(url) {
  const platforms = {
    'youtube.com': 'YouTube', 'youtu.be': 'YouTube',
    'twitter.com': 'Twitter/X', 'x.com': 'Twitter/X',
    'instagram.com': 'Instagram', 'tiktok.com': 'TikTok',
    'facebook.com': 'Facebook', 'fb.watch': 'Facebook',
    'vimeo.com': 'Vimeo', 'twitch.tv': 'Twitch',
    'reddit.com': 'Reddit', 'dailymotion.com': 'Dailymotion',
    'soundcloud.com': 'SoundCloud', 'bilibili.com': 'Bilibili',
    'rumble.com': 'Rumble', 'odysee.com': 'Odysee',
  };
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return platforms[hostname] || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

/* ── Fetch video info ── */
async function getVideoInfo(url) {
  const args = [
    '--dump-json', '--no-playlist', '--no-warnings',
    '--socket-timeout', '15', '--retries', '2', url,
  ];

  return new Promise((resolve, reject) => {
    let stdout = '', stderr = '', timedOut = false;

    const proc = spawn(YT_DLP_PATH, args, {
      timeout: TIMEOUT_MS,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
      reject(new Error('Request timed out.'));
    }, TIMEOUT_MS);

    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });

    proc.on('close', code => {
      clearTimeout(timer);
      if (timedOut) return;
      if (code !== 0) {
        if (stderr.includes('Private video'))    return reject(new Error('This video is private.'));
        if (stderr.includes('not available'))    return reject(new Error('This video is not available.'));
        if (stderr.includes('Unsupported URL'))  return reject(new Error('This URL is not supported.'));
        if (stderr.includes('Sign in') || stderr.includes('age-restricted'))
          return reject(new Error('This video requires sign-in or is age-restricted.'));
        return reject(new Error('Failed to fetch video information.'));
      }
      try {
        const info = JSON.parse(stdout.trim().split('\n')[0]);
        resolve(info);
      } catch {
        reject(new Error('Failed to parse video metadata.'));
      }
    });

    proc.on('error', err => {
      clearTimeout(timer);
      if (err.code === 'ENOENT') reject(new Error('yt-dlp is not installed on the server.'));
      else reject(new Error(`Failed to execute yt-dlp: ${err.message}`));
    });
  });
}

/* ── Parse formats ──────────────────────────────────────────────────────────
   KEY FIX: For video formats, always set formatId to a merge string like
   "137+140" (video stream + audio stream) so ffmpeg merges them properly.
   Never send a video-only format ID without pairing it with an audio stream.
─────────────────────────────────────────────────────────────────────────── */
function parseFormats(info) {
  const formats = info.formats || [];
  const results = { video: [], audio: [] };

  const qualityLabels = {
    2160: '4K Ultra HD', 1440: '2K QHD', 1080: '1080p Full HD',
    720: '720p HD', 480: '480p SD', 360: '360p', 240: '240p', 144: '144p',
  };

  const seenVideoQualities = new Set();
  const seenAudioQualities = new Set();

  /* ── Find the best audio-only stream to pair with each video stream ── */
  const audioOnlyFormats = formats.filter(f =>
    f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none')
  ).sort((a, b) => (b.abr || 0) - (a.abr || 0));

  // Best m4a audio (preferred for mp4 container)
  const bestM4aAudio = audioOnlyFormats.find(f => f.ext === 'm4a');
  const bestAudio    = bestM4aAudio || audioOnlyFormats[0];

  /* ── Video formats ── */
  const videoFormats = formats.filter(f =>
    f.vcodec && f.vcodec !== 'none' && f.height
  ).sort((a, b) => (b.height || 0) - (a.height || 0));

  for (const f of videoFormats) {
    if (!f.height) continue;

    const quality = [2160, 1440, 1080, 720, 480, 360, 240, 144]
      .find(q => f.height >= q - 20) || f.height;

    const key = `${quality}`;
    if (seenVideoQualities.has(key)) continue;
    seenVideoQualities.add(key);

    const hasInlineAudio = f.acodec && f.acodec !== 'none';

    // Build a merge format ID: pair video-only streams with best audio
    let formatId;
    if (hasInlineAudio) {
      // Format already has both — use as-is
      formatId = f.format_id;
    } else if (bestAudio) {
      // Pair video stream with best audio stream (ffmpeg will merge)
      formatId = `${f.format_id}+${bestAudio.format_id}`;
    } else {
      // Fallback: let download route figure it out
      formatId = `bestvideo[height<=${f.height}]+bestaudio/best[height<=${f.height}]`;
    }

    results.video.push({
      formatId,
      quality:       `${f.height}p`,
      qualityLabel:  qualityLabels[quality] || `${f.height}p`,
      ext:           'mp4',
      filesize:      f.filesize || f.filesize_approx || null,
      fps:           f.fps || null,
      hasAudio:      true,   // always true now — we merge
      vcodec:        f.vcodec,
      acodec:        hasInlineAudio ? f.acodec : (bestAudio?.acodec || 'aac'),
      tbr:           f.tbr || null,
    });
  }

  /* ── Audio formats ── */
  audioOnlyFormats.sort((a, b) => (b.abr || 0) - (a.abr || 0));

  const audioTiers = [
    { key: 'high',   label: 'High Quality (320kbps)',  minAbr: 256 },
    { key: 'medium', label: 'Medium Quality (192kbps)', minAbr: 128 },
    { key: 'low',    label: 'Low Quality (128kbps)',    minAbr: 0   },
  ];

  for (const tier of audioTiers) {
    if (seenAudioQualities.has(tier.key)) continue;
    const f = audioOnlyFormats.find(af => (af.abr || 0) >= tier.minAbr);
    if (f) {
      seenAudioQualities.add(tier.key);
      results.audio.push({
        formatId:     f.format_id,
        quality:      tier.key,
        qualityLabel: tier.label,
        ext:          'mp3',
        filesize:     f.filesize || null,
        abr:          f.abr || null,
        acodec:       f.acodec,
      });
    }
  }

  /* ── Fallbacks ── */
  if (results.video.length === 0) {
    results.video.push({
      formatId:     'bestvideo+bestaudio/best',
      quality:      'best',
      qualityLabel: 'Best Available',
      ext:          'mp4',
      filesize:     null,
      fps:          null,
      hasAudio:     true,
    });
  }

  if (results.audio.length === 0) {
    results.audio.push({
      formatId:     'bestaudio',
      quality:      'high',
      qualityLabel: 'Best Available',
      ext:          'mp3',
      filesize:     null,
      abr:          null,
    });
  }

  return results;
}

/* ── Helpers ── */
function formatDuration(seconds) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatFileSize(bytes) {
  if (!bytes) return null;
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes, unit = 0;
  while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit++; }
  return `${size.toFixed(1)} ${units[unit]}`;
}

module.exports = {
  checkYtDlp, validateUrl, detectPlatform,
  getVideoInfo, parseFormats, formatDuration, formatFileSize,
};
