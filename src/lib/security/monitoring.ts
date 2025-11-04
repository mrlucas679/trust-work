/**
 * Security Audit Logging
 * 
 * Tracks security-relevant events and anomalies for monitoring and compliance
 */

export type SecurityEventType =
    | 'auth.login.success'
    | 'auth.login.failed'
    | 'auth.logout'
    | 'auth.password_reset.requested'
    | 'auth.password_reset.completed'
    | 'auth.mfa.enabled'
    | 'auth.mfa.disabled'
    | 'data.access.sensitive'
    | 'data.modification'
    | 'data.deletion'
    | 'input.validation.failed'
    | 'input.sanitization.blocked'
    | 'rate_limit.exceeded'
    | 'csrf.token.invalid'
    | 'csp.violation'
    | 'suspicious.activity';

export interface SecurityEvent {
    type: SecurityEventType;
    timestamp: Date;
    userId?: string;
    userEmail?: string;
    ipAddress?: string;
    userAgent?: string;
    details: Record<string, unknown>;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Security event logger
 */
class SecurityLogger {
    private events: SecurityEvent[] = [];
    private maxEvents = 1000; // Keep last 1000 events in memory

    /**
     * Log a security event
     */
    log(
        type: SecurityEventType,
        details: Record<string, unknown>,
        severity: SecurityEvent['severity'] = 'low'
    ): void {
        const event: SecurityEvent = {
            type,
            timestamp: new Date(),
            details,
            severity,
            userId: this.getCurrentUserId(),
            userEmail: this.getCurrentUserEmail(),
            ipAddress: this.getClientIp(),
            userAgent: this.getUserAgent(),
        };

        // Add to in-memory store
        this.events.push(event);

        // Keep only last N events
        if (this.events.length > this.maxEvents) {
            this.events.shift();
        }

        // Log to console in development
        if (import.meta.env.DEV) {
            console.log(`[Security ${severity.toUpperCase()}]`, type, details);
        }

        // In production, send to monitoring service
        if (import.meta.env.PROD && severity !== 'low') {
            this.sendToMonitoringService(event);
        }
    }

    /**
     * Get recent security events
     */
    getRecentEvents(limit = 100): SecurityEvent[] {
        return this.events.slice(-limit);
    }

    /**
     * Get events by type
     */
    getEventsByType(type: SecurityEventType): SecurityEvent[] {
        return this.events.filter(event => event.type === type);
    }

    /**
     * Get events by severity
     */
    getEventsBySeverity(severity: SecurityEvent['severity']): SecurityEvent[] {
        return this.events.filter(event => event.severity === severity);
    }

    /**
     * Get events for specific user
     */
    getEventsForUser(userId: string): SecurityEvent[] {
        return this.events.filter(event => event.userId === userId);
    }

    /**
     * Clear all events
     */
    clear(): void {
        this.events = [];
    }

    /**
     * Export events as JSON
     */
    export(): string {
        return JSON.stringify(this.events, null, 2);
    }

    /**
     * Get current user ID from session
     */
    private getCurrentUserId(): string | undefined {
        // This should integrate with your auth system
        // For now, return undefined
        return undefined;
    }

    /**
     * Get current user email from session
     */
    private getCurrentUserEmail(): string | undefined {
        // This should integrate with your auth system
        return undefined;
    }

    /**
     * Get client IP address
     */
    private getClientIp(): string | undefined {
        // In a real application, this would come from server
        // Client-side JS cannot reliably get this
        return undefined;
    }

    /**
     * Get user agent string
     */
    private getUserAgent(): string {
        return navigator.userAgent;
    }

    /**
     * Send event to monitoring service (Sentry, DataDog, etc.)
     */
    private sendToMonitoringService(event: SecurityEvent): void {
        // TODO: Integrate with your monitoring service
        // Example with Sentry:
        // Sentry.captureMessage(`Security Event: ${event.type}`, {
        //     level: this.mapSeverityToSentryLevel(event.severity),
        //     extra: event,
        // });

        // For now, just log
        console.warn('[Security Event]', event);
    }
}

// Singleton instance
export const securityLogger = new SecurityLogger();

/**
 * Anomaly detection for suspicious patterns
 */
export class AnomalyDetector {
    private failedAttempts = new Map<string, number>();
    private requestCounts = new Map<string, number[]>();

