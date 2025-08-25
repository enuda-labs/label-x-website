'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/shared/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download, ChevronsUpDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { gePaymentHistory, PaymentHistory } from '@/services/apis/subscription'

const Payments = () => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PaymentHistory
    direction: 'ascending' | 'descending'
  }>({ key: 'created_at', direction: 'descending' })

  const { data: payments, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: gePaymentHistory,
  })

  if (!payments) return

  const sortedPayments = [...payments].sort((a, b) => {
    if (sortConfig.key === 'created_at') {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()

      if (sortConfig.direction === 'ascending') {
        return dateA - dateB
      } else {
        return dateB - dateA
      }
    } else if (sortConfig.key === 'amount') {
      if (sortConfig.direction === 'ascending') {
        return Number(a.amount) - Number(b.amount)
      } else {
        return Number(b.amount) - Number(a.amount)
      }
    } else {
      if (sortConfig.direction === 'ascending') {
        return String(a[sortConfig.key] ?? '').localeCompare(
          String(b[sortConfig.key] ?? '')
        )
      } else {
        return String(b[sortConfig.key] ?? '').localeCompare(
          String(a[sortConfig.key] ?? '')
        )
      }
    }
  })

  const requestSort = (key: keyof PaymentHistory) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-400/20 text-green-400'
      case 'pending':
        return 'bg-yellow-400/20 text-yellow-400'
      case 'failed':
        return 'bg-red-400/20 text-red-400'
      default:
        return 'bg-white/10 text-white/60'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <DashboardLayout title="Payment History">
      <Card className="overflow-hidden border-white/10 bg-white/5">
        {isLoading ? (
          <div className="space-y-4 p-4">
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
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead
                  className="cursor-pointer text-white/80"
                  onClick={() => requestSort('created_at')}
                >
                  <div className="flex items-center">
                    Date
                    <ChevronsUpDown className="ml-1 h-4 w-4 text-white/40" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-white/80"
                  onClick={() => requestSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    <ChevronsUpDown className="ml-1 h-4 w-4 text-white/40" />
                  </div>
                </TableHead>
                <TableHead className="hidden text-white/80 md:table-cell">
                  Description
                </TableHead>
                <TableHead className="text-white/80">Status</TableHead>
                <TableHead className="text-right text-white/80">
                  Invoice
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPayments.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="border-white/10 hover:bg-white/5"
                >
                  <TableCell className="text-white">
                    {formatDate(payment.created_at)}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {formatCurrency(Number(payment.amount))}
                  </TableCell>
                  <TableCell className="hidden text-white/70 md:table-cell">
                    {payment.description}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${getStatusBadgeClass(
                        payment.status
                      )}`}
                    >
                      {payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-white/60 hover:text-white"
                    >
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
  )
}

export default Payments
