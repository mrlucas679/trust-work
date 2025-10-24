import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface Step {
    title: string;
    description?: string;
}

interface ProgressStepperProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}

export const ProgressStepper = ({
    steps,
    currentStep,
    className,
}: ProgressStepperProps) => {
    return (
        <div className={cn("w-full", className)}>
            <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-0 top-5 h-0.5 w-full bg-muted">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{
                            width: `${(currentStep / (steps.length - 1)) * 100}%`,
                        }}
                    />
                </div>

                {/* Steps */}
                <div className="relative z-10 flex justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;

                        return (
                            <div
                                key={index}
                                className="flex flex-col items-center"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 transition-colors duration-200"
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-200",
                                        isCompleted && "border-primary bg-primary text-primary-foreground",
                                        isCurrent && "border-primary bg-background",
                                        !isCompleted && !isCurrent && "border-muted bg-background"
                                    )}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-6 w-6" />
                                    ) : (
                                        <Circle className="h-6 w-6" />
                                    )}
                                </div>

                                <div className="mt-2 text-center">
                                    <div className="text-sm font-medium">{step.title}</div>
                                    {step.description && (
                                        <div className="text-xs text-muted-foreground">
                                            {step.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
