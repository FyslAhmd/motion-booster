export function pickLocalizedText(
  language: 'EN' | 'BN',
  enValue: string | null | undefined,
  bnValue?: string | null | undefined,
) {
  if (language === 'BN') {
    const normalizedBn = (bnValue || '').trim();
    if (normalizedBn) return normalizedBn;
  }

  return (enValue || '').trim();
}

export function pickLocalizedList<T>(
  language: 'EN' | 'BN',
  enValues: T[] | null | undefined,
  bnValues?: T[] | null | undefined,
) {
  if (language === 'BN' && Array.isArray(bnValues) && bnValues.length > 0) {
    return bnValues;
  }

  return Array.isArray(enValues) ? enValues : [];
}
