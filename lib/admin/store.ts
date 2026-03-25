// Admin data store - localStorage based frontend CMS

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconColor: string;
  iconType: string; // 'document' | 'calendar' | 'list' | 'chart' | 'sync' | 'users' | 'star' | 'check' | 'globe' | 'lock'
}

export interface TeamMemberItem {
  id: string;
  name: string;
  role: string;
  roleBn?: string;
  experience: string;
  experienceBn?: string;
  projects: string;
  projectsBn?: string;
  department: string;
  departmentBn?: string;
  featured?: boolean;
  avatar: string; // initials
  avatarColor: string;
  avatarImage?: string; // base64 uploaded photo
  workExperience: string[];
  workExperienceBn?: string[];
  specializedArea: string[];
  specializedAreaBn?: string[];
  education: string[];
  educationBn?: string[];
  workPlaces: string[];
  workPlacesBn?: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  questionBn?: string;
  answer: string;
  answerBn?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  roleBn?: string;
  avatar: string;
  avatarBg: string;
  avatarImage?: string; // base64 uploaded photo
  rating: number;
  review: string;
  reviewBn?: string;
  service: string;
  serviceBn?: string;
}

export interface StatItem {
  id: string;
  value: string;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  bgColor: string;
  valueColor: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  servicesTitle: string;
  servicesSubtitle: string;
  welcomeModalImage?: string;      // base64 or URL for modal banner image
  welcomeModalExploreLink?: string; // where Explore button navigates
  welcomeModalTitle?: string;       // modal heading text
  welcomeModalBody?: string;        // modal description text
}

export interface PortfolioItem {
  id: string;
  title: string;
  titleBn?: string;
  category: string;
  categoryBn?: string;
  description: string;
  descriptionBn?: string;
  client: string;
  clientBn?: string;
  result: string;
  resultBn?: string;
  tags: string[];
  tagsBn?: string[];
  coverColor: string; // Tailwind gradient e.g. 'from-blue-500 to-indigo-600'
  coverImage?: string;  // base64 uploaded cover photo
  featured: boolean;
}

export interface PopularServiceItem {
  id: string;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  gradient: string;   // Tailwind gradient e.g. 'from-green-700 via-green-600 to-emerald-500'
  category: string;   // used for tab filter
  categoryBn?: string;
  slug: string;       // href: /category/{slug}
  image: string;       // path from /public/
  customImage?: string; // base64 uploaded image (overrides image)
  services: string[];  // feature bullet list
  servicesBn?: string[];  // feature bullet list (BN)
}

export interface ServiceCategoryItem {
  id: string;
  title: string;
  titleBn?: string;
  slug: string;       // used in href: /category/{slug}
  iconType: string;   // lucide icon key: 'trending-up' | 'palette' | 'code' | 'globe' | 'smartphone' | 'layers' | 'sparkles' | 'video' | 'briefcase' | 'zap' | 'star' | 'rocket' | 'shield' | 'settings'
  iconColor: string;  // Tailwind text color e.g. 'text-green-600'
  iconBg: string;     // Tailwind bg color e.g. 'bg-green-50'
  logoImage?: string; // base64 uploaded category logo
}

export interface HeroSlideItem {
  id: string;
  image: string;       // path from /public/
  customImage?: string; // base64 uploaded image (overrides image)
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  badge?: string;
  badgeBn?: string;
  ctaText?: string;
  ctaTextBn?: string;
  ctaLink?: string;
}

export interface CompanyItem {
  id: string;
  name: string;
  logoImage?: string; // base64 uploaded logo
}

export interface AdminProfile {
  displayName: string;
  email: string;
  avatarImage?: string; // base64
  password: string;     // plain text (demo only; no DB)
}

export interface MetaConfig {
  // Facebook
  facebookPageId: string;
  facebookPageToken: string;
  facebookPixelId: string;
  // Instagram
  instagramAccountId: string;
  // WhatsApp
  whatsappNumber: string;
  whatsappToken: string;
  // Messenger
  messengerEnabled: boolean;
  // Flags
  facebookConnected: boolean;
  instagramConnected: boolean;
  whatsappConnected: boolean;
}

// ─── Default Data (mirrors current live website content) ─────────────────────

