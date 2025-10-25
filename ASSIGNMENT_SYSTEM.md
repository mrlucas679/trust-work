# Assignment System Documentation

## Overview

The Assignment/Certification System is a comprehensive skill validation platform that allows workers to prove their expertise in various skills through timed assessments. The system is fully integrated into the TrustWork platform with anti-cheating measures, a credit-based economy, and profile integration.

## Features Implemented

### 1. **Three Skill Categories**

- **Digital Marketing** - SEO, content marketing, social media, analytics
- **Graphic Design** - Design principles, tools, visual communication
- **Content Writing** - Grammar, storytelling, research, editing

### 2. **Four Certification Levels Per Skill**

Each skill has 4 progressive levels:

- **Foundation** - Entry-level certification (0 gigs required, 5 AC cost)
- **Developer** - Intermediate certification (5 gigs required, 10 AC cost)
- **Advanced** - Advanced certification (10 gigs required, 15 AC cost)
- **Expert** - Master-level certification (15 gigs required, 20 AC cost)

### 3. **Credit System (AC - Assignment Credits)**

- Workers earn 5 AC for every gig completed
- Credits required to take assignments:
  - Foundation: 5 AC
  - Developer: 10 AC
  - Advanced: 15 AC
  - Expert: 20 AC
- Current mock user has **45 AC** (7 gigs completed × 5 AC + 10 bonus)

### 4. **Voucher System**

- **Excellence Bonus**: Scoring 85%+ on any assignment earns a 10% discount voucher
- Vouchers can be used for future assignments
- Example: With a 10% voucher, Developer level costs 9 AC instead of 10 AC
- Mock user has **1 voucher available**

### 5. **Assignment Dashboard** (`/assignments`)

Complete certification hub showing:

- All 3 skills with 4 levels each (12 total certifications)
- Status indicators:
  - ✅ **Passed** - Green with score and completion date
  - ❌ **Failed** - Red with last attempt info
  - 🔓 **Unlocked** - White, ready to attempt
  - 🔒 **Locked** - Gray, requirements not met
- Credit balance and gig count
- Voucher inventory with discount calculations
- Credit earning guide (expandable)
- "Start Assignment" buttons for unlocked levels

### 6. **Pre-Assignment Warning Screen**

Critical rules modal before starting:

1. 40-minute time limit (auto-submit at 0:00)
2. No tab switching (instant failure if detected)
3. No external resources allowed
4. Single attempt per day (24-hour cooldown)
5. 70% passing score required
6. Non-refundable credits

Additional info shown:

- Number of questions (20)
- Time allowed (40 minutes)
- Passing score (70%)
- Cost (5-20 AC depending on level)
- Preparation tips

Must check "I understand and agree" before proceeding.

### 7. **Quiz Interface** (Anti-Cheat Enabled)

Full-screen distraction-free experience with:

**Timer Features:**

- Live countdown from 40:00 to 0:00
- Yellow warning at 5 minutes remaining
- Red critical warning at 5 minutes
- Auto-submit when time reaches 0:00

**Navigation:**

- Previous/Next buttons
- Question progress indicator (e.g., "Question 5 of 20")
- Clickable question grid showing answered status
- Current question highlighted in grid

**Anti-Cheat Security:**

1. **Tab Switch Detection** - `visibilitychange` listener
2. **Window Switch Detection** - `blur` event listener
3. **Browser Back Button Disabled** - `history.pushState` manipulation
4. **Context Menu Disabled** - Right-click prevented
5. **Text Selection Disabled** - Copy prevention
6. **Auto-Fail Trigger** - Any violation = instant failure

**Answer Selection:**

- Radio button interface (A, B, C, D options)
- Visual feedback on selected answer
- Can change answers before submission

**Review Modal:**

- Shows all 20 questions with answered/unanswered status
- Question grid allows jumping to specific questions
- Displays number of unanswered questions
- Warning if submitting with unanswered questions

### 8. **Results Screen**

Three result scenarios:

**A) Failed - Cheating Detected**

- Red XCircle icon
- "Assignment Failed" title
- Reason displayed (e.g., "Tab switching detected")
- Score: 0%
- Time taken shown
- Buttons: Return to Dashboard / Try Again (if eligible)

**B) Passed**

- Gold Trophy icon
- Confetti animation 🎉 (if score ≥ 85%)
- "Congratulations! Assignment Passed!" title
- Score displayed prominently
- Time taken
- Performance summary with stats
- **Excellence Bonus Alert** if score ≥ 85% (10% voucher earned)
- Buttons: View Detailed Results / Return to Dashboard

**C) Failed - Low Score**

- Orange AlertCircle icon
- "Assignment Not Passed" title
- Score shown (under 70%)
- Time taken
- Performance summary
- Encouragement message
- Buttons: View Detailed Results / Return to Dashboard

### 9. **Detailed Results Screen**

Question-by-question review:

- Each question displayed in full
- User's answer highlighted
- Correct answer shown with green indicator
- ❌ or ✅ icon per question
- Explanation text for each question
- Learning resources (links to guides/tutorials)
- Performance summary at bottom:
  - Correct answers count
  - Incorrect answers count
  - Topics to improve (extracted from incorrect answers)
- "Return to Dashboard" button

### 10. **Profile Integration**

New `CertificationDisplay` component shows:

**For Own Profile:**

- "My Certifications" title
- Stats: Gigs completed (7/12) and Assignment Credits (45 AC)
- All 3 skills with progress bars
- Each level shows:
  - Status icon (✅ passed, ❌ failed, 🔒 locked)
  - Best score if attempted
  - Last attempt date
  - Retake availability info
