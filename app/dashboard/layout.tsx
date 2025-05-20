import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"
 
export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='w-full overflow-x-hidden p-4 md:px-10'>
        {children}
      </main>
    </SidebarProvider>
  )
}