export const defaultServices: ServiceItem[] = [
  {
    id: '1',
    title: 'Easy Task Creation',
    description: 'Add new tasks quickly with a simple and user-friendly interface. Organize your workload without the hassle.',
    iconColor: 'bg-purple-400',
    iconType: 'document',
  },
  {
    id: '2',
    title: 'Due Date & Reminders',
    description: 'Set due dates and reminders to ensure you meet your deadlines. Get notified via email or in-app alerts.',
    iconColor: 'bg-green-400',
    iconType: 'calendar',
  },
  {
    id: '3',
    title: 'Customizable Lists',
    description: 'Customize task lists to match your unique workflow. Group tasks by project, priority, or deadline to stay on top of everything.',
    iconColor: 'bg-cyan-400',
    iconType: 'list',
  },
  {
    id: '4',
    title: 'Progress Tracking',
    description: 'Visualize your progress with intuitive dashboards and progress bars. Keep track of completed and pending tasks effortlessly.',
    iconColor: 'bg-cyan-400',
    iconType: 'chart',
  },
  {
    id: '5',
    title: 'Cross Platform Sync',
    description: 'Access your tasks from any device. Our application syncs across web, mobile, and desktop to keep you connected.',
    iconColor: 'bg-green-400',
    iconType: 'sync',
  },
];

export const defaultTeam: TeamMemberItem[] = [
  {
    id: '1',
    name: 'Rafiqul Islam',
    role: 'Head of Creative, Motion Booster',
    experience: '10 Years+',
    projects: '500+',
    department: 'Creative',
    featured: true,
    avatar: 'R',
    avatarColor: 'from-red-500 to-red-700',
    workExperience: ['Head of Creative at Motion Booster', 'Former Senior Designer at BrandCraft BD', 'Freelance Creative Director'],
    specializedArea: ['Brand Identity Design', 'Motion Graphics', 'Logo & Visual Design', 'Creative Strategy'],
    education: ['BBA (Marketing)', 'Diploma in Graphic Design', 'Certified Creative Professional', 'Adobe Certified Expert'],
    workPlaces: ['Motion Booster', 'BrandCraft BD', 'Freelance'],
  },
  {
    id: '2',
    name: 'Md. Habibur Rahman',
    role: 'Sr. Designer, Motion Booster',
    experience: '8 years+',
    projects: '350+',
    department: 'Creative',
    avatar: 'H',
    avatarColor: 'from-blue-500 to-blue-700',
    workExperience: ['Sr. Designer at Motion Booster', 'Former Designer at CreativeHub', 'Graphic Designer Freelancer'],
    specializedArea: ['Graphic Design', 'Brand Design', 'Logo Design', 'Animation'],
    education: ['MBS (Accounting)', 'Diploma In Graphic Design', 'Diploma In Merchandising', 'CBT&A (Level 5)'],
    workPlaces: ['Motion Booster', 'CreativeHub', 'Freelance'],
  },
  {
    id: '3',
    name: 'Tania Akter',
    role: 'Sr. Developer, Motion Booster',
    experience: '6 years+',
    projects: '280+',
    department: 'Development',
    avatar: 'T',
    avatarColor: 'from-purple-500 to-purple-700',
    workExperience: ['Sr. Developer at Motion Booster', 'Full Stack Developer at TechBD', 'React Developer Freelancer'],
    specializedArea: ['React & Next.js', 'Node.js Backend', 'UI Development', 'REST API Design'],
    education: ['BSc in Computer Science', 'Certified Web Developer', 'AWS Cloud Practitioner'],
    workPlaces: ['Motion Booster', 'TechBD', 'Freelance'],
  },
  {
    id: '4',
    name: 'Rakibul Hasan',
    role: 'Motion Designer, Motion Booster',
    experience: '5 years+',
    projects: '200+',
    department: 'Creative',
    avatar: 'R',
    avatarColor: 'from-orange-500 to-orange-700',
    workExperience: ['Motion Designer at Motion Booster', 'Video Editor at MediaHouse BD', 'Freelance Animator'],
    specializedArea: ['After Effects Animation', 'Video Editing', 'Motion Graphics', '2D/3D Animation'],
    education: ['Diploma in Multimedia', 'Adobe After Effects Certified', 'Cinema 4D Training'],
    workPlaces: ['Motion Booster', 'MediaHouse BD', 'Freelance'],
  },
  {
    id: '5',
    name: 'Nusrat Jahan',
    role: 'UI/UX Designer, Motion Booster',
    experience: '4 years+',
    projects: '150+',
    department: 'Design',
    avatar: 'N',
    avatarColor: 'from-pink-500 to-pink-700',
    workExperience: ['UI/UX Designer at Motion Booster', 'Product Designer at AppLab', 'Freelance UX Consultant'],
    specializedArea: ['Figma & Prototyping', 'User Research', 'Mobile UI Design', 'Interaction Design'],
    education: ['BFA in Design', 'Google UX Design Certificate', 'Figma Advanced Training'],
    workPlaces: ['Motion Booster', 'AppLab', 'Freelance'],
  },
  {
    id: '6',
    name: 'Arif Hossain',
    role: 'Sr. Developer, Motion Booster',
    experience: '7 years+',
    projects: '300+',
    department: 'Development',
    avatar: 'A',
    avatarColor: 'from-teal-500 to-teal-700',
    workExperience: ['Sr. Developer at Motion Booster', 'Backend Engineer at DataSys', 'Software Developer at SoftTech'],
    specializedArea: ['Python & Django', 'Database Architecture', 'Cloud Infrastructure', 'API Development'],
    education: ['BSc in Software Engineering', 'AWS Solutions Architect', 'Docker & Kubernetes Certified'],
    workPlaces: ['Motion Booster', 'DataSys', 'SoftTech'],
  },
  {
    id: '7',
    name: 'Sadia Islam',
    role: 'Digital Marketer, Motion Booster',
    experience: '5 years+',
    projects: '180+',
    department: 'Marketing',
    avatar: 'S',
    avatarColor: 'from-indigo-500 to-indigo-700',
    workExperience: ['Digital Marketer at Motion Booster', 'SEO Specialist at GrowthLab', 'Social Media Manager Freelancer'],
    specializedArea: ['SEO & Content Marketing', 'Social Media Strategy', 'Google Ads & Meta Ads', 'Email Marketing'],
    education: ['BBA in Marketing', 'Google Digital Marketing Certificate', 'Meta Blueprint Certified'],
    workPlaces: ['Motion Booster', 'GrowthLab', 'Freelance'],
  },
  {
    id: '8',
    name: 'Farhan Ahmed',
    role: 'Project Manager, Motion Booster',
    experience: '9 years+',
    projects: '400+',
    department: 'Management',
    avatar: 'F',
    avatarColor: 'from-green-500 to-green-700',
    workExperience: ['Project Manager at Motion Booster', 'Sr. PM at TechVenture BD', 'Agile Coach & Consultant'],
    specializedArea: ['Agile & Scrum', 'Project Planning', 'Team Leadership', 'Client Management'],
    education: ['MBA (Project Management)', 'PMP Certified', 'Scrum Master Certified', 'PRINCE2 Foundation'],
    workPlaces: ['Motion Booster', 'TechVenture BD', 'Consulting'],
  },
];

