import ContentPreview from '../components/ContentPreview';

export const metadata = { title: 'Interview Prep - Preview' };

export default function Page(){
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Preview Content</h1>
      <ContentPreview />
    </main>
  );
}
