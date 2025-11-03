import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CheckCircle, Clock, DollarSign, Building2, User2, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockGigs } from "@/data/mockData";
import VerificationBadge from "@/components/trust/VerificationBadge";
import RiskIndicator from "@/components/trust/RiskIndicator";
const Gigs = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'gigs' | 'jobs'>('all');
  const [filters, setFilters] = useState({
    search: '',
    budget: 'all',
    duration: 'all',
    remote: 'all'
  });

  const filteredGigs = mockGigs.filter(gig => {
    if (activeTab === 'gigs' && gig.type === 'job') return false;
    if (activeTab === 'jobs' && gig.type === 'gig') return false;

    if (filters.search && !gig.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.budget !== 'all' && gig.budgetRange !== filters.budget) return false;
    if (filters.duration !== 'all' && gig.duration !== filters.duration) return false;
    if (filters.remote !== 'all' && gig.remote.toString() !== filters.remote) return false;

    return true;
  });

  return (
    <div className="bg-muted/20 p-6">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Find Work</h1>
            <p className="text-muted-foreground">Browse opportunities from verified clients</p>
          </div>
          <Button onClick={() => navigate('/post-gig')} className="flex items-center gap-2">
            + Post New
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'gigs' | 'jobs')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All Opportunities
              </TabsTrigger>
              <TabsTrigger value="gigs" className="flex items-center gap-2">
                <User2 className="h-4 w-4" />
                Individual Gigs
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Gigs
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search opportunities..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGigs.map((gig, index) => (
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
                      <Badge
                        variant={gig.type === 'job' ? 'default' : 'secondary'}
                        className="ml-2 text-xs"
                      >
                        {gig.type === 'job' ? 'Company Gig' : 'Individual Gig'}
                      </Badge>
                    </CardTitle>
                    <p className="text-muted-foreground flex items-center gap-2">
                      {gig.type === 'job' ? <Building2 className="h-4 w-4" /> : <User2 className="h-4 w-4" />}
                      {gig.client}
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
                    {gig.duration}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {gig.budget}
                  </div>
                  {gig.remote && (
                    <Badge variant="outline">Remote</Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {gig.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <Button
                  className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => navigate(`/apply/${gig.id}`)}
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Gigs;