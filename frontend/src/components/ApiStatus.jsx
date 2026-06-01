import React from 'react';

export default function ApiStatus({ status }) {
  if (!status) return null;

  const isOnline = status.status === 'operational';
  const isOffline = status.status === 'offline';

  return (
    <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full ${
      isOnline ? 'text-[#00ff88]' : isOffline ? 'text-[#ff2d78]' : 'text-yellow-400'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${
        isOnline ? 'bg-[#00ff88]' : isOffline ? 'bg-[#ff2d78]' : 'bg-yellow-400'
      } ${isOnline ? 'animate-pulse' : ''}`} />
      {isOnline ? 'API Online' : isOffline ? 'API Offline' : 'Degraded'}
    </div>
  );
}
