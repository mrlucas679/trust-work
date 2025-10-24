import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Setup = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') as 'job_seeker' | 'employer';
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };
  const handleComplete = () => {
    // Mock profile setup completion
    localStorage.setItem('profileSetup', 'complete');
    if (userRole === 'job_seeker') {
      navigate('/dashboard/job-seeker');
    } else {
      navigate('/dashboard/employer');
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {userRole === 'job_seeker' ?
        // Job Seeker Setup
        <>
              

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Input placeholder="Add a skill" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyPress={e => e.key === 'Enter' && addSkill()} />
                  <Button onClick={addSkill} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => <Badge key={skill} variant="secondary" className="pr-1">
                      {skill}
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => removeSkill(skill)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>)}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload CV</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                  <Button variant="outline" size="sm">Choose File</Button>
                </div>
              </div>
            </> :
        // Employer Setup
        <>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" placeholder="Enter company name" defaultValue="TechCorp Solutions" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg">Registration Number</Label>
                <Input id="reg" placeholder="Company registration number" defaultValue="REG123456789" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://yourcompany.com" defaultValue="https://techcorp.co.za" />
              </div>

              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Upload your company logo</p>
                  <Button variant="outline" size="sm">Choose File</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea id="description" placeholder="Tell us about your company..." defaultValue="We are a leading technology solutions provider in South Africa, specializing in innovative software development and digital transformation services." />
              </div>
            </>}

          <Button className="w-full" onClick={handleComplete}>
            Complete Setup
          </Button>
        </CardContent>
      </Card>
    </div>;
};
export default Setup;