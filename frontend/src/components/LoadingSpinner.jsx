import React from 'react';

export default function LoadingSpinner({ size = 20, color = '#E50914' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <circle
        cx="12" cy="12" r="10"
        stroke={color}
        strokeOpacity="0.2"
        strokeWidth="2.5"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{
          transformOrigin: '12px 12px',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}
