import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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

const Profile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const isOwnProfile = !userId; // If no userId in params, it's the user's own profile

  // For demo purposes, show job seeker profile
  const user = mockJobSeeker;

  return (
    <div className="min-h-screen bg-muted/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <VerificationBadge
                    type={user.verified ? "verified" : "pending"}
                    details={user.verified ? ["Identity verified", "Skills assessed", "Background checked"] : ["Verification in progress"]}
                  />
                  <RiskIndicator level="low" reasons={["Verified identity", "Good reviews", "Consistent work history"]} />
                </div>

                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {user.email}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Cape Town, South Africa
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined January 2024
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-warning mr-2" />
                    <span className="font-semibold text-lg">{user.rating}</span>
                    <span className="text-muted-foreground ml-1">({user.completedJobs} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-primary mr-2" />
                    <span className="font-semibold">{user.completedJobs}</span>
                    <span className="text-muted-foreground ml-1">completed jobs</span>
                  </div>
                </div>

                {isOwnProfile && (
                  <Button onClick={() => navigate('/profile/edit')}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
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
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">{project.client}</p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-warning mr-1" />
                        <span className="font-medium">{project.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-1">
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
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
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
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completion Rate</span>
                  <span className="font-semibold">100%</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">On-Time Delivery</span>
                  <span className="font-semibold">98%</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Time</span>
                  <span className="font-semibold">&lt; 2 hours</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Repeat Clients</span>
                  <span className="font-semibold">75%</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Actions */}
            {!isOwnProfile && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Button className="w-full">Send Message</Button>
                  <Button variant="outline" className="w-full">Invite to Job</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;