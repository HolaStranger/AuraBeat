/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#020205',  // Deep Obsidian
          900: '#05050a',  // Midnight
          800: '#0a0a15',  // Ink
          700: '#0f0f1f',
          600: '#141428',
        },
        glass: {
          DEFAULT: 'rgba(0,0,0,0.5)',     // Darker base
          dark: 'rgba(0,0,0,0.7)',        // Heavy dark
          border: 'rgba(255,255,255,0.05)',
          hover: 'rgba(255,255,255,0.05)',
        },
        neon: {
          purple: '#7c3aed',
          pink: '#db2777',
          blue: '#2563eb',
          rock: '#fb923c', // Electric Orange
          glow: '#6366f1',
        },
        muted: '#4b5563',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #8b5cf6, #ec4899)',
        'gradient-card': 'linear-gradient(145deg, rgba(139,92,246,0.1), rgba(236,72,153,0.05))',
        'gradient-bg': 'radial-gradient(ellipse at top left, #1a0a2e 0%, #05050f 50%, #0a021a 100%)',
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.1)',
        'neon-pink': '0 0 20px rgba(236,72,153,0.4)',
        'card': '0 8px 32px rgba(0,0,0,0.4)',
        'glass': 'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
