/**
 * Dispute Review - Admin Interface
 * 
 * Admin dashboard for reviewing and resolving payment disputes between users
 */

import { useState, useEffect } from "react";
import { useSupabase } from "@/providers/SupabaseProvider";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  FileText,
  MessageSquare,
  Search,
  Filter,
  ArrowUpRight,
  Scale,
  Shield,
  RefreshCw,
  ExternalLink,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Types
interface Dispute {
  id: string;
  escrow_payment_id: string;
  raised_by: string;
  against_user: string;
  reason: string;
  description: string;
  evidence_urls: string[];
  status: 'pending' | 'in_review' | 'resolved' | 'escalated';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  raised_by_profile?: {
    display_name: string;
    email: string;
  };
  against_user_profile?: {
    display_name: string;
    email: string;
  };
  escrow_payment?: {
    amount: number;
    job_title: string;
    job_id: string;
  };
}

interface DisputeStats {
  total: number;
  pending: number;
  inReview: number;
  resolved: number;
  escalated: number;
  avgResolutionTime: number;
}

const MOCK_DISPUTES: Dispute[] = [
  {
    id: "1",
    escrow_payment_id: "esc-001",
    raised_by: "user-001",
    against_user: "user-002",
    reason: "Work not delivered as agreed",
    description: "The freelancer did not complete the project according to specifications. Missing key features that were agreed upon.",
    evidence_urls: [],
    status: "pending",
    priority: "high",
    resolution: null,
    resolved_by: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    raised_by_profile: {
      display_name: "John Employer",
      email: "john@company.com"
    },
    against_user_profile: {
      display_name: "Jane Freelancer",
      email: "jane@email.com"
    },
    escrow_payment: {
      amount: 5000,
      job_title: "Website Redesign Project",
      job_id: "job-001"
    }
  },
  {
    id: "2",
    escrow_payment_id: "esc-002",
    raised_by: "user-003",
    against_user: "user-004",
    reason: "Payment not released after completion",
    description: "I completed all deliverables as requested but the employer has not released the payment from escrow for over 2 weeks.",
    evidence_urls: [],
    status: "in_review",
    priority: "normal",
    resolution: null,
    resolved_by: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    raised_by_profile: {
      display_name: "Mike Developer",
      email: "mike@email.com"
    },
    against_user_profile: {
      display_name: "Sarah Business",
      email: "sarah@business.com"
    },
    escrow_payment: {
      amount: 2500,
      job_title: "Mobile App Development",
      job_id: "job-002"
    }
  },
  {
    id: "3",
    escrow_payment_id: "esc-003",
    raised_by: "user-005",
    against_user: "user-006",
    reason: "Quality issues with delivered work",
    description: "The code delivered is full of bugs and does not meet professional standards. Multiple critical issues found during testing.",
    evidence_urls: [],
    status: "pending",
    priority: "urgent",
    resolution: null,
    resolved_by: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    raised_by_profile: {
      display_name: "Tech Startup Inc",
      email: "contact@techstartup.com"
    },
    against_user_profile: {
      display_name: "Alex Coder",
      email: "alex@coder.com"
    },
    escrow_payment: {
      amount: 8000,
      job_title: "E-commerce Platform Development",
      job_id: "job-003"
    }
  }
];

export default function DisputeReview() {
  const { user, supabase } = useSupabase();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<DisputeStats>({
    total: 0,
    pending: 0,
    inReview: 0,
    resolved: 0,
    escalated: 0,
    avgResolutionTime: 0
  });
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [resolution, setResolution] = useState<string>("");
  const [resolutionType, setResolutionType] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadDisputes();
    }
  }, [isAdmin]);

  async function checkAdminStatus() {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];
    setIsAdmin(adminEmails.includes(user.email));
    setLoading(false);
  }

  async function loadDisputes() {
    setLoading(true);
    setError(null);

    try {
      // In production, this would fetch from Supabase
      // const { data, error } = await supabase
      //   .from('disputes')
      //   .select(`
      //     *,
      //     raised_by_profile:profiles!raised_by(display_name, email),
      //     against_user_profile:profiles!against_user(display_name, email),
      //     escrow_payment:escrow_payments(amount, job_title, job_id)
      //   `)
      //   .order('created_at', { ascending: false });

      // Using mock data for now
      setDisputes(MOCK_DISPUTES);
      
      // Calculate stats
      setStats({
        total: MOCK_DISPUTES.length,
        pending: MOCK_DISPUTES.filter(d => d.status === 'pending').length,
        inReview: MOCK_DISPUTES.filter(d => d.status === 'in_review').length,
        resolved: MOCK_DISPUTES.filter(d => d.status === 'resolved').length,
        escalated: MOCK_DISPUTES.filter(d => d.status === 'escalated').length,
        avgResolutionTime: 3.5 // days
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  }

  async function handleStartReview(dispute: Dispute) {
    try {
      // Update status to in_review
      // await supabase
      //   .from('disputes')
      //   .update({ status: 'in_review', updated_at: new Date().toISOString() })
      //   .eq('id', dispute.id);

      setDisputes(prev => 
        prev.map(d => d.id === dispute.id ? { ...d, status: 'in_review' as const } : d)
      );
    } catch (err) {
      setError('Failed to start review');
    }
  }

  async function handleResolve() {
    if (!selectedDispute || !resolutionType || !resolution) {
      setError('Please select a resolution type and provide details');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // In production:
      // await supabase
      //   .from('disputes')
      //   .update({
      //     status: 'resolved',
      //     resolution: `${resolutionType}: ${resolution}`,
      //     resolved_by: user?.id,
      //     resolved_at: new Date().toISOString(),
      //     updated_at: new Date().toISOString()
      //   })
      //   .eq('id', selectedDispute.id);

      setDisputes(prev =>
        prev.map(d => d.id === selectedDispute.id ? {
          ...d,
          status: 'resolved' as const,
          resolution: `${resolutionType}: ${resolution}`,
          resolved_by: user?.id || null,
          resolved_at: new Date().toISOString()
        } : d)
      );

      setReviewDialogOpen(false);
      setSelectedDispute(null);
      setResolution("");
      setResolutionType("");

      // Refresh stats
      loadDisputes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve dispute');
    } finally {
      setProcessing(false);
    }
  }

  async function handleEscalate(dispute: Dispute) {
    try {
      setDisputes(prev =>
        prev.map(d => d.id === dispute.id ? { ...d, status: 'escalated' as const } : d)
      );
    } catch (err) {
      setError('Failed to escalate dispute');
    }
  }

  function getStatusBadge(status: Dispute['status']) {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending: { variant: "outline", icon: <Clock className="h-3 w-3 mr-1" /> },
      in_review: { variant: "default", icon: <Search className="h-3 w-3 mr-1" /> },
      resolved: { variant: "secondary", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      escalated: { variant: "destructive", icon: <ArrowUpRight className="h-3 w-3 mr-1" /> }
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="capitalize flex items-center">
        {config.icon}
        {status.replace('_', ' ')}
      </Badge>
    );
  }

  function getPriorityBadge(priority: Dispute['priority']) {
    const colors: Record<string, string> = {
      low: "bg-slate-100 text-slate-700",
      normal: "bg-blue-100 text-blue-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700"
    };

    return (
      <Badge className={`${colors[priority]} capitalize`}>
        {priority}
      </Badge>
    );
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  }

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = searchQuery === "" || 
      dispute.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.raised_by_profile?.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.against_user_profile?.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.escrow_payment?.job_title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || dispute.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || dispute.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to access dispute review.
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Scale className="h-8 w-8" />
              Dispute Review
            </h1>
            <p className="text-muted-foreground">
              Review and resolve payment disputes between users
            </p>
          </div>
          <Button onClick={loadDisputes} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Disputes</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Review</CardTitle>
              <Search className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inReview}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResolutionTime}d</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by reason, user, or job title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Disputes List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Disputes</CardTitle>
            <CardDescription>
              {filteredDisputes.length} dispute{filteredDisputes.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDisputes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No disputes found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDisputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="border rounded-lg p-4 space-y-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(dispute.status)}
                          {getPriorityBadge(dispute.priority)}
                        </div>
                        <h3 className="font-semibold">{dispute.reason}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {dispute.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(dispute.created_at), { addSuffix: true })}
                        </div>
                        <div className="font-semibold text-lg">
                          {formatCurrency(dispute.escrow_payment?.amount || 0)}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Raised By</p>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{dispute.raised_by_profile?.display_name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{dispute.raised_by_profile?.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Against</p>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{dispute.against_user_profile?.display_name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{dispute.against_user_profile?.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Related Job</p>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{dispute.escrow_payment?.job_title}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {dispute.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartReview(dispute)}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Start Review
                        </Button>
                      )}
                      {(dispute.status === 'pending' || dispute.status === 'in_review') && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setReviewDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleEscalate(dispute)}
                          >
                            <ArrowUpRight className="h-4 w-4 mr-2" />
                            Escalate
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        View Messages
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Escrow
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resolution Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Resolve Dispute</DialogTitle>
              <DialogDescription>
                Review the dispute and select an appropriate resolution.
              </DialogDescription>
            </DialogHeader>

            {selectedDispute && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-medium">{selectedDispute.reason}</h4>
                  <p className="text-sm text-muted-foreground">{selectedDispute.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm">Escrow Amount:</span>
                    <span className="font-bold">
                      {formatCurrency(selectedDispute.escrow_payment?.amount || 0)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Resolution Type</Label>
                  <Select value={resolutionType} onValueChange={setResolutionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resolution type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_refund">Full Refund to Employer</SelectItem>
                      <SelectItem value="partial_refund">Partial Refund</SelectItem>
                      <SelectItem value="release_payment">Release Payment to Worker</SelectItem>
                      <SelectItem value="split_payment">Split Payment (50/50)</SelectItem>
                      <SelectItem value="custom">Custom Resolution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Resolution Notes</Label>
                  <Textarea
                    placeholder="Provide detailed notes about the resolution decision..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={4}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setReviewDialogOpen(false);
                  setSelectedDispute(null);
                  setResolution("");
                  setResolutionType("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleResolve} disabled={processing}>
                {processing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Resolution
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
