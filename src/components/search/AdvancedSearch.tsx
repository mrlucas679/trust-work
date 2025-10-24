import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X, MapPin, DollarSign, Clock, Briefcase } from "lucide-react";

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  type: 'jobs' | 'gigs';
}

export interface SearchFilters {
  query: string;
  location: string;
  salaryRange: [number, number];
  experienceLevel: string;
  jobType: string;
  skills: string[];
  postedWithin: string;
  remote: boolean;
  verified: boolean;
}

const skillOptions = [
  "React", "TypeScript", "Python", "Java", "Node.js", "AWS", 
  "Docker", "Kubernetes", "SQL", "MongoDB", "GraphQL", "Vue.js",
  "Angular", "PHP", "Ruby", "Go", "Rust", "C++", "C#", "Swift"
];

const AdvancedSearch = ({ onFiltersChange, type }: AdvancedSearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "all",
    salaryRange: [30000, 200000],
    experienceLevel: "all",
    jobType: "all",
    skills: [],
    postedWithin: "all",
    remote: false,
    verified: false
  });

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const toggleSkill = (skill: string) => {
    const updatedSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    updateFilters({ skills: updatedSkills });
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      query: "",
      location: "all",
      salaryRange: [30000, 200000],
      experienceLevel: "all",
      jobType: "all",
      skills: [],
      postedWithin: "all",
      remote: false,
      verified: false
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2 text-primary" />
            Advanced Search
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover-scale"
          >
            <Filter className="h-4 w-4 mr-1" />
            {isExpanded ? "Simple" : "Advanced"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${type}...`}
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Quick Filters Row */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.remote ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilters({ remote: !filters.remote })}
            className="animate-scale-in"
          >
            <MapPin className="h-3 w-3 mr-1" />
            Remote
          </Button>
          <Button
            variant={filters.verified ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilters({ verified: !filters.verified })}
            className="animate-scale-in"
          >
            Verified Only
          </Button>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-6 animate-accordion-down">
            {/* Location & Salary */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Select value={filters.location} onValueChange={(value) => updateFilters({ location: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="johannesburg">Johannesburg</SelectItem>
                    <SelectItem value="cape town">Cape Town</SelectItem>
                    <SelectItem value="durban">Durban</SelectItem>
                    <SelectItem value="pretoria">Pretoria</SelectItem>
                    <SelectItem value="port elizabeth">Port Elizabeth</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {type === 'jobs' ? 'Salary Range' : 'Budget Range'} (R{filters.salaryRange[0].toLocaleString()} - R{filters.salaryRange[1].toLocaleString()})
                </label>
                <Slider
                  value={filters.salaryRange}
                  onValueChange={(value) => updateFilters({ salaryRange: value as [number, number] })}
                  max={300000}
                  min={20000}
                  step={5000}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Experience & Job Type */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Experience Level</label>
                <Select value={filters.experienceLevel} onValueChange={(value) => updateFilters({ experienceLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
                    <SelectItem value="lead">Lead/Manager (8+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {type === 'jobs' ? 'Job Type' : 'Duration'}
                </label>
                <Select value={filters.jobType} onValueChange={(value) => updateFilters({ jobType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {type === 'jobs' ? (
                      <>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="all">All Durations</SelectItem>
                        <SelectItem value="1-3 days">1-3 days</SelectItem>
                        <SelectItem value="1 week">1 week</SelectItem>
                        <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                        <SelectItem value="1-3 months">1-3 months</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Posted Within */}
            <div>
              <label className="text-sm font-medium mb-2 block">Posted Within</label>
              <Select value={filters.postedWithin} onValueChange={(value) => updateFilters({ postedWithin: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Time</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="3d">Last 3 days</SelectItem>
                  <SelectItem value="1w">Last week</SelectItem>
                  <SelectItem value="1m">Last month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skills */}
            <div>
              <label className="text-sm font-medium mb-2 block">Skills & Technologies</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {filters.skills.map((skill) => (
                  <Badge key={skill} variant="default" className="animate-scale-in">
                    {skill}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer hover:bg-destructive/20 rounded-full"
                      onClick={() => toggleSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                {skillOptions.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill}
                      checked={filters.skills.includes(skill)}
                      onCheckedChange={() => toggleSkill(skill)}
                    />
                    <label htmlFor={skill} className="text-sm cursor-pointer">
                      {skill}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
              <div className="text-sm text-muted-foreground">
                {filters.skills.length > 0 && `${filters.skills.length} skills selected`}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;