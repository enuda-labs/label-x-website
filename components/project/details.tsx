import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Activity, Database, Clock } from "lucide-react";
import { ProjectStats } from "./stats";
import { ProjectCharts } from "./charts";
import { ProjectLogs } from "./logs";
import DashboardLayout from "../shared/dashboard-layout";

interface ProjectLog {
  id: number;
  created_at: string;
  updated_at: string;
  message: string;
  project: {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    status: "pending" | "in_progress" | "completed";
    created_by: number;
  };
  task: any;
}

interface ProjectDetail {
  id: number;
  name: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  progress: number;
  dueDate: string;
  createdAt: string;
  dataPoints: number;
  project_logs: ProjectLog[];
}

const ProjectDetail = ({id}: {id:number}) => {
 
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectDetail | null>(null);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        
        const mockProject: ProjectDetail = {
          id: id,
          name: "HabitLock",
          description: "Change description",
          status: "pending",
          progress: 35,
          dueDate: "2024-06-15",
          createdAt: "2025-07-15T15:48:19.235889Z",
          dataPoints: 15000,
          project_logs: [
            {
              id: 1,
              created_at: "2025-07-15T16:47:34.922132Z",
              updated_at: "2025-07-15T16:47:34.922161Z",
              message: "Project details updated by Kyrian. Fields changed: description",
              project: {
                id: 6,
                name: "HabitLock",
                description: "Change description",
                created_at: "2025-07-15T15:48:19.235889Z",
                updated_at: "2025-07-15T16:47:34.902082Z",
                status: "pending",
                created_by: 1
              },
              task: null
            },
            {
              id: 2,
              created_at: "2025-07-15T14:30:00.000000Z",
              updated_at: "2025-07-15T14:30:00.000000Z",
              message: "Data annotation task completed for batch #001",
              project: {
                id: 6,
                name: "HabitLock",
                description: "Change description",
                created_at: "2025-07-15T15:48:19.235889Z",
                updated_at: "2025-07-15T16:47:34.902082Z",
                status: "pending",
                created_by: 1
              },
              task: null
            },
            {
              id: 3,
              created_at: "2025-07-15T12:15:00.000000Z",
              updated_at: "2025-07-15T12:15:00.000000Z",
              message: "New data batch uploaded - 5,000 data points added",
              project: {
                id: 6,
                name: "HabitLock",
                description: "Change description",
                created_at: "2025-07-15T15:48:19.235889Z",
                updated_at: "2025-07-15T16:47:34.902082Z",
                status: "pending",
                created_by: 1
              },
              task: null
            }
          ]
        };
        
        setProject(mockProject);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching project details:", error);
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetail();
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-400/20 text-yellow-400";
      case "in_progress": return "bg-blue-400/20 text-blue-400";
      case "completed": return "bg-green-400/20 text-green-400";
      default: return "bg-white/10 text-white/60";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <DashboardLayout title="Project Details">
        <div className="space-y-6">
          <Skeleton className="h-32 bg-white/5" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40 bg-white/5" />
            <Skeleton className="h-40 bg-white/5" />
            <Skeleton className="h-40 bg-white/5" />
          </div>
          <Skeleton className="h-96 bg-white/5" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout title="Project Not Found">
        <div className="text-center py-8">
          <p className="text-white/60">Project not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={project.name}>
     
      <Card className="bg-white/5 border-white/10 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <h2 className="text-2xl font-bold text-white mr-3">{project.name}</h2>
              <Badge className={`${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            <p className="text-white/70 mb-4">{project.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-white/60">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-1" />
                Created: {formatDate(project.createdAt)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Due: {formatDate(project.dueDate)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      
      <ProjectStats project={project} />

     
      <ProjectCharts projectId={project.id} />

      
      <ProjectLogs logs={project.project_logs} />
    </DashboardLayout>
  );
};

export default ProjectDetail;
