'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { CATEGORIES, fmt } from '../../lib/categorias';

export default function Dashboard() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tipo, setTipo] = useState('despesa');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('alimentacao');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        router.replace('/login');
        return;
      }
      setUsuario(sessionData.session.user);
      await carregarTransacoes();
      setCarregando(false);
    })();
  }, [router]);

  const carregarTransacoes = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('data', { ascending: false });
    if (!error) setTransactions(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const addTransaction = async () => {
    const v = parseFloat(String(valor).replace(',', '.'));
    if (!v || v <= 0) {
      setErro('Digite um valor válido.');
      return;
    }
    setErro('');
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: usuario.id,
        tipo,
        valor: v,
        categoria: tipo === 'despesa' ? categoria : null,
        descricao: descricao.trim() || (tipo === 'receita' ? 'Receita' : 'Despesa'),
      })
      .select();
    if (error) {
      setErro('Não foi possível salvar. Tente novamente.');
      return;
    }
    setTransactions([data[0], ...transactions]);
    setValor('');
    setDescricao('');
  };

  const removeTransaction = async (id) => {
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const now = new Date();
  const monthTx = useMemo(
    () =>
      transactions.filter((t) => {
        const d = new Date(t.data);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }),
    [transactions]
  );

  const receitas = monthTx.filter((t) => t.tipo === 'receita').reduce((s, t) => s + Number(t.valor), 0);
  const despesas = monthTx.filter((t) => t.tipo === 'despesa').reduce((s, t) => s + Number(t.valor), 0);
  const saldo = receitas - despesas;
  const ratio = receitas > 0 ? despesas / receitas : despesas > 0 ? 1.6 : 0;

  const apertoState =
    ratio <= 0.7
      ? { label: 'Respirando', color: '#6B8F71' }
      : ratio <= 1.0
      ? { label: 'No limite', color: '#C9A227' }
      : { label: 'Apertado', color: '#8B3A3A' };

  const gaugeRatio = Math.min(ratio, 1.5) / 1.5;
  const angle = -90 + gaugeRatio * 180;

  const byCategory = CATEGORIES.map((c) => ({
    name: c.label,
    value: monthTx.filter((t) => t.categoria === c.id).reduce((s, t) => s + Number(t.valor), 0),
    color: c.color,
  })).filter((c) => c.value > 0);

  const mesLabel = now
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase());

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#EDE9E3', color: '#2B2320' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  const nome = usuario?.user_metadata?.nome || usuario?.email;

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: '#EDE9E3', color: '#2B2320' }}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 flex items-baseline justify-between">
          <div>
            <h1 className="ksa-display text-3xl">Kit Sai do Aperto</h1>
    <button
  onClick={async () => {
    const res = await fetch('/api/download-ebook');
    const { url } = await res.json();
    if (url) window.open(url, '_blank');
  }}
  className="text-sm px-3 py-1.5 rounded-full font-medium mt-2"
  style={{ background: '#2B2320', color: '#FBF9F5' }}
>
  📘 Baixar e-book
</button>
            <p className="text-sm" style={{ color: '#8A8378' }}>Olá, {nome} · {mesLabel}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm" style={{ color: '#8A8378' }}>
            <LogOut size={14} /> Sair
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-2xl p-6" style={{ background: '#FBF9F5', border: '1px solid #DDD6C9' }}>
            <p className="text-xs uppercase tracking-wide mb-3" style={{ color: '#8A8378' }}>Saldo do mês</p>
            <p className="ksa-mono text-4xl mb-4" style={{ color: saldo >= 0 ? '#6B8F71' : '#8B3A3A' }}>{fmt(saldo)}</p>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <ArrowUpCircle size={18} style={{ color: '#6B8F71' }} />
                <div>
                  <p className="text-xs" style={{ color: '#8A8378' }}>Receitas</p>
                  <p className="ksa-mono text-sm">{fmt(receitas)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDownCircle size={18} style={{ color: '#8B3A3A' }} />
                <div>
                  <p className="text-xs" style={{ color: '#8A8378' }}>Despesas</p>
                  <p className="ksa-mono text-sm">{fmt(despesas)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 flex flex-col items-center justify-center" style={{ background: '#FBF9F5', border: '1px solid #DDD6C9' }}>
            <p className="text-xs uppercase tracking-wide mb-2 self-start" style={{ color: '#8A8378' }}>Nível de aperto</p>
            <svg width="200" height="115" viewBox="0 0 240 130">
              <defs>
                <linearGradient id="apertoGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6B8F71" />
                  <stop offset="55%" stopColor="#C9A227" />
                  <stop offset="100%" stopColor="#8B3A3A" />
                </linearGradient>
              </defs>
              <path d="M20,120 A100,100 0 0,1 220,120" fill="none" stroke="url(#apertoGrad)" strokeWidth="14" strokeLinecap="round" />
              <line x1="120" y1="120" x2="120" y2="32" stroke="#2B2320" strokeWidth="3" strokeLinecap="round" transform={`rotate(${angle} 120 120)`} />
              <circle cx="120" cy="120" r="6" fill="#2B2320" />
            </svg>
            <p className="ksa-display text-xl -mt-2" style={{ color: apertoState.color }}>{apertoState.label}</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 mb-4" style={{ background: '#FBF9F5', border: '1px solid #DDD6C9' }}>
          <p className="text-xs uppercase tracking-wide mb-3" style={{ color: '#8A8378' }}>Lançar transação</p>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTipo('despesa')}
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={tipo === 'despesa' ? { background: '#8B3A3A', color: '#FBF9F5' } : { background: '#EDE9E3', color: '#2B2320' }}
            >
              Despesa
            </button>
            <button
              onClick={() => setTipo('receita')}
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={tipo === 'receita' ? { background: '#6B8F71', color: '#FBF9F5' } : { background: '#EDE9E3', color: '#2B2320' }}
            >
              Receita
            </button>
          </div>
          <div className="grid md:grid-cols-4 gap-2">
            <input
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Valor (R$)"
              className="ksa-mono px-3 py-2 rounded-lg outline-none"
              style={{ border: '1px solid #DDD6C9', background: '#FFFFFF' }}
            />
            {tipo === 'despesa' && (
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="px-3 py-2 rounded-lg outline-none"
                style={{ border: '1px solid #DDD6C9', background: '#FFFFFF' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            )}
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição (opcional)"
              className={`px-3 py-2 rounded-lg outline-none ${tipo === 'receita' ? 'md:col-span-2' : ''}`}
              style={{ border: '1px solid #DDD6C9', background: '#FFFFFF' }}
            />
            <button
              onClick={addTransaction}
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-medium"
              style={{ background: '#2B2320', color: '#FBF9F5' }}
            >
              <Plus size={16} /> Adicionar
            </button>
          </div>
          {erro && <p className="text-sm mt-2" style={{ color: '#8B3A3A' }}>{erro}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6" style={{ background: '#FBF9F5', border: '1px solid #DDD6C9' }}>
            <p className="text-xs uppercase tracking-wide mb-3" style={{ color: '#8A8378' }}>Transações do mês</p>
            {monthTx.length === 0 ? (
              <p className="text-sm" style={{ color: '#8A8378' }}>Nada lançado ainda — adicione sua primeira transação acima.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {monthTx.map((t) => {
                  const cat = CATEGORIES.find((c) => c.id === t.categoria);
                  return (
                    <div key={t.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #EDE9E3' }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.tipo === 'receita' ? '#6B8F71' : cat?.color || '#8A8378' }} />
                        <div className="min-w-0">
                          <p className="text-sm truncate">{t.descricao}</p>
                          <p className="text-xs" style={{ color: '#8A8378' }}>{cat ? cat.label : 'Receita'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="ksa-mono text-sm" style={{ color: t.tipo === 'receita' ? '#6B8F71' : '#8B3A3A' }}>
                          {t.tipo === 'receita' ? '+' : '-'}{fmt(Number(t.valor))}
                        </span>
                        <button onClick={() => removeTransaction(t.id)} aria-label="Remover">
                          <Trash2 size={14} style={{ color: '#8A8378' }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl p-6" style={{ background: '#FBF9F5', border: '1px solid #DDD6C9' }}>
            <p className="text-xs uppercase tracking-wide mb-3" style={{ color: '#8A8378' }}>Gastos por categoria</p>
            {byCategory.length === 0 ? (
              <p className="text-sm" style={{ color: '#8A8378' }}>Sem despesas registradas neste mês ainda.</p>
            ) : (
              <>
                <div style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={2}>
                        {byCategory.map((c, i) => (
                          <Cell key={i} fill={c.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => fmt(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-2">
                  {byCategory.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                        {c.name}
                      </span>
                      <span className="ksa-mono">{fmt(c.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
