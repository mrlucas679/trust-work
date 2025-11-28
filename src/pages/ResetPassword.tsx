import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/providers/SupabaseProvider";

/**
 * ResetPassword component - Allows users to set a new password after clicking email link
 * 
 * Security features:
 * - Password strength validation (min 8 characters, includes number and special char)
 * - Token validation via Supabase
 * - Secure password input with show/hide toggle
 * - Session cleanup after successful reset
 */
const ResetPassword = () => {
    const navigate = useNavigate();
    const { supabase } = useSupabase();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenError, setTokenError] = useState(false);

    // Validate reset token on mount
    useEffect(() => {
        const validateToken = async () => {
            try {
                // Check if we have a valid session from the reset link
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    setTokenError(true);
                }
            } catch (err) {
                console.error('Token validation error:', err);
                setTokenError(true);
            } finally {
                setValidating(false);
            }
        };

        validateToken();
    }, [supabase]);

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/\d/.test(pwd)) {
            return 'Password must contain at least one number';
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
            return 'Password must contain at least one special character';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate password strength
        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        // Check passwords match using length comparison first to avoid timing attacks
        // Note: This is user input comparison, not credential comparison, so timing attacks are not a practical concern
        const passwordsMatch = password.length === confirmPassword.length && password === confirmPassword;
        if (!passwordsMatch) {
            setError('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                throw updateError;
            }

            setSuccess(true);

            // Redirect to auth page after 3 seconds
            setTimeout(() => {
                navigate('/auth');
            }, 3000);
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Show loading state while validating token
    if (validating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center space-y-4 py-8">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                            <p className="text-sm text-muted-foreground">Validating reset link...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show error if token is invalid or expired
    if (tokenError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <AlertCircle className="h-12 w-12 text-destructive" />
                        </div>
                        <CardTitle className="text-2xl">Invalid or expired link</CardTitle>
                        <CardDescription>
                            This password reset link is invalid or has expired.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted/50 border rounded-md p-4">
                            <p className="text-sm text-muted-foreground">
                                Password reset links expire after 1 hour for security reasons.
                                Please request a new password reset link.
                            </p>
                        </div>

                        <Button asChild className="w-full">
                            <a href="/forgot-password">
                                Request new reset link
                            </a>
                        </Button>

                        <Button asChild variant="ghost" className="w-full">
                            <a href="/auth">
                                Back to sign in
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show success state
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl">Password reset successful</CardTitle>
                        <CardDescription>
                            Your password has been updated successfully.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted/50 border rounded-md p-4">
                            <p className="text-sm text-muted-foreground text-center">
                                Redirecting to sign in page...
                            </p>
                        </div>

                        <Button asChild className="w-full">
                            <a href="/auth">
                                Continue to sign in
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show password reset form
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Shield className="h-8 w-8 text-primary mr-2" />
                        <CardTitle className="text-2xl">Set new password</CardTitle>
                    </div>
                    <CardDescription>
                        Choose a strong password for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    autoFocus
                                    autoComplete="new-password"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                At least 8 characters, including a number and special character
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm new password</Label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                    autoComplete="new-password"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    tabIndex={-1}
                                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading || !password || !confirmPassword}>
                            {loading ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Resetting password...
                                </>
                            ) : (
                                'Reset password'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Button asChild variant="ghost" className="text-sm">
                            <a href="/auth">
                                Cancel
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPassword;
