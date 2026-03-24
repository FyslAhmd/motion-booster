# i18n Quick Reference Guide

## 🚀 Quick Start

### Use in Any Component
```TypeScript
'use client';

import { useLanguage } from '@/lib/lang/LanguageContext';

export const MyComponent = () => {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('my_translation_key')}</h1>
      <button onClick={() => setLanguage('BN')}>বাংলা</button>
      <button onClick={() => setLanguage('EN')}>English</button>
      <p>Current: {language}</p>
    </div>
  );
};
```

---

## 📚 Available Translation Keys

### Navigation
- `nav_home` - Home
- `nav_about` - About us  
- `nav_features` - Features
- `nav_service` - Service
- `nav_blog` - Blog
- `nav_contact` - Contact
- `nav_team` - Team

### Hero Section
- `hero_heading` - Main heading
- `hero_highlight` - Highlighted text
- `hero_subtext` - Description
- `hero_cta_primary` - Primary button text
- `hero_cta_secondary` - Secondary button text
- `hero_trust` - Trust badge text

### Features
- `features_heading` - Section title
- `features_subtext` - Section description
- `features_learn_more` - Learn more link
- `feature_1_title`, `feature_1_desc` - Feature 1
- `feature_2_title`, `feature_2_desc` - Feature 2
- `feature_3_title`, `feature_3_desc` - Feature 3
- `feature_4_title`, `feature_4_desc` - Feature 4

### Menu Items
- `menu_about` - About Us
- `menu_team` - Our Team
- `menu_services` - Our Services
- `menu_blog` - Blog
- `menu_portfolio` - Portfolio
- `menu_faq` - FAQ
- `menu_contact` - Contact Us
- `menu_privacy` - Privacy Policy
- `menu_feedback` - Feedback & Suggestions

### Footer
- `footer_cta_heading` - CTA heading
- `footer_link_home`, `footer_link_services`, `footer_link_about`, etc.

---

## ➕ Adding New Translations

### Step 1: Add Key to Both Languages
Edit `lib/lang/translations.ts`:

```typescript
export const translations = {
  EN: {
    // ... existing keys ...
    my_new_feature: 'My Feature Title',
  },
  BN: {
    // ... existing keys ...
    my_new_feature: 'আমার বৈশিষ্ট্যের শিরোনাম',
  },
} as const;
```

### Step 2: Use in Component
```typescript
const { t } = useLanguage();
return <h2>{t('my_new_feature')}</h2>;
```

---

## 🎯 Key Patterns

### Conditional Translation
```typescript
const message = language === 'BN' ? 'বাংলা' : 'English';
```

### Translation with Dynamic Content
```typescript
// Add to translations.ts
welcome_user: 'Welcome {name}'

// In component - note: currently simple (use string interpolation)
const name = 'John';
const greeting = `${t('welcome_message')} ${name}`;
```

### Form Labels (Example)
```typescript
// Add to translations.ts
form_email: 'Email Address',
form_password: 'Password',
form_submit: 'Submit',

// In component
<label>{t('form_email')}</label>
<input type="email" />
```

---

## 🌐 Language Codes
- **EN** - English
- **BN** - Bengali

---

## 💾 Storage
Language preference is automatically saved to browser localStorage as `language` key.

---

## 🔧 LanguageContext API

```typescript
// Hook
const { language, setLanguage, t } = useLanguage();

// current language: 'EN' | 'BN'
language

// Change language
setLanguage('EN');
setLanguage('BN');

// Get translation
t('key_name'); // Returns translated string
```

---

## ⚠️ Important Rules

1. **Always use `'use client'`** at top of component using useLanguage()
2. **LanguageProvider must wrap component** - It's in app/layout.tsx
3. **Translation keys are case-sensitive** - Use exact key names
4. **Fallback to English** - Missing BN translations fall back to EN

---

## 🧪 Testing

### Test Language Switch
1. Open app in browser
2. Click BN button in header
3. Verify all text updates to Bengali
4. Click EN button
5. Verify text returns to English

### Test Persistence
1. Switch to Bengali
2. Refresh page
3. Should still be in Bengali
4. Close/reopen browser
5. Should remember Bengali

---

## 📖 Common Components by Language

| Component | EN Path | BN Path | Status |
|-----------|---------|---------|--------|
| Header | ✅ Translated | ✅ Translated | ✅ Done |
| Hero | ✅ Translated | ✅ Translated | ✅ Done |
| Features | ✅ Translated | ✅ Translated | ✅ Done |
| Menu | ✅ Translated | ✅ Translated | ✅ Done |
| Footer | 📝 Partial | 📝 Partial | 🔄 In Progress |
| Dashboard | ⏳ Not Started | ⏳ Not Started | ⏳ Todo |

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| `useLanguage must be used within a LanguageProvider` | Make sure component has `'use client'` at top |
| Translations not updating | Check component is in `/app`, not `/server-only` |
| localStorage warning in SSR | Normal - localStorage works on client only |
| Missing translation key | Add key to both EN and BN in translations.ts |
| Bengali text showing as `?` | Ensure .ts file is saved as UTF-8 |

---

## 📝 Translation Checklist

When preparing new feature:
- [ ] Add EN translation keys to translations.ts
- [ ] Add BN translation keys to translations.ts
- [ ] Component has `'use client'` directive
- [ ] Component imports `useLanguage`
- [ ] Component destructures `{ t }`
- [ ] Replace hardcoded strings with `t('key')`
- [ ] Test in both languages
- [ ] Test localStorage persistence
- [ ] Verify Bengali text renders correctly

---

**Need help?** Check `I18N_IMPLEMENTATION.md` for detailed guide.
