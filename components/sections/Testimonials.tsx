'use client';


export const Testimonials = () => {
  const testimonials = [
    {
      name: 'Jhon Kubera',
      title: 'Marketing Specialist',
      image: '/testimonial-1.jpg',
      review: 'As a marketing specialist, staying organized and on top of deadlines is crucial. Gosass has been a lifesaver. The platform is incredibly user-friendly, and I love how I can customize task lists to fit my workflow.',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Sara Thomas',
      title: 'Project Manager',
      image: '/testimonial-2.jpg',
      review: 'Gosass has completely transformed how we manage projects at our company. The intuitive interface makes it easy for everyone to get on board, and the powerful features like subtasks and dependencies.',
      bgColor: 'bg-teal-50'
    },
    {
      name: 'Wizard Bona',
      title: 'Creative Director',
      image: '/testimonial-3.jpg',
      review: 'Managing a creative team comes with its own set of challenges, but Gosass has made it so much easier. The customizable views allow us to organize tasks in a way that makes sense for our projects',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-16">
          Customer Reviews and<br />Success Stories
        </h2>

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
