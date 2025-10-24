import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";

// Eagerly load critical pages
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";

// Lazy load other pages
const Auth = lazy(() => import("./pages/Auth"));
const Setup = lazy(() => import("./pages/Setup"));
const NotFound = lazy(() => import("./pages/NotFound"));
import JobSeekerDashboard from "./pages/dashboard/JobSeekerDashboard";
import EmployerDashboard from "./pages/dashboard/EmployerDashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Apply from "./pages/Apply";
import Gigs from "./pages/Gigs";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";
import Assessments from "./pages/Assessments";
import AssessmentTake from "./pages/AssessmentTake";
import AssessmentResults from "./pages/AssessmentResults";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import ApplicationTracking from "./pages/ApplicationTracking";
import SafetyCenter from "./pages/SafetyCenter";
import Reviews from "./pages/Reviews";
import PostJob from "./pages/PostJob";
import PostGig from "./pages/PostGig";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

const queryClient = new QueryClient();

// Lazy load route groups
const JobSeekerDashboard = lazy(() => import("./pages/dashboard/JobSeekerDashboard"));
const EmployerDashboard = lazy(() => import("./pages/dashboard/EmployerDashboard"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const Apply = lazy(() => import("./pages/Apply"));
const Gigs = lazy(() => import("./pages/Gigs"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Profile = lazy(() => import("./pages/Profile"));
const Assessments = lazy(() => import("./pages/Assessments"));
const AssessmentTake = lazy(() => import("./pages/AssessmentTake"));
const AssessmentResults = lazy(() => import("./pages/AssessmentResults"));
const Messages = lazy(() => import("./pages/Messages"));
const Chat = lazy(() => import("./pages/Chat"));
const ApplicationTracking = lazy(() => import("./pages/ApplicationTracking"));
const SafetyCenter = lazy(() => import("./pages/SafetyCenter"));
const Reviews = lazy(() => import("./pages/Reviews"));
const PostJob = lazy(() => import("./pages/PostJob"));
const PostGig = lazy(() => import("./pages/PostGig"));
const Settings = lazy(() => import("./pages/Settings"));
const Help = lazy(() => import("./pages/Help"));
const About = lazy(() => import("./pages/About"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

import { ErrorBoundary } from "./components/ui/error-boundary";
import { PageLoadingSpinner } from "./components/ui/loading-spinner";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Standalone routes without layout */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/auth" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <Auth />
              </Suspense>
            } />
            <Route path="/setup" element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <Setup />
              </Suspense>
            } />

            {/* Main app routes with consistent layout */}
            <Route path="/" element={<AppLayout showNavigation={false}><Index /></AppLayout>} />
            <Route path="/dashboard/job-seeker" element={<AppLayout><JobSeekerDashboard /></AppLayout>} />
            <Route path="/dashboard/employer" element={<AppLayout><EmployerDashboard /></AppLayout>} />
            <Route path="/jobs" element={<AppLayout><Jobs /></AppLayout>} />
            <Route path="/job/:id" element={<AppLayout><JobDetail /></AppLayout>} />
            <Route path="/apply/:id" element={<AppLayout><Apply /></AppLayout>} />
            <Route path="/gigs" element={<AppLayout><Gigs /></AppLayout>} />
            <Route path="/portfolio" element={<AppLayout><Portfolio /></AppLayout>} />
            <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
            <Route path="/profile/:userId" element={<AppLayout><Profile /></AppLayout>} />
            <Route path="/assessments" element={<AppLayout><Assessments /></AppLayout>} />
            <Route path="/assessment/:assessmentId" element={<AppLayout><AssessmentTake /></AppLayout>} />
            <Route path="/assessment/:assessmentId/results" element={<AppLayout><AssessmentResults /></AppLayout>} />
            <Route path="/messages" element={<AppLayout><Messages /></AppLayout>} />
            <Route path="/chat/:id" element={<AppLayout><Chat /></AppLayout>} />
            <Route path="/applications" element={<AppLayout><ApplicationTracking /></AppLayout>} />
            <Route path="/safety" element={<AppLayout><SafetyCenter /></AppLayout>} />
            <Route path="/reviews" element={<AppLayout><Reviews /></AppLayout>} />
            <Route path="/post-job" element={<AppLayout><PostJob /></AppLayout>} />
            <Route path="/post-gig" element={<AppLayout><PostGig /></AppLayout>} />
            <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
            <Route path="/help" element={<AppLayout><Help /></AppLayout>} />
            <Route path="/about" element={<AppLayout><About /></AppLayout>} />
            <Route path="/terms" element={<AppLayout><Terms /></AppLayout>} />
            <Route path="/privacy" element={<AppLayout><Privacy /></AppLayout>} />

            {/* 404 page without layout */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
  </QueryClientProvider>
);

export default App;
