import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/providers/SupabaseProvider";
import SetupJobSeeker from "./SetupJobSeeker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Upload } from "lucide-react";

const Setup = () => {
  const navigate = useNavigate();
  const { supabase, user } = useSupabase();
  const [userRole, setUserRole] = useState<'job_seeker' | 'employer' | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role, display_name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        // Check localStorage for role selection from signup
        const storedRole = localStorage.getItem('selectedUserRole') as 'job_seeker' | 'employer' | null;
        const roleToUse = storedRole || 'job_seeker';

        // If profile doesn't exist, create it with the stored or default role
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            role: roleToUse,
          });

        if (!insertError) {
          setUserRole(roleToUse);
          localStorage.removeItem('selectedUserRole'); // Clean up
        } else {
          console.error('Failed to create profile:', insertError);
          // Still set the role so user can continue
          setUserRole(roleToUse);
        }
      } else if (data?.role) {
        setUserRole(data.role);
        if (data.role === 'employer' && data.display_name) {
          setCompanyName(data.display_name);
        }
        localStorage.removeItem('selectedUserRole'); // Clean up if it exists
      } else {
        // Profile exists but no role set - check localStorage or default to job seeker
        const storedRole = localStorage.getItem('selectedUserRole') as 'job_seeker' | 'employer' | null;
        const roleToUse = storedRole || 'job_seeker';

        // Update the profile with the role
        await supabase
          .from('profiles')
          .update({ role: roleToUse })
          .eq('id', user.id);

        setUserRole(roleToUse);
        localStorage.removeItem('selectedUserRole'); // Clean up
      }

      setProfileLoading(false);
    };

    loadProfile();
  }, [user, supabase]);

  // If user is a job seeker, show the comprehensive onboarding wizard
  if (userRole === 'job_seeker') {
    return <SetupJobSeeker />;
  }

  // If still loading or role not determined, show loading state
  if (profileLoading || userRole === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary mr-2 animate-pulse" />
              <CardTitle className="text-2xl">Loading Profile...</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleComplete = async () => {
    if (!user || !companyName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: companyName,
          role: userRole,
          business_name: companyName,
          onboarding_completed: true
        });

      if (error) throw error;

      localStorage.setItem('profileSetup', 'complete');
      navigate('/dashboard/employer');
    } catch (err) {
      console.error('Setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Employer setup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="text-2xl">Complete Your Business Profile</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">Set up your employer account</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company">Company Name *</Label>
            <Input
              id="company"
              placeholder="Enter company name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg">Registration Number (Optional)</Label>
            <Input id="reg" placeholder="Company registration number" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input id="website" type="url" placeholder="https://yourcompany.com" />
          </div>

          <div className="space-y-2">
            <Label>Company Logo (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Upload your company logo</p>
              <Button variant="outline" size="sm" type="button">Choose File</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Company Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Tell us about your company..."
              rows={4}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleComplete}
            disabled={loading || !companyName.trim()}
            type="button"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Setting up...
              </>
            ) : 'Complete Setup'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;
