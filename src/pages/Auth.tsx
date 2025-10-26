import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/providers/SupabaseProvider";
import { SocialAuth } from "@/components/auth/SocialAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { supabase, session } = useSupabase();
  const [selectedRole, setSelectedRole] = useState<'job_seeker' | 'employer' | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const canSubmit = useMemo(() => email.length > 3 && password.length >= 6, [email, password]);

  const afterAuthNavigate = async () => {
    // Check if user has completed setup by checking if display_name exists
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/setup');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', user.id)
        .single();

      // If profile has display_name, setup is complete - go to dashboard
      if (profile?.display_name) {
        if (profile.role === 'job_seeker') {
          navigate('/dashboard/job-seeker');
        } else {
          navigate('/dashboard/employer');
        }
      } else {
        // No display_name means setup not complete
        navigate('/setup');
      }
    } catch (err) {
      console.error('Error checking profile:', err);
      navigate('/setup');
    }
  };

  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Common case when email confirmations are enabled
        if (typeof error.message === 'string' && /confirm(ed)?/i.test(error.message)) {
          setNeedsConfirmation(true);
          return;
        }
        throw error;
      }
      afterAuthNavigate();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: selectedRole ?? 'job_seeker' },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      if (error) throw error;
      // If confirmations are enabled, session may be null here.
      if (data?.session) {
        // Try to create or update the user's profile row (if session is available)
        try {
          const { data: userData } = await supabase.auth.getUser();
          const user = userData?.user;
          if (user) {
            await supabase.from('profiles').upsert({
              id: user.id,
              role: selectedRole ?? 'job_seeker',
            });
          }
        } catch { /* no-op */ }
        afterAuthNavigate();
      } else {
        // No active session yet: prompt for email confirmation
        setNeedsConfirmation(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async () => {
    try {
      setLoading(true);
      setError(null);
      // Resend verification email for signup
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resend confirmation email');
    } finally {
      setLoading(false);
    }
  };

  if (selectedRole === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary mr-2" />
              <CardTitle className="text-2xl">TrustWork</CardTitle>
            </div>
            <CardDescription>Choose your role to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full p-6 h-auto flex flex-col items-center space-y-2"
              onClick={() => setSelectedRole('job_seeker')}
            >
              <User className="h-8 w-8 text-primary" />
              <div>
                <div className="font-semibold">Job Seeker</div>
                <div className="text-sm text-muted-foreground">Find verified jobs and gigs</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full p-6 h-auto flex flex-col items-center space-y-2"
              onClick={() => setSelectedRole('employer')}
            >
              <Building className="h-8 w-8 text-primary" />
              <div>
                <div className="font-semibold">Employer</div>
                <div className="text-sm text-muted-foreground">Post jobs and find talent</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Confirmation screen when email must be verified first
  if (needsConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary mr-2" />
              <CardTitle className="text-2xl">Verify your email</CardTitle>
            </div>
            <CardDescription>
              We sent a verification link to <span className="font-medium">{email}</span>.
              Please confirm your email, then return here to sign in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={resendConfirmation} disabled={loading || !email}>
              {loading ? 'Sending…' : 'Resend verification email'}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setNeedsConfirmation(false)}>
              Back to sign in
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
            <CardTitle className="text-2xl">TrustWork</CardTitle>
          </div>
          <CardDescription>
            {selectedRole === 'job_seeker' ? 'Job Seeker' : 'Employer'} Account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-6">
              <SocialAuth
                role={selectedRole}
                disabled={loading}
                onSuccess={afterAuthNavigate}
                onError={setError}
              />

              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canSubmit && !loading && signIn()}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password">Password</Label>
                  <Button
                    variant="link"
                    className="px-0 font-normal text-xs h-auto"
                    onClick={() => navigate('/forgot-password')}
                    type="button"
                  >
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canSubmit && !loading && signIn()}
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <Button className="w-full" disabled={!canSubmit || loading} onClick={signIn}>
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Signing in…
                  </>
                ) : 'Sign In'}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <SocialAuth
                role={selectedRole}
                disabled={loading}
                onSuccess={afterAuthNavigate}
                onError={setError}
              />

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canSubmit && !loading && signUp()}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password (min 6 characters)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canSubmit && !loading && signUp()}
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <Button className="w-full" disabled={!canSubmit || loading} onClick={signUp}>
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Creating account…
                  </>
                ) : 'Create Account'}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setSelectedRole(null)}
              className="text-sm"
            >
              ← Back to role selection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;