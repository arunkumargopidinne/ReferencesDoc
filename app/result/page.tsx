'use client';

import { useInterviewStore } from '../../src/store/useInterviewStore';

export default function Page(){
  const notionUrl = useInterviewStore(s => s.notionUrl);
  const notionPublicUrl = useInterviewStore(s => s.notionPublicUrl);

  return (
    <main style={{ padding: '2rem', minHeight: '100vh', background: 'linear-gradient(180deg, #FEFACD 0%, #fffef6 100%)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#161616' }}>Result</h1>
      {notionUrl ? (
        <div>
          <p style={{ marginBottom: '0.75rem', color: '#161616' }}>Notion page created.</p>
          {notionPublicUrl ? (
            <a 
              href={notionPublicUrl} 
              target="_blank" 
              rel="noreferrer" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'linear-gradient(90deg, #F1E194, #fff6d8)',
                color: '#5B0E14',
                textDecoration: 'none',
                boxShadow: '0 8px 28px rgba(241,225,148,0.16)',
                transition: 'all 180ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)', e.currentTarget.style.boxShadow = '0 14px 40px rgba(241,225,148,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none', e.currentTarget.style.boxShadow = '0 8px 28px rgba(241,225,148,0.16)')}
            >
              Open Published Link
            </a>
          ) : (
            <a 
              href={notionUrl} 
              target="_blank" 
              rel="noreferrer" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'linear-gradient(90deg, #F1E194, #fff6d8)',
                color: '#5B0E14',
                textDecoration: 'none',
                boxShadow: '0 8px 28px rgba(241,225,148,0.16)',
                transition: 'all 180ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)', e.currentTarget.style.boxShadow = '0 14px 40px rgba(241,225,148,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none', e.currentTarget.style.boxShadow = '0 8px 28px rgba(241,225,148,0.16)')}
            >
              Open Notion Page
            </a>
          )}
        </div>
      ) : (
        <p style={{ color: '#161616' }}>No Notion page URL available.</p>
      )}
    </main>
  );
}
