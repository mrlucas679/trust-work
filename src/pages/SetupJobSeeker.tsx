import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Upload, X, Shield, User, Briefcase, GraduationCap,
    FileText, Target, MapPin, DollarSign, Clock, ChevronRight,
    ChevronLeft, Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/providers/SupabaseProvider";
import { uploadCv } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

/**
 * Career24-Style Job Seeker Onboarding
 * Multi-step wizard collecting comprehensive professional information
 * 
 * Steps:
 * 1. Personal Information (name, location, phone)
 * 2. Professional Profile (experience level, employment status, industry)
 * 3. Education & Qualifications
 * 4. Skills & Expertise
 * 5. CV Upload
 * 6. Job Preferences (desired role, location, salary)
 */

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

interface WorkExperience {
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

interface Education {
    qualification: string;
    institution: string;
    fieldOfStudy: string;
    yearCompleted: string;
}

const SetupJobSeeker = () => {
    const navigate = useNavigate();
    const { supabase, user } = useSupabase();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Multi-step state
    const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Personal Information
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [city, setCity] = useState('');
    const [province, setProvince] = useState('');

    // Step 2: Professional Profile
    const [experienceLevel, setExperienceLevel] = useState('');
    const [employmentStatus, setEmploymentStatus] = useState('');
    const [currentJobTitle, setCurrentJobTitle] = useState('');
    const [industry, setIndustry] = useState('');
    const [yearsExperience, setYearsExperience] = useState('');

    // Step 3: Education
    const [highestQualification, setHighestQualification] = useState('');
    const [institution, setInstitution] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState('');
    const [yearCompleted, setYearCompleted] = useState('');

    // Step 4: Skills
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState('');
    const [languages, setLanguages] = useState<string[]>([]);
    const [newLanguage, setNewLanguage] = useState('');

    // Step 5: CV Upload
    const [cvUrl, setCvUrl] = useState<string | null>(null);
    const [cvUploading, setCvUploading] = useState(false);

    // Step 6: Job Preferences
    const [desiredRole, setDesiredRole] = useState('');
    const [desiredIndustry, setDesiredIndustry] = useState('');
    const [desiredLocation, setDesiredLocation] = useState('');
    const [jobType, setJobType] = useState('');
    const [salaryExpectation, setSalaryExpectation] = useState('');
    const [availability, setAvailability] = useState('');

    const southAfricanProvinces = [
        'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
        'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape'
    ];

    const experienceLevels = [
        'Entry Level (0-2 years)',
        'Junior (2-5 years)',
        'Mid-Level (5-10 years)',
        'Senior (10+ years)',
        'Executive'
    ];

    const industries = [
        'Information Technology', 'Finance & Banking', 'Healthcare',
        'Education', 'Engineering', 'Marketing & Advertising',
        'Sales & Retail', 'Manufacturing', 'Hospitality & Tourism',
        'Construction', 'Legal', 'Human Resources', 'Other'
    ];

    const qualifications = [
        'Matric / Grade 12',
        'Certificate',
        'Diploma',
        'Bachelor\'s Degree',
        'Honours Degree',
        'Master\'s Degree',
        'Doctoral Degree',
        'Professional Qualification'
    ];

    const jobTypes = [
        'Permanent', 'Contract', 'Temporary', 'Part-Time', 'Freelance', 'Internship'
    ];

    const availabilities = [
        'Immediate', '1 Month Notice', '2 Months Notice', '3+ Months Notice'
    ];

    useEffect(() => {
        // Load existing profile data
        const loadProfile = async () => {
            if (!user) return;

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setFullName(data.display_name || '');
                setPhone(data.phone || '');
                setCvUrl(data.cv_url || null);
                // Load other fields if they exist
            }
        };

        loadProfile();
    }, [user, supabase]);

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const addLanguage = () => {
        if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
            setLanguages([...languages, newLanguage.trim()]);
            setNewLanguage('');
        }
    };

    const removeLanguage = (lang: string) => {
        setLanguages(languages.filter(l => l !== lang));
    };

    const onChooseFile = () => {
        if (!user) {
            toast({ title: 'Not signed in', description: 'Please sign in to upload your CV.' });
            return;
        }
        fileInputRef.current?.click();
    };

    const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!user) return;

        if (file.size > 10 * 1024 * 1024) {
            toast({ title: 'File too large', description: 'Please upload a file up to 10MB.' });
            return;
        }

        try {
            setCvUploading(true);
            const { url } = await uploadCv(file, user.id);
            const { error } = await supabase
                .from('profiles')
                .upsert({ id: user.id, cv_url: url });
            if (error) throw error;
            setCvUrl(url);
            toast({ title: 'CV uploaded', description: 'Your CV has been uploaded successfully.' });
        } catch (err) {
            console.error('CV upload error:', err);
            const msg = err instanceof Error ? err.message : 'Failed to upload CV';
            toast({ title: 'Upload failed', description: msg, variant: 'destructive' });
        } finally {
            setCvUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleComplete = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Save all collected data to profile
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    display_name: fullName,
                    phone: phone,
                    role: 'job_seeker',
                    // Personal
                    city: city,
                    province: province,
                    location: location,
                    // Professional
                    experience_level: experienceLevel,
                    employment_status: employmentStatus,
                    current_job_title: currentJobTitle,
                    industry: industry,
                    years_experience: yearsExperience,
                    // Education
                    highest_qualification: highestQualification,
                    institution: institution,
                    field_of_study: fieldOfStudy,
                    year_completed: yearCompleted,
                    // Skills
                    skills: skills,
                    languages: languages,
                    // Preferences
                    desired_role: desiredRole,
                    desired_industry: desiredIndustry,
                    desired_location: desiredLocation,
                    job_type_preference: jobType,
                    salary_expectation: salaryExpectation,
                    availability: availability,
                    // Mark onboarding as complete
                    onboarding_completed: true,
                });

            if (error) throw error;

            toast({ title: 'Profile completed!', description: 'Your job seeker profile is ready.' });
            navigate('/dashboard/job-seeker');
        } catch (err) {
            toast({
                title: 'Error',
                description: err instanceof Error ? err.message : 'Failed to complete setup',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const canProceed = (step: OnboardingStep): boolean => {
        switch (step) {
            case 1:
                return fullName.trim().length > 0 && phone.trim().length > 0 && province.length > 0;
            case 2:
                return experienceLevel.length > 0 && employmentStatus.length > 0 && industry.length > 0;
            case 3:
                return highestQualification.length > 0;
            case 4:
                return skills.length > 0; // At least one skill
            case 5:
                return true; // CV is optional but encouraged
            case 6:
                return desiredRole.length > 0 && jobType.length > 0;
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (canProceed(currentStep)) {
            setCurrentStep((currentStep + 1) as OnboardingStep);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as OnboardingStep);
        }
    };

    const progress = (currentStep / 6) * 100;

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Personal Information</h3>
                                <p className="text-sm text-muted-foreground">Let's start with the basics</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullname">Full Name *</Label>
                            <Input
                                id="fullname"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+27 82 123 4567"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    placeholder="Johannesburg"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="province">Province *</Label>
                                <Select value={province} onValueChange={setProvince}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select province" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {southAfricanProvinces.map(prov => (
                                            <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Briefcase className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Professional Profile</h3>
                                <p className="text-sm text-muted-foreground">Tell us about your work experience</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="experience-level">Experience Level *</Label>
                            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select experience level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {experienceLevels.map(level => (
                                        <SelectItem key={level} value={level}>{level}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="employment-status">Current Employment Status *</Label>
                            <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="employed">Employed</SelectItem>
                                    <SelectItem value="unemployed">Unemployed</SelectItem>
                                    <SelectItem value="self-employed">Self-Employed</SelectItem>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="recent_graduate">Recent Graduate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="current-job">Current/Most Recent Job Title</Label>
                            <Input
                                id="current-job"
                                placeholder="e.g., Software Developer"
                                value={currentJobTitle}
                                onChange={e => setCurrentJobTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry *</Label>
                            <Select value={industry} onValueChange={setIndustry}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    {industries.map(ind => (
                                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="years-exp">Years of Experience</Label>
                            <Input
                                id="years-exp"
                                type="number"
                                placeholder="5"
                                value={yearsExperience}
                                onChange={e => setYearsExperience(e.target.value)}
                            />
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <GraduationCap className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Education & Qualifications</h3>
                                <p className="text-sm text-muted-foreground">Your educational background</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="qualification">Highest Qualification *</Label>
                            <Select value={highestQualification} onValueChange={setHighestQualification}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select qualification" />
                                </SelectTrigger>
                                <SelectContent>
                                    {qualifications.map(qual => (
                                        <SelectItem key={qual} value={qual}>{qual}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="institution">Institution</Label>
                            <Input
                                id="institution"
                                placeholder="e.g., University of Cape Town"
                                value={institution}
                                onChange={e => setInstitution(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="field">Field of Study</Label>
                                <Input
                                    id="field"
                                    placeholder="e.g., Computer Science"
                                    value={fieldOfStudy}
                                    onChange={e => setFieldOfStudy(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="year">Year Completed</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    placeholder="2020"
                                    value={yearCompleted}
                                    onChange={e => setYearCompleted(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Target className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Skills & Expertise</h3>
                                <p className="text-sm text-muted-foreground">What are you good at?</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Skills * (Add at least 3)</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g., JavaScript, Project Management"
                                    value={newSkill}
                                    onChange={e => setNewSkill(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                />
                                <Button type="button" onClick={addSkill}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {skills.map(skill => (
                                    <Badge key={skill} variant="secondary" className="gap-1">
                                        {skill}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Languages</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="e.g., English, Afrikaans, Zulu"
                                    value={newLanguage}
                                    onChange={e => setNewLanguage(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                                />
                                <Button type="button" onClick={addLanguage}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {languages.map(lang => (
                                    <Badge key={lang} variant="outline" className="gap-1">
                                        {lang}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeLanguage(lang)} />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Upload Your CV</h3>
                                <p className="text-sm text-muted-foreground">Help employers find you</p>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            {cvUrl ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-green-600 font-medium">✓ CV uploaded successfully</p>
                                    <a className="text-sm text-primary underline" href={cvUrl} target="_blank" rel="noreferrer">
                                        View uploaded CV
                                    </a>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground mb-4">
                                    Upload your CV (PDF, DOC, DOCX - Max 10MB)
                                </p>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className="hidden"
                                onChange={onFileSelected}
                            />
                            <Button onClick={onChooseFile} disabled={cvUploading} variant="outline">
                                {cvUploading ? 'Uploading...' : cvUrl ? 'Replace CV' : 'Choose File'}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-3">
                                Tip: A well-formatted CV increases your chances of getting hired
                            </p>
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Target className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Job Preferences</h3>
                                <p className="text-sm text-muted-foreground">What are you looking for?</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="desired-role">Desired Job Title *</Label>
                            <Input
                                id="desired-role"
                                placeholder="e.g., Senior Software Developer"
                                value={desiredRole}
                                onChange={e => setDesiredRole(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="desired-industry">Preferred Industry</Label>
                            <Select value={desiredIndustry} onValueChange={setDesiredIndustry}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                                <SelectContent>
                                    {industries.map(ind => (
                                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="job-type">Job Type *</Label>
                            <Select value={jobType} onValueChange={setJobType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {jobTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location-pref">Preferred Location</Label>
                            <Input
                                id="location-pref"
                                placeholder="e.g., Johannesburg, Cape Town, Remote"
                                value={desiredLocation}
                                onChange={e => setDesiredLocation(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="salary">Expected Salary (Monthly)</Label>
                            <Input
                                id="salary"
                                placeholder="e.g., R25,000 - R35,000"
                                value={salaryExpectation}
                                onChange={e => setSalaryExpectation(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="availability">Availability *</Label>
                            <Select value={availability} onValueChange={setAvailability}>
                                <SelectTrigger>
                                    <SelectValue placeholder="When can you start?" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availabilities.map(avail => (
                                        <SelectItem key={avail} value={avail}>{avail}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
                                <CardDescription>Step {currentStep} of 6</CardDescription>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-primary">{Math.round(progress)}%</p>
                            <p className="text-xs text-muted-foreground">Complete</p>
                        </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                </CardHeader>

                <CardContent>
                    {renderStep()}

                    <div className="flex items-center justify-between mt-8 pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>

                        {currentStep < 6 ? (
                            <Button
                                onClick={nextStep}
                                disabled={!canProceed(currentStep)}
                            >
                                Continue
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                disabled={loading || !canProceed(currentStep)}
                            >
                                {loading ? 'Completing...' : 'Complete Profile'}
                                <Check className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SetupJobSeeker;
