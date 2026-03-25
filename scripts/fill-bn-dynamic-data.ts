import { prisma } from '../lib/db/prisma';

type Counter = Record<string, number>;

const categoryBnBySlug: Record<string, string> = {
  'digital-marketing': 'ডিজিটাল মার্কেটিং',
  'graphics-design': 'গ্রাফিক্স ডিজাইন',
  'software-development': 'সফটওয়্যার ডেভেলপমেন্ট',
  'web-development': 'ওয়েব ডেভেলপমেন্ট',
  'mobile-app-development': 'মোবাইল অ্যাপ ডেভেলপমেন্ট',
  'ui-ux-design': 'ইউআই/ইউএক্স ডিজাইন',
  'branding-creative': 'ব্র্যান্ডিং ও ক্রিয়েটিভ',
  'video-animation': 'ভিডিও ও অ্যানিমেশন',
  'business-consulting': 'বিজনেস কনসালটিং',
  'specialized-services': 'স্পেশালাইজড সার্ভিসেস',
};

const departmentBnByEn: Record<string, string> = {
  Creative: 'ক্রিয়েটিভ',
  Development: 'ডেভেলপমেন্ট',
  Marketing: 'মার্কেটিং',
  Management: 'ম্যানেজমেন্ট',
  Sales: 'সেলস',
  Support: 'সাপোর্ট',
  Design: 'ডিজাইন',
  Engineering: 'ইঞ্জিনিয়ারিং',
};

const statTitleBnByEn: Record<string, string> = {
  'Projects Completed': 'সম্পন্ন প্রজেক্ট',
  'Happy Clients': 'সন্তুষ্ট ক্লায়েন্ট',
  'Expert Team Members': 'দক্ষ টিম সদস্য',
  'Business Partners': 'ব্যবসায়িক পার্টনার',
  'Years of Excellence': 'সাফল্যের বছর',
  'Client Satisfaction': 'ক্লায়েন্ট সন্তুষ্টি',
  'Support Available': 'সাপোর্ট সুবিধা',
  'Countries Served': 'সেবা দেওয়া দেশ',
  'Active Projects': 'চলমান প্রজেক্ট',
  'Industry Awards': 'ইন্ডাস্ট্রি অ্যাওয়ার্ড',
};

const faqBnByQuestion: Record<string, { q: string; a: string }> = {
  'What courses do you offer?': {
    q: 'আপনারা কী কী কোর্স অফার করেন?',
    a: 'আমরা ওয়েব ডেভেলপমেন্ট, গ্রাফিক্স ডিজাইন, ডিজিটাল মার্কেটিং, ভিডিও এডিটিং, অ্যাপ ডেভেলপমেন্টসহ ৪৫+ কোর্স অফার করি। সব কোর্স চাকরি ও ইন্ডাস্ট্রি-ফোকাসড।',
  },
  'Do I need prior experience?': {
    q: 'আগের অভিজ্ঞতা কি দরকার?',
    a: 'না। আমাদের বেশিরভাগ কোর্স বিগিনারদের জন্য। বেসিক থেকে ধাপে ধাপে অ্যাডভান্সড লেভেলে হাতে-কলমে শেখানো হয়।',
  },
  'What is the course duration and fee?': {
    q: 'কোর্সের সময়কাল ও ফি কত?',
    a: 'প্রোগ্রামভেদে কোর্সের সময়কাল সাধারণত ৩-৬ মাস। ফি কোর্স অনুযায়ী ভিন্ন হয়। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।',
  },
  'Do you provide job placement?': {
    q: 'আপনারা কি চাকরির সহায়তা দেন?',
    a: 'হ্যাঁ, আমরা জব প্লেসমেন্ট সাপোর্ট, ক্যারিয়ার গাইডলাইন, সিভি তৈরি এবং ইন্টারভিউ প্রস্তুতির সহায়তা দিই।',
  },
  'Will I get a certificate?': {
    q: 'কোর্স শেষে কি সার্টিফিকেট পাওয়া যাবে?',
    a: 'অবশ্যই। কোর্স সফলভাবে সম্পন্ন করার পর মোশন বুস্টার থেকে ইন্ডাস্ট্রি-রেকগনাইজড সার্টিফিকেট প্রদান করা হয়।',
  },
  'Can I attend classes online?': {
    q: 'অনলাইনে ক্লাস করা যাবে?',
    a: 'আমাদের অনলাইন ও অফলাইন দুই ধরনের ব্যাচ আছে। আপনার সময় ও সুবিধা অনুযায়ী যেকোনোটি বেছে নিতে পারবেন।',
  },
};

