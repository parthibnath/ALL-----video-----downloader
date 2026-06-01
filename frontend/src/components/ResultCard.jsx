import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getDownloadUrl, formatCount, formatDate, PLATFORM_COLORS } from '../utils/api.js';
import LoadingSpinner from './LoadingSpinner.jsx';

function formatFileSize(bytes) {
  if (!bytes) return null;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

export default function ResultCard({ data }) {
  const [activeType, setActiveType] = useState('video');
  const [downloading, setDownloading] = useState(null);
  const [imgError, setImgError] = useState(false);

  const platformColor = PLATFORM_COLORS[data.platform] || '#E50914';

  const handleDownload = async (format) => {
    const key = `${format.ext}-${format.quality}`;
    setDownloading(key);

    toast.loading('Starting download...', { id: 'download', duration: 3000 });

    try {
      const dlUrl = getDownloadUrl(
        data.url,
        activeType,
        format.formatId,
        format.quality
      );

      const link = document.createElement('a');
      link.href = dlUrl;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        toast.dismiss('download');
        toast.success('Download started!');
        setDownloading(null);
      }, 1500);
    } catch (err) {
      toast.dismiss('download');
      toast.error('Download failed. Try again.');
      setDownloading(null);
    }
  };

  const formats = activeType === 'video' ? data.formats.video : data.formats.audio;

  return (
    <div className="glass rounded-2xl overflow-hidden" style={{ borderColor: `${platformColor}22` }}>
      {/* Video preview section */}
      <div className="flex flex-col sm:flex-row gap-5 p-6 pb-4">
        {/* Thumbnail */}
        <div className="sm:w-48 sm:flex-shrink-0">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-[#0d0d14] border border-[#1e1e30]">
            {data.thumbnail && !imgError ? (
              <img
                src={data.thumbnail}
                alt={data.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-10 h-10 text-[#2e2e48]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.867v6.266a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </div>
            )}

            {/* Duration badge */}
            {data.durationFormatted && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-mono">
                {data.durationFormatted}
              </div>
            )}
          </div>
        </div>

        {/* Video info */}
        <div className="flex-1 min-w-0">
          {/* Platform badge */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono mb-2"
            style={{ background: `${platformColor}18`, color: platformColor, border: `1px solid ${platformColor}30` }}
          >
            <span className="w-1 h-1 rounded-full" style={{ background: platformColor }} />
            {data.platform}
          </div>

          <h2 className="font-display font-semibold text-base sm:text-lg leading-snug text-white mb-3 line-clamp-3">
            {data.title}
          </h2>

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 text-xs font-mono text-[#4a4a6a]">
            {data.uploader && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {data.uploader}
              </span>
            )}
            {data.viewCount && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {formatCount(data.viewCount)} views
              </span>
            )}
            {data.uploadDate && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(data.uploadDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Download section */}
      <div className="px-6 pb-6">
        <div className="border-t border-[#1e1e30] pt-5">
          {/* Type tabs */}
          <div className="flex gap-2 mb-5">
            {[
              { key: 'video', label: '📹 Video (MP4)', count: data.formats.video.length },
              { key: 'audio', label: '🎵 Audio (MP3)', count: data.formats.audio.length },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveType(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-display font-medium transition-all duration-200 ${
                  activeType === tab.key
                    ? 'bg-gradient-to-r from-[#E50914] to-[#B20710] text-[#050508]'
                    : 'glass-light text-[#8888aa] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Format options */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeType}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="grid gap-2"
            >
              {formats.map((format, i) => {
                const dlKey = `${format.ext}-${format.quality}`;
                const isDownloading = downloading === dlKey;

                return (
                  <motion.div
                    key={dlKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between glass-light rounded-xl px-4 py-3 group hover:border-[#E50914]/20 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Quality badge */}
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex-shrink-0 ${
                        activeType === 'video'
                          ? 'bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/20'
                          : 'bg-[#B20710]/10 text-[#B20710] border border-[#B20710]/20'
                      }`}>
                        {format.quality}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-display text-white truncate">
                          {format.qualityLabel}
                        </div>
                        <div className="text-xs font-mono text-[#4a4a6a] flex items-center gap-2">
                          {format.filesizeFormatted && <span>{format.filesizeFormatted}</span>}
                          {format.fps && activeType === 'video' && <span>{format.fps}fps</span>}
                          {format.abr && activeType === 'audio' && <span>{Math.round(format.abr)}kbps</span>}
                          {activeType === 'video' && !format.hasAudio && (
                            <span className="text-yellow-500/70">+audio merge</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(format)}
                      disabled={!!downloading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-semibold transition-all ${
                        isDownloading
                          ? 'bg-[#1e1e30] text-[#4a4a6a] cursor-wait'
                          : downloading
                          ? 'opacity-40 cursor-not-allowed glass-light text-[#8888aa]'
                          : 'btn-primary text-[#050508] hover:scale-105'
                      }`}
                    >
                      {isDownloading ? (
                        <>
                          <LoadingSpinner size={14} />
                          <span>Starting</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span className="relative z-10">Download</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
