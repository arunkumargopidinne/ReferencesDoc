"use client";
import { useState } from "react";

export default function QuestionsGenerator() {
  const [company, setCompany] = useState("");
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/generate-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: company, questions }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setMarkdown(data.markdown || '');
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  async function publishToNotion() {
    if (!markdown) return;
    setLoading(true);
    try {
      const res = await fetch('/api/create-notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${company || 'Interview'} - Question Answers`,
          markdown,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      window.open(data.preferredUrl || data.url || '', '_blank');
    } catch (err: any) {
      setError(err.message || 'Failed to publish');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#161616' }}>Question‑Based Generation</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#161616' }}>Company</label>
        <input
          style={{ width: '100%',color:"black", padding: '0.625rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.95rem' }}
          onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(91, 14, 20, 0.1)'}
          onBlur={(e) => e.target.style.boxShadow = 'none'}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company name"
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#161616' }}>Questions (one per line)</label>
        <textarea
          style={{ width: '100%',color:"black", height: '160px', padding: '0.625rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'none' }}
          onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91, 14, 20, 0.1)'}
          onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          placeholder="Paste or type interview questions here"
        />
      </div>
      <div>
        <button
          onClick={generate}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', border: 'none', background: loading ? 'rgba(16, 185, 129, 0.3)' : 'linear-gradient(90deg, #10b981, #059669)', color: '#FEFACD', boxShadow: loading ? 'none' : '0 6px 20px rgba(16,185,129,0.18)', transition: 'all 180ms ease', opacity: loading ? 0.8 : 1 }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)', e.currentTarget.style.boxShadow = '0 18px 48px rgba(16,185,129,0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'none', e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.18)')}
        >
          {loading ? (<><span style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 0 rgba(16,185,129,0.4)', animation: 'pulse 1.6s infinite ease-out' }} /><span>Generating</span><span style={{ display: 'inline-block', marginLeft: '0.4rem', animation: 'dots 1s steps(3,end) infinite' }}>•</span></>) : ('Generate Answers')}
        </button>
      </div>

      {error && <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>}

      {markdown && (
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#161616' }}>Preview</h3>
          <div style={{ marginTop: '0.5rem', padding: '1rem', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', maxHeight: '384px', overflowY: 'auto' }}>
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace', fontSize: '0.875rem', color: '#161616' }}>{markdown}</pre>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <button
              onClick={publishToNotion}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', border: 'none', background: 'linear-gradient(90deg, #F1E194, #fff6d8)', color: '#5B0E14', boxShadow: '0 8px 28px rgba(241,225,148,0.16)', transition: 'all 180ms ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)', e.currentTarget.style.boxShadow = '0 14px 40px rgba(241,225,148,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'none', e.currentTarget.style.boxShadow = '0 8px 28px rgba(241,225,148,0.16)')}
            >
              Create Notion Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
