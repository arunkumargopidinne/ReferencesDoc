import Form from '../components/Form';

export const metadata = { title: 'Interview Prep - Form' };

export default function Page() {
  return (
    <section style={{ padding: '0.25rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#161616' }}>
        Interview Prep Input
      </h1>
      <Form />
    </section>
  );
}
