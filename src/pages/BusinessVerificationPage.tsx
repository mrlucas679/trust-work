/**
 * Business Verification Page
 * 
 * Page for employers to submit business verification requests
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/providers/SupabaseProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Shield, CheckCircle, Clock, XCircle } from "lucide-react";
import { BusinessVerification } from "@/components/auth/BusinessVerification";
import {
    BusinessVerificationBadge,
    ProfileBusinessVerificationBadge,
    type BusinessVerificationStatus,
    type BusinessBadgeLevel
} from "@/components/trust/BusinessVerificationBadge";
import { getLatestVerification } from "@/lib/api/businessVerificationApi";
import type { VerificationResult } from "@/lib/businessVerification";

const BusinessVerificationPage = () => {
    const navigate = useNavigate();
    const { user, supabase } = useSupabase();
    const [existingVerification, setExistingVerification] = useState<{
        status: BusinessVerificationStatus;
        badgeLevel: BusinessBadgeLevel;
        businessName?: string;
        verifiedAt?: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVerificationStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadVerificationStatus = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Check profile for verification status
            const { data: profile } = await supabase
                .from('profiles')
                .select('business_verified, business_verification_status, business_name, verification_badge_level, business_verification_completed_at')
                .eq('id', user.id)
                .single();

            if (profile) {
                setExistingVerification({
                    status: profile.business_verification_status || 'not_started',
                    badgeLevel: profile.verification_badge_level || 'none',
                    businessName: profile.business_name,
                    verifiedAt: profile.business_verification_completed_at
                });
            }
        } catch (error) {
            console.error('Error loading verification status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationComplete = (result: VerificationResult) => {
        // Reload status after submission
        loadVerificationStatus();
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={() => navigate('/dashboard/employer')}
                className="mb-4"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </Button>

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Business Verification</h1>
                <p className="text-muted-foreground">
                    Verify your business to build trust with job seekers and unlock premium features.
                </p>
            </div>

            {/* Existing Verification Status */}
            {existingVerification && existingVerification.status !== 'not_started' && (
                <div className="mb-6">
                    {existingVerification.status === 'verified' && existingVerification.businessName && (
                        <ProfileBusinessVerificationBadge
                            businessName={existingVerification.businessName}
                            status={existingVerification.status}
                            badgeLevel={existingVerification.badgeLevel}
                            verifiedAt={existingVerification.verifiedAt}
                        />
                    )}

                    {existingVerification.status === 'pending' && (
                        <Alert>
                            <Clock className="h-4 w-4" />
                            <AlertDescription>
                                Your business verification request is currently under review.
                                This typically takes 1-2 business days. You'll receive an email once the review is complete.
                            </AlertDescription>
                        </Alert>
                    )}

                    {existingVerification.status === 'rejected' && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                                Your previous verification request was not approved.
                                You can submit a new request below with updated information.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}

            {/* Benefits Card */}
            <Card className="mb-6 border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Why Verify Your Business?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Build trust with job seekers by displaying a verified badge</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Get higher visibility in search results</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Access to premium features and priority support</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Reduce fraud and increase application quality</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            {/* Verification Form */}
            {(!existingVerification || existingVerification.status === 'rejected' || existingVerification.status === 'not_started') && (
                <BusinessVerification onVerificationComplete={handleVerificationComplete} />
            )}

            {/* Badge Levels Info */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Verification Levels</CardTitle>
                    <CardDescription>
                        Different verification levels offer varying degrees of trust
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                            <div>
                                <p className="font-medium">Basic Verification</p>
                                <p className="text-sm text-muted-foreground">
                                    Automated verification through business registries and databases
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-blue-600 mt-1" />
                            <div>
                                <p className="font-medium">Premium Verification</p>
                                <p className="text-sm text-muted-foreground">
                                    Manual review by our team with document verification
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-purple-600 mt-1" />
                            <div>
                                <p className="font-medium">Enterprise Verification</p>
                                <p className="text-sm text-muted-foreground">
                                    Full vetting including background checks and on-site verification
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BusinessVerificationPage;
