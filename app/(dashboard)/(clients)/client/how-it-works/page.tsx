'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  FolderPlus,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Database,
  BarChart3,
  Key,
  CreditCard,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  Settings,
  Eye,
  LayoutDashboard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/shared/dashboard-layout'

const HowItWorksPage = () => {
  const router = useRouter()

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            Welcome to LabelX! As a client, you can create projects, submit
            tasks for labeling, and manage your data annotation workflow. This
            guide will help you get started.
          </p>
          <div className="bg-primary/10 border-primary/20 rounded-lg border p-4">
            <p className="text-sm text-white/90">
              <strong>Your Dashboard</strong> provides an overview of your
              projects, task progress, and account statistics. Use the sidebar
              to navigate between different sections.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'creating-projects',
      title: 'Creating Your First Project',
      icon: FolderPlus,
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            Projects are containers for organizing your labeling tasks. Here's
            how to create one:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary mt-0.5 rounded-full p-1.5">
                <span className="text-sm font-bold text-white">1</span>
              </div>
              <div className="flex-1">
                <p className="mb-1 font-medium text-white">
                  Navigate to Projects
                </p>
                <p className="text-sm text-white/70">
                  Click on <strong>"Projects"</strong> in the sidebar, or use
                  the "New Project" button on your dashboard.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary mt-0.5 rounded-full p-1.5">
                <span className="text-sm font-bold text-white">2</span>
              </div>
              <div className="flex-1">
                <p className="mb-1 font-medium text-white">
                  Create New Project
                </p>
                <p className="text-sm text-white/70">
                  Click the <strong>"New Project"</strong> button and fill in:
                </p>
                <ul className="mt-2 ml-4 space-y-1 text-sm text-white/60">
                  <li>• Project name (e.g., "Content Moderation Project")</li>
                  <li>• Description (optional but recommended)</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary mt-0.5 rounded-full p-1.5">
                <span className="text-sm font-bold text-white">3</span>
              </div>
              <div className="flex-1">
                <p className="mb-1 font-medium text-white">Save Project</p>
                <p className="text-sm text-white/70">
                  Click <strong>"Create Project"</strong> to save. Your project
                  will appear in your projects list.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/client/projects">
              <Button variant="outline" className="w-full sm:w-auto">
                <FolderPlus className="mr-2 h-4 w-4" />
                Go to Projects
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: 'submitting-tasks',
      title: 'Submitting Tasks',
      icon: Upload,
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            Once you have a project, you can create task clusters for labeling.
            Here's the step-by-step process:
          </p>
          <div className="space-y-4">
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="bg-primary rounded-full p-1.5 text-sm font-bold text-white">
                    1
                  </span>
                  Select Data Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-white/80">
                  Choose the type of data you want to label:
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Badge variant="outline" className="justify-start">
                    <FileText className="mr-2 h-3 w-3" />
                    TEXT
                  </Badge>
                  <Badge variant="outline" className="justify-start">
                    <ImageIcon className="mr-2 h-3 w-3" />
                    IMAGE
                  </Badge>
                  <Badge variant="outline" className="justify-start">
                    <Video className="mr-2 h-3 w-3" />
                    VIDEO
                  </Badge>
                  <Badge variant="outline" className="justify-start">
                    <Music className="mr-2 h-3 w-3" />
                    AUDIO
                  </Badge>
                  <Badge variant="outline" className="justify-start">
                    <Database className="mr-2 h-3 w-3" />
                    CSV
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="bg-primary rounded-full p-1.5 text-sm font-bold text-white">
                    2
                  </span>
                  Configure Task Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Task Name:</strong> Give your cluster a
                      descriptive name
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Input Type:</strong> Choose multiple choice or
                      text input for labelers
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Labeling Choices:</strong> Define options for
                      multiple choice tasks
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Instructions:</strong> Provide clear guidelines
                      for labelers
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Labelers Required:</strong> Set how many labelers
                      should review each item (default: 3)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Deadline:</strong> Set a completion deadline for
                      the cluster
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="bg-primary rounded-full p-1.5 text-sm font-bold text-white">
                    3
                  </span>
                  Upload Your Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-white/80">
                  Add your data items to be labeled:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Text:</strong> Enter text directly or upload a CSV
                      file
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Images/Videos/Audio:</strong> Upload files
                      directly or provide URLs
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      You can add multiple items to a single cluster
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="bg-primary rounded-full p-1.5 text-sm font-bold text-white">
                    4
                  </span>
                  Review & Submit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-white/80">
                  Before submitting, review your configuration:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Verify all settings are correct
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Check data point costs in the preview
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Click <strong>"Submit"</strong> to create the cluster
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 'task-types',
      title: 'Understanding Task Types',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            Different task types serve different purposes. Choose the right one
            for your needs:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="text-primary h-5 w-5" />
                  TEXT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80">
                  Perfect for text classification, sentiment analysis, content
                  moderation, and categorization tasks.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="text-primary h-5 w-5" />
                  IMAGE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80">
                  Use for image annotation, object detection, image
                  classification, and visual content moderation.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Video className="text-primary h-5 w-5" />
                  VIDEO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80">
                  Ideal for video annotation, scene classification, content
                  moderation, and video transcription tasks.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Music className="text-primary h-5 w-5" />
                  AUDIO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80">
                  Great for audio transcription, speech classification,
                  sentiment analysis, and audio content moderation.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/20 border-white/10 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Database className="text-primary h-5 w-5" />
                  CSV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80">
                  Use for structured data annotation, data validation, and bulk
                  text processing tasks. Upload CSV files with your data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 'monitoring-progress',
      title: 'Monitoring Progress',
      icon: BarChart3,
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            Track the progress of your labeling tasks and review results:
          </p>
          <div className="space-y-3">
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="text-primary h-5 w-5" />
                  View Cluster Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-white/80">
                  In your project view, you can see:
                </p>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    Completion percentage for each cluster
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    Number of tasks completed vs. total
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    Cluster status (Pending, In Review, Completed)
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    Deadline information
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="text-primary h-5 w-5" />
                  Review Labeled Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-white/80">
                  Once labelers complete tasks, you can:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      View individual labels submitted by labelers
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Download labeled data for analysis
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Compare labels from multiple labelers for quality control
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 'api-integration',
      title: 'API Integration',
      icon: Key,
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            Use our API to programmatically submit tasks and manage your
            projects:
          </p>
          <div className="space-y-3">
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Key className="text-primary h-5 w-5" />
                  Generate API Keys
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Go to <strong>"Api Keys"</strong> in the sidebar
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Click <strong>"Create API Key"</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Copy and securely store your API key (it's only shown
                      once)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Use the key in API requests with the header:{' '}
                      <code className="rounded bg-white/10 px-1 text-xs">
                        Authorization: Bearer YOUR_API_KEY
                      </code>
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/client/api-keys">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Manage API Keys
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-base">API Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-white/80">
                  Common API operations include:
                </p>
                <ul className="space-y-2 font-mono text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      <code className="text-primary">
                        POST /api/v1/tasks/cluster/
                      </code>{' '}
                      - Create task cluster
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      <code className="text-primary">
                        GET /api/v1/tasks/project/{'{id}'}/clusters/
                      </code>{' '}
                      - List clusters
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      <code className="text-primary">GET /api/docs</code> - View
                      full API documentation
                    </span>
                  </li>
                </ul>
                <div className="mt-4">
                  <Link href="/api/docs" target="_blank">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View API Docs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 'billing',
      title: 'Billing & Data Points',
      icon: CreditCard,
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            Understand how billing works and manage your subscription:
          </p>
          <div className="space-y-3">
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="text-primary h-5 w-5" />
                  Subscription Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-white/80">
                  Choose a plan that fits your needs:
                </p>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      <strong>Starter:</strong> Includes data points and API
                      requests
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      <strong>Pro:</strong> Higher limits for larger projects
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      <strong>Enterprise:</strong> Custom plans for high-volume
                      usage
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-base">Data Points</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-white/80">
                  Data points are consumed when you submit tasks:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Each task item uses a certain number of data points
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Monitor your balance on the dashboard
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Top up data points when needed
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-base">Payment Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Go to <strong>"Payments"</strong> to manage billing
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      View payment history and invoices
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Update payment methods
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/client/payment">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Payments
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/client/overview')}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
                <HelpCircle className="text-primary h-8 w-8" />
                How it Works
              </h1>
              <p className="mt-1 text-white/60">
                A comprehensive guide for clients
              </p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <Card
                key={section.id}
                className="bg-card/20 border-white/10 shadow-lg"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="bg-primary/20 rounded-lg p-2">
                      <Icon className="text-primary h-6 w-6" />
                    </div>
                    <span>{section.title}</span>
                    <Badge variant="outline" className="ml-auto">
                      {index + 1} of {sections.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>{section.content}</CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Links */}
        <Card className="bg-primary/10 border-primary/20 border">
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/client/overview">
                <Button variant="outline" className="w-full justify-start">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/client/projects">
                <Button variant="outline" className="w-full justify-start">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Projects
                </Button>
              </Link>
              <Link href="/client/api-keys">
                <Button variant="outline" className="w-full justify-start">
                  <Key className="mr-2 h-4 w-4" />
                  API Keys
                </Button>
              </Link>
              <Link href="/client/payment">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default HowItWorksPage
