// frontend/src/components/Alert.tsx
type AlertProps = {
  type?: 'success' | 'error';
  message: string;
};

export default function Alert({ type = 'success', message }: AlertProps) {
  const style = type === 'error'
    ? 'bg-red-100 text-red-700 border border-red-300'
    : 'bg-green-100 text-green-700 border border-green-300';

  return (
    <div className={`p-3 mb-2 rounded text-sm ${style}`}>
      {message}
    </div>
  );
}