export const defaultFAQs: FAQItem[] = [
  { id: '1', question: 'What courses do you offer?', answer: 'We offer 45+ courses including Web Development, Graphic Design, Digital Marketing, Video Editing, App Development, and more. All courses are job-oriented and industry-relevant.' },
  { id: '2', question: 'Do I need prior experience?', answer: 'No! Most of our courses are designed for beginners. We start from basics and gradually move to advanced topics with hands-on practice.' },
  { id: '3', question: 'What is the course duration and fee?', answer: 'Course duration ranges from 3-6 months depending on the program. Fees vary by course. Contact us or visit our office for detailed information.' },
  { id: '4', question: 'Do you provide job placement?', answer: 'Yes! We offer job placement support, career counseling, resume building, and interview preparation. Many of our students are now working at top companies.' },
  { id: '5', question: 'Will I get a certificate?', answer: 'Absolutely! After successfully completing the course, you will receive an industry-recognized certificate from Motion Booster.' },
  { id: '6', question: 'Can I attend classes online?', answer: 'We offer both online and offline batches. You can choose the mode that suits you best based on your location and schedule.' },
];

export const defaultTestimonials: TestimonialItem[] = [
  { id: '1', name: 'Rafiq Ahmed', role: 'CEO, TechVenture BD', avatar: 'RA', avatarBg: 'from-blue-500 to-indigo-600', rating: 5, review: 'Motion Booster transformed our entire digital presence. Their web development team built us a stunning e-commerce platform that increased our sales by 200%.', service: 'Web Development' },
  { id: '2', name: 'Fatima Khatun', role: 'Founder, GreenLeaf Organics', avatar: 'FK', avatarBg: 'from-green-500 to-emerald-600', rating: 5, review: 'The digital marketing team helped us reach 50,000+ customers in just 3 months. Their Facebook and Google Ads strategy was brilliant. Our ROI increased by 340%!', service: 'Digital Marketing' },
  { id: '3', name: 'Tanvir Hasan', role: 'MD, BuildRight Construction', avatar: 'TH', avatarBg: 'from-orange-500 to-red-600', rating: 5, review: 'We needed a complete brand identity and Motion Booster delivered beyond expectations. From logo to marketing materials, everything was cohesive and professional.', service: 'Branding & Creative' },
  { id: '4', name: 'Nusrat Jahan', role: 'Co-founder, EduTech Solutions', avatar: 'NJ', avatarBg: 'from-purple-500 to-pink-600', rating: 5, review: 'Motion Booster built our mobile app from scratch using Flutter. The app handles 10,000+ daily users seamlessly. They delivered on time with transparent process.', service: 'Mobile App Development' },
  { id: '5', name: 'Kamal Uddin', role: 'Owner, KamalFoods International', avatar: 'KU', avatarBg: 'from-teal-500 to-cyan-600', rating: 5, review: 'SEO work brought our website from page 5 to page 1 on Google within 4 months. Our organic traffic grew by 500%. Their content marketing strategy is world-class.', service: 'Digital Marketing' },
  { id: '6', name: 'Sadia Rahman', role: 'Creative Director, PixelStudio', avatar: 'SR', avatarBg: 'from-pink-500 to-rose-600', rating: 5, review: 'Their graphics design quality is on par with international standards. Logo designs, social media creatives, packaging — they handle everything with perfection.', service: 'Graphics Design' },
  { id: '7', name: 'Mohammad Ali', role: 'CTO, FinanceHub BD', avatar: 'MA', avatarBg: 'from-indigo-500 to-blue-600', rating: 5, review: 'Motion Booster developed a custom CRM system for our financial services. The software handles complex workflows effortlessly. Robust and reliable solution.', service: 'Software Development' },
  { id: '8', name: 'Ayesha Begum', role: 'Marketing Head, FashionBD', avatar: 'AB', avatarBg: 'from-yellow-500 to-amber-600', rating: 5, review: 'The video production team created stunning product videos for our fashion brand. Social media engagement increased by 300% after using their video content.', service: 'Video & Animation' },
  { id: '9', name: 'Imran Khan', role: 'Startup Founder, HealthFirst', avatar: 'IK', avatarBg: 'from-red-500 to-orange-600', rating: 5, review: 'From UI/UX design to full-stack development, Motion Booster handled our healthcare app end-to-end. The user interface is intuitive and patients love it.', service: 'UI/UX Design' },
  { id: '10', name: 'Rubina Akter', role: 'Director, GlobalTrade BD', avatar: 'RA', avatarBg: 'from-emerald-500 to-teal-600', rating: 5, review: 'They set up our entire AWS cloud infrastructure and CI/CD pipelines. Deployment time reduced from hours to minutes. Their specialized team is highly skilled.', service: 'Specialized Services' },
];

