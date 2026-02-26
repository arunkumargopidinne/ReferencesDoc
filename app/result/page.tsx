'use client';

import { useInterviewStore } from '../../src/store/useInterviewStore';

export default function Page(){
  const notionUrl = useInterviewStore(s => s.notionUrl);
  const notionPublicUrl = useInterviewStore(s => s.notionPublicUrl);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Result</h1>
      {notionUrl ? (
        <div>
          <p className="mb-2">Notion page created.</p>
          {notionPublicUrl ? (
            <a href={notionPublicUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open Published Link</a>
          ) : (
            <a href={notionUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open Notion Page</a>
          )}
        </div>
      ) : (
        <p>No Notion page URL available.</p>
      )}
    </main>
  );
}
