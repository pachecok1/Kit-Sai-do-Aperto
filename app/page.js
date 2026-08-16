'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      router.replace(data?.session ? '/dashboard' : '/login');
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#EDE9E3' }}>
      <p className="ksa-body">Carregando...</p>
    </div>
  );
}
