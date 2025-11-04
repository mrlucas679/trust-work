import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, AlertTriangle, MapPin, Clock, DollarSign, Building, Calendar, ArrowLeft, FileText, Loader2 } from "lucide-react";
import { mockJobs } from "@/data/mockData";
import VerificationBadge from "@/components/trust/VerificationBadge";
import RiskIndicator from "@/components/trust/RiskIndicator";
import SafetyBanner from "@/components/trust/SafetyBanner";
import { ApplicationForm, ApplicationStatusBadge } from "@/components/applications";
import { useCanApply, useMyApplications } from "@/hooks/useApplications";
import { useSupabase } from "@/providers/SupabaseProvider";
import { AssignmentStatusBadge, StatusTransitionButtons } from "@/components/workflow";
const JobDetail = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const { user } = useSupabase();
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);

  const job = mockJobs.find(j => j.id === id);

  // SECURITY: Check if user can apply (prevents duplicate applications, checks eligibility)
  const { data: canApply, isLoading: checkingEligibility } = useCanApply(id);

  // SECURITY: Fetch user's existing application for this job (prevents viewing others' applications)
  // RLS policies ensure users only see their own applications
  const { data: myApplications, isLoading: loadingApplications } = useMyApplications(
    { assignment_id: id },
    { page: 1, pageSize: 1 }
  );

  const existingApplication = myApplications?.data?.[0];
  const hasApplied = !!existingApplication;

  if (!job) {
    return <div className="bg-muted/20 flex items-center justify-center p-8">
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Job not found</p>
          <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
        </CardContent>
      </Card>
    </div>;
  }
  return <div className="bg-muted/20">
    <div className="space-y-6 p-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/jobs')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      {/* Safety Banner */}
      <SafetyBanner
        type={job.flagged ? 'flagged' : job.verified ? 'general' : 'warning'}
        className="mb-6"
      />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card className={job.flagged ? "border-warning/30 bg-warning/5" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                    <AssignmentStatusBadge status={job.status} />
                  </div>
                  <p className="text-lg text-muted-foreground mt-1">{job.company}</p>
                </div>
                <div className="flex gap-2">
                  {job.verified && !job.flagged && (
                    <VerificationBadge
                      type="verified"
                      details={[
                        'CIPC business registration verified',
                        'Professional email domain confirmed',
                        'Identity verification complete',
                        'Good payment history'
                      ]}
                    />
                  )}
                  {job.flagged && (
                    <VerificationBadge type="flagged" />
                  )}
                  <RiskIndicator
                    level={job.flagged ? 'high' : job.verified ? 'low' : 'medium'}
                    reasons={job.flagged ? [
                      'Unverified business registration',
                      'Suspicious contact details',
                      'Multiple user reports'
                    ] : !job.verified ? [
                      'Verification pending',
                      'Limited company information'
                    ] : []}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {job.type}
                </div>
                <div className="flex items-center">

                  {job.salary}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Posted {job.postedDate}
                </div>
              </div>

              {job.flagged && <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-warning mb-1">Safety Warning</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      This job posting has been flagged by our safety systems. Please verify all details independently and report any suspicious activity.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Never pay upfront fees for job opportunities</li>
                      <li>• Verify company registration and contact details</li>
                      <li>• Be cautious of unrealistic salary promises</li>
                      <li>• Report suspicious employers to TrustWork</li>
                    </ul>
                  </div>
                </div>
              </div>}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {job.description}
              </p>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Requirements</h3>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map(req => <Badge key={req} variant="secondary">
                    {req}
                  </Badge>)}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">What We Offer</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Competitive salary and benefits package</li>
                  <li>• Flexible working arrangements</li>
                  <li>• Professional development opportunities</li>
                  <li>• Collaborative team environment</li>
                  <li>• Modern office facilities</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                {hasApplied ? "Your Application" : "Apply for this Job"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{job.salary}</p>
                <p className="text-sm text-muted-foreground">Salary Range</p>
              </div>

              {/* SECURITY: Show application status if user has applied */}
              {hasApplied && existingApplication && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <ApplicationStatusBadge status={existingApplication.status} />
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {new Date(existingApplication.created_at).toLocaleDateString()}</span>
                    </div>
                    {existingApplication.viewed_by_employer && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Viewed by employer</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/applications/${existingApplication.id}`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Application Details
                  </Button>
                </div>
              )}

              {/* SECURITY: Only show apply button if user hasn't applied and is eligible */}
              {!hasApplied && (
                <>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setIsApplicationDialogOpen(true)}
                    disabled={job.flagged || !user || checkingEligibility || !canApply}
                  >
                    {checkingEligibility && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {job.flagged ? 'Application Disabled' : !user ? 'Sign In to Apply' : 'Apply Now'}
                  </Button>

                  {!job.flagged && user && (
                    <p className="text-xs text-muted-foreground text-center">
                      SECURITY: Safe application process with identity protection and RLS policies
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Workflow Actions (for accepted applications) */}
          {existingApplication?.status === 'accepted' && user && (
            <Card>
              <CardHeader>
                <CardTitle>Assignment Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatusTransitionButtons
                  assignmentId={id!}
                  applicationId={existingApplication.id}
                  currentStatus={job.status}
                  userRole={user.id === job.clientId ? 'employer' : 'freelancer'}
                  className="flex flex-wrap gap-3"
                />
                <p className="text-xs text-muted-foreground">
                  SECURITY: Status transitions are validated and logged
                </p>
              </CardContent>
            </Card>
          )}

          {/* SECURITY: Application Form Dialog with validation */}
          <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Apply for {job.title}</DialogTitle>
                <DialogDescription>
                  Fill out the application form below. All fields are validated for security.
                </DialogDescription>
              </DialogHeader>
              <ApplicationForm
                assignmentId={id!}
                onSuccess={() => {
                  setIsApplicationDialogOpen(false);
                  // Application list will auto-refresh via React Query
                }}
                onCancel={() => setIsApplicationDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">{job.company}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {job.verified ? 'Verified employer with strong safety record' : 'Employer verification pending'}
                </p>
              </div>

              {job.verified && !job.flagged && <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-verified mr-2" />
                  <span>Business registration verified</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-verified mr-2" />
                  <span>Professional email domain</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-verified mr-2" />
                  <span>Identity verification complete</span>
                </div>
              </div>}

              {job.flagged && <div className="space-y-2">
                <div className="flex items-center text-sm text-flagged">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>Suspicious activity detected</span>
                </div>
                <div className="flex items-center text-sm text-flagged">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>Unverified business details</span>
                </div>
              </div>}
            </CardContent>
          </Card>

          {/* Similar Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Similar Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockJobs.filter(j => j.id !== job.id && j.verified && !j.flagged).slice(0, 3).map(similarJob => <div key={similarJob.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <h4 className="font-medium text-sm mb-1">{similarJob.title}</h4>
                <p className="text-xs text-muted-foreground">{similarJob.company}</p>
                <p className="text-xs text-primary font-medium mt-1">{similarJob.salary}</p>
              </div>)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>;
};
export default JobDetail;