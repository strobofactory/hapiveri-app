import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase-server';
import { findMemberByEmail } from '@/lib/airtable';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const member = await findMemberByEmail(user.email);
  if (!member?.stripeCustomerId) {
    return NextResponse.json({ error: 'no_customer' }, { status: 404 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: 'not_configured' }, { status: 500 });
  }

  const stripe = new Stripe(key);
  const session = await stripe.billingPortal.sessions.create({
    customer: member.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
    locale: 'ja',
  });

  return NextResponse.json({ url: session.url });
}
