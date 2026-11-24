'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import Eagle from '@/components/Eagle';
import Logo from '@/components/Logo';
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

const PRAISE = [
  'Isso aí! Você voa cada vez mais alto! 🦅',
  'Perfeito! Rumo ao Terceirão com você!',
  'Mandou muito bem! Continue assim!',
  'Acertou em cheio! Orgulho da bandeira do Amplação!',
  'Voando alto! Mais um acerto certeiro!',
];
const ENCOURAGE = ['Quase lá! Deixa eu te explicar…', 'Tá chegando perto! Olha só…', 'Faz parte! Bora entender juntas…'];

export default function StudentApp(p: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<'trilha' | 'liga' | 'profs' | 'emblemas' | 'avatar' | 'mural'>('trilha');
  const [stats, setStats] = useState({ xp: 0, gems: 0, streak: 0 });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [curSubject, setCurSubject] = useState<string>('');
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
    const subjList = (subj.data ?? []) as Subject[];
    const order = ['ing', 'mat', 'por', 'geo', 'cie', 'edf'];
    subjList.sort((a, b) => order.indexOf(a.code) - order.indexOf(b.code));
    setSubjects(subjList);
    setCurSubject((c) => c || subjList[0]?.id || '');

    const progMap: Record<string, string> = {};
    (up.data ?? []).forEach((r: any) => (progMap[r.unit_id] = r.status));
    setUnits((un.data ?? []).map((u: any) => ({ ...u, status: progMap[u.id] ?? 'locked' })));

    const tmap: Record<string, string> = {};
    (cst.data ?? []).forEach((r: any) => (tmap[r.subject_id] = r.teacher?.full_name ?? '—'));
    setTeachers(tmap);

    const statsIds = (cls.data ?? []).map((s: any) => s.id);
    let xpMap: Record<string, number> = {};
    if (statsIds.length) {
      const ss = await supabase.from('student_stats').select('student_id,xp').in('student_id', statsIds);
      (ss.data ?? []).forEach((r: any) => (xpMap[r.student_id] = r.xp));
    }
    setLeaders(
      (cls.data ?? [])
        .map((s: any) => ({ id: s.id, name: s.id === p.profileId ? `${p.nickname || p.fullName} (você)` : s.nickname || s.full_name, xp: xpMap[s.id] ?? 0 }))
        .sort((a, b) => b.xp - a.xp)
    );
    setClassPts(
      (cp.data ?? [])
        .map((r: any) => ({ name: r.classes?.name ?? '?', color: r.classes?.color ?? '#7C3AED', points: r.points }))
        .sort((a, b) => b.points - a.points)
    );
    const rmap: Record<string, number> = {};
    (rl.data ?? []).forEach((r: any) => (rmap[r.subject_id] = r.score));
    setRel(rmap);
    const gotSet = new Set((sb.data ?? []).map((r: any) => r.badge_id));
    setBadges((bd.data ?? []).map((b: any) => ({ ...b, got: gotSet.has(b.id) })));
    setBlog((bl.data ?? []) as any);
  }, [supabase, p.profileId, p.classId, p.fullName, p.nickname]);

  useEffect(() => {
    load();
  }, [load]);

  // ---------- áudio ----------
  const ac = useRef<AudioContext | null>(null);
  const soundOn = useRef(true);
  const audio = () => {
    if (!ac.current) {
      try {
        ac.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {}
    }
    return ac.current;
  };
  const beep = (f: number, dur: number, type: OscillatorType, vol: number, when = 0) => {
    const a = audio();
    if (!a || !soundOn.current) return;
    const t = a.currentTime + when;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start(t);
    o.stop(t + dur);
  };
  const sCorrect = () => {
    beep(660, 0.12, 'sine', 0.2);
    beep(880, 0.16, 'sine', 0.2, 0.1);
    beep(1100, 0.22, 'sine', 0.18, 0.22);
  };
  const sWrong = () => {
    beep(200, 0.18, 'sawtooth', 0.14);
    beep(150, 0.25, 'sawtooth', 0.12, 0.12);
  };
  const sComplete = () => [523, 659, 784, 1046].forEach((f, i) => beep(f, 0.22, 'sine', 0.18, i * 0.12));
  const sClick = () => beep(420, 0.08, 'triangle', 0.1);

  // ---------- confete ----------
  const confetti = () => {
    const cols = ['#7C3AED', '#22C55E', '#FBBF24', '#EC4899', '#3B82F6', '#F97316'];
    for (let i = 0; i < 80; i++) {
      const c = document.createElement('div');
      c.className = 'cft';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = cols[i % cols.length];
      const dur = 1.6 + Math.random() * 1.6;
      c.style.transition = `transform ${dur}s linear, top ${dur}s linear, opacity ${dur}s`;
      document.body.appendChild(c);
      requestAnimationFrame(() => {
        c.style.top = 70 + Math.random() * 25 + 'vh';
        c.style.transform = `translateY(0) rotate(${Math.random() * 720}deg)`;
        c.style.opacity = '0';
      });
      setTimeout(() => c.remove(), dur * 1000 + 200);
    }
  };

  // ---------- quiz ----------
  const subjOf = (id: string) => subjects.find((s) => s.id === id);
  const curSubjObj = subjOf(curSubject);
  const curUnits = units.filter((u) => u.subject_id === curSubject);
  const doneCount = curUnits.filter((u) => u.status === 'done').length;

  async function openUnit(u: Unit) {
    if (u.status === 'locked') {
      sWrong();
      return;
    }
    audio();
    const { data } = await supabase
      .from('questions')
      .select('id,prompt,options,correct_index,explanation')
      .eq('unit_id', u.id)
      .order('order_index');
    const qs = (data ?? []) as Q[];
    if (!qs.length) return;
    setQuiz({ unitId: u.id, subjectId: u.subject_id, color: subjOf(u.subject_id)?.color || '#7C3AED', qs, i: 0, sel: null, phase: 'question', correct: 0, answers: [], lastOk: false, result: null });
  }
  function selectOpt(idx: number) {
    if (quiz.phase !== 'question') return;
    setQuiz({ ...quiz, sel: idx });
    sClick();
  }
  function verify() {
    const q: Q = quiz.qs[quiz.i];
    const ok = quiz.sel === q.correct_index;
    const answers = [...quiz.answers, { question_id: q.id, chosen_index: quiz.sel }];
    if (ok) {
      sCorrect();
      confetti();
    } else sWrong();
    setQuiz({ ...quiz, phase: 'result', lastOk: ok, correct: quiz.correct + (ok ? 1 : 0), answers });
  }
  async function next() {
    if (quiz.i + 1 < quiz.qs.length) {
      setQuiz({ ...quiz, i: quiz.i + 1, sel: null, phase: 'question' });
      return;
    }
    // finaliza
    const { data } = await supabase.rpc('submit_attempt', { p_unit_id: quiz.unitId, p_answers: quiz.answers });
    sComplete();
    confetti();
    setQuiz({ ...quiz, phase: 'summary', result: data });
  }
  async function closeQuiz() {
    setQuiz(null);
    await load();
  }

  // ---------- avatar persist ----------
  const saveTimer = useRef<any>(null);
  function updateAvatar(next: AvatarCfg) {
    setAvatar(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      supabase.from('profiles').update({ avatar: next }).eq('id', p.profileId);
    }, 500);
  }
  function saveNick(v: string) {
    setNick(v);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      supabase.from('profiles').update({ nickname: v }).eq('id', p.profileId);
    }, 600);
  }

  const q: Q | null = quiz && quiz.qs ? quiz.qs[quiz.i] : null;
  const shade = (hex: string, p2: number) => {
    const c = hex.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(c.slice(0, 2), 16) + p2));
    const g = Math.max(0, Math.min(255, parseInt(c.slice(2, 4), 16) + p2));
    const b = Math.max(0, Math.min(255, parseInt(c.slice(4, 6), 16) + p2));
    return `rgb(${r},${g},${b})`;
  };

  const tabs: [typeof tab, string, string][] = [
    ['trilha', '🗺️', 'Trilha'],
    ['liga', '🏆', 'Liga'],
    ['profs', '🤝', 'Profs'],
    ['emblemas', '🏅', 'Emblemas'],
    ['avatar', '🧑‍🚀', 'Avatar'],
    ['mural', '📰', 'Mural'],
  ];

  return (
    <div className="sapp">
      {/* topbar */}
      <header className="tbar">
        <div className="brand"><Logo size={30} /><b>AmplaQuest</b></div>
        <div className="stats">
          <span className="st fire">🔥 {stats.streak}</span>
          <span className="st gem">💎 {stats.gems}</span>
          <span className="st xp">⚡ {stats.xp}</span>
          <div className="sign"><SignOutButton /></div>
        </div>
      </header>

      <main className="scr">
        {/* TRILHA */}
        {tab === 'trilha' && (
          <>
            <div className="subtabs">
              {subjects.map((s) => (
                <button key={s.id} className={'subtab' + (s.id === curSubject ? ' on' : '')}
                  style={s.id === curSubject ? { background: s.color, borderColor: s.color, color: '#fff' } : {}}
                  onClick={() => { setCurSubject(s.id); sClick(); }}>
                  {s.icon} {s.name}
                </button>
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
                  <button
                    className={'node ' + u.status + ' n' + (i % 6)}
                    style={u.status === 'current' ? { background: curSubjObj?.color, boxShadow: `0 7px 0 ${shade(curSubjObj?.color || '#7C3AED', -28)}` } : {}}
                    onClick={() => openUnit(u)}
                  >
                    {u.status === 'locked' ? '🔒' : u.status === 'done' ? '⭐' : (curSubjObj?.icon ?? '▶')}
                    {u.status === 'done' && <span className="ck">✓</span>}
                    {u.status === 'current' && <span className="go">COMEÇAR</span>}
                  </button>
                  <div className="nlabel">{u.title}</div>
                </div>
              ))}
            </div>
            <div className="trail-eagle"><Eagle size={78} /></div>
          </>
        )}

        {/* LIGA */}
        {tab === 'liga' && (
          <>
            <div className="card">
              <h3>🏆 Liga das Turmas — 2º Bimestre</h3>
              <p className="muted small" style={{ margin: '4px 0 16px' }}>Cada tarefa e cada acerto soma para a sua turma.</p>
              <div className="race">
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
            <div className="card">
              <h3>👑 Ranking da sua turma</h3>
              <div className="leads">
                {leaders.map((l, i) => (
                  <div key={l.id} className={'lead' + (l.name.includes('(você)') ? ' me' : '')}>
                    <span className="pos">{['🥇', '🥈', '🥉'][i] || i + 1}</span>
                    <span>{l.name}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--roxo)' }}>⚡ {l.xp}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* PROFS */}
        {tab === 'profs' && (
          <div className="card">
            <h3>🤝 Sua relação com os professores</h3>
            <p className="muted small" style={{ margin: '4px 0 16px' }}>Construída por tarefas entregues, perguntas à Mantovani, conteúdo avançado e acertos.</p>
            <div className="relgrid">
              {subjects.map((s) => {
                const v = rel[s.id] ?? 0;
                return (
                  <div className="rel" key={s.id}>
                    <div className="ring" style={{ background: `conic-gradient(${s.color} ${v}%, var(--line) 0)` }}><i>{s.icon}</i></div>
                    <div><b>{teachers[s.id] || s.name}</b><small className="muted">{s.name} · {v}% de vínculo</small></div>
                    <div className="lvl" style={{ color: s.color }}>{v >= 80 ? 'A' : v >= 60 ? 'B' : v >= 40 ? 'C' : v >= 20 ? 'D' : 'E'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EMBLEMAS */}
        {tab === 'emblemas' && (
          <div className="card">
            <h3>🏅 Seus emblemas</h3>
            <p className="muted small" style={{ margin: '4px 0 16px' }}>Cada conteúdo concluído rende um emblema único.</p>
            <div className="bgrid">
              {badges.map((b) => (
                <div key={b.id} className={'bg' + (b.got ? '' : ' lock')}>
                  <div className="disc" style={{ background: b.color }}>{b.icon}</div>
                  <b>{b.name}</b><small className="muted">{b.got ? b.description : 'bloqueado'}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AVATAR */}
        {tab === 'avatar' && (
          <div className="card">
            <h3>🧑‍🚀 Seu avatar</h3>
            <Avatar3D cfg={avatar} />
            <div className="nametag">{nick ? `"${nick}"` : '🎓'}<small className="muted">{p.fullName} · {p.className}</small></div>
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

        {/* MURAL */}
        {tab === 'mural' && (
          <div className="card">
            <h3>📰 Mural do Amplação</h3>
            <p className="muted small" style={{ margin: '4px 0 16px' }}>Avisos da semana para alunos e famílias.</p>
            {blog.map((b, i) => (
              <div className="post" key={i}><div className="pmeta">{b.tag}</div><h4>{b.title}</h4><p className="muted small">{b.body}</p></div>
            ))}
          </div>
        )}
      </main>

      {/* NAV */}
      <nav className="bnav">
        {tabs.map(([id, ic, lb]) => (
          <button key={id} className={'nav' + (tab === id ? ' on' : '')} onClick={() => { setTab(id); sClick(); }}>
            <span className="ic">{ic}</span>{lb}
          </button>
        ))}
      </nav>

      {/* QUIZ */}
      {quiz && (
        <div className="quiz">
          <div className="qtop">
            <button className="qx" onClick={closeQuiz}>✕</button>
            <div className="qprog"><i style={{ width: `${(quiz.i / quiz.qs.length) * 100}%` }} /></div>
          </div>

          {quiz.phase === 'question' && q && (
            <>
              <div className="qbody">
                <div className="qask"><Eagle size={64} /><div className="qbubble">{q.prompt}</div></div>
                <div className="qopts">
                  {q.options.map((o, i) => (
                    <button key={i} className={'opt' + (quiz.sel === i ? ' sel' : '')} onClick={() => selectOpt(i)}>{o}</button>
                  ))}
                </div>
              </div>
              <div className="qfoot"><button className="btn block lg" disabled={quiz.sel === null} onClick={verify}>Verificar</button></div>
            </>
          )}

          {quiz.phase === 'result' && q && (
            <div className={'qresult ' + (quiz.lastOk ? 'ok' : 'no')}>
              <Eagle size={150} state={quiz.lastOk ? 'celebrate' : 'sad'} />
              <h2 className="rmsg">{quiz.lastOk ? PRAISE[quiz.i % PRAISE.length] : ENCOURAGE[quiz.i % ENCOURAGE.length]}</h2>
              <p className="rname">— Mantovani 🦅</p>
              {!quiz.lastOk && <p className="rexp">{q.explanation}</p>}
              <button className={'btn lg ' + (quiz.lastOk ? '' : 'roxo')} onClick={next}>Continuar</button>
            </div>
          )}

          {quiz.phase === 'summary' && (
            <div className="qresult ok">
              <Eagle size={150} state="celebrate" />
              <h2 className="rmsg">{quiz.result?.passed ? 'Conteúdo concluído! 🎉' : 'Boa tentativa! 💪'}</h2>
              <p className="rname">— Mantovani 🦅</p>
              <div className="sumgrid">
                <div className="sb"><b>+{quiz.result?.xp ?? 0}</b><span>⚡ XP</span></div>
                <div className="sb"><b>{quiz.result?.correct ?? 0}/{quiz.result?.total ?? quiz.qs.length}</b><span>🎯 Acertos</span></div>
                <div className="sb"><b>{quiz.result?.passed ? '+1' : '0'}</b><span>🏅 Conteúdo</span></div>
              </div>
              <button className="btn lg" onClick={closeQuiz}>Continuar</button>
            </div>
          )}
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (<><label className="czl">{label}</label><div className="czrow">{children}</div></>);
}
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button className={'chipc' + (on ? ' on' : '')} onClick={onClick}>{children}</button>;
}

const styles = `
.sapp{min-height:100vh;padding-bottom:84px}
.tbar{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;padding:10px 16px}
.tbar .brand{display:flex;align-items:center;gap:8px}
.tbar .brand b{font-family:var(--display);font-size:18px}
.stats{margin-left:auto;display:flex;align-items:center;gap:12px;font-weight:800;font-size:14px}
.st.fire{color:#F97316}.st.gem{color:var(--azul)}.st.xp{color:var(--roxo)}
.sign{margin-left:4px}
.scr{max-width:760px;margin:0 auto;padding:16px}

.subtabs{display:flex;gap:8px;overflow-x:auto;padding-bottom:10px}
.subtab{flex:0 0 auto;background:#fff;border:1px solid var(--line);border-bottom:3px solid var(--line);border-radius:13px;padding:9px 14px;font-weight:800;font-size:14px;box-shadow:var(--shadow-sm)}
.ubanner{border-radius:16px;padding:16px 18px;color:#fff;display:flex;align-items:center;justify-content:space-between;margin:4px 0 8px;box-shadow:var(--shadow-sm)}
.ubanner b{font-family:var(--display);font-size:18px}.ubanner small{opacity:.9;font-weight:700}
.path{display:flex;flex-direction:column;align-items:center;padding:14px 0}
.nodewrap{display:flex;flex-direction:column;align-items:center}
.node{position:relative;width:78px;height:70px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;border:none;
  background:var(--amarelo);box-shadow:0 7px 0 #d99e12;transition:transform .08s;cursor:pointer}
.node:active{transform:translateY(5px)}
.node.locked{background:#ded8ec;box-shadow:0 7px 0 #cbc3de;color:#fff;cursor:not-allowed}
.node.done{background:var(--amarelo);box-shadow:0 7px 0 #d99e12}
.node .ck{position:absolute;bottom:-3px;right:-3px;background:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--verde-esc);border:2px solid var(--verde)}
.node .go{position:absolute;top:-32px;left:50%;transform:translateX(-50%);background:#fff;color:var(--roxo);font-size:10px;font-weight:900;padding:4px 9px;border-radius:8px;box-shadow:var(--shadow-sm);white-space:nowrap;animation:bobble 1s ease-in-out infinite}
.nlabel{font-weight:800;font-size:12px;color:#8b84a0;margin:7px 0 16px}
.n0{margin-left:0}.n1{margin-left:110px}.n2{margin-left:55px}.n3{margin-left:-55px}.n4{margin-left:-110px}.n5{margin-left:-55px}
.trail-eagle{position:fixed;right:10px;bottom:92px;z-index:20;filter:drop-shadow(0 6px 6px rgba(91,33,182,.2))}

.race{display:flex;flex-direction:column;gap:14px}
.rrow{display:flex;align-items:center;gap:12px}
.rrow .cl{width:50px;height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-family:var(--display);flex:0 0 auto}
.rrow .bar{flex:1;background:var(--line);border-radius:999px;height:26px;overflow:hidden;position:relative}
.rrow .bar>i{display:block;height:100%;border-radius:999px;transition:width 1s cubic-bezier(.2,.8,.2,1)}
.rrow .bar>span{position:absolute;right:10px;top:50%;transform:translateY(-50%);font-weight:900;font-size:12px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.3)}
.leads{display:flex;flex-direction:column;gap:8px}
.lead{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;background:var(--paper);font-weight:800}
.lead .pos{width:26px;text-align:center;font-family:var(--display)}
.lead.me{background:var(--roxo-bg);border:2px solid var(--roxo)}

.relgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
@media(max-width:560px){.relgrid{grid-template-columns:1fr}}
.rel{display:flex;gap:12px;align-items:center;background:var(--paper);border-radius:14px;padding:12px}
.ring{width:54px;height:54px;border-radius:50%;flex:0 0 auto;display:flex;align-items:center;justify-content:center}
.ring>i{width:40px;height:40px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:20px}
.rel b{font-size:14px;display:block}.rel small{display:block;font-size:11px}
.rel .lvl{margin-left:auto;font-weight:900;font-family:var(--display)}

.bgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.bg{text-align:center;background:var(--paper);border-radius:16px;padding:16px 8px}
.bg.lock{filter:grayscale(1);opacity:.45}
.bg .disc{width:64px;height:64px;margin:0 auto 6px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;border:3px solid #fff;box-shadow:0 0 0 3px rgba(0,0,0,.06)}
.bg b{font-size:12px;display:block;font-family:var(--display)}.bg small{font-size:10px}

.nametag{text-align:center;font-family:var(--display);font-size:20px;margin-top:8px}
.nametag small{display:block;font-size:12px;font-family:var(--font)}
.czl{display:block;font-weight:900;font-size:12px;text-transform:uppercase;color:var(--ink-soft);margin:12px 0 5px;letter-spacing:.4px}
.czrow{display:flex;gap:8px;flex-wrap:wrap}
.inp{width:100%;border:2px solid var(--line);border-radius:12px;padding:12px 14px;font-weight:700;font-family:var(--font)}
.inp:focus{outline:none;border-color:var(--roxo)}
.sw{width:34px;height:34px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px var(--line);cursor:pointer}
.sw.on{box-shadow:0 0 0 3px var(--roxo)}
.chipc{padding:8px 14px;border-radius:12px;background:#fff;border:1px solid var(--line);border-bottom:3px solid var(--line);font-weight:800;font-size:13px;box-shadow:var(--shadow-sm)}
.chipc.on{border-color:var(--roxo);background:var(--roxo-bg);color:var(--roxo)}

.post{border-left:4px solid var(--roxo);padding:2px 0 2px 14px;margin-bottom:16px}
.post .pmeta{font-size:11px;color:var(--ink-soft);font-weight:800;text-transform:uppercase}
.post h4{margin:4px 0 6px;font-family:var(--display)}

.bnav{position:fixed;bottom:0;left:0;right:0;z-index:30;background:#fff;border-top:1px solid var(--line);display:flex;justify-content:space-around;padding:6px 4px}
.nav{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:7px 2px;border-radius:12px;color:var(--ink-soft);font-weight:800;font-size:10px}
.nav .ic{font-size:21px}
.nav.on{color:var(--roxo);background:var(--roxo-bg)}

.quiz{position:fixed;inset:0;z-index:100;background:#fff;display:flex;flex-direction:column}
.qtop{display:flex;align-items:center;gap:14px;padding:16px 18px}
.qx{font-size:22px;color:var(--ink-soft);font-weight:900}
.qprog{flex:1;height:16px;background:var(--line);border-radius:999px;overflow:hidden}
.qprog>i{display:block;height:100%;background:var(--verde);border-radius:999px;transition:width .4s}
.qbody{flex:1;overflow-y:auto;padding:6px 20px;max-width:620px;margin:0 auto;width:100%}
.qask{display:flex;gap:12px;align-items:flex-end;margin:10px 0 22px}
.qbubble{background:var(--paper);border:1px solid var(--line);border-radius:16px;border-bottom-left-radius:4px;padding:14px 16px;font-weight:800;font-size:17px}
.qopts{display:flex;flex-direction:column;gap:12px}
.opt{text-align:left;background:#fff;border:1px solid var(--line);border-bottom-width:4px;border-radius:14px;padding:16px 18px;font-weight:800;font-size:16px;transition:.08s}
.opt:active{transform:translateY(2px)}
.opt.sel{border-color:var(--roxo);background:var(--roxo-bg);color:var(--roxo)}
.qfoot{border-top:1px solid var(--line);padding:16px 20px;max-width:620px;margin:0 auto;width:100%}
.qresult{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;gap:6px}
.qresult.ok{background:radial-gradient(circle at 50% 30%,#ECFDF3,#fff)}
.qresult.no{background:radial-gradient(circle at 50% 30%,#FFF1F0,#fff)}
.rmsg{font-family:var(--display);font-size:26px;max-width:460px;margin:10px 0 0}
.qresult.ok .rmsg{color:var(--verde-esc)}.qresult.no .rmsg{color:#b91c1c}
.rname{font-weight:800;color:var(--ink-soft);margin:2px 0 8px}
.rexp{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 16px;font-weight:700;max-width:440px;color:var(--ink)}
.qresult .btn{margin-top:14px}
.sumgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:420px;width:100%;margin:12px 0}
.sb{background:var(--roxo-bg);border-radius:14px;padding:14px}
.sb b{display:block;font-size:24px;font-family:var(--display);color:var(--roxo)}
.sb span{font-size:11px;font-weight:800;color:var(--ink-soft)}
.cft{position:fixed;top:-10px;width:10px;height:14px;border-radius:2px;z-index:120;pointer-events:none}
`;
