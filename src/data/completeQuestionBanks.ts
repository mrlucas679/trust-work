/**
 * @fileoverview Complete Assignment Question Banks - All 25 Skill Categories
 * Foundation, Intermediate, and Advanced levels for each category
 */

import { QuestionBank } from '@/types/assignments';

// Export all question banks
export const allQuestionBanks: QuestionBank[] = [
  // DIGITAL MARKETING - Foundation
  {
    skill: 'digital-marketing',
    level: 'foundation',
    questions: [
      {
        id: 'dmf_001',
        question: 'What is a Call-to-Action (CTA)?',
        options: [
          'A) A metric measuring website traffic',
          'B) A button or link encouraging users to take action',
          'C) A type of social media post',
          'D) An email marketing template',
        ],
        correctAnswer: 'B',
        explanation: 'A CTA prompts immediate response like "Buy Now" or "Sign Up"',
        difficulty: 'easy',
        topics: ['basics', 'conversion'],
      },
      {
        id: 'dmf_002',
        question: 'What does SEO stand for?',
        options: [
          'A) Social Engine Optimization',
          'B) Search Engine Optimization',
          'C) Sales Enhancement Online',
          'D) System Error Override',
        ],
        correctAnswer: 'B',
        explanation: 'SEO improves website visibility in organic search results',
        difficulty: 'easy',
        topics: ['seo', 'basics'],
      },
      {
        id: 'dmf_003',
        question: 'What is the primary goal of content marketing?',
        options: [
          'A) Immediate sales conversion',
          'B) Building brand awareness and trust',
          'C) Reducing website traffic',
          'D) Eliminating competitors',
        ],
        correctAnswer: 'B',
        explanation: 'Content marketing focuses on providing value to build long-term relationships',
        difficulty: 'easy',
        topics: ['content', 'strategy'],
      },
    ],
  },

  // WEB DEVELOPMENT - Foundation
  {
    skill: 'web-development',
    level: 'foundation',
    questions: [
      {
        id: 'wdf_001',
        question: 'What does HTML stand for?',
        options: [
          'A) Hyper Text Markup Language',
          'B) High Tech Modern Language',
          'C) Home Tool Markup Language',
          'D) Hyperlinks and Text Markup Language',
        ],
        correctAnswer: 'A',
        explanation: 'HTML is the standard markup language for creating web pages',
        difficulty: 'easy',
        topics: ['html', 'basics'],
      },
      {
        id: 'wdf_002',
        question: 'Which CSS property is used to change text color?',
        options: [
          'A) text-color',
          'B) font-color',
          'C) color',
          'D) text-style',
        ],
        correctAnswer: 'C',
        explanation: 'The "color" property in CSS controls the text color',
        difficulty: 'easy',
        topics: ['css', 'styling'],
      },
      {
        id: 'wdf_003',
        question: 'What is JavaScript primarily used for?',
        options: [
          'A) Styling web pages',
          'B) Structuring web content',
          'C) Adding interactivity to web pages',
          'D) Managing databases',
        ],
        correctAnswer: 'C',
        explanation: 'JavaScript adds dynamic behavior and interactivity to websites',
        difficulty: 'easy',
        topics: ['javascript', 'basics'],
      },
    ],
  },

  // GRAPHIC DESIGN - Foundation
  {
    skill: 'graphic-design',
    level: 'foundation',
    questions: [
      {
        id: 'gdf_001',
        question: 'What are the primary colors in color theory?',
        options: [
          'A) Red, Blue, Yellow',
          'B) Red, Green, Blue',
          'C) Cyan, Magenta, Yellow',
          'D) Black, White, Gray',
        ],
        correctAnswer: 'A',
        explanation: 'Red, Blue, and Yellow are the traditional primary colors',
        difficulty: 'easy',
        topics: ['color-theory', 'basics'],
      },
      {
        id: 'gdf_002',
        question: 'What does DPI stand for in graphic design?',
        options: [
          'A) Digital Print Index',
          'B) Dots Per Inch',
          'C) Design Print Interface',
          'D) Digital Pixel Intensity',
        ],
        correctAnswer: 'B',
        explanation: 'DPI measures the resolution of printed images',
        difficulty: 'easy',
        topics: ['printing', 'basics'],
      },
      {
        id: 'gdf_003',
        question: 'What is a vector graphic?',
        options: [
          'A) An image made of pixels',
          'B) An image created using mathematical formulas',
          'C) A low-resolution image',
          'D) A photograph',
        ],
        correctAnswer: 'B',
        explanation: 'Vector graphics use mathematical formulas and can scale without quality loss',
        difficulty: 'easy',
        topics: ['vectors', 'basics'],
      },
    ],
  },

  // WRITING & TRANSLATION - Foundation
  {
    skill: 'writing-translation',
    level: 'foundation',
    questions: [
      {
        id: 'wtf_001',
        question: 'What is copywriting?',
        options: [
          'A) Copying existing content',
          'B) Writing persuasive marketing text',
          'C) Translating documents',
          'D) Proofreading articles',
        ],
        correctAnswer: 'B',
        explanation: 'Copywriting creates persuasive content to drive marketing goals',
        difficulty: 'easy',
        topics: ['copywriting', 'marketing'],
      },
      {
        id: 'wtf_002',
        question: 'What is the purpose of proofreading?',
        options: [
          'A) To rewrite content entirely',
          'B) To check for spelling, grammar, and punctuation errors',
          'C) To translate text',
          'D) To create new content',
        ],
        correctAnswer: 'B',
        explanation: 'Proofreading identifies and corrects errors in written content',
        difficulty: 'easy',
        topics: ['proofreading', 'editing'],
      },
      {
        id: 'wtf_003',
        question: 'What is SEO writing?',
        options: [
          'A) Writing for print media',
          'B) Writing optimized for search engines',
          'C) Creative fiction writing',
          'D) Technical documentation',
        ],
        correctAnswer: 'B',
        explanation: 'SEO writing incorporates keywords to improve search engine rankings',
        difficulty: 'easy',
        topics: ['seo', 'content'],
      },
    ],
  },

  // VIDEO & ANIMATION - Foundation
  {
    skill: 'video-animation',
    level: 'foundation',
    questions: [
      {
        id: 'vaf_001',
        question: 'What is frame rate in video?',
        options: [
          'A) The size of the video file',
          'B) The number of frames displayed per second',
          'C) The resolution of the video',
          'D) The aspect ratio',
        ],
        correctAnswer: 'B',
        explanation: 'Frame rate (fps) determines how many images are shown per second',
        difficulty: 'easy',
        topics: ['video', 'basics'],
      },
      {
        id: 'vaf_002',
        question: 'What is keyframe animation?',
        options: [
          'A) Animation using only one frame',
          'B) Setting start and end points for computer to fill in-between frames',
          'C) Hand-drawing every single frame',
          'D) Using stock animations',
        ],
        correctAnswer: 'B',
        explanation: 'Keyframes define major points and software interpolates the movement',
        difficulty: 'easy',
        topics: ['animation', 'basics'],
      },
      {
        id: 'vaf_003',
        question: 'What does rendering mean in video production?',
        options: [
          'A) Deleting unused footage',
          'B) Processing and exporting the final video',
          'C) Recording new footage',
          'D) Uploading to social media',
        ],
        correctAnswer: 'B',
        explanation: 'Rendering combines all elements into a final playable video file',
        difficulty: 'easy',
        topics: ['production', 'workflow'],
      },
    ],
  },

  // MUSIC & AUDIO - Foundation
  {
    skill: 'music-audio',
    level: 'foundation',
    questions: [
      {
        id: 'maf_001',
        question: 'What is a DAW?',
        options: [
          'A) Digital Audio Workstation',
          'B) Dynamic Audio Wave',
          'C) Direct Audio Wire',
          'D) Digital Amplifier Widget',
        ],
        correctAnswer: 'A',
        explanation: 'DAW is software for recording, editing, and producing audio',
        difficulty: 'easy',
        topics: ['software', 'basics'],
      },
      {
        id: 'maf_002',
        question: 'What does "sample rate" measure in audio?',
        options: [
          'A) The volume of the audio',
          'B) The number of audio samples per second',
          'C) The length of the audio file',
          'D) The number of instruments',
        ],
        correctAnswer: 'B',
        explanation: 'Sample rate determines audio quality (e.g., 44.1kHz)',
        difficulty: 'easy',
        topics: ['audio', 'technical'],
      },
      {
        id: 'maf_003',
        question: 'What is MIDI?',
        options: [
          'A) A type of microphone',
          'B) A protocol for communicating musical performance data',
          'C) An audio file format',
          'D) A music streaming service',
        ],
        correctAnswer: 'B',
        explanation: 'MIDI transmits performance data, not actual audio',
        difficulty: 'easy',
        topics: ['midi', 'production'],
      },
    ],
  },

  // BUSINESS - Foundation
  {
    skill: 'business',
    level: 'foundation',
    questions: [
      {
        id: 'bf_001',
        question: 'What is a business plan?',
        options: [
          'A) A daily schedule',
          'B) A document outlining business goals and strategies',
          'C) An employee handbook',
          'D) A financial spreadsheet',
        ],
        correctAnswer: 'B',
        explanation: 'A business plan details how a business will achieve its objectives',
        difficulty: 'easy',
        topics: ['planning', 'strategy'],
      },
      {
        id: 'bf_002',
        question: 'What does ROI stand for?',
        options: [
          'A) Return On Investment',
          'B) Rate Of Interest',
          'C) Revenue Over Income',
          'D) Risk Of Inflation',
        ],
        correctAnswer: 'A',
        explanation: 'ROI measures the profitability of an investment',
        difficulty: 'easy',
        topics: ['finance', 'metrics'],
      },
      {
        id: 'bf_003',
        question: 'What is market research?',
        options: [
          'A) Selling products at a market',
          'B) Gathering data about customers and competition',
          'C) Advertising campaigns',
          'D) Stock market analysis',
        ],
        correctAnswer: 'B',
        explanation: 'Market research collects information to make informed business decisions',
        difficulty: 'easy',
        topics: ['research', 'strategy'],
      },
    ],
  },

  // DATA ENTRY - Foundation
  {
    skill: 'data-entry',
    level: 'foundation',
    questions: [
      {
        id: 'def_001',
        question: 'What is the primary goal of data entry?',
        options: [
          'A) To analyze data trends',
          'B) To accurately input data into systems',
          'C) To delete outdated information',
          'D) To create reports',
        ],
        correctAnswer: 'B',
        explanation: 'Data entry focuses on accurate and efficient data input',
        difficulty: 'easy',
        topics: ['basics', 'accuracy'],
      },
      {
        id: 'def_002',
        question: 'What is WPM in data entry?',
        options: [
          'A) Work Per Minute',
          'B) Words Per Minute',
          'C) Websites Per Month',
          'D) Windows Processing Mode',
        ],
        correctAnswer: 'B',
        explanation: 'WPM measures typing speed',
        difficulty: 'easy',
        topics: ['speed', 'metrics'],
      },
      {
        id: 'def_003',
        question: 'Why is data validation important?',
        options: [
          'A) It makes data entry faster',
          'B) It ensures data accuracy and quality',
          'C) It reduces file sizes',
          'D) It automates the process',
        ],
        correctAnswer: 'B',
        explanation: 'Data validation prevents errors and maintains data integrity',
        difficulty: 'easy',
        topics: ['quality', 'accuracy'],
      },
    ],
  },

  // ENGINEERING - Foundation
  {
    skill: 'engineering',
    level: 'foundation',
    questions: [
      {
        id: 'engf_001',
        question: 'What is the primary purpose of engineering?',
        options: [
          'A) To make things expensive',
          'B) To apply science and math to solve practical problems',
          'C) To complicate simple tasks',
          'D) To create theoretical models only',
        ],
        correctAnswer: 'B',
        explanation: 'Engineering uses scientific principles to design and build practical solutions',
        difficulty: 'easy',
        topics: ['fundamentals', 'problem-solving'],
      },
      {
        id: 'engf_002',
        question: 'What does CAD stand for in engineering?',
        options: [
          'A) Computer Automated Design',
          'B) Central Analysis Database',
          'C) Computer-Aided Design',
          'D) Creative Art Development',
        ],
        correctAnswer: 'C',
        explanation: 'CAD software helps engineers create precise technical drawings',
        difficulty: 'easy',
        topics: ['tools', 'design'],
      },
      {
        id: 'engf_003',
        question: 'What is a prototype in engineering?',
        options: [
          'A) The final product ready for sale',
          'B) An early working model to test concepts',
          'C) A theoretical design only',
          'D) A marketing presentation',
        ],
        correctAnswer: 'B',
        explanation: 'Prototypes help test and refine designs before full production',
        difficulty: 'easy',
        topics: ['development', 'testing'],
      },
    ],
  },

  // ARCHITECTURE - Foundation
  {
    skill: 'architecture',
    level: 'foundation',
    questions: [
      {
        id: 'archf_001',
        question: 'What is the main purpose of architectural blueprints?',
        options: [
          'A) To decorate offices',
          'B) To provide detailed construction plans',
          'C) To sell properties',
          'D) To store historical records',
        ],
        correctAnswer: 'B',
        explanation: 'Blueprints communicate design intent to contractors and builders',
        difficulty: 'easy',
        topics: ['documentation', 'planning'],
      },
      {
        id: 'archf_002',
        question: 'What does "load-bearing wall" mean?',
        options: [
          'A) A wall that can be removed easily',
          'B) A wall that supports structural weight',
          'C) A decorative partition',
          'D) An exterior wall only',
        ],
        correctAnswer: 'B',
        explanation: 'Load-bearing walls are critical to structural integrity',
        difficulty: 'easy',
        topics: ['structure', 'safety'],
      },
      {
        id: 'archf_003',
        question: 'What is sustainable architecture?',
        options: [
          'A) Using only expensive materials',
          'B) Designing buildings with environmental responsibility',
          'C) Creating temporary structures',
          'D) Avoiding modern technology',
        ],
        correctAnswer: 'B',
        explanation: 'Sustainable architecture minimizes environmental impact',
        difficulty: 'easy',
        topics: ['sustainability', 'design'],
      },
    ],
  },

  // LEGAL - Foundation
  {
    skill: 'legal',
    level: 'foundation',
    questions: [
      {
        id: 'legf_001',
        question: 'What is a contract?',
        options: [
          'A) A verbal promise',
          'B) A legally binding agreement between parties',
          'C) A suggestion',
          'D) An informal understanding',
        ],
        correctAnswer: 'B',
        explanation: 'Contracts create enforceable legal obligations',
        difficulty: 'easy',
        topics: ['contracts', 'fundamentals'],
      },
      {
        id: 'legf_002',
        question: 'What does "due diligence" mean in legal terms?',
        options: [
          'A) Working overtime',
          'B) Reasonable investigation before making a decision',
          'C) Following company policies',
          'D) Being punctual',
        ],
        correctAnswer: 'B',
        explanation: 'Due diligence ensures informed decision-making',
        difficulty: 'easy',
        topics: ['research', 'compliance'],
      },
      {
        id: 'legf_003',
        question: 'What is intellectual property?',
        options: [
          'A) Physical office supplies',
          'B) Creations of the mind with legal protection',
          'C) Real estate',
          'D) Employee skills',
        ],
        correctAnswer: 'B',
        explanation: 'IP includes patents, trademarks, and copyrights',
        difficulty: 'easy',
        topics: ['ip', 'protection'],
      },
    ],
  },

  // ACCOUNTING - Foundation
  {
    skill: 'accounting',
    level: 'foundation',
    questions: [
      {
        id: 'accf_001',
        question: 'What is the accounting equation?',
        options: [
          'A) Revenue - Expenses = Profit',
          'B) Assets = Liabilities + Equity',
          'C) Income - Taxes = Net Income',
          'D) Sales - Costs = Margin',
        ],
        correctAnswer: 'B',
        explanation: 'The fundamental equation that balances all financial statements',
        difficulty: 'easy',
        topics: ['fundamentals', 'equations'],
      },
      {
        id: 'accf_002',
        question: 'What is double-entry bookkeeping?',
        options: [
          'A) Recording transactions twice for backup',
          'B) Every transaction affects at least two accounts',
          'C) Using two accountants',
          'D) Keeping two sets of books',
        ],
        correctAnswer: 'B',
        explanation: 'Double-entry ensures accuracy and balance in accounting',
        difficulty: 'easy',
        topics: ['bookkeeping', 'methods'],
      },
      {
        id: 'accf_003',
        question: 'What is depreciation?',
        options: [
          'A) Increase in asset value',
          'B) Systematic allocation of asset cost over time',
          'C) Loss of inventory',
          'D) Employee salary reduction',
        ],
        correctAnswer: 'B',
        explanation: 'Depreciation matches asset cost with revenue generated',
        difficulty: 'easy',
        topics: ['assets', 'valuation'],
      },
    ],
  },

  // HUMAN RESOURCES - Foundation
  {
    skill: 'hr',
    level: 'foundation',
    questions: [
      {
        id: 'hrf_001',
        question: 'What is the main purpose of HR in an organization?',
        options: [
          'A) To fire employees',
          'B) To manage employee lifecycle and support organizational goals',
          'C) To organize parties',
          'D) To reduce costs only',
        ],
        correctAnswer: 'B',
        explanation: 'HR aligns people strategy with business objectives',
        difficulty: 'easy',
        topics: ['fundamentals', 'strategy'],
      },
      {
        id: 'hrf_002',
        question: 'What is onboarding?',
        options: [
          'A) Getting on an airplane',
          'B) The process of integrating new employees',
          'C) Terminating employment',
          'D) Performance review',
        ],
        correctAnswer: 'B',
        explanation: 'Onboarding helps new hires adapt and become productive',
        difficulty: 'easy',
        topics: ['recruitment', 'training'],
      },
      {
        id: 'hrf_003',
        question: 'What is employee engagement?',
        options: [
          'A) Getting married to coworkers',
          'B) The emotional commitment employees have to their work',
          'C) Required attendance',
          'D) Social media activity',
        ],
        correctAnswer: 'B',
        explanation: 'Engaged employees are more productive and loyal',
        difficulty: 'easy',
        topics: ['culture', 'performance'],
      },
    ],
  },

  // CONSULTING - Foundation
  {
    skill: 'consulting',
    level: 'foundation',
    questions: [
      {
        id: 'consf_001',
        question: 'What is the primary role of a consultant?',
        options: [
          'A) To sell products',
          'B) To provide expert advice to solve problems',
          'C) To manage day-to-day operations',
          'D) To replace existing employees',
        ],
        correctAnswer: 'B',
        explanation: 'Consultants bring specialized expertise to client challenges',
        difficulty: 'easy',
        topics: ['fundamentals', 'advisory'],
      },
      {
        id: 'consf_002',
        question: 'What is a stakeholder in consulting?',
        options: [
          'A) Someone who owns stocks',
          'B) Anyone affected by or who can influence a project',
          'C) The CEO only',
          'D) External investors',
        ],
        correctAnswer: 'B',
        explanation: 'Understanding stakeholders is crucial for project success',
        difficulty: 'easy',
        topics: ['stakeholders', 'management'],
      },
      {
        id: 'consf_003',
        question: 'What is a deliverable in consulting?',
        options: [
          'A) Physical product delivery',
          'B) A tangible output promised to the client',
          'C) Food delivery service',
          'D) Meeting attendance',
        ],
        correctAnswer: 'B',
        explanation: 'Deliverables define project scope and expectations',
        difficulty: 'easy',
        topics: ['project-management', 'outputs'],
      },
    ],
  },

  // EDUCATION - Foundation
  {
    skill: 'education',
    level: 'foundation',
    questions: [
      {
        id: 'eduf_001',
        question: 'What is differentiated instruction?',
        options: [
          'A) Teaching only advanced students',
          'B) Tailoring teaching to meet diverse student needs',
          'C) Using different classrooms',
          'D) Separating students by ability',
        ],
        correctAnswer: 'B',
        explanation: 'Differentiation addresses varied learning styles and abilities',
        difficulty: 'easy',
        topics: ['teaching', 'methods'],
      },
      {
        id: 'eduf_002',
        question: 'What is formative assessment?',
        options: [
          'A) Final exam',
          'B) Ongoing evaluation to guide instruction',
          'C) Standardized testing',
          'D) Grade assignment',
        ],
        correctAnswer: 'B',
        explanation: 'Formative assessments help adjust teaching strategies',
        difficulty: 'easy',
        topics: ['assessment', 'feedback'],
      },
      {
        id: 'eduf_003',
        question: 'What is a learning objective?',
        options: [
          'A) The teacher\'s personal goal',
          'B) A clear statement of what students should achieve',
          'C) Classroom decoration',
          'D) School policy',
        ],
        correctAnswer: 'B',
        explanation: 'Learning objectives guide instruction and assessment',
        difficulty: 'easy',
        topics: ['planning', 'goals'],
      },
    ],
  },

  // HEALTHCARE - Foundation
  {
    skill: 'healthcare',
    level: 'foundation',
    questions: [
      {
        id: 'hcf_001',
        question: 'What does HIPAA protect?',
        options: [
          'A) Hospital equipment',
          'B) Patient privacy and health information',
          'C) Doctor salaries',
          'D) Insurance companies',
        ],
        correctAnswer: 'B',
        explanation: 'HIPAA ensures confidentiality of patient health information',
        difficulty: 'easy',
        topics: ['compliance', 'privacy'],
      },
      {
        id: 'hcf_002',
        question: 'What is patient-centered care?',
        options: [
          'A) Treating only wealthy patients',
          'B) Respecting patient preferences and values in care decisions',
          'C) Keeping patients in the center of the room',
          'D) Focusing only on medical conditions',
        ],
        correctAnswer: 'B',
        explanation: 'Patient-centered care improves satisfaction and outcomes',
        difficulty: 'easy',
        topics: ['care-quality', 'ethics'],
      },
      {
        id: 'hcf_003',
        question: 'What is telemedicine?',
        options: [
          'A) Television in hospitals',
          'B) Remote healthcare delivery using technology',
          'C) Telephone-only appointments',
          'D) Emergency services',
        ],
        correctAnswer: 'B',
        explanation: 'Telemedicine increases healthcare accessibility',
        difficulty: 'easy',
        topics: ['technology', 'access'],
      },
    ],
  },

  // REAL ESTATE - Foundation
  {
    skill: 'real-estate',
    level: 'foundation',
    questions: [
      {
        id: 'ref_001',
        question: 'What is a real estate listing?',
        options: [
          'A) A grocery store inventory',
          'B) A property offered for sale or rent',
          'C) A phone directory',
          'D) An employee roster',
        ],
        correctAnswer: 'B',
        explanation: 'Listings advertise properties to potential buyers or tenants',
        difficulty: 'easy',
        topics: ['marketing', 'sales'],
      },
      {
        id: 'ref_002',
        question: 'What is a property appraisal?',
        options: [
          'A) A compliment about the property',
          'B) A professional estimate of property value',
          'C) A cleaning service',
          'D) A renovation plan',
        ],
        correctAnswer: 'B',
        explanation: 'Appraisals determine fair market value for transactions',
        difficulty: 'easy',
        topics: ['valuation', 'assessment'],
      },
      {
        id: 'ref_003',
        question: 'What is a buyer\'s market?',
        options: [
          'A) A farmer\'s market',
          'B) When supply exceeds demand, favoring buyers',
          'C) A shopping mall',
          'D) When prices are always high',
        ],
        correctAnswer: 'B',
        explanation: 'Buyer\'s markets offer more negotiating power to purchasers',
        difficulty: 'easy',
        topics: ['market-conditions', 'strategy'],
      },
    ],
  },

  // LOGISTICS - Foundation
  {
    skill: 'logistics',
    level: 'foundation',
    questions: [
      {
        id: 'logf_001',
        question: 'What is supply chain management?',
        options: [
          'A) Managing office supplies',
          'B) Coordinating flow of goods from supplier to customer',
          'C) Chain store operations',
          'D) Employee scheduling',
        ],
        correctAnswer: 'B',
        explanation: 'Supply chain management optimizes product delivery',
        difficulty: 'easy',
        topics: ['supply-chain', 'management'],
      },
      {
        id: 'logf_002',
        question: 'What is inventory management?',
        options: [
          'A) Creating new products',
          'B) Tracking and controlling stock levels',
          'C) Marketing products',
          'D) Customer service',
        ],
        correctAnswer: 'B',
        explanation: 'Proper inventory management reduces costs and meets demand',
        difficulty: 'easy',
        topics: ['inventory', 'control'],
      },
      {
        id: 'logf_003',
        question: 'What does "last-mile delivery" mean?',
        options: [
          'A) The longest delivery route',
          'B) The final step of delivery to the customer',
          'C) Overnight shipping',
          'D) International shipping',
        ],
        correctAnswer: 'B',
        explanation: 'Last-mile delivery is often the most costly and complex step',
        difficulty: 'easy',
        topics: ['delivery', 'operations'],
      },
    ],
  },

  // MANUFACTURING - Foundation
  {
    skill: 'manufacturing',
    level: 'foundation',
    questions: [
      {
        id: 'manf_001',
        question: 'What is lean manufacturing?',
        options: [
          'A) Manufacturing diet products',
          'B) Minimizing waste while maximizing value',
          'C) Reducing employee count',
          'D) Using only lightweight materials',
        ],
        correctAnswer: 'B',
        explanation: 'Lean principles improve efficiency and reduce costs',
        difficulty: 'easy',
        topics: ['lean', 'efficiency'],
      },
      {
        id: 'manf_002',
        question: 'What is quality control?',
        options: [
          'A) Controlling employee behavior',
          'B) Ensuring products meet specified standards',
          'C) Reducing production speed',
          'D) Increasing prices',
        ],
        correctAnswer: 'B',
        explanation: 'Quality control maintains consistency and customer satisfaction',
        difficulty: 'easy',
        topics: ['quality', 'standards'],
      },
      {
        id: 'manf_003',
        question: 'What is a production line?',
        options: [
          'A) A queue of customers',
          'B) A sequence of operations to manufacture products',
          'C) A phone hotline',
          'D) A business plan',
        ],
        correctAnswer: 'B',
        explanation: 'Production lines enable efficient mass manufacturing',
        difficulty: 'easy',
        topics: ['operations', 'process'],
      },
    ],
  },

  // HOSPITALITY - Foundation
  {
    skill: 'hospitality',
    level: 'foundation',
    questions: [
      {
        id: 'hospf_001',
        question: 'What is guest satisfaction in hospitality?',
        options: [
          'A) Charging premium prices',
          'B) Meeting or exceeding guest expectations',
          'C) Having the fanciest décor',
          'D) Serving alcohol',
        ],
        correctAnswer: 'B',
        explanation: 'Guest satisfaction drives repeat business and positive reviews',
        difficulty: 'easy',
        topics: ['service', 'quality'],
      },
      {
        id: 'hospf_002',
        question: 'What does "front of house" mean?',
        options: [
          'A) The building entrance',
          'B) Guest-facing areas and staff',
          'C) The management office',
          'D) Parking lot',
        ],
        correctAnswer: 'B',
        explanation: 'Front of house handles direct guest interactions',
        difficulty: 'easy',
        topics: ['operations', 'service'],
      },
      {
        id: 'hospf_003',
        question: 'What is occupancy rate in hotels?',
        options: [
          'A) Number of employees',
          'B) Percentage of available rooms that are occupied',
          'C) Guest satisfaction score',
          'D) Room cleaning time',
        ],
        correctAnswer: 'B',
        explanation: 'Occupancy rate is a key performance metric for hotels',
        difficulty: 'easy',
        topics: ['metrics', 'performance'],
      },
    ],
  },

  // BEAUTY & WELLNESS - Foundation
  {
    skill: 'beauty-wellness',
    level: 'foundation',
    questions: [
      {
        id: 'bwf_001',
        question: 'What is a consultation in beauty services?',
        options: [
          'A) A medical exam',
          'B) A discussion to understand client needs and preferences',
          'C) A sales pitch',
          'D) A training session',
        ],
        correctAnswer: 'B',
        explanation: 'Consultations ensure services match client expectations',
        difficulty: 'easy',
        topics: ['client-service', 'communication'],
      },
      {
        id: 'bwf_002',
        question: 'What is patch testing?',
        options: [
          'A) Testing fabric samples',
          'B) Testing products on skin to check for allergic reactions',
          'C) Repairing clothes',
          'D) Software testing',
        ],
        correctAnswer: 'B',
        explanation: 'Patch tests prevent adverse reactions to beauty products',
        difficulty: 'easy',
        topics: ['safety', 'procedures'],
      },
      {
        id: 'bwf_003',
        question: 'What is sanitation in beauty services?',
        options: [
          'A) Room decoration',
          'B) Cleaning and disinfecting tools to prevent infection',
          'C) Air conditioning',
          'D) Background music',
        ],
        correctAnswer: 'B',
        explanation: 'Proper sanitation protects client health and safety',
        difficulty: 'easy',
        topics: ['hygiene', 'safety'],
      },
    ],
  },

  // FITNESS - Foundation
  {
    skill: 'fitness',
    level: 'foundation',
    questions: [
      {
        id: 'fitf_001',
        question: 'What is a fitness assessment?',
        options: [
          'A) A gym membership fee',
          'B) An evaluation of current fitness level and goals',
          'C) A workout routine',
          'D) A nutrition plan',
        ],
        correctAnswer: 'B',
        explanation: 'Assessments help create personalized fitness programs',
        difficulty: 'easy',
        topics: ['assessment', 'planning'],
      },
      {
        id: 'fitf_002',
        question: 'What is proper form in exercise?',
        options: [
          'A) Wearing fashionable clothes',
          'B) Correct technique to maximize results and prevent injury',
          'C) Filling out paperwork',
          'D) Having good posture while sitting',
        ],
        correctAnswer: 'B',
        explanation: 'Proper form is essential for safety and effectiveness',
        difficulty: 'easy',
        topics: ['technique', 'safety'],
      },
      {
        id: 'fitf_003',
        question: 'What is progressive overload?',
        options: [
          'A) Overworking yourself',
          'B) Gradually increasing exercise intensity over time',
          'C) Taking on too many clients',
          'D) Using heavy weights immediately',
        ],
        correctAnswer: 'B',
        explanation: 'Progressive overload drives continuous fitness improvement',
        difficulty: 'easy',
        topics: ['training', 'progression'],
      },
    ],
  },

  // PHOTOGRAPHY - Foundation
  {
    skill: 'photography',
    level: 'foundation',
    questions: [
      {
        id: 'photf_001',
        question: 'What is the exposure triangle in photography?',
        options: [
          'A) Three different cameras',
          'B) Aperture, shutter speed, and ISO',
          'C) Three lighting setups',
          'D) Triangular photo frames',
        ],
        correctAnswer: 'B',
        explanation: 'The exposure triangle controls how light reaches the sensor',
        difficulty: 'easy',
        topics: ['exposure', 'fundamentals'],
      },
      {
        id: 'photf_002',
        question: 'What is the rule of thirds?',
        options: [
          'A) Taking three photos',
          'B) A composition guideline dividing the frame into nine parts',
          'C) Using one-third of your lens',
          'D) Charging one-third upfront',
        ],
        correctAnswer: 'B',
        explanation: 'Rule of thirds creates balanced and engaging compositions',
        difficulty: 'easy',
        topics: ['composition', 'technique'],
      },
      {
        id: 'photf_003',
        question: 'What is white balance?',
        options: [
          'A) The weight of the camera',
          'B) Adjusting colors to appear natural under different lighting',
          'C) Using only white backgrounds',
          'D) Camera stability',
        ],
        correctAnswer: 'B',
        explanation: 'White balance ensures accurate color representation',
        difficulty: 'easy',
        topics: ['color', 'settings'],
      },
    ],
  },

  // CUSTOMER SERVICE - Foundation
  {
    skill: 'customer-service',
    level: 'foundation',
    questions: [
      {
        id: 'csf_001',
        question: 'What is active listening in customer service?',
        options: [
          'A) Listening to background music',
          'B) Fully concentrating and understanding customer concerns',
          'C) Talking more than listening',
          'D) Multitasking while on calls',
        ],
        correctAnswer: 'B',
        explanation: 'Active listening shows engagement and helps understand customer needs',
        difficulty: 'easy',
        topics: ['communication', 'skills'],
      },
      {
        id: 'csf_002',
        question: 'What is empathy in customer service?',
        options: [
          'A) Agreeing with every customer complaint',
          'B) Understanding and sharing customer feelings',
          'C) Offering discounts to everyone',
          'D) Ignoring difficult customers',
        ],
        correctAnswer: 'B',
        explanation: 'Empathy helps build rapport and shows customers you care',
        difficulty: 'easy',
        topics: ['soft-skills', 'communication'],
      },
      {
        id: 'csf_003',
        question: 'What should you do if you cannot solve a customer issue immediately?',
        options: [
          'A) Hang up the phone',
          'B) Tell them to call back later',
          'C) Acknowledge it and provide a timeline for resolution',
          'D) Transfer them endlessly',
        ],
        correctAnswer: 'C',
        explanation: 'Setting expectations maintains trust even when issues take time',
        difficulty: 'easy',
        topics: ['problem-solving', 'communication'],
      },
    ],
  },

  // SALES & MARKETING - Foundation
  {
    skill: 'sales-marketing',
    level: 'foundation',
    questions: [
      {
        id: 'smf_001',
        question: 'What is a sales funnel?',
        options: [
          'A) A tool for sorting leads',
          'B) The journey a customer takes from awareness to purchase',
          'C) A discount strategy',
          'D) A type of advertising campaign',
        ],
        correctAnswer: 'B',
        explanation: 'Sales funnel maps the customer journey through stages',
        difficulty: 'easy',
        topics: ['sales', 'strategy'],
      },
      {
        id: 'smf_002',
        question: 'What is a target audience?',
        options: [
          'A) Everyone who uses the internet',
          'B) A specific group most likely to buy your product',
          'C) Your competitors',
          'D) Your employees',
        ],
        correctAnswer: 'B',
        explanation: 'Target audience is the specific demographic you aim to reach',
        difficulty: 'easy',
        topics: ['marketing', 'strategy'],
      },
      {
        id: 'smf_003',
        question: 'What does B2B mean?',
        options: [
          'A) Business to Business',
          'B) Back to Basics',
          'C) Better to Best',
          'D) Brand to Buyer',
        ],
        correctAnswer: 'A',
        explanation: 'B2B refers to transactions between businesses',
        difficulty: 'easy',
        topics: ['business-models', 'basics'],
      },
    ],
  },

  // DIGITAL MARKETING - Intermediate
  {
    skill: 'digital-marketing',
    level: 'intermediate',
    questions: [
      {
        id: 'dmi_001',
        question: 'What is the difference between organic and paid social media reach?',
        options: [
          'A) Organic is free content, paid involves advertising spend',
          'B) Organic is faster, paid is slower',
          'C) They are the same thing',
          'D) Organic only works on Facebook',
        ],
        correctAnswer: 'A',
        explanation: 'Organic reach comes from unpaid content distribution, while paid reach requires ad spend',
        difficulty: 'medium',
        topics: ['social-media', 'strategy'],
      },
      {
        id: 'dmi_002',
        question: 'Which metric best indicates email campaign engagement?',
        options: [
          'A) Total subscribers',
          'B) Open rate and click-through rate',
          'C) Email design quality',
          'D) Number of images used',
        ],
        correctAnswer: 'B',
        explanation: 'Open rates and CTR measure how recipients interact with your emails',
        difficulty: 'medium',
        topics: ['email-marketing', 'metrics'],
      },
      {
        id: 'dmi_003',
        question: 'What is A/B testing in digital marketing?',
        options: [
          'A) Testing two completely different products',
          'B) Comparing two versions to see which performs better',
          'C) Testing on two different days',
          'D) Asking customers to choose between options',
        ],
        correctAnswer: 'B',
        explanation: 'A/B testing compares variations to optimize campaign performance',
        difficulty: 'medium',
        topics: ['optimization', 'testing'],
      },
    ],
  },

  // WEB DEVELOPMENT - Intermediate
  {
    skill: 'web-development',
    level: 'intermediate',
    questions: [
      {
        id: 'wdi_001',
        question: 'What is the purpose of responsive web design?',
        options: [
          'A) To make websites load faster',
          'B) To adapt layout to different screen sizes',
          'C) To add animations',
          'D) To improve security',
        ],
        correctAnswer: 'B',
        explanation: 'Responsive design ensures optimal viewing across devices',
        difficulty: 'medium',
        topics: ['responsive-design', 'best-practices'],
      },
      {
        id: 'wdi_002',
        question: 'What is the DOM in web development?',
        options: [
          'A) Document Object Model - structure of HTML elements',
          'B) Data Output Manager',
          'C) Digital Online Marketing',
          'D) Database Organization Method',
        ],
        correctAnswer: 'A',
        explanation: 'The DOM represents the page structure and allows JavaScript to manipulate it',
        difficulty: 'medium',
        topics: ['javascript', 'fundamentals'],
      },
      {
        id: 'wdi_003',
        question: 'Which HTTP status code indicates a successful request?',
        options: [
          'A) 404',
          'B) 500',
          'C) 200',
          'D) 301',
        ],
        correctAnswer: 'C',
        explanation: '200 OK indicates the request succeeded',
        difficulty: 'medium',
        topics: ['http', 'apis'],
      },
    ],
  },

  // GRAPHIC DESIGN - Intermediate
  {
    skill: 'graphic-design',
    level: 'intermediate',
    questions: [
      {
        id: 'gdi_001',
        question: 'What is the golden ratio in design?',
        options: [
          'A) A 50/50 split',
          'B) A mathematical ratio of approximately 1.618',
          'C) The most expensive design',
          'D) Using only gold colors',
        ],
        correctAnswer: 'B',
        explanation: 'The golden ratio creates aesthetically pleasing proportions',
        difficulty: 'medium',
        topics: ['composition', 'theory'],
      },
      {
        id: 'gdi_002',
        question: 'What is kerning in typography?',
        options: [
          'A) Font size',
          'B) Space between individual letter pairs',
          'C) Line height',
          'D) Font weight',
        ],
        correctAnswer: 'B',
        explanation: 'Kerning adjusts spacing between specific letter combinations',
        difficulty: 'medium',
        topics: ['typography', 'technique'],
      },
      {
        id: 'gdi_003',
        question: 'What format is best for logos requiring transparency?',
        options: [
          'A) JPEG',
          'B) PNG or SVG',
          'C) GIF only',
          'D) PDF',
        ],
        correctAnswer: 'B',
        explanation: 'PNG and SVG support transparency, essential for versatile logo use',
        difficulty: 'medium',
        topics: ['file-formats', 'best-practices'],
      },
    ],
  },

  // WRITING & TRANSLATION - Intermediate
  {
    skill: 'writing-translation',
    level: 'intermediate',
    questions: [
      {
        id: 'wti_001',
        question: 'What is tone of voice in writing?',
        options: [
          'A) How loud you read',
          'B) The attitude and personality conveyed through words',
          'C) Font styling',
          'D) Grammar rules',
        ],
        correctAnswer: 'B',
        explanation: 'Tone of voice reflects brand personality and connects with audiences',
        difficulty: 'medium',
        topics: ['style', 'branding'],
      },
      {
        id: 'wti_002',
        question: 'What is transcreation in translation?',
        options: [
          'A) Literal word-for-word translation',
          'B) Adapting content to preserve intent and cultural relevance',
          'C) Using translation software only',
          'D) Shortening the text',
        ],
        correctAnswer: 'B',
        explanation: 'Transcreation maintains message impact across languages and cultures',
        difficulty: 'medium',
        topics: ['translation', 'localization'],
      },
      {
        id: 'wti_003',
        question: 'What is the inverted pyramid style in journalism?',
        options: [
          'A) Writing from least to most important',
          'B) Presenting most important information first',
          'C) Using pyramid-shaped paragraphs',
          'D) Starting with questions',
        ],
        correctAnswer: 'B',
        explanation: 'The inverted pyramid ensures readers get key information immediately',
        difficulty: 'medium',
        topics: ['journalism', 'structure'],
      },
    ],
  },

  // VIDEO & ANIMATION - Intermediate
  {
    skill: 'video-animation',
    level: 'intermediate',
    questions: [
      {
        id: 'vai_001',
        question: 'What is the 180-degree rule in filmmaking?',
        options: [
          'A) Rotating the camera 180 degrees',
          'B) Keeping camera on one side of action to maintain spatial consistency',
          'C) Filming for exactly 180 minutes',
          'D) Using a 180mm lens',
        ],
        correctAnswer: 'B',
        explanation: 'The 180-degree rule prevents viewer disorientation',
        difficulty: 'medium',
        topics: ['cinematography', 'technique'],
      },
      {
        id: 'vai_002',
        question: 'What is keyframe animation?',
        options: [
          'A) Animating only important frames',
          'B) Setting start and end points with software interpolating between',
          'C) Using keyboard shortcuts',
          'D) Drawing every single frame',
        ],
        correctAnswer: 'B',
        explanation: 'Keyframes define motion endpoints while software generates in-between frames',
        difficulty: 'medium',
        topics: ['animation', 'technique'],
      },
      {
        id: 'vai_003',
        question: 'What is color grading?',
        options: [
          'A) Organizing footage by color',
          'B) Adjusting colors to achieve desired mood and look',
          'C) Removing all colors',
          'D) Adding subtitles',
        ],
        correctAnswer: 'B',
        explanation: 'Color grading enhances visual storytelling and creates atmosphere',
        difficulty: 'medium',
        topics: ['post-production', 'color'],
      },
    ],
  },

  // MUSIC & AUDIO - Intermediate
  {
    skill: 'music-audio',
    level: 'intermediate',
    questions: [
      {
        id: 'mai_001',
        question: 'What is the difference between mixing and mastering?',
        options: [
          'A) They are the same process',
          'B) Mixing balances individual tracks, mastering polishes the final mix',
          'C) Mastering comes before mixing',
          'D) Mixing is only for music, mastering is only for podcasts',
        ],
        correctAnswer: 'B',
        explanation: 'Mixing works on individual elements, mastering optimizes the complete mix',
        difficulty: 'medium',
        topics: ['production', 'post-production'],
      },
      {
        id: 'mai_002',
        question: 'What is a DAW in music production?',
        options: [
          'A) Digital Audio Workstation - software for recording and editing',
          'B) Direct Audio Wire',
          'C) Dynamic Audio Wave',
          'D) Drum And Wind instruments',
        ],
        correctAnswer: 'A',
        explanation: 'DAWs are the central tool for modern music production',
        difficulty: 'medium',
        topics: ['tools', 'software'],
      },
      {
        id: 'mai_003',
        question: 'What is MIDI?',
        options: [
          'A) A type of microphone',
          'B) Musical Instrument Digital Interface - protocol for instrument communication',
          'C) Music Internet Distribution Index',
          'D) A file compression format',
        ],
        correctAnswer: 'B',
        explanation: 'MIDI transmits musical performance data between devices',
        difficulty: 'medium',
        topics: ['technology', 'fundamentals'],
      },
    ],
  },

  // BUSINESS - Intermediate
  {
    skill: 'business',
    level: 'intermediate',
    questions: [
      {
        id: 'busi_001',
        question: 'What is a unique selling proposition (USP)?',
        options: [
          'A) The lowest price',
          'B) What makes your product/service distinct from competitors',
          'C) Your sales team',
          'D) Your company location',
        ],
        correctAnswer: 'B',
        explanation: 'A USP differentiates your offering in the marketplace',
        difficulty: 'medium',
        topics: ['marketing', 'strategy'],
      },
      {
        id: 'busi_002',
        question: 'What is cash flow in business?',
        options: [
          'A) Total revenue',
          'B) The movement of money in and out of a business',
          'C) Profit margin',
          'D) Employee salaries',
        ],
        correctAnswer: 'B',
        explanation: 'Cash flow tracking is essential for business sustainability',
        difficulty: 'medium',
        topics: ['finance', 'management'],
      },
      {
        id: 'busi_003',
        question: 'What is a KPI?',
        options: [
          'A) Key Performance Indicator - measurable value showing progress',
          'B) Keyboard Productivity Index',
          'C) Knowledge Process Integration',
          'D) Key Product Information',
        ],
        correctAnswer: 'A',
        explanation: 'KPIs track progress toward business objectives',
        difficulty: 'medium',
        topics: ['metrics', 'management'],
      },
    ],
  },

  // DATA ENTRY - Intermediate
  {
    skill: 'data-entry',
    level: 'intermediate',
    questions: [
      {
        id: 'dei_001',
        question: 'What is data normalization?',
        options: [
          'A) Making data look normal',
          'B) Organizing data to reduce redundancy and improve integrity',
          'C) Backing up data',
          'D) Deleting old data',
        ],
        correctAnswer: 'B',
        explanation: 'Normalization creates efficient, consistent database structures',
        difficulty: 'medium',
        topics: ['database', 'organization'],
      },
      {
        id: 'dei_002',
        question: 'What is a pivot table used for?',
        options: [
          'A) Rotating your desk',
          'B) Summarizing and analyzing large datasets',
          'C) Creating charts only',
          'D) Printing data',
        ],
        correctAnswer: 'B',
        explanation: 'Pivot tables quickly analyze and summarize complex data',
        difficulty: 'medium',
        topics: ['excel', 'analysis'],
      },
      {
        id: 'dei_003',
        question: 'What is a VLOOKUP function?',
        options: [
          'A) Viewing data vertically',
          'B) Searching for a value in a column and returning related data',
          'C) Validating data',
          'D) Creating visual charts',
        ],
        correctAnswer: 'B',
        explanation: 'VLOOKUP retrieves data from tables based on lookup values',
        difficulty: 'medium',
        topics: ['excel', 'functions'],
      },
    ],
  },

  // CUSTOMER SERVICE - Intermediate
  {
    skill: 'customer-service',
    level: 'intermediate',
    questions: [
      {
        id: 'csi_001',
        question: 'How should you handle an angry customer?',
        options: [
          'A) Argue back to prove you\'re right',
          'B) Stay calm, listen actively, and find a solution',
          'C) Ignore them until they calm down',
          'D) Transfer them immediately',
        ],
        correctAnswer: 'B',
        explanation: 'De-escalation requires empathy, patience, and problem-solving',
        difficulty: 'medium',
        topics: ['conflict-resolution', 'soft-skills'],
      },
      {
        id: 'csi_002',
        question: 'What is a Service Level Agreement (SLA)?',
        options: [
          'A) A customer complaint',
          'B) A commitment to specific service standards and response times',
          'C) An employee contract',
          'D) A product warranty',
        ],
        correctAnswer: 'B',
        explanation: 'SLAs define expected service quality and timelines',
        difficulty: 'medium',
        topics: ['standards', 'management'],
      },
      {
        id: 'csi_003',
        question: 'What is omnichannel customer service?',
        options: [
          'A) Using only one communication channel',
          'B) Providing seamless service across multiple channels',
          'C) Outsourcing customer service',
          'D) Automated responses only',
        ],
        correctAnswer: 'B',
        explanation: 'Omnichannel ensures consistent experience across all touchpoints',
        difficulty: 'medium',
        topics: ['strategy', 'channels'],
      },
    ],
  },

  // SALES & MARKETING - Intermediate
  {
    skill: 'sales-marketing',
    level: 'intermediate',
    questions: [
      {
        id: 'smi_001',
        question: 'What is lead qualification?',
        options: [
          'A) Making all leads buy immediately',
          'B) Assessing if prospects are a good fit and ready to buy',
          'C) Collecting contact information',
          'D) Sending promotional emails',
        ],
        correctAnswer: 'B',
        explanation: 'Lead qualification focuses efforts on high-potential prospects',
        difficulty: 'medium',
        topics: ['sales-process', 'strategy'],
      },
      {
        id: 'smi_002',
        question: 'What is customer lifetime value (CLV)?',
        options: [
          'A) The first purchase amount',
          'B) Total revenue expected from a customer over their relationship',
          'C) Customer age',
          'D) Time since first purchase',
        ],
        correctAnswer: 'B',
        explanation: 'CLV helps determine how much to invest in customer acquisition',
        difficulty: 'medium',
        topics: ['metrics', 'strategy'],
      },
      {
        id: 'smi_003',
        question: 'What is a conversion rate?',
        options: [
          'A) How fast you sell',
          'B) Percentage of prospects who take a desired action',
          'C) Currency exchange rate',
          'D) Employee turnover rate',
        ],
        correctAnswer: 'B',
        explanation: 'Conversion rate measures campaign effectiveness',
        difficulty: 'medium',
        topics: ['metrics', 'optimization'],
      },
    ],
  },

  // ENGINEERING - Intermediate
  {
    skill: 'engineering',
    level: 'intermediate',
    questions: [
      {
        id: 'engi_001',
        question: 'What is iterative design in engineering?',
        options: [
          'A) Designing once and never changing',
          'B) Repeatedly refining designs based on testing and feedback',
          'C) Copying existing designs',
          'D) Using only computer simulations',
        ],
        correctAnswer: 'B',
        explanation: 'Iterative design improves solutions through cycles of testing and refinement',
        difficulty: 'medium',
        topics: ['process', 'methodology'],
      },
      {
        id: 'engi_002',
        question: 'What is a factor of safety in engineering?',
        options: [
          'A) Safety training programs',
          'B) Ratio of maximum strength to expected load',
          'C) Number of safety inspectors',
          'D) Insurance coverage',
        ],
        correctAnswer: 'B',
        explanation: 'Factor of safety provides a margin above anticipated stresses',
        difficulty: 'medium',
        topics: ['safety', 'design'],
      },
      {
        id: 'engi_003',
        question: 'What is FEA (Finite Element Analysis)?',
        options: [
          'A) Final Engineering Assessment',
          'B) Computer simulation method to predict how structures respond to forces',
          'C) Federal Engineering Agency',
          'D) Flexible Element Application',
        ],
        correctAnswer: 'B',
        explanation: 'FEA helps optimize designs by simulating real-world conditions',
        difficulty: 'medium',
        topics: ['analysis', 'tools'],
      },
    ],
  },

  // ARCHITECTURE - Intermediate
  {
    skill: 'architecture',
    level: 'intermediate',
    questions: [
      {
        id: 'archi_001',
        question: 'What is BIM in architecture?',
        options: [
          'A) Basic Interior Modeling',
          'B) Building Information Modeling - digital representation of physical and functional characteristics',
          'C) Budget Impact Management',
          'D) Building Inspection Method',
        ],
        correctAnswer: 'B',
        explanation: 'BIM enables collaborative design and construction management',
        difficulty: 'medium',
        topics: ['technology', 'tools'],
      },
      {
        id: 'archi_002',
        question: 'What is adaptive reuse in architecture?',
        options: [
          'A) Demolishing old buildings',
          'B) Repurposing existing buildings for new functions',
          'C) Building identical structures',
          'D) Using recycled materials only',
        ],
        correctAnswer: 'B',
        explanation: 'Adaptive reuse preserves heritage while meeting modern needs',
        difficulty: 'medium',
        topics: ['sustainability', 'design'],
      },
      {
        id: 'archi_003',
        question: 'What is the purpose of building codes?',
        options: [
          'A) To increase construction costs',
          'B) To ensure safety, health, and welfare standards',
          'C) To limit design creativity',
          'D) To reduce building sizes',
        ],
        correctAnswer: 'B',
        explanation: 'Building codes protect occupants and the public',
        difficulty: 'medium',
        topics: ['regulations', 'safety'],
      },
    ],
  },

  // LEGAL - Intermediate
  {
    skill: 'legal',
    level: 'intermediate',
    questions: [
      {
        id: 'legi_001',
        question: 'What is legal precedent?',
        options: [
          'A) The first law ever written',
          'B) Prior court decisions that guide future similar cases',
          'C) Priority in court scheduling',
          'D) Legal procedures',
        ],
        correctAnswer: 'B',
        explanation: 'Precedent ensures consistency in legal interpretation',
        difficulty: 'medium',
        topics: ['case-law', 'principles'],
      },
      {
        id: 'legi_002',
        question: 'What is a statute of limitations?',
        options: [
          'A) Maximum prison sentence',
          'B) Time limit for bringing legal action',
          'C) Court operating hours',
          'D) Number of lawyers allowed',
        ],
        correctAnswer: 'B',
        explanation: 'Statutes of limitations ensure timely legal proceedings',
        difficulty: 'medium',
        topics: ['procedures', 'time-limits'],
      },
      {
        id: 'legi_003',
        question: 'What does "breach of contract" mean?',
        options: [
          'A) Writing a contract',
          'B) Failure to fulfill contractual obligations',
          'C) Negotiating contract terms',
          'D) Signing a contract',
        ],
        correctAnswer: 'B',
        explanation: 'Breach occurs when parties fail to meet agreed terms',
        difficulty: 'medium',
        topics: ['contracts', 'disputes'],
      },
    ],
  },

  // ACCOUNTING - Intermediate
  {
    skill: 'accounting',
    level: 'intermediate',
    questions: [
      {
        id: 'acci_001',
        question: 'What is accrual accounting?',
        options: [
          'A) Recording only cash transactions',
          'B) Recording revenue when earned and expenses when incurred',
          'C) Estimating future income',
          'D) Monthly reporting only',
        ],
        correctAnswer: 'B',
        explanation: 'Accrual accounting matches revenue with related expenses',
        difficulty: 'medium',
        topics: ['methods', 'principles'],
      },
      {
        id: 'acci_002',
        question: 'What is a balance sheet?',
        options: [
          'A) A list of customer balances',
          'B) Financial statement showing assets, liabilities, and equity at a point in time',
          'C) Monthly sales report',
          'D) Employee payroll sheet',
        ],
        correctAnswer: 'B',
        explanation: 'Balance sheets provide a snapshot of financial position',
        difficulty: 'medium',
        topics: ['financial-statements', 'reporting'],
      },
      {
        id: 'acci_003',
        question: 'What is accounts receivable?',
        options: [
          'A) Money the company owes',
          'B) Money owed to the company by customers',
          'C) Bank account balance',
          'D) Employee salaries',
        ],
        correctAnswer: 'B',
        explanation: 'Accounts receivable represents expected customer payments',
        difficulty: 'medium',
        topics: ['assets', 'management'],
      },
    ],
  },

  // HUMAN RESOURCES - Intermediate
  {
    skill: 'hr',
    level: 'intermediate',
    questions: [
      {
        id: 'hri_001',
        question: 'What is employer branding?',
        options: [
          'A) Company logo design',
          'B) Reputation as an employer that attracts talent',
          'C) Product marketing',
          'D) Office decoration',
        ],
        correctAnswer: 'B',
        explanation: 'Employer branding helps attract and retain top talent',
        difficulty: 'medium',
        topics: ['recruitment', 'strategy'],
      },
      {
        id: 'hri_002',
        question: 'What is a performance improvement plan (PIP)?',
        options: [
          'A) Immediate termination',
          'B) Structured plan to help underperforming employees improve',
          'C) Promotion criteria',
          'D) Salary increase plan',
        ],
        correctAnswer: 'B',
        explanation: 'PIPs provide clear expectations and support for improvement',
        difficulty: 'medium',
        topics: ['performance', 'management'],
      },
      {
        id: 'hri_003',
        question: 'What is succession planning?',
        options: [
          'A) Planning company events',
          'B) Identifying and developing future leaders',
          'C) Business expansion strategy',
          'D) Product development roadmap',
        ],
        correctAnswer: 'B',
        explanation: 'Succession planning ensures leadership continuity',
        difficulty: 'medium',
        topics: ['talent-development', 'strategy'],
      },
    ],
  },

  // CONSULTING - Intermediate
  {
    skill: 'consulting',
    level: 'intermediate',
    questions: [
      {
        id: 'consi_001',
        question: 'What is a gap analysis in consulting?',
        options: [
          'A) Finding empty office space',
          'B) Comparing current state with desired future state',
          'C) Scheduling meetings',
          'D) Budget review',
        ],
        correctAnswer: 'B',
        explanation: 'Gap analysis identifies areas needing improvement',
        difficulty: 'medium',
        topics: ['analysis', 'methodology'],
      },
      {
        id: 'consi_002',
        question: 'What is change management?',
        options: [
          'A) Counting money',
          'B) Structured approach to transitioning organizations to new states',
          'C) Replacing managers',
          'D) Office relocation',
        ],
        correctAnswer: 'B',
        explanation: 'Change management helps organizations adopt new processes successfully',
        difficulty: 'medium',
        topics: ['transformation', 'process'],
      },
      {
        id: 'consi_003',
        question: 'What is a statement of work (SOW)?',
        options: [
          'A) Employee job description',
          'B) Document defining project scope, deliverables, and timeline',
          'C) Company mission statement',
          'D) Financial report',
        ],
        correctAnswer: 'B',
        explanation: 'SOWs establish clear project expectations and boundaries',
        difficulty: 'medium',
        topics: ['project-management', 'documentation'],
      },
    ],
  },

  // EDUCATION - Intermediate
  {
    skill: 'education',
    level: 'intermediate',
    questions: [
      {
        id: 'edui_001',
        question: 'What is scaffolding in education?',
        options: [
          'A) Building classroom furniture',
          'B) Providing temporary support as students learn new concepts',
          'C) Physical exercise in PE class',
          'D) Classroom management technique',
        ],
        correctAnswer: 'B',
        explanation: 'Scaffolding gradually releases responsibility to students',
        difficulty: 'medium',
        topics: ['pedagogy', 'methods'],
      },
      {
        id: 'edui_002',
        question: 'What is Bloom\'s Taxonomy?',
        options: [
          'A) Plant classification system',
          'B) Framework for categorizing educational learning objectives',
          'C) Grading system',
          'D) Classroom layout design',
        ],
        correctAnswer: 'B',
        explanation: 'Bloom\'s Taxonomy structures learning from basic to complex',
        difficulty: 'medium',
        topics: ['theory', 'assessment'],
      },
      {
        id: 'edui_003',
        question: 'What is flipped classroom?',
        options: [
          'A) Rearranging desks',
          'B) Students learn content at home and apply it in class',
          'C) Teaching students upside down',
          'D) Reversing the school schedule',
        ],
        correctAnswer: 'B',
        explanation: 'Flipped classroom maximizes active learning during class time',
        difficulty: 'medium',
        topics: ['methods', 'innovation'],
      },
    ],
  },

  // HEALTHCARE - Intermediate
  {
    skill: 'healthcare',
    level: 'intermediate',
    questions: [
      {
        id: 'hci_001',
        question: 'What is evidence-based medicine?',
        options: [
          'A) Using only old medical practices',
          'B) Integrating best research with clinical expertise and patient values',
          'C) Following hunches',
          'D) Using only the newest treatments',
        ],
        correctAnswer: 'B',
        explanation: 'Evidence-based practice improves patient outcomes',
        difficulty: 'medium',
        topics: ['practice', 'standards'],
      },
      {
        id: 'hci_002',
        question: 'What is the difference between EMR and EHR?',
        options: [
          'A) They are identical',
          'B) EMR is for one practice, EHR is shareable across providers',
          'C) EMR is paper-based',
          'D) EHR is only for hospitals',
        ],
        correctAnswer: 'B',
        explanation: 'EHRs enable comprehensive, coordinated care across settings',
        difficulty: 'medium',
        topics: ['technology', 'records'],
      },
      {
        id: 'hci_003',
        question: 'What is informed consent?',
        options: [
          'A) Automatic permission',
          'B) Patient agreement after understanding risks and benefits',
          'C) Insurance approval',
          'D) Doctor\'s recommendation',
        ],
        correctAnswer: 'B',
        explanation: 'Informed consent respects patient autonomy and rights',
        difficulty: 'medium',
        topics: ['ethics', 'legal'],
      },
    ],
  },

  // REAL ESTATE - Intermediate
  {
    skill: 'real-estate',
    level: 'intermediate',
    questions: [
      {
        id: 'rei_001',
        question: 'What is a comparative market analysis (CMA)?',
        options: [
          'A) Stock market comparison',
          'B) Evaluation of similar properties to determine market value',
          'C) Competitor analysis',
          'D) Marketing budget review',
        ],
        correctAnswer: 'B',
        explanation: 'CMAs help price properties competitively',
        difficulty: 'medium',
        topics: ['valuation', 'analysis'],
      },
      {
        id: 'rei_002',
        question: 'What is earnest money?',
        options: [
          'A) Agent commission',
          'B) Deposit showing buyer\'s serious intent',
          'C) Final payment',
          'D) Property tax',
        ],
        correctAnswer: 'B',
        explanation: 'Earnest money secures the purchase agreement',
        difficulty: 'medium',
        topics: ['transactions', 'process'],
      },
      {
        id: 'rei_003',
        question: 'What does "due diligence period" mean in real estate?',
        options: [
          'A) Time for working overtime',
          'B) Period when buyer can inspect and investigate the property',
          'C) Loan approval time',
          'D) Moving preparation time',
        ],
        correctAnswer: 'B',
        explanation: 'Due diligence allows buyers to verify property condition',
        difficulty: 'medium',
        topics: ['process', 'legal'],
      },
    ],
  },

  // LOGISTICS - Intermediate
  {
    skill: 'logistics',
    level: 'intermediate',
    questions: [
      {
        id: 'logi_001',
        question: 'What is just-in-time (JIT) inventory?',
        options: [
          'A) Having maximum stock at all times',
          'B) Receiving inventory only as needed to reduce holding costs',
          'C) Random ordering',
          'D) Emergency shipments only',
        ],
        correctAnswer: 'B',
        explanation: 'JIT minimizes inventory costs while meeting demand',
        difficulty: 'medium',
        topics: ['inventory', 'strategy'],
      },
      {
        id: 'logi_002',
        question: 'What is cross-docking?',
        options: [
          'A) Loading ships',
          'B) Transferring products directly from inbound to outbound trucks',
          'C) Warehouse storage',
          'D) Quality inspection',
        ],
        correctAnswer: 'B',
        explanation: 'Cross-docking reduces handling and storage time',
        difficulty: 'medium',
        topics: ['operations', 'efficiency'],
      },
      {
        id: 'logi_003',
        question: 'What is a Bill of Lading?',
        options: [
          'A) Shipping invoice',
          'B) Legal document detailing shipment type, quantity, and destination',
          'C) Customer receipt',
          'D) Warehouse inventory list',
        ],
        correctAnswer: 'B',
        explanation: 'Bill of Lading serves as shipment receipt and contract',
        difficulty: 'medium',
        topics: ['documentation', 'shipping'],
      },
    ],
  },

  // MANUFACTURING - Intermediate
  {
    skill: 'manufacturing',
    level: 'intermediate',
    questions: [
      {
        id: 'mani_001',
        question: 'What is Six Sigma?',
        options: [
          'A) A type of machinery',
          'B) Methodology to reduce defects and improve quality',
          'C) Safety equipment',
          'D) Production speed target',
        ],
        correctAnswer: 'B',
        explanation: 'Six Sigma uses data to minimize variation and defects',
        difficulty: 'medium',
        topics: ['quality', 'methodology'],
      },
      {
        id: 'mani_002',
        question: 'What is preventive maintenance?',
        options: [
          'A) Fixing broken equipment',
          'B) Regular maintenance to prevent equipment failure',
          'C) Buying new machines',
          'D) Insurance coverage',
        ],
        correctAnswer: 'B',
        explanation: 'Preventive maintenance reduces downtime and extends equipment life',
        difficulty: 'medium',
        topics: ['maintenance', 'operations'],
      },
      {
        id: 'mani_003',
        question: 'What is Overall Equipment Effectiveness (OEE)?',
        options: [
          'A) Employee performance metric',
          'B) Measure of manufacturing productivity considering availability, performance, and quality',
          'C) Energy consumption',
          'D) Safety record',
        ],
        correctAnswer: 'B',
        explanation: 'OEE identifies improvement opportunities in production',
        difficulty: 'medium',
        topics: ['metrics', 'efficiency'],
      },
    ],
  },

  // HOSPITALITY - Intermediate
  {
    skill: 'hospitality',
    level: 'intermediate',
    questions: [
      {
        id: 'hospi_001',
        question: 'What is revenue per available room (RevPAR)?',
        options: [
          'A) Room cleaning cost',
          'B) Key performance metric calculated by multiplying average daily rate by occupancy',
          'C) Number of rooms available',
          'D) Renovation budget',
        ],
        correctAnswer: 'B',
        explanation: 'RevPAR measures hotel revenue performance',
        difficulty: 'medium',
        topics: ['metrics', 'finance'],
      },
      {
        id: 'hospi_002',
        question: 'What is yield management?',
        options: [
          'A) Crop farming techniques',
          'B) Pricing strategy to maximize revenue based on demand',
          'C) Food portion control',
          'D) Staff scheduling',
        ],
        correctAnswer: 'B',
        explanation: 'Yield management optimizes pricing in real-time',
        difficulty: 'medium',
        topics: ['revenue', 'strategy'],
      },
      {
        id: 'hospi_003',
        question: 'What is a property management system (PMS)?',
        options: [
          'A) Building maintenance team',
          'B) Software managing hotel operations like reservations and billing',
          'C) Security system',
          'D) Cleaning schedule',
        ],
        correctAnswer: 'B',
        explanation: 'PMS centralizes hotel operational management',
        difficulty: 'medium',
        topics: ['technology', 'operations'],
      },
    ],
  },

  // BEAUTY & WELLNESS - Intermediate
  {
    skill: 'beauty-wellness',
    level: 'intermediate',
    questions: [
      {
        id: 'bwi_001',
        question: 'What is color theory in hair coloring?',
        options: [
          'A) Using any colors randomly',
          'B) Understanding how colors interact and neutralize unwanted tones',
          'C) Matching colors to clothes',
          'D) Using only natural colors',
        ],
        correctAnswer: 'B',
        explanation: 'Color theory ensures predictable, desirable hair color results',
        difficulty: 'medium',
        topics: ['technique', 'theory'],
      },
      {
        id: 'bwi_002',
        question: 'What is the difference between facial and massage licensing?',
        options: [
          'A) No difference',
          'B) Different training requirements and scope of practice',
          'C) Only location differs',
          'D) Only price differs',
        ],
        correctAnswer: 'B',
        explanation: 'Each requires specific training and has distinct legal boundaries',
        difficulty: 'medium',
        topics: ['professional', 'regulations'],
      },
      {
        id: 'bwi_003',
        question: 'What is client retention in beauty services?',
        options: [
          'A) Holding clients physically',
          'B) Keeping clients returning through quality service and relationships',
          'C) Required contract length',
          'D) Membership fees',
        ],
        correctAnswer: 'B',
        explanation: 'Client retention drives sustainable business growth',
        difficulty: 'medium',
        topics: ['business', 'service'],
      },
    ],
  },

  // FITNESS - Intermediate
  {
    skill: 'fitness',
    level: 'intermediate',
    questions: [
      {
        id: 'fiti_001',
        question: 'What is periodization in fitness training?',
        options: [
          'A) Training at specific times of day',
          'B) Systematic planning of training phases to optimize performance',
          'C) Monthly membership billing',
          'D) Equipment rotation',
        ],
        correctAnswer: 'B',
        explanation: 'Periodization prevents plateaus and reduces injury risk',
        difficulty: 'medium',
        topics: ['programming', 'methodology'],
      },
      {
        id: 'fiti_002',
        question: 'What is the difference between aerobic and anaerobic exercise?',
        options: [
          'A) Indoor vs outdoor',
          'B) Aerobic uses oxygen for energy, anaerobic doesn\'t',
          'C) Morning vs evening',
          'D) Equipment vs bodyweight',
        ],
        correctAnswer: 'B',
        explanation: 'Understanding energy systems guides effective program design',
        difficulty: 'medium',
        topics: ['exercise-science', 'fundamentals'],
      },
      {
        id: 'fiti_003',
        question: 'What is DOMS?',
        options: [
          'A) Dynamic Optimal Movement System',
          'B) Delayed Onset Muscle Soreness - post-exercise muscle pain',
          'C) Daily Overhead Mobility Stretching',
          'D) Diagnostic Orthopedic Measurement Scale',
        ],
        correctAnswer: 'B',
        explanation: 'DOMS is normal after new or intense exercise',
        difficulty: 'medium',
        topics: ['physiology', 'recovery'],
      },
    ],
  },

  // PHOTOGRAPHY - Intermediate
  {
    skill: 'photography',
    level: 'intermediate',
    questions: [
      {
        id: 'photi_001',
        question: 'What is bokeh in photography?',
        options: [
          'A) Camera brand',
          'B) Aesthetic quality of out-of-focus areas',
          'C) Photo editing software',
          'D) Camera lens cap',
        ],
        correctAnswer: 'B',
        explanation: 'Bokeh creates artistic background blur',
        difficulty: 'medium',
        topics: ['technique', 'aesthetics'],
      },
      {
        id: 'photi_002',
        question: 'What is RAW format?',
        options: [
          'A) Unedited photos',
          'B) Unprocessed image data from camera sensor with maximum editing flexibility',
          'C) Black and white photos',
          'D) Low resolution images',
        ],
        correctAnswer: 'B',
        explanation: 'RAW files retain maximum image information for editing',
        difficulty: 'medium',
        topics: ['file-formats', 'workflow'],
      },
      {
        id: 'photi_003',
        question: 'What is the difference between full-frame and crop sensor cameras?',
        options: [
          'A) Price only',
          'B) Sensor size affects field of view and image quality',
          'C) Brand preference',
          'D) Color accuracy',
        ],
        correctAnswer: 'B',
        explanation: 'Sensor size impacts depth of field and low-light performance',
        difficulty: 'medium',
        topics: ['equipment', 'technology'],
      },
    ],
  },

  // DIGITAL MARKETING - Advanced
  {
    skill: 'digital-marketing',
    level: 'advanced',
    questions: [
      {
        id: 'dma_001',
        question: 'How would you optimize a multi-channel marketing campaign with a limited budget?',
        options: [
          'A) Focus all budget on the cheapest channel',
          'B) Analyze channel performance, allocate based on ROI and customer lifetime value',
          'C) Split budget equally across all channels',
          'D) Only use free organic methods',
        ],
        correctAnswer: 'B',
        explanation: 'Data-driven budget allocation maximizes overall campaign effectiveness',
        difficulty: 'hard',
        topics: ['strategy', 'optimization', 'roi'],
      },
      {
        id: 'dma_002',
        question: 'What is marketing automation\'s primary strategic advantage?',
        options: [
          'A) Eliminating human marketers',
          'B) Personalizing customer journeys at scale while nurturing leads efficiently',
          'C) Sending more emails',
          'D) Reducing marketing costs to zero',
        ],
        correctAnswer: 'B',
        explanation: 'Automation enables sophisticated personalization impossible manually',
        difficulty: 'hard',
        topics: ['automation', 'personalization', 'strategy'],
      },
      {
        id: 'dma_003',
        question: 'How do you measure true marketing attribution in complex customer journeys?',
        options: [
          'A) Last-click attribution only',
          'B) Multi-touch attribution models considering all touchpoints',
          'C) First-click attribution only',
          'D) Ignoring attribution',
        ],
        correctAnswer: 'B',
        explanation: 'Multi-touch attribution reveals the true contribution of each channel',
        difficulty: 'hard',
        topics: ['analytics', 'attribution', 'measurement'],
      },
    ],
  },

  // WEB DEVELOPMENT - Advanced
  {
    skill: 'web-development',
    level: 'advanced',
    questions: [
      {
        id: 'wda_001',
        question: 'What is the benefit of server-side rendering (SSR) over client-side rendering?',
        options: [
          'A) Always faster in all cases',
          'B) Better SEO and faster initial page load',
          'C) Simpler code',
          'D) No JavaScript needed',
        ],
        correctAnswer: 'B',
        explanation: 'SSR improves SEO and perceived performance for content-heavy sites',
        difficulty: 'hard',
        topics: ['architecture', 'performance', 'seo'],
      },
      {
        id: 'wda_002',
        question: 'How do you optimize web application performance at scale?',
        options: [
          'A) Buy faster servers',
          'B) Implement caching, CDN, code splitting, lazy loading, and optimize assets',
          'C) Reduce features',
          'D) Block slow users',
        ],
        correctAnswer: 'B',
        explanation: 'Comprehensive optimization strategies address multiple performance factors',
        difficulty: 'hard',
        topics: ['performance', 'optimization', 'scalability'],
      },
      {
        id: 'wda_003',
        question: 'What is the purpose of WebAssembly?',
        options: [
          'A) Replacing HTML',
          'B) Running near-native speed code in browsers for performance-critical tasks',
          'C) Making websites look better',
          'D) Simplifying CSS',
        ],
        correctAnswer: 'B',
        explanation: 'WebAssembly enables high-performance computing in web applications',
        difficulty: 'hard',
        topics: ['technology', 'performance', 'innovation'],
      },
    ],
  },

  // GRAPHIC DESIGN - Advanced
  {
    skill: 'graphic-design',
    level: 'advanced',
    questions: [
      {
        id: 'gda_001',
        question: 'How do you create a cohesive brand identity system?',
        options: [
          'A) Design a logo only',
          'B) Develop comprehensive guidelines covering logo, colors, typography, imagery, and tone',
          'C) Copy competitor styles',
          'D) Use random design elements',
        ],
        correctAnswer: 'B',
        explanation: 'Comprehensive brand systems ensure consistency across all touchpoints',
        difficulty: 'hard',
        topics: ['branding', 'systems', 'strategy'],
      },
      {
        id: 'gda_002',
        question: 'What is the relationship between grid systems and visual hierarchy?',
        options: [
          'A) No relationship',
          'B) Grids provide structure for organizing elements by importance',
          'C) Grids limit creativity',
          'D) Visual hierarchy replaces grids',
        ],
        correctAnswer: 'B',
        explanation: 'Grids enable consistent, scalable visual hierarchy across designs',
        difficulty: 'hard',
        topics: ['layout', 'theory', 'structure'],
      },
      {
        id: 'gda_003',
        question: 'How do you design for accessibility without compromising aesthetics?',
        options: [
          'A) Accessibility always looks bad',
          'B) Use sufficient contrast, clear hierarchy, and inclusive design principles',
          'C) Ignore accessibility',
          'D) Make everything black and white',
        ],
        correctAnswer: 'B',
        explanation: 'Good design is inherently accessible and benefits all users',
        difficulty: 'hard',
        topics: ['accessibility', 'inclusive-design', 'best-practices'],
      },
    ],
  },

  // WRITING & TRANSLATION - Advanced
  {
    skill: 'writing-translation',
    level: 'advanced',
    questions: [
      {
        id: 'wta_001',
        question: 'How do you adapt content strategy for different cultural contexts?',
        options: [
          'A) Translate word-for-word',
          'B) Research cultural nuances, adapt messaging, consider local values and communication styles',
          'C) Use the same content everywhere',
          'D) Avoid international markets',
        ],
        correctAnswer: 'B',
        explanation: 'Cultural adaptation ensures content resonates with local audiences',
        difficulty: 'hard',
        topics: ['localization', 'strategy', 'culture'],
      },
      {
        id: 'wta_002',
        question: 'What makes long-form content effective in content marketing?',
        options: [
          'A) Length alone',
          'B) Deep value, strong structure, engaging narrative, and strategic keywords',
          'C) Using big words',
          'D) More images',
        ],
        correctAnswer: 'B',
        explanation: 'Effective long-form content provides comprehensive value and authority',
        difficulty: 'hard',
        topics: ['content-strategy', 'seo', 'engagement'],
      },
      {
        id: 'wta_003',
        question: 'How do you balance SEO optimization with natural writing?',
        options: [
          'A) Keyword stuffing',
          'B) Write for humans first, incorporate keywords naturally, focus on user intent',
          'C) Ignore SEO',
          'D) Write only for search engines',
        ],
        correctAnswer: 'B',
        explanation: 'Modern SEO rewards quality content that serves user needs',
        difficulty: 'hard',
        topics: ['seo', 'quality', 'strategy'],
      },
    ],
  },

  // VIDEO & ANIMATION - Advanced
  {
    skill: 'video-animation',
    level: 'advanced',
    questions: [
      {
        id: 'vaa_001',
        question: 'How do you create emotional impact through cinematography?',
        options: [
          'A) Random camera movements',
          'B) Strategic use of composition, lighting, camera movement, and pacing',
          'C) Expensive equipment only',
          'D) Loud sound effects',
        ],
        correctAnswer: 'B',
        explanation: 'Intentional cinematographic choices evoke specific emotional responses',
        difficulty: 'hard',
        topics: ['cinematography', 'storytelling', 'emotion'],
      },
      {
        id: 'vaa_002',
        question: 'What is the purpose of motion graphics in brand storytelling?',
        options: [
          'A) Making videos fancy',
          'B) Visualizing complex ideas, reinforcing brand identity, guiding viewer attention',
          'C) Filling empty space',
          'D) Showing off skills',
        ],
        correctAnswer: 'B',
        explanation: 'Motion graphics enhance communication and brand recognition',
        difficulty: 'hard',
        topics: ['motion-graphics', 'branding', 'communication'],
      },
      {
        id: 'vaa_003',
        question: 'How do you optimize video content for different platforms?',
        options: [
          'A) Use same video everywhere',
          'B) Adapt aspect ratio, length, pacing, and captions to platform algorithms and user behavior',
          'C) Always make vertical videos',
          'D) Only post on one platform',
        ],
        correctAnswer: 'B',
        explanation: 'Platform-specific optimization maximizes reach and engagement',
        difficulty: 'hard',
        topics: ['optimization', 'platforms', 'strategy'],
      },
    ],
  },

  // MUSIC & AUDIO - Advanced
  {
    skill: 'music-audio',
    level: 'advanced',
    questions: [
      {
        id: 'maa_001',
        question: 'How do you create depth in a mix?',
        options: [
          'A) Make everything loud',
          'B) Use EQ, reverb, delay, panning, and volume to create spatial dimension',
          'C) Add more instruments',
          'D) Compress everything heavily',
        ],
        correctAnswer: 'B',
        explanation: 'Strategic use of effects creates three-dimensional sonic space',
        difficulty: 'hard',
        topics: ['mixing', 'technique', 'spatial-audio'],
      },
      {
        id: 'maa_002',
        question: 'What is the role of dynamics in musical arrangement?',
        options: [
          'A) Making everything consistent',
          'B) Creating contrast, building tension, guiding emotional journey',
          'C) Volume changes only',
          'D) Technical requirement',
        ],
        correctAnswer: 'B',
        explanation: 'Dynamic variation drives emotional engagement and musical narrative',
        difficulty: 'hard',
        topics: ['arrangement', 'composition', 'dynamics'],
      },
      {
        id: 'maa_003',
        question: 'How do you achieve professional vocal production?',
        options: [
          'A) Expensive microphone only',
          'B) Proper recording technique, tuning, timing, EQ, compression, effects, and automation',
          'C) Auto-tune everything',
          'D) No processing needed',
        ],
        correctAnswer: 'B',
        explanation: 'Professional vocals require attention to every production stage',
        difficulty: 'hard',
        topics: ['production', 'vocals', 'technique'],
      },
    ],
  },

  // BUSINESS - Advanced
  {
    skill: 'business',
    level: 'advanced',
    questions: [
      {
        id: 'busa_001',
        question: 'How do you pivot a business model when market conditions change?',
        options: [
          'A) Panic and give up',
          'B) Analyze data, validate assumptions, test new approaches, maintain core values',
          'C) Copy competitors',
          'D) Wait for conditions to improve',
        ],
        correctAnswer: 'B',
        explanation: 'Strategic pivots require data-driven decisions and validation',
        difficulty: 'hard',
        topics: ['strategy', 'innovation', 'adaptation'],
      },
      {
        id: 'busa_002',
        question: 'What drives sustainable competitive advantage?',
        options: [
          'A) Lowest prices only',
          'B) Unique capabilities, strong brand, network effects, or proprietary technology',
          'C) Copying best practices',
          'D) Advertising spend',
        ],
        correctAnswer: 'B',
        explanation: 'Sustainable advantages are difficult for competitors to replicate',
        difficulty: 'hard',
        topics: ['strategy', 'competitive-advantage', 'sustainability'],
      },
      {
        id: 'busa_003',
        question: 'How do you scale operations while maintaining quality?',
        options: [
          'A) Hire more people',
          'B) Systematize processes, invest in training, implement quality controls, use technology',
          'C) Accept lower quality',
          'D) Slow down growth',
        ],
        correctAnswer: 'B',
        explanation: 'Scaling requires systematic approaches to maintain standards',
        difficulty: 'hard',
        topics: ['operations', 'scaling', 'quality'],
      },
    ],
  },

  // DATA ENTRY - Advanced
  {
    skill: 'data-entry',
    level: 'advanced',
    questions: [
      {
        id: 'dea_001',
        question: 'How do you design a data quality assurance system?',
        options: [
          'A) Check everything manually',
          'B) Implement validation rules, automated checks, duplicate detection, and audit trails',
          'C) Trust all data',
          'D) Delete questionable data',
        ],
        correctAnswer: 'B',
        explanation: 'Systematic quality assurance prevents and detects data issues',
        difficulty: 'hard',
        topics: ['quality', 'systems', 'automation'],
      },
      {
        id: 'dea_002',
        question: 'What is the best approach to migrating large datasets?',
        options: [
          'A) Copy-paste everything at once',
          'B) Plan mapping, test with samples, validate, migrate in phases, verify integrity',
          'C) Start over from scratch',
          'D) Manual reentry',
        ],
        correctAnswer: 'B',
        explanation: 'Successful migrations require careful planning and validation',
        difficulty: 'hard',
        topics: ['migration', 'planning', 'methodology'],
      },
      {
        id: 'dea_003',
        question: 'How do you optimize data workflows for efficiency?',
        options: [
          'A) Work faster',
          'B) Automate repetitive tasks, standardize formats, use macros and scripts, eliminate bottlenecks',
          'C) Add more people',
          'D) Accept current speed',
        ],
        correctAnswer: 'B',
        explanation: 'Workflow optimization combines automation with process improvement',
        difficulty: 'hard',
        topics: ['efficiency', 'automation', 'optimization'],
      },
    ],
  },

  // CUSTOMER SERVICE - Advanced
  {
    skill: 'customer-service',
    level: 'advanced',
    questions: [
      {
        id: 'csa_001',
        question: 'How do you transform a customer complaint into brand loyalty?',
        options: [
          'A) Offer discounts',
          'B) Listen deeply, take ownership, exceed expectations in resolution, follow up',
          'C) Blame others',
          'D) Process the refund',
        ],
        correctAnswer: 'B',
        explanation: 'Exceptional complaint handling creates stronger customer relationships',
        difficulty: 'hard',
        topics: ['recovery', 'loyalty', 'strategy'],
      },
      {
        id: 'csa_002',
        question: 'What metrics truly measure customer service success?',
        options: [
          'A) Call volume only',
          'B) Customer satisfaction, retention, lifetime value, effort score, and NPS',
          'C) Speed only',
          'D) Cost per interaction',
        ],
        correctAnswer: 'B',
        explanation: 'Comprehensive metrics reveal customer experience quality and business impact',
        difficulty: 'hard',
        topics: ['metrics', 'measurement', 'strategy'],
      },
      {
        id: 'csa_003',
        question: 'How do you build a customer-centric service culture?',
        options: [
          'A) Write policy documents',
          'B) Model leadership behavior, empower staff, gather feedback, reward customer focus',
          'C) Hire more agents',
          'D) Implement strict scripts',
        ],
        correctAnswer: 'B',
        explanation: 'Culture change requires leadership, empowerment, and systems alignment',
        difficulty: 'hard',
        topics: ['culture', 'leadership', 'transformation'],
      },
    ],
  },

  // SALES & MARKETING - Advanced
  {
    skill: 'sales-marketing',
    level: 'advanced',
    questions: [
      {
        id: 'sma_001',
        question: 'How do you build a high-performing sales pipeline?',
        options: [
          'A) Call everyone',
          'B) Define stages, qualify leads, nurture systematically, track metrics, optimize conversion',
          'C) Focus on closing only',
          'D) Rely on referrals only',
        ],
        correctAnswer: 'B',
        explanation: 'Structured pipelines enable predictable revenue growth',
        difficulty: 'hard',
        topics: ['sales-operations', 'process', 'optimization'],
      },
      {
        id: 'sma_002',
        question: 'What is account-based marketing (ABM)?',
        options: [
          'A) Accounting for marketing spend',
          'B) Highly targeted strategy treating individual accounts as markets',
          'C) Mass email campaigns',
          'D) Social media marketing',
        ],
        correctAnswer: 'B',
        explanation: 'ABM aligns sales and marketing for high-value accounts',
        difficulty: 'hard',
        topics: ['strategy', 'b2b', 'targeting'],
      },
      {
        id: 'sma_003',
        question: 'How do you optimize pricing strategy?',
        options: [
          'A) Match competitor prices',
          'B) Analyze value perception, costs, competition, and willingness to pay; test variations',
          'C) Charge as much as possible',
          'D) Use cost-plus only',
        ],
        correctAnswer: 'B',
        explanation: 'Strategic pricing balances multiple factors to maximize profitability',
        difficulty: 'hard',
        topics: ['pricing', 'strategy', 'optimization'],
      },
    ],
  },

  // ENGINEERING - Advanced
  {
    skill: 'engineering',
    level: 'advanced',
    questions: [
      {
        id: 'enga_001',
        question: 'How do you approach complex system optimization?',
        options: [
          'A) Trial and error only',
          'B) Model the system, identify constraints, simulate scenarios, validate improvements',
          'C) Make random changes',
          'D) Leave it as is',
        ],
        correctAnswer: 'B',
        explanation: 'Systematic optimization uses modeling and validation for reliable results',
        difficulty: 'hard',
        topics: ['optimization', 'systems', 'methodology'],
      },
      {
        id: 'enga_002',
        question: 'What is the purpose of failure mode analysis?',
        options: [
          'A) Documenting past failures',
          'B) Proactively identifying potential failures and implementing preventive measures',
          'C) Blaming engineers',
          'D) Warranty planning',
        ],
        correctAnswer: 'B',
        explanation: 'FMEA prevents failures through systematic risk assessment',
        difficulty: 'hard',
        topics: ['reliability', 'risk-management', 'quality'],
      },
      {
        id: 'enga_003',
        question: 'How do you balance innovation with proven engineering practices?',
        options: [
          'A) Always use old methods',
          'B) Assess risk, prototype new approaches, validate thoroughly, integrate gradually',
          'C) Always use newest technology',
          'D) Avoid innovation',
        ],
        correctAnswer: 'B',
        explanation: 'Responsible innovation combines creativity with rigorous validation',
        difficulty: 'hard',
        topics: ['innovation', 'risk-management', 'methodology'],
      },
    ],
  },

  // ARCHITECTURE - Advanced
  {
    skill: 'architecture',
    level: 'advanced',
    questions: [
      {
        id: 'archa_001',
        question: 'How do you integrate sustainability into architectural design from the start?',
        options: [
          'A) Add solar panels at the end',
          'B) Consider orientation, materials, systems, and lifecycle impact from concept phase',
          'C) Use green paint',
          'D) Plant trees around building',
        ],
        correctAnswer: 'B',
        explanation: 'Early integration of sustainability principles achieves best results',
        difficulty: 'hard',
        topics: ['sustainability', 'design', 'methodology'],
      },
      {
        id: 'archa_002',
        question: 'What role does parametric design play in complex architecture?',
        options: [
          'A) Making fancy shapes',
          'B) Enabling optimization of complex geometries through algorithmic relationships',
          'C) Replacing architects',
          'D) Reducing costs',
        ],
        correctAnswer: 'B',
        explanation: 'Parametric design enables exploration and optimization of complex forms',
        difficulty: 'hard',
        topics: ['technology', 'design', 'innovation'],
      },
      {
        id: 'archa_003',
        question: 'How do you balance client vision with regulatory requirements and site constraints?',
        options: [
          'A) Ignore regulations',
          'B) Educate client, find creative solutions, prioritize key elements, iterate design',
          'C) Force client to accept constraints',
          'D) Change the site',
        ],
        correctAnswer: 'B',
        explanation: 'Successful projects synthesize multiple competing demands through creativity',
        difficulty: 'hard',
        topics: ['project-management', 'problem-solving', 'design'],
      },
    ],
  },

  // LEGAL - Advanced
  {
    skill: 'legal',
    level: 'advanced',
    questions: [
      {
        id: 'lega_001',
        question: 'How do you structure a contract to minimize future disputes?',
        options: [
          'A) Make it as short as possible',
          'B) Define terms clearly, anticipate scenarios, include dispute resolution, specify remedies',
          'C) Use complex legal jargon',
          'D) Copy online templates',
        ],
        correctAnswer: 'B',
        explanation: 'Comprehensive, clear contracts prevent misunderstandings and disputes',
        difficulty: 'hard',
        topics: ['contracts', 'risk-management', 'drafting'],
      },
      {
        id: 'lega_002',
        question: 'What is the strategic importance of legal compliance?',
        options: [
          'A) Avoiding fines only',
          'B) Protecting reputation, enabling growth, building trust, reducing risk',
          'C) Creating paperwork',
          'D) Impressing investors',
        ],
        correctAnswer: 'B',
        explanation: 'Compliance is strategic, enabling sustainable business growth',
        difficulty: 'hard',
        topics: ['compliance', 'strategy', 'risk-management'],
      },
      {
        id: 'lega_003',
        question: 'How do you conduct effective legal research?',
        options: [
          'A) Google search only',
          'B) Use legal databases, analyze precedents, verify sources, update continuously',
          'C) Ask ChatGPT',
          'D) Copy old documents',
        ],
        correctAnswer: 'B',
        explanation: 'Thorough legal research requires proper sources and methodology',
        difficulty: 'hard',
        topics: ['research', 'methodology', 'best-practices'],
      },
    ],
  },

  // ACCOUNTING - Advanced
  {
    skill: 'accounting',
    level: 'advanced',
    questions: [
      {
        id: 'acca_001',
        question: 'How do you interpret financial statements for strategic decision-making?',
        options: [
          'A) Look at net income only',
          'B) Analyze trends, ratios, cash flow, compare benchmarks, identify drivers',
          'C) Check if numbers are positive',
          'D) Trust management summaries',
        ],
        correctAnswer: 'B',
        explanation: 'Comprehensive financial analysis reveals business health and opportunities',
        difficulty: 'hard',
        topics: ['analysis', 'strategy', 'financial-statements'],
      },
      {
        id: 'acca_002',
        question: 'What is the purpose of variance analysis?',
        options: [
          'A) Finding accounting errors',
          'B) Comparing actual to budget, identifying causes, informing corrective actions',
          'C) Punishing managers',
          'D) Creating reports',
        ],
        correctAnswer: 'B',
        explanation: 'Variance analysis drives continuous improvement and accountability',
        difficulty: 'hard',
        topics: ['analysis', 'budgeting', 'management'],
      },
      {
        id: 'acca_003',
        question: 'How do you implement effective internal controls?',
        options: [
          'A) Trust everyone',
          'B) Segregate duties, require approvals, reconcile regularly, audit periodically',
          'C) Lock everything',
          'D) Hire more accountants',
        ],
        correctAnswer: 'B',
        explanation: 'Layered controls prevent errors and fraud while enabling operations',
        difficulty: 'hard',
        topics: ['controls', 'risk-management', 'governance'],
      },
    ],
  },

  // HUMAN RESOURCES - Advanced
  {
    skill: 'hr',
    level: 'advanced',
    questions: [
      {
        id: 'hra_001',
        question: 'How do you design a compensation strategy that attracts and retains talent?',
        options: [
          'A) Pay market average',
          'B) Benchmark markets, align with strategy, mix cash and benefits, differentiate by performance',
          'C) Pay as little as possible',
          'D) Give everyone equal pay',
        ],
        correctAnswer: 'B',
        explanation: 'Strategic compensation balances competitiveness, equity, and performance',
        difficulty: 'hard',
        topics: ['compensation', 'strategy', 'talent-management'],
      },
      {
        id: 'hora_002',
        question: 'What drives successful organizational change?',
        options: [
          'A) Announcing changes',
          'B) Clear vision, leadership commitment, communication, employee involvement, sustaining momentum',
          'C) Management mandate',
          'D) Consultant reports',
        ],
        correctAnswer: 'B',
        explanation: 'Change success requires engaging hearts and minds, not just processes',
        difficulty: 'hard',
        topics: ['change-management', 'leadership', 'culture'],
      },
      {
        id: 'hra_003',
        question: 'How do you build an inclusive workplace culture?',
        options: [
          'A) Diversity training only',
          'B) Leadership commitment, inclusive policies, diverse hiring, psychological safety, accountability',
          'C) Hire diverse people',
          'D) Celebrate heritage months',
        ],
        correctAnswer: 'B',
        explanation: 'Inclusion requires systemic change across policies, practices, and culture',
        difficulty: 'hard',
        topics: ['diversity', 'culture', 'inclusion'],
      },
    ],
  },

  // CONSULTING - Advanced
  {
    skill: 'consulting',
    level: 'advanced',
    questions: [
      {
        id: 'consa_001',
        question: 'How do you diagnose root causes of organizational problems?',
        options: [
          'A) Accept stated problem',
          'B) Interview stakeholders, analyze data, map processes, test hypotheses systematically',
          'C) Guess based on experience',
          'D) Blame leadership',
        ],
        correctAnswer: 'B',
        explanation: 'Effective diagnosis requires structured investigation beyond symptoms',
        difficulty: 'hard',
        topics: ['problem-solving', 'methodology', 'analysis'],
      },
      {
        id: 'consa_002',
        question: 'What makes consulting recommendations actionable?',
        options: [
          'A) Beautiful PowerPoint',
          'B) Specific, prioritized, resourced plans with clear ownership and metrics',
          'C) Generic best practices',
          'D) Academic research',
        ],
        correctAnswer: 'B',
        explanation: 'Actionable recommendations enable clients to implement successfully',
        difficulty: 'hard',
        topics: ['implementation', 'strategy', 'communication'],
      },
      {
        id: 'consa_003',
        question: 'How do you manage stakeholder resistance to change?',
        options: [
          'A) Force compliance',
          'B) Understand concerns, involve early, communicate benefits, address fears, build coalition',
          'C) Ignore resistance',
          'D) Replace resisters',
        ],
        correctAnswer: 'B',
        explanation: 'Stakeholder engagement transforms resistance into support',
        difficulty: 'hard',
        topics: ['change-management', 'stakeholders', 'influence'],
      },
    ],
  },

  // EDUCATION - Advanced
  {
    skill: 'education',
    level: 'advanced',
    questions: [
      {
        id: 'edua_001',
        question: 'How do you design curriculum that develops critical thinking?',
        options: [
          'A) Lecture more',
          'B) Include analysis, synthesis, evaluation tasks; scaffold inquiry; encourage questioning',
          'C) Give harder tests',
          'D) Assign more homework',
        ],
        correctAnswer: 'B',
        explanation: 'Critical thinking requires deliberate practice with higher-order tasks',
        difficulty: 'hard',
        topics: ['curriculum', 'pedagogy', 'critical-thinking'],
      },
      {
        id: 'edua_002',
        question: 'What makes professional learning communities effective?',
        options: [
          'A) Meeting regularly',
          'B) Shared goals, collaborative inquiry, data analysis, collective responsibility for results',
          'C) Coffee and donuts',
          'D) Administrative mandate',
        ],
        correctAnswer: 'B',
        explanation: 'PLCs improve teaching through structured collaboration on student learning',
        difficulty: 'hard',
        topics: ['professional-development', 'collaboration', 'improvement'],
      },
      {
        id: 'edua_003',
        question: 'How do you use assessment data to improve instruction?',
        options: [
          'A) Record grades',
          'B) Analyze patterns, identify gaps, adjust methods, differentiate, reassess continuously',
          'C) Blame students',
          'D) Teach to the test',
        ],
        correctAnswer: 'B',
        explanation: 'Data-driven instruction targets specific needs and improves outcomes',
        difficulty: 'hard',
        topics: ['assessment', 'data', 'instruction'],
      },
    ],
  },

  // HEALTHCARE - Advanced
  {
    skill: 'healthcare',
    level: 'advanced',
    questions: [
      {
        id: 'hca_001',
        question: 'How do you implement quality improvement in healthcare?',
        options: [
          'A) Work harder',
          'B) Identify problems, measure baseline, test interventions, analyze results, standardize improvements',
          'C) Hire more staff',
          'D) Blame errors on individuals',
        ],
        correctAnswer: 'B',
        explanation: 'Systematic QI uses data and testing to improve care processes',
        difficulty: 'hard',
        topics: ['quality-improvement', 'methodology', 'systems'],
      },
      {
        id: 'hca_002',
        question: 'What is population health management?',
        options: [
          'A) Treating individuals',
          'B) Improving health outcomes of defined groups through coordinated interventions',
          'C) Public health campaigns',
          'D) Insurance administration',
        ],
        correctAnswer: 'B',
        explanation: 'Population health focuses on outcomes across patient populations',
        difficulty: 'hard',
        topics: ['population-health', 'strategy', 'outcomes'],
      },
      {
        id: 'hca_003',
        question: 'How do you reduce medical errors systemically?',
        options: [
          'A) Punish mistakes',
          'B) Design fail-safes, standardize processes, use checklists, create reporting culture',
          'C) Hire more experienced staff',
          'D) Increase supervision',
        ],
        correctAnswer: 'B',
        explanation: 'System design and culture prevent errors more effectively than individual effort',
        difficulty: 'hard',
        topics: ['safety', 'systems', 'quality'],
      },
    ],
  },

  // REAL ESTATE - Advanced
  {
    skill: 'real-estate',
    level: 'advanced',
    questions: [
      {
        id: 'rea_001',
        question: 'How do you analyze investment property potential?',
        options: [
          'A) Look at price only',
          'B) Calculate cash flow, cap rate, ROI, assess market trends, consider risks',
          'C) Trust your gut',
          'D) Follow hot tips',
        ],
        correctAnswer: 'B',
        explanation: 'Comprehensive analysis reveals true investment potential and risks',
        difficulty: 'hard',
        topics: ['investment', 'analysis', 'finance'],
      },
      {
        id: 'rea_002',
        question: 'What drives long-term real estate market trends?',
        options: [
          'A) Daily news',
          'B) Demographics, employment, interest rates, development, infrastructure',
          'C) TV shows',
          'D) Individual investor sentiment',
        ],
        correctAnswer: 'B',
        explanation: 'Fundamental factors drive sustainable market trends',
        difficulty: 'hard',
        topics: ['market-analysis', 'trends', 'economics'],
      },
      {
        id: 'rea_003',
        question: 'How do you negotiate complex real estate transactions?',
        options: [
          'A) Start with your best offer',
          'B) Understand all parties\' needs, create value, find creative solutions, document thoroughly',
          'C) Be aggressive',
          'D) Accept first offer',
        ],
        correctAnswer: 'B',
        explanation: 'Win-win negotiation creates value and ensures successful closings',
        difficulty: 'hard',
        topics: ['negotiation', 'transactions', 'strategy'],
      },
    ],
  },

  // LOGISTICS - Advanced
  {
    skill: 'logistics',
    level: 'advanced',
    questions: [
      {
        id: 'loga_001',
        question: 'How do you design a resilient supply chain?',
        options: [
          'A) Cheapest suppliers',
          'B) Diversify sources, build flexibility, monitor risks, maintain strategic inventory',
          'C) Single source for simplicity',
          'D) Ignore disruption risks',
        ],
        correctAnswer: 'B',
        explanation: 'Resilience requires balancing efficiency with risk management',
        difficulty: 'hard',
        topics: ['supply-chain', 'risk-management', 'strategy'],
      },
      {
        id: 'loga_002',
        question: 'What is the role of data analytics in logistics optimization?',
        options: [
          'A) Generating reports',
          'B) Predicting demand, optimizing routes, reducing costs, improving service levels',
          'C) Tracking packages',
          'D) Replacing logistics managers',
        ],
        correctAnswer: 'B',
        explanation: 'Analytics enables proactive optimization and better decision-making',
        difficulty: 'hard',
        topics: ['analytics', 'optimization', 'technology'],
      },
      {
        id: 'loga_003',
        question: 'How do you balance cost reduction with service quality in logistics?',
        options: [
          'A) Always choose cheapest',
          'B) Understand customer priorities, optimize strategically, measure trade-offs, differentiate service',
          'C) Ignore costs',
          'D) Compromise on everything',
        ],
        correctAnswer: 'B',
        explanation: 'Strategic logistics align costs with value delivered to customers',
        difficulty: 'hard',
        topics: ['strategy', 'optimization', 'service'],
      },
    ],
  },

  // MANUFACTURING - Advanced
  {
    skill: 'manufacturing',
    level: 'advanced',
    questions: [
      {
        id: 'mana_001',
        question: 'How do you implement smart manufacturing (Industry 4.0)?',
        options: [
          'A) Buy robots',
          'B) Integrate IoT, data analytics, automation, connectivity strategically across operations',
          'C) Replace all workers',
          'D) Install sensors everywhere',
        ],
        correctAnswer: 'B',
        explanation: 'Smart manufacturing requires strategic technology integration',
        difficulty: 'hard',
        topics: ['technology', 'innovation', 'transformation'],
      },
      {
        id: 'mana_002',
        question: 'What drives manufacturing sustainability?',
        options: [
          'A) Public relations',
          'B) Reducing waste, optimizing energy, circular design, responsible sourcing',
          'C) Green labels',
          'D) Offsetting carbon',
        ],
        correctAnswer: 'B',
        explanation: 'True sustainability integrates environmental responsibility into operations',
        difficulty: 'hard',
        topics: ['sustainability', 'operations', 'efficiency'],
      },
      {
        id: 'mana_003',
        question: 'How do you manage manufacturing capacity planning?',
        options: [
          'A) Build maximum capacity',
          'B) Forecast demand, assess constraints, balance costs, plan flexibility and scalability',
          'C) React to orders',
          'D) Always run at 100%',
        ],
        correctAnswer: 'B',
        explanation: 'Strategic capacity planning balances capability with demand and costs',
        difficulty: 'hard',
        topics: ['planning', 'operations', 'strategy'],
      },
    ],
  },

  // HOSPITALITY - Advanced
  {
    skill: 'hospitality',
    level: 'advanced',
    questions: [
      {
        id: 'hospa_001',
        question: 'How do you create memorable guest experiences consistently?',
        options: [
          'A) Expensive amenities',
          'B) Train staff deeply, empower decisions, personalize touchpoints, anticipate needs',
          'C) Strict procedures',
          'D) Technology only',
        ],
        correctAnswer: 'B',
        explanation: 'Exceptional experiences come from empowered, well-trained people',
        difficulty: 'hard',
        topics: ['service', 'experience', 'culture'],
      },
      {
        id: 'hospa_002',
        question: 'What is total revenue management in hospitality?',
        options: [
          'A) Room pricing only',
          'B) Optimizing all revenue streams (rooms, F&B, events, amenities) holistically',
          'C) Increasing all prices',
          'D) Cutting costs',
        ],
        correctAnswer: 'B',
        explanation: 'Total revenue management maximizes profit across all property revenue',
        difficulty: 'hard',
        topics: ['revenue-management', 'strategy', 'optimization'],
      },
      {
        id: 'hospa_003',
        question: 'How do you recover from a service failure effectively?',
        options: [
          'A) Apologize and move on',
          'B) Acknowledge immediately, take ownership, exceed expectations, follow up, learn',
          'C) Offer discount',
          'D) Blame circumstances',
        ],
        correctAnswer: 'B',
        explanation: 'Service recovery done well creates stronger loyalty than no failure',
        difficulty: 'hard',
        topics: ['service-recovery', 'quality', 'relationship'],
      },
    ],
  },

  // BEAUTY & WELLNESS - Advanced
  {
    skill: 'beauty-wellness',
    level: 'advanced',
    questions: [
      {
        id: 'bwa_001',
        question: 'How do you build a sustainable beauty business?',
        options: [
          'A) Low prices',
          'B) Retain clients, diversify services, build reputation, manage finances, develop team',
          'C) Work longer hours',
          'D) Discount heavily',
        ],
        correctAnswer: 'B',
        explanation: 'Sustainable businesses balance client value, profitability, and growth',
        difficulty: 'hard',
        topics: ['business', 'strategy', 'sustainability'],
      },
      {
        id: 'bwa_002',
        question: 'What is the role of continuing education in beauty services?',
        options: [
          'A) Meeting license requirements',
          'B) Mastering new techniques, staying current, differentiating services, commanding premium prices',
          'C) Networking events',
          'D) Certificate collection',
        ],
        correctAnswer: 'B',
        explanation: 'Continuous learning drives professional growth and business success',
        difficulty: 'hard',
        topics: ['professional-development', 'skills', 'growth'],
      },
      {
        id: 'bwa_003',
        question: 'How do you manage difficult client expectations?',
        options: [
          'A) Promise anything',
          'B) Consult thoroughly, set realistic expectations, educate, document, maintain boundaries',
          'C) Refuse service',
          'D) Hope for the best',
        ],
        correctAnswer: 'B',
        explanation: 'Managing expectations prevents dissatisfaction and maintains relationships',
        difficulty: 'hard',
        topics: ['client-management', 'communication', 'boundaries'],
      },
    ],
  },

  // FITNESS - Advanced
  {
    skill: 'fitness',
    level: 'advanced',
    questions: [
      {
        id: 'fita_001',
        question: 'How do you design programs for special populations (elderly, pregnant, injured)?',
        options: [
          'A) Use same programs for everyone',
          'B) Assess thoroughly, modify appropriately, monitor closely, collaborate with healthcare',
          'C) Avoid these clients',
          'D) Reduce intensity only',
        ],
        correctAnswer: 'B',
        explanation: 'Special populations require individualized, informed programming',
        difficulty: 'hard',
        topics: ['programming', 'special-populations', 'safety'],
      },
      {
        id: 'fita_002',
        question: 'What drives long-term client adherence to fitness programs?',
        options: [
          'A) Tough love',
          'B) Enjoyment, social support, realistic goals, progress tracking, habit formation',
          'C) Punishment',
          'D) Expensive equipment',
        ],
        correctAnswer: 'B',
        explanation: 'Sustainable fitness requires psychological and social factors beyond exercise',
        difficulty: 'hard',
        topics: ['adherence', 'psychology', 'coaching'],
      },
      {
        id: 'fita_003',
        question: 'How do you integrate nutrition guidance into fitness coaching?',
        options: [
          'A) Prescribe specific diets',
          'B) Provide general education, refer to dietitians, support healthy choices within scope',
          'C) Sell supplements',
          'D) Ignore nutrition',
        ],
        correctAnswer: 'B',
        explanation: 'Fitness professionals support nutrition within legal and ethical boundaries',
        difficulty: 'hard',
        topics: ['nutrition', 'scope-of-practice', 'coaching'],
      },
    ],
  },

  // PHOTOGRAPHY - Advanced
  {
    skill: 'photography',
    level: 'advanced',
    questions: [
      {
        id: 'phota_001',
        question: 'How do you develop a distinctive photographic style?',
        options: [
          'A) Copy famous photographers',
          'B) Experiment broadly, study influences, refine preferences, practice consistently',
          'C) Use presets',
          'D) Expensive gear',
        ],
        correctAnswer: 'B',
        explanation: 'Authentic style emerges from exploration and deliberate refinement',
        difficulty: 'hard',
        topics: ['style', 'creativity', 'development'],
      },
      {
        id: 'phota_002',
        question: 'What makes a photography business sustainable?',
        options: [
          'A) Low prices',
          'B) Diversify revenue, build brand, deliver consistently, manage costs, market effectively',
          'C) Shoot everything',
          'D) Expensive website',
        ],
        correctAnswer: 'B',
        explanation: 'Business success requires balancing creative and commercial skills',
        difficulty: 'hard',
        topics: ['business', 'strategy', 'sustainability'],
      },
      {
        id: 'phota_003',
        question: 'How do you handle challenging lighting conditions?',
        options: [
          'A) Cancel the shoot',
          'B) Understand light quality, modify with tools, adjust camera settings, use post-processing',
          'C) Use flash for everything',
          'D) Automatic mode',
        ],
        correctAnswer: 'B',
        explanation: 'Mastering light in any condition separates professionals from amateurs',
        difficulty: 'hard',
        topics: ['lighting', 'technique', 'problem-solving'],
      },
    ],
  },

  // DIGITAL MARKETING - Expert
  {
    skill: 'digital-marketing',
    level: 'expert',
    questions: [
      {
        id: 'dme_001',
        question: 'How would you architect a predictive marketing system using AI and machine learning?',
        options: [
          'A) Buy marketing automation software',
          'B) Integrate customer data, train models on behavior patterns, automate personalization, continuously optimize',
          'C) Use basic segmentation',
          'D) Hire more analysts',
        ],
        correctAnswer: 'B',
        explanation: 'Advanced predictive systems leverage ML to anticipate customer needs and behaviors',
        difficulty: 'hard',
        topics: ['ai', 'innovation', 'predictive-analytics'],
      },
      {
        id: 'dme_002',
        question: 'What defines thought leadership in digital marketing strategy?',
        options: [
          'A) Following trends',
          'B) Pioneering new approaches, publishing original research, shaping industry conversations',
          'C) Having many followers',
          'D) Working at big companies',
        ],
        correctAnswer: 'B',
        explanation: 'Thought leadership drives innovation and influences industry direction',
        difficulty: 'hard',
        topics: ['leadership', 'innovation', 'strategy'],
      },
      {
        id: 'dme_003',
        question: 'How do you future-proof a marketing organization against technological disruption?',
        options: [
          'A) Resist change',
          'B) Build adaptable teams, invest in learning, experiment continuously, partner strategically',
          'C) Use only proven methods',
          'D) Outsource everything',
        ],
        correctAnswer: 'B',
        explanation: 'Future-ready organizations embrace change and build adaptive capacity',
        difficulty: 'hard',
        topics: ['transformation', 'innovation', 'leadership'],
      },
    ],
  },

  // WEB DEVELOPMENT - Expert
  {
    skill: 'web-development',
    level: 'expert',
    questions: [
      {
        id: 'wde_001',
        question: 'How would you design a globally distributed web application architecture?',
        options: [
          'A) One big server',
          'B) Multi-region deployment, edge computing, distributed databases, intelligent routing',
          'C) Cloud hosting',
          'D) Load balancer only',
        ],
        correctAnswer: 'B',
        explanation: 'Global architecture requires strategic distribution and synchronization',
        difficulty: 'hard',
        topics: ['architecture', 'scalability', 'distributed-systems'],
      },
      {
        id: 'wde_002',
        question: 'What emerging web technologies will transform development in the next 5 years?',
        options: [
          'A) Nothing new',
          'B) WebAssembly, edge computing, AI integration, Progressive Web Apps evolution, Web3 technologies',
          'C) Faster JavaScript',
          'D) Better CSS',
        ],
        correctAnswer: 'B',
        explanation: 'Understanding emerging tech positions developers to lead innovation',
        difficulty: 'hard',
        topics: ['innovation', 'trends', 'technology'],
      },
      {
        id: 'wde_003',
        question: 'How do you lead technical architecture decisions for enterprise-scale applications?',
        options: [
          'A) Choose favorite technologies',
          'B) Assess requirements, evaluate trade-offs, consider team capabilities, plan evolution, document rationale',
          'C) Copy competitors',
          'D) Use most expensive solutions',
        ],
        correctAnswer: 'B',
        explanation: 'Architectural leadership requires balancing multiple strategic considerations',
        difficulty: 'hard',
        topics: ['leadership', 'architecture', 'strategy'],
      },
    ],
  },

  // GRAPHIC DESIGN - Expert
  {
    skill: 'graphic-design',
    level: 'expert',
    questions: [
      {
        id: 'gde_001',
        question: 'How do you drive innovation in visual communication while maintaining brand integrity?',
        options: [
          'A) Never change established brands',
          'B) Evolve systematically, test new directions, maintain core equity, lead stakeholders through change',
          'C) Follow design trends blindly',
          'D) Completely rebrand frequently',
        ],
        correctAnswer: 'B',
        explanation: 'Brand evolution requires balancing innovation with continuity',
        difficulty: 'hard',
        topics: ['innovation', 'branding', 'leadership'],
      },
      {
        id: 'gde_002',
        question: 'What role does design thinking play in business transformation?',
        options: [
          'A) Making things pretty',
          'B) Reframing problems, fostering innovation, centering human needs, enabling strategic solutions',
          'C) Design process only',
          'D) Creative workshops',
        ],
        correctAnswer: 'B',
        explanation: 'Design thinking transforms how organizations approach problems and innovation',
        difficulty: 'hard',
        topics: ['design-thinking', 'innovation', 'strategy'],
      },
      {
        id: 'gde_003',
        question: 'How do you establish yourself as a creative director?',
        options: [
          'A) Years of experience only',
          'B) Develop strategic vision, lead teams effectively, communicate with stakeholders, deliver results',
          'C) Win awards',
          'D) Work at famous agencies',
        ],
        correctAnswer: 'B',
        explanation: 'Creative leadership combines vision, communication, and business acumen',
        difficulty: 'hard',
        topics: ['leadership', 'career', 'strategy'],
      },
    ],
  },

  // WRITING & TRANSLATION - Expert
  {
    skill: 'writing-translation',
    level: 'expert',
    questions: [
      {
        id: 'wte_001',
        question: 'How do you architect content ecosystems that drive business transformation?',
        options: [
          'A) Write blog posts',
          'B) Align content with business strategy, create integrated systems, measure impact, optimize continuously',
          'C) Hire more writers',
          'D) Post on social media',
        ],
        correctAnswer: 'B',
        explanation: 'Strategic content systems align with and drive business objectives',
        difficulty: 'hard',
        topics: ['strategy', 'transformation', 'leadership'],
      },
      {
        id: 'wte_002',
        question: 'What defines mastery in professional translation?',
        options: [
          'A) Speaking multiple languages',
          'B) Deep cultural understanding, subject expertise, stylistic excellence, strategic adaptation',
          'C) Fast translation',
          'D) Using translation software',
        ],
        correctAnswer: 'B',
        explanation: 'Translation mastery transcends language to cultural and strategic understanding',
        difficulty: 'hard',
        topics: ['mastery', 'translation', 'expertise'],
      },
      {
        id: 'wte_003',
        question: 'How do you lead content strategy in emerging media formats?',
        options: [
          'A) Stick to traditional formats',
          'B) Experiment strategically, understand platform dynamics, adapt storytelling, measure effectiveness',
          'C) Copy others',
          'D) Wait for proof of concept',
        ],
        correctAnswer: 'B',
        explanation: 'Content leadership requires pioneering new formats while managing risk',
        difficulty: 'hard',
        topics: ['innovation', 'leadership', 'strategy'],
      },
    ],
  },

  // VIDEO & ANIMATION - Expert
  {
    skill: 'video-animation',
    level: 'expert',
    questions: [
      {
        id: 'vae_001',
        question: 'How do you pioneer new visual storytelling techniques?',
        options: [
          'A) Copy successful films',
          'B) Experiment with technology, challenge conventions, synthesize influences, develop signature approaches',
          'C) Use expensive equipment',
          'D) Follow industry standards',
        ],
        correctAnswer: 'B',
        explanation: 'Innovation in storytelling comes from creative experimentation and synthesis',
        difficulty: 'hard',
        topics: ['innovation', 'storytelling', 'creativity'],
      },
      {
        id: 'vae_002',
        question: 'What drives the future of interactive and immersive video experiences?',
        options: [
          'A) Higher resolution',
          'B) VR/AR integration, AI-driven personalization, real-time rendering, viewer agency',
          'C) Longer videos',
          'D) More effects',
        ],
        correctAnswer: 'B',
        explanation: 'Future video experiences blend interactivity, immersion, and personalization',
        difficulty: 'hard',
        topics: ['innovation', 'technology', 'trends'],
      },
      {
        id: 'vae_003',
        question: 'How do you lead creative vision on large-scale productions?',
        options: [
          'A) Control everything',
          'B) Communicate vision clearly, empower collaborators, maintain creative standards, solve problems',
          'C) Hire famous talent',
          'D) Micromanage details',
        ],
        correctAnswer: 'B',
        explanation: 'Creative leadership balances vision with collaboration and problem-solving',
        difficulty: 'hard',
        topics: ['leadership', 'production', 'collaboration'],
      },
    ],
  },

  // MUSIC & AUDIO - Expert
  {
    skill: 'music-audio',
    level: 'expert',
    questions: [
      {
        id: 'mae_001',
        question: 'How do you innovate in audio production while maintaining commercial viability?',
        options: [
          'A) Always follow trends',
          'B) Balance experimentation with market understanding, develop unique sound, build audience',
          'C) Copy hit records',
          'D) Focus only on art',
        ],
        correctAnswer: 'B',
        explanation: 'Sustainable innovation requires balancing creativity with commercial awareness',
        difficulty: 'hard',
        topics: ['innovation', 'production', 'strategy'],
      },
      {
        id: 'mae_002',
        question: 'What emerging technologies are transforming music creation and distribution?',
        options: [
          'A) Nothing significant',
          'B) AI composition, spatial audio, blockchain distribution, immersive experiences, cloud collaboration',
          'C) Better speakers',
          'D) Faster computers',
        ],
        correctAnswer: 'B',
        explanation: 'Technology is fundamentally changing how music is created and consumed',
        difficulty: 'hard',
        topics: ['technology', 'innovation', 'trends'],
      },
      {
        id: 'mae_003',
        question: 'How do you build a sustainable career as an audio professional?',
        options: [
          'A) Chase hit records',
          'B) Diversify income, build relationships, deliver consistently, adapt to industry changes, develop business acumen',
          'C) Work for free',
          'D) Wait for discovery',
        ],
        correctAnswer: 'B',
        explanation: 'Long-term success requires business strategy alongside creative excellence',
        difficulty: 'hard',
        topics: ['career', 'business', 'sustainability'],
      },
    ],
  },

  // BUSINESS - Expert
  {
    skill: 'business',
    level: 'expert',
    questions: [
      {
        id: 'buse_001',
        question: 'How do you lead organizational transformation in disruptive markets?',
        options: [
          'A) Resist change',
          'B) Create compelling vision, build coalition, enable experimentation, manage resistance, sustain momentum',
          'C) Cut costs',
          'D) Hire consultants',
        ],
        correctAnswer: 'B',
        explanation: 'Transformation requires strategic vision and skilled change leadership',
        difficulty: 'hard',
        topics: ['transformation', 'leadership', 'strategy'],
      },
      {
        id: 'buse_002',
        question: 'What defines strategic thinking at the executive level?',
        options: [
          'A) Long-term planning',
          'B) Synthesizing complexity, anticipating futures, making difficult trade-offs, aligning resources',
          'C) Industry knowledge',
          'D) Financial analysis',
        ],
        correctAnswer: 'B',
        explanation: 'Strategic leadership requires synthesis, foresight, and decisive action',
        difficulty: 'hard',
        topics: ['strategy', 'leadership', 'thinking'],
      },
      {
        id: 'buse_003',
        question: 'How do you build companies that create lasting impact?',
        options: [
          'A) Maximize short-term profits',
          'B) Define meaningful purpose, build strong culture, deliver sustained value, balance stakeholder interests',
          'C) Follow market trends',
          'D) Scale at any cost',
        ],
        correctAnswer: 'B',
        explanation: 'Enduring companies balance purpose, culture, value, and stakeholder needs',
        difficulty: 'hard',
        topics: ['leadership', 'impact', 'sustainability'],
      },
    ],
  },

  // DATA ENTRY - Expert
  {
    skill: 'data-entry',
    level: 'expert',
    questions: [
      {
        id: 'dee_001',
        question: 'How do you architect enterprise data management systems?',
        options: [
          'A) Buy software',
          'B) Design governance, establish standards, implement automation, ensure quality, enable insights',
          'C) Hire more staff',
          'D) Use spreadsheets',
        ],
        correctAnswer: 'B',
        explanation: 'Enterprise data systems require comprehensive strategic design',
        difficulty: 'hard',
        topics: ['architecture', 'systems', 'strategy'],
      },
      {
        id: 'dee_002',
        question: 'What role does data quality play in AI and analytics success?',
        options: [
          'A) Minimal importance',
          'B) Foundational - determines accuracy, reliability, and value of all insights and predictions',
          'C) Only affects reports',
          'D) Technology solves quality issues',
        ],
        correctAnswer: 'B',
        explanation: 'Data quality is the foundation of trustworthy AI and analytics',
        difficulty: 'hard',
        topics: ['quality', 'analytics', 'ai'],
      },
      {
        id: 'dee_003',
        question: 'How do you lead digital transformation of data operations?',
        options: [
          'A) Buy new software',
          'B) Assess current state, design future state, automate strategically, upskill teams, manage change',
          'C) Replace all processes',
          'D) Outsource everything',
        ],
        correctAnswer: 'B',
        explanation: 'Data transformation requires strategic planning and change management',
        difficulty: 'hard',
        topics: ['transformation', 'leadership', 'automation'],
      },
    ],
  },

  // CUSTOMER SERVICE - Expert
  {
    skill: 'customer-service',
    level: 'expert',
    questions: [
      {
        id: 'cse_001',
        question: 'How do you design customer experience strategies that drive competitive advantage?',
        options: [
          'A) Good service standards',
          'B) Map journeys, identify moments of truth, differentiate meaningfully, measure impact, iterate',
          'C) Train staff better',
          'D) Reduce wait times',
        ],
        correctAnswer: 'B',
        explanation: 'Strategic CX creates sustainable differentiation and business value',
        difficulty: 'hard',
        topics: ['strategy', 'experience', 'competitive-advantage'],
      },
      {
        id: 'cse_002',
        question: 'What defines service leadership excellence?',
        options: [
          'A) Years in service',
          'B) Inspiring teams, driving culture, innovating experiences, delivering business results',
          'C) Managing metrics',
          'D) Handling escalations',
        ],
        correctAnswer: 'B',
        explanation: 'Service leadership transforms culture and delivers strategic business impact',
        difficulty: 'hard',
        topics: ['leadership', 'excellence', 'transformation'],
      },
      {
        id: 'cse_003',
        question: 'How do you integrate AI and automation while maintaining human connection?',
        options: [
          'A) Replace humans with bots',
          'B) Use AI for efficiency, reserve humans for empathy, design seamless handoffs, measure satisfaction',
          'C) Avoid automation',
          'D) Automate everything',
        ],
        correctAnswer: 'B',
        explanation: 'Optimal service balances automation efficiency with human empathy',
        difficulty: 'hard',
        topics: ['innovation', 'strategy', 'technology'],
      },
    ],
  },

  // SALES & MARKETING - Expert
  {
    skill: 'sales-marketing',
    level: 'expert',
    questions: [
      {
        id: 'sme_001',
        question: 'How do you architect revenue operations for predictable growth?',
        options: [
          'A) Hire more salespeople',
          'B) Align systems, processes, and teams; leverage data; optimize funnel; enable predictability',
          'C) Increase quotas',
          'D) Buy leads',
        ],
        correctAnswer: 'B',
        explanation: 'Revenue operations creates systematic, predictable growth engines',
        difficulty: 'hard',
        topics: ['strategy', 'operations', 'growth'],
      },
      {
        id: 'sme_002',
        question: 'What defines world-class sales leadership?',
        options: [
          'A) Top individual performer',
          'B) Developing talent, driving strategy, building culture, delivering consistent results',
          'C) Meeting quotas',
          'D) Longest tenure',
        ],
        correctAnswer: 'B',
        explanation: 'Sales leadership multiplies success through people, strategy, and culture',
        difficulty: 'hard',
        topics: ['leadership', 'excellence', 'development'],
      },
      {
        id: 'sme_003',
        question: 'How do you pioneer new go-to-market strategies?',
        options: [
          'A) Copy competitors',
          'B) Challenge assumptions, test hypotheses, synthesize insights, scale winners, iterate continuously',
          'C) Follow best practices',
          'D) Consult case studies',
        ],
        correctAnswer: 'B',
        explanation: 'GTM innovation requires experimentation and strategic risk-taking',
        difficulty: 'hard',
        topics: ['innovation', 'strategy', 'growth'],
      },
    ],
  },

  // ENGINEERING - Expert
  {
    skill: 'engineering',
    level: 'expert',
    questions: [
      {
        id: 'enge_001',
        question: 'How do you lead breakthrough engineering innovation?',
        options: [
          'A) Incremental improvements',
          'B) Challenge fundamentals, explore emerging technologies, prototype boldly, manage technical risk',
          'C) Follow standards',
          'D) Optimize existing solutions',
        ],
        correctAnswer: 'B',
        explanation: 'Breakthrough innovation requires questioning assumptions and bold exploration',
        difficulty: 'hard',
        topics: ['innovation', 'leadership', 'r&d'],
      },
      {
        id: 'enge_002',
        question: 'What defines engineering leadership at scale?',
        options: [
          'A) Technical expertise',
          'B) Setting vision, developing talent, driving quality, enabling innovation, delivering results',
          'C) Managing projects',
          'D) Solving hard problems',
        ],
        correctAnswer: 'B',
        explanation: 'Engineering leadership builds organizations that deliver sustained excellence',
        difficulty: 'hard',
        topics: ['leadership', 'management', 'excellence'],
      },
      {
        id: 'enge_003',
        question: 'How do you balance innovation with safety and reliability in critical systems?',
        options: [
          'A) Never innovate in critical systems',
          'B) Rigorous validation, staged deployment, redundancy, continuous monitoring, fail-safe design',
          'C) Test in production',
          'D) Over-engineer everything',
        ],
        correctAnswer: 'B',
        explanation: 'Safe innovation requires systematic risk management and validation',
        difficulty: 'hard',
        topics: ['safety', 'innovation', 'reliability'],
      },
    ],
  },

  // ARCHITECTURE - Expert
  {
    skill: 'architecture',
    level: 'expert',
    questions: [
      {
        id: 'arche_001',
        question: 'How do you pioneer sustainable architecture that transforms communities?',
        options: [
          'A) LEED certification',
          'B) Integrate environmental, social, economic sustainability; engage community; innovate systems',
          'C) Solar panels',
          'D) Green materials',
        ],
        correctAnswer: 'B',
        explanation: 'Transformative architecture balances environmental, social, and economic impact',
        difficulty: 'hard',
        topics: ['sustainability', 'innovation', 'impact'],
      },
      {
        id: 'arche_002',
        question: 'What defines architectural leadership and vision?',
        options: [
          'A) Design awards',
          'B) Shaping built environment, influencing profession, mentoring talent, pushing boundaries',
          'C) Famous projects',
          'D) Large firm ownership',
        ],
        correctAnswer: 'B',
        explanation: 'Architectural leadership extends beyond projects to professional influence',
        difficulty: 'hard',
        topics: ['leadership', 'vision', 'influence'],
      },
      {
        id: 'arche_003',
        question: 'How do you integrate emerging technologies while respecting architectural principles?',
        options: [
          'A) Reject technology',
          'B) Understand fundamentals, evaluate technology thoughtfully, enhance not replace principles',
          'C) Use all new technology',
          'D) Technology over design',
        ],
        correctAnswer: 'B',
        explanation: 'Technology should enhance rather than override timeless design principles',
        difficulty: 'hard',
        topics: ['technology', 'innovation', 'principles'],
      },
    ],
  },

  // LEGAL - Expert
  {
    skill: 'legal',
    level: 'expert',
    questions: [
      {
        id: 'lege_001',
        question: 'How do you provide strategic legal counsel that drives business success?',
        options: [
          'A) Say no to risky things',
          'B) Understand business deeply, enable objectives, manage risks strategically, provide creative solutions',
          'C) Focus on compliance',
          'D) Draft perfect contracts',
        ],
        correctAnswer: 'B',
        explanation: 'Strategic legal counsel balances risk management with business enablement',
        difficulty: 'hard',
        topics: ['strategy', 'counsel', 'business'],
      },
      {
        id: 'lege_002',
        question: 'What distinguishes thought leadership in legal practice?',
        options: [
          'A) Winning cases',
          'B) Shaping legal discourse, publishing scholarship, influencing policy, mentoring profession',
          'C) High billing rates',
          'D) Famous clients',
        ],
        correctAnswer: 'B',
        explanation: 'Legal thought leadership influences the profession and legal system',
        difficulty: 'hard',
        topics: ['leadership', 'influence', 'scholarship'],
      },
      {
        id: 'lege_003',
        question: 'How do you navigate complex multi-jurisdictional legal challenges?',
        options: [
          'A) Apply home country law',
          'B) Coordinate expertise, understand interactions, manage conflicts, devise unified strategies',
          'C) Hire local counsel everywhere',
          'D) Choose favorable jurisdictions',
        ],
        correctAnswer: 'B',
        explanation: 'Multi-jurisdictional work requires sophisticated coordination and strategy',
        difficulty: 'hard',
        topics: ['complexity', 'strategy', 'international'],
      },
    ],
  },

  // ACCOUNTING - Expert
  {
    skill: 'accounting',
    level: 'expert',
    questions: [
      {
        id: 'acce_001',
        question: 'How do you provide financial leadership that drives strategic value?',
        options: [
          'A) Accurate books',
          'B) Strategic insights, forward-looking analysis, risk management, value creation guidance',
          'C) Timely reporting',
          'D) Cost reduction',
        ],
        correctAnswer: 'B',
        explanation: 'Financial leadership translates data into strategic business advantage',
        difficulty: 'hard',
        topics: ['leadership', 'strategy', 'value'],
      },
      {
        id: 'acce_002',
        question: 'What defines excellence in financial systems transformation?',
        options: [
          'A) New software',
          'B) Redesign processes, integrate systems, automate strategically, enable insights, manage change',
          'C) Cloud migration',
          'D) Outsource bookkeeping',
        ],
        correctAnswer: 'B',
        explanation: 'Financial transformation requires holistic systems and change management',
        difficulty: 'hard',
        topics: ['transformation', 'systems', 'leadership'],
      },
      {
        id: 'acce_003',
        question: 'How do you navigate complex international tax and accounting standards?',
        options: [
          'A) Ignore foreign standards',
          'B) Master multiple frameworks, understand interactions, coordinate globally, ensure compliance',
          'C) Hire consultants',
          'D) Use simple approaches',
        ],
        correctAnswer: 'B',
        explanation: 'Global operations require sophisticated multi-framework expertise',
        difficulty: 'hard',
        topics: ['international', 'complexity', 'expertise'],
      },
    ],
  },

  // HUMAN RESOURCES - Expert
  {
    skill: 'hr',
    level: 'expert',
    questions: [
      {
        id: 'hre_001',
        question: 'How do you architect people strategies that drive business transformation?',
        options: [
          'A) Recruit better',
          'B) Align with business strategy, build capabilities, shape culture, enable change, measure impact',
          'C) Improve benefits',
          'D) Update policies',
        ],
        correctAnswer: 'B',
        explanation: 'Strategic HR transforms organizations through people and culture',
        difficulty: 'hard',
        topics: ['strategy', 'transformation', 'leadership'],
      },
      {
        id: 'hre_002',
        question: 'What defines CHRO-level leadership?',
        options: [
          'A) HR expertise',
          'B) Business acumen, strategic vision, executive presence, change leadership, people development',
          'C) Policy knowledge',
          'D) Long experience',
        ],
        correctAnswer: 'B',
        explanation: 'CHRO leadership requires business strategy alongside HR excellence',
        difficulty: 'hard',
        topics: ['leadership', 'executive', 'excellence'],
      },
      {
        id: 'hre_003',
        question: 'How do you lead organizational culture transformation?',
        options: [
          'A) Update values statement',
          'B) Define desired culture, model behaviors, align systems, engage employees, sustain change',
          'C) Team building events',
          'D) Culture surveys',
        ],
        correctAnswer: 'B',
        explanation: 'Culture change requires systematic, sustained leadership commitment',
        difficulty: 'hard',
        topics: ['culture', 'transformation', 'change-management'],
      },
    ],
  },

  // CONSULTING - Expert
  {
    skill: 'consulting',
    level: 'expert',
    questions: [
      {
        id: 'conse_001',
        question: 'How do you drive transformational value for clients?',
        options: [
          'A) Deliver recommendations',
          'B) Deep diagnosis, bold solutions, implementation support, capability building, sustained impact',
          'C) Best practice application',
          'D) Process improvement',
        ],
        correctAnswer: 'B',
        explanation: 'Transformational consulting creates lasting capability and value',
        difficulty: 'hard',
        topics: ['transformation', 'value', 'impact'],
      },
      {
        id: 'conse_002',
        question: 'What distinguishes partner-level consulting leadership?',
        options: [
          'A) Years of experience',
          'B) Business development, thought leadership, team development, client relationships, firm building',
          'C) Technical expertise',
          'D) Project management',
        ],
        correctAnswer: 'B',
        explanation: 'Partner leadership builds practices, develops people, and creates value',
        difficulty: 'hard',
        topics: ['leadership', 'partnership', 'excellence'],
      },
      {
        id: 'conse_003',
        question: 'How do you build a personal brand as a strategic advisor?',
        options: [
          'A) Expensive marketing',
          'B) Deliver exceptional results, publish insights, speak at forums, build relationships, demonstrate expertise',
          'C) Social media presence',
          'D) Famous clients',
        ],
        correctAnswer: 'B',
        explanation: 'Advisor brands are built through demonstrated expertise and results',
        difficulty: 'hard',
        topics: ['branding', 'expertise', 'influence'],
      },
    ],
  },

  // EDUCATION - Expert
  {
    skill: 'education',
    level: 'expert',
    questions: [
      {
        id: 'edue_001',
        question: 'How do you lead systemic educational transformation?',
        options: [
          'A) New curriculum',
          'B) Redesign systems, change culture, build capacity, engage stakeholders, sustain improvement',
          'C) More technology',
          'D) Better testing',
        ],
        correctAnswer: 'B',
        explanation: 'Educational transformation requires systemic change across multiple dimensions',
        difficulty: 'hard',
        topics: ['transformation', 'leadership', 'systems'],
      },
      {
        id: 'edue_002',
        question: 'What defines educational thought leadership?',
        options: [
          'A) Teaching awards',
          'B) Pioneering practices, influencing policy, publishing research, shaping profession',
          'C) Popular courses',
          'D) Administrative roles',
        ],
        correctAnswer: 'B',
        explanation: 'Educational leaders shape the field through innovation and influence',
        difficulty: 'hard',
        topics: ['leadership', 'innovation', 'influence'],
      },
      {
        id: 'edue_003',
        question: 'How do you prepare learners for unknowable futures?',
        options: [
          'A) Teach current skills',
          'B) Develop adaptability, critical thinking, learning to learn, resilience, creativity',
          'C) Focus on tests',
          'D) Technology training',
        ],
        correctAnswer: 'B',
        explanation: 'Future-ready education emphasizes transferable capacities over fixed knowledge',
        difficulty: 'hard',
        topics: ['innovation', 'future', 'pedagogy'],
      },
    ],
  },

  // HEALTHCARE - Expert
  {
    skill: 'healthcare',
    level: 'expert',
    questions: [
      {
        id: 'hce_001',
        question: 'How do you drive healthcare system transformation?',
        options: [
          'A) New equipment',
          'B) Redesign delivery models, integrate care, leverage technology, engage patients, improve outcomes',
          'C) Hire more doctors',
          'D) Reduce costs',
        ],
        correctAnswer: 'B',
        explanation: 'Healthcare transformation requires reimagining care delivery systems',
        difficulty: 'hard',
        topics: ['transformation', 'systems', 'leadership'],
      },
      {
        id: 'hce_002',
        question: 'What defines clinical leadership excellence?',
        options: [
          'A) Clinical expertise only',
          'B) Patient outcomes, team development, quality improvement, innovation, strategic influence',
          'C) Research publications',
          'D) Administrative titles',
        ],
        correctAnswer: 'B',
        explanation: 'Clinical leadership extends expertise to systems improvement and influence',
        difficulty: 'hard',
        topics: ['leadership', 'clinical', 'excellence'],
      },
      {
        id: 'hce_003',
        question: 'How do you integrate AI and precision medicine while maintaining humanistic care?',
        options: [
          'A) Reject technology',
          'B) Use technology to enhance not replace human connection, maintain patient-centeredness',
          'C) Fully automate',
          'D) Keep technology separate',
        ],
        correctAnswer: 'B',
        explanation: 'Advanced medicine balances technological capability with human care',
        difficulty: 'hard',
        topics: ['innovation', 'technology', 'care'],
      },
    ],
  },

  // REAL ESTATE - Expert
  {
    skill: 'real-estate',
    level: 'expert',
    questions: [
      {
        id: 'ree_001',
        question: 'How do you build and manage institutional-grade real estate portfolios?',
        options: [
          'A) Buy properties',
          'B) Strategic acquisition, active management, risk diversification, value creation, optimized exits',
          'C) Hold everything long-term',
          'D) Follow market trends',
        ],
        correctAnswer: 'B',
        explanation: 'Institutional portfolios require sophisticated strategy and active management',
        difficulty: 'hard',
        topics: ['investment', 'portfolio', 'strategy'],
      },
      {
        id: 'ree_002',
        question: 'What defines real estate development leadership?',
        options: [
          'A) Completing projects',
          'B) Vision, financial structuring, stakeholder management, risk navigation, value creation',
          'C) Construction knowledge',
          'D) Capital access',
        ],
        correctAnswer: 'B',
        explanation: 'Development leadership orchestrates complex projects from vision to reality',
        difficulty: 'hard',
        topics: ['development', 'leadership', 'complexity'],
      },
      {
        id: 'ree_003',
        question: 'How do you pioneer PropTech innovation in traditional real estate?',
        options: [
          'A) Avoid technology',
          'B) Identify opportunities, test strategically, integrate thoughtfully, measure impact, scale winners',
          'C) Adopt all new tech',
          'D) Wait for others',
        ],
        correctAnswer: 'B',
        explanation: 'PropTech innovation requires strategic experimentation and integration',
        difficulty: 'hard',
        topics: ['innovation', 'technology', 'transformation'],
      },
    ],
  },

  // LOGISTICS - Expert
  {
    skill: 'logistics',
    level: 'expert',
    questions: [
      {
        id: 'loge_001',
        question: 'How do you architect next-generation supply chain networks?',
        options: [
          'A) Lowest cost routes',
          'B) Optimize for resilience, sustainability, flexibility, and cost; leverage technology; enable visibility',
          'C) More warehouses',
          'D) Faster shipping',
        ],
        correctAnswer: 'B',
        explanation: 'Modern supply chains balance multiple strategic objectives',
        difficulty: 'hard',
        topics: ['strategy', 'innovation', 'networks'],
      },
      {
        id: 'loge_002',
        question: 'What defines supply chain leadership excellence?',
        options: [
          'A) Operational expertise',
          'B) Strategic vision, cross-functional influence, innovation drive, risk management, value creation',
          'C) Cost reduction',
          'D) Process knowledge',
        ],
        correctAnswer: 'B',
        explanation: 'Supply chain leadership creates strategic competitive advantage',
        difficulty: 'hard',
        topics: ['leadership', 'strategy', 'excellence'],
      },
      {
        id: 'loge_003',
        question: 'How do you lead sustainable supply chain transformation?',
        options: [
          'A) Carbon offsets',
          'B) Redesign for circularity, green operations, ethical sourcing, measure impact, drive industry change',
          'C) Electric vehicles',
          'D) Recycling programs',
        ],
        correctAnswer: 'B',
        explanation: 'Supply chain sustainability requires fundamental system redesign',
        difficulty: 'hard',
        topics: ['sustainability', 'transformation', 'leadership'],
      },
    ],
  },

  // MANUFACTURING - Expert
  {
    skill: 'manufacturing',
    level: 'expert',
    questions: [
      {
        id: 'mane_001',
        question: 'How do you lead Industry 4.0 transformation?',
        options: [
          'A) Buy robots',
          'B) Develop strategy, integrate technologies, upskill workforce, redesign processes, drive adoption',
          'C) Automate everything',
          'D) Hire consultants',
        ],
        correctAnswer: 'B',
        explanation: 'Digital manufacturing transformation requires holistic strategic leadership',
        difficulty: 'hard',
        topics: ['transformation', 'technology', 'leadership'],
      },
      {
        id: 'mane_002',
        question: 'What defines manufacturing operations excellence?',
        options: [
          'A) Meeting targets',
          'B) World-class quality, cost, delivery; continuous improvement culture; innovation; sustainability',
          'C) High output',
          'D) Low defects',
        ],
        correctAnswer: 'B',
        explanation: 'Operational excellence balances multiple dimensions of performance',
        difficulty: 'hard',
        topics: ['excellence', 'operations', 'culture'],
      },
      {
        id: 'mane_003',
        question: 'How do you build the factory of the future?',
        options: [
          'A) Latest equipment',
          'B) Integrate digital/physical, optimize end-to-end, enable agility, sustain advantage',
          'C) Automation only',
          'D) Green building',
        ],
        correctAnswer: 'B',
        explanation: 'Future factories are digitally integrated, optimized, and agile systems',
        difficulty: 'hard',
        topics: ['innovation', 'future', 'transformation'],
      },
    ],
  },

  // HOSPITALITY - Expert
  {
    skill: 'hospitality',
    level: 'expert',
    questions: [
      {
        id: 'hospe_001',
        question: 'How do you create iconic hospitality experiences that define luxury?',
        options: [
          'A) Expensive amenities',
          'B) Craft meaningful moments, anticipate unstated needs, deliver flawlessly, create emotional connection',
          'C) High prices',
          'D) Famous brand',
        ],
        correctAnswer: 'B',
        explanation: 'True luxury is defined by exceptional experience and emotional resonance',
        difficulty: 'hard',
        topics: ['luxury', 'experience', 'excellence'],
      },
      {
        id: 'hospe_002',
        question: 'What defines hospitality industry leadership?',
        options: [
          'A) Operations management',
          'B) Vision, brand building, talent development, financial acumen, guest experience obsession',
          'C) Long career',
          'D) Property ownership',
        ],
        correctAnswer: 'B',
        explanation: 'Hospitality leadership balances operational excellence with strategic vision',
        difficulty: 'hard',
        topics: ['leadership', 'excellence', 'vision'],
      },
      {
        id: 'hospe_003',
        question: 'How do you pioneer sustainable hospitality innovation?',
        options: [
          'A) Towel reuse programs',
          'B) Reimagine operations, reduce environmental impact, enhance communities, maintain profitability',
          'C) Solar panels',
          'D) Local food sourcing',
        ],
        correctAnswer: 'B',
        explanation: 'Hospitality sustainability requires comprehensive operational transformation',
        difficulty: 'hard',
        topics: ['sustainability', 'innovation', 'transformation'],
      },
    ],
  },

  // BEAUTY & WELLNESS - Expert
  {
    skill: 'beauty-wellness',
    level: 'expert',
    questions: [
      {
        id: 'bwe_001',
        question: 'How do you build a beauty empire from individual practice?',
        options: [
          'A) Open more locations',
          'B) Develop brand, create systems, build team, diversify revenue, scale strategically',
          'C) Work more hours',
          'D) Lower prices',
        ],
        correctAnswer: 'B',
        explanation: 'Scalable beauty businesses require strategic planning and systematization',
        difficulty: 'hard',
        topics: ['business', 'scaling', 'strategy'],
      },
      {
        id: 'bwe_002',
        question: 'What drives innovation in beauty and wellness services?',
        options: [
          'A) Following trends',
          'B) Understanding deeper needs, leveraging technology, pioneering techniques, creating experiences',
          'C) New products',
          'D) Marketing campaigns',
        ],
        correctAnswer: 'B',
        explanation: 'Beauty innovation combines technology, technique, and customer understanding',
        difficulty: 'hard',
        topics: ['innovation', 'trends', 'customer-experience'],
      },
      {
        id: 'bwe_003',
        question: 'How do you establish thought leadership in the beauty industry?',
        options: [
          'A) Social media followers',
          'B) Master techniques, educate industry, publish content, influence trends, mentor professionals',
          'C) Celebrity clients',
          'D) Competition wins',
        ],
        correctAnswer: 'B',
        explanation: 'Industry leadership comes from expertise, education, and influence',
        difficulty: 'hard',
        topics: ['leadership', 'influence', 'education'],
      },
    ],
  },

  // FITNESS - Expert
  {
    skill: 'fitness',
    level: 'expert',
    questions: [
      {
        id: 'fite_001',
        question: 'How do you create transformational fitness programs that change lives?',
        options: [
          'A) Hard workouts',
          'B) Address whole person, build sustainable habits, create support systems, empower long-term success',
          'C) Strict diets',
          'D) Daily training',
        ],
        correctAnswer: 'B',
        explanation: 'True transformation addresses physical, mental, and lifestyle factors',
        difficulty: 'hard',
        topics: ['transformation', 'coaching', 'holistic'],
      },
      {
        id: 'fite_002',
        question: 'What defines fitness industry leadership?',
        options: [
          'A) Personal training success',
          'B) Building businesses, developing trainers, influencing industry, innovating approaches',
          'C) Competition wins',
          'D) Social media presence',
        ],
        correctAnswer: 'B',
        explanation: 'Industry leadership extends impact beyond individual client success',
        difficulty: 'hard',
        topics: ['leadership', 'industry', 'influence'],
      },
      {
        id: 'fite_003',
        question: 'How do you integrate emerging fitness technologies and methodologies?',
        options: [
          'A) Try everything new',
          'B) Evaluate evidence, test strategically, integrate thoughtfully, maintain fundamentals',
          'C) Reject innovation',
          'D) Follow fitness influencers',
        ],
        correctAnswer: 'B',
        explanation: 'Innovation should enhance rather than replace proven principles',
        difficulty: 'hard',
        topics: ['innovation', 'technology', 'methodology'],
      },
    ],
  },

  // PHOTOGRAPHY - Expert
  {
    skill: 'photography',
    level: 'expert',
    questions: [
      {
        id: 'phote_001',
        question: 'How do you create photography that influences visual culture?',
        options: [
          'A) Expensive equipment',
          'B) Develop unique voice, challenge conventions, tell compelling stories, exhibit widely',
          'C) Social media presence',
          'D) Commercial success',
        ],
        correctAnswer: 'B',
        explanation: 'Cultural influence comes from distinctive vision and meaningful work',
        difficulty: 'hard',
        topics: ['artistry', 'influence', 'culture'],
      },
      {
        id: 'phote_002',
        question: 'What defines photographic mastery?',
        options: [
          'A) Technical perfection',
          'B) Vision, technical excellence, storytelling, emotional impact, consistent excellence',
          'C) Award wins',
          'D) Expensive gear',
        ],
        correctAnswer: 'B',
        explanation: 'Mastery combines technical skill with artistic vision and impact',
        difficulty: 'hard',
        topics: ['mastery', 'excellence', 'artistry'],
      },
      {
        id: 'phote_003',
        question: 'How do you build a sustainable photography career in changing markets?',
        options: [
          'A) Specialize narrowly',
          'B) Diversify offerings, adapt to technology, build brand, maintain quality, develop business acumen',
          'C) Compete on price',
          'D) Chase trends',
        ],
        correctAnswer: 'B',
        explanation: 'Sustainable careers balance artistic vision with business adaptability',
        difficulty: 'hard',
        topics: ['career', 'business', 'sustainability'],
      },
    ],
  },
];

// Export by skill category for easy access
export const questionBanksBySkill = allQuestionBanks.reduce((acc, bank) => {
  const key = `${bank.skill}-${bank.level}`;
  acc[key] = bank;
  return acc;
}, {} as Record<string, QuestionBank>);

// Get questions for specific skill and level
export function getQuestionBank(skill: string, level: string): QuestionBank | undefined {
  return questionBanksBySkill[`${skill}-${level}`];
}

// Get random questions from a bank
export function getRandomQuestions(bank: QuestionBank, count: number = 10) {
  const shuffled = [...bank.questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Export list of all skills
export const ALL_SKILLS = [
  'digital-marketing',
  'web-development',
  'graphic-design',
  'writing-translation',
  'video-animation',
  'music-audio',
  'business',
  'data-entry',
  'customer-service',
  'sales-marketing',
  'engineering',
  'architecture',
  'legal',
  'accounting',
  'hr',
  'consulting',
  'education',
  'healthcare',
  'real-estate',
  'logistics',
  'manufacturing',
  'hospitality',
  'beauty-wellness',
  'fitness',
  'photography',
];

export const ALL_LEVELS = ['foundation', 'intermediate', 'advanced', 'expert'];
