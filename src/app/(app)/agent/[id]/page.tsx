// Custom agent editor + tester. Created by the Create-Agent wizard.
// Layout: header with name + draft pill + publish, then three columns:
//   - Left  : System prompt + First message (editable)
//   - Middle: Voice card, Language, LLM, Behavior
//   - Right : Test panel — planet orb, call button (plays the voice's mp3),
//             a tiny chat input that echoes a canned response and replays
//             the voice. Enough to demo the experience in viva.

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Phone,
  PhoneOff,
  Send,
  Globe,
  Wand2,
  Mic,
  Volume2,
  VolumeX,
  Plus,
  X,
  Check,
  Sliders,
  RefreshCw,
  Copy,
  CheckCheck,
  MessageCircle,
  UtensilsCrossed,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  useCustomAgentsStore,
  useCustomAgentsHydrated,
  type CustomAgent,
} from "@/lib/custom-agents-store";
import { useTTS } from "@/lib/use-tts";
import {
  LLM_MODELS,
  LLM_PROVIDERS,
  llmById,
  BEHAVIOR_TRAITS,
  type RestaurantProfile,
} from "@/lib/agent-meta";
import { getVoice, VOICES, type Voice } from "@/lib/voice-library";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { SiriOrb } from "@/components/ui/siri-orb";
import { LiveCallPanel } from "@/components/agent/live-call-panel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VoicePreview } from "@/components/voices/voice-preview";

// =============================================================
// Page
// =============================================================

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const hydrated = useCustomAgentsHydrated();
  const agents = useCustomAgentsStore((s) => s.agents);
  const updateAgent = useCustomAgentsStore((s) => s.updateAgent);

  const agent = useMemo(
    () => agents.find((a) => a.id === id) ?? null,
    [agents, id]
  );

  if (!hydrated) return <DetailSkeleton />;

  if (!agent) {
    return (
      <div className="h-full flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Agent not found
          </h1>
          <p className="text-[13px] text-neutral-500 mb-5">
            We could not find that agent in your workspace. It may have been
            removed or never finished saving.
          </p>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => router.push("/agent")}
          >
            Back to agents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AgentEditor
      agent={agent}
      onPatch={(patch) => updateAgent(agent.id, patch)}
      onBack={() => router.push("/agent")}
    />
  );
}

// =============================================================
// Editor
// =============================================================

