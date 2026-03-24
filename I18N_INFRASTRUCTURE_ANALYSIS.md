# Motion Booster - Internationalization (i18n) Infrastructure Analysis

**Date:** March 24, 2026  
**Status:** INITIAL SETUP - Not Yet Fully Implemented  
**Supported Languages:** English (EN), Bengali (BN)

---

## 📋 Executive Summary

The project has a **foundation laid for i18n** but it is **NOT actively implemented** in the UI yet. There's a translations structure in place, but most UI strings remain hardcoded in English. Language switching exists in two locations but doesn't affect the displayed content.

### Current State:
- ✅ Translation file exists with EN/BN pairs
- ✅ Language switching UI present
- ✅ Database model supports language preference
- ❌ Translations not hooked into components
- ❌ No language context provider
- ❌ No persistent language preference management
- ❌ No locale routing or middleware support

---

## 1. TRANSLATION FILES & STRUCTURE

### Location
```
lib/lang/
  └── translations.ts
```

### File Contents
File: [lib/lang/translations.ts](lib/lang/translations.ts)

**Structure:**
```typescript
export const translations = {
  EN: {
    // Header / Navigation
    nav_home: 'Home',
    nav_about: 'About us',
    nav_features: 'Features',
    // ... 80+ translation keys
  },
  BN: {
    // Bengali translations
    nav_home: 'হোম',
    nav_about: 'আমাদের সম্পর্কে',
    nav_features: 'বৈশিষ্ট্য',
    // ... corresponding Bengali strings
  },
} as const;

export type TranslationKey = keyof typeof translations.EN;
```

### Translation Coverage

**Total Translation Keys:** 100+ key-value pairs

**Sections Covered:**
1. **Navigation & Header** (11 keys)
   - nav_home, nav_about, nav_features, nav_service, nav_blog, nav_contact, nav_team, nav_more
   - login, search_title, notifications

2. **Hero Section** (6 keys)
   - hero_heading, hero_highlight, hero_subtext, hero_cta_primary, hero_cta_secondary, hero_trust

3. **Features Section** (9 keys)
   - features_heading, features_subtext, feature_[1-4]_title, feature_[1-4]_desc, features_learn_more

4. **How It Works Section** (6 keys)
   - how_heading, how_step[1-3]_title, how_step[1-3]_desc

5. **Service Section** (2 keys)
   - service_heading, service_subtext

6. **CTA Section** (3 keys)
   - cta_heading, cta_subtext, cta_button, cta_trust

7. **FAQ Section** (1 key)
   - faq_heading

8. **Statistics/Testimonials** (13 keys)
   - stat_[1-6]_value, stat_[1-6]_title, stat_[1-6]_desc, testimonials_reviews_heading

9. **Footer** (25+ keys)
   - footer_cta_*, footer_contact, footer_head_office, footer_quick_links
   - footer_link_*, footer_svc_*, footer_other_*

10. **Page-Specific** (10+ keys)
    - about_hero_*, blog_heading, contact_badge, features_page_*, service_page_*
    - portfolio_heading, team_heading, etc.

### Sample Translations (EN ↔ BN)

| English | Bengali |
|---------|---------|
| `nav_home: 'Home'` | `nav_home: 'হোম'` |
| `hero_heading: 'Manage Your Clients' Meta Ads in One Place'` | `hero_heading: 'আপনার ক্লায়েন্টদের মেটা অ্যাড পরিচালনা করুন এক জায়গায়'` |
| `feature_1_title: 'Expert Team'` | `feature_1_title: 'বিশেষজ্ঞ দল'` |
| `cta_button: 'Enroll Now'` | `cta_button: 'এখনই ভর্তি হন'` |

---

## 2. LANGUAGE SWITCHING UI

### Location 1: Header Component
**File:** [components/layout/Header.tsx](components/layout/Header.tsx#L14)

**Current Implementation:**
```tsx
const [language, setLanguage] = useState('EN');

// Desktop top bar language switcher (lines 191-210)
<div className="flex items-center gap-2">
  <button
    onClick={() => setLanguage('BN')}
    className={`px-3 py-1 rounded-md font-medium transition-colors ${
      language === 'BN' ? 'bg-white text-red-600' : 'hover:bg-red-700'
    }`}
  >
    BN
  </button>
  <button
    onClick={() => setLanguage('EN')}
    className={`px-3 py-1 rounded-md font-medium transition-colors ${
      language === 'EN' ? 'bg-white text-red-600' : 'hover:bg-red-700'
    }`}
  >
    EN
  </button>
</div>
```

**Issues:**
- Language state is local to the Header component only
- Changes don't propagate to other components
- No persistence (resets on page reload)
- Buttons are visible only on desktop (hidden on lg:block)

### Location 2: MoreDrawer Component
**File:** [components/ui/MoreDrawer.tsx](components/ui/MoreDrawer.tsx#L122)

**Current Implementation:**
```tsx
{/* Language */}
<div className="px-4 border-b border-gray-100">
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
        <Globe className="w-5 h-5 text-red-500" />
      </div>
      <span className="font-semibold text-gray-800">Language</span>
    </div>
    <div className="flex items-center bg-gray-100 rounded-full p-1 text-xs font-bold">
      <span className="px-2 py-0.5 bg-white rounded-full text-red-500 shadow-sm">BN</span>
      <span className="px-2 py-0.5 text-gray-500">EN</span>
    </div>
  </div>
</div>
```

**Issues:**
- Display only (read-only UI, no click handlers)
- Hardcoded to show BN as selected
- No functionality

---

## 3. DATABASE SCHEMA

### User Model
**File:** [prisma/schema.prisma](prisma/schema.prisma#L412)

```prisma
model User {
  id            String     @id @default(cuid())
  username      String     @unique
  email         String     @unique
  fullName      String
  phone         String     @unique
  passwordHash  String
  role          UserRole   @default(USER)
  status        UserStatus @default(ACTIVE)
  emailVerified Boolean    @default(false)
  avatarUrl     String?
  adsAccess     Boolean    @default(false)
  lastLoginAt   DateTime?
  lastLoginIp   String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  // ... relations
}
```

**Note:** No language field in User model (unlike BoostRequest which has it)

### BoostRequest Model
**File:** [prisma/schema.prisma](prisma/schema.prisma#L412)

```prisma
model BoostRequest {
  id             String   @id @default(cuid())
  userId         String
  language       String   @default("en")    // ← "en" | "bn"
  postLink       String
  totalBudget    String
  dailyBudget    String
  targetAudience String
  createdAt      DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}
```

**Notes:**
- BoostRequest has language field (stores user's language preference for that boost)
- User model doesn't have language field (missing!)
- Audience languages also tracked: `BoostAudienceLanguage = 'en' | 'bn' | 'hindi'`

---

## 4. HARDCODED UI COMPONENTS

### Components NOT Using Translations

**Public Page Components:**

| Component | File | Issue |
|-----------|------|-------|
| Hero | [components/sections/Hero.tsx](components/sections/Hero.tsx) | All text hardcoded in English |
| Features | [components/sections/Features.tsx](components/sections/Features.tsx) | Feature titles and descriptions hardcoded |
| Portfolio | [app/portfolio/page.tsx](app/portfolio/page.tsx) | All labels hardcoded ("All", "Projects", etc.) |
| Navigation Items | [components/layout/Header.tsx](components/layout/Header.tsx#L107) | Menu labels hardcoded (`{ label: 'Home', href: '/' }`) |
| MoreDrawer | [components/ui/MoreDrawer.tsx](components/ui/MoreDrawer.tsx#L18) | Menu items hardcoded (`{ label: 'About Us', icon: Info, href: '/about' }`) |

**Dashboard Components:**
- All admin dashboard pages
- All user pages (settings, profile, etc.)
- Chat interface

### Example - Hero Component
```tsx
// File: components/sections/Hero.tsx
<h1 className="text-3xl sm:text-4xl...">
  Manage Your Clients&apos; Meta Ads in{' '}
  <span className="relative inline-block">
    One Place  {/* ← HARDCODED */}
  </span>
</h1>

<p className="text-base sm:text-lg...">
  {/* ← HARDCODED */}
  The all-in-one platform for agencies to track ad spending, 
  communicate with clients, and share reports - all in one beautiful dashboard
</p>

<Button variant="primary" href="/register">
  Get Started Free  {/* ← HARDCODED */}
</Button>
```

---

## 5. CURRENT SETUP & PROVIDERS

### App Layout
**File:** [app/layout.tsx](app/layout.tsx)

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">  {/* ← Fixed to "en" */}
      <body>
        <SiteDataProvider>
          <AuthProvider>
            <Toaster position="top-right" richColors />
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AuthProvider>
        </SiteDataProvider>
      </body>
    </html>
  );
}
```

**Providers:**
1. **SiteDataProvider** - Manages site settings, services, team, FAQs (no i18n support)
2. **AuthProvider** - Handles authentication (no language field tracked)
3. **Toaster** - Toast notifications (from sonner library)
4. **ConditionalLayout** - Renders different layouts based on route

### Missing
- ❌ No LanguageProvider or LanguageContext
- ❌ No i18n library (next-i18n-router, react-i18next, etc.)
- ❌ No middleware for locale handling
- ❌ No language persistence mechanism

---

## 6. DASHBOARD CHAT PAGE

**File:** [app/dashboard/chat/page.tsx](app/dashboard/chat/page.tsx#L74)

**Language Support for Ad Boosts:**
```tsx
type BoostAudienceLanguage = 'en' | 'bn' | 'hindi';

interface BoostRequest {
  audienceLanguages: BoostAudienceLanguage[];
}

// Sample data:
const boostData = {
  audienceLanguages: ['en', 'bn'],
};

// Language selector in form:
// langTitle: 'Select Language',
// body: JSON.stringify({ language: boostLang, ...boostData })
```

**Note:** This is specifically for Meta Ads audience language targeting, NOT for UI localization.

---

## 7. PACKAGE.json ANALYSIS

**Current i18n Dependencies:** NONE

```json
{
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    // ... other deps, but NO i18n libraries
  }
}
```

**Missing Libraries:**
- ❌ `next-i18n-router` - For I18n in Next.js App Router
- ❌ `react-i18next` - Popular i18n library
- ❌ `i18next` - Core i18n library
- ❌ `intl` - Browser internationalization
- ❌ Transifex, Crowdin, or other translation management tools

---

## 8. ENVIRONMENT & CONFIGURATION

### Middleware
**File:** [middleware.ts](middleware.ts)

**Current:** Only handles authentication and authorization  
**Missing:** No locale routing or i18n middleware logic

### Next.js Config
**File:** [next.config.ts](next.config.ts)

**Current:** Standard Next.js configuration  
**Missing:** No i18n configuration (i18n.locales, defaultLocale, etc.)

### HTML Root Element
**Current in Layout:**
```tsx
<html lang="en" data-scroll-behavior="smooth">
```

**Issue:** Hardcoded to "en", should be dynamic based on user language

---

## 9. MISSING UI STRINGS NEEDING LOCALIZATION

### Pages Missing Translations:

1. **About Page** - `about_hero_heading`, `about_hero_subtext`
2. **Blog Page** - `blog_heading`, `blog_subtext`
3. **Contact Page** - `contact_badge`, `contact_heading`, `contact_subtext`
4. **Features Page** - `features_page_badge`, `features_page_heading`
5. **Service Page** - `service_page_heading`, `service_page_subtext`
6. **Portfolio Page** - `portfolio_heading`, `portfolio_subtext`
7. **Team Page** - `team_heading`
8. **Dashboard** - No translations at all for error messages, form labels, table headers, modals, etc.

### Common UI Elements Missing:
- ❌ Form labels and placeholders
- ❌ Button texts
- ❌ Error messages
- ❌ Success/info messages
- ❌ Modal titles and descriptions
- ❌ Table headers
- ❌ Empty states
- ❌ Validation messages
- ❌ Confirmation dialogs

---

## 10. LOCALIZATION GAPS

### What's NOT Localized:

| Category | Status | Example |
|----------|--------|---------|
| Navigation menus | ❌ Hardcoded | "Home", "About us" in Header |
| Page titles & headings | ❌ Hardcoded | Hero section title |
| Button labels | ❌ Hardcoded | "Get Started Free", "Watch Demo" |
| Footer | ❌ Has translations but not used | Footer links are hardcoded |
| Dates/Times | ❌ Not localized | No locale-specific formatting |
| Numbers/Currency | ❌ Not localized | `toLocaleString()` used but inconsistent |
| Forms | ❌ All hardcoded | No i18n for form fields |
| Errors | ❌ Hardcoded | API errors likely in English |
| RTL Support | ❌ None | No right-to-left layout support for Bengali |
| Fonts | ⚠️ Partial | System fonts, no Bengali-specific font stack |

---

## 11. IMPLEMENTATION STATUS CHECKLIST

### ✅ Foundation (Complete)
- [x] Translation file created (translations.ts)
- [x] EN and BN language pairs defined
- [x] Translation type exported (TranslationKey)
- [x] Database schema has language fields (BoostRequest)
- [x] UI components for language switching exist

### ⚠️ In Progress / Incomplete
- [ ] Language context provider not implemented
- [ ] Components not using translations
- [ ] No language persistence
- [ ] No SSR/hydration strategy
- [ ] No URL-based locale routing
- [ ] Middleware not handling locales

### ❌ Not Started
- [ ] RTL support for Bengali
- [ ] Bengali font stack configuration
- [ ] Date/time localization
- [ ] Number/currency formatting per locale
- [ ] Form validation messages in multiple languages
- [ ] Error messages in multiple languages
- [ ] Locale cookie/localStorage strategy
- [ ] Translation management workflow
- [ ] Testing for multiple languages
- [ ] Internationalization documentation for team

---

## 12. RECOMMENDED NEXT STEPS

### Phase 1: Create Language Context (Foundation)
1. Create `LanguageContext` in `lib/lang/context.tsx`
2. Add language provider to root layout
3. Store preference in localStorage and user profile
4. Initialize app language from user preferences or browser locale

### Phase 2: Wire Up Components (Integration)
1. Export translation accessor function from `translations.ts`
2. Update all public-facing components to use translations
3. Add translations for missing strings (forms, errors, etc.)
4. Test language switching across pages

### Phase 3: Database Persistence (Backend)
1. Add `language` field to User model in Prisma
2. Add migration script
3. Update auth endpoints to save user language preference
4. Implement language update endpoint in profile page

### Phase 4: Advanced Features (Polish)
1. Implement RTL support for Bengali views
2. Add locale-specific date/time formatting
3. Add locale-specific number formatting
4. Add Bengali font stack (e.g., Noto Sans Bengali)
5. Implement URL-based locale routing (optional)

### Phase 5: Completeness (Quality)
1. Translation audit - verify all keys are complete
2. Add missing translations (dashboard, forms, errors)
3. Create translation management workflow
4. Add i18n unit tests
5. Document i18n strategy for team

---

## 13. AVAILABLE TRANSLATION KEYS (REFERENCE)

### Navigation
- `nav_home`, `nav_about`, `nav_features`, `nav_service`, `nav_blog`, `nav_contact`, `nav_team`, `nav_more`, `login`, `search_title`, `notifications`

### Hero
- `hero_heading`, `hero_highlight`, `hero_subtext`, `hero_cta_primary`, `hero_cta_secondary`, `hero_trust`

### Features
- `features_heading`, `features_subtext`, `feature_1_title`, `feature_1_desc`, `feature_2_title`, `feature_2_desc`, `feature_3_title`, `feature_3_desc`, `feature_4_title`, `feature_4_desc`, `features_learn_more`

### How It Works
- `how_heading`, `how_step1_title`, `how_step1_desc`, `how_step2_title`, `how_step2_desc`, `how_step3_title`, `how_step3_desc`

### Service
- `service_heading`, `service_subtext`

### CTA
- `cta_heading`, `cta_subtext`, `cta_button`, `cta_trust`

### Stats
- `stat_1_value` through `stat_6_value`, `stat_1_title` through `stat_6_title`, `stat_1_desc` through `stat_6_desc`

### Footer
- `footer_*` - 25+ keys for footer content, links, and services

### Pages
- `about_hero_*`, `blog_heading`, `blog_subtext`, `contact_*`, `features_page_*`, `service_page_*`, `portfolio_*`, `team_heading`

---

## 14. CONFIGURATION FILES & STRUCTURE

### Key Files for i18n:
```
Motion Booster/
├── lib/
│   └── lang/
│       └── translations.ts         ← Translation pairs (EN/BN)
├── components/
│   ├── layout/
│   │   └── Header.tsx             ← Language switcher (non-functional)
│   └── ui/
│       └── MoreDrawer.tsx          ← Language display (read-only)
├── app/
│   ├── layout.tsx                 ← Root layout (lang="en" hardcoded)
│   └── [pages]/                   ← All pages with hardcoded text
├── prisma/
│   └── schema.prisma              ← BoostRequest has language field
└── middleware.ts                  ← Auth only, no i18n
```

### Missing Files (To Be Created):
```
lib/
└── lang/
    ├── context.tsx                ← NEW: Language context provider
    ├── hooks.ts                   ← NEW: useLanguage, useTranslation hooks
    └── utils.ts                   ← NEW: Helper functions for getting translations
```

---

## 15. SUMMARY TABLE

| Aspect | Status | Notes |
|--------|--------|-------|
| **Translation Structure** | ✅ Complete | EN/BN pairs defined |
| **Translation Keys** | ⚠️ Partial | 100+ keys but missing dashboard strings |
| **Language UI Switcher** | ⚠️ Non-functional | Buttons present but don't change content |
| **Language Context** | ❌ Missing | No provider for app-wide language |
| **Component Integration** | ❌ Not started | All components hardcoded in English |
| **Persistence** | ❌ Missing | No localStorage or user preference storage |
| **Database Schema** | ⚠️ Incomplete | BoostRequest has it, User model doesn't |
| **i18n Library** | ❌ Not installed | No next-i18n-router or react-i18next |
| **RTL Support** | ❌ Not implemented | Bengali layout not right-to-left |
| **Locale Routing** | ❌ Not implemented | No /en/ or /bn/ routes |
| **Middleware Support** | ❌ Missing | No locale detection or routing |
| **Testing** | ❌ Not started | No i18n-specific tests |
| **Documentation** | ⚠️ Minimal | Translations.ts exported but undocumented |

---

## 📝 Conclusion

The Motion Booster project has **laid good groundwork** for internationalization with comprehensive EN/BN translation pairs, but the infrastructure is **disconnected and non-functional**. The language switcher UI exists but doesn't affect content. To achieve full i18n support, the next phase should focus on:

1. Creating a centralized Language Context
2. Wiring up components to use translations
3. Persisting language preferences
4. Adding missing translation keys
5. Implementing RTL and locale-specific formatting

**Estimated Effort:** 2-3 weeks for full implementation (depending on scope and team size)

---

**Generated:** March 24, 2026
