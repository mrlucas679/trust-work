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
  RotateCcw
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { mockAssessments } from "@/data/mockData";

const AssessmentResults = () => {
  const navigate = useNavigate();
  const { assessmentId } = useParams();
  const location = useLocation();
  
  const assessment = mockAssessments.find(a => a.id === assessmentId);
  const { score, correctAnswers, totalQuestions } = location.state || { 
    score: 85, 
    correctAnswers: 2, 
    totalQuestions: 3 
  };

  if (!assessment) {
    return <div>Assessment not found</div>;
  }

  const isPassing = score >= 70;
  const getScoreColor = () => {
    if (score >= 90) return "text-verified";
    if (score >= 70) return "text-primary";
    return "text-flagged";
  };

  const getPerformanceLevel = () => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    return "Needs Improvement";
  };

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
                {assessment.badge} - Badge Earned!
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
              {assessment.questions.map((question, index) => {
                const userAnswer = index < correctAnswers ? question.correctAnswer : (question.correctAnswer + 1) % question.options.length;
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={index} className="border rounded-lg p-4">
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
                              {question.options[userAnswer]}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Correct answer: </span>
                              <span className="text-verified">
                                {question.options[question.correctAnswer]}
                              </span>
                            </div>
                          )}
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
                    <div className="font-semibold text-lg mb-1">{assessment.badge}</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Earned on {new Date().toLocaleDateString()}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Certificate
                      </Button>
                      <Button size="sm" variant="outline">
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
                  onClick={() => navigate('/assessments')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Take More Assessments
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/portfolio')}
                >
                  Update Your Portfolio
                </Button>
                
                {!isPassing && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/assessment/${assessmentId}`)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Assessment
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/jobs')}
                >
                  Browse Jobs
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