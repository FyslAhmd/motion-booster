import { prisma } from '../lib/db/prisma';

const testimonials = [
  {
    name: 'Rafiq Ahmed',
    role: 'CEO, TechVenture BD',
    avatar: 'RA',
    avatarBg: 'from-blue-500 to-indigo-600',
    avatarImage: null,
    rating: 5,
    review: 'Motion Booster transformed our entire digital presence. Their web development team built us a stunning e-commerce platform that increased our sales by 200%.',
    service: 'Web Development',
    order: 0,
  },
  {
    name: 'Fatima Khatun',
    role: 'Founder, GreenLeaf Organics',
    avatar: 'FK',
    avatarBg: 'from-green-500 to-emerald-600',
    avatarImage: null,
    rating: 5,
    review: 'The digital marketing team helped us reach 50,000+ customers in just 3 months. Their Facebook and Google Ads strategy was brilliant. Our ROI increased by 340%!',
    service: 'Digital Marketing',
    order: 1,
  },
  {
    name: 'Tanvir Hasan',
    role: 'MD, BuildRight Construction',
    avatar: 'TH',
    avatarBg: 'from-orange-500 to-red-600',
    avatarImage: null,
    rating: 5,
    review: 'We needed a complete brand identity and Motion Booster delivered beyond expectations. From logo to marketing materials, everything was cohesive and professional.',
    service: 'Branding & Creative',
    order: 2,
  },
  {
    name: 'Nusrat Jahan',
    role: 'Co-founder, EduTech Solutions',
    avatar: 'NJ',
    avatarBg: 'from-purple-500 to-pink-600',
    avatarImage: null,
    rating: 5,
    review: 'Motion Booster built our mobile app from scratch using Flutter. The app handles 10,000+ daily users seamlessly. They delivered on time with transparent process.',
    service: 'Mobile App Development',
    order: 3,
  },
  {
    name: 'Kamal Uddin',
    role: 'Owner, KamalFoods International',
    avatar: 'KU',
    avatarBg: 'from-teal-500 to-cyan-600',
    avatarImage: null,
    rating: 5,
    review: 'SEO work brought our website from page 5 to page 1 on Google within 4 months. Our organic traffic grew by 500%. Their content marketing strategy is world-class.',
    service: 'Digital Marketing',
    order: 4,
  },
  {
    name: 'Sadia Rahman',
    role: 'Creative Director, PixelStudio',
    avatar: 'SR',
    avatarBg: 'from-pink-500 to-rose-600',
    avatarImage: null,
    rating: 5,
    review: 'Their graphics design quality is on par with international standards. Logo designs, social media creatives, packaging — they handle everything with perfection.',
    service: 'Graphics Design',
    order: 5,
  },
  {
    name: 'Mohammad Ali',
    role: 'CTO, FinanceHub BD',
    avatar: 'MA',
    avatarBg: 'from-indigo-500 to-blue-600',
    avatarImage: null,
    rating: 5,
    review: 'Motion Booster developed a custom CRM system for our financial services. The software handles complex workflows effortlessly. Robust and reliable solution.',
    service: 'Software Development',
    order: 6,
  },
  {
    name: 'Ayesha Begum',
    role: 'Marketing Head, FashionBD',
    avatar: 'AB',
    avatarBg: 'from-yellow-500 to-amber-600',
    avatarImage: null,
    rating: 5,
    review: 'The video production team created stunning product videos for our fashion brand. Social media engagement increased by 300% after using their video content.',
    service: 'Video & Animation',
    order: 7,
  },
  {
    name: 'Imran Khan',
    role: 'Startup Founder, HealthFirst',
    avatar: 'IK',
    avatarBg: 'from-red-500 to-orange-600',
    avatarImage: null,
    rating: 5,
    review: 'From UI/UX design to full-stack development, Motion Booster handled our healthcare app end-to-end. The user interface is intuitive and patients love it.',
    service: 'UI/UX Design',
    order: 8,
  },
  {
    name: 'Rubina Akter',
    role: 'Director, GlobalTrade BD',
    avatar: 'RA',
    avatarBg: 'from-emerald-500 to-teal-600',
    avatarImage: null,
    rating: 5,
    review: 'They set up our entire AWS cloud infrastructure and CI/CD pipelines. Deployment time reduced from hours to minutes. Their specialized team is highly skilled.',
    service: 'Specialized Services',
    order: 9,
  },
];

async function main() {
  console.log('Clearing testimonials table...');
  await prisma.testimonial.deleteMany();

  console.log('Seeding testimonials...');
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
    console.log(`  ✓ ${t.name}`);
  }
  console.log(`\nDone — seeded ${testimonials.length} testimonials.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
