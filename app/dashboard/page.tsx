'use client';

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/shared/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowRight, Check } from "lucide-react";

interface ProjectSummary {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed";
  progress: number;
  dueDate: string;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState<ProjectSummary[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalDataPoints: 0
  });
  
  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        
        // Mock data
        setRecentProjects([
          {
            id: "proj-001",
            name: "Twitter Sentiment Analysis",
            status: "in_progress",
            progress: 65,
            dueDate: "2024-05-25"
          },
          {
            id: "proj-002",
            name: "Customer Feedback Classification",
            status: "pending",
            progress: 0,
            dueDate: "2024-05-30"
          },
          {
            id: "proj-003",
            name: "Product Image Classification",
            status: "completed",
            progress: 100,
            dueDate: "2024-05-15"
          }
        ]);
        
        setStats({
          pending: 2,
          inProgress: 3,
          completed: 5,
          totalDataPoints: 48750
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-400";
      case "in_progress": return "text-blue-400";
      case "completed": return "text-green-400";
      default: return "text-white/60";
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <DashboardLayout title='Dashboard'>
      
      <Alert className="mb-8 bg-white/5 border-white/10">
        <AlertTitle className="text-white font-medium">Welcome to your data review dashboard!</AlertTitle>
        <AlertDescription className="text-white/70">
          Track your AI data processing projects and see real-time results from our expert human reviewers.
        </AlertDescription>
      </Alert>
      
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <Skeleton className="h-24 bg-white/5" />
            <Skeleton className="h-24 bg-white/5" />
            <Skeleton className="h-24 bg-white/5" />
            <Skeleton className="h-24 bg-white/5" />
          </>
        ) : (
          <>
            <Card className="bg-white/5 border-white/10 p-4">
              <div className="text-white/60 text-sm mb-1">Pending Projects</div>
              <div className="text-3xl font-bold text-white">{stats.pending}</div>
              <div className="h-1 w-full bg-white/10 mt-3">
                <div className="h-1 bg-yellow-400" style={{ width: `${stats.pending * 10}%` }} />
              </div>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-4">
              <div className="text-white/60 text-sm mb-1">In Progress</div>
              <div className="text-3xl font-bold text-white">{stats.inProgress}</div>
              <div className="h-1 w-full bg-white/10 mt-3">
                <div className="h-1 bg-blue-400" style={{ width: `${stats.inProgress * 10}%` }} />
              </div>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-4">
              <div className="text-white/60 text-sm mb-1">Completed</div>
              <div className="text-3xl font-bold text-white">{stats.completed}</div>
              <div className="h-1 w-full bg-white/10 mt-3">
                <div className="h-1 bg-green-400" style={{ width: `${stats.completed * 5}%` }} />
              </div>
            </Card>
            
            <Card className="bg-white/5 border-white/10 p-4">
              <div className="text-white/60 text-sm mb-1">Total Data Points</div>
              <div className="text-3xl font-bold text-white">{stats.totalDataPoints.toLocaleString()}</div>
              <div className="h-1 w-full bg-white/10 mt-3">
                <div className="h-1 bg-primary" style={{ width: `${Math.min((stats.totalDataPoints / 100000) * 100, 100)}%` }} />
              </div>
            </Card>
          </>
        )}
      </div>
      
      {/* Recent Projects */}
      <h2 className="text-xl font-semibold text-white mb-4">Recent Projects</h2>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 bg-white/5" />
          <Skeleton className="h-20 bg-white/5" />
          <Skeleton className="h-20 bg-white/5" />
        </div>
      ) : (
        <div className="space-y-4">
          {recentProjects.map(project => (
            <Card key={project.id} className="bg-white/5 border-white/10 p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-3 md:mb-0">
                  <h3 className="font-medium text-white">{project.name}</h3>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="text-white/40 text-xs mx-2">•</span>
                    <span className="text-white/60 text-xs">Due {formatDate(project.dueDate)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 w-full md:w-auto">
                  <div className="flex-1 md:w-32">
                    <Progress value={project.progress} className="h-2 bg-white/10" />
                    <span className="text-xs text-white/60 mt-1">{project.progress}% complete</span>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-white/60 hover:text-white">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          <Button className="px-10 mt-4 flex items-center justify-center mx-auto">
            View All Projects
          </Button>
        </div>
      )}
      
      {/* Subscription Info */}
      <h2 className="text-xl font-semibold text-white mt-8 mb-4">Your Subscription</h2>
      
      {loading ? (
        <Skeleton className="h-40 bg-white/5" />
      ) : (
        <Card className="bg-white/5 border-primary/20 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="inline-flex items-center bg-primary/20 rounded-full px-3 py-1 mb-3">
                <span className="text-primary text-xs font-medium">Professional Plan</span>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">$99/month</h3>
              <p className="text-white/60 mb-4">Next billing date: June 20, 2023</p>
              
              <div className="space-y-2">
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                  <span className="text-sm text-white/80">50,000 data points per month</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                  <span className="text-sm text-white/80">24-hour turnaround time</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                  <span className="text-sm text-white/80">Priority support</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0">
              <Button variant="outline" className="w-full md:w-auto border-white/10 hover:bg-white/5">
                Manage Subscription
              </Button>
            </div>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );

};

export default Dashboard;
