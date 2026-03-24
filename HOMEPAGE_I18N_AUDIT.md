# Home Page Internationalization (i18n) Audit

## Summary
**Status:** 45% translated (2 of 15 components fully translated)  
**Pages Affected:** Home page and all sections  
**Total Hardcoded Strings:** 60+ English-only text strings requiring translation keys

---

## Component-by-Component Analysis

### ✅ ALREADY TRANSLATED (2 Components)

#### 1. **Hero.tsx** → Components: `components/sections/Hero.tsx`
- ✅ Uses `useLanguage()` hook
- ✅ All text using translation keys:
  - `hero_heading`: "Manage Your Clients' Meta Ads in"
  - `hero_highlight`: "One Place"
  - `hero_subtext`: Platform description
  - `hero_cta_primary`: "Get Started Free"
  - `hero_cta_secondary`: "Watch Demo"
  - `hero_trust`: "No credit card required • 14-day free trial"
  - `features_learn_more`: Button text

#### 2. **Features.tsx** → Components: `components/sections/Features.tsx`
- ✅ Uses `useLanguage()` hook
- ✅ All feature cards translated:
  - `features_heading`: "Why Choose Motion Booster"
  - `features_subtext`: Description
  - `feature_1_title` - `feature_4_title`: Feature titles
  - `feature_1_desc` - `feature_4_desc`: Feature descriptions
  - `features_learn_more`: "Learn More" button

---

### ❌ COMPONENTS WITH HARDCODED TEXT (13 Components)

#### 3. **app/page.tsx** (Home Page Layout)
**Location:** [app/page.tsx](app/page.tsx#L23-L33)

**Hardcoded Strings:**
| Line | Text | Translation Key |
|------|------|-----------------|
| 23-24 | "Grow your business identity with" | `need_translation_home_banner_heading_part1` |
| 24 | "Motion Booster" | `need_translation_home_banner_highlight` |
| 27-31 | "We provide a complete suite of digital solutions..." (full paragraph) | `need_translation_home_banner_description` |

**Status:** Inline text in JSX (mobile-only display)

---

#### 4. **HeaderBanner.tsx** → [components/sections/HeaderBanner.tsx](components/sections/HeaderBanner.tsx#L10-L50)
**Hardcoded Strings:**

| Line | Text | Translation Key |
|------|------|-----------------|
| 10-14 | Slider image data: "South Asia's Best IT Institute", "45+ Trendy Courses", "20000+ Students Enrolled" | `need_translation_banner_badge_1`, `banner_badge_2`, `banner_badge_3` |
| 11, 12, 13 | "Awarded 2024", "Expert Mentors", "Join Today" | `banner_year_1`, `banner_year_2`, `banner_year_3` |
| 70 | Badge: "✓ Unleash Your Potential" | `banner_badge_unleash` |
| 72-75 | Heading: "Grow your business identity with Motion Booster" | `banner_heading` (same as Hero, but hardcoded here) |
| 76-79 | Description paragraph | `banner_description` (same as page.tsx, but hardcoded) |
| 83-84 | Button: "Browse Service" | `banner_button_browse` |
| 88 | Button: "Get Started" | `banner_button_get_started` |

**Status:** Desktop-only section, no translation integration

---

#### 5. **CategorySlider.tsx** → [components/sections/CategorySlider.tsx](components/sections/CategorySlider.tsx#L60)
**Hardcoded Strings:**

| Line | Text | Translation Key |
|------|------|-----------------|
| 60 | Heading: "Our Service" | `section_category_heading` |

**Status:** Simple heading, easy to translate

---

#### 6. **PopularCourses.tsx** → [components/sections/PopularCourses.tsx](components/sections/PopularCourses.tsx#L80-L95)
**Hardcoded Strings:**

| Line | Text | Translation Key |
|------|------|-----------------|
| 81 | Heading: "Our Popular Services" | `popular_services_heading` |
| 84 | Description: "We provide comprehensive digital solutions..." | `popular_services_description` |
| 87 | Tab label: "All Services" | `tab_all_services` |
| Multiple | Tab labels auto-generated from API | (Dynamic, no translation) |
| 169 | Button: "Read More" | `button_read_more` |

**Status:** Mix of hardcoded strings and dynamic API data

---

#### 7. **CompanyMarquee.tsx** → [components/sections/CompanyMarquee.tsx](components/sections/CompanyMarquee.tsx#L69)
**Hardcoded Strings:**

| Line | Text | Translation Key |
|------|------|-----------------|
| 69 | Heading: "Trusted by Top Clients" | `section_companies_heading` |

**Status:** Simple heading

---

#### 8. **AchievementStats.tsx** → [components/sections/AchievementStats.tsx](components/sections/AchievementStats.tsx#L119-L124)
**Hardcoded Strings:**

| Line | Text | Translation Key |
|------|------|-----------------|
| 119 | Heading: "Our Achievements" | `achievements_heading` |
| 122 | Description: "Numbers that speak for our success and commitment to excellence" | `achievements_description` |

**Status:** Hardcoded headings; stat data comes from API

---

#### 9. **Testimonials.tsx** → [components/sections/Testimonials.tsx](components/sections/Testimonials.tsx#L106-L112)
**Hardcoded Strings:**

| Line | Text | Translation Key |
|------|------|-----------------|
| 106 | Heading: "What Our Clients Say" | `testimonials_heading` |
| 109 | Description: "Real feedback from our valued clients who trusted Motion Booster with their digital journey." | `testimonials_description` |

**Status:** Section headings hardcoded; testimonial content from API

---

#### 10. **Portfolio.tsx** → [components/sections/Portfolio.tsx](components/sections/Portfolio.tsx#L49-L72)
**Hardcoded Strings:**

| Line | Text | Translation Key |
|------|------|-----------------|
| 49 | Heading: "Our Portfolio" | `portfolio_heading` (ALREADY IN TRANSLATIONS!) |
| 52 | Description: "Explore our latest projects and success stories" | `portfolio_subtext` (ALREADY IN TRANSLATIONS!) |
| 64 | Button: "View All Projects" | `button_view_all_projects` |
| 159 | Button: "Live Preview" | `button_live_preview` |

**Status:** Headings already in translations file but not being used!

---

#### 11. **FAQ.tsx** → [components/sections/FAQ.tsx](components/sections/FAQ.tsx#L41)
**Hardcoded Strings:**

| Line | Text | Translation Key |
|------|------|-----------------|
| 41 | Heading: "Answers to Your Frequently Asked Questions" | `faq_heading` (ALREADY IN TRANSLATIONS!) |

**Status:** Translation key already exists but not being used!

---

#### 12. **WelcomeModal.tsx** → [components/ui/WelcomeModal.tsx](components/ui/WelcomeModal.tsx#L7-L8)
**Hardcoded Defaults:**

| Line | Text | Translation Key |
|------|------|-----------------|
| 7 | DEFAULT_MODAL_TITLE: "Welcome to Motion Booster! 👋" | `welcome_modal_title_default` |
| 8 | DEFAULT_MODAL_BODY: "We help businesses grow with creative branding..." | `welcome_modal_body_default` |
| 136 | Heading in modal: "Motion Booster" | (Part of default title) |

**Note:** Actual modal content comes from API settings, but fallback defaults are hardcoded

**Status:** Fallback defaults need translation keys

---

#### 13. **FloatingCallButton.tsx** → [components/ui/FloatingCallButton.tsx](components/ui/FloatingCallButton.tsx#L38-L69)
**Hardcoded Strings:**

| Line | Text | Translation Key |
|------|------|-----------------|
| 38 | Button text: "Contact Us" | `button_contact_us` |
| 49 | aria-label: "Contact us" | `aria_contact_us` |
| 54 | Modal heading: "Contact Us" | `modal_contact_heading` |
| 59 | Modal description: "You are welcome to visit our office for any information related to Service. You can also reach us through the hotline number or messenger." | `modal_contact_description` |
| 76 | aria-label: "Close" | `aria_close` |
| 88 | Link text: "WhatsApp" | `button_whatsapp` |
| 96 | Link text: "Messenger" | `button_messenger` (likely in the second half of file) |

**Status:** Multiple hardcoded UI strings

---

#### 14. **FloatingSocialButtons.tsx** → [components/ui/FloatingSocialButtons.tsx](components/ui/FloatingSocialButtons.tsx#L5-L40)
**Hardcoded Strings (aria-labels):**

| Line | Text | Translation Key |
|------|------|-----------------|
| 5 | aria-label: "LinkedIn" | `aria_linkedin` |
| 5 | aria-label: "Facebook" | `aria_facebook` |
| 5 | aria-label: "YouTube" | `aria_youtube` |
| 5 | aria-label: "Instagram" | `aria_instagram` |
| 22 | aria-label: "Scroll to top" | `aria_scroll_to_top` |
| 39 | aria-label: "Toggle social links" | `aria_toggle_social_links` |

**Status:** Accessibility labels not translated

---

#### 15. **HeroSlider.tsx** → [components/sections/HeroSlider.tsx](components/sections/HeroSlider.tsx)
**Status:** ✅ NO hardcoded strings (gets data from API `/api/v1/cms/hero-slides`)

---

## Summary Table

| Component | Status | # of Strings | Translation Ready |
|-----------|--------|-----|----|
| Hero.tsx | ✅ Translated | 6 | YES (useLanguage) |
| Features.tsx | ✅ Translated | 6 | YES (useLanguage) |
| app/page.tsx | ❌ Hardcoded | 3 | NO |
| HeaderBanner.tsx | ❌ Hardcoded | 9 | NO |
| CategorySlider.tsx | ❌ Hardcoded | 1 | NO |
| PopularCourses.tsx | ❌ Hardcoded | 4 | NO |
| CompanyMarquee.tsx | ❌ Hardcoded | 1 | NO |
| AchievementStats.tsx | ❌ Hardcoded | 2 | NO |
| Testimonials.tsx | ❌ Hardcoded | 2 | NO |
| Portfolio.tsx | ❌ Mixed | 4 | PARTIAL (keys exist but not used) |
| FAQ.tsx | ❌ Hardcoded | 1 | PARTIAL (key exists) |
| WelcomeModal.tsx | ❌ Hardcoded | 2 | NO |
| FloatingCallButton.tsx | ❌ Hardcoded | 7 | NO |
| FloatingSocialButtons.tsx | ❌ Hardcoded | 6 | NO |
| **TOTAL** | | **59** | **45% Done** |

---

## Complete List of Translation Keys Needed

### Already Exist in translations.ts ✅
- `portfolio_heading` (not used in Portfolio.tsx)
- `portfolio_subtext` (not used in Portfolio.tsx)
- `faq_heading` (not used in FAQ.tsx)

### Need to Add (New Translation Keys Required)

#### Section Headings & Descriptions
- `section_category_heading` → "Our Service"
- `popular_services_heading` → "Our Popular Services"
- `popular_services_description` → "We provide comprehensive digital solutions to help your business grow..."
- `tab_all_services` → "All Services"
- `section_companies_heading` → "Trusted by Top Clients"
- `achievements_heading` → "Our Achievements"
- `achievements_description` → "Numbers that speak for our success and commitment to excellence"
- `testimonials_heading` → "What Our Clients Say"
- `testimonials_description` → "Real feedback from our valued clients who trusted Motion Booster..."

#### Buttons & UI Text
- `banner_button_browse` → "Browse Service"
- `banner_button_get_started` → "Get Started"
- `button_read_more` → "Read More"
- `button_view_all_projects` → "View All Projects"
- `button_live_preview` → "Live Preview"
- `button_contact_us` → "Contact Us"
- `button_whatsapp` → "WhatsApp"
- `button_messenger` → "Messenger"

#### Home Page Banners
- `banner_heading` → "Grow your business identity with Motion Booster"
- `banner_description` → "We provide a complete suite of digital solutions..."
- `banner_badge_unleash` → "✓ Unleash Your Potential"
- `banner_badge_1` → "South Asia's Best IT Institute"
- `banner_badge_2` → "45+ Trendy Courses"
- `banner_badge_3` → "20000+ Students Enrolled"
- `banner_year_1` → "Awarded 2024"
- `banner_year_2` → "Expert Mentors"
- `banner_year_3` → "Join Today"

#### Welcome Modal
- `welcome_modal_title_default` → "Welcome to Motion Booster! 👋"
- `welcome_modal_body_default` → "We help businesses grow with creative branding, motion graphics, web development & digital marketing."

#### Contact Modal
- `modal_contact_heading` → "Contact Us"
- `modal_contact_description` → "You are welcome to visit our office for any information related to Service. You can also reach us through the hotline number or messenger."

#### Accessibility Labels (aria-labels)
- `aria_scroll_to_top` → "Scroll to top"
- `aria_toggle_social_links` → "Toggle social links"
- `aria_close` → "Close"
- `aria_linkedin` → "LinkedIn"
- `aria_facebook` → "Facebook"
- `aria_youtube` → "YouTube"
- `aria_instagram` → "Instagram"
- `aria_contact_us` → "Contact us"

---

## Implementation Priority

### Phase 1 (Critical - Main Content)
1. HeaderBanner.tsx - Desktop hero section
2. app/page.tsx - Mobile hero section
3. CategorySlider.tsx - Service categories
4. PopularCourses.tsx - Services section
5. Portfolio.tsx - Use existing translation keys
6. FAQ.tsx - Use existing translation key

### Phase 2 (Important - Supporting)
7. CompanyMarquee.tsx
8. AchievementStats.tsx
9. Testimonials.tsx
10. WelcomeModal.tsx

### Phase 3 (Nice-to-Have - Accessibility)
11. FloatingCallButton.tsx - All text
12. FloatingSocialButtons.tsx - aria-labels

---

## Files to Modify

**Update translations.ts:**
- Add ~35 new translation keys (EN + BN versions)

**Update components (add useLanguage hook):**
- [HeaderBanner.tsx](components/sections/HeaderBanner.tsx)
- [app/page.tsx](app/page.tsx)
- [CategorySlider.tsx](components/sections/CategorySlider.tsx)
- [PopularCourses.tsx](components/sections/PopularCourses.tsx)
- [CompanyMarquee.tsx](components/sections/CompanyMarquee.tsx)
- [AchievementStats.tsx](components/sections/AchievementStats.tsx)
- [Testimonials.tsx](components/sections/Testimonials.tsx)
- [Portfolio.tsx](components/sections/Portfolio.tsx) - Use existing keys
- [FAQ.tsx](components/sections/FAQ.tsx) - Use existing key
- [WelcomeModal.tsx](components/ui/WelcomeModal.tsx)
- [FloatingCallButton.tsx](components/ui/FloatingCallButton.tsx)
- [FloatingSocialButtons.tsx](components/ui/FloatingSocialButtons.tsx)

---

## Notes
- HeroSlider.tsx loads content from API, no translation needed
- Testimonials and Portfolio content from API, only section headers need translation
- AchievementStats gets stat values from API, only headers need translation
- Category and service names from API, no translation needed at this layer
