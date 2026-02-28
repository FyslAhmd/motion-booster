'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { AdminStore, TestimonialItem } from '@/lib/admin/store';

const stats = [
  {
    value: '89%',
    title: 'Success Ratio',
    description: 'The practical approach towards problems puts our clients ahead of any other competitors in global markets. All our services are structured considering market demands.',
    bgColor: 'bg-green-50',
    valueColor: 'text-teal-500',
  },
  {
    value: '34000+',
    title: 'Works As Expert Freelancer',
    description: 'After project completion, a significant number of our clients find success in multiple sectors. Many professionals start working in the IT domain, earning dollars from the global marketplace.',
    bgColor: 'bg-lime-50',
    valueColor: 'text-teal-500',
  },
  {
    value: '20000+',
    title: 'Clients Choose Motion Booster',
    description: 'Motion Booster has become a trusted service provider for not only Bangladeshi residents but also those living abroad. More than 20,000 passionate clients are in different markets.',
    bgColor: 'bg-yellow-50',
    valueColor: 'text-teal-500',
  },
  {
    value: '150+',
    title: 'Expert Team Members',
    description: 'Our dedicated team of over 150 professionals brings expertise across digital marketing, design, development, and consulting to deliver the highest quality services.',
    bgColor: 'bg-blue-50',
    valueColor: 'text-teal-500',
  },
  {
    value: '500+',
    title: 'Projects Delivered',
    description: 'We have successfully delivered over 500 projects ranging from small business websites to enterprise-level applications across healthcare, education, e-commerce, and fintech.',
    bgColor: 'bg-purple-50',
    valueColor: 'text-teal-500',
  },
  {
    value: '50+',
    title: 'Countries Served',
    description: 'Our services reach clients in over 50 countries worldwide. From Bangladesh to the USA, UK, Canada, and Australia — we provide world-class digital solutions across borders.',
    bgColor: 'bg-orange-50',
    valueColor: 'text-teal-500',
  },
];

const staticReviews: TestimonialItem[] = [
  {
    id: '1',
    name: 'Rafiq Ahmed',
    role: 'CEO, TechVenture BD',
    avatar: 'RA',
    avatarBg: 'from-blue-500 to-indigo-600',
    rating: 5,
    review: 'Motion Booster transformed our entire digital presence. Their web development team built us a stunning e-commerce platform that increased our sales by 200%.',
    service: 'Web Development',
  },
  {
    id: '2',
    name: 'Fatima Khatun',
    role: 'Founder, GreenLeaf Organics',
    avatar: 'FK',
    avatarBg: 'from-green-500 to-emerald-600',
    rating: 5,
    review: 'The digital marketing team helped us reach 50,000+ customers in just 3 months. Their Facebook and Google Ads strategy was brilliant. Our ROI increased by 340%!',
    service: 'Digital Marketing',
  },
  {
    id: '3',
    name: 'Tanvir Hasan',
    role: 'MD, BuildRight Construction',
    avatar: 'TH',
    avatarBg: 'from-orange-500 to-red-600',
    rating: 5,
    review: 'We needed a complete brand identity and Motion Booster delivered beyond expectations. From logo to marketing materials, everything was cohesive and professional.',
    service: 'Branding & Creative',
  },
  {
    id: '4',
    name: 'Nusrat Jahan',
    role: 'Co-founder, EduTech Solutions',
    avatar: 'NJ',
    avatarBg: 'from-purple-500 to-pink-600',
    rating: 5,
    review: 'Motion Booster built our mobile app from scratch using Flutter. The app handles 10,000+ daily users seamlessly. They delivered on time with transparent process.',
    service: 'Mobile App Development',
  },
  {
    id: '5',
    name: 'Kamal Uddin',
    role: 'Owner, KamalFoods International',
    avatar: 'KU',
    avatarBg: 'from-teal-500 to-cyan-600',
    rating: 5,
    review: 'SEO work brought our website from page 5 to page 1 on Google within 4 months. Our organic traffic grew by 500%. Their content marketing strategy is world-class.',
    service: 'Digital Marketing',
  },
  {
    id: '6',
    name: 'Sadia Rahman',
    role: 'Creative Director, PixelStudio',
    avatar: 'SR',
    avatarBg: 'from-pink-500 to-rose-600',
    rating: 5,
    review: 'Their graphics design quality is on par with international standards. Logo designs, social media creatives, packaging — they handle everything with perfection.',
    service: 'Graphics Design',
  },
  {
    id: '7',
    name: 'Mohammad Ali',
    role: 'CTO, FinanceHub BD',
    avatar: 'MA',
    avatarBg: 'from-indigo-500 to-blue-600',
    rating: 5,
    review: 'Motion Booster developed a custom CRM system for our financial services. The software handles complex workflows effortlessly. Robust and reliable solution.',
    service: 'Software Development',
  },
  {
    id: '8',
    name: 'Ayesha Begum',
    role: 'Marketing Head, FashionBD',
    avatar: 'AB',
    avatarBg: 'from-yellow-500 to-amber-600',
    rating: 5,
    review: 'The video production team created stunning product videos for our fashion brand. Social media engagement increased by 300% after using their video content.',
    service: 'Video & Animation',
  },
  {
    id: '9',
    name: 'Imran Khan',
    role: 'Startup Founder, HealthFirst',
    avatar: 'IK',
    avatarBg: 'from-red-500 to-orange-600',
    rating: 5,
    review: 'From UI/UX design to full-stack development, Motion Booster handled our healthcare app end-to-end. The user interface is intuitive and patients love it.',
    service: 'UI/UX Design',
  },
  {
    id: '10',
    name: 'Rubina Akter',
    role: 'Director, GlobalTrade BD',
    avatar: 'RA',
    avatarBg: 'from-emerald-500 to-teal-600',
    rating: 5,
    review: 'They set up our entire AWS cloud infrastructure and CI/CD pipelines. Deployment time reduced from hours to minutes. Their specialized team is highly skilled.',
    service: 'Specialized Services',
  },
];

