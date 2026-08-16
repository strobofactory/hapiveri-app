'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { LogoMark, LogoType } from './Logo';

export default function LoginForm({ notFound }: { notFound?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    notFound ? 'このアカウントは会員として登録されていません。' : null
  );
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return setError('メールアドレスを入力してください');
    if (!password) return setError('パスワードを入力してください');

    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (err) {
      setBusy(false);
      setError('メールアドレスまたはパスワードが違います');
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div className="login-body">
      <div className="panel">
        <div className="brand">
          <LogoMark className="brand-mark" />
          <LogoType className="brand-type" />
        </div>

        <form className="card" onSubmit={submit}>
          <div className="card-label">
            <div className="label-rule" />
            <div className="label-text">
              MEMBER
              <br />
              LOGIN
            </div>
          </div>

          <div className="field">
            <div className="field-label">EMAIL</div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder="name@example.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <div className="field-label">PASSWORD</div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && <div className="err">{error}</div>}

          <button type="submit" className="submit" disabled={busy}>
            {busy ? 'ログイン中…' : 'ログイン'}
          </button>
        </form>

        <div className="foot">
          <a href="/reset">パスワードをお忘れの方</a>
          <a href="mailto:info@hapiveri.com" className="sub">
            ログインでお困りの方はお問い合わせください
          </a>
        </div>
      </div>
    </div>
  );
}
