import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Eye, MessageCircle, Calendar, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApplicationTracking = () => {
  const navigate = useNavigate();

  const applications = [
    {
      id: "1",
      jobTitle: "Frontend Developer",
      company: "TechCorp Solutions",
      appliedDate: "2024-01-15",
      status: "interview",
      progress: 75,
      nextStep: "Final Interview - Jan 25",
      hasMessages: true,
      verified: true
    },
    {
      id: "2",
      jobTitle: "UI/UX Designer",
      company: "StartupXYZ",
      appliedDate: "2024-01-10",
      status: "review",
      progress: 50,
      nextStep: "Portfolio Review",
      hasMessages: true,
      verified: true
    },
    {
      id: "3",
      jobTitle: "Project Manager",
      company: "Global Industries",
      appliedDate: "2024-01-08",
      status: "accepted",
      progress: 100,
      nextStep: "Contract Sent",
      hasMessages: false,
      verified: true
    },
    {
      id: "4",
      jobTitle: "Web Developer",
      company: "Local Agency",
      appliedDate: "2024-01-05",
      status: "rejected",
      progress: 25,
      nextStep: "Application Closed",
      hasMessages: false,
      verified: false
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'review': return <Eye className="h-4 w-4" />;
      case 'interview': return <Calendar className="h-4 w-4" />;
      case 'accepted': return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500';
      case 'interview': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'interview': return 'secondary';
      case 'review': return 'outline';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const filterApplications = (status: string) => {
    if (status === 'all') return applications;
    return applications.filter(app => app.status === status);
  };

  const ApplicationCard = ({ app }: { app: typeof applications[0] }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{app.jobTitle}</h3>
            <p className="text-muted-foreground">{app.company}</p>
            <p className="text-sm text-muted-foreground">Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center space-x-2">
            {app.verified && (
              <Badge variant="outline" className="border-verified text-verified">
                Verified
              </Badge>
            )}
            <Badge variant={getStatusVariant(app.status)} className="capitalize">
              {getStatusIcon(app.status)}
              <span className="ml-1">{app.status}</span>
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{app.progress}%</span>
            </div>
            <Progress value={app.progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Next:</span> {app.nextStep}
            </p>
            <div className="flex space-x-2">
              {app.hasMessages && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/chat/${app.id}`)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/job/${app.id}`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-muted/20 p-6">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Application Tracking</h1>
            <p className="text-muted-foreground">Monitor your job application progress</p>
          </div>

        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{applications.length}</p>
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{filterApplications('interview').length}</p>
              <p className="text-sm text-muted-foreground">Interviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{filterApplications('accepted').length}</p>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Eye className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{filterApplications('review').length}</p>
              <p className="text-sm text-muted-foregroundnce">Under Review</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {applications.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {filterApplications('pending').map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </TabsContent>

          <TabsContent value="review" className="space-y-4">
            {filterApplications('review').map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </TabsContent>

          <TabsContent value="interview" className="space-y-4">
            {filterApplications('interview').map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {filterApplications('accepted').map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {filterApplications('rejected').map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApplicationTracking;