'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Palette, 
  Code, 
  Globe, 
  Smartphone, 
  Layers, 
  Sparkles, 
  Video, 
  Briefcase, 
  Zap,
  Check,
  ChevronDown
} from 'lucide-react';

interface ServiceCategoryProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  services: string[];
  color: string;
}

const ServiceCategory: React.FC<ServiceCategoryProps> = ({ icon, title, description, services, color }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div 
        className={`p-6 ${color} cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <motion.div 
              className="shrink-0"
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md">
                {icon}
              </div>
            </motion.div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>
          </div>
          <motion.button 
            className="ml-4 mt-2"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-6 h-6 text-gray-900" />
          </motion.button>
        </div>
      </div>
      
      {isExpanded && (
        <motion.div 
          className="p-6 bg-gray-50"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((service, index) => (
              <motion.div 
                key={index}
                className="flex items-start gap-2 text-gray-700"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Check className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <span className="text-sm">{service}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function ServicePage() {
  const serviceCategories = [
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      title: 'Digital Marketing Services',
      description: 'Comprehensive digital marketing solutions to grow your online presence and drive results.',
      color: 'bg-blue-50',
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
      icon: <Palette className="w-8 h-8 text-purple-600" />,
      title: 'Graphics Design Services',
      description: 'Creative design solutions that make your brand stand out and communicate effectively.',
      color: 'bg-purple-50',
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
      icon: <Code className="w-8 h-8 text-green-600" />,
      title: 'Software Development Services',
      description: 'Custom software solutions tailored to your business needs and workflows.',
      color: 'bg-green-50',
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
      icon: <Globe className="w-8 h-8 text-cyan-600" />,
      title: 'Web Development Services',
      description: 'Professional websites that are fast, responsive, and optimized for conversions.',
      color: 'bg-cyan-50',
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
      icon: <Smartphone className="w-8 h-8 text-pink-600" />,
      title: 'Mobile App Development',
      description: 'Native and cross-platform mobile apps that deliver exceptional user experiences.',
      color: 'bg-pink-50',
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
      icon: <Layers className="w-8 h-8 text-orange-600" />,
      title: 'UI/UX Design Services',
      description: 'User-centered design that creates intuitive and engaging digital experiences.',
      color: 'bg-orange-50',
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
      icon: <Sparkles className="w-8 h-8 text-yellow-600" />,
      title: 'Branding & Creative Services',
      description: 'Build a memorable brand identity that resonates with your target audience.',
      color: 'bg-yellow-50',
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
      icon: <Video className="w-8 h-8 text-red-600" />,
      title: 'Video & Animation Services',
      description: 'Engaging video content and animations that tell your story effectively.',
      color: 'bg-red-50',
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
      icon: <Briefcase className="w-8 h-8 text-indigo-600" />,
      title: 'Business Consulting Services',
      description: 'Strategic guidance to help your business grow and achieve digital transformation.',
      color: 'bg-indigo-50',
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
      icon: <Zap className="w-8 h-8 text-teal-600" />,
      title: 'Specialized Services',
      description: 'Advanced technical services for complex integrations and optimizations.',
      color: 'bg-teal-50',
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

  return (
    <main className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Complete Digital Solutions
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
                Under One Roof
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              From strategy to execution - we build and grow your digital presence with end-to-end services tailored to your business needs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/contact"
                className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Click on any service category to explore what we offer
            </p>
          </div>

          <div className="space-y-6">
            {serviceCategories.map((category, index) => (
              <ServiceCategory
                key={index}
                icon={category.icon}
                title={category.title}
                description={category.description}
                services={category.services}
                color={category.color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Our Process
            </h2>
            <p className="text-xl text-gray-600">
              How we deliver exceptional results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {[
              { step: '01', title: 'Discovery', desc: 'Understanding your goals and requirements' },
              { step: '02', title: 'Planning', desc: 'Strategy development and roadmap creation' },
              { step: '03', title: 'Production', desc: 'Agile development with regular updates' },
              { step: '04', title: 'Launch', desc: 'Testing, deployment, and go-live support' },
              { step: '05', title: 'Support', desc: 'Ongoing maintenance and optimization' },
            ].map((item, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <motion.div 
                  className="w-20 h-20 bg-blue-600 text-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {item.step}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Let&apos;s discuss how we can help bring your vision to life
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Contact Us Today
          </Link>
        </div>
      </section>
    </main>
  );
}
