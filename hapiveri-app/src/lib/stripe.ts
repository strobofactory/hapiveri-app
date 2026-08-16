import Stripe from 'stripe';

export type Subscription = {
  planName: string;
  amount: string;
  interval: string;
  nextBillingDate: string;
  paymentMethod: string | null;
  status: string;
};

function money(amount: number, currency: string): string {
  const upper = currency.toUpperCase();
  if (upper === 'JPY') {
    return `¥${amount.toLocaleString()}`;
  }
  const symbol = upper === 'USD' ? '$' : '';
  return `${symbol}${(amount / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${upper}`;
}

function jpDate(unix: number): string {
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

const INTERVAL_JA: Record<string, string> = {
  month: '月額',
  year: '年額',
  week: '週額',
  day: '日額',
};

export async function getSubscription(
  customerId: string
): Promise<Subscription | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  const stripe = new Stripe(key);

  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
    expand: ['data.default_payment_method', 'data.items.data.price.product'],
  });

  const sub = subs.data[0];
  if (!sub) return null;

  const item = sub.items.data[0];
  if (!item) return null;

  const price = item.price;
  const product = price.product;
  const planName =
    typeof product === 'object' && product && 'name' in product
      ? product.name
      : 'プラン';

  const interval = price.recurring?.interval ?? 'month';
  const pm = sub.default_payment_method;

  let paymentMethod: string | null = null;
  if (typeof pm === 'object' && pm?.card) {
    paymentMethod = `${pm.card.brand.toUpperCase()} •••• ${pm.card.last4}`;
  }

  return {
    planName,
    amount: money(price.unit_amount ?? 0, price.currency),
    interval: INTERVAL_JA[interval] ?? interval,
    nextBillingDate: jpDate(
      (item as unknown as { current_period_end: number }).current_period_end
    ),
    paymentMethod,
    status: sub.status,
  };
}
