'use client'
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, ChevronsUpDown } from "lucide-react";

interface Payment {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: "paid" | "pending" | "failed";
  invoice: string;
}

const Payments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Payment;
    direction: 'ascending' | 'descending';
  }>({ key: 'date', direction: 'descending' });
  
  useEffect(() => {
    // Simulate API call to fetch payment history
    const fetchPayments = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1800)); // Simulate network delay
        
        // Mock data
        setPayments([
          {
            id: "pay-001",
            date: "2024-05-15",
            amount: 99.00,
            description: "Professional Plan - Monthly Subscription",
            status: "paid",
            invoice: "INV-001"
          },
          {
            id: "pay-002",
            date: "2024-04-15",
            amount: 99.00,
            description: "Professional Plan - Monthly Subscription",
            status: "paid",
            invoice: "INV-002"
          },
          {
            id: "pay-003",
            date: "2024-03-15",
            amount: 99.00,
            description: "Professional Plan - Monthly Subscription",
            status: "paid",
            invoice: "INV-003"
          },
          {
            id: "pay-004",
            date: "2024-02-15",
            amount: 49.00,
            description: "Basic Plan - Monthly Subscription",
            status: "paid",
            invoice: "INV-004"
          },
          {
            id: "pay-005",
            date: "2024-01-15",
            amount: 49.00,
            description: "Basic Plan - Monthly Subscription",
            status: "paid",
            invoice: "INV-005"
          },
          {
            id: "pay-006",
            date: "2024-06-15",
            amount: 99.00,
            description: "Professional Plan - Monthly Subscription",
            status: "pending",
            invoice: "INV-006"
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching payment history:", error);
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, []);
  
  const sortedPayments = [...payments].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      if (sortConfig.direction === 'ascending') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    } else if (sortConfig.key === 'amount') {
      if (sortConfig.direction === 'ascending') {
        return a.amount - b.amount;
      } else {
        return b.amount - a.amount;
      }
    } else {
      if (sortConfig.direction === 'ascending') {
        return a[sortConfig.key].localeCompare(b[sortConfig.key]);
      } else {
        return b[sortConfig.key].localeCompare(a[sortConfig.key]);
      }
    }
  });
  
  const requestSort = (key: keyof Payment) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-400/20 text-green-400";
      case "pending": return "bg-yellow-400/20 text-yellow-400";
      case "failed": return "bg-red-400/20 text-red-400";
      default: return "bg-white/10 text-white/60";
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <DashboardLayout title='Payment History'>
      {/* Payment Method Section */}
      <Card className="bg-white/5 border-white/10 p-5 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-primary/20 p-3 rounded-lg mr-4">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-white">Payment Method</h3>
              <p className="text-white/60 text-sm">Visa ending in 4242</p>
            </div>
          </div>
          
          <Button className="border-white/10 hover:bg-white/5">
            Update Payment Method
          </Button>
        </div>
      </Card>
      
      {/* Payment History */}
      <h2 className="text-xl font-semibold text-white mb-4">Payment History</h2>
      
      <Card className="bg-white/5 border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-8 w-32 bg-white/10" />
              <Skeleton className="h-8 w-24 bg-white/10" />
            </div>
            <Skeleton className="h-12 w-full bg-white/10" />
            <Skeleton className="h-12 w-full bg-white/10" />
            <Skeleton className="h-12 w-full bg-white/10" />
            <Skeleton className="h-12 w-full bg-white/10" />
            <Skeleton className="h-12 w-full bg-white/10" />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-white/5 border-white/10">
                <TableHead 
                  className="text-white/80 cursor-pointer"
                  onClick={() => requestSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    <ChevronsUpDown className="ml-1 h-4 w-4 text-white/40" />
                  </div>
                </TableHead>
                <TableHead 
                  className="text-white/80 cursor-pointer"
                  onClick={() => requestSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    <ChevronsUpDown className="ml-1 h-4 w-4 text-white/40" />
                  </div>
                </TableHead>
                <TableHead className="text-white/80 hidden md:table-cell">Description</TableHead>
                <TableHead className="text-white/80">Status</TableHead>
                <TableHead className="text-white/80 text-right">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPayments.map(payment => (
                <TableRow key={payment.id} className="hover:bg-white/5 border-white/10">
                  <TableCell className="text-white">
                    {formatDate(payment.date)}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell className="text-white/70 hidden md:table-cell">
                    {payment.description}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-white/60 hover:text-white">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default Payments;
