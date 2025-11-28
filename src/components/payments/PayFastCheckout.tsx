/**
 * @fileoverview PayFast checkout component
 * Handles PayFast payment initiation and redirect
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Building2,
  Smartphone,
  Loader2,
  Shield,
  CheckCircle,
  AlertTriangle,
  Lock,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreatePayFastPayment } from '@/hooks/use-gig-lifecycle';
import {
  PLATFORM_FEE_PERCENTAGE,
  PAYFAST_EFT_FEE_PERCENTAGE,
  PAYFAST_CARD_FEE_PERCENTAGE,
} from '@/types/gig';
import type { IGig, IFreelancerProfile } from '@/types/gig';

interface PayFastCheckoutProps {
  gig: IGig;
  freelancer: IFreelancerProfile;
  applicationId: string;
  amount: number;
  buyerEmail: string;
  buyerFirstName?: string;
  buyerLastName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type PaymentMethod = 'eft' | 'cc';

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ElementType;
  feePercentage: number;
  processingTime: string;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'eft',
    name: 'Instant EFT',
    description: 'Pay directly from your bank account',
    icon: Building2,
    feePercentage: PAYFAST_EFT_FEE_PERCENTAGE,
    processingTime: 'Instant',
  },
  {
    id: 'cc',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, or American Express',
    icon: CreditCard,
    feePercentage: PAYFAST_CARD_FEE_PERCENTAGE,
    processingTime: 'Instant',
  },
];

export function PayFastCheckout({
  gig,
  freelancer,
  applicationId,
  amount,
  buyerEmail,
  buyerFirstName,
  buyerLastName,
  onSuccess,
  onCancel,
}: PayFastCheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('eft');
  const [isAgreed, setIsAgreed] = useState(false);

  const createPayment = useCreatePayFastPayment();

  const selectedPaymentMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethod)!;

  // Calculate fees
  const paymentFee = (amount * selectedPaymentMethod.feePercentage) / 100;
  const platformFee = (amount * PLATFORM_FEE_PERCENTAGE) / 100;
  const totalAmount = amount + paymentFee;
  const freelancerReceives = amount - platformFee;

  const handlePayment = async () => {
    const paymentData = await createPayment.mutateAsync({
      gigId: gig.id,
      freelancerId: freelancer.id,
      applicationId,
      amount: totalAmount,
      itemName: gig.title,
      itemDescription: `Payment for gig: ${gig.title}`,
      buyerEmail,
      buyerFirstName,
      buyerLastName,
    });

    // The mutation will redirect to PayFast
    // This should trigger a redirect, handled in the API
    if (paymentData?.redirectUrl) {
      window.location.href = paymentData.redirectUrl;
    }

    onSuccess?.();
  };

  const isProcessing = createPayment.isPending;

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-2">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Secure Checkout</CardTitle>
        <CardDescription>Complete your payment via PayFast</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="rounded-lg border p-4 space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Order Summary
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gig</span>
              <span className="font-medium truncate max-w-[200px]">{gig.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Freelancer</span>
              <span>{freelancer.full_name}</span>
            </div>
          </div>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gig Amount</span>
              <span>R{amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Payment Fee ({selectedPaymentMethod.feePercentage}%)
              </span>
              <span>R{paymentFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span className="text-primary">R{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <Label>Payment Method</Label>
          <RadioGroup
            value={selectedMethod}
            onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <label
                  key={method.id}
                  htmlFor={method.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
                    selectedMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/50'
                  )}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <div className="p-2 rounded-md bg-muted">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{method.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {method.feePercentage}% fee
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  <Badge variant="secondary">{method.processingTime}</Badge>
                </label>
              );
            })}
          </RadioGroup>
        </div>

        {/* Escrow Info */}
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-green-600 dark:text-green-400">
                Protected by Escrow
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Your payment of <strong>R{amount.toLocaleString()}</strong> will be held securely 
                in escrow until you approve the completed work.
              </p>
            </div>
          </div>
        </div>

        {/* Freelancer Receives */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Freelancer will receive</span>
            <div className="text-right">
              <span className="font-semibold">R{freelancerReceives.toFixed(2)}</span>
              <p className="text-xs text-muted-foreground">
                After {PLATFORM_FEE_PERCENTAGE}% platform fee
              </p>
            </div>
          </div>
        </div>

        {/* Terms Agreement */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-muted-foreground">
            I agree to the{' '}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            . I understand that my payment will be held in escrow until I approve the completed work.
          </span>
        </label>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          className="w-full"
          size="lg"
          onClick={handlePayment}
          disabled={!isAgreed || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Pay R{totalAmount.toFixed(2)}
            </>
          )}
        </Button>

        <Button variant="outline" className="w-full" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3" />
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Secure Escrow</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default PayFastCheckout;
