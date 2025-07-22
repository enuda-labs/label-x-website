import DashboardLayout from '../shared/dashboard-layout'
import { Skeleton } from '../ui/skeleton'

function DetailsSkeleton() {
  return (
    <DashboardLayout title="Project Details">
      <div className="space-y-6">
        <Skeleton className="h-32 bg-white/5" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-40 bg-white/5" />
          <Skeleton className="h-40 bg-white/5" />
          <Skeleton className="h-40 bg-white/5" />
        </div>
        <Skeleton className="h-96 bg-white/5" />
      </div>
    </DashboardLayout>
  )
}

export default DetailsSkeleton
