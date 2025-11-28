/**
 * @fileoverview Gig Management page for clients
 * Allows clients to view and manage their posted gigs, milestones, and payments
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Briefcase,
  Plus,
  Search,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Users,
  Eye,
  MessageSquare,
  Shield,
  TrendingUp,
  Loader2,
  FileText,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMyGigs, usePaymentStats } from '@/hooks/use-gig-lifecycle';
import type { IGig, GigStatus } from '@/types/gig';
import { format, formatDistanceToNow } from 'date-fns';

const STATUS_CONFIG: Record<GigStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-gray-500', icon: FileText },
  open: { label: 'Open', color: 'bg-blue-500', icon: Users },
  assigned: { label: 'Assigned', color: 'bg-purple-500', icon: Briefcase },
  in_progress: { label: 'In Progress', color: 'bg-yellow-500', icon: Clock },
  pending_review: { label: 'Pending Review', color: 'bg-orange-500', icon: Eye },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: AlertCircle },
  disputed: { label: 'Disputed', color: 'bg-red-600', icon: Shield },
};

interface GigCardProps {
  gig: IGig;
  onClick?: () => void;
}

function GigCard({ gig, onClick }: GigCardProps) {
  const status = STATUS_CONFIG[gig.status];
  const StatusIcon = status.icon;
  const completedMilestones = gig.milestones?.filter((m) => m.status === 'approved').length || 0;
  const totalMilestones = gig.milestones?.length || 0;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-1">{gig.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {gig.description}
            </CardDescription>
          </div>
          <Badge className={cn('shrink-0', status.color)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Freelancer Info */}
        {gig.freelancer && (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={gig.freelancer.avatar_url} />
              <AvatarFallback>
                {gig.freelancer.full_name?.[0] || 'F'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{gig.freelancer.full_name}</p>
              <p className="text-xs text-muted-foreground">Freelancer</p>
            </div>
          </div>
        )}

        {/* Progress */}
        {totalMilestones > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Milestone Progress</span>
              <span className="font-medium">
                {completedMilestones}/{totalMilestones}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Separator />

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium text-foreground">
              R{gig.budget?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {gig.deadline 
                ? formatDistanceToNow(new Date(gig.deadline), { addSuffix: true })
                : 'No deadline'
              }
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to={`/gigs/${gig.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          {gig.freelancer_id && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/messages?gig=${gig.id}`}>
                <MessageSquare className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/gigs/${gig.id}/edit`}>Edit Gig</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/gigs/${gig.id}/applicants`}>View Applicants</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Cancel Gig
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GigManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch client's gigs
  const { data: gigs = [], isLoading: gigsLoading } = useMyGigs('client');
  const { data: paymentStats, isLoading: statsLoading } = usePaymentStats();

  // Filter gigs based on active tab
  const filteredGigs = gigs.filter((gig: IGig) => {
    // Tab filter
    if (activeTab !== 'all') {
      if (activeTab === 'active') {
        if (!['assigned', 'in_progress', 'pending_review'].includes(gig.status)) return false;
      } else if (activeTab === 'open') {
        if (gig.status !== 'open') return false;
      } else if (activeTab === 'completed') {
        if (gig.status !== 'completed') return false;
      } else if (activeTab === 'draft') {
        if (gig.status !== 'draft') return false;
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        gig.title.toLowerCase().includes(query) ||
        gig.description?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Sort gigs
  const sortedGigs = [...filteredGigs].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'budget-high':
        return (b.budget || 0) - (a.budget || 0);
      case 'budget-low':
        return (a.budget || 0) - (b.budget || 0);
      case 'deadline':
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      default:
        return 0;
    }
  });

  // Stats calculations
  const totalGigs = gigs.length;
  const activeGigs = gigs.filter((g: IGig) => 
    ['assigned', 'in_progress', 'pending_review'].includes(g.status)
  ).length;
  const openGigs = gigs.filter((g: IGig) => g.status === 'open').length;
  const completedGigs = gigs.filter((g: IGig) => g.status === 'completed').length;

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gig Management</h1>
            <p className="text-muted-foreground">
              Manage your posted gigs and track freelancer progress
            </p>
          </div>
          <Button asChild>
            <Link to="/post-gig">
              <Plus className="h-4 w-4 mr-2" />
              Post New Gig
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalGigs}</p>
                  <p className="text-sm text-muted-foreground">Total Gigs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeGigs}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{openGigs}</p>
                  <p className="text-sm text-muted-foreground">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedGigs}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Stats */}
        {paymentStats && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                Payment Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-bold">
                    R{(paymentStats.totalSpent || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-500/10">
                  <p className="text-xl font-bold text-blue-600">
                    R{(paymentStats.inEscrow || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">In Escrow</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-green-500/10">
                  <p className="text-xl font-bold text-green-600">
                    R{(paymentStats.released || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Released</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-500/10">
                  <p className="text-xl font-bold text-yellow-600">
                    R{(paymentStats.pending || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search gigs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="budget-high">Budget: High to Low</SelectItem>
              <SelectItem value="budget-low">Budget: Low to High</SelectItem>
              <SelectItem value="deadline">Deadline: Soonest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs and Gig List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">
              All ({gigs.length})
            </TabsTrigger>
            <TabsTrigger value="open">
              Open ({gigs.filter((g: IGig) => g.status === 'open').length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeGigs})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedGigs})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Drafts ({gigs.filter((g: IGig) => g.status === 'draft').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {gigsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sortedGigs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No gigs found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? 'Try adjusting your search terms'
                      : 'Get started by posting your first gig'}
                  </p>
                  <Button asChild>
                    <Link to="/post-gig">
                      <Plus className="h-4 w-4 mr-2" />
                      Post a Gig
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedGigs.map((gig: IGig) => (
                  <GigCard
                    key={gig.id}
                    gig={gig}
                    onClick={() => navigate(`/gigs/${gig.id}`)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm text-muted-foreground">Quick Actions:</span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/client/payments">
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Payments
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/disputes">
                  <Shield className="h-4 w-4 mr-2" />
                  View Disputes
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/analytics">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
