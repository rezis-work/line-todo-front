'use client';

import { useMeQuery } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  const { data: user } = useMeQuery();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome</h1>
          <p className="mt-2 text-muted-foreground">
            {user
              ? `Hello, ${user.name || user.email}!`
              : 'This is the authenticated shell'}
          </p>
        </div>

        <div className="flex gap-4">
          <Button asChild>
            <Link href="/me">View Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

