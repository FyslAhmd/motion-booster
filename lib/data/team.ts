export interface TeamMember {
  id: number;
  name: string;
  role: string;
  experience: string;
  projects: string;
  department: string;
  featured?: boolean;
  avatar: string;
  workExperience: string[];
  specializedArea: string[];
  education: string[];
  workPlaces: string[];
}

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Rafiqul Islam',
    role: 'Head of Creative, Motion Booster',
    experience: '10 Years+',
    projects: '500+',
    department: 'Creative',
    featured: true,
    avatar: 'R',
    workExperience: [
      'Head of Creative at Motion Booster',
      'Former Senior Designer at BrandCraft BD',
      'Freelance Creative Director',
    ],
    specializedArea: [
      'Brand Identity Design',
      'Motion Graphics',
      'Logo & Visual Design',
      'Creative Strategy',
    ],
    education: [
      'BBA (Marketing)',
      'Diploma in Graphic Design',
      'Certified Creative Professional',
      'Adobe Certified Expert',
    ],
    workPlaces: ['Motion Booster', 'BrandCraft BD', 'Freelance'],
  },
  {
    id: 2,
    name: 'Md. Habibur Rahman',
    role: 'Sr. Designer, Motion Booster',
    experience: '8 years+',
    projects: '350+',
    department: 'Creative',
    avatar: 'H',
    workExperience: [
      'Sr. Designer at Motion Booster',
      'Former Designer at CreativeHub',
      'Graphic Designer Freelancer',
    ],
    specializedArea: [
      'Graphic Design',
      'Brand Design',
      'Logo Design',
      'Animation',
    ],
    education: [
      'MBS (Accounting)',
      'Diploma In Graphic Design',
      'Diploma In Merchandising',
      'CBT&A (Level 5)',
    ],
    workPlaces: ['Motion Booster', 'CreativeHub', 'Freelance'],
  },
  {
    id: 3,
    name: 'Tania Akter',
    role: 'Sr. Developer, Motion Booster',
    experience: '6 years+',
    projects: '280+',
    department: 'Development',
    avatar: 'T',
    workExperience: [
      'Sr. Developer at Motion Booster',
      'Full Stack Developer at TechBD',
      'React Developer Freelancer',
    ],
    specializedArea: [
      'React & Next.js',
      'Node.js Backend',
      'UI Development',
      'REST API Design',
    ],
    education: [
      'BSc in Computer Science',
      'Certified Web Developer',
      'AWS Cloud Practitioner',
    ],
    workPlaces: ['Motion Booster', 'TechBD', 'Freelance'],
  },
  {
    id: 4,
    name: 'Rakibul Hasan',
    role: 'Motion Designer, Motion Booster',
    experience: '5 years+',
    projects: '200+',
    department: 'Creative',
    avatar: 'R',
    workExperience: [
      'Motion Designer at Motion Booster',
      'Video Editor at MediaHouse BD',
      'Freelance Animator',
    ],
    specializedArea: [
      'After Effects Animation',
      'Video Editing',
      'Motion Graphics',
      '2D/3D Animation',
    ],
    education: [
      'Diploma in Multimedia',
      'Adobe After Effects Certified',
      'Cinema 4D Training',
    ],
    workPlaces: ['Motion Booster', 'MediaHouse BD', 'Freelance'],
  },
  {
    id: 5,
    name: 'Nusrat Jahan',
    role: 'UI/UX Designer, Motion Booster',
    experience: '4 years+',
    projects: '150+',
    department: 'Design',
    avatar: 'N',
    workExperience: [
      'UI/UX Designer at Motion Booster',
      'Product Designer at AppLab',
      'Freelance UX Consultant',
    ],
    specializedArea: [
      'Figma & Prototyping',
      'User Research',
      'Mobile UI Design',
      'Interaction Design',
    ],
    education: [
      'BFA in Design',
      'Google UX Design Certificate',
      'Figma Advanced Training',
    ],
    workPlaces: ['Motion Booster', 'AppLab', 'Freelance'],
  },
  {
    id: 6,
    name: 'Arif Hossain',
    role: 'Sr. Developer, Motion Booster',
    experience: '7 years+',
    projects: '300+',
    department: 'Development',
    avatar: 'A',
    workExperience: [
      'Sr. Developer at Motion Booster',
      'Backend Engineer at DataSys',
      'Software Developer at SoftTech',
    ],
    specializedArea: [
      'Python & Django',
      'Database Architecture',
      'Cloud Infrastructure',
      'API Development',
    ],
    education: [
      'BSc in Software Engineering',
      'AWS Solutions Architect',
      'Docker & Kubernetes Certified',
    ],
    workPlaces: ['Motion Booster', 'DataSys', 'SoftTech'],
  },
  {
    id: 7,
    name: 'Sadia Islam',
    role: 'Digital Marketer, Motion Booster',
    experience: '5 years+',
    projects: '180+',
    department: 'Marketing',
    avatar: 'S',
    workExperience: [
      'Digital Marketer at Motion Booster',
      'SEO Specialist at GrowthLab',
      'Social Media Manager Freelancer',
    ],
    specializedArea: [
      'SEO & Content Marketing',
      'Social Media Strategy',
      'Google Ads & Meta Ads',
      'Email Marketing',
    ],
    education: [
      'BBA in Marketing',
      'Google Digital Marketing Certificate',
      'Meta Blueprint Certified',
    ],
    workPlaces: ['Motion Booster', 'GrowthLab', 'Freelance'],
  },
  {
    id: 8,
    name: 'Farhan Ahmed',
    role: 'Project Manager, Motion Booster',
    experience: '9 years+',
    projects: '400+',
    department: 'Management',
    avatar: 'F',
    workExperience: [
      'Project Manager at Motion Booster',
      'Sr. PM at TechVenture BD',
      'Agile Coach & Consultant',
    ],
    specializedArea: [
      'Agile & Scrum',
      'Project Planning',
      'Team Leadership',
      'Client Management',
    ],
    education: [
      'MBA (Project Management)',
      'PMP Certified',
      'Scrum Master Certified',
      'PRINCE2 Foundation',
    ],
    workPlaces: ['Motion Booster', 'TechVenture BD', 'Consulting'],
  },
];
