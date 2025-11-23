import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertTriangle, MapPin, Clock, Filter, Loader2, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { getJobs, type Assignment } from "@/lib/api/assignments";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/providers/SupabaseProvider";

const Jobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEmployer, isJobSeeker, user } = useSupabase();
  const [locationFilter, setLocationFilter] = useState("all");
  const [showSuspicious, setShowSuspicious] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch assignments from database
  useEffect(() => {
    const fetchAssignments = async () => {
      setIsLoading(true);
      try {
        const filters: Record<string, string> = {
          status: 'open'
        };

        if (locationFilter !== 'all') {
          filters.location = locationFilter;
        }

        const { data } = await getJobs(filters, 50, 0);
        setAssignments(data);
      } catch (error) {
        toast({
          title: "Failed to Load Jobs",
          description: error instanceof Error ? error.message : "Could not fetch job listings",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [locationFilter, toast]);

  const filteredJobs = assignments.filter(job => {
    const matchesLocation = locationFilter === "all" || job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesSafety = showSuspicious || !job.flagged;
    return matchesLocation && matchesSafety;
  });

  const verifiedJobs = filteredJobs.filter(job => !job.flagged);
  const suspiciousJobs = filteredJobs.filter(job => job.flagged);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <div className="flex justify-between items-start gap-4">
          <PageHeader
            title={isEmployer ? "All Job Postings" : "Job Opportunities"}
            subtitle={isEmployer
              ? "Browse all active job postings on the platform"
              : "Find verified jobs from trusted employers. Use the search bar above to find specific jobs."}
          />
          {isEmployer && (
            <Button onClick={() => navigate('/post-job')} size="lg">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post a Job
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="sm:w-48 h-11">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="johannesburg">Johannesburg</SelectItem>
              <SelectItem value="cape town">Cape Town</SelectItem>
              <SelectItem value="durban">Durban</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={showSuspicious ? "destructive" : "outline"}
            onClick={() => setShowSuspicious(!showSuspicious)}
            className="flex items-center justify-center gap-2 h-11 sm:w-auto"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">{showSuspicious ? "Hide Suspicious" : "Show All"}</span>
            <span className="sm:hidden">Filter</span>
          </Button>
        </div>
      </div>

      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-verified/10">
                  <CheckCircle className="h-6 w-6 text-verified" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{isLoading ? '-' : verifiedJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Verified Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{isLoading ? '-' : suspiciousJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Flagged Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{isLoading ? '-' : filteredJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Total Results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Listings */}
        <div className="space-y-8">
          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading job opportunities...</p>
              </CardContent>
            </Card>
          )}

          {/* Verified Jobs Section */}
          {!isLoading && verifiedJobs.length > 0 && <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-verified" />
              Verified Opportunities ({verifiedJobs.length})
            </h2>
            <div className="space-y-4">
              {verifiedJobs.map(job => <Card key={job.id} className="hover:shadow-lg transition-all duration-200 hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Badge variant="outline" className="border-verified text-verified">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                        {job.urgent && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground font-medium">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 sm:flex-shrink-0 w-full sm:w-auto">
                      {isJobSeeker && (
                        <Button onClick={() => navigate(`/apply/job/${job.id}`)} className="flex-1 sm:flex-initial">
                          Apply Now
                        </Button>
                      )}
                      {isEmployer && job.client_id === user?.id && (
                        <Button onClick={() => navigate(`/assignments/${job.id}/applications`)} variant="outline" className="flex-1 sm:flex-initial">
                          Manage Applications
                        </Button>
                      )}
                      {isEmployer && job.client_id !== user?.id && (
                        <Button onClick={() => navigate(`/job/${job.id}`)} variant="outline" className="flex-1 sm:flex-initial">
                          View Details
                        </Button>
                      )}
                      {isJobSeeker && (
                        <Button onClick={() => navigate(`/job/${job.id}`)} variant="outline" className="flex-1 sm:flex-initial">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{job.job_type?.replace('_', ' ') || 'Not specified'}</span>
                    </div>
                    {(job.budget_min || job.budget_max) && (
                      <div className="flex items-center gap-1">
                        <span>
                          {job.budget_min && job.budget_max
                            ? `R${job.budget_min.toLocaleString()} - R${job.budget_max.toLocaleString()}`
                            : job.budget_min
                              ? `From R${job.budget_min.toLocaleString()}`
                              : `Up to R${job.budget_max?.toLocaleString()}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {job.required_skills && job.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills.map(skill => <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>)}
                    </div>
                  )}
                </CardContent>
              </Card>)}
            </div>
          </div>}

          {/* Suspicious Jobs Section */}
          {!isLoading && showSuspicious && suspiciousJobs.length > 0 && <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Flagged Listings ({suspiciousJobs.length}) - Proceed with Caution
            </h2>
            <div className="space-y-4">
              {suspiciousJobs.map(job => <Card key={job.id} className="border-warning/40 bg-warning/5 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Flagged
                        </Badge>
                      </div>
                      <p className="text-muted-foreground font-medium">Posted {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 sm:flex-shrink-0 w-full sm:w-auto">
                      {isJobSeeker && (
                        <Button onClick={() => navigate(`/apply/job/${job.id}`)} variant="outline" className="flex-1 sm:flex-initial">
                          Apply Anyway
                        </Button>
                      )}
                      {isEmployer && job.client_id === user?.id && (
                        <Button onClick={() => navigate(`/assignments/${job.id}/applications`)} variant="outline" className="flex-1 sm:flex-initial">
                          Manage Applications
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => navigate(`/job/${job.id}`)} className="flex-1 sm:flex-initial">
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="bg-warning/15 border border-warning/30 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-warning mb-1">Safety Warning</p>
                        <p className="text-xs text-muted-foreground">This posting has been flagged for suspicious activity. Exercise caution and verify all details independently.</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{job.job_type?.replace('_', ' ') || 'Not specified'}</span>
                    </div>
                    {(job.budget_min || job.budget_max) && (
                      <div className="flex items-center gap-1">
                        <span>
                          {job.budget_min && job.budget_max
                            ? `R${job.budget_min.toLocaleString()} - R${job.budget_max.toLocaleString()}`
                            : job.budget_min
                              ? `From R${job.budget_min.toLocaleString()}`
                              : `Up to R${job.budget_max?.toLocaleString()}`}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>)}
            </div>
          </div>}

          {!isLoading && filteredJobs.length === 0 && <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No jobs found matching your criteria.</p>
              <Button onClick={() => {
                setSearchQuery("");
                setLocationFilter("all");
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>}
        </div>
      </div>
    </div>
  );
};
export default Jobs;