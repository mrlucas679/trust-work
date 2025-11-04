/**
 * Status Transition Buttons
 * 
 * Context-aware action buttons for assignment workflow
 * - Start Work (employer accepts application)
 * - Complete Assignment (freelancer marks done)
 * - Cancel Assignment (employer cancels with reason)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    useStartAssignmentWork,
    useCompleteAssignment,
    useCancelAssignment
} from '@/hooks/useWorkflow';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Play, CheckCircle, XCircle } from 'lucide-react';
import type { AssignmentStatus } from '@/types/workflow';

interface StatusTransitionButtonsProps {
    assignmentId: string;
    applicationId?: string;
    currentStatus: AssignmentStatus;
    userRole: 'employer' | 'freelancer';
    className?: string;
}

export function StatusTransitionButtons({
    assignmentId,
    applicationId,
    currentStatus,
    userRole,
    className,
}: StatusTransitionButtonsProps) {
    const { toast } = useToast();
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [completionNotes, setCompletionNotes] = useState('');
    const [cancelReason, setCancelReason] = useState('');

    const startWork = useStartAssignmentWork();
    const completeAssignment = useCompleteAssignment();
    const cancelAssignment = useCancelAssignment();

    // Start work handler (employer accepts)
    const handleStartWork = async () => {
        if (!applicationId) return;

        const result = await startWork.mutateAsync({
            assignment_id: assignmentId,
            application_id: applicationId,
        });

        if (result.success) {
            toast({
                title: 'Work started',
                description: 'The assignment is now in progress.',
            });
        } else {
            toast({
                title: 'Error',
                description: result.error || 'Failed to start work',
                variant: 'destructive',
            });
        }
    };

    // Complete assignment handler (freelancer)
    const handleComplete = async () => {
        const result = await completeAssignment.mutateAsync({
            assignment_id: assignmentId,
            completion_notes: completionNotes || undefined,
        });

        if (result.success) {
            toast({
                title: 'Assignment completed',
                description: 'The employer has been notified.',
            });
            setShowCompleteDialog(false);
            setCompletionNotes('');
        } else {
            toast({
                title: 'Error',
                description: result.error || 'Failed to complete assignment',
                variant: 'destructive',
            });
        }
    };

    // Cancel assignment handler (employer)
    const handleCancel = async () => {
        if (cancelReason.length < 10) {
            toast({
                title: 'Validation error',
                description: 'Cancellation reason must be at least 10 characters',
                variant: 'destructive',
            });
            return;
        }

        const result = await cancelAssignment.mutateAsync({
            assignment_id: assignmentId,
            reason: cancelReason,
        });

        if (result.success) {
            toast({
                title: 'Assignment cancelled',
                description: 'The freelancer has been notified.',
            });
            setShowCancelDialog(false);
            setCancelReason('');
        } else {
            toast({
                title: 'Error',
                description: result.error || 'Failed to cancel assignment',
                variant: 'destructive',
            });
        }
    };

    // Render appropriate buttons based on status and role
    return (
        <div className={className}>
            {/* Start Work Button (employer only, open status) */}
            {userRole === 'employer' && currentStatus === 'open' && applicationId && (
                <Button
                    onClick={handleStartWork}
                    disabled={startWork.isPending}
                    className="gap-2"
                >
                    {startWork.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Play className="h-4 w-4" />
                    )}
                    Start Work
                </Button>
            )}

            {/* Complete Button (freelancer only, in_progress status) */}
            {userRole === 'freelancer' && currentStatus === 'in_progress' && (
                <>
                    <Button
                        onClick={() => setShowCompleteDialog(true)}
                        className="gap-2"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Mark Complete
                    </Button>

                    <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Complete Assignment</DialogTitle>
                                <DialogDescription>
                                    Mark this assignment as complete. You can optionally add notes about the work.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="completion-notes">
                                        Completion Notes (Optional)
                                    </Label>
                                    <Textarea
                                        id="completion-notes"
                                        placeholder="Describe what you completed..."
                                        value={completionNotes}
                                        onChange={(e) => setCompletionNotes(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCompleteDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleComplete}
                                    disabled={completeAssignment.isPending}
                                >
                                    {completeAssignment.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Mark Complete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}

            {/* Cancel Button (employer only, open or in_progress) */}
            {userRole === 'employer' &&
                (currentStatus === 'open' || currentStatus === 'in_progress') && (
                    <>
                        <Button
                            variant="destructive"
                            onClick={() => setShowCancelDialog(true)}
                            className="gap-2"
                        >
                            <XCircle className="h-4 w-4" />
                            Cancel Assignment
                        </Button>

                        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Cancel Assignment</DialogTitle>
                                    <DialogDescription>
                                        Please provide a reason for cancelling this assignment.
                                        This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cancel-reason">
                                            Cancellation Reason *
                                        </Label>
                                        <Textarea
                                            id="cancel-reason"
                                            placeholder="Explain why you're cancelling (minimum 10 characters)..."
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                            rows={4}
                                            required
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            {cancelReason.length}/500 characters
                                        </p>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowCancelDialog(false)}
                                    >
                                        Keep Assignment
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleCancel}
                                        disabled={cancelAssignment.isPending || cancelReason.length < 10}
                                    >
                                        {cancelAssignment.isPending && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Cancel Assignment
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
        </div>
    );
}