- "Take More Assignments" button

**For Public Profile:**

- "Verified Skills & Certifications" title
- Skills with highest level badge (e.g., "Developer Level")
- Progress bars showing completion
- Each level with pass/fail status
- Skill interpretation text (e.g., "Proficient in intermediate concepts")

### 11. **Routing Configuration**

All routes added to `App.tsx`:

- `/assignments` - Dashboard (with layout)
- `/assignments/:skill/:level/warning` - Warning screen (no layout)
- `/assignments/:skill/:level/take` - Quiz interface (no layout, fullscreen)
- `/assignments/:skill/:level/results` - Results screen (no layout)
- `/assignments/:skill/:level/detailed-results` - Detailed review (with layout)

### 12. **Navigation Entry Point**

Sidebar menu includes:

- "Assignments" link with ClipboardList icon
- Badge showing "0" (new assignments available)

## File Structure

```
src/
├── types/
│   └── assignments.ts                    # Type definitions
├── data/
│   ├── assignmentQuestions.ts             # Question banks
│   └── mockAssignmentData.ts              # Mock user data & helpers
├── pages/
│   ├── AssignmentDashboard.tsx            # Main hub (/assignments)
│   ├── AssignmentWarning.tsx              # Pre-quiz modal
│   ├── AssignmentQuiz.tsx                 # Quiz interface (anti-cheat)
│   ├── AssignmentResults.tsx              # Pass/fail results
│   └── AssignmentDetailedResults.tsx      # Question review
├── components/
│   └── certifications/
│       └── CertificationDisplay.tsx       # Profile component
└── App.tsx                                # Routing
```

## Question Bank Status

### ✅ Completed

- **Digital Marketing - Foundation** (25 questions)

### ❌ Remaining (11 question banks needed)

- Digital Marketing - Developer (0/25)
- Digital Marketing - Advanced (0/25)
- Digital Marketing - Expert (0/25)
- Graphic Design - Foundation (0/25)
- Graphic Design - Developer (0/25)
- Graphic Design - Advanced (0/25)
- Graphic Design - Expert (0/25)
- Content Writing - Foundation (0/25)
- Content Writing - Developer (0/25)
- Content Writing - Advanced (0/25)
- Content Writing - Expert (0/25)

## Mock Data

Current `mockUserAssignmentProfile`:

- **Gigs Completed**: 7
- **Assignment Credits**: 45 AC
- **Vouchers**: 1 (10% discount)
- **Assignment History**: 5 attempts across 3 skills
  1. Digital Marketing Foundation - Passed 88% (June 2024)
  2. Graphic Design Foundation - Passed 75% (July 2024)
  3. Digital Marketing Developer - Failed 65% (Aug 2024)
  4. Content Writing Foundation - Passed 92% (Sept 2024)
  5. Digital Marketing Developer - Passed 78% (Oct 2024)

## Testing Flow

### Happy Path

1. Navigate to `/assignments` from sidebar
2. View dashboard with all skills/levels
3. Click "Start Assignment" on Foundation level (costs 5 AC)
4. Read warning screen, check agreement box, click "I Understand, Start Assignment"
5. Complete 20 questions within 40 minutes
6. Click "Review Answers" to see progress
7. Click "Submit Assignment"
8. View results (pass if ≥ 70%, excellence bonus if ≥ 85%)
9. View detailed results with explanations
10. See certification on profile page

### Anti-Cheat Test

1. Start any assignment
2. Switch tabs (e.g., open new tab)
3. See "ASSIGNMENT TERMINATED" alert
4. Auto-redirect to failed results after 2 seconds
5. Results show "Tab switching detected"

### Time-Out Test

1. Start assignment
2. Wait until timer reaches 0:00 (or manually set timeRemaining to 1)
3. See auto-submit trigger
4. Results show as "Auto-submitted"

## Design System Consistency

All components use existing TrustWork design tokens:

- **Colors**: `success`, `destructive`, `warning`, `primary`, `muted`
- **Components**: Card, Button, Badge, Alert, Progress, RadioGroup, Checkbox, Dialog
- **Icons**: lucide-react library
- **Layout**: Consistent padding, borders, shadows
- **Animations**: Smooth transitions, confetti on excellence

## Technologies Used

- **React 18** with TypeScript
- **React Router v6** for navigation
- **shadcn/ui** components (Radix primitives)
- **Tailwind CSS** for styling
- **canvas-confetti** for celebration animations
- **lucide-react** for icons

## Future Enhancements (Backend Required)

These were intentionally not implemented (frontend-only focus):

1. API endpoints for assignment submissions
2. Real-time score calculations on server
3. Credit deduction transactions
4. Voucher generation and redemption
5. Assignment attempt history storage
6. Certificate PDF generation
7. Email notifications for pass/fail
8. Admin dashboard for question management
9. Analytics and reporting
10. Fraud detection algorithms

## Known Limitations

1. Only Digital Marketing Foundation questions exist (24 more question banks needed)
2. Mock data is hardcoded (no persistence)
3. Timer continues even after component unmount (needs cleanup)
4. Tab detection may not work in all browsers
5. No question randomization per attempt (same questions shown)
6. No difficulty progression within levels
7. No partial credit for similar answers
8. No accessibility features (screen reader support, keyboard-only navigation)

## Summary

✅ **Complete Frontend Implementation** with 8 major components, full routing, anti-cheat security, credit system, voucher economy, profile integration, and design system consistency. Ready for testing and backend integration.

🎯 **Next Steps**: Create remaining 11 question banks, integrate with backend API, add accessibility features, and test across browsers.
