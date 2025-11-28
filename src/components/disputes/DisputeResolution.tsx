/**
 * @fileoverview Dispute resolution component (Admin view)
 * Allows admins to review and resolve disputes
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Gavel,
  Scale,
  User,
  Users,
  Handshake,
  AlertCircle,
  Loader2,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResolveDispute } from '@/hooks/use-gig-lifecycle';
import type { IDispute, ResolutionDecision } from '@/types/gig';

interface DisputeResolutionProps {
  dispute: IDispute;
  escrowAmount?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ResolutionOption {
  value: ResolutionDecision;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  showPaymentAdjustment: boolean;
}

const RESOLUTION_OPTIONS: ResolutionOption[] = [
  {
    value: 'favor_freelancer',
    label: 'In Favor of Freelancer',
    description: 'Release full payment to the freelancer',
    icon: User,
    color: 'text-green-600 border-green-500/20 bg-green-500/10',
    showPaymentAdjustment: false,
  },
  {
    value: 'favor_client',
    label: 'In Favor of Client',
    description: 'Issue full refund to the client',
    icon: Users,
    color: 'text-blue-600 border-blue-500/20 bg-blue-500/10',
    showPaymentAdjustment: false,
  },
  {
    value: 'split_payment',
    label: 'Split Payment',
    description: 'Divide the payment between both parties',
    icon: Scale,
    color: 'text-purple-600 border-purple-500/20 bg-purple-500/10',
    showPaymentAdjustment: true,
  },
  {
    value: 'mutual_agreement',
    label: 'Mutual Agreement',
    description: 'Both parties have agreed to a resolution',
    icon: Handshake,
    color: 'text-teal-600 border-teal-500/20 bg-teal-500/10',
    showPaymentAdjustment: true,
  },
  {
    value: 'no_fault',
    label: 'No Fault Found',
    description: 'Neither party found at fault, refund to client',
    icon: AlertCircle,
    color: 'text-gray-600 border-gray-500/20 bg-gray-500/10',
    showPaymentAdjustment: false,
  },
];

export function DisputeResolution({
  dispute,
  escrowAmount = 0,
  onSuccess,
  onCancel,
}: DisputeResolutionProps) {
  const [decision, setDecision] = useState<ResolutionDecision | ''>('');
  const [summary, setSummary] = useState('');
  const [freelancerAmount, setFreelancerAmount] = useState<number>(Math.round(escrowAmount / 2));

  const resolveDispute = useResolveDispute();

  const selectedOption = RESOLUTION_OPTIONS.find((o) => o.value === decision);
  const clientAmount = escrowAmount - freelancerAmount;

  const handleResolve = async () => {
    if (!decision) return;

    let paymentAdjustment: number | undefined;

    // Determine payment adjustment based on decision
    switch (decision) {
      case 'favor_freelancer':
        paymentAdjustment = escrowAmount;
        break;
      case 'favor_client':
      case 'no_fault':
        paymentAdjustment = 0;
        break;
      case 'split_payment':
      case 'mutual_agreement':
        paymentAdjustment = freelancerAmount;
        break;
    }

    await resolveDispute.mutateAsync({
      disputeId: dispute.id,
      decision,
      summary,
      paymentAdjustment,
    });

    onSuccess?.();
  };

  const isSubmitting = resolveDispute.isPending;
  const canSubmit = decision && summary.length >= 20 && !isSubmitting;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Gavel className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Resolve Dispute</CardTitle>
            <CardDescription>
              Review the case and make a final decision
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Dispute Summary */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Dispute</span>
            <Badge variant="outline">#{dispute.id.slice(0, 8)}</Badge>
          </div>
          <p className="font-medium">{dispute.title}</p>
          <Separator />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Initiator:</span>
              <p className="font-medium">{dispute.initiator?.full_name || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Respondent:</span>
              <p className="font-medium">{dispute.respondent?.full_name || 'Unknown'}</p>
            </div>
          </div>
          {escrowAmount > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Escrow Amount</span>
                </div>
                <span className="font-semibold text-lg">R{escrowAmount.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* Resolution Decision */}
        <div className="space-y-3">
          <Label>Resolution Decision</Label>
          <RadioGroup
            value={decision}
            onValueChange={(value) => setDecision(value as ResolutionDecision)}
          >
            <div className="grid gap-3">
              {RESOLUTION_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <label
                    key={option.value}
                    htmlFor={option.value}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all',
                      decision === option.value
                        ? option.color
                        : 'hover:border-muted-foreground/50'
                    )}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{option.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        {/* Payment Split (for split/mutual decisions) */}
        {selectedOption?.showPaymentAdjustment && escrowAmount > 0 && (
          <div className="space-y-4">
            <Separator />
            <Label>Payment Distribution</Label>
            <div className="rounded-lg border p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Freelancer receives:</span>
                  <span className="font-medium text-green-600">
                    R{freelancerAmount.toLocaleString()}
                  </span>
                </div>
                <Input
                  type="range"
                  min={0}
                  max={escrowAmount}
                  value={freelancerAmount}
                  onChange={(e) => setFreelancerAmount(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <p className="text-muted-foreground">Freelancer</p>
                  <p className="font-semibold text-green-600">
                    R{freelancerAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((freelancerAmount / escrowAmount) * 100)}%
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-semibold text-blue-600">
                    R{clientAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((clientAmount / escrowAmount) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Resolution Summary */}
        <div className="space-y-2">
          <Label htmlFor="summary">
            Resolution Summary <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="summary"
            placeholder="Provide a detailed explanation of your decision and the reasoning behind it. This will be shared with both parties..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={5}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground">
            {summary.length}/1000 characters (minimum 20)
          </p>
        </div>

        {/* Preview */}
        {decision && (
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Resolution Preview
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Decision:</span>
                <span className="font-medium">{selectedOption?.label}</span>
              </div>
              {escrowAmount > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Freelancer receives:</span>
                    <span className="font-medium text-green-600">
                      R
                      {decision === 'favor_freelancer'
                        ? escrowAmount.toLocaleString()
                        : decision === 'favor_client' || decision === 'no_fault'
                        ? '0'
                        : freelancerAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client receives:</span>
                    <span className="font-medium text-blue-600">
                      R
                      {decision === 'favor_client' || decision === 'no_fault'
                        ? escrowAmount.toLocaleString()
                        : decision === 'favor_freelancer'
                        ? '0'
                        : clientAmount.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={!canSubmit} className="flex-1">
              <Gavel className="h-4 w-4 mr-2" />
              Resolve Dispute
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Resolution</AlertDialogTitle>
              <AlertDialogDescription>
                This action will finalize the dispute with your decision. Both parties will be
                notified and any payment adjustments will be processed immediately. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResolve} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Resolution'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

export default DisputeResolution;
