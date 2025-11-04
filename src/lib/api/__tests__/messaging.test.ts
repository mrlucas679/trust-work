/**
 * Messaging API Tests
 * 
 * Unit tests for messaging API functions
 */

import {
    getConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    deleteMessage,
    markConversationAsRead,
    markMessageAsRead,
    searchMessages,
    uploadAttachment,
    getUnreadCount,
} from '../messaging';
import { supabase } from '@/lib/supabaseClient';
import type { Message, MessageInput, ConversationInput } from '@/types/messaging';

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
    supabase: {
        from: jest.fn(),
        rpc: jest.fn(),
        storage: {
            from: jest.fn(),
        },
    },
}));

describe('Messaging API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getConversations', () => {
        it('should fetch conversations with metadata', async () => {
            const mockData = [
                {
                    id: 'conv-1',
                    participant_1_id: 'user-1',
                    participant_2_id: 'user-2',
                    last_message_at: '2025-11-03T12:00:00Z',
                    other_user: { id: 'user-2', full_name: 'John Doe' },
                    unread_count: 3,
                    last_message: { content: 'Hello' },
                },
            ];

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        or: jest.fn().mockReturnValue({
                            order: jest.fn().mockResolvedValue({
                                data: mockData,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const result = await getConversations('user-1');

            expect(result).toEqual(mockData);
            expect(supabase.from).toHaveBeenCalledWith('conversations');
        });

        it('should filter by unread conversations', async () => {
            const mockData = [
                {
                    id: 'conv-1',
                    unread_count: 5,
                },
            ];

            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                or: jest.fn().mockReturnThis(),
                gt: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockChain);

            const result = await getConversations('user-1', { has_unread: true });

            expect(mockChain.gt).toHaveBeenCalledWith('unread_count', 0);
        });

        it('should handle errors', async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        or: jest.fn().mockReturnValue({
                            order: jest.fn().mockResolvedValue({
                                data: null,
                                error: { message: 'Database error' },
                            }),
                        }),
                    }),
                }),
            });

            await expect(getConversations('user-1')).rejects.toThrow('Database error');
        });
    });

    describe('getOrCreateConversation', () => {
        it('should return existing conversation', async () => {
            const mockConversation = {
                id: 'conv-1',
                participant_1_id: 'user-1',
                participant_2_id: 'user-2',
            };

            (supabase.rpc as jest.Mock).mockResolvedValue({
                data: mockConversation,
                error: null,
            });

            const result = await getOrCreateConversation('user-1', {
                other_user_id: 'user-2',
            });

            expect(result).toEqual(mockConversation);
            expect(supabase.rpc).toHaveBeenCalledWith('get_or_create_conversation', {
                current_user_id: 'user-1',
                other_user_id: 'user-2',
                p_assignment_id: undefined,
            });
        });

        it('should send initial message when provided', async () => {
            const mockConversation = { id: 'conv-1' };

            (supabase.rpc as jest.Mock).mockResolvedValue({
                data: mockConversation,
                error: null,
            });

            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { id: 'msg-1', content: 'Hello' },
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await getOrCreateConversation('user-1', {
                other_user_id: 'user-2',
                initial_message: 'Hello',
            });

            expect(supabase.from).toHaveBeenCalledWith('messages');
        });
    });

    describe('getMessages', () => {
        it('should fetch messages with sender profiles', async () => {
            const mockMessages = [
                {
                    id: 'msg-1',
                    content: 'Hello',
                    sender: { id: 'user-1', full_name: 'Alice' },
                },
            ];

            (supabase.from as jest.Mock).mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        order: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue({
                                data: mockMessages,
                                error: null,
                            }),
                        }),
                    }),
                }),
            });

            const result = await getMessages('conv-1');

            expect(result.messages).toEqual(mockMessages);
            expect(result.hasMore).toBe(false);
        });

        it('should handle pagination with before_id', async () => {
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                lt: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({ data: [], error: null }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockChain);

            await getMessages('conv-1', { before_id: 'msg-100', limit: 50 });

            expect(mockChain.lt).toHaveBeenCalledWith('id', 'msg-100');
            expect(mockChain.limit).toHaveBeenCalledWith(51);
        });
    });

    describe('sendMessage', () => {
        it('should send text-only message', async () => {
            const mockMessage = {
                id: 'msg-1',
                conversation_id: 'conv-1',
                content: 'Hello',
                sender_id: 'user-1',
            };

            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: mockMessage,
                            error: null,
                        }),
                    }),
                }),
            });

            const input: MessageInput = {
                conversation_id: 'conv-1',
                content: 'Hello',
            };

            const result = await sendMessage(input);

            expect(result).toEqual(mockMessage);
        });

        it('should upload file attachment when provided', async () => {
            const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
            const mockUrl = 'https://storage.example.com/test.txt';

            // Mock uploadAttachment
            const mockUpload = {
                data: { path: 'test.txt' },
                error: null,
            };

            (supabase.storage.from as jest.Mock).mockReturnValue({
                upload: jest.fn().mockResolvedValue(mockUpload),
                getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: mockUrl } }),
            });

            (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: { id: 'msg-1', attachment_url: mockUrl },
                            error: null,
                        }),
                    }),
                }),
            });

            const input: MessageInput = {
                conversation_id: 'conv-1',
                content: 'File attached',
                file: mockFile,
            };

            const result = await sendMessage(input);

            expect(result.attachment_url).toBe(mockUrl);
        });
    });

    describe('markConversationAsRead', () => {
        it('should call RPC function', async () => {
            (supabase.rpc as jest.Mock).mockResolvedValue({
                data: null,
                error: null,
            });

            await markConversationAsRead('conv-1', 'user-1');

            expect(supabase.rpc).toHaveBeenCalledWith('mark_conversation_read', {
                p_conversation_id: 'conv-1',
                p_user_id: 'user-1',
            });
        });
    });

    describe('markMessageAsRead', () => {
        it('should update message read_at timestamp', async () => {
            (supabase.from as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                }),
            });

            await markMessageAsRead('msg-1');

            expect(supabase.from).toHaveBeenCalledWith('messages');
        });
    });

    describe('deleteMessage', () => {
        it('should delete message and attachment', async () => {
            const mockMessage = {
                id: 'msg-1',
                attachment_url: 'https://storage.example.com/test.txt',
            };

            // Mock message fetch
            (supabase.from as jest.Mock).mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: mockMessage,
                            error: null,
                        }),
                    }),
                }),
            });

            // Mock storage delete
            (supabase.storage.from as jest.Mock).mockReturnValue({
                remove: jest.fn().mockResolvedValue({ data: null, error: null }),
            });

            // Mock message delete
            (supabase.from as jest.Mock).mockReturnValueOnce({
                delete: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                }),
            });

            await deleteMessage('msg-1');

            expect(supabase.from).toHaveBeenCalledWith('messages');
        });
    });

    describe('searchMessages', () => {
        it('should search messages with full-text search', async () => {
            const mockMessages = [
                { id: 'msg-1', content: 'Project deadline' },
            ];

            const mockChain = {
                select: jest.fn().mockReturnThis(),
                textSearch: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: mockMessages,
                    error: null,
                }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockChain);

            const result = await searchMessages({
                query: 'deadline',
                user_id: 'user-1',
            });

            expect(result).toEqual(mockMessages);
            expect(mockChain.textSearch).toHaveBeenCalledWith('content', 'deadline');
        });
    });

    describe('getUnreadCount', () => {
        it('should return total unread count', async () => {
            (supabase.rpc as jest.Mock).mockResolvedValue({
                data: 15,
                error: null,
            });

            const result = await getUnreadCount('user-1');

            expect(result).toBe(15);
            expect(supabase.rpc).toHaveBeenCalledWith('get_unread_count', {
                p_user_id: 'user-1',
            });
        });
    });

    describe('uploadAttachment', () => {
        it('should validate and upload file', async () => {
            const mockFile = new File(['test content'], 'test.pdf', {
                type: 'application/pdf',
            });

            const mockUpload = {
                data: { path: 'conv-1/test.pdf' },
                error: null,
            };

            const mockUrl = 'https://storage.example.com/conv-1/test.pdf';

            (supabase.storage.from as jest.Mock).mockReturnValue({
                upload: jest.fn().mockResolvedValue(mockUpload),
                getPublicUrl: jest.fn().mockReturnValue({
                    data: { publicUrl: mockUrl },
                }),
            });

            const result = await uploadAttachment('conv-1', mockFile);

            expect(result).toBe(mockUrl);
        });

        it('should reject oversized files', async () => {
            const largeFile = new File(
                ['x'.repeat(11 * 1024 * 1024)],
                'large.pdf',
                { type: 'application/pdf' }
            );

            await expect(uploadAttachment('conv-1', largeFile)).rejects.toThrow(
                'File size must be less than 10 MB'
            );
        });

        it('should reject invalid file types', async () => {
            const invalidFile = new File(['test'], 'test.exe', {
                type: 'application/x-msdownload',
            });

            await expect(uploadAttachment('conv-1', invalidFile)).rejects.toThrow(
                'File type not allowed'
            );
        });
    });
});
