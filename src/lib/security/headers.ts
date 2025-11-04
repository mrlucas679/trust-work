/**
 * Security Headers Configuration
 * 
 * Comprehensive security headers to protect against common web vulnerabilities
 * including XSS, clickjacking, MIME sniffing, and more.
 */

/**
 * Content Security Policy (CSP) configuration
 * Defines which resources can be loaded and from where
 */
export const CSP_DIRECTIVES = {
    // Default policy for all resource types
    'default-src': ["'self'"],

    // Scripts: Allow self and inline scripts (needed for React)
    // In production, consider using nonces or hashes instead of 'unsafe-inline'
    'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Vite dev mode and React
        "'unsafe-eval'",   // Required for Vite dev mode
        'https://cdn.jsdelivr.net', // For external libraries
    ],

    // Styles: Allow self and inline styles
    'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for styled-components and CSS-in-JS
        'https://fonts.googleapis.com',
    ],

    // Images: Allow self, data URLs, and external image sources
    'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:', // Allow HTTPS images from any source (for user avatars, etc.)
    ],

    // Fonts: Allow self and Google Fonts
    'font-src': [
        "'self'",
        'data:',
        'https://fonts.gstatic.com',
    ],

    // API connections
    'connect-src': [
        "'self'",
        'https://*.supabase.co', // Supabase API
        'wss://*.supabase.co',   // Supabase real-time
    ],

    // Frames: Prevent loading in iframes (clickjacking protection)
    'frame-ancestors': ["'none'"],

    // Object/embed tags
    'object-src': ["'none'"],

    // Base URI restriction
    'base-uri': ["'self'"],

    // Form submission targets
    'form-action': ["'self'"],

    // Upgrade insecure requests in production
    'upgrade-insecure-requests': [],
} as const;

/**
 * Converts CSP directives object to CSP header string
 */
export function buildCspHeader(directives: typeof CSP_DIRECTIVES): string {
    return Object.entries(directives)
        .map(([key, values]) => {
            if (Array.isArray(values) && values.length > 0) {
                return `${key} ${values.join(' ')}`;
            }
            return key; // For directives without values like 'upgrade-insecure-requests'
        })
        .join('; ');
}

/**
 * Security headers configuration for production deployment
 * Apply these headers via your hosting provider or web server configuration
 */
export const SECURITY_HEADERS = {
    // Content Security Policy
    'Content-Security-Policy': buildCspHeader(CSP_DIRECTIVES),

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking via iframes
    'X-Frame-Options': 'DENY',

    // Enable browser XSS protection
    'X-XSS-Protection': '1; mode=block',

    // Referrer policy - limit information sent to external sites
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy - restrict browser features
    'Permissions-Policy': [
        'geolocation=()',      // Disable geolocation
        'microphone=()',       // Disable microphone
        'camera=()',           // Disable camera
        'payment=()',          // Disable payment
        'usb=()',              // Disable USB
        'magnetometer=()',     // Disable magnetometer
    ].join(', '),

    // HTTP Strict Transport Security (HSTS)
    // Only include this in production with HTTPS enabled
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
} as const;

/**
 * Vercel configuration for security headers
 * Add this to vercel.json in your project root
 */
export const VERCEL_SECURITY_CONFIG = {
    headers: [
        {
            source: '/(.*)',
            headers: Object.entries(SECURITY_HEADERS).map(([key, value]) => ({
                key,
                value: String(value),
            })),
        },
    ],
};

/**
 * Netlify configuration for security headers
 * Add this to netlify.toml in your project root
 */
export const NETLIFY_SECURITY_CONFIG = `
[[headers]]
  for = "/*"
  [headers.values]
${Object.entries(SECURITY_HEADERS)
        .map(([key, value]) => `    ${key} = "${value}"`)
        .join('\n')}
`;

/**
 * Apache .htaccess configuration for security headers
 */
export const APACHE_SECURITY_CONFIG = `
<IfModule mod_headers.c>
${Object.entries(SECURITY_HEADERS)
        .map(([key, value]) => `    Header always set ${key} "${value}"`)
        .join('\n')}
</IfModule>
`;

/**
 * Nginx configuration for security headers
 */
export const NGINX_SECURITY_CONFIG = `
${Object.entries(SECURITY_HEADERS)
        .map(([key, value]) => `add_header ${key} "${value}" always;`)
        .join('\n')}
`;

/**
 * Client-side CSP meta tag (fallback for static hosting)
 * Insert this in index.html if server-side headers aren't available
 */
export function generateCspMetaTag(): string {
    return `<meta http-equiv="Content-Security-Policy" content="${buildCspHeader(CSP_DIRECTIVES)}">`;
}

/**
 * CORS configuration for API endpoints
 */
export const CORS_CONFIG = {
    // Allowed origins (configure based on your domains)
    allowedOrigins: [
        'http://localhost:8080',
        'http://localhost:5173',
        'https://trustwork.app', // Replace with your production domain
    ],

    // Allowed HTTP methods
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Allowed headers
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
    ],

    // Allow credentials (cookies, authorization headers)
    credentials: true,

    // Cache preflight requests for 24 hours
    maxAge: 86400,
} as const;

/**
 * Validate origin against allowed origins
 */
export function isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) return false;
    return CORS_CONFIG.allowedOrigins.includes(origin);
}

/**
 * Security best practices documentation
 */
export const SECURITY_BEST_PRACTICES = {
    headers: {
        deployment: [
            '1. Configure security headers in your hosting provider',
            '2. Test headers with securityheaders.com',
            '3. Enable HSTS only after testing HTTPS works correctly',
            '4. Update CSP directives based on your actual resource needs',
        ],
        testing: [
            'Use browser DevTools Security tab to verify CSP',
            'Test in multiple browsers (Chrome, Firefox, Safari)',
            'Check for CSP violations in console',
        ],
    },
    csp: {
        production: [
            "Remove 'unsafe-inline' and 'unsafe-eval' if possible",
            'Use nonces or hashes for inline scripts',
            'Enable CSP reporting to monitor violations',
        ],
        monitoring: [
            'Set up CSP report-uri or report-to directive',
            'Monitor CSP violations in production',
            'Gradually tighten CSP based on violation reports',
        ],
    },
    cors: {
        configuration: [
            'Whitelist only necessary origins',
            'Avoid using wildcard (*) in production',
            'Use credentials flag only when needed',
            'Implement proper preflight handling',
        ],
    },
} as const;
