import Airtable from 'airtable';

const BASE_ID = process.env.AIRTABLE_BASE_ID ?? 'appKNS9pYMdFlsVA1';

export const TABLES = {
  members: 'tblAEzYZNqCeSUG1e',
  intake: 'tblMcjZHhqWls1ZdQ',
  submissions: 'tblDkP8mHdQaIFH3a',
  points: 'tblqV3zlaM7ktuOJO',
} as const;

export const MEMBER_FIELDS = {
  memberNo: 'fldNWISP0op7qUOAF',
  fullName: 'fldYM5FbcfU024ytZ',
  email: 'fld9wGrT3J8plnjZy',
  plan: 'fldL5uPGIiWIE3U4d',
  lineUserId: 'fldRfQJ7daH0E59op',
  driveFolder: 'fld85ltCDoTyMsms5',
  shopifyCustomerId: 'fld37oWjdKO2T8GIh',
  pointsLink: 'fldfQdoI30oyw1eQF',
  submissionsLink: 'fld7hll26QyLMeDgn',
  createdAt: 'fldd3zbJJUmBvzmuI',
} as const;

export const SUBMISSION_FIELDS = {
  submittedOn: 'fld0rITQWqSBXskCO',
  mealWeeks: 'fldZzBpbpelrW0zUF',
  bio: 'fldPuPGopGsZK5vdT',
  memberLink: 'fldllN181gorOfxJx',
} as const;

let cached: Airtable.Base | null = null;

function base(): Airtable.Base {
  if (cached) return cached;
  const key = process.env.AIRTABLE_API_KEY;
  if (!key) throw new Error('AIRTABLE_API_KEY is not set');
  cached = new Airtable({ apiKey: key }).base(BASE_ID);
  return cached;
}

export type Member = {
  recordId: string;
  memberNo: string;
  fullName: string;
  email: string;
  plan: string;
  boxFolderUrl: string | null;
  stripeCustomerId: string | null;
  startedAt: string | null;
};

function escape(value: string): string {
  return value.replace(/'/g, "\\'");
}

export async function findMemberByEmail(email: string): Promise<Member | null> {
  const target = escape(email.trim().toLowerCase());
  const records = await base()(TABLES.members)
    .select({
      filterByFormula: `LOWER({${MEMBER_FIELDS.email}}) = '${target}'`,
      maxRecords: 1,
    })
    .firstPage();

  const record = records[0];
  if (!record) return null;

  const plan = record.get(MEMBER_FIELDS.plan);

  return {
    recordId: record.id,
    memberNo: String(record.get(MEMBER_FIELDS.memberNo) ?? ''),
    fullName: String(record.get(MEMBER_FIELDS.fullName) ?? ''),
    email: String(record.get(MEMBER_FIELDS.email) ?? ''),
    plan: typeof plan === 'string' ? plan : String((plan as { name?: string })?.name ?? ''),
    boxFolderUrl: (record.get('Box_Folder') as string) ?? null,
    stripeCustomerId: (record.get('Stripe_Customer_ID') as string) ?? null,
    startedAt: (record.get(MEMBER_FIELDS.createdAt) as string) ?? null,
  };
}

export async function hasSubmittedThisMonth(memberRecordId: string): Promise<{
  submitted: boolean;
  receivedOn: string | null;
}> {
  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const records = await base()(TABLES.submissions)
    .select({
      filterByFormula: `AND(
        FIND('${memberRecordId}', ARRAYJOIN({${SUBMISSION_FIELDS.memberLink}})),
        IS_AFTER({${SUBMISSION_FIELDS.submittedOn}}, '${from}')
      )`,
      maxRecords: 1,
    })
    .firstPage();

  const record = records[0];
  if (!record) return { submitted: false, receivedOn: null };

  return {
    submitted: true,
    receivedOn: (record.get(SUBMISSION_FIELDS.submittedOn) as string) ?? null,
  };
}

export function monthsSince(iso: string | null): number | null {
  if (!iso) return null;
  const start = new Date(iso);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return months >= 0 ? months + 1 : null;
}
