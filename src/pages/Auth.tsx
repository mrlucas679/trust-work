import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase, Building, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/providers/SupabaseProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Authentication Page
 * Professional job board login/signup inspired by Career24, PNet, CareerJunction
 * 
 * Key Features:
 * - Clear job seeker vs employer distinction
 * - Professional, trustworthy design
 * - Simple initial signup (just email + password)
 * - Detailed profile completed in Setup.tsx
 * - South African-focused (but international-ready)
 */

const Auth = () => {
    const navigate = useNavigate();
    const { supabase, user, session } = useSupabase();

    // Role selection (first step)
    const [selectedRole, setSelectedRole] = useState<'job_seeker' | 'employer' | null>(null);

    // Auth form state
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Redirect if already authenticated
    useEffect(() => {
        if (user && session) {
            // Check profile role and redirect
            supabase
                .from('profiles')
                .select('role, onboarding_completed')
                .eq('id', user.id)
                .single()
                .then(({ data }) => {
                    if (data) {
                        if (!data.onboarding_completed) {
                            navigate('/setup');
                        } else if (data.role === 'employer') {
                            navigate('/dashboard/employer');
                        } else {
                            navigate('/dashboard/job-seeker');
                        }
                    }
                });
        }
    }, [user, session, navigate, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        if (!selectedRole) {
            setError("Please select your role first");
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                // Login
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;

                if (data.user) {
                    // Check profile and redirect
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role, onboarding_completed')
                        .eq('id', data.user.id)
                        .single();

                    if (profile) {
                        if (!profile.onboarding_completed) {
                            navigate('/setup');
                        } else if (profile.role === 'employer') {
                            navigate('/dashboard/employer');
                        } else {
                            navigate('/dashboard/job-seeker');
                        }
                    } else {
                        // Profile doesn't exist, create it
                        localStorage.setItem('selectedUserRole', selectedRole);
                        navigate('/setup');
                    }
                }
            } else {
                // Signup
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: selectedRole,
                        },
                    },
                });

                if (signUpError) throw signUpError;

                if (data.user) {
                    // Store role for Setup page
                    localStorage.setItem('selectedUserRole', selectedRole);

                    // Create profile record
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert({
                            id: data.user.id,
                            role: selectedRole,
                            onboarding_completed: false,
                        });

                    // Even if profile creation fails (schema cache), Setup.tsx will handle it
                    if (profileError) {
                        console.warn('Profile creation deferred:', profileError.message);
                    }

                    // Redirect to setup for detailed profile
                    navigate('/setup');
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Role selection
    if (!selectedRole) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-3xl font-bold">Welcome to TrustWork</CardTitle>
                        <CardDescription className="text-base">
                            South Africa's trusted freelance platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-center text-muted-foreground mb-6">
                            I want to:
                        </p>

                        <button
                            onClick={() => setSelectedRole('job_seeker')}
                            className="w-full p-6 rounded-lg border-2 border-muted hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                <Briefcase className="h-8 w-8 text-primary mt-1" />
                                <div className="text-left">
                                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                                        Find Work
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        I'm a freelancer looking for projects and opportunities
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => setSelectedRole('employer')}
                            className="w-full p-6 rounded-lg border-2 border-muted hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                <Building className="h-8 w-8 text-primary mt-1" />
                                <div className="text-left">
                                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                                        Hire Talent
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        I'm an employer looking to hire skilled professionals
                                    </p>
                                </div>
                            </div>
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Step 2: Login/Signup form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {selectedRole === 'job_seeker' ? (
                            <>
                                <Briefcase className="h-4 w-4" />
                                <span>Job Seeker Account</span>
                            </>
                        ) : (
                            <>
                                <Building className="h-4 w-4" />
                                <span>Employer Account</span>
                            </>
                        )}
                        <button
                            onClick={() => setSelectedRole(null)}
                            className="ml-auto text-primary hover:underline"
                        >
                            Change
                        </button>
                    </div>
                    <CardTitle className="text-2xl">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </CardTitle>
                    <CardDescription>
                        {isLogin
                            ? 'Sign in to your TrustWork account'
                            : 'Get started with TrustWork today'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {!isLogin && (
                                <p className="text-xs text-muted-foreground">
                                    Must be at least 6 characters
                                </p>
                            )}
                        </div>

                        {isLogin && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="remember" />
                                    <label
                                        htmlFor="remember"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Remember me
                                    </label>
                                </div>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="px-0 text-sm"
                                    onClick={() => navigate('/auth/reset-password')}
                                >
                                    Forgot password?
                                </Button>
                            </div>
                        )}

                        {!isLogin && (
                            <div className="flex items-start space-x-2">
                                <Checkbox id="terms" required />
                                <label
                                    htmlFor="terms"
                                    className="text-sm leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I agree to the{' '}
                                    <a href="/terms" className="text-primary hover:underline">
                                        Terms of Service
                                    </a>{' '}
                                    and{' '}
                                    <a href="/privacy" className="text-primary hover:underline">
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    {isLogin ? 'Signing in...' : 'Creating account...'}
                                </>
                            ) : (
                                isLogin ? 'Sign In' : 'Create Account'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError("");
                                }}
                                className="text-primary font-semibold hover:underline"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Auth;
