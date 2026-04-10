"use client"

import * as React from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()
  const { isMobile, state } = useSidebar()
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null)

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4 px-4 leading-none">Access Console</SidebarGroupLabel>
      <SidebarMenu className="gap-2">
        {items.map((item) => {
          // Khi sidebar collapsed và không phải mobile, dùng DropdownMenu
          if (state === "collapsed" && !isMobile) {
            return (
              <SidebarMenuItem key={item.title}>
                <DropdownMenu 
                  open={openDropdown === item.title}
                  onOpenChange={(open) => {
                    setOpenDropdown(open ? item.title : null)
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      className="h-10 w-10 data-[state=open]:bg-primary data-[state=open]:text-black transition-all rounded-xl"
                    >
                      {item.icon && <item.icon className="size-5" />}
                      <span className="sr-only">{item.title}</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="min-w-64 rounded-2xl bg-black border-white/10 shadow-3xl p-2 ml-4"
                    side="right"
                    align="start"
                    sideOffset={4}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <DropdownMenuLabel className="flex items-center gap-3 p-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.title}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <div className="p-2 space-y-1">
                      {item.items?.map((subItem) => {
                        const isActive = pathname === subItem.url
                        return (
                          <DropdownMenuItem 
                            key={subItem.title} 
                            asChild
                            onSelect={() => {
                              setOpenDropdown(null)
                            }}
                            className={`rounded-xl h-10 px-4 transition-all ${
                              isActive ? "bg-primary text-black font-black" : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <Link href={subItem.url} className="text-xs uppercase tracking-widest">
                              {subItem.title}
                            </Link>
                          </DropdownMenuItem>
                        )
                      })}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            )
          }

          // Khi sidebar expanded hoặc mobile, dùng Collapsible
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title} 
                    className="h-12 rounded-xl transition-all group-data-[state=open]/collapsible:bg-white/5"
                  >
                    {item.icon && <item.icon className="group-hover:text-primary transition-colors h-5 w-5" />}
                    <span className="font-black text-xs uppercase tracking-widest italic">{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-500 group-data-[state=open]/collapsible:rotate-90 h-4 w-4 text-slate-600" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <SidebarMenuSub className="border-l-2 border-primary/20 ml-6 py-2 gap-1 px-4">
                    {item.items?.map((subItem) => {
                      const isActive = pathname === subItem.url
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isActive} className={`h-10 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                            isActive ? "bg-primary text-black !opacity-100" : "text-slate-500 hover:text-white"
                          }`}>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
