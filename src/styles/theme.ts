// Theme constants for the entire application
export const theme = {
  colors: {
    maroon: '#5B0E14',
    gold: '#F1E194',
    cream: '#FEFACD',
    purple: '#5F4A8B',
    darkBg: '#161616',
    lightBg: '#fffef6',
    muted: '#6b6b6b',
    text: '#161616',
    textLight: '#f3f3f6',
    error: '#dc2626',
    success: '#16a34a',
  },
  gradients: {
    backgroundLight: 'linear-gradient(180deg, #FEFACD 0%, #fffef6 100%)',
    backgroundDark: 'linear-gradient(180deg, #07060a 0%, #0b0a10 100%)',
    btnPrimary: 'linear-gradient(90deg, #5B0E14, #5F4A8B)',
    btnNotion: 'linear-gradient(90deg, #F1E194, #fff6d8)',
    linkUnderline: 'linear-gradient(90deg, #F1E194, #5B0E14)',
    sidebarActive: 'linear-gradient(90deg, rgba(95,74,139,0.08), rgba(91,14,20,0.04))',
  },
  glass: {
    light: 'rgba(255,255,255,0.6)',
    strong: 'rgba(255,255,255,0.9)',
    dark: 'rgba(15,12,20,0.6)',
    darkStrong: 'rgba(20,18,28,0.85)',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  radius: '12px',
  transitions: {
    fast: '180ms',
    medium: '320ms',
    slow: '500ms',
  },
  shadows: {
    card: '0 6px 24px rgba(15,15,20,0.08)',
    cardHover: '0 14px 40px rgba(15,15,20,0.12)',
    btnPrimary: '0 6px 20px rgba(91,14,20,0.18)',
    btnPrimaryHover: '0 18px 48px rgba(91,14,20,0.2)',
    btnNotion: '0 8px 28px rgba(241,225,148,0.16)',
  },
};

export const keyframes = {
  spin: `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `,
  pulse: `
    @keyframes pulse {
      0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(91,14,20,0.35); }
      70% { transform: scale(1.8); box-shadow: 0 0 0 12px rgba(241,225,148,0.06); }
      100% { transform: scale(1.0); box-shadow: 0 0 0 0 rgba(91,14,20,0); }
    }
  `,
  dots: `
    @keyframes dots {
      0% { content: '•'; }
      33% { content: '••'; }
      66% { content: '•••'; }
    }
  `,
  shimmer: `
    @keyframes shimmer {
      to { left: 120%; }
    }
  `,
};
