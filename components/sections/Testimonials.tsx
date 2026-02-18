'use client';


export const Testimonials = () => {
  const stats = [
    { value: '500+', label: 'Active Agencies' },
    { value: '10,000+', label: 'Happy Clients' },
    { value: '$50M+', label: 'Ad Spend Managed' },
    { value: '4.9★', label: 'Average Rating' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      title: 'Founder, Digital Growth Agency',
      image: '/testimonial-1.jpg',
      review: 'This platform has transformed how we communicate with clients. They love seeing their ad data in real-time!',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Mike Chen',
      title: 'CEO, AdBoost Marketing',
      image: '/testimonial-2.jpg',
      review: 'We saved 15 hours per week on client reporting. The ROI is incredible.',
      bgColor: 'bg-teal-50'
    },
    {
      name: 'Priya Sharma',
      title: 'Managing Director, Creative Ads Co.',
      image: '/testimonial-3.jpg',
      review: 'Our client retention improved by 40% after we started using this platform. Game changer!',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-12">
          Trusted by Growing Agencies
        </h2>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Marquee */}
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee-continuous">
            {/* First set of testimonials */}
            {testimonials.map((testimonial, index) => (
              <div
                key={`first-${index}`}
                className={`${testimonial.bgColor} rounded-3xl p-8 flex flex-col shrink-0 w-full md:w-100 mx-4`}
              >
                {/* Profile */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gray-300 rounded-full overflow-hidden shrink-0">
                    {/* Placeholder for profile image */}
                    <div className="w-full h-full bg-linear-to-br from-gray-400 to-gray-500"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.title}</p>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 leading-relaxed mb-6 grow">
                  {testimonial.review}
                </p>

                {/* Star Rating */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Second set of testimonials for seamless loop */}
            {testimonials.map((testimonial, index) => (
              <div
                key={`second-${index}`}
                className={`${testimonial.bgColor} rounded-3xl p-8 flex flex-col shrink-0 w-full md:w-100 mx-4`}
              >
                {/* Profile */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gray-300 rounded-full overflow-hidden shrink-0">
                    {/* Placeholder for profile image */}
                    <div className="w-full h-full bg-linear-to-br from-gray-400 to-gray-500"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.title}</p>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 leading-relaxed mb-6 grow">
                  {testimonial.review}
                </p>

                {/* Star Rating */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
