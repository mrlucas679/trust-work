import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useSupabase } from "@/providers/SupabaseProvider";

/**
 * ForgotPassword component - Allows users to request a password reset email
 * 
 * Security features:
 * - Rate limiting handled by Supabase
 * - Generic success message (doesn't reveal if email exists)
 * - No sensitive data in error messages
 */
const ForgotPassword = () => {
    const { supabase } = useSupabase();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) {
                // Don't reveal if email exists - show generic error
                console.error('Password reset error:', resetError);
                setError('Unable to process request. Please try again later.');
                return;
            }

            // Show success even if email doesn't exist (security best practice)
            setSuccess(true);
        } catch (err) {
            console.error('Password reset exception:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl">Check your email</CardTitle>
                        <CardDescription>
                            If an account exists with <span className="font-medium">{email}</span>,
                            you'll receive a password reset link within a few minutes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted/50 border rounded-md p-4">
                            <div className="flex items-start space-x-3">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1 text-sm text-muted-foreground space-y-2">
                                    <p>Click the link in the email to reset your password.</p>
                                    <p>The link will expire in 1 hour for security reasons.</p>
                                    <p className="font-medium">Didn't receive the email? Check your spam folder.</p>
                                </div>
                            </div>
                        </div>

                        <Button asChild className="w-full">
                            <Link to="/auth">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to sign in
                            </Link>
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => {
                                setSuccess(false);
                                setEmail("");
                            }}
                        >
                            Send to a different email
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
                        <Shield className="h-8 w-8 text-primary mr-2" />
                        <CardTitle className="text-2xl">Reset your password</CardTitle>
                    </div>
                    <CardDescription>
                        Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                autoFocus
                                autoComplete="email"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading || !email}>
                            {loading ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Sending reset link...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send reset link
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Button asChild variant="ghost" className="text-sm">
                            <Link to="/auth">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to sign in
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;
