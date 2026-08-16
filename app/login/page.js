'use client';
 
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
 
// Coloque aqui o link de checkout do seu produto na Kiwify
const LINK_CHECKOUT_KIWIFY = 'https://pay.kiwify.com.br/SEU-LINK-AQUI';
 
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
 
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) router.replace('/dashboard');
    })();
  }, [router]);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
 
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
 
    if (error) {
      setErro('E-mail ou senha incorretos.');
      return;
    }
    router.replace('/dashboard');
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#EDE9E3', color: '#2B2320' }}>
      <div className="w-full max-w-sm rounded-2xl p-8 shadow-sm" style={{ background: '#FBF9F5', border: '1px solid #DDD6C9' }}>
        <h1 className="ksa-display text-3xl mb-1">Kit Sai do Aperto</h1>
        <p className="text-sm mb-6" style={{ color: '#8A8378' }}>
          Organize suas finanças e respire mais tranquilo todo mês.
        </p>
 
        <form onSubmit={handleSubmit}>
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
 
          <button
            type="submit"
            disabled={carregando}
            className="w-full py-2.5 rounded-lg font-medium"
            style={{ background: '#6B8F71', color: '#FBF9F5', opacity: carregando ? 0.7 : 1 }}
          >
            {carregando ? 'Um momento...' : 'Entrar'}
          </button>
        </form>
 
        <p className="text-sm mt-5 text-center" style={{ color: '#8A8378' }}>
          Ainda não comprou?{' '}
          <a href={LINK_CHECKOUT_KIWIFY} className="underline" style={{ color: '#2B2320' }}>
            Garanta seu acesso aqui
          </a>
        </p>
      </div>
    </div>
  );
}
 
