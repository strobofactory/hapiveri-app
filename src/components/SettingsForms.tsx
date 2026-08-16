'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-browser';
import type { Subscription } from '@/lib/stripe';

export default function SettingsForms({
  email,
  subscription,
}: {
  email: string;
  subscription: Subscription | null;
}) {
  const [pw, setPw] = useState({ next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next.length < 8) return setPwMsg({ ok: false, text: 'パスワードは8文字以上で入力してください' });
    if (pw.next !== pw.confirm) return setPwMsg({ ok: false, text: '確認用のパスワードが一致しません' });

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    if (error) return setPwMsg({ ok: false, text: '変更できませんでした。時間をおいてお試しください' });

    setPw({ next: '', confirm: '' });
    setPwMsg({ ok: true, text: 'パスワードを変更しました' });
  }

  async function changeEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return setEmailMsg({ ok: false, text: '新しいメールアドレスを入力してください' });

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) return setEmailMsg({ ok: false, text: '申請できませんでした。時間をおいてお試しください' });

    setEmailMsg({ ok: true, text: '確認メールを送信しました。リンクを開くと切り替わります' });
  }

  async function openPortal() {
    setPortalBusy(true);
    const res = await fetch('/api/stripe-portal', { method: 'POST' });
    const json = await res.json();
    setPortalBusy(false);
    if (json.url) window.location.href = json.url;
  }

  return (
    <>
      <div className="page-bar fade d2">
        <div className="page-title">設定</div>
        <Link href="/" className="back">
          <i className="ti ti-arrow-left" aria-hidden="true" />
          会員ページへ戻る
        </Link>
      </div>

      <main>
        <div className="grid">
          <form className="card fade d3" onSubmit={changePassword}>
            <div className="card-head">
              <div className="label-stack">
                <div className="label-rule" />
                <div className="label-text">PASSWORD</div>
              </div>
              <i className="ti ti-lock" aria-hidden="true" />
            </div>

            <div className="field">
              <div className="field-label">新しいパスワード</div>
              <input
                type="password"
                value={pw.next}
                onChange={(e) => { setPw({ ...pw, next: e.target.value }); setPwMsg(null); }}
                placeholder="8文字以上"
                autoComplete="new-password"
              />
            </div>
            <div className="field">
              <div className="field-label">新しいパスワード（確認）</div>
              <input
                type="password"
                value={pw.confirm}
                onChange={(e) => { setPw({ ...pw, confirm: e.target.value }); setPwMsg(null); }}
                placeholder="もう一度入力"
                autoComplete="new-password"
              />
            </div>

            {pwMsg && <div className={pwMsg.ok ? 'ok' : 'err'}>{pwMsg.text}</div>}

            <button type="submit" className="btn">パスワードを変更</button>
          </form>

          <form className="card fade d4" onSubmit={changeEmail}>
            <div className="card-head">
              <div className="label-stack">
                <div className="label-rule" />
                <div className="label-text">EMAIL</div>
              </div>
              <i className="ti ti-mail" aria-hidden="true" />
            </div>

            <div className="field">
              <div className="field-label">現在のメールアドレス</div>
              <input type="email" value={email} disabled />
            </div>
            <div className="field">
              <div className="field-label">新しいメールアドレス</div>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setEmailMsg(null); }}
                placeholder="name@example.com"
              />
            </div>

            <div className="hint">
              変更を申請すると、新しいアドレスに確認メールが届きます。
              <br />
              リンクを開いた時点で切り替わります。
            </div>

            {emailMsg && <div className={emailMsg.ok ? 'ok' : 'err'}>{emailMsg.text}</div>}

            <button type="submit" className="btn">変更を申請</button>
          </form>

          {subscription && (
            <div className="card wide fade d5">
              <div className="card-head">
                <div className="label-stack">
                  <div className="label-rule" />
                  <div className="label-text">SUBSCRIPTION</div>
                </div>
                <i className="ti ti-credit-card" aria-hidden="true" />
              </div>

              <div className="plan-row">
                <span className="plan-key">プラン</span>
                <span className="plan-val big">{subscription.planName}</span>
              </div>
              <div className="plan-row">
                <span className="plan-key">{subscription.interval}</span>
                <span className="plan-val">{subscription.amount}</span>
              </div>
              <div className="plan-row">
                <span className="plan-key">次回請求日</span>
                <span className="plan-val">{subscription.nextBillingDate}</span>
              </div>
              {subscription.paymentMethod && (
                <div className="plan-row">
                  <span className="plan-key">お支払い方法</span>
                  <span className="plan-val">{subscription.paymentMethod}</span>
                </div>
              )}

              <div className="plan-foot">
                <div className="plan-note">
                  プランの変更、お支払い方法の更新、請求書のダウンロード、停止のお手続きはこちらから行えます。
                </div>
                <button onClick={openPortal} className="btn-gold" disabled={portalBusy}>
                  <span>{portalBusy ? '準備中…' : 'サブスクリプションを管理'}</span>
                  <i className="ti ti-external-link" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="danger-zone fade d5">
          <div>
            <div className="danger-text">サービスの利用を終了する</div>
            <div className="danger-sub">お手続きの前に、担当カウンセラーからご連絡いたします。</div>
          </div>
          <a href="mailto:info@hapiveri.com?subject=退会のご相談" className="btn-danger">
            退会を申請
          </a>
        </div>
      </main>
    </>
  );
}
