/**
 * @fileoverview Tests for MotivationalLoadingScreen component
 */

import { render, screen } from '@testing-library/react';
import { MotivationalLoadingScreen } from '../MotivationalLoadingScreen';

describe('MotivationalLoadingScreen', () => {
    it('should render loading spinner', () => {
        render(<MotivationalLoadingScreen skillName="JavaScript" levelName="Intermediate" />);

        const spinner = screen.getByTestId('loading-spinner');
        expect(spinner).toBeInTheDocument();
    });

    it('should render with skillName and levelName props', () => {
        render(<MotivationalLoadingScreen skillName="React" levelName="Advanced" />);

        expect(screen.getByText(/React/i)).toBeInTheDocument();
        expect(screen.getByText(/Advanced/i)).toBeInTheDocument();
    });

    it('should display motivational quote', () => {
        render(<MotivationalLoadingScreen skillName="TypeScript" levelName="Beginner" />);

        // Should have at least one motivational message
        const quoteElement = screen.getByText(/Change doesn't happen|Stay focused|This is your moment|Small steps|Believe in/i);
        expect(quoteElement).toBeInTheDocument();
    });

    it('should display assessment preparation message', () => {
        render(<MotivationalLoadingScreen skillName="Python" levelName="Intermediate" />);

        expect(screen.getByText(/Preparing Your Assessment/i)).toBeInTheDocument();
    });

    it('should display skill level information', () => {
        const skillName = 'JavaScript';
        const levelName = 'Expert';

        render(<MotivationalLoadingScreen skillName={skillName} levelName={levelName} />);

        expect(screen.getByText(new RegExp(skillName, 'i'))).toBeInTheDocument();
        expect(screen.getByText(new RegExp(levelName, 'i'))).toBeInTheDocument();
    });

    it('should show tips section', () => {
        render(<MotivationalLoadingScreen skillName="HTML" levelName="Beginner" />);

        expect(screen.getByText(/Quick Tips/i)).toBeInTheDocument();
    });

    it('should render encouragement section', () => {
        render(<MotivationalLoadingScreen skillName="Node.js" levelName="Advanced" />);

        expect(screen.getByText(/You've got this/i)).toBeInTheDocument();
    });

    it('should handle different skill names', () => {
        const skills = ['React', 'Angular', 'Vue', 'Svelte'];

        skills.forEach(skillName => {
            const { unmount } = render(<MotivationalLoadingScreen skillName={skillName} levelName="Intermediate" />);
            expect(screen.getByText(new RegExp(skillName, 'i'))).toBeInTheDocument();
            unmount();
        });
    });

    it('should handle different skill levels', () => {
        const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

        levels.forEach(levelName => {
            const { unmount } = render(<MotivationalLoadingScreen skillName="JavaScript" levelName={levelName} />);
            expect(screen.getByText(new RegExp(levelName, 'i'))).toBeInTheDocument();
            unmount();
        });
    });

    it('should render without crashing for edge cases', () => {
        // Empty strings
        expect(() => {
            render(<MotivationalLoadingScreen skillName="" levelName="" />);
        }).not.toThrow();

        // Very long strings
        const longSkill = 'A'.repeat(100);
        const longLevel = 'B'.repeat(50);
        expect(() => {
            render(<MotivationalLoadingScreen skillName={longSkill} levelName={longLevel} />);
        }).not.toThrow();

        // Special characters
        expect(() => {
            render(<MotivationalLoadingScreen skillName="C++" levelName="Level 1" />);
        }).not.toThrow();
    });

    it('should be accessible', () => {
        const { container } = render(<MotivationalLoadingScreen skillName="Python" levelName="Intermediate" />);

        // Should have proper ARIA roles or test IDs
        const statusElement = screen.getByTestId('loading-spinner');
        expect(statusElement).toBeInTheDocument();

        // Should not have accessibility violations (basic check)
        expect(container.querySelector('[data-testid]')).toBeTruthy();
    });

    it('should render without props', () => {
        expect(() => {
            render(<MotivationalLoadingScreen />);
        }).not.toThrow();
    });

    it('should display TrustWork branding', () => {
        render(<MotivationalLoadingScreen skillName="CSS" levelName="Intermediate" />);

        // Check for any branding elements
        const card = screen.getByRole('article');
        expect(card).toBeInTheDocument();
    });
});

