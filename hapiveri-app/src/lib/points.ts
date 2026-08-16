import Airtable from 'airtable';
import { TABLES } from './airtable';

export const POINT_FIELDS = {
  key: 'fldycxGnvZwnIlamh',
  yearMonth: 'fld2LU6fXHImpSXOU',
  memberLink: 'fld6EvrAtd6UlqUg3',
  stepDays: 'fld2Gfq1EB4XdoCPD',
  stepPoints: 'fldnReJXtzfFQ1qAm',
  sleepDays: 'fldLmLnS4GgZ0JqL1',
  sleepPoints: 'fld6OL97Qh7z4ETFp',
  mealWeeks: 'fldeRVLacf4XyuZFw',
  mealPoints: 'fldxlTx0CC2DLepTW',
  bioFlag: 'fldZwMgWhujofckok',
  bioPoints: 'fldvOrFFczc9ZRUAx',
  total: 'fldnAZjw8PXD7TR7x',
  status: 'fldVqF1tgFHRNfDiS',
  grantedAt: 'fldq7llvS1Bk3lnnU',
} as const;

const BASE_ID = process.env.AIRTABLE_BASE_ID ?? 'appKNS9pYMdFlsVA1';

let cached: Airtable.Base | null = null;

function base(): Airtable.Base {
  if (cached) return cached;
  const key = process.env.AIRTABLE_API_KEY;
  if (!key) throw new Error('AIRTABLE_API_KEY is not set');
  cached = new Airtable({ apiKey: key }).base(BASE_ID);
  return cached;
}

export type BreakdownRow = {
  kind: 'step' | 'sleep' | 'meal' | 'bio';
  label: string;
  count: string;
  points: number;
  empty: boolean;
};

export type PointSummary = {
  balance: number;
  yearMonth: string | null;
  breakdown: BreakdownRow[];
};

function num(record: Airtable.Record<Airtable.FieldSet>, field: string): number {
  const value = record.get(field);
  return typeof value === 'number' ? value : 0;
}

export async function getPointSummary(memberRecordId: string): Promise<PointSummary> {
  const records = await base()(TABLES.points)
    .select({
      filterByFormula: `FIND('${memberRecordId}', ARRAYJOIN({${POINT_FIELDS.memberLink}}))`,
      sort: [{ field: POINT_FIELDS.yearMonth, direction: 'desc' }],
      maxRecords: 24,
    })
    .firstPage();

  const balance = records.reduce((sum, r) => sum + num(r, POINT_FIELDS.total), 0);
  const latest = records[0];

  if (!latest) {
    return { balance, yearMonth: null, breakdown: [] };
  }

  const stepDays = num(latest, POINT_FIELDS.stepDays);
  const sleepDays = num(latest, POINT_FIELDS.sleepDays);
  const mealWeeks = num(latest, POINT_FIELDS.mealWeeks);
  const bioPoints = num(latest, POINT_FIELDS.bioPoints);

  const breakdown: BreakdownRow[] = [
    {
      kind: 'step',
      label: '歩数達成',
      count: stepDays > 0 ? `${stepDays}日` : '—',
      points: num(latest, POINT_FIELDS.stepPoints),
      empty: stepDays === 0,
    },
    {
      kind: 'sleep',
      label: '睡眠達成',
      count: sleepDays > 0 ? `${sleepDays}日` : '—',
      points: num(latest, POINT_FIELDS.sleepPoints),
      empty: sleepDays === 0,
    },
    {
      kind: 'meal',
      label: '食事データ',
      count: mealWeeks > 0 ? `${mealWeeks}週` : '—',
      points: num(latest, POINT_FIELDS.mealPoints),
      empty: mealWeeks === 0,
    },
    {
      kind: 'bio',
      label: 'バイオ',
      count: bioPoints > 0 ? 'あり' : '—',
      points: bioPoints,
      empty: bioPoints === 0,
    },
  ];

  return {
    balance,
    yearMonth: (latest.get(POINT_FIELDS.yearMonth) as string) ?? null,
    breakdown,
  };
}
