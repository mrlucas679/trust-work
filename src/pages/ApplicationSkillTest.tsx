import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    TrendingUp,
    Target
} from "lucide-react";
import { mockJobs } from "@/data/mockData";
import { generateTestQuestions } from "@/data/skillTestQuestions";
import type { ApplicationTestQuestion } from "@/types/skillTest";

type TestStage = "warning" | "testing" | "results";

interface TestAnswer {
    questionId: string;
    selectedAnswerIndex: number | null;
}const ApplicationSkillTest = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State - declare all state before any conditional logic
    const [stage, setStage] = useState<TestStage>("warning");
    const [agreedToRules, setAgreedToRules] = useState(false);
    const [questions, setQuestions] = useState<ApplicationTestQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<TestAnswer[]>([]);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [cheatingDetected, setCheatingDetected] = useState(false);
    const [tabSwitches, setTabSwitches] = useState(0);
    const [score, setScore] = useState(0);
    const [passed, setPassed] = useState(false);
    const [motivationalMessage, setMotivationalMessage] = useState("");

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const job = mockJobs.find(j => j.id === id);
    const config = job?.skillTestConfig;

    // Motivational messages based on progress
    const getMotivationalMessage = (progressPercent: number, answered: number, total: number): string => {
        if (progressPercent === 0) {
            return "🚀 You've got this! Take your time and read each question carefully.";
        } else if (progressPercent < 25) {
            return "💪 Great start! Keep up the momentum.";
        } else if (progressPercent < 50) {
            return "⭐ Excellent progress! You're doing great.";
        } else if (progressPercent < 75) {
            return "🔥 More than halfway there! Stay focused.";
        } else if (progressPercent < 100) {
            return "🎯 Almost done! Finish strong!";
        } else if (answered === total) {
            return "✨ All questions answered! Review your answers or submit when ready.";
        }
        return "💡 Take your time and do your best!";
    };

    // Check for draft application
    useEffect(() => {
        const draftData = sessionStorage.getItem(`draft-application-${id}`);
        if (!draftData) {
            navigate(`/apply/${id}`);
        }
    }, [id, navigate]);

    // Submit test handler
    const handleSubmitTest = useCallback((autoSubmit = false, cheating = false) => {
        if (!config || questions.length === 0) return;

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        }

        let correctCount = 0;
        answers.forEach((answer, index) => {
            if (answer.selectedAnswerIndex === questions[index].correctAnswer) {
                correctCount++;
            }
        });

        const finalScore = (correctCount / questions.length) * 100;
        const roundedScore = Math.round(finalScore);
        setScore(roundedScore);

        const testPassed = !cheating && finalScore >= config.minimumPassScore;
        setPassed(testPassed);

        const result = {
            jobId: id,
            score: roundedScore,
            passed: testPassed,
            cheatingDetected: cheating,
            tabSwitches,
            completedAt: new Date().toISOString(),
            answers: answers.map((answer, index) => ({
                questionId: questions[index].id,
                question: questions[index].question,
                skill: questions[index].skill,
                selectedAnswerIndex: answer.selectedAnswerIndex,
                selectedAnswer: answer.selectedAnswerIndex !== null ? questions[index].options[answer.selectedAnswerIndex] : null,
                correctAnswerIndex: questions[index].correctAnswer,
                correctAnswer: questions[index].options[questions[index].correctAnswer],
                isCorrect: answer.selectedAnswerIndex === questions[index].correctAnswer
            }))
        };
        sessionStorage.setItem(`test-result-${id}`, JSON.stringify(result));

        setStage("results");
    }, [answers, questions, config, tabSwitches, id]);

    // Timer countdown
    useEffect(() => {
        if (stage === "testing" && timeRemaining > 0 && !cheatingDetected) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleSubmitTest(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [stage, timeRemaining, cheatingDetected, handleSubmitTest]);

    // Anti-cheat detection
    useEffect(() => {
        if (stage !== "testing") return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setTabSwitches(prev => {
                    const newCount = prev + 1;
                    if (newCount >= 3) {
                        setCheatingDetected(true);
                        handleSubmitTest(true, true);
                    }
                    return newCount;
                });
            }
        };

        const handleBlur = () => {
            setTabSwitches(prev => {
                const newCount = prev + 1;
                if (newCount >= 3) {
                    setCheatingDetected(true);
                    handleSubmitTest(true, true);
                }
                return newCount;
            });
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        document.addEventListener("contextmenu", handleContextMenu);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, [stage, handleSubmitTest]);

    // Exit full-screen on unmount
    useEffect(() => {
        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        };
    }, []);

    // Handlers
    const handleStartTest = () => {
        if (!config) return;

        const generatedQuestions = generateTestQuestions(
            config.requiredSkills,
            config.questionCount
        );
        setQuestions(generatedQuestions);

        const initialAnswers: TestAnswer[] = generatedQuestions.map(q => ({
            questionId: q.id,
            selectedAnswerIndex: null
        }));
        setAnswers(initialAnswers);

        setTimeRemaining(config.duration * 60);

        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => { });
        }

        // Set initial motivational message
        setMotivationalMessage(getMotivationalMessage(0, 0, generatedQuestions.length));

        setStage("testing");
    };

    const handleAnswerChange = (selectedOption: string) => {
        const selectedIndex = currentQuestion.options.indexOf(selectedOption);
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIndex] = {
            ...updatedAnswers[currentQuestionIndex],
            selectedAnswerIndex: selectedIndex
        };
        setAnswers(updatedAnswers);

        // Update motivational message when answer changes
        const answeredCount = updatedAnswers.filter(a => a.selectedAnswerIndex !== null).length;
        const progress = (answeredCount / questions.length) * 100;
        setMotivationalMessage(getMotivationalMessage(progress, answeredCount, questions.length));
    };

    const handleFinalSubmit = () => {
        sessionStorage.removeItem(`draft-application-${id}`);
        sessionStorage.removeItem(`test-result-${id}`);
        navigate('/applications');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Validation - after all hooks
    if (!job || !config?.enabled) {
        return (
            <div className="bg-muted/20 p-6">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                            This job does not require a skill test.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
    const answeredCount = answers.filter(a => a.selectedAnswerIndex !== null).length;

    // WARNING STAGE
    if (stage === "warning") {
        return (
            <div className="bg-muted/20 p-6">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                            Ready to Show Your Skills?
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">
                            You're about to take the skill test for <strong>{job?.title}</strong> at <strong>{job?.company}</strong>
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Motivational Banner */}
                        <Alert className="bg-primary/5 border-primary/20">
                            <Target className="h-5 w-5 text-primary" />
                            <AlertDescription>
                                <strong>💪 You've prepared for this moment!</strong> Trust your knowledge, stay calm, and read each question carefully.
                                This is your opportunity to demonstrate your skills and land your dream job!
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Test Details</h3>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span><strong>Skills:</strong> {config.requiredSkills.join(", ")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span><strong>Questions:</strong> {config.questionCount} multiple-choice questions</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span><strong>Duration:</strong> {config.duration} minutes</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span><strong>Pass Score:</strong> {config.minimumPassScore}% or higher</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2 text-destructive">Anti-Cheating Rules</h3>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                        <span>The test will run in <strong>full-screen mode</strong></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                        <span>You have <strong>3 tab switches/window blur violations</strong> before automatic failure</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                        <span>Right-click and context menu are <strong>disabled</strong></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                        <span>The test will <strong>auto-submit when time runs out</strong></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                        <span>Cheating detection will result in <strong>automatic rejection</strong></span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">What Happens Next</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• You'll see one question at a time with multiple-choice answers</li>
                                    <li>• You can navigate between questions and change your answers</li>
                                    <li>• After submission, you'll see your score and which questions you got wrong</li>
                                    <li>• If you pass, your application will be automatically submitted to the employer</li>
                                    <li>• If you fail, your application will be rejected (no retakes allowed for this job)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 bg-muted p-4 rounded-lg">
                            <Checkbox
                                id="agree"
                                checked={agreedToRules}
                                onCheckedChange={(checked) => setAgreedToRules(checked === true)}
                            />
                            <Label
                                htmlFor="agree"
                                className="text-sm font-medium leading-none cursor-pointer"
                            >
                                I understand the rules and I'm ready to take the test
                            </Label>
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            disabled={!agreedToRules}
                            onClick={handleStartTest}
                        >
                            Start Skill Test
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // TESTING STAGE
    if (stage === "testing" && currentQuestion) {
        return (
            <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
                <div className="p-6">
                    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                <span className="font-mono text-lg font-semibold">
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                            {tabSwitches > 0 && (
                                <Alert variant="destructive" className="py-2 px-3">
                                    <AlertDescription className="text-sm">
                                        Violations: {tabSwitches}/3
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Progress: {answeredCount}/{questions.length} answered
                        </div>
                    </div>

                    <Progress value={progress} className="mb-4" />

                    {/* Motivational Message */}
                    {motivationalMessage && (
                        <Alert className="mb-6 bg-primary/5 border-primary/20 max-w-4xl mx-auto">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <AlertDescription className="text-sm font-medium">
                                {motivationalMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card className="max-w-4xl mx-auto">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="text-sm text-muted-foreground mb-2">
                                        Question {currentQuestionIndex + 1} of {questions.length} • {currentQuestion.skill} • {currentQuestion.difficulty}
                                    </div>
                                    <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup
                                value={answers[currentQuestionIndex]?.selectedAnswerIndex !== null
                                    ? currentQuestion.options[answers[currentQuestionIndex].selectedAnswerIndex]
                                    : ""}
                                onValueChange={handleAnswerChange}
                            >
                                {currentQuestion.options.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                        <RadioGroupItem value={option} id={`option-${index}`} />
                                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>

                            <div className="flex items-center justify-between pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestionIndex === 0}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Previous
                                </Button>

                                {currentQuestionIndex === questions.length - 1 ? (
                                    <Button
                                        onClick={() => handleSubmitTest(false)}
                                        disabled={answeredCount < questions.length}
                                    >
                                        Submit Test
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                )}
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-3">Jump to question:</p>
                                <div className="grid grid-cols-10 gap-2">
                                    {questions.map((_, index) => (
                                        <Button
                                            key={index}
                                            variant={currentQuestionIndex === index ? "default" : "outline"}
                                            size="sm"
                                            className={`h-10 ${answers[index]?.selectedAnswerIndex !== null ? "border-green-500" : ""}`}
                                            onClick={() => setCurrentQuestionIndex(index)}
                                        >
                                            {index + 1}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // RESULTS STAGE
    if (stage === "results") {
        return (
            <div className="bg-muted/20 p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                {cheatingDetected ? (
                                    <>
                                        <XCircle className="h-8 w-8 text-destructive" />
                                        Test Failed - Cheating Detected
                                    </>
                                ) : passed ? (
                                    <>
                                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                                        🎉 Congratulations! You Passed!
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-8 w-8 text-destructive" />
                                        Test Not Passed
                                    </>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {cheatingDetected ? (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        Your test was automatically failed due to {tabSwitches} tab switch violations.
                                        Your application has been rejected.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <>
                                    {/* Motivational message based on score */}
                                    {passed && (
                                        <Alert className="bg-green-50 dark:bg-green-950/20 border-green-500 mb-4">
                                            <TrendingUp className="h-5 w-5 text-green-500" />
                                            <AlertDescription className="text-green-700 dark:text-green-300">
                                                <strong>Outstanding performance!</strong> Your skills have impressed us.
                                                {score >= 90 ? " You scored exceptionally high - well done!" : score >= 80 ? " Excellent work!" : " Great job!"}
                                                {" "}Your application is now being reviewed by the employer.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    {!passed && (
                                        <Alert className="bg-orange-50 dark:bg-orange-950/20 border-orange-500 mb-4">
                                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                                            <AlertDescription className="text-orange-700 dark:text-orange-300">
                                                <strong>Don't give up!</strong> While you didn't pass this time, remember that every test is a learning opportunity.
                                                Review the questions below to see where you can improve, and keep building your skills. Your next opportunity is waiting!
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-3xl font-bold">{score}%</div>
                                            <div className="text-sm text-muted-foreground">Your Score</div>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold">{config.minimumPassScore}%</div>
                                            <div className="text-sm text-muted-foreground">Required</div>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold">
                                                {answers.filter((a, i) => a.selectedAnswerIndex === questions[i]?.correctAnswer).length}/{questions.length}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Correct</div>
                                        </div>
                                    </div>

                                    <Alert variant={passed ? "default" : "destructive"}>
                                        <AlertDescription>
                                            {passed ? (
                                                "Your application will be submitted to the employer with your test results."
                                            ) : (
                                                "Unfortunately, you did not meet the minimum passing score. Your application will be rejected. You cannot retake the test for this job."
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {!cheatingDetected && questions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Detailed Results</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {questions.map((question, index) => {
                                    const userAnswerIndex = answers[index]?.selectedAnswerIndex;
                                    const userAnswer = userAnswerIndex !== null ? question.options[userAnswerIndex] : null;
                                    const correctAnswer = question.options[question.correctAnswer];
                                    const isCorrect = userAnswerIndex === question.correctAnswer;

                                    return (
                                        <div
                                            key={question.id}
                                            className={`p-4 rounded-lg border ${isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-destructive bg-destructive/5"
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {isCorrect ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                                                )}
                                                <div className="flex-1 space-y-2">
                                                    <div className="text-sm text-muted-foreground">
                                                        Question {index + 1} • {question.skill} • {question.difficulty}
                                                    </div>
                                                    <div className="font-medium">{question.question}</div>
                                                    <div className="space-y-1 text-sm">
                                                        <div>
                                                            <span className="text-muted-foreground">Your answer: </span>
                                                            <span className={isCorrect ? "text-green-600 dark:text-green-400" : "text-destructive"}>
                                                                {userAnswer || "Not answered"}
                                                            </span>
                                                        </div>
                                                        {!isCorrect && (
                                                            <div>
                                                                <span className="text-muted-foreground">Correct answer: </span>
                                                                <span className="text-green-600 dark:text-green-400">
                                                                    {correctAnswer}
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
                    )}

                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleFinalSubmit}
                    >
                        {passed ? "Submit Application to Employer" : "Return to My Applications"}
                    </Button>
                </div>
            </div>
        );
    }

    return null;
};

export default ApplicationSkillTest;
