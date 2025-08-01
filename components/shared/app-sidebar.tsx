'use client'
import {
  LayoutDashboard,
  Clock,
  Key,
  CreditCard,
  User,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'

import { Button } from '../ui/button'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserDetails } from '@/services/apis/user'
import { useGlobalStore } from '@/context/store'
const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    url: '/dashboard/projects',
    icon: Clock,
  },
  {
    title: 'Api Keys',
    url: '/dashboard/api-keys',
    icon: Key,
  },
  {
    title: 'Payments',
    url: '/dashboard/payment',
    icon: CreditCard,
  },
  {
    title: 'Profile',
    url: '/dashboard/profile',
    icon: User,
  },
]

export function AppSidebar() {
  const { setUser, setIsLoggedIn } = useGlobalStore()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const queryClient = useQueryClient()

  const router = useRouter()
  const pathname = usePathname()

  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: getUserDetails,
  })

  useEffect(() => {
    if (data) {
      setUserName(data.user.username)
      setUserEmail(data.user.email)
    }
  }, [data])

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    setIsAuthenticated(!!token)

    if (!token) {
      router.push(`/auth/login?returnTo=${encodeURIComponent(pathname)}`)
    }
  }, [router, pathname])

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    toast('Logged out successfully', {
      description: 'You have been logged out of your account',
    })
    queryClient.invalidateQueries({ queryKey: ['offer-ride'] })
    router.push('/')
  }

  const isActivePath = (path: string) => pathname === path

  if (!isAuthenticated) {
    return null
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Link href="/" className="mt-5 flex items-center space-x-2">
              <div className="bg-primary rounded-md p-2">
                <span className="font-bold text-white">Lx</span>
              </div>
              <span className="font-heading text-lg font-semibold text-white">
                Label X
              </span>
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-10">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={`mb-2 rounded-md transition-colors ${
                        isActivePath(item.url)
                          ? 'bg-primary font-semibold text-white'
                          : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="border-t border-white/10 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-white">
                      {userName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="truncate text-sm font-medium text-white">
                      {userName}
                    </p>
                    <p className="truncate text-xs text-white/60">
                      {userEmail}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full cursor-pointer border-white/10 hover:bg-white/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
            {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>

                  <SidebarMenuButton >
                   <User2 /> Username
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
