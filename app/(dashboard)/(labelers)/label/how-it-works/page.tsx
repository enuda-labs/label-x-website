'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  CheckCircle2,
  DollarSign,
  CreditCard,
  HelpCircle,
  ChevronRight,
  Lightbulb,
  LayoutDashboard,
  Clock,
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
            Welcome to LabelX! As a labeler, you'll help review and annotate
            data for various projects. This guide will walk you through
            everything you need to know to get started.
          </p>
          <div className="bg-primary/10 border-primary/20 rounded-lg border p-4">
            <p className="text-sm text-white/90">
              <strong>Your Dashboard</strong> shows an overview of your assigned
              clusters, progress, and earnings. Use the sidebar to navigate
              between different sections.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'finding-clusters',
      title: 'Finding Available Clusters',
      icon: ClipboardList,
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            Clusters are groups of similar tasks that need to be labeled. Here's
            how to find and join them:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary mt-0.5 rounded-full p-1.5">
                <span className="text-sm font-bold text-white">1</span>
              </div>
              <div className="flex-1">
                <p className="mb-1 font-medium text-white">
                  Navigate to Available Clusters
                </p>
                <p className="text-sm text-white/70">
                  Click on <strong>"Available Clusters"</strong> in the sidebar
                  to see all clusters you can join.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary mt-0.5 rounded-full p-1.5">
                <span className="text-sm font-bold text-white">2</span>
              </div>
              <div className="flex-1">
                <p className="mb-1 font-medium text-white">Browse Clusters</p>
                <p className="text-sm text-white/70">
                  Each cluster card shows the task type (TEXT, IMAGE, VIDEO,
                  AUDIO), deadline, and how many labelers are needed. Clusters
                  are filtered based on your expertise domains.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary mt-0.5 rounded-full p-1.5">
                <span className="text-sm font-bold text-white">3</span>
              </div>
              <div className="flex-1">
                <p className="mb-1 font-medium text-white">
                  Assign to Yourself
                </p>
                <p className="text-sm text-white/70">
                  Click the <strong>"Assign to Me"</strong> button on a cluster
                  card to join it. Once assigned, the cluster will appear in
                  your "Clusters" section.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/label/available-tasks">
              <Button variant="outline" className="w-full sm:w-auto">
                <ClipboardList className="mr-2 h-4 w-4" />
                Go to Available Clusters
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: 'labeling-tasks',
      title: 'Labeling Different Task Types',
      icon: FileText,
      content: (
        <div className="space-y-6">
          <p className="text-white/80">
            Different task types require different labeling approaches. Here's
            how to handle each one:
          </p>

          <div className="space-y-4">
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="text-primary h-5 w-5" />
                  Text Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-white/80">
                  For text classification tasks, you'll see multiple choice
                  options or a text input field.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Multiple Choice:</strong> Select the most
                      appropriate label from the provided options
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Text Input:</strong> Type your classification or
                      annotation in the text field
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      You can add optional notes to provide additional context
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="text-primary h-5 w-5" />
                  Image Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-white/80">
                  For image annotation tasks, you need to upload an annotated
                  version of the image.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Review the original image displayed on the page
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Click "Choose Image" to select an annotated image from
                      your device
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Upload the image - it will be automatically submitted once
                      uploaded successfully
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Video className="text-primary h-5 w-5" />
                  Video Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-white/80">
                  For video tasks, you can record a new video or upload an
                  existing one with optional subtitles.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Record:</strong> Use the camera to record a new
                      video annotation
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Upload:</strong> Select an existing video file
                      from your device
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Subtitles:</strong> Optionally add subtitles
                      during recording or upload
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Music className="text-primary h-5 w-5" />
                  Audio Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-white/80">
                  For audio tasks, you can record audio directly or upload an
                  audio file.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Record:</strong> Click the microphone button to
                      record audio (up to 60 seconds)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      <strong>Upload:</strong> Select an audio file from your
                      device
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Review your recording before uploading
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
      id: 'completing-tasks',
      title: 'Completing Tasks',
      icon: CheckCircle2,
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            Once you've labeled an item, here's how to complete tasks and
            clusters:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary mt-0.5 rounded-full p-1.5">
                <span className="text-sm font-bold text-white">1</span>
              </div>
              <div className="flex-1">
                <p className="mb-1 font-medium text-white">Submit Your Label</p>
                <p className="text-sm text-white/70">
                  After providing your label (text, image, video, or audio),
                  click the <strong>"Submit Choice"</strong> or{' '}
                  <strong>"Submit & Continue"</strong> button. For
                  image/video/audio tasks, the label is automatically submitted
                  after successful upload.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary mt-0.5 rounded-full p-1.5">
                <span className="text-sm font-bold text-white">2</span>
              </div>
              <div className="flex-1">
                <p className="mb-1 font-medium text-white">
                  Navigate Between Items
                </p>
                <p className="text-sm text-white/70">
                  Use the <strong>"Next Task"</strong> and{' '}
                  <strong>"Previous Task"</strong> buttons to move between items
                  in the cluster. Your progress is saved automatically.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary mt-0.5 rounded-full p-1.5">
                <span className="text-sm font-bold text-white">3</span>
              </div>
              <div className="flex-1">
                <p className="mb-1 font-medium text-white">
                  Complete the Cluster
                </p>
                <p className="text-sm text-white/70">
                  When you reach the last item, the button will change to
                  <strong>"Complete Task"</strong>. Click it to finish the
                  cluster. You'll be redirected to your dashboard.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-primary mt-0.5 rounded-full p-1.5">
                <span className="text-sm font-bold text-white">4</span>
              </div>
              <div className="flex-1">
                <p className="mb-1 font-medium text-white">
                  Mark Missing Assets
                </p>
                <p className="text-sm text-white/70">
                  If an image, video, or audio file is missing or corrupted, use
                  the <strong>"Mark Missing"</strong> button to skip that item.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
            <p className="text-sm text-yellow-200">
              <strong>Note:</strong> All items in a cluster must be labeled
              before the cluster is considered complete. You can see your
              progress in the progress bar at the top of the task page.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'managing-earnings',
      title: 'Managing Earnings',
      icon: DollarSign,
      content: (
        <div className="space-y-4">
          <p className="text-white/80">
            Track your earnings and set up payments to receive your
            compensation:
          </p>
          <div className="space-y-3">
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="text-primary h-5 w-5" />
                  View Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-white/80">
                  Navigate to <strong>"Earnings"</strong> in the sidebar to see:
                </p>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    Total earnings accumulated
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    Earnings by month
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    Payment history
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="text-primary h-5 w-5" />
                  Add Bank Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-white/80">
                  To receive payments, you need to add your bank account:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Go to <strong>"Add Bank"</strong> in the sidebar
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Enter your bank account details
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-white/70">
                      Verify your account (if required)
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/label/bank">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Add Bank Account
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
      id: 'tips',
      title: 'Tips & Best Practices',
      icon: Lightbulb,
      content: (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-base">Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    Read instructions carefully before starting
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    Be consistent with your labeling
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    Review your labels before submitting
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-card/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-base">Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    Work through clusters systematically
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    Use keyboard shortcuts when available
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                    Take breaks to maintain focus
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-primary/10 border-primary/20 border">
            <CardContent className="pt-6">
              <p className="text-sm text-white/90">
                <strong>Need Help?</strong> If you encounter any issues or have
                questions, check the instructions provided with each cluster or
                contact support through your profile settings.
              </p>
            </CardContent>
          </Card>
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
              onClick={() => router.push('/label/overview')}
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
                A comprehensive guide for labelers
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
              <Link href="/label/overview">
                <Button variant="outline" className="w-full justify-start">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/label/available-tasks">
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Available Clusters
                </Button>
              </Link>
              <Link href="/label/tasks">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  My Clusters
                </Button>
              </Link>
              <Link href="/label/earnings">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Earnings
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
