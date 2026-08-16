import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { findMemberByEmail } from '@/lib/airtable';
import { getSubscription } from '@/lib/stripe';
import Header from '@/components/Header';
import SettingsForms from '@/components/SettingsForms';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect('/login');

  const member = await findMemberByEmail(user.email);
  if (!member) redirect('/login?e=notfound');

  const subscription = member.stripeCustomerId
    ? await getSubscription(member.stripeCustomerId)
    : null;

  return (
    <div className="wrap">
      <Header current="settings" />
      <SettingsForms email={member.email} subscription={subscription} />
    </div>
  );
}
