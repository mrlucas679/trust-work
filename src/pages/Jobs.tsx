import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertTriangle, MapPin, Clock, DollarSign, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockJobs } from "@/data/mockData";
import { PageHeader } from "@/components/layout/PageHeader";
const Jobs = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showSuspicious, setShowSuspicious] = useState(false);
  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === "all" || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesSafety = showSuspicious || !job.flagged;
    return matchesSearch && matchesLocation && matchesSafety;
  });
  const verifiedJobs = filteredJobs.filter(job => job.verified && !job.flagged);
  const suspiciousJobs = filteredJobs.filter(job => job.flagged);
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <PageHeader
          title="Job Opportunities"
          subtitle="Find verified jobs from trusted employers"
        />

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs or companies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
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
                  <p className="text-2xl font-bold">{verifiedJobs.length}</p>
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
                  <p className="text-2xl font-bold">{suspiciousJobs.length}</p>
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
                  <p className="text-2xl font-bold">{filteredJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Total Results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Listings */}
        <div className="space-y-8">
          {/* Verified Jobs Section */}
          {verifiedJobs.length > 0 && <div className="space-y-4">
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
                      </div>
                      <p className="text-muted-foreground font-medium">{job.company}</p>
                    </div>
                    <Button onClick={() => navigate(`/job/${job.id}`)} className="sm:flex-shrink-0 w-full sm:w-auto">
                      View Details
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map(req => <Badge key={req} variant="secondary" className="text-xs">
                      {req}
                    </Badge>)}
                  </div>
                </CardContent>
              </Card>)}
            </div>
          </div>}

          {/* Suspicious Jobs Section */}
          {showSuspicious && suspiciousJobs.length > 0 && <div className="space-y-4">
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
                      <p className="text-muted-foreground font-medium">{job.company}</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate(`/job/${job.id}`)} className="sm:flex-shrink-0 w-full sm:w-auto">
                      View Anyway
                    </Button>
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
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{job.salary}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
            </div>
          </div>}

          {filteredJobs.length === 0 && <Card>
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