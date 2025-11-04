// Mock data for TrustWork app

// Skill Test Configuration for Jobs
export interface SkillTestConfig {
  enabled: boolean;
  requiredSkills: string[]; // e.g., ["React", "TypeScript", "Node.js"]
  questionCount: number; // 10-30
  duration: number; // auto-calculated: questionCount * 1.5 minutes
  minimumPassScore: number; // 60-80%
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  verified: boolean;
  flagged: boolean;
  salary?: string;
  requirements: string[];
  postedDate: string;
  skillTestConfig?: SkillTestConfig;
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  client: string;
  duration: string;
  budget: string;
  budgetRange: 'low' | 'medium' | 'high';
  skills: string[];
  verified: boolean;
  postedDate: string;
  type: 'gig' | 'job';
  remote: boolean;
  companyDetails?: {
    companySize: string;
    industry: string;
    location: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'job_seeker' | 'employer';
  avatar?: string;
  verified: boolean;
}

export interface JobSeekerProfile extends User {
  skills: string[];
  completedJobs: number;
  rating: number;
  portfolio: PortfolioItem[];
  cvUploaded: boolean;
  location?: string;
  phone?: string;
}

export interface EmployerProfile extends User {
  company?: string; // Alias for companyName (for backward compatibility)
  companyName: string;
  registrationNumber: string;
  website: string;
  logo?: string;
  rating?: number;
  verificationStatus: 'pending' | 'verified' | 'flagged';
  riskFlags: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  client: string;
  rating: number;
  completedDate: string;
  skills: string[];
}

export interface SkillTest {
  id: string;
  title: string;
  description: string;
  questions: SkillTestQuestion[];
  badge: string;
}

export interface SkillTestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

// Keep legacy exports for backwards compatibility
export type Assessment = SkillTest;
export type Question = SkillTestQuestion;

// Mock Jobs Data
export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Solutions',
    location: 'Remote',
    type: 'Full-time',
    description: 'We are looking for an experienced frontend developer to join our growing team.',
    verified: true,
    flagged: false,
    salary: 'R45,000 - R65,000',
    requirements: ['React', 'TypeScript', '3+ years experience'],
    postedDate: '2024-01-15',
    skillTestConfig: {
      enabled: true,
      requiredSkills: ['React', 'JavaScript'], // Updated to use available skills
      questionCount: 20,
      duration: 30, // minutes
      minimumPassScore: 75
    }
  },
  {
    id: '2',
    title: 'Marketing Manager',
    company: 'Digital Innovations',
    location: 'Johannesburg',
    type: 'Full-time',
    description: 'Lead our marketing efforts across digital channels.',
    verified: true,
    flagged: false,
    salary: 'R35,000 - R50,000',
    requirements: ['Digital Marketing', 'Social Media', '2+ years experience'],
    postedDate: '2024-01-14',
    skillTestConfig: {
      enabled: true,
      requiredSkills: ['JavaScript', 'React'], // Updated to use available skills (Marketing skills not yet in question bank)
      questionCount: 15,
      duration: 22, // minutes
      minimumPassScore: 70
    }
  },
  {
    id: '3',
    title: 'Data Entry Clerk',
    company: 'QuickCash Enterprise',
    location: 'Cape Town',
    type: 'Contract',
    description: 'Urgent data entry work available. High pay guaranteed!',
    verified: false,
    flagged: true,
    salary: 'R15,000',
    requirements: ['Basic computer skills'],
    postedDate: '2024-01-16'
    // No skill test - flagged job
  },
  {
    id: '4',
    title: 'Customer Service Representative',
    company: 'Service Excellence Ltd',
    location: 'Durban',
    type: 'Full-time',
    description: 'Join our customer service team and help clients with their inquiries.',
    verified: true,
    flagged: false,
    salary: 'R18,000 - R25,000',
    requirements: ['Communication skills', 'Problem solving'],
    postedDate: '2024-01-13',
    skillTestConfig: {
      enabled: true,
      requiredSkills: ['JavaScript'], // Updated to use available skills (Customer Service not yet in question bank)
      questionCount: 10,
      duration: 15, // minutes
      minimumPassScore: 65
    }
  },
  {
    id: '5',
    title: 'Investment Opportunity Representative',
    company: 'FastMoney Solutions',
    location: 'Remote',
    type: 'Commission',
    description: 'Earn big money selling investment opportunities to friends and family!',
    verified: false,
    flagged: true,
    salary: 'Commission only',
    requirements: ['Sales experience'],
    postedDate: '2024-01-17'
    // No skill test - flagged job
  }
];

// Mock Gigs Data
export const mockGigs: Gig[] = [
  {
    id: '1',
    title: 'Logo Design for Tech Startup',
    description: 'Create a modern, professional logo for a new tech company.',
    client: 'StartupXYZ',
    duration: '3 days',
    budget: 'R2,500',
    budgetRange: 'low',
    skills: ['Graphic Design', 'Adobe Illustrator'],
    verified: true,
    postedDate: '2024-01-16',
    type: 'gig',
    remote: true
  },
  {
    id: '2',
    title: 'WordPress Website Setup',
    description: 'Set up a basic WordPress site with a custom theme.',
    client: 'Local Business Co',
    duration: '1 week',
    budget: '4,000',
    budgetRange: 'medium',
    skills: ['WordPress', 'Web Development'],
    verified: true,
    postedDate: '2024-01-15',
    type: 'gig',
    remote: true
  },
  {
    id: '3',
    title: 'Social Media Content Creation',
    description: 'Create 20 Instagram posts for a fashion brand.',
    client: 'Fashion Forward',
    duration: '5 days',
    budget: '1,800',
    budgetRange: 'low',
    skills: ['Social Media', 'Content Creation', 'Canva'],
    verified: true,
    postedDate: '2024-01-14',
    type: 'gig',
    remote: true
  },
  {
    id: '4',
    title: 'Senior Frontend Developer',
    description: 'Looking for an experienced frontend developer to join our growing team.',
    client: 'TechCorp Solutions',
    duration: '3+ months',
    budget: 'R45,000 - R65,000',
    budgetRange: 'high',
    skills: ['React', 'TypeScript', 'Node.js'],
    verified: true,
    postedDate: '2024-01-13',
    type: 'job',
    remote: true,
    companyDetails: {
      companySize: '51-200',
      industry: 'technology',
      location: 'Cape Town'
    }
  },
  {
    id: '5',
    title: 'Digital Marketing Manager',
    description: 'Lead our digital marketing efforts and grow our online presence.',
    client: 'Digital Innovations',
    duration: 'Full-time',
    budget: 'R35,000 - R50,000',
    budgetRange: 'high',
    skills: ['Digital Marketing', 'SEO', 'Social Media Management'],
    verified: true,
    postedDate: '2024-01-12',
    type: 'job',
    remote: false,
    companyDetails: {
      companySize: '11-50',
      industry: 'marketing',
      location: 'Johannesburg'
    }
  }
];

// Mock User Data
export const mockJobSeeker: JobSeekerProfile = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah@email.com',
  role: 'job_seeker',
  verified: true,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  skills: ['React', 'TypeScript', 'Node.js', 'Digital Marketing'],
  completedJobs: 12,
  rating: 4.8,
  cvUploaded: true,
  location: 'Cape Town',
  phone: '+27 12 345 6789',
  portfolio: [
    {
      id: '1',
      title: 'E-commerce Website Development',
      description: 'Built a full-stack e-commerce platform using React and Node.js',
      client: 'Online Store ABC',
      rating: 5,
      completedDate: '2024-01-10',
      skills: ['React', 'Node.js', 'MongoDB']
    },
    {
      id: '2',
      title: 'Marketing Campaign Management',
      description: 'Managed social media campaign that increased engagement by 150%',
      client: 'Marketing Agency XYZ',
      rating: 4.5,
      completedDate: '2023-12-20',
      skills: ['Digital Marketing', 'Social Media', 'Analytics']
    }
  ]
};

export const mockEmployer: EmployerProfile = {
  id: '2',
  name: 'John Smith',
  email: 'john@techcorp.com',
  role: 'employer',
  verified: true,
  rating: 4.9,
  company: 'TechCorp Solutions', // Added for test compatibility
  companyName: 'TechCorp Solutions',
  registrationNumber: 'REG123456789',
  website: 'https://techcorp.co.za',
  verificationStatus: 'verified',
  riskFlags: []
};

export const mockFlaggedEmployer: EmployerProfile = {
  id: '3',
  name: 'Quick Money',
  email: 'contact@quickcash.gmail.com',
  role: 'employer',
  verified: false,
  companyName: 'QuickCash Enterprise',
  registrationNumber: 'N/A',
  website: '',
  verificationStatus: 'flagged',
  riskFlags: ['Gmail domain', 'No registration number', 'High salary promises']
};

// Mock Skill Tests
export const mockSkillTests: SkillTest[] = [
  {
    id: '1',
    title: 'Excel Basics',
    description: 'Test your knowledge of Microsoft Excel fundamentals',
    badge: 'Excel Certified',
    questions: [
      {
        id: '1',
        question: 'What function calculates the sum of a range of cells?',
        options: ['SUM()', 'ADD()', 'TOTAL()', 'CALC()'],
        correctAnswer: 0
      },
      {
        id: '2',
        question: 'Which key combination saves a file in Excel?',
        options: ['Ctrl+A', 'Ctrl+S', 'Ctrl+C', 'Ctrl+V'],
        correctAnswer: 1
      },
      {
        id: '3',
        question: 'What does VLOOKUP function do?',
        options: ['Validates data', 'Looks up values vertically', 'Creates variables', 'Locks cells'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: '2',
    title: 'Digital Marketing',
    description: 'Assess your digital marketing knowledge and skills',
    badge: 'Marketing Professional',
    questions: [
      {
        id: '1',
        question: 'What does CTR stand for in digital marketing?',
        options: ['Click Through Rate', 'Cost To Reach', 'Customer Target Rating', 'Content Type Ratio'],
        correctAnswer: 0
      },
      {
        id: '2',
        question: 'Which platform is best for B2B marketing?',
        options: ['Instagram', 'TikTok', 'LinkedIn', 'Snapchat'],
        correctAnswer: 2
      },
      {
        id: '3',
        question: 'What is SEO?',
        options: ['Social Engine Optimization', 'Search Engine Optimization', 'Sales Enhancement Online', 'System Error Override'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: '3',
    title: 'Customer Service',
    description: 'Evaluate your customer service skills and approach',
    badge: 'Service Excellence',
    questions: [
      {
        id: '1',
        question: 'What is the most important aspect of customer service?',
        options: ['Speed', 'Active listening', 'Product knowledge', 'Following scripts'],
        correctAnswer: 1
      },
      {
        id: '2',
        question: 'How should you handle an angry customer?',
        options: ['Argue back', 'Transfer immediately', 'Stay calm and empathize', 'Hang up'],
        correctAnswer: 2
      },
      {
        id: '3',
        question: 'What does CRM stand for?',
        options: ['Customer Relationship Management', 'Customer Request Manager', 'Call Response Method', 'Client Review Metrics'],
        correctAnswer: 0
      }
    ]
  }
];

// Mock Reviews Data
export interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
}

export const mockReviews: Review[] = [
  {
    id: '1',
    rating: 5,
    comment: 'Excellent work, highly professional and delivered on time!',
    author: 'John Smith',
    date: '2024-01-15'
  },
  {
    id: '2',
    rating: 4,
    comment: 'Great communication and quality work.',
    author: 'Sarah Johnson',
    date: '2024-01-10'
  },
  {
    id: '3',
    rating: 5,
    comment: 'Outstanding results, exceeded expectations!',
    author: 'Mike Brown',
    date: '2024-01-05'
  }
];

// Mock Certifications Data
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  type: 'skill' | 'education' | 'professional';
}

export const mockCertifications: Certification[] = [
  {
    id: '1',
    name: 'React Developer Certification',
    issuer: 'Meta',
    date: '2023-12-01',
    type: 'skill'
  },
  {
    id: '2',
    name: 'Bachelor of Computer Science',
    issuer: 'University of Cape Town',
    date: '2022-06-15',
    type: 'education'
  },
  {
    id: '3',
    name: 'Certified Digital Marketing Professional',
    issuer: 'Digital Marketing Institute',
    date: '2023-09-20',
    type: 'professional'
  }
];

// Keep legacy export for backwards compatibility
export const mockAssessments = mockSkillTests;