import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .storage
    .from('ebook-kit-sai-do-aperto')
    .createSignedUrl('kit-sai-do-aperto.pdf', 60);

  if (error) {
return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
