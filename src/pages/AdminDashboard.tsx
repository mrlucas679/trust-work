/**
 * @fileoverview Admin Dashboard - Platform management and moderation
 */

import { useState, useEffect } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

interface AdminStats {
  totalUsers: number;
  totalJobSeekers: number;
  totalEmployers: number;
  totalAssignments: number;
  totalApplications: number;
  totalPayments: number;
  pendingVerifications: number;
  activeReports: number;
}

interface PendingVerification {
  id: string;
  user_id: string;
  business_name: string;
  created_at: string;
  profiles: {
    display_name: string;
    business_name: string;
  };
}

interface SafetyReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { supabase, user } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  async function checkAdminStatus() {
    if (!user) return;

    // Check if user is admin (you can add admin role to profiles table)
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // For now, check if user email is in admin list
    const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',') || [];
    setIsAdmin(adminEmails.includes(user.email));
  }

  async function loadAdminData() {
    setLoading(true);
    try {
      // Load stats
      const [usersResult, jobSeekersResult, employersResult, assignmentsResult, applicationsResult, verificationsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'job_seeker'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'employer'),
        supabase.from('assignments').select('id', { count: 'exact', head: true }),
        supabase.from('applications').select('id', { count: 'exact', head: true }),
        supabase.from('business_verifications').select('*').eq('status', 'pending'),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalJobSeekers: jobSeekersResult.count || 0,
        totalEmployers: employersResult.count || 0,
        totalAssignments: assignmentsResult.count || 0,
        totalApplications: applicationsResult.count || 0,
        totalPayments: 0, // Will be populated when escrow_payments table exists
        pendingVerifications: verificationsResult.data?.length || 0,
        activeReports: 0, // Will be populated when safety_reports table exists
      });

      setPendingVerifications(verificationsResult.data || []);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function approveVerification(verificationId: string) {
    const { error } = await supabase
      .from('business_verifications')
      .update({
        status: 'approved',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', verificationId);

    if (!error) {
      // Update user profile
      const verification = pendingVerifications.find(v => v.id === verificationId);
      if (verification) {
        await supabase
          .from('profiles')
          .update({
            business_verified: true,
            business_verification_status: 'verified',
            verification_badge_level: 'basic',
          })
          .eq('id', verification.user_id);
      }

      loadAdminData();
    }
  }

  async function rejectVerification(verificationId: string) {
    const { error } = await supabase
      .from('business_verifications')
      .update({
        status: 'rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', verificationId);

    if (!error) {
      const verification = pendingVerifications.find(v => v.id === verificationId);
      if (verification) {
        await supabase
          .from('profiles')
          .update({
            business_verification_status: 'rejected',
          })
          .eq('id', verification.user_id);
      }

      loadAdminData();
    }
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to access the admin dashboard.
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform management and moderation</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalJobSeekers || 0} job seekers, {stats?.totalEmployers || 0} employers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAssignments || 0}</div>
              <p className="text-xs text-muted-foreground">Total jobs posted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
              <p className="text-xs text-muted-foreground">Total applications submitted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingVerifications || 0}</div>
              <p className="text-xs text-muted-foreground">Business verifications</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="verifications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="verifications">
              <Shield className="mr-2 h-4 w-4" />
              Verifications ({stats?.pendingVerifications || 0})
            </TabsTrigger>
            <TabsTrigger value="reports">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Safety Reports ({stats?.activeReports || 0})
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Business Verifications</CardTitle>
                <CardDescription>
                  Review and approve business verification requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingVerifications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending verifications
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingVerifications.map((verification: any) => (
                      <div
                        key={verification.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{verification.business_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Submitted {new Date(verification.created_at).toLocaleDateString()}
                          </p>
                          {verification.website && (
                            <p className="text-sm text-blue-600">{verification.website}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => approveVerification(verification.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectVerification(verification.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Safety Reports</CardTitle>
                <CardDescription>
                  Review user-submitted safety concerns and reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  No active safety reports
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                  <CardDescription>User registration trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Analytics charts coming soon...</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Platform earnings and projections</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Revenue tracking coming soon...</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
