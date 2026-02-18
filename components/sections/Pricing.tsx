'use client';

import { Button } from '@/components/ui/Button';

export const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      badge: null,
      features: [
        'Up to 10 clients',
        'Unlimited messaging',
        'Basic reporting',
        'Email support',
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'outline' as const,
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$99',
      period: '/month',
      badge: '⭐ Most Popular',
      features: [
        'Up to 50 clients',
        'Advanced analytics',
        'Custom branding',
        'Priority support',
        'API access',
      ],
      buttonText: 'Start Free Trial',
      buttonVariant: 'primary' as const,
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      badge: null,
      features: [
        'Unlimited clients',
        'White-label solution',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outline' as const,
      highlighted: false,
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-linear-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your agency
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl p-8 shadow-lg transition-all duration-300 ${
                plan.highlighted
                  ? 'scale-105 md:scale-110 shadow-2xl border-2 border-blue-500'
                  : 'hover:shadow-xl'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-gray-600 text-lg ml-2">
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-green-500 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                variant={plan.buttonVariant}
                href={plan.buttonText === 'Contact Sales' ? '/contact' : '/register'}
                className="w-full justify-center"
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
