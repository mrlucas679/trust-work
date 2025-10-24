import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign,
  Wallet,
  Receipt,
  Lock,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  name: string;
  details: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  type: 'earning' | 'payment' | 'refund' | 'fee';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  method: string;
}

const PaymentSystem = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa **** 4532',
      details: 'Expires 12/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'bank',
      name: 'Standard Bank',
      details: 'Account ending in 1234',
      isDefault: false
    }
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'earning',
      amount: 2500,
      description: 'Website Design Gig - WebDev Agency',
      date: '2024-01-20',
      status: 'completed',
      method: 'Bank Transfer'
    },
    {
      id: '2',
      type: 'payment',
      amount: -150,
      description: 'Platform Fee',
      date: '2024-01-20',
      status: 'completed',
      method: 'Wallet Balance'
    },
    {
      id: '3',
      type: 'earning',
      amount: 1800,
      description: 'Mobile App Development - TechStart',
      date: '2024-01-15',
      status: 'pending',
      method: 'Bank Transfer'
    },
    {
      id: '4',
      type: 'refund',
      amount: 500,
      description: 'Project Cancellation Refund',
      date: '2024-01-10',
      status: 'completed',
      method: 'Original Payment Method'
    }
  ]);

  const walletBalance = 3250;
  const pendingEarnings = 1800;
  const totalEarnings = transactions
    .filter(t => t.type === 'earning' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleWithdraw = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Withdrawal Initiated",
        description: "Your funds will be transferred within 1-2 business days.",
      });
    }, 2000);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'payment': return <DollarSign className="h-4 w-4 text-primary" />;
      case 'refund': return <Receipt className="h-4 w-4 text-warning" />;
      case 'fee': return <CreditCard className="h-4 w-4 text-muted-foreground" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'failed': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Wallet Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="animate-scale-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">R{walletBalance.toLocaleString()}</p>
              </div>
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-scale-in" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Earnings</p>
                <p className="text-2xl font-bold">R{pendingEarnings.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-scale-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">R{totalEarnings.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-primary" />
            Payment Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="methods">Payment Methods</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Transactions */}
                <div>
                  <h3 className="font-semibold mb-3">Recent Activity</h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.amount > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                            {transaction.amount > 0 ? '+' : ''}R{Math.abs(transaction.amount)}
                          </p>
                          <Badge variant={transaction.status === 'completed' ? 'outline' : 'secondary'} className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Security */}
                <div>
                  <h3 className="font-semibold mb-3">Security Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                      <Shield className="h-5 w-5 text-success" />
                      <div>
                        <p className="font-medium text-sm">Secure Escrow</p>
                        <p className="text-xs text-muted-foreground">Funds held safely until work completion</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <Lock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Encrypted Transactions</p>
                        <p className="text-xs text-muted-foreground">Bank-level encryption for all payments</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium text-sm">Fraud Protection</p>
                        <p className="text-xs text-muted-foreground">24/7 monitoring and protection</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="methods" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Payment Methods</h3>
                <Button size="sm">Add New Method</Button>
              </div>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <Badge variant="outline">Default</Badge>
                      )}
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date} • {transaction.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.amount > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                        {transaction.amount > 0 ? '+' : ''}R{Math.abs(transaction.amount)}
                      </p>
                      <p className={`text-sm ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-4">
              <div className="max-w-md">
                <h3 className="font-semibold mb-4">Withdraw Funds</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Amount to Withdraw</label>
                    <Input
                      type="number"
                      placeholder="0"
                      max={walletBalance}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Available: R{walletBalance.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Withdraw To</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name} - {method.details}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Withdrawals typically take 1-2 business days to process.
                    </p>
                  </div>

                  <Button 
                    onClick={handleWithdraw}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Withdraw Funds'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSystem;