/**
 * @fileoverview DeliverableUpload - Upload deliverables for milestone submission
 * TrustWork Platform - Deliverable Upload Component
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Video, 
  Code, 
  Archive,
  Link as LinkIcon,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import type { IDeliverableFile, DeliverableFileType } from '@/types/gig';

interface DeliverableUploadProps {
  onSubmit: (data: {
    files: IDeliverableFile[];
    links: string[];
    notes: string;
  }) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  className?: string;
}

const fileTypeIcons: Record<DeliverableFileType, React.ElementType> = {
  document: FileText,
  image: Image,
  video: Video,
  code: Code,
  archive: Archive,
  link: LinkIcon,
  other: File,
};

const getFileType = (fileName: string): DeliverableFileType => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
  const codeExts = ['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
  const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
  
  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (codeExts.includes(ext)) return 'code';
  if (archiveExts.includes(ext)) return 'archive';
  if (docExts.includes(ext)) return 'document';
  return 'other';
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface UploadedFile {
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  url?: string;
  error?: string;
}

export function DeliverableUpload({
  onSubmit,
  onCancel,
  isSubmitting = false,
  maxFiles = 10,
  maxFileSize = 50, // 50MB default
  acceptedFileTypes,
  className,
}: DeliverableUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [links, setLinks] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: { file: File; errors: { message: string }[] }[]) => {
    setUploadError(null);
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(r => 
        `${r.file.name}: ${r.errors.map(e => e.message).join(', ')}`
      );
      setUploadError(errors.join('; '));
      return;
    }

    // Check max files
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Add files with initial state
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : undefined,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress (in real app, this would be actual upload)
    newFiles.forEach((_, index) => {
      const fileIndex = uploadedFiles.length + index;
      simulateUpload(fileIndex);
    });
  }, [uploadedFiles.length, maxFiles]);

  const simulateUpload = (fileIndex: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles(prev => 
          prev.map((f, i) => 
            i === fileIndex 
              ? { ...f, progress: 100, status: 'complete', url: `https://storage.trustwork.com/${f.file.name}` }
              : f
          )
        );
      } else {
        setUploadedFiles(prev => 
          prev.map((f, i) => 
            i === fileIndex ? { ...f, progress } : f
          )
        );
      }
    }, 200);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const addLink = () => {
    setLinks(prev => [...prev, '']);
  };

  const removeLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, value: string) => {
    setLinks(prev => prev.map((link, i) => (i === index ? value : link)));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: maxFileSize * 1024 * 1024,
    accept: acceptedFileTypes ? { 'application/*': acceptedFileTypes } : undefined,
  });

  const handleSubmit = () => {
    const completedFiles = uploadedFiles
      .filter(f => f.status === 'complete' && f.url)
      .map(f => ({
        name: f.file.name,
        url: f.url!,
        type: getFileType(f.file.name),
        size: f.file.size,
        uploaded_at: new Date().toISOString(),
      }));

    const validLinks = links.filter(link => link.trim() !== '');

    onSubmit({
      files: completedFiles,
      links: validLinks,
      notes,
    });
  };

  const allUploadsComplete = uploadedFiles.every(f => f.status === 'complete');
  const hasContent = uploadedFiles.length > 0 || links.some(l => l.trim() !== '');

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Submit Deliverables
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
            uploadedFiles.length >= maxFiles && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} disabled={uploadedFiles.length >= maxFiles} />
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          {isDragActive ? (
            <p className="text-primary font-medium">Drop files here...</p>
          ) : (
            <>
              <p className="font-medium mb-1">Drag & drop files here</p>
              <p className="text-sm text-muted-foreground">
                or click to browse (max {maxFileSize}MB per file)
              </p>
            </>
          )}
        </div>

        {/* Upload Error */}
        {uploadError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{uploadError}</p>
          </div>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <Label>Uploaded Files ({uploadedFiles.length}/{maxFiles})</Label>
            <div className="space-y-2">
              {uploadedFiles.map((uploadedFile, index) => {
                const FileIcon = fileTypeIcons[getFileType(uploadedFile.file.name)];
                
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                  >
                    {uploadedFile.preview ? (
                      <img 
                        src={uploadedFile.preview} 
                        alt={uploadedFile.file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center bg-muted rounded">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{uploadedFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                      {uploadedFile.status === 'uploading' && (
                        <Progress value={uploadedFile.progress} className="h-1 mt-1" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {uploadedFile.status === 'complete' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {uploadedFile.status === 'error' && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* External Links */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>External Links (Optional)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLink}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Link
            </Button>
          </div>
          <div className="space-y-2">
            {links.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={link}
                  onChange={(e) => updateLink(index, e.target.value)}
                  placeholder="https://github.com/your-repo or https://figma.com/your-design"
                  type="url"
                />
                {links.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Add links to GitHub repos, Figma designs, live demos, etc.
          </p>
        </div>

        {/* Submission Notes */}
        <div className="space-y-2">
          <Label>Submission Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what you've delivered, any notes for the client, or instructions for reviewing..."
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={!hasContent || !allUploadsComplete || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Deliverables'}
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DeliverableUpload;
