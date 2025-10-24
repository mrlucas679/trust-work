import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'job_seeker' | 'employer' | null>(null);

  const handleAuth = (role: 'job_seeker' | 'employer') => {
    // Mock authentication - in real app, this would handle actual auth
    localStorage.setItem('userRole', role);
    navigate('/setup');
  };

  if (selectedRole === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary mr-2" />
              <CardTitle className="text-2xl">TrustWork</CardTitle>
            </div>
            <CardDescription>Choose your role to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full p-6 h-auto flex flex-col items-center space-y-2"
              onClick={() => setSelectedRole('job_seeker')}
            >
              <User className="h-8 w-8 text-primary" />
              <div>
                <div className="font-semibold">Job Seeker</div>
                <div className="text-sm text-muted-foreground">Find verified jobs and gigs</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full p-6 h-auto flex flex-col items-center space-y-2"
              onClick={() => setSelectedRole('employer')}
            >
              <Building className="h-8 w-8 text-primary" />
              <div>
                <div className="font-semibold">Employer</div>
                <div className="text-sm text-muted-foreground">Post jobs and find talent</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="text-2xl">TrustWork</CardTitle>
          </div>
          <CardDescription>
            {selectedRole === 'job_seeker' ? 'Job Seeker' : 'Employer'} Account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" />
              </div>
              <Button 
                className="w-full" 
                onClick={() => handleAuth(selectedRole)}
              >
                Sign In
              </Button>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Create a password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" placeholder="Confirm your password" />
              </div>
              <Button 
                className="w-full" 
                onClick={() => handleAuth(selectedRole)}
              >
                Create Account
              </Button>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedRole(null)}
              className="text-sm"
            >
              ← Back to role selection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;