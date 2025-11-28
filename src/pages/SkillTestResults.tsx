import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Award,
  Star,
  Download,
  Share2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSkillTestResult, getSkillTestById } from "@/lib/api/skill-tests";
import type { SkillTest, SkillTestResult } from "@/lib/api/skill-tests";

const AssessmentResults = () => {
  const navigate = useNavigate();
  const { resultId } = useParams();

  const [result, setResult] = useState<SkillTestResult | null>(null);
  const [test, setTest] = useState<SkillTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!resultId) return;

      try {
        const resultData = await getSkillTestResult(resultId);
        if (resultData) {
          setResult(resultData);
          const testData = await getSkillTestById(resultData.skill_test_id);
          setTest(testData);
        }
      } catch (error) {
        console.error('Error fetching result:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [resultId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result || !test) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Result not found</p>
            <Button onClick={() => navigate('/skill-tests')}>Back to Tests</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const score = result.score;
  const isPassing = result.passed;
  const totalQuestions = test.questions.length;
  const getScoreColor = () => {
    if (score >= 90) return "text-verified";
    if (score >= test.passing_score) return "text-primary";
    return "text-flagged";
  };

  const getPerformanceLevel = () => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= test.passing_score) return "Good";
    return "Needs Improvement";
  };

  // Calculate correct answers from result
  const correctAnswers = test.questions.filter(q => {
    const userAnswer = result.answers?.[q.id];
    return userAnswer === q.correct_answer;
  }).length;

  return (
    <div className="min-h-screen bg-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <Card className="mb-8 text-center">
          <CardContent className="p-8">
            <div className="mb-6">
              {isPassing ? (
                <div className="h-20 w-20 bg-verified/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-10 w-10 text-verified" />
                </div>
              ) : (
                <div className="h-20 w-20 bg-flagged/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-10 w-10 text-flagged" />
                </div>
              )}

              <h1 className="text-3xl font-bold mb-2">
                {isPassing ? 'Congratulations!' : 'Assessment Complete'}
              </h1>
              <p className="text-muted-foreground">
                {isPassing
                  ? 'You have successfully completed the assessment and earned your badge!'
                  : 'You can retake this assessment to improve your score.'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <div className={`text-4xl font-bold mb-2 ${getScoreColor()}`}>
                  {score}%
                </div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">
                  {correctAnswers}/{totalQuestions}
                </div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2 text-primary">
                  {getPerformanceLevel()}
                </div>
                <div className="text-sm text-muted-foreground">Performance</div>
              </div>
            </div>

            {isPassing && (
              <Badge className="bg-verified text-white text-lg py-2 px-4">
                <Award className="h-5 w-5 mr-2" />
                {test.category || 'Skill Test'} - Badge Earned!
              </Badge>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Performance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {test.questions.map((question, index) => {
                const userAnswer = result.answers?.[question.id];
                const isCorrect = userAnswer === question.correct_answer;

                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-verified mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-flagged mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          Question {index + 1}: {question.question}
                        </p>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Your answer: </span>
                            <span className={isCorrect ? "text-verified" : "text-flagged"}>
                              {userAnswer || 'Not answered'}
                            </span>
                          </div>
                          {!isCorrect && question.correct_answer && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Correct answer: </span>
                              <span className="text-verified">
                                {question.correct_answer}
                              </span>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            Points: {question.points}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="space-y-6">
            {/* Badge Card */}
            {isPassing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-verified" />
                    Your New Badge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 border rounded-lg bg-verified/5 border-verified">
                    <Award className="h-12 w-12 text-verified mx-auto mb-3" />
                    <div className="font-semibold text-lg mb-1">{test.title}</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Earned on {new Date(result.completed_at).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" variant="outline" disabled>
                        <Download className="h-4 w-4 mr-2" />
                        Download Certificate
                      </Button>
                      <Button size="sm" variant="outline" disabled>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => navigate('/applications')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  View My Applications
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/jobs')}
                >
                  Browse More Jobs
                </Button>

                {!isPassing && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/skill-test/${test.id}`)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Test
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/skill-tests')}
                >
                  Back to Skill Tests
                </Button>
              </CardContent>
            </Card>

            {/* Improvement Tips */}
            {!isPassing && (
              <Card>
                <CardHeader>
                  <CardTitle>Tips for Improvement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Review the topic materials</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Practice with online resources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Take your time on each question</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Read questions carefully</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;