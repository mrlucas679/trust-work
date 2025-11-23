import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, ExternalLink, Plus, Award, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddPortfolioModal } from "@/components/portfolio/AddPortfolioModal";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useState, useEffect } from "react";

const Portfolio = () => {
  const navigate = useNavigate();
  const { supabase, user } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<{
    completedJobs: number;
    rating: number;
    skills: string[];
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('skills')
          .eq('id', user.id)
          .single();

        if (!mounted) return;

        if (!error && data) {
          // TODO: Fetch completedJobs and rating from assignments/reviews when implemented
          setProfile({
            completedJobs: 0,
            rating: 0,
            skills: data.skills || [],
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadProfile();
    return () => { mounted = false; };
  }, [supabase, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-muted/20 p-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Portfolio</h1>
            <p className="text-muted-foreground">Showcase your best work and achievements</p>
          </div>
          <AddPortfolioModal>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </AddPortfolioModal>
        </div>

        {/* Portfolio Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{profile?.completedJobs || 0}</div>
              <div className="text-sm text-muted-foreground">Completed Projects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-warning mr-1" />
                <span className="text-3xl font-bold">{profile?.rating || 0}</span>
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">{profile?.skills.length || 0}</div>
              <div className="text-sm text-muted-foreground">Verified Skills</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-verified mb-2">0</div>
              <div className="text-sm text-muted-foreground">Skill Badges</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Portfolio Projects */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Portfolio Projects</h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>View Public Profile</Button>
            </div>

            {/* Empty state for portfolio - TODO: implement portfolio table */}
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Portfolio Projects Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Showcase your work by adding portfolio projects
                </p>
                <AddPortfolioModal>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Project
                  </Button>
                </AddPortfolioModal>
              </CardContent>
            </Card>
          </div>

          {/* Skills & Badges Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Verified Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile?.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill) => (
                      <div key={skill} className="flex items-center justify-between">
                        <Badge variant="outline" className="border-verified text-verified">
                          {skill}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/skill-tests')}>
                          Upgrade
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet</p>
                  )}
                </div>
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => navigate('/skill-tests')}
                >
                  Take Certifications
                </Button>
              </CardContent>
            </Card>

            {/* Achievement Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Achievement Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 border rounded-lg">
                    <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-xs font-medium">Excel Expert</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Award className="h-8 w-8 text-accent mx-auto mb-2" />
                    <div className="text-xs font-medium">Marketing Pro</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Award className="h-8 w-8 text-verified mx-auto mb-2" />
                    <div className="text-xs font-medium">Service Star</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg opacity-50">
                    <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <div className="text-xs font-medium">Top Rated</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;