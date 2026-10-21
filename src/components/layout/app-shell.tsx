"use client";

import { Bell, ChevronDown, Command, LayoutDashboard, Menu, Moon, PackageCheck, PanelLeft, Search, ShieldCheck, Sun } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { toggleTheme } from "@/lib/store/theme-slice";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

const navigation = [
  { label: "Overview", href: "#overview", icon: LayoutDashboard },
  { label: "Return requests", href: "#requests", icon: PackageCheck, count: "30+" },
  { label: "Workflow", href: "#workflow", icon: ShieldCheck },
];

function Brand() {
  const { collapsed, isMobile } = useSidebar();
  const compact = collapsed && !isMobile;
  return <a href="#overview" aria-label="ReturnDesk overview" className={`flex min-w-0 items-center ${compact ? "justify-center" : "gap-3"}`}>
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EABF24] text-[#202735]"><Command size={21} strokeWidth={2.4} /></span>
    {!compact && <span className="min-w-0"><span className="block text-[15px] font-semibold tracking-[-0.03em]">ReturnDesk</span><span className="mt-0.5 block text-xs text-[#687180] dark:text-[#B8C0CC]">Returns workspace</span></span>}
  </a>;
}

function WorkspaceSidebar() {
  const { collapsed, isMobile } = useSidebar();
  const compact = collapsed && !isMobile;
  return <Sidebar>
    <SidebarHeader><Brand /></SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarMenu>
          {navigation.map(({ label, href, icon: Icon, count }, index) => (
            <SidebarMenuItem key={label}>
              <SidebarMenuButton href={href} isActive={index === 0} title={label}>
                <Icon size={18} strokeWidth={1.8} />
                {!compact && <span className="flex-1">{label}</span>}
                {count && !compact && <SidebarMenuBadge>{count}</SidebarMenuBadge>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    {!compact && <SidebarFooter>
      <div className="rounded-2xl bg-[#F4F5F7] p-4 dark:bg-[#232A37]">
        <div className="flex items-center gap-2 text-xs font-semibold"><span className="size-2 rounded-full bg-[#EABF24]" /> System status</div>
        <p className="mt-2 text-xs leading-5 text-[#687180] dark:text-[#B8C0CC]">Review requests and keep every resolution on track.</p>
      </div>
    </SidebarFooter>}
  </Sidebar>;
}

function WorkspaceNavbar() {
  const dispatch = useAppDispatch();
  const dark = useAppSelector((state) => state.theme.mode === "dark");
  const { collapsed, isMobile, setCollapsed } = useSidebar();
  return <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between bg-white px-4 text-[#202735] dark:bg-[#171C26] dark:text-[#F3F5F8] sm:px-6 lg:px-8">
    <div className="flex min-w-0 items-center gap-3">
      {!isMobile && <Button variant="ghost" size="icon" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)}><PanelLeft size={18} /></Button>}
      {isMobile && <SidebarTrigger><Menu size={18} /></SidebarTrigger>}
      <div className="hidden items-center gap-2 text-xs text-[#687180] dark:text-[#B8C0CC] sm:flex"><span>Workspace</span><span>/</span><span className="font-semibold text-[#202735] dark:text-[#F3F5F8]">Overview</span></div>
      <div className="sm:hidden"><Brand /></div>
    </div>
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="relative hidden w-56 md:block"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#687180]" /><Input aria-label="Search requests" placeholder="Search requests..." className="h-9 border-[#DEE2E8] bg-[#F4F5F7] pl-9 pr-3 text-xs shadow-none dark:border-[#394252] dark:bg-[#232A37]" /></div>
      <Button variant="ghost" size="icon" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={() => dispatch(toggleTheme())}>{dark ? <Sun size={17} /> : <Moon size={17} />}</Button>
      <Button variant="ghost" size="icon" aria-label="Notifications" className="relative"><Bell size={17} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#EABF24]" /></Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-auto gap-2 rounded-xl p-1.5"><Avatar><AvatarFallback>OP</AvatarFallback></Avatar><span className="hidden text-left sm:block"><span className="block text-xs font-semibold">Operations</span><span className="block text-[10px] text-[#687180] dark:text-[#B8C0CC]">Administrator</span></span><ChevronDown size={14} className="hidden sm:block" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52"><DropdownMenuLabel>Operations account</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem><Bell size={15} /> Notification preferences</DropdownMenuItem></DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return <SidebarProvider><WorkspaceSidebar /><div className="min-w-0 flex-1"><WorkspaceNavbar /><main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main></div></SidebarProvider>;
}
