// Mock data for TrustWork app

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
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  client: string;
  duration: string;
  budget: string;
  skills: string[];
  verified: boolean;
  postedDate: string;
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
  companyName: string;
  registrationNumber: string;
  website: string;
  logo?: string;
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

export interface Assessment {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  badge: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

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
    postedDate: '2024-01-15'
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
    postedDate: '2024-01-14'
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
    postedDate: '2024-01-13'
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
    skills: ['Graphic Design', 'Adobe Illustrator'],
    verified: true,
    postedDate: '2024-01-16'
  },
  {
    id: '2',
    title: 'WordPress Website Setup',
    description: 'Set up a basic WordPress site with a custom theme.',
    client: 'Local Business Co',
    duration: '1 week',
    budget: 'R4,000',
    skills: ['WordPress', 'Web Development'],
    verified: true,
    postedDate: '2024-01-15'
  },
  {
    id: '3',
    title: 'Social Media Content Creation',
    description: 'Create 20 Instagram posts for a fashion brand.',
    client: 'Fashion Forward',
    duration: '5 days',
    budget: 'R1,800',
    skills: ['Social Media', 'Content Creation', 'Canva'],
    verified: true,
    postedDate: '2024-01-14'
  }
];

// Mock User Data
export const mockJobSeeker: JobSeekerProfile = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah@email.com',
  role: 'job_seeker',
  verified: true,
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

// Mock Assessments
export const mockAssessments: Assessment[] = [
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