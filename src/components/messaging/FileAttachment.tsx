/**
 * FileAttachment Component
 * 
 * Displays file attachments in messages with preview and download options.
 */

import { Button } from '@/components/ui/button';
import { Download, FileText, Image as ImageIcon, Video, Paperclip } from 'lucide-react';
import type { AttachmentType } from '@/types/messaging';
import { formatFileSize, ATTACHMENT_ICONS } from '@/types/messaging';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FileAttachmentProps {
    url: string;
    name: string;
    type: AttachmentType;
    size: number;
    className?: string;
}

export function FileAttachment({
    url,
    name,
    type,
    size,
    className,
}: FileAttachmentProps) {
    const [imageError, setImageError] = useState(false);

    // Get icon based on file type
    const getIcon = () => {
        switch (type) {
            case 'image':
                return <ImageIcon className="h-5 w-5" />;
            case 'document':
                return <FileText className="h-5 w-5" />;
            case 'video':
                return <Video className="h-5 w-5" />;
            default:
                return <Paperclip className="h-5 w-5" />;
        }
    };

    // Render image preview
    if (type === 'image' && !imageError) {
        return (
            <div className={cn('relative group', className)}>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                >
                    <img
                        src={url}
                        alt={name}
                        className="rounded-lg max-w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onError={() => setImageError(true)}
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                </a>
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    asChild
                >
                    <a href={url} download={name}>
                        <Download className="h-4 w-4" />
                    </a>
                </Button>
            </div>
        );
    }

    // Render video preview
    if (type === 'video') {
        return (
            <div className={cn('relative', className)}>
                <video
                    src={url}
                    controls
                    className="rounded-lg max-w-full h-auto max-h-64"
                    preload="metadata"
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }

    // Render generic file attachment
    return (
        <div
            className={cn(
                'flex items-center gap-3 p-3 rounded-lg border bg-background/50 hover:bg-background transition-colors',
                className
            )}
        >
            <div className="flex-shrink-0 p-2 rounded bg-muted">
                {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(size)}</p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                asChild
            >
                <a href={url} download={name} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                </a>
            </Button>
        </div>
    );
}

/**
 * File Upload Preview Component
 * Shows preview of file being uploaded
 */
interface FileUploadPreviewProps {
    file: File;
    progress?: number;
    onRemove?: () => void;
    className?: string;
}

export function FileUploadPreview({
    file,
    progress = 0,
    onRemove,
    className,
}: FileUploadPreviewProps) {
    const [preview, setPreview] = useState<string | null>(null);

    // Generate preview for images
    if (file.type.startsWith('image/') && !preview) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }

    const getIcon = () => {
        if (file.type.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
        if (file.type.startsWith('video/')) return <Video className="h-5 w-5" />;
        if (file.type.includes('pdf') || file.type.includes('document'))
            return <FileText className="h-5 w-5" />;
        return <Paperclip className="h-5 w-5" />;
    };

    return (
        <div
            className={cn(
                'flex items-center gap-3 p-3 rounded-lg border bg-background',
                className
            )}
        >
            {preview ? (
                <img
                    src={preview}
                    alt={file.name}
                    className="h-12 w-12 rounded object-cover flex-shrink-0"
                />
            ) : (
                <div className="flex-shrink-0 p-2 rounded bg-muted">{getIcon()}</div>
            )}

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                </p>

                {/* Progress bar */}
                {progress > 0 && progress < 100 && (
                    <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                        <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            {onRemove && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    className="flex-shrink-0"
                >
                    <span className="sr-only">Remove file</span>
                    ×
                </Button>
            )}
        </div>
    );
}
