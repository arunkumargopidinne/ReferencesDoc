'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviewStore } from '../../src/store/useInterviewStore';

export default function Form() {
  const router = useRouter();
  const setInput = useInterviewStore((s) => s.setInput);
  const setTopics = useInterviewStore((s) => s.setTopics);

  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [techStack, setTechStack] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStatus('');

    // ✅ Open a tab immediately (prevents popup blocker)
    const newTab = window.open('about:blank', '_blank');
    if (newTab) {
      newTab.document.title = 'Generating Notion Doc…';
      newTab.document.body.innerHTML =
        `<div style="font-family: system-ui; padding: 24px;">
           <h2 style="margin:0 0 8px;">Generating your Notion document…</h2>
           <p style="margin:0; opacity:0.75;">Please keep this tab open.</p>
         </div>`;
    }

    try {
      setStatus('Extracting topics…');

      // 1) Extract topics (UNCHANGED API)
      const resTopics = await fetch('/api/extract-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, jobDescription, techStack }),
      });
      if (!resTopics.ok) throw new Error(await resTopics.text());
      const dataTopics = await resTopics.json();
      const topics = dataTopics.topics || [];
      if (!topics.length) throw new Error('No topics extracted');

      setStatus('Generating content…');

      // 2) Generate content (UNCHANGED API)
      const resContent = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics }),
      });
      if (!resContent.ok) throw new Error(await resContent.text());
      const dataContent = await resContent.json();
      const markdown = dataContent.markdown || '';
      if (!markdown.trim()) throw new Error('No content generated');

      setStatus('Creating Notion page…');

      // 3) Create Notion page (UNCHANGED API)
      const resNotion = await fetch('/api/create-notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `${companyName} - Interview Prep`, markdown }),
      });
      if (!resNotion.ok) throw new Error(await resNotion.text());
      const dataNotion = await resNotion.json();

      const url =
        dataNotion.preferredUrl ||
        dataNotion.url ||
        dataNotion.publicUrl ||
        '';

      if (!url) {
        throw new Error(`Notion URL not returned. Response: ${JSON.stringify(dataNotion)}`);
      }

      // ✅ Navigate the already-opened tab
      if (newTab) newTab.location.href = url;
      else window.location.assign(url); // fallback
    } catch (err: any) {
      if (newTab) newTab.close();
      setError(err?.message || 'Failed to generate Notion page');
    } finally {
      setLoading(false);
      setStatus('');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: '40rem',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#161616' }}>Company</label>
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          style={{
            width: '100%',
            color: '#161616',
            backgroundColor: '#fff',
            padding: '0.625rem',
            borderRadius: '6px',
            border: '1px solid rgba(0,0,0,0.1)',
            fontSize: '0.95rem',
          }}
          placeholder="Acme Corp"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#161616' }}>
          Job description / Questions
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          style={{
            width: '100%',
            height: '144px',
            padding: '0.625rem',
            color: '#161616',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid rgba(0,0,0,0.1)',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            resize: 'none',
          }}
          placeholder="Paste JD or drilldown questions"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#161616' }}>Tech stack</label>
        <input
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          style={{
            width: '100%',
            padding: '0.625rem',
            borderRadius: '6px',
            color: '#161616',
            backgroundColor: '#fff',
            border: '1px solid rgba(0,0,0,0.1)',
            fontSize: '0.95rem',
          }}
          placeholder="React, Node.js, PostgreSQL"
        />
      </div>

      {error && <div style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>}
      {loading && status && <div style={{ color: '#5B0E14', fontSize: '0.875rem' }}>{status}</div>}

      <button
        type="submit"
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
          background: loading ? 'rgba(91,14,20,0.3)' : 'linear-gradient(90deg, #5B0E14, #5F4A8B)',
          color: '#FEFACD',
          opacity: loading ? 0.85 : 1,
        }}
      >
        {loading ? 'Generating Notion Doc…' : 'Generate Notion Doc'}
      </button>
    </form>
  );
}