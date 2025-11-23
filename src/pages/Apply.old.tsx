import { useParams, useNavigate } from "react-router-dom";
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

  const handleApply = () => {
    // Simulate application submission
    // In real app, this would submit the application to backend
    navigate('/applications');
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
                <Button variant="outline">Choose File</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Cover Message</Label>
              <Textarea
                id="message"
                placeholder="Tell the employer why you're perfect for this role..."
                rows={4}
              />
            </div>

            <Button className="w-full" onClick={handleApply}>
              <Send className="h-4 w-4 mr-2" />
              Send Application
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Apply;