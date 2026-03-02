import ContentPreview from '../components/ContentPreview';

export const metadata = { title: 'Interview Prep - Preview' };

export default function Page(){
  return (
    <main style={{ padding: '2rem', minHeight: '100vh', background: 'linear-gradient(180deg, #FEFACD 0%, #fffef6 100%)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#161616' }}>Preview Content</h1>
      <ContentPreview />
    </main>
  );
}
