import React from 'react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 bg-linear-to-br from-green-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="max-w-2xl">
            {/* Heading with Circular Gradient Background */}
            <div className="relative mb-6">
              {/* Circular Gradient Background */}
              <div 
                className="absolute top-1/2 left-1/2 rounded-full" 
                style={{ 
                  width: '600px',
                  height: '600px',
                  background: 'radial-gradient(circle, rgba(0, 240, 67, 0.1) 0%, rgba(0, 240, 67, 0.1) 20%, rgba(0, 240, 67, 0.1) 30%, rgba(0, 240, 67, 0.2) 40%, rgba(0, 240, 67, 0) 40%)',
                  transform: 'translate(-90%, -60%)',
                  filter: 'blur(40px)',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}
              ></div>
              
              {/* Text Content */}
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                Elevate Ur Customer Relationships with Our{' '}
                <span className="relative inline-block">
                  CRM
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="12"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 10C50 2 150 2 198 10"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
            </div>
            
            <p className="text-lg lg:text-xl text-gray-600 mb-10 leading-relaxed">
              Enhance your customer interactions and streamline your sales processes with our powerful and intuitive CRM solution.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" href="#demo">
                Get a Demo
              </Button>
              <Button variant="outline" href="#start">
                Get Started Free
              </Button>
            </div>
          </div>

          {/* Right Content - Image with Charts */}
          <div className="relative lg:ml-auto w-full max-w-2xl">
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl z-10">
                <Image
                  src="/hero_img_4.jpg"
                  alt="Customer service representative"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>

              {/* Volume Chart - Top Left */}
              <div className="absolute -top-8 -left-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 animate-float-left z-11">
                <Image
                  src="/volume.jpg"
                  alt="Volume vs Service Level Chart"
                  width={240}
                  height={200}
                  className="w-60 h-auto object-cover"
                />
              </div>

              {/* Sales Reports Chart - Bottom Right */}
              <div className="absolute -bottom-8 -right-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 animate-float-right z-11">
                <Image
                  src="/sells-report.jpg"
                  alt="Sales Reports Chart"
                  width={320}
                  height={240}
                  className="w-80 h-auto object-cover"
                />
              </div>

              {/* Decorative purple quarter circle - Top Right */}
              <div className="absolute top-[-60] right-[-70] w-20 h-20 bg-[#936DFF] rounded-bl-full" style={{ transform: 'rotate(180deg)' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
