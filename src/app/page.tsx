'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const SITE = 'https://www.colegioamplacao.com.br';
const SLIDES = [
  `${SITE}/tim.php?src=uploads/slides/2022/02/nosso-mundo-gira-em-torno-de-educar-mentes-e-emocoes.jpg&w=2880&h=1200`,
  `${SITE}/tim.php?src=uploads/slides/2022/02/o-que-ha-tempos-construimos-com-inovacao-na-pandemia-se-destacou-como-solucao.jpg&w=2880&h=1200`,
  `${SITE}/tim.php?src=uploads/slides/2022/02/enquanto-os-olhares-se-voltam-para-o-novo-nos-continuaremos-enxergando-alem.jpg&w=2880&h=1200`,
];
const ESSENCIA = `${SITE}/uploads/pages/2026/03/colegio-amplacao-1774634417.jpg`;

const DIFERENCIAIS = [
  { ic: '🎯', t: 'Metodologias ativas', d: 'O aluno protagonista, posicionando-se diante de desafios reais da vida.' },
  { ic: '🌎', t: 'Ensino bilíngue integral', d: 'Imersão no inglês ao longo de todo o dia, de forma natural e significativa.' },
  { ic: '💜', t: 'Socioemocional', d: 'Mindfulness, empatia e resiliência como pilares da formação do ser.' },
  { ic: '🪑', t: 'Salas 360º', d: 'Mobiliário dinâmico e adaptável, sem carteiras enfileiradas nem hierarquia.' },
  { ic: '🏙️', t: 'Minicidade', d: 'Espaço vivencial com Mini Prefeitura para aprender cidadania na prática.' },
  { ic: '🚀', t: 'EmpreenSER & AmplaQuest', d: 'Mentalidade empreendedora e o portal gamificado de aprendizagem.' },
];

