import { useState, useEffect, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Target, Star, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockJobs, mockGigs, mockJobSeeker } from "@/data/mockData";

interface MatchScore {
  jobId: string;
  title: string;
  company: string;
  score: number;
  matchReasons: string[];
  type: 'job' | 'gig';
}

const MatchingEngine = memo(() => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI matching analysis
    const timer = setTimeout(() => {
      const jobMatches = calculateMatches();
      setMatches(jobMatches);
      setIsAnalyzing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const calculateMatches = (): MatchScore[] => {
    const userSkills = mockJobSeeker.skills.map(s => s.toLowerCase());
    const userExperience = 3; // Mock experience years

    const allOpportunities = [
      ...mockJobs.map(job => ({ ...job, type: 'job' as const })),
      ...mockGigs.map(gig => ({ ...gig, type: 'gig' as const, requirements: gig.skills }))
    ];

    return allOpportunities
      .map((opportunity) => {
        let score = 0;
        const matchReasons: string[] = [];

        // Skill matching (40% weight)
        const reqSkills = opportunity.requirements?.map(r => r.toLowerCase()) || [];
        const skillMatches = reqSkills.filter(skill =>
          userSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
        );

        if (skillMatches.length > 0) {
          const skillScore = (skillMatches.length / reqSkills.length) * 40;
          score += skillScore;
          matchReasons.push(`${skillMatches.length}/${reqSkills.length} skills match`);
        }

        // Experience level matching (30% weight)
        if (opportunity.type === 'job') {
          // Simple experience matching logic
          if (userExperience >= 3) {
            score += 30;
            matchReasons.push("Experience level aligned");
          } else if (userExperience >= 1) {
            score += 20;
            matchReasons.push("Growing experience match");
          } else {
            score += 10;
            matchReasons.push("Entry-level opportunity");
          }
        } else {
          score += 25; // Gigs are generally more flexible
          matchReasons.push("Freelance flexibility");
        }

        // Location matching (15% weight)
        const opportunityLocation = opportunity.type === 'job' ? opportunity.location : 'remote';
        if (opportunityLocation?.toLowerCase().includes('remote') ||
          mockJobSeeker.location?.toLowerCase().includes(opportunityLocation?.toLowerCase() || '')) {
          score += 15;
          matchReasons.push("Location preference match");
        } else {
          score += 5;
        }

        // Verification bonus (10% weight)
        if ('verified' in opportunity && opportunity.verified) {
          score += 10;
          matchReasons.push("Verified employer");
        }

        // Safety penalty (5% weight)
        if ('flagged' in opportunity && opportunity.flagged) {
          score -= 20;
          matchReasons.push("⚠️ Flagged posting");
        } else {
          score += 5;
          matchReasons.push("Safe opportunity");
        }

        return {
          jobId: opportunity.id,
          title: opportunity.title,
          company: 'company' in opportunity ? opportunity.company : opportunity.client,
          score: Math.min(Math.max(score, 0), 100),
          matchReasons,
          type: opportunity.type
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // Top 8 matches
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-muted-foreground";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Potential Match";
  };

  if (isAnalyzing) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-primary animate-pulse" />
            AI Matching Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing your profile and preferences...</p>
            <p className="text-sm text-muted-foreground mt-2">Matching skills, experience, and location</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary" />
            Personalized Matches
          </CardTitle>
          <Badge variant="outline" className="border-primary text-primary">
            <TrendingUp className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {matches.map((match, index) => (
          <div
            key={match.jobId}
            className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 animate-scale-in hover-scale"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{match.title}</h3>
                  <Badge
                    variant={match.type === 'job' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {match.type === 'job' ? 'Job' : 'Gig'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{match.company}</p>
              </div>

              <div className="text-right">
                <div className={`text-lg font-bold ${getScoreColor(match.score)}`}>
                  {match.score}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {getScoreLabel(match.score)}
                </div>
              </div>
            </div>

            {/* Match Score Visualization */}
            <div className="mb-3">
              <Progress
                value={match.score}
                className="h-2"
              />
            </div>

            {/* Match Reasons */}
            <div className="flex flex-wrap gap-1 mb-3">
              {match.matchReasons.slice(0, 3).map((reason, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs"
                >
                  {reason.includes('⚠️') ? (
                    <span className="text-warning">{reason}</span>
                  ) : (
                    reason
                  )}
                </Badge>
              ))}
              {match.matchReasons.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{match.matchReasons.length - 3} more
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => navigate(match.type === 'job' ? `/job/${match.jobId}` : `/gigs`)}
                className="flex-1"
              >
                View Details
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(match.type === 'job' ? `/apply/${match.jobId}` : `/gigs`)}
              >
                {match.type === 'job' ? 'Apply' : 'Propose'}
              </Button>
            </div>
          </div>
        ))}

        {matches.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No matches found at the moment.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/profile')}
            >
              Update Your Profile
            </Button>
          </div>
        )}

        {/* Matching Tips */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center">
            <Star className="h-4 w-4 mr-1 text-primary" />
            Improve Your Matches
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Complete skills assessments to boost match accuracy</li>
            <li>• Keep your profile updated with latest experience</li>
            <li>• Add portfolio items to showcase your work</li>
            <li>• Set location and salary preferences</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
});

MatchingEngine.displayName = 'MatchingEngine';

export default MatchingEngine;