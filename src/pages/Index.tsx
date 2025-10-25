
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

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Verified & Secure",
      description: "Every user verified, with secure payment processing"
    },
    {
      icon: Target,
      title: "AI-Powered",
      description: "Smart matching based on your skills and preferences"
    }
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
                Verified Jobs, Gigs & Talent
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Where every opportunity is verified and every talent is proven through assessments
              </p>

              {/* Action buttons removed */}
            </div>
          </FadeIn>
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
                Your gateway to verified opportunities and proven talent
              </p>
            </div>
          </FadeIn>

          <Card className="max-w-3xl mx-auto hover-scale">
            <CardContent className="p-8">
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We've built a secure ecosystem where trust comes first. Every job and gig is thoroughly verified,
                  and talent proves their skills through comprehensive assessments. With protected payments, professional
                  portfolios, and a complete tracking system, you can focus on what matters most - finding the perfect
                  match for your needs. Experience a workspace where quality meets security.
                </p>
              </div>
            </CardContent>
          </Card>
        </ResponsiveContainer>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <ResponsiveContainer maxWidth="4xl">
          <FadeIn>
            <Card className="glass-effect">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-6">
                  Get Started Today
                </h2>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={() => navigate('/auth')}
                    className="hover-scale"
                  >
                    Sign Up
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-verified" />
                  <span>Free • Verified • Secure</span>
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
