'use client';

import { useState, } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {  Users, FolderOpen, Plus } from "lucide-react";
import Link from "next/link";

const mockProjects = [
  {
    id: 1,
    name: "Image Classification Project",
    type: "IMAGE",
    status: "Active",
    totalTasks: 150,
    completedTasks: 45,
    assignedLabelers: 3,
    deadline: "2025-09-15"
  },
  {
    id: 2,
    name: "Text Sentiment Analysis",
    type: "TEXT",
    status: "Active",
    totalTasks: 300,
    completedTasks: 120,
    assignedLabelers: 5,
    deadline: "2025-09-30"
  },
  {
    id: 3,
    name: "Document Review",
    type: "PDF",
    status: "Completed",
    totalTasks: 50,
    completedTasks: 50,
    assignedLabelers: 2,
    deadline: "2025-08-20"
  }
];

const mockLabelers = [
  { id: 1, name: "John Doe", email: "john@example.com", status: "Active", completedTasks: 45, accuracy: 95 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Active", completedTasks: 78, accuracy: 92 },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", status: "Inactive", completedTasks: 23, accuracy: 88 },
  { id: 4, name: "Sarah Wilson", email: "sarah@example.com", status: "Active", completedTasks: 67, accuracy: 97 },
  { id: 5, name: "David Brown", email: "david@example.com", status: "Active", completedTasks: 34, accuracy: 91 }
];

export default function AdminDashboardContent({currentTab, handleTabChange}:{currentTab: string, handleTabChange: (value: string) => void}) {

  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedLabelers, setSelectedLabelers] = useState<number[]>([]);

  
  const handleAssignLabelers = () => {
    // integrate with API here
    console.log(`Assigning labelers ${selectedLabelers} to project ${selectedProject}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">
            <FolderOpen className="mr-2 h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="labelers">
            <Users className="mr-2 h-4 w-4" />
            Labelers
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <Plus className="mr-2 h-4 w-4" />
            Assignments
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Project Overview</h2>
          </div>

          <div className="grid gap-4">
            {mockProjects.map((project) => (
              <Card key={project.id} className="p-6 bg-card/20">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <Badge variant={project.status === "Active" ? "default" : "secondary"}>
                        {project.status}
                      </Badge>
                      <Badge variant="outline">{project.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Progress: {project.completedTasks}/{project.totalTasks} tasks completed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Assigned Labelers: {project.assignedLabelers} | Deadline: {project.deadline}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button asChild size="sm">
                      <Link href={`/admin/projects/${project.id}`}>Manage</Link>
                    </Button>
                  </div>
                </div>
                <div className="mt-4 w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${(project.completedTasks / project.totalTasks) * 100}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Labelers Tab */}
        <TabsContent value="labelers" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Labeler Management</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Labeler
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completed Tasks</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLabelers.map((labeler) => (
                  <TableRow key={labeler.id}>
                    <TableCell className="font-medium">{labeler.name}</TableCell>
                    <TableCell>{labeler.email}</TableCell>
                    <TableCell>
                      <Badge variant={labeler.status === "Active" ? "default" : "secondary"}>
                        {labeler.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{labeler.completedTasks}</TableCell>
                    <TableCell>{labeler.accuracy}%</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">
                          {labeler.status === "Active" ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Assign Labelers to Projects</h2>
          </div>

          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project-select">Select Project</Label>
                <Select onValueChange={(value) => setSelectedProject(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProjects.filter(p => p.status === "Active").map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Select Labelers to Assign</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockLabelers.filter(l => l.status === "Active").map((labeler) => (
                    <Card key={labeler.id} className="p-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`labeler-${labeler.id}`}
                          checked={selectedLabelers.includes(labeler.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLabelers([...selectedLabelers, labeler.id]);
                            } else {
                              setSelectedLabelers(selectedLabelers.filter(id => id !== labeler.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <label htmlFor={`labeler-${labeler.id}`} className="font-medium cursor-pointer">
                            {labeler.name}
                          </label>
                          <p className="text-sm text-muted-foreground">{labeler.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Accuracy: {labeler.accuracy}% | Tasks: {labeler.completedTasks}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleAssignLabelers}
              >
                Assign Selected Labelers
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

