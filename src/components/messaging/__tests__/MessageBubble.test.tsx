/**
 * MessageBubble Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { MessageBubble, DateSeparator, TypingIndicator } from '../MessageBubble';
import type { Message } from '@/types/messaging';

const mockMessage: Message = {
    id: 'msg-1',
    conversation_id: 'conv-1',
    sender_id: 'user-1',
    content: 'Hello, how are you?',
    created_at: '2025-11-03T12:00:00Z',
    updated_at: '2025-11-03T12:00:00Z',
    read_at: null,
    attachment_url: null,
    attachment_name: null,
    attachment_type: null,
    attachment_size: null,
    sender: {
        id: 'user-1',
        full_name: 'Alice Smith',
        avatar_url: 'https://example.com/avatar.jpg',
        email: 'alice@example.com',
        role: 'freelancer',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
    },
};

describe('MessageBubble', () => {
    it('should render message content', () => {
        render(<MessageBubble message={mockMessage} isOwn={false} />);

        expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    });

    it('should show sender name for other users messages', () => {
        render(<MessageBubble message={mockMessage} isOwn={false} showAvatar={true} />);

        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    it('should not show sender name for own messages', () => {
        render(<MessageBubble message={mockMessage} isOwn={true} showAvatar={true} />);

        expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });

    it('should show avatar when showAvatar is true', () => {
        render(<MessageBubble message={mockMessage} isOwn={false} showAvatar={true} />);

        const avatar = screen.getByRole('img', { hidden: true });
        expect(avatar).toBeInTheDocument();
    });

    it('should not show avatar when showAvatar is false', () => {
        render(<MessageBubble message={mockMessage} isOwn={false} showAvatar={false} />);

        const avatars = screen.queryAllByRole('img', { hidden: true });
        expect(avatars.length).toBe(0);
    });

    it('should show read receipt for own messages', () => {
        render(<MessageBubble message={mockMessage} isOwn={true} />);

        // Check icon should be present (sent but not read)
        expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should show double check when message is read', () => {
        const readMessage = { ...mockMessage, read_at: '2025-11-03T12:05:00Z' };
        render(<MessageBubble message={readMessage} isOwn={true} />);

        expect(screen.getByTestId('check-check-icon')).toBeInTheDocument();
    });

    it('should call onDelete when delete button clicked', () => {
        const onDelete = jest.fn();
        render(<MessageBubble message={mockMessage} isOwn={true} onDelete={onDelete} />);

        // Open dropdown menu
        const menuButton = screen.getByRole('button', { name: /options/i });
        fireEvent.click(menuButton);

        // Click delete
        const deleteButton = screen.getByText(/delete/i);
        fireEvent.click(deleteButton);

        expect(onDelete).toHaveBeenCalledWith('msg-1');
    });

    it('should render attachment when present', () => {
        const messageWithAttachment: Message = {
            ...mockMessage,
            attachment_url: 'https://example.com/file.pdf',
            attachment_name: 'document.pdf',
            attachment_type: 'application/pdf',
            attachment_size: 1024 * 100, // 100KB
        };

        render(<MessageBubble message={messageWithAttachment} isOwn={false} />);

        expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    it('should apply correct styling for own messages', () => {
        const { container } = render(
            <MessageBubble message={mockMessage} isOwn={true} />
        );

        const bubble = container.querySelector('.bg-primary');
        expect(bubble).toBeInTheDocument();
    });

    it('should apply correct styling for other messages', () => {
        const { container } = render(
            <MessageBubble message={mockMessage} isOwn={false} />
        );

        const bubble = container.querySelector('.bg-muted');
        expect(bubble).toBeInTheDocument();
    });
});

describe('DateSeparator', () => {
    it('should render "Today" for today\'s date', () => {
        const today = new Date().toISOString();
        render(<DateSeparator date={today} />);

        expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('should render "Yesterday" for yesterday', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        render(<DateSeparator date={yesterday.toISOString()} />);

        expect(screen.getByText('Yesterday')).toBeInTheDocument();
    });

    it('should render formatted date for older dates', () => {
        const oldDate = '2025-01-15T12:00:00Z';
        render(<DateSeparator date={oldDate} />);

        expect(screen.getByText(/January 15, 2025/)).toBeInTheDocument();
    });
});

describe('TypingIndicator', () => {
    it('should render user name', () => {
        render(<TypingIndicator userName="Bob" />);

        expect(screen.getByText('Bob is typing')).toBeInTheDocument();
    });

    it('should render three animated dots', () => {
        const { container } = render(<TypingIndicator userName="Bob" />);

        const dots = container.querySelectorAll('.animate-bounce');
        expect(dots.length).toBe(3);
    });

    it('should render avatar placeholder', () => {
        render(<TypingIndicator userName="Bob" />);

        const avatar = screen.getByText('B'); // First letter of name
        expect(avatar).toBeInTheDocument();
    });
});
