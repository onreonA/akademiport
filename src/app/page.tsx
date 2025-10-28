import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Akademi Port
        </h1>
        <p className="text-xl text-muted-foreground">Multi-Program E-İhracat Dönüşüm Platformu</p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/components-demo"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            UI Components Demo
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Giriş Yap
          </Link>
        </div>

        <div className="mt-12 p-6 bg-card rounded-lg border">
          <h2 className="text-2xl font-bold mb-4">🎉 Sprint 3 Tamamlandı!</h2>
          <ul className="space-y-2 text-left max-w-md mx-auto">
            <li>✅ 22 Atom Component</li>
            <li>✅ 5 Molecule Component</li>
            <li>✅ 4 Organism Component</li>
            <li>✅ 3 Layout Template</li>
            <li>✅ Dark Mode Support</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
