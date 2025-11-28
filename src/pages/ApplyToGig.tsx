/**
 * @fileoverview Gig Application Form Page
 * Both employers and job seekers can apply to gigs
 * NO CV required - profile summary and ratings only
 * 
 * SKILL TEST RULES:
 * - Skill tests are ONLY accessed during application (not a separate browse page)
 * - ONLY job seekers take skill tests
 * - Employers are 100% EXEMPT from all skill tests
 * - If gig requires test and user is job seeker, check if passed
 * - Employers see exemption notice and proceed without testing
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Loader2, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useSupabase } from '@/providers/SupabaseProvider';
import { submitApplication } from '@/lib/api/applications';
import { getGigById, type Gig } from '@/lib/api/gigs';
import { SkillTestModal } from '@/components/skill-tests';
import { useCanAttemptTest } from '@/hooks/use-skill-test';

interface UserProfile {
    id: string;
    display_name: string;
    role: 'employer' | 'job_seeker';
    skills: string[];
    city: string;
    province: string;
    overall_rating: number | null;
    total_reviews: number;
    total_gigs_completed: number;
    success_rate: number | null;
    verified: boolean;
}

export default function ApplyToGig() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, role, supabase } = useSupabase();

    // Gig data
    const [gig, setGig] = useState<Gig | null>(null);
    const [loading, setLoading] = useState(true);

    // User profile
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Form data
    const [proposal, setProposal] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [estimatedDuration, setEstimatedDuration] = useState('');

    // Skill test state (job seekers only)
    const [skillTestPassed, setSkillTestPassed] = useState(false);
    const [skillTestAttemptId, setSkillTestAttemptId] = useState<string | null>(null);
    const [showSkillTestModal, setShowSkillTestModal] = useState(false);
    
    // Check eligibility for skill test
    const { data: eligibility, isLoading: checkingEligibility } = useCanAttemptTest({
        gigId: id,
        enabled: !!gig?.requires_skill_test && !isEmployer
    });

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const isEmployer = role === 'employer';

    const loadGigAndProfile = useCallback(async () => {
        try {
            setLoading(true);

            // Load gig details
            const gigData = await getGigById(id!);
            setGig(gigData);

            // Load user profile
            if (user) {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, display_name, role, skills, city, province, overall_rating, total_reviews, total_gigs_completed, success_rate, verified')
                    .eq('id', user.id)
                    .single();

                if (profileError) throw profileError;
                setProfile(profileData as UserProfile);
            }

            // Skill test eligibility handled by useCanAttemptTest hook
        } catch (err) {
            console.error('Error loading gig:', err);
            setError('Failed to load gig details');
        } finally {
            setLoading(false);
        }
    }, [id, user, supabase]);

    useEffect(() => {
        if (!id) return;
        loadGigAndProfile();
    }, [id, loadGigAndProfile]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        // Validation
        if (!proposal.trim()) {
            setError('Please provide a proposal');
            return;
        }

        if (!bidAmount || parseFloat(bidAmount) <= 0) {
            setError('Please enter a valid bid amount');
            return;
        }

        if (!estimatedDuration.trim()) {
            setError('Please provide an estimated duration');
            return;
        }

        if (!isEmployer && !skillTestPassed) {
            setError('You must pass the required skill test before applying');
            return;
        }

        try {
            setSubmitting(true);

            await submitApplication({
                assignment_id: id!,
                proposal: proposal.trim(),
                bid_amount: parseFloat(bidAmount),
                estimated_duration: estimatedDuration.trim(),
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/applications');
            }, 2000);
        } catch (err) {
            console.error('Error submitting application:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!gig || !profile) {
        return (
            <div className="container max-w-2xl mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Gig not found</AlertDescription>
                </Alert>
                <Button onClick={() => navigate('/gigs')} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Gigs
                </Button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="container max-w-2xl mx-auto px-4 py-8">
                <Card className="p-8 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
                    <p className="text-muted-foreground">
                        Your application has been sent. You'll be notified when it's reviewed.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-3xl mx-auto px-4 py-8">
            {/* Header */}
            <Button
                variant="ghost"
                onClick={() => navigate(`/gigs/${id}`)}
                className="mb-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Gig
            </Button>

            <h1 className="text-3xl font-bold mb-2">Apply to {gig.title}</h1>
            <p className="text-muted-foreground mb-8">Submit your proposal for this gig</p>

            {/* Skill Test Gate (Job Seekers Only) */}
            {!isEmployer && gig.requires_skill_test && gig.skill_test_template_id && (
                <Card className={`p-4 mb-6 ${skillTestPassed ? 'border-green-500' : 'border-yellow-500'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {checkingEligibility ? (
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : skillTestPassed ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-yellow-500" />
                            )}
                            <div>
                                <p className="font-medium">
                                    {skillTestPassed ? 'Skill Test Passed ✓' : 'Skill Test Required'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {skillTestPassed
                                        ? 'You meet the skill requirements for this gig'
                                        : eligibility?.canAttempt === false
                                            ? `You can retry on ${new Date(eligibility.nextAttemptDate!).toLocaleDateString()}`
                                            : 'You must pass the required skill test to apply'}
                                </p>
                            </div>
                        </div>
                        {!skillTestPassed && eligibility?.canAttempt && (
                            <Button
                                onClick={() => setShowSkillTestModal(true)}
                                variant="outline"
                            >
                                Take Test
                            </Button>
                        )}
                    </div>
                </Card>
            )}
            
            {/* Skill Test Modal */}
            {gig.requires_skill_test && gig.skill_test_template_id && (
                <SkillTestModal
                    isOpen={showSkillTestModal}
                    onClose={() => setShowSkillTestModal(false)}
                    templateId={gig.skill_test_template_id}
                    difficulty={gig.skill_test_difficulty || 'entry'}
                    passingScore={gig.skill_test_passing_score || 70}
                    gigId={id}
                    onTestComplete={(attemptId, passed) => {
                        setSkillTestAttemptId(attemptId);
                        setSkillTestPassed(passed);
                        setShowSkillTestModal(false);
                    }}
                />
            )}

            {/* Employer Exemption Notice */}
            {isEmployer && gig.requires_skill_test && (
                <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <div>
                            <p className="font-medium text-blue-900">Employer Exemption</p>
                            <p className="text-sm text-blue-700">
                                As an employer, you are exempt from skill test requirements
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Profile Summary Card */}
            <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Your Profile Summary</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{profile.display_name}</p>
                            <p className="text-sm text-muted-foreground">
                                {profile.city}, {profile.province}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {profile.verified && (
                                <Badge variant="secondary" className="gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Verified
                                </Badge>
                            )}
                            <Badge variant="outline">{role === 'employer' ? 'Employer' : 'Job Seeker'}</Badge>
                        </div>
                    </div>

                    {/* Ratings & Stats */}
                    {profile.overall_rating !== null && (
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{profile.overall_rating.toFixed(1)}</span>
                                <span className="text-muted-foreground">({profile.total_reviews} reviews)</span>
                            </div>
                            <div className="text-muted-foreground">
                                {profile.total_gigs_completed} gigs completed
                            </div>
                            {profile.success_rate !== null && (
                                <div className="text-muted-foreground">
                                    {profile.success_rate}% success rate
                                </div>
                            )}
                        </div>
                    )}

                    {/* Skills */}
                    {profile.skills && profile.skills.length > 0 && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="secondary">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Proposal */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">
                        Proposal <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                        placeholder="Explain your approach to completing this gig..."
                        rows={6}
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        {proposal.length}/2000 characters
                    </p>
                </div>

                {/* Bid Amount */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">
                        Bid Amount <span className="text-destructive">*</span>
                    </label>
                    <Input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="e.g., 5000"
                        min="0"
                        step="100"
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        Amount in your local currency
                        {gig.budget && ` (Gig budget: ${gig.budget})`}
                    </p>
                </div>

                {/* Estimated Duration */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">
                        Estimated Duration <span className="text-destructive">*</span>
                    </label>
                    <Input
                        type="text"
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(e.target.value)}
                        placeholder="e.g., 2 weeks, 10 days, 1 month"
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        {gig.duration && `Requested duration: ${gig.duration}`}
                    </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="submit"
                        disabled={submitting || (!isEmployer && !skillTestPassed)}
                        className="flex-1"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Submit Application
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/gigs/${id}`)}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
