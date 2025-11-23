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
  Target,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSkillTests, getMySkillTestResults } from "@/lib/api/skill-tests";
import type { SkillTest, SkillTestResult } from "@/lib/api/skill-tests";

const Assessments = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<Omit<SkillTest, 'questions'>[]>([]);
  const [results, setResults] = useState<SkillTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [testsData, resultsData] = await Promise.all([
          getSkillTests(),
          getMySkillTestResults()
        ]);
        setTests(testsData);
        setResults(resultsData);
      } catch (error) {
        console.error('Error fetching skill tests:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calculate stats from results
  const completedTestIds = results.filter(r => r.passed).map(r => r.skill_test_id);
  const averageScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;

  // Calculate skill progress from results (by category)
  const skillProgress: Record<string, number> = {};
  results.forEach(result => {
    const test = tests.find(t => t.id === result.skill_test_id);
    if (test?.category) {
      if (!skillProgress[test.category]) {
        skillProgress[test.category] = result.score;
      } else {
        skillProgress[test.category] = Math.max(skillProgress[test.category], result.score);
      }
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <div className="text-2xl font-bold">{completedTestIds.length}</div>
              <div className="text-sm text-muted-foreground">Badges Earned</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">{averageScore}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-verified mx-auto mb-2" />
              <div className="text-2xl font-bold">{tests.length - completedTestIds.length}</div>
              <div className="text-sm text-muted-foreground">Available Tests</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold">{results.length > 0 ? 'Active' : 'New'}</div>
              <div className="text-sm text-muted-foreground">Status</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Available Assessments */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Available Assessments</h2>

            {tests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No skill tests available yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tests.map((test) => {
                  const isCompleted = completedTestIds.includes(test.id);
                  const testResult = results.find(r => r.skill_test_id === test.id && r.passed);

                  return (
                    <Card key={test.id} className={isCompleted ? 'border-verified' : ''}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Award className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {test.title}
                                {isCompleted && (
                                  <CheckCircle className="h-5 w-5 text-verified" />
                                )}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {test.description || 'No description available'}
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
                            {test.duration_minutes} minutes
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Trophy className="h-4 w-4 mr-1" />
                            {test.difficulty}
                          </div>
                          {test.category && (
                            <Badge variant="outline">{test.category}</Badge>
                          )}
                        </div>

                        {isCompleted && testResult ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-warning" />
                              <span className="font-medium">Score: {testResult.score}%</span>
                              <Badge variant="outline" className="border-verified text-verified">
                                Badge Earned
                              </Badge>
                            </div>
                            <Button variant="outline" onClick={() => navigate(`/skill-test-results/${testResult.id}`)}>
                              View Result
                            </Button>
                          </div>
                        ) : (
                          <Button onClick={() => navigate(`/skill-test/${test.id}`)}>
                            Start Assessment
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skill Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.keys(skillProgress).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No skill progress yet. Take a test to get started!</p>
                ) : (
                  Object.entries(skillProgress).map(([skill, progress]) => (
                    <div key={skill}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{skill}</span>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Earned Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Earned Badges</CardTitle>
              </CardHeader>
              <CardContent>
                {completedTestIds.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Complete assessments to earn badges
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {results.filter(r => r.passed).slice(0, 4).map((result) => {
                      const test = tests.find(t => t.id === result.skill_test_id);
                      return (
                        <div key={result.id} className="text-center p-3 border rounded-lg border-verified bg-verified/5">
                          <Award className="h-8 w-8 text-verified mx-auto mb-2" />
                          <div className="text-xs font-medium">{test?.title || 'Test'}</div>
                          <div className="text-xs text-muted-foreground">{result.score}% Score</div>
                        </div>
                      );
                    })}
                  </div>
                )}
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