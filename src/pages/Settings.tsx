import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Bell, Shield, Eye, Trash2, Upload,
  Mail, Phone, MapPin, Edit, Save, X, FileText, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/providers/SupabaseProvider";
import { uploadCv } from "@/lib/storage";
import { useTwoFactor } from "@/hooks/use-two-factor";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";

const Settings = () => {
  const { toast } = useToast();
  const { supabase, user } = useSupabase();
  const { status: twoFactorStatus, loading: twoFactorLoading, disable: disableTwoFactor, checkStatus: refreshTwoFactorStatus } = useTwoFactor();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    skills: [] as string[],
    avatar_url: "",
  });
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [notifications, setNotifications] = useState({
    emailJobs: true,
    emailMessages: true,
    emailSafety: true,
    pushNotifications: true,
    marketingEmails: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowDirectContact: true,
  });

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, phone, location, skills, cv_url')
          .eq('id', user.id)
          .single();

        if (!mounted) return;
        if (!error && data) {
          setProfile({
            name: data.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || '',
            email: user.email || '',
            phone: data.phone || '',
            location: data.location || '',
            bio: '', // Bio not in database yet, can add later
            skills: data.skills || [],
            avatar_url: user.user_metadata?.avatar_url || '',
          });
          setCvUrl(data.cv_url || null);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadProfile();
    return () => { mounted = false; };
  }, [supabase, user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.name,
          phone: profile.phone,
          location: profile.location,
          skills: profile.skills,
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy preferences have been saved.",
    });
  };

  const onChooseFile = () => {
    console.log('CV Upload button clicked');
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
      const { error } = await supabase.from('profiles').upsert({ id: user.id, cv_url: url });
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
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <AppLayout>
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground mt-2">Manage your account preferences and privacy settings</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              {/* Profile Settings */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Profile Information
                        </CardTitle>
                        <CardDescription>
                          Update your profile information and manage your public presence
                        </CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button onClick={handleSaveProfile}>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Photo */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="text-lg">
                          {profile.name.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Change Photo
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG or GIF. Max size 2MB.
                        </p>
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="email"
                              type="email"
                              value={profile.email}
                              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                              disabled={!isEditing}
                            />
                            <Badge variant="outline" className="border-verified text-verified">
                              Verified
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={profile.location}
                            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio">Professional Bio</Label>
                        <textarea
                          id="bio"
                          className="w-full p-3 border rounded-md resize-none"
                          rows={3}
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          disabled={!isEditing}
                          placeholder="Tell employers about your experience and skills..."
                        />
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div>
                      <Label>Skills</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.skills.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No skills added yet</p>
                        ) : (
                          profile.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))
                        )}
                        {isEditing && (
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Manage Skills
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CV Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Curriculum Vitae (CV)
                    </CardTitle>
                    <CardDescription>
                      Upload or replace your CV. Supported: PDF, DOC, DOCX. Max size 10MB.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      {cvUrl ? (
                        <p className="text-sm text-muted-foreground mb-3">
                          CV uploaded.{' '}
                          <a className="underline" href={cvUrl} target="_blank" rel="noreferrer">View</a>
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground mb-3">No CV uploaded yet.</p>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={onFileSelected}
                      />
                      <Button variant="outline" size="sm" onClick={onChooseFile} disabled={cvUploading}>
                        {cvUploading ? 'Uploading…' : (cvUrl ? 'Replace CV' : 'Upload CV')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>
                      Choose what notifications you want to receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Job Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive email notifications for new job matches
                          </p>
                        </div>
                        <Switch
                          checked={notifications.emailJobs}
                          onCheckedChange={(checked) => handleNotificationChange('emailJobs', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Messages</Label>
                          <p className="text-sm text-muted-foreground">
                            Get notified when you receive new messages
                          </p>
                        </div>
                        <Switch
                          checked={notifications.emailMessages}
                          onCheckedChange={(checked) => handleNotificationChange('emailMessages', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Safety Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Important security and safety notifications
                          </p>
                        </div>
                        <Switch
                          checked={notifications.emailSafety}
                          onCheckedChange={(checked) => handleNotificationChange('emailSafety', checked)}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications on your device
                          </p>
                        </div>
                        <Switch
                          checked={notifications.pushNotifications}
                          onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Marketing Emails</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive newsletters and promotional content
                          </p>
                        </div>
                        <Switch
                          checked={notifications.marketingEmails}
                          onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Settings */}
              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Privacy Controls
                    </CardTitle>
                    <CardDescription>
                      Control who can see your information and how you can be contacted
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Profile Visibility</Label>
                          <p className="text-sm text-muted-foreground">
                            Make your profile visible to employers
                          </p>
                        </div>
                        <Switch
                          checked={privacy.profileVisible}
                          onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Show Email Address</Label>
                          <p className="text-sm text-muted-foreground">
                            Display your email on your public profile
                          </p>
                        </div>
                        <Switch
                          checked={privacy.showEmail}
                          onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Show Phone Number</Label>
                          <p className="text-sm text-muted-foreground">
                            Display your phone number on your public profile
                          </p>
                        </div>
                        <Switch
                          checked={privacy.showPhone}
                          onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Allow Direct Contact</Label>
                          <p className="text-sm text-muted-foreground">
                            Let employers contact you directly outside the platform
                          </p>
                        </div>
                        <Switch
                          checked={privacy.allowDirectContact}
                          onCheckedChange={(checked) => handlePrivacyChange('allowDirectContact', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>
                      Manage your password and account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Change Password</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Update your password to keep your account secure
                        </p>
                        <Button variant="outline">Change Password</Button>
                      </div>

                      <Separator />

                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Add an extra layer of security to your account
                        </p>
                        <div className="flex items-center gap-3">
                          {twoFactorLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : twoFactorStatus.enabled ? (
                            <>
                              <Badge variant="outline" className="border-green-500 text-green-600">
                                Enabled
                              </Badge>
                              <Button 
                                variant="outline" 
                                onClick={async () => {
                                  setDisabling2FA(true);
                                  const success = await disableTwoFactor();
                                  setDisabling2FA(false);
                                  if (success) {
                                    toast({
                                      title: "2FA Disabled",
                                      description: "Two-factor authentication has been disabled for your account.",
                                    });
                                  } else {
                                    toast({
                                      title: "Error",
                                      description: "Failed to disable 2FA. Please try again.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                disabled={disabling2FA}
                              >
                                {disabling2FA ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Disabling...
                                  </>
                                ) : (
                                  'Disable 2FA'
                                )}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Badge variant="outline" className="border-warning text-warning">
                                Not Enabled
                              </Badge>
                              <Button variant="outline" onClick={() => setTwoFactorSetupOpen(true)}>
                                Enable 2FA
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <TwoFactorSetup 
                        open={twoFactorSetupOpen}
                        onOpenChange={setTwoFactorSetupOpen}
                        onSuccess={refreshTwoFactorStatus}
                      />

                      <Separator />

                      <div>
                        <Label>Login Sessions</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Manage your active login sessions across devices
                        </p>
                        <Button variant="outline">View Active Sessions</Button>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-destructive">Delete Account</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Permanently delete your account and all associated data
                        </p>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default Settings;