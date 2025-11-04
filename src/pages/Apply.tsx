import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Shield, Send } from "lucide-react";
import { mockJobs } from "@/data/mockData";

const Apply = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = mockJobs.find(j => j.id === id);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  const handleApply = () => {
    // Check if the job requires a skill test
    if (job?.skillTestConfig?.enabled) {
      // Store draft application data (in real app, save to backend)
      const draftApplication = {
        jobId: id,
        cvFile: cvFile?.name,
        coverLetter,
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem(`draft-application-${id}`, JSON.stringify(draftApplication));

      // Navigate to skill test
      navigate(`/apply/${id}/skill-test`);
    } else {
      // Submit application directly
      navigate('/applications');
    }
  };

  if (!job) return <div>Job not found</div>;

  return (
    <div className="bg-muted/20 p-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Safe Apply - {job.title}</CardTitle>
            </div>
            <p className="text-muted-foreground">Your information is protected and encrypted</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Upload CV</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="cv-upload"
                />
                <Label htmlFor="cv-upload" className="cursor-pointer">
                  <Button variant="outline" type="button" asChild>
                    <span>{cvFile ? cvFile.name : "Choose File"}</span>
                  </Button>
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Cover Message</Label>
              <Textarea
                id="message"
                placeholder="Tell the employer why you're perfect for this role..."
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleApply}
              disabled={!cvFile || !coverLetter.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              {job?.skillTestConfig?.enabled ? "Continue to Skill Test" : "Send Application"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Apply;