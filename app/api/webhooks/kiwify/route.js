import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

// Eventos que devem LIBERAR o acesso
const EVENTOS_LIBERAR = ['compra aprovada', 'paid', 'approved', 'assinatura renovada'];

// Eventos que devem REVOGAR o acesso
const EVENTOS_REVOGAR = [
  'reembolso',
  'refunded',
  'chargeback',
  'assinatura cancelada',
  'assinatura atrasada',
  'subscription_canceled',
  'subscription_late',
];

export async function POST(request) {
  // 1) Confere o token secreto que você configurou na Kiwify.
  // A Kiwify manda esse token como query string na URL do webhook,
  // ex: https://seusite.com/api/webhooks/kiwify?token=SEU_TOKEN
  const { searchParams } = new URL(request.url);
  const tokenRecebido = searchParams.get('token');

  if (tokenRecebido !== process.env.KIWIFY_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  // IMPORTANTE: durante o teste (botão "Testar Webhook" na Kiwify),
  // logue o payload completo pra ver o formato exato que ela manda,
  // e ajuste os campos abaixo se precisar.
  console.log('Webhook Kiwify recebido:', JSON.stringify(payload));

  const status = (
    payload.order_status ||
    payload.status ||
    payload.type ||
    ''
  ).toString().toLowerCase();

  const email = (
    payload?.Customer?.email ||
    payload?.customer?.email ||
    payload?.data?.customer?.email ||
    payload?.data?.buyer?.email ||
    ''
  ).toLowerCase().trim();

  const orderId =
    payload?.order_id || payload?.id || payload?.data?.id || null;

  const produto =
    payload?.Product?.product_name ||
    payload?.product?.name ||
    payload?.data?.product?.name ||
    null;

  if (!email) {
    console.error('Webhook sem email do comprador:', payload);
    return NextResponse.json({ error: 'Email não encontrado no payload' }, { status: 400 });
  }

  const deveLiberar = EVENTOS_LIBERAR.some((e) => status.includes(e));
  const deveRevogar = EVENTOS_REVOGAR.some((e) => status.includes(e));

  if (deveLiberar) {
    await liberarAcesso(email, orderId, produto);
  } else if (deveRevogar) {
    await revogarAcesso(email);
  } else {
    console.log('Evento ignorado (não mapeado):', status);
  }

  return NextResponse.json({ ok: true });
}

async function liberarAcesso(email, orderId, produto) {
  // 1) Marca/atualiza o comprador como ativo na tabela de controle
  await supabaseAdmin.from('compradores').upsert({
    email,
    status: 'ativo',
    kiwify_order_id: orderId,
    produto,
    atualizado_em: new Date().toISOString(),
  });

  // 2) Verifica se já existe conta de login pra esse email
  const { data: usuariosExistentes } = await supabaseAdmin.auth.admin.listUsers();
  const jaExiste = usuariosExistentes?.users?.some((u) => u.email === email);

  if (!jaExiste) {
    // 3) Cria a conta e manda um convite por e-mail pra pessoa definir a senha
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
    if (error) {
      console.error('Erro ao convidar usuário:', error.message);
    }
  }
}

async function revogarAcesso(email) {
  await supabaseAdmin
    .from('compradores')
    .update({ status: 'inativo', atualizado_em: new Date().toISOString() })
    .eq('email', email);
}
