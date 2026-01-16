'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addProjectMember } from '@/services/apis/project'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'

interface AddMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: number
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  open,
  onOpenChange,
  projectId,
}) => {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member')
  const queryClient = useQueryClient()

  const { mutate: addMember, isPending } = useMutation({
    mutationFn: () =>
      addProjectMember(projectId, {
        email,
        role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-members', projectId],
      })
      toast.success('Member added successfully')
      setEmail('')
      setRole('member')
      onOpenChange(false)
    },
    onError: (error: any) => {
      if (isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Failed to add member'

        // Check if user doesn't exist
        if (
          error.response?.status === 404 ||
          errorMessage.toLowerCase().includes('not found') ||
          errorMessage.toLowerCase().includes('user not found')
        ) {
          toast.error('User not found', {
            description:
              "This user doesn't have an account yet. Please use the 'Invite' button to send them an invitation to join the project.",
            duration: 10000,
            className: 'text-white [&>div]:text-white',
          })
        } else {
          toast.error(errorMessage, {
            className: 'text-white [&>div]:text-white',
          })
        }
      } else {
        toast.error('Failed to add member', {
          className: 'text-white [&>div]:text-white',
        })
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }
    addMember()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#0A0A0A] text-white">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription className="text-white/60">
            Add an existing user to this project. The user must already have an
            account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/10 bg-white/5 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value: any) => setRole(value)}
              >
                <SelectTrigger className="border-white/10 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isPending}
            >
              {isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddMemberDialog
