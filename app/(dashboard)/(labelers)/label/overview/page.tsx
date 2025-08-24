import React from 'react';
import  Link from 'next/link';
import { Clock, FileText, Video, Database, ChevronRight, User, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockTasks } from '@/constants/temp';


const getTypeIcon = (type: string) => {
  switch (type) {
    case 'TEXT': return <FileText className="h-4 w-4" />;
    case 'IMAGE': return <ImageIcon className="h-4 w-4" />;
    case 'VIDEO': return <Video className="h-4 w-4" />;
    case 'CSV':
    case 'PDF': return <Database className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'destructive';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'outline';
  }
};

const LabelerDashboard = () => {
  return (
    <div className="min-h-screen ">
     
      <header className="border-b bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Labeler Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                John Labeler
              </div>
            </div>
          </div>
        </div>
      </header>

     
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Assigned Tasks</h1>
          <p className="text-muted-foreground">
            Complete your labeling tasks to help improve AI and machine learning models
          </p>
        </div>

        {/* Stats  */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className='bg-card/20'>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card/20'>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Clock className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">565</p>
                  <p className="text-sm text-muted-foreground">Items Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card/20'>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Database className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1,985</p>
                  <p className="text-sm text-muted-foreground">Items Remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card/20'>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <ChevronRight className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">22%</p>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Current Tasks</h2>
          
          <div className="grid gap-6">
            {mockTasks.slice(0,3).map((task) => (
              <Card key={task.id} className="shadow-soft bg-card/20 hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getTypeIcon(task.task_type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.labeller_instructions}
                        </p>
                      </div>
                    </div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Badge variant={getPriorityColor(task.priority) as any}>
                      {task.priority} priority
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{task.completedItems} / {task.labeller_per_item_count} items</span>
                    </div>
                    <Progress 
                      value={(task.completedItems / task.labeller_per_item_count) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <p className="text-sm font-medium mb-2">Label Options:</p>
                    <div className="flex flex-wrap gap-2">
                      {task.labelling_choices.map((choice, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {choice.option_text}
                        </Badge>
                      ))}
                      {task.input_type === 'text_input' && (
                        <Badge variant="outline" className="text-xs">
                          Text Input
                        </Badge>
                      )}
                    </div>
                  </div>

                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Due: {new Date(task.deadline).toLocaleDateString()}
                    </div>
                    <Link href={`/label/${task.id}`}>
                      <Button variant="default">
                        Continue Labeling
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Link href="/label/projects" className='flex items-end justify-end'><Button>View All Task</Button></Link>
        </div>
      </main>
    </div>
  );
};

export default LabelerDashboard;