function AgentEditor({
  agent,
  onPatch,
  onBack,
}: {
  agent: CustomAgent;
  onPatch: (patch: Partial<CustomAgent>) => void;
  onBack: () => void;
}) {
  const voice = getVoice(agent.voiceId) ?? VOICES[0];
  const regeneratePrompt = useCustomAgentsStore((s) => s.regeneratePromptForAgent);
  const removeAgent = useCustomAgentsStore((s) => s.removeAgent);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [voiceSheetOpen, setVoiceSheetOpen] = useState(false);
  const [behaviorSheetOpen, setBehaviorSheetOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt);
  const [firstMessage, setFirstMessage] = useState(agent.firstMessage);
  const [dirty, setDirty] = useState(false);

  // Stay in sync with store updates that happen elsewhere (e.g. voice change,
  // language change, traits change, or explicit regenerate).
  useEffect(() => {
    setSystemPrompt(agent.systemPrompt);
    setFirstMessage(agent.firstMessage);
    setDirty(false);
  }, [agent.systemPrompt, agent.firstMessage]);

  function save() {
    onPatch({ systemPrompt, firstMessage });
    setDirty(false);
    toast.success("Changes saved");
  }

  function publish() {
    onPatch({ status: "published", systemPrompt, firstMessage });
    setDirty(false);
    toast.success(`${agent.name} published`, {
      description: "The draft is now live on your workspace number.",
    });
  }

  function regenerate() {
    regeneratePrompt(agent.id);
    toast.success("Prompt regenerated", {
      description: "System prompt and first message rebuilt from current config.",
    });
  }

  // Deletes the agent everywhere: the row, and its assistant on the voice
  // runtime (DELETE /api/agents/:id via the store).
  function deleteAgent() {
    removeAgent(agent.id);
    toast.success(`${agent.name} deleted`);
    onBack();
  }

  function setLlm(id: string) {
    onPatch({ llm: id });
  }

  function setTuning(patch: Partial<CustomAgent["voiceTuning"]>) {
    onPatch({ voiceTuning: { ...agent.voiceTuning, ...patch } });
  }

  function toggleTrait(id: string) {
    const next = agent.behaviorTraits.includes(id)
      ? agent.behaviorTraits.filter((t) => t !== id)
      : [...agent.behaviorTraits, id];
    onPatch({ behaviorTraits: next });
  }

  const currentLlm = llmById(agent.llm);
  const activeTraits = agent.behaviorTraits
    .map((id) => BEHAVIOR_TRAITS.find((t) => t.id === id))
    .filter((t): t is (typeof BEHAVIOR_TRAITS)[number] => Boolean(t));

  return (
    <div className="h-full flex flex-col bg-neutral-50/40">
      {/* ============= Header ============= */}
      <div className="bg-white border-b border-neutral-200 px-5 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="size-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-600"
          aria-label="Back to agents"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-[14px] font-semibold tracking-tight truncate">
            {agent.name}
          </p>
          <span className="text-neutral-300">/</span>
          <p className="text-[13px] text-neutral-500">Main</p>
          <span className="inline-flex items-center gap-1 ml-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-semibold">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live 100%
          </span>
        </div>
        <div className="flex-1" />
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            agent.status === "published"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          )}
        >
          {agent.status === "published" ? "Published" : "Draft"}
        </span>
        {dirty && (
          <Button
            variant="outline"
            className="rounded-full h-8 px-3 text-[12px]"
            onClick={save}
          >
            Save
          </Button>
        )}
        <Button
          className="rounded-full h-8 px-4 text-[12px]"
          onClick={publish}
        >
          {agent.status === "published" ? "Republish" : "Publish"}
        </Button>
        {confirmDelete ? (
          <button
            onClick={deleteAgent}
            onBlur={() => setConfirmDelete(false)}
            autoFocus
            className="inline-flex items-center gap-1.5 rounded-full h-8 px-3 bg-red-600 hover:bg-red-700 text-white text-[12px] font-medium"
          >
            <Trash2 className="size-3.5" />
            Delete agent?
          </button>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete agent"
            title="Delete agent"
            className="size-8 rounded-full hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      {/* ============= Body ============= */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px_minmax(0,420px)]">
        {/* ---------------- Column 1: prompts ---------------- */}
        <div className="border-r border-neutral-200 bg-white p-6 overflow-y-auto thin-scrollbar">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 mb-5">
            Agent
            <span className="text-[10px] font-semibold rounded-full bg-neutral-100 text-neutral-700 px-1.5 py-0.5">
              NEW
            </span>
          </h2>

          {/* System prompt */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[13px] font-semibold">System prompt</p>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                  Auto-generated from your wizard inputs. Edit freely, or hit{" "}
                  <span className="font-medium">Regenerate</span> to rebuild from your current
                  language, traits, and goal.
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                  title="Rebuild from current config"
                  onClick={regenerate}
                >
                  <RefreshCw className="size-3" />
                  Regenerate
                </button>
                <button
                  className="size-7 rounded-md hover:bg-neutral-100 flex items-center justify-center text-neutral-600"
                  title="Improve with AI"
                  onClick={() =>
                    toast("Prompt improver", {
                      description: "Hooks into the prompt rewriter once backend lands.",
                    })
                  }
                >
                  <Wand2 className="size-3.5" />
                </button>
              </div>
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => {
                setSystemPrompt(e.target.value);
                setDirty(true);
              }}
              rows={12}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-3 text-[12.5px] leading-relaxed font-mono resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-500">
              <span>
                Type{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 font-mono text-[10px]">
                  {"{{"}
                </kbd>{" "}
                to add variables
              </span>
              <span className="inline-flex items-center gap-1">
                <Globe className="size-3" />
                Asia/Karachi
              </span>
            </div>
          </div>

          {/* First message */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-semibold">First message</p>
              <span className="text-[11px] text-neutral-500 inline-flex items-center gap-1">
                <Mic className="size-3" />
                Interruptible
                <Switch defaultChecked size="sm" />
              </span>
            </div>
            <p className="text-[11.5px] text-neutral-500 mb-2 leading-snug">
              The first message the agent will say. If empty, the agent will
              wait for the user to start the conversation.
            </p>
            <textarea
              value={firstMessage}
              onChange={(e) => {
                setFirstMessage(e.target.value);
                setDirty(true);
              }}
              rows={3}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-3 text-[12.5px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
            />
          </div>
        </div>

        {/* ---------------- Column 2: config cards ---------------- */}
        <div className="border-r border-neutral-200 bg-white p-5 overflow-y-auto thin-scrollbar space-y-5">
          <ConfigSection title="Voice" subtitle="The Urdu voice callers hear (Soniox).">
            {/* div + role/keyboard handler instead of <button>: VoicePreview
                renders its own <button> for the inline play action, so
                wrapping it in another <button> would cause the
                "button cannot be a descendant of button" hydration error. */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setVoiceSheetOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setVoiceSheetOpen(true);
                }
              }}
              className="w-full flex items-center gap-3 rounded-2xl border border-neutral-200 hover:border-neutral-300 p-2.5 pr-3 transition-colors text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <VoicePreview voice={voice} size="sm" showBadge={false} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate">{voice.name}</p>
                <p className="text-[11px] text-neutral-500 truncate">{voice.tagline}</p>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-neutral-950 text-white text-[10px] font-semibold">
                Primary
              </span>
              <ChevronRight className="size-4 text-neutral-400" />
            </div>
          </ConfigSection>

          <ConfigSection
            title="Restaurant details"
            subtitle="What callers ask about. Sent to the agent with your menu."
          >
            {/* key: remount with fresh values when switching agents */}
            <RestaurantDetailsCard
              key={agent.id}
              initial={agent.restaurant}
              onSave={(restaurant) => {
                onPatch({ restaurant });
                toast.success("Restaurant details saved", {
                  description:
                    agent.status === "published"
                      ? "Pushed to the live agent."
                      : "Publish the agent to use them on calls.",
                });
              }}
            />
          </ConfigSection>

          {agent.defaultLanguage !== "Urdu" && (
          <ConfigSection title="Voice tuning" subtitle="Adjust the mood and timing of the agent's voice. Applied live on the next call.">
            <div className="space-y-4">
              <MoodSlider
                label="Speaking speed"
                hint="Slower sounds calmer; faster sounds energetic."
                min={0.5}
                max={2}
                step={0.05}
                value={agent.voiceTuning.voiceSpeed}
                format={(v) => `${v.toFixed(2)}x`}
                onChange={(v) => setTuning({ voiceSpeed: v })}
              />
              <MoodSlider
                label="Expressiveness"
                hint="Low is flat and consistent; high is lively and varied."
                min={0}
                max={2}
                step={0.05}
                value={agent.voiceTuning.voiceTemperature}
                format={(v) => v.toFixed(2)}
                onChange={(v) => setTuning({ voiceTemperature: v })}
              />
              <MoodSlider
                label="Responsiveness"
                hint="How quickly the agent jumps in after the caller stops."
                min={0}
                max={1}
                step={0.05}
                value={agent.voiceTuning.responsiveness}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(v) => setTuning({ responsiveness: v })}
              />
              <MoodSlider
                label="Interruption sensitivity"
                hint="High lets the caller barge in and cut the agent off easily."
                min={0}
                max={1}
                step={0.05}
                value={agent.voiceTuning.interruptionSensitivity}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(v) => setTuning({ interruptionSensitivity: v })}
              />
              <label className="flex items-center justify-between gap-3 pt-1">
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium">Backchannel</span>
                  <span className="block text-[11px] text-neutral-500">
                    Natural &quot;mm-hmm&quot;, &quot;I see&quot; while the caller talks.
                  </span>
                </span>
                <Switch
                  checked={agent.voiceTuning.backchannel}
                  onCheckedChange={(v) => setTuning({ backchannel: v })}
                />
              </label>
            </div>
          </ConfigSection>
          )}

          <ConfigSection title="LLM" subtitle="Provider and model that powers the agent's reasoning.">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full flex items-center gap-2 rounded-2xl border border-neutral-200 hover:border-neutral-300 px-3 py-2.5 transition-colors text-[13px] text-left">
                <Sparkles className="size-4 text-neutral-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {currentLlm?.label ?? "Pick a model"}
                  </p>
                  {currentLlm && (
                    <p className="text-[10.5px] text-neutral-500 truncate">
                      {currentLlm.provider} · {currentLlm.description}
                    </p>
                  )}
                </div>
                <ChevronRight className="size-4 text-neutral-400 shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                {LLM_PROVIDERS.map((provider, gi) => (
                  <div key={provider}>
                    {gi > 0 && <DropdownMenuSeparator />}
                    <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                      {provider}
                    </div>
                    {LLM_MODELS.filter((m) => m.provider === provider).map((m) => {
                      const active = m.id === agent.llm;
                      return (
                        <DropdownMenuItem
                          key={m.id}
                          onClick={() => setLlm(m.id)}
                          className="flex items-start gap-2 cursor-pointer py-2"
                        >
                          <Check
                            className={cn(
                              "size-4 mt-0.5 shrink-0",
                              active ? "text-neutral-900" : "text-transparent"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium leading-tight">{m.label}</p>
                            <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">
                              {m.description}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </ConfigSection>

          <ConfigSection
            title="Agent behavior"
            subtitle="Pick the personality traits the agent applies on every turn."
          >
            <button
              type="button"
              onClick={() => setBehaviorSheetOpen(true)}
              className="w-full flex items-center gap-2 rounded-2xl border border-neutral-200 hover:border-neutral-300 px-3 py-2.5 transition-colors text-[13px] text-left"
            >
              <Sliders className="size-4 text-neutral-700 shrink-0" />
              <span className="flex-1 min-w-0 truncate font-medium">
                {activeTraits.length > 0
                  ? activeTraits.slice(0, 3).map((t) => t.label).join(" · ") +
                    (activeTraits.length > 3 ? ` +${activeTraits.length - 3}` : "")
                  : "Default behavior"}
              </span>
              <ChevronRight className="size-4 text-neutral-400 shrink-0" />
            </button>

            {/* Quick-glance trait chips */}
            {activeTraits.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {activeTraits.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-medium"
                  >
                    <t.icon className="size-2.5" strokeWidth={2.25} />
                    {t.label}
                  </span>
                ))}
              </div>
            )}
          </ConfigSection>
        </div>

        {/* ---------------- Column 3: Test panel ---------------- */}
        <TestPanel agent={agent} voice={voice} firstMessage={firstMessage} />
      </div>

      {/* Voice picker sheet */}
      <VoicePickerSheet
        open={voiceSheetOpen}
        onOpenChange={setVoiceSheetOpen}
        currentVoiceId={agent.voiceId}
        onPick={(id) => {
          onPatch({ voiceId: id });
          setVoiceSheetOpen(false);
          const v = getVoice(id);
          toast.success(`Voice changed to ${v?.name ?? "selection"}`);
        }}
      />

      {/* Behavior traits sheet */}
      <BehaviorSheet
        open={behaviorSheetOpen}
        onOpenChange={setBehaviorSheetOpen}
        active={agent.behaviorTraits}
        onToggle={toggleTrait}
      />
    </div>
  );
}

// =============================================================
// Test panel — orb + canned chat
// =============================================================

const ORB_PALETTES = [
  { c1: "oklch(72% 0.17 220)", c2: "oklch(80% 0.13 200)", c3: "oklch(75% 0.15 250)" },
  { c1: "oklch(72% 0.18 30)",  c2: "oklch(78% 0.16 60)",  c3: "oklch(75% 0.17 10)" },
  { c1: "oklch(70% 0.18 290)", c2: "oklch(78% 0.14 260)", c3: "oklch(76% 0.16 310)" },
  { c1: "oklch(72% 0.17 150)", c2: "oklch(78% 0.14 170)", c3: "oklch(75% 0.16 130)" },
  { c1: "oklch(70% 0.20 340)", c2: "oklch(78% 0.16 320)", c3: "oklch(75% 0.18 0)" },
  { c1: "oklch(74% 0.14 190)", c2: "oklch(80% 0.11 220)", c3: "oklch(77% 0.13 170)" },
];

function paletteForVoice(voiceId: string) {
  let h = 0;
  for (let i = 0; i < voiceId.length; i++) h = (h * 31 + voiceId.charCodeAt(i)) | 0;
  return ORB_PALETTES[Math.abs(h) % ORB_PALETTES.length];
}

type ChatMessage = {
  from: "user" | "agent";
  text: string;
  // Stable id so we can highlight one bubble while it's being spoken
  // without re-rendering the others.
  id: string;
};

function makeMessageId(): string {
  return `m_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function TestPanel({
  agent,
  voice,
  firstMessage,
}: {
  agent: CustomAgent;
  voice: Voice;
  firstMessage: string;
}) {
  const [tab, setTab] = useState<"inline" | "widget">("inline");
  const [muted, setMuted] = useState(false);

  // Chat starts empty. The agent's first-message text lives in the
  // editor textarea on the left column — duplicating it as an inert
  // bubble made the panel feel cluttered. Phone button speaks that
  // configured first message directly; user-driven chat below adds
  // user + agent bubble pairs as the conversation happens.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  // Track which bubble is being spoken right now so we can ring it.
  // Null while the phone button is speaking the first message (which
  // has no chat bubble).
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  const palette = paletteForVoice(voice.id);
  const tts = useTTS(voice);

  // Tune the spoken delivery to the persona's recorded vibe — narrator
  // voices speak more slowly, energetic ones a touch faster.
  const rate = useMemo(() => {
    if (voice.rate) {
      const pct = parseFloat(voice.rate.replace("%", ""));
      if (!Number.isNaN(pct)) return Math.max(0.6, Math.min(1.4, 1 + pct / 100));
    }
    return 1.0;
  }, [voice.rate]);

  const pitch = useMemo(() => {
    if (voice.pitch) {
      const hz = parseFloat(voice.pitch.replace("Hz", ""));
      if (!Number.isNaN(hz)) return Math.max(0.7, Math.min(1.3, 1 + hz / 40));
    }
    return 1.0;
  }, [voice.pitch]);

  // Mute simply cancels in-flight speech — the user can re-press the
  // phone button when they're ready.
  useEffect(() => {
    if (muted && tts.speaking) {
      tts.cancel();
      setActiveMessageId(null);
    }
  }, [muted, tts]);

  // When the persona swaps, clear the chat and cancel any in-flight
  // speech so the previous voice doesn't keep talking.
  useEffect(() => {
    tts.cancel();
    setMessages([]);
    setActiveMessageId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.id]);

  function speakMessage(msg: ChatMessage) {
    if (muted) return;
    setActiveMessageId(msg.id);
    tts.speak(msg.text, {
      rate,
      pitch,
      onEnd: () => setActiveMessageId(null),
      onError: () => setActiveMessageId(null),
    });
  }

  function previewVoice() {
    if (muted) {
      // User hit the phone with mute on; treat that as intent to unmute.
      setMuted(false);
    }
    // Phone always speaks the agent's configured first message — that's
    // the line a real caller would hear when the call connects. No chat
    // bubble is added because the text already lives in the editor's
    // First Message textarea (and shows up below the orb while
    // speaking via tts.spokenText).
    if (!firstMessage.trim()) return;
    setActiveMessageId(null);
    tts.speak(firstMessage, { rate, pitch });
  }

  function stopVoice() {
    tts.cancel();
    setActiveMessageId(null);
  }

  function sendMessage() {
    if (!draft.trim()) return;
    const userText = draft.trim();
    setDraft("");
    setMessages((m) => [...m, { id: makeMessageId(), from: "user", text: userText }]);
    // Generate the canned reply, append it, then have the agent speak
    // it. The bubble being spoken is the one we just appended, so chat
    // and audio always match.
    setTimeout(() => {
      const response = cannedResponseFor(userText, agent.mainGoal, voice);
      const reply: ChatMessage = { id: makeMessageId(), from: "agent", text: response };
      setMessages((m) => [...m, reply]);
      speakMessage(reply);
    }, 700);
  }

  const isActive = tts.speaking;
  const orbDuration = isActive ? 6 : 24;

  return (
    <div className="flex flex-col bg-white border-l border-neutral-200">
      {/* Test header */}
      <div className="px-5 py-3 border-b border-neutral-200 flex items-center justify-between">
        <div className="inline-flex rounded-full bg-neutral-100 p-0.5 text-[12px] font-medium">
          <button
            onClick={() => setTab("inline")}
            className={cn(
              "px-3 py-1 rounded-full transition-colors",
              tab === "inline" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-600"
            )}
          >
            Inline
          </button>
          <button
            onClick={() => setTab("widget")}
            className={cn(
              "px-3 py-1 rounded-full transition-colors",
              tab === "widget" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-600"
            )}
          >
            Widget
          </button>
        </div>
        <button
          onClick={() => setMuted((v) => !v)}
          className="size-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-600"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>

      {tab === "inline" && agent.defaultLanguage === "Urdu" ? (
        // Urdu agents run on Uplift: a real live conversation instead of
        // the browser-TTS preview below.
        <LiveCallPanel
          agentId={agent.id}
          agentName={agent.name}
          published={agent.status === "published"}
          colors={palette}
        />
      ) : tab === "inline" ? (
        <>
          {/* Orb area */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 min-h-[320px]">
            <div
              className="relative"
              style={{ filter: "brightness(0.95) saturate(1.05)" }}
            >
              <motion.div
                animate={{ scale: isActive ? [1, 1.02, 1] : [1, 1.005, 1] }}
                transition={{ duration: isActive ? 2 : 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <SiriOrb
                  size="200px"
                  colors={palette}
                  animationDuration={orbDuration}
                />
              </motion.div>

              <button
                onClick={isActive ? stopVoice : previewVoice}
                aria-label={isActive ? "Stop speaking" : "Play first message"}
                disabled={!tts.supported}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 size-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white bg-neutral-950 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              >
                {isActive ? <PhoneOff className="size-4" /> : <Phone className="size-4" />}
              </button>
            </div>

            {/* Live TTS status — speaks the agent's actual configured
                first message (not a fixed sample), so the text shown
                here always matches what's being heard. */}
            <div className="mt-6 min-h-[56px] flex items-center justify-center text-[11px] text-neutral-500 text-center max-w-[320px]">
              <AnimatePresence mode="wait">
                {!tts.supported ? (
                  <motion.span
                    key="unsupported"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-neutral-500"
                  >
                    Your browser does not support voice playback. Edit the
                    first message in the left column to see what your
                    agent would say.
                  </motion.span>
                ) : isActive ? (
                  <motion.div
                    key="speaking"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="inline-flex items-center gap-1.5 font-medium text-neutral-700">
                      <SpeakingDots />
                      Speaking as {voice.name}
                      {tts.matchedVoiceLabel && (
                        <span className="text-neutral-400">· {tts.matchedVoiceLabel}</span>
                      )}
                    </span>
                    {tts.spokenText && (
                      <span className="text-[10.5px] text-neutral-500 italic max-w-[300px] line-clamp-2 leading-tight">
                        &ldquo;{tts.spokenText}&rdquo;
                      </span>
                    )}
                  </motion.div>
                ) : tts.voicesReady && !tts.matchedVoice ? (
                  <motion.span
                    key="no-voice"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-neutral-500"
                  >
                    No matching {voice.language.toLowerCase()} voice installed.
                    Install a {voice.language} voice in your OS to hear audio.
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Tap the phone to hear{" "}
                    <span className="font-medium text-neutral-800">{voice.name}</span>{" "}
                    speak the agent&apos;s first message. Type below to chat
                    with{" "}
                    <span className="font-medium text-neutral-800">{agent.name}</span>.
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Chat transcript */}
          <div className="px-5 pb-3 space-y-1.5 max-h-[180px] overflow-y-auto thin-scrollbar">
            {messages.slice(-4).map((m) => (
              <ChatBubble
                key={m.id}
                from={m.from}
                text={m.text}
                active={m.id === activeMessageId}
                onReplay={
                  m.from === "agent" && tts.supported
                    ? () => speakMessage(m)
                    : undefined
                }
              />
            ))}
          </div>

          {/* Chat input */}
          <div className="border-t border-neutral-200 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white pl-4 pr-1.5 py-1 focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-200"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Send a message to start a chat"
                className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-neutral-400 py-1"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="size-8 rounded-full bg-neutral-950 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-800 transition-colors"
                aria-label="Send"
              >
                <Send className="size-3.5" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <WidgetEmbed agent={agent} />
      )}
    </div>
  );
}

function ChatBubble({
  from,
  text,
  active,
  onReplay,
}: {
  from: "user" | "agent";
  text: string;
  active?: boolean;
  onReplay?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex group/bubble",
        from === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "relative max-w-[85%] rounded-2xl px-3 py-1.5 text-[12.5px] leading-snug transition-all",
          from === "user"
            ? "bg-neutral-950 text-white"
            : "bg-neutral-100 text-neutral-900",
          active &&
            from === "agent" &&
            "ring-2 ring-neutral-900/60 ring-offset-1 ring-offset-white shadow-[0_0_0_4px_rgba(0,0,0,0.04)]"
        )}
      >
        {text}
        {/* Replay button — appears on agent bubbles on hover, only when
            TTS is available. Lets the user re-hear any past agent turn. */}
        {onReplay && !active && (
          <button
            type="button"
            onClick={onReplay}
            aria-label="Replay this message"
            className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-white border border-neutral-300 text-neutral-600 hover:text-neutral-900 hover:border-neutral-500 flex items-center justify-center opacity-0 group-hover/bubble:opacity-100 transition-opacity shadow-sm"
          >
            <Volume2 className="size-2.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/** Three pulsing dots used in the "Speaking as X" status line. */
function SpeakingDots() {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1 rounded-full bg-neutral-700"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

// Canned response generator — strictly mock. Looks at the user's message
// for cues and replies in the agent's voice's language register. Enough
// to make the demo feel real without wiring a backend.
function cannedResponseFor(userText: string, mainGoal: string, voice: Voice): string {
  const q = userText.toLowerCase();
  void voice; // catalog is English-only now; register no longer branches
  const urdu = false;
  const greet = /salam|hi|hello|hey|aoa|assalam/.test(q);
  const order = /order|pizza|menu|deal|food|buy|chahiye|chahta|chahti/.test(q);
  const help = /help|madad|issue|problem|complain|shikayat/.test(q);
  const thanks = /thanks|thank you|shukria|shukr/.test(q);
  const bye = /bye|good ?bye|allah hafiz|khuda hafiz/.test(q);

  if (greet) {
    return urdu
      ? "Wa-alaikum-as-salam! Main aap ki kis tarah madad kar sakta hoon?"
      : "Hello! I'm glad you reached out. How can I help you today?";
  }
  if (order) {
    return urdu
      ? "Bilkul, abhi aap ka order lene mein madad karta hoon. Aap kya order karna chahein ge?"
      : "Of course. I can take your order right now. What would you like to start with?";
  }
  if (help) {
    return urdu
      ? "Aap fikr na karen, mein abhi aap ka masla check karta hoon. Ek minute."
      : "I'm sorry to hear that. Let me look into this for you right away.";
  }
  if (thanks) {
    return urdu
      ? "Aap ka shukria. Kya koi aur cheez main aap ke liye kar sakta hoon?"
      : "You're very welcome. Is there anything else I can help with?";
  }
  if (bye) {
    return urdu
      ? "Allah hafiz. Aap ka din acha guzray."
      : "Thanks for calling. Have a great day.";
  }

  // Default: paraphrase main goal so the response feels grounded
  const goalSnippet = mainGoal.split(".")[0].trim();
  if (goalSnippet) {
    return urdu
      ? `Theek hai. Yeh ${voice.name === "Hassan" ? "ka" : "is"} agent ke liye bana hai: ${goalSnippet.slice(0, 90)}. Aap kya jaanna chahein ge?`
      : `Got it. I'm built to ${goalSnippet.slice(0, 100).toLowerCase()}. Could you tell me a bit more about what you're trying to do?`;
  }
  return urdu
    ? "Theek hai. Aap thori detail share kar saktay hain?"
    : "Got it. Could you share a little more detail so I can help?";
}

// =============================================================
// Voice picker sheet
// =============================================================

function VoicePickerSheet({
  open,
  onOpenChange,
  currentVoiceId,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentVoiceId: string;
  onPick: (id: string) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="!w-full sm:!max-w-md p-0 flex flex-col">
        <div className="px-6 pt-6 pb-3 border-b border-neutral-200">
          <SheetHeader className="p-0">
            <SheetTitle className="text-base">Change voice</SheetTitle>
            <SheetDescription className="text-xs">
              Pick the voice your agent uses on calls. Tap a tile to preview.
            </SheetDescription>
          </SheetHeader>
        </div>
        <div className="flex-1 overflow-y-auto thin-scrollbar p-4 space-y-2">
          {VOICES.map((v) => {
            const active = v.id === currentVoiceId;
            return (
              <div
                key={v.id}
                role="button"
                tabIndex={0}
                onClick={() => onPick(v.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onPick(v.id);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-2.5 pr-3 cursor-pointer transition-all",
                  active
                    ? "border-neutral-900 bg-neutral-50 shadow-[0_0_0_3px_rgba(0,0,0,0.05)]"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                )}
              >
                <VoicePreview voice={v} size="sm" showBadge={false} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate">{v.name}</p>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {v.tagline}
                  </p>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    {v.language}
                  </p>
                </div>
                {active && (
                  <span className="size-5 shrink-0 rounded-full bg-neutral-950 text-white flex items-center justify-center text-[11px]">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// =============================================================
// Small helpers
// =============================================================

// =============================================================
// Restaurant details
// =============================================================

const RESTAURANT_FIELDS: {
  key: Exclude<keyof RestaurantProfile, "reservations">;
  label: string;
  placeholder: string;
}[] = [
  { key: "city",          label: "City",            placeholder: "Islamabad" },
  { key: "branches",      label: "Branches",        placeholder: "F-7 Markaz, G-11 Markaz" },
  { key: "hours",         label: "Opening hours",   placeholder: "12 pm to 2 am, every day" },
  { key: "deliveryAreas", label: "Delivery areas",  placeholder: "F-6, F-7, F-8, G-9, G-10" },
  { key: "deliveryTime",  label: "Delivery time",   placeholder: "35 to 45 minutes" },
  { key: "minOrder",      label: "Minimum order",   placeholder: "Rs 800" },
  { key: "deliveryFee",   label: "Delivery fee",    placeholder: "Free above Rs 1,500" },
  { key: "payment",       label: "Payment methods", placeholder: "Cash on delivery, JazzCash" },
];

function RestaurantDetailsCard({
  initial,
  onSave,
}: {
  initial: RestaurantProfile;
  onSave: (r: RestaurantProfile) => void;
}) {
  const [draft, setDraft] = useState<RestaurantProfile>(initial);
  const [saved, setSaved] = useState<RestaurantProfile>(initial);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function patch(p: Partial<RestaurantProfile>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  return (
    <div className="space-y-2.5">
      {RESTAURANT_FIELDS.map((f) => (
        <label key={f.key} className="block">
          <span className="block text-[11px] font-medium text-neutral-600 mb-1">{f.label}</span>
          <Input
            value={draft[f.key]}
            onChange={(e) => patch({ [f.key]: e.target.value })}
            placeholder={f.placeholder}
            className="h-9 rounded-xl text-[12.5px]"
          />
        </label>
      ))}
      <label className="flex items-center justify-between gap-3 pt-1">
        <span className="text-[13px] font-medium">Takes table reservations</span>
        <Switch
          checked={draft.reservations}
          onCheckedChange={(reservations) => patch({ reservations })}
        />
      </label>
      <div className="flex items-center gap-2 pt-1">
        <Button
          size="sm"
          disabled={!dirty}
          onClick={() => {
            onSave(draft);
            setSaved(draft);
          }}
          className="rounded-full h-8 px-4"
        >
          Save details
        </Button>
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 hover:border-neutral-300 h-8 px-3 text-[12px] font-medium text-neutral-800"
        >
          <UtensilsCrossed className="size-3.5" />
          Open knowledge base
        </Link>
      </div>
    </div>
  );
}

function ConfigSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[13px] font-semibold">{title}</p>
      <p className="text-[11.5px] text-neutral-500 mt-0.5 mb-2 leading-snug">
        {subtitle}
      </p>
      {children}
    </div>
  );
}

function MoodSlider({
  label,
  hint,
  min,
  max,
  step,
  value,
  format,
  onChange,
}: {
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium">{label}</span>
        <span className="text-[12px] font-mono tabular-nums text-neutral-600">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-neutral-900 cursor-pointer"
        aria-label={label}
      />
      <p className="text-[11px] text-neutral-500 mt-1 leading-snug">{hint}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="h-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Skeleton className="h-full" />
      <Skeleton className="h-full" />
      <Skeleton className="h-full" />
    </div>
  );
}

// =============================================================
// Widget embed — what the user sees on the Widget tab of the test
// panel. Shows the HTML snippet they paste into their site, with
// copy-to-clipboard and a mini preview of how the floating widget
// would appear on a real page.
// =============================================================

function WidgetEmbed({ agent }: { agent: CustomAgent }) {
  const [variant, setVariant] = useState<"html" | "react">("html");
  const [copied, setCopied] = useState(false);

  const htmlSnippet = `<!-- Callen.ai voice widget -->
<script
  src="https://widget.callen.ai/v1.js"
  data-agent-id="${agent.id}"
  data-position="bottom-right"
  data-theme="dark"
  defer
></script>`;

  const reactSnippet = `import { CallenWidget } from "@callen/react";

export default function Layout() {
  return (
    <CallenWidget
      agentId="${agent.id}"
      position="bottom-right"
      theme="dark"
    />
  );
}`;

  const snippet = variant === "html" ? htmlSnippet : reactSnippet;

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.success("Snippet copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Copy failed. Select the text manually.");
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto thin-scrollbar">
      {/* Mini preview of how the floating widget shows up on a site */}
      <div className="px-5 pt-5 pb-3">
        <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-2">
          Preview
        </p>
        <div className="relative rounded-2xl border border-neutral-200 bg-neutral-50 h-40 overflow-hidden">
          {/* Fake browser chrome */}
          <div className="absolute inset-x-0 top-0 h-6 bg-white border-b border-neutral-200 flex items-center gap-1 px-2">
            <span className="size-1.5 rounded-full bg-neutral-300" />
            <span className="size-1.5 rounded-full bg-neutral-300" />
            <span className="size-1.5 rounded-full bg-neutral-300" />
            <span className="flex-1 mx-2 h-3 rounded bg-neutral-100" />
          </div>
          {/* Mock page content */}
          <div className="absolute inset-x-0 top-6 bottom-0 p-3 space-y-1.5">
            <div className="h-2 w-3/4 rounded bg-neutral-200" />
            <div className="h-2 w-1/2 rounded bg-neutral-200" />
            <div className="h-2 w-2/3 rounded bg-neutral-200" />
          </div>
          {/* The floating widget orb in the bottom-right */}
          <div className="absolute bottom-3 right-3 size-12 rounded-full bg-neutral-950 flex items-center justify-center shadow-lg ring-2 ring-white">
            <MessageCircle className="size-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>
        </div>
      </div>

      {/* Variant switcher */}
      <div className="px-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">
            Embed snippet
          </p>
          <div className="inline-flex rounded-full bg-neutral-100 p-0.5 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setVariant("html")}
              className={cn(
                "px-2.5 py-0.5 rounded-full transition-colors",
                variant === "html" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-600"
              )}
            >
              HTML
            </button>
            <button
              type="button"
              onClick={() => setVariant("react")}
              className={cn(
                "px-2.5 py-0.5 rounded-full transition-colors",
                variant === "react" ? "bg-white text-neutral-950 shadow-sm" : "text-neutral-600"
              )}
            >
              React
            </button>
          </div>
        </div>
        <div className="relative rounded-xl border border-neutral-200 bg-neutral-950 text-neutral-100 overflow-hidden">
          <button
            type="button"
            onClick={copy}
            aria-label="Copy snippet"
            className="absolute top-2 right-2 inline-flex items-center gap-1 h-7 px-2 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-[11px] font-medium text-neutral-100 transition-colors"
          >
            {copied ? (
              <>
                <CheckCheck className="size-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Copy
              </>
            )}
          </button>
          <pre className="overflow-x-auto thin-scrollbar px-3.5 py-3 pr-20 text-[11.5px] font-mono leading-relaxed">
            <code>{snippet}</code>
          </pre>
        </div>
      </div>

      {/* Quick instructions */}
      <div className="px-5 pb-4 pt-3">
        <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-2">
          How to add it
        </p>
        <ol className="space-y-2 text-[12px] text-neutral-700 leading-relaxed">
          <Step n={1}>
            {variant === "html" ? (
              <>Paste the snippet right before the closing <code className="px-1 py-0.5 rounded bg-neutral-100 text-[11px] font-mono">{"</body>"}</code> tag on every page you want the widget on.</>
            ) : (
              <>Install with <code className="px-1 py-0.5 rounded bg-neutral-100 text-[11px] font-mono">npm i @callen/react</code> and render the component inside your root layout.</>
            )}
          </Step>
          <Step n={2}>
            The floating phone button appears in the corner. Visitors tap it to start a conversation with this agent in real time.
          </Step>
          <Step n={3}>
            Override the defaults by changing{" "}
            <code className="px-1 py-0.5 rounded bg-neutral-100 text-[11px] font-mono">position</code>{" "}
            (<span className="font-mono text-[11px]">bottom-right</span>,{" "}
            <span className="font-mono text-[11px]">bottom-left</span>) or{" "}
            <code className="px-1 py-0.5 rounded bg-neutral-100 text-[11px] font-mono">theme</code>{" "}
            (<span className="font-mono text-[11px]">light</span>,{" "}
            <span className="font-mono text-[11px]">dark</span>).
          </Step>
        </ol>
      </div>

      {/* Agent metadata footer */}
      <div className="mt-auto border-t border-neutral-200 px-5 py-3 bg-neutral-50/60 text-[11px] text-neutral-500 flex items-center justify-between">
        <span>
          Agent ID:{" "}
          <span className="font-mono text-neutral-700">{agent.id}</span>
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
            agent.status === "published"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          )}
        >
          {agent.status === "published" ? "Live" : "Draft · publish to enable"}
        </span>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="size-5 shrink-0 rounded-full bg-neutral-900 text-white text-[10px] font-semibold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <span className="flex-1">{children}</span>
    </li>
  );
}

// =============================================================
// Behavior traits sheet — chip selector for personality traits.
// Toggled traits get baked into the system prompt's Style section
// the next time the user hits Regenerate.
// =============================================================

function BehaviorSheet({
  open,
  onOpenChange,
  active,
  onToggle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="!w-full sm:!max-w-md p-0 flex flex-col">
        <div className="px-6 pt-6 pb-3 border-b border-neutral-200">
          <SheetHeader className="p-0">
            <SheetTitle className="text-base">Agent behavior</SheetTitle>
            <SheetDescription className="text-xs">
              Pick the traits that colour your agent's reply style. Selected
              traits get added to the system prompt when you hit Regenerate.
            </SheetDescription>
          </SheetHeader>
        </div>
        <div className="flex-1 overflow-y-auto thin-scrollbar p-4 space-y-2">
          {BEHAVIOR_TRAITS.map((t) => {
            const isActive = active.includes(t.id);
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggle(t.id)}
                className={cn(
                  "w-full flex items-start gap-3 rounded-2xl border p-3 text-left transition-all",
                  isActive
                    ? "border-neutral-900 bg-neutral-50 shadow-[0_0_0_3px_rgba(0,0,0,0.05)]"
                    : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                <div
                  className={cn(
                    "size-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    isActive
                      ? "bg-neutral-950 text-white"
                      : "bg-neutral-100 text-neutral-700"
                  )}
                >
                  <Icon className="size-4" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-neutral-950">
                      {t.label}
                    </p>
                    {isActive && (
                      <span className="size-5 shrink-0 rounded-full bg-neutral-950 text-white flex items-center justify-center text-[11px]">
                        <Check className="size-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-neutral-500 mt-0.5 leading-snug">
                    {t.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="border-t border-neutral-200 px-6 py-3 bg-neutral-50/50">
          <p className="text-[11px] text-neutral-500 leading-snug">
            {active.length === 0 ? (
              <>No traits selected. The agent will use the default Callen voice.</>
            ) : (
              <>
                <span className="font-semibold text-neutral-700">
                  {active.length}
                </span>{" "}
                trait{active.length === 1 ? "" : "s"} selected. Click{" "}
                <span className="font-semibold text-neutral-700">Regenerate</span>{" "}
                on the system prompt to apply.
              </>
            )}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
