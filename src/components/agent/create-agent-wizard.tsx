// Create Agent — 4-step wizard launched from /agent or the sidebar "+" button.
// Callen builds one kind of agent: an Urdu phone receptionist for a
// restaurant, running on Uplift AI.
// Step 1: Restaurant   (name, city, restaurant type)
// Step 2: Main job     (orders, reservations, menu questions, catering, complaints)
// Step 3: Details      (branches, hours, delivery areas, fees, payment; all optional)
// Step 4: Voice        (Uplift Urdu voices, with inline preview playback)
//
// Create saves the agent (as a draft) and opens its editor, where the
// Talk live panel and the Menu & Deals page finish the job.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronLeft, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { VOICES, DEFAULT_VOICE_ID, type Voice } from "@/lib/voice-library";
import { VoicePreview } from "@/components/voices/voice-preview";
import { useCustomAgentsStore } from "@/lib/custom-agents-store";
import {
  INDUSTRIES,
  USE_CASES,
  EMPTY_RESTAURANT,
  type RestaurantProfile,
} from "@/lib/agent-meta";

type Step = 1 | 2 | 3 | 4;
const LAST_STEP: Step = 4;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateAgentWizard({ open, onOpenChange }: Props) {
  const router = useRouter();
  const addAgent = useCustomAgentsStore((s) => s.addAgent);

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);
  const [useCase, setUseCase] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantProfile>({ ...EMPTY_RESTAURANT });
  const [voiceId, setVoiceId] = useState<string>(DEFAULT_VOICE_ID);

  const NAME_MAX = 50;

  function reset() {
    setStep(1);
    setName("");
    setIndustry(null);
    setUseCase(null);
    setRestaurant({ ...EMPTY_RESTAURANT });
    setVoiceId(DEFAULT_VOICE_ID);
  }

  function close() {
    onOpenChange(false);
    // Reset slightly after the close animation
    setTimeout(reset, 250);
  }

  function next() {
    if (step < LAST_STEP) setStep((s) => (s + 1) as Step);
  }
  function back() {
    if (step > 1) setStep((s) => (s - 1) as Step);
  }

  function canProceed(): boolean {
    if (step === 1) return name.trim().length > 0 && industry !== null;
    if (step === 2) return useCase !== null;
    if (step === 3) return true;
    if (step === 4) return Boolean(voiceId);
    return false;
  }

  function patchRestaurant(patch: Partial<RestaurantProfile>) {
    setRestaurant((r) => ({ ...r, ...patch }));
  }

  function create() {
    const restaurantName = name.trim();
    const id = addAgent({
      name: restaurantName,
      type: "business",
      industry,
      useCase,
      voiceId,
      website: "",
      mainGoal: "",
      chatOnly: false,
      restaurant: {
        ...restaurant,
        reservations: restaurant.reservations || useCase === "reservation",
      },
    });
    const voice = VOICES.find((v) => v.id === voiceId);
    toast.success(`${restaurantName} agent created`, {
      description: voice
        ? `Voice: ${voice.name}. Add your menu, then publish to talk to it.`
        : "Add your menu, then publish to talk to it.",
    });
    close();
    // Land on the new agent's editor + test page.
    router.push(`/agent/${id}`);
  }

  const { title, subtitle } = STEP_META[step];

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent
        className="!max-w-3xl p-0 gap-0 overflow-hidden"
        showCloseButton
      >
        <div className="flex flex-col max-h-[88vh]">
          {/* Header */}
          <div className="px-7 pt-7 pb-4">
            <DialogTitle className="text-[22px] font-bold tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-neutral-500 mt-0.5">
              {subtitle}
            </DialogDescription>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-7 pb-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                {step === 1 && (
                  <StepRestaurant
                    name={name}
                    setName={(v) => setName(v.slice(0, NAME_MAX))}
                    nameMax={NAME_MAX}
                    city={restaurant.city}
                    setCity={(city) => patchRestaurant({ city })}
                    urduName={restaurant.urduName}
                    setUrduName={(urduName) => patchRestaurant({ urduName })}
                    industry={industry}
                    setIndustry={setIndustry}
                  />
                )}
                {step === 2 && (
                  <StepJob
                    selected={useCase}
                    onSelect={(id) => {
                      setUseCase(id);
                      // Auto advance for a snappier feel
                      setTimeout(next, 220);
                    }}
                  />
                )}
                {step === 3 && (
                  <StepDetails restaurant={restaurant} patch={patchRestaurant} />
                )}
                {step === 4 && (
                  <StepVoice selected={voiceId} onSelect={setVoiceId} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 bg-white px-7 py-4 flex items-center justify-between gap-3">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={back}
                className="rounded-full gap-1 h-9 px-4"
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>
            ) : (
              <span />
            )}

            {/* Pagination dots */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === step ? "w-6 bg-neutral-950" : "w-1.5 bg-neutral-300"
                  )}
                />
              ))}
            </div>

            {step === LAST_STEP ? (
              <Button
                onClick={create}
                disabled={!canProceed()}
                className="rounded-full h-9 px-5"
              >
                Create Agent
              </Button>
            ) : step === 2 ? (
              <span className="w-[92px]" />
            ) : (
              <Button
                onClick={next}
                disabled={!canProceed()}
                className="rounded-full h-9 px-5 gap-1"
              >
                {step === 3 ? "Next" : "Continue"}
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================
// Step metadata
// =============================================================

const STEP_META: Record<Step, { title: string; subtitle: string }> = {
  1: {
    title: "New restaurant agent",
    subtitle: "An Urdu phone receptionist that answers your restaurant's calls.",
  },
  2: {
    title: "What is its main job?",
    subtitle: "It handles everything, but leads with this. You can change it later.",
  },
  3: {
    title: "Restaurant details",
    subtitle: "What callers ask about most. All optional; you can fill these in later.",
  },
  4: {
    title: "Pick a voice",
    subtitle: "Urdu voices from Soniox. Tap any tile to preview.",
  },
};

// =============================================================
// Step 1: Restaurant
// =============================================================

function StepRestaurant({
  name,
  setName,
  nameMax,
  city,
  setCity,
  urduName,
  setUrduName,
  industry,
  setIndustry,
}: {
  name: string;
  setName: (v: string) => void;
  nameMax: number;
  city: string;
  setCity: (v: string) => void;
  urduName: string;
  setUrduName: (v: string) => void;
  industry: string | null;
  setIndustry: (v: string) => void;
}) {
  return (
    <div className="space-y-5 pb-2">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="restaurant-name" className="text-[13px] font-medium">
              Restaurant name <span className="text-rose-500">*</span>
            </Label>
            <span className="text-[11px] text-neutral-400 tabular-nums">
              {name.length}/{nameMax}
            </span>
          </div>
          <Input
            id="restaurant-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cheezious G-11"
            className="h-10 rounded-xl"
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="restaurant-city" className="text-[13px] font-medium mb-1.5 block">
            City
          </Label>
          <Input
            id="restaurant-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Islamabad"
            className="h-10 rounded-xl"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="restaurant-urdu-name" className="text-[13px] font-medium mb-1.5 block">
          Name in Urdu <span className="text-neutral-400 font-normal">(how callers say it)</span>
        </Label>
        <Input
          id="restaurant-urdu-name"
          dir="rtl"
          value={urduName}
          onChange={(e) => setUrduName(e.target.value.slice(0, 80))}
          placeholder="مثلاً: چیزیئس جی الیون"
          className="h-10 rounded-xl"
        />
        <p className="text-[11px] text-neutral-500 mt-1.5">
          The agent says this in its greeting. English letters inside Urdu make the voice stumble.
        </p>
      </div>

      <div>
        <p className="text-[13px] font-medium mb-2">
          Type of restaurant <span className="text-rose-500">*</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {INDUSTRIES.map((item) => (
            <OptionCard
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={industry === item.id}
              onClick={() => setIndustry(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Step 2: Main job
// =============================================================

function StepJob({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-2">
      {USE_CASES.map((item) => (
        <OptionCard
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={selected === item.id}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </div>
  );
}

function OptionCard({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-5 transition-all",
        active
          ? "border-neutral-900 bg-neutral-50 shadow-[0_0_0_3px_rgba(0,0,0,0.05)]"
          : "border-neutral-200 bg-white hover:border-neutral-300"
      )}
    >
      <Icon className="size-5 text-neutral-700" strokeWidth={1.75} />
      <span className="text-[13px] font-medium text-neutral-900 text-center leading-tight">
        {label}
      </span>
    </button>
  );
}

// =============================================================
// Step 3: Details
// =============================================================

const DETAIL_FIELDS: {
  key: Exclude<keyof RestaurantProfile, "reservations" | "city">;
  label: string;
  placeholder: string;
}[] = [
  { key: "branches",      label: "Branches",              placeholder: "F-7 Markaz, G-11 Markaz" },
  { key: "hours",         label: "Opening hours",         placeholder: "12 pm to 2 am, every day" },
  { key: "deliveryAreas", label: "Delivery areas",        placeholder: "F-6, F-7, F-8, G-9, G-10, G-11" },
  { key: "deliveryTime",  label: "Delivery time",         placeholder: "35 to 45 minutes" },
  { key: "minOrder",      label: "Minimum order",         placeholder: "Rs 800" },
  { key: "deliveryFee",   label: "Delivery fee",          placeholder: "Free above Rs 1,500, otherwise Rs 150" },
  { key: "payment",       label: "Payment methods",       placeholder: "Cash on delivery, JazzCash, card" },
];

function StepDetails({
  restaurant,
  patch,
}: {
  restaurant: RestaurantProfile;
  patch: (p: Partial<RestaurantProfile>) => void;
}) {
  return (
    <div className="space-y-4 pb-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DETAIL_FIELDS.map((f) => (
          <div key={f.key} className={f.key === "deliveryAreas" ? "sm:col-span-2" : undefined}>
            <Label htmlFor={`detail-${f.key}`} className="text-[13px] font-medium mb-1.5 block">
              {f.label}
            </Label>
            <Input
              id={`detail-${f.key}`}
              value={restaurant[f.key]}
              onChange={(e) => patch({ [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="h-10 rounded-xl"
            />
          </div>
        ))}
      </div>
      <ToggleRow
        label="Takes table reservations"
        description="The agent books tables: name, phone, date, time and guests."
        checked={restaurant.reservations}
        onChange={(reservations) => patch({ reservations })}
      />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 px-4 py-3">
      <Switch checked={checked} onCheckedChange={onChange} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-neutral-900">{label}</p>
        <p className="text-[11.5px] text-neutral-500 leading-tight mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// =============================================================
// Step 4: Voice
// =============================================================

function StepVoice({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pb-2">
      {VOICES.map((v) => (
        <VoicePickerRow
          key={v.id}
          voice={v}
          active={selected === v.id}
          onSelect={() => onSelect(v.id)}
        />
      ))}
    </div>
  );
}

function VoicePickerRow({
  voice,
  active,
  onSelect,
}: {
  voice: Voice;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-2.5 pr-3 cursor-pointer transition-all",
        active
          ? "border-neutral-900 bg-neutral-50 shadow-[0_0_0_3px_rgba(0,0,0,0.05)]"
          : "border-neutral-200 bg-white hover:border-neutral-300"
      )}
    >
      <VoicePreview voice={voice} size="sm" showBadge={false} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-neutral-950 truncate tracking-tight">
          {voice.name}
        </p>
        <p className="text-[11px] text-neutral-500 truncate">{voice.tagline}</p>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-700">
          <span aria-hidden>🇵🇰</span>
          <span>
            {voice.gender} · {voice.accent === "Neutral" ? "Urdu" : `Urdu, ${voice.accent} accent`}
          </span>
        </div>
      </div>
      {active && (
        <span className="size-5 shrink-0 rounded-full bg-neutral-950 text-white flex items-center justify-center text-[11px]">
          ✓
        </span>
      )}
    </div>
  );
}
