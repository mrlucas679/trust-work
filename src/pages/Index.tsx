
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Star, 
  Briefcase,
  ArrowRight,
  Search,
  Target,
  Award,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FadeIn, StaggeredChildren } from "@/components/ui/animations";
import { ResponsiveContainer } from "@/components/ui/responsive-grid";
import VerificationBadge from "@/components/trust/VerificationBadge";
import SafetyBanner from "@/components/trust/SafetyBanner";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Trust & Verification",
      description: "Every employer and freelancer is verified through our comprehensive security checks"
    },
    {
      icon: Target,
      title: "AI-Powered Matching",
      description: "Our smart algorithm matches you with opportunities based on skills, experience, and preferences"
    },
    {
      icon: CheckCircle,
      title: "Secure Payments",
      description: "Protected payment processing with escrow services and fraud monitoring"
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description: "Built-in review system and quality scores ensure excellent work standards"
    }
  ];

  const stats = [
    { number: "25,000+", label: "Verified Users", icon: Users },
    { number: "15,000+", label: "Jobs Posted", icon: Briefcase },
    { number: "4.8/5", label: "Average Rating", icon: Star },
    { number: "98%", label: "Success Rate", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-background via-background to-muted/30 py-20">
          <ResponsiveContainer maxWidth="6xl">
            <FadeIn>
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                  <h1 className="text-4xl md:text-6xl font-bold text-gradient">
                    TrustWork
                  </h1>
                  <VerificationBadge type="verified" showTooltip={false} />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-foreground">
                  South Africa's Most Trusted Job Platform
                </h2>
                
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Connect with verified employers and talented freelancers in a secure, 
                  AI-powered environment designed for the South African market.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/jobs')}
                    className="hover-scale"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Find Jobs
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/gigs')}
                    className="hover-scale"
                  >
                    <Briefcase className="h-5 w-5 mr-2" />
                    Browse Gigs
                  </Button>
                </div>
              </div>
            </FadeIn>

            {/* Safety Banner */}
            <FadeIn delay={300}>
              <SafetyBanner type="general" />
            </FadeIn>
          </ResponsiveContainer>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-card">
          <ResponsiveContainer maxWidth="6xl">
            <StaggeredChildren staggerDelay={150} className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-2">{stat.number}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </StaggeredChildren>
          </ResponsiveContainer>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <ResponsiveContainer maxWidth="6xl">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Why Choose TrustWork?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Built specifically for South Africa, with world-class security and local expertise.
                </p>
              </div>
            </FadeIn>

            <StaggeredChildren staggerDelay={200} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="h-full hover-scale">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </StaggeredChildren>
          </ResponsiveContainer>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
          <ResponsiveContainer maxWidth="4xl">
            <FadeIn>
              <Card className="glass-effect">
                <CardContent className="p-12 text-center">
                  <Zap className="h-12 w-12 text-primary mx-auto mb-6" />
                  <h2 className="text-3xl font-bold mb-4">
                    Ready to Get Started?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Join thousands of verified professionals and businesses already using TrustWork.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg"
                      onClick={() => navigate('/auth')}
                      className="hover-scale"
                    >
                      Join as Job Seeker
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => navigate('/auth')}
                      className="hover-scale"
                    >
                      Hire Talent
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>

                  <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-verified" />
                    <span>Free to join • Verified employers only • Secure payments</span>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </ResponsiveContainer>
        </section>
      </div>
  );
};

export default Index;
