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
    <div className="max-w-4xl">
      <h2 className="text-xl font-semibold">Content Preview</h2>
      <div className="mt-4 p-4 border bg-white rounded">
        <pre className="whitespace-pre-wrap">{markdown || 'No content generated yet.'}</pre>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <div className="mt-4">
        <button onClick={publish} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white">{loading ? 'Publishing...' : 'Create Notion Page'}</button>
      </div>
    </div>
  );
}
