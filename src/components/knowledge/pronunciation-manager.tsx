// Pronunciation list for the Knowledge Base: "written on the menu" ->
// "say it as" in Urdu script, e.g. BBQ -> باربی کیو. Rows are
// knowledge_docs of kind 'pronunciation' (title = written, content =
// spoken). The sync appends them after the built-in dictionary
// (src/lib/urdu-speech.ts), and they win over it.

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Check, X, Pencil, Loader2, ChevronDown, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { KnowledgeDoc } from "@/lib/knowledge";
import { PRONUNCIATION_DICTIONARY } from "@/lib/urdu-speech";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { BulkBar, Checkbox } from "@/components/knowledge/bulk-bar";
import { IconButton } from "@/components/knowledge/menu-manager";

const supabase = createClient();

const COLUMNS = "id, workspace_id, kind, title, content, enabled, sort";

export function PronunciationManager({
  workspaceId,
  onChanged,
}: {
  workspaceId: string;
  onChanged: () => void;
}) {
  const [rows, setRows] = useState<KnowledgeDoc[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [written, setWritten] = useState("");
  const [spoken, setSpoken] = useState("");
  const [saving, setSaving] = useState(false);
  const [showBuiltIn, setShowBuiltIn] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("knowledge_docs")
        .select(COLUMNS)
        .eq("workspace_id", workspaceId)
        .eq("kind", "pronunciation")
        .order("sort", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) toast.error("Could not load the pronunciation list", { description: error.message });
      setRows((data as KnowledgeDoc[]) ?? []);
      setLoaded(true);
    })();
  }, [workspaceId]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const title = written.trim();
    const content = spoken.trim();
    if (!title || !content) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("knowledge_docs")
      .insert({ workspace_id: workspaceId, kind: "pronunciation", title, content, sort: rows.length })
      .select(COLUMNS)
      .single();
    setSaving(false);
    if (error) {
      toast.error("Could not save", { description: error.message });
      return;
    }
    setRows((prev) => [...prev, data as KnowledgeDoc]);
    setWritten("");
    setSpoken("");
    onChanged();
  }

  async function updateRows(ids: string[], patch: Partial<KnowledgeDoc>) {
    const before = rows;
    setRows((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, ...patch } : r)));
    const { error } = await supabase.from("knowledge_docs").update(patch).in("id", ids);
    if (error) {
      setRows(before);
      toast.error("Could not save", { description: error.message });
      return;
    }
    onChanged();
  }

  async function deleteRows(ids: string[]) {
    const before = rows;
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSelected(new Set());
    const { error } = await supabase.from("knowledge_docs").delete().in("id", ids);
    if (error) {
      setRows(before);
      toast.error("Could not delete", { description: error.message });
      return;
    }
    if (ids.length > 1) toast.success(`Deleted ${ids.length} words`);
    onChanged();
  }

  return (
    <div>
      <p className="text-[13px] text-neutral-500 mb-3">
        How your item and brand names are said, written in Urdu. The voice reads exactly what the agent
        writes, so &quot;BBQ&quot; becomes بی بی کیو unless it knows to say باربی کیو.
      </p>

      <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-12 gap-2 rounded-2xl border border-neutral-200 bg-white p-3">
        <Input
          value={written}
          onChange={(e) => setWritten(e.target.value.slice(0, 120))}
          placeholder="Written on the menu (e.g. BBQ)"
          className="sm:col-span-5 h-9 rounded-xl text-[13px]"
        />
        <Input
          dir="rtl"
          value={spoken}
          onChange={(e) => setSpoken(e.target.value.slice(0, 200))}
          placeholder="اردو میں کیسے بولتے ہیں (مثلاً باربی کیو)"
          className="sm:col-span-6 h-9 rounded-xl text-[13px]"
        />
        <button
          type="submit"
          disabled={saving || !written.trim() || !spoken.trim()}
          aria-label="Add word"
          className="sm:col-span-1 inline-flex items-center justify-center h-9 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-40"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        </button>
      </form>

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        <BulkBar
          total={rows.length}
          selected={selected.size}
          onSelectAll={(all) => setSelected(all ? new Set(rows.map((r) => r.id)) : new Set())}
          onClear={() => setSelected(new Set())}
          onDelete={() => deleteRows([...selected])}
          onSetEnabled={(enabled) => {
            void updateRows([...selected], { enabled });
            setSelected(new Set());
          }}
        />
        {!loaded ? (
          <p className="px-4 py-12 text-center text-sm text-neutral-500">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-[13px] text-neutral-500">
            No restaurant-specific words yet. Add names the built-in list below doesn&apos;t cover.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {rows.map((row) => (
              <WordRow
                key={row.id}
                row={row}
                selected={selected.has(row.id)}
                onSelect={(on) =>
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (on) next.add(row.id);
                    else next.delete(row.id);
                    return next;
                  })
                }
                onSave={(patch) => updateRows([row.id], patch)}
                onDelete={() => deleteRows([row.id])}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50/60">
        <button
          onClick={() => setShowBuiltIn((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-[13px] font-medium"
        >
          <span>Built-in words ({PRONUNCIATION_DICTIONARY.length}), always on for every agent</span>
          <ChevronDown className={cn("size-4 transition-transform", showBuiltIn && "rotate-180")} />
        </button>
        {showBuiltIn && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 px-4 pb-4 text-[12.5px]">
            {PRONUNCIATION_DICTIONARY.map((w) => (
              <div key={w.written} className="flex items-center justify-between gap-2 border-b border-neutral-200/70 py-1">
                <span className="text-neutral-600 truncate">{w.written}</span>
                <span dir="rtl" className="font-medium">{w.spoken}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WordRow({
  row,
  selected,
  onSelect,
  onSave,
  onDelete,
}: {
  row: KnowledgeDoc;
  selected: boolean;
  onSelect: (on: boolean) => void;
  onSave: (patch: Partial<KnowledgeDoc>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [written, setWritten] = useState(row.title);
  const [spoken, setSpoken] = useState(row.content);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("flex items-center gap-3 px-4 py-2.5 border-b border-neutral-100 last:border-b-0", selected && "bg-neutral-50")}
    >
      <Checkbox checked={selected} onChange={onSelect} label={`Select ${row.title}`} />
      {editing ? (
        <>
          <Input value={written} onChange={(e) => setWritten(e.target.value.slice(0, 120))} className="h-8 rounded-xl text-[13px] flex-1" />
          <Input dir="rtl" value={spoken} onChange={(e) => setSpoken(e.target.value.slice(0, 200))} className="h-8 rounded-xl text-[13px] flex-1" />
          <IconButton
            label="Save"
            onClick={() => {
              if (!written.trim() || !spoken.trim()) return;
              onSave({ title: written.trim(), content: spoken.trim() });
              setEditing(false);
            }}
          >
            <Check className="size-4" />
          </IconButton>
          <IconButton label="Cancel" onClick={() => setEditing(false)}>
            <X className="size-4" />
          </IconButton>
        </>
      ) : (
        <>
          <div className={cn("flex-1 min-w-0 flex items-center gap-3", !row.enabled && "opacity-50")}>
            <span className="text-[13.5px] font-semibold truncate">{row.title}</span>
            <ArrowRight className="size-3.5 text-neutral-400 shrink-0" />
            <span dir="rtl" className="text-[14px] truncate">{row.content}</span>
          </div>
          <Switch checked={row.enabled} onCheckedChange={(enabled) => onSave({ enabled })} aria-label={row.enabled ? "Turn off" : "Turn on"} />
          <IconButton
            label="Edit"
            onClick={() => {
              setWritten(row.title);
              setSpoken(row.content);
              setEditing(true);
            }}
          >
            <Pencil className="size-3.5" />
          </IconButton>
          {confirmDelete ? (
            <button
              onClick={onDelete}
              onBlur={() => setConfirmDelete(false)}
              autoFocus
              className="h-8 px-3 rounded-full bg-red-600 text-white text-[12px] font-medium"
            >
              Delete?
            </button>
          ) : (
            <IconButton label="Delete" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-3.5" />
            </IconButton>
          )}
        </>
      )}
    </motion.div>
  );
}
