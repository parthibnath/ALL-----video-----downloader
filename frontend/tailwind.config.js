/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        void: '#000', panel: '#0a0a0a', surface: '#111', border: '#222',
        nf: { red: '#E50914', dark: '#B20710' },
        // legacy aliases
        muted: '#444', soft: '#888',
        neon: { cyan:'#E50914', purple:'#B20710', pink:'#E50914', green:'#22c55e' },
        ig: { pink:'#E50914', purple:'#B20710' },
      },
      boxShadow: {
        nf: '0 4px 0 #7a0008, 0 6px 20px rgba(229,9,20,0.45)',
        ig: '0 4px 20px rgba(229,9,20,0.45)',
        glass: '0 8px 32px rgba(0,0,0,0.5)',
        'neon-cyan': '0 0 20px rgba(229,9,20,0.4)',
        'neon-purple': '0 0 20px rgba(178,7,16,0.4)',
      },
    },
  },
  plugins: [],
};
