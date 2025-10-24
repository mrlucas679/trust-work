import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Clock, AlertTriangle, Users, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockJobs, mockGigs, mockEmployer } from "@/data/mockData";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const myJobs = mockJobs.slice(0, 2); // Mock employer's jobs
  const myGigs = mockGigs.slice(0, 1); // Mock employer's gigs

  return (
    <div className="min-h-screen bg-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {mockEmployer.companyName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="border-verified text-verified">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Business
              </Badge>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/post-job')}>
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Button>
            <Button variant="outline" onClick={() => navigate('/post-gig')}>
              <Plus className="h-4 w-4 mr-2" />
              Post Gig
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{myJobs.length + myGigs.length}</p>
                  <p className="text-sm text-muted-foreground">Active Postings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-verified" />
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Verified Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-warning" />
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Status */}
        <Card className="mb-8 border-verified/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 text-verified mr-2" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-verified/10 border border-verified/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Business Registration</h3>
                  <CheckCircle className="h-4 w-4 text-verified" />
                </div>
                <p className="text-xs text-muted-foreground">Company registration verified</p>
              </div>
              
              <div className="p-4 bg-verified/10 border border-verified/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Domain Verification</h3>
                  <CheckCircle className="h-4 w-4 text-verified" />
                </div>
                <p className="text-xs text-muted-foreground">Professional email domain confirmed</p>
              </div>
              
              <div className="p-4 bg-verified/10 border border-verified/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">Identity Check</h3>
                  <CheckCircle className="h-4 w-4 text-verified" />
                </div>
                <p className="text-xs text-muted-foreground">Business owner identity verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Job Postings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Job Postings</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/post-job')}>
                  <Plus className="h-4 w-4 mr-1" />
                  New Job
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {myJobs.map((job) => (
                <div key={job.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.location} • {job.type}</p>
                    </div>
                    <Badge variant="outline" className="border-verified text-verified">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">12 applications</span>
                    <span className="text-primary font-medium">{job.salary}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">View Applications</Button>
                    <Button size="sm" variant="ghost">Edit</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Gig Postings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Gig Postings</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/post-gig')}>
                  <Plus className="h-4 w-4 mr-1" />
                  New Gig
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {myGigs.map((gig) => (
                <div key={gig.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{gig.title}</h3>
                      <p className="text-sm text-muted-foreground">{gig.duration}</p>
                    </div>
                    <Badge variant="outline" className="border-verified text-verified">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">8 proposals</span>
                    <span className="text-primary font-medium">{gig.budget}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2 mb-3">
                    {gig.skills.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Proposals</Button>
                    <Button size="sm" variant="ghost">Edit</Button>
                  </div>
                </div>
              ))}
              
              <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
                <p className="text-muted-foreground mb-3">Need quick help with a project?</p>
                <Button onClick={() => navigate('/post-gig')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Gig
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Assessment Alert for Demo */}
        <Card className="mt-8 border-warning/20 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-warning mr-2" />
              TrustWork Safety Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Your Safety Score: Excellent</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Business registration verified</li>
                  <li>✓ Professional email domain</li>
                  <li>✓ No suspicious activity detected</li>
                  <li>✓ Positive payment history</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Platform Benefits</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Higher visibility for verified employers</li>
                  <li>• Access to premium talent pool</li>
                  <li>• Protected payment processing</li>
                  <li>• 24/7 fraud monitoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployerDashboard;