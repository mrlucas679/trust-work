import { render, screen } from '@testing-library/react';
import { UserProfileSection } from './UserProfileSection';

describe('UserProfileSection', () => {
    const mockProps = {
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        verified: true,
        rating: 4.8,
        completedJobs: 150,
        professionalStatus: 'Senior Developer'
    };

    it('renders user name correctly', () => {
        render(<UserProfileSection {...mockProps} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('shows verification badge when user is verified', () => {
        render(<UserProfileSection {...mockProps} />);
        expect(screen.getByTestId('verification-badge')).toBeInTheDocument();
    });

    it('hides verification badge when user is not verified', () => {
        render(<UserProfileSection {...mockProps} verified={false} />);
        expect(screen.queryByTestId('verification-badge')).not.toBeInTheDocument();
    });

    it('displays rating and completed jobs when provided', () => {
        render(<UserProfileSection {...mockProps} />);
        expect(screen.getByText('4.8 · 150 jobs')).toBeInTheDocument();
    });

    it('shows professional status when provided', () => {
        render(<UserProfileSection {...mockProps} />);
        expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    });

    it('generates correct initials for avatar fallback', () => {
        render(<UserProfileSection {...mockProps} avatar={undefined} />);
        expect(screen.getByText('JD')).toBeInTheDocument();
    });
});
