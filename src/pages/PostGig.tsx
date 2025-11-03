import { useState } from "react";
import { Plus, X, Zap, Clock, DollarSign, CheckCircle, AlertTriangle, Eye, Target, QuizIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Quiz, QuizBuilder } from "@/components/quiz/QuizBuilder";


interface GigForm {
  title: string;
  client: string;
  description: string;
  budget: string;
  budgetType: string;
  duration: string;
  skills: string[];
  deliverables: string[];
  urgent: boolean;
  remote: boolean;
  experienceLevel: string;
  postType: 'gig' | 'job';
  companyDetails?: {
    companySize: string;
    industry: string;
    location: string;
  };
  quiz: Quiz;
}
const PostGig = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newDeliverable, setNewDeliverable] = useState("");
  const [formData, setFormData] = useState<GigForm>({
    title: "",
    client: "TechCorp Solutions",
    description: "",
    budget: "",
    budgetType: "fixed",
    duration: "",
    skills: [],
    deliverables: [],
    urgent: false,
    remote: true,
    experienceLevel: "",
    postType: "gig",
    companyDetails: {
      companySize: "",
      industry: "",
      location: ""
    },
    quiz: {
      enabled: false,
      mandatory: false,
      passingScore: 70,
      timeLimit: 30,
      questions: []
    }
  });

  const [isVerified, setIsVerified] = useState(false);
  const updateField = (field: keyof GigForm, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const addSkill = () => {
    if (newSkill.trim()) {
      updateField('skills', [...formData.skills, newSkill.trim()]);
      setNewSkill("");
    }
  };
  const removeSkill = (index: number) => {
    updateField('skills', formData.skills.filter((_, i) => i !== index));
  };
  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      updateField('deliverables', [...formData.deliverables, newDeliverable.trim()]);
      setNewDeliverable("");
    }
  };
  const removeDeliverable = (index: number) => {
    updateField('deliverables', formData.deliverables.filter((_, i) => i !== index));
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.title || !formData.description || !formData.budget || !formData.duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // If quiz is enabled and mandatory, validate that questions exist
    if (formData.quiz.enabled && formData.quiz.mandatory && formData.quiz.questions.length === 0) {
      toast({
        title: "Quiz Configuration Required",
        description: "Please add questions to the mandatory quiz or disable it.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate gig posting
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Gig Posted Successfully!",
        description: "Your gig is now live and freelancers can start submitting proposals."
      });
      navigate('/dashboard/employer');
    }, 2000);
  };
  const previewData = {
    ...formData,
    budgetDisplay: formData.budgetType === 'fixed' ? `${formData.budget} (Fixed Price)` : `${formData.budget}/hour`
  };
  return <div className="bg-muted/20 p-6">
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Post a New Gig</h1>
          <p className="text-muted-foreground">Find skilled freelancers for your project</p>
        </div>

      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Gig Details</TabsTrigger>
          <TabsTrigger value="requirements">Skills & Deliverables</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="preview">Preview & Post</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-primary" />
                Gig Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Post Type *</label>
                  <Select value={formData.postType} onValueChange={(value) => updateField('postType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gig">Individual Gig</SelectItem>
                      <SelectItem value="job">Company Job</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.postType === 'job' && !isVerified && (
                    <p className="text-sm text-destructive mt-1">Company verification required to post jobs</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Client</label>
                  <Input value={formData.client} onChange={e => updateField('client', e.target.value)} disabled />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {formData.postType === 'job' ? 'Job Title *' : 'Gig Title *'}
                </label>
                <Input
                  placeholder={formData.postType === 'job'
                    ? "e.g. Senior Frontend Developer"
                    : "e.g. Build a modern e-commerce website"
                  }
                  value={formData.title}
                  onChange={e => updateField('title', e.target.value)}
                />
              </div>

              {formData.postType === 'job' && (
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/10 rounded-lg">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Company Size</label>
                    <Select
                      value={formData.companyDetails?.companySize}
                      onValueChange={(value) => updateField('companyDetails', { ...formData.companyDetails, companySize: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-1000">201-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Industry</label>
                    <Select
                      value={formData.companyDetails?.industry}
                      onValueChange={(value) => updateField('companyDetails', { ...formData.companyDetails, industry: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <Input
                      placeholder="e.g. New York, NY"
                      value={formData.companyDetails?.location}
                      onChange={e => updateField('companyDetails', {
                        ...formData.companyDetails,
                        location: e.target.value
                      })}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Project Description *</label>
                <Textarea placeholder="Describe your project in detail. What do you need built? What are your expectations? Include any specific requirements..." rows={8} value={formData.description} onChange={e => updateField('description', e.target.value)} />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Budget Type</label>
                  <Select value={formData.budgetType} onValueChange={value => updateField('budgetType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {formData.budgetType === 'fixed' ? 'Total Budget *' : 'Hourly Rate *'}
                  </label>
                  <Input type="number" placeholder={formData.budgetType === 'fixed' ? "5000" : "500"} value={formData.budget} onChange={e => updateField('budget', e.target.value)} />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Duration *</label>
                  <Select value={formData.duration} onValueChange={value => updateField('duration', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3 days">1-3 days</SelectItem>
                      <SelectItem value="1 week">1 week</SelectItem>
                      <SelectItem value="2 weeks">2 weeks</SelectItem>
                      <SelectItem value="1 month">1 month</SelectItem>
                      <SelectItem value="2-3 months">2-3 months</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Experience Level</label>
                <Select value={formData.experienceLevel} onValueChange={value => updateField('experienceLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                    <SelectItem value="expert">Expert (5+ years)</SelectItem>
                    <SelectItem value="any">Any Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remote" checked={formData.remote} onCheckedChange={checked => updateField('remote', checked)} />
                  <label htmlFor="remote" className="text-sm">Remote work allowed</label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="urgent" checked={formData.urgent} onCheckedChange={checked => updateField('urgent', checked)} />
                  <label htmlFor="urgent" className="text-sm">Urgent project</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Skills & Deliverables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skills */}
              <div>
                <label className="text-sm font-medium mb-2 block">Required Skills</label>
                <div className="flex gap-2 mb-3">
                  <Input placeholder="Add a required skill..." value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyPress={e => e.key === 'Enter' && addSkill()} />
                  <Button onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => <Badge key={index} variant="secondary" className="animate-scale-in">
                    {skill}
                    <X className="h-3 w-3 ml-1 cursor-pointer hover:bg-destructive/20 rounded-full" onClick={() => removeSkill(index)} />
                  </Badge>)}
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <label className="text-sm font-medium mb-2 block">Project Deliverables</label>
                <div className="flex gap-2 mb-3">
                  <Input placeholder="Add a deliverable..." value={newDeliverable} onChange={e => setNewDeliverable(e.target.value)} onKeyPress={e => e.key === 'Enter' && addDeliverable()} />
                  <Button onClick={addDeliverable} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.deliverables.map((deliverable, index) => <Badge key={index} variant="outline" className="animate-scale-in">
                    {deliverable}
                    <X className="h-3 w-3 ml-1 cursor-pointer hover:bg-destructive/20 rounded-full" onClick={() => removeDeliverable(index)} />
                  </Badge>)}
                </div>
              </div>

              {/* Quick Add Suggestions */}
              <div>
                <p className="text-sm font-medium mb-2">Popular Skills for Web Projects:</p>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Node.js', 'Python', 'UI/UX Design', 'WordPress', 'Shopify', 'Mobile App'].map(suggestion => <Button key={suggestion} variant="outline" size="sm" onClick={() => {
                    if (!formData.skills.includes(suggestion)) {
                      updateField('skills', [...formData.skills, suggestion]);
                    }
                  }} disabled={formData.skills.includes(suggestion)}>
                    + {suggestion}
                  </Button>)}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Common Deliverables:</p>
                <div className="flex flex-wrap gap-2">
                  {['Source Code', 'Design Files', 'Documentation', 'Testing', 'Deployment', 'Training'].map(suggestion => <Button key={suggestion} variant="outline" size="sm" onClick={() => {
                    if (!formData.deliverables.includes(suggestion)) {
                      updateField('deliverables', [...formData.deliverables, suggestion]);
                    }
                  }} disabled={formData.deliverables.includes(suggestion)}>
                    + {suggestion}
                  </Button>)}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Assessment Quiz</span>
                <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="quiz-enabled"
                  checked={formData.quiz.enabled}
                  onCheckedChange={(checked) =>
                    updateField('quiz', { ...formData.quiz, enabled: Boolean(checked) })
                  }
                />
                <label htmlFor="quiz-enabled" className="text-sm font-medium">
                  Enable assessment quiz for applicants
                </label>
              </div>

              {formData.quiz.enabled && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="quiz-mandatory"
                        checked={formData.quiz.mandatory}
                        onCheckedChange={(checked) =>
                          updateField('quiz', { ...formData.quiz, mandatory: Boolean(checked) })
                        }
                      />
                      <label htmlFor="quiz-mandatory" className="text-sm font-medium">
                        Make quiz mandatory for all applicants
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Passing Score (%)
                        </label>
                        <Select
                          value={String(formData.quiz.passingScore)}
                          onValueChange={(value) =>
                            updateField('quiz', { ...formData.quiz, passingScore: Number(value) })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="60">60%</SelectItem>
                            <SelectItem value="70">70%</SelectItem>
                            <SelectItem value="80">80%</SelectItem>
                            <SelectItem value="90">90%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Time Limit (minutes)
                        </label>
                        <Select
                          value={String(formData.quiz.timeLimit)}
                          onValueChange={(value) =>
                            updateField('quiz', { ...formData.quiz, timeLimit: Number(value) })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <QuizBuilder
                      questions={formData.quiz.questions}
                      onChange={(questions) =>
                        updateField('quiz', { ...formData.quiz, questions })
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-primary" />
                  Gig Preview
                </span>
                <Badge variant="outline" className="border-primary text-primary">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready to Post
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Gig Preview */}
              <div className="border rounded-lg p-6 bg-card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{previewData.title || "Gig Title"}</h3>
                      <Badge variant="outline" className="border-verified text-verified">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified Client
                      </Badge>
                      {formData.urgent && <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Urgent
                      </Badge>}
                    </div>
                    <p className="text-muted-foreground font-medium">{previewData.client}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {previewData.duration || "Duration not specified"}
                  </div>
                  <div className="flex items-center">

                    {previewData.budgetDisplay || "Budget not specified"}
                  </div>
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    {previewData.experienceLevel || "Any experience level"}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
                  {previewData.description || "Project description will appear here..."}
                </p>

                {formData.skills.length > 0 && <div className="mb-4">
                  <h4 className="font-semibold mb-2">Required Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>)}
                  </div>
                </div>}

                {formData.deliverables.length > 0 && <div>
                  <h4 className="font-semibold mb-2">Deliverables:</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.deliverables.map((deliverable, index) => <Badge key={index} variant="outline" className="text-xs">
                      {deliverable}
                    </Badge>)}
                  </div>
                </div>}
              </div>

              {/* Post Gig Actions */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <div className="text-sm text-muted-foreground">
                  <p>• Gig goes live immediately after posting</p>
                  <p>• Freelancers can start submitting proposals</p>
                  <p>• You'll receive notifications for new proposals</p>
                </div>

                <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="min-w-32">
                  {isSubmitting ? <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Posting...
                  </> : 'Post Gig'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </div>;
};
export default PostGig;