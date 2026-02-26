import Form from '../components/Form';

export const metadata = { title: 'Interview Prep - Form' };

export default function Page(){
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Interview Prep — Input</h1>
      <Form />
    </main>
  );
}
