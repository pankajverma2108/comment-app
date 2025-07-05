import Navbar from "./navbar"; 

export const metadata = {
  title: 'Comment App',
  description: 'Nested comments with auth and notifications',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black antialiased">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
