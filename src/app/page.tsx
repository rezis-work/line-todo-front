import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold tracking-tight">Line Todo</h1>
      <p className="text-lg text-muted-foreground">Milestone F0 Baseline Ready.</p>
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Register</Link>
        </Button>
        </div>
    </div>
  );
}
