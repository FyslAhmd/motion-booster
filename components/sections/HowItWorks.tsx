'use client';

export const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      title: 'Sign Up Your Agency',
      description: 'Create your account in 30 seconds. No credit card required.',
    },
    {
      number: '2',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      title: 'Connect Meta Ads Accounts',
      description: 'Your clients connect their Meta Ads accounts securely with one click.',
    },
    {
      number: '3',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Start Managing & Reporting',
      description: 'View spending, chat with clients, and generate reports instantly.',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Get Started in 3 Simple Steps
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connection Lines - Hidden on mobile */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-linear-to-r from-blue-200 via-blue-400 to-blue-200" style={{ top: '60px' }}></div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Card */}
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
                {/* Number Badge */}
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-6 z-10">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl mb-4">
                  <div className="text-blue-600">
                    {step.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
