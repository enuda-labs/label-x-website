import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TabsContent } from '@/components/ui/tabs'
import { TaskItem } from '@/constants'
import { getStatusColor, getStatusIcon } from '@/constants/status'
import { CheckCircle2, Clock, Eye, Search } from 'lucide-react'
import React from 'react'

interface AllTasksTabProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  selectedStatus: string
  setSelectedStatus: (value: string) => void
  filteredTasks: TaskItem[]
}
export default function AllTasksTab({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  filteredTasks,
}: AllTasksTabProps) {
  return (
    <TabsContent value="tasks">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Tasks</CardTitle>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="REVIEW_NEEDED">Review Needed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial No.</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviewed</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.slice(0, 50).map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">
                      {task.serial_no}
                    </TableCell>
                    <TableCell>{task.task_type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusColor(task.processing_status)}
                        className="flex w-fit items-center gap-1"
                      >
                        {getStatusIcon(task.processing_status)}
                        <span className="text-xs">
                          {task.processing_status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.human_reviewed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(task.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredTasks?.length > 50 && (
              <p className="text-muted-foreground py-4 text-center text-sm">
                Showing 50 of {filteredTasks?.length} tasks
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
