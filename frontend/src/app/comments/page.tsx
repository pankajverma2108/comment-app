import CommentList from '@/components/CommentList';
import CommentForm from '@/components/CommentForm';

export default function CommentsPage() {
  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Comments</h1>
      <CommentForm />
      <CommentList />
    </main>
  );
}
