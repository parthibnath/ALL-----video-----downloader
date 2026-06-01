import React from 'react';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 40 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Main footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, background: '#E50914',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(229,9,20,0.4)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13 }}>
              ALL VIDEO{' '}
              <span style={{ background:'linear-gradient(135deg,#E50914,#ff4444)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                DOWNLOADER
              </span>
            </span>
          </div>

          {/* Center */}
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', fontFamily: "'JetBrains Mono',monospace" }}>
            Open Source · For personal use only
          </p>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              {
                href: 'https://www.instagram.com/xo_grifin_/',
                title: 'Instagram',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                ),
              },
              {
                href: 'https://github.com/parthibnath',
                title: 'GitHub',
                icon: (
                  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                ),
              },
            ].map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" title={s.title}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color='#E50914'; e.currentTarget.style.borderColor='rgba(229,9,20,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: "'JetBrains Mono',monospace" }}>
            Developed by{' '}
            <a href="https://www.instagram.com/xo_grifin_/" target="_blank" rel="noopener noreferrer"
              style={{ background:'linear-gradient(135deg,#E50914,#ff4444)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontWeight:700, textDecoration:'none' }}>
              Parthib Nath
            </a>
            {' '}· © 2026 All rights reserved Parthib Nath · Only download content you have rights to
          </p>
        </div>
      </div>
    </footer>
  );
}
