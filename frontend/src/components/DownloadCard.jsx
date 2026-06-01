import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchVideoInfo, PLATFORM_COLORS } from '../utils/api.js';
import LoadingSpinner from './LoadingSpinner.jsx';

function detectPlatformFromUrl(url) {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    const map = {
      'youtube.com':'YouTube','youtu.be':'YouTube','twitter.com':'Twitter/X',
      'x.com':'Twitter/X','instagram.com':'Instagram','tiktok.com':'TikTok',
      'facebook.com':'Facebook','vimeo.com':'Vimeo','twitch.tv':'Twitch',
      'reddit.com':'Reddit','soundcloud.com':'SoundCloud','dailymotion.com':'Dailymotion',
    };
    return map[host] || null;
  } catch { return null; }
}

const MSGS = ['Fetching video info...','Analyzing formats...','Extracting metadata...','Almost there...'];

export default function DownloadCard({ onFetched, loading, setLoading }) {
  const [url, setUrl]                       = useState('');
  const [detectedPlatform, setDP]           = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const inputRef   = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const h = e => { setUrl(e.detail.url); inputRef.current?.focus(); };
    window.addEventListener('streamdrop:loadurl', h);
    return () => window.removeEventListener('streamdrop:loadurl', h);
  }, []);

  useEffect(() => { setDP(url ? detectPlatformFromUrl(url) : null); }, [url]);

  const startMsgs = () => {
    let i = 0; setLoadingMessage(MSGS[0]);
    intervalRef.current = setInterval(() => { i = (i+1)%MSGS.length; setLoadingMessage(MSGS[i]); }, 2500);
  };
  const stopMsgs = () => { clearInterval(intervalRef.current); setLoadingMessage(''); };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const t = url.trim();
    if (!t) { toast.error('Please paste a video URL'); inputRef.current?.focus(); return; }
    setLoading(true); startMsgs();
    try {
      const data = await fetchVideoInfo(t);
      onFetched(data);
      toast.success('Video info fetched!');
    } catch (err) {
      toast.error(err.message || 'Failed to fetch video info');
    } finally { setLoading(false); stopMsgs(); }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.startsWith('http')) { setUrl(text.trim()); toast.success('URL pasted!', { duration: 1400 }); }
    } catch { inputRef.current?.focus(); }
  };

  const pColor = detectedPlatform ? PLATFORM_COLORS[detectedPlatform] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.55 }}
      style={{
        /* Dark card matching screenshot — slightly warm dark with red tint */
        background: 'linear-gradient(135deg, rgba(30,8,8,0.85) 0%, rgba(20,5,5,0.9) 100%)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${pColor ? pColor+'33' : 'rgba(229,9,20,0.18)'}`,
        borderRadius: 18,
        padding: '28px 28px 22px',
        marginBottom: 20,
        boxShadow: '0 4px 40px rgba(229,9,20,0.08)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Top red glow line — visible in screenshot */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(229,9,20,0.5), transparent)',
      }} />

      {/* Platform badge */}
      <AnimatePresence>
        {detectedPlatform && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} style={{ marginBottom: 14 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '5px 12px', borderRadius: 99, fontSize: 11,
              fontFamily: "'JetBrains Mono',monospace",
              background: `${pColor}15`, border: `1px solid ${pColor}30`, color: pColor,
            }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:pColor, animation:'pulse 2s infinite', display:'inline-block' }} />
              {detectedPlatform} detected
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label */}
      <div style={{ fontSize: 10, fontFamily:"'JetBrains Mono',monospace", letterSpacing: 2.5, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom: 12 }}>
        Video URL
      </div>

      {/* Input row */}
      <div style={{ display:'flex', gap:10, alignItems:'stretch', flexWrap:'wrap' }}>
        <div style={{ flex:1, position:'relative', minWidth: 200 }}>
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="https://youtube.com/watch?v=..."
            disabled={loading}
            style={{
              width: '100%', padding: '13px 48px 13px 16px',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, color: '#fff',
              fontSize: 13, fontFamily:"'JetBrains Mono',monospace",
              outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
              opacity: loading ? 0.5 : 1,
            }}
            onFocus={e => { e.target.style.borderColor='rgba(229,9,20,0.5)'; e.target.style.boxShadow='0 0 0 3px rgba(229,9,20,0.1)'; }}
            onBlur={e  => { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.boxShadow='none'; }}
          />
          {/* Paste icon inside input */}
          <button onClick={handlePaste} disabled={loading}
            style={{
              position:'absolute', right:8, top:'50%', transform:'translateY(-50%)',
              background:'none', border:'none', cursor:'pointer', padding:6,
              color:'rgba(255,255,255,0.3)', transition:'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color='#E50914'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}
            title="Paste"
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
        </div>

        {/* Analyze button — matching screenshot red rounded button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !url.trim()}
          className="btn-holo"
          style={{
            padding: '13px 28px', fontSize: 14, fontFamily:"'Space Grotesk',sans-serif",
            display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap',
            opacity: (loading || !url.trim()) ? 0.55 : 1,
            cursor: (loading || !url.trim()) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <><LoadingSpinner size={15} /><span>Fetching</span></>
          ) : (
            <>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <span>Analyze</span>
            </>
          )}
        </button>
      </div>

      {/* Loading dots */}
      <AnimatePresence>
        {loading && loadingMessage && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ marginTop:14, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', gap:4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width:6, height:6, borderRadius:'50%', background:'#E50914',
                  animation:`bounce 1.4s ease-in-out ${i*0.16}s infinite`,
                }} />
              ))}
            </div>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', fontFamily:"'JetBrains Mono',monospace" }}>{loadingMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint text */}
      {!loading && !url && (
        <p style={{ marginTop:14, fontSize:11, color:'rgba(255,255,255,0.2)', fontFamily:"'JetBrains Mono',monospace", textAlign:'center' }}>
          Supports YouTube, TikTok, Twitter/X, Instagram, Vimeo, Reddit & 1000+ more
        </p>
      )}

      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
    </motion.div>
  );
}
