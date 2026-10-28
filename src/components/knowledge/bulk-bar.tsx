// Selection toolbar shared by the Knowledge Base lists: a select-all
// checkbox, the selected count, and bulk actions. Delete asks once more
// before it fires (no browser dialogs).

"use client";

import { useState } from "react";
import { Trash2, Eye, EyeOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = Boolean(indeterminate);
      }}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      className="size-4 shrink-0 rounded border-neutral-300 accent-neutral-900 cursor-pointer"
    />
  );
}

export function BulkBar({
  total,
  selected,
  onSelectAll,
  onClear,
  onDelete,
  onSetEnabled,
  enabledLabels = ["Turn on", "Turn off"],
}: {
  total: number;
  selected: number;
  onSelectAll: (all: boolean) => void;
  onClear: () => void;
  onDelete: () => void;
  onSetEnabled: (enabled: boolean) => void;
  enabledLabels?: [string, string];
}) {
  const [confirming, setConfirming] = useState(false);
  if (total === 0) return null;
  const all = selected > 0 && selected === total;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-neutral-200 text-[12.5px]",
        selected > 0 ? "bg-neutral-950 text-white" : "bg-white"
      )}
    >
      <Checkbox
        checked={all}
        indeterminate={selected > 0 && !all}
        onChange={(v) => onSelectAll(v)}
        label="Select all"
      />
      {selected === 0 ? (
        <span className="text-neutral-500">Select all ({total})</span>
      ) : (
        <>
          <span className="font-semibold">{selected} selected</span>
          <div className="flex-1" />
          <BarButton onClick={() => onSetEnabled(true)} icon={<Eye className="size-3.5" />}>
            {enabledLabels[0]}
          </BarButton>
          <BarButton onClick={() => onSetEnabled(false)} icon={<EyeOff className="size-3.5" />}>
            {enabledLabels[1]}
          </BarButton>
          {confirming ? (
            <button
              onClick={() => {
                setConfirming(false);
                onDelete();
              }}
              onBlur={() => setConfirming(false)}
              autoFocus
              className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-red-600 hover:bg-red-700 font-medium"
            >
              <Trash2 className="size-3.5" />
              Delete {selected}?
            </button>
          ) : (
            <BarButton onClick={() => setConfirming(true)} icon={<Trash2 className="size-3.5" />}>
              Delete
            </BarButton>
          )}
          <button
            onClick={onClear}
            aria-label="Clear selection"
            className="size-7 rounded-full hover:bg-white/15 flex items-center justify-center"
          >
            <X className="size-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

function BarButton({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-white/10 hover:bg-white/20 font-medium"
    >
      {icon}
      {children}
    </button>
  );
}
