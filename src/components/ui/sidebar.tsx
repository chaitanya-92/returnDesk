"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};
const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("Sidebar components must be used within SidebarProvider.");
  return context;
}

function SidebarProvider({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const [openMobile, setOpenMobile] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return <SidebarContext.Provider value={{ openMobile, setOpenMobile, isMobile, collapsed, setCollapsed }}><div data-sidebar="provider" className={cn("flex min-h-screen w-full bg-[#F4F5F7] text-[#202735] dark:bg-[#171C26] dark:text-[#F3F5F8]", className)} {...props}>{children}</div></SidebarContext.Provider>;
}

function Sidebar({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const { isMobile, openMobile, setOpenMobile, collapsed } = useSidebar();
  if (isMobile) {
    return <DialogPrimitive.Root open={openMobile} onOpenChange={setOpenMobile}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content aria-describedby={undefined} className={cn("fixed inset-y-0 left-0 z-50 flex h-full w-[min(84vw,300px)] flex-col bg-white text-[#202735] shadow-xl outline-none dark:bg-[#171C26] dark:text-[#F3F5F8] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-200", className)} {...props}>
          <DialogPrimitive.Title className="sr-only">Main navigation</DialogPrimitive.Title>{children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>;
  }
  return <aside data-sidebar="sidebar" data-collapsed={collapsed} className={cn("sticky top-0 flex h-screen shrink-0 flex-col bg-white text-[#202735] transition-[width] duration-200 ease-in-out dark:bg-[#171C26] dark:text-[#F3F5F8]", collapsed ? "w-[72px]" : "w-[248px]", className)} {...props}>{children}</aside>;
}
function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-sidebar="header" className={cn("flex h-[76px] items-center px-4", className)} {...props} />;
}
function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-sidebar="content" className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", className)} {...props} />;
}
function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-sidebar="footer" className={cn("mt-auto p-3", className)} {...props} />;
}
function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-sidebar="group" className={cn("px-3 pt-6", className)} {...props} />;
}
function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useSidebar();
  if (collapsed) return null;
  return <div data-sidebar="group-label" className={cn("mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#687180] dark:text-[#B8C0CC]", className)} {...props} />;
}
function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul data-sidebar="menu" className={cn("space-y-1", className)} {...props} />;
}
function SidebarMenuItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li data-sidebar="menu-item" className={cn("relative", className)} {...props} />;
}
function SidebarMenuButton({ isActive = false, className, children, title, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean }) {
  const { setOpenMobile, collapsed } = useSidebar();
  return <a data-sidebar="menu-button" data-active={isActive} title={collapsed ? title || (typeof children === "string" ? children : undefined) : title} onClick={() => setOpenMobile(false)} className={cn("group flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EABF24]", collapsed && "justify-center px-0", isActive ? "bg-[#FBF2CC] text-[#202735] dark:bg-[#51451E] dark:text-[#FFF8D8]" : "text-[#687180] hover:bg-[#F4F5F7] hover:text-[#202735] dark:text-[#B8C0CC] dark:hover:bg-[#232A37] dark:hover:text-white", className)} {...props}>{children}</a>;
}
function SidebarMenuBadge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  const { collapsed } = useSidebar();
  if (collapsed) return null;
  return <span className={cn("ml-auto rounded-md bg-[#F4F5F7] px-2 py-0.5 text-[10px] font-semibold text-[#202735] dark:bg-[#2B3342] dark:text-[#F3F5F8]", className)} {...props} />;
}
function SidebarTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpenMobile, setCollapsed, isMobile, collapsed } = useSidebar();
  return <button type="button" aria-label={isMobile ? "Open navigation" : collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => isMobile ? setOpenMobile(true) : setCollapsed(!collapsed)} className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-[#687180] transition-colors hover:bg-[#F4F5F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EABF24] dark:text-[#B8C0CC] dark:hover:bg-[#232A37]", className)} {...props} />;
}

export { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuBadge, SidebarTrigger, useSidebar };
