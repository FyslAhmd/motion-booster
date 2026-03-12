import { prisma } from '../lib/db/prisma';

const portfolioItems = [
  {
    title: 'TechVenture BD E-Commerce Platform',
    category: 'Web Development',
    description: 'Full-stack e-commerce platform with payment gateway integration, inventory management, and real-time analytics dashboard.',
    client: 'TechVenture BD',
    result: '200% increase in online sales within 3 months of launch.',
    tags: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe'],
    coverColor: 'from-blue-500 to-indigo-600',
    coverImage: null,
    featured: true,
    order: 0,
  },
  {
    title: 'GreenLeaf Organics Digital Campaign',
    category: 'Digital Marketing',
    description: 'Comprehensive Facebook & Google Ads campaign with targeted audience segmentation, A/B testing, and conversion optimization.',
    client: 'GreenLeaf Organics',
    result: 'Reached 50,000+ customers and ROI increased by 340% in 3 months.',
    tags: ['Facebook Ads', 'Google Ads', 'SEO', 'Email Marketing'],
    coverColor: 'from-green-500 to-emerald-600',
    coverImage: null,
    featured: true,
    order: 1,
  },
  {
    title: 'BuildRight Construction Brand Identity',
    category: 'Graphics Design',
    description: 'Complete brand identity system including logo, color palette, typography, business cards, letterhead, and brand guidelines manual.',
    client: 'BuildRight Construction',
    result: 'Consistent brand recognition across all marketing materials and platforms.',
    tags: ['Logo Design', 'Brand Identity', 'Print Design', 'Adobe CC'],
    coverColor: 'from-orange-500 to-red-600',
    coverImage: null,
    featured: false,
    order: 2,
  },
  {
    title: 'EduTech Solutions Mobile App',
    category: 'Mobile App Development',
    description: 'Cross-platform Flutter application for online learning with live classes, quiz engine, progress tracking, and push notifications.',
    client: 'EduTech Solutions',
    result: 'Handles 10,000+ daily active users seamlessly with 4.8★ app store rating.',
    tags: ['Flutter', 'Firebase', 'REST API', 'Push Notifications'],
    coverColor: 'from-purple-500 to-pink-600',
    coverImage: null,
    featured: true,
    order: 3,
  },
  {
    title: 'KamalFoods International SEO',
    category: 'Digital Marketing',
    description: 'Technical SEO overhaul, content marketing strategy, local & international keyword targeting, and monthly performance reporting.',
    client: 'KamalFoods International',
    result: 'Page 1 Google ranking in 4 months, 500% organic traffic growth.',
    tags: ['SEO', 'Content Marketing', 'Google Analytics', 'Keyword Research'],
    coverColor: 'from-teal-500 to-cyan-600',
    coverImage: null,
    featured: false,
    order: 4,
  },
  {
    title: 'FinanceHub BD CRM System',
    category: 'Software Development',
    description: 'Custom CRM solution for financial services with lead management, automated follow-ups, KYC workflows, and reporting dashboards.',
    client: 'FinanceHub BD',
    result: 'Reduced manual processing by 70%, team productivity increased by 3x.',
    tags: ['React', 'Python/Django', 'PostgreSQL', 'Docker'],
    coverColor: 'from-indigo-500 to-blue-600',
    coverImage: null,
    featured: true,
    order: 5,
  },
  {
    title: 'FashionBD Product Video Series',
    category: 'Video & Animation',
    description: 'Professional product video production including script writing, studio shooting, color grading, and social media format optimization.',
    client: 'FashionBD',
    result: '300% increase in social media engagement and 45% boost in product page conversions.',
    tags: ['Video Production', 'After Effects', 'Color Grading', 'Reels'],
    coverColor: 'from-yellow-500 to-amber-600',
    coverImage: null,
    featured: false,
    order: 6,
  },
  {
    title: 'HealthFirst Healthcare App',
    category: 'UI/UX Design',
    description: 'End-to-end UI/UX design and development for a patient management app covering appointment booking, teleconsultation, and medical records.',
    client: 'HealthFirst',
    result: 'Intuitive interface loved by patients — 4.9★ rating and 25,000+ downloads.',
    tags: ['Figma', 'User Research', 'React Native', 'Node.js'],
    coverColor: 'from-red-500 to-orange-600',
    coverImage: null,
    featured: true,
    order: 7,
  },
];

async function main() {
  console.log('Clearing portfolio_items table...');
  await prisma.portfolioItem.deleteMany();

  console.log('Seeding portfolio items...');
  for (const item of portfolioItems) {
    await prisma.portfolioItem.create({ data: item });
    console.log(`  ✓ ${item.title}`);
  }
  console.log(`\nDone — seeded ${portfolioItems.length} portfolio items.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
