import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>
        <div className="space-y-4">
          <Button>Sign In</Button>
        </div>
      </div>
    </div>
  );
}

