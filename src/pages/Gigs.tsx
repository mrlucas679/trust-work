import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockGigs } from "@/data/mockData";
import VerificationBadge from "@/components/trust/VerificationBadge";
import RiskIndicator from "@/components/trust/RiskIndicator";
const Gigs = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-muted/20 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Short-term Gigs</h1>
            <p className="text-muted-foreground">Quick projects from verified clients</p>
          </div>
          
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGigs.map((gig, index) => <Card key={gig.id} className="hover:shadow-md transition-all duration-200 animate-fade-in hover:scale-[1.02]" style={{
          animationDelay: `${index * 50}ms`
        }}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{gig.title}</CardTitle>
                    <p className="text-muted-foreground">{gig.client}</p>
                  </div>
                  <div className="flex gap-2">
                    <VerificationBadge type="verified" size="sm" details={['Client identity verified', 'Payment method confirmed', 'Positive review history']} />
                    <RiskIndicator level="low" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{gig.description}</p>
                
                <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {gig.duration}
                  </div>
                  <div className="flex items-center">
                    
                    {gig.budget}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {gig.skills.map(skill => <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>)}
                </div>

                <Button className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">Apply Now</Button>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </div>;
};
export default Gigs;