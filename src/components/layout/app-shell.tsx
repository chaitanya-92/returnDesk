"use client";

import {
  Bell,
  ChevronDown,
  Command,
  LayoutDashboard,
  Menu,
  PackageCheck,
  PanelLeft,
  WalletCards,
  CreditCard,
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Return requests", href: "/requests", icon: PackageCheck },
  { label: "Refund requests", href: "/refunds", icon: WalletCards },
  { label: "Store credit", href: "/store-credits", icon: CreditCard },
];

function Brand() {
  const { collapsed, isMobile } = useSidebar();
  const compact = collapsed && !isMobile;
  return (
    <Link
      href="/"
      aria-label="ReturnDesk overview"
      className={`flex min-w-0 items-center ${compact ? "justify-center" : "gap-3"}`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F2B719] text-[#23221E]">
        <Command size={21} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block text-[15px] font-semibold tracking-[-0.03em]">
            ReturnDesk
          </span>
          <span className="mt-0.5 block text-xs text-[#59523D] dark:text-[#B8B3A5]">
            Returns workspace
          </span>
        </span>
      )}
    </Link>
  );
}

function WorkspaceSidebar() {
  const pathname = usePathname();
  const { collapsed, isMobile } = useSidebar();
  const compact = collapsed && !isMobile;
  return (
    <Sidebar>
      <SidebarHeader>
        <Brand />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {navigation.map(({ label, href, icon: Icon }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton
                  href={href}
                  isActive={
                    pathname === href ||
                    (href !== "/" && pathname.startsWith(href + "/"))
                  }
                  title={label}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  {!compact && <span className="flex-1">{label}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      {!compact && (
        <SidebarFooter>
          <div className="rounded-xl border border-[#F2E097] bg-white p-4 dark:border-[#434037] dark:bg-[#2F2E29]">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="size-2 rounded-full bg-[#F2B719]" /> Operations
              workspace
            </div>
            <p className="mt-2 text-xs leading-5 text-[#59523D] dark:text-[#B8B3A5]">
              Review requests and keep resolutions moving.
            </p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

function WorkspaceNavbar() {
  const { collapsed, isMobile, setCollapsed } = useSidebar();
  return (
    <header className="sticky top-0 z-30 grid h-[76px] grid-cols-[1fr_auto_1fr] items-center bg-white/95 px-4 text-[#23221E] backdrop-blur-md dark:bg-[#1C1C1A]/95 dark:text-[#F5F2EA] sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center justify-self-start gap-3">
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed(!collapsed)}
          >
            <PanelLeft size={18} />
          </Button>
        )}
        {isMobile && (
          <SidebarTrigger>
            <Menu size={18} />
          </SidebarTrigger>
        )}
        <div className="sm:hidden">
          <Brand />
        </div>
      </div>
      <div className="justify-self-center" aria-hidden="true" />
      <div className="flex items-center justify-self-end gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <Bell size={17} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto gap-2 rounded-lg p-1.5">
              <Avatar>
                <AvatarFallback>OP</AvatarFallback>
              </Avatar>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-semibold">Operations</span>
                <span className="block text-[10px] text-[#59523D] dark:text-[#B8B3A5]">
                  Administrator
                </span>
              </span>
              <ChevronDown size={14} className="hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Operations account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Bell size={15} /> Notification preferences
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Toaster />
      <WorkspaceSidebar />
      <div className="min-w-0 flex-1">
        <WorkspaceNavbar />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