    /**
     * Track failed login attempts
     */
    trackFailedLogin(identifier: string): boolean {
        const count = (this.failedAttempts.get(identifier) || 0) + 1;
        this.failedAttempts.set(identifier, count);

        // Alert on suspicious failed attempts
        if (count >= 5) {
            securityLogger.log(
                'suspicious.activity',
                {
                    identifier,
                    failedAttempts: count,
                    message: 'Multiple failed login attempts detected',
                },
                'high'
            );
            return true; // Suspicious
        }

        return false;
    }

    /**
     * Reset failed attempts counter
     */
    resetFailedAttempts(identifier: string): void {
        this.failedAttempts.delete(identifier);
    }

    /**
     * Track request rate for potential DDoS or scraping
     */
    trackRequest(identifier: string): boolean {
        const now = Date.now();
        const requests = this.requestCounts.get(identifier) || [];

        // Remove requests older than 1 minute
        const recentRequests = requests.filter(time => now - time < 60000);
        recentRequests.push(now);

        this.requestCounts.set(identifier, recentRequests);

        // Alert on excessive requests (>100 per minute)
        if (recentRequests.length > 100) {
            securityLogger.log(
                'suspicious.activity',
                {
                    identifier,
                    requestCount: recentRequests.length,
                    message: 'Excessive request rate detected',
                },
                'high'
            );
            return true; // Suspicious
        }

        return false;
    }

    /**
     * Detect unusual access patterns
     */
    detectUnusualAccess(userId: string, resource: string): boolean {
        // TODO: Implement ML-based anomaly detection
        // For now, use simple heuristics

        const userEvents = securityLogger.getEventsForUser(userId);
        const recentAccess = userEvents.filter(
            event => event.type === 'data.access.sensitive' &&
                Date.now() - event.timestamp.getTime() < 300000 // Last 5 minutes
        );

        // Alert on rapid sensitive data access
        if (recentAccess.length > 20) {
            securityLogger.log(
                'suspicious.activity',
                {
                    userId,
                    resource,
                    accessCount: recentAccess.length,
                    message: 'Unusual data access pattern detected',
                },
                'medium'
            );
            return true;
        }

        return false;
    }

    /**
     * Clear all tracking data
     */
    clear(): void {
        this.failedAttempts.clear();
        this.requestCounts.clear();
    }
}

// Singleton instance
export const anomalyDetector = new AnomalyDetector();

/**
 * Security monitoring hooks for React components
 */
export function useSecurityMonitoring() {
    return {
        logEvent: (
            type: SecurityEventType,
            details: Record<string, unknown>,
            severity: SecurityEvent['severity'] = 'low'
        ) => {
            securityLogger.log(type, details, severity);
        },

        trackFailedLogin: (identifier: string) => {
            return anomalyDetector.trackFailedLogin(identifier);
        },

        resetFailedAttempts: (identifier: string) => {
            anomalyDetector.resetFailedAttempts(identifier);
        },

        trackRequest: (identifier: string) => {
            return anomalyDetector.trackRequest(identifier);
        },

        detectUnusualAccess: (userId: string, resource: string) => {
            return anomalyDetector.detectUnusualAccess(userId, resource);
        },
    };
}

/**
 * Security dashboard data
 */
export interface SecurityDashboardData {
    totalEvents: number;
    eventsByType: Record<SecurityEventType, number>;
    eventsBySeverity: Record<string, number>;
    recentEvents: SecurityEvent[];
    suspiciousActivities: SecurityEvent[];
}

/**
 * Get security dashboard data
 */
export function getSecurityDashboardData(): SecurityDashboardData {
    const events = securityLogger.getRecentEvents(1000);

    const eventsByType = events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
    }, {} as Record<SecurityEventType, number>);

    const eventsBySeverity = events.reduce((acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const suspiciousActivities = securityLogger
        .getEventsByType('suspicious.activity')
        .slice(-20);

    return {
        totalEvents: events.length,
        eventsByType,
        eventsBySeverity,
        recentEvents: events.slice(-50),
        suspiciousActivities,
    };
}
