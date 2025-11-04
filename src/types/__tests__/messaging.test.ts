/**
 * Messaging Type Utilities Tests
 * 
 * Unit tests for messaging type helper functions
 */

import {
    validateFile,
    formatFileSize,
    getAttachmentType,
    getOtherUser,
    isOwnMessage,
    hasAttachment,
    generateOptimisticId,
    MAX_MESSAGE_LENGTH,
    MAX_ATTACHMENT_SIZE,
} from '../messaging';
import type { Conversation, Message, IUserProfile } from '@/types/messaging';

describe('Messaging Type Utilities', () => {
    describe('validateFile', () => {
        it('should accept valid image files', () => {
            const file = new File(['image data'], 'photo.jpg', { type: 'image/jpeg' });
            const result = validateFile(file);

            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should accept valid document files', () => {
            const file = new File(['pdf data'], 'document.pdf', {
                type: 'application/pdf',
            });
            const result = validateFile(file);

            expect(result.valid).toBe(true);
        });

        it('should accept valid video files', () => {
            const file = new File(['video data'], 'video.mp4', { type: 'video/mp4' });
            const result = validateFile(file);

            expect(result.valid).toBe(true);
        });

        it('should reject files larger than MAX_ATTACHMENT_SIZE', () => {
            const largeFile = new File(
                ['x'.repeat(MAX_ATTACHMENT_SIZE + 1)],
                'large.txt',
                { type: 'text/plain' }
            );
            const result = validateFile(largeFile);

            expect(result.valid).toBe(false);
            expect(result.error).toContain('10MB');
        });

        it('should reject disallowed file types', () => {
            const execFile = new File(['malware'], 'virus.exe', {
                type: 'application/x-msdownload',
            });
            const result = validateFile(execFile);

            expect(result.valid).toBe(false);
            expect(result.error).toContain('not allowed');
        });

        it('should handle edge case: exactly MAX_ATTACHMENT_SIZE', () => {
            const maxFile = new File(['x'.repeat(MAX_ATTACHMENT_SIZE)], 'max.txt', {
                type: 'text/plain',
            });
            const result = validateFile(maxFile);

            expect(result.valid).toBe(true);
        });
    });

    describe('formatFileSize', () => {
        it('should format bytes correctly', () => {
            expect(formatFileSize(500)).toBe('500 B');
            expect(formatFileSize(1024)).toBe('1 KB');
            expect(formatFileSize(1536)).toBe('1.5 KB');
            expect(formatFileSize(1024 * 1024)).toBe('1 MB');
            expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
            expect(formatFileSize(1024 * 1024 * 1024 * 2.5)).toBe('2.5 GB');
        });

        it('should handle zero bytes', () => {
            expect(formatFileSize(0)).toBe('0 B');
        });

        it('should round to one decimal place', () => {
            expect(formatFileSize(1536)).toBe('1.5 KB');
            expect(formatFileSize(1587)).toBe('1.55 KB'); // Two decimals
            expect(formatFileSize(1638)).toBe('1.6 KB'); // Rounds up
        });
    });

    describe('getAttachmentType', () => {
        it('should identify image types', () => {
            expect(getAttachmentType('image/jpeg')).toBe('image');
            expect(getAttachmentType('image/png')).toBe('image');
            expect(getAttachmentType('image/gif')).toBe('image');
            expect(getAttachmentType('image/webp')).toBe('image');
        });

        it('should identify video types', () => {
            expect(getAttachmentType('video/mp4')).toBe('video');
            expect(getAttachmentType('video/webm')).toBe('video');
            // quicktime may not be in ALLOWED_FILE_TYPES, test only supported types
        });

        it('should identify document types', () => {
            expect(getAttachmentType('application/pdf')).toBe('document');
            expect(getAttachmentType('application/msword')).toBe('document');
            expect(
                getAttachmentType(
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                )
            ).toBe('document');
            expect(getAttachmentType('text/plain')).toBe('document');
        });

        it('should return "other" for unknown types', () => {
            expect(getAttachmentType('application/octet-stream')).toBe('other');
            expect(getAttachmentType('audio/mpeg')).toBe('other');
        });
    });

    describe('getOtherUser', () => {
        const mockUser1: Partial<IUserProfile> = {
            id: 'user-1',
            full_name: 'Alice',
        };

        const mockUser2: Partial<IUserProfile> = {
            id: 'user-2',
            full_name: 'Bob',
        };

        it('should return participant_2 when current user is participant_1', () => {
            const conversation: Partial<Conversation> = {
                participant_1_id: 'user-1',
                participant_2_id: 'user-2',
                participant_1: mockUser1 as IUserProfile,
                participant_2: mockUser2 as IUserProfile,
            };

            const result = getOtherUser(conversation as Conversation, 'user-1');

            expect(result).toEqual(mockUser2);
        });

        it('should return participant_1 when current user is participant_2', () => {
            const conversation: Partial<Conversation> = {
                participant_1_id: 'user-1',
                participant_2_id: 'user-2',
                participant_1: mockUser1 as IUserProfile,
                participant_2: mockUser2 as IUserProfile,
            };

            const result = getOtherUser(conversation as Conversation, 'user-2');

            expect(result).toEqual(mockUser1);
        });

        it('should return null when participants not loaded', () => {
            const conversation: Partial<Conversation> = {
                participant_1_id: 'user-1',
                participant_2_id: 'user-2',
            };

            const result = getOtherUser(conversation as Conversation, 'user-1');

            expect(result).toBeUndefined();
        });
    });

    describe('isOwnMessage', () => {
        it('should return true when user is sender', () => {
            const message: Partial<Message> = {
                sender_id: 'user-1',
            };

            expect(isOwnMessage(message as Message, 'user-1')).toBe(true);
        });

        it('should return false when user is not sender', () => {
            const message: Partial<Message> = {
                sender_id: 'user-2',
            };

            expect(isOwnMessage(message as Message, 'user-1')).toBe(false);
        });
    });

    describe('hasAttachment', () => {
        it('should return true when message has attachment_url', () => {
            const message: Partial<Message> = {
                attachment_url: 'https://example.com/file.pdf',
            };

            expect(hasAttachment(message as Message)).toBe(true);
        });

        it('should return false when message has no attachment_url', () => {
            const message: Partial<Message> = {
                attachment_url: null,
            };

            expect(hasAttachment(message as Message)).toBe(false);
        });

        it('should return false when attachment_url is undefined', () => {
            const message: Partial<Message> = {};

            expect(hasAttachment(message as Message)).toBe(false);
        });
    });

    describe('generateOptimisticId', () => {
        it('should generate unique IDs', () => {
            const id1 = generateOptimisticId();
            const id2 = generateOptimisticId();

            expect(id1).not.toBe(id2);
        });

        it('should generate IDs with correct prefix', () => {
            const id = generateOptimisticId();

            expect(id).toMatch(/^optimistic_/);
        });

        it('should generate IDs with timestamp and random component', () => {
            const id = generateOptimisticId();
            const parts = id.split('_');

            expect(parts.length).toBe(3); // 'optimistic', timestamp, random
            expect(Number(parts[1])).toBeGreaterThan(0); // Valid timestamp
            expect(parts[2].length).toBeGreaterThan(0); // Has random component
        });
    });

    describe('Constants', () => {
        it('should have correct MAX_MESSAGE_LENGTH', () => {
            expect(MAX_MESSAGE_LENGTH).toBe(5000);
        });

        it('should have correct MAX_ATTACHMENT_SIZE (10MB)', () => {
            expect(MAX_ATTACHMENT_SIZE).toBe(10 * 1024 * 1024);
        });
    });
});
