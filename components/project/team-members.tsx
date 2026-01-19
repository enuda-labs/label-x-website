'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Mail, X, MoreVertical } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listProjectMembers,
  listProjectInvitations,
  removeProjectMember,
  updateProjectMemberRole,
  cancelProjectInvitation,
  ProjectMember,
  ProjectInvitation,
} from '@/services/apis/project'
import { toast } from 'sonner'
import AddMemberDialog from './add-member-dialog'
import InviteMemberDialog from './invite-member-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useGlobalStore } from '@/context/store'
import { getUserDetails } from '@/services/apis/user'
import { useEffect } from 'react'

interface TeamMembersProps {
  projectId: number
  projectCreatedBy: number
}

const TeamMembers: React.FC<TeamMembersProps> = ({
  projectId,
  projectCreatedBy,
}) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [removeMemberId, setRemoveMemberId] = useState<number | null>(null)
  const [cancelInvitationId, setCancelInvitationId] = useState<number | null>(
    null
  )
  const [roleChangeMemberId, setRoleChangeMemberId] = useState<number | null>(
    null
  )
  const [selectedRole, setSelectedRole] = useState<
    'owner' | 'admin' | 'member' | 'viewer'
  >('member')
  const queryClient = useQueryClient()
  const { user, setUser } = useGlobalStore()

  // Fetch user details if not available in store
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getUserDetails,
    enabled: !user?.id, // Only fetch if user.id is not available
  })

  // Update user in store if fetched
  useEffect(() => {
    if (userData?.user && (!user?.id || user.id !== userData.user.id)) {
      setUser(userData.user)
    }
  }, [userData, user, setUser])

  // Use the user from store, or fallback to fetched user
  const currentUser = user?.id ? user : userData?.user

  const { data: membersData, isLoading: loadingMembers } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => listProjectMembers(projectId),
  })

  const { data: invitationsData, isLoading: loadingInvitations } = useQuery({
    queryKey: ['project-invitations', projectId],
    queryFn: () => listProjectInvitations(projectId),
  })

  const members: ProjectMember[] = membersData?.members || []
  const invitations: ProjectInvitation[] = invitationsData?.invitations || []

  // Check if current user can manage members (owner or admin)
  const currentUserMember = members.find((m) => m.user.id === currentUser?.id)
  // Project creator can always manage members, even if not in ProjectMember table yet
  // Handle cases where projectCreatedBy or currentUser?.id might be null/undefined
  const isProjectCreator =
    projectCreatedBy != null &&
    currentUser?.id != null &&
    Number(projectCreatedBy) === Number(currentUser.id)
  const canManageMembers =
    isProjectCreator ||
    currentUserMember?.role === 'admin' ||
    currentUserMember?.role === 'owner'

  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) => removeProjectMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-members', projectId],
      })
      toast.success('Member removed successfully')
      setRemoveMemberId(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to remove member')
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: number
      role: 'owner' | 'admin' | 'member' | 'viewer'
    }) => updateProjectMemberRole(projectId, userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-members', projectId],
      })
      toast.success('Member role updated successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to update role')
    },
  })

  const cancelInvitationMutation = useMutation({
    mutationFn: (invitationId: number) =>
      cancelProjectInvitation(projectId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['project-invitations', projectId],
      })
      toast.success('Invitation cancelled successfully')
      setCancelInvitationId(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to cancel invitation')
    },
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-purple-400/20 text-purple-400'
      case 'admin':
        return 'bg-blue-400/20 text-blue-400'
      case 'member':
        return 'bg-green-400/20 text-green-400'
      case 'viewer':
        return 'bg-gray-400/20 text-gray-400'
      default:
        return 'bg-white/10 text-white/60'
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

  return (
    <>
      <Card className="mb-6 border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Team Members</CardTitle>
            {canManageMembers ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10"
                  onClick={() => setInviteDialogOpen(true)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Invite
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setAddDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Members List */}
          {loadingMembers ? (
            <div className="text-white/60">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="text-white/60">No team members yet</div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-white">
                        {member.user.username}
                      </p>
                      <p className="text-sm text-white/60">
                        {member.user.email}
                      </p>
                    </div>
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {member.role}
                    </Badge>
                    {projectCreatedBy === member.user.id &&
                      currentUser?.id === member.user.id && (
                        <Badge className="bg-purple-400/20 text-purple-400">
                          Owner
                        </Badge>
                      )}
                  </div>
                  {canManageMembers && projectCreatedBy !== member.user.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRole(
                              (member.role as
                                | 'owner'
                                | 'admin'
                                | 'member'
                                | 'viewer') || 'member'
                            )
                            setRoleChangeMemberId(member.user.id)
                          }}
                        >
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400"
                          onClick={() => setRemoveMemberId(member.user.id)}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pending Invitations */}
          {loadingInvitations ? (
            <div className="mt-6 text-white/60">Loading invitations...</div>
          ) : (
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-white">
                Pending Invitations
              </h4>
              {invitations.filter((inv) => inv.status === 'pending').length >
              0 ? (
                <div className="space-y-2">
                  {invitations
                    .filter((inv) => inv.status === 'pending')
                    .map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-white/60" />
                          <div>
                            <p className="font-medium text-white">
                              {invitation.email}
                            </p>
                            <p className="text-sm text-white/60">
                              Invited as {invitation.role} • Expires{' '}
                              {formatDate(invitation.expires_at)}
                            </p>
                          </div>
                          <Badge className={getRoleBadgeColor(invitation.role)}>
                            {invitation.role}
                          </Badge>
                        </div>
                        {canManageMembers && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-red-400 hover:text-red-300"
                            onClick={() => setCancelInvitationId(invitation.id)}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Cancel invite
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-sm text-white/60">
                  No pending invitations
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddMemberDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        projectId={projectId}
      />
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        projectId={projectId}
      />

      {/* Remove Member Confirmation */}
      <AlertDialog
        open={removeMemberId !== null}
        onOpenChange={(open) => !open && setRemoveMemberId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the project? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (removeMemberId) {
                  removeMemberMutation.mutate(removeMemberId)
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Invitation Confirmation */}
      <AlertDialog
        open={cancelInvitationId !== null}
        onOpenChange={(open) => !open && setCancelInvitationId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this invitation?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cancelInvitationId) {
                  cancelInvitationMutation.mutate(cancelInvitationId)
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Role Dialog */}
      <Dialog
        open={roleChangeMemberId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRoleChangeMemberId(null)
            setSelectedRole('member')
          }
        }}
      >
        <DialogContent className="border-white/10 bg-[#0A0A0A] text-white">
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription className="text-white/60">
              Select a new role for this team member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value: any) => setSelectedRole(value)}
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
              variant="outline"
              onClick={() => {
                setRoleChangeMemberId(null)
                setSelectedRole('member')
              }}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => {
                if (roleChangeMemberId) {
                  updateRoleMutation.mutate({
                    userId: roleChangeMemberId,
                    role: selectedRole,
                  })
                  setRoleChangeMemberId(null)
                  setSelectedRole('member')
                }
              }}
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TeamMembers
