import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { removeFromHistory, clearHistory, PLATFORM_COLORS } from '../utils/api.js';

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'Just now';
}

export default function HistorySection({ history, onItemClick, onChange }) {
  const handleClearAll = () => {
    clearHistory();
    onChange();
    toast.success('History cleared');
  };

  const handleRemove = (url) => {
    removeFromHistory(url);
    onChange();
  };

  return (
    <section className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-xl text-white">
          Download History
        </h2>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs font-mono text-[#4a4a6a] hover:text-[#ff2d78] transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-16 text-center"
        >
          <div className="text-4xl mb-4">⏱</div>
          <p className="text-[#4a4a6a] font-mono text-sm">No downloads yet.</p>
          <p className="text-[#2e2e48] font-mono text-xs mt-1">Your history will appear here.</p>
        </motion.div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence initial={false}>
            {history.map((item, i) => {
              const platformColor = PLATFORM_COLORS[item.platform] || '#E50914';
              return (
                <motion.div
                  key={item.url}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="glass rounded-xl p-4 flex items-center gap-4 group hover:border-[#E50914]/20 transition-all cursor-pointer"
                  onClick={() => onItemClick(item.url)}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-10 rounded-lg overflow-hidden bg-[#0d0d14] flex-shrink-0">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#2e2e48]">▶</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display text-white truncate group-hover:text-[#E50914] transition-colors">
                      {item.title || item.url}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.platform && (
                        <span className="text-xs font-mono" style={{ color: platformColor }}>
                          {item.platform}
                        </span>
                      )}
                      {item.duration && (
                        <span className="text-xs font-mono text-[#4a4a6a]">{item.duration}</span>
                      )}
                      <span className="text-xs font-mono text-[#2e2e48]">{timeAgo(item.savedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); handleRemove(item.url); }}
                      className="p-2 text-[#4a4a6a] hover:text-[#ff2d78] transition-colors rounded-lg hover:bg-[#ff2d78]/10"
                      title="Remove from history"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="text-[#E50914] p-2 rounded-lg hover:bg-[#E50914]/10 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
