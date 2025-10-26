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
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto p-6">
          <PageHeader
            title="Job Opportunities"
            subtitle="Find verified jobs from trusted employers"
          />

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search jobs or companies..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-48">
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
            <Button variant={showSuspicious ? "destructive" : "outline"} onClick={() => setShowSuspicious(!showSuspicious)} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {showSuspicious ? "Hide Suspicious" : "Show All"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-verified" />
                <div>
                  <p className="text-xl font-bold">{verifiedJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Verified Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-warning" />
                <div>
                  <p className="text-xl font-bold">{suspiciousJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Flagged Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-xl font-bold">{filteredJobs.length}</p>
                  <p className="text-sm text-muted-foreground">Total Results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {/* Verified Jobs Section */}
          {verifiedJobs.length > 0 && <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-verified mr-2" />
              Verified Opportunities ({verifiedJobs.length})
            </h2>
            <div className="space-y-4">
              {verifiedJobs.map(job => <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Badge variant="outline" className="border-verified text-verified">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                      <p className="text-muted-foreground font-medium">{job.company}</p>
                    </div>
                    <Button onClick={() => navigate(`/job/${job.id}`)}>
                      View Details
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">

                      {job.salary}
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
          {showSuspicious && suspiciousJobs.length > 0 && <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-warning mr-2" />
              Flagged Listings ({suspiciousJobs.length}) - Proceed with Caution
            </h2>
            <div className="space-y-4">
              {suspiciousJobs.map(job => <Card key={job.id} className="border-warning/30 bg-warning/5">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Flagged
                        </Badge>
                      </div>
                      <p className="text-muted-foreground font-medium">{job.company}</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate(`/job/${job.id}`)}>
                      View Anyway
                    </Button>
                  </div>

                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-warning">Safety Warning</p>
                        <p className="text-xs text-muted-foreground">This posting has been flagged for suspicious activity. Exercise caution and verify all details independently.</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {job.salary}
                    </div>
                  </div>
                </CardContent>
              </Card>)}
            </div>
          </div>}

          {filteredJobs.length === 0 && <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No jobs found matching your criteria.</p>
              <Button className="mt-4" onClick={() => {
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