import Form from '../components/Form';

export const metadata = { title: 'Interview Prep - Form' };

export default function Page(){
  return (
    <main style={{ padding: '2rem', minHeight: '100vh', background: 'linear-gradient(180deg, #FEFACD 0%, #fffef6 100%)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#161616' }}>Interview Prep — Input</h1>
      <Form />
    </main>
  );
}
