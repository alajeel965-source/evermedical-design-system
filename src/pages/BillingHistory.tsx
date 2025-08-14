import { useState } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { Download, CreditCard, Calendar, RefreshCw, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { updatePageSEO } from "@/lib/seo";
import { useEffect } from "react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: "paid" | "refunded" | "pending" | "failed";
  invoiceUrl?: string;
}

interface SubscriptionInfo {
  currentPlan: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "annual";
  nextRenewal: string;
  paymentMethod: string;
  status: "active" | "cancelled" | "past_due";
}

export default function BillingHistory() {
  const { language } = useI18n();

  // Mock data - replace with actual API calls
  const [subscriptionInfo] = useState<SubscriptionInfo>({
    currentPlan: "Premium",
    price: 29.99,
    currency: "USD",
    billingCycle: "monthly",
    nextRenewal: "2024-03-15",
    paymentMethod: "**** **** **** 4242",
    status: "active"
  });

  const [transactions] = useState<Transaction[]>([
    {
      id: "inv_001",
      date: "2024-02-15",
      description: "Premium Plan - Monthly Subscription",
      amount: 29.99,
      currency: "USD",
      status: "paid",
      invoiceUrl: "/invoices/inv_001.pdf"
    },
    {
      id: "inv_002",
      date: "2024-01-15",
      description: "Premium Plan - Monthly Subscription",
      amount: 29.99,
      currency: "USD",
      status: "paid",
      invoiceUrl: "/invoices/inv_002.pdf"
    },
    {
      id: "inv_003",
      date: "2023-12-15",
      description: "Basic Plan - Monthly Subscription",
      amount: 9.99,
      currency: "USD",
      status: "paid",
      invoiceUrl: "/invoices/inv_003.pdf"
    },
    {
      id: "ref_001",
      date: "2023-11-20",
      description: "Refund - Premium Plan Upgrade",
      amount: -19.99,
      currency: "USD",
      status: "refunded"
    }
  ]);

  useEffect(() => {
    updatePageSEO({
      title: "Billing History - EverMedical",
      description: "View your subscription billing history, download invoices, and manage your payment information.",
      keywords: ["billing history", "subscription invoices", "payment history", "medical platform subscription"]
    });
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    const isNegative = amount < 0;
    const absoluteAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: currency
    }).format(absoluteAmount);
    
    return isNegative ? `-${formatted}` : formatted;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "default",
      refunded: "secondary",
      pending: "outline",
      failed: "destructive",
      active: "default",
      cancelled: "destructive",
      past_due: "destructive"
    } as const;
    
    const colors = {
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      refunded: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      past_due: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  const handleDownloadInvoice = (transaction: Transaction) => {
    // Mock download functionality
    console.log(`Downloading invoice for ${transaction.id}`);
  };

  const handleUpdatePaymentMethod = () => {
    console.log("Opening payment method update modal");
  };

  const handleChangePlan = () => {
    console.log("Redirecting to pricing page");
  };

  const handleManageSubscription = () => {
    console.log("Opening subscription management");
  };

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-heading text-3xl font-bold mb-2">Billing History</h1>
          <p className="text-body">Manage your subscription and view billing information</p>
        </div>

        {/* Subscription Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Current Plan</div>
                <div className="font-semibold text-heading flex items-center gap-2">
                  {subscriptionInfo.currentPlan}
                  {getStatusBadge(subscriptionInfo.status)}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Price</div>
                <div className="font-semibold text-heading">
                  {formatAmount(subscriptionInfo.price, subscriptionInfo.currency)}
                  <span className="text-sm text-muted-foreground ml-1">
                    /{subscriptionInfo.billingCycle}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Next Renewal</div>
                <div className="font-semibold text-heading flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(subscriptionInfo.nextRenewal)}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Payment Method</div>
                <div className="font-semibold text-heading">
                  {subscriptionInfo.paymentMethod}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
              <Button onClick={handleUpdatePaymentMethod}>
                <CreditCard className="w-4 h-4 mr-2" />
                Update Payment Method
              </Button>
              <Button variant="outline" onClick={handleChangePlan}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Change Plan
              </Button>
              <Button variant="outline" onClick={handleManageSubscription}>
                Manage Subscription
              </Button>
              {subscriptionInfo.status === "active" && (
                <Button variant="destructive" className="ml-auto">
                  <X className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        {transactions.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <div className="font-medium text-heading">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">Invoice #{transaction.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-semibold ${
                            transaction.amount < 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-heading'
                          }`}>
                            {formatAmount(transaction.amount, transaction.currency)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          {transaction.invoiceUrl && transaction.status === "paid" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadInvoice(transaction)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download Invoice
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={<CreditCard />}
            title="No billing history available"
            description="Your billing history will appear here once you have active transactions."
            action={
              <Button onClick={handleChangePlan}>
                View Pricing Plans
              </Button>
            }
          />
        )}
      </div>
    </AppShell>
  );
}