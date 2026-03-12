import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

const serviceData = [
  {
    title: 'Digital Marketing Services',
    description: 'Comprehensive digital marketing solutions to grow your online presence and drive results.',
    gradient: 'from-red-500 to-red-600',
    category: 'trending-up',
    slug: 'digital-marketing',
    image: '/service-digital-marketing.jpg',
    order: 0,
    services: [
      'Facebook & Instagram Ads Management',
      'LinkedIn & TikTok Marketing',
      'Google Ads & Performance Max',
      'YouTube Ads Management',
      'SEO Optimization & Link Building',
      'Technical SEO Audit',
      'Local SEO & Google My Business',
      'Content Marketing & Blog Writing',
      'Email Marketing Campaigns',
      'Marketing Automation Setup',
      'Google Analytics & Conversion Tracking',
      'ROI Analysis & Reporting',
    ],
  },
  {
    title: 'Graphics Design Services',
    description: 'Creative design solutions that make your brand stand out and communicate effectively.',
    gradient: 'from-rose-500 to-red-500',
    category: 'palette',
    slug: 'graphics-design',
    image: '/service-graphics-design.jpg',
    order: 1,
    services: [
      'Logo Design & Brand Identity',
      'Business Card & Stationery',
      'Social Media Graphics',
      'Digital Ad Banners & Animations',
      'Brochure & Flyer Design',
      'Product Packaging Design',
      'Presentation Design',
      'Infographic Design',
      'Print Design (Posters, Catalogs)',
      'Illustration & Character Design',
      'Motion Graphics & Logo Animation',
      'Photo Editing & Retouching',
    ],
  },
  {
    title: 'Software Development Services',
    description: 'Custom software solutions tailored to your business needs and workflows.',
    gradient: 'from-red-600 to-red-700',
    category: 'code',
    slug: 'software-development',
    image: '/service-software-development.jpg',
    order: 2,
    services: [
      'Custom Web Applications',
      'CRM & ERP Systems',
      'Inventory Management Systems',
      'POS & Booking Systems',
      'SaaS Platform Development',
      'Multi-tenant Applications',
      'API Development & Integration',
      'E-commerce Solutions',
      'Payment Gateway Integration',
      'Multi-vendor Marketplaces',
      'Business Intelligence Tools',
      'Workflow Automation',
    ],
  },
  {
    title: 'Web Development Services',
    description: 'Professional websites that are fast, responsive, and optimized for conversions.',
    gradient: 'from-red-500 to-rose-600',
    category: 'globe',
    slug: 'web-development',
    image: '/service-web-development.jpg',
    order: 3,
    services: [
      'Corporate & E-commerce Websites',
      'Landing Page Development',
      'Portfolio & Blog Websites',
      'React.js & Next.js Development',
      'Vue.js & Angular Development',
      'Node.js Backend Development',
      'PHP/Laravel Development',
      'WordPress & WooCommerce',
      'Shopify & Magento Development',
      'Progressive Web Apps (PWA)',
      'RESTful & GraphQL API',
      'Website Maintenance & Support',
    ],
  },
  {
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile apps that deliver exceptional user experiences.',
    gradient: 'from-red-500 to-red-600',
    category: 'smartphone',
    slug: 'mobile-app-development',
    image: '/service-mobile-app.jpg',
    order: 4,
    services: [
      'iOS App Development (Swift)',
      'Android App Development (Kotlin)',
      'React Native Development',
      'Flutter Development',
      'E-commerce Mobile Apps',
      'Food Delivery Apps',
      'Social Networking Apps',
      'Healthcare & Education Apps',
      'App Store Optimization (ASO)',
      'Push Notification Setup',
      'Payment Gateway Integration',
      'App Maintenance & Updates',
    ],
  },
  {
    title: 'UI/UX Design Services',
    description: 'User-centered design that creates intuitive and engaging digital experiences.',
    gradient: 'from-rose-500 to-red-500',
    category: 'layers',
    slug: 'ui-ux-design',
    image: '/service-ui-ux-design.jpg',
    order: 5,
    services: [
      'Website & App UI Design',
      'Dashboard & Admin Panel Design',
      'User Research & Analysis',
      'Wireframing & Prototyping',
      'User Journey Mapping',
      'Usability Testing',
      'Design System Creation',
      'Component Library',
      'Figma & Adobe XD Design',
      'Interactive Prototypes',
      'Accessibility Design (WCAG)',
      'Design Documentation',
    ],
  },
  {
    title: 'Branding & Creative Services',
    description: 'Build a memorable brand identity that resonates with your target audience.',
    gradient: 'from-red-600 to-red-700',
    category: 'sparkles',
    slug: 'branding-creative',
    image: '/service-branding.jpg',
    order: 6,
    services: [
      'Brand Strategy & Positioning',
      'Brand Messaging & Voice',
      'Competitor Analysis',
      'Logo Design & Redesign',
      'Brand Guidelines & Style Guide',
      'Color Palette Development',
      'Typography Selection',
      'Business Presentation Design',
      'Company Profile Design',
      'Marketing Collateral',
      'Corporate Gifts Design',
      'Brand Asset Library',
    ],
  },
  {
    title: 'Video & Animation Services',
    description: 'Engaging video content and animations that tell your story effectively.',
    gradient: 'from-red-500 to-rose-600',
    category: 'video',
    slug: 'video-animation',
    image: '/service-video-animation.jpg',
    order: 7,
    services: [
      'Corporate Video Production',
      'Product Demo Videos',
      'Explainer Videos',
      'Testimonial Videos',
      'Social Media Videos',
      'Video Editing & Color Grading',
      '2D & 3D Animation',
      'Whiteboard Animation',
      'Character Animation',
      'Motion Graphics',
      'Logo Animation',
      'Drone Videography',
    ],
  },
  {
    title: 'Business Consulting Services',
    description: 'Strategic guidance to help your business grow and achieve digital transformation.',
    gradient: 'from-red-500 to-red-600',
    category: 'briefcase',
    slug: 'business-consulting',
    image: '/service-consulting.jpg',
    order: 8,
    services: [
      'Digital Transformation Consulting',
      'Technology Stack Selection',
      'Digital Marketing Strategy',
      'Growth Hacking Strategy',
      'Requirements Gathering',
      'Process Optimization',
      'Market Research & Feasibility',
      'ROI Analysis',
      'Team Training Sessions',
      'Software Training Workshops',
      'Technical Documentation',
      'Change Management Support',
    ],
  },
  {
    title: 'Specialized Services',
    description: 'Advanced technical services for complex integrations and optimizations.',
    gradient: 'from-rose-500 to-red-500',
    category: 'zap',
    slug: 'specialized-services',
    image: '/service-specialized.jpg',
    order: 9,
    services: [
      'Payment Gateway Integration',
      'Social Media API Integration',
      'SMS & Email Service Setup',
      'CRM Integration (Salesforce, HubSpot)',
      'AWS & Cloud Platform Setup',
      'DevOps & CI/CD Pipeline',
      'SSL Certificate & Security Audit',
      'Website Speed Optimization',
      'Database Optimization',
      'CDN Setup (Cloudflare)',
      'Multi-currency & Multi-language',
      'Live Chat Integration',
    ],
  },
];

async function main() {
  console.log('🌱 Seeding popular services...\n');

  const existing = await prisma.popularService.count();
  if (existing > 0) {
    console.log(`⚠️  ${existing} popular service(s) already exist. Skipping.\n   Delete them first if you want to re-seed.`);
    return;
  }

  for (const item of serviceData) {
    const created = await prisma.popularService.create({ data: item });
    console.log(`✅ ${created.title}`);
  }

  console.log(`\n🎉 ${serviceData.length} services seeded successfully!`);
}

main()
  .catch((e) => {
    console.error('❌ Failed to seed services:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
