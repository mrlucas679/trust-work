/**
 * BankAccountForm.tsx
 * 
 * Form for freelancers to add/edit their South African bank account details.
 * Supports major SA banks with account verification flow.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  CreditCard,
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Info,
  Lock,
  Trash2,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { IFreelancerBankAccount, SABank } from '@/types/gig';

// South African Banks List
const SA_BANKS: { code: SABank; name: string; branchCode: string }[] = [
  { code: 'ABSA', name: 'ABSA Bank', branchCode: '632005' },
  { code: 'FNB', name: 'First National Bank', branchCode: '250655' },
  { code: 'Standard Bank', name: 'Standard Bank', branchCode: '051001' },
  { code: 'Nedbank', name: 'Nedbank', branchCode: '198765' },
  { code: 'Capitec', name: 'Capitec Bank', branchCode: '470010' },
  { code: 'Investec', name: 'Investec Bank', branchCode: '580105' },
  { code: 'African Bank', name: 'African Bank', branchCode: '430000' },
  { code: 'TymeBank', name: 'TymeBank', branchCode: '678910' },
  { code: 'Discovery Bank', name: 'Discovery Bank', branchCode: '679000' },
  { code: 'Bank Zero', name: 'Bank Zero', branchCode: '888000' },
];

const ACCOUNT_TYPES = [
  { value: 'cheque', label: 'Cheque Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'transmission', label: 'Transmission Account' },
];

// Validation Schema
const bankAccountSchema = z.object({
  bank_name: z.string().min(1, 'Please select a bank'),
  account_holder_name: z.string().min(2, 'Account holder name is required'),
  account_number: z
    .string()
    .min(8, 'Account number must be at least 8 digits')
    .max(16, 'Account number must not exceed 16 digits')
    .regex(/^\d+$/, 'Account number must contain only digits'),
  account_type: z.string().min(1, 'Please select an account type'),
  branch_code: z.string().min(6, 'Branch code must be 6 digits').max(6, 'Branch code must be 6 digits'),
  confirm_account_number: z.string(),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms to continue',
  }),
}).refine(data => data.account_number === data.confirm_account_number, {
  message: 'Account numbers do not match',
  path: ['confirm_account_number'],
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface BankAccountFormProps {
  existingAccount?: IFreelancerBankAccount | null;
  onSubmit: (data: Omit<IFreelancerBankAccount, 'id' | 'freelancer_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function BankAccountForm({
  existingAccount,
  onSubmit,
  onDelete,
  isLoading = false,
  className,
}: BankAccountFormProps) {
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showConfirmNumber, setShowConfirmNumber] = useState(false);

  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bank_name: existingAccount?.bank_name || '',
      account_holder_name: existingAccount?.account_holder_name || '',
      account_number: existingAccount?.account_number || '',
      confirm_account_number: existingAccount?.account_number || '',
      account_type: existingAccount?.account_type || '',
      branch_code: existingAccount?.branch_code || '',
      terms_accepted: !!existingAccount,
    },
  });

  const selectedBank = form.watch('bank_name');

  // Auto-fill branch code when bank is selected
  const handleBankChange = (bankCode: string) => {
    const bank = SA_BANKS.find(b => b.code === bankCode);
    if (bank) {
      form.setValue('bank_name', bankCode);
      form.setValue('branch_code', bank.branchCode);
    }
  };

  const handleFormSubmit = async (data: BankAccountFormData) => {
    const { confirm_account_number, terms_accepted, ...accountData } = data;
    await onSubmit({
      ...accountData,
      bank_name: accountData.bank_name as SABank,
      is_verified: false,
      is_primary: true,
    });
  };

  const maskAccountNumber = (accountNumber: string): string => {
    if (accountNumber.length <= 4) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>
              {existingAccount ? 'Bank Account Details' : 'Add Bank Account'}
            </CardTitle>
          </div>
          {existingAccount?.is_verified && (
            <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
        <CardDescription>
          Add your South African bank account to receive payouts for completed gigs.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
          <CardContent className="space-y-6">
            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your banking information is encrypted and stored securely. We never share your 
                details with third parties.
              </AlertDescription>
            </Alert>

            {/* Existing Account Display */}
            {existingAccount && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Current Account</h4>
                  <Badge variant="outline">{existingAccount.bank_name}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Account Holder</p>
                    <p className="font-medium">{existingAccount.account_holder_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Account Number</p>
                    <p className="font-mono">{maskAccountNumber(existingAccount.account_number)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bank Selection */}
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={handleBankChange}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your bank" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SA_BANKS.map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          <span className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {bank.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Holder Name */}
            <FormField
              control={form.control}
              name="account_holder_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Holder Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="Name as it appears on your bank account"
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Must match the name registered with your bank
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Type */}
            <FormField
              control={form.control}
              name="account_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Number */}
            <FormField
              control={form.control}
              name="account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showAccountNumber ? 'text' : 'password'}
                        placeholder="Enter your account number"
                        className="pl-10 pr-10 font-mono"
                        maxLength={16}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowAccountNumber(!showAccountNumber)}
                      >
                        {showAccountNumber ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Account Number */}
            <FormField
              control={form.control}
              name="confirm_account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Account Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type={showConfirmNumber ? 'text' : 'password'}
                        placeholder="Re-enter your account number"
                        className="pl-10 pr-10 font-mono"
                        maxLength={16}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowConfirmNumber(!showConfirmNumber)}
                      >
                        {showConfirmNumber ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Branch Code */}
            <FormField
              control={form.control}
              name="branch_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="6-digit branch code"
                      className="font-mono"
                      maxLength={6}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    {selectedBank && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Auto-filled for {SA_BANKS.find(b => b.code === selectedBank)?.name}
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms and Conditions */}
            <FormField
              control={form.control}
              name="terms_accepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      I confirm these banking details are correct
                    </FormLabel>
                    <FormDescription>
                      I understand that incorrect details may result in failed payouts and delays.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Verification Info */}
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-200 p-4">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Account Verification</p>
                <p className="text-blue-700">
                  We'll send a small test deposit (R0.01) to verify your account. 
                  This usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6">
            {/* Delete Button */}
            {existingAccount && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" type="button" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Bank Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove your bank account details. You won't be able to receive 
                      payouts until you add a new account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={onDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Remove Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className={cn(!existingAccount && 'w-full')}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {existingAccount ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  {existingAccount ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Update Account
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Bank Account
                    </>
                  )}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default BankAccountForm;
