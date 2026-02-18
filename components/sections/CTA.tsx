'use client';

export const CTA = () => {
  return (
    <section className="relative py-16 sm:py-20 lg:py-32 bg-purple-600 overflow-hidden">
      {/* Green Circle Decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-green-500 rounded-full translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          Ready to Impress Your Clients?
        </h2>

        <p className="text-base sm:text-lg md:text-xl text-white mb-8 sm:mb-10 opacity-90">
          Join hundreds of agencies already using our platform
        </p>

        {/* CTA Button */}
        <div className="flex justify-center mb-6">
          <a
            href="/register"
            className="bg-white text-purple-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-xl"
          >
            Start Free Trial
          </a>
        </div>

        {/* Trust Badge */}
        <p className="text-white text-xs sm:text-sm opacity-80 mb-2">
          No credit card required • Cancel anytime
        </p>

        {/* Contact Info */}
        <p className="text-white text-xs sm:text-sm opacity-70">
          Questions? Contact us at{' '}
          <a href="mailto:hello@youragency.com" className="underline hover:opacity-100">
            hello@youragency.com
          </a>
        </p>
      </div>
    </section>
  );
};
