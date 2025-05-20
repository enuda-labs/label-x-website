'use client'
import {LayoutDashboard, Clock, CreditCard ,User, LogOut } from "lucide-react"
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
  SidebarFooter
} from "@/components/ui/sidebar"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {toast} from 'sonner'
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon:LayoutDashboard
  },
  {
    title: "Projects",
    url: "/dashboard/projects",
    icon:Clock
  },
  {
    title: "Payments",
    url: "/dashboard/payment",
    icon: CreditCard,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
  
]

export function AppSidebar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);

    if (authStatus) {
      setUserName(localStorage.getItem("userName") || "User");
      setUserEmail(localStorage.getItem("userEmail") || "");
    } else {
      router.push(`/auth?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");

    toast("Logged out successfully",{
    description: "You have been logged out of your account",
    });

    router.push("/");
  };

  // const isActivePath = (path: string) => pathname === path;

  if (!isAuthenticated) {
    return null;
  }
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Link href="/" className="flex items-center space-x-2 mt-5">
            <div className="bg-primary rounded-md p-2 ">
              <span className="text-white font-bold">Lx</span>
            </div>
            <span className="text-white font-heading font-semibold text-lg">Label X</span>
          </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='mt-10'>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
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
              <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-white">
                  {userName.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-white/60 truncate">{userEmail}</p>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-white/10 hover:bg-white/10"
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