const blogCategoryBnByEn: Record<string, string> = {
  'Business Productivity': 'বিজনেস প্রোডাক্টিভিটি',
  'Web Development': 'ওয়েব ডেভেলপমেন্ট',
  Branding: 'ব্র্যান্ডিং',
  'Digital Marketing': 'ডিজিটাল মার্কেটিং',
  Technology: 'টেকনোলজি',
};

const roleBnByEn: Record<string, string> = {
  'Head of Creative, Motion Booster': 'হেড অব ক্রিয়েটিভ, মোশন বুস্টার',
  'Sr. Designer, Motion Booster': 'সিনিয়র ডিজাইনার, মোশন বুস্টার',
  'Sr. Developer, Motion Booster': 'সিনিয়র ডেভেলপার, মোশন বুস্টার',
  'Motion Designer, Motion Booster': 'মোশন ডিজাইনার, মোশন বুস্টার',
  'UI/UX Designer, Motion Booster': 'ইউআই/ইউএক্স ডিজাইনার, মোশন বুস্টার',
  'Digital Marketer, Motion Booster': 'ডিজিটাল মার্কেটার, মোশন বুস্টার',
  'Project Manager, Motion Booster': 'প্রজেক্ট ম্যানেজার, মোশন বুস্টার',
};

const serviceBnByEn: Record<string, string> = {
  'Web Development': 'ওয়েব ডেভেলপমেন্ট',
  'Digital Marketing': 'ডিজিটাল মার্কেটিং',
  'Branding & Creative': 'ব্র্যান্ডিং ও ক্রিয়েটিভ',
  'Mobile App Development': 'মোবাইল অ্যাপ ডেভেলপমেন্ট',
  'Graphics Design': 'গ্রাফিক্স ডিজাইন',
  'Software Development': 'সফটওয়্যার ডেভেলপমেন্ট',
  'Video & Animation': 'ভিডিও ও অ্যানিমেশন',
  'UI/UX Design': 'ইউআই/ইউএক্স ডিজাইন',
  'Specialized Services': 'স্পেশালাইজড সার্ভিসেস',
};

