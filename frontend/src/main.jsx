import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#13131f',
          color: '#e8e8ff',
          border: '1px solid #1e1e30',
          borderRadius: '12px',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        },
        success: {
          iconTheme: { primary: '#00ff88', secondary: '#13131f' },
        },
        error: {
          iconTheme: { primary: '#ff2d78', secondary: '#13131f' },
        },
      }}
    />
  </React.StrictMode>
);
