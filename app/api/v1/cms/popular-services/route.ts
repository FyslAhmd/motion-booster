import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

const DEFAULT_SERVICES = [
  { title: 'Digital Marketing Services',  description: 'Grow your online presence and drive results with our comprehensive digital marketing solutions.',  gradient: 'from-green-700 via-green-600 to-emerald-500',  category: 'Digital Marketing',    slug: 'digital-marketing',     image: '/service-digital-marketing.jpg', services: ['Facebook & Instagram Ads Management','Google Ads & Performance Max','SEO Optimization & Link Building','Content Marketing & Blog Writing','Email Marketing Campaigns','Google Analytics & Conversion Tracking'], order: 0 },
  { title: 'Graphics Design Services',    description: 'Creative design solutions that make your brand stand out and communicate effectively.',              gradient: 'from-purple-800 via-purple-700 to-purple-500',  category: 'Graphics Design',      slug: 'graphics-design',       image: '/service-graphics-design.jpg',   services: ['Logo Design & Brand Identity','Social Media Graphics','Digital Ad Banners & Animations','Brochure & Flyer Design','Product Packaging Design','Motion Graphics & Logo Animation'], order: 1 },
  { title: 'Software Development',        description: 'Custom software solutions tailored to your business needs and workflows.',                          gradient: 'from-blue-800 via-blue-700 to-indigo-500',      category: 'Software Development', slug: 'software-development',  image: '/service-software-dev.jpg',      services: ['Custom Web Applications','CRM & ERP Systems','SaaS Platform Development','API Development & Integration','E-commerce Solutions','Workflow Automation'], order: 2 },
  { title: 'Web Development',             description: 'Professional websites that are fast, responsive, and optimized for conversions.',                   gradient: 'from-cyan-800 via-cyan-600 to-teal-500',        category: 'Web Development',      slug: 'web-development',       image: '/service-web-dev.jpg',           services: ['Corporate & E-commerce Websites','React.js & Next.js Development','Node.js Backend Development','WordPress & WooCommerce','Progressive Web Apps (PWA)','Website Maintenance & Support'], order: 3 },
  { title: 'Video & Animation Services',  description: 'Engaging video content and animations that tell your story effectively.',                           gradient: 'from-red-800 via-red-700 to-rose-500',          category: 'Video & Animation',    slug: 'video-animation',       image: '/service-video-animation.jpg',   services: ['Corporate Video Production','Explainer & Demo Videos','2D & 3D Animation','Video Editing & Color Grading','Motion Graphics','Drone Videography'], order: 4 },
  { title: 'Mobile App Development',      description: 'Native and cross-platform mobile apps that deliver exceptional user experiences.',                  gradient: 'from-pink-800 via-pink-700 to-rose-500',        category: 'Mobile App',           slug: 'mobile-app-development',image: '/service-mobile-app.jpg',        services: ['iOS App Development (Swift)','Android App Development (Kotlin)','React Native & Flutter','E-commerce Mobile Apps','App Store Optimization (ASO)','App Maintenance & Updates'], order: 5 },
  { title: 'UI/UX Design Services',       description: 'User-centered design that creates intuitive and engaging digital experiences.',                     gradient: 'from-orange-700 via-orange-600 to-amber-500',   category: 'UI/UX Design',         slug: 'ui-ux-design',          image: '/service-uiux-design.jpg',       services: ['Website & App UI Design','Wireframing & Prototyping','User Research & Analysis','Design System Creation','Figma & Adobe XD Design','Accessibility Design (WCAG)'], order: 6 },
  { title: 'Branding & Creative',         description: 'Build a memorable brand identity that resonates with your target audience.',                        gradient: 'from-yellow-700 via-amber-600 to-yellow-500',   category: 'Branding',             slug: 'branding-creative',     image: '/service-branding.jpg',          services: ['Brand Strategy & Positioning','Logo Design & Redesign','Brand Guidelines & Style Guide','Company Profile Design','Marketing Collateral','Brand Asset Library'], order: 7 },
  { title: 'Business Consulting',         description: 'Strategic guidance to help your business grow and achieve digital transformation.',                  gradient: 'from-indigo-800 via-indigo-700 to-violet-500',  category: 'Business Consulting',  slug: 'business-consulting',   image: '/service-consulting.jpg',        services: ['Digital Transformation Consulting','Technology Stack Selection','Growth Hacking Strategy','Process Optimization','Team Training Sessions','Technical Documentation'], order: 8 },
  { title: 'Specialized Services',        description: 'Advanced technical services for complex integrations and optimizations.',                            gradient: 'from-teal-800 via-teal-600 to-emerald-500',     category: 'Specialized',          slug: 'specialized-services',  image: '/service-specialized.jpg',       services: ['Payment Gateway Integration','AWS & Cloud Platform Setup','DevOps & CI/CD Pipeline','Website Speed Optimization','SSL Certificate & Security Audit','Live Chat Integration'], order: 9 },
];

export async function GET() {
  try {
    let services = await prisma.popularService.findMany({ orderBy: { order: 'asc' } });

    if (services.length === 0) {
      await prisma.popularService.createMany({ data: DEFAULT_SERVICES, skipDuplicates: true });
      services = await prisma.popularService.findMany({ orderBy: { order: 'asc' } });
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error('[CMS popular-services GET]', error);
    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, gradient, category, slug, image, customImage, services } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const finalSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();
    const count = await prisma.popularService.count();

    const service = await prisma.popularService.create({
      data: {
        title: title.trim(),
        description: description || '',
        gradient: gradient || 'from-green-700 via-green-600 to-emerald-500',
        category: category || '',
        slug: finalSlug,
        image: image || '/service-digital-marketing.jpg',
        customImage: customImage || null,
        services: Array.isArray(services) ? services.filter((s: string) => s.trim()) : [],
        order: count,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error: unknown) {
    console.error('[CMS popular-services POST]', error);
    const msg = error instanceof Error && error.message.includes('Unique constraint')
      ? 'Slug already exists'
      : 'Failed to create service';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
