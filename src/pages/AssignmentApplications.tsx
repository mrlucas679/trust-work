import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Briefcase, AlertCircle } from 'lucide-react';
import { ApplicationList, ApplicationStats } from '@/components/applications';
import { useSupabase } from '@/providers/SupabaseProvider';

/**
 * SECURITY: Assignment Applications Page (Employer View)
 * - RLS policies ensure employers only see applications for their own assignments
 * - Validates assignment ownership before displaying applications
 * - All updates require proper authorization via RLS
 */
const AssignmentApplications = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const navigate = useNavigate();
    const { user } = useSupabase();

    // SECURITY: Require authentication
    if (!user) {
        return (
            <div className="container mx-auto py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You must be signed in as an employer to view applications. Please sign in and try again.
                    </AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button onClick={() => navigate('/auth')}>Sign In</Button>
                </div>
            </div>
        );
    }

    if (!assignmentId) {
        return (
            <div className="container mx-auto py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Invalid assignment ID. Please select a valid assignment.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/jobs')}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Jobs
                </Button>
            </div>

            <div className="flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Applications Received</h1>
                    <p className="text-muted-foreground">
                        Review and manage applications for this assignment
                    </p>
                </div>
            </div>

            {/* SECURITY: Statistics component uses RPC with ownership validation */}
            <ApplicationStats assignmentId={assignmentId} />

            {/* SECURITY: Application list filtered by RLS policies */}
            <Card>
                <CardHeader>
                    <CardTitle>Applicants</CardTitle>
                </CardHeader>
                <CardContent>
                    <ApplicationList
                        assignmentId={assignmentId}
                        view="employer"
                        onViewDetails={(id) => navigate(`/applications/${id}`)}
                    />
                </CardContent>
            </Card>

            {/* SECURITY NOTE: Data Protection */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Data Protection:</strong> Applicant data is protected by our privacy policies and RLS.
                    Use this information responsibly and only for hiring purposes. When you accept an application,
                    all other applications are automatically rejected to maintain fairness.
                </AlertDescription>
            </Alert>
        </div>
    );
};

export default AssignmentApplications;
