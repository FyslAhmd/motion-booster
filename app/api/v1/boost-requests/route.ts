import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

type PlacementValue = 'facebook' | 'instagram' | 'whatsapp';
type LocationValue = 'all_country' | 'bangladesh';
type GenderValue = 'male' | 'female';
type AudienceLanguageValue = 'en' | 'bn' | 'hindi';

type NormalizedBoostSetup = {
  placements: PlacementValue[];
  location: LocationValue | null;
  minAge: number | null;
  maxAge: number | null;
  gender: GenderValue | null;
  audienceLanguages: AudienceLanguageValue[];
  notes: string;
  hasStructuredValues: boolean;
};

const PLACEMENT_LABELS: Record<PlacementValue, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
};

const LOCATION_LABELS: Record<LocationValue, string> = {
  all_country: 'All Country',
  bangladesh: 'Bangladesh (BD)',
};

const GENDER_LABELS: Record<GenderValue, string> = {
  male: 'Male',
  female: 'Female',
};

const AUDIENCE_LANGUAGE_LABELS: Record<AudienceLanguageValue, string> = {
  en: 'English',
  bn: 'Bangla',
  hindi: 'Hindi',
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const uniqueValues = <T,>(values: T[]): T[] => {
  const seen = new Set<T>();
  const output: T[] = [];
  values.forEach((value) => {
    if (seen.has(value)) return;
    seen.add(value);
    output.push(value);
  });
  return output;
};

const normalizePlacement = (value: unknown): PlacementValue | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.toLowerCase().trim();
  if (normalized === 'facebook' || normalized === 'instagram' || normalized === 'whatsapp') {
    return normalized;
  }
  return null;
};

const normalizeLocation = (value: unknown): LocationValue | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.toLowerCase().trim();
  if (normalized === 'all_country' || normalized === 'bangladesh') return normalized;
  return null;
};

const normalizeGender = (value: unknown): GenderValue | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.toLowerCase().trim();
  if (normalized === 'male' || normalized === 'female') return normalized;
  return null;
};

const normalizeAudienceLanguage = (value: unknown): AudienceLanguageValue | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.toLowerCase().trim();
  if (normalized === 'en' || normalized === 'bn' || normalized === 'hindi') return normalized;
  return null;
};

const normalizeAge = (value: unknown): number | null => {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number.parseInt(value, 10)
      : Number.NaN;
  if (!Number.isFinite(parsed)) return null;
  return Math.max(18, Math.min(65, Math.trunc(parsed)));
};

const normalizeBoostSetup = (payload: Record<string, unknown>): NormalizedBoostSetup => {
  const placements = Array.isArray(payload.placements)
    ? uniqueValues(payload.placements.map(normalizePlacement).filter((value): value is PlacementValue => Boolean(value)))
    : [];

  const location = normalizeLocation(payload.location);
  const minAge = normalizeAge(payload.minAge);
  const normalizedMaxAge = normalizeAge(payload.maxAge);
  const maxAge = normalizedMaxAge !== null && minAge !== null
    ? Math.max(minAge, normalizedMaxAge)
    : normalizedMaxAge;
  const gender = normalizeGender(payload.gender);

  const audienceLanguages = Array.isArray(payload.audienceLanguages)
    ? uniqueValues(payload.audienceLanguages.map(normalizeAudienceLanguage).filter((value): value is AudienceLanguageValue => Boolean(value)))
    : [];

  const notes = typeof payload.notes === 'string' ? payload.notes.trim() : '';

  const hasStructuredValues = placements.length > 0 ||
    location !== null ||
    minAge !== null ||
    maxAge !== null ||
    gender !== null ||
    audienceLanguages.length > 0 ||
    notes.length > 0;

  return {
    placements,
    location,
    minAge,
    maxAge,
    gender,
    audienceLanguages,
    notes,
    hasStructuredValues,
  };
};

const buildTargetAudienceFromSetup = (setup: NormalizedBoostSetup, fallbackAudience: string): string => {
  if (!setup.hasStructuredValues) return fallbackAudience.trim();

  const lines: string[] = [];

  if (setup.placements.length > 0) {
    lines.push(`Placements: ${setup.placements.map((value) => PLACEMENT_LABELS[value]).join(', ')}`);
  }

  if (setup.location) {
    lines.push(`Location: ${LOCATION_LABELS[setup.location]}`);
  }

  if (setup.minAge !== null) {
    if (setup.maxAge !== null) {
      lines.push(`Age: ${setup.minAge}-${setup.maxAge}`);
    } else {
      lines.push(`Age: ${setup.minAge}+`);
    }
  }

  if (setup.gender) {
    lines.push(`Gender: ${GENDER_LABELS[setup.gender]}`);
  }

  if (setup.audienceLanguages.length > 0) {
    lines.push(`Language: ${setup.audienceLanguages.map((value) => AUDIENCE_LANGUAGE_LABELS[value]).join(', ')}`);
  }

  if (setup.notes) {
    lines.push(`Notes: ${setup.notes}`);
  }

  return lines.join('\n').trim();
};

// ─── POST: User submits a boost request ──────────────
export async function POST(req: NextRequest) {
  const user = await validateRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    const parsed = await req.json();
    if (isPlainObject(parsed)) {
      body = parsed;
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const language = body.language === 'bn' ? 'bn' : 'en';
  const postLink = typeof body.postLink === 'string' ? body.postLink.trim() : '';
  const totalBudget = typeof body.totalBudget === 'string' ? body.totalBudget.trim() : '';
  const dailyBudget = typeof body.dailyBudget === 'string' ? body.dailyBudget.trim() : '';
  const fallbackAudience = typeof body.targetAudience === 'string' ? body.targetAudience : '';
  const setup = normalizeBoostSetup(body);
  const targetAudience = buildTargetAudienceFromSetup(setup, fallbackAudience);

  if (!totalBudget || !dailyBudget || !targetAudience) {
    return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
  }

  const record = await prisma.boostRequest.create({
    data: {
      userId: user.id,
      language,
      postLink,
      totalBudget,
      dailyBudget,
      targetAudience,
    },
    include: { user: { select: { id: true, fullName: true, email: true, phone: true, username: true } } },
  });

  return NextResponse.json(record, { status: 201 });
}

// ─── GET: Admin lists all boost requests (paginated + searchable) ──
export async function GET(req: NextRequest) {
  const user = await validateRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const search = (searchParams.get('search') || '').trim();

  const searchWhere = search
    ? {
        OR: [
          { postLink: { contains: search, mode: 'insensitive' as const } },
          { targetAudience: { contains: search, mode: 'insensitive' as const } },
          { user: { fullName: { contains: search, mode: 'insensitive' as const } } },
          { user: { email: { contains: search, mode: 'insensitive' as const } } },
          { user: { phone: { contains: search, mode: 'insensitive' as const } } },
        ],
      }
    : {};

  const where = user.role === 'ADMIN'
    ? searchWhere
    : {
        userId: user.id,
        ...(searchWhere as object),
      };

  const [total, items] = await Promise.all([
    prisma.boostRequest.count({ where }),
    prisma.boostRequest.findMany({
      where,
      include: { user: { select: { id: true, fullName: true, email: true, phone: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
