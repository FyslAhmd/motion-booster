'use client';

const HIGHLIGHTS = [
  {
    value: '50+',
    title: 'Skilled Professionals',
    description: 'Dedicated experts delivering high-impact digital campaigns.',
    cardBg: 'bg-amber-50',
    valueColor: 'text-amber-600',
  },
  {
    value: '100+',
    title: 'Business Partners',
    description: 'Collaborated with 100+ trusted business partners globally.',
    cardBg: 'bg-emerald-50',
    valueColor: 'text-green-600',
  },
  {
    value: '5+',
    title: 'Years of Excellence',
    description: 'Over 5 years of proven expertise in digital marketing and growth.',
    cardBg: 'bg-blue-50',
    valueColor: 'text-blue-600',
  },
  {
    value: '98%',
    title: 'Client Satisfaction',
    description: '98% satisfaction rate with consistent, measurable outcomes.',
    cardBg: 'bg-indigo-50',
    valueColor: 'text-indigo-500',
  },
];

export const AchievementHighlights = () => {
  return (
    <section className="bg-white pb-8 pt-2 sm:pb-10 lg:pb-12 page-reveal">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          {HIGHLIGHTS.map((item, index) => (
            <div
              key={item.title}
              className={`rounded-3xl p-6 ${item.cardBg} ${index % 2 === 0 ? 'card-reveal-left' : 'card-reveal-right'}`}
              style={{ animationDelay: `${Math.min(index * 60, 240)}ms` }}
            >
              <p className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${item.valueColor}`}>{item.value}</p>
              <h3 className="mt-3 text-xl sm:text-3xl font-bold text-gray-900">{item.title}</h3>
              <p className="mt-3 text-base sm:text-lg leading-relaxed text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
