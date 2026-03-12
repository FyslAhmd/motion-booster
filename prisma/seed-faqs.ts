import { prisma } from '../lib/db/prisma';

const faqs = [
  {
    question: 'What courses do you offer?',
    answer: 'We offer 45+ courses including Web Development, Graphic Design, Digital Marketing, Video Editing, App Development, and more. All courses are job-oriented and industry-relevant.',
    order: 0,
  },
  {
    question: 'Do I need prior experience?',
    answer: 'No! Most of our courses are designed for beginners. We start from basics and gradually move to advanced topics with hands-on practice.',
    order: 1,
  },
  {
    question: 'What is the course duration and fee?',
    answer: 'Course duration ranges from 3-6 months depending on the program. Fees vary by course. Contact us or visit our office for detailed information.',
    order: 2,
  },
  {
    question: 'Do you provide job placement?',
    answer: 'Yes! We offer job placement support, career counseling, resume building, and interview preparation. Many of our students are now working at top companies.',
    order: 3,
  },
  {
    question: 'Will I get a certificate?',
    answer: 'Absolutely! After successfully completing the course, you will receive an industry-recognized certificate from Motion Booster.',
    order: 4,
  },
  {
    question: 'Can I attend classes online?',
    answer: 'We offer both online and offline batches. You can choose the mode that suits you best based on your location and schedule.',
    order: 5,
  },
];

async function main() {
  console.log('Clearing faqs table...');
  await prisma.fAQ.deleteMany();

  console.log('Seeding FAQs...');
  for (const faq of faqs) {
    await prisma.fAQ.create({ data: faq });
    console.log(`  ✓ ${faq.question}`);
  }
  console.log(`\nDone — seeded ${faqs.length} FAQs.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
