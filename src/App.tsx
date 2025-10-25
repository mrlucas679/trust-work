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
            <Route path="/dashboard/job-seeker" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><JobSeekerDashboard /></Suspense></AppLayout>} />
            <Route path="/dashboard/employer" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><EmployerDashboard /></Suspense></AppLayout>} />
            <Route path="/jobs" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Jobs /></Suspense></AppLayout>} />
            <Route path="/job/:id" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><JobDetail /></Suspense></AppLayout>} />
            <Route path="/apply/:id" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Apply /></Suspense></AppLayout>} />
            <Route path="/gigs" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Gigs /></Suspense></AppLayout>} />
            <Route path="/portfolio" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Portfolio /></Suspense></AppLayout>} />
            <Route path="/profile" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Profile /></Suspense></AppLayout>} />
            <Route path="/profile/:userId" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Profile /></Suspense></AppLayout>} />
            <Route path="/assessments" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Assessments /></Suspense></AppLayout>} />
            <Route path="/assessment/:assessmentId" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><AssessmentTake /></Suspense></AppLayout>} />
            <Route path="/assessment/:assessmentId/results" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><AssessmentResults /></Suspense></AppLayout>} />
            <Route path="/messages" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Messages /></Suspense></AppLayout>} />
            <Route path="/chat/:id" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Chat /></Suspense></AppLayout>} />
            <Route path="/applications" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><ApplicationTracking /></Suspense></AppLayout>} />
            <Route path="/safety" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><SafetyCenter /></Suspense></AppLayout>} />
            <Route path="/reviews" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Reviews /></Suspense></AppLayout>} />
            <Route path="/post-job" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><PostJob /></Suspense></AppLayout>} />
            <Route path="/post-gig" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><PostGig /></Suspense></AppLayout>} />
            <Route path="/settings" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Settings /></Suspense></AppLayout>} />
            <Route path="/help" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Help /></Suspense></AppLayout>} />
            <Route path="/about" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><About /></Suspense></AppLayout>} />
            <Route path="/terms" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Terms /></Suspense></AppLayout>} />
            <Route path="/privacy" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Privacy /></Suspense></AppLayout>} />

            {/* 404 page without layout */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
