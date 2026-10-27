// Notifications bell + popover.
// Seeded with notifications keyed to real app surfaces. Click an item to
// mark-as-read and navigate to the source page. Unread count drives the
// badge dot on the bell.

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  Check,
  X,
  PhoneIncoming,
  Boxes,
  Users,
  BookOpenText,
  CreditCard,
  BarChart3,
  ArrowRightLeft,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotifKind =
  | "call_escalated"
  | "integration_connected"
  | "user_invited"
  | "kb_indexed"
  | "billing"
  | "summary"
  | "agent_published"
  | "system";

type Notification = {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  href: string;
  // Minutes ago when seeded. Converted to relative time at render.
  minutesAgo: number;
  read: boolean;
};

const KIND_META: Record<NotifKind, { icon: LucideIcon; tile: string }> = {
  call_escalated:        { icon: PhoneIncoming,  tile: "bg-rose-50 text-rose-700"       },
  integration_connected: { icon: Boxes,          tile: "bg-blue-50 text-blue-700"       },
  user_invited:          { icon: Users,          tile: "bg-emerald-50 text-emerald-700" },
  kb_indexed:            { icon: BookOpenText,   tile: "bg-amber-50 text-amber-700"     },
  billing:               { icon: CreditCard,     tile: "bg-violet-50 text-violet-700"   },
  summary:               { icon: BarChart3,      tile: "bg-neutral-100 text-neutral-700" },
  agent_published:       { icon: Sparkles,       tile: "bg-indigo-50 text-indigo-700"   },
  system:                { icon: ArrowRightLeft, tile: "bg-neutral-100 text-neutral-700" },
};

const SEED: Notification[] = [
  {
    id: "n1",
    kind: "call_escalated",
    title: "Call escalated to manager",
    body: "Complaint about spice level on order JJ 7689. Transcript attached.",
    href: "/calls",
    minutesAgo: 4,
    read: false,
  },
  {
    id: "n2",
    kind: "integration_connected",
    title: "Foodpanda integration is live",
    body: "Orders will now sync to your Cheezious POS automatically.",
    href: "/integrations",
    minutesAgo: 18,
    read: false,
  },
  {
    id: "n3",
    kind: "agent_published",
    title: "Agent published",
    body: "Cheezious Order Agent v8 is taking live calls.",
    href: "/agent",
    minutesAgo: 32,
    read: false,
  },
  {
    id: "n4",
    kind: "kb_indexed",
    title: "Menu updated",
    body: "3 new deals added. Update live agents so callers hear them.",
    href: "/menu",
    minutesAgo: 64,
    read: false,
  },
  {
    id: "n5",
    kind: "user_invited",
    title: "Teammate joined",
    body: "Hassan Raza accepted your invite and joined as Manager.",
    href: "/users",
    minutesAgo: 122,
    read: true,
  },
  {
    id: "n6",
    kind: "summary",
    title: "Daily call summary",
    body: "142 calls handled · 83% resolved · 7 escalations.",
    href: "/analytics",
    minutesAgo: 360,
    read: true,
  },
  {
    id: "n7",
    kind: "billing",
    title: "Payment received",
    body: "Pro plan, $199 monthly subscription. Next charge June 1.",
    href: "/settings",
    minutesAgo: 1440,
    read: true,
  },
  {
    id: "n8",
    kind: "system",
    title: "Region failover tested",
    body: "ap-south-1 → me-south-1 failover completed in 38ms.",
    href: "/settings",
    minutesAgo: 2880,
    read: true,
  },
];

function relativeTime(minutesAgo: number): string {
  if (minutesAgo < 1) return "just now";
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  const h = Math.floor(minutesAgo / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function NotificationsButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(SEED);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  // Close on outside click + escape
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const dismiss = (id: string) =>
    setItems((prev) => prev.filter((n) => n.id !== id));

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  const openItem = (n: Notification) => {
    markRead(n.id);
    setOpen(false);
    router.push(n.href);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        className="relative size-9 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums leading-none">
            {unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="absolute right-0 top-full mt-2 w-[360px] rounded-2xl border border-neutral-200 bg-white shadow-xl shadow-neutral-900/10 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold tracking-tight">Notifications</p>
                <p className="text-[11px] text-neutral-500">
                  {unread > 0 ? `${unread} unread` : "All caught up"}
                </p>
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-neutral-700 hover:text-neutral-950 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <div className="size-10 rounded-full bg-neutral-100 mx-auto mb-2 flex items-center justify-center">
                    <Check className="size-4 text-neutral-500" />
                  </div>
                  <p className="text-sm font-semibold tracking-tight">You're caught up</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    No new notifications.
                  </p>
                </div>
              ) : (
                <ul>
                  {items.map((n) => {
                    const meta = KIND_META[n.kind];
                    const Icon = meta.icon;
                    return (
                      <li
                        key={n.id}
                        className={cn(
                          "border-b border-neutral-100 last:border-b-0 transition-colors group",
                          !n.read && "bg-blue-50/30"
                        )}
                      >
                        <div className="px-4 py-3 flex items-start gap-2.5">
                          <button
                            onClick={() => openItem(n)}
                            className="flex-1 flex items-start gap-2.5 min-w-0 text-left"
                          >
                            <span
                              className={cn(
                                "size-8 rounded-lg flex items-center justify-center shrink-0",
                                meta.tile
                              )}
                            >
                              <Icon className="size-4" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-[13px] font-semibold tracking-tight truncate">
                                  {n.title}
                                </p>
                                {!n.read && (
                                  <span className="size-1.5 rounded-full bg-blue-600 shrink-0" />
                                )}
                              </div>
                              <p className="text-[11.5px] text-neutral-600 leading-snug line-clamp-2">
                                {n.body}
                              </p>
                              <p className="text-[10px] text-neutral-400 mt-1 tabular-nums">
                                {relativeTime(n.minutesAgo)}
                              </p>
                            </div>
                          </button>
                          <button
                            onClick={() => dismiss(n.id)}
                            aria-label="Dismiss"
                            className="opacity-0 group-hover:opacity-100 size-6 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-all"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50/40 flex items-center justify-between">
              <p className="text-[11px] text-neutral-500">
                {items.length} total
              </p>
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/settings");
                }}
                className="text-[11px] font-medium text-neutral-700 hover:text-neutral-950 transition-colors"
              >
                Notification settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
