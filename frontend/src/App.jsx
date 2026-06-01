import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import DownloadCard from './components/DownloadCard.jsx';
import ResultCard from './components/ResultCard.jsx';
import HistorySection from './components/HistorySection.jsx';
import Footer from './components/Footer.jsx';
import Background from './components/Background.jsx';
import { checkApiStatus, getHistory, addToHistory } from './utils/api.js';

export default function App() {
  const [videoData,  setVideoData]  = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [history,    setHistory]    = useState([]);
  const [apiStatus,  setApiStatus]  = useState(null);
  const [activeTab,  setActiveTab]  = useState('downloader');

  useEffect(() => {
    setHistory(getHistory());
    checkApiStatus().then(setApiStatus);
    const id = setInterval(() => checkApiStatus().then(setApiStatus), 60000);
    return () => clearInterval(id);
  }, []);

  const handleVideoFetched = (data) => {
    setVideoData(data);
    addToHistory({ url: data.url, title: data.title, thumbnail: data.thumbnail, platform: data.platform, duration: data.durationFormatted });
    setHistory(getHistory());
    setActiveTab('downloader');
  };

  const handleHistoryClick = (url) => {
    setActiveTab('downloader');
    setTimeout(() => window.dispatchEvent(new CustomEvent('streamdrop:loadurl', { detail: { url } })), 100);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', overflowX: 'hidden', position: 'relative' }}>
      <Background />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar apiStatus={apiStatus} />

        {/* Tab switcher — matching screenshot pill style */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 28, paddingBottom: 0 }}>
          <div style={{
            display: 'flex', gap: 4, padding: 4,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
          }}>
            {[
              { id: 'downloader', label: '⬇ Downloader' },
              { id: 'history',    label: `🕓 History${history.length > 0 ? ` (${history.length})` : ''}` },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '8px 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600, fontSize: 13, transition: 'all 0.22s',
                  background: activeTab === tab.id
                    ? 'linear-gradient(135deg, #E50914, #B20710)'
                    : 'transparent',
                  color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.4)',
                  boxShadow: activeTab === tab.id ? '0 2px 14px rgba(229,9,20,0.4)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'downloader' ? (
            <motion.div key="dl"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.28 }}
            >
              <Hero />
              <main style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 80px' }}>
                <DownloadCard onFetched={handleVideoFetched} loading={loading} setLoading={setLoading} />
                <AnimatePresence mode="wait">
                  {videoData && !loading && (
                    <motion.div key={videoData.url}
                      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                    >
                      <ResultCard data={videoData} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
            </motion.div>
          ) : (
            <motion.div key="hist"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.28 }}
            >
              <HistorySection history={history} onItemClick={handleHistoryClick} onChange={() => setHistory(getHistory())} />
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </div>
  );
}