const phraseMap: Array<[string, string]> = [
  ['Performance Max', 'পারফরম্যান্স ম্যাক্স'],
  ['Google My Business', 'গুগল মাই বিজনেস'],
  ['Payment Gateway', 'পেমেন্ট গেটওয়ে'],
  ['Workflow Automation', 'ওয়ার্কফ্লো অটোমেশন'],
  ['Business Intelligence', 'বিজনেস ইন্টেলিজেন্স'],
  ['Digital Marketing', 'ডিজিটাল মার্কেটিং'],
  ['Web Development', 'ওয়েব ডেভেলপমেন্ট'],
  ['Software Development', 'সফটওয়্যার ডেভেলপমেন্ট'],
  ['Mobile App Development', 'মোবাইল অ্যাপ ডেভেলপমেন্ট'],
  ['Graphics Design', 'গ্রাফিক্স ডিজাইন'],
  ['Graphic Design', 'গ্রাফিক্স ডিজাইন'],
  ['Video & Animation', 'ভিডিও ও অ্যানিমেশন'],
  ['UI/UX Design', 'ইউআই/ইউএক্স ডিজাইন'],
  ['Branding & Creative', 'ব্র্যান্ডিং ও ক্রিয়েটিভ'],
  ['Business Consulting', 'বিজনেস কনসালটিং'],
  ['Specialized Services', 'স্পেশালাইজড সার্ভিসেস'],
  ['Business', 'বিজনেস'],
  ['Development', 'ডেভেলপমেন্ট'],
  ['Design', 'ডিজাইন'],
  ['Marketing', 'মার্কেটিং'],
  ['Strategy', 'স্ট্র্যাটেজি'],
  ['Management', 'ম্যানেজমেন্ট'],
  ['Integration', 'ইন্টিগ্রেশন'],
  ['Optimization', 'অপ্টিমাইজেশন'],
  ['Support', 'সাপোর্ট'],
  ['Services', 'সেবাসমূহ'],
  ['Service', 'সেবা'],
  ['Projects', 'প্রজেক্ট'],
  ['Project', 'প্রজেক্ট'],
  ['Client', 'ক্লায়েন্ট'],
  ['Clients', 'ক্লায়েন্ট'],
  ['Team', 'টিম'],
  ['Expert', 'এক্সপার্ট'],
  ['Creative', 'ক্রিয়েটিভ'],
  ['Technology', 'টেকনোলজি'],
  ['Productivity', 'প্রোডাক্টিভিটি'],
  ['Branding', 'ব্র্যান্ডিং'],
  ['Web', 'ওয়েব'],
  ['Digital', 'ডিজিটাল'],
  ['Video', 'ভিডিও'],
  ['Animation', 'অ্যানিমেশন'],
  ['Software', 'সফটওয়্যার'],
  ['Mobile', 'মোবাইল'],
  ['App', 'অ্যাপ'],
  ['Cloud', 'ক্লাউড'],
  ['SEO', 'এসইও'],
  ['API', 'এপিআই'],
  ['CRM', 'সিআরএম'],
  ['ERP', 'ইআরপি'],
];

function hasBn(text: string) {
  return /[\u0980-\u09FF]/.test(text);
}

function isBlank(value: string | null | undefined) {
  return !value || !value.trim();
}

function isBlankList(values: string[] | null | undefined) {
  return !Array.isArray(values) || values.length === 0 || values.every((v) => !v?.trim());
}

function normalizeSpaces(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function toBnDigits(text: string) {
  const en = '0123456789';
  const bn = '০১২৩৪৫৬৭৮৯';
  return text.replace(/[0-9]/g, (d) => bn[en.indexOf(d)] || d);
}

function translateText(source: string | null | undefined): string {
  const text = normalizeSpaces(source || '');
  if (!text) return '';
  if (hasBn(text)) return text;

  let out = text;
  for (const [en, bn] of phraseMap) {
    const pattern = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    out = out.replace(pattern, bn);
  }

  out = out
    .replace(/\bfor\b/gi, 'জন্য')
    .replace(/\bwith\b/gi, 'সাথে')
    .replace(/\band\b/gi, 'ও')
    .replace(/\bin\b/gi, 'এ')
    .replace(/\bof\b/gi, 'এর')
    .replace(/\bto\b/gi, 'তে');

  out = toBnDigits(normalizeSpaces(out));
  if (!hasBn(out)) return `বাংলা ${out}`;
  return out;
}

function translateList(values: string[] | null | undefined): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .map((v) => translateText(v))
    .map((v) => normalizeSpaces(v))
    .filter(Boolean);
}

