'use client'
import { useInterviewStore } from '../../src/store/useInterviewStore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContentPreview(){
  const markdown = useInterviewStore(s => s.generatedMarkdown);
  const companyName = useInterviewStore(s => s.companyName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function publish() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/create-notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `${companyName} - Interview Prep`, markdown }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      useInterviewStore.getState().setNotionPublicUrl(data.publicUrl || '');
      useInterviewStore.getState().setNotionUrl(data.preferredUrl || data.url || data.id || '');
      router.push('/result');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create Notion page');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: '56rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#161616' }}>Content Preview</h2>
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        border: '1px solid rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.6)',
        borderRadius: '8px',
        maxHeight: '24rem',
        overflowY: 'auto',
      }}>
        <pre style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          color: '#161616',
        }}>{markdown || 'No content generated yet.'}</pre>
      </div>
      {error && <div style={{ color: '#dc2626', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</div>}
      <div style={{ marginTop: '1rem' }}>
        <button 
          onClick={publish} 
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.6rem 1rem',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            border: 'none',
            background: 'linear-gradient(90deg, #F1E194, #fff6d8)',
            color: '#5B0E14',
            boxShadow: '0 8px 28px rgba(241,225,148,0.16)',
            transition: 'all 180ms ease',
            opacity: loading ? 0.8 : 1,
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)', e.currentTarget.style.boxShadow = '0 14px 40px rgba(241,225,148,0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none', e.currentTarget.style.boxShadow = '0 8px 28px rgba(241,225,148,0.16)')}
        >
          {loading ? (
            <>
              <span style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#F1E194',
                boxShadow: '0 0 0 0 rgba(241,225,148,0.4)',
                animation: 'pulse 1.6s infinite ease-out',
              }} />
              <span>Publishing</span>
              <span style={{
                display: 'inline-block',
                marginLeft: '0.4rem',
                animation: 'dots 1s steps(3,end) infinite',
              }}>•</span>
            </>
          ) : (
            'Create Notion Page'
          )}
        </button>
      </div>
    </div>
  );
}