export const Testimonials = () => {
  const [reviews, setReviews] = useState<TestimonialItem[]>(staticReviews);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => setReviews(AdminStore.getTestimonials());
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const scrollStats = (direction: 'left' | 'right') => {
    if (statsRef.current) {
      statsRef.current.scrollBy({
        left: direction === 'left' ? -350 : 350,
        behavior: 'smooth',
      });
    }
  };

  const ReviewCard = ({ review }: { review: TestimonialItem }) => (
    <div className="shrink-0 w-80 sm:w-90 md:w-100 bg-white border border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-shadow cursor-default">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Avatar on left */}
        {review.avatarImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={review.avatarImage} alt={review.name} className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shadow-md" />
        ) : (
          <div className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-linear-to-br ${review.avatarBg} flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md`}>
            {review.avatar || review.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-sm sm:text-base">{review.name}</h4>
          <p className="text-gray-500 text-xs mb-1">{review.role}</p>

          <span className="inline-block text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full mb-2">
            {review.service}
          </span>

          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: review.rating }).map((_, i) => (
              <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-orange-400 text-orange-400" />
            ))}
          </div>

          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
            {review.review}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-12 md:py-16 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="relative flex items-center mb-12 sm:mb-16 md:mb-20">
          <button
            onClick={() => scrollStats('left')}
            className="hidden sm:flex shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-green-200 text-green-400 hover:bg-green-50 hover:border-green-400 hover:text-green-500 items-center justify-center transition-all mr-2 sm:mr-4"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div
            ref={statsRef}
            className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {stats.map((stat, index) => (
              <div
                key={index}

                className={`shrink-0 w-64 sm:w-72 md:w-75 lg:w-85 ${stat.bgColor} rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 transition-all hover:shadow-lg`}
              >
                <div className={`text-3xl sm:text-4xl md:text-5xl font-bold ${stat.valueColor} mb-2 sm:mb-3`}>
                  {stat.value}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">{stat.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{stat.description}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollStats('right')}
            className="hidden sm:flex shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-green-200 text-green-400 hover:bg-green-50 hover:border-green-400 hover:text-green-500 items-center justify-center transition-all ml-2 sm:ml-4"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Client Reviews Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            What Our Clients Say
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto px-4">
            Real feedback from our valued clients who trusted Motion Booster with their digital journey.
          </p>
        </div>
      </div>

      {/* Row 1 - Reviews */}
      <div className="mb-4 sm:mb-6 overflow-hidden">
        <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {reviews.map((review, index) => (
            <ReviewCard key={`r1-${index}`} review={review} />
          ))}
        </div>
      </div>

      {/* Row 2 - Reviews */}
      <div className="overflow-hidden">
        <div className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {reviews.map((review, index) => (
            <ReviewCard key={`r2-${index}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};
