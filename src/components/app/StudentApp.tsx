'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import SignOutButton from '@/components/SignOutButton';
import { AvatarCfg, SKINS, HAIRCOLORS, HAIRSTYLES, TOPS, BOTS } from './Avatar3D';

const Avatar3D = dynamic(() => import('./Avatar3D'), { ssr: false });

type Props = {
  profileId: string;
  fullName: string;
  nickname: string | null;
  classId: string;
  className: string;
  avatar: AvatarCfg;
};
type Subject = { id: string; code: string; name: string; icon: string; color: string };
type Unit = { id: string; title: string; order_index: number; subject_id: string; status: string };
type Q = { id: string; prompt: string; options: string[]; correct_index: number; explanation: string };

function Shape({ i }: { i: number }) {
  const p: Record<number, JSX.Element> = {
    0: <path d="M11 2 L20 19 L2 19 Z" fill="#fff" />,
    1: <path d="M11 2 L20 11 L11 20 L2 11 Z" fill="#fff" />,
    2: <circle cx="11" cy="11" r="9" fill="#fff" />,
    3: <rect x="3" y="3" width="16" height="16" rx="2" fill="#fff" />,
  };
  return <svg width="22" height="22" viewBox="0 0 22 22" className="shape">{p[i]}</svg>;
}

const PRAISE = ['Boa!', 'Mandou bem!', 'Acertou em cheio!', 'Perfeito!', 'Voando alto!'];

