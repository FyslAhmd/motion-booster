'use client';

import { motion } from 'framer-motion';

export const CTA = () => {
  return (
    <motion.section
      className="relative py-16 sm:py-20 lg:py-32 bg-purple-600 overflow-hidden"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Green Circle Decorations */}
      <div>
        <motion.div
          className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-green-500 rounded-full translate-x-1/2 translate-y-1/2"
          animate={{ rotate: -360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          Ready to Start Your IT Career?
        </motion.h2>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-white mb-8 sm:mb-10 opacity-90"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Join 20,000+ students who transformed their career with Motion Booster
        </motion.p>

        {/* CTA Button */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        >
          <a
            href="/register"
            className="bg-white text-purple-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-xl"
          >
            Enroll Now
          </a>
        </motion.div>

        {/* Trust Badge */}
        <p className="text-white text-xs sm:text-sm opacity-80 mb-2">
          Free seminar available • Flexible payment options
        </p>

        {/* Contact Info */}
        <p className="text-white text-xs sm:text-sm opacity-70">
          Have questions? Call us at{' '}
          <a href="tel:+8801790939394" className="underline hover:opacity-100">
            +880 1790-939394
          </a>
        </p>
      </div>
    </motion.section>
  );
};
