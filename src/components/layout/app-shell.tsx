"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, ChevronDown, Command, LayoutDashboard, Menu, Moon, PackageCheck,
  Search, Settings2, ShieldCheck, Sun, X,
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "#overview", icon: LayoutDashboard },
  { label: "Return requests", href: "#requests", icon: PackageCheck, count: "30+" },
  { label: "Workflow", href: "#workflow", icon: ShieldCheck },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#overview" className="flex min-w-0 items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f4d84b] text-[#171711] shadow-sm">
        <Command size={21} strokeWidth={2.4} />
      </span>
      {!compact && <span className="min-w-0"><span className="block text-[15px] font-semibold tracking-[-0.03em] text-[#202018]">ReturnDesk</span><span className="mt-0.5 block text-xs text-[#77766b]">Returns workspace</span></span>}
    </a>
  );
}

export function AppSidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-[#fffef9]">
      <div className="flex h-[76px] items-center border-b border-[#eeece1] px-5"><Brand /></div>
      <div className="px-4 pt-7">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#969487]">Workspace</p>
        <nav aria-label="Main navigation" className="space-y-1">
          {navigation.map(({ label, href, icon: Icon, count }, index) => (
            <a key={label} href={href} onClick={onNavigate} className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-all duration-200 ${index === 0 ? "bg-[#f8e878] text-[#24220f] shadow-[inset_0_0_0_1px_rgba(160,137,15,0.10)]" : "text-[#656458] hover:bg-[#f7f5e9] hover:text-[#252419]"}`}>
              <Icon size={17} strokeWidth={1.8} />
              <span className="flex-1">{label}</span>
              {count && <span className="rounded-md bg-white/75 px-2 py-0.5 text-[10px] font-semibold text-[#6d6743]">{count}</span>}
              {index === 0 && <span className="h-1.5 w-1.5 rounded-full bg-[#b49a13]" />}
            </a>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-[#efeddf] bg-[#faf9f1] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#353426]"><span className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" /> System operational</div>
          <p className="mt-2 text-xs leading-5 text-[#77766b]">Your returns workspace is ready. Review requests and keep every resolution on track.</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#ebe8d5]"><div className="h-full w-[82%] rounded-full bg-[#e7cb31]" /></div>
        </div>
        <button type="button" className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-[#656458] transition hover:bg-[#f7f5e9]"><Settings2 size={16} /> Workspace settings</button>
      </div>
    </div>
  );
}

export function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const [dark, setDark] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#eeece1] bg-[#fffef9]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenuClick} aria-label="Open navigation" className="grid size-9 place-items-center rounded-xl border border-[#ece9da] text-[#555447] transition hover:bg-[#f7f5e9] lg:hidden"><Menu size={18} /></button>
        <div className="hidden items-center gap-2 text-xs text-[#8a897d] sm:flex"><span>Workspace</span><span>/</span><span className="font-semibold text-[#343326]">Overview</span></div>
        <div className="sm:hidden"><Brand /></div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden h-9 w-56 items-center gap-2 rounded-xl border border-[#eeece1] bg-white px-3 md:flex"><Search size={15} className="text-[#969487]" /><span className="flex-1 text-xs text-[#969487]">Search requests...</span><kbd className="rounded border border-[#e9e6d9] px-1.5 py-0.5 text-[10px] text-[#898777]">⌘ K</kbd></div>
        <button type="button" aria-label="Toggle appearance" onClick={() => setDark(!dark)} className="grid size-9 place-items-center rounded-xl text-[#656458] transition hover:bg-[#f7f5e9]">{dark ? <Moon size={17} /> : <Sun size={17} />}</button>
        <button type="button" aria-label="Notifications" className="relative grid size-9 place-items-center rounded-xl text-[#656458] transition hover:bg-[#f7f5e9]"><Bell size={17} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#e8c82f] ring-2 ring-[#fffef9]" /></button>
        <span className="mx-0.5 hidden h-7 w-px bg-[#eeece1] sm:block" />
        <button type="button" className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-[#f7f5e9]"><span className="grid size-9 place-items-center rounded-xl bg-[#f4df62] text-xs font-bold text-[#292715]">OP</span><span className="hidden text-left sm:block"><span className="block text-xs font-semibold text-[#333225]">Operations</span><span className="block text-[10px] text-[#8a897d]">Administrator</span></span><ChevronDown size={14} className="hidden text-[#8a897d] sm:block" /></button>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f8f7f0] text-[#252419]">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 border-r border-[#eeece1] lg:block"><AppSidebar /></aside>
        <div className="min-w-0 flex-1">
          <AppHeader onMenuClick={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} />
          <motion.aside className="absolute inset-y-0 left-0 w-[min(84vw,300px)] border-r border-[#eeece1] bg-[#fffef9] shadow-2xl" initial={{ x: -24 }} animate={{ x: 0 }} exit={{ x: -24 }} transition={{ duration: 0.2, ease: "easeOut" }}>
            <div className="absolute right-3 top-5 z-10"><button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="grid size-9 place-items-center rounded-xl hover:bg-[#f7f5e9]"><X size={18} /></button></div>
            <AppSidebar mobile onNavigate={() => setMobileOpen(false)} />
          </motion.aside>
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}
