import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/providers/SupabaseProvider";
import { uploadCv } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
const Setup = () => {
  const navigate = useNavigate();
  const { supabase, user } = useSupabase();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'job_seeker' | 'employer' | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [cvUploading, setCvUploading] = useState(false);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };
  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: userRole === 'job_seeker' ? fullName : companyName,
          role: userRole
        });

      if (error) throw error;

      localStorage.setItem('profileSetup', 'complete');
      if (userRole === 'job_seeker') {
        navigate('/dashboard/job-seeker');
      } else {
        navigate('/dashboard/employer');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to complete setup',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('cv_url, role, display_name')
          .eq('id', user.id)
          .single();

        if (!mounted) return;

        if (!error && data) {
          setCvUrl(data.cv_url ?? null);
          setUserRole(data.role as 'job_seeker' | 'employer');

          // Pre-fill name fields if already set
          if (data.display_name) {
            if (data.role === 'job_seeker') {
              setFullName(data.display_name);
            } else {
              setCompanyName(data.display_name);
            }
          }
        } else {
          // If no profile exists, default to job_seeker
          // This shouldn't happen in normal flow, but provides fallback
          setUserRole('job_seeker');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setUserRole('job_seeker'); // Default fallback
      } finally {
        setProfileLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [supabase, user]);

  const onChooseFile = () => {
    console.log('CV Upload button clicked (Setup page)');
    console.log('File input ref:', fileInputRef.current);
    if (!user) {
      toast({ title: 'Not signed in', description: 'Please sign in to upload your CV.' });
      return;
    }
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file?.name);
    if (!file) return;
    if (!user) {
      toast({ title: 'Not signed in', description: 'Please sign in to upload your CV.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload a file up to 10MB.' });
      return;
    }
    try {
      setCvUploading(true);
      console.log('Starting CV upload...');
      const { url } = await uploadCv(file, user.id);
      console.log('CV uploaded, URL:', url);
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, cv_url: url });
      if (error) throw error;
      setCvUrl(url);
      toast({ title: 'CV uploaded', description: 'Your CV has been uploaded successfully.' });
    } catch (err) {
      console.error('CV upload error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to upload CV';
      toast({
        title: 'Upload failed',
        description: msg,
        variant: 'destructive'
      });
    } finally {
      setCvUploading(false);
      // reset input to allow selecting same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  // Show loading while determining user role
  if (profileLoading || !userRole) {
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

  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-primary mr-2" />
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {userRole === 'job_seeker' ?
          // Job Seeker Setup
          <>
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                placeholder="Enter your full name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2 mb-2">
                <Input placeholder="Add a skill" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyPress={e => e.key === 'Enter' && addSkill()} />
                <Button onClick={addSkill} variant="outline" type="button">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => <Badge key={skill} variant="secondary" className="pr-1">
                  {skill}
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => removeSkill(skill)} type="button">
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>)}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload CV (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                {cvUrl ? (
                  <p className="text-sm text-muted-foreground mb-2">
                    CV uploaded. <a className="underline" href={cvUrl} target="_blank" rel="noreferrer">View</a>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={onFileSelected}
                />
                <Button variant="outline" size="sm" onClick={onChooseFile} disabled={cvUploading}>
                  {cvUploading ? 'Uploading…' : 'Choose File'}
                </Button>
              </div>
            </div>
          </> :
          // Employer Setup
          <>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
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
              <Textarea id="description" placeholder="Tell us about your company..." rows={4} />
            </div>
          </>}

        <Button
          className="w-full"
          onClick={handleComplete}
          disabled={loading || (userRole === 'job_seeker' && !fullName.trim()) || (userRole === 'employer' && !companyName.trim())}
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
  </div>;
};
export default Setup;