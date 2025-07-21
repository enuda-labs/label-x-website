'use client';

import { useState, useEffect, FC } from 'react';
import DashboardLayout from '@/components/shared/dashboard-layout';
import { Card } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowRight, Check } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getMyPlan,
  getSubscriptionPlans,
  initializeSubscription,
  SubscriptionPlan,
} from '@/services/apis/subscription';
import { useRouter } from 'next/navigation';
import { planFeats } from '@/utils';
import { getProjects, getStats, Project } from '@/services/apis/project';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [showPlans, setShowPlans] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    completionPercentage: 0,
    total: 0,
  });

  const { data: myPlan, isLoading: isCheckingPlan } = useQuery({
    queryKey: ['myPlan'],
    queryFn: getMyPlan,
  });

  const { data } = useQuery({
    queryKey: ['plan'],
    queryFn: getSubscriptionPlans,
  });
  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchData = async () => {
      try {
        if (projectsData?.projects.length) setRecentProjects(projectsData.projects.slice(0, 4));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [projectsData?.projects]);

  useEffect(() => {
    if (statsData) {
      // setStats({
      //   pending: 2,
      //   inProgress: 3,
      //   completed: 5,
      //   completionPercentage: 48750,
      // });
      setStats({
        completed: statsData.data.completed_tasks,
        pending: statsData.data.total_tasks - statsData.data.completed_tasks,
        inProgress: statsData.data.completed_tasks - statsData.data.pending_projects,
        completionPercentage: statsData.data.completion_percentage,
        total: statsData.data.total_tasks,
      });
    }
  }, [statsData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400';
      case 'in_progress':
        return 'text-blue-400';
      case 'completed':
        return 'text-green-400';
      default:
        return 'text-white/60';
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

  return (
    <DashboardLayout title="Dashboard">
      <Alert className="mb-8 bg-white/5 border-white/10">
        <AlertTitle className="text-white font-medium">
          Welcome to your data review dashboard!
        </AlertTitle>
        <AlertDescription className="text-white/70">
          Track your AI data processing projects and see real-time results from our expert human
          reviewers.
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
              <div className="text-white/60 text-sm mb-1">Total Projects</div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="h-1 w-full bg-white/10 mt-3">
                <div className="h-1 bg-yellow-400" style={{ width: `${stats.pending * 10}%` }} />
              </div>
            </Card>
            <Card className="bg-white/5 border-white/10 p-4">
              <div className="text-white/60 text-sm mb-1">Pending Projects</div>
              <div className="text-3xl font-bold text-white">{stats.pending}</div>
              <div className="h-1 w-full bg-white/10 mt-3">
                <div className="h-1 bg-yellow-400" style={{ width: `${stats.pending * 10}%` }} />
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
              <div className="text-white/60 text-sm mb-1">Completion Percentage</div>
              <div className="text-3xl font-bold text-white">{stats.completionPercentage}%</div>
              <div className="h-1 w-full bg-white/10 mt-3">
                <div
                  className="h-1 bg-primary"
                  style={{
                    width: `${stats.completionPercentage}%`,
                  }}
                />
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
          {recentProjects.length ? (
            recentProjects.slice(0, 3).map(project => (
              <Card key={project.id} className="bg-white/5 border-white/10 p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-3 md:mb-0">
                    <h3 className="font-medium text-white">{project.name}</h3>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="text-white/60 text-xs">
                        Created on {formatDate(project.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="flex-1 md:w-32">
                      <Progress
                        value={project.task_stats.completion_percentage}
                        className="h-2 bg-white/10"
                      />
                      <span className="text-xs text-white/60 mt-1">
                        {project.task_stats.completion_percentage}% complete
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-white/60 hover:text-white"
                      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="my-10 flex items-center">
              No project has been created for this account
              <Link href={'/dashboard/projects'} className="ml-3 underline text-primary">
                Create now
              </Link>
            </div>
          )}
          {recentProjects.length > 3 && (
            <Button
              onClick={() => router.push('dashboard/projects')}
              className="px-10 mt-4 mb-4 flex items-center justify-center mx-auto cursor-pointer"
            >
              View All Projects
            </Button>
          )}
        </div>
      )}

      {/* Subscription Info */}
      {isCheckingPlan ? (
        <Skeleton className="h-40 bg-white/5" />
      ) : myPlan && !showPlans ? (
        <div>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Your Subscription</h2>

          <Card className="bg-white/5 border-primary/20 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <div className="inline-flex items-center bg-primary/20 rounded-full px-3 py-1 mb-3">
                  <span className="text-primary text-xs font-medium capitalize">
                    {myPlan.plan.name} Plan
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  ${myPlan.plan.monthly_fee}/month
                </h3>
                <p className="text-white/60 mb-4">
                  Next billing date:{' '}
                  {new Date(myPlan.expires_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>

                <div className="space-y-2 ">
                  {planFeats(myPlan.plan.name).map(feat => (
                    <div className="flex items-start" key={feat}>
                      <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                      <span className="text-sm text-white/80">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 md:mt-0">
                <Button
                  variant="outline"
                  className="w-full md:w-auto border-white/10 hover:bg-white/5 cursor-pointer"
                  onClick={() => setShowPlans(true)}
                >
                  Manage Subscription
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {data?.detail && data.detail.map(plan => <Plan key={plan.id} plan={plan} />)}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;

const Plan: FC<{ plan: SubscriptionPlan }> = ({ plan }) => {
  const router = useRouter();

  const { mutate: subscriptionMutation, isPending } = useMutation({
    mutationFn: initializeSubscription,
    onSuccess: data => {
      router.push(data.data.payment_url);
    },
  });

  return (
    <div
      className={`bg-white/5 backdrop-blur-sm border ${
        plan.name === 'pro' ? 'border-primary/30' : 'border-white/10'
      } rounded-xl p-8 hover:bg-white/10 transition-colors relative`}
      key={plan.id}
    >
      {plan.name === 'pro' && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-xs font-medium">
          POPULAR
        </div>
      )}
      <h3 className="text-xl font-heading font-semibold mb-4 capitalize">{plan.name}</h3>
      <div className="text-4xl font-bold mb-4">
        ${plan.monthly_fee}
        <span className="text-lg text-white/60">/mo</span>
      </div>
      <ul className="space-y-3 mb-8 text-white/70 text-left">
        {planFeats(plan.name).map(feat => (
          <li key={feat}>• {feat}</li>
        ))}
      </ul>
      <Button
        className="w-full bg-primary hover:bg-primary/90 cursor-pointer"
        onClick={() => subscriptionMutation(plan.id)}
      >
        {isPending ? (
          <div className="w-[24px] h-[24px] border-[3px] border-solid border-[rgba(0,0,0,0.2)] border-t-[#fff] rounded-full animate-spin mx-auto"></div>
        ) : (
          'Get Started'
        )}
      </Button>
    </div>
  );
};
