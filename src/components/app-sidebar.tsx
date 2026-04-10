"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  Building2,
  Receipt,
  Settings,
  Shield,
  Building,
  AlertTriangle,
  Zap,
  Globe
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  
  const navMain = React.useMemo(() => {
    const baseItems = [
      {
        title: "Dữ liệu core",
        url: "#",
        icon: Building,
        isActive: true,
        items: [
          { title: "Hệ thống Tòa nhà", url: "/dashboard/buildings" },
          { title: "Quản lý Phòng", url: "/dashboard/rooms" },
          { title: "Cơ sở Khách thuê", url: "/dashboard/tenants" },
        ],
      },
      {
        title: "Tài chính & OPS",
        url: "#",
        icon: Receipt,
        items: [
          { title: "Hợp đồng thông minh", url: "/dashboard/contracts" },
          { title: "Quy trình Hóa đơn", url: "/dashboard/invoices" },
          { title: "Sổ cái Thanh toán", url: "/dashboard/payments" },
        ],
      },
      {
        title: "Monitoring",
        url: "#",
        icon: AlertTriangle,
        items: [
          { title: "Sự cố kỹ thuật", url: "/dashboard/incidents" },
          { title: "Hub Thông báo", url: "/dashboard/notifications" },
          { title: "Live Preview", url: "/dashboard/xem-web" },
        ],
      },
      {
        title: "Cấu hình",
        url: "#",
        icon: Settings,
        items: [
          { title: "Hồ sơ User", url: "/dashboard/profile" },
          { title: "Hệ thống Setup", url: "/dashboard/settings" },
        ],
      },
    ]

    if (session?.user?.role === 'admin') {
      baseItems.splice(3, 0, {
        title: "Administrators",
        url: "#",
        icon: Shield,
        items: [
          { title: "Phân quyền User", url: "/dashboard/users" },
        ],
      })
    }

    return baseItems
  }, [session?.user?.role])

  const userData = React.useMemo(() => ({
    name: session?.user?.name || "Admin User",
    email: session?.user?.email || "admin@rented.tech",
    avatar: session?.user?.avatar || "/avatars/default.jpg",
  }), [session])

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5" {...props}>
      <SidebarHeader className="p-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-primary/10 transition-all group">
              <a href="/dashboard">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-black shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
                  <Building2 className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-black uppercase tracking-tighter text-white italic">Rented<span className="text-primary italic">Room</span></span>
                  <span className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Terminal v2.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter className="p-4">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
