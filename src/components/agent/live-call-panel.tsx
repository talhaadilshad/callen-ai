// Live Call panel for Urdu (Uplift) agents in the Agent Studio.
// Asks our server for a session token, joins the LiveKit room Uplift
// hosts, sends the mic, plays the agent's voice and shows live captions
// from the room's transcription stream. A real conversation, not the
// browser-TTS preview English agents get.

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, PhoneOff, Mic, MicOff, Loader2 } from "lucide-react";
import { Room, RoomEvent, Track, type TextStreamReader } from "livekit-client";
import { cn } from "@/lib/utils";
import { SiriOrb, type SiriOrbColors } from "@/components/ui/siri-orb";

type Status = "idle" | "connecting" | "live";

type Caption = { id: string; fromAgent: boolean; text: string };

// Soft cap so a forgotten tab doesn't burn minutes.
const MAX_CALL_SECONDS = 10 * 60;
const MAX_CAPTIONS = 6;

export function LiveCallPanel({
  agentId,
  agentName,
  published,
  colors,
}: {
  agentId: string;
  agentName: string;
  published: boolean;
  colors: SiriOrbColors;
}) {
  const roomRef = useRef<Room | null>(null);
  const audioHostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [captions, setCaptions] = useState<Caption[]>([]);

  // Leave the room if the editor unmounts or the agent changes.
  useEffect(() => {
    return () => {
      void roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, [agentId]);

  useEffect(() => {
    if (status !== "live") return;
    const t = setInterval(() => {
      setElapsed((s) => {
        if (s + 1 >= MAX_CALL_SECONDS) void roomRef.current?.disconnect();
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  async function start() {
    setError(null);
    setCaptions([]);
    setElapsed(0);
    setMicOn(true);
    setStatus("connecting");

    try {
      const res = await fetch(`/api/agents/${agentId}/voice-session`, { method: "POST" });
      const body = (await res.json().catch(() => null)) as
        | { token?: string; wsUrl?: string; error?: string }
        | null;
      if (!res.ok || !body?.token || !body.wsUrl) {
        throw new Error(body?.error ?? `Could not start the call (${res.status})`);
      }

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind !== Track.Kind.Audio) return;
        const el = track.attach();
        audioHostRef.current?.appendChild(el);
      });
      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach().forEach((el) => el.remove());
      });
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        setAgentSpeaking(speakers.some((p) => p.identity !== room.localParticipant.identity));
      });
      room.on(RoomEvent.Disconnected, () => {
        roomRef.current = null;
        setAgentSpeaking(false);
        setStatus("idle");
      });

      // LiveKit agents publish transcripts as text streams; each stream
      // is one utterance arriving in deltas.
      room.registerTextStreamHandler("lk.transcription", (reader: TextStreamReader, participant) => {
        const id = reader.info.id;
        const fromAgent = participant.identity !== room.localParticipant.identity;
        void (async () => {
          for await (const delta of reader) {
            setCaptions((prev) => {
              const i = prev.findIndex((c) => c.id === id);
              if (i === -1) return [...prev, { id, fromAgent, text: delta }].slice(-MAX_CAPTIONS);
              const next = [...prev];
              next[i] = { ...next[i], text: next[i].text + delta };
              return next;
            });
          }
        })();
      });

      await room.connect(body.wsUrl, body.token);
      try {
        await room.localParticipant.setMicrophoneEnabled(true);
      } catch {
        await room.disconnect();
        throw new Error("Microphone access is needed to talk to the agent. Allow it in your browser and try again.");
      }
      setStatus("live");
    } catch (err) {
      void roomRef.current?.disconnect();
      roomRef.current = null;
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Could not start the call.");
    }
  }

  function hangUp() {
    void roomRef.current?.disconnect();
  }

  async function toggleMic() {
    const room = roomRef.current;
    if (!room) return;
    await room.localParticipant.setMicrophoneEnabled(!micOn);
    setMicOn(!micOn);
  }

  const live = status === "live";
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex-1 flex flex-col items-center px-6 py-6 min-h-[320px]">
      <div ref={audioHostRef} className="hidden" />

      <div className="relative mt-4" style={{ filter: "brightness(0.95) saturate(1.05)" }}>
        <motion.div
          animate={{ scale: agentSpeaking ? [1, 1.03, 1] : [1, 1.005, 1] }}
          transition={{ duration: agentSpeaking ? 1.2 : 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <SiriOrb size="200px" colors={colors} animationDuration={agentSpeaking ? 5 : live ? 12 : 24} />
        </motion.div>

        <button
          onClick={live ? hangUp : start}
          disabled={status === "connecting" || (!published && !live)}
          aria-label={live ? "End call" : "Start live call"}
          className={cn(
            "absolute -bottom-2 left-1/2 -translate-x-1/2 size-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
            live ? "bg-red-600 hover:bg-red-700" : "bg-neutral-950 hover:bg-neutral-800"
          )}
        >
          {status === "connecting" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : live ? (
            <PhoneOff className="size-4" />
          ) : (
            <Phone className="size-4" />
          )}
        </button>
      </div>

      <div className="mt-6 flex items-center gap-2 text-[11px] text-neutral-500">
        {live ? (
          <>
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-neutral-800">Live with {agentName}</span>
            <span className="tabular-nums">· {mm}:{ss}</span>
            <button
              onClick={toggleMic}
              aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
              className="ml-1 size-6 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-600"
            >
              {micOn ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}
            </button>
          </>
        ) : status === "connecting" ? (
          <span>Connecting…</span>
        ) : published ? (
          <span>Press the phone to talk to your agent in Urdu</span>
        ) : (
          <span>Publish the agent to talk to it live</span>
        )}
      </div>

      {error && (
        <p className="mt-3 max-w-[320px] text-center text-[11px] text-red-600">{error}</p>
      )}

      <div className="mt-5 w-full max-w-[360px] space-y-2">
        <AnimatePresence initial={false}>
          {captions.map((c) => (
            <motion.p
              key={c.id}
              dir="auto"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                c.fromAgent ? "bg-neutral-100 text-neutral-900" : "bg-neutral-950 text-white ml-8"
              )}
            >
              {c.text}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
