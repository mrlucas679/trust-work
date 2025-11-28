import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Clock,
  Calendar,
  ArrowLeft,
  Loader2,
  Banknote,
  Edit,
  XCircle,
  Building2,
  CheckCircle,
  MessageCircle,
  AlertCircle,
  Briefcase,
  FileText,
  DollarSign,
  Award,
  Target
} from "lucide-react";
import { getAssignment, type Assignment } from "@/lib/api/assignments";
import { getMyApplications, withdrawApplication, type ApplicationWithDetails } from "@/lib/api/applications";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/providers/SupabaseProvider";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import VerificationBadge from "@/components/trust/VerificationBadge";
import RiskIndicator from "@/components/trust/RiskIndicator";
import { SkillCategory, AssignmentLevel, SKILL_DISPLAY_NAMES, LEVEL_DISPLAY_NAMES } from "@/types/assignments";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEmployer, isJobSeeker, user } = useSupabase();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [application, setApplication] = useState<ApplicationWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const isOwner = assignment && user && assignment.client_id === user.id;

  useEffect(() => {
    const fetchJobAndApplication = async () => {
      if (!id) {
        navigate('/jobs');
        return;
      }

      setIsLoading(true);
      try {
        const data = await getAssignment(id);
        setAssignment(data);

        // Fetch user's application if exists
        if (isJobSeeker) {
          const applications = await getMyApplications();
          const userApp = applications.find(app => app.assignment_id === id);
          setApplication(userApp || null);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load job details',
          variant: 'destructive'
        });
        navigate('/jobs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobAndApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleWithdraw = async () => {
    if (!application) return;

    setIsWithdrawing(true);
    try {
      await withdrawApplication(application.id);
      setApplication(null);
      toast({
        title: "Application Withdrawn",
        description: "Your application has been withdrawn successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to Withdraw",
        description: error instanceof Error ? error.message : "Could not withdraw application",
        variant: "destructive"
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-muted/20 flex items-center justify-center p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading job details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="bg-muted/20 flex items-center justify-center p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Job not found</p>
            <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-muted/20">
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={() => navigate('/jobs')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                      <Badge variant="secondary">Job</Badge>
                      {assignment.urgent && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                      {!assignment.flagged && (
                        <Badge variant="outline" className="border-verified text-verified">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span>Company</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {new Date(assignment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!assignment.flagged && (
                      <VerificationBadge
                        type="verified"
                        size="sm"
                        details={[
                          'Employer verified',
                          'Business registered',
                          'Payment secured'
                        ]}
                      />
                    )}
                    <RiskIndicator level={assignment.flagged ? "high" : "low"} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Flagged Warning */}
                {assignment.flagged && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-semibold mb-1">Safety Warning</p>
                      <p className="text-sm">This job posting has been flagged for suspicious activity. Exercise caution and verify all details independently before applying.</p>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {assignment.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {assignment.job_type.replace('_', ' ').charAt(0).toUpperCase() + assignment.job_type.replace('_', ' ').slice(1)}
                  </div>
                  <div className="flex items-center">
                    <Banknote className="h-4 w-4 mr-2" />
                    {assignment.budget_min && assignment.budget_max
                      ? `R${assignment.budget_min.toLocaleString()} - R${assignment.budget_max.toLocaleString()}`
                      : 'Negotiable'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {assignment.description}
                </p>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {assignment.required_skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {assignment.duration_estimate && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Estimated Duration</h3>
                      <p className="text-muted-foreground">{assignment.duration_estimate}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={assignment.status === 'open' ? 'default' : 'secondary'}>
                    {assignment.status}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remote Work</span>
                  <span className="font-medium">
                    {assignment.remote_allowed ? 'Allowed' : 'On-site Only'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience Required</span>
                  <span className="font-medium capitalize">{assignment.experience_level}</span>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Requirements Card */}
            {(assignment.category || assignment.required_certification_level) && (
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Skill Assessment Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assignment.category && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Skill Category</span>
                      </div>
                      <Badge variant="secondary" className="text-base">
                        <Award className="h-4 w-4 mr-2" />
                        {SKILL_DISPLAY_NAMES[assignment.category as SkillCategory]}
                      </Badge>
                    </div>
                  )}
                  
                  {assignment.required_certification_level ? (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Required Certification Level</span>
                        </div>
                        <Badge variant="default" className="text-base mb-3">
                          {LEVEL_DISPLAY_NAMES[assignment.required_certification_level as AssignmentLevel]} Level
                        </Badge>
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            To apply for this position, you must have completed the{' '}
                            <strong>{LEVEL_DISPLAY_NAMES[assignment.required_certification_level as AssignmentLevel]}</strong>{' '}
                            level certification in{' '}
                            <strong>{assignment.category ? SKILL_DISPLAY_NAMES[assignment.category as SkillCategory] : 'this skill'}</strong>.
                            {isJobSeeker && (
                              <Button
                                variant="link"
                                className="p-0 h-auto ml-1 text-primary"
                                onClick={() => navigate('/assignment-dashboard')}
                              >
                                Take Assessment →
                              </Button>
                            )}
                          </AlertDescription>
                        </Alert>
                      </div>
                    </>
                  ) : (
                    <>
                      <Separator />
                      <div>
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            While no specific certification level is required, having certifications in{' '}
                            <strong>{assignment.category ? SKILL_DISPLAY_NAMES[assignment.category as SkillCategory] : 'this skill'}</strong>{' '}
                            can strengthen your application.
                            {isJobSeeker && (
                              <Button
                                variant="link"
                                className="p-0 h-auto ml-1 text-primary"
                                onClick={() => navigate('/assignment-dashboard')}
                              >
                                View Assessments →
                              </Button>
                            )}
                          </AlertDescription>
                        </Alert>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Skill Test Requirement */}
            {assignment.requires_skill_test && assignment.skill_test_template_id && (
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Skill Test Requirement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="border-primary/50 bg-primary/5">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertDescription>
                      <div className="font-semibold mb-2">
                        🔍 Skill Test Required
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>Difficulty: <Badge variant="outline" className="ml-1 capitalize">{assignment.skill_test_difficulty || 'entry'}</Badge></p>
                        <p>Passing Score: <span className="font-medium">{assignment.skill_test_passing_score || 70}%</span></p>
                      </div>
                      <p className="mt-2">
                        {isEmployer
                          ? '✓ As an employer, you are exempt from skill tests.'
                          : 'You must complete and pass this test before applying.'}
                      </p>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Application Section for Job Seekers */}
            {application && isJobSeeker && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Your Application</CardTitle>
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Submitted</p>
                      <p>{new Date(application.created_at).toLocaleDateString()}</p>
                    </div>
                    {application.estimated_start_date && (
                      <div>
                        <p className="font-medium text-muted-foreground">Available to Start</p>
                        <p>{new Date(application.estimated_start_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {application.reviewed_at && (
                      <div>
                        <p className="font-medium text-muted-foreground">Reviewed</p>
                        <p>{new Date(application.reviewed_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <p className="font-medium mb-2">Your Proposal</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {application.proposal}
                    </p>
                  </div>

                  {application.cover_letter && (
                    <>
                      <Separator />
                      <div>
                        <p className="font-medium mb-2">Cover Letter</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {application.cover_letter}
                        </p>
                      </div>
                    </>
                  )}

                  {application.rejection_reason && (
                    <>
                      <Separator />
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <p className="font-medium mb-1">Rejection Reason</p>
                          <p className="text-sm">{application.rejection_reason}</p>
                        </AlertDescription>
                      </Alert>
                    </>
                  )}

                  <div className="flex gap-3">
                    {application.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/application/${application.id}/edit`)}
                          className="flex-1"
                        >
                          Edit Application
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleWithdraw}
                          disabled={isWithdrawing}
                          className="flex-1"
                        >
                          {isWithdrawing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Withdrawing...
                            </>
                          ) : (
                            'Withdraw'
                          )}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Messaging Feature",
                          description: "Direct messaging will be available soon.",
                        });
                      }}
                      className="flex-1"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message Employer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  {assignment.budget_min && assignment.budget_max
                    ? `R${assignment.budget_min.toLocaleString()} - R${assignment.budget_max.toLocaleString()}`
                    : 'Negotiable'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Total project budget</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                {isJobSeeker && (
                  <>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => navigate(`/apply/${assignment.id}`)}
                      disabled={assignment.status !== 'open' || assignment.flagged}
                    >
                      {assignment.status !== 'open' ? 'Job Closed' : assignment.flagged ? 'Flagged' : 'Apply Now'}
                    </Button>
                    {assignment.status === 'open' && !assignment.flagged && (
                      <p className="text-xs text-center text-muted-foreground">
                        Your application will be reviewed within 24 hours
                      </p>
                    )}
                  </>
                )}

                {isEmployer && isOwner && (
                  <>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => navigate(`/assignments/${assignment.id}/applications`)}
                    >
                      View Applications
                    </Button>
                    <Button
                      className="w-full"
                      size="lg"
                      variant="outline"
                      onClick={() => navigate(`/post-job?edit=${assignment.id}`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Job
                    </Button>
                    <Button
                      className="w-full"
                      size="lg"
                      variant="destructive"
                      disabled={assignment.status === 'closed'}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {assignment.status === 'closed' ? 'Job Closed' : 'Close Job'}
                    </Button>
                  </>
                )}

                {isEmployer && !isOwner && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    This job was posted by another employer
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Safety Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs space-y-2 text-muted-foreground">
                  <li>• Never pay upfront fees</li>
                  <li>• Verify employer identity</li>
                  <li>• Use platform messaging</li>
                  <li>• Report suspicious activity</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
