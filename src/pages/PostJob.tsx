import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  X,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { createAssignment } from "@/lib/api/assignments";

interface JobForm {
  title: string;
  company: string;
  location: string;
  type: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  description: string;
  requirements: string[];
  benefits: string[];
  remote: boolean;
  urgent: boolean;
  experienceLevel: string;
  department: string;
}

const PostJob = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRequirement, setNewRequirement] = useState("");
  const [newBenefit, setNewBenefit] = useState("");

  const [formData, setFormData] = useState<JobForm>({
    title: "",
    company: "TechCorp Solutions", // Pre-filled from employer profile
    location: "",
    type: "",
    salaryMin: "",
    salaryMax: "",
    currency: "ZAR",
    description: "",
    requirements: [],
    benefits: [],
    remote: false,
    urgent: false,
    experienceLevel: "",
    department: ""
  });

  const updateField = <K extends keyof JobForm>(field: K, value: JobForm[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      updateField('requirements', [...formData.requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    updateField('requirements', formData.requirements.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      updateField('benefits', [...formData.benefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    updateField('benefits', formData.benefits.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.title || !formData.location || !formData.type || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Create assignment in database
      const assignment = await createAssignment({
        title: formData.title,
        description: formData.description,
        category: formData.department || 'general',
        budget_min: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
        budget_max: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
        budget_type: 'fixed',
        required_skills: formData.requirements,
        experience_level: (formData.experienceLevel === 'mid' ? 'intermediate' : formData.experienceLevel) as 'entry' | 'intermediate' | 'expert' | 'any' | undefined,
        job_type: formData.type === 'full-time' ? 'full_time' :
          formData.type === 'part-time' ? 'part_time' :
            formData.type as 'contract' | 'freelance' | undefined,
        remote_allowed: formData.remote,
        location: formData.location,
        urgent: formData.urgent,
        status: 'open'
      });

      toast({
        title: "Job Posted Successfully!",
        description: `Your job posting "${assignment.title}" is now live.`,
      });
      navigate('/jobs');
    } catch (error) {
      toast({
        title: "Failed to Post Job",
        description: error instanceof Error ? error.message : "An error occurred while posting the job.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewData = {
    ...formData,
    salary: formData.salaryMin && formData.salaryMax
      ? `${formData.salaryMin} - ${formData.salaryMax}`
      : formData.salaryMin
        ? `From ${formData.salaryMin}`
        : formData.salaryMax
          ? `Up to ${formData.salaryMax}`
          : "Salary not specified"
  };

  return (
    <div className="bg-muted/20 p-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Post a New Job</h1>
            <p className="text-muted-foreground">Find the perfect candidate for your team</p>
          </div>

        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Job Details</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="preview">Preview & Post</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Title *</label>
                    <Input
                      placeholder="e.g. Senior React Developer"
                      value={formData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Company</label>
                    <Input
                      value={formData.company}
                      onChange={(e) => updateField('company', e.target.value)}
                      disabled
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location *</label>
                    <Select value={formData.location} onValueChange={(value) => updateField('location', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="johannesburg">Johannesburg</SelectItem>
                        <SelectItem value="cape town">Cape Town</SelectItem>
                        <SelectItem value="durban">Durban</SelectItem>
                        <SelectItem value="pretoria">Pretoria</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Type *</label>
                    <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Min Salary</label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={formData.salaryMin}
                      onChange={(e) => updateField('salaryMin', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Salary</label>
                    <Input
                      type="number"
                      placeholder="80000"
                      value={formData.salaryMax}
                      onChange={(e) => updateField('salaryMax', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Experience Level</label>
                    <Select value={formData.experienceLevel} onValueChange={(value) => updateField('experienceLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                        <SelectItem value="lead">Lead/Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Job Description *</label>
                  <Textarea
                    placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                    rows={8}
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remote"
                      checked={formData.remote}
                      onCheckedChange={(checked) => updateField('remote', !!checked)}
                    />
                    <label htmlFor="remote" className="text-sm">Remote work available</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="urgent"
                      checked={formData.urgent}
                      onCheckedChange={(checked) => updateField('urgent', !!checked)}
                    />
                    <label htmlFor="urgent" className="text-sm">Urgent hiring</label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Job Requirements & Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Requirements */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Skills & Requirements</label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Add a requirement..."
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                    />
                    <Button onClick={addRequirement} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.requirements.map((req, index) => (
                      <Badge key={index} variant="secondary" className="animate-scale-in">
                        {req}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer hover:bg-destructive/20 rounded-full"
                          onClick={() => removeRequirement(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Benefits & Perks</label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Add a benefit..."
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                    />
                    <Button onClick={addBenefit} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit, index) => (
                      <Badge key={index} variant="outline" className="animate-scale-in">
                        {benefit}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer hover:bg-destructive/20 rounded-full"
                          onClick={() => removeBenefit(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Quick Add Suggestions */}
                <div>
                  <p className="text-sm font-medium mb-2">Quick Add Common Requirements:</p>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Node.js', 'AWS', 'Git', '3+ years experience'].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!formData.requirements.includes(suggestion)) {
                            updateField('requirements', [...formData.requirements, suggestion]);
                          }
                        }}
                        disabled={formData.requirements.includes(suggestion)}
                      >
                        + {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Quick Add Common Benefits:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Health Insurance', 'Remote Work', 'Flexible Hours', 'Learning Budget', 'Stock Options'].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!formData.benefits.includes(suggestion)) {
                            updateField('benefits', [...formData.benefits, suggestion]);
                          }
                        }}
                        disabled={formData.benefits.includes(suggestion)}
                      >
                        + {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-primary" />
                    Job Preview
                  </span>
                  <Badge variant="outline" className="border-primary text-primary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready to Post
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Job Preview */}
                <div className="border rounded-lg p-6 bg-card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{previewData.title || "Job Title"}</h3>
                        <Badge variant="outline" className="border-verified text-verified">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                        {formData.urgent && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground font-medium">{previewData.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {previewData.location || "Location not specified"}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {previewData.type || "Job type not specified"}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {previewData.salary}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
                    {previewData.description || "Job description will appear here..."}
                  </p>

                  {formData.requirements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Requirements:</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.requirements.map((req, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.benefits.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Benefits:</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.benefits.map((benefit, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Job Actions */}
                <div className="flex justify-between items-center mt-6 pt-6 border-t">
                  <div className="text-sm text-muted-foreground">
                    <p>• Job will be reviewed within 24 hours</p>
                    <p>• Verified employers get priority visibility</p>
                    <p>• You'll receive notifications for applications</p>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="lg"
                    className="min-w-32"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Posting...
                      </>
                    ) : (
                      'Post Job'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PostJob;