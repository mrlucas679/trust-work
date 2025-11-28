/**
 * Mock Company API Endpoint
 * 
 * This module simulates the OpenCorporates API response for development and testing.
 * It provides sample company data without requiring actual API keys or network calls.
 * 
 * In production, this would be replaced with actual API calls to:
 * - OpenCorporates API: https://api.opencorporates.com
 * - Clearbit Company API: https://company.clearbit.com
 * - State business registries
 */

/**
 * Interface representing the company data structure
 * Based on OpenCorporates API response format
 */
export interface MockCompanyData {
    company_name: string;
    registration_number: string;
    jurisdiction: string;
    status: 'Active' | 'Inactive' | 'Dissolved';
    incorporation_date?: string;
    company_type?: string;
    registered_address?: {
        street: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    officers?: Array<{
        name: string;
        position: string;
        appointed_date?: string;
    }>;
}

/**
 * Mock company database
 * Maps EIN/registration numbers to company information
 */
const MOCK_COMPANIES: Record<string, MockCompanyData> = {
    // US Companies (EIN format: XX-XXXXXXX)
    '12-3456789': {
        company_name: 'Example Corp',
        registration_number: '12-3456789',
        jurisdiction: 'US',
        status: 'Active',
        incorporation_date: '2015-03-15',
        company_type: 'Corporation',
        registered_address: {
            street: '123 Business Street',
            city: 'San Francisco',
            state: 'CA',
            postal_code: '94102',
            country: 'US'
        },
        officers: [
            {
                name: 'John Doe',
                position: 'CEO',
                appointed_date: '2015-03-15'
            },
            {
                name: 'Jane Smith',
                position: 'CFO',
                appointed_date: '2016-01-10'
            }
        ]
    },
    '98-7654321': {
        company_name: 'Tech Innovators LLC',
        registration_number: '98-7654321',
        jurisdiction: 'US',
        status: 'Active',
        incorporation_date: '2018-06-20',
        company_type: 'Limited Liability Company',
        registered_address: {
            street: '456 Tech Avenue',
            city: 'Austin',
            state: 'TX',
            postal_code: '78701',
            country: 'US'
        }
    },
    // Canadian Business Number
    '123456789RC0001': {
        company_name: 'Maple Enterprises Inc',
        registration_number: '123456789RC0001',
        jurisdiction: 'CA',
        status: 'Active',
        incorporation_date: '2017-09-01',
        company_type: 'Corporation'
    },
    // UK Company Registration Number
    '12345678': {
        company_name: 'British Solutions Ltd',
        registration_number: '12345678',
        jurisdiction: 'GB',
        status: 'Active',
        incorporation_date: '2019-02-14',
        company_type: 'Private Limited Company'
    },
    // Australian Business Number
    '12345678901': {
        company_name: 'Aussie Ventures Pty Ltd',
        registration_number: '12345678901',
        jurisdiction: 'AU',
        status: 'Active',
        incorporation_date: '2020-11-05',
        company_type: 'Proprietary Limited'
    },
    // South African Companies (Registration Number format: YYYY/NNNNNN/NN)
    '2015/123456/07': {
        company_name: 'Cape Town Tech Solutions (Pty) Ltd',
        registration_number: '2015/123456/07',
        jurisdiction: 'ZA',
        status: 'Active',
        incorporation_date: '2015-04-22',
        company_type: 'Private Company',
        registered_address: {
            street: '15 Long Street',
            city: 'Cape Town',
            state: 'Western Cape',
            postal_code: '8001',
            country: 'ZA'
        },
        officers: [
            {
                name: 'Thabo Mbeki',
                position: 'Director',
                appointed_date: '2015-04-22'
            },
            {
                name: 'Naledi Khumalo',
                position: 'Director',
                appointed_date: '2015-04-22'
            }
        ]
    },
    '2018/987654/07': {
        company_name: 'Johannesburg Financial Services (Pty) Ltd',
        registration_number: '2018/987654/07',
        jurisdiction: 'ZA',
        status: 'Active',
        incorporation_date: '2018-08-10',
        company_type: 'Private Company',
        registered_address: {
            street: '123 Sandton Drive',
            city: 'Johannesburg',
            state: 'Gauteng',
            postal_code: '2196',
            country: 'ZA'
        },
        officers: [
            {
                name: 'Sipho Dlamini',
                position: 'Managing Director',
                appointed_date: '2018-08-10'
            }
        ]
    },
    '2020/456789/07': {
        company_name: 'Durban Logistics & Trading CC',
        registration_number: '2020/456789/07',
        jurisdiction: 'ZA',
        status: 'Active',
        incorporation_date: '2020-01-15',
        company_type: 'Close Corporation',
        registered_address: {
            street: '45 Marine Parade',
            city: 'Durban',
            state: 'KwaZulu-Natal',
            postal_code: '4001',
            country: 'ZA'
        }
    }
};

/**
 * API Response interface matching OpenCorporates structure
 */
export interface MockApiResponse {
    api_version: string;
    results: {
        companies?: Array<{
            company: MockCompanyData;
        }>;
        company?: MockCompanyData;
    };
}

/**
 * Mock API endpoint: /api/mock-company
 * 
 * Simulates the OpenCorporates API company search endpoint.
 * Accepts either a registration number or company name as query parameter.
 * 
 * @param registrationNumber - The company's registration number (EIN, BN, CRN, ABN)
 * @param companyName - The company name to search for
 * @returns Promise with API response containing company data
 * 
 * @example
 * ```typescript
 * const response = await mockCompanyEndpoint({ registrationNumber: '12-3456789' });
 * console.log(response.results.company.company_name); // "Example Corp"
 * ```
 */
export async function mockCompanyEndpoint(params: {
    registrationNumber?: string;
    companyName?: string;
}): Promise<{ status: number; data: MockApiResponse }> {

    // Simulate network delay (realistic API behavior)
    await new Promise(resolve => setTimeout(resolve, 500));

    const { registrationNumber, companyName } = params;

    // Case 1: Search by registration number (exact match)
    if (registrationNumber) {
        // Clean the registration number (remove spaces, dashes)
        const cleanedNumber = registrationNumber.replace(/[\s-]/g, '');

        // Search in mock database
        let foundCompany: MockCompanyData | undefined;

        // Try exact match first
        foundCompany = MOCK_COMPANIES[registrationNumber];

        // If not found, try cleaned version
        if (!foundCompany) {
            foundCompany = Object.values(MOCK_COMPANIES).find(company =>
                company.registration_number.replace(/[\s-]/g, '') === cleanedNumber
            );
        }

        if (foundCompany) {
            // Return 200 OK with company data
            return {
                status: 200,
                data: {
                    api_version: '0.4',
                    results: {
                        company: foundCompany
                    }
                }
            };
        } else {
            // Return 404 Not Found if company doesn't exist
            return {
                status: 404,
                data: {
                    api_version: '0.4',
                    results: {}
                }
            };
        }
    }

    // Case 2: Search by company name (fuzzy match)
    if (companyName) {
        const searchTerm = companyName.toLowerCase();

        // Find companies with matching names
        const matchingCompanies = Object.values(MOCK_COMPANIES).filter(company =>
            company.company_name.toLowerCase().includes(searchTerm)
        );

        if (matchingCompanies.length > 0) {
            // Return 200 OK with array of matching companies
            return {
                status: 200,
                data: {
                    api_version: '0.4',
                    results: {
                        companies: matchingCompanies.map(company => ({
                            company
                        }))
                    }
                }
            };
        } else {
            // Return 200 with empty results (no matches found)
            return {
                status: 200,
                data: {
                    api_version: '0.4',
                    results: {
                        companies: []
                    }
                }
            };
        }
    }

    // Case 3: No search parameters provided
    // Return 400 Bad Request
    return {
        status: 400,
        data: {
            api_version: '0.4',
            results: {}
        }
    };
}

/**
 * Utility function: Add a new mock company to the database
 * Useful for testing with custom data
 * 
 * @param company - The company data to add
 */
export function addMockCompany(company: MockCompanyData): void {
    MOCK_COMPANIES[company.registration_number] = company;
}

/**
 * Utility function: Get all mock companies
 * Useful for debugging and testing
 * 
 * @returns Array of all mock companies
 */
export function getAllMockCompanies(): MockCompanyData[] {
    return Object.values(MOCK_COMPANIES);
}

/**
 * Utility function: Clear all mock companies
 * Useful for test cleanup
 */
export function clearMockCompanies(): void {
    Object.keys(MOCK_COMPANIES).forEach(key => {
        delete MOCK_COMPANIES[key];
    });
}

/**
 * HTTP-style mock endpoint handler
 * Can be used with test frameworks or mock servers
 * 
 * @param request - Object with query parameters
 * @returns Response object with status and JSON data
 */
export async function handleMockCompanyRequest(request: {
    query: {
        registration_number?: string;
        company_name?: string;
        q?: string; // OpenCorporates uses 'q' for search
    };
}): Promise<{
    status: number;
    json: () => MockApiResponse;
    statusText: string;
}> {

    // Extract query parameters
    const registrationNumber = request.query.registration_number;
    const companyName = request.query.company_name || request.query.q;

    // Call the main endpoint function
    const response = await mockCompanyEndpoint({
        registrationNumber,
        companyName
    });

    // Return HTTP-style response object
    return {
        status: response.status,
        json: () => response.data,
        statusText: response.status === 200 ? 'OK' :
            response.status === 404 ? 'Not Found' :
                'Bad Request'
    };
}

/**
 * Example usage for testing
 */
export const MOCK_API_EXAMPLES = {
    // Search by EIN
    searchByEIN: async () => {
        const response = await mockCompanyEndpoint({
            registrationNumber: '12-3456789'
        });
        console.log('Search by EIN:', response.data.results.company?.company_name);
        return response;
    },

    // Search by company name
    searchByName: async () => {
        const response = await mockCompanyEndpoint({
            companyName: 'Example'
        });
        console.log('Search by name found:', response.data.results.companies?.length, 'companies');
        return response;
    },

    // Not found scenario
    notFound: async () => {
        const response = await mockCompanyEndpoint({
            registrationNumber: '99-9999999'
        });
        console.log('Not found status:', response.status);
        return response;
    }
};
