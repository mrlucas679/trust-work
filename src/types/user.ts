/**
 * @fileoverview Type definitions for user-related data
 */

/**
 * Base user information interface
 */
export interface IUser {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    verified?: boolean;
}

/**
 * Professional user profile information
 */
export interface IUserProfile extends IUser {
    rating?: number;
    completedJobs?: number;
    professionalStatus?: string;
    skills?: string[];
    hourlyRate?: number;
    location?: string;
    timezone?: string;
}

/**
 * User verification status types
 */
export type VerificationStatus = 'unverified' | 'pending' | 'verified';

/**
 * User role types
 */
export type UserRole = 'freelancer' | 'employer' | 'admin';

/**
 * User account status
 */
export type AccountStatus = 'active' | 'suspended' | 'inactive';
