import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, CheckCircle, Users, Heart, Target, 
  Award, Globe, Zap, ExternalLink, User
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Users, label: "Active Job Seekers", value: "50,000+" },
    { icon: CheckCircle, label: "Verified Employers", value: "2,500+" },
    { icon: Award, label: "Jobs Placed", value: "25,000+" },
    { icon: Shield, label: "Scams Prevented", value: "1,000+" }
  ];

  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description: "Every employer is thoroughly vetted and verified before they can post opportunities on our platform."
    },
    {
      icon: CheckCircle,
      title: "Trust & Transparency", 
      description: "We believe in complete transparency. All job postings are clearly marked with verification status."
    },
    {
      icon: Heart,
      title: "Community Care",
      description: "We're committed to creating a supportive environment where everyone can find meaningful work."
    },
    {
      icon: Target,
      title: "Equal Opportunity",
      description: "We promote fair hiring practices and equal opportunities for all South Africans."
    }
  ];

  const team = [
    {
      name: "Sarah Mbeki",
      role: "CEO & Founder",
      bio: "Former tech executive passionate about solving South Africa's employment challenges.",
      image: "/placeholder-avatar-1.jpg"
    },
    {
      name: "David Chen",
      role: "CTO",
      bio: "Security expert focused on building trust through technology and verification systems.", 
      image: "/placeholder-avatar-2.jpg"
    },
    {
      name: "Nomsa Dlamini",
      role: "Head of Safety",
      bio: "Dedicated to protecting job seekers from scams and fraudulent opportunities.",
      image: "/placeholder-avatar-3.jpg"
    }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/10 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center mb-6">
              <Shield className="h-16 w-16 text-primary mr-4" />
              <h1 className="text-5xl font-bold">TrustWork</h1>
            </div>
            <h2 className="text-3xl font-bold mb-4 max-w-4xl mx-auto">
              Verified Jobs. Real Gigs. Safe Careers.
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're building South Africa's most trusted job platform where safety meets opportunity, 
              connecting verified employers with talented job seekers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Join TrustWork
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/help')}>
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <stat.icon className="h-10 w-10 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-8">
                To create South Africa's safest job platform by eliminating scams, verifying every employer, 
                and ensuring that every South African has access to legitimate, safe employment opportunities.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="p-4 border rounded-lg">
                  <Zap className="h-6 w-6 text-accent mx-auto mb-2" />
                  <p><strong>Innovation:</strong> Using technology to make job hunting safer and more efficient</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Globe className="h-6 w-6 text-verified mx-auto mb-2" />
                  <p><strong>Impact:</strong> Reducing unemployment through verified, accessible opportunities</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p><strong>Trust:</strong> Building confidence in the digital job market through verification</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {values.map((value, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Our Story</h2>
              <div className="prose prose-lg mx-auto text-muted-foreground">
                <p className="text-center mb-8">
                  TrustWork was born from a simple but powerful idea: job hunting shouldn't be dangerous.
                </p>
                <Card>
                  <CardContent className="p-8">
                    <p className="mb-4">
                      In 2023, our founder Sarah Mbeki witnessed too many friends and family members 
                      fall victim to job scams - from advance fee frauds to fake companies that 
                      disappeared with personal information. She realized that South Africa needed 
                      a job platform that put safety first.
                    </p>
                    <p className="mb-4">
                      Working with security expert David Chen and safety advocate Nomsa Dlamini, 
                      we built TrustWork from the ground up with verification at its core. Every 
                      employer goes through our rigorous vetting process, including business 
                      registration checks, physical address verification, and background screening.
                    </p>
                    <p className="mb-4">
                      Today, TrustWork is proud to be South Africa's most trusted job platform, 
                      having helped over 25,000 job seekers find safe, legitimate employment 
                      while protecting them from over 1,000 attempted scams.
                    </p>
                    <p>
                      Our mission continues: to ensure that every South African can pursue their 
                      career goals without fear of fraud or exploitation.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Leadership Team</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {team.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <Badge variant="outline" className="mb-3">{member.role}</Badge>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Join the TrustWork Community</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you're looking for your next opportunity or hiring talented professionals, 
              TrustWork provides the safety and verification you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Get Started Today
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/safety')}>
                <Shield className="h-4 w-4 mr-2" />
                Learn About Safety
              </Button>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default About;