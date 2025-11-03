import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/providers/SupabaseProvider";
import { SocialAuth } from "@/components/auth/SocialAuth";


import { useEffect } from "react";

const Auth = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/");
  }, [navigate]);
  return null;
};

export default Auth;