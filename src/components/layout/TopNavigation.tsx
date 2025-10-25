import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
interface TopNavigationProps {
  className?: string;
}

export const TopNavigation = ({ className }: TopNavigationProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  const handleHomeClick = () => {
    navigate('/dashboard/job-seeker');
    window.location.reload();
  };
  return <header className={cn(
    "w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden",
    className
  )}>
    <div className="container mx-auto flex h-16 items-center justify-between px-4">
      {/* Left Section - Sidebar Trigger and Logo */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />

        {/* Logo - Clickable */}
        <Button variant="ghost" className="flex items-center gap-2 p-2" onClick={handleHomeClick}>
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold hidden sm:block">TrustWork</span>
        </Button>
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search jobs, companies, skills..." className="pl-10 pr-4" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </form>
      </div>

      {/* Right Section - Back Navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          size="icon"
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>

    {/* Mobile Search */}
    <div className="md:hidden border-t px-4 py-3">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search jobs, companies..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </form>
    </div>
  </header>;
};