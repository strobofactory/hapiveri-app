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
      <LogoMark className="logo" />
      <div className="head-right">
        <Link
          href="/settings"
          className={current === 'settings' ? 'head-link on' : 'head-link'}
        >
          <i className="ti ti-settings" aria-hidden="true" />
          SETTINGS
        </Link>
        <button onClick={signOut} className="head-link" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>
          <i className="ti ti-logout" aria-hidden="true" />
          LOGOUT
        </button>
      </div>
    </header>
  );
}
