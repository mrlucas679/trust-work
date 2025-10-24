import { Suspense } from 'react';
import { ErrorBoundary } from './error-boundary';
import { PageLoadingSpinner } from './loading-spinner';

interface RouteWrapperProps {
    children: React.ReactNode;
}

export const RouteWrapper = ({ children }: RouteWrapperProps) => {
    return (
        <ErrorBoundary>
            <Suspense fallback={<PageLoadingSpinner />}>
                {children}
            </Suspense>
        </ErrorBoundary>
    );
};
