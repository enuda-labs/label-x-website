import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, User, FileText, Database } from "lucide-react";

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

interface ProjectLogsProps {
  logs: ProjectLog[];
}

export const ProjectLogs = ({ logs }: ProjectLogsProps) => {
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

  const getLogIcon = (message: string) => {
    if (message.includes('updated')) return <FileText className="h-4 w-4" />;
    if (message.includes('completed')) return <Activity className="h-4 w-4" />;
    if (message.includes('uploaded')) return <Database className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const getLogType = (message: string) => {
    if (message.includes('updated')) return { label: 'Update', color: 'bg-blue-400/20 text-blue-400' };
    if (message.includes('completed')) return { label: 'Completed', color: 'bg-green-400/20 text-green-400' };
    if (message.includes('uploaded')) return { label: 'Upload', color: 'bg-purple-400/20 text-purple-400' };
    return { label: 'Activity', color: 'bg-white/20 text-white/60' };
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Project Activity Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.length > 0 ? (
            logs.map((log) => {
              const logType = getLogType(log.message);
              return (
                <div key={log.id} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-shrink-0 p-2 bg-white/10 rounded-full text-white/60">
                    {getLogIcon(log.message)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={logType.color}>
                        {logType.label}
                      </Badge>
                      <span className="text-xs text-white/50">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-white/80 text-sm mb-2">{log.message}</p>
                    
                    <div className="text-xs text-white/50">
                      <span>Project: {log.project.name}</span>
                      {log.project.created_by && (
                        <span className="ml-4">User ID: {log.project.created_by}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-white/20 mb-4" />
              <p className="text-white/60">No activity logs available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
