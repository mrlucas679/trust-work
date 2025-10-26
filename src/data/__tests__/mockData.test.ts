/**
 * @fileoverview Tests for mockData structures
 */

import {
    mockJobs,
    mockGigs,
    mockJobSeeker,
    mockEmployer,
    mockReviews,
    mockCertifications
} from '../mockData';

describe('mockData structures', () => {
    describe('mockJobs', () => {
        it('should be an array', () => {
            expect(Array.isArray(mockJobs)).toBe(true);
        });

        it('should have jobs with required properties', () => {
            expect(mockJobs.length).toBeGreaterThan(0);

            mockJobs.forEach(job => {
                expect(job).toHaveProperty('id');
                expect(job).toHaveProperty('title');
                expect(job).toHaveProperty('company');
                expect(job).toHaveProperty('location');
                expect(job).toHaveProperty('salary');
            });
        });

        it('should have verified and flagged jobs', () => {
            const verifiedJobs = mockJobs.filter(job => job.verified);
            const flaggedJobs = mockJobs.filter(job => job.flagged);

            expect(verifiedJobs.length).toBeGreaterThan(0);
            expect(flaggedJobs.length).toBeGreaterThan(0);
        });
    });

    describe('mockGigs', () => {
        it('should be an array', () => {
            expect(Array.isArray(mockGigs)).toBe(true);
        });

        it('should have gigs with required properties', () => {
            expect(mockGigs.length).toBeGreaterThan(0);

            mockGigs.forEach(gig => {
                expect(gig).toHaveProperty('id');
                expect(gig).toHaveProperty('title');
                expect(gig).toHaveProperty('budget');
                expect(gig).toHaveProperty('duration');
            });
        });
    });

    describe('mockJobSeeker', () => {
        it('should have user properties', () => {
            expect(mockJobSeeker).toHaveProperty('id');
            expect(mockJobSeeker).toHaveProperty('name');
            expect(mockJobSeeker).toHaveProperty('email');
            expect(mockJobSeeker).toHaveProperty('avatar');
        });

        it('should have rating and verification', () => {
            expect(mockJobSeeker).toHaveProperty('rating');
            expect(mockJobSeeker).toHaveProperty('verified');
            expect(typeof mockJobSeeker.rating).toBe('number');
            expect(typeof mockJobSeeker.verified).toBe('boolean');
        });

        it('should have skills array', () => {
            expect(Array.isArray(mockJobSeeker.skills)).toBe(true);
            expect(mockJobSeeker.skills.length).toBeGreaterThan(0);
        });
    });

    describe('mockEmployer', () => {
        it('should have company properties', () => {
            expect(mockEmployer).toHaveProperty('id');
            expect(mockEmployer).toHaveProperty('name');
            expect(mockEmployer).toHaveProperty('email');
            expect(mockEmployer).toHaveProperty('company');
        });

        it('should have rating and verification', () => {
            expect(mockEmployer).toHaveProperty('rating');
            expect(mockEmployer).toHaveProperty('verified');
            expect(typeof mockEmployer.rating).toBe('number');
            expect(typeof mockEmployer.verified).toBe('boolean');
        });
    });

    describe('mockReviews', () => {
        it('should be an array', () => {
            expect(Array.isArray(mockReviews)).toBe(true);
        });

        it('should have reviews with required properties', () => {
            expect(mockReviews.length).toBeGreaterThan(0);

            mockReviews.forEach(review => {
                expect(review).toHaveProperty('id');
                expect(review).toHaveProperty('rating');
                expect(review).toHaveProperty('comment');
                expect(review).toHaveProperty('author');
                expect(review).toHaveProperty('date');
            });
        });

        it('should have valid ratings', () => {
            mockReviews.forEach(review => {
                expect(review.rating).toBeGreaterThanOrEqual(1);
                expect(review.rating).toBeLessThanOrEqual(5);
            });
        });
    });

    describe('mockCertifications', () => {
        it('should be an array', () => {
            expect(Array.isArray(mockCertifications)).toBe(true);
        });

        it('should have certifications with required properties', () => {
            expect(mockCertifications.length).toBeGreaterThan(0);

            mockCertifications.forEach(cert => {
                expect(cert).toHaveProperty('id');
                expect(cert).toHaveProperty('name');
                expect(cert).toHaveProperty('issuer');
                expect(cert).toHaveProperty('date');
            });
        });

        it('should have valid certification types', () => {
            mockCertifications.forEach(cert => {
                expect(cert).toHaveProperty('type');
                expect(['skill', 'education', 'professional']).toContain(cert.type);
            });
        });
    });

    describe('data consistency', () => {
        it('should have unique IDs across jobs', () => {
            const ids = mockJobs.map(job => job.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have unique IDs across gigs', () => {
            const ids = mockGigs.map(gig => gig.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have valid email formats', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            expect(mockJobSeeker.email).toMatch(emailRegex);
            expect(mockEmployer.email).toMatch(emailRegex);
        });

        it('should have ratings in valid range', () => {
            expect(mockJobSeeker.rating).toBeGreaterThanOrEqual(0);
            expect(mockJobSeeker.rating).toBeLessThanOrEqual(5);
            expect(mockEmployer.rating).toBeGreaterThanOrEqual(0);
            expect(mockEmployer.rating).toBeLessThanOrEqual(5);
        });
    });
});
