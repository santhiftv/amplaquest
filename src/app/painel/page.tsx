import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/SignOutButton';
import Eagle from '@/components/Eagle';
import Logo from '@/components/Logo';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Direção',
  teacher: 'Professor(a)',
  student: 'Aluno(a)',
  parent: 'Responsável',
};

export default async function Painel() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, nickname, role, class_id')
    .eq('auth_user_id', user.id)
    .single();

  return (
    <main style={{ minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderBottom: '1px solid var(--line)' }}>
        <Logo size={30} />
        <b style={{ fontFamily: 'var(--display)' }}>AmplaQuest</b>
        <div style={{ marginLeft: 'auto' }}><SignOutButton /></div>
      </nav>
      <div className="wrap" style={{ padding: '40px 22px', maxWidth: 720 }}>
        <div className="card center" style={{ padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Eagle size={140} /></div>
          <span className="pill" style={{ marginTop: 10 }}>{ROLE_LABEL[profile?.role ?? ''] ?? 'Conta'}</span>
          <h2 style={{ margin: '12px 0 4px' }}>
            Olá, {profile?.nickname || profile?.full_name || 'estudante'}! 🦅
          </h2>
          <p className="muted">
            Seu login está funcionando e conectado ao banco com segurança. As áreas completas
            (trilha, quiz com a Mantovani, liga das turmas, área do professor e dos pais) entram na
            próxima etapa da construção.
          </p>
        </div>
      </div>
    </main>
  );
}
