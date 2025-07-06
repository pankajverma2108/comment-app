// frontend/src/app/login/page.tsx
import LoginForm from '../../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex flex-1 w-full min-h-screen">
      {/* Left: Login Form */}
      <div className="w-1/2 flex items-center justify-center p-10">
        <LoginForm />
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