export const defaultStats: StatItem[] = [
  { id: '1', value: '89%', title: 'Success Ratio', description: 'The practical approach towards problems puts our clients ahead of any other competitors in global markets. All our services are structured considering market demands.', bgColor: 'bg-green-50', valueColor: 'text-teal-500' },
  { id: '2', value: '34000+', title: 'Works As Expert Freelancer', description: 'After project completion, a significant number of our clients find success in multiple sectors. Many professionals start working in the IT domain, earning dollars from the global marketplace.', bgColor: 'bg-lime-50', valueColor: 'text-teal-500' },
  { id: '3', value: '20000+', title: 'Clients Choose Motion Booster', description: 'Motion Booster has become a trusted service provider for not only Bangladeshi residents but also those living abroad. More than 20,000 passionate clients are in different markets.', bgColor: 'bg-yellow-50', valueColor: 'text-teal-500' },
  { id: '4', value: '150+', title: 'Expert Team Members', description: 'Our dedicated team of over 150 professionals brings expertise across digital marketing, design, development, and consulting to deliver the highest quality services.', bgColor: 'bg-blue-50', valueColor: 'text-teal-500' },
  { id: '5', value: '500+', title: 'Projects Delivered', description: 'We have successfully delivered over 500 projects ranging from small business websites to enterprise-level applications across healthcare, education, e-commerce, and fintech.', bgColor: 'bg-purple-50', valueColor: 'text-teal-500' },
  { id: '6', value: '50+', title: 'Countries Served', description: 'Our services reach clients in over 50 countries worldwide. From Bangladesh to the USA, UK, Canada, and Australia — we provide world-class digital solutions across borders.', bgColor: 'bg-orange-50', valueColor: 'text-teal-500' },
];

