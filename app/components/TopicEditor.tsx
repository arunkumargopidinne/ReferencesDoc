'use client'
import { useState } from 'react';
import { useInterviewStore } from '../../src/store/useInterviewStore';
import { useRouter } from 'next/navigation';

export default function TopicEditor(){
  const topics = useInterviewStore(s => s.topics);
  const updateTopic = useInterviewStore(s => s.updateTopic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function generate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // store generated markdown
      useInterviewStore.getState().setGenerated(data.markdown);
      router.push('/preview');
    } catch (err: any) {
      setError(err.message || 'Failed to generate content');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '48rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#161616' }}>Review Topics</h2>
      {topics.length === 0 && <div style={{ color: '#6b6b6b' }}>No topics detected. Return and add input.</div>}
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {topics.map(t => (
          <li key={t.id} style={{ padding: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', background: 'rgba(255,255,255,0.6)' }}>
            <input style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.95rem' }} value={t.title} onChange={(e)=>updateTopic(t.id, { title: e.target.value })} />
            <textarea style={{ width: '100%', marginTop: '0.5rem', padding: '0.625rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'none', minHeight: '80px' }} placeholder="Notes (optional)" value={t.notes || ''} onChange={(e)=>updateTopic(t.id, { notes: e.target.value })} />
          </li>
        ))}
      </ul>
      {error && <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>}
      <div>
        <button onClick={generate} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', border: 'none', background: loading ? 'rgba(16, 185, 129, 0.3)' : 'linear-gradient(90deg, #10b981, #059669)', color: '#FEFACD', boxShadow: loading ? 'none' : '0 6px 20px rgba(16,185,129,0.18)', transition: 'all 180ms ease', opacity: loading ? 0.8 : 1 }} onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)', e.currentTarget.style.boxShadow = '0 18px 48px rgba(16,185,129,0.2)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'none', e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.18)')}>
          {loading ? (<><span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 0 rgba(16,185,129,0.4)', animation: 'pulse 1.6s infinite ease-out' }} /><span>Generating</span><span style={{ display: 'inline-block', marginLeft: '0.4rem', animation: 'dots 1s steps(3,end) infinite' }}>•</span></>) : ('Generate Content')}
        </button>
      </div>
    </div>
  );
}
