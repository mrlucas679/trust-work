import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, Building2, User2, Loader2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getGigs, type Gig, type GigFilters } from "@/lib/api/gigs";
import { getMyApplications, withdrawApplication, type ApplicationWithDetails } from "@/lib/api/applications";
import { useToast } from "@/hooks/use-toast";
import VerificationBadge from "@/components/trust/VerificationBadge";
import RiskIndicator from "@/components/trust/RiskIndicator";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import { useSupabase } from "@/providers/SupabaseProvider";

const Gigs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEmployer, isJobSeeker } = useSupabase();
  const [activeTab, setActiveTab] = useState<'all' | 'posted' | 'applied'>('all');
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [myApplications, setMyApplications] = useState<ApplicationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    budget: 'all',
    duration: 'all',
    remote: 'all'
  });

  // Fetch gigs and applications
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const apiFilters: GigFilters = { status: 'open' };

        if (filters.remote !== 'all') {
          apiFilters.remoteAllowed = filters.remote === 'true';
        }

        // Fetch gigs
        const gigsData = await getGigs(apiFilters);
        setGigs(gigsData);

        // Fetch user's applications if job seeker
        if (isJobSeeker) {
          try {
            const applicationsData = await getMyApplications();
            setMyApplications(applicationsData);
          } catch (error) {
            console.error('Failed to load applications:', error);
          }
        }
      } catch (error) {
        toast({
          title: "Failed to Load Gigs",
          description: error instanceof Error ? error.message : "Could not fetch gigs",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters.remote, isJobSeeker, toast]);

  // Check if user has applied to a gig
  const getUserApplication = (gigId: string): ApplicationWithDetails | undefined => {
    return myApplications.find(app => app.assignment_id === gigId);
  };

  // Filter gigs based on active tab
  const getFilteredGigs = () => {
    let filtered = gigs;

    // Apply budget filter
    if (filters.budget !== 'all') {
      filtered = filtered.filter(gig => {
        const budget = gig.budget_max || gig.budget_min || 0;
        if (filters.budget === 'low' && budget >= 5000) return false;
        if (filters.budget === 'medium' && (budget < 5000 || budget > 20000)) return false;
        if (filters.budget === 'high' && budget <= 20000) return false;
        return true;
      });
    }

    // Apply tab filter
    if (activeTab === 'applied') {
      // Only show gigs user has applied to
      const appliedGigIds = myApplications.map(app => app.assignment_id);
      filtered = filtered.filter(gig => appliedGigIds.includes(gig.id));
    } else if (activeTab === 'posted') {
      // Show gigs posted by current user (TODO: implement when user_id available)
      // filtered = filtered.filter(gig => gig.client_id === currentUserId);
    }

    return filtered;
  };

  // Handle withdrawing an application
  const handleWithdrawApplication = async (applicationId: string, gigTitle: string) => {
    try {
      setWithdrawingId(applicationId);

      await withdrawApplication(applicationId);

      // Remove from local state
      setMyApplications(prev => prev.filter(app => app.id !== applicationId));

      toast({
        title: "Application Withdrawn",
        description: `Your application for "${gigTitle}" has been withdrawn successfully.`,
      });
    } catch (error) {
      toast({
        title: "Failed to Withdraw",
        description: error instanceof Error ? error.message : "Could not withdraw application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setWithdrawingId(null);
    }
  };

  const filteredGigs = getFilteredGigs();

  return (
    <div className="bg-muted/20 p-6">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {isEmployer ? 'All Gigs' : 'Find Gigs'}
            </h1>
            <p className="text-muted-foreground">
              {isEmployer
                ? 'Browse short-term tasks and gigs posted on the platform'
                : 'Browse short-term opportunities from verified clients'}
            </p>
          </div>
          {isEmployer && (
            <Button onClick={() => navigate('/post-gig')} className="flex items-center gap-2">
              + Post Gig
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'posted' | 'applied')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All Gigs
              </TabsTrigger>
              <TabsTrigger value="posted" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Posted by Me
              </TabsTrigger>
              <TabsTrigger value="applied" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Applied To
                {myApplications.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {myApplications.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-4 flex-wrap">
            <Select
              value={filters.budget}
              onValueChange={(value) => setFilters({ ...filters, budget: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Budget Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budgets</SelectItem>
                <SelectItem value="low">Under 5,000</SelectItem>
                <SelectItem value="medium">5,000 - 20,000</SelectItem>
                <SelectItem value="high">Above 20,000</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.duration}
              onValueChange={(value) => setFilters({ ...filters, duration: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Duration</SelectItem>
                <SelectItem value="short">Less than a week</SelectItem>
                <SelectItem value="medium">1-4 weeks</SelectItem>
                <SelectItem value="long">1+ months</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.remote}
              onValueChange={(value) => setFilters({ ...filters, remote: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Work Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="true">Remote Only</SelectItem>
                <SelectItem value="false">On-site Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Listings */}
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading gigs...</p>
            </CardContent>
          </Card>
        ) : filteredGigs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No gigs found matching your criteria.</p>
              <Button onClick={() => setFilters({ budget: 'all', duration: 'all', remote: 'all' })}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGigs.map((gig, index) => {
              const userApplication = getUserApplication(gig.id);

              return (
                <Card
                  key={gig.id}
                  className="hover:shadow-md transition-all duration-200 animate-fade-in hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {gig.title}
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Gig
                          </Badge>
                        </CardTitle>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <User2 className="h-4 w-4" />
                          Client
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <VerificationBadge
                          type="verified"
                          size="sm"
                          details={[
                            'Identity verified',
                            'Payment method confirmed',
                            'Positive review history'
                          ]}
                        />
                        <RiskIndicator level="low" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{gig.description}</p>

                    <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {gig.deadline ? new Date(gig.deadline).toLocaleDateString() : 'Flexible'}
                      </div>
                      <div className="flex items-center">
                        {gig.budget_min && gig.budget_max
                          ? `R${gig.budget_min.toLocaleString()} - R${gig.budget_max.toLocaleString()}`
                          : gig.budget_min
                            ? `From R${gig.budget_min.toLocaleString()}`
                            : gig.budget_max
                              ? `Up to R${gig.budget_max.toLocaleString()}`
                              : 'Negotiable'}
                      </div>
                      {gig.remote_allowed && (
                        <Badge variant="outline">Remote</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {gig.required_skills?.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Application Status Section */}
                    {userApplication && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Your Application</span>
                          <ApplicationStatusBadge status={userApplication.status} size="sm" />
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Submitted: {new Date(userApplication.created_at).toLocaleDateString()}</div>
                          {userApplication.bid_amount && (
                            <div>Bid: R{userApplication.bid_amount.toLocaleString()}</div>
                          )}
                          {userApplication.estimated_duration && (
                            <div>Duration: {userApplication.estimated_duration}</div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs"
                            onClick={() => navigate(`/application/${userApplication.id}`)}
                          >
                            View Details
                          </Button>
                          {userApplication.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                              disabled={withdrawingId === userApplication.id}
                              onClick={() => handleWithdrawApplication(userApplication.id, gig.title)}
                            >
                              {withdrawingId === userApplication.id ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Withdrawing...
                                </>
                              ) : (
                                'Withdraw'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      disabled={!!userApplication}
                      onClick={() => {
                        if (isJobSeeker) {
                          navigate(`/apply/${gig.id}`);
                        } else {
                          navigate(`/gig/${gig.id}`);
                        }
                      }}
                    >
                      {userApplication
                        ? 'Already Applied'
                        : isJobSeeker
                          ? 'Apply Now'
                          : 'View Details'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default Gigs;