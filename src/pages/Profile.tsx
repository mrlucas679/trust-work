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
  CheckCircle
} from "lucide-react";
import VerificationBadge from "@/components/trust/VerificationBadge";
import RiskIndicator from "@/components/trust/RiskIndicator";
import CertificationDisplay from "@/components/certifications/CertificationDisplay";
import { useNavigate, useParams } from "react-router-dom";
import { mockJobSeeker, mockEmployer } from "@/data/mockData";
import { useSupabase } from "@/providers/SupabaseProvider";

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const isOwnProfile = !userId; // If no userId in params, it's the user's own profile
  const { supabase, user: authUser } = useSupabase();
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const safeCvUrl = (() => {
    if (!cvUrl) return null;
    try {
      const u = new URL(cvUrl);
      const isHttp = u.protocol === 'https:' || u.protocol === 'http:';
      const isSupabasePublic = cvUrl.includes('/storage/v1/object/public/');
      return isHttp && isSupabasePublic ? cvUrl : null;
    } catch {
      return null;
    }
  })();

  // For demo purposes, show job seeker profile
  const user = mockJobSeeker;

  useEffect(() => {
    let mounted = true;
    async function loadCv() {
      const targetId = userId ?? authUser?.id;
      if (!targetId) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('cv_url')
        .eq('id', targetId)
        .single();
      if (!mounted) return;
      if (!error) setCvUrl(data?.cv_url ?? null);
    }
    loadCv();
    return () => { mounted = false; };
  }, [supabase, userId, authUser?.id]);

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl font-semibold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 w-full min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
                <VerificationBadge
                  type={user.verified ? "verified" : "pending"}
                  details={user.verified ? ["Identity verified", "Skills assessed", "Background checked"] : ["Verification in progress"]}
                />
                <RiskIndicator level="low" reasons={["Verified identity", "Good reviews", "Consistent work history"]} />
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Cape Town, South Africa</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined January 2024</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning" />
                  <span className="font-semibold text-lg">{user.rating}</span>
                  <span className="text-sm text-muted-foreground">({user.completedJobs} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{user.completedJobs}</span>
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
                Experienced full-stack developer and digital marketing specialist with a passion for creating
                innovative solutions. I help businesses grow through technology and strategic marketing campaigns.
                With {user.completedJobs} successfully completed projects, I bring reliability and quality to every task.
              </p>
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
              {user.portfolio.slice(0, 2).map((project) => (
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
              ))}
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
                {user.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="border-verified text-verified">
                    {skill}
                  </Badge>
                ))}
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