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
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setInput({ companyName, jobDescription, techStack });

    try {
      const res = await fetch('/api/extract-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, jobDescription, techStack }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // expect data.topics as Array<{id,title}>
      setTopics(data.topics || []);
      router.push('/topics');
    } catch (err: any) {
      setError(err.message || 'Failed to extract topics');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-medium">Company</label>
        <input value={companyName} onChange={(e)=>setCompanyName(e.target.value)} className="mt-1 block w-full" placeholder="Acme Corp"/>
      </div>
      <div>
        <label className="block text-sm font-medium">Job description / Questions</label>
        <textarea value={jobDescription} onChange={(e)=>setJobDescription(e.target.value)} className="mt-1 block w-full h-36" placeholder="Paste JD or questions" />
      </div>
      <div>
        <label className="block text-sm font-medium">Tech stack</label>
        <input value={techStack} onChange={(e)=>setTechStack(e.target.value)} className="mt-1 block w-full" placeholder="React, Node.js, PostgreSQL"/>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <div>
        <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white">{loading ? 'Analyzing...' : 'Extract Topics'}</button>
      </div>
    </form>
  );
}
