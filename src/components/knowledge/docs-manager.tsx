// Knowledge Base documents (restaurant info, policies, FAQs). Rows live in
// knowledge_docs (members CRUD under RLS). Each document is a title + text
// the owner types, pastes or uploads (.txt/.md read in the browser, PDF via
// /api/knowledge/extract). Enabled documents are appended to each agent's
// instructions by the sync route (src/lib/knowledge.ts).

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Pencil, Trash2, Upload, Loader2, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  DOC_CONTENT_MAX,
  DOC_KINDS,
  DOC_TEMPLATES,
  type DocKind,
  type KnowledgeDoc,
} from "@/lib/knowledge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BulkBar, Checkbox } from "@/components/knowledge/bulk-bar";
import { IconButton } from "@/components/knowledge/menu-manager";

const supabase = createClient();

const COLUMNS = "id, workspace_id, kind, title, content, enabled, sort";

type Draft = { id?: string; title: string; content: string };

export function DocsManager({
  kind,
  workspaceId,
  onChanged,
}: {
  kind: DocKind;
  workspaceId: string;
  onChanged: () => void;
}) {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Draft | null>(null);
  const meta = DOC_KINDS.find((k) => k.kind === kind)!;
  const isFaq = kind === "faq";

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("knowledge_docs")
        .select(COLUMNS)
        .eq("workspace_id", workspaceId)
        .eq("kind", kind)
        .order("sort", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) toast.error("Could not load documents", { description: error.message });
      setDocs((data as KnowledgeDoc[]) ?? []);
      setLoaded(true);
    })();
  }, [kind, workspaceId]);

  async function save(draft: Draft) {
    const title = draft.title.trim();
    const content = draft.content.trim();
    if (!title) return false;
    if (draft.id) {
      const { error } = await supabase.from("knowledge_docs").update({ title, content }).eq("id", draft.id);
      if (error) {
        toast.error("Could not save", { description: error.message });
        return false;
      }
      setDocs((prev) => prev.map((d) => (d.id === draft.id ? { ...d, title, content } : d)));
    } else {
      const { data, error } = await supabase
        .from("knowledge_docs")
        .insert({ workspace_id: workspaceId, kind, title, content, sort: docs.length })
        .select(COLUMNS)
        .single();
      if (error) {
        toast.error("Could not save", { description: error.message });
        return false;
      }
      setDocs((prev) => [...prev, data as KnowledgeDoc]);
    }
    onChanged();
    return true;
  }

  async function addTemplate(t: { title: string; content: string }) {
    if (await save({ title: t.title, content: t.content })) {
      toast.success(`${t.title} added`, { description: "Edit it to match your restaurant." });
    }
  }

  async function updateRows(ids: string[], patch: Partial<KnowledgeDoc>) {
    const before = docs;
    setDocs((prev) => prev.map((d) => (ids.includes(d.id) ? { ...d, ...patch } : d)));
    const { error } = await supabase.from("knowledge_docs").update(patch).in("id", ids);
    if (error) {
      setDocs(before);
      toast.error("Could not save", { description: error.message });
      return;
    }
    onChanged();
  }

  async function deleteRows(ids: string[]) {
    const before = docs;
    setDocs((prev) => prev.filter((d) => !ids.includes(d.id)));
    setSelected(new Set());
    const { error } = await supabase.from("knowledge_docs").delete().in("id", ids);
    if (error) {
      setDocs(before);
      toast.error("Could not delete", { description: error.message });
      return;
    }
    if (ids.length > 1) toast.success(`Deleted ${ids.length} documents`);
    onChanged();
  }

  const unusedTemplates = DOC_TEMPLATES[kind].filter((t) => !docs.some((d) => d.title === t.title));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-[13px] text-neutral-500">{meta.blurb}</p>
        <button
          onClick={() => setEditing({ title: "", content: "" })}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-neutral-950 text-white text-[13px] font-medium hover:bg-neutral-800 transition-colors"
        >
          <Plus className="size-3.5" />
          {isFaq ? "Add question" : "Add document"}
        </button>
      </div>

      {unusedTemplates.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[12px] text-neutral-500">
            <Sparkles className="size-3.5" />
            Quick start:
          </span>
          {unusedTemplates.map((t) => (
            <button
              key={t.title}
              onClick={() => addTemplate(t)}
              className="inline-flex items-center gap-1 h-7 px-3 rounded-full border border-dashed border-neutral-300 hover:border-neutral-500 text-[12px] font-medium text-neutral-700"
            >
              <Plus className="size-3" />
              {t.title}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        <BulkBar
          total={docs.length}
          selected={selected.size}
          onSelectAll={(all) => setSelected(all ? new Set(docs.map((d) => d.id)) : new Set())}
          onClear={() => setSelected(new Set())}
          onDelete={() => deleteRows([...selected])}
          onSetEnabled={(enabled) => {
            void updateRows([...selected], { enabled });
            setSelected(new Set());
          }}
        />
        {!loaded ? (
          <p className="px-4 py-12 text-center text-sm text-neutral-500">Loading...</p>
        ) : docs.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <span className="mx-auto mb-3 size-10 rounded-full bg-neutral-100 flex items-center justify-center">
              <FileText className="size-4 text-neutral-600" />
            </span>
            <p className="text-sm font-semibold tracking-tight">Nothing here yet</p>
            <p className="text-xs text-neutral-500 mt-1">
              Add your own, upload a file, or start from a quick-start template above.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {docs.map((doc) => (
              <DocRow
                key={doc.id}
                doc={doc}
                isFaq={isFaq}
                selected={selected.has(doc.id)}
                onSelect={(on) =>
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (on) next.add(doc.id);
                    else next.delete(doc.id);
                    return next;
                  })
                }
                onEdit={() => setEditing({ id: doc.id, title: doc.title, content: doc.content })}
                onToggle={(enabled) => updateRows([doc.id], { enabled })}
                onDelete={() => deleteRows([doc.id])}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      <DocDialog
        draft={editing}
        isFaq={isFaq}
        onClose={() => setEditing(null)}
        onSave={async (draft) => {
          if (await save(draft)) setEditing(null);
        }}
      />
    </div>
  );
}

function DocRow({
  doc,
  isFaq,
  selected,
  onSelect,
  onEdit,
  onToggle,
  onDelete,
}: {
  doc: KnowledgeDoc;
  isFaq: boolean;
  selected: boolean;
  onSelect: (on: boolean) => void;
  onEdit: () => void;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("flex items-start gap-3 px-4 py-3 border-b border-neutral-100 last:border-b-0", selected && "bg-neutral-50")}
    >
      <span className="pt-0.5">
        <Checkbox checked={selected} onChange={onSelect} label={`Select ${doc.title}`} />
      </span>
      <button onClick={onEdit} className={cn("flex-1 min-w-0 text-left", !doc.enabled && "opacity-50")}>
        <p className="text-[14px] font-semibold tracking-tight truncate">
          {isFaq ? `Q: ${doc.title}` : doc.title}
        </p>
        <p dir="auto" className="text-[12px] text-neutral-500 line-clamp-2 whitespace-pre-line">
          {doc.content || "Empty: click to write it."}
        </p>
        <p className="text-[10.5px] text-neutral-400 mt-1 tabular-nums">
          {doc.content.length.toLocaleString()} characters
        </p>
      </button>
      <Switch checked={doc.enabled} onCheckedChange={onToggle} aria-label={doc.enabled ? "Turn off" : "Turn on"} />
      <IconButton label="Edit" onClick={onEdit}>
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
    </motion.div>
  );
}

function DocDialog({
  draft,
  isFaq,
  onClose,
  onSave,
}: {
  draft: Draft | null;
  isFaq: boolean;
  onClose: () => void;
  onSave: (draft: Draft) => Promise<void>;
}) {
  return (
    <Dialog open={draft !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        {/* key: fresh form state for each document opened */}
        {draft && <DocForm key={draft.id ?? "new"} initial={draft} isFaq={isFaq} onClose={onClose} onSave={onSave} />}
      </DialogContent>
    </Dialog>
  );
}

function DocForm({
  initial,
  isFaq,
  onClose,
  onSave,
}: {
  initial: Draft;
  isFaq: boolean;
  onClose: () => void;
  onSave: (draft: Draft) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [saving, setSaving] = useState(false);
  const [reading, setReading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function readFile(file: File) {
    setReading(true);
    try {
      let text = "";
      if (file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf") {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/knowledge/extract", { method: "POST", body: form });
        const body = (await res.json().catch(() => null)) as { text?: string; truncated?: boolean; error?: string } | null;
        if (!res.ok || !body?.text) throw new Error(body?.error ?? "Could not read that PDF.");
        text = body.text;
        if (body.truncated) toast("Only the first 20,000 characters were kept.");
      } else {
        text = (await file.text()).slice(0, DOC_CONTENT_MAX);
      }
      setContent((prev) => (prev.trim() ? `${prev.trim()}\n\n${text}` : text));
      if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, "").slice(0, 120));
    } catch (err) {
      toast.error("Could not read the file", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setReading(false);
    }
  }

  return (
    <>
      <DialogTitle className="text-xl font-bold tracking-tight">
        {initial.id ? "Edit" : "New"} {isFaq ? "question" : "document"}
      </DialogTitle>
      <DialogDescription className="text-[13px] text-neutral-500">
        {isFaq
          ? "Write the question the way a caller would ask it, and the answer you want given."
          : "Write it, paste it, or upload a .txt, .md or PDF file. English or Urdu both work."}
      </DialogDescription>
      <div className="space-y-3 mt-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 120))}
          placeholder={isFaq ? "Question (e.g. Is the food halal?)" : "Title (e.g. Delivery policy)"}
          className="h-10 rounded-xl"
          autoFocus
        />
        <div>
          <textarea
            dir="auto"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, DOC_CONTENT_MAX))}
            placeholder={isFaq ? "Answer" : "Text"}
            rows={12}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-3 text-[13px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <div className="flex items-center justify-between mt-1">
            {isFaq ? (
              <span />
            ) : (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void readFile(f);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={reading}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-neutral-200 hover:border-neutral-300 text-[12px] font-medium disabled:opacity-50"
                >
                  {reading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  Upload file
                </button>
              </>
            )}
            <span className="text-[11px] text-neutral-400 tabular-nums">
              {content.length.toLocaleString()} / {DOC_CONTENT_MAX.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button onClick={onClose} className="h-9 px-4 rounded-full border border-neutral-200 text-sm font-medium">
          Cancel
        </button>
        <button
          disabled={!title.trim() || saving}
          onClick={async () => {
            setSaving(true);
            await onSave({ id: initial.id, title, content });
            setSaving(false);
          }}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-neutral-950 text-white text-sm font-medium disabled:opacity-40"
        >
          {saving && <Loader2 className="size-3.5 animate-spin" />}
          Save
        </button>
      </div>
    </>
  );
}
