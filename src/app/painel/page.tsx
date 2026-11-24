import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/SignOutButton';
import Logo from '@/components/Logo';
import StudentApp from '@/components/app/StudentApp';
import TeacherApp from '@/components/app/TeacherApp';
import ParentApp from '@/components/app/ParentApp';
import type { AvatarCfg } from '@/components/app/Avatar3D';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Direção',
  teacher: 'Professor(a)',
  parent: 'Responsável',
};
const DEFAULT_AVATAR: AvatarCfg = { gender: 'boy', skin: 1, hairColor: 0, top: 0, bot: 0, cap: false, glasses: false };

export default async function Painel() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, nickname, role, class_id, avatar, classes(name)')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile) {
    return (
      <main className="wrap" style={{ padding: 40 }}>
        <div className="card">Perfil não encontrado para esta conta. Fale com a secretaria do colégio.</div>
      </main>
    );
  }

  if (profile.role === 'student') {
    const cls = Array.isArray(profile.classes) ? profile.classes[0] : profile.classes;
    return (
      <StudentApp
        profileId={profile.id}
        fullName={profile.full_name}
        nickname={profile.nickname}
        classId={profile.class_id as string}
        className={(cls as any)?.name ?? ''}
        avatar={{ ...DEFAULT_AVATAR, ...((profile.avatar as any) || {}) }}
      />
    );
  }

  if (profile.role === 'teacher') {
    return <TeacherApp profileId={profile.id} fullName={profile.full_name} />;
  }
  if (profile.role === 'parent') {
    return <ParentApp profileId={profile.id} fullName={profile.full_name} />;
  }

  // direção (admin) — painel de gestão na próxima etapa
  return (
    <main style={{ minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderBottom: '1px solid var(--line)' }}>
        <Logo size={30} />
        <b style={{ fontFamily: 'var(--display)' }}>AmplaQuest</b>
        <div style={{ marginLeft: 'auto' }}><SignOutButton /></div>
      </nav>
      <div className="wrap" style={{ padding: '40px 22px', maxWidth: 720 }}>
        <div className="card center" style={{ padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}><img src="/logo.png" alt="" style={{ width: 72, height: 72, borderRadius: 16 }} /></div>
          <span className="pill" style={{ marginTop: 10 }}>{ROLE_LABEL[profile.role] ?? 'Conta'}</span>
          <h2 style={{ margin: '12px 0 4px' }}>Olá, {profile.nickname || profile.full_name}! 🦅</h2>
          <p className="muted">
            Seu acesso de {ROLE_LABEL[profile.role]?.toLowerCase()} está ativo e seguro. A área completa
            ({profile.role === 'teacher' ? 'criar conteúdos e gerar tarefas' : profile.role === 'parent' ? 'acompanhar notas e progresso' : 'gestão da escola'})
            entra na próxima etapa da construção.
          </p>
        </div>
      </div>
    </main>
  );
}
