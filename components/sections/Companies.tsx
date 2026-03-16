'use client';

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
    <section className="py-8 sm:py-10 md:py-12 bg-white page-reveal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8 text-wave">
          Our Students Are Working At Top Companies Worldwide
        </p>
        
        {/* Marquee Container */}
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee-logo">
            {/* First set of logos */}
            {companies.map((company, index) => (
              <div
                key={`first-${index}`}
                className={`company-logo shrink-0 mx-4 sm:mx-6 lg:mx-12 ${index % 2 === 0 ? 'card-reveal-left' : 'card-reveal-right'}`}
                style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
              >
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
    </section>
  );
};