export const defaultPopularServices: PopularServiceItem[] = [
  { id:'1', title:'Digital Marketing Services',  description:'Grow your online presence and drive results with our comprehensive digital marketing solutions.', gradient:'from-green-700 via-green-600 to-emerald-500',  category:'Digital Marketing',    slug:'digital-marketing',     image:'/service-digital-marketing.jpg', services:['Facebook & Instagram Ads Management','Google Ads & Performance Max','SEO Optimization & Link Building','Content Marketing & Blog Writing','Email Marketing Campaigns','Google Analytics & Conversion Tracking'] },
  { id:'2', title:'Graphics Design Services',     description:'Creative design solutions that make your brand stand out and communicate effectively.',              gradient:'from-purple-800 via-purple-700 to-purple-500',   category:'Graphics Design',      slug:'graphics-design',       image:'/service-graphics-design.jpg',   services:['Logo Design & Brand Identity','Social Media Graphics','Digital Ad Banners & Animations','Brochure & Flyer Design','Product Packaging Design','Motion Graphics & Logo Animation'] },
  { id:'3', title:'Software Development',         description:'Custom software solutions tailored to your business needs and workflows.',                         gradient:'from-blue-800 via-blue-700 to-indigo-500',       category:'Software Development', slug:'software-development',  image:'/service-software-dev.jpg',      services:['Custom Web Applications','CRM & ERP Systems','SaaS Platform Development','API Development & Integration','E-commerce Solutions','Workflow Automation'] },
  { id:'4', title:'Web Development',              description:'Professional websites that are fast, responsive, and optimized for conversions.',                  gradient:'from-cyan-800 via-cyan-600 to-teal-500',         category:'Web Development',      slug:'web-development',       image:'/service-web-dev.jpg',           services:['Corporate & E-commerce Websites','React.js & Next.js Development','Node.js Backend Development','WordPress & WooCommerce','Progressive Web Apps (PWA)','Website Maintenance & Support'] },
  { id:'5', title:'Video & Animation Services',   description:'Engaging video content and animations that tell your story effectively.',                          gradient:'from-red-800 via-red-700 to-rose-500',           category:'Video & Animation',    slug:'video-animation',       image:'/service-video-animation.jpg',   services:['Corporate Video Production','Explainer & Demo Videos','2D & 3D Animation','Video Editing & Color Grading','Motion Graphics','Drone Videography'] },
  { id:'6', title:'Mobile App Development',       description:'Native and cross-platform mobile apps that deliver exceptional user experiences.',                 gradient:'from-pink-800 via-pink-700 to-rose-500',         category:'Mobile App',           slug:'mobile-app-development', image:'/service-mobile-app.jpg',        services:['iOS App Development (Swift)','Android App Development (Kotlin)','React Native & Flutter','E-commerce Mobile Apps','App Store Optimization (ASO)','App Maintenance & Updates'] },
  { id:'7', title:'UI/UX Design Services',        description:'User-centered design that creates intuitive and engaging digital experiences.',                   gradient:'from-orange-700 via-orange-600 to-amber-500',    category:'UI/UX Design',         slug:'ui-ux-design',          image:'/service-uiux-design.jpg',       services:['Website & App UI Design','Wireframing & Prototyping','User Research & Analysis','Design System Creation','Figma & Adobe XD Design','Accessibility Design (WCAG)'] },
  { id:'8', title:'Branding & Creative',          description:'Build a memorable brand identity that resonates with your target audience.',                      gradient:'from-yellow-700 via-amber-600 to-yellow-500',    category:'Branding',             slug:'branding-creative',     image:'/service-branding.jpg',          services:['Brand Strategy & Positioning','Logo Design & Redesign','Brand Guidelines & Style Guide','Company Profile Design','Marketing Collateral','Brand Asset Library'] },
  { id:'9', title:'Business Consulting',          description:'Strategic guidance to help your business grow and achieve digital transformation.',                gradient:'from-indigo-800 via-indigo-700 to-violet-500',   category:'Business Consulting',  slug:'business-consulting',   image:'/service-consulting.jpg',        services:['Digital Transformation Consulting','Technology Stack Selection','Growth Hacking Strategy','Process Optimization','Team Training Sessions','Technical Documentation'] },
  { id:'10',title:'Specialized Services',         description:'Advanced technical services for complex integrations and optimizations.',                          gradient:'from-teal-800 via-teal-600 to-emerald-500',      category:'Specialized',          slug:'specialized-services',  image:'/service-specialized.jpg',       services:['Payment Gateway Integration','AWS & Cloud Platform Setup','DevOps & CI/CD Pipeline','Website Speed Optimization','SSL Certificate & Security Audit','Live Chat Integration'] },
];

