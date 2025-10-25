import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Star, Briefcase, User, Award, MessageCircle, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockJobs, mockGigs, mockJobSeeker } from "@/data/mockData";

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const verifiedJobs = mockJobs.filter(job => job.verified && !job.flagged);
  const suspiciousJobs = mockJobs.filter(job => job.flagged);
  const skillMatchedGigs = mockGigs.slice(0, 2); // Mock skill matching

  return (
    <div className="min-h-screen bg-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {mockJobSeeker.name}</h1>
            <p className="text-muted-foreground">Find your next opportunity</p>
          </div>

        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-verified" />
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Verified Gigs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Completed Gigs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Star className="h-8 w-8 text-warning" />
                <div>
                  <p className="text-2xl font-bold">4.8</p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{mockJobSeeker.skills.length}</p>
                  <p className="text-sm text-muted-foreground">Skills Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Verified Jobs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-verified mr-2" />
                  Verified Gigs
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/gigs')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {verifiedJobs.slice(0, 3).map(job => (
                <div key={job.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                    <Badge variant="outline" className="border-verified text-verified">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{job.location} • {job.type}</p>
                  <p className="text-sm font-medium text-primary">{job.salary}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Suspicious Jobs Warning */}
          <Card className="border-warning/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-warning mr-2" />
                Suspicious Gig Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm mb-2">We've detected {suspiciousJobs.length} potentially suspicious gig postings. Stay safe!</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Always verify employer details</li>
                  <li>• Never pay upfront fees</li>
                  <li>• Report suspicious activity</li>
                </ul>
              </div>
              {suspiciousJobs.slice(0, 2).map(job => (
                <div key={job.id} className="p-4 border border-flagged/20 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Flagged
                    </Badge>
                  </div>
                  <p className="text-xs text-flagged">Suspicious patterns detected</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Gigs for You */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Gigs for You</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/gigs')}>
                View All Gigs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {skillMatchedGigs.map(gig => (
                <div key={gig.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{gig.title}</h3>
                      <p className="text-sm text-muted-foreground">{gig.client}</p>
                    </div>
                    <Badge variant="outline" className="border-verified text-verified">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{gig.duration}</p>
                  <p className="text-sm font-medium text-primary">{gig.budget}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {gig.skills.slice(0, 2).map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills Development */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Skill Development</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/assessments')}>
                Take Assessment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Excel Basics</h3>
                <p className="text-xs text-muted-foreground mb-3">Test your spreadsheet skills</p>
                <Button size="sm" variant="outline">Start Quiz</Button>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Digital Marketing</h3>
                <p className="text-xs text-muted-foreground mb-3">Prove your marketing knowledge</p>
                <Button size="sm" variant="outline">Start Quiz</Button>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Customer Service</h3>
                <p className="text-xs text-muted-foreground mb-3">Show your people skills</p>
                <Button size="sm" variant="outline">Start Quiz</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;