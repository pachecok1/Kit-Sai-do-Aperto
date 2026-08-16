import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';
export async function GET() {
  const { data, error } = await supabaseAdmin
    .storage
    .from('ebooks')
    .createSignedUrl('kit-sai-do-aperto.pdf', 60);

  if (error) {
    return NextResponse.json({ error: 'Não foi possível gerar o link' }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
