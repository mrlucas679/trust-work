import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Eagerly load critical pages
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";

// Lazy load other pages
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Setup = lazy(() => import("./pages/Setup"));
const DebugProfile = lazy(() => import("./pages/DebugProfile"));
const Diagnostic = lazy(() => import("./pages/Diagnostic"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Lazy load route groups
const JobSeekerDashboard = lazy(() => import("./pages/dashboard/JobSeekerDashboard"));
const EmployerDashboard = lazy(() => import("./pages/dashboard/EmployerDashboard"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const Apply = lazy(() => import("./pages/Apply"));
const ApplyToJob = lazy(() => import("./pages/ApplyToJob"));
const ApplyToGig = lazy(() => import("./pages/ApplyToGig"));
const FreelancerSearch = lazy(() => import("./pages/FreelancerSearch"));
const Gigs = lazy(() => import("./pages/Gigs"));
const GigDetail = lazy(() => import("./pages/GigDetail"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Profile = lazy(() => import("./pages/Profile"));
const ApplicationSkillTest = lazy(() => import("./pages/ApplicationSkillTest"));
const Applications = lazy(() => import("./pages/Applications"));
const AssignmentApplications = lazy(() => import("./pages/AssignmentApplications"));
const AssignmentDashboard = lazy(() => import("./pages/AssignmentDashboard"));
const AssignmentWarning = lazy(() => import("./pages/AssignmentWarning"));
const AssignmentQuiz = lazy(() => import("./pages/AssignmentQuiz"));
const AssignmentResultsPage = lazy(() => import("./pages/AssignmentResults"));
const AssignmentDetailedResults = lazy(() => import("./pages/AssignmentDetailedResults"));
const CertificateViewer = lazy(() => import("./pages/CertificateViewer"));
const Messages = lazy(() => import("./pages/Messages"));
const Chat = lazy(() => import("./pages/Chat"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Analytics = lazy(() => import("./pages/Analytics"));
const ApplicationTracking = lazy(() => import("./pages/ApplicationTracking"));
const SafetyCenter = lazy(() => import("./pages/SafetyCenter"));
const Reviews = lazy(() => import("./pages/Reviews"));
const ReviewSubmit = lazy(() => import("./pages/ReviewSubmit"));
const LeaveReview = lazy(() => import("./pages/LeaveReview"));
const PostJob = lazy(() => import("./pages/PostJob"));
const PostGig = lazy(() => import("./pages/PostGig"));
const GigManagement = lazy(() => import("./pages/GigManagement"));
const GigApplications = lazy(() => import("./pages/GigApplications"));
const FreelancerEarnings = lazy(() => import("./pages/FreelancerEarnings"));
const ClientPayments = lazy(() => import("./pages/ClientPayments"));
const BankAccountSetup = lazy(() => import("./pages/BankAccountSetup"));
const Settings = lazy(() => import("./pages/Settings"));
const Help = lazy(() => import("./pages/Help"));
const About = lazy(() => import("./pages/About"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const BusinessVerificationPage = lazy(() => import("./pages/BusinessVerificationPage"));
const BusinessVerificationReview = lazy(() => import("./pages/admin/BusinessVerificationReview"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

import { ErrorBoundary } from "./components/ui/error-boundary";
import { PageLoadingSpinner } from "./components/ui/loading-spinner";
import { ThemeProvider } from "./providers/ThemeProvider";
import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <BrowserRouter>
            <Routes>
              {/* Standalone routes without layout */}
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/auth" element={
                <Suspense fallback={<PageLoadingSpinner />}>
                  <Auth />
                </Suspense>
              } />
              <Route path="/auth/old" element={
                <Suspense fallback={<PageLoadingSpinner />}>
                  <Auth />
                </Suspense>
              } />
              <Route path="/auth/callback" element={
                <Suspense fallback={<PageLoadingSpinner />}>
                  <AuthCallback />
                </Suspense>
              } />
              <Route path="/forgot-password" element={
                <Suspense fallback={<PageLoadingSpinner />}>
                  <ForgotPassword />
                </Suspense>
              } />
              <Route path="/reset-password" element={
                <Suspense fallback={<PageLoadingSpinner />}>
                  <ResetPassword />
                </Suspense>
              } />
              <Route path="/setup" element={
                <Suspense fallback={<PageLoadingSpinner />}>
                  <Setup />
                </Suspense>
              } />
              <Route path="/debug-profile" element={
                <Suspense fallback={<PageLoadingSpinner />}>
                  <DebugProfile />
                </Suspense>
              } />
              <Route path="/diagnostic" element={
                <Suspense fallback={<PageLoadingSpinner />}>
                  <Diagnostic />
                </Suspense>
              } />

              {/* Public landing route */}
              <Route path="/" element={<AppLayout showNavigation={false}><Index /></AppLayout>} />

              {/* Protected app routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard/job-seeker" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><JobSeekerDashboard /></Suspense></AppLayout>} />
                <Route path="/dashboard/employer" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><EmployerDashboard /></Suspense></AppLayout>} />
                <Route path="/verify-business" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><BusinessVerificationPage /></Suspense></AppLayout>} />
                <Route path="/jobs" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Jobs /></Suspense></AppLayout>} />
                <Route path="/job/:id" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><JobDetail /></Suspense></AppLayout>} />
                <Route path="/apply/:id" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Apply /></Suspense></AppLayout>} />
                <Route path="/apply/job/:id" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><ApplyToJob /></Suspense></AppLayout>} />
                <Route path="/apply/gig/:id" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><ApplyToGig /></Suspense></AppLayout>} />
                <Route path="/search/freelancers" element={<Suspense fallback={<PageLoadingSpinner />}><FreelancerSearch /></Suspense>} />
                <Route path="/apply/:id/skill-test" element={<Suspense fallback={<PageLoadingSpinner />}><ApplicationSkillTest /></Suspense>} />
                <Route path="/gigs" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Gigs /></Suspense></AppLayout>} />
                <Route path="/gig/:id" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><GigDetail /></Suspense></AppLayout>} />
                <Route path="/portfolio" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Portfolio /></Suspense></AppLayout>} />
                <Route path="/profile" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Profile /></Suspense></AppLayout>} />
                <Route path="/profile/edit" element={<Navigate to="/settings" replace />} />
                <Route path="/profile/:userId" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Profile /></Suspense></AppLayout>} />
                <Route path="/assignments" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><AssignmentDashboard /></Suspense></AppLayout>} />
                <Route path="/assignments/:skill/:level/warning" element={<Suspense fallback={<PageLoadingSpinner />}><AssignmentWarning /></Suspense>} />
                <Route path="/assignments/:skill/:level/take" element={<Suspense fallback={<PageLoadingSpinner />}><AssignmentQuiz /></Suspense>} />
                <Route path="/assignments/:skill/:level/results" element={<Suspense fallback={<PageLoadingSpinner />}><AssignmentResultsPage /></Suspense>} />
                <Route path="/assignments/:skill/:level/detailed-results" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><AssignmentDetailedResults /></Suspense></AppLayout>} />
                <Route path="/assessment/:assessmentId/certificate" element={<Suspense fallback={<PageLoadingSpinner />}><CertificateViewer /></Suspense>} />
                <Route path="/messages" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Messages /></Suspense></AppLayout>} />
                <Route path="/chat/:id" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Chat /></Suspense></AppLayout>} />
                <Route path="/notifications" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Notifications /></Suspense></AppLayout>} />
                <Route path="/analytics" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Analytics /></Suspense></AppLayout>} />
                {/* SECURITY: Application routes with RLS protection */}
                <Route path="/applications" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Applications /></Suspense></AppLayout>} />
                <Route path="/assignments/:assignmentId/applications" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><AssignmentApplications /></Suspense></AppLayout>} />
                <Route path="/safety" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><SafetyCenter /></Suspense></AppLayout>} />
                <Route path="/reviews" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Reviews /></Suspense></AppLayout>} />
                <Route path="/review/:id" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><ReviewSubmit /></Suspense></AppLayout>} />
                <Route path="/leave-review" element={<Suspense fallback={<PageLoadingSpinner />}><LeaveReview /></Suspense>} />
                <Route path="/post-job" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><PostJob /></Suspense></AppLayout>} />
                <Route path="/post-gig" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><PostGig /></Suspense></AppLayout>} />
                <Route path="/gig-management" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><GigManagement /></Suspense></AppLayout>} />
                <Route path="/gig/:id/applications" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><GigApplications /></Suspense></AppLayout>} />
                <Route path="/freelancer/earnings" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><FreelancerEarnings /></Suspense></AppLayout>} />
                <Route path="/freelancer/bank-account" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><BankAccountSetup /></Suspense></AppLayout>} />
                <Route path="/client/payments" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><ClientPayments /></Suspense></AppLayout>} />
                <Route path="/settings" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Settings /></Suspense></AppLayout>} />
                <Route path="/help" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Help /></Suspense></AppLayout>} />
                <Route path="/about" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><About /></Suspense></AppLayout>} />
                <Route path="/terms" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Terms /></Suspense></AppLayout>} />
                <Route path="/privacy" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><Privacy /></Suspense></AppLayout>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><AdminDashboard /></Suspense></AppLayout>} />
                <Route path="/admin/verifications" element={<AppLayout><Suspense fallback={<PageLoadingSpinner />}><BusinessVerificationReview /></Suspense></AppLayout>} />
              </Route>

              {/* 404 page without layout */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
