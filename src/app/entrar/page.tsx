'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Eagle from '@/components/Eagle';
import Logo from '@/components/Logo';

export default function Entrar() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (error) {
      setErr('E-mail ou senha incorretos. As contas são criadas pela secretaria do colégio.');
      return;
    }
    router.push('/painel');
    router.refresh();
  }

  return (
    <main className="login-page">
      <div className="blobs"><i /><i /><i /></div>
      <form className="login-card" onSubmit={entrar}>
        <div style={{ textAlign: 'center' }}><Eagle size={96} /></div>
        <div className="brand-c">
          <Logo size={30} />
          <b>AmplaQuest</b>
        </div>
        <h2 className="center">Bem-vindo de volta!</h2>
        <p className="muted small center" style={{ marginTop: 2 }}>
          Entre com a conta fornecida pelo colégio
        </p>

        <label className="lbl">E-mail</label>
        <input className="inp" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@amplacao.com" required />
        <label className="lbl">Senha</label>
        <input className="inp" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" required />

        {err && <p className="err">{err}</p>}

        <button className="btn block lg" type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>

        <Link href="/" className="muted small center" style={{ marginTop: 14, display: 'block' }}>← Voltar ao site</Link>
      </form>

      <style>{`
        .login-page{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:22px;overflow:hidden;
          background:linear-gradient(160deg,#F6F2FF,#ffffff 55%,#DCFCE7)}
        .login-card{position:relative;z-index:1;background:#fff;border:1px solid var(--line);border-radius:26px;box-shadow:var(--shadow);padding:30px;max-width:410px;width:100%;display:flex;flex-direction:column}
        .brand-c{display:flex;align-items:center;justify-content:center;gap:9px;margin:4px 0 6px}
        .brand-c b{font-family:var(--display);font-size:20px;background:linear-gradient(90deg,var(--roxo),var(--verde));-webkit-background-clip:text;background-clip:text;color:transparent}
        .lbl{font-weight:800;font-size:12.5px;color:var(--ink-soft);margin:12px 0 5px;text-transform:uppercase;letter-spacing:.4px}
        .inp{border:2px solid var(--line);border-radius:13px;padding:13px 15px;font-size:15px;font-weight:600;font-family:var(--font)}
        .inp:focus{outline:none;border-color:var(--roxo)}
        .err{background:#fee2e2;color:#b91c1c;font-weight:700;font-size:13px;border-radius:10px;padding:10px 12px;margin:12px 0 0}
        .login-card .btn{margin-top:18px}
      `}</style>
    </main>
  );
}
