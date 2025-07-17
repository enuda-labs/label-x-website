import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Database, TrendingUp, Clock } from "lucide-react";

interface ProjectDetail {
  id: number;
  name: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  progress: number;
  dueDate: string;
  createdAt: string;
  dataPoints: number;
}

interface ProjectStatsProps {
  project: ProjectDetail;
}

export const ProjectStats = ({ project }: ProjectStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/70">Progress</CardTitle>
          <Activity className="h-4 w-4 text-white/40" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white mb-2">{project.progress}%</div>
          <Progress value={project.progress} className="h-2 bg-white/10" />
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/70">Data Points</CardTitle>
          <Database className="h-4 w-4 text-white/40" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{project.dataPoints.toLocaleString()}</div>
          <p className="text-xs text-white/50 mt-1">Total processed</p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/70">Status</CardTitle>
          <TrendingUp className="h-4 w-4 text-white/40" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white capitalize">
            {project.status.replace('_', ' ')}
          </div>
          <p className="text-xs text-white/50 mt-1">Current state</p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/70">Days Active</CardTitle>
          <Clock className="h-4 w-4 text-white/40" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {Math.ceil((new Date().getTime() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
          </div>
          <p className="text-xs text-white/50 mt-1">Since creation</p>
        </CardContent>
      </Card>
    </div>
  );
};
