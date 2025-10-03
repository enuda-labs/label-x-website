import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Label, Project, Reviewer } from '@/constants'

export default function AllLabelers({ project }: { project: Project }) {
  return (
    <TabsContent value="labelers">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {project.assigned_reviewers.map((labeler: Reviewer) => {
          const submissions = project.my_labels.filter(
            (l: Label) => l.labeller === labeler.id
          ).length

          const totalLabels = project.my_labels.length || 1
          const percentage = (submissions / totalLabels) * 100

          return (
            <Card
              key={labeler.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {labeler.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {labeler.username}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">
                        {labeler.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant={labeler.is_active ? 'default' : 'outline'}>
                    {labeler.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {labeler.domains && labeler.domains.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-medium">Expertise:</p>
                    <div className="flex flex-wrap gap-2">
                      {labeler.domains.map((d, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {d.domain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Submissions:</p>
                    <p className="text-2xl font-bold">{submissions}</p>
                  </div>
                  <Progress value={percentage} className="mt-2 h-2" />
                  <p className="text-muted-foreground mt-1 text-xs">
                    {percentage.toFixed(1)}% of total reviews
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </TabsContent>
  )
}
