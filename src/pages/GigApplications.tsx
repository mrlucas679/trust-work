/**
 * @fileoverview Gig Applications Page
 * Client reviews and manages applications for their posted gigs
 * Accept, reject, or shortlist freelancer applications
 * 
 * TrustWork Platform - Client Gig Application Management
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Users,
  Star,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  ListFilter,
  MessageSquare,
  ExternalLink,
  Award,
  Briefcase,
  TrendingUp,
  AlertCircle,
  ThumbsUp,
  User,
  FileText,
  Loader2,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import type { IGigApplication, IFreelancerProfile } from '@/types/gig';

// Extended application type with profile
interface ApplicationWithProfile extends IGigApplication {
  freelancer: IFreelancerProfile;
  skill_test_passed?: boolean;
}

// Fetch gig details
async function fetchGig(gigId: string) {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', gigId)
    .eq('type', 'gig')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Fetch applications with freelancer profiles
async function fetchApplications(gigId: string): Promise<ApplicationWithProfile[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      profiles:freelancer_id (
        id,
        full_name,
        avatar_url,
        headline,
        overall_rating,
        total_reviews,
        skills
      )
    `)
    .eq('assignment_id', gigId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((app) => ({
    ...app,
    freelancer: {
      id: app.profiles?.id || app.freelancer_id,
      full_name: app.profiles?.full_name,
      avatar_url: app.profiles?.avatar_url,
      headline: app.profiles?.headline,
      overall_rating: app.profiles?.overall_rating,
      total_reviews: app.profiles?.total_reviews,
      skills: app.profiles?.skills,
    },
  }));
}

// Update application status
async function updateApplicationStatus(
  applicationId: string,
  status: 'shortlisted' | 'accepted' | 'rejected',
  rejectionReason?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updates: Record<string, unknown> = {
    status,
    reviewed_at: new Date().toISOString(),
    reviewed_by: user.id,
  };

  if (rejectionReason) {
    updates.rejection_reason = rejectionReason;
  }

  const { error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', applicationId);

  if (error) throw new Error(error.message);
}

export default function GigApplications() {
  const { gigId } = useParams<{ gigId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch gig details
  const { data: gig, isLoading: gigLoading } = useQuery({
    queryKey: ['gig', gigId],
    queryFn: () => fetchGig(gigId!),
    enabled: !!gigId,
  });

  // Fetch applications
  const { data: applications = [], isLoading: appsLoading } = useQuery({
    queryKey: ['gig-applications', gigId],
    queryFn: () => fetchApplications(gigId!),
    enabled: !!gigId,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ 
      applicationId, 
      status, 
      rejectionReason 
    }: { 
      applicationId: string; 
      status: 'shortlisted' | 'accepted' | 'rejected';
      rejectionReason?: string;
    }) => updateApplicationStatus(applicationId, status, rejectionReason),
    onMutate: ({ applicationId }) => {
      setProcessingId(applicationId);
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['gig-applications', gigId] });
      toast({
        title: status === 'accepted' 
          ? 'Application Accepted' 
          : status === 'rejected' 
            ? 'Application Rejected' 
            : 'Application Shortlisted',
        description: status === 'accepted'
          ? 'The freelancer has been notified. Proceed to payment.'
          : status === 'rejected'
            ? 'The applicant has been notified.'
            : 'The applicant has been added to your shortlist.',
      });
      setRejectionReason('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setProcessingId(null);
    },
  });

  // Filter applications by tab
  const filteredApplications = applications.filter(app => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'pending') return app.status === 'pending';
    if (selectedTab === 'shortlisted') return app.status === 'shortlisted';
    if (selectedTab === 'accepted') return app.status === 'accepted';
    if (selectedTab === 'rejected') return app.status === 'rejected';
    return true;
  });

  // Stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const isLoading = gigLoading || appsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Gig Not Found</h2>
          <Button onClick={() => navigate('/gig-management')}>
            Back to Gig Management
          </Button>
        </div>
      </div>
    );
  }

  const handleAccept = (applicationId: string, freelancerId: string) => {
    updateStatusMutation.mutate({ applicationId, status: 'accepted' });
    // After accepting, redirect to payment
    // navigate(`/gig/${gigId}/pay?freelancer=${freelancerId}&application=${applicationId}`);
  };

  return (
    <div className="container max-w-6xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/gig-management')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{gig.title}</h1>
          <p className="text-muted-foreground">
            Review and manage applications for this gig
          </p>
        </div>
        <Badge variant={gig.status === 'open' ? 'default' : 'secondary'}>
          {gig.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ListFilter className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.shortlisted}</p>
                <p className="text-xs text-muted-foreground">Shortlisted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.accepted}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Applications
          </CardTitle>
          <CardDescription>
            {applications.length} freelancer{applications.length !== 1 ? 's' : ''} applied
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted ({stats.shortlisted})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No applications found</h3>
                  <p className="text-muted-foreground">
                    {selectedTab === 'all' 
                      ? 'No one has applied to this gig yet.'
                      : `No ${selectedTab} applications.`}
                  </p>
                </div>
              ) : (
                filteredApplications.map((application) => (
                  <Card key={application.id} className="border">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {/* Freelancer Info */}
                        <div className="flex-shrink-0">
                          <Avatar className="h-16 w-16">
                            <AvatarImage 
                              src={application.freelancer.avatar_url} 
                              alt={application.freelancer.full_name || 'Freelancer'} 
                            />
                            <AvatarFallback>
                              {application.freelancer.full_name?.charAt(0) || 'F'}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">
                                  {application.freelancer.full_name || 'Anonymous Freelancer'}
                                </h3>
                                <Badge variant={
                                  application.status === 'accepted' ? 'default' :
                                  application.status === 'shortlisted' ? 'secondary' :
                                  application.status === 'rejected' ? 'destructive' :
                                  'outline'
                                }>
                                  {application.status}
                                </Badge>
                              </div>
                              {application.freelancer.headline && (
                                <p className="text-muted-foreground">
                                  {application.freelancer.headline}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-medium">
                                  {application.freelancer.overall_rating?.toFixed(1) || 'New'}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {application.freelancer.total_reviews || 0} reviews
                              </p>
                            </div>
                          </div>

                          {/* Stats Row */}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                R{application.bid_amount?.toLocaleString()}
                              </span>
                              <span className="text-muted-foreground">bid</span>
                            </div>
                            {application.estimated_duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{application.estimated_duration}</span>
                              </div>
                            )}
                            {application.skill_test_score !== undefined && (
                              <div className="flex items-center gap-1">
                                <Award className="h-4 w-4 text-muted-foreground" />
                                <span className={
                                  application.skill_test_score >= 70 
                                    ? 'text-green-600' 
                                    : 'text-amber-600'
                                }>
                                  {application.skill_test_score}% test score
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>Applied {format(new Date(application.created_at), 'MMM d, yyyy')}</span>
                            </div>
                          </div>

                          {/* Proposal */}
                          <div className="bg-muted/50 rounded-lg p-4">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Proposal
                            </h4>
                            <p className="text-sm whitespace-pre-wrap line-clamp-4">
                              {application.proposal}
                            </p>
                          </div>

                          {/* Portfolio Links */}
                          {application.portfolio_links && application.portfolio_links.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {application.portfolio_links.map((link, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  asChild
                                >
                                  <a href={link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Portfolio {idx + 1}
                                  </a>
                                </Button>
                              ))}
                            </div>
                          )}

                          {/* Skills */}
                          {application.freelancer.skills && application.freelancer.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {application.freelancer.skills.slice(0, 6).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {application.freelancer.skills.length > 6 && (
                                <Badge variant="outline" className="text-xs">
                                  +{application.freelancer.skills.length - 6} more
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          {application.status === 'pending' && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleAccept(application.id, application.freelancer_id)}
                                disabled={processingId === application.id}
                              >
                                {processingId === application.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                )}
                                Accept & Hire
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ 
                                  applicationId: application.id, 
                                  status: 'shortlisted' 
                                })}
                                disabled={processingId === application.id}
                              >
                                <ThumbsUp className="h-4 w-4 mr-2" />
                                Shortlist
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={processingId === application.id}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Application</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to reject this application? 
                                      You can optionally provide a reason.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <Textarea
                                    placeholder="Reason for rejection (optional)"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="min-h-[100px]"
                                  />
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setRejectionReason('')}>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => updateStatusMutation.mutate({
                                        applicationId: application.id,
                                        status: 'rejected',
                                        rejectionReason,
                                      })}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Reject Application
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <Link to={`/messages?user=${application.freelancer_id}`}>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Link>
                              </Button>
                            </div>
                          )}

                          {application.status === 'shortlisted' && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleAccept(application.id, application.freelancer_id)}
                                disabled={processingId === application.id}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Accept & Hire
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={processingId === application.id}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Application</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to reject this shortlisted application?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <Textarea
                                    placeholder="Reason for rejection (optional)"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="min-h-[100px]"
                                  />
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setRejectionReason('')}>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => updateStatusMutation.mutate({
                                        applicationId: application.id,
                                        status: 'rejected',
                                        rejectionReason,
                                      })}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Reject Application
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/messages?user=${application.freelancer_id}`}>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Link>
                              </Button>
                            </div>
                          )}

                          {application.status === 'accepted' && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              <Button size="sm" asChild>
                                <Link to={`/gig/${gigId}/pay?freelancer=${application.freelancer_id}&application=${application.id}`}>
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Proceed to Payment
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/messages?user=${application.freelancer_id}`}>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
