/**
 * @fileoverview Two-Factor Authentication Setup Component
 * 
 * Provides a step-by-step wizard for setting up 2FA using TOTP.
 * Displays QR code for authenticator app setup and verifies the setup.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { 
  Shield, 
  Smartphone, 
  QrCode, 
  CheckCircle2, 
  Copy, 
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useTwoFactor, EnrollmentData } from '@/hooks/use-two-factor';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type SetupStep = 'intro' | 'scan' | 'verify' | 'success';

export function TwoFactorSetup({ open, onOpenChange, onSuccess }: TwoFactorSetupProps) {
  const { enroll, verify, error: hookError } = useTwoFactor();
  const { toast } = useToast();
  const [step, setStep] = useState<SetupStep>('intro');
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSetup = async () => {
    setLoading(true);
    setError(null);
    
    const data = await enroll();
    
    if (data) {
      setEnrollmentData(data);
      setStep('scan');
    } else {
      setError(hookError || 'Failed to start 2FA setup');
    }
    
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!enrollmentData || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    const success = await verify(enrollmentData.id, verificationCode);

    if (success) {
      setStep('success');
      toast({
        title: "2FA Enabled",
        description: "Your account is now protected with two-factor authentication.",
      });
    } else {
      setError(hookError || 'Invalid verification code. Please try again.');
    }

    setLoading(false);
  };

  const handleCopySecret = () => {
    if (enrollmentData?.totp.secret) {
      navigator.clipboard.writeText(enrollmentData.totp.secret);
      toast({
        title: "Copied",
        description: "Secret key copied to clipboard",
      });
    }
  };

  const handleClose = () => {
    setStep('intro');
    setEnrollmentData(null);
    setVerificationCode('');
    setError(null);
    onOpenChange(false);
    
    if (step === 'success') {
      onSuccess?.();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'intro':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Enable Two-Factor Authentication
              </DialogTitle>
              <DialogDescription>
                Add an extra layer of security to your account by requiring a verification code in addition to your password.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Smartphone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">What you'll need</p>
                  <p className="text-sm text-muted-foreground">
                    An authenticator app like Google Authenticator, Authy, or 1Password installed on your phone.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <QrCode className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">How it works</p>
                  <p className="text-sm text-muted-foreground">
                    You'll scan a QR code to link your account, then enter a 6-digit code from the app to verify.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleStartSetup} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>
            </DialogFooter>
          </>
        );

      case 'scan':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
              <DialogDescription>
                Open your authenticator app and scan this QR code to add TrustWork.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {enrollmentData?.totp.qr_code && (
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg">
                    <img 
                      src={enrollmentData.totp.qr_code} 
                      alt="2FA QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Can't scan the QR code? Enter this secret key manually:
                </p>
                <div className="flex items-center justify-center gap-2">
                  <code className="px-3 py-2 bg-muted rounded text-sm font-mono">
                    {enrollmentData?.totp.secret}
                  </code>
                  <Button variant="ghost" size="icon" onClick={handleCopySecret}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('intro')}>
                Back
              </Button>
              <Button onClick={() => setStep('verify')}>
                Continue
              </Button>
            </DialogFooter>
          </>
        );

      case 'verify':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Verify Setup</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code from your authenticator app to complete setup.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                The code refreshes every 30 seconds
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('scan')}>
                Back
              </Button>
              <Button 
                onClick={handleVerify} 
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Enable'
                )}
              </Button>
            </DialogFooter>
          </>
        );

      case 'success':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                2FA Enabled Successfully
              </DialogTitle>
              <DialogDescription>
                Your account is now protected with two-factor authentication.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  From now on, you'll need to enter a code from your authenticator app when signing in.
                </AlertDescription>
              </Alert>

              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="font-medium text-amber-800 mb-2">Important</p>
                <p className="text-sm text-amber-700">
                  Make sure you have access to your authenticator app. If you lose access, you'll need to contact support to recover your account.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
