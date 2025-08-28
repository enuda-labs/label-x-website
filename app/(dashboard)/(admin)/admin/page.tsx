'use client'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'

import { Settings } from 'lucide-react'
import Link from 'next/link'
import AdminDashboardContent from './overview'

function DashboardFallback() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen">
      <div className="bg-card/30 supports-[backdrop-filter]:bg-card/60 border-b backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Settings className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>

      <Suspense fallback={<DashboardFallback />}>
        <AdminDashboardContent />
      </Suspense>
    </div>
  )
}
