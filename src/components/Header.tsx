'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import { LogoMark } from './Logo';

export default function Header({ current }: { current: 'home' | 'settings' }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="fade d1">
      <Link href="/" aria-label="ホームへ">
        <LogoMark className="logo" />
      </Link>
      <div className="head-right">
        <Link
          href="/settings"
          className={current === 'settings' ? 'head-link on' : 'head-link'}
        >
          <i className="ti ti-settings" aria-hidden="true" />
          SETTINGS
        </Link>
        <button onClick={signOut} className="head-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.1em', lineHeight: 'inherit' }}>
          <i className="ti ti-logout" aria-hidden="true" />
          LOGOUT
        </button>
      </div>
    </header>
  );
}
