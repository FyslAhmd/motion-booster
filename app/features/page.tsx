'use client';

import { useLanguage } from '@/lib/lang/LanguageContext';
import FeaturesPageBN from './FeaturesPageBN';
import FeaturesPageEN from './FeaturesPageEN';

export default function FeaturesPage() {
  const { language } = useLanguage();

  if (language === 'BN') {
    return <FeaturesPageBN />;
  }

  return <FeaturesPageEN />;
}
