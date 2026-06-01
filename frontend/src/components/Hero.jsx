import React from 'react';
import { motion } from 'framer-motion';

/* Exact platform pills from screenshot with their border colors */
const PLATFORMS = [
  { name: 'YouTube',    color: '#ff0000' },
  { name: 'TikTok',    color: '#69c9d0' },
  { name: 'Instagram', color: '#E1306C' },
  { name: 'Twitter/X', color: '#1d9bf0' },
  { name: 'Vimeo',     color: '#1ab7ea' },
  { name: 'Twitch',    color: '#9146ff' },
  { name: 'Reddit',    color: '#ff4500' },
  { name: 'Facebook',  color: '#1877f2' },
  { name: 'Dailymotion', color: '#0066dc' },
  { name: 'SoundCloud', color: '#ff5500' },
];

export default function Hero() {
  return (
    <section style={{ textAlign: 'center', padding: '60px 20px 16px' }}>
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

        {/* FREE · NO SIGN-IN · 1000+ SITES badge — exactly matching screenshot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '8px 20px', borderRadius: 99, marginBottom: 36,
            background: 'rgba(229,9,20,0.08)',
            border: '1px solid rgba(229,9,20,0.25)',
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600, letterSpacing: 2, color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E50914', boxShadow: '0 0 6px #E50914', display: 'inline-block', flexShrink: 0 }} />
          FREE &nbsp;·&nbsp; NO SIGN-IN &nbsp;·&nbsp; 1000+ SITES
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E50914', boxShadow: '0 0 6px #E50914', display: 'inline-block', flexShrink: 0 }} />
        </motion.div>

        {/* Main heading — EXACT match to screenshot: "ALL VIDEO" white, "DOWNLOADER" red */}
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 900, lineHeight: 0.88, letterSpacing: -2,
          fontSize: 'clamp(64px, 12vw, 120px)',
          marginBottom: 0,
        }}>
          <span style={{ color: '#fff', display: 'block' }}>ALL VIDEO</span>
          <span style={{
            display: 'block',
            background: 'linear-gradient(135deg, #E50914 0%, #ff2222 50%, #c00 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 30px rgba(229,9,20,0.4))',
          }}>
            DOWNLOADER
          </span>
        </h1>

        {/* Divider line — visible in screenshot */}
        <div style={{ width: 180, height: 2, background: 'linear-gradient(90deg, transparent, rgba(229,9,20,0.4), transparent)', margin: '28px auto' }} />

        {/* Subtitle */}
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', maxWidth: 480, margin: '0 auto 44px', lineHeight: 1.6 }}>
          Paste any URL · Get <strong style={{ color: '#fff' }}>MP4 video</strong> or <strong style={{ color: '#fff' }}>MP3 audio</strong> instantly.
          <br />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>No ads. No tracking. No limits.</span>
        </p>

        {/* Platform pills — exact match to screenshot */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, maxWidth: 700, margin: '0 auto' }}>
          {PLATFORMS.map((p, i) => (
            <motion.span key={p.name}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.045 }}
              style={{
                padding: '6px 16px', borderRadius: 99,
                border: `1px solid ${p.color}55`,
                color: p.color,
                fontSize: 12, fontWeight: 500,
                background: `${p.color}0d`,
                cursor: 'default',
                transition: 'all 0.18s',
              }}
            >
              {p.name}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
