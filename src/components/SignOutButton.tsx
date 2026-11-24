'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      className="btn ghost sm"
      onClick={async () => {
        await createClient().auth.signOut();
        router.push('/entrar');
        router.refresh();
      }}
    >
      Sair
    </button>
  );
}
