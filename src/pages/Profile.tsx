import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import {
  Star,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  Edit,
  Mail,
  Globe,
  Building,
  CheckCircle,
  Loader2
} from "lucide-react";
import VerificationBadge from "@/components/trust/VerificationBadge";
import RiskIndicator from "@/components/trust/RiskIndicator";
import CertificationDisplay from "@/components/certifications/CertificationDisplay";
import ReviewStats from "@/components/reviews/ReviewStats";
import ReviewCard from "@/components/reviews/ReviewCard";
import { useNavigate, useParams } from "react-router-dom";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useQuery } from "@tanstack/react-query";
import { getUserReviews, getPendingReviewOpportunities } from "@/lib/api/job-reviews";

interface ProfileData {
  id: string;
  display_name: string;
  email: string;
  phone?: string;
  location?: string;
  role: 'job_seeker' | 'employer';
  skills: string[];
  cv_url?: string;
  avatar_url?: string;
  created_at: string;
  completedJobs: number;
  rating: number;
  portfolio: Array<{ id: string; title: string; client: string; description: string; rating: number; skills: string[] }>;
}

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { supabase, user: authUser } = useSupabase();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = !userId || userId === authUser?.id;
  const targetUserId = userId || authUser?.id;

  // Fetch user reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['user-reviews', targetUserId],
    queryFn: () => getUserReviews(targetUserId!),
    enabled: !!targetUserId
  });

  // Fetch pending review opportunities (only for own profile)
  const { data: pendingReviews = [] } = useQuery({
    queryKey: ['pending-reviews', targetUserId],
    queryFn: getPendingReviewOpportunities,
    enabled: isOwnProfile && !!targetUserId
  });

  const safeCvUrl = (() => {
    if (!profile?.cv_url) return null;
    try {
      const u = new URL(profile.cv_url);
      const isHttp = u.protocol === 'https:' || u.protocol === 'http:';
      const isSupabasePublic = profile.cv_url.includes('/storage/v1/object/public/');
      return isHttp && isSupabasePublic ? profile.cv_url : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      if (!targetUserId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch profile data from Supabase
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single();

        if (!mounted) return;

        if (profileError) {
          console.error('Error loading profile:', profileError);
          setIsLoading(false);
          return;
        }

        // Get user email from auth
        const { data: { user } } = await supabase.auth.getUser();
        const email = user?.email || '';

        // TODO: Fetch completed jobs count and rating from assignments/reviews tables
        // For now, use placeholder values
        const completedJobs = 0;
        const rating = 0;

        setProfile({
          id: profileData.id,
          display_name: profileData.display_name || email.split('@')[0],
          email: email,
          phone: profileData.phone,
          location: profileData.location || profileData.city,
          role: profileData.role || 'job_seeker',
          skills: profileData.skills || [],
          cv_url: profileData.cv_url,
          avatar_url: user?.user_metadata?.avatar_url,
          created_at: profileData.created_at || new Date().toISOString(),
          completedJobs,
          rating,
          portfolio: [], // TODO: Fetch from portfolio table when implemented
        });
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadProfile();
    return () => { mounted = false; };
  }, [supabase, targetUserId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground mb-4">Profile not found</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl font-semibold">
                {profile.display_name.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 w-full min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold">{profile.display_name}</h1>
                <VerificationBadge
                  type="pending"
                  details={["Verification in progress"]}
                />
                <RiskIndicator level="low" reasons={["Profile complete", "Account verified"]} />
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{profile.email}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                {profile.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-warning" />
                    <span className="font-semibold text-lg">{profile.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({profile.completedJobs} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{profile.completedJobs}</span>
                  <span className="text-sm text-muted-foreground">completed jobs</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {isOwnProfile && (
                  <Button onClick={() => navigate('/profile/edit')} className="w-full sm:w-auto">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
                <Button variant="outline" disabled={!safeCvUrl} asChild className="w-full sm:w-auto">
                  {/* If no CV available, keep disabled; when available, link opens in new tab */}
                  <a href={safeCvUrl ?? undefined} target={safeCvUrl ? "_blank" : undefined} rel={safeCvUrl ? "noreferrer" : undefined}>
                    View CV
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {profile.role === 'job_seeker'
                  ? `Experienced professional with ${profile.completedJobs} successfully completed projects. Browse my skills and portfolio below.`
                  : `Employer looking to hire talented professionals. ${profile.completedJobs} projects posted.`
                }
              </p>
            </CardContent>
          </Card>

          {/* Skills & Certifications */}
          {profile.role === 'job_seeker' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills & Certifications
                  </CardTitle>
                  {isOwnProfile && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => navigate('/assignment-dashboard')}
                    >
                      Take Assessments
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-verified" />
                    Verified Skill Certifications
                  </h3>
                  <CertificationDisplay userId={profile.id} />
                </div>
                
                {isOwnProfile && (
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg border-2 border-dashed">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">Boost Your Profile</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Take skill assessments to earn verified certifications and increase your chances of landing jobs.
                        </p>
                        <Button 
                          onClick={() => navigate('/assignment-dashboard')}
                          size="sm"
                        >
                          Start Assessment →
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Review Statistics */}
          <ReviewStats userId={targetUserId!} showDetailed={true} />

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Employment Reviews</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Reviews from past employment relationships
                  </p>
                </div>
                {isOwnProfile && pendingReviews.length > 0 && (
                  <Button onClick={() => navigate('/leave-review')} variant="outline" size="sm">
                    Leave a Review
                    <Badge variant="secondary" className="ml-2">
                      {pendingReviews.length}
                    </Badge>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewsLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-2">No reviews yet</p>
                  {isOwnProfile && (
                    <p className="text-xs text-muted-foreground">
                      Complete jobs to receive reviews from employers
                    </p>
                  )}
                </div>
              ) : (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    showReviewee={false}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Portfolio Work */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Work</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/portfolio')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.portfolio.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No portfolio items yet</p>
              ) : (
                profile.portfolio.slice(0, 2).map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">{project.client}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="h-4 w-4 text-warning" />
                        <span className="font-medium">{project.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Certifications */}
          <CertificationDisplay isOwnProfile={isOwnProfile} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No skills added yet</p>
                ) : (
                  profile.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="border-verified text-verified">
                      {skill}
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Achievement Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="font-semibold">100%</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">On-Time Delivery</span>
                <span className="font-semibold">98%</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <span className="font-semibold">&lt; 2 hours</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Repeat Clients</span>
                <span className="font-semibold">75%</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Actions */}
          {!isOwnProfile && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button className="w-full h-11">Send Message</Button>
                <Button variant="outline" className="w-full h-11">Invite to Job</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;