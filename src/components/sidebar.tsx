// Sidebar — ElevenLabs-style sections adapted to Callen.ai.
// Brand mark, workspace switcher, then grouped nav: Agents / Configure /
// Monitor / Deploy, plus Settings and admin row at the bottom.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Plus,
  BookOpen,
  Wrench,
  Mic,
  Boxes,
  PhoneCall,
  History,
  BarChart3,
  Users,
  Smartphone,
  MessageCircle,
  Settings,
  Building2,
  Bot,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { TenantSwitcher } from "./tenant-switcher";
import { useCustomAgentsStore, useCustomAgentsHydrated, type CustomAgent } from "@/lib/custom-agents-store";
import { gradientCssForId } from "@/lib/avatar-gradients";

// =============================================================
// Nav model
// =============================================================

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: "alpha" | "live";
};

type NavSection = {
  label: string;
  // Optional + button next to the section header. Click goes to `addHref`.
  addHref?: string;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    label: "Agents",
    addHref: "/agent?new=1",
    items: [{ href: "/agent?new=1", label: "Create agent", icon: Plus }],
  },
  {
    label: "Configure",
    items: [
      { href: "/knowledge",     label: "Knowledge Base", icon: BookOpen },
      { href: "/tools",         label: "Tools",          icon: Wrench },
      { href: "/voices",        label: "Voices",         icon: Mic },
      { href: "/integrations",  label: "Integrations",   icon: Boxes, badge: "alpha" },
    ],
  },
  {
    label: "Monitor",
    items: [
      { href: "/calls/live", label: "Live Calls",   icon: PhoneCall, badge: "live" },
      { href: "/calls",      label: "Call History", icon: History },
      { href: "/analytics",  label: "Analytics",    icon: BarChart3 },
      { href: "/users",      label: "Users",        icon: Users },
    ],
  },
  {
    label: "Deploy",
    items: [
      { href: "/phone-numbers", label: "Phone Numbers", icon: Smartphone },
      { href: "/whatsapp",      label: "WhatsApp",      icon: MessageCircle },
    ],
  },
];

const BOTTOM_NAV: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/tenants",  label: "Tenants",  icon: Building2 },
];

// =============================================================
// Sidebar
// =============================================================

export function Sidebar() {
  const pathname = usePathname();
  const customAgentsHydrated = useCustomAgentsHydrated();
  const customAgents = useCustomAgentsStore((s) => s.agents);

  const isActive = (href: string) =>
    pathname === href ||
    // /agent matches /agent/* but not other routes
    (href !== "/" && href !== "/dashboard" && pathname.startsWith(href + "/")) ||
    (href === "/calls" && pathname === "/calls");

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-neutral-200 bg-white">
      {/* Brand */}
      <div className="flex items-center px-4 h-14 border-b border-neutral-200">
        <Link
          href="/dashboard"
          className="hover:opacity-80 transition-opacity"
        >
          <Logo size="lg" />
        </Link>
      </div>

      {/* Workspace switcher */}
      <div className="px-3 pt-3 pb-2">
        <TenantSwitcher variant="sidebar" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-3 space-y-4 overflow-y-auto">
        {/* Home */}
        <div className="pt-1">
          <SidebarLink
            href="/dashboard"
            label="Home"
            icon={Home}
            active={pathname === "/dashboard"}
          />
        </div>

        {/* Agents section first... */}
        <SidebarSection
          section={SECTIONS[0]}
          isActive={isActive}
          pathname={pathname}
        />

        {/* ...then the user's custom agents (only when there are any) */}
        {customAgentsHydrated && customAgents.length > 0 && (
          <YourAgentsSection agents={customAgents} pathname={pathname} />
        )}

        {/* ...then the rest of the sections */}
        {SECTIONS.slice(1).map((section) => (
          <SidebarSection
            key={section.label}
            section={section}
            isActive={isActive}
            pathname={pathname}
          />
        ))}
      </nav>

      {/* Bottom: settings + admin */}
      <div className="px-3 pt-2 pb-3 border-t border-neutral-200 space-y-0.5">
        {BOTTOM_NAV.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.href) || pathname === item.href}
          />
        ))}
      </div>

      {/* Pro plan card */}
      <div className="m-3 mt-0 p-4 rounded-2xl bg-neutral-950 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1">
            <Bot className="size-3 text-white/70" />
            <p className="text-xs font-semibold tracking-tight">Pro plan</p>
          </div>
          <p className="text-[11px] text-white/60 mb-2.5 tabular-nums">
            1,247 / 5,000 mins used
          </p>
          <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: "25%" }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

// =============================================================
// Section block
// =============================================================

function SidebarSection({
  section,
  isActive,
  pathname,
}: {
  section: NavSection;
  isActive: (href: string) => boolean;
  pathname: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between px-3 mb-1">
        <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
          {section.label}
        </p>
        {section.addHref && (
          <Link
            href={section.addHref}
            className="size-5 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label={`Add to ${section.label}`}
          >
            <Plus className="size-3" />
          </Link>
        )}
      </div>
      <div className="space-y-0.5">
        {section.items.map((item) => {
          const active =
            isActive(item.href) ||
            pathname === item.href ||
            (item.href === "/agent" && pathname.startsWith("/agent"));
          // Plus-icon items (like "Create agent") render with a dashed-style hint
          const isCreate = item.icon === Plus;
          return (
            <SidebarLink
              key={`${section.label}-${item.href}-${item.label}`}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={active}
              badge={item.badge}
              dim={isCreate && !active}
            />
          );
        })}
      </div>
    </div>
  );
}

// =============================================================
// Your agents — custom agents the user has created via the wizard
// or a template "Use template" click. Persisted in the custom-agents
// store so they survive reloads.
// =============================================================

function YourAgentsSection({
  agents,
  pathname,
}: {
  agents: CustomAgent[];
  pathname: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between px-3 mb-1">
        <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
          Your agents
        </p>
        <span className="text-[10px] text-neutral-400 tabular-nums">
          {agents.length}
        </span>
      </div>
      <div className="space-y-0.5">
        {agents.map((agent) => {
          const href = `/agent/${agent.id}`;
          const active = pathname === href;
          return (
            <Link
              key={agent.id}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
                active
                  ? "bg-neutral-100 text-neutral-950"
                  : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
              )}
            >
              <span
                className="size-4 rounded-full shrink-0 border border-neutral-200"
                style={{ background: gradientCssForId(agent.id) }}
                aria-hidden
              />
              <span className="flex-1 truncate">{agent.name}</span>
              {agent.status === "draft" && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-semibold tracking-wide">
                  Draft
                </span>
              )}
              {agent.status === "published" && (
                <span
                  className="relative flex size-1.5 shrink-0"
                  title="Published"
                >
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  <span className="relative rounded-full size-1.5 bg-emerald-500" />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================
// Single link
// =============================================================

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  badge,
  dim,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  badge?: "alpha" | "live";
  dim?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
        active
          ? "bg-neutral-100 text-neutral-950"
          : dim
          ? "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
          : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
      )}
    >
      <Icon className={cn("size-4 shrink-0", active ? "text-neutral-900" : "")} />
      <span className="flex-1 truncate">{label}</span>
      {badge === "alpha" && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[9px] font-semibold tracking-wide border border-neutral-200">
          Alpha
        </span>
      )}
      {badge === "live" && (
        <span className="relative flex size-2 shrink-0" title="2 calls live">
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
          <span className="relative rounded-full size-2 bg-emerald-500" />
        </span>
      )}
    </Link>
  );
}
