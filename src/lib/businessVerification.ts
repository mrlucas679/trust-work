/**
 * Business Verification Service
 * 
 * Provides multiple methods to verify business legitimacy:
 * 1. EIN (Employer Identification Number) validation
 * 2. Business name and address verification
 * 3. Domain verification (company email)
 * 4. Third-party API integration (Clearbit, OpenCorporates)
 * 5. Manual review fallback
 */

export interface BusinessInfo {
    businessName: string;
    ein?: string; // Employer Identification Number (US)
    businessNumber?: string; // For non-US businesses
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    website?: string;
    email?: string;
    phone?: string;
}

export interface VerificationResult {
    verified: boolean;
    confidence: 'high' | 'medium' | 'low';
    method: 'automatic' | 'manual' | 'pending';
    provider?: string;
    details?: {
        businessNameMatch?: boolean;
        addressMatch?: boolean;
        einValid?: boolean;
        domainVerified?: boolean;
        registrationValid?: boolean;
    };
    message: string;
    requiresManualReview?: boolean;
    verifiedAt?: string;
}

/**
 * Validate EIN format (US Employer Identification Number)
 * Format: XX-XXXXXXX
 */
export function validateEINFormat(ein: string): boolean {
    // Remove any spaces or dashes
    const cleaned = ein.replace(/[\s-]/g, '');

    // EIN must be 9 digits
    if (!/^\d{9}$/.test(cleaned)) {
        return false;
    }

    // First two digits must be valid (01-99, excluding some reserved numbers)
    const prefix = parseInt(cleaned.substring(0, 2));
    const invalidPrefixes = [0, 7, 8, 9, 17, 18, 19, 28, 29, 49, 69, 70, 78, 79, 89];

    if (invalidPrefixes.includes(prefix)) {
        return false;
    }

    return true;
}

/**
 * Format EIN with dashes
 */
export function formatEIN(ein: string): string {
    const cleaned = ein.replace(/[\s-]/g, '');
    if (cleaned.length === 9) {
        return `${cleaned.substring(0, 2)}-${cleaned.substring(2)}`;
    }
    return ein;
}

/**
 * Verify business domain ownership via email
 */
export async function verifyBusinessDomain(
    email: string,
    website: string
): Promise<boolean> {
    try {
        const emailDomain = email.split('@')[1]?.toLowerCase();
        const websiteDomain = new URL(website).hostname.toLowerCase().replace('www.', '');

        return emailDomain === websiteDomain;
    } catch {
        return false;
    }
}

/**
 * Mock API call to verify business with third-party service
 * In production, integrate with:
 * - Clearbit Company API: https://clearbit.com/docs#enrichment-api-company-api
 * - OpenCorporates API: https://api.opencorporates.com/documentation/API-Reference
 * - IRS Business Search (limited public access)
 * - State Secretary of State registries
 */
async function verifyWithThirdPartyAPI(
    businessInfo: BusinessInfo
): Promise<VerificationResult> {
    try {
        // Import mock API for development/testing
        const { mockCompanyEndpoint } = await import('./api/mockCompanyApi');

        // Call mock OpenCorporates API endpoint
        const response = await mockCompanyEndpoint({
            registrationNumber: businessInfo.ein || businessInfo.businessNumber,
            companyName: businessInfo.businessName
        });

        // Process API response
        if (response.status === 200 && response.data.results.company) {
            const company = response.data.results.company;

            // Verify business name matches
            const nameMatch = company.company_name.toLowerCase()
                .includes(businessInfo.businessName.toLowerCase()) ||
                businessInfo.businessName.toLowerCase()
                    .includes(company.company_name.toLowerCase());

            // Check if company is active
            const isActive = company.status === 'Active';

            // Calculate confidence based on matches
            let confidence: 'high' | 'medium' | 'low' = 'medium';
            if (nameMatch && isActive && company.registered_address) {
                confidence = 'high';
            } else if (nameMatch && isActive) {
                confidence = 'medium';
            } else {
                confidence = 'low';
            }

            return {
                verified: nameMatch && isActive,
                confidence,
                method: 'automatic',
                provider: 'opencorporates-mock',
                details: {
                    businessNameMatch: nameMatch,
                    addressMatch: company.registered_address !== undefined,
                    einValid: businessInfo.ein ? validateEINFormat(businessInfo.ein) : undefined,
                    domainVerified: businessInfo.website !== undefined,
                    registrationValid: isActive,
                },
                message: nameMatch && isActive
                    ? `Business verified successfully through external registry (${company.jurisdiction})`
                    : 'Business information could not be fully verified. Manual review required.',
                requiresManualReview: confidence !== 'high',
            };
        }

        // No company found in API
        return {
            verified: false,
            confidence: 'low',
            method: 'automatic',
            provider: 'opencorporates-mock',
            message: 'Business registration not found in external registries. Manual review required.',
            requiresManualReview: true,
        };

    } catch (error) {
        // API call failed, fallback to basic verification
        console.error('Third-party API verification failed:', error);

        const basicVerified = Boolean(
            businessInfo.businessName.length > 3 &&
            (businessInfo.ein || businessInfo.businessNumber)
        );

        return {
            verified: false,
            confidence: basicVerified ? 'medium' : 'low',
            method: 'automatic',
            provider: 'fallback',
            details: {
                businessNameMatch: true,
                addressMatch: businessInfo.address !== undefined,
                einValid: businessInfo.ein ? validateEINFormat(businessInfo.ein) : undefined,
                domainVerified: businessInfo.website !== undefined,
            },
            message: 'External verification unavailable. Manual review required.',
            requiresManualReview: true,
        };
    }
}

/**
 * Main verification function with fallback chain
 */
export async function verifyBusiness(
    businessInfo: BusinessInfo
): Promise<VerificationResult> {
    try {
        // Step 1: Basic validation
        if (!businessInfo.businessName || businessInfo.businessName.length < 3) {
            return {
                verified: false,
                confidence: 'low',
                method: 'automatic',
                message: 'Business name is required and must be at least 3 characters',
            };
        }

        // Step 2: EIN validation (if provided)
        if (businessInfo.ein && !validateEINFormat(businessInfo.ein)) {
            return {
                verified: false,
                confidence: 'low',
                method: 'automatic',
                message: 'Invalid EIN format. Must be 9 digits (XX-XXXXXXX)',
            };
        }

        // Step 3: Domain verification (if email and website provided)
        if (businessInfo.email && businessInfo.website) {
            const domainVerified = await verifyBusinessDomain(
                businessInfo.email,
                businessInfo.website
            );

            if (!domainVerified) {
                return {
                    verified: false,
                    confidence: 'low',
                    method: 'automatic',
                    message: 'Email domain does not match business website',
                    requiresManualReview: true,
                };
            }
        }

        // Step 4: Third-party API verification
        const apiResult = await verifyWithThirdPartyAPI(businessInfo);

        // If API verification succeeded with high confidence, approve automatically
        if (apiResult.verified && apiResult.confidence === 'high') {
            return {
                ...apiResult,
                verifiedAt: new Date().toISOString(),
            };
        }

        // Step 5: Require manual review for medium/low confidence
        return {
            verified: false,
            confidence: 'medium',
            method: 'pending',
            message: 'Your business verification request has been submitted for manual review. This typically takes 1-2 business days.',
            requiresManualReview: true,
            details: apiResult.details,
        };

    } catch (error) {
        console.error('Business verification error:', error);
        return {
            verified: false,
            confidence: 'low',
            method: 'pending',
            message: 'An error occurred during verification. Please try again or contact support.',
            requiresManualReview: true,
        };
    }
}

/**
 * Check verification status
 */
export function getVerificationStatus(result: VerificationResult): {
    status: 'verified' | 'pending' | 'rejected' | 'not_started';
    badge: 'success' | 'warning' | 'destructive' | 'secondary';
    icon: string;
} {
    if (result.verified) {
        return {
            status: 'verified',
            badge: 'success',
            icon: 'BadgeCheck',
        };
    }

    if (result.requiresManualReview || result.method === 'pending') {
        return {
            status: 'pending',
            badge: 'warning',
            icon: 'Clock',
        };
    }

    if (result.confidence === 'low' && !result.requiresManualReview) {
        return {
            status: 'rejected',
            badge: 'destructive',
            icon: 'XCircle',
        };
    }

    return {
        status: 'not_started',
        badge: 'secondary',
        icon: 'AlertCircle',
    };
}

/**
 * Validate business registration number format by country
 */
export function validateBusinessNumber(number: string, country: string): boolean {
    const cleaned = number.replace(/[\s-]/g, '');

    switch (country.toUpperCase()) {
        case 'US':
            // EIN format
            return validateEINFormat(number);

        case 'CA':
            // Canadian Business Number (BN) - 9 digits + 2-letter program account + 4-digit reference
            return /^\d{9}[A-Z]{2}\d{4}$/.test(cleaned);

        case 'GB':
            // UK Company Registration Number - 8 digits or 2 letters + 6 digits
            return /^(\d{8}|[A-Z]{2}\d{6})$/.test(cleaned);

        case 'AU':
            // Australian Business Number (ABN) - 11 digits
            return /^\d{11}$/.test(cleaned);

        case 'ZA':
            // South African Company Registration Number
            // Format: YYYY/NNNNNN/NN (year/number/checkdigits)
            // Also accepts format without slashes: YYYYNNNNNNNN
            return /^(\d{4}\/\d{6}\/\d{2}|\d{12})$/.test(number.trim());

        default:
            // Generic validation - at least 5 alphanumeric characters
            return /^[A-Z0-9]{5,}$/i.test(cleaned);
    }
}

/**
 * Get business verification requirements by country
 */
export function getVerificationRequirements(country: string): {
    required: string[];
    optional: string[];
    idLabel: string;
    idFormat: string;
} {
    switch (country.toUpperCase()) {
        case 'US':
            return {
                required: ['Business Name', 'EIN', 'Business Address'],
                optional: ['Website', 'Business Email', 'Phone Number'],
                idLabel: 'EIN (Employer Identification Number)',
                idFormat: 'XX-XXXXXXX (9 digits)',
            };

        case 'CA':
            return {
                required: ['Business Name', 'Business Number', 'Business Address'],
                optional: ['Website', 'Business Email', 'Phone Number'],
                idLabel: 'BN (Business Number)',
                idFormat: '9 digits + 2 letters + 4 digits',
            };

        case 'GB':
            return {
                required: ['Business Name', 'Company Registration Number', 'Business Address'],
                optional: ['Website', 'Business Email', 'Phone Number'],
                idLabel: 'Company Registration Number',
                idFormat: '8 digits or 2 letters + 6 digits',
            };

        case 'ZA':
            return {
                required: ['Business Name', 'Registration Number', 'Business Address'],
                optional: ['Website', 'Business Email', 'Phone Number'],
                idLabel: 'Company Registration Number',
                idFormat: 'YYYY/NNNNNN/NN (e.g., 2015/123456/07)',
            };

        default:
            return {
                required: ['Business Name', 'Business Registration Number', 'Business Address'],
                optional: ['Website', 'Business Email', 'Phone Number'],
                idLabel: 'Business Registration Number',
                idFormat: 'Country-specific format',
            };
    }
}
