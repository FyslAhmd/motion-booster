'use client';

import { motion } from 'framer-motion';

export const Companies = () => {
  const companies = [
    { name: 'Google', logo: 'Google' },
    { name: 'Microsoft', logo: 'Microsoft' },
    { name: 'Amazon', logo: 'Amazon' },
    { name: 'Facebook', logo: 'Facebook' },
    { name: 'Apple', logo: 'Apple' },
    { name: 'IBM', logo: 'IBM' },
  ];

  return (
    <motion.section
      className="py-8 sm:py-10 md:py-12 bg-white"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          className="text-center text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          Our Students Are Working At Top Companies Worldwide
        </motion.p>
        
        {/* Marquee Container */}
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee-logo">
            {/* First set of logos */}
            {companies.map((company, index) => (
              <motion.div
                key={`first-${index}`}
                className="company-logo shrink-0 mx-4 sm:mx-6 lg:mx-12"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
              >
                <div className="h-10 sm:h-12 flex items-center justify-center">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 italic" style={{ 
                    fontFamily: company.name === 'Lamborghini' ? 'serif' : 
                               company.name === 'Mosers' ? 'cursive' : 'sans-serif'
                  }}>
                    {company.logo}
                  </span>
                </div>
              </motion.div>
            ))}
            {/* Duplicate set for seamless loop */}
            {companies.map((company, index) => (
              <div key={`second-${index}`} className="shrink-0 mx-4 sm:mx-6 lg:mx-12">
                <div className="h-10 sm:h-12 flex items-center justify-center">
                  <span className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 italic" style={{ 
                    fontFamily: company.name === 'Lamborghini' ? 'serif' : 
                               company.name === 'Mosers' ? 'cursive' : 'sans-serif'
                  }}>
                    {company.logo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
