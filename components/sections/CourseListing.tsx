'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  image: string;
  rating: number;
  reviews: number;
  price: string;
  category: string;
}

const courses: Course[] = [
  // Graphic & Multimedia
  {
    id: 1,
    title: 'Professional Graphics Design',
    image: '/courses/graphic-design.jpg',
    rating: 5.0,
    reviews: 245,
    price: 'Course Fee 12,000 BDT',
    category: 'Graphic & Multimedia',
  },
  {
    id: 2,
    title: 'Professional Motion Graphics & VFX',
    image: '/courses/motion-graphics.jpg',
    rating: 5.0,
    reviews: 189,
    price: 'Course Fee 15,000 BDT',
    category: 'Graphic & Multimedia',
  },
  {
    id: 3,
    title: 'Professional UI/UX Design',
    image: '/courses/ui-ux.jpg',
    rating: 5.0,
    reviews: 312,
    price: 'Course Fee 14,000 BDT',
    category: 'Graphic & Multimedia',
  },
  // Web & Software
  {
    id: 4,
    title: 'Diploma in MERN Stack Development',
    image: '/courses/mern-stack.jpg',
    rating: 5.0,
    reviews: 421,
    price: 'Course Fee 18,000 BDT',
    category: 'Web & Software',
  },
  {
    id: 5,
    title: 'Back-End Development with Python & Django',
    image: '/courses/python-django.jpg',
    rating: 5.0,
    reviews: 278,
    price: 'Course Fee 16,000 BDT',
    category: 'Web & Software',
  },
  {
    id: 6,
    title: 'Python for Data Analysis & Machine Learning',
    image: '/courses/python-ml.jpg',
    rating: 5.0,
    reviews: 356,
    price: 'Course Fee 20,000 BDT',
    category: 'Web & Software',
  },
  // Digital Marketing
  {
    id: 7,
    title: 'Professional Search Engine Optimization',
    image: '/courses/seo.jpg',
    rating: 5.0,
    reviews: 534,
    price: 'Course Fee 10,000 BDT',
    category: 'Digital Marketing',
  },
  {
    id: 8,
    title: 'Professional Social Media Marketing',
    image: '/courses/social-media.jpg',
    rating: 5.0,
    reviews: 689,
    price: 'Course Fee 12,000 BDT',
    category: 'Digital Marketing',
  },
  {
    id: 9,
    title: 'Complete Digital Marketing & Analytics',
    image: '/courses/digital-marketing.jpg',
    rating: 5.0,
    reviews: 812,
    price: 'Course Fee 15,000 BDT',
    category: 'Digital Marketing',
  },
];

const categories = ['Graphic & Multimedia', 'Web & Software', 'Digital Marketing'];

export const CourseListing = () => {
  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {categories.map((category) => (
          <div key={category} className="mb-16 last:mb-0">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {category}
              </h2>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {courses
                .filter((course) => course.category === category)
                .map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Course Image */}
                    <div className="relative h-48 bg-linear-to-br from-purple-600 to-blue-600 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                        {course.title}
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-gray-900 mb-3 line-clamp-2 min-h-12">
                        {course.title}
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                          <span className="text-sm font-semibold text-gray-700">
                            {course.rating}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({course.reviews} Reviews)
                        </span>
                      </div>

                      {/* Price */}
                      <p className="text-sm text-gray-600 mb-4">
                        {course.price}
                      </p>

                      {/* Button */}
                      <Link
                        href={`/course/${course.id}`}
                        className="block w-full text-center px-4 py-2.5 bg-white border-2 border-red-500 text-red-500 rounded-lg font-semibold text-sm hover:bg-red-500 hover:text-white transition-all duration-300"
                      >
                        Check Price BDT
                      </Link>
                    </div>
                  </div>
                ))}
            </div>

            {/* View More Button */}
            <div className="text-center">
              <Link
                href={`/category/${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                className="inline-block px-8 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                View More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
