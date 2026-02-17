'use client';

import Image from 'next/image';

export const Automate = () => {
  const features = [
    'Actionable Insights',
    'Enhanced Decision-Making',
    'Improved Efficiency',
    'Real-Time Analytics',
    'Data-Driven Decisions',
    'Workflow Automation',
    'Performance Tracking',
    'Smart Notifications',
    
  ];

  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Automate tasks to increase efficiency and reduce manual effort
            </h2>
            
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Gain precise insights for your business with our advanced analytics tools. Make informed decisions based on accurate, real-time data
            </p>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-900 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* Learn More Button */}
            <button className="bg-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2">
              Learn More
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {/* Right Side - Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/Illustration_5.png"
                alt="Analytics Dashboard"
                width={600}
                height={500}
                className="w-full h-auto"
              />
            </div>

            {/* Floating Analytics Card */}
            <div className="absolute top-8 right-8 bg-white rounded-2xl shadow-2xl p-6 max-w-xs animate-float-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  R
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Rareblocks</p>
                  <p className="text-xs text-gray-500">www.gosass.com</p>
                </div>
              </div>

              <div className="bg-gray-900 text-white rounded-xl p-3 mb-4 flex items-center gap-2">
                <span className="text-sm">Hurrah!</span>
                <span className="text-sm">You have finished task this week!</span>
                <span className="text-xl">🎉</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold text-gray-900">Analytics Bar</p>
                  <p className="text-xs text-gray-400">Mar 25 - Apr 25</p>
                </div>
                
                {/* Bar Chart */}
                <div className="flex items-end justify-between h-32 gap-2">
                  {[60, 80, 70, 90, 75, 95, 70, 85, 65, 90, 80].map((height, idx) => (
                    <div
                      key={idx}
                      className="bg-purple-600 rounded-t-lg w-full"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Notification Badge */}
            <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
              ON ⚡
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
