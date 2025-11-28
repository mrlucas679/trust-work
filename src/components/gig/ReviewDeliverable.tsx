/**
 * @fileoverview Review Deliverable Component
 * Client reviews freelancer milestone submissions - approve, reject, or request revision
 * 
 * TrustWork Platform - Gig Lifecycle
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
  Image,
  Video,
  Code,
  Archive,
  ExternalLink,
  Download,
  MessageSquare,
  AlertTriangle,
  Clock,
  DollarSign,
  Loader2,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useApproveMilestone, useRejectMilestone, useRequestRevision } from '@/hooks/use-gig-lifecycle';
import type { IGigMilestone, IDeliverableFile, DeliverableFileType } from '@/types/gig';

interface ReviewDeliverableProps {
  milestone: IGigMilestone;
  gigId: string;
  isClient: boolean;
  onActionComplete?: () => void;
}

const FILE_TYPE_ICONS: Record<DeliverableFileType, React.ReactNode> = {
  document: <FileText className="h-5 w-5" />,
  image: <Image className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  code: <Code className="h-5 w-5" />,
  archive: <Archive className="h-5 w-5" />,
  link: <ExternalLink className="h-5 w-5" />,
  other: <FileText className="h-5 w-5" />,
};

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending', icon: <Clock className="h-4 w-4" /> },
  in_progress: { color: 'bg-blue-100 text-blue-800', label: 'In Progress', icon: <RefreshCw className="h-4 w-4" /> },
  submitted: { color: 'bg-yellow-100 text-yellow-800', label: 'Awaiting Review', icon: <Eye className="h-4 w-4" /> },
  approved: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: <CheckCircle2 className="h-4 w-4" /> },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: <XCircle className="h-4 w-4" /> },
  revision_requested: { color: 'bg-orange-100 text-orange-800', label: 'Revision Requested', icon: <RefreshCw className="h-4 w-4" /> },
};

export function ReviewDeliverable({
  milestone,
  gigId,
  isClient,
  onActionComplete,
}: ReviewDeliverableProps) {
  const [feedback, setFeedback] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [previewFile, setPreviewFile] = useState<IDeliverableFile | null>(null);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [filesExpanded, setFilesExpanded] = useState(true);

  const approveMutation = useApproveMilestone();
  const rejectMutation = useRejectMilestone();
  const revisionMutation = useRequestRevision();

  const statusConfig = STATUS_CONFIG[milestone.status] || STATUS_CONFIG.pending;

  const handleApprove = () => {
    approveMutation.mutate(
      { milestoneId: milestone.id, gigId, clientNotes: feedback || undefined },
      {
        onSuccess: () => {
          setFeedback('');
          setApproveDialogOpen(false);
          onActionComplete?.();
        },
      }
    );
  };

  const handleReject = () => {
    if (!feedback.trim()) return;
    rejectMutation.mutate(
      { milestoneId: milestone.id, gigId, clientNotes: feedback },
      {
        onSuccess: () => {
          setFeedback('');
          setRejectDialogOpen(false);
          onActionComplete?.();
        },
      }
    );
  };

  const handleRequestRevision = () => {
    if (!revisionNotes.trim()) return;
    revisionMutation.mutate(
      { milestoneId: milestone.id, gigId, revisionNotes },
      {
        onSuccess: () => {
          setRevisionNotes('');
          setRevisionDialogOpen(false);
          onActionComplete?.();
        },
      }
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImageFile = (file: IDeliverableFile): boolean => {
    return file.type === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
  };

  const canReview = milestone.status === 'submitted' && isClient;
  const revisionsRemaining = milestone.max_revisions - milestone.revision_count;

  return (
    <Card className={milestone.status === 'submitted' && isClient ? 'ring-2 ring-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {milestone.title}
              <Badge className={statusConfig.color}>
                {statusConfig.icon}
                <span className="ml-1">{statusConfig.label}</span>
              </Badge>
            </CardTitle>
            <CardDescription>
              {milestone.description || `Milestone ${milestone.order_index + 1}`}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">
              R{milestone.amount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {milestone.percentage}% of total
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress & Dates */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {milestone.started_at && (
            <div>
              <p className="text-muted-foreground">Started</p>
              <p className="font-medium">{format(new Date(milestone.started_at), 'MMM d, yyyy')}</p>
            </div>
          )}
          {milestone.submitted_at && (
            <div>
              <p className="text-muted-foreground">Submitted</p>
              <p className="font-medium">{format(new Date(milestone.submitted_at), 'MMM d, yyyy')}</p>
            </div>
          )}
          {milestone.dueDate && (
            <div>
              <p className="text-muted-foreground">Due Date</p>
              <p className="font-medium">{format(new Date(milestone.dueDate), 'MMM d, yyyy')}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground">Revisions</p>
            <p className="font-medium">
              {milestone.revision_count} / {milestone.max_revisions}
              {revisionsRemaining <= 1 && revisionsRemaining > 0 && (
                <span className="text-orange-500 ml-1">({revisionsRemaining} left)</span>
              )}
              {revisionsRemaining === 0 && (
                <span className="text-red-500 ml-1">(none left)</span>
              )}
            </p>
          </div>
        </div>

        {/* Submission Notes */}
        {milestone.submission_notes && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Freelancer's Notes
            </h4>
            <p className="text-sm whitespace-pre-wrap">{milestone.submission_notes}</p>
          </div>
        )}

        {/* Deliverable Files */}
        <Collapsible open={filesExpanded} onOpenChange={setFilesExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent">
              <span className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Deliverables ({milestone.deliverable_files?.length || 0} files)
              </span>
              {filesExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            {milestone.deliverable_files && milestone.deliverable_files.length > 0 ? (
              <div className="grid gap-3">
                {milestone.deliverable_files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 p-2 bg-muted rounded-lg">
                      {FILE_TYPE_ICONS[file.type] || FILE_TYPE_ICONS.other}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {format(new Date(file.uploaded_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isImageFile(file) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewFile(file)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No files uploaded</p>
              </div>
            )}

            {/* External Links */}
            {milestone.deliverable_links && milestone.deliverable_links.length > 0 && (
              <div className="mt-4 space-y-2">
                <h5 className="text-sm font-medium">External Links</h5>
                {milestone.deliverable_links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors text-sm"
                  >
                    <ExternalLink className="h-4 w-4 text-blue-500" />
                    <span className="flex-1 truncate text-blue-600">{link}</span>
                  </a>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Previous Client Notes */}
        {milestone.client_notes && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <MessageSquare className="h-4 w-4" />
              Your Previous Feedback
            </h4>
            <p className="text-sm whitespace-pre-wrap text-blue-700 dark:text-blue-400">
              {milestone.client_notes}
            </p>
          </div>
        )}

        {/* Action Buttons - Only for Client when submitted */}
        {canReview && (
          <div className="border-t pt-6 space-y-4">
            <h4 className="font-semibold">Review Deliverable</h4>
            
            <Textarea
              placeholder="Add feedback for the freelancer (optional for approval, required for rejection/revision)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />

            <div className="flex flex-wrap gap-3">
              {/* Approve Button */}
              <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve Deliverable
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve Deliverable?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-4">
                        <p>
                          You're about to approve this milestone deliverable. This will:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Mark the milestone as completed</li>
                          <li>Allow the next milestone to begin</li>
                          <li>Enable payment release for this milestone</li>
                        </ul>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <p className="font-medium text-green-800 dark:text-green-300">
                            Amount to release: R{milestone.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleApprove}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Confirm Approval
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Request Revision Button */}
              {revisionsRemaining > 0 ? (
                <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
                  <Button
                    variant="outline"
                    onClick={() => setRevisionDialogOpen(true)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Request Revision ({revisionsRemaining} left)
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Revision</DialogTitle>
                      <DialogDescription>
                        Describe what changes you need. The freelancer will have{' '}
                        {revisionsRemaining - 1} revision{revisionsRemaining - 1 !== 1 ? 's' : ''}{' '}
                        remaining after this.
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      placeholder="Describe the changes you need..."
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      className="min-h-[150px]"
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setRevisionDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRequestRevision}
                        disabled={!revisionNotes.trim() || revisionMutation.isPending}
                      >
                        {revisionMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Requesting...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Request Revision
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button variant="outline" disabled>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  No Revisions Left
                </Button>
              )}

              {/* Reject Button */}
              <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">Reject Deliverable?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-4">
                        <p>
                          Rejecting this deliverable means the work does not meet requirements.
                          This action may lead to a dispute if the freelancer disagrees.
                        </p>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            Please provide detailed feedback below explaining why the deliverable
                            is being rejected.
                          </p>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Textarea
                    placeholder="Explain why you're rejecting this deliverable..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setFeedback('')}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReject}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={!feedback.trim() || rejectMutation.isPending}
                    >
                      {rejectMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Confirm Rejection
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        {/* Approved Status Display */}
        {milestone.status === 'approved' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-300">
                  Milestone Approved
                </p>
                {milestone.approved_at && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Approved on {format(new Date(milestone.approved_at), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>
              {milestone.payment_released && (
                <Badge className="ml-auto bg-green-600">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Payment Released
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Rejected Status Display */}
        {milestone.status === 'rejected' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-300">
                  Milestone Rejected
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  The deliverable did not meet requirements.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Revision Requested Status Display */}
        {milestone.status === 'revision_requested' && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-300">
                  Revision Requested
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  {isClient
                    ? 'Waiting for the freelancer to submit revisions.'
                    : 'Please review the feedback and submit your revisions.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="relative max-h-[70vh] overflow-auto">
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewFile(null)}>
              Close
            </Button>
            <Button onClick={() => previewFile && window.open(previewFile.url, '_blank')}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default ReviewDeliverable;
