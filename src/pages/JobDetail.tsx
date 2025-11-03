import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, MapPin, Clock, DollarSign, Building, Calendar, ArrowLeft } from "lucide-react";
import { mockJobs } from "@/data/mockData";
import VerificationBadge from "@/components/trust/VerificationBadge";
import RiskIndicator from "@/components/trust/RiskIndicator";
import SafetyBanner from "@/components/trust/SafetyBanner";
const JobDetail = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const job = mockJobs.find(j => j.id === id);
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
                <div>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
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
              <CardTitle>Apply for this Job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{job.salary}</p>
                <p className="text-sm text-muted-foreground">Salary Range</p>
              </div>

              <Button className="w-full" size="lg" onClick={() => navigate(`/apply/${job.id}`)} disabled={job.flagged}>
                {job.flagged ? 'Application Disabled' : 'Apply Now'}
              </Button>

              {!job.flagged && <p className="text-xs text-muted-foreground text-center">
                Safe application process with identity protection
              </p>}
            </CardContent>
          </Card>

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