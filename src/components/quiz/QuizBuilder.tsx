import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, X, Pencil, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface Question {
    id: string;
    question: string;
    type: 'multiple-choice' | 'true-false';
    options: string[];
    correctAnswer: number;
}

export interface Quiz {
    enabled: boolean;
    mandatory: boolean;
    passingScore: number;
    timeLimit: number;
    questions: Question[];
}

interface QuizBuilderProps {
    value: Quiz;
    onChange: (quiz: Quiz) => void;
}

export function QuizBuilder({ value, onChange }: QuizBuilderProps) {
    const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
        type: 'multiple-choice',
        options: ['', ''],
    });

    const updateQuiz = (updates: Partial<Quiz>) => {
        onChange({ ...value, ...updates });
    };

    const addQuestion = () => {
        if (!newQuestion.question || !newQuestion.options?.every(opt => opt.trim())) {
            return;
        }

        const question: Question = {
            id: crypto.randomUUID(),
            question: newQuestion.question || '',
            type: newQuestion.type || 'multiple-choice',
            options: newQuestion.options || [],
            correctAnswer: newQuestion.correctAnswer || 0,
        };

        updateQuiz({
            questions: [...value.questions, question],
        });

        setNewQuestion({
            type: 'multiple-choice',
            options: ['', ''],
        });
    };

    const removeQuestion = (id: string) => {
        updateQuiz({
            questions: value.questions.filter(q => q.id !== id),
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                        <span>Quiz Settings</span>
                        <Switch
                            checked={value.enabled}
                            onCheckedChange={(checked) => updateQuiz({ enabled: checked })}
                        />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {value.enabled ? (
                        <>
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <Label>Time Limit (minutes)</Label>
                                    <Input
                                        type="number"
                                        min={5}
                                        max={120}
                                        value={value.timeLimit}
                                        onChange={(e) => updateQuiz({ timeLimit: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label>Passing Score (%)</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={value.passingScore}
                                        onChange={(e) => updateQuiz({ passingScore: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={value.mandatory}
                                    onCheckedChange={(checked) => updateQuiz({ mandatory: checked })}
                                    id="mandatory"
                                />
                                <Label htmlFor="mandatory">Quiz completion is mandatory for application</Label>
                            </div>
                        </>
                    ) : (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Enable the quiz to test applicants' knowledge and skills during the application process.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {value.enabled && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Questions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                {value.questions.map((question, index) => (
                                    <div key={question.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium">Question {index + 1}</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeQuestion(question.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm mb-2">{question.question}</p>
                                        <div className="space-y-1">
                                            {question.options.map((option, optIndex) => (
                                                <div
                                                    key={optIndex}
                                                    className={`text-sm p-2 rounded ${optIndex === question.correctAnswer
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'bg-muted'
                                                        }`}
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-medium mb-4">Add New Question</h4>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Question Type</Label>
                                        <Select
                                            value={newQuestion.type}
                                            onValueChange={(value: 'multiple-choice' | 'true-false') => {
                                                setNewQuestion({
                                                    ...newQuestion,
                                                    type: value,
                                                    options: value === 'true-false' ? ['True', 'False'] : ['', ''],
                                                });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                                <SelectItem value="true-false">True/False</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Question</Label>
                                        <Textarea
                                            value={newQuestion.question || ''}
                                            onChange={(e) =>
                                                setNewQuestion({ ...newQuestion, question: e.target.value })
                                            }
                                            placeholder="Enter your question here..."
                                        />
                                    </div>

                                    {newQuestion.type === 'multiple-choice' && (
                                        <div className="space-y-2">
                                            <Label>Options</Label>
                                            {newQuestion.options?.map((option, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <Input
                                                        value={option}
                                                        onChange={(e) => {
                                                            const newOptions = [...(newQuestion.options || [])];
                                                            newOptions[index] = e.target.value;
                                                            setNewQuestion({ ...newQuestion, options: newOptions });
                                                        }}
                                                        placeholder={`Option ${index + 1}`}
                                                    />
                                                    {index > 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const newOptions = newQuestion.options?.filter(
                                                                    (_, i) => i !== index
                                                                );
                                                                setNewQuestion({ ...newQuestion, options: newOptions });
                                                            }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {(newQuestion.options?.length || 0) < 5 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setNewQuestion({
                                                            ...newQuestion,
                                                            options: [...(newQuestion.options || []), ''],
                                                        });
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Option
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <Label>Correct Answer</Label>
                                        <Select
                                            value={newQuestion.correctAnswer?.toString()}
                                            onValueChange={(value) =>
                                                setNewQuestion({
                                                    ...newQuestion,
                                                    correctAnswer: parseInt(value),
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {newQuestion.options?.map((option, index) => (
                                                    <SelectItem key={index} value={index.toString()}>
                                                        {option || `Option ${index + 1}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button onClick={addQuestion} className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Question
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
