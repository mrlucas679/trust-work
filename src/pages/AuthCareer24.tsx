import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase, Building, Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/providers/SupabaseProvider";

/**
 * Career24-Style Authentication
 * Professional job board login/signup inspired by Career24, PNet, CareerJunction
 * 
 * Key Features:
 * - Clear job seeker vs employer distinction
 * - Professional, trustworthy design
 * - Simple initial signup (just email + password)
 * - Detailed profile completed in Setup.tsx
 * - South African-focused (but international-ready)
 */



const AuthCareer24 = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<null | 'job_seeker' | 'employer'>(null);

    if (selectedRole === 'job_seeker') {
        navigate('/dashboard/job-seeker');
        return null;
    }
    if (selectedRole === 'employer') {
        navigate('/dashboard/employer');
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-6">
                <h1 className="text-3xl font-bold text-primary mb-2">Bypass Authentication</h1>
                <p className="text-muted-foreground mb-6">Choose your role to enter the app for testing:</p>
                <div className="flex flex-col gap-4 w-full">
                    <button
                        className="w-full py-3 rounded-md bg-primary text-white font-semibold text-lg hover:bg-primary/90 transition"
                        onClick={() => setSelectedRole('job_seeker')}
                    >
                        Enter as Job Seeker
                    </button>
                    <button
                        className="w-full py-3 rounded-md bg-secondary text-primary font-semibold text-lg hover:bg-secondary/80 border border-primary transition"
                        onClick={() => setSelectedRole('employer')}
                    >
                        Enter as Employer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthCareer24;
