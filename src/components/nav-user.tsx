"use client"

import { signOut } from "next-auth/react"
import {
  ChevronsUpDown,
  LogOut,
  Settings,
  User,
  Shield,
  Zap
} from "lucide-react"
import Link from "next/link"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  const handleLogout = async () => {
    // Note: ensure callbackUrl matches your project's standardized routing
    await signOut({ callbackUrl: '/login' })
  }

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-14 rounded-2xl transition-all border border-white/5 hover:bg-white/5 data-[state=open]:bg-primary data-[state=open]:text-black"
            >
              <Avatar className="h-10 w-10 rounded-xl border border-white/10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-xl font-black bg-tech-gray text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-black uppercase tracking-tighter italic">{user.name}</span>
                <span className="truncate text-[10px] font-black uppercase tracking-widest text-slate-500 group-data-[state=open]:text-black/60">Operator</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-[2rem] bg-black border border-white/10 shadow-3xl p-3"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={12}
          >
            <DropdownMenuLabel className="p-4 font-normal">
              <div className="flex items-center gap-4 text-left">
                <Avatar className="h-12 w-12 rounded-xl border border-primary/20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-xl bg-primary text-black font-black">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-black uppercase tracking-tighter italic text-white text-base">{user.name}</span>
                  <span className="truncate text-xs font-bold text-primary tracking-widest uppercase">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5 mx-2 my-2" />
            <DropdownMenuGroup className="p-2 space-y-1">
              <DropdownMenuItem asChild className="rounded-xl h-12 hover:bg-white/5 transition-all px-4">
                <Link href="/dashboard/profile" className="flex items-center gap-4 text-slate-400 hover:text-white">
                  <div className="p-2 bg-white/5 rounded-lg text-primary"><User className="size-4" /></div>
                  <span className="text-xs font-black uppercase tracking-widest">Hồ sơ cá nhân</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl h-12 hover:bg-white/5 transition-all px-4">
                <Link href="/dashboard/settings" className="flex items-center gap-4 text-slate-400 hover:text-white">
                  <div className="p-2 bg-white/5 rounded-lg text-primary"><Settings className="size-4" /></div>
                  <span className="text-xs font-black uppercase tracking-widest">Thiết lập hệ thống</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-white/5 mx-2 my-2" />
            <div className="p-2">
              <DropdownMenuItem 
                onClick={handleLogout}
                className="rounded-xl h-12 bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all px-4 cursor-pointer"
              >
                <LogOut className="size-4 mr-4" />
                <span className="text-xs font-black uppercase tracking-widest">Chấm dứt phiên làm việc</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
