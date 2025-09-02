'use client'

import { useState, useEffect, FC } from 'react'
import DashboardLayout from '@/components/shared/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowRight, Check, Plus } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMyPlan,
  getSubscriptionPlans,
  initializeSubscription,
  SubscriptionPlan,
} from '@/services/apis/subscription'
import { useRouter } from 'next/navigation'
import { planFeats } from '@/utils'
import {
  createProject,
  getProjects,
  getStats,
  Project,
} from '@/services/apis/project'
import { Progress } from '@/components/ui/progress'
import { fetchDataPoints } from '@/services/apis/datapoints'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { isAxiosError } from 'axios'

const Dashboard = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(true)
  const [dataPoints, setDataPoints] = useState<number | null>(null)
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [showPlans, setShowPlans] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
  })
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    completionPercentage: 0,
    total: 0,
  })

  const { data: myPlan, isLoading: isCheckingPlan } = useQuery({
    queryKey: ['myPlan'],
    queryFn: getMyPlan,
  })

  const { data } = useQuery({
    queryKey: ['plan'],
    queryFn: getSubscriptionPlans,
  })
  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  })
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (projectsData?.projects.length)
          setRecentProjects(projectsData.projects.slice(0, 4))

        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [projectsData?.projects])

  useEffect(() => {
    if (statsData) {
      setStats({
        completed: statsData.data.completed_tasks,
        pending: statsData.data.total_tasks - statsData.data.completed_tasks,
        inProgress:
          statsData.data.completed_tasks - statsData.data.pending_projects,
        completionPercentage: statsData.data.completion_percentage,
        total: statsData.data.total_tasks,
      })
    }
  }, [statsData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400'
      case 'in_progress':
        return 'text-blue-400'
      case 'completed':
        return 'text-green-400'
      default:
        return 'text-white/60'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  useEffect(() => {
    const loadDataPoints = async () => {
      try {
        const balance = await fetchDataPoints()
        setDataPoints(balance)

        if (balance <= 0) {
          setShowModal(true)
        }
      } catch (err) {
        console.error('Error fetching data points', err)
        setShowModal(true)
      } finally {
        setLoading(false)
      }
    }

    loadDataPoints()
  }, [router])

  const { mutate: createMutation, isPending } = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setNewProject({ name: '', description: '' })
      setOpen(false)
      setError('')
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      if (isAxiosError(err)) setError(err.response?.data.detail || err.message)
    },
  })

  return (
    <DashboardLayout title="Dashboard">
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Data Points Available</DialogTitle>
            <DialogDescription>
              You have no data points remaining. Please subscribe to a plan to
              continue using the service.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push('/subscriptions')}>
              Go to Subscription
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" className="ml-2">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Alert className="mb-8 border-white/10 bg-white/5">
        <AlertTitle className="font-medium text-white">
          Welcome to your data review dashboard!
        </AlertTitle>
        <AlertDescription className="text-white/70">
          Track your AI data processing projects and see real-time results from
          our expert human reviewers.
        </AlertDescription>
      </Alert>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-24 bg-white/5" />
            <Skeleton className="h-24 bg-white/5" />
            <Skeleton className="h-24 bg-white/5" />
            <Skeleton className="h-24 bg-white/5" />
          </>
        ) : (
          <>
            <Card className="border-white/10 bg-white/5 p-4">
              <div className="mb-1 text-sm text-white/60">Data Points</div>
              <div className="text-3xl font-bold text-white">
                {dataPoints?.toLocaleString() ?? '...'}
              </div>
            </Card>

            <Card className="border-white/10 bg-white/5 p-4">
              <div className="mb-1 text-sm text-white/60">Pending Projects</div>
              <div className="text-3xl font-bold text-white">
                {stats.pending}
              </div>
              <div className="mt-3 h-1 w-full bg-white/10">
                <div
                  className="h-1 bg-yellow-400"
                  style={{ width: `${stats.pending * 10}%` }}
                />
              </div>
            </Card>

            <Card className="border-white/10 bg-white/5 p-4">
              <div className="mb-1 text-sm text-white/60">Completed</div>
              <div className="text-3xl font-bold text-white">
                {stats.completed}
              </div>
              <div className="mt-3 h-1 w-full bg-white/10">
                <div
                  className="h-1 bg-green-400"
                  style={{ width: `${stats.completed * 5}%` }}
                />
              </div>
            </Card>

            <Card className="border-white/10 bg-white/5 p-4">
              <div className="mb-1 text-sm text-white/60">
                Completion Percentage
              </div>
              <div className="text-3xl font-bold text-white">
                {stats.completionPercentage}%
              </div>
              <div className="mt-3 h-1 w-full bg-white/10">
                <div
                  className="bg-primary h-1"
                  style={{
                    width: `${stats.completionPercentage}%`,
                  }}
                />
              </div>
            </Card>
            {/* <Card className="bg-white/5 border-white/10 p-4">
              <div className="text-white/60 text-sm mb-1">Data Points Balance</div>
              <div className="text-3xl font-bold text-white">{stats.dataPointsBalance}</div>
              <div className="h-1 w-full bg-white/10 mt-3">
                <div className="h-1 bg-green-400" style={{ width: `${stats.dataPointsBalance * 5}%` }} />
              </div>
            </Card> */}
          </>
        )}
      </div>

      {/* Recent Projects */}
      <h2 className="mb-4 text-xl font-semibold text-white">Recent Projects</h2>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 bg-white/5" />
          <Skeleton className="h-20 bg-white/5" />
          <Skeleton className="h-20 bg-white/5" />
        </div>
      ) : (
        <div className="space-y-4">
          {recentProjects.length ? (
            recentProjects.slice(0, 3).map((project) => (
              <Card
                key={project.id}
                className="border-white/10 bg-white/5 p-4"
                onClick={() => router.push(`/client/projects/${project.id}`)}
              >
                <div className="flex flex-col justify-between md:flex-row md:items-center">
                  <div className="mb-3 md:mb-0">
                    <h3 className="font-medium text-white">{project.name}</h3>
                    <div className="mt-1 flex items-center">
                      <span
                        className={`text-xs ${getStatusColor(project.status)}`}
                      >
                        {project.status
                          .replace('_', ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center">
                      <span className="text-xs text-white/60">
                        Created on {formatDate(project.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex w-full items-center space-x-4 md:w-auto">
                    <div className="flex-1 md:w-32">
                      <Progress
                        value={project.task_stats.completion_percentage}
                        className="h-2 bg-white/10"
                      />
                      <span className="mt-1 text-xs text-white/60">
                        {project.task_stats.completion_percentage}% complete
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-white/60 hover:text-white"
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
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 mx-5 w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-white/10 bg-[#0A0A0A] text-white">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription className="text-white/60">
                      Fill in the details to create a new data review project.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="mb-2 text-sm font-medium text-white">
                        Project Name
                      </label>
                      <Input
                        placeholder="e.g., Content Moderation Project"
                        className="border-white/10 bg-white/5 text-white"
                        value={newProject.name}
                        onChange={(e) =>
                          setNewProject({ ...newProject, name: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        Description
                      </label>
                      <Input
                        placeholder="Brief description of the project"
                        className="border-white/10 bg-white/5 text-white"
                        value={newProject.description}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <span className="text-sm text-red-500">{error}</span>
                  </div>

                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => createMutation(newProject)}
                      disabled={isPending}
                    >
                      {isPending ? 'Creating Project...' : 'Create Project'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
          {recentProjects.length > 3 && (
            <Button
              onClick={() => router.push('/client/projects')}
              className="mx-auto mt-4 mb-4 flex cursor-pointer items-center justify-center px-10"
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
          <h2 className="mt-8 mb-4 text-xl font-semibold text-white">
            Your Subscription
          </h2>

          <Card className="border-primary/20 bg-white/5 p-6">
            <div className="flex flex-col justify-between md:flex-row md:items-center">
              <div>
                <div className="bg-primary/20 mb-3 inline-flex items-center rounded-full px-3 py-1">
                  <span className="text-primary text-xs font-medium capitalize">
                    {myPlan.plan.name} Plan
                  </span>
                </div>

                <h3 className="mb-2 text-xl font-bold text-white">
                  ${myPlan.plan.monthly_fee}/month
                </h3>
                <p className="mb-4 text-white/60">
                  Next billing date:{' '}
                  {new Date(myPlan.expires_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>

                <div className="space-y-2">
                  {planFeats(myPlan.plan.name).map((feat) => (
                    <div className="flex items-start" key={feat}>
                      <Check className="mt-0.5 mr-2 h-4 w-4 text-green-400" />
                      <span className="text-sm text-white/80">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 md:mt-0">
                <Button
                  variant="outline"
                  className="w-full cursor-pointer border-white/10 hover:bg-white/5 md:w-auto"
                  onClick={() => setShowPlans(true)}
                >
                  Manage Subscription
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {data?.detail &&
            data.detail.map((plan) => <Plan key={plan.id} plan={plan} />)}
        </div>
      )}
    </DashboardLayout>
  )
}

export default Dashboard

const Plan: FC<{ plan: SubscriptionPlan }> = ({ plan }) => {
  const router = useRouter()

  const { mutate: subscriptionMutation, isPending } = useMutation({
    mutationFn: initializeSubscription,
    onSuccess: (data) => {
      router.push(data.data.payment_url)
    },
  })

  return (
    <div
      className={`border bg-white/5 backdrop-blur-sm ${
        plan.name === 'pro' ? 'border-primary/30' : 'border-white/10'
      } relative rounded-xl p-8 transition-colors hover:bg-white/10`}
      key={plan.id}
    >
      {plan.name === 'pro' && (
        <div className="bg-primary absolute -top-3 left-1/2 -translate-x-1/2 transform rounded-full px-4 py-1 text-xs font-medium">
          POPULAR
        </div>
      )}
      <h3 className="font-heading mb-4 text-xl font-semibold capitalize">
        {plan.name}
      </h3>
      <div className="mb-4 text-4xl font-bold">
        ${plan.monthly_fee}
        <span className="text-lg text-white/60">/mo</span>
      </div>
      <ul className="mb-8 space-y-3 text-left text-white/70">
        {planFeats(plan.name).map((feat) => (
          <li key={feat}>• {feat}</li>
        ))}
      </ul>
      <Button
        className="bg-primary hover:bg-primary/90 w-full cursor-pointer"
        onClick={() => subscriptionMutation(plan.id)}
      >
        {isPending ? (
          <div className="mx-auto h-[24px] w-[24px] animate-spin rounded-full border-[3px] border-solid border-[rgba(0,0,0,0.2)] border-t-[#fff]"></div>
        ) : (
          'Get Started'
        )}
      </Button>
    </div>
  )
}
