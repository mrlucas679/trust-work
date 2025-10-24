import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle, Users, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Welcome = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-16 w-16 text-primary mr-3" />
            <h1 className="text-5xl font-bold text-foreground">TrustWork</h1>
          </div>
          <p className="text-2xl text-muted-foreground font-medium">
            Verified Jobs. Real Gigs. Safe Careers.
          </p>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            South Africa's most trusted job platform where safety meets opportunity. 
            Connect with verified employers and authentic opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-verified/20 hover:border-verified/40 transition-colors">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-verified mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verified Employers</h3>
              <p className="text-muted-foreground">Every employer is thoroughly vetted for your safety</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-6 text-center">
              <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real Opportunities</h3>
              <p className="text-muted-foreground">Authentic jobs and gigs from legitimate businesses</p>
            </CardContent>
          </Card>

          <Card className="border-secondary/40 hover:border-secondary/60 transition-colors">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Safe Community</h3>
              <p className="text-muted-foreground">Protected environment for professional growth</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="px-8 py-6 text-lg" onClick={() => navigate('/auth')}>
            Get Started
          </Button>
          
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Join thousands of South Africans finding safe, verified work opportunities</p>
        </div>
      </div>
    </div>;
};
export default Welcome;