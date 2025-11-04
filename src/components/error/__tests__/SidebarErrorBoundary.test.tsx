/**
 * @fileoverview Tests for SidebarErrorBoundary component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarErrorBoundary } from '../SidebarErrorBoundary';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Suppress console.error for tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('SidebarErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <SidebarErrorBoundary>
        <div data-testid="child">Child content</div>
      </SidebarErrorBoundary>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('should catch errors and display fallback UI', () => {
    render(
      <SidebarErrorBoundary>
        <ThrowError />
      </SidebarErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Navigation Error')).toBeInTheDocument();
    expect(screen.getByText(/The navigation sidebar encountered an error/)).toBeInTheDocument();
  });

  it('should display error icon in fallback UI', () => {
    render(
      <SidebarErrorBoundary>
        <ThrowError />
      </SidebarErrorBoundary>
    );

    // AlertCircle icon should be present
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should provide a retry button', () => {
    render(
      <SidebarErrorBoundary>
        <ThrowError />
      </SidebarErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <SidebarErrorBoundary>
        <ThrowError />
      </SidebarErrorBoundary>
    );

    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveAttribute('aria-live', 'assertive');
  });
});
