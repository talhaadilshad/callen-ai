// Menu or Deals list for the Knowledge Base. Rows live in menu_items
// (members CRUD under RLS): add, inline edit, on/off availability, paste a
// whole menu, and select-all bulk on/off/delete. The sync route appends
// the available rows to each agent's instructions (src/lib/menu.ts).

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  ClipboardPaste,
  Pencil,
  Trash2,
  Check,
  X,
  UtensilsCrossed,
  Tag,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  formatPkr,
  parseMenuText,
  parsePkr,
  type MenuDraft,
  type MenuItem,
  type MenuKind,
} from "@/lib/menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BulkBar, Checkbox } from "@/components/knowledge/bulk-bar";

const supabase = createClient();

const COLUMNS = "id, workspace_id, kind, category, name, description, price_pkr, available, sort";

const EMPTY_DRAFT = (kind: MenuKind): MenuDraft => ({
  kind,
  category: "",
  name: "",
  description: "",
  price_pkr: null,
});

export function MenuManager({
  kind,
  workspaceId,
  onChanged,
}: {
  kind: MenuKind;
  workspaceId: string;
  onChanged: () => void;
}) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pasteOpen, setPasteOpen] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select(COLUMNS)
        .eq("workspace_id", workspaceId)
        .eq("kind", kind)
        .order("sort", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) toast.error("Could not load the menu", { description: error.message });
      setItems((data as MenuItem[]) ?? []);
      setLoaded(true);
    })();
  }, [kind, workspaceId]);

  const groups = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of items) {
      const key = kind === "deal" ? "Deals" : item.category.trim() || "Other items";
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map.entries()];
  }, [items, kind]);
  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category.trim()).filter(Boolean))],
    [items]
  );

  function changed() {
    onChanged();
  }

  async function insertRows(rows: MenuDraft[]) {
    if (rows.length === 0) return false;
    const base = items.length;
    const { data, error } = await supabase
      .from("menu_items")
      .insert(rows.map((r, i) => ({ ...r, workspace_id: workspaceId, sort: base + i })))
      .select(COLUMNS);
    if (error) {
      toast.error("Could not save", { description: error.message });
      return false;
    }
    // A pasted menu can hold both items and deals; this list shows one kind.
    setItems((prev) => [...prev, ...((data as MenuItem[]) ?? []).filter((r) => r.kind === kind)]);
    changed();
    return true;
  }

  async function updateRows(ids: string[], patch: Partial<MenuItem>) {
    const before = items;
    setItems((prev) => prev.map((i) => (ids.includes(i.id) ? { ...i, ...patch } : i)));
    const { error } = await supabase.from("menu_items").update(patch).in("id", ids);
    if (error) {
      setItems(before);
      toast.error("Could not save", { description: error.message });
      return;
    }
    changed();
  }

  async function deleteRows(ids: string[]) {
    const before = items;
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
    setSelected(new Set());
    const { error } = await supabase.from("menu_items").delete().in("id", ids);
    if (error) {
      setItems(before);
      toast.error("Could not delete", { description: error.message });
      return;
    }
    if (ids.length > 1) toast.success(`Deleted ${ids.length} ${kind === "deal" ? "deals" : "items"}`);
    changed();
  }

  function toggle(id: string, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const isDeal = kind === "deal";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-[13px] text-neutral-500">
          {isDeal
            ? "Deals are offered once per call, when they match the order."
            : "Turn an item off when it runs out; the agent stops offering it."}
        </p>
        <button
          onClick={() => setPasteOpen(true)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-neutral-200 bg-white text-[13px] font-medium hover:border-neutral-300 transition-colors"
        >
          <ClipboardPaste className="size-3.5" />
          Paste menu
        </button>
      </div>

      <AddRow key={kind} kind={kind} categories={categories} onAdd={(draft) => insertRows([draft])} />

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        <BulkBar
          total={items.length}
          selected={selected.size}
          onSelectAll={(all) => setSelected(all ? new Set(items.map((i) => i.id)) : new Set())}
          onClear={() => setSelected(new Set())}
          onDelete={() => deleteRows([...selected])}
          onSetEnabled={(available) => {
            void updateRows([...selected], { available });
            setSelected(new Set());
          }}
        />
        {!loaded ? (
          <p className="px-4 py-12 text-center text-sm text-neutral-500">Loading...</p>
        ) : items.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <span className="mx-auto mb-3 size-10 rounded-full bg-neutral-100 flex items-center justify-center">
              {isDeal ? <Tag className="size-4 text-neutral-600" /> : <UtensilsCrossed className="size-4 text-neutral-600" />}
            </span>
            <p className="text-sm font-semibold tracking-tight">{isDeal ? "No deals yet" : "No menu items yet"}</p>
            <p className="text-xs text-neutral-500 mt-1">
              Add them above, or use Paste menu to import a whole menu at once.
            </p>
          </div>
        ) : (
          groups.map(([group, rows]) => (
            <div key={group}>
              <div className="px-4 py-2 bg-neutral-50/60 border-b border-neutral-200 text-[10px] uppercase tracking-widest font-semibold text-neutral-500">
                {group}
              </div>
              <AnimatePresence initial={false}>
                {rows.map((item) => (
                  <MenuRow
                    key={item.id}
                    item={item}
                    selected={selected.has(item.id)}
                    onSelect={(on) => toggle(item.id, on)}
                    onSave={(patch) => updateRows([item.id], patch)}
                    onDelete={() => deleteRows([item.id])}
                  />
                ))}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      <PasteMenuDialog
        open={pasteOpen}
        onOpenChange={setPasteOpen}
        onImport={async (rows) => {
          const ok = await insertRows(rows);
          if (ok) {
            toast.success(`Imported ${rows.length} ${rows.length === 1 ? "entry" : "entries"}`);
            setPasteOpen(false);
          }
        }}
      />
    </div>
  );
}

// =============================================================
// Add row
// =============================================================

function AddRow({
  kind,
  categories,
  onAdd,
}: {
  kind: MenuKind;
  categories: string[];
  onAdd: (draft: MenuDraft) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<MenuDraft>(EMPTY_DRAFT(kind));
  const [priceText, setPriceText] = useState("");
  const [saving, setSaving] = useState(false);
  const isDeal = kind === "deal";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setSaving(true);
    const ok = await onAdd({
      ...draft,
      name: draft.name.trim(),
      category: isDeal ? "" : draft.category.trim(),
      description: draft.description.trim(),
      price_pkr: parsePkr(priceText),
    });
    setSaving(false);
    if (ok) {
      // Keep the category so adding several items to one section is quick.
      setDraft({ ...EMPTY_DRAFT(kind), category: draft.category });
      setPriceText("");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 sm:grid-cols-12 gap-2 rounded-2xl border border-neutral-200 bg-white p-3"
    >
      {!isDeal && (
        <>
          <Input
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            placeholder="Category (e.g. Pizzas)"
            list="menu-categories"
            className="sm:col-span-3 h-9 rounded-xl text-[13px]"
          />
          <datalist id="menu-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </>
      )}
      <Input
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        placeholder={isDeal ? "Deal name (e.g. Family Deal)" : "Item (e.g. Chicken Tikka, Large)"}
        className={cn("h-9 rounded-xl text-[13px]", isDeal ? "sm:col-span-4" : "sm:col-span-3")}
      />
      <Input
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        placeholder={isDeal ? "What's included" : "Details or sizes (optional)"}
        className={cn("h-9 rounded-xl text-[13px]", isDeal ? "sm:col-span-5" : "sm:col-span-3")}
      />
      <Input
        value={priceText}
        onChange={(e) => setPriceText(e.target.value)}
        placeholder="Price (Rs)"
        inputMode="numeric"
        className="sm:col-span-2 h-9 rounded-xl text-[13px]"
      />
      <button
        type="submit"
        disabled={saving || !draft.name.trim()}
        className="sm:col-span-1 inline-flex items-center justify-center h-9 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-40"
        aria-label={isDeal ? "Add deal" : "Add item"}
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
      </button>
    </form>
  );
}

// =============================================================
// Row (view + inline edit)
// =============================================================

function MenuRow({
  item,
  selected,
  onSelect,
  onSave,
  onDelete,
}: {
  item: MenuItem;
  selected: boolean;
  onSelect: (on: boolean) => void;
  onSave: (patch: Partial<MenuItem>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft, setDraft] = useState(item);
  const [priceText, setPriceText] = useState(item.price_pkr?.toString() ?? "");
  const isDeal = item.kind === "deal";

  function startEdit() {
    setDraft(item);
    setPriceText(item.price_pkr?.toString() ?? "");
    setEditing(true);
  }

  function save() {
    if (!draft.name.trim()) return;
    onSave({
      category: isDeal ? "" : draft.category.trim(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      price_pkr: parsePkr(priceText),
    });
    setEditing(false);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("px-4 py-3 border-b border-neutral-100 last:border-b-0", selected && "bg-neutral-50")}
    >
      {editing ? (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
          {!isDeal && (
            <Input
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              list="menu-categories"
              placeholder="Category"
              className="sm:col-span-3 h-9 rounded-xl text-[13px]"
            />
          )}
          <Input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className={cn("h-9 rounded-xl text-[13px]", isDeal ? "sm:col-span-4" : "sm:col-span-3")}
          />
          <Input
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            placeholder={isDeal ? "What's included" : "Details or sizes"}
            className={cn("h-9 rounded-xl text-[13px]", isDeal ? "sm:col-span-5" : "sm:col-span-3")}
          />
          <Input
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
            placeholder="Price"
            inputMode="numeric"
            className="sm:col-span-2 h-9 rounded-xl text-[13px]"
          />
          <div className="sm:col-span-1 flex items-center gap-1 justify-end">
            <IconButton label="Save" onClick={save}>
              <Check className="size-4" />
            </IconButton>
            <IconButton label="Cancel" onClick={() => setEditing(false)}>
              <X className="size-4" />
            </IconButton>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Checkbox checked={selected} onChange={onSelect} label={`Select ${item.name}`} />
          <div className={cn("flex-1 min-w-0", !item.available && "opacity-50")}>
            <p className="text-[14px] font-semibold tracking-tight truncate">{item.name}</p>
            {item.description && (
              <p className="text-[12px] text-neutral-500 truncate">{item.description}</p>
            )}
          </div>
          <span className={cn("text-[13px] font-semibold tabular-nums whitespace-nowrap", !item.available && "opacity-50")}>
            {item.price_pkr === null && item.description ? "See sizes" : formatPkr(item.price_pkr)}
          </span>
          <Switch
            checked={item.available}
            onCheckedChange={(available) => onSave({ available })}
            aria-label={item.available ? "Turn off" : "Turn on"}
          />
          <IconButton label="Edit" onClick={startEdit}>
            <Pencil className="size-3.5" />
          </IconButton>
          {confirmDelete ? (
            <button
              onClick={onDelete}
              onBlur={() => setConfirmDelete(false)}
              className="h-8 px-3 rounded-full bg-red-600 text-white text-[12px] font-medium"
              autoFocus
            >
              Delete?
            </button>
          ) : (
            <IconButton label="Delete" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-3.5" />
            </IconButton>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="size-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-600"
    >
      {children}
    </button>
  );
}

// =============================================================
// Paste a whole menu
// =============================================================

const PASTE_EXAMPLE = `Pizzas
Chicken Tikka (Large) - 1499
Fajita (Large) - 1599
Burgers
Zinger Burger - S 450 / L 650
Drinks: Coke 1.5L - 250
Deals
Family Deal - 2 large pizzas + 1.5L drink - 3299`;

function PasteMenuDialog({
  open,
  onOpenChange,
  onImport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (rows: MenuDraft[]) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const rows = useMemo(() => parseMenuText(text), [text]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle className="text-xl font-bold tracking-tight">Paste your menu</DialogTitle>
        <DialogDescription className="text-[13px] text-neutral-500">
          One item per line as <code>Name - Price</code>. A line on its own starts a category; a line
          that says <code>Deals</code> starts the deals.
        </DialogDescription>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PASTE_EXAMPLE}
            rows={14}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-3 text-[12.5px] leading-relaxed resize-none font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-3 overflow-y-auto max-h-[330px]">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-neutral-500 mb-2">
              Preview · {rows.length} {rows.length === 1 ? "entry" : "entries"}
            </p>
            {rows.length === 0 ? (
              <p className="text-[12px] text-neutral-500">Paste on the left to see what will be imported.</p>
            ) : (
              <ul className="space-y-1.5">
                {rows.map((r, i) => (
                  <li key={i} className="text-[12px] flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="text-neutral-400">{r.kind === "deal" ? "Deal" : r.category || "Other"} · </span>
                      <span className="font-medium">{r.name}</span>
                      {r.description && <span className="text-neutral-500"> ({r.description})</span>}
                    </span>
                    <span className="tabular-nums whitespace-nowrap">
                      {r.price_pkr === null ? "–" : formatPkr(r.price_pkr)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-full border border-neutral-200 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            disabled={rows.length === 0 || importing}
            onClick={async () => {
              setImporting(true);
              await onImport(rows);
              setImporting(false);
              setText("");
            }}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-neutral-950 text-white text-sm font-medium disabled:opacity-40"
          >
            {importing && <Loader2 className="size-3.5 animate-spin" />}
            Import {rows.length > 0 ? rows.length : ""}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