export default function StudentApp(p: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<'trilha' | 'liga' | 'profs' | 'emblemas' | 'avatar' | 'mural'>('trilha');
  const [stats, setStats] = useState({ xp: 0, gems: 0, streak: 0 });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [curSubject, setCurSubject] = useState('');
  const [teachers, setTeachers] = useState<Record<string, string>>({});
  const [leaders, setLeaders] = useState<{ id: string; name: string; xp: number }[]>([]);
  const [classPts, setClassPts] = useState<{ name: string; color: string; points: number }[]>([]);
  const [rel, setRel] = useState<Record<string, number>>({});
  const [badges, setBadges] = useState<{ id: string; name: string; description: string; icon: string; color: string; got: boolean }[]>([]);
  const [blog, setBlog] = useState<{ tag: string; title: string; body: string }[]>([]);
  const [avatar, setAvatar] = useState<AvatarCfg>(p.avatar);
  const [nick, setNick] = useState(p.nickname ?? '');
  const [quiz, setQuiz] = useState<any>(null);

  const load = useCallback(async () => {
    const [st, subj, un, up, cst, cls, cp, rl, bd, sb, bl] = await Promise.all([
      supabase.from('student_stats').select('xp,gems,streak').eq('student_id', p.profileId).maybeSingle(),
      supabase.from('subjects').select('id,code,name,icon,color'),
      supabase.from('units').select('id,title,order_index,subject_id').eq('class_id', p.classId).eq('bimester', 2).order('order_index'),
      supabase.from('unit_progress').select('unit_id,status').eq('student_id', p.profileId),
      supabase.from('class_subject_teacher').select('subject_id, teacher:teacher_id(full_name)').eq('class_id', p.classId),
      supabase.from('profiles').select('id,full_name,nickname').eq('class_id', p.classId).eq('role', 'student'),
      supabase.from('class_points').select('points, classes(name,color)').eq('bimester', 2),
      supabase.from('student_teacher_relationship').select('subject_id,score').eq('student_id', p.profileId),
      supabase.from('badges').select('id,code,name,description,icon,color'),
      supabase.from('student_badges').select('badge_id').eq('student_id', p.profileId),
      supabase.from('blog_posts').select('tag,title,body').order('published_at', { ascending: false }),
    ]);
    if (st.data) setStats(st.data as any);
    const order = ['ing', 'mat', 'por', 'geo', 'cie', 'edf'];
    const subjList = ((subj.data ?? []) as Subject[]).sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));
    setSubjects(subjList);
    setCurSubject((c) => c || subjList[0]?.id || '');
    const progMap: Record<string, string> = {};
    (up.data ?? []).forEach((r: any) => (progMap[r.unit_id] = r.status));
    setUnits((un.data ?? []).map((u: any) => ({ ...u, status: progMap[u.id] ?? 'locked' })));
    const tmap: Record<string, string> = {};
    (cst.data ?? []).forEach((r: any) => (tmap[r.subject_id] = r.teacher?.full_name ?? '—'));
    setTeachers(tmap);
    const ids = (cls.data ?? []).map((s: any) => s.id);
    const xpMap: Record<string, number> = {};
    if (ids.length) {
      const ss = await supabase.from('student_stats').select('student_id,xp').in('student_id', ids);
      (ss.data ?? []).forEach((r: any) => (xpMap[r.student_id] = r.xp));
    }
    setLeaders((cls.data ?? [])
      .map((s: any) => ({ id: s.id, name: s.id === p.profileId ? `${p.nickname || p.fullName} (você)` : s.nickname || s.full_name, xp: xpMap[s.id] ?? 0 }))
      .sort((a, b) => b.xp - a.xp));
    setClassPts((cp.data ?? []).map((r: any) => ({ name: r.classes?.name ?? '?', color: r.classes?.color ?? '#7C3AED', points: r.points })).sort((a, b) => b.points - a.points));
    const rmap: Record<string, number> = {};
    (rl.data ?? []).forEach((r: any) => (rmap[r.subject_id] = r.score));
    setRel(rmap);
    const got = new Set((sb.data ?? []).map((r: any) => r.badge_id));
    setBadges((bd.data ?? []).map((b: any) => ({ ...b, got: got.has(b.id) })));
    setBlog((bl.data ?? []) as any);
  }, [supabase, p.profileId, p.classId, p.fullName, p.nickname]);

  useEffect(() => { load(); }, [load]);

  // áudio
  const ac = useRef<AudioContext | null>(null);
  const audio = () => { if (!ac.current) { try { ac.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch {} } return ac.current; };
  const beep = (f: number, dur: number, type: OscillatorType, vol: number, when = 0) => {
    const a = audio(); if (!a) return; const t = a.currentTime + when;
    const o = a.createOscillator(); const g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur);
  };
  const sCorrect = () => { beep(660, 0.12, 'sine', 0.2); beep(880, 0.16, 'sine', 0.2, 0.1); beep(1180, 0.22, 'sine', 0.18, 0.22); };
  const sWrong = () => { beep(200, 0.18, 'sawtooth', 0.14); beep(150, 0.25, 'sawtooth', 0.12, 0.12); };
  const sComplete = () => [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.22, 'sine', 0.18, i * 0.12));
  const sTap = () => beep(420, 0.07, 'triangle', 0.09);

  const confetti = () => {
    const cols = ['#7C3AED', '#22C55E', '#FBBF24', '#EC4899', '#3B82F6', '#F97316'];
    for (let i = 0; i < 90; i++) {
      const c = document.createElement('div'); c.className = 'cft'; c.style.left = Math.random() * 100 + 'vw'; c.style.background = cols[i % cols.length];
      const dur = 1.6 + Math.random() * 1.6; c.style.transition = `transform ${dur}s linear, top ${dur}s linear, opacity ${dur}s`;
      document.body.appendChild(c); requestAnimationFrame(() => { c.style.top = 70 + Math.random() * 25 + 'vh'; c.style.transform = `rotate(${Math.random() * 720}deg)`; c.style.opacity = '0'; });
      setTimeout(() => c.remove(), dur * 1000 + 200);
    }
  };

  const subjOf = (id: string) => subjects.find((s) => s.id === id);
  const curSubjObj = subjOf(curSubject);
  const curUnits = units.filter((u) => u.subject_id === curSubject);
  const doneCount = curUnits.filter((u) => u.status === 'done').length;

  async function openUnit(u: Unit) {
    if (u.status === 'locked') { sWrong(); return; }
    audio();
    const { data } = await supabase.from('questions').select('id,prompt,options,correct_index,explanation').eq('unit_id', u.id).order('order_index');
    const qs = (data ?? []) as Q[];
    if (!qs.length) return;
    setQuiz({ unitId: u.id, qs, i: 0, phase: 'question', correct: 0, streak: 0, answers: [], lastOk: false, lastExp: '', result: null });
  }
  function answer(idx: number) {
    if (quiz.phase !== 'question') return;
    const q: Q = quiz.qs[quiz.i];
    const ok = idx === q.correct_index;
    sTap();
    const answers = [...quiz.answers, { question_id: q.id, chosen_index: idx }];
    if (ok) { sCorrect(); confetti(); } else sWrong();
    setQuiz({ ...quiz, phase: 'result', picked: idx, lastOk: ok, lastExp: q.explanation, correctIdx: q.correct_index, correct: quiz.correct + (ok ? 1 : 0), streak: ok ? quiz.streak + 1 : 0, answers });
  }
  async function next() {
    if (quiz.i + 1 < quiz.qs.length) { setQuiz({ ...quiz, i: quiz.i + 1, phase: 'question', picked: null }); return; }
    const { data } = await supabase.rpc('submit_attempt', { p_unit_id: quiz.unitId, p_answers: quiz.answers });
    sComplete(); confetti();
    setQuiz({ ...quiz, phase: 'summary', result: data });
  }
  async function closeQuiz() { setQuiz(null); await load(); }

  const saveTimer = useRef<any>(null);
  function updateAvatar(n: AvatarCfg) { setAvatar(n); clearTimeout(saveTimer.current); saveTimer.current = setTimeout(() => { supabase.from('profiles').update({ avatar: n }).eq('id', p.profileId); }, 500); }
  function saveNick(v: string) { setNick(v); clearTimeout(saveTimer.current); saveTimer.current = setTimeout(() => { supabase.from('profiles').update({ nickname: v }).eq('id', p.profileId); }, 600); }

  const shade = (hex: string, d: number) => { const c = hex.replace('#', ''); const f = (i: number) => Math.max(0, Math.min(255, parseInt(c.slice(i, i + 2), 16) + d)); return `rgb(${f(0)},${f(2)},${f(4)})`; };
  const q: Q | null = quiz?.qs ? quiz.qs[quiz.i] : null;
  const tabs: [typeof tab, string, string][] = [['trilha', '🗺️', 'Trilha'], ['liga', '🏆', 'Liga'], ['profs', '🤝', 'Profs'], ['emblemas', '🏅', 'Emblemas'], ['avatar', '🎮', 'Avatar'], ['mural', '📰', 'Mural']];

  return (
    <div className="arc">
      <header className="arc-top">
        <div className="arc-brand"><img src="/logo.png" alt="" /><span>AmplaQuest</span></div>
        <div className="arc-stats">
          <span className="hud fire">🔥 {stats.streak}</span>
          <span className="hud gem">💎 {stats.gems}</span>
          <span className="hud xp">⚡ {stats.xp}</span>
          <SignOutButton />
        </div>
      </header>

      <main className="arc-scr">
        {tab === 'trilha' && (
          <>
            <div className="subtabs">
              {subjects.map((s) => (
                <button key={s.id} className="subtab" style={s.id === curSubject ? { background: s.color, borderColor: s.color, color: '#fff' } : {}}
                  onClick={() => { setCurSubject(s.id); sTap(); }}>{s.icon} {s.name}</button>
              ))}
            </div>
            {curSubjObj && (
              <div className="ubanner" style={{ background: curSubjObj.color }}>
                <div><small>UNIDADE · 2º BIMESTRE</small><br /><b>{curSubjObj.icon} {curSubjObj.name}</b></div>
                <div style={{ textAlign: 'right' }}><small>com {teachers[curSubject] || '—'}</small><br /><b>{doneCount}/{curUnits.length}</b></div>
              </div>
            )}
            <div className="path">
              {curUnits.map((u, i) => (
                <div key={u.id} className="nodewrap">
                  <button className={'node ' + u.status + ' n' + (i % 6)}
                    style={u.status === 'current' ? { background: curSubjObj?.color, boxShadow: `0 7px 0 ${shade(curSubjObj?.color || '#7C3AED', -34)}` } : {}}
                    onClick={() => openUnit(u)}>
                    {u.status === 'locked' ? '🔒' : u.status === 'done' ? '⭐' : '▶'}
                    {u.status === 'done' && <span className="ck">✓</span>}
                    {u.status === 'current' && <span className="go">JOGAR</span>}
                  </button>
                  <div className="nlabel">{u.title}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'liga' && (
          <>
            <div className="arc-card">
              <h3>🏆 Liga das Turmas — 2º Bimestre</h3>
              <p className="muted small" style={{ margin: '4px 0 16px' }}>Cada acerto soma pontos para a sua turma.</p>
              <div className="race">
                {classPts.map((c, i) => { const max = Math.max(...classPts.map((x) => x.points), 1); return (
                  <div className="rrow" key={c.name}><div className="cl" style={{ background: c.color }}>{c.name}</div>
                    <div className="bar"><i style={{ width: `${(c.points / max) * 100}%`, background: c.color }} /><span>{c.points.toLocaleString('pt-BR')} pts {['🥇', '🥈', '🥉'][i] || ''}</span></div></div>); })}
              </div>
            </div>
            <div className="arc-card"><h3>👑 Ranking da sua turma</h3>
              <div className="leads">{leaders.map((l, i) => (
                <div key={l.id} className={'lead' + (l.name.includes('(você)') ? ' me' : '')}><span className="pos">{['🥇', '🥈', '🥉'][i] || i + 1}</span><span>{l.name}</span><span style={{ marginLeft: 'auto', color: 'var(--roxo)', fontWeight: 800 }}>⚡ {l.xp}</span></div>))}
              </div>
            </div>
          </>
        )}

        {tab === 'profs' && (
          <div className="arc-card"><h3>🤝 Relação com os professores</h3>
            <p className="muted small" style={{ margin: '4px 0 16px' }}>Construída por tarefas, perguntas, conteúdo avançado e acertos.</p>
            <div className="relgrid">{subjects.map((s) => { const v = rel[s.id] ?? 0; return (
              <div className="rel" key={s.id}><div className="ring" style={{ background: `conic-gradient(${s.color} ${v}%, var(--line) 0)` }}><i>{s.icon}</i></div>
                <div><b>{teachers[s.id] || s.name}</b><small className="muted">{s.name} · {v}%</small></div>
                <div className="lvl" style={{ color: s.color }}>{v >= 80 ? 'A' : v >= 60 ? 'B' : v >= 40 ? 'C' : v >= 20 ? 'D' : 'E'}</div></div>); })}
            </div>
          </div>
        )}

        {tab === 'emblemas' && (
          <div className="arc-card"><h3>🏅 Seus emblemas</h3>
            <p className="muted small" style={{ margin: '4px 0 16px' }}>Cada conteúdo concluído rende um emblema único.</p>
            <div className="bgrid">{badges.map((b) => (
              <div key={b.id} className={'bg' + (b.got ? '' : ' lock')}><div className="disc" style={{ background: b.color }}>{b.icon}</div><b>{b.name}</b><small className="muted">{b.got ? b.description : 'bloqueado'}</small></div>))}
            </div>
          </div>
        )}

        {tab === 'avatar' && (
          <div className="arc-card"><h3>🎮 Seu avatar</h3>
            <Avatar3D cfg={avatar} />
            <div className="center" style={{ fontFamily: 'var(--display)', fontSize: 20, marginTop: 8 }}>{nick ? `"${nick}"` : '🎓'}<div className="muted small" style={{ fontFamily: 'var(--font)' }}>{p.fullName} · {p.className}</div></div>
            <label className="czl">Apelido</label>
            <input className="inp" value={nick} onChange={(e) => saveNick(e.target.value)} placeholder="Apelido" />
            <Row label="Tom de pele">{SKINS.map((c, i) => <button key={i} className={'sw' + (avatar.skin === i ? ' on' : '')} style={{ background: c }} onClick={() => updateAvatar({ ...avatar, skin: i })} />)}</Row>
            <Row label="Cabelo">{HAIRSTYLES.map((n, i) => <Chip key={i} on={avatar.hairStyle === i} onClick={() => updateAvatar({ ...avatar, hairStyle: i })}>{n}</Chip>)}</Row>
            <Row label="Cor do cabelo">{HAIRCOLORS.map((c, i) => <button key={i} className={'sw' + (avatar.hairColor === i ? ' on' : '')} style={{ background: c }} onClick={() => updateAvatar({ ...avatar, hairColor: i })} />)}</Row>
            <Row label="Parte de cima">{TOPS.map((t, i) => <Chip key={i} on={avatar.top === i} onClick={() => updateAvatar({ ...avatar, top: i })}>{t.n}</Chip>)}</Row>
            <Row label="Parte de baixo">{BOTS.map((t, i) => <Chip key={i} on={avatar.bot === i} onClick={() => updateAvatar({ ...avatar, bot: i })}>{t.n}</Chip>)}</Row>
            <Row label="Boné">{['Com boné', 'Sem boné'].map((n, i) => <Chip key={i} on={avatar.cap === (i === 0)} onClick={() => updateAvatar({ ...avatar, cap: i === 0 })}>{n}</Chip>)}</Row>
            <Row label="Barba">{['Com barba', 'Sem barba'].map((n, i) => <Chip key={i} on={avatar.beard === (i === 0)} onClick={() => updateAvatar({ ...avatar, beard: i === 0 })}>{n}</Chip>)}</Row>
          </div>
        )}

        {tab === 'mural' && (
          <div className="arc-card"><h3>📰 Mural do Amplação</h3>
            <p className="muted small" style={{ margin: '4px 0 16px' }}>Avisos da semana.</p>
            {blog.map((b, i) => <div className="post" key={i}><div className="pmeta">{b.tag}</div><h4>{b.title}</h4><p className="muted small">{b.body}</p></div>)}
          </div>
        )}
      </main>

      <nav className="bnav">{tabs.map(([id, ic, lb]) => (
        <button key={id} className={'nav' + (tab === id ? ' on' : '')} onClick={() => { setTab(id); sTap(); }}><span className="ic">{ic}</span>{lb}</button>))}
      </nav>

      {quiz && (
        <div className="quiz">
          <div className="qbar">
            <button className="qx" onClick={closeQuiz}>✕</button>
            <div className="qprog"><i style={{ width: `${(quiz.i / quiz.qs.length) * 100}%` }} /></div>
            <div className="qcount">{quiz.i + 1}/{quiz.qs.length}</div>
          </div>
          {quiz.phase === 'question' && q && (
            <div className="qmain">
              <div className="qq">{q.prompt}</div>
              <div className="qgrid">
                {q.options.map((o, i) => (
                  <button key={i} className={'kopt k' + i} onClick={() => answer(i)}><Shape i={i} /><span>{o}</span></button>
                ))}
              </div>
            </div>
          )}
          {quiz.phase === 'result' && q && (
            <div className={'qres ' + (quiz.lastOk ? 'ok' : 'no')}>
              <div style={{ fontSize: 60 }}>{quiz.lastOk ? '🎉' : '💪'}</div>
              <div className="big">{quiz.lastOk ? PRAISE[quiz.i % PRAISE.length] : 'Quase!'}</div>
              {quiz.lastOk ? <div className="pts">+15 XP</div> : <div className="exp">{q.options[quiz.correctIdx]} era a resposta.</div>}
              {!quiz.lastOk && <div className="exp">{quiz.lastExp}</div>}
              {quiz.lastOk && quiz.streak > 1 && <div className="streak">🔥 {quiz.streak} seguidas!</div>}
              <button className="btn-arc" style={{ marginTop: 18, background: '#fff', color: quiz.lastOk ? 'var(--verde)' : '#b01331', boxShadow: '0 6px 0 rgba(0,0,0,.2)' }} onClick={next}>Continuar</button>
            </div>
          )}
          {quiz.phase === 'summary' && (
            <div className="qres ok">
              <div style={{ fontSize: 64 }}>{quiz.result?.passed ? '🏆' : '💪'}</div>
              <div className="big">{quiz.result?.passed ? 'Conteúdo concluído!' : 'Boa tentativa!'}</div>
              <div className="sumgrid">
                <div className="sb"><b>+{quiz.result?.xp ?? 0}</b><span>⚡ XP</span></div>
                <div className="sb"><b>{quiz.result?.correct ?? 0}/{quiz.result?.total ?? quiz.qs.length}</b><span>🎯 ACERTOS</span></div>
                <div className="sb"><b>{quiz.result?.passed ? '+1' : '0'}</b><span>🏅 EMBLEMA</span></div>
              </div>
              <button className="btn-arc" style={{ background: '#fff', color: 'var(--verde)', boxShadow: '0 6px 0 rgba(0,0,0,.2)' }} onClick={closeQuiz}>Continuar</button>
            </div>
          )}
        </div>
      )}

      <style>{`.shape{flex:0 0 auto}`}</style>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (<><label className="czl">{label}</label><div className="czrow">{children}</div></>);
}
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button className={'chipc' + (on ? ' on' : '')} onClick={onClick}>{children}</button>;
}
