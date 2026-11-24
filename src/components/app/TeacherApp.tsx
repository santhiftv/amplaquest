'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Logo from '@/components/Logo';
import SignOutButton from '@/components/SignOutButton';

type Props = { profileId: string; fullName: string };
type Assign = { class_id: string; subject_id: string; className: string; classColor: string; subjCode: string; subjName: string; subjIcon: string; subjColor: string };
type GenQ = { prompt: string; options: string[]; correct_index: number; explanation: string };

export default function TeacherApp(p: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<'criar' | 'cronograma' | 'turmas' | 'mural'>('criar');
  const [assigns, setAssigns] = useState<Assign[]>([]);
  const [classPts, setClassPts] = useState<{ name: string; color: string; points: number }[]>([]);
  const [blog, setBlog] = useState<{ id: string; tag: string; title: string; body: string }[]>([]);
  const [schedule, setSchedule] = useState<Record<string, { title: string; order: number }[]>>({});

  // formulário
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [when, setWhen] = useState('');
  const [gen, setGen] = useState<GenQ[] | null>(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    const [a, cp, bl] = await Promise.all([
      supabase.from('class_subject_teacher').select('class_id, subject_id, classes(name,color), subjects(code,name,icon,color)').eq('teacher_id', p.profileId),
      supabase.from('class_points').select('points, classes(name,color)').eq('bimester', 2),
      supabase.from('blog_posts').select('id,tag,title,body').order('published_at', { ascending: false }),
    ]);
    const list: Assign[] = (a.data ?? []).map((r: any) => ({
      class_id: r.class_id, subject_id: r.subject_id,
      className: r.classes?.name ?? '?', classColor: r.classes?.color ?? '#7C3AED',
      subjCode: r.subjects?.code ?? '', subjName: r.subjects?.name ?? '?', subjIcon: r.subjects?.icon ?? '📘', subjColor: r.subjects?.color ?? '#7C3AED',
    }));
    list.sort((x, y) => x.className.localeCompare(y.className) || x.subjName.localeCompare(y.subjName));
    setAssigns(list);
    if (!classId && list[0]) { setClassId(list[0].class_id); setSubjectId(list[0].subject_id); }
    setClassPts((cp.data ?? []).map((r: any) => ({ name: r.classes?.name ?? '?', color: r.classes?.color ?? '#7C3AED', points: r.points })).sort((m: any, n: any) => n.points - m.points));
    setBlog((bl.data ?? []) as any);

    // cronograma: unidades por turma+matéria que ensino
    const classIds = Array.from(new Set(list.map((x) => x.class_id)));
    const subjIds = Array.from(new Set(list.map((x) => x.subject_id)));
    if (classIds.length && subjIds.length) {
      const un = await supabase.from('units').select('title,order_index,class_id,subject_id').in('class_id', classIds).in('subject_id', subjIds).eq('bimester', 2).order('order_index');
      const map: Record<string, { title: string; order: number }[]> = {};
      (un.data ?? []).forEach((u: any) => {
        const key = u.class_id + '|' + u.subject_id;
        (map[key] ||= []).push({ title: u.title, order: u.order_index });
      });
      setSchedule(map);
    }
  }, [supabase, p.profileId, classId]);

  useEffect(() => { load(); }, [load]);

  const classes = useMemo(() => {
    const seen = new Set<string>();
    return assigns.filter((a) => (seen.has(a.class_id) ? false : (seen.add(a.class_id), true)));
  }, [assigns]);
  const subjectsForClass = assigns.filter((a) => a.class_id === classId);

  function generate() {
    const t = title.trim() || 'o conteúdo';
    setGen([
      { prompt: `Sobre "${t}": qual afirmação está correta?`, options: ['Afirmação correta', 'Distrator A', 'Distrator B', 'Distrator C'], correct_index: 0, explanation: `Ponto central de "${t}".` },
      { prompt: `Qual destes NÃO se relaciona a "${t}"?`, options: ['Relacionado', 'Relacionado', 'Não relacionado', 'Relacionado'], correct_index: 2, explanation: `Esse item não faz parte de "${t}".` },
      { prompt: `"${t}" é importante porque…`, options: ['Motivo correto', 'Motivo incorreto', 'Motivo incorreto', 'Motivo incorreto'], correct_index: 0, explanation: `Esse é o objetivo de aprender "${t}".` },
    ]);
  }

  async function publish() {
    if (!classId || !subjectId || !title.trim() || !gen) return;
    const existing = (schedule[classId + '|' + subjectId] ?? []).length;
    const { data: unit, error } = await supabase
      .from('units')
      .insert({ class_id: classId, subject_id: subjectId, title: title.trim(), bimester: 2, order_index: existing, created_by: p.profileId })
      .select('id')
      .single();
    if (error || !unit) { setToast('Erro ao publicar: ' + (error?.message ?? '')); return; }
    await supabase.from('questions').insert(
      gen.map((q, i) => ({ unit_id: unit.id, prompt: q.prompt, options: q.options, correct_index: q.correct_index, explanation: q.explanation, order_index: i, source: 'gerada' }))
    );
    setTitle(''); setWhen(''); setGen(null);
    setToast('📌 Tarefa publicada na trilha da turma!');
    await load();
    setTimeout(() => setToast(''), 2600);
  }

  async function addPost(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as any;
    const tag = form.tag.value.trim();
    const t = form.title.value.trim();
    const body = form.body.value.trim();
    if (!t || !body) return;
    // school_id é inferido pela policy? Não — precisamos do school do professor
    const { data: me } = await supabase.from('profiles').select('school_id').eq('id', p.profileId).single();
    await supabase.from('blog_posts').insert({ school_id: (me as any)?.school_id, author_id: p.profileId, tag, title: t, body });
    form.reset();
    setToast('📰 Aviso publicado no mural!');
    await load();
    setTimeout(() => setToast(''), 2600);
  }

  const tabs: [typeof tab, string, string][] = [
    ['criar', '🧩', 'Tarefas'],
    ['cronograma', '📅', 'Cronograma'],
    ['turmas', '🏆', 'Turmas'],
    ['mural', '📰', 'Mural'],
  ];

  return (
    <div className="sapp">
      <header className="tbar">
        <div className="brand"><Logo size={30} /><b>AmplaQuest</b> <span className="pill" style={{ marginLeft: 6 }}>Professor</span></div>
        <div className="stats"><span className="muted small">{p.fullName}</span><div className="sign"><SignOutButton /></div></div>
      </header>

      <main className="scr">
        {tab === 'criar' && (
          <>
            <div className="card">
              <h3>🧩 Montar tarefas do bimestre</h3>
              <p className="muted small" style={{ margin: '4px 0 12px' }}>Digite o conteúdo que você quer trabalhar. A plataforma gera as perguntas a partir dele. <b>(na versão final, uma IA cria as questões a partir do seu material)</b></p>
              <label className="czl">Turma</label>
              <select className="inp" value={classId} onChange={(e) => { setClassId(e.target.value); const f = assigns.find((a) => a.class_id === e.target.value); setSubjectId(f?.subject_id ?? ''); }}>
                {classes.map((c) => <option key={c.class_id} value={c.class_id}>{c.className}</option>)}
              </select>
              <label className="czl">Matéria</label>
              <select className="inp" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                {subjectsForClass.map((s) => <option key={s.subject_id} value={s.subject_id}>{s.subjIcon} {s.subjName}</option>)}
              </select>
              <label className="czl">Conteúdo / tema da aula</label>
              <input className="inp" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Frações equivalentes" />
              <label className="czl">Dia / semana (ordem cronológica)</label>
              <input className="inp" value={when} onChange={(e) => setWhen(e.target.value)} placeholder="Ex: Semana 3 — Segunda" />
              <button className="btn block" style={{ marginTop: 14 }} onClick={generate}>⚙️ Gerar tarefas</button>
            </div>
            {gen && (
              <div className="card">
                <h3>✨ Perguntas geradas</h3>
                <p className="muted small" style={{ margin: '4px 0 12px' }}>{when || 'sem data'} · {gen.length} perguntas a partir de “{title || 'conteúdo'}”.</p>
                {gen.map((q, i) => (
                  <div key={i} className="genq">
                    <b>{i + 1}. {q.prompt}</b>
                    {q.options.map((o, j) => <div key={j} className={'op' + (j === q.correct_index ? ' ok' : '')}>{String.fromCharCode(65 + j)}) {o} {j === q.correct_index ? '✓' : ''}</div>)}
                  </div>
                ))}
                <button className="btn roxo block" onClick={publish}>📌 Publicar na trilha da turma</button>
              </div>
            )}
          </>
        )}

        {tab === 'cronograma' && (
          <div className="card">
            <h3>📅 Ordem de ensino (cronograma)</h3>
            <p className="muted small" style={{ margin: '4px 0 10px' }}>Cada matéria segue a ordem que você define — um conteúdo após o outro.</p>
            {classes.map((c) => (
              <div key={c.class_id} style={{ marginBottom: 14 }}>
                <b style={{ fontSize: 14 }}>{c.className}</b>
                {assigns.filter((a) => a.class_id === c.class_id).map((a) => (
                  <div key={a.subject_id} style={{ margin: '6px 0' }}>
                    <div className="muted small" style={{ fontWeight: 800 }}>{a.subjIcon} {a.subjName}</div>
                    <div>{(schedule[a.class_id + '|' + a.subject_id] ?? []).map((u, i) => <span className="chipday" key={i}>{u.order + 1}º {u.title}</span>)}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === 'turmas' && (
          <div className="card">
            <h3>🏆 Suas turmas — 2º Bimestre</h3>
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
          <>
            <div className="card">
              <h3>📰 Publicar no mural</h3>
              <form onSubmit={addPost}>
                <label className="czl">Etiqueta</label>
                <input className="inp" name="tag" placeholder="Ex: Quarta · Avisos" />
                <label className="czl">Título</label>
                <input className="inp" name="title" placeholder="Título do aviso" required />
                <label className="czl">Mensagem</label>
                <textarea className="inp" name="body" rows={3} placeholder="Escreva o aviso da semana…" required />
                <button className="btn block" style={{ marginTop: 14 }} type="submit">Publicar aviso</button>
              </form>
            </div>
            <div className="card">
              <h3>Mural da semana</h3>
              {blog.map((b) => <div className="post" key={b.id}><div className="pmeta">{b.tag}</div><h4>{b.title}</h4><p className="muted small">{b.body}</p></div>)}
            </div>
          </>
        )}
      </main>

      <nav className="bnav">
        {tabs.map(([id, ic, lb]) => (
          <button key={id} className={'nav' + (tab === id ? ' on' : '')} onClick={() => setTab(id)}><span className="ic">{ic}</span>{lb}</button>
        ))}
      </nav>

      {toast && <div className="toast">{toast}</div>}

      <style>{tstyles}</style>
    </div>
  );
}

const tstyles = `
.sapp{min-height:100vh;padding-bottom:84px}
.tbar{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;padding:10px 16px}
.tbar .brand{display:flex;align-items:center;gap:8px}.tbar .brand b{font-family:var(--display);font-size:18px}
.stats{margin-left:auto;display:flex;align-items:center;gap:12px}
.scr{max-width:760px;margin:0 auto;padding:16px}
.czl{display:block;font-weight:900;font-size:12px;text-transform:uppercase;color:var(--ink-soft);margin:12px 0 5px;letter-spacing:.4px}
.inp{width:100%;border:2px solid var(--line);border-radius:12px;padding:12px 14px;font-weight:700;font-family:var(--font);background:#fff}
.inp:focus{outline:none;border-color:var(--roxo)}
.genq{background:var(--paper);border-radius:12px;padding:12px;margin-bottom:8px;font-weight:700;font-size:14px}
.genq .op{font-size:13px;color:var(--ink-soft);padding-left:10px;margin-top:2px}
.genq .op.ok{color:var(--verde-esc);font-weight:900}
.chipday{display:inline-block;background:#fff;border:1px solid var(--line);border-radius:10px;padding:6px 10px;font-weight:800;font-size:12px;margin:3px}
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
.toast{position:fixed;left:50%;bottom:100px;transform:translateX(-50%);z-index:60;background:var(--roxo-esc);color:#fff;padding:12px 20px;border-radius:14px;font-weight:800;font-size:14px;box-shadow:var(--shadow)}
.corner-eagle{position:fixed;right:10px;bottom:92px;z-index:20;filter:drop-shadow(0 6px 6px rgba(91,33,182,.2));pointer-events:none}
`;
