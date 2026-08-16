import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { findMemberByEmail, hasSubmittedThisMonth, monthsSince } from '@/lib/airtable';
import { getPointSummary } from '@/lib/points';
import { getNews } from '@/lib/shopify';
import Header from '@/components/Header';
import NewsCarousel from '@/components/NewsCarousel';
import Balance from '@/components/Balance';

export const dynamic = 'force-dynamic';

const ICONS: Record<string, string> = {
  step: 'ti-shoe',
  sleep: 'ti-moon',
  meal: 'ti-bowl',
  bio: 'ti-droplet',
};

function ymLabel(ym: string | null): string {
  if (!ym) return '';
  return ym.replace('-', '.');
}

function jpDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect('/login');

  const member = await findMemberByEmail(user.email);
  if (!member) redirect('/login?e=notfound');

  const [points, submission, news] = await Promise.all([
    getPointSummary(member.recordId),
    hasSubmittedThisMonth(member.recordId),
    getNews(6),
  ]);

  const months = monthsSince(member.startedAt);
  const started = member.startedAt
    ? `SINCE ${new Date(member.startedAt).getFullYear()}.${String(new Date(member.startedAt).getMonth() + 1).padStart(2, '0')}`
    : '';

  const meta = [member.memberNo, member.plan.toUpperCase(), started]
    .filter(Boolean)
    .join('　');

  return (
    <div className="wrap">
      <Header current="home" />

      <div className="member-bar fade d2">
        <div>
          <span className="member-name">{member.fullName}</span>
          <span className="member-sama">様</span>
        </div>
        <div className="member-meta">{meta}</div>
      </div>

      <main>
        <NewsCarousel items={news} />

        <div className="row-main">
          <div className="col-point fade d4">
            <div className="card">
              <div className="card-head">
                <div className="label-stack">
                  <div className="label-rule" />
                  <div className="label-text">
                    POINT
                    <br />
                    BALANCE
                  </div>
                </div>
              </div>

              <Balance value={points.balance} />

              <div className="breakdown">
                <div className="breakdown-label">
                  {ymLabel(points.yearMonth)} BREAKDOWN
                </div>
                {points.breakdown.map((row) => (
                  <div key={row.kind} className={row.empty ? 'bd-row empty' : 'bd-row'}>
                    <i className={`ti ${ICONS[row.kind]}`} aria-hidden="true" />
                    <span className="bd-name">{row.label}</span>
                    <span className="bd-count">{row.count}</span>
                    <span className="bd-pt">{row.points.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={process.env.NEXT_PUBLIC_STORE_URL ?? '#'}
              className="use-point"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="use-point-left">
                <i className="ti ti-shopping-bag" aria-hidden="true" />
                <span className="use-point-name">ポイントを使う</span>
              </div>
              <div className="use-point-right">
                <span className="use-point-service">STORE</span>
                <i className="ti ti-arrow-right" aria-hidden="true" />
              </div>
            </a>
          </div>

          <div className="col-side fade d5">
            <div className="card">
              <div className="card-head">
                <div className="label-stack">
                  <div className="label-rule" />
                  <div className="label-text">
                    DATA
                    <br />
                    SUBMISSION
                  </div>
                </div>
                <i className="ti ti-upload" aria-hidden="true" />
              </div>
              {submission.submitted ? (
                <>
                  <div className="status-line">
                    <i className="ti ti-circle-check" aria-hidden="true" />
                    <span className="status-text">提出済み</span>
                  </div>
                  <div className="status-date">{jpDate(submission.receivedOn)} RECEIVED</div>
                </>
              ) : (
                <>
                  <div className="status-line">
                    <i className="ti ti-clock" aria-hidden="true" />
                    <span className="status-text">未提出</span>
                  </div>
                  <div className="status-date">案内メールをご確認ください</div>
                </>
              )}
            </div>

            <div className="card">
              <div className="card-head">
                <div className="label-stack">
                  <div className="label-rule" />
                  <div className="label-text">
                    LATEST
                    <br />
                    REPORT
                  </div>
                </div>
                <i className="ti ti-report-medical" aria-hidden="true" />
              </div>
              <div className="status-text" style={{ marginBottom: 9 }}>
                {ymLabel(points.yearMonth) || '—'}
              </div>
              <div className="status-date">BOX に格納されています</div>
            </div>

            <div className="row-links">
              <a
                href={member.boxFolderUrl ?? '#'}
                className="link-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="link-top">
                  <i className="ti ti-folder" aria-hidden="true" />
                  <span className="link-service">BOX</span>
                </div>
                <div className="link-bottom">
                  <span className="link-name">レポート</span>
                  <i className="ti ti-arrow-right" aria-hidden="true" />
                </div>
              </a>

              <a
                href={process.env.NEXT_PUBLIC_LINE_URL ?? '#'}
                className="link-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="link-top">
                  <i className="ti ti-message-circle" aria-hidden="true" />
                  <span className="link-service">LINE</span>
                </div>
                <div className="link-bottom">
                  <span className="link-name">相談する</span>
                  <i className="ti ti-arrow-right" aria-hidden="true" />
                </div>
              </a>
            </div>
          </div>
        </div>

        <a
          href={process.env.NEXT_PUBLIC_ACADEMY_URL ?? '#'}
          className="academy fade d6"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="academy-body">
            <div className="academy-eyebrow">NEXT ACADEMY</div>
            <div className="academy-title">精密栄養カウンセラーになろう。</div>
            <div className="academy-lead">
              自分の身体で確かめてきたことを、次は誰かのために。データを読み解き、伴走する技術を学べる講座です。
            </div>
            <span className="academy-cta">
              講座を見る
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </span>
          </div>
          <div className="academy-visual">
            <span className="ph">VISUAL</span>
          </div>
        </a>
      </main>
    </div>
  );
}
