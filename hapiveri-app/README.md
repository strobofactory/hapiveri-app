# HAPIVERI Healthcare.ai 会員ページ

会員向けのPWA。ポイント残高、データ提出状況、お知らせ、各サービスへの導線を提供します。

## 構成

| 層 | 採用 |
|---|---|
| フレームワーク | Next.js 15 (App Router) |
| 認証 | Supabase Auth（招待制・メール＋パスワード） |
| 会員データ | Airtable |
| お知らせ | Shopify Storefront API |
| サブスク | Stripe Customer Portal |
| ホスティング | Vercel |
| ドメイン | app.hapiveri-healthcare.ai |


## デプロイ手順（Vercel ドロップ）

1. Vercel で `hapiveri-app` プロジェクトを開く
2. このフォルダごとドロップ画面にドラッグ
3. Environment Variables に下記を入力
4. Deploy

**注意**: `node_modules` と `package-lock.json` は同梱していない。
Vercel が package.json を読んで自動で用意する。

### 環境変数（最低限これだけで動く）

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | https://uonuncnocwfpvddxnfjj.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sb_publishable_ISHqBiz56UN-iedBEln15g__w40kDzq |
| `AIRTABLE_API_KEY` | Airtable の Personal access token |
| `AIRTABLE_BASE_ID` | appKNS9pYMdFlsVA1 |
| `NEXT_PUBLIC_STORE_URL` | https://hapiveri.com |
| `NEXT_PUBLIC_SITE_URL` | https://app.hapiveri-healthcare.ai |

### 後から追加できるもの

| Name | 用途 |
|---|---|
| `STRIPE_SECRET_KEY` | サブスク管理（未設定ならその欄が非表示） |
| `SHOPIFY_STORE_DOMAIN` | お知らせ（未設定ならセクション非表示） |
| `SHOPIFY_STOREFRONT_TOKEN` | 同上 |
| `NEXT_PUBLIC_LINE_URL` | LINE 相談リンク |
| `NEXT_PUBLIC_ACADEMY_URL` | アカデミーバナーのリンク先 |

---

## セットアップ

### 1. 依存パッケージ

```bash
npm install
```

### 2. 環境変数

`.env.local.example` を `.env.local` にコピーし、値を入れる。

```bash
cp .env.local.example .env.local
```

| 変数 | 取得場所 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 同上（anon public） |
| `SUPABASE_SERVICE_ROLE_KEY` | 同上（service_role・招待送信用） |
| `AIRTABLE_API_KEY` | Airtable → Personal access token |
| `SHOPIFY_STORE_DOMAIN` | 例: hapiveri.myshopify.com |
| `SHOPIFY_STOREFRONT_TOKEN` | Shopify → Apps → Storefront API |
| `STRIPE_SECRET_KEY` | Stripe → API keys |
| `NEXT_PUBLIC_LINE_URL` | LINE公式アカウントの友だち追加URL |
| `NEXT_PUBLIC_ACADEMY_URL` | ネクストアカデミーの講座ページ |

### 3. Airtable の列（設定済み）

メンバーリスト（tblAEzYZNqCeSUG1e）に2列を追加済み。

| 列名 | 型 | 状態 |
|---|---|---|
| `Box_Folder` | URL | 6名分入力済み |
| `Stripe_Customer_ID` | 単一行テキスト | 堤様のみ入力済み |

新規会員が加わったら、この2列を埋める。
Stripe顧客IDが空の会員には、設定ページのサブスク欄が表示されない（家族会員など無料利用者を想定）。

### 4. Supabase の設定

**Authentication → Providers**
- Email を有効化
- 「Confirm email」をオン

**Authentication → URL Configuration**
- Site URL: `https://app.hapiveri-healthcare.ai`
- Redirect URLs: `https://app.hapiveri-healthcare.ai/auth/callback`

**会員の招待**

Supabaseダッシュボード → Authentication → Users → 「Invite user」。
Airtableに登録済みのメールアドレスを入力すると、招待メールが届く。
会員がリンクを開くとパスワード設定画面になる。

### 5. Stripe の設定

**Settings → Billing → Customer portal** を有効化。
許可する操作（プラン変更・停止・カード変更など）を選ぶ。
言語は日本語に設定。

### 6. ローカルで確認

```bash
npm run dev
```

`http://localhost:3000` を開く。

### 7. Vercel へデプロイ

```bash
npx vercel
```

環境変数はVercelのダッシュボードで設定する。

### 8. ドメイン接続

Squarespace の DNS 設定に以下を追加。

```
ホスト: app
タイプ: CNAME
値:     cname.vercel-dns.com
```

Vercel側で `app.hapiveri-healthcare.ai` を登録すると、SSL証明書が自動発行される。

## ディレクトリ

```
src/
├─ app/
│  ├─ page.tsx              会員ページ
│  ├─ login/page.tsx        ログイン
│  ├─ settings/page.tsx     設定
│  ├─ auth/callback/        認証コールバック
│  ├─ api/stripe-portal/    Stripeポータル生成
│  ├─ layout.tsx
│  └─ globals.css
├─ components/
│  ├─ Header.tsx
│  ├─ Balance.tsx           残高カウントアップ
│  ├─ NewsCarousel.tsx      お知らせ横スライド
│  ├─ LoginForm.tsx
│  └─ SettingsForms.tsx
├─ lib/
│  ├─ airtable.ts           会員・提出データ
│  ├─ points.ts             ポイント台帳
│  ├─ shopify.ts            お知らせ
│  ├─ supabase-server.ts
│  └─ supabase-browser.ts
└─ middleware.ts            未ログインをリダイレクト
```

## 注意点

**メールアドレス変更時の同期**

会員が設定ページでメールアドレスを変更すると、Supabase側だけが更新される。
Airtableの `メールアドレス` 列も手動で更新しないと、次回ログイン時に照合できなくなる。

運用としては、変更申請があった際にAirtableも合わせて更新すること。

**PWAアイコン**

`public/icons/` に `icon-192.png` と `icon-512.png` を配置する。
現在は未配置のため、ホーム画面追加時に既定のアイコンになる。

**ロゴ**

ヘッダーとログイン画面のロゴは仮の円形プレースホルダ。
`src/components/Header.tsx` と `src/components/LoginForm.tsx` の
`<div className="logo">LOGO</div>` を実際の画像に差し替える。

**サブスク金額の表示**

Stripeの契約から実額を取得して表示するため、会員ごとに異なる金額が正しく出る。
プラン名もStripeの商品名がそのまま表示される。
