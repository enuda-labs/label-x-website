'use client'

import { useState } from "react";
//import { useParams} from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Calendar, Target, AlertCircle, Clock, UserMinus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock data - would come from API
const mockProjects = {
  1: {
    id: 1,
    name: "Image Classification Project",
    type: "IMAGE",
    status: "Active",
    totalTasks: 150,
    completedTasks: 45,
    deadline: "2025-09-15",
    description: "Classify product images into different categories for e-commerce platform",
    createdAt: "2025-08-10",
    instructions: "Please categorize each image into one of the following categories: Electronics, Clothing, Home & Garden, Sports, or Other. Look at the main product in the image and select the most appropriate category."
  },
  2: {
    id: 2,
    name: "Text Sentiment Analysis",
    type: "TEXT",
    status: "Active",
    totalTasks: 300,
    completedTasks: 120,
    deadline: "2025-09-30",
    description: "Analyze customer reviews for sentiment classification",
    createdAt: "2025-08-05",
    instructions: "Rate each customer review as Positive, Negative, or Neutral based on the overall sentiment expressed."
  }
};

const mockAssignments = {
  1: [
    {
      labelerId: 1,
      labelerName: "John Doe",
      labelerEmail: "john@example.com",
      assignedTasks: 50,
      completedTasks: 18,
      accuracy: 95,
      status: "Active",
      assignedDate: "2025-08-15",
      lastActivity: "2025-08-25"
    },
    {
      labelerId: 2,
      labelerName: "Jane Smith",
      labelerEmail: "jane@example.com",
      assignedTasks: 50,
      completedTasks: 15,
      accuracy: 92,
      status: "Active",
      assignedDate: "2025-08-16",
      lastActivity: "2025-08-26"
    },
    {
      labelerId: 4,
      labelerName: "Sarah Wilson",
      labelerEmail: "sarah@example.com",
      assignedTasks: 50,
      completedTasks: 12,
      accuracy: 97,
      status: "Active",
      assignedDate: "2025-08-17",
      lastActivity: "2025-08-24"
    }
  ],
  2: [
    {
      labelerId: 2,
      labelerName: "Jane Smith",
      labelerEmail: "jane@example.com",
      assignedTasks: 100,
      completedTasks: 45,
      accuracy: 92,
      status: "Active",
      assignedDate: "2025-08-10",
      lastActivity: "2025-08-26"
    },
    {
      labelerId: 5,
      labelerName: "David Brown",
      labelerEmail: "david@example.com",
      assignedTasks: 100,
      completedTasks: 38,
      accuracy: 91,
      status: "Active",
      assignedDate: "2025-08-12",
      lastActivity: "2025-08-25"
    },
    {
      labelerId: 1,
      labelerName: "John Doe",
      labelerEmail: "john@example.com",
      assignedTasks: 100,
      completedTasks: 37,
      accuracy: 95,
      status: "Active",
      assignedDate: "2025-08-14",
      lastActivity: "2025-08-26"
    }
  ]
};

const availableLabelers = [
  { id: 3, name: "Mike Johnson", email: "mike@example.com", accuracy: 88 },
  { id: 6, name: "Lisa Davis", email: "lisa@example.com", accuracy: 94 }
];

const ProjectManagement = () => {
  const { projectId } = useParams();
  const [selectedLabeler, setSelectedLabeler] = useState<number | null>(null);
  
  const project = mockProjects[Number(projectId) as keyof typeof mockProjects];
  const assignments = mockAssignments[Number(projectId) as keyof typeof mockAssignments] || [];
  
  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <Button asChild>
            <Link href="/admin">Back to Admin Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const totalAssignedTasks = assignments.reduce((sum, assignment) => sum + assignment.assignedTasks, 0);
  const totalCompletedByLabelers = assignments.reduce((sum, assignment) => sum + assignment.completedTasks, 0);
  const averageAccuracy = assignments.length > 0 
    ? Math.round(assignments.reduce((sum, assignment) => sum + assignment.accuracy, 0) / assignments.length)
    : 0;

  const handleRemoveLabeler = (labelerId: number) => {
    console.log(`Removing labeler ${labelerId} from project ${projectId}`);
    //  integrate with API 
  };

  const handleAssignLabeler = () => {
    if (selectedLabeler) {
      console.log(`Assigning labeler ${selectedLabeler} to project ${projectId}`);
      // integrate with API 
      setSelectedLabeler(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="border-b bg-card/30 py-3 backdrop-blur supports-[backdrop-filter]:bg-bcard/40">
      <Button asChild variant="ghost" size="sm">
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
        <div className="px-4 py-4">
          <div className="flex ">
            <div className="flex flex-col  gap-x-4">
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge variant={project.status === "Active" ? "default" : "secondary"}>
                    {project.status}
                  </Badge>
                  <Badge variant="outline">{project.type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Created: {project.createdAt}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
       
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card/20">
            <div className="flex items-center space-x-2">
             
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{project.totalTasks}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-2">
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{project.completedTasks}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-2">
             
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigned Labelers</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-start space-x-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deadline</p>
                <p className="text-lg font-semibold">{project.deadline}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round((project.completedTasks / project.totalTasks) * 100)}%</span>
              </div>
              <Progress value={(project.completedTasks / project.totalTasks) * 100} className="h-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{totalAssignedTasks}</p>
                <p className="text-sm text-muted-foreground">Tasks Assigned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{totalCompletedByLabelers}</p>
                <p className="text-sm text-muted-foreground">Completed by Labelers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{averageAccuracy}%</p>
                <p className="text-sm text-muted-foreground">Average Accuracy</p>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">Labeler Assignments</TabsTrigger>
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="manage">Manage Assignments</TabsTrigger>
          </TabsList>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Assigned Labelers</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add Labeler</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign New Labeler</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select Labeler</label>
                      <Select onValueChange={(value) => setSelectedLabeler(Number(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a labeler" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLabelers.map((labeler) => (
                            <SelectItem key={labeler.id} value={labeler.id.toString()}>
                              {labeler.name} ({labeler.accuracy}% accuracy)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAssignLabeler} disabled={!selectedLabeler} className="w-full">
                      Assign Labeler
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Labeler</TableHead>
                    <TableHead>Assigned Tasks</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.labelerId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{assignment.labelerName}</div>
                          <div className="text-sm text-muted-foreground">{assignment.labelerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{assignment.assignedTasks}</TableCell>
                      <TableCell>{assignment.completedTasks}</TableCell>
                      <TableCell>
                        <div className="w-full">
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={(assignment.completedTasks / assignment.assignedTasks) * 100} 
                              className="h-2 flex-1" 
                            />
                            <span className="text-sm font-medium">
                              {Math.round((assignment.completedTasks / assignment.assignedTasks) * 100)}%
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={assignment.accuracy >= 95 ? "default" : assignment.accuracy >= 90 ? "secondary" : "destructive"}>
                          {assignment.accuracy}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{assignment.lastActivity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveLabeler(assignment.labelerId)}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Project Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Type & Status</h4>
                  <div className="flex space-x-2">
                    <Badge variant="outline">{project.type}</Badge>
                    <Badge variant={project.status === "Active" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Labeling Instructions</h3>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm">{project.instructions}</p>
              </div>
            </Card>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Project Management Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <AlertCircle className="h-6 w-6 mb-2" />
                  Pause Project
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Bulk Assign Tasks
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Target className="h-6 w-6 mb-2" />
                  Export Results
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Extend Deadline
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectManagement;