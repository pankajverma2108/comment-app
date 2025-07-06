// frontend/src/app/register/page.tsx
import RegisterForm from '../../components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex flex-1 w-full min-h-screen">
      {/* Left: Register Form */}
      <div className="w-1/2 flex items-center justify-center p-10">
        <RegisterForm />
      </div>

      {/* Divider */}
      <div className="w-px bg-white h-[450px] self-center" />

      {/* Right: Title */}
      <div className="w-1/2 flex items-center justify-center p-10">
        <h1 className="text-4xl font-bold text-white">📝 Comment App</h1>
      </div>
    </div>
  );
}
