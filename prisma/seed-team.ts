import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

const teamData = [
  {
    name: 'Rafiqul Islam',
    role: 'Head of Creative, Motion Booster',
    experience: '10 Years+',
    projects: '500+',
    department: 'Creative',
    featured: true,
    avatar: 'R',
    avatarColor: 'from-red-500 to-red-700',
    workExperience: ['Head of Creative at Motion Booster', 'Former Senior Designer at BrandCraft BD', 'Freelance Creative Director'],
    specializedArea: ['Brand Identity Design', 'Motion Graphics', 'Logo & Visual Design', 'Creative Strategy'],
    education: ['BBA (Marketing)', 'Diploma in Graphic Design', 'Certified Creative Professional', 'Adobe Certified Expert'],
    workPlaces: ['Motion Booster', 'BrandCraft BD', 'Freelance'],
    order: 1,
  },
  {
    name: 'Md. Habibur Rahman',
    role: 'Sr. Designer, Motion Booster',
    experience: '8 years+',
    projects: '350+',
    department: 'Creative',
    featured: false,
    avatar: 'H',
    avatarColor: 'from-blue-500 to-blue-700',
    workExperience: ['Sr. Designer at Motion Booster', 'Former Designer at CreativeHub', 'Graphic Designer Freelancer'],
    specializedArea: ['Graphic Design', 'Brand Design', 'Logo Design', 'Animation'],
    education: ['MBS (Accounting)', 'Diploma In Graphic Design', 'Diploma In Merchandising', 'CBT&A (Level 5)'],
    workPlaces: ['Motion Booster', 'CreativeHub', 'Freelance'],
    order: 2,
  },
  {
    name: 'Tania Akter',
    role: 'Sr. Developer, Motion Booster',
    experience: '6 years+',
    projects: '280+',
    department: 'Development',
    featured: false,
    avatar: 'T',
    avatarColor: 'from-purple-500 to-purple-700',
    workExperience: ['Sr. Developer at Motion Booster', 'Full Stack Developer at TechBD', 'React Developer Freelancer'],
    specializedArea: ['React & Next.js', 'Node.js Backend', 'UI Development', 'REST API Design'],
    education: ['BSc in Computer Science', 'Certified Web Developer', 'AWS Cloud Practitioner'],
    workPlaces: ['Motion Booster', 'TechBD', 'Freelance'],
    order: 3,
  },
  {
    name: 'Rakibul Hasan',
    role: 'Motion Designer, Motion Booster',
    experience: '5 years+',
    projects: '200+',
    department: 'Creative',
    featured: false,
    avatar: 'R',
    avatarColor: 'from-orange-500 to-orange-700',
    workExperience: ['Motion Designer at Motion Booster', 'Video Editor at MediaHouse BD', 'Freelance Animator'],
    specializedArea: ['After Effects Animation', 'Video Editing', 'Motion Graphics', '2D/3D Animation'],
    education: ['Diploma in Multimedia', 'Adobe After Effects Certified', 'Cinema 4D Training'],
    workPlaces: ['Motion Booster', 'MediaHouse BD', 'Freelance'],
    order: 4,
  },
  {
    name: 'Nusrat Jahan',
    role: 'UI/UX Designer, Motion Booster',
    experience: '4 years+',
    projects: '150+',
    department: 'Design',
    featured: false,
    avatar: 'N',
    avatarColor: 'from-pink-500 to-pink-700',
    workExperience: ['UI/UX Designer at Motion Booster', 'Product Designer at AppLab', 'Freelance UX Consultant'],
    specializedArea: ['Figma & Prototyping', 'User Research', 'Mobile UI Design', 'Interaction Design'],
    education: ['BFA in Design', 'Google UX Design Certificate', 'Figma Advanced Training'],
    workPlaces: ['Motion Booster', 'AppLab', 'Freelance'],
    order: 5,
  },
  {
    name: 'Arif Hossain',
    role: 'Sr. Developer, Motion Booster',
    experience: '7 years+',
    projects: '300+',
    department: 'Development',
    featured: false,
    avatar: 'A',
    avatarColor: 'from-teal-500 to-teal-700',
    workExperience: ['Sr. Developer at Motion Booster', 'Backend Engineer at DataSys', 'Software Developer at SoftTech'],
    specializedArea: ['Python & Django', 'Database Architecture', 'Cloud Infrastructure', 'API Development'],
    education: ['BSc in Software Engineering', 'AWS Solutions Architect', 'Docker & Kubernetes Certified'],
    workPlaces: ['Motion Booster', 'DataSys', 'SoftTech'],
    order: 6,
  },
  {
    name: 'Sadia Islam',
    role: 'Digital Marketer, Motion Booster',
    experience: '5 years+',
    projects: '180+',
    department: 'Marketing',
    featured: false,
    avatar: 'S',
    avatarColor: 'from-indigo-500 to-indigo-700',
    workExperience: ['Digital Marketer at Motion Booster', 'SEO Specialist at GrowthLab', 'Social Media Manager Freelancer'],
    specializedArea: ['SEO & Content Marketing', 'Social Media Strategy', 'Google Ads & Meta Ads', 'Email Marketing'],
    education: ['BBA in Marketing', 'Google Digital Marketing Certificate', 'Meta Blueprint Certified'],
    workPlaces: ['Motion Booster', 'GrowthLab', 'Freelance'],
    order: 7,
  },
  {
    name: 'Farhan Ahmed',
    role: 'Project Manager, Motion Booster',
    experience: '9 years+',
    projects: '400+',
    department: 'Management',
    featured: false,
    avatar: 'F',
    avatarColor: 'from-green-500 to-green-700',
    workExperience: ['Project Manager at Motion Booster', 'Sr. PM at TechVenture BD', 'Agile Coach & Consultant'],
    specializedArea: ['Agile & Scrum', 'Project Planning', 'Team Leadership', 'Client Management'],
    education: ['MBA (Project Management)', 'PMP Certified', 'Scrum Master Certified', 'PRINCE2 Foundation'],
    workPlaces: ['Motion Booster', 'TechVenture BD', 'Consulting'],
    order: 8,
  },
];

async function main() {
  console.log('🌱 Seeding team members...\n');

  const existing = await prisma.teamMember.count();
  if (existing > 0) {
    console.log(`⚠️  ${existing} team member(s) already exist. Skipping.\n   Delete them first if you want to re-seed.`);
    return;
  }

  for (const member of teamData) {
    const created = await prisma.teamMember.create({ data: member });
    console.log(`✅ ${created.name} — ${created.role}`);
  }

  console.log(`\n🎉 ${teamData.length} team members seeded successfully!`);
}

main()
  .catch((e) => {
    console.error('❌ Failed to seed team members:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
