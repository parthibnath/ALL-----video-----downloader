import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Navbar({ apiStatus }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const isOnline  = apiStatus?.status === 'operational';
  const isOffline = apiStatus?.status === 'offline';

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        transition: 'background 0.3s',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo — matching screenshot exactly */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#E50914',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(229,9,20,0.5)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>
            ALL VIDEO{' '}
            <span style={{ background: 'linear-gradient(135deg,#E50914,#ff4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              DOWNLOADER
            </span>
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Status pill */}
          {apiStatus && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 99,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: 12, color: 'rgba(255,255,255,0.4)',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isOnline ? '#22c55e' : isOffline ? '#E50914' : '#eab308',
                boxShadow: isOnline ? '0 0 6px #22c55e' : isOffline ? '0 0 6px #E50914' : 'none',
                animation: isOnline ? 'pulse 2s infinite' : 'none',
              }} />
              {isOnline ? 'Online' : isOffline ? 'Offline' : 'Degraded'}
            </div>
          )}

          {/* Instagram icon only — no text */}
          <a href="https://www.instagram.com/xo_grifin_/" target="_blank" rel="noopener noreferrer"
            title="Instagram"
            style={{
              width: 36, height: 36, borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#E50914'; e.currentTarget.style.borderColor = 'rgba(229,9,20,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
