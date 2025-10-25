import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  AlertTriangle,
  UserX,
  MessageSquare,
  CheckCircle,
  Info,
  Flag,
  Lock,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const SafetyCenter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reportForm, setReportForm] = useState({
    reportType: '',
    userId: '',
    reason: '',
    description: ''
  });

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Report Submitted",
      description: "Our safety team will review your report within 24 hours."
    });
    setReportForm({ reportType: '', userId: '', reason: '', description: '' });
  };

  const safetyTips = [
    {
      icon: Lock,
      title: "Verify Identity",
      description: "Always verify the identity of employers and clients before sharing personal information."
    },
    {
      icon: Eye,
      title: "Meet in Public",
      description: "For in-person meetings, choose public locations and inform someone about your plans."
    },
    {
      icon: Shield,
      title: "Use Platform Communication",
      description: "Keep initial communications within the platform for security and record-keeping."
    },
    {
      icon: AlertTriangle,
      title: "Trust Your Instincts",
      description: "If something feels wrong, don't proceed. Report suspicious behavior immediately."
    }
  ];

  const reportReasons = [
    "Inappropriate behavior",
    "Scam or fraud",
    "Harassment",
    "Fake profile",
    "Payment issues",
    "Other"
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            ← Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Safety Center</h1>
          </div>
          <p className="text-muted-foreground">
            Your safety is our priority. Find resources and tools to stay safe on our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Safety Tips */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safetyTips.map((tip, index) => (
                    <div key={index} className="flex gap-3 p-4 rounded-lg border">
                      <tip.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1">{tip.title}</h3>
                        <p className="text-sm text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Report a User or Issue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReport} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Report Type</label>
                    <select
                      value={reportForm.reportType}
                      onChange={(e) => setReportForm({ ...reportForm, reportType: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select report type</option>
                      <option value="user">Report a User</option>
                      <option value="job">Report a Job Posting</option>
                      <option value="content">Report Content</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">User ID / Job ID</label>
                    <Input
                      value={reportForm.userId}
                      onChange={(e) => setReportForm({ ...reportForm, userId: e.target.value })}
                      placeholder="Enter the ID or username"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Reason</label>
                    <select
                      value={reportForm.reason}
                      onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select a reason</option>
                      {reportReasons.map((reason) => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={reportForm.description}
                      onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                      placeholder="Please provide details about the issue..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Submit Report
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <UserX className="h-4 w-4 mr-2" />
                  Block a User
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Account
                </Button>
              </CardContent>
            </Card>

            {/* Safety Status */}
            <Card>
              <CardHeader>
                <CardTitle>Your Safety Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Verified</span>
                  <Badge variant="secondary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Yes
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Two-Factor Auth</span>
                  <Badge variant="outline">Not Set</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Privacy Level</span>
                  <Badge>Medium</Badge>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Consider enabling two-factor authentication for enhanced security.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SafetyCenter;