'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/shared/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUserDetails } from '@/services/apis/user';
import { getMyPlan } from '@/services/apis/subscription';
import { useRouter } from 'next/navigation';
import { TwoFactorSettings } from '@/components/profile/two-factor-settings';

interface UserProfile {
  name: string;
  email: string;
  company: string;
  plan: string;
}

const Profile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    company: '',
    plan: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: getUserDetails,
  });

  const { data: myPlan, isLoading: isCheckingPlan } = useQuery({
    queryKey: ['myPlan'],
    queryFn: getMyPlan,
  });
  //const { toast } = useToast();

  useEffect(() => {
    // Simulate API call to fetch user profile
    const fetchProfile = async () => {
      try {
        if (!data?.user) return;
        const { username, email } = data.user;

        const profileData = {
          name: username,
          email,
          company: '',
          plan: myPlan?.plan.name || '',
        };

        setProfile(profileData);
        setFormData({
          name: profileData.name,
          email: profileData.email,
          company: profileData.company,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    if (data?.user.id) {
      fetchProfile();
    }
  }, [data?.user, myPlan?.plan.name]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local storage (in a real app, this would be an API update)
      localStorage.setItem('userName', formData.name);
      localStorage.setItem('userEmail', formData.email);

      // Update local state
      setProfile({
        ...profile,
        name: formData.name,
        email: formData.email,
        company: formData.company,
      });

      toast('Profile updated', {
        description: 'Your profile has been successfully updated',
      });
    } catch {
      toast('Update failed', {
        description: 'There was an error updating your profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      toast("Passwords don't match", {
        description: 'New password and confirmation must match',
      });
      setIsSaving(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast('Password updated', {
        description: 'Your password has been successfully updated',
      });
    } catch {
      toast('Update failed', {
        description: 'There was an error updating your password',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // const formatDate = (dateString: string) => {
  // 	const date = new Date(dateString);
  // 	return new Intl.DateTimeFormat('en-US', {
  // 		month: 'long',
  // 		day: 'numeric',
  // 		year: 'numeric',
  // 	}).format(date);
  // };

  return (
    <DashboardLayout title="Profile">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Summary Card */}
        <Card className="bg-white/5 border-white/10 p-6 md:col-span-1">
          {loading ? (
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-24 w-24 rounded-full bg-white/10" />
              <Skeleton className="h-6 w-32 bg-white/10" />
              <Skeleton className="h-4 w-40 bg-white/10" />
              <Skeleton className="h-4 w-24 bg-white/10" />
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-white text-xl">
                  {profile.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h3 className="text-xl font-semibold text-white mt-4">{profile.name}</h3>
              <p className="text-white/60 text-center">{profile.email}</p>

              {!profile.plan ? (
                <div className="bg-primary/20 px-4 py-1 rounded-full">
                  <span className="text-primary text-sm font-medium capitalize">
                    {profile.plan} Plan
                  </span>
                </div>
              ) : (
                <Button
                  className="cursor-pointer bg-primary"
                  onClick={() => router.push('/subscriptions')}
                >
                  Subscribe now
                </Button>
              )}

              <div className="w-full mt-4 pt-4 border-t border-white/10">
                <div className="flex items-start mb-3">
                  <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                  <span className="text-sm text-white/80">Email verified</span>
                </div>
                {!isCheckingPlan && (
                  <div className="flex items-start">
                    {myPlan ? (
                      <Check className="h-4 w-4 text-green-400 mr-2 mt-0.5" />
                    ) : (
                      <X className="h-4 w-4 text-red-400 mr-2 mt-0.5" />
                    )}
                    <span className="text-sm text-white/80">Subscription active</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Profile Settings */}
        <div className="md:col-span-2 space-y-8">
          {/* Account Information */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Account Information</h3>

            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-white/10" />
                <Skeleton className="h-10 w-full bg-white/10" />
                <Skeleton className="h-10 w-full bg-white/10" />
                <Skeleton className="h-10 w-40 bg-white/10" />
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-6 bg-primary hover:bg-primary/90"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            )}
          </Card>

          <TwoFactorSettings />

          {/* Password Settings */}
          <Card className="bg-white/5 border-white/10 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>

            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-white/10" />
                <Skeleton className="h-10 w-full bg-white/10" />
                <Skeleton className="h-10 w-full bg-white/10" />
                <Skeleton className="h-10 w-40 bg-white/10" />
              </div>
            ) : (
              <form onSubmit={handlePasswordUpdate}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-6 bg-primary hover:bg-primary/90"
                  disabled={isSaving}
                >
                  {isSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
