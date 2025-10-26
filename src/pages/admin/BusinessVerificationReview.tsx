/**
 * Business Verification Review - Admin Interface
 * 
 * Admin dashboard for reviewing and approving/rejecting business verification requests
 */

import { useState, useEffect } from "react";
import { useSupabase } from "@/providers/SupabaseProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    CheckCircle,
    XCircle,
    Clock,
    Building,
    Mail,
    Phone,
    Globe,
    MapPin,
    FileText,
    AlertCircle,
    TrendingUp
} from "lucide-react";
import {
    getPendingVerifications,
    approveVerification,
    rejectVerification,
    getVerificationStats,
    type BusinessVerificationRecord
} from "@/lib/api/businessVerificationApi";

export const BusinessVerificationReview = () => {
    const { user } = useSupabase();
    const [verifications, setVerifications] = useState<BusinessVerificationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [selectedVerification, setSelectedVerification] = useState<BusinessVerificationRecord | null>(null);
    const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
    const [badgeLevel, setBadgeLevel] = useState<'basic' | 'premium' | 'enterprise'>('basic');
    const [reviewNotes, setReviewNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Load pending verifications
            const { success, data, error: apiError } = await getPendingVerifications();

            if (!success || !data) {
                setError(apiError || 'Failed to load verifications');
                return;
            }

            setVerifications(data);

            // Load stats
            const statsResult = await getVerificationStats();
            if (statsResult.success && statsResult.data) {
                setStats(statsResult.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = (verification: BusinessVerificationRecord, action: 'approve' | 'reject') => {
        setSelectedVerification(verification);
        setReviewAction(action);
        setReviewNotes('');
        setBadgeLevel('basic');
    };

    const handleSubmitReview = async () => {
        if (!selectedVerification || !reviewAction || !user) return;

        setProcessing(true);
        setError(null);

        try {
            let result;

            if (reviewAction === 'approve') {
                result = await approveVerification(
                    selectedVerification.id,
                    user.id,
                    badgeLevel,
                    reviewNotes || undefined
                );
            } else {
                if (!reviewNotes) {
                    setError('Please provide a reason for rejection');
                    setProcessing(false);
                    return;
                }
                result = await rejectVerification(
                    selectedVerification.id,
                    user.id,
                    reviewNotes
                );
            }

            if (result.success) {
                // Close dialog and reload data
                setSelectedVerification(null);
                setReviewAction(null);
                await loadData();
            } else {
                setError(result.error || 'Failed to process review');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Business Verification Review</h1>
                <p className="text-muted-foreground">Review and approve business verification requests</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Approved
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Rejected
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    </CardContent>
                </Card>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Verifications List */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending Verifications</CardTitle>
                    <CardDescription>
                        {verifications.length} verification request{verifications.length !== 1 ? 's' : ''} awaiting review
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {verifications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No pending verifications</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {verifications.map((verification) => (
                                <Card key={verification.id} className="border-2">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-3 flex-1">
                                                {/* Business Name */}
                                                <div className="flex items-center gap-2">
                                                    <Building className="h-5 w-5 text-primary" />
                                                    <h3 className="text-lg font-semibold">{verification.business_name}</h3>
                                                    <Badge variant="secondary">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Pending
                                                    </Badge>
                                                </div>

                                                {/* EIN/Business Number */}
                                                {(verification.ein || verification.business_number) && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <FileText className="h-4 w-4" />
                                                        <span>
                                                            {verification.ein ? `EIN: ${verification.ein}` : `Business Number: ${verification.business_number}`}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Address */}
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>
                                                        {verification.address_street}, {verification.address_city}, {verification.address_state} {verification.address_zip}, {verification.address_country}
                                                    </span>
                                                </div>

                                                {/* Contact Info */}
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                    {verification.website && (
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="h-4 w-4" />
                                                            <a href={verification.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                                {verification.website}
                                                            </a>
                                                        </div>
                                                    )}
                                                    {verification.email && (
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4" />
                                                            <span>{verification.email}</span>
                                                        </div>
                                                    )}
                                                    {verification.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4" />
                                                            <span>{verification.phone}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Verification Result */}
                                                {verification.verification_result && (
                                                    <div className="bg-muted/50 rounded-md p-3 text-sm">
                                                        <p className="font-medium mb-2">Automated Verification Results:</p>
                                                        <div className="space-y-1">
                                                            {verification.verification_result.details?.businessNameMatch !== undefined && (
                                                                <div className="flex items-center gap-2">
                                                                    {verification.verification_result.details.businessNameMatch ? (
                                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                                    ) : (
                                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                                    )}
                                                                    <span>Business Name Match</span>
                                                                </div>
                                                            )}
                                                            {verification.verification_result.details?.einValid !== undefined && (
                                                                <div className="flex items-center gap-2">
                                                                    {verification.verification_result.details.einValid ? (
                                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                                    ) : (
                                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                                    )}
                                                                    <span>EIN Valid</span>
                                                                </div>
                                                            )}
                                                            {verification.verification_result.details?.domainVerified !== undefined && (
                                                                <div className="flex items-center gap-2">
                                                                    {verification.verification_result.details.domainVerified ? (
                                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                                    ) : (
                                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                                    )}
                                                                    <span>Domain Verified</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="mt-2 text-xs text-muted-foreground">
                                                            Confidence: {verification.verification_result.confidence}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Submission Date */}
                                                <p className="text-xs text-muted-foreground">
                                                    Submitted: {formatDate(verification.created_at)}
                                                </p>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    onClick={() => handleReview(verification, 'approve')}
                                                    variant="default"
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    onClick={() => handleReview(verification, 'reject')}
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={reviewAction !== null} onOpenChange={() => setReviewAction(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {reviewAction === 'approve' ? 'Approve' : 'Reject'} Business Verification
                        </DialogTitle>
                        <DialogDescription>
                            {selectedVerification?.business_name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {reviewAction === 'approve' && (
                            <div className="space-y-2">
                                <Label htmlFor="badgeLevel">Badge Level</Label>
                                <Select value={badgeLevel} onValueChange={(value: 'basic' | 'premium' | 'enterprise') => setBadgeLevel(value)}>
                                    <SelectTrigger id="badgeLevel">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="basic">Basic - Automated verification</SelectItem>
                                        <SelectItem value="premium">Premium - Manual review completed</SelectItem>
                                        <SelectItem value="enterprise">Enterprise - Full vetting with documents</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="notes">
                                {reviewAction === 'approve' ? 'Notes (Optional)' : 'Rejection Reason (Required)'}
                            </Label>
                            <Textarea
                                id="notes"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder={reviewAction === 'approve'
                                    ? 'Add any notes about this verification...'
                                    : 'Please provide a reason for rejection (will be sent to the user)...'
                                }
                                rows={4}
                                required={reviewAction === 'reject'}
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReviewAction(null)} disabled={processing}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitReview}
                            disabled={processing}
                            variant={reviewAction === 'approve' ? 'default' : 'destructive'}
                        >
                            {processing ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {reviewAction === 'approve' ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Approve
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Reject
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BusinessVerificationReview;
