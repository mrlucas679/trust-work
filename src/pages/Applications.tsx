import { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
    getMyApplications,
    withdrawApplication,
    subscribeToApplicationUpdates,
    getApplicationStats,
    type ApplicationWithDetails,
    type ApplicationStats
} from '@/lib/api/applications';
import {
    Loader2, FileText, Calendar, DollarSign, Clock,
    AlertTriangle, CheckCircle, Filter, Search,
    TrendingUp, Eye, XCircle
} from 'lucide-react';
import { useSupabase } from '@/providers/SupabaseProvider';

type FilterStatus = 'all' | 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn';
type SortOption = 'recent' | 'oldest' | 'amount-high' | 'amount-low'; export default function Applications() {
    const { user, isEmployer, isJobSeeker, profile } = useSupabase();
    const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [sortBy, setSortBy] = useState<SortOption>('recent');
    const [stats, setStats] = useState<ApplicationStats | null>(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const [appsData, statsData] = await Promise.all([
                getMyApplications(),
                user ? getApplicationStats(user.id) : null
            ]);
            setApplications(appsData || []);
            setStats(statsData);
        } catch (error) {
            toast({
                title: 'Failed to Load Applications',
                description: error instanceof Error ? error.message : 'Could not fetch your applications',
                variant: 'destructive'
            });
            setApplications([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();

        // Set up real-time subscription
        if (!user) return;

        const unsubscribe = subscribeToApplicationUpdates(user.id, (payload) => {
            toast({
                title: 'Application Updated',
                description: `Your application status has changed to: ${payload.new.status}`,
            });
            fetchApplications();
        });

        return () => {
            unsubscribe();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleWithdraw = async (id: string) => {
        setWithdrawingId(id);
        try {
            await withdrawApplication(id);
            toast({
                title: 'Application Withdrawn',
                description: 'Your application has been withdrawn successfully.'
            });
            await fetchApplications();
        } catch (error) {
            toast({
                title: 'Failed to Withdraw',
                description: error instanceof Error ? error.message : 'Could not withdraw application',
                variant: 'destructive'
            });
        } finally {
            setWithdrawingId(null);
        }
    };

    // Filter and sort applications
    const filteredAndSortedApplications = useMemo(() => {
        let filtered = applications;

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(app => app.status === filterStatus);
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(app =>
                app.assignment?.title?.toLowerCase().includes(query) ||
                app.proposal?.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'amount-high':
                    return (b.bid_amount || 0) - (a.bid_amount || 0);
                case 'amount-low':
                    return (a.bid_amount || 0) - (b.bid_amount || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [applications, filterStatus, searchQuery, sortBy]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return (
                    <Badge className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Accepted
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            case 'withdrawn':
                return (
                    <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Withdrawn
                    </Badge>
                );
            case 'reviewing':
                return (
                    <Badge className="bg-blue-500">
                        <Eye className="h-3 w-3 mr-1" />
                        Under Review
                    </Badge>
                );
            default:
                return <Badge variant="outline">Pending</Badge>;
        }
    };

    const StatCard = ({ label, value, icon: Icon, trend }: {
        label: string;
        value: string | number;
        icon: React.ElementType;
        trend?: string;
    }) => (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-2xl font-bold">{value}</p>
                        {trend && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {trend}
                            </p>
                        )}
                    </div>
                    <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
            </CardContent>
        </Card>
    );

    // Redirect employers to their assignments page
    if (profile && isEmployer) {
        return <Navigate to="/assignments" replace />;
    }

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">My Applications</h1>
                        <p className="text-muted-foreground">Track your job applications and their status</p>
                    </div>
                    <Button onClick={() => navigate('/jobs')}>
                        Browse Jobs
                    </Button>
                </div>

                {/* Statistics Dashboard */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Total Applications"
                            value={stats.total}
                            icon={FileText}
                            trend={stats.thisWeek > 0 ? `${stats.thisWeek} this week` : undefined}
                        />
                        <StatCard
                            label="Pending"
                            value={stats.pending}
                            icon={Clock}
                        />
                        <StatCard
                            label="Accepted"
                            value={stats.accepted}
                            icon={CheckCircle}
                        />
                        <StatCard
                            label="Response Rate"
                            value={`${stats.responseRate.toFixed(0)}%`}
                            icon={TrendingUp}
                        />
                    </div>
                )}

                {/* Filters and Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search applications..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val as FilterStatus)}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Applications</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="reviewing">Under Review</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recent">Most Recent</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="amount-high">Highest Bid</SelectItem>
                                    <SelectItem value="amount-low">Lowest Bid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Applications List */}
                {isLoading ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">Loading your applications...</p>
                        </CardContent>
                    </Card>
                ) : filteredAndSortedApplications.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground mb-4">
                                {applications.length === 0
                                    ? "You haven't applied to any jobs yet."
                                    : "No applications match your filters."}
                            </p>
                            <Button onClick={() => navigate('/jobs')}>
                                Browse Available Jobs
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Tabs defaultValue="grid" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="grid">Grid View</TabsTrigger>
                            <TabsTrigger value="list">List View</TabsTrigger>
                        </TabsList>

                        <TabsContent value="grid" className="space-y-4">
                            {filteredAndSortedApplications.map((app) => (
                                <Card key={app.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-semibold">
                                                        {app.assignment?.title || 'Untitled Job'}
                                                    </h3>
                                                    {getStatusBadge(app.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Applied {new Date(app.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {app.status === 'pending' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleWithdraw(app.id)}
                                                    disabled={withdrawingId === app.id}
                                                >
                                                    {withdrawingId === app.id ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Withdrawing...
                                                        </>
                                                    ) : (
                                                        'Withdraw'
                                                    )}
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                <span>Bid: R{app.bid_amount?.toLocaleString() || 'Not specified'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>Duration: {app.estimated_duration || 'Not specified'}</span>
                                            </div>
                                            {app.estimated_start_date && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span>Start: {new Date(app.estimated_start_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {app.proposal && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold mb-2">Your Proposal:</h4>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                                                    {app.proposal}
                                                </p>
                                            </div>
                                        )}

                                        {app.status === 'rejected' && app.rejection_reason && (
                                            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
                                                <h4 className="text-sm font-semibold text-destructive mb-1">Rejection Reason:</h4>
                                                <p className="text-sm text-muted-foreground">{app.rejection_reason}</p>
                                            </div>
                                        )}

                                        {app.status === 'accepted' && (
                                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                                <p className="text-sm font-semibold text-green-600">
                                                    🎉 Congratulations! Your application was accepted.
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    The employer will contact you soon to discuss next steps.
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/assignment/${app.assignment_id}`)}
                                            >
                                                View Job Details
                                            </Button>
                                            {app.reviewed_at && (
                                                <p className="text-xs text-muted-foreground">
                                                    Reviewed {new Date(app.reviewed_at).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>

                        <TabsContent value="list" className="space-y-2">
                            {filteredAndSortedApplications.map((app) => (
                                <Card key={app.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold truncate">
                                                        {app.assignment?.title || 'Untitled Job'}
                                                    </h4>
                                                    {getStatusBadge(app.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    R{app.bid_amount?.toLocaleString()} • {app.estimated_duration} • Applied {new Date(app.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/assignment/${app.assignment_id}`)}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </AppLayout>
    );
}
