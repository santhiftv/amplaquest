'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/Logo';
import SignOutButton from '@/components/SignOutButton';

type Props = { profileId: string; fullName: string };

export default function ParentApp(p: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<'notas' | 'profs' | 'turma' | 'mural'>('notas');
  const [child, setChild] = useState<{ id: string; name: string; className: string } | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [rel, setRel] = useState<Record<string, number>>({});
  const [classPts, setClassPts] = useState<{ name: string; color: string; points: number }[]>([]);
  const [stats, setStats] = useState({ xp: 0, streak: 0 });
  const [blog, setBlog] = useState<{ tag: string; title: string; body: string }[]>([]);

  const load = useCallback(async () => {
    const link = await supabase.from('parent_links').select('student_id').eq('parent_id', p.profileId).limit(1).maybeSingle();
    const sid = (link.data as any)?.student_id;
    if (!sid) return;
    const [ch, subj, rl, cp, st, bl] = await Promise.all([
      supabase.from('profiles').select('id, full_name, nickname, class_id, classes(name)').eq('id', sid).single(),
      supabase.from('subjects').select('id,code,name,icon,color'),
      supabase.from('student_teacher_relationship').select('subject_id,score').eq('student_id', sid),
      supabase.from('class_points').select('points, classes(name,color)').eq('bimester', 2),
      supabase.from('student_stats').select('xp,streak').eq('student_id', sid).maybeSingle(),
      supabase.from('blog_posts').select('tag,title,body').order('published_at', { ascending: false }),
    ]);
    const cls = Array.isArray((ch.data as any)?.classes) ? (ch.data as any).classes[0] : (ch.data as any)?.classes;
    setChild({ id: sid, name: (ch.data as any)?.nickname || (ch.data as any)?.full_name || 'Aluno', className: cls?.name ?? '' });
    const order = ['ing', 'mat', 'por', 'geo', 'cie', 'edf'];
    const subjList = (subj.data ?? []).sort((a: any, b: any) => order.indexOf(a.code) - order.indexOf(b.code));
    setSubjects(subjList);
    const rmap: Record<string, number> = {};
    (rl.data ?? []).forEach((r: any) => (rmap[r.subject_id] = r.score));
    setRel(rmap);
    setClassPts((cp.data ?? []).map((r: any) => ({ name: r.classes?.name ?? '?', color: r.classes?.color ?? '#7C3AED', points: r.points })).sort((m: any, n: any) => n.points - m.points));
    if (st.data) setStats(st.data as any);
    setBlog((bl.data ?? []) as any);
    // professores da turma do filho
    if ((ch.data as any)?.class_id) {
      const cst = await supabase.from('class_subject_teacher').select('subject_id, teacher:teacher_id(full_name)').eq('class_id', (ch.data as any).class_id);
      const tmap: Record<string, string> = {};
      (cst.data ?? []).forEach((r: any) => (tmap[r.subject_id] = r.teacher?.full_name ?? '—'));
      setTeachers(tmap);
    }
  }, [supabase, p.profileId]);

  useEffect(() => { load(); }, [load]);

  const nota = (score: number) => (5.5 + (score / 100) * 4.3).toFixed(1);
  const tabs: [typeof tab, string, string][] = [
    ['notas', '📈', 'Notas'],
    ['profs', '🤝', 'Professores'],
    ['turma', '🏆', 'Turma'],
    ['mural', '📰', 'Mural'],
  ];

  return (
    <div className="sapp">
      <header className="tbar">
        <div className="brand"><Logo size={30} /><b>AmplaQuest</b> <span className="pill" style={{ marginLeft: 6 }}>Responsável</span></div>
        <div className="stats"><span className="muted small">{p.fullName}</span><div className="sign"><SignOutButton /></div></div>
      </header>

      <main className="scr">
        <div className="card" style={{ background: 'var(--roxo-bg)', borderColor: '#e3d9fb', display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/logo.png" alt="" style={{ width: 48, height: 48, borderRadius: 12 }} />
          <div>
            <b style={{ fontFamily: 'var(--display)', fontSize: 18 }}>Acompanhando {child?.name ?? '…'}</b>
            <div className="muted small">{child?.className} · ⚡ {stats.xp} XP · 🔥 {stats.streak} dias — visualização apenas</div>
          </div>
        </div>

        {tab === 'notas' && (
          <div className="card">
            <h3>📈 Notas por matéria — 2º Bimestre</h3>
            <p className="muted small" style={{ margin: '4px 0 12px' }}>Estimadas a partir do desempenho na plataforma.</p>
            {subjects.map((s) => {
              const n = nota(rel[s.id] ?? 0);
              return (
                <div key={s.id} className="grow">
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <b style={{ flex: 1, fontSize: 14 }}>{s.name}</b>
                  <span className={'pill ' + (Number(n) >= 7 ? 'g' : '')}>{n}</span>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'profs' && (
          <div className="card">
            <h3>🤝 Progresso com cada professor</h3>
            <div className="relgrid" style={{ marginTop: 12 }}>
              {subjects.map((s) => {
                const v = rel[s.id] ?? 0;
                return (
                  <div className="rel" key={s.id}>
                    <div className="ring" style={{ background: `conic-gradient(${s.color} ${v}%, var(--line) 0)` }}><i>{s.icon}</i></div>
                    <div><b>{teachers[s.id] || s.name}</b><small className="muted">{s.name} · {v}%</small></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'turma' && (
          <div className="card">
            <h3>🏆 Como está a turma</h3>
            <div className="race" style={{ marginTop: 12 }}>
              {classPts.map((c, i) => {
                const max = Math.max(...classPts.map((x) => x.points), 1);
                return (
                  <div className="rrow" key={c.name}>
                    <div className="cl" style={{ background: c.color }}>{c.name}</div>
                    <div className="bar"><i style={{ width: `${(c.points / max) * 100}%`, background: c.color }} /><span>{c.points.toLocaleString('pt-BR')} pts {['🥇', '🥈', '🥉'][i] || ''}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'mural' && (
          <div className="card">
            <h3>📰 Mural do Amplação</h3>
            {blog.map((b, i) => <div className="post" key={i}><div className="pmeta">{b.tag}</div><h4>{b.title}</h4><p className="muted small">{b.body}</p></div>)}
          </div>
        )}
      </main>

      <nav className="bnav">
        {tabs.map(([id, ic, lb]) => (
          <button key={id} className={'nav' + (tab === id ? ' on' : '')} onClick={() => setTab(id)}><span className="ic">{ic}</span>{lb}</button>
        ))}
      </nav>

      <style>{pstyles}</style>
    </div>
  );
}

const pstyles = `
.sapp{min-height:100vh;padding-bottom:84px}
.tbar{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;padding:10px 16px}
.tbar .brand{display:flex;align-items:center;gap:8px}.tbar .brand b{font-family:var(--display);font-size:18px}
.stats{margin-left:auto;display:flex;align-items:center;gap:12px}
.scr{max-width:760px;margin:0 auto;padding:16px}
.grow{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}
.relgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
@media(max-width:560px){.relgrid{grid-template-columns:1fr}}
.rel{display:flex;gap:12px;align-items:center;background:var(--paper);border-radius:14px;padding:12px}
.ring{width:54px;height:54px;border-radius:50%;flex:0 0 auto;display:flex;align-items:center;justify-content:center}
.ring>i{width:40px;height:40px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:20px}
.rel b{font-size:14px;display:block}.rel small{display:block;font-size:11px}
.race{display:flex;flex-direction:column;gap:14px}
.rrow{display:flex;align-items:center;gap:12px}
.rrow .cl{width:50px;height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-family:var(--display);flex:0 0 auto}
.rrow .bar{flex:1;background:var(--line);border-radius:999px;height:26px;overflow:hidden;position:relative}
.rrow .bar>i{display:block;height:100%;border-radius:999px;transition:width 1s cubic-bezier(.2,.8,.2,1)}
.rrow .bar>span{position:absolute;right:10px;top:50%;transform:translateY(-50%);font-weight:900;font-size:12px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.3)}
.post{border-left:4px solid var(--roxo);padding:2px 0 2px 14px;margin-bottom:16px}
.post .pmeta{font-size:11px;color:var(--ink-soft);font-weight:800;text-transform:uppercase}
.post h4{margin:4px 0 6px;font-family:var(--display)}
.bnav{position:fixed;bottom:0;left:0;right:0;z-index:30;background:#fff;border-top:1px solid var(--line);display:flex;justify-content:space-around;padding:6px 4px}
.nav{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:7px 2px;border-radius:12px;color:var(--ink-soft);font-weight:800;font-size:10px}
.nav .ic{font-size:21px}.nav.on{color:var(--roxo);background:var(--roxo-bg)}
`;
