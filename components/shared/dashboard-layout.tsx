import React from 'react'
import { SidebarTrigger } from '../ui/sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}
const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
    return (
        <div className="pt-3 pb-5 md:pb-5">
           <div className='flex items-center gap-2 mb-6'>
             <SidebarTrigger/>
          <h1 className="text-2xl  font-bold text-white">{title}</h1>
           </div>
          {children}
        </div>
    )
}

export default DashboardLayout
