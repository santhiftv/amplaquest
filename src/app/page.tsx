'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Eagle from '@/components/Eagle';
import Logo from '@/components/Logo';

const Campus3D = dynamic(() => import('@/components/Campus3D'), { ssr: false });

const SUBJECTS = [
  { ic: '🌎', n: 'Inglês', c: '#3B82F6' },
  { ic: '🔢', n: 'Matemática', c: '#7C3AED' },
  { ic: '📖', n: 'Português', c: '#EC4899' },
  { ic: '🗺️', n: 'Geografia', c: '#16A34A' },
  { ic: '🔬', n: 'Ciências', c: '#06B6D4' },
  { ic: '⚽', n: 'Ed. Física', c: '#F97316' },
];
const TEACHERS = [
  { ic: '🌎', n: 'Prof. Helena', s: 'Inglês', c: '#3B82F6' },
  { ic: '🔢', n: 'Prof. Rafael', s: 'Matemática', c: '#7C3AED' },
  { ic: '📖', n: 'Profª Camila', s: 'Português', c: '#EC4899' },
  { ic: '🗺️', n: 'Prof. Diego', s: 'Geografia', c: '#16A34A' },
  { ic: '🔬', n: 'Profª Bianca', s: 'Ciências', c: '#06B6D4' },
  { ic: '⚽', n: 'Prof. Tiago', s: 'Ed. Física', c: '#F97316' },
];
const FEATURES = [
  { ic: '🗺️', t: 'Trilha de conteúdos', d: 'Cada ponto no mapa é uma tarefa. Você avança conforme o bimestre, em ordem cronológica.' },
  { ic: '⚡', t: 'XP & Ofensiva', d: 'Acertou, ganhou XP. Estudou todo dia, manteve a ofensiva acesa. 🔥' },
  { ic: '🏅', t: 'Emblemas', d: 'Terminou um conteúdo? Ganha um emblema exclusivo, estilo escoteiro — nunca repetido.' },
  { ic: '🏆', t: 'Liga das turmas', d: 'Cada aluno soma pontos para a turma. No fim do bimestre, uma turma leva o troféu.' },
  { ic: '🤝', t: 'Relação com o professor', d: 'Tarefas, perguntas à Mantovani e acertos constroem seu vínculo com cada professor.' },
  { ic: '🧑‍🚀', t: 'Avatar 3D', d: 'Monte seu personagem com o uniforme do colégio — do jeitinho dos avatares clássicos.' },
];

export default function Home() {
  const [tour, setTour] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main>
      {/* NAV */}
      <nav className="lpnav">
        <div className="wrap nav-in">
          <Link href="/" className="brand">
            <Logo size={34} />
            <b>AmplaQuest</b>
          </Link>
          <div className="links">
            <a href="#metodo">Metodologia</a>
            <a href="#mascote">Mascote</a>
            <a href="#historia">História</a>
            <a href="#local">Onde fica</a>
            <Link href="/entrar" className="btn sm">Entrar</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="blobs"><i /><i /><i /></div>
        <div className="wrap hero-grid">
          <div className="reveal">
            <span className="pill">🎓 Plataforma oficial · Colégio Amplação · Neoville</span>
            <h1 className="h1">Aprender vira<br /><span className="grad">aventura.</span> Rumo ao Terceirão! 🦅</h1>
            <p className="lead muted">
              O AmplaQuest transforma o conteúdo das aulas numa jornada gamificada: cada tarefa é um
              ponto no mapa, cada acerto vira XP, e as turmas 5ºA, 5ºB e 5ºC competem para ser as
              campeãs do bimestre.
            </p>
            <div className="cta">
              <Link href="/entrar" className="btn lg">Entrar na plataforma</Link>
              <a href="#metodo" className="btn ghost lg">Como funciona</a>
            </div>
          </div>
          <div className="reveal hero-visual">
            <div className="screen-card">
              <div className="screen-top"><span /><span /><span /></div>
              <Campus3D height={320} />
              <div className="screen-foot">
                <span className="muted small">🏫 Campus Neoville · 6.000 m² · arraste para girar</span>
                <button className="btn sm roxo" onClick={() => setTour(true)}>Tour 360°</button>
              </div>
            </div>
            <div className="hero-eagle"><Eagle size={130} /></div>
          </div>
        </div>
      </header>

      {/* FEITO PARA O AMPLAÇÃO */}
      <section className="wrap sec">
        <h2 className="reveal h2 center">Feito sob medida para o Amplação</h2>
        <p className="reveal sub center muted">
          Não é um app genérico. Nasce da proposta <b>Educação 360º</b> do colégio — aluno
          protagonista, metodologias ativas e desenvolvimento socioemocional — com a energia de um jogo.
        </p>
        <div className="grid3">
          {[
            { ic: '🎯', t: 'Aluno protagonista', d: 'O estudante conduz a própria jornada, no seu ritmo, pela trilha de conteúdos.' },
            { ic: '🧩', t: 'Conteúdo do professor', d: 'Cada pergunta do bimestre é moldada a partir do que o professor ensina — na ordem que ele define.' },
            { ic: '💜', t: 'Socioemocional', d: 'Ligas entre turmas, cooperação e autoconfiança: competir junto, celebrar junto.' },
          ].map((f) => (
            <div key={f.t} className="reveal card feat">
              <div className="fic">{f.ic}</div>
              <h4>{f.t}</h4>
              <p className="muted small">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* METODOLOGIA / PROGRESSO */}
      <section id="metodo" className="wrap sec">
        <h2 className="reveal h2 center">Como funciona o progresso</h2>
        <p className="reveal sub center muted">
          Inspirado nas melhores escolas do mundo — a Finlândia é a grande referência do Amplação — e na
          dinâmica viciante dos apps de idiomas.
        </p>
        <div className="grid3">
          {FEATURES.map((f) => (
            <div key={f.t} className="reveal card feat">
              <div className="fic">{f.ic}</div>
              <h4>{f.t}</h4>
              <p className="muted small">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MATÉRIAS */}
      <section className="wrap sec">
        <h2 className="reveal h2 center">Matérias no ar</h2>
        <p className="reveal sub center muted">Começando com as turmas do 5º ano e as disciplinas principais.</p>
        <div className="reveal chips">
          {SUBJECTS.map((s) => (
            <div key={s.n} className="chip" style={{ borderBottomColor: s.c }}>
              <span>{s.ic}</span>{s.n}
            </div>
          ))}
        </div>
      </section>

      {/* PROFESSORES */}
      <section className="wrap sec">
        <h2 className="reveal h2 center">Nossos professores</h2>
        <p className="reveal sub center muted">
          Quem conduz cada matéria. <span className="small">(nomes ilustrativos — ajuste com o time real)</span>
        </p>
        <div className="grid3 teachers">
          {TEACHERS.map((t) => (
            <div key={t.n} className="reveal card tcard">
              <div className="tav" style={{ background: t.c }}>{t.ic}</div>
              <b>{t.n}</b>
              <span className="muted small">{t.s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* MASCOTE */}
      <section id="mascote" className="wrap sec">
        <div className="reveal mascot">
          <div className="mascot-eagle"><Eagle size={190} /></div>
          <div>
            <span className="pill y">🦅 Mascote do Terceirão</span>
            <h2 className="h2" style={{ margin: '12px 0' }}>Conheça a Mantovani</h2>
            <p className="muted">
              A águia é o símbolo do <b>Terceirão</b> — o grande objetivo da jornada. A Mantovani
              acompanha o aluno em cada pergunta, como se fosse ela quem está perguntando.
            </p>
            <p className="muted" style={{ marginTop: 10 }}>
              Quando o aluno erra, ela explica com calma. Quando acerta, ela comemora no meio da tela,
              com confete e cores. E a cada avanço com um professor, é ela quem traz o aviso. 🪽
            </p>
          </div>
        </div>
      </section>

      {/* HISTÓRIA */}
      <section id="historia" className="wrap sec">
        <h2 className="reveal h2 center">A história do Amplação</h2>
        <p className="reveal sub center muted">De uma sede enxuta na Cidade Industrial a um campus referência nacional.</p>
        <div className="grid2">
          <div className="reveal timeline">
            {[
              ['O começo', 'O Grupo Educacional Amplação nasce em Curitiba sob a direção de Gisele Mantovani Pinheiro, com uma primeira sede na região da Cidade Industrial (CIC).'],
              ['A mudança', 'Para crescer sem perder a essência, o colégio projeta uma nova casa no bairro planejado Neoville — pensada do zero para a Educação 360º.'],
              ['Hoje', 'Mais de 6.000 m² de inovação, salas 360º sem fileiras, Minicidade com Mini Prefeitura e capacidade para cerca de 1.500 estudantes.'],
              ['Amanhã', 'O AmplaQuest: levar essa inovação para a tela, acompanhando cada aluno rumo ao Terceirão.'],
            ].map(([t, d]) => (
              <div key={t} className="tl">
                <b>{t}</b>
                <p className="muted small">{d}</p>
              </div>
            ))}
          </div>
          <div className="reveal card">
            <h3>🏛️ A sede antiga</h3>
            <p className="muted small" style={{ marginTop: 8 }}>
              A memória da primeira sede, na Cidade Industrial, faz parte da identidade do colégio — foi
              onde a pedagogia da escuta começou a ser construída, antes do salto para o campus de Neoville.
            </p>
            <p className="pill" style={{ marginTop: 14 }}>💡 Espaço pronto para você completar com datas e fotos reais</p>
          </div>
        </div>
      </section>

      {/* LOCAL */}
      <section id="local" className="wrap sec">
        <h2 className="reveal h2 center">Onde estamos</h2>
        <p className="reveal sub center muted">Campus Neoville — pertinho da Cidade Industrial de Curitiba.</p>
        <div className="reveal map">
          <div className="map-pin">
            <div className="float" style={{ fontSize: 46 }}>📍</div>
            <div className="map-card">🏫 Colégio Amplação<br /><span className="muted small">Bairro Neoville · Curitiba/PR</span></div>
          </div>
          <a className="btn roxo" target="_blank" rel="noopener"
            href="https://www.google.com/maps/search/Col%C3%A9gio+Amplac%C3%A3o+Neoville+Curitiba">
            🗺️ Abrir no Google Maps
          </a>
        </div>
      </section>

      {/* SEGURANÇA */}
      <section className="wrap sec">
        <div className="reveal card" style={{ background: 'var(--roxo-bg)', borderColor: '#e3d9fb' }}>
          <h3>🔒 Segurança e proteção de dados (LGPD)</h3>
          <p className="muted small" style={{ margin: '6px 0 10px' }}>
            Como a plataforma lida com dados de <b>menores de idade</b>, a privacidade é prioridade desde o projeto:
          </p>
          <ul className="muted small" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
            <li>Contas criadas pela escola — sem cadastro aberto</li>
            <li>Logins separados por papel (aluno, professor, responsável) com permissões distintas</li>
            <li>Responsáveis apenas <b>visualizam</b> — nunca respondem ou entregam tarefas pelo aluno</li>
            <li>Dados protegidos por linha (RLS no Supabase) e hospedagem adequada à legislação brasileira</li>
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="foot">
        <div className="wrap">
          <div className="pill" style={{ background: 'rgba(255,255,255,.14)', color: '#fff' }}>🔒 Protegido · LGPD</div>
          <p style={{ marginTop: 12 }}>
            <b>AmplaQuest</b> — plataforma de ensino gamificado criada para o <b>Colégio Amplação</b> · Neoville, Curitiba/PR
          </p>
          <p className="small" style={{ opacity: 0.8 }}>Dados de demonstração fictícios para avaliação das dinâmicas.</p>
        </div>
      </footer>

      {/* MODAL TOUR 360 */}
      {tour && (
        <div className="modal" onClick={() => setTour(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}><Eagle size={110} /></div>
            <h3 className="center">Tour 360° do campus</h3>
            <p className="muted small center">
              O vídeo 360° do colégio entra aqui na versão publicada. Me manda o arquivo do tour (ou o link
              do HuggingFace) que eu ligo o player panorâmico neste espaço.
            </p>
            <button className="btn block" onClick={() => setTour(false)}>Entendi</button>
          </div>
        </div>
      )}

      <style>{`
        .lpnav{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.82);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
        .nav-in{display:flex;align-items:center;gap:18px;padding:12px 22px}
        .brand{display:flex;align-items:center;gap:9px}
        .brand b{font-family:var(--display);font-size:20px;background:linear-gradient(90deg,var(--roxo),var(--verde));-webkit-background-clip:text;background-clip:text;color:transparent}
        .links{margin-left:auto;display:flex;align-items:center;gap:22px;font-weight:700}
        .links a{font-size:14px;color:var(--ink-soft)}
        .links a:hover{color:var(--roxo)}
        @media(max-width:780px){.links a:not(.btn){display:none}}

        .hero{position:relative;overflow:hidden;padding:48px 0 64px}
        .hero-grid{position:relative;z-index:1;display:grid;grid-template-columns:1.05fr .95fr;gap:38px;align-items:center}
        @media(max-width:860px){.hero-grid{grid-template-columns:1fr;text-align:center}}
        .h1{font-size:50px;margin:14px 0 16px}
        @media(max-width:860px){.h1{font-size:38px}}
        .grad{background:linear-gradient(90deg,var(--roxo),var(--verde));-webkit-background-clip:text;background-clip:text;color:transparent}
        .lead{font-size:18px;max-width:540px}
        @media(max-width:860px){.lead{margin-inline:auto}}
        .cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
        @media(max-width:860px){.cta{justify-content:center}}
        .hero-visual{position:relative}
        .screen-card{background:#fff;border:1px solid var(--line);border-radius:22px;box-shadow:var(--shadow);overflow:hidden}
        .screen-top{display:flex;gap:6px;padding:12px 14px;border-bottom:1px solid var(--line)}
        .screen-top span{width:11px;height:11px;border-radius:50%;background:#e3ddf0}
        .screen-top span:nth-child(1){background:#ff5f57}.screen-top span:nth-child(2){background:#febc2e}.screen-top span:nth-child(3){background:#28c840}
        .screen-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-top:1px solid var(--line)}
        .hero-eagle{position:absolute;right:-10px;bottom:-26px;z-index:2;filter:drop-shadow(0 12px 14px rgba(91,33,182,.25))}

        .sec{padding:60px 22px}
        .h2{font-size:34px}
        .sub{max-width:640px;margin:8px auto 34px;font-weight:600}
        .feat .fic{font-size:34px}
        .feat h4{margin:10px 0 6px;font-size:19px}

        .chips{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
        .chip{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--line);border-bottom:4px solid;border-radius:14px;padding:12px 16px;font-weight:800;box-shadow:var(--shadow-sm)}
        .teachers{margin-top:4px}
        .tcard{text-align:center}
        .tav{width:70px;height:70px;border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center;font-size:32px}
        .tcard b{display:block;font-family:var(--display)}

        .mascot{display:grid;grid-template-columns:.8fr 1.2fr;gap:26px;align-items:center;background:linear-gradient(160deg,#F6F2FF,#DCFCE7);border-radius:28px;padding:40px 30px}
        @media(max-width:860px){.mascot{grid-template-columns:1fr;text-align:center}}
        .mascot-eagle{display:flex;justify-content:center}

        .timeline{display:flex;flex-direction:column;gap:18px;border-left:3px solid var(--roxo);padding-left:20px}
        .tl{position:relative}
        .tl::before{content:'';position:absolute;left:-28px;top:4px;width:14px;height:14px;border-radius:50%;background:var(--roxo)}
        .tl b{font-family:var(--display);color:var(--roxo)}

        .map{position:relative;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow-sm);text-align:center;padding:0 0 18px;
          background:repeating-linear-gradient(0deg,#f3fbf5 0 24px,#eafaef 24px 25px),repeating-linear-gradient(90deg,transparent 0 60px,rgba(124,58,237,.06) 60px 61px)}
        .map-pin{height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
        .map-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px 18px;font-weight:800;box-shadow:var(--shadow-sm)}

        .foot{background:var(--roxo-esc);color:#fff;text-align:center;padding:34px 0;margin-top:20px}

        .modal{position:fixed;inset:0;z-index:100;background:rgba(27,20,48,.55);display:flex;align-items:center;justify-content:center;padding:22px}
        .modal-card{background:#fff;border-radius:22px;padding:24px;max-width:380px;width:100%;box-shadow:var(--shadow);display:flex;flex-direction:column;gap:10px}
      `}</style>
    </main>
  );
}
