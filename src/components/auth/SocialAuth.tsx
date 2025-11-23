/**
 * @fileoverview Social Authentication Component
 * Provides secure social login with Apple and Google
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Apple } from 'lucide-react';
import { useSupabase } from '@/providers/SupabaseProvider';
import type { Provider } from '@supabase/supabase-js';

interface SocialAuthProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
    disabled?: boolean;
    role?: 'job_seeker' | 'employer';
}

export function SocialAuth({ onSuccess, onError, disabled, role }: SocialAuthProps) {
    const { supabase } = useSupabase();
    const [loading, setLoading] = useState<Provider | null>(null);

    const handleSocialLogin = async (provider: Provider) => {
        try {
            setLoading(provider);

            // Store role in localStorage before OAuth redirect
            if (role) {
                localStorage.setItem('pendingUserRole', role);
            }

            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    scopes: provider === 'google'
                        ? 'email profile'
                        : undefined, // Apple uses default scopes
                },
            });

            if (error) throw error;

            // OAuth will redirect, so onSuccess will be called after redirect
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(`${provider} sign-in error:`, error);
            const errorMessage = error instanceof Error
                ? error.message
                : `Failed to sign in with ${provider}`;
            if (onError) onError(errorMessage);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Google Sign-In */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    disabled={disabled || loading !== null}
                    className="relative"
                >
                    {loading === 'google' ? (
                        <span className="animate-spin mr-2">⏳</span>
                    ) : (
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                    )}
                    Google
                </Button>

                {/* Apple Sign-In */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('apple')}
                    disabled={disabled || loading !== null}
                    className="relative"
                >
                    {loading === 'apple' ? (
                        <span className="animate-spin mr-2">⏳</span>
                    ) : (
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 21.99C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.13997 6.91 8.85997 6.88C10.15 6.86 11.36 7.75 12.11 7.75C12.86 7.75 14.28 6.68 15.84 6.84C16.48 6.87 18.02 7.10 19.05 8.82C18.95 8.89 17.06 10.10 17.08 12.82C17.10 16.24 20.15 17.47 20.20 17.50C20.18 17.59 19.68 19.33 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                        </svg>
                    )}
                    Apple
                </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
        </div>
    );
}
