import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, ExternalLink, Plus, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockJobSeeker } from "@/data/mockData";

const Portfolio = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-muted/20 p-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Portfolio</h1>
            <p className="text-muted-foreground">Showcase your best work and achievements</p>
          </div>
          <Button onClick={() => navigate('/portfolio/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>

        {/* Portfolio Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{mockJobSeeker.completedJobs}</div>
              <div className="text-sm text-muted-foreground">Completed Projects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-warning mr-1" />
                <span className="text-3xl font-bold">{mockJobSeeker.rating}</span>
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">{mockJobSeeker.skills.length}</div>
              <div className="text-sm text-muted-foreground">Verified Skills</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-verified mb-2">3</div>
              <div className="text-sm text-muted-foreground">Skill Badges</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Portfolio Projects */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Portfolio Projects</h2>
              <Button variant="outline" size="sm">View Public Profile</Button>
            </div>

            {mockJobSeeker.portfolio.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {project.title}
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{project.client}</p>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-warning mr-1" />
                      <span className="font-semibold">{project.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{project.description}</p>

                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    Completed on {new Date(project.completedDate).toLocaleDateString()}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
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
                  {mockJobSeeker.skills.map((skill) => (
                    <div key={skill} className="flex items-center justify-between">
                      <Badge variant="outline" className="border-verified text-verified">
                        {skill}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/assessments')}>
                        Upgrade
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => navigate('/assessments')}
                >
                  Take More Assessments
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