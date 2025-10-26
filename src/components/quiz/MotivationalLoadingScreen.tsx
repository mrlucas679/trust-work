import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Target, TrendingUp, Zap } from 'lucide-react';

const motivationalQuotes = [
    {
        text: "Change doesn't happen by accident — it happens by heart.",
        icon: Sparkles,
    },
    {
        text: "Stay focused. Growth begins with effort.",
        icon: Target,
    },
    {
        text: "This is your moment to shine — give it your best.",
        icon: Zap,
    },
    {
        text: "Small steps lead to big changes.",
        icon: TrendingUp,
    },
    {
        text: "Believe in the process, trust your journey.",
        icon: Sparkles,
    },
    {
        text: "Every question you answer builds your future.",
        icon: Target,
    },
    {
        text: "The harder you work, the luckier you get.",
        icon: TrendingUp,
    },
    {
        text: "Progress, not perfection.",
        icon: Zap,
    },
    {
        text: "Ready your mind — greatness starts here.",
        icon: Target,
    },
    {
        text: "Learning is the one thing no one can take away from you.",
        icon: Sparkles,
    },
];

interface MotivationalLoadingScreenProps {
    skillName?: string;
    levelName?: string;
}

export const MotivationalLoadingScreen = ({
    skillName,
    levelName
}: MotivationalLoadingScreenProps) => {
    const [currentQuote, setCurrentQuote] = useState(0);
    const [fadeIn, setFadeIn] = useState(true);

    useEffect(() => {
        // Randomly select a starting quote
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        setCurrentQuote(randomIndex);
    }, []);

    useEffect(() => {
        // Rotate quotes every 4 seconds with fade animation
        const interval = setInterval(() => {
            setFadeIn(false);
            setTimeout(() => {
                setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
                setFadeIn(true);
            }, 300);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const quote = motivationalQuotes[currentQuote];
    const IconComponent = quote.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full border-primary/20 shadow-2xl">
                <CardContent className="p-12 space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4 animate-pulse">
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">
                            Preparing Your Assignment
                        </h2>
                        {skillName && levelName && (
                            <p className="text-muted-foreground">
                                {levelName} Level: {skillName}
                            </p>
                        )}
                    </div>

                    {/* Motivational Quote */}
                    <div
                        className={`text-center space-y-4 transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                            <IconComponent className="h-7 w-7 text-primary" />
                        </div>
                        <blockquote className="text-xl font-medium text-foreground italic leading-relaxed px-4">
                            "{quote.text}"
                        </blockquote>
                    </div>

                    {/* Progress Indicator */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <p className="text-sm text-center text-muted-foreground">
                            Loading questions and preparing your workspace...
                        </p>
                    </div>

                    {/* Tips Section */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-primary/10">
                        <h3 className="font-semibold text-sm text-foreground">Quick Tips:</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Read each question carefully before answering</li>
                            <li>• Keep track of time but don't rush</li>
                            <li>• Trust your first instinct on difficult questions</li>
                            <li>• Review your answers if time permits</li>
                        </ul>
                    </div>

                    {/* Bottom encouragement */}
                    <div className="text-center pt-4">
                        <p className="text-sm font-medium text-primary">
                            You've got this! 💪
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
