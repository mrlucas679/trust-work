import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Award,
  ChevronLeft,
  CheckCircle,
  Shield,
  Loader2
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getSkillTestById, submitSkillTestResult } from "@/lib/api/skill-tests";
import type { SkillTest } from "@/lib/api/skill-tests";

const AssessmentTake = () => {
  const navigate = useNavigate();
  const { assessmentId } = useParams();

  const [test, setTest] = useState<SkillTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTest() {
      if (!assessmentId) return;

      try {
        const testData = await getSkillTestById(assessmentId);
        if (testData) {
          setTest(testData);
          setTimeLeft(testData.duration_minutes * 60);
        }
      } catch (error) {
        console.error('Error fetching skill test:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTest();
  }, [assessmentId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || !test) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, test]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Assessment not found</p>
            <Button onClick={() => navigate('/skill-tests')}>Back to Tests</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAnswerSelect = (answer: string) => {
    const question = test.questions[currentQuestion];
    setSelectedAnswers({
      ...selectedAnswers,
      [question.id]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const timeTakenMinutes = Math.round((Date.now() - startTime) / 60000);
      const result = await submitSkillTestResult({
        skill_test_id: test.id,
        answers: selectedAnswers,
        time_taken_minutes: timeTakenMinutes
      });

      navigate(`/skill-test-results/${result.id}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestion + 1) / test.questions.length) * 100;
  const question = test.questions[currentQuestion];
  const isAnswered = selectedAnswers[question.id] !== undefined;

  return (
    <div className="min-h-screen bg-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">Skill Test Required</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${timeLeft < 60 ? 'text-destructive' : 'text-muted-foreground'}`} />
              <span className={`font-mono text-lg ${timeLeft < 60 ? 'text-destructive' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <Badge variant="outline">
              Question {currentQuestion + 1} of {test.questions.length}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">{test.title}</h2>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {currentQuestion + 1}
              </div>
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.type === 'multiple_choice' && question.options ? (
              question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 text-left border rounded-lg transition-all hover:bg-muted/50 ${selectedAnswers[question.id] === option
                    ? 'border-primary bg-primary/5'
                    : 'border-muted'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedAnswers[question.id] === option
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                      }`}>
                      {selectedAnswers[question.id] === option && (
                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              ))
            ) : question.type === 'true_false' ? (
              ['True', 'False'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 text-left border rounded-lg transition-all hover:bg-muted/50 ${selectedAnswers[question.id] === option
                    ? 'border-primary bg-primary/5'
                    : 'border-muted'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedAnswers[question.id] === option
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                      }`}>
                      {selectedAnswers[question.id] === option && (
                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))
            ) : (
              <textarea
                className="w-full p-4 border rounded-lg min-h-[200px]"
                placeholder="Type your answer here..."
                value={selectedAnswers[question.id] || ''}
                onChange={(e) => handleAnswerSelect(e.target.value)}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {test.difficulty} level · {question.points} points
            </span>
          </div>

          <Button
            onClick={handleNext}
            disabled={!isAnswered || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : currentQuestion === test.questions.length - 1 ? (
              'Submit'
            ) : (
              'Next'
            )}
          </Button>
        </div>

        {/* Question Navigator */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium mr-2">Questions:</span>
              {test.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={`h-8 w-8 rounded text-sm font-medium transition-colors ${index === currentQuestion
                    ? 'bg-primary text-primary-foreground'
                    : selectedAnswers[q.id] !== undefined
                      ? 'bg-verified text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentTake;