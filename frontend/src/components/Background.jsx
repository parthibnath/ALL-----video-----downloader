import React from 'react';

export default function Background() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Subtle red glow — top left like screenshot */}
      <div className="orb w-[600px] h-[600px] top-[-200px] left-[-150px]"
        style={{ background: 'radial-gradient(circle, rgba(229,9,20,0.08) 0%, transparent 70%)' }} />
      <div className="orb w-[400px] h-[400px] bottom-[10%] right-[-100px]"
        style={{ background: 'radial-gradient(circle, rgba(229,9,20,0.05) 0%, transparent 70%)' }} />
      {/* Pure black vignette matching screenshot */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
    </div>
  );
}
