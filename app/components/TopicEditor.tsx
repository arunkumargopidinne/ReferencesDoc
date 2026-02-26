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
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-xl font-semibold">Review Topics</h2>
      {topics.length === 0 && <div>No topics detected. Return and add input.</div>}
      <ul className="space-y-3">
        {topics.map(t => (
          <li key={t.id} className="p-3 border rounded">
            <input className="w-full" value={t.title} onChange={(e)=>updateTopic(t.id, { title: e.target.value })} />
            <textarea className="w-full mt-2" placeholder="Notes (optional)" value={t.notes || ''} onChange={(e)=>updateTopic(t.id, { notes: e.target.value })} />
          </li>
        ))}
      </ul>
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <button onClick={generate} disabled={loading} className="px-4 py-2 bg-green-600 text-white">{loading ? 'Generating...' : 'Generate Content'}</button>
      </div>
    </div>
  );
}