export default function Home() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add('in')),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
    return () => {
      io.disconnect();
      clearInterval(t);
    };
  }, []);

  return (
    <main>
      {/* NAV */}
      <nav className="lpnav">
        <div className="wrap nav-in">
          <Link href="/" className="brand">
            <img src="/logo.png" alt="Colégio Amplação" />
            <b>Colégio Amplação</b>
          </Link>
          <div className="links">
            <a href="#essencia">A escola</a>
            <a href="#metodo">Metodologia</a>
            <a href="#estrutura">Estrutura</a>
            <a href="#contato">Contato</a>
            <Link href="/entrar" className="btn verde sm">Portal do Aluno</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        {SLIDES.map((s, i) => (
          <img key={i} src={s} alt="Colégio Amplação" referrerPolicy="no-referrer"
            className={'hero-img' + (i === slide ? ' on' : '')} />
        ))}
        <div className="hero-ov" />
        <div className="wrap hero-in reveal">
          <span className="pill" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>
            Bairro Neoville · Curitiba/PR
          </span>
          <h1>Uma educação que<br />forma protagonistas.</h1>
          <p>
            Escola bilíngue integral, referência em Curitiba na <b>Educação 360º</b> — metodologias
            ativas, desenvolvimento socioemocional e mais de 6.000 m² pensados para inspirar.
          </p>
          <div className="hero-cta">
            <a className="btn verde lg" href="#contato">Agende uma visita</a>
            <Link className="btn lg" href="/entrar" style={{ background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(4px)' }}>
              Portal do Aluno →
            </Link>
          </div>
        </div>
      </header>

      {/* STATS */}
      <section className="stats-strip">
        <div className="wrap stats-in">
          {[
            ['6.000 m²', 'de estrutura inovadora'],
            ['~1.500', 'estudantes'],
            ['Bilíngue', 'integral'],
            ['Educação 360º', 'inspirada na Finlândia'],
          ].map(([a, b]) => (
            <div key={a} className="stat"><b>{a}</b><span>{b}</span></div>
          ))}
        </div>
      </section>

      {/* ESSÊNCIA */}
      <section id="essencia" className="wrap sec">
        <div className="grid2 ac">
          <div className="reveal">
            <img className="photo" src={ESSENCIA} alt="Colégio Amplação" referrerPolicy="no-referrer" />
          </div>
          <div className="reveal">
            <span className="pill">Nossa essência</span>
            <h2 className="h2">Inspirar crianças por meio da educação sempre foi, para nós, algo realizador.</h2>
            <p className="muted">
              No Colégio Amplação, cada criança é vista como protagonista da própria história. Acreditamos
              numa educação mais humana, colaborativa e participativa — que vai além de notas e conteúdos
              e cultiva o ser.
            </p>
            <ul className="checklist">
              <li>Pedagogia da escuta e respeito às individualidades</li>
              <li>Aprendizagem significativa, dentro e fora da sala</li>
              <li>Tecnologia a serviço do aprendizado</li>
            </ul>
          </div>
        </div>
      </section>

      {/* METODOLOGIA / DIFERENCIAIS */}
      <section id="metodo" className="paper">
        <div className="wrap sec">
          <div className="center reveal">
            <span className="pill">Educação 360º</span>
            <h2 className="h2" style={{ marginTop: 10 }}>Uma educação de 1º mundo, aqui em Curitiba</h2>
            <p className="muted sub">
              Buscamos nas melhores referências do mundo — a Finlândia como inspiração — uma proposta que
              desenvolve o aluno de forma completa.
            </p>
          </div>
          <div className="grid3">
            {DIFERENCIAIS.map((d) => (
              <div key={d.t} className="reveal card dif">
                <div className="dic">{d.ic}</div>
                <h4>{d.t}</h4>
                <p className="muted small">{d.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESTRUTURA */}
      <section id="estrutura" className="wrap sec">
        <div className="grid2 ac">
          <div className="reveal">
            <span className="pill">Estrutura</span>
            <h2 className="h2">Mais de 6.000 m² projetados para a inovação</h2>
            <p className="muted">
              Do projeto arquitetônico às salas 360º com mobiliário adaptável, cada espaço foi pensado para
              estimular a colaboração. A Minicidade, com sua Mini Prefeitura, leva a cidadania para a
              vivência diária dos estudantes.
            </p>
            <div className="hero-cta">
              <a className="btn outline" href={SITE} target="_blank" rel="noopener">Tour virtual no site oficial</a>
            </div>
          </div>
          <div className="reveal">
            <img className="photo" src={SLIDES[1]} alt="Estrutura do Colégio Amplação" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      {/* PORTAL AMPLAQUEST */}
      <section className="portal">
        <div className="wrap portal-in reveal">
          <div>
            <span className="pill" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>Portal gamificado</span>
            <h2 className="h2" style={{ color: '#fff', marginTop: 10 }}>AmplaQuest: o aprendizado vira jogo</h2>
            <p style={{ color: 'rgba(255,255,255,.9)' }}>
              Trilhas de conteúdo por matéria, XP a cada acerto, emblemas e a liga entre as turmas. Alunos,
              professores e responsáveis acompanham tudo em um só lugar.
            </p>
          </div>
          <Link href="/entrar" className="btn verde lg">Acessar o portal →</Link>
        </div>
      </section>

      {/* HISTÓRIA */}
      <section className="wrap sec">
        <div className="center reveal">
          <span className="pill">Nossa história</span>
          <h2 className="h2" style={{ marginTop: 10 }}>Transformação que fez escola</h2>
        </div>
        <div className="grid2 ac" style={{ marginTop: 20 }}>
          <div className="reveal timeline">
            {[
              ['O início', 'Sob a direção de Gisele Mantovani Pinheiro, nasce o Grupo Educacional Amplação em Curitiba, com a pedagogia da escuta no centro de tudo.'],
              ['O crescimento', 'A escola se consolida como referência em metodologias ativas e ensino bilíngue, ganhando reconhecimento nacional.'],
              ['O campus de hoje', 'Mais de 6.000 m² no bairro planejado Neoville, com salas 360º e a Minicidade.'],
            ].map(([t, d]) => (
              <div key={t} className="tl"><b>{t}</b><p className="muted small">{d}</p></div>
            ))}
          </div>
          <div className="reveal card">
            <h3>Memória e futuro</h3>
            <p className="muted small" style={{ marginTop: 8 }}>
              Cada etapa da trajetória do Amplação faz parte da sua identidade. Este espaço está pronto para
              receber a história completa da escola — datas, marcos e fotos que você conhece de dentro.
            </p>
            <p className="pill" style={{ marginTop: 14 }}>Santi: me envie os detalhes e as fotos que eu completo aqui.</p>
          </div>
        </div>
      </section>

      {/* CONTATO / LOCALIZAÇÃO */}
      <section id="contato" className="paper">
        <div className="wrap sec">
          <div className="grid2 ac">
            <div className="reveal">
              <span className="pill">Fale com a gente</span>
              <h2 className="h2">Venha conhecer o Amplação</h2>
              <p className="muted">Agende uma visita e descubra por que tantas famílias escolhem a nossa escola.</p>
              <div className="contact">
                <div><span>📍 Endereço</span><b>Rua Brazílio de Araújo, 799 — Neoville, Curitiba/PR</b></div>
                <div><span>📞 Telefone</span><b>(41) 3057-0207</b></div>
                <div><span>💬 WhatsApp</span><b>(41) 98850-0200</b></div>
                <div><span>✉️ E-mail</span><b>contato@colegioamplacao.com.br</b></div>
              </div>
              <div className="hero-cta">
                <a className="btn verde" href="https://wa.me/5541988500200" target="_blank" rel="noopener">Falar no WhatsApp</a>
                <a className="btn outline" href="https://www.instagram.com/colegioamplacao/" target="_blank" rel="noopener">Instagram</a>
              </div>
            </div>
            <div className="reveal">
              <a className="map" href="https://www.google.com/maps/search/Rua+Braz%C3%ADlio+de+Ara%C3%BAjo+799+Neoville+Curitiba" target="_blank" rel="noopener">
                <div className="map-pin">📍</div>
                <div className="map-card">Colégio Amplação<span className="muted small">Neoville · Curitiba/PR</span></div>
                <span className="map-link">Abrir no Google Maps →</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="foot">
        <div className="wrap foot-in">
          <div>
            <div className="brand" style={{ marginBottom: 10 }}>
              <img src="/logo.png" alt="" style={{ width: 34, height: 34, borderRadius: 8 }} />
              <b style={{ color: '#fff', fontFamily: 'var(--display)' }}>Colégio Amplação</b>
            </div>
            <p className="small" style={{ color: 'rgba(255,255,255,.7)' }}>
              Escola bilíngue integral · Educação 360º<br />Neoville, Curitiba/PR
            </p>
          </div>
          <div className="foot-links">
            <a href="#metodo">Metodologia</a>
            <a href="#estrutura">Estrutura</a>
            <Link href="/entrar">Portal do Aluno</Link>
            <a href="https://www.instagram.com/colegioamplacao/" target="_blank" rel="noopener">Instagram</a>
          </div>
        </div>
        <div className="wrap foot-bottom small">
          © {new Date().getFullYear()} Colégio Amplação · AmplaQuest — plataforma de ensino gamificado · Dados de demonstração para avaliação.
        </div>
      </footer>

      <style>{`
        .lpnav{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.9);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
        .nav-in{display:flex;align-items:center;gap:18px;padding:12px 24px}
        .brand{display:flex;align-items:center;gap:10px}
        .brand img{width:36px;height:36px;border-radius:9px}
        .brand b{font-family:var(--display);font-size:18px;font-weight:700}
        .links{margin-left:auto;display:flex;align-items:center;gap:26px;font-weight:500}
        .links a{font-size:14.5px;color:var(--ink-soft)}
        .links a:hover{color:var(--roxo)}
        @media(max-width:820px){.links a:not(.btn){display:none}}

        .hero{position:relative;min-height:600px;display:flex;align-items:center;overflow:hidden;background:#2a1b4a}
        @media(max-width:820px){.hero{min-height:520px}}
        .hero-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 1.2s ease;z-index:0}
        .hero-img.on{opacity:1}
        .hero-ov{position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(40,20,70,.86),rgba(40,20,70,.55) 60%,rgba(22,110,74,.4))}
        .hero-in{position:relative;z-index:2;color:#fff;padding:60px 24px}
        .hero-in h1{font-size:54px;margin:16px 0 18px;max-width:720px}
        @media(max-width:820px){.hero-in h1{font-size:36px}}
        .hero-in p{font-size:18px;max-width:560px;color:rgba(255,255,255,.92)}
        .hero-cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}

        .stats-strip{background:var(--roxo-esc);color:#fff}
        .stats-in{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:26px 24px;text-align:center}
        @media(max-width:700px){.stats-in{grid-template-columns:repeat(2,1fr);gap:26px}}
        .stat b{display:block;font-family:var(--display);font-size:26px;font-weight:800}
        .stat span{font-size:13px;color:rgba(255,255,255,.75)}

        .sec{padding:72px 24px}
        .paper{background:var(--paper)}
        .h2{font-size:34px}
        @media(max-width:820px){.h2{font-size:27px}}
        .sub{max-width:620px;margin:10px auto 0}
        .ac{align-items:center}
        .photo{width:100%;height:420px;object-fit:cover;border-radius:18px;box-shadow:var(--shadow)}
        @media(max-width:820px){.photo{height:300px}}
        .grid3{margin-top:40px}

        .checklist{list-style:none;padding:0;margin:18px 0 0;display:flex;flex-direction:column;gap:10px}
        .checklist li{position:relative;padding-left:30px;font-weight:500;color:var(--ink)}
        .checklist li::before{content:'✓';position:absolute;left:0;top:-1px;width:20px;height:20px;background:var(--verde-bg);color:var(--verde);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800}

        .dif .dic{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;background:var(--roxo-bg)}
        .dif h4{margin:14px 0 6px;font-size:18px}

        .portal{background:linear-gradient(120deg,var(--roxo),var(--roxo-esc))}
        .portal-in{display:flex;align-items:center;justify-content:space-between;gap:30px;padding:56px 24px;flex-wrap:wrap}
        .portal-in>div{max-width:620px}

        .timeline{display:flex;flex-direction:column;gap:20px;border-left:3px solid var(--roxo-2);padding-left:22px}
        .tl{position:relative}
        .tl::before{content:'';position:absolute;left:-30px;top:4px;width:14px;height:14px;border-radius:50%;background:var(--roxo)}
        .tl b{font-family:var(--display);color:var(--roxo);font-size:16px}

        .contact{display:flex;flex-direction:column;gap:12px;margin:20px 0}
        .contact>div{display:flex;flex-direction:column}
        .contact span{font-size:12px;color:var(--ink-soft);font-weight:600}
        .contact b{font-size:15px}

        .map{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;height:340px;border-radius:18px;text-align:center;
          background:radial-gradient(circle at 50% 40%,#fff,var(--roxo-bg));border:1px solid var(--line);box-shadow:var(--shadow-sm)}
        .map-pin{font-size:48px;animation:floaty 3s ease-in-out infinite}
        .map-card{display:flex;flex-direction:column;font-family:var(--display);font-weight:700}
        .map-link{font-weight:600;color:var(--roxo);font-size:14px}

        .foot{background:#140f24;color:#fff;padding:44px 0 26px}
        .foot-in{display:flex;justify-content:space-between;gap:30px;flex-wrap:wrap;padding:0 24px}
        .foot-links{display:flex;flex-direction:column;gap:10px}
        .foot-links a{color:rgba(255,255,255,.8);font-size:14px}
        .foot-links a:hover{color:#fff}
        .foot-bottom{padding:24px 24px 0;margin-top:24px;border-top:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.6)}
      `}</style>
    </main>
  );
}