export const defaultServiceCategories: ServiceCategoryItem[] = [
  { id: '1', title: 'Digital Marketing',       slug: 'digital-marketing',       iconType: 'trending-up', iconColor: 'text-green-600',  iconBg: 'bg-green-50'  },
  { id: '2', title: 'Graphics Design',          slug: 'graphics-design',          iconType: 'palette',     iconColor: 'text-purple-600', iconBg: 'bg-purple-50' },
  { id: '3', title: 'Software Development',     slug: 'software-development',     iconType: 'code',        iconColor: 'text-blue-600',   iconBg: 'bg-blue-50'   },
  { id: '4', title: 'Web Development',          slug: 'web-development',          iconType: 'globe',       iconColor: 'text-cyan-600',   iconBg: 'bg-cyan-50'   },
  { id: '5', title: 'Mobile App Development',   slug: 'mobile-app-development',   iconType: 'smartphone',  iconColor: 'text-pink-600',   iconBg: 'bg-pink-50'   },
  { id: '6', title: 'UI/UX Design',             slug: 'ui-ux-design',             iconType: 'layers',      iconColor: 'text-orange-500', iconBg: 'bg-orange-50' },
  { id: '7', title: 'Branding & Creative',      slug: 'branding-creative',        iconType: 'sparkles',    iconColor: 'text-yellow-600', iconBg: 'bg-yellow-50' },
  { id: '8', title: 'Video & Animation',        slug: 'video-animation',          iconType: 'video',       iconColor: 'text-red-500',    iconBg: 'bg-red-50'    },
  { id: '9', title: 'Business Consulting',      slug: 'business-consulting',      iconType: 'briefcase',   iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50' },
  { id:'10', title: 'Specialized Services',     slug: 'specialized-services',     iconType: 'zap',         iconColor: 'text-teal-600',   iconBg: 'bg-teal-50'   },
];

export const defaultPortfolio: PortfolioItem[] = [
  { id: '1', title: 'TechVenture BD E-Commerce Platform', category: 'Web Development', description: 'Full-stack e-commerce platform with payment gateway integration, inventory management, and real-time analytics dashboard.', client: 'TechVenture BD', result: '200% increase in online sales within 3 months of launch.', tags: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe'], coverColor: 'from-blue-500 to-indigo-600', coverImage: '/portfolio-1.jpg', featured: true },
  { id: '2', title: 'GreenLeaf Organics Digital Campaign', category: 'Digital Marketing', description: 'Comprehensive Facebook & Google Ads campaign with targeted audience segmentation, A/B testing, and conversion optimization.', client: 'GreenLeaf Organics', result: 'Reached 50,000+ customers and ROI increased by 340% in 3 months.', tags: ['Facebook Ads', 'Google Ads', 'SEO', 'Email Marketing'], coverColor: 'from-green-500 to-emerald-600', coverImage: '/portfolio-2.jpg', featured: true },
  { id: '3', title: 'BuildRight Construction Brand Identity', category: 'Graphics Design', description: 'Complete brand identity system including logo, color palette, typography, business cards, letterhead, and brand guidelines manual.', client: 'BuildRight Construction', result: 'Consistent brand recognition across all marketing materials and platforms.', tags: ['Logo Design', 'Brand Identity', 'Print Design', 'Adobe CC'], coverColor: 'from-orange-500 to-red-600', coverImage: '/portfolio-3.jpg', featured: false },
  { id: '4', title: 'EduTech Solutions Mobile App', category: 'Mobile App Development', description: 'Cross-platform Flutter application for online learning with live classes, quiz engine, progress tracking, and push notifications.', client: 'EduTech Solutions', result: 'Handles 10,000+ daily active users seamlessly with 4.8★ app store rating.', tags: ['Flutter', 'Firebase', 'REST API', 'Push Notifications'], coverColor: 'from-purple-500 to-pink-600', coverImage: '/portfolio-4.jpg', featured: true },
  { id: '5', title: 'KamalFoods International SEO', category: 'Digital Marketing', description: 'Technical SEO overhaul, content marketing strategy, local & international keyword targeting, and monthly performance reporting.', client: 'KamalFoods International', result: 'Page 1 Google ranking in 4 months, 500% organic traffic growth.', tags: ['SEO', 'Content Marketing', 'Google Analytics', 'Keyword Research'], coverColor: 'from-teal-500 to-cyan-600', coverImage: '/portfolio-5.jpg', featured: false },
  { id: '6', title: 'FinanceHub BD CRM System', category: 'Software Development', description: 'Custom CRM solution for financial services with lead management, automated follow-ups, KYC workflows, and reporting dashboards.', client: 'FinanceHub BD', result: 'Reduced manual processing by 70%, team productivity increased by 3x.', tags: ['React', 'Python/Django', 'PostgreSQL', 'Docker'], coverColor: 'from-indigo-500 to-blue-600', coverImage: '/portfolio-6.jpg', featured: true },
  { id: '7', title: 'FashionBD Product Video Series', category: 'Video & Animation', description: 'Professional product video production including script writing, studio shooting, color grading, and social media format optimization.', client: 'FashionBD', result: '300% increase in social media engagement and 45% boost in product page conversions.', tags: ['Video Production', 'After Effects', 'Color Grading', 'Reels'], coverColor: 'from-yellow-500 to-amber-600', featured: false },
  { id: '8', title: 'HealthFirst Healthcare App', category: 'UI/UX Design', description: 'End-to-end UI/UX design and development for a patient management app covering appointment booking, teleconsultation, and medical records.', client: 'HealthFirst', result: 'Intuitive interface loved by patients — 4.9★ rating and 25,000+ downloads.', tags: ['Figma', 'User Research', 'React Native', 'Node.js'], coverColor: 'from-red-500 to-orange-600', featured: true },
];

export const defaultHeroSlides: HeroSlideItem[] = [
  {
    id: '1',
    image: '/header1.jpeg',
    title: 'Become an IT Pro & Rule the Digital World',
    description: 'With a vision to turn manpower into assets, Motion Booster is ready to enhance your learning experience with skilled mentors and an updated curriculum. Pick your desired course from more than 45 trendy options.',
    badge: 'Unleash Your Potential',
    ctaText: 'Browse Course',
    ctaLink: '/features',
  },
  {
    id: '2',
    image: '/header2.jpeg',
    title: 'Learn From Industry Experts',
    description: "Get hands-on training from professionals with years of real-world experience. Master the skills that companies are looking for in today's competitive market.",
    badge: 'Expert Training',
    ctaText: 'Join Free Seminar',
    ctaLink: '/contact',
  },
  {
    id: '3',
    image: '/header3.jpeg',
    title: 'Perfect Training for Perfect IT Preparation',
    description: 'Comprehensive courses designed to prepare you for a successful career in IT. From beginner to advanced, we have programs tailored for every skill level.',
    badge: "South Asia's Best IT Institute",
    ctaText: 'Explore Programs',
    ctaLink: '/service',
  },
];

export const defaultSettings: SiteSettings = {
  siteName: 'Motion Booster',
  tagline: 'Accelerate Your Digital Growth',
  contactEmail: 'info@motionbooster.com',
  contactPhone: '+880 1234-567890',
  address: 'Dhaka, Bangladesh',
  facebookUrl: 'https://facebook.com/motionbooster',
  instagramUrl: 'https://instagram.com/motionbooster',
  linkedinUrl: 'https://linkedin.com/company/motionbooster',
  heroTitle: 'Accelerate Your Digital Growth',
  heroSubtitle: 'We provide cutting-edge digital marketing, web development, and creative design solutions to help your business thrive in the modern marketplace.',
  servicesTitle: 'GoSaas: Your All-in-One Solution for Business Success',
  servicesSubtitle: 'We offer a comprehensive platform with all the tools you need to streamline and grow your business efficiently.',
  welcomeModalImage: '',
  welcomeModalExploreLink: '/service',
  welcomeModalTitle: 'Welcome to Motion Booster! 👋',
  welcomeModalBody: 'We help businesses grow with creative branding, motion graphics, web development & digital marketing.',
};

export const defaultCompanies: CompanyItem[] = [
  { id: '1', name: 'Daraz' },
  { id: '2', name: 'Chaldal' },
  { id: '3', name: 'Shajgoj' },
  { id: '4', name: 'Pathao' },
  { id: '5', name: 'ShopUp' },
  { id: '6', name: 'Rokomari' },
  { id: '7', name: 'AjkerDeal' },
  { id: '8', name: 'Bikroy' },
  { id: '9', name: 'Othoba' },
  { id: '10', name: 'Shopify' },
  { id: '11', name: 'Alibaba' },
  { id: '12', name: 'Lazada' },
];

// ─── Storage Keys ────────────────────────────────────────────────────────────

const KEYS = {
  services: 'mb_admin_services',
  team: 'mb_admin_team',
  faqs: 'mb_admin_faqs',
  testimonials: 'mb_admin_testimonials',
  stats: 'mb_admin_stats',
  settings: 'mb_admin_settings',
  portfolio: 'mb_admin_portfolio',
  serviceCategories: 'mb_admin_service_categories',
  popularServices: 'mb_admin_popular_services',
  heroSlides: 'mb_admin_hero_slides',
  companies: 'mb_admin_companies',
  profile: 'mb_admin_profile',
  metaConfig: 'mb_admin_meta_config',
};;

// ─── Generic read/write helpers ───────────────────────────────────────────────

function read<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const AdminStore = {
  // Services
  getServices: () => read<ServiceItem[]>(KEYS.services, defaultServices),
  saveServices: (data: ServiceItem[]) => write(KEYS.services, data),

  // Team
  getTeam: () => read<TeamMemberItem[]>(KEYS.team, defaultTeam),
  saveTeam: (data: TeamMemberItem[]) => write(KEYS.team, data),

  // FAQs
  getFAQs: () => read<FAQItem[]>(KEYS.faqs, defaultFAQs),
  saveFAQs: (data: FAQItem[]) => write(KEYS.faqs, data),

  // Testimonials
  getTestimonials: () => read<TestimonialItem[]>(KEYS.testimonials, defaultTestimonials),
  saveTestimonials: (data: TestimonialItem[]) => write(KEYS.testimonials, data),

  // Stats
  getStats: () => read<StatItem[]>(KEYS.stats, defaultStats),
  saveStats: (data: StatItem[]) => write(KEYS.stats, data),

  // Site Settings
  getSettings: () => read<SiteSettings>(KEYS.settings, defaultSettings),
  saveSettings: (data: SiteSettings) => write(KEYS.settings, data),

  // Portfolio
  getPortfolio: () => read<PortfolioItem[]>(KEYS.portfolio, defaultPortfolio),
  savePortfolio: (data: PortfolioItem[]) => write(KEYS.portfolio, data),

  // Service Categories
  getServiceCategories: () => read<ServiceCategoryItem[]>(KEYS.serviceCategories, defaultServiceCategories),
  saveServiceCategories: (data: ServiceCategoryItem[]) => write(KEYS.serviceCategories, data),

  // Popular Services
  getPopularServices: () => read<PopularServiceItem[]>(KEYS.popularServices, defaultPopularServices),
  savePopularServices: (data: PopularServiceItem[]) => write(KEYS.popularServices, data),

  // Hero Slides
  getHeroSlides: () => read<HeroSlideItem[]>(KEYS.heroSlides, defaultHeroSlides),
  saveHeroSlides: (data: HeroSlideItem[]) => write(KEYS.heroSlides, data),

  // Companies
  getCompanies: () => read<CompanyItem[]>(KEYS.companies, defaultCompanies),
  saveCompanies: (data: CompanyItem[]) => write(KEYS.companies, data),

  // Admin Profile
  getProfile: (): AdminProfile => read<AdminProfile>(KEYS.profile, { displayName: 'Admin', email: 'admin@motionbooster.com', password: 'MotionBooster@2025' }),
  saveProfile: (data: AdminProfile) => write(KEYS.profile, data),

  // Meta Config
  getMetaConfig: (): MetaConfig => read<MetaConfig>(KEYS.metaConfig, { facebookPageId: '', facebookPageToken: '', facebookPixelId: '', instagramAccountId: '', whatsappNumber: '', whatsappToken: '', messengerEnabled: false, facebookConnected: false, instagramConnected: false, whatsappConnected: false }),
  saveMetaConfig: (data: MetaConfig) => write(KEYS.metaConfig, data),

  // Reset all to defaults
  resetAll: () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
