// layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

export const metadata = {
  title: 'Comment App',
  description: 'Nested comments with auth and notifications',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white flex items-stretch">
        {children}
      </body>
    </html>
  );
}
