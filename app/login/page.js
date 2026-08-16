'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [modo, setModo] = useState('entrar'); // 'entrar' | 'cadastrar'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) router.replace('/dashboard');
    })();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setAviso('');
    setCarregando(true);

    if (modo === 'cadastrar') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } },
      });
      setCarregando(false);
      if (error) {
        setErro(error.message);
        return;
      }
      if (data.session) {
        router.replace('/dashboard');
      } else {
        setAviso('Cadastro feito! Verifique seu e-mail para confirmar a conta e depois faça login.');
        setModo('entrar');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      setCarregando(false);
      if (error) {
        setErro(error.message);
        return;
      }
      router.replace('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#EDE9E3', color: '#2B2320' }}>
      <div className="w-full max-w-sm rounded-2xl p-8 shadow-sm" style={{ background: '#FBF9F5', border: '1px solid #DDD6C9' }}>
        <h1 className="ksa-display text-3xl mb-1">Kit Sai do Aperto</h1>
        <p className="text-sm mb-6" style={{ color: '#8A8378' }}>
          Organize suas finanças e respire mais tranquilo todo mês.
        </p>

        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setModo('entrar')}
            className="px-4 py-1.5 rounded-full text-sm font-medium"
            style={modo === 'entrar' ? { background: '#2B2320', color: '#FBF9F5' } : { background: '#EDE9E3', color: '#2B2320' }}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setModo('cadastrar')}
            className="px-4 py-1.5 rounded-full text-sm font-medium"
            style={modo === 'cadastrar' ? { background: '#2B2320', color: '#FBF9F5' } : { background: '#EDE9E3', color: '#2B2320' }}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {modo === 'cadastrar' && (
            <>
              <label className="text-xs uppercase tracking-wide" style={{ color: '#8A8378' }}>Nome</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full mt-1 mb-3 px-3 py-2 rounded-lg outline-none"
                style={{ border: '1px solid #DDD6C9', background: '#FFFFFF' }}
                required
              />
            </>
          )}

          <label className="text-xs uppercase tracking-wide" style={{ color: '#8A8378' }}>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 mb-3 px-3 py-2 rounded-lg outline-none"
            style={{ border: '1px solid #DDD6C9', background: '#FFFFFF' }}
            required
          />

          <label className="text-xs uppercase tracking-wide" style={{ color: '#8A8378' }}>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            minLength={6}
            className="w-full mt-1 mb-4 px-3 py-2 rounded-lg outline-none"
            style={{ border: '1px solid #DDD6C9', background: '#FFFFFF' }}
            required
          />

          {erro && <p className="text-sm mb-3" style={{ color: '#8B3A3A' }}>{erro}</p>}
          {aviso && <p className="text-sm mb-3" style={{ color: '#6B8F71' }}>{aviso}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-2.5 rounded-lg font-medium"
            style={{ background: '#6B8F71', color: '#FBF9F5', opacity: carregando ? 0.7 : 1 }}
          >
            {carregando ? 'Um momento...' : modo === 'entrar' ? 'Entrar' : 'Criar minha conta'}
          </button>
        </form>
      </div>
    </div>
  );
}