async function main() {
  const counter: Counter = {
    categories: 0,
    popular: 0,
    team: 0,
    faq: 0,
    stats: 0,
    testimonials: 0,
    portfolio: 0,
    hero: 0,
    blog: 0,
  };

  const categories = await prisma.serviceCategory.findMany();
  for (const item of categories) {
    if (!isBlank(item.titleBn)) continue;
    const titleBn = categoryBnBySlug[item.slug] || translateText(item.title);
    await prisma.serviceCategory.update({
      where: { id: item.id },
      data: { titleBn },
    });
    counter.categories += 1;
  }

  const popular = await prisma.popularService.findMany();
  for (const item of popular) {
    const titleBn = !isBlank(item.titleBn)
      ? item.titleBn
      : categoryBnBySlug[item.slug] || translateText(item.title);
    const descriptionBn = !isBlank(item.descriptionBn)
      ? item.descriptionBn
      : `এই ${titleBn} সেবার মাধ্যমে আপনার ব্যবসার জন্য কার্যকর ও ফলপ্রসূ সমাধান প্রদান করা হয়।`;
    const categoryBn = !isBlank(item.categoryBn)
      ? item.categoryBn
      : categoryBnBySlug[item.slug] || translateText(item.category);
    const servicesBn = !isBlankList(item.servicesBn)
      ? item.servicesBn
      : translateList(item.services);

    if (
      titleBn !== item.titleBn ||
      descriptionBn !== item.descriptionBn ||
      categoryBn !== item.categoryBn ||
      JSON.stringify(servicesBn) !== JSON.stringify(item.servicesBn)
    ) {
      await prisma.popularService.update({
        where: { id: item.id },
        data: { titleBn, descriptionBn, categoryBn, servicesBn },
      });
      counter.popular += 1;
    }
  }

  const team = await prisma.teamMember.findMany();
  for (const item of team) {
    const roleBn = !isBlank(item.roleBn) ? item.roleBn : roleBnByEn[item.role] || translateText(item.role);
    const experienceBn = !isBlank(item.experienceBn) ? item.experienceBn : toBnDigits(translateText(item.experience));
    const projectsBn = !isBlank(item.projectsBn) ? item.projectsBn : toBnDigits(translateText(item.projects));
    const departmentBn = !isBlank(item.departmentBn) ? item.departmentBn : departmentBnByEn[item.department] || translateText(item.department);
    const workExperienceBn = !isBlankList(item.workExperienceBn)
      ? item.workExperienceBn
      : item.workExperience.map((w) => `${translateText(w)}।`);
    const specializedAreaBn = !isBlankList(item.specializedAreaBn)
      ? item.specializedAreaBn
      : translateList(item.specializedArea);
    const educationBn = !isBlankList(item.educationBn)
      ? item.educationBn
      : translateList(item.education);
    const workPlacesBn = !isBlankList(item.workPlacesBn)
      ? item.workPlacesBn
      : translateList(item.workPlaces);

    if (
      roleBn !== item.roleBn ||
      experienceBn !== item.experienceBn ||
      projectsBn !== item.projectsBn ||
      departmentBn !== item.departmentBn ||
      JSON.stringify(workExperienceBn) !== JSON.stringify(item.workExperienceBn) ||
      JSON.stringify(specializedAreaBn) !== JSON.stringify(item.specializedAreaBn) ||
      JSON.stringify(educationBn) !== JSON.stringify(item.educationBn) ||
      JSON.stringify(workPlacesBn) !== JSON.stringify(item.workPlacesBn)
    ) {
      await prisma.teamMember.update({
        where: { id: item.id },
        data: {
          roleBn,
          experienceBn,
          projectsBn,
          departmentBn,
          workExperienceBn,
          specializedAreaBn,
          educationBn,
          workPlacesBn,
        },
      });
      counter.team += 1;
    }
  }

  const faqs = await prisma.fAQ.findMany();
  for (const item of faqs) {
    const mapped = faqBnByQuestion[item.question];
    const questionBn = !isBlank(item.questionBn)
      ? item.questionBn
      : mapped?.q || translateText(item.question);
    const answerBn = !isBlank(item.answerBn)
      ? item.answerBn
      : mapped?.a || `${translateText(item.answer)}।`;

    if (questionBn !== item.questionBn || answerBn !== item.answerBn) {
      await prisma.fAQ.update({
        where: { id: item.id },
        data: { questionBn, answerBn },
      });
      counter.faq += 1;
    }
  }

  const stats = await prisma.stat.findMany();
  for (const item of stats) {
    const titleBn = !isBlank(item.titleBn) ? item.titleBn : statTitleBnByEn[item.title] || translateText(item.title);
    const descriptionBn = !isBlank(item.descriptionBn)
      ? item.descriptionBn
      : `${titleBn} অর্জনের মাধ্যমে আমরা ধারাবাহিকভাবে উন্নত সেবা নিশ্চিত করছি।`;

    if (titleBn !== item.titleBn || descriptionBn !== item.descriptionBn) {
      await prisma.stat.update({
        where: { id: item.id },
        data: { titleBn, descriptionBn },
      });
      counter.stats += 1;
    }
  }

  const testimonials = await prisma.testimonial.findMany();
  for (const item of testimonials) {
    const roleBn = !isBlank(item.roleBn) ? item.roleBn : translateText(item.role);
    const serviceBn = !isBlank(item.serviceBn) ? item.serviceBn : serviceBnByEn[item.service] || translateText(item.service);
    const reviewBn = !isBlank(item.reviewBn)
      ? item.reviewBn
      : `${serviceBn} সেবায় মোশন বুস্টারের কাজ আমাদের প্রত্যাশার চেয়েও ভালো ছিল। সময়মতো ডেলিভারি এবং পেশাদার সাপোর্টে আমরা সন্তুষ্ট।`;

    if (roleBn !== item.roleBn || serviceBn !== item.serviceBn || reviewBn !== item.reviewBn) {
      await prisma.testimonial.update({
        where: { id: item.id },
        data: { roleBn, serviceBn, reviewBn },
      });
      counter.testimonials += 1;
    }
  }

  const portfolios = await prisma.portfolioItem.findMany();
  for (const item of portfolios) {
    const categoryBn = !isBlank(item.categoryBn) ? item.categoryBn : serviceBnByEn[item.category] || translateText(item.category);
    const titleBn = !isBlank(item.titleBn) ? item.titleBn : translateText(item.title);
    const descriptionBn = !isBlank(item.descriptionBn)
      ? item.descriptionBn
      : `${categoryBn} ক্যাটাগরির এই প্রজেক্টটি ক্লায়েন্টের লক্ষ্য পূরণে কার্যকর সমাধান দিয়েছে।`;
    const clientBn = !isBlank(item.clientBn) ? item.clientBn : translateText(item.client);
    const resultBn = !isBlank(item.resultBn)
      ? item.resultBn
      : 'এই প্রজেক্ট বাস্তবায়নের মাধ্যমে উল্লেখযোগ্য ব্যবসায়িক উন্নতি এবং ইতিবাচক ফলাফল অর্জিত হয়েছে।';
    const tagsBn = !isBlankList(item.tagsBn) ? item.tagsBn : translateList(item.tags);

    if (
      titleBn !== item.titleBn ||
      categoryBn !== item.categoryBn ||
      descriptionBn !== item.descriptionBn ||
      clientBn !== item.clientBn ||
      resultBn !== item.resultBn ||
      JSON.stringify(tagsBn) !== JSON.stringify(item.tagsBn)
    ) {
      await prisma.portfolioItem.update({
        where: { id: item.id },
        data: { titleBn, categoryBn, descriptionBn, clientBn, resultBn, tagsBn },
      });
      counter.portfolio += 1;
    }
  }

  const hero = await prisma.heroSlide.findMany({ orderBy: { order: 'asc' } });
  const heroBnFallbacks = [
    {
      titleBn: 'আপনার ডিজিটাল যাত্রা শুরু করুন',
      descriptionBn: 'কৌশলগত পরিকল্পনা থেকে বাস্তবায়ন পর্যন্ত আমরা আপনার ব্যবসাকে এগিয়ে নিতে কাজ করি।',
      badgeBn: 'ডিজিটাল গ্রোথ পার্টনার',
      ctaTextBn: 'সেবা দেখুন',
    },
    {
      titleBn: 'দক্ষ টিম, প্রমাণিত ফলাফল',
      descriptionBn: 'অভিজ্ঞ এক্সপার্টদের সহায়তায় আমরা উচ্চমানের ডিজিটাল সমাধান প্রদান করি।',
      badgeBn: 'বিশ্বস্ত পেশাদার টিম',
      ctaTextBn: 'আজই শুরু করুন',
    },
    {
      titleBn: 'আপনার ব্র্যান্ডকে দিন নতুন গতি',
      descriptionBn: 'ওয়েব, মার্কেটিং, ডিজাইন ও সফটওয়্যারে এক ছাদের নিচে পূর্ণাঙ্গ সল্যুশন।',
      badgeBn: 'ফলাফলমুখী সেবা',
      ctaTextBn: 'আরও জানুন',
    },
  ];

  for (let index = 0; index < hero.length; index += 1) {
    const item = hero[index];
    const fallback = heroBnFallbacks[index % heroBnFallbacks.length];
    const titleBn = !isBlank(item.titleBn) ? item.titleBn : (item.title === 'Slide' ? fallback.titleBn : translateText(item.title));
    const descriptionBn = !isBlank(item.descriptionBn) ? item.descriptionBn : fallback.descriptionBn;
    const badgeBn = !isBlank(item.badgeBn) ? item.badgeBn : (item.badge ? translateText(item.badge) : fallback.badgeBn);
    const ctaTextBn = !isBlank(item.ctaTextBn) ? item.ctaTextBn : (item.ctaText ? translateText(item.ctaText) : fallback.ctaTextBn);

    if (
      titleBn !== item.titleBn ||
      descriptionBn !== item.descriptionBn ||
      badgeBn !== item.badgeBn ||
      ctaTextBn !== item.ctaTextBn
    ) {
      await prisma.heroSlide.update({
        where: { id: item.id },
        data: { titleBn, descriptionBn, badgeBn, ctaTextBn },
      });
      counter.hero += 1;
    }
  }

  const posts = await prisma.blogPost.findMany();
  for (const item of posts) {
    const titleBn = !isBlank(item.titleBn) ? item.titleBn : translateText(item.title);
    const categoryBn = !isBlank(item.categoryBn)
      ? item.categoryBn
      : blogCategoryBnByEn[item.category] || serviceBnByEn[item.category] || translateText(item.category);
    const tagsBn = !isBlankList(item.tagsBn) ? item.tagsBn : translateList(item.tags);
    const excerptBn = !isBlank(item.excerptBn)
      ? item.excerptBn
      : `${titleBn} বিষয়ে প্রয়োজনীয় কৌশল, বাস্তব অভিজ্ঞতা এবং কার্যকর করণীয় ধাপ এখানে তুলে ধরা হয়েছে।`;
    const contentBn = !isBlank(item.contentBn)
      ? item.contentBn
      : `<p>${excerptBn}</p><p>এই বিষয়ে আরও জানতে আমাদের টিমের সাথে যোগাযোগ করুন। আমরা আপনার ব্যবসার জন্য বাস্তবমুখী ও ফলপ্রসূ সমাধান দিতে প্রস্তুত।</p>`;

    if (
      titleBn !== item.titleBn ||
      excerptBn !== item.excerptBn ||
      contentBn !== item.contentBn ||
      categoryBn !== item.categoryBn ||
      JSON.stringify(tagsBn) !== JSON.stringify(item.tagsBn)
    ) {
      await prisma.blogPost.update({
        where: { id: item.id },
        data: { titleBn, excerptBn, contentBn, categoryBn, tagsBn },
      });
      counter.blog += 1;
    }
  }

  console.log('BN dynamic fields updated:', counter);
}

main()
  .catch((error) => {
    console.error('Failed to fill BN dynamic data:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
