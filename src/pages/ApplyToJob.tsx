/**
 * @fileoverview Job Application Form Page
 * Job seekers apply to jobs with CV (required), skill test verification, and proposal
 * 
 * SKILL TEST RULES:
 * - Skill tests are ONLY accessed during application (not a separate browse page)
 * - ONLY job seekers take skill tests - employers are 100% exempt
 * - If job requires test, check if user passed before allowing application
 * - Provide "Take Test" button inline if test not passed yet
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabase } from '@/providers/SupabaseProvider';
import { uploadCv } from '@/lib/storage';
import { submitApplication } from '@/lib/api/applications';
import { getAssignment, type Assignment } from '@/lib/api/assignments';
import { SkillTestModal } from '@/components/skill-tests';
import { useCanAttemptTest } from '@/hooks/use-skill-test';

export default function ApplyToJob() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, supabase } = useSupabase();

    // Job data
    const [job, setJob] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);

    // Profile CV
    const [profileCvUrl, setProfileCvUrl] = useState<string | null>(null);
    const [useProfileCv, setUseProfileCv] = useState(true);

    // New CV upload
    const [newCvFile, setNewCvFile] = useState<File | null>(null);
    const [uploadingCv, setUploadingCv] = useState(false);
    const [newCvUrl, setNewCvUrl] = useState<string | null>(null);

    // Form data
    const [proposal, setProposal] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [expectedSalary, setExpectedSalary] = useState('');
    const [estimatedStartDate, setEstimatedStartDate] = useState('');

    // Skill test state
    const [skillTestPassed, setSkillTestPassed] = useState(false);
    const [skillTestAttemptId, setSkillTestAttemptId] = useState<string | null>(null);
    const [showSkillTestModal, setShowSkillTestModal] = useState(false);
    
    // Check eligibility for skill test
    const { data: eligibility, isLoading: checkingEligibility } = useCanAttemptTest({
        jobId: id,
        enabled: !!job?.requires_skill_test
    });

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function loadJobAndProfile() {
        try {
            setLoading(true);

            // Load job details
            const jobData = await getAssignment(id!);
            setJob(jobData);

            // Load profile CV
            if (user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('cv_url')
                    .eq('id', user.id)
                    .single();

                if (profileData?.cv_url) {
                    setProfileCvUrl(profileData.cv_url);
                }
            }

            // Skill test eligibility handled by useCanAttemptTest hook
        } catch (err) {
            console.error('Error loading job:', err);
            setError('Failed to load job details');
        } finally {
            setLoading(false);
        }
    }

    async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            setError('Only PDF files are allowed for CVs');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('CV file size must be less than 5MB');
            return;
        }

        setNewCvFile(file);
        setUseProfileCv(false);
        setError(null);

        // Upload immediately
        try {
            setUploadingCv(true);
            const result = await uploadCv(file, user!.id);
            setNewCvUrl(result.url);
            setError(null);
        } catch (err) {
            console.error('Error uploading CV:', err);
            setError('Failed to upload CV. Please try again.');
            setNewCvFile(null);
        } finally {
            setUploadingCv(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        // Validation
        if (!proposal.trim()) {
            setError('Please provide a proposal');
            return;
        }

        if (!skillTestPassed) {
            setError('You must pass the required skill test before applying');
            return;
        }

        const finalCvUrl = useProfileCv ? profileCvUrl : newCvUrl;
        if (!finalCvUrl) {
            setError('Please upload a CV or use your profile CV');
            return;
        }

        try {
            setSubmitting(true);

            await submitApplication({
                assignment_id: id!,
                proposal: proposal.trim(),
                cover_letter: coverLetter.trim() || undefined,
                bid_amount: expectedSalary ? parseFloat(expectedSalary) : undefined,
                estimated_start_date: estimatedStartDate || undefined,
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

    if (!job) {
        return (
            <div className="container max-w-2xl mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Job not found</AlertDescription>
                </Alert>
                <Button onClick={() => navigate('/jobs')} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Jobs
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
                        Your application has been sent to the employer. You'll be notified when they review it.
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
                onClick={() => navigate(`/jobs/${id}`)}
                className="mb-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Job
            </Button>

            <h1 className="text-3xl font-bold mb-2">Apply to {job.title}</h1>
            <p className="text-muted-foreground mb-8">Complete the form below to submit your application</p>

            {/* Skill Test Gate */}
            {job.requires_skill_test && job.skill_test_template_id && (
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
                                        ? 'You meet the skill requirements for this job'
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
            {job.requires_skill_test && job.skill_test_template_id && (
                <SkillTestModal
                    isOpen={showSkillTestModal}
                    onClose={() => setShowSkillTestModal(false)}
                    templateId={job.skill_test_template_id}
                    difficulty={job.skill_test_difficulty || 'entry'}
                    passingScore={job.skill_test_passing_score || 70}
                    jobId={id}
                    onTestComplete={(attemptId, passed) => {
                        setSkillTestAttemptId(attemptId);
                        setSkillTestPassed(passed);
                        setShowSkillTestModal(false);
                    }}
                />
            )}

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* CV Section */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Curriculum Vitae (Required)
                    </h3>

                    {/* Profile CV Option */}
                    {profileCvUrl && (
                        <div className="mb-4 p-4 bg-muted rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Use Profile CV</p>
                                    <a
                                        href={profileCvUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        View current CV
                                    </a>
                                </div>
                                <Button
                                    type="button"
                                    variant={useProfileCv ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setUseProfileCv(true);
                                        setNewCvFile(null);
                                        setNewCvUrl(null);
                                    }}
                                >
                                    {useProfileCv ? 'Selected' : 'Select'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Upload New CV Option */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">
                            {profileCvUrl ? 'Or upload a different CV' : 'Upload your CV'}
                        </label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="file"
                                accept="application/pdf"
                                onChange={handleCvUpload}
                                disabled={uploadingCv}
                                className="flex-1"
                            />
                            {uploadingCv && <Loader2 className="h-5 w-5 animate-spin" />}
                            {newCvUrl && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </div>
                        {newCvFile && (
                            <p className="text-sm text-muted-foreground">
                                Selected: {newCvFile.name}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            PDF only, max 5MB
                        </p>
                    </div>
                </Card>

                {/* Proposal */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">
                        Proposal <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                        placeholder="Explain why you're a great fit for this role..."
                        rows={6}
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        {proposal.length}/2000 characters
                    </p>
                </div>

                {/* Cover Letter */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Cover Letter (Optional)</label>
                    <Textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Additional information about your background and interest..."
                        rows={4}
                    />
                </div>

                {/* Expected Salary */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Expected Salary (Optional)</label>
                    <Input
                        type="number"
                        value={expectedSalary}
                        onChange={(e) => setExpectedSalary(e.target.value)}
                        placeholder="e.g., 50000"
                        min="0"
                        step="1000"
                    />
                    <p className="text-xs text-muted-foreground">Annual salary in your local currency</p>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Earliest Start Date (Optional)</label>
                    <Input
                        type="date"
                        value={estimatedStartDate}
                        onChange={(e) => setEstimatedStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="submit"
                        disabled={submitting || !skillTestPassed || uploadingCv}
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
                        onClick={() => navigate(`/jobs/${id}`)}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
