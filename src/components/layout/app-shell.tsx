"use client";

import {
  Bell, ChevronDown, Command, LayoutDashboard, Menu, Moon, PackageCheck,
  Search, Settings2, ShieldCheck, Sun,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const navigation = [
  { label: "Overview", href: "#overview", icon: LayoutDashboard },
  { label: "Return requests", href: "#requests", icon: PackageCheck, count: "30+" },
  { label: "Workflow", href: "#workflow", icon: ShieldCheck },
];

function Brand() {
  return (
    <a href="#overview" className="flex min-w-0 items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f4d84b] text-[#171711] shadow-sm"><Command size={21} strokeWidth={2.4} /></span>
      <span className="min-w-0"><span className="block text-[15px] font-semibold tracking-[-0.03em] text-[#202018]">ReturnDesk</span><span className="mt-0.5 block text-xs text-[#77766b]">Returns workspace</span></span>
    </a>
  );
}

function WorkspaceSidebar() {
  return (
    <Sidebar>
      <SidebarHeader><Brand /></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {navigation.map(({ label, href, icon: Icon, count }, index) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton href={href} isActive={index === 0}>
                  <Icon size={17} strokeWidth={1.8} />
                  <span className="flex-1">{label}</span>
                  {count && <SidebarMenuBadge>{count}</SidebarMenuBadge>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="rounded-2xl border border-[#efeddf] bg-[#faf9f1] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#353426]"><span className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" /> System operational</div>
          <p className="mt-2 text-xs leading-5 text-[#77766b]">Your returns workspace is ready. Review requests and keep every resolution on track.</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#ebe8d5]"><div className="h-full w-[82%] rounded-full bg-[#e7cb31]" /></div>
        </div>
        <Button variant="ghost" className="mt-3 w-full justify-start text-xs font-medium text-[#656458]"><Settings2 size={16} /> Workspace settings</Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function WorkspaceNavbar() {
  const [dark, setDark] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#eeece1] bg-[#fffef9]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger><Menu size={18} /></SidebarTrigger>
        <Separator orientation="vertical" className="hidden h-5 sm:block" />
        <div className="hidden items-center gap-2 text-xs text-[#8a897d] sm:flex"><span>Workspace</span><span>/</span><span className="font-semibold text-[#343326]">Overview</span></div>
        <div className="sm:hidden"><Brand /></div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden w-56 md:block"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#969487]" /><Input aria-label="Search requests" placeholder="Search requests..." className="h-9 border-[#eeece1] bg-white pl-9 pr-3 text-xs shadow-none" /></div>
        <Button variant="ghost" size="icon" aria-label="Toggle appearance" onClick={() => setDark(!dark)}>{dark ? <Moon size={17} /> : <Sun size={17} />}</Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative"><Bell size={17} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#e8c82f] ring-2 ring-[#fffef9]" /></Button>
        <Separator orientation="vertical" className="mx-0.5 hidden h-7 sm:block" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto gap-2 rounded-xl p-1.5 hover:bg-[#f7f5e9]">
              <Avatar><AvatarFallback>OP</AvatarFallback></Avatar>
              <span className="hidden text-left sm:block"><span className="block text-xs font-semibold text-[#333225]">Operations</span><span className="block text-[10px] text-[#8a897d]">Administrator</span></span>
              <ChevronDown size={14} className="hidden text-[#8a897d] sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Operations account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><Settings2 size={15} /> Workspace settings</DropdownMenuItem>
            <DropdownMenuItem><Bell size={15} /> Notification preferences</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <WorkspaceSidebar />
      <div className="min-w-0 flex-1">
        <WorkspaceNavbar />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </SidebarProvider>
  );
}
