/**
 * @fileoverview OAuth Callback Handler
 * Handles OAuth redirects from social providers (Google, Apple)
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabase } from '@/providers/SupabaseProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthCallback = () => {
    const navigate = useNavigate();
    const { supabase } = useSupabase();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the OAuth tokens from the URL hash
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const errorParam = searchParams.get('error');
                const errorDescription = searchParams.get('error_description');

                // Check for OAuth errors
                if (errorParam) {
                    throw new Error(errorDescription || errorParam);
                }

                // If we have tokens, set the session
                if (accessToken && refreshToken) {
                    const { data, error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (sessionError) throw sessionError;

                    if (data.user) {
                        // Create or update profile with OAuth user data
                        // Get role from localStorage (set before OAuth redirect)
                        const role = localStorage.getItem('pendingUserRole') || 'job_seeker';
                        localStorage.removeItem('pendingUserRole'); // Clean up

                        // Get user metadata from OAuth provider
                        const { full_name, avatar_url, email } = data.user.user_metadata;

                        // Upsert profile
                        const { error: profileError } = await supabase
                            .from('profiles')
                            .upsert({
                                id: data.user.id,
                                role: role as 'job_seeker' | 'employer',
                                email: email || data.user.email,
                                display_name: full_name || email?.split('@')[0] || 'User',
                                avatar_url: avatar_url,
                                updated_at: new Date().toISOString(),
                            }, {
                                onConflict: 'id',
                            });

                        if (profileError) {
                            console.error('Profile creation error:', profileError);
                            // Continue anyway, user can complete profile later
                        }

                        // Navigate based on profile completeness
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('display_name, role')
                            .eq('id', data.user.id)
                            .single();

                        if (profile?.display_name) {
                            // Profile is complete, go to dashboard
                            if (profile.role === 'job_seeker') {
                                navigate('/dashboard/job-seeker', { replace: true });
                            } else {
                                navigate('/dashboard/employer', { replace: true });
                            }
                        } else {
                            // Need to complete setup
                            navigate('/setup', { replace: true });
                        }
                    }
                } else {
                    // No tokens found, try to get session normally
                    const { data: sessionData, error: getSessionError } = await supabase.auth.getSession();

                    if (getSessionError) throw getSessionError;

                    if (sessionData.session) {
                        // Session exists, navigate to appropriate dashboard
                        const { data: { user } } = await supabase.auth.getUser();

                        if (user) {
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('display_name, role')
                                .eq('id', user.id)
                                .single();

                            if (profile?.display_name) {
                                if (profile.role === 'job_seeker') {
                                    navigate('/dashboard/job-seeker', { replace: true });
                                } else {
                                    navigate('/dashboard/employer', { replace: true });
                                }
                            } else {
                                navigate('/setup', { replace: true });
                            }
                        }
                    } else {
                        throw new Error('No session found. Please try signing in again.');
                    }
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError(err instanceof Error ? err.message : 'Authentication failed');
                setProcessing(false);
            }
        };

        handleCallback();
    }, [navigate, supabase, searchParams]);

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <CardTitle className="text-2xl">Authentication Error</CardTitle>
                        <CardDescription>
                            We encountered an issue signing you in
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                        <Button
                            className="w-full"
                            onClick={() => navigate('/auth', { replace: true })}
                        >
                            Back to Sign In
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-primary mr-2 animate-pulse" />
                    </div>
                    <CardTitle className="text-2xl">Completing Sign In</CardTitle>
                    <CardDescription>
                        Please wait while we securely authenticate your account...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AuthCallback;
