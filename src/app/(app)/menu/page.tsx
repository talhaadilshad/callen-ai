// Menu & Deals — what the restaurant sells, and the only source of items
// and prices the Urdu agents are allowed to quote. Rows live in
// menu_items (members CRUD under RLS); "Update live agents" re-syncs each
// published agent, and the sync route appends the available rows to the
// agent's instructions (src/lib/menu.ts menuSection).

"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  ClipboardPaste,
  RefreshCw,
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
  useCustomAgentsStore,
  useCustomAgentsHydrated,
  getWorkspaceId,
} from "@/lib/custom-agents-store";
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

const supabase = createClient();

const COLUMNS = "id, workspace_id, kind, category, name, description, price_pkr, available, sort";

const EMPTY_DRAFT = (kind: MenuKind): MenuDraft => ({
  kind,
  category: "",
  name: "",
  description: "",
  price_pkr: null,
});

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [tab, setTab] = useState<MenuKind>("item");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [changed, setChanged] = useState(false);
  const [updating, setUpdating] = useState(false);

  const agents = useCustomAgentsStore((s) => s.agents);
  const syncAgent = useCustomAgentsStore((s) => s.syncAgent);
  useCustomAgentsHydrated();
  const liveAgents = agents.filter((a) => a.status === "published" && a.defaultLanguage === "Urdu");

  useEffect(() => {
    void (async () => {
      const ws = await getWorkspaceId();
      setWorkspaceId(ws);
      if (!ws) {
        setLoaded(true);
        return;
      }
      const { data, error } = await supabase
        .from("menu_items")
        .select(COLUMNS)
        .eq("workspace_id", ws)
        .order("sort", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) toast.error("Could not load the menu", { description: error.message });
      setItems((data as MenuItem[]) ?? []);
      setLoaded(true);
    })();
  }, []);

  const visible = items.filter((i) => i.kind === tab);
  const groups = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of visible) {
      const key = tab === "deal" ? "Deals" : item.category.trim() || "Other items";
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map.entries()];
  }, [visible, tab]);
  const categories = useMemo(
    () => [...new Set(items.filter((i) => i.kind === "item").map((i) => i.category.trim()).filter(Boolean))],
    [items]
  );

  async function insertRows(rows: MenuDraft[]) {
    if (!workspaceId || rows.length === 0) return false;
    const base = items.length;
    const { data, error } = await supabase
      .from("menu_items")
      .insert(rows.map((r, i) => ({ ...r, workspace_id: workspaceId, sort: base + i })))
      .select(COLUMNS);
    if (error) {
      toast.error("Could not save", { description: error.message });
      return false;
    }
    setItems((prev) => [...prev, ...((data as MenuItem[]) ?? [])]);
    setChanged(true);
    return true;
  }

  async function updateRow(id: string, patch: Partial<MenuItem>) {
    const before = items;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    const { error } = await supabase.from("menu_items").update(patch).eq("id", id);
    if (error) {
      setItems(before);
      toast.error("Could not save", { description: error.message });
      return;
    }
    setChanged(true);
  }

  async function deleteRow(id: string) {
    const before = items;
    setItems((prev) => prev.filter((i) => i.id !== id));
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) {
      setItems(before);
      toast.error("Could not delete", { description: error.message });
      return;
    }
    setChanged(true);
  }

  async function updateLiveAgents() {
    setUpdating(true);
    for (const a of liveAgents) await syncAgent(a.id);
    setUpdating(false);
    setChanged(false);
  }

  const itemCount = items.filter((i) => i.kind === "item").length;
  const dealCount = items.filter((i) => i.kind === "deal").length;
  const hiddenCount = items.filter((i) => !i.available).length;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Menu & Deals</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Your agents only quote what is here. Turn an item off when it runs out.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPasteOpen(true)}
            disabled={!workspaceId}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-neutral-200 bg-white text-sm font-medium hover:border-neutral-300 transition-colors disabled:opacity-40"
          >
            <ClipboardPaste className="size-3.5" />
            Paste menu
          </button>
          <button
            onClick={updateLiveAgents}
            disabled={updating || liveAgents.length === 0}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40"
          >
            {updating ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            Update live agents
          </button>
        </div>
      </div>

      {changed && liveAgents.length > 0 && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          <span>
            Your {liveAgents.length === 1 ? "live agent still uses" : `${liveAgents.length} live agents still use`} the
            old menu.
          </span>
          <button onClick={updateLiveAgents} disabled={updating} className="font-semibold underline underline-offset-2">
            Update now
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <SummaryTile label="Menu items" value={`${itemCount}`} sub={`${categories.length} categories`} />
        <SummaryTile label="Deals" value={`${dealCount}`} sub="offered once per call" />
        <SummaryTile label="Turned off" value={`${hiddenCount}`} sub="hidden from agents" />
      </div>

      <div className="inline-flex rounded-full bg-neutral-100 p-0.5 text-[13px] font-medium mb-4">
        {(["item", "deal"] as MenuKind[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "px-4 py-1.5 rounded-full transition-colors",
              tab === k ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-600"
            )}
          >
            {k === "item" ? `Menu (${itemCount})` : `Deals (${dealCount})`}
          </button>
        ))}
      </div>

      <AddRow
        key={tab}
        kind={tab}
        categories={categories}
        disabled={!workspaceId}
        onAdd={(draft) => insertRows([draft])}
      />

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        {!loaded ? (
          <p className="px-4 py-12 text-center text-sm text-neutral-500">Loading menu...</p>
        ) : visible.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <span className="mx-auto mb-3 size-10 rounded-full bg-neutral-100 flex items-center justify-center">
              {tab === "item" ? <UtensilsCrossed className="size-4 text-neutral-600" /> : <Tag className="size-4 text-neutral-600" />}
            </span>
            <p className="text-sm font-semibold tracking-tight">
              {tab === "item" ? "No menu items yet" : "No deals yet"}
            </p>
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
                    onSave={(patch) => updateRow(item.id, patch)}
                    onDelete={() => deleteRow(item.id)}
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

function SummaryTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3.5">
      <p className="text-[11px] uppercase tracking-widest font-semibold text-neutral-500">{label}</p>
      <p className="text-2xl font-bold tracking-tight mt-1 tabular-nums">{value}</p>
      <p className="text-[11px] text-neutral-500 mt-0.5">{sub}</p>
    </div>
  );
}

// =============================================================
// Add row
// =============================================================

function AddRow({
  kind,
  categories,
  disabled,
  onAdd,
}: {
  kind: MenuKind;
  categories: string[];
  disabled: boolean;
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
        disabled={disabled || saving || !draft.name.trim()}
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
  onSave,
  onDelete,
}: {
  item: MenuItem;
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
      className="px-4 py-3 border-b border-neutral-100 last:border-b-0"
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

function IconButton({
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
