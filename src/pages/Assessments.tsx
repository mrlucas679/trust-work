import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Award, 
  Clock, 
  CheckCircle, 
  Star, 
  Trophy,
  BookOpen,
  Target
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockAssessments } from "@/data/mockData";

const Assessments = () => {
  const navigate = useNavigate();
  
  // Mock user progress data
  const completedAssessments = ['1', '2']; // IDs of completed assessments
  const skillProgress = {
    'Excel': 85,
    'Marketing': 92,
    'Customer Service': 78,
    'Programming': 45
  };

  return (
    <div className="min-h-screen bg-muted/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Skill Assessments</h1>
          <p className="text-muted-foreground">
            Prove your skills and earn verified badges to stand out to employers
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{completedAssessments.length}</div>
              <div className="text-sm text-muted-foreground">Badges Earned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">92%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-verified mx-auto mb-2" />
              <div className="text-2xl font-bold">{mockAssessments.length - completedAssessments.length}</div>
              <div className="text-sm text-muted-foreground">Available Tests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold">Top 15%</div>
              <div className="text-sm text-muted-foreground">Skill Ranking</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Available Assessments */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Available Assessments</h2>
            
            <div className="space-y-4">
              {mockAssessments.map((assessment) => {
                const isCompleted = completedAssessments.includes(assessment.id);
                
                return (
                  <Card key={assessment.id} className={isCompleted ? 'border-verified' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Award className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {assessment.title}
                              {isCompleted && (
                                <CheckCircle className="h-5 w-5 text-verified" />
                              )}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {assessment.description}
                            </p>
                          </div>
                        </div>
                        <Badge variant={isCompleted ? "default" : "outline"}>
                          {isCompleted ? 'Completed' : 'Available'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {assessment.questions.length} questions · ~15 minutes
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Trophy className="h-4 w-4 mr-1" />
                          {assessment.badge}
                        </div>
                      </div>
                      
                      {isCompleted ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-warning" />
                            <span className="font-medium">Score: 92%</span>
                            <Badge variant="outline" className="border-verified text-verified">
                              Badge Earned
                            </Badge>
                          </div>
                          <Button variant="outline" onClick={() => navigate(`/assessment/${assessment.id}/certificate`)}>
                            View Certificate
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={() => navigate(`/assessment/${assessment.id}`)}>
                          Start Assessment
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skill Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(skillProgress).map(([skill, progress]) => (
                  <div key={skill}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{skill}</span>
                      <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Earned Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Earned Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 border rounded-lg border-verified bg-verified/5">
                    <Award className="h-8 w-8 text-verified mx-auto mb-2" />
                    <div className="text-xs font-medium">Excel Certified</div>
                    <div className="text-xs text-muted-foreground">92% Score</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg border-primary bg-primary/5">
                    <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-xs font-medium">Marketing Pro</div>
                    <div className="text-xs text-muted-foreground">88% Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Why Take Assessments?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-verified" />
                  <span>Verify your skills to employers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-verified" />
                  <span>Stand out in job applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-verified" />
                  <span>Unlock higher-paying opportunities</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-verified" />
                  <span>Build your professional credibility</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessments;