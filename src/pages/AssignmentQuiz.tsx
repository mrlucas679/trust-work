import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { SKILL_DISPLAY_NAMES, LEVEL_DISPLAY_NAMES, LEVEL_REQUIREMENTS, SkillCategory, AssignmentLevel, Question } from '@/types/assignments';
import { getQuestionBank, getRandomQuestions } from '@/data/assignmentQuestions';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const AssignmentQuiz = () => {
    const navigate = useNavigate();
    const { skill, level } = useParams<{ skill: SkillCategory; level: AssignmentLevel }>();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeRemaining, setTimeRemaining] = useState(2400); // 40 minutes in seconds
    const [assignmentStarted, setAssignmentStarted] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [failedReason, setFailedReason] = useState<string | null>(null);

    const questionStartTimeRef = useRef<number>(Date.now());
    const isInProgressRef = useRef(false);

    const handleSubmit = useCallback((autoSubmit = false) => {
        isInProgressRef.current = false;
        setAssignmentStarted(false);

        // Calculate score
        let correctCount = 0;
        questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                correctCount++;
            }
        });

        const scorePercentage = Math.round((correctCount / questions.length) * 100);
        const passed = scorePercentage >= 70;
        const timeTaken = LEVEL_REQUIREMENTS[level!].timeAllowed * 60 - timeRemaining;

        // Navigate to results
        navigate(`/assignments/${skill}/${level}/results`, {
            state: {
                questions,
                answers,
                score: scorePercentage,
                correctCount,
                totalQuestions: questions.length,
                passed,
                timeTaken,
                autoSubmit,
            },
        });
    }, [questions, answers, timeRemaining, navigate, skill, level]);

    const handleAutoFail = useCallback((reason: string) => {
        isInProgressRef.current = false;
        setFailedReason(reason);
        setAssignmentStarted(false);

        // Navigate to failed results after a short delay
        setTimeout(() => {
            navigate(`/assignments/${skill}/${level}/results`, {
                state: {
                    failed: true,
                    reason: reason,
                    score: 0,
                    timeTaken: LEVEL_REQUIREMENTS[level!].timeAllowed * 60 - timeRemaining,
                },
            });
        }, 2000);
    }, [navigate, skill, level, timeRemaining]);

    const handleTimeOut = useCallback(() => {
        isInProgressRef.current = false;
        setAssignmentStarted(false);
        handleSubmit(true);
    }, [handleSubmit]);

    // Load questions on component mount
    useEffect(() => {
        if (!skill || !level) {
            navigate('/assignments');
            return;
        }

        const questionBank = getQuestionBank(skill, level);
        if (!questionBank) {
            console.error('Question bank not found');
            navigate('/assignments');
            return;
        }

        const requirements = LEVEL_REQUIREMENTS[level];
        const selectedQuestions = getRandomQuestions(questionBank, requirements.totalQuestions);
        setQuestions(selectedQuestions);
        setAssignmentStarted(true);
        isInProgressRef.current = true;
        questionStartTimeRef.current = Date.now();
    }, [skill, level, navigate]);

    // Timer countdown
    useEffect(() => {
        if (!assignmentStarted || failedReason) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleTimeOut();
                    return 0;
                }

                // Show warning at 5 minutes
                if (prev === 300) {
                    setShowWarningModal(true);
                    setTimeout(() => setShowWarningModal(false), 3000);
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [assignmentStarted, failedReason, handleTimeOut]);

    // Tab/Window switch detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isInProgressRef.current && !failedReason) {
                handleAutoFail('tab-switch');
            }
        };

        const handleWindowBlur = () => {
            if (isInProgressRef.current && !failedReason) {
                handleAutoFail('window-blur');
            }
        };

        // Prevent context menu
        const handleContextMenu = (e: MouseEvent) => {
            if (isInProgressRef.current) {
                e.preventDefault();
            }
        };

        // Prevent text selection
        const handleSelectStart = (e: Event) => {
            if (isInProgressRef.current) {
                e.preventDefault();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('selectstart', handleSelectStart);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('selectstart', handleSelectStart);
        };
    }, [failedReason, handleAutoFail]);

    // Prevent browser back button
    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            if (isInProgressRef.current) {
                e.preventDefault();
                window.history.pushState(null, '', window.location.href);
            }
        };

        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const handleAnswerChange = (answer: string) => {
        setAnswers({
            ...answers,
            [currentQuestionIndex]: answer,
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            questionStartTimeRef.current = Date.now();
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            questionStartTimeRef.current = Date.now();
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleReview = () => {
        setShowReviewModal(true);
    };

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;
    const isTimeCritical = timeRemaining <= 300; // 5 minutes

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-lg">Loading assignment...</p>
            </div>
        );
    }

    if (failedReason) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full border-destructive">
                    <CardContent className="p-8 text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/20 mb-4">
                            <AlertCircle className="h-10 w-10 text-destructive" />
                        </div>
                        <h2 className="text-2xl font-bold text-destructive">Assignment Failed</h2>
                        <p className="text-muted-foreground">
                            {failedReason === 'tab-switch'
                                ? 'You switched tabs during the assignment. This attempt has been marked as failed.'
                                : 'You switched to another window/app during the assignment. This attempt has been marked as failed.'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Redirecting to results...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Fixed Header */}
            <div className="sticky top-0 z-50 bg-card border-b shadow-sm">
                <div className="container max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold">
                                {LEVEL_DISPLAY_NAMES[level!]}: {SKILL_DISPLAY_NAMES[skill!]}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </p>
                        </div>
                        <div className={`text-right ${isTimeCritical ? 'text-destructive' : ''}`}>
                            <div className="flex items-center gap-2">
                                <Clock className={`h-5 w-5 ${isTimeCritical ? 'animate-pulse' : ''}`} />
                                <span className="text-2xl font-bold">{formatTime(timeRemaining)}</span>
                            </div>
                            {isTimeCritical && (
                                <p className="text-xs font-medium">Time running out!</p>
                            )}
                        </div>
                    </div>
                    <Progress value={progress} className="mt-3 h-2" />
                </div>
            </div>

            {/* Question Content */}
            <div className="container max-w-4xl mx-auto px-4 py-8">
                <Card className="mb-6">
                    <CardContent className="p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold mb-6">
                                Question {currentQuestionIndex + 1}:
                            </h2>
                            <p className="text-lg leading-relaxed mb-8">
                                {currentQuestion.question}
                            </p>
                        </div>

                        <RadioGroup
                            value={answers[currentQuestionIndex] || ''}
                            onValueChange={handleAnswerChange}
                            className="space-y-4"
                        >
                            {currentQuestion.options.map((option, index) => {
                                const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                                const optionValue = option.charAt(0); // Get 'A', 'B', 'C', or 'D' from option string
                                return (
                                    <div
                                        key={index}
                                        className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-muted/50 ${answers[currentQuestionIndex] === optionValue
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border'
                                            }`}
                                    >
                                        <RadioGroupItem
                                            value={optionValue}
                                            id={`option-${index}`}
                                            className="mt-1"
                                        />
                                        <Label
                                            htmlFor={`option-${index}`}
                                            className="flex-1 cursor-pointer text-base leading-relaxed"
                                        >
                                            {option}
                                        </Label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                    >
                        <ChevronLeft className="h-5 w-5 mr-2" />
                        Previous
                    </Button>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <Button size="lg" onClick={handleReview}>
                            Review & Submit
                        </Button>
                    ) : (
                        <Button size="lg" onClick={handleNext}>
                            Next
                            <ChevronRight className="h-5 w-5 ml-2" />
                        </Button>
                    )}
                </div>

                {/* Progress Indicator */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Progress</h3>
                            <span className="text-sm text-muted-foreground">
                                {answeredCount}/{questions.length} answered
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {questions.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        questionStartTimeRef.current = Date.now();
                                        setCurrentQuestionIndex(index);
                                    }}
                                    className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium transition-all ${index === currentQuestionIndex
                                            ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                                            : answers[index]
                                                ? 'bg-success text-success-foreground'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Warning Modal - 5 minutes remaining */}
            <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
                <DialogContent className="border-warning">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-warning">
                            <Clock className="h-6 w-6" />
                            Time Warning
                        </DialogTitle>
                        <DialogDescription className="text-lg">
                            ⚠️ 5 minutes remaining!
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* Review Modal */}
            <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Review Your Answers</DialogTitle>
                        <DialogDescription>
                            Check your answers before submitting
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertTitle>Questions Answered: {answeredCount}/{questions.length}</AlertTitle>
                            <AlertDescription>
                                {answeredCount === questions.length ? (
                                    <span className="text-success">All questions answered! ✓</span>
                                ) : (
                                    <span className="text-warning">
                                        {questions.length - answeredCount} question(s) unanswered
                                    </span>
                                )}
                            </AlertDescription>
                        </Alert>

                        <div className="max-h-60 overflow-y-auto">
                            <div className="grid grid-cols-4 gap-2">
                                {questions.map((_, index) => (
                                    <Button
                                        key={index}
                                        variant={answers[index] ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            setShowReviewModal(false);
                                            setCurrentQuestionIndex(index);
                                        }}
                                    >
                                        Q{index + 1} {answers[index] ? '✓' : ''}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>⚠️ Warning</AlertTitle>
                            <AlertDescription>
                                Once submitted, you cannot change your answers. Unanswered questions will be marked as incorrect.
                            </AlertDescription>
                        </Alert>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowReviewModal(false)}
                            >
                                Go Back to Review
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => {
                                    setShowReviewModal(false);
                                    handleSubmit(false);
                                }}
                            >
                                Submit Assignment
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AssignmentQuiz;
