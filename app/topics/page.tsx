import TopicEditor from '../components/TopicEditor';

export const metadata = { title: 'Interview Prep - Topics' };

export default function Page(){
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Review Topics</h1>
      <TopicEditor />
    </main>
  );
}
