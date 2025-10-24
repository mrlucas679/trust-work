import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, Filter, X, MapPin, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFilter {
  id: string;
  label: string;
  value: string;
  type: 'location' | 'salary' | 'type' | 'skill';
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string, filters: SearchFilter[]) => void;
  suggestions?: string[];
  className?: string;
}

export const SearchBar = ({ 
  placeholder = "Search jobs, skills, or companies...", 
  onSearch,
  suggestions = [],
  className 
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch?.(query, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const addFilter = (filter: SearchFilter) => {
    if (!filters.find(f => f.id === filter.id)) {
      const newFilters = [...filters, filter];
      setFilters(newFilters);
      onSearch?.(query, newFilters);
    }
  };

  const removeFilter = (filterId: string) => {
    const newFilters = filters.filter(f => f.id !== filterId);
    setFilters(newFilters);
    onSearch?.(query, newFilters);
  };

  const getFilterIcon = (type: SearchFilter['type']) => {
    switch (type) {
      case 'location': return MapPin;
      case 'salary': return DollarSign;
      case 'type': return Clock;
      default: return Search;
    }
  };

  const commonFilters: SearchFilter[] = [
    { id: 'remote', label: 'Remote', value: 'remote', type: 'location' },
    { id: 'johannesburg', label: 'Johannesburg', value: 'johannesburg', type: 'location' },
    { id: 'cape-town', label: 'Cape Town', value: 'cape-town', type: 'location' },
    { id: 'full-time', label: 'Full Time', value: 'full-time', type: 'type' },
    { id: 'part-time', label: 'Part Time', value: 'part-time', type: 'type' },
    { id: 'contract', label: 'Contract', value: 'contract', type: 'type' },
    { id: 'entry-level', label: 'Entry Level', value: 'entry-level', type: 'salary' },
    { id: 'mid-level', label: 'Mid Level', value: 'mid-level', type: 'salary' },
    { id: 'senior-level', label: 'Senior Level', value: 'senior-level', type: 'salary' },
  ];

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Main Search Bar */}
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-4"
          />
        </div>
        
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {filters.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {filters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80 p-0" align="end">
            <Command>
              <CommandInput placeholder="Search filters..." />
              <CommandList>
                <CommandEmpty>No filters found.</CommandEmpty>
                <CommandGroup heading="Location">
                  {commonFilters.filter(f => f.type === 'location').map((filter) => (
                    <CommandItem
                      key={filter.id}
                      onSelect={() => addFilter(filter)}
                      className="cursor-pointer"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {filter.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                
                <CommandGroup heading="Job Type">
                  {commonFilters.filter(f => f.type === 'type').map((filter) => (
                    <CommandItem
                      key={filter.id}
                      onSelect={() => addFilter(filter)}
                      className="cursor-pointer"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {filter.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
                
                <CommandGroup heading="Experience Level">
                  {commonFilters.filter(f => f.type === 'salary').map((filter) => (
                    <CommandItem
                      key={filter.id}
                      onSelect={() => addFilter(filter)}
                      className="cursor-pointer"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {filter.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        <Button onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const Icon = getFilterIcon(filter.type);
            return (
              <Badge 
                key={filter.id} 
                variant="secondary" 
                className="flex items-center gap-1 pr-1"
              >
                <Icon className="h-3 w-3" />
                {filter.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive/20"
                  onClick={() => removeFilter(filter.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchBar;