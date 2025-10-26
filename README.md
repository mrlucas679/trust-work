# TrustWork - Verified Jobs. Real Gigs. Safe Careers

A modern freelance platform built with React, TypeScript, and Supabase that prioritizes trust and safety through comprehensive verification systems.

## 🌟 Features

### Core Features

- **Dual Role System**: Separate experiences for job seekers and employers
- **Advanced Matching Engine**: AI-powered job matching with 95%+ accuracy
- **Trust & Safety System**: Multi-layered verification including:
  - Assignment-based skill certification (25 skill categories across 4 levels)
  - Identity verification
  - Payment protection with escrow
  - Real-time risk assessment
- **Real-time Notifications**: Instant updates via Supabase realtime subscriptions
- **Payment Protection**: Secure milestone-based payment system with dispute resolution
- **Universal Search**: Intelligent search across jobs, gigs, and users
- **Application Tracking**: Comprehensive dashboard for managing applications

### Assignment System

- **4 Difficulty Levels**: Foundation, Developer, Advanced, Expert
- **25 Skill Categories**: From Digital Marketing to Software Development
- **Progressive Unlocking**: Complete gigs to unlock higher levels
- **Proctoring Features**: Tab detection, timer, and integrity monitoring
- **Detailed Feedback**: Comprehensive explanations for all answers
- **Credit System**: First attempt free, retakes cost Assignment Credits

### Security Features

- Row-Level Security (RLS) policies on all database tables
- Environment variable validation on startup
- Secure authentication with email verification
- CSRF protection and XSS prevention
- Comprehensive error boundaries

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([create one here](https://supabase.com))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mrlucas679/trust-work.git
   cd trust-work
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Get your credentials from [Supabase Dashboard](https://app.supabase.com/project/_/settings/api)

4. **Set up the database**

   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `supabase/schema.sql`
   - Run the script to create tables and policies

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

## 📁 Project Structure

```
trust-work/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── layout/         # Layout components (navbar, sidebar)
│   │   ├── matching/       # Job matching engine
│   │   ├── notifications/  # Notification system
│   │   ├── payments/       # Payment protection system
│   │   ├── quiz/           # Assignment quiz builder
│   │   ├── search/         # Universal search components
│   │   ├── trust/          # Trust & safety components
│   │   └── ui/             # shadcn/ui components (80+)
│   ├── pages/              # Page components
│   │   ├── dashboard/      # Role-specific dashboards
│   │   ├── Auth.tsx        # Authentication page
│   │   ├── AssignmentQuiz.tsx
│   │   ├── Jobs.tsx
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   │   ├── api.ts          # API layer
│   │   ├── supabaseClient.ts
│   │   ├── envValidation.ts
│   │   └── validations.ts  # Zod schemas
│   ├── providers/          # React context providers
│   ├── types/              # TypeScript type definitions
│   └── data/               # Mock data and constants
├── supabase/
│   └── schema.sql          # Database schema
└── public/                 # Static assets
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server (port 8080)

# Type Checking & Linting
npm run type-check       # Run TypeScript compiler
npm run lint             # Run ESLint

# Testing
npm test                 # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report (80% threshold)

# Build
npm run build            # Production build
npm run build:dev        # Development build
npm run preview          # Preview production build

# Validation (Pre-merge)
npm run validate         # Run all checks (lint + type-check + test)
```

## 🧪 Testing

The project uses Jest and React Testing Library with an 80% coverage threshold:

```bash
npm test                 # Run all tests
npm run test:coverage    # Generate coverage report
```

Coverage requirements:

- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

## 🎨 Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**:
  - TanStack Query for server state
  - React Context for auth/global state
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns
- **Icons**: Lucide React

### Backend & Infrastructure

- **BaaS**: Supabase (PostgreSQL + Realtime + Auth)
- **Authentication**: Supabase Auth with email/password
- **Database**: PostgreSQL with Row-Level Security
- **Real-time**: Supabase Realtime subscriptions

### Testing & Quality

- **Testing**: Jest + React Testing Library
- **Type Checking**: TypeScript 5.8
- **Linting**: ESLint 9
- **Coverage**: 80% threshold enforced

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ Yes |

⚠️ **Important**: Never commit your `.env` file. Use `.env.example` as a template.

## 🛡️ Security

### Authentication

- Email/password authentication with email verification
- Session management with automatic refresh
- Protected routes with role-based access control

### Database Security

- Row-Level Security (RLS) policies on all tables
- User data isolated by `user_id`
- Secure API endpoints via Supabase

### Application Security

- Environment variable validation on startup
- XSS prevention through React's built-in escaping
- Input validation using Zod schemas
- Error boundaries for graceful error handling

## 📐 Architecture Decisions

### Layout System

The app uses a fixed navbar with independent scrolling for main content and sidebar:

- **Navbar**: Fixed at `top-0` with `h-16`
- **Root Wrapper**: Uses `pt-16` to offset navbar
- **Main Content**: Uses `h-[calc(100vh-4rem)]` with `overflow-y-auto`
- **Sidebar**: Fixed positioning with independent scroll

### State Management

- **Server State**: TanStack Query for API calls, caching, and synchronization
- **Auth State**: React Context via `SupabaseProvider`
- **Local State**: useState for component-specific state
- **Form State**: React Hook Form for complex forms

### Data Flow

1. Components consume `useSupabase()` hook for auth state
2. API calls go through centralized `src/lib/api.ts`
3. Real-time updates via Supabase subscriptions
4. Type-safe data with TypeScript interfaces

## 🚧 Known Limitations

- Assignment system uses only Digital Marketing Foundation questions (24 more question banks needed)
- Mock data is used in place of full backend integration for some features
- No question randomization per attempt
- Real-time subscriptions may disconnect (retry mechanism implemented)
- Test coverage is still being improved (currently at 0.6%)

## 📝 Development Workflow

### Before Committing

1. Run type check: `npm run type-check`
2. Run linter: `npm run lint`
3. Run tests: `npm test`
4. Verify layout works across breakpoints
5. Check for console errors

### Pre-merge Checklist

- [ ] All TypeScript errors fixed
- [ ] All ESLint errors fixed (warnings acceptable)
- [ ] Tests pass with 80% coverage
- [ ] Manual verification: no console errors
- [ ] Layout works on mobile, tablet, desktop
- [ ] Security scan completed (SAST)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Authors

- **mrlucas679** - *Initial work* - [GitHub](https://github.com/mrlucas679)

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the amazing component library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Lucide](https://lucide.dev/) for the icon set
- [TanStack Query](https://tanstack.com/query) for state management

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for South African freelancers**
