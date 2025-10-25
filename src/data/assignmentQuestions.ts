import { QuestionBank, SkillCategory, AssignmentLevel } from '@/types/assignments';

// Digital Marketing - Foundation Level Questions
export const digitalMarketingFoundationQuestions: QuestionBank = {
    skill: 'digital-marketing',
    level: 'foundation',
    questions: [
        {
            id: 'dmf_q001',
            question: 'What is a Call-to-Action (CTA)?',
            options: [
                'A) A metric measuring website traffic',
                'B) A button or link encouraging users to take action',
                'C) A type of social media post',
                'D) An email marketing template',
            ],
            correctAnswer: 'B',
            explanation:
                'A CTA is designed to prompt an immediate response or encourage an action such as "Buy Now," "Sign Up," or "Learn More." CTAs are crucial for conversion optimization in digital marketing campaigns.',
            difficulty: 'easy',
            topics: ['basics', 'conversion'],
            learningResources: [
                {
                    title: 'CTA Best Practices',
                    url: 'https://example.com/cta-guide',
                },
            ],
        },
        {
            id: 'dmf_q002',
            question: 'What does SEO stand for?',
            options: [
                'A) Social Engine Optimization',
                'B) Search Engine Optimization',
                'C) Sales Enhancement Online',
                'D) System Error Override',
            ],
            correctAnswer: 'B',
            explanation:
                'SEO (Search Engine Optimization) is the practice of improving a website\'s visibility in organic (non-paid) search engine results. It involves optimizing content, technical elements, and earning backlinks to rank higher on search engines like Google.',
            difficulty: 'easy',
            topics: ['seo', 'basics'],
        },
        {
            id: 'dmf_q003',
            question: 'What is the primary goal of Search Engine Optimization (SEO)?',
            options: [
                'A) Increase social media followers',
                'B) Improve website ranking in organic search results',
                'C) Create paid advertisement campaigns',
                'D) Design visually appealing website layouts',
            ],
            correctAnswer: 'B',
            explanation:
                'SEO focuses on improving a website\'s visibility in organic (non-paid) search engine results. While social media can support SEO efforts, the primary goal is achieving higher rankings on search engines like Google to drive organic traffic.',
            difficulty: 'easy',
            topics: ['seo', 'fundamentals'],
        },
        {
            id: 'dmf_q004',
            question: 'What does CTR stand for in digital marketing?',
            options: [
                'A) Click Through Rate',
                'B) Cost To Reach',
                'C) Customer Target Rating',
                'D) Content Type Ratio',
            ],
            correctAnswer: 'A',
            explanation:
                'CTR (Click Through Rate) is a metric that measures the percentage of people who click on a link, ad, or CTA compared to the total number of people who view it. It\'s calculated as: (Clicks ÷ Impressions) × 100.',
            difficulty: 'easy',
            topics: ['metrics', 'analytics'],
        },
        {
            id: 'dmf_q005',
            question: 'Which platform is typically best for B2B (business-to-business) marketing?',
            options: [
                'A) TikTok',
                'B) Instagram',
                'C) LinkedIn',
                'D) Snapchat',
            ],
            correctAnswer: 'C',
            explanation:
                'LinkedIn is the premier professional networking platform and is most effective for B2B marketing. It allows businesses to connect with decision-makers, share industry insights, and build professional relationships.',
            difficulty: 'easy',
            topics: ['social-media', 'b2b'],
        },
        {
            id: 'dmf_q006',
            question: 'What is email marketing primarily used for?',
            options: [
                'A) Only sending spam',
                'B) Building and nurturing customer relationships',
                'C) Replacing social media',
                'D) Creating website designs',
            ],
            correctAnswer: 'B',
            explanation:
                'Email marketing is a powerful tool for building and nurturing customer relationships. It allows businesses to communicate directly with their audience, share valuable content, promote products, and maintain engagement over time.',
            difficulty: 'easy',
            topics: ['email-marketing', 'customer-relationship'],
        },
        {
            id: 'dmf_q007',
            question: 'What does "organic reach" mean in social media marketing?',
            options: [
                'A) Reach achieved through paid advertisements',
                'B) Reach from followers who eat organic food',
                'C) Reach achieved without paid promotion',
                'D) Reach only on Instagram',
            ],
            correctAnswer: 'C',
            explanation:
                'Organic reach refers to the number of people who see your content without paid promotion. This includes views from your followers and people who discover your content through shares, hashtags, or the platform\'s algorithm.',
            difficulty: 'easy',
            topics: ['social-media', 'terminology'],
        },
        {
            id: 'dmf_q008',
            question: 'What is a "conversion" in digital marketing?',
            options: [
                'A) Changing your marketing strategy',
                'B) When a user completes a desired action',
                'C) Converting files to different formats',
                'D) Talking to customers face-to-face',
            ],
            correctAnswer: 'B',
            explanation:
                'A conversion occurs when a user completes a desired action that you\'ve defined as valuable, such as making a purchase, signing up for a newsletter, downloading a resource, or filling out a contact form.',
            difficulty: 'easy',
            topics: ['conversion', 'metrics'],
        },
        {
            id: 'dmf_q009',
            question: 'What is "content marketing"?',
            options: [
                'A) Only creating blog posts',
                'B) Creating and distributing valuable content to attract and engage an audience',
                'C) Copying content from competitors',
                'D) Only using paid advertisements',
            ],
            correctAnswer: 'B',
            explanation:
                'Content marketing is a strategic approach focused on creating and distributing valuable, relevant, and consistent content to attract and retain a clearly defined audience. It includes blogs, videos, infographics, podcasts, and more.',
            difficulty: 'easy',
            topics: ['content-marketing', 'strategy'],
        },
        {
            id: 'dmf_q010',
            question: 'What is Google Analytics used for?',
            options: [
                'A) Creating advertisements',
                'B) Tracking and analyzing website traffic and user behavior',
                'C) Designing websites',
                'D) Sending emails',
            ],
            correctAnswer: 'B',
            explanation:
                'Google Analytics is a web analytics tool that tracks and reports website traffic. It provides insights into user behavior, traffic sources, conversion rates, and many other metrics essential for digital marketing decisions.',
            difficulty: 'easy',
            topics: ['analytics', 'tools'],
        },
        {
            id: 'dmf_q011',
            question: 'What does PPC stand for?',
            options: [
                'A) Pay Per Click',
                'B) People Per Campaign',
                'C) Post Per Customer',
                'D) Page Per Content',
            ],
            correctAnswer: 'A',
            explanation:
                'PPC (Pay Per Click) is an online advertising model where advertisers pay a fee each time their ad is clicked. It\'s a way to buy visits to your site rather than earning them organically. Google Ads is the most popular PPC platform.',
            difficulty: 'easy',
            topics: ['paid-advertising', 'terminology'],
        },
        {
            id: 'dmf_q012',
            question: 'What is a "landing page"?',
            options: [
                'A) The homepage of a website',
                'B) A standalone page designed for a specific marketing campaign',
                'C) The last page a user visits before leaving',
                'D) A page where airplanes land',
            ],
            correctAnswer: 'B',
            explanation:
                'A landing page is a standalone web page created specifically for a marketing or advertising campaign. It\'s where visitors "land" after clicking on a link in an email, ad, or other digital location. Landing pages are designed to convert visitors into leads or customers.',
            difficulty: 'easy',
            topics: ['conversion', 'web-design'],
        },
        {
            id: 'dmf_q013',
            question: 'What is "A/B testing"?',
            options: [
                'A) Testing two different school grades',
                'B) Comparing two versions of something to see which performs better',
                'C) Testing only on weekends',
                'D) A type of blood test',
            ],
            correctAnswer: 'B',
            explanation:
                'A/B testing (also called split testing) is the practice of comparing two versions of a webpage, email, ad, or other marketing asset to determine which one performs better. It helps marketers make data-driven decisions.',
            difficulty: 'easy',
            topics: ['testing', 'optimization'],
        },
        {
            id: 'dmf_q014',
            question: 'What is "influencer marketing"?',
            options: [
                'A) Marketing only to wealthy people',
                'B) Partnering with influential people to promote products or services',
                'C) Influencing search engine algorithms',
                'D) Marketing during flu season',
            ],
            correctAnswer: 'B',
            explanation:
                'Influencer marketing involves collaborating with influential people (influencers) who have a dedicated social following to promote your products or services. Influencers can help brands reach their target audience through authentic recommendations.',
            difficulty: 'easy',
            topics: ['social-media', 'influencer'],
        },
        {
            id: 'dmf_q015',
            question: 'What is "remarketing" or "retargeting"?',
            options: [
                'A) Changing your target market completely',
                'B) Showing ads to people who have previously visited your website',
                'C) Returning products to the market',
                'D) Marketing only to new customers',
            ],
            correctAnswer: 'B',
            explanation:
                'Remarketing (or retargeting) is a digital advertising strategy that shows ads to people who have previously interacted with your website or app. It helps keep your brand top-of-mind and encourages visitors to return and complete a conversion.',
            difficulty: 'easy',
            topics: ['paid-advertising', 'strategy'],
        },
        {
            id: 'dmf_q016',
            question: 'What is a "hashtag" used for in social media?',
            options: [
                'A) To confuse people',
                'B) To categorize content and make it discoverable',
                'C) Only for decoration',
                'D) To count numbers',
            ],
            correctAnswer: 'B',
            explanation:
                'A hashtag (#) is used to categorize content and make it more discoverable on social media platforms. When users search for or click on a hashtag, they can see all posts tagged with it, increasing content visibility.',
            difficulty: 'easy',
            topics: ['social-media', 'basics'],
        },
        {
            id: 'dmf_q017',
            question: 'What is "viral marketing"?',
            options: [
                'A) Marketing during a pandemic only',
                'B) Marketing strategies that encourage people to share content rapidly',
                'C) Computer virus protection',
                'D) Marketing healthcare products',
            ],
            correctAnswer: 'B',
            explanation:
                'Viral marketing refers to marketing strategies that encourage people to share content rapidly, spreading brand awareness like a virus. When content goes "viral," it reaches a massive audience through organic sharing.',
            difficulty: 'easy',
            topics: ['social-media', 'strategy'],
        },
        {
            id: 'dmf_q018',
            question: 'What is "bounce rate"?',
            options: [
                'A) The rate at which emails bounce back',
                'B) The percentage of visitors who leave a site after viewing only one page',
                'C) How many times a website crashes',
                'D) The speed of a website',
            ],
            correctAnswer: 'B',
            explanation:
                'Bounce rate is the percentage of visitors who navigate away from a website after viewing only one page. A high bounce rate often indicates that the landing page isn\'t relevant or engaging enough for visitors.',
            difficulty: 'easy',
            topics: ['analytics', 'metrics'],
        },
        {
            id: 'dmf_q019',
            question: 'What is "lead generation"?',
            options: [
                'A) Creating leadership programs',
                'B) The process of attracting and converting prospects into potential customers',
                'C) Mining for lead metal',
                'D) Generating electricity',
            ],
            correctAnswer: 'B',
            explanation:
                'Lead generation is the process of attracting and converting strangers and prospects into someone who has indicated interest in your company\'s product or service. Common tactics include content marketing, landing pages, and webinars.',
            difficulty: 'easy',
            topics: ['conversion', 'strategy'],
        },
        {
            id: 'dmf_q020',
            question: 'What is "ROI" in marketing?',
            options: [
                'A) Return On Investment',
                'B) Rate Of Interest',
                'C) Region Of Influence',
                'D) Range Of Items',
            ],
            correctAnswer: 'A',
            explanation:
                'ROI (Return On Investment) is a metric used to evaluate the profitability of an investment. In marketing, it measures the revenue generated from marketing activities compared to the cost of those activities.',
            difficulty: 'easy',
            topics: ['metrics', 'analytics'],
        },
        {
            id: 'dmf_q021',
            question: 'What is "user-generated content" (UGC)?',
            options: [
                'A) Content created by the marketing team',
                'B) Content created by customers or users',
                'C) Content generated by AI',
                'D) Content stolen from competitors',
            ],
            correctAnswer: 'B',
            explanation:
                'User-Generated Content (UGC) is any content—such as photos, videos, reviews, or testimonials—created by customers or users rather than the brand itself. UGC builds authenticity and trust.',
            difficulty: 'easy',
            topics: ['content-marketing', 'social-media'],
        },
        {
            id: 'dmf_q022',
            question: 'What is "engagement rate"?',
            options: [
                'A) The rate at which people get married',
                'B) A metric measuring how people interact with your content',
                'C) The speed of internet connection',
                'D) The rate of customer complaints',
            ],
            correctAnswer: 'B',
            explanation:
                'Engagement rate measures how people interact with your content through likes, comments, shares, clicks, and other actions. It indicates how well your content resonates with your audience.',
            difficulty: 'easy',
            topics: ['social-media', 'metrics'],
        },
        {
            id: 'dmf_q023',
            question: 'What is "brand awareness"?',
            options: [
                'A) Knowing about different brands of products',
                'B) The extent to which consumers are familiar with a brand',
                'C) Brand insurance policies',
                'D) Warning labels on products',
            ],
            correctAnswer: 'B',
            explanation:
                'Brand awareness is the extent to which consumers are familiar with and can recognize a brand. Higher brand awareness typically leads to increased trust, consideration, and sales.',
            difficulty: 'easy',
            topics: ['branding', 'strategy'],
        },
        {
            id: 'dmf_q024',
            question: 'What is "conversion rate"?',
            options: [
                'A) The speed at which currency exchanges',
                'B) The percentage of visitors who complete a desired action',
                'C) The rate of religious conversions',
                'D) How fast a website loads',
            ],
            correctAnswer: 'B',
            explanation:
                'Conversion rate is the percentage of visitors who complete a desired action (conversion) out of the total number of visitors. For example, if 100 people visit your site and 5 make a purchase, your conversion rate is 5%.',
            difficulty: 'easy',
            topics: ['conversion', 'metrics'],
        },
        {
            id: 'dmf_q025',
            question: 'What is a "buyer persona"?',
            options: [
                'A) A person who buys everything',
                'B) A semi-fictional representation of your ideal customer',
                'C) A famous shopper',
                'D) A shopping list',
            ],
            correctAnswer: 'B',
            explanation:
                'A buyer persona is a semi-fictional representation of your ideal customer based on market research and real data about your existing customers. It includes demographics, behavior patterns, motivations, and goals.',
            difficulty: 'easy',
            topics: ['strategy', 'targeting'],
        },
    ],
};

// Export all question banks
export const questionBanks: QuestionBank[] = [
    digitalMarketingFoundationQuestions,
    // More question banks would be added here for other levels and skills
];

// Helper function to get questions for a specific skill and level
export function getQuestionBank(
    skill: SkillCategory,
    level: AssignmentLevel
): QuestionBank | undefined {
    return questionBanks.find(
        (bank) => bank.skill === skill && bank.level === level
    );
}

// Helper function to get random questions from a bank
export function getRandomQuestions(
    bank: QuestionBank,
    count: number
): QuestionBank['questions'] {
    const shuffled = [...bank.questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Helper function to shuffle answer options
export function shuffleOptions(options: string[]): string[] {
    return [...options].sort(() => Math.random() - 0.5);
}
