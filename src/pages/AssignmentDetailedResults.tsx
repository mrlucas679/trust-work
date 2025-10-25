import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    CheckCircle,
    XCircle,
    ArrowLeft,
    BookOpen,
    Download
} from 'lucide-react';
import { SKILL_DISPLAY_NAMES, LEVEL_DISPLAY_NAMES, SkillCategory, AssignmentLevel, Question } from '@/types/assignments';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface LocationState {
    questions: Question[];
    answers: Record<number, string>;
    score: number;
    correctCount: number;
    totalQuestions: number;
    passed: boolean;
}

const AssignmentDetailedResults = () => {
    const navigate = useNavigate();
    const { skill, level } = useParams<{ skill: SkillCategory; level: AssignmentLevel }>();
    const location = useLocation();
    const state = location.state as LocationState;

    if (!skill || !level || !state || !state.questions) {
        navigate('/assignments');
        return null;
    }

    const { questions, answers, score, correctCount, totalQuestions } = state;

    // Identify areas to improve
    const incorrectQuestions = questions.filter((_, index) => answers[index] !== questions[index].correctAnswer);
    const topicsToImprove = Array.from(
        new Set(incorrectQuestions.flatMap(q => q.topics))
    ).slice(0, 3);

    return (
        <div className="min-h-screen bg-muted/20 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">Detailed Results & Explanations</CardTitle>
                                <p className="text-muted-foreground mt-1">
                                    {LEVEL_DISPLAY_NAMES[level!]} Level: {SKILL_DISPLAY_NAMES[skill!]}
                                </p>
                            </div>
                            <Badge variant={score >= 70 ? "default" : "destructive"} className="text-2xl px-4 py-2">
                                {score}%
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Each Question */}
                {questions.map((question, index) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === question.correctAnswer;

                    return (
                        <Card key={question.id} className={isCorrect ? 'border-success/50' : 'border-destructive/50'}>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    {isCorrect ? (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                                            <CheckCircle className="h-5 w-5 text-success" />
                                        </div>
                                    ) : (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                                            <XCircle className="h-5 w-5 text-destructive" />
                                        </div>
                                    )}
                                    <CardTitle className="text-lg">
                                        Question {index + 1}: {isCorrect ? 'CORRECT' : 'INCORRECT'}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Question */}
                                <div>
                                    <p className="text-lg font-medium mb-4">{question.question}</p>
                                </div>

                                {/* Options */}
                                <div className="space-y-2">
                                    {question.options.map((option, optIndex) => {
                                        const optionLetter = String.fromCharCode(65 + optIndex);
                                        const isCorrectAnswer = option.charAt(0) === question.correctAnswer;
                                        const isUserAnswer = userAnswer === option.charAt(0);

                                        let optionStyle = 'bg-muted/50 border-muted';
                                        if (isCorrectAnswer) {
                                            optionStyle = 'bg-success/10 border-success';
                                        } else if (isUserAnswer && !isCorrect) {
                                            optionStyle = 'bg-destructive/10 border-destructive';
                                        }

                                        return (
                                            <div
                                                key={optIndex}
                                                className={`p-3 rounded-lg border-2 ${optionStyle}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {isCorrectAnswer && (
                                                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                                                    )}
                                                    {isUserAnswer && !isCorrect && (
                                                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                                                    )}
                                                    <p className={isCorrectAnswer ? 'font-semibold' : ''}>
                                                        {option}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Separator />

                                {/* User's Answer */}
                                {!isCorrect && (
                                    <div className="bg-destructive/5 p-4 rounded-lg">
                                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-destructive" />
                                            Your Answer:
                                        </p>
                                        <p className="text-destructive">
                                            {question.options.find(opt => opt.charAt(0) === userAnswer) || 'Not answered'}
                                        </p>
                                    </div>
                                )}

                                {/* Correct Answer */}
                                <div className={`p-4 rounded-lg ${isCorrect ? 'bg-success/5' : 'bg-success/10 border border-success'}`}>
                                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-success" />
                                        {isCorrect ? 'Why This is Correct:' : 'Correct Answer:'}
                                    </p>
                                    {!isCorrect && (
                                        <p className="text-success font-medium mb-3">
                                            {question.options.find(opt => opt.charAt(0) === question.correctAnswer)}
                                        </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                                </div>

                                {/* Learning Resources */}
                                {question.learningResources && question.learningResources.length > 0 && (
                                    <div className="bg-primary/5 p-4 rounded-lg">
                                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-primary" />
                                            Learn More:
                                        </p>
                                        <div className="space-y-1">
                                            {question.learningResources.map((resource, idx) => (
                                                <a
                                                    key={idx}
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary hover:underline block"
                                                >
                                                    {resource.title} →
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}

                {/* Summary */}
                <Card className="border-primary">
                    <CardHeader>
                        <CardTitle>Your Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-success/10 rounded-lg">
                                <p className="text-3xl font-bold text-success">{correctCount}</p>
                                <p className="text-sm text-muted-foreground">Correct ({Math.round((correctCount / totalQuestions) * 100)}%)</p>
                            </div>
                            <div className="text-center p-4 bg-destructive/10 rounded-lg">
                                <p className="text-3xl font-bold text-destructive">{totalQuestions - correctCount}</p>
                                <p className="text-sm text-muted-foreground">Incorrect ({Math.round(((totalQuestions - correctCount) / totalQuestions) * 100)}%)</p>
                            </div>
                        </div>

                        {topicsToImprove.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <p className="font-semibold mb-2">Areas to Improve:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {topicsToImprove.map((topic, idx) => (
                                            <Badge key={idx} variant="outline" className="capitalize">
                                                {topic.replace('-', ' ')}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <Separator />

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    // Placeholder for PDF download
                                    alert('PDF download functionality would be implemented here');
                                }}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Save Results as PDF
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate('/assignments')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AssignmentDetailedResults;
