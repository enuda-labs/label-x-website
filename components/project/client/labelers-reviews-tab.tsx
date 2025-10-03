import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TabsContent } from '@/components/ui/tabs'
import { Label } from '@/constants'
import { Filter, Search } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

interface Labeler {
  id: number
  username: string
  email: string
  domains?: Array<{ domain: string }>
}

interface Task {
  id: number
  serial_no: string
  processing_status: string
  file_url?: string
}

interface Project {
  assigned_reviewers: Labeler[]
  tasks: Task[]
  input_type: string
}

interface AllLabelersTabProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  selectedLabeler: string
  setSelectedLabeler: (value: string) => void
  project: Project
  groupLabelsByLabeler: () => Record<string, Label[]>
  getLabelerById: (id: number) => Labeler | undefined
  getStatusColor: (
    status: string
  ) => 'default' | 'secondary' | 'destructive' | 'outline'
  getStatusIcon: (status: string) => React.ReactNode
  renderLabelResponse: (label: Label, inputType: string) => React.ReactNode
}

function AllLabelersReviewsTab({
  searchQuery,
  setSearchQuery,
  selectedLabeler,
  setSelectedLabeler,
  project,
  groupLabelsByLabeler,
  getLabelerById,
  getStatusColor,
  getStatusIcon,
  renderLabelResponse,
}: AllLabelersTabProps) {
  return (
    <TabsContent value="reviews" className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search by task serial number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedLabeler} onValueChange={setSelectedLabeler}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Labelers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Labelers</SelectItem>
                {project.assigned_reviewers.map((labeler) => (
                  <SelectItem key={labeler.id} value={labeler.id.toString()}>
                    {labeler.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews by Labeler */}
      <div className="grid gap-6">
        {Object.entries(groupLabelsByLabeler()).map(([labellerId, labels]) => {
          const labeler = getLabelerById(Number(labellerId))
          if (!labeler) return null

          return (
            <Card key={labellerId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg">
                        {labeler.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {labeler.username}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        {labeler.email}
                      </p>
                      {labeler.domains && labeler.domains.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {labeler.domains.map((d, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {d.domain}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{labels.length}</p>
                    <p className="text-muted-foreground text-sm">submissions</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
                  {labels.slice(0, 5).map((label) => {
                    const task = project.tasks.find((t) => t.id === label.task)
                    return (
                      <div
                        key={label.id}
                        className="bg-card/50 space-y-3 rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              Task #{task?.serial_no}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {new Date(label.created_at).toLocaleDateString()}{' '}
                              at{' '}
                              {new Date(label.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          {task && (
                            <Badge
                              variant={getStatusColor(task.processing_status)}
                              className="flex items-center gap-1"
                            >
                              {getStatusIcon(task.processing_status)}
                              <span className="text-xs">
                                {task.processing_status}
                              </span>
                            </Badge>
                          )}
                        </div>

                        {task?.file_url && (
                          <div>
                            <p className="text-muted-foreground mb-2 text-xs font-medium">
                              Original Task:
                            </p>
                            <Image
                              src={task.file_url}
                              alt="Task"
                              width={500}
                              height={400}
                              className="w-full max-w-sm rounded-lg border"
                            />
                          </div>
                        )}

                        <div>
                          <p className="text-muted-foreground mb-2 text-xs font-medium">
                            Labeler Response:
                          </p>
                          {renderLabelResponse(label, project.input_type)}
                        </div>

                        {label.notes && (
                          <div>
                            <p className="text-muted-foreground mb-2 text-xs font-medium">
                              Notes:
                            </p>
                            <div className="bg-muted/50 rounded p-2 text-sm">
                              {label.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {labels.length > 5 && (
                    <p className="text-muted-foreground py-2 text-center text-sm">
                      Showing 5 of {labels.length} submissions
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </TabsContent>
  )
}

export default AllLabelersReviewsTab
