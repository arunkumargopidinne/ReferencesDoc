import TopicEditor from '../components/TopicEditor';

export const metadata = { title: 'Interview Prep - Topics' };

export default function Page(){
  return (
    <main style={{ padding: '2rem', minHeight: '100vh', color: '#161616', background: 'linear-gradient(180deg, #FEFACD 0%, #fffef6 100%)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#161616' }}>Review Topics</h1>
      <TopicEditor />
    </main>
  );
}
