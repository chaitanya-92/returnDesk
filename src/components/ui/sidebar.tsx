"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

type SidebarContextValue = { openMobile: boolean; setOpenMobile: (open: boolean) => void; isMobile: boolean };
const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("Sidebar components must be used within SidebarProvider.");
  return context;
}

function SidebarProvider({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const [openMobile, setOpenMobile] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return <SidebarContext.Provider value={{ openMobile, setOpenMobile, isMobile }}><div data-sidebar="provider" className={cn("flex min-h-screen w-full bg-[#f8f7f0]", className)} {...props}>{children}</div></SidebarContext.Provider>;
}

function Sidebar({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  if (isMobile) {
    return <DialogPrimitive.Root open={openMobile} onOpenChange={setOpenMobile}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content aria-describedby={undefined} className={cn("fixed inset-y-0 left-0 z-50 flex h-full w-[min(84vw,300px)] flex-col border-r border-[#eeece1] bg-[#fffef9] shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left duration-200", className)} {...props}>
          <DialogPrimitive.Title className="sr-only">Main navigation</DialogPrimitive.Title>{children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>;
  }
  return <aside data-sidebar="sidebar" className={cn("sticky top-0 flex h-screen w-[252px] shrink-0 flex-col border-r border-[#eeece1] bg-[#fffef9]", className)} {...props}>{children}</aside>;
}

function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-sidebar="header" className={cn("flex h-[76px] items-center border-b border-[#eeece1] px-5", className)} {...props} />;
}
function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-sidebar="content" className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", className)} {...props} />;
}
function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-sidebar="footer" className={cn("mt-auto p-4", className)} {...props} />;
}
function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-sidebar="group" className={cn("px-4 pt-7", className)} {...props} />;
}
function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-sidebar="group-label" className={cn("mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#969487]", className)} {...props} />;
}
function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul data-sidebar="menu" className={cn("space-y-1", className)} {...props} />;
}
function SidebarMenuItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li data-sidebar="menu-item" className={cn("relative", className)} {...props} />;
}
function SidebarMenuButton({ isActive = false, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean }) {
  const { setOpenMobile } = useSidebar();
  return <a data-sidebar="menu-button" data-active={isActive} onClick={() => setOpenMobile(false)} className={cn("group flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5cc39]", isActive ? "bg-[#f8e878] text-[#24220f] shadow-[inset_0_0_0_1px_rgba(160,137,15,0.10)]" : "text-[#656458] hover:bg-[#f7f5e9] hover:text-[#252419]", className)} {...props} />;
}
function SidebarMenuBadge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("ml-auto rounded-md bg-white/75 px-2 py-0.5 text-[10px] font-semibold text-[#6d6743]", className)} {...props} />;
}
function SidebarTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpenMobile } = useSidebar();
  return <button type="button" aria-label="Open navigation" onClick={() => setOpenMobile(true)} className={cn("inline-flex size-9 items-center justify-center rounded-lg text-[#656458] transition hover:bg-[#f7f5e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5cc39] lg:hidden", className)} {...props} />;
}

export { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuBadge, SidebarTrigger, useSidebar };
