/**
 * @fileoverview Milestone submission modal component
 * Allows freelancers to submit deliverables for a milestone
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Upload,
  X,
  FileText,
  Image,
  Video,
  Code,
  Archive,
  Link2,
  Plus,
  Loader2,
  CheckCircle,
  AlertCircle,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubmitMilestone } from '@/hooks/use-gig-lifecycle';
import type { IGigMilestone, IDeliverableFile, DeliverableFileType } from '@/types/gig';

interface MilestoneSubmitModalProps {
  milestone: IGigMilestone;
  gigId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

const FILE_TYPE_ICONS: Record<DeliverableFileType, React.ElementType> = {
  document: FileText,
  image: Image,
  video: Video,
  code: Code,
  archive: Archive,
  link: Link2,
  other: FileText,
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  'video/*': ['.mp4', '.mov', '.avi', '.webm'],
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'text/*': ['.txt', '.md', '.csv'],
  'application/json': ['.json'],
};

function getFileType(file: File): DeliverableFileType {
  const mime = file.type;
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('7z')) return 'archive';
  if (
    mime.includes('javascript') ||
    mime.includes('typescript') ||
    mime.includes('python') ||
    mime.includes('java') ||
    mime.includes('json') ||
    file.name.match(/\.(js|ts|tsx|jsx|py|java|cpp|c|h|css|scss|html|sql)$/)
  ) {
    return 'code';
  }
  if (
    mime.includes('pdf') ||
    mime.includes('document') ||
    mime.includes('word') ||
    mime.includes('text')
  ) {
    return 'document';
  }
  return 'other';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function MilestoneSubmitModal({
  milestone,
  gigId,
  open,
  onOpenChange,
  onSuccess,
}: MilestoneSubmitModalProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [completedFiles, setCompletedFiles] = useState<IDeliverableFile[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');
  const [notes, setNotes] = useState('');

  const submitMilestone = useSubmitMilestone();

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
        // Move to completed files
        const deliverableFile: IDeliverableFile = {
          name: file.name,
          url: URL.createObjectURL(file), // In production, this would be the uploaded URL
          type: getFileType(file),
          size: file.size,
          uploaded_at: new Date().toISOString(),
        };
        setCompletedFiles((prev) => [...prev, deliverableFile]);
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
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          console.error(`File ${file.name} exceeds 50MB limit`);
          return false;
        }
        return true;
      });

      const newUploadingFiles = validFiles.map((file) => ({
        file,
        progress: 0,
        status: 'uploading' as const,
      }));

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      // Simulate upload for each file
      validFiles.forEach((file, idx) => {
        const startIndex = uploadingFiles.length + idx;
        simulateUpload(file, startIndex);
      });
    },
    [uploadingFiles.length, simulateUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
  });

  const removeCompletedFile = (index: number) => {
    setCompletedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addLink = () => {
    if (newLink && isValidUrl(newLink)) {
      setLinks((prev) => [...prev, newLink]);
      setNewLink('');
    }
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    await submitMilestone.mutateAsync({
      milestoneId: milestone.id,
      gigId,
      submission: {
        deliverableFiles: completedFiles,
        deliverableLinks: links,
        submissionNotes: notes || undefined,
      },
    });

    // Reset form
    setUploadingFiles([]);
    setCompletedFiles([]);
    setLinks([]);
    setNotes('');
    onOpenChange(false);
    onSuccess?.();
  };

  const isSubmitting = submitMilestone.isPending;
  const canSubmit = (completedFiles.length > 0 || links.length > 0) && !isSubmitting;
  const isRevision = milestone.revision_count > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {isRevision ? 'Submit Revision' : 'Submit Milestone'}
          </DialogTitle>
          <DialogDescription>
            {isRevision ? (
              <>
                Revision {milestone.revision_count} of {milestone.max_revisions} for{' '}
                <span className="font-medium">{milestone.title}</span>
              </>
            ) : (
              <>
                Upload your deliverables for <span className="font-medium">{milestone.title}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Milestone Info */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{milestone.title}</p>
                <p className="text-sm text-muted-foreground">{milestone.description}</p>
              </div>
              <Badge variant="outline" className="text-lg font-semibold">
                R{milestone.amount.toLocaleString()}
              </Badge>
            </div>
            {isRevision && milestone.client_notes && (
              <div className="mt-3 rounded-md bg-yellow-500/10 border border-yellow-500/20 p-3">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Client Feedback:
                </p>
                <p className="text-sm text-muted-foreground mt-1">{milestone.client_notes}</p>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label>Deliverable Files</Label>
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-primary font-medium">Drop files here...</p>
              ) : (
                <>
                  <p className="font-medium">Drag & drop files here</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse (max 50MB per file)
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
                      <div className="flex-1 min-w-0">
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

            {/* Completed Files */}
            {completedFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Uploaded ({completedFiles.length})
                </Label>
                {completedFiles.map((file, index) => {
                  const Icon = FILE_TYPE_ICONS[file.type];
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="p-2 rounded-md bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeCompletedFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* External Links */}
          <div className="space-y-4">
            <Label>External Links (Optional)</Label>
            <p className="text-sm text-muted-foreground">
              Add links to hosted files, live demos, or repositories
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/file"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addLink}
                disabled={!newLink || !isValidUrl(newLink)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {links.length > 0 && (
              <div className="space-y-2">
                {links.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="p-2 rounded-md bg-blue-500/10">
                      <Link2 className="h-4 w-4 text-blue-500" />
                    </div>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-primary hover:underline truncate"
                    >
                      {link}
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeLink(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Submission Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Submission Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or instructions for the client..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Warnings */}
          {completedFiles.length === 0 && links.length === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Please upload at least one file or add an external link to submit this milestone.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {isRevision ? 'Submit Revision' : 'Submit Milestone'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MilestoneSubmitModal;
