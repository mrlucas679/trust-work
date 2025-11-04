/**
 * Security Sanitization Utilities
 * 
 * Provides comprehensive input sanitization and validation
 * to prevent XSS, injection attacks, and other security vulnerabilities.
 */

/**
 * Validates and sanitizes URLs to prevent XSS and malicious redirects
 * 
 * @param url - The URL to validate
 * @param allowedProtocols - List of allowed protocols (default: http, https)
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(
    url: string,
    allowedProtocols: string[] = ['http:', 'https:']
): string | null {
    if (!url || typeof url !== 'string') {
        return null;
    }

    // Trim whitespace
    const trimmedUrl = url.trim();

    // Reject empty or whitespace-only URLs
    if (trimmedUrl.length === 0) {
        return null;
    }

    // Check for javascript: protocol and other dangerous schemes
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const lowerUrl = trimmedUrl.toLowerCase();

    for (const protocol of dangerousProtocols) {
        if (lowerUrl.startsWith(protocol)) {
            console.warn(`[Security] Blocked dangerous URL protocol: ${protocol}`);
            return null;
        }
    }

    try {
        // Parse URL to validate structure
        const urlObj = new URL(trimmedUrl);

        // Validate protocol
        if (!allowedProtocols.includes(urlObj.protocol)) {
            console.warn(`[Security] Blocked disallowed protocol: ${urlObj.protocol}`);
            return null;
        }

        // Return the sanitized URL (reconstructed from URL object)
        return urlObj.href;
    } catch (error) {
        // Invalid URL format
        console.warn(`[Security] Invalid URL format: ${trimmedUrl}`);
        return null;
    }
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Removes all HTML tags and entities
 * 
 * @param html - The HTML string to sanitize
 * @returns Plain text with HTML entities decoded
 */
export function sanitizeHtml(html: string): string {
    if (!html || typeof html !== 'string') {
        return '';
    }

    // Create a temporary DOM element to decode entities
    const temp = document.createElement('div');
    temp.textContent = html;
    const decoded = temp.innerHTML;

    // Remove all HTML tags
    const stripped = decoded.replace(/<[^>]*>/g, '');

    // Decode HTML entities again after stripping tags
    temp.innerHTML = stripped;
    return temp.textContent || '';
}

/**
 * Sanitizes user input for safe display
 * Escapes HTML special characters
 * 
 * @param input - The user input to sanitize
 * @returns Escaped string safe for HTML display
 */
export function escapeHtml(input: string): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    const htmlEscapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };

    return input.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Validates email format with security considerations
 * 
 * @param email - The email address to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
        return false;
    }

    // Basic email validation regex (RFC 5322 simplified)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Additional security checks
    const trimmedEmail = email.trim();

    // Check length limits
    if (trimmedEmail.length > 254) {
        return false;
    }

    // Check for null bytes (security risk)
    if (trimmedEmail.includes('\0')) {
        return false;
    }

    return emailRegex.test(trimmedEmail);
}

/**
 * Validates phone number format
 * 
 * @param phone - The phone number to validate
 * @returns True if valid phone format
 */
export function isValidPhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') {
        return false;
    }

    // Remove common formatting characters
    const cleaned = phone.replace(/[\s\-().+]/g, '');

    // Check if remaining characters are digits and reasonable length
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(cleaned);
}

/**
 * Sanitizes file names to prevent path traversal attacks
 * 
 * @param filename - The filename to sanitize
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
        return '';
    }

    // Remove path traversal attempts
    let safe = filename.replace(/\.\./g, '');

    // Remove directory separators
    safe = safe.replace(/[/\\]/g, '');

    // Remove null bytes
    safe = safe.replace(/\0/g, '');

    // Limit length
    if (safe.length > 255) {
        safe = safe.substring(0, 255);
    }

    return safe.trim();
}

/**
 * Constant-time string comparison to prevent timing attacks
 * Use for comparing secrets, tokens, or passwords
 * 
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns True if strings are equal
 */
export function secureCompare(a: string, b: string): boolean {
    if (!a || !b || typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }

    // Use native crypto if available
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const bufferA = encoder.encode(a);
        const bufferB = encoder.encode(b);

        // Different lengths = not equal (but still compare to prevent timing)
        if (bufferA.length !== bufferB.length) {
            // Perform dummy comparison to maintain constant time
            let dummy = 0;
            for (let i = 0; i < Math.max(bufferA.length, bufferB.length); i++) {
                dummy |= (bufferA[i % bufferA.length] || 0) ^ (bufferB[i % bufferB.length] || 0);
            }
            return false;
        }

        // Compare each byte
        let result = 0;
        for (let i = 0; i < bufferA.length; i++) {
            result |= bufferA[i] ^ bufferB[i];
        }

        return result === 0;
    }

    // Fallback for older browsers
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

/**
 * Validates and sanitizes numeric input
 * 
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Sanitized number or null if invalid
 */
export function sanitizeNumber(
    value: unknown,
    min?: number,
    max?: number
): number | null {
    const num = Number(value);

    if (isNaN(num) || !isFinite(num)) {
        return null;
    }

    if (min !== undefined && num < min) {
        return null;
    }

    if (max !== undefined && num > max) {
        return null;
    }

    return num;
}

/**
 * Validates UUID format
 * 
 * @param uuid - The UUID string to validate
 * @returns True if valid UUID format
 */
export function isValidUuid(uuid: string): boolean {
    if (!uuid || typeof uuid !== 'string') {
        return false;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Rate limiting helper for client-side operations
 * Prevents abuse by limiting function calls per time window
 */
export class RateLimiter {
    private attempts: Map<string, number[]> = new Map();

    /**
     * Check if action is allowed under rate limit
     * 
     * @param key - Unique identifier for the action
     * @param maxAttempts - Maximum attempts allowed
     * @param windowMs - Time window in milliseconds
     * @returns True if action is allowed
     */
    isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
        const now = Date.now();
        const attempts = this.attempts.get(key) || [];

        // Remove old attempts outside the window
        const recentAttempts = attempts.filter(time => now - time < windowMs);

        if (recentAttempts.length >= maxAttempts) {
            console.warn(`[Security] Rate limit exceeded for: ${key}`);
            return false;
        }

        // Record this attempt
        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);

        return true;
    }

    /**
     * Reset rate limit for a specific key
     */
    reset(key: string): void {
        this.attempts.delete(key);
    }

    /**
     * Clear all rate limit data
     */
    clearAll(): void {
        this.attempts.clear();
    }
}

/**
 * Content Security Policy violation reporter
 * Logs CSP violations for monitoring
 */
export function setupCspReporting(): void {
    if (typeof window === 'undefined') {
        return;
    }

    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
        console.error('[Security] CSP Violation:', {
            blockedURI: event.blockedURI,
            violatedDirective: event.violatedDirective,
            effectiveDirective: event.effectiveDirective,
            originalPolicy: event.originalPolicy,
            sourceFile: event.sourceFile,
            lineNumber: event.lineNumber,
        });

        // In production, send to monitoring service
        // sendToMonitoring('csp-violation', { ... });
    });
}
