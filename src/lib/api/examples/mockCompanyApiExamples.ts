/**
 * Mock Company API - Usage Examples and Tests
 * 
 * This file demonstrates how to use the mock company API endpoint
 * that simulates the OpenCorporates API for development and testing.
 */

import { mockCompanyEndpoint, addMockCompany, handleMockCompanyRequest, type MockCompanyData } from '../mockCompanyApi';

/**
 * Example 1: Search for a company by EIN (US)
 * Simulates: GET /api/mock-company?registration_number=12-3456789
 */
export async function exampleSearchByEIN() {
    console.log('--- Example 1: Search by EIN ---');

    const response = await mockCompanyEndpoint({
        registrationNumber: '12-3456789'
    });

    console.log('Status:', response.status); // 200
    console.log('Company Name:', response.data.results.company?.company_name); // "Example Corp"
    console.log('Jurisdiction:', response.data.results.company?.jurisdiction); // "US"
    console.log('Status:', response.data.results.company?.status); // "Active"

    return response;
}

/**
 * Example 2: Search for a company by name
 * Simulates: GET /api/mock-company?company_name=Example
 */
export async function exampleSearchByName() {
    console.log('--- Example 2: Search by Name ---');

    const response = await mockCompanyEndpoint({
        companyName: 'Example'
    });

    console.log('Status:', response.status); // 200
    console.log('Companies Found:', response.data.results.companies?.length);

    response.data.results.companies?.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.company.company_name} (${item.company.registration_number})`);
    });

    return response;
}

/**
 * Example 3: Company not found scenario
 * Simulates: GET /api/mock-company?registration_number=99-9999999
 */
export async function exampleNotFound() {
    console.log('--- Example 3: Not Found ---');

    const response = await mockCompanyEndpoint({
        registrationNumber: '99-9999999'
    });

    console.log('Status:', response.status); // 404
    console.log('Company Found:', response.data.results.company ? 'Yes' : 'No'); // No

    return response;
}

/**
 * Example 4: Invalid request (no parameters)
 * Simulates: GET /api/mock-company
 */
export async function exampleBadRequest() {
    console.log('--- Example 4: Bad Request ---');

    const response = await mockCompanyEndpoint({});

    console.log('Status:', response.status); // 400

    return response;
}

/**
 * Example 5: Add custom company data for testing
 */
export async function exampleAddCustomCompany() {
    console.log('--- Example 5: Add Custom Company ---');

    const customCompany: MockCompanyData = {
        company_name: 'Test Startup Inc',
        registration_number: '55-5555555',
        jurisdiction: 'US',
        status: 'Active',
        incorporation_date: '2024-01-15',
        company_type: 'Corporation',
        registered_address: {
            street: '789 Startup Lane',
            city: 'Seattle',
            state: 'WA',
            postal_code: '98101',
            country: 'US'
        }
    };

    addMockCompany(customCompany);

    // Now search for it
    const response = await mockCompanyEndpoint({
        registrationNumber: '55-5555555'
    });

    console.log('Added Company:', response.data.results.company?.company_name);

    return response;
}

/**
 * Example 6: HTTP-style request handler (for Express.js-like usage)
 * Simulates: app.get('/api/mock-company', handler)
 */
export async function exampleHttpStyleHandler() {
    console.log('--- Example 6: HTTP-Style Handler ---');

    // Simulate Express.js request object
    const mockRequest = {
        query: {
            registration_number: '12-3456789'
        }
    };

    const response = await handleMockCompanyRequest(mockRequest);

    console.log('HTTP Status:', response.status, response.statusText);
    console.log('JSON Data:', response.json());

    return response;
}

/**
 * Example 7: Integration with Business Verification
 * Shows how the mock API is used in the actual verification flow
 */
export async function exampleBusinessVerification() {
    console.log('--- Example 7: Business Verification Integration ---');

    // Simulate business verification data
    const businessInfo = {
        businessName: 'Example Corp',
        ein: '12-3456789',
        address: {
            street: '123 Business Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            country: 'US'
        }
    };

    // Call mock API
    const apiResponse = await mockCompanyEndpoint({
        registrationNumber: businessInfo.ein
    });

    if (apiResponse.status === 200 && apiResponse.data.results.company) {
        const company = apiResponse.data.results.company;

        // Verify business name matches
        const nameMatch = company.company_name.toLowerCase()
            .includes(businessInfo.businessName.toLowerCase());

        console.log('Company Found:', company.company_name);
        console.log('Name Match:', nameMatch);
        console.log('Status:', company.status);
        console.log('Verification Result:', nameMatch && company.status === 'Active' ? 'VERIFIED ✓' : 'MANUAL REVIEW REQUIRED');
    }

    return apiResponse;
}

/**
 * Example 8: Testing all countries
 */
export async function exampleMultiCountrySearch() {
    console.log('--- Example 8: Multi-Country Search ---');

    const countries = [
        { number: '12-3456789', name: 'US (EIN)' },
        { number: '123456789RC0001', name: 'Canada (BN)' },
        { number: '12345678', name: 'UK (CRN)' },
        { number: '12345678901', name: 'Australia (ABN)' }
    ];

    for (const country of countries) {
        const response = await mockCompanyEndpoint({
            registrationNumber: country.number
        });

        console.log(`${country.name}:`, response.data.results.company?.company_name || 'Not found');
    }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
    console.log('\n========================================');
    console.log('MOCK COMPANY API - USAGE EXAMPLES');
    console.log('========================================\n');

    await exampleSearchByEIN();
    console.log('');

    await exampleSearchByName();
    console.log('');

    await exampleNotFound();
    console.log('');

    await exampleBadRequest();
    console.log('');

    await exampleAddCustomCompany();
    console.log('');

    await exampleHttpStyleHandler();
    console.log('');

    await exampleBusinessVerification();
    console.log('');

    await exampleMultiCountrySearch();

    console.log('\n========================================');
    console.log('ALL EXAMPLES COMPLETED');
    console.log('========================================\n');
}

// Uncomment to run examples when this file is imported
// runAllExamples();
