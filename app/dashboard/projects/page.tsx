'use client';

import { useState, useEffect } from 'react';
//import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
import DashboardLayout from '@/components/shared/dashboard-layout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProject, getProjects } from '@/services/apis/project';
import { isAxiosError } from 'axios';

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  createdAt: string;
  dataPoints: number;
}

const Projects = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
  });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  useEffect(() => {
    // Simulate API call to fetch projects
    const fetchProjects = async () => {
      try {
        if (projectsData) {
          // Mock data
          setProjects(
            projectsData.projects.map(project => ({
              id: project.id,
              name: project.name,
              description: project.description,
              status: project.task_stats.completion_percentage
                ? project.task_stats.completion_percentage === 100
                  ? 'completed'
                  : 'in_progress'
                : 'pending',
              progress: project.task_stats.completion_percentage,
              createdAt: project.created_at,
              dataPoints: 10000,
            }))
          );

          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [projectsData]);

  const filteredProjects = projects.filter(
    project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-400/20 text-yellow-400';
      case 'in_progress':
        return 'bg-blue-400/20 text-blue-400';
      case 'completed':
        return 'bg-green-400/20 text-green-400';
      default:
        return 'bg-white/10 text-white/60';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const { mutate: createMutation, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setNewProject({ name: '', description: '' });
      setOpen(false);
      setError('');
    },
    onError: err => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (isAxiosError(err)) setError(err.response?.data.detail || err.message);
    },
  });

  console.log();

  return (
    <DashboardLayout title="My Projects">
      {/* Search and Create Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search projects..."
            className="pl-9 bg-white/5 border-white/10 text-white"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0A0A0A] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription className="text-white/60">
                Fill in the details to create a new data review project.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Project Name</label>
                <Input
                  placeholder="e.g., Content Moderation Project"
                  className="bg-white/5 border-white/10 text-white"
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Description</label>
                <Input
                  placeholder="Brief description of the project"
                  className="bg-white/5 border-white/10 text-white"
                  value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <span className="text-red-500 text-sm">{error}</span>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                onClick={() => createMutation(newProject)}
              >
                {isPending ? 'Creating Project...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-28 bg-white/5" />
            <Skeleton className="h-28 bg-white/5" />
            <Skeleton className="h-28 bg-white/5" />
            <Skeleton className="h-28 bg-white/5" />
          </>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <Card key={project.id} className="bg-white/5 border-white/10 p-5">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-white text-lg">{project.name}</h3>
                      <span
                        className={`ml-3 text-xs px-2 py-1 rounded-full ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm mt-1">{project.description}</p>
                  </div>

                  <div className="mt-3 md:mt-0">
                    {/* <Button
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/10 hover:bg-white/5"
                    >
                      View Details
                    </Button> */}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-white/40 text-xs mb-1 grid">Progress</p>
                    <div className="flex items-center">
                      <Progress value={project.progress} className="h-2 flex-1 bg-white/10" />
                      <span className="ml-2 text-xs text-white/60">{project.progress}%</span>
                    </div>
                  </div>
                  <div></div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Timeline</p>
                    <p className="text-sm text-white">Created: {formatDate(project.createdAt)}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : projects.length ? (
          <div className="text-center py-8">
            <p className="text-white/60">{`No projects found matching "{searchQuery}"`}</p>
          </div>
        ) : (
          <div className="my-20 flex justify-center items-center">
            No project has been created for this account
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Projects;
