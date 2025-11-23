import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Star, Briefcase, User, Award, MessageCircle, Shield, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/providers/SupabaseProvider";
import { getJobs, type Assignment } from "@/lib/api/assignments";
import { getGigs, type Gig } from "@/lib/api/gigs";
import { useToast } from "@/hooks/use-toast";

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSupabase();
  const { toast } = useToast();

  const [jobs, setJobs] = useState<Assignment[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileSkillsCount, setProfileSkillsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [jobsData, gigsData] = await Promise.all([
          getJobs({}, 10, 0),
          getGigs()
        ]);
        setJobs(jobsData.data);
        setGigs(gigsData.slice(0, 10));

        // Fetch profile skills count
        if (user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('skills')
            .eq('id', user.id)
            .single();
          setProfileSkillsCount(profile?.skills?.length || 0);
        }
      } catch (error) {
        toast({
          title: "Error loading dashboard",
          description: error instanceof Error ? error.message : "Failed to load data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id, toast]);

  const verifiedJobs = jobs.filter(job => job.status === 'open');
  const suspiciousJobs = jobs.filter(job => job.flagged);
  const skillMatchedGigs = gigs.filter(gig => gig.status === 'open').slice(0, 2);

  const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'there';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {userName}</h1>
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
                  <p className="text-2xl font-bold">{profileSkillsCount}</p>
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
                  Verified Jobs
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/jobs')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {verifiedJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No jobs available at the moment</p>
              ) : (
                verifiedJobs.slice(0, 3).map(job => (
                  <div key={job.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.category || 'General'}</p>
                      </div>
                      <Badge variant="outline" className="border-verified text-verified">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Open
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {job.location || 'Remote'} • {job.job_type.replace('_', ' ')}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      R{job.budget_min?.toLocaleString()} - R{job.budget_max?.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Suspicious Jobs Warning */}
          <Card className="border-warning/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-warning mr-2" />
                Suspicious Job Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm mb-2">We've detected {suspiciousJobs.length} potentially suspicious job postings. Stay safe!</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Always verify employer details</li>
                  <li>• Never pay upfront fees</li>
                  <li>• Report suspicious activity</li>
                </ul>
              </div>
              {suspiciousJobs.length > 0 ? (
                suspiciousJobs.slice(0, 2).map(job => (
                  <div key={job.id} className="p-4 border border-flagged/20 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.category || 'General'}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Flagged
                      </Badge>
                    </div>
                    <p className="text-xs text-flagged">Suspicious patterns detected</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No suspicious postings detected</p>
              )}
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
              {skillMatchedGigs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 col-span-2">No gigs available at the moment</p>
              ) : (
                skillMatchedGigs.map(gig => (
                  <div key={gig.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/gigs/${gig.id}`)}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{gig.title}</h3>
                        <p className="text-sm text-muted-foreground">{gig.category || 'General'}</p>
                      </div>
                      <Badge variant="outline" className="border-verified text-verified">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Open
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {gig.deadline ? `Due ${new Date(gig.deadline).toLocaleDateString()}` : 'Flexible deadline'}
                    </p>
                    <p className="text-sm font-medium text-primary">
                      R{gig.budget_min?.toLocaleString()} - R{gig.budget_max?.toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {gig.required_skills.slice(0, 2).map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills Development */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Skill Development</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/assignments')}>
                View All Certifications
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center hover:border-primary transition-colors">
                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Digital Marketing</h3>
                <p className="text-xs text-muted-foreground mb-3">Master marketing strategies</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/assignments')}>
                  Start Certification
                </Button>
              </div>
              <div className="p-4 border rounded-lg text-center hover:border-primary transition-colors">
                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Graphic Design</h3>
                <p className="text-xs text-muted-foreground mb-3">Showcase your creativity</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/assignments')}>
                  Start Certification
                </Button>
              </div>
              <div className="p-4 border rounded-lg text-center hover:border-primary transition-colors">
                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Content Writing</h3>
                <p className="text-xs text-muted-foreground mb-3">Prove your writing skills</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/assignments')}>
                  Start Certification
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;