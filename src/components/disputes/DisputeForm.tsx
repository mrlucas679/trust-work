/**
 * @fileoverview Dispute form component
 * Allows users to file a dispute for a gig
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  Upload,
  X,
  FileText,
  Image,
  Video,
  Loader2,
  Shield,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateDispute } from '@/hooks/use-gig-lifecycle';
import type { DisputeReason, IDisputeEvidence, IGig } from '@/types/gig';

interface DisputeFormProps {
  gig: IGig;
  respondentId: string;
  respondentName?: string;
  escrowPaymentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}

const DISPUTE_REASONS: { value: DisputeReason; label: string; description: string }[] = [
  {
    value: 'quality_issue',
    label: 'Quality Issue',
    description: 'The delivered work does not meet the agreed-upon quality standards',
  },
  {
    value: 'non_delivery',
    label: 'Non-Delivery',
    description: 'The freelancer failed to deliver the work by the deadline',
  },
  {
    value: 'scope_change',
    label: 'Scope Change',
    description: 'Disagreement about what was included in the original scope',
  },
  {
    value: 'payment_issue',
    label: 'Payment Issue',
    description: 'Issues related to payment, escrow, or refunds',
  },
  {
    value: 'communication_breakdown',
    label: 'Communication Breakdown',
    description: 'Unable to reach or communicate with the other party',
  },
  {
    value: 'deadline_missed',
    label: 'Deadline Missed',
    description: 'The agreed deadline was not met without valid reason',
  },
  {
    value: 'unauthorized_use',
    label: 'Unauthorized Use',
    description: 'Work being used outside of agreed terms',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other issues not covered by the above categories',
  },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function getFileType(file: File): 'image' | 'document' | 'screenshot' | 'video' | 'other' {
  const mime = file.type;
  if (mime.startsWith('image/')) return 'screenshot';
  if (mime.startsWith('video/')) return 'video';
  if (mime.includes('pdf') || mime.includes('document') || mime.includes('text')) return 'document';
  return 'other';
}

export function DisputeForm({
  gig,
  respondentId,
  respondentName,
  escrowPaymentId,
  onSuccess,
  onCancel,
}: DisputeFormProps) {
  const [reason, setReason] = useState<DisputeReason | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [evidence, setEvidence] = useState<IDisputeEvidence[]>([]);

  const createDispute = useCreateDispute();

  const simulateUpload = useCallback((file: File, index: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadingFiles((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], progress: 100, status: 'complete' };
          return updated;
        });

        const evidenceItem: IDisputeEvidence = {
          id: `evidence-${Date.now()}-${index}`,
          name: file.name,
          url: URL.createObjectURL(file),
          type: getFileType(file),
          uploaded_by: 'current-user',
          uploaded_at: new Date().toISOString(),
        };
        setEvidence((prev) => [...prev, evidenceItem]);
      } else {
        setUploadingFiles((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], progress };
          return updated;
        });
      }
    }, 200);
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((file) => file.size <= MAX_FILE_SIZE);

      const newUploading = validFiles.map((file) => ({
        file,
        progress: 0,
        status: 'uploading' as const,
      }));

      setUploadingFiles((prev) => [...prev, ...newUploading]);

      validFiles.forEach((file, idx) => {
        const startIndex = uploadingFiles.length + idx;
        simulateUpload(file, startIndex);
      });
    },
    [uploadingFiles.length, simulateUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.mov'],
    },
    maxSize: MAX_FILE_SIZE,
  });

  const removeEvidence = (index: number) => {
    setEvidence((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) return;

    await createDispute.mutateAsync({
      gigId: gig.id,
      respondentId,
      reason,
      title,
      description,
      escrowPaymentId,
      evidence,
    });

    onSuccess?.();
  };

  const isSubmitting = createDispute.isPending;
  const canSubmit = reason && title.length >= 10 && description.length >= 50 && !isSubmitting;

  const selectedReason = DISPUTE_REASONS.find((r) => r.value === reason);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-orange-500/10">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <CardTitle>File a Dispute</CardTitle>
            <CardDescription>
              Report an issue with "{gig.title}"
              {respondentName && ` against ${respondentName}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Warning Banner */}
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-600 dark:text-yellow-400">
                  Before filing a dispute
                </p>
                <p className="text-muted-foreground mt-1">
                  We encourage you to first try resolving the issue directly with the other party.
                  Disputes should be filed only when direct communication has failed.
                </p>
              </div>
            </div>
          </div>

          {/* Dispute Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Dispute <span className="text-red-500">*</span>
            </Label>
            <Select value={reason} onValueChange={(value) => setReason(value as DisputeReason)}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select the reason for your dispute" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div className="flex flex-col">
                      <span>{r.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedReason && (
              <p className="text-sm text-muted-foreground">{selectedReason.description}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Dispute Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Brief summary of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/100 characters (minimum 10)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Detailed Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of the issue, including timeline of events, attempts to resolve, and desired outcome..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/2000 characters (minimum 50)
            </p>
          </div>

          <Separator />

          {/* Evidence Upload */}
          <div className="space-y-4">
            <div>
              <Label>Supporting Evidence (Optional)</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Upload screenshots, documents, or videos to support your case
              </p>
            </div>

            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-primary font-medium">Drop files here...</p>
              ) : (
                <>
                  <p className="font-medium">Drag & drop files here</p>
                  <p className="text-sm text-muted-foreground">
                    Images, PDFs, or videos (max 10MB each)
                  </p>
                </>
              )}
            </div>

            {/* Uploading Files */}
            {uploadingFiles.filter((f) => f.status === 'uploading').length > 0 && (
              <div className="space-y-2">
                {uploadingFiles
                  .filter((f) => f.status === 'uploading')
                  .map((uf, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{uf.file.name}</p>
                        <Progress value={uf.progress} className="h-1 mt-1" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(uf.progress)}%
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Uploaded Evidence */}
            {evidence.length > 0 && (
              <div className="space-y-2">
                {evidence.map((item, index) => {
                  const Icon =
                    item.type === 'screenshot' || item.type === 'image'
                      ? Image
                      : item.type === 'video'
                      ? Video
                      : FileText;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="p-2 rounded-md bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeEvidence(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Escrow Info */}
          {escrowPaymentId && (
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    Payment Protection
                  </p>
                  <p className="text-muted-foreground mt-1">
                    The payment for this gig is held in escrow and will be frozen until this
                    dispute is resolved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {!canSubmit && reason && (
            <div className="rounded-lg bg-muted p-3 space-y-1">
              {title.length < 10 && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  Title must be at least 10 characters
                </p>
              )}
              {description.length < 50 && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  Description must be at least 50 characters
                </p>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Filing Dispute...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                File Dispute
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default DisputeForm;
