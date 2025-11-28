import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Building2, Shield, CheckCircle2, AlertCircle, Plus, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { bankAccountsApi, type BankAccount } from '@/lib/api/bank-accounts';
import AppLayout from '@/components/layout/AppLayout';

// South African banks
const SA_BANKS = [
  { code: '250655', name: 'ABSA Bank' },
  { code: '470010', name: 'Capitec Bank' },
  { code: '198765', name: 'Discovery Bank' },
  { code: '580105', name: 'First National Bank (FNB)' },
  { code: '632005', name: 'Investec Bank' },
  { code: '198765', name: 'Nedbank' },
  { code: '051001', name: 'Standard Bank' },
  { code: '678910', name: 'TymeBank' },
  { code: '431010', name: 'African Bank' },
  { code: '462005', name: 'Bidvest Bank' },
];

const ACCOUNT_TYPES = [
  { value: 'savings', label: 'Savings Account' },
  { value: 'checking', label: 'Cheque/Current Account' },
  { value: 'current', label: 'Current Account' },
];

interface BankAccountFormData {
  bank_name: string;
  branch_code: string;
  account_holder_name: string;
  account_number: string;
  account_type: 'savings' | 'checking' | 'current';
}

export default function BankAccountSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<BankAccountFormData>({
    bank_name: '',
    branch_code: '',
    account_holder_name: '',
    account_number: '',
    account_type: 'savings',
  });

  // Fetch existing bank accounts
  const { data: bankAccounts, isLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: bankAccountsApi.getMyBankAccounts,
  });

  // Add bank account mutation
  const addAccountMutation = useMutation({
    mutationFn: bankAccountsApi.addBankAccount,
    onSuccess: () => {
      toast({
        title: 'Bank account added',
        description: 'Your bank account has been added successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      setIsAddingNew(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add account',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Set primary mutation
  const setPrimaryMutation = useMutation({
    mutationFn: bankAccountsApi.setPrimaryAccount,
    onSuccess: () => {
      toast({
        title: 'Primary account updated',
        description: 'Your primary payout account has been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: bankAccountsApi.deleteBankAccount,
    onSuccess: () => {
      toast({
        title: 'Account removed',
        description: 'Bank account has been removed.',
      });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      bank_name: '',
      branch_code: '',
      account_holder_name: '',
      account_number: '',
      account_type: 'savings',
    });
  };

  const handleBankSelect = (bankName: string) => {
    const bank = SA_BANKS.find(b => b.name === bankName);
    setFormData(prev => ({
      ...prev,
      bank_name: bankName,
      branch_code: bank?.code || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.bank_name || !formData.account_number || !formData.account_holder_name) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.account_number.length < 7 || formData.account_number.length > 16) {
      toast({
        title: 'Invalid account number',
        description: 'Account number must be between 7 and 16 digits.',
        variant: 'destructive',
      });
      return;
    }

    addAccountMutation.mutate(formData);
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return '****' + accountNumber.slice(-4);
  };

  return (
    <AppLayout>
      <div className="container max-w-3xl py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Bank Account Setup</h1>
            <p className="text-muted-foreground">
              Manage your payout bank accounts
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Your information is secure</AlertTitle>
          <AlertDescription>
            Your bank details are encrypted and stored securely. We never share your 
            banking information with third parties. Payouts are processed via PayFast, 
            South Africa's trusted payment gateway.
          </AlertDescription>
        </Alert>

        {/* Existing Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Your Bank Accounts
            </CardTitle>
            <CardDescription>
              {bankAccounts?.length 
                ? `You have ${bankAccounts.length} bank account(s) linked`
                : 'No bank accounts linked yet'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading accounts...
              </div>
            ) : bankAccounts && bankAccounts.length > 0 ? (
              <div className="space-y-3">
                {bankAccounts.map((account: BankAccount) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{account.bank_name}</span>
                          {account.is_primary && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                          {account.is_verified ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {account.account_holder_name} • {maskAccountNumber(account.account_number)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!account.is_primary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryMutation.mutate(account.id)}
                          disabled={setPrimaryMutation.isPending}
                        >
                          Set Primary
                        </Button>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            disabled={account.is_primary}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Bank Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this bank account? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(account.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No bank accounts linked yet</p>
                <p className="text-sm">Add a bank account to receive payouts</p>
              </div>
            )}

            {!isAddingNew && (
              <Button
                onClick={() => setIsAddingNew(true)}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bank Account
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Add New Account Form */}
        {isAddingNew && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Bank Account</CardTitle>
              <CardDescription>
                Enter your South African bank account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">Bank *</Label>
                  <Select
                    value={formData.bank_name}
                    onValueChange={handleBankSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {SA_BANKS.map((bank) => (
                        <SelectItem key={bank.code} value={bank.name}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch_code">Branch Code *</Label>
                    <Input
                      id="branch_code"
                      value={formData.branch_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, branch_code: e.target.value }))}
                      placeholder="e.g., 250655"
                      maxLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account_type">Account Type *</Label>
                    <Select
                      value={formData.account_type}
                      onValueChange={(value: 'savings' | 'checking' | 'current') => 
                        setFormData(prev => ({ ...prev, account_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_holder">Account Holder Name *</Label>
                  <Input
                    id="account_holder"
                    value={formData.account_holder_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, account_holder_name: e.target.value }))}
                    placeholder="Enter name as it appears on your account"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must match the name on your bank account exactly
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number *</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData(prev => ({ ...prev, account_number: value }));
                    }}
                    placeholder="Enter your account number"
                    maxLength={16}
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please double-check your account details. Incorrect information may 
                    result in failed or delayed payouts.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingNew(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addAccountMutation.isPending}
                    className="flex-1"
                  >
                    {addAccountMutation.isPending ? 'Adding...' : 'Add Account'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Payout Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Payout Schedule</p>
                <p className="font-medium">Daily (Weekdays)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Processing Time</p>
                <p className="font-medium">1-3 Business Days</p>
              </div>
              <div>
                <p className="text-muted-foreground">Minimum Payout</p>
                <p className="font-medium">R50.00</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payout Fee</p>
                <p className="font-medium">0.5% (EFT)</p>
              </div>
            </div>
            
            <Alert variant="default">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Payouts are processed automatically when a client approves your work 
                and the escrow period ends. Funds are transferred to your primary bank account.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
