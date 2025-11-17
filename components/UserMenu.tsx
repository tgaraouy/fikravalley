'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function UserMenu() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div className="h-10 w-20 animate-pulse rounded bg-slate-200" />;
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Connexion</Link>
        </Button>
        <Button variant="primary" size="sm" asChild>
          <Link href="/signup">Inscription</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600">{user.email}</span>
      <Button variant="ghost" size="sm" onClick={signOut}>
        Déconnexion
      </Button>
    </div>
  );
}

