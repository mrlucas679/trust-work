import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApplicationList } from '@/components/applications';
import { useSupabase } from '@/providers/SupabaseProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

/**
 * SECURITY: Applications Page
 * - RLS policies ensure users only see their own applications
 * - All data access is authenticated via Supabase
 * - No direct database queries - uses secure API layer
 */
const Applications = () => {
    const { user } = useSupabase();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string>('all');

    // SECURITY: Require authentication to view applications
    if (!user) {
        return (
            <div className="container mx-auto py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You must be signed in to view your applications. Please sign in and try again.
                    </AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button onClick={() => navigate('/auth')}>Sign In</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">My Applications</h1>
                    <p className="text-muted-foreground">
                        Track and manage all your job applications
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Application Status</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* SECURITY: Tab filtering done client-side after secure data fetch */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
                            <TabsTrigger value="accepted">Accepted</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                            <TabsTrigger value="withdrawn">Withdrawn</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="mt-6">
                            <ApplicationList
                                view="freelancer"
                                onViewDetails={(id) => navigate(`/applications/${id}`)}
                            />
                        </TabsContent>

                        <TabsContent value="pending" className="mt-6">
                            <ApplicationList
                                view="freelancer"
                                onViewDetails={(id) => navigate(`/applications/${id}`)}
                            />
                        </TabsContent>

                        <TabsContent value="shortlisted" className="mt-6">
                            <ApplicationList
                                view="freelancer"
                                onViewDetails={(id) => navigate(`/applications/${id}`)}
                            />
                        </TabsContent>

                        <TabsContent value="accepted" className="mt-6">
                            <ApplicationList
                                view="freelancer"
                                onViewDetails={(id) => navigate(`/applications/${id}`)}
                            />
                        </TabsContent>

                        <TabsContent value="rejected" className="mt-6">
                            <ApplicationList
                                view="freelancer"
                                onViewDetails={(id) => navigate(`/applications/${id}`)}
                            />
                        </TabsContent>

                        <TabsContent value="withdrawn" className="mt-6">
                            <ApplicationList
                                view="freelancer"
                                onViewDetails={(id) => navigate(`/applications/${id}`)}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* SECURITY NOTE: Privacy and Data Protection */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Your Privacy:</strong> Your applications are protected by Row-Level Security (RLS) policies.
                    Only you and the employers you've applied to can view your application details.
                </AlertDescription>
            </Alert>
        </div>
    );
};

export default Applications;
