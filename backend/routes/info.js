const express = require('express');
const router = express.Router();
const {
  validateUrl,
  detectPlatform,
  getVideoInfo,
  parseFormats,
  formatDuration,
  formatFileSize,
} = require('../utils/ytdlp');

/**
 * POST /api/info
 * Body: { url: string }
 * Returns video metadata and available formats
 */
router.post('/', async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.length > 2048) {
    return res.status(400).json({ error: 'URL is too long' });
  }

  // Validate URL
  const validation = validateUrl(trimmedUrl);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.reason });
  }

  const platform = detectPlatform(trimmedUrl);

  try {
    const info = await getVideoInfo(trimmedUrl);
    const formats = parseFormats(info);

    // Pick best thumbnail
    let thumbnail = info.thumbnail;
    if (info.thumbnails && info.thumbnails.length > 0) {
      // Prefer highest resolution thumbnail
      const sorted = [...info.thumbnails]
        .filter(t => t.url)
        .sort((a, b) => ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0)));
      if (sorted.length > 0) thumbnail = sorted[0].url;
    }

    const response = {
      url: trimmedUrl,
      platform,
      title: info.title || 'Unknown Title',
      description: info.description ? info.description.slice(0, 500) : null,
      duration: info.duration || null,
      durationFormatted: formatDuration(info.duration),
      thumbnail,
      uploader: info.uploader || info.channel || null,
      uploadDate: info.upload_date || null,
      viewCount: info.view_count || null,
      likeCount: info.like_count || null,
      webpage_url: info.webpage_url || trimmedUrl,
      formats: {
        video: formats.video.map(f => ({
          ...f,
          filesizeFormatted: f.filesize ? formatFileSize(f.filesize) : null,
        })),
        audio: formats.audio.map(f => ({
          ...f,
          filesizeFormatted: f.filesize ? formatFileSize(f.filesize) : null,
        })),
      },
    };

    res.json(response);
  } catch (err) {
    console.error('Info fetch error:', err.message);
    const statusCode = err.message.includes('not supported') ? 422 :
                       err.message.includes('private') ? 403 :
                       err.message.includes('not installed') ? 503 : 400;
    res.status(statusCode).json({ error: err.message });
  }
});

module.exports = router;
