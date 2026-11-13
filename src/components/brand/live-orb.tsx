// The hero's voice orbs: the same Callen orb, drawn by a small WebGL
// shader so the colour inside can behave like liquid.
//
// Not speaking: a calm, softly clouded gradient on a lit sphere. Still.
//
// Speaking: the liquid is stirred. It flows round and round the orb, in a
// ring around the play button: fastest in that ring, slower at the rim,
// and calm in the very middle. How fast it flows follows the voice, so it
// surges on loud syllables and eases in the gaps between words. A light
// extra twist and faint ripples ride on each syllable.
//
// Stopping: the flow coasts to a halt, the way stirred liquid does, and
// stays exactly where it stopped. Nothing winds back or resets, so the orb
// never changes its picture between speaking and resting.
//
// How the endless flow is done: liquid that keeps circling would wind the
// picture into ever-tighter spirals. So two copies of the colour field are
// carried along the flow, half a cycle apart; each is faded out before it
// has wound too far and faded back in fresh, while the other covers for it.
// The eye sees one liquid flowing without end.
//
// If WebGL is not available the ordinary SVG orb is shown instead.

"use client";

import { useEffect, useRef, useState } from "react";
import { Orb, ORB_PALETTES, speechLike, type OrbPalette } from "@/components/brand/orb";
import { cn } from "@/lib/utils";

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uFlow;   // how far the liquid has flowed, in cycles
uniform float uLevel;  // the voice right now, 0..1
uniform float uTwist;  // extra twist on each syllable, in radians
uniform float uSeed;
uniform vec3 uBase, uLight, uDeep, uPale, uVivid, uDark;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  // three octaves, each much quieter than the last: broad clouds of
  // colour with soft edges, no veins
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = p * 1.9 + vec2(17.1, 9.2); a *= 0.4; }
  return v / 0.78;
}

// the colour field: broad, soft noise, gently warped by more noise
float field(vec2 q, float shift) {
  vec2 w = q * 1.05 + uSeed + shift;
  float n1 = fbm(w);
  return fbm(w * 1.15 + 0.7 * vec2(n1, 1.0 - n1));
}
// turn a point about the centre
vec2 spin(vec2 v, float a) {
  float c = cos(a), sn = sin(a);
  return vec2(c * v.x - sn * v.y, sn * v.x + c * v.y);
}

void main() {
  vec2 p = (gl_FragCoord.xy / uRes - 0.5) * 2.0;
  float r = length(p);
  float alpha = 1.0 - smoothstep(0.985, 1.0, r);
  if (alpha <= 0.0) { gl_FragColor = vec4(0.0); return; }

  // the sphere: height of the surface at this point, used for the lens
  // effect on the texture and for the lighting
  float z = sqrt(max(0.0, 1.0 - r * r));
  vec2 s = p * (1.0 - 0.26 * z);

  // How fast the liquid circles at this distance from the centre: calm in
  // the very middle (under the play button), fastest in a ring around it,
  // slower again towards the rim.
  float speed = smoothstep(0.04, 0.42, r) * (1.0 - 0.7 * smoothstep(0.5, 1.0, r));
  // the syllable twist, strongest near the middle
  float pulse = uTwist * max(0.0, 1.0 - r);

  // Two copies of the field ride the flow half a cycle apart. Each is
  // carried from -half to +half of its sweep, and is invisible at both ends.
  float ph0 = fract(uFlow);
  float ph1 = fract(uFlow + 0.5);
  float w1 = abs(1.0 - 2.0 * ph0);
  float w0 = 1.0 - w1;
  const float SWEEP = 3.4; // radians of travel in one life of a copy
  float t0 = field(spin(s, speed * (ph0 - 0.5) * SWEEP + pulse), 0.0);
  float t1 = field(spin(s, speed * (ph1 - 0.5) * SWEEP + pulse), 7.31);
  // blend them, keeping the contrast the same all the way through
  float n2 = 0.5 + ((t0 - 0.5) * w0 + (t1 - 0.5) * w1) / sqrt(w0 * w0 + w1 * w1);

  // faint ripples riding outward on each syllable
  float ring = sin(r * 9.0 - uFlow * 12.0 + n2 * 3.0);
  float t = n2 + 0.06 * ring * uLevel * (1.0 - 0.5 * r);
  t = smoothstep(0.24, 0.76, t);

  // mostly the middle of the palette, in wide bands that melt into each
  // other; the darkest and palest tones only tint the two ends
  vec3 col = mix(uDeep, uBase, smoothstep(0.0, 0.5, t));
  col = mix(col, uVivid, smoothstep(0.25, 0.7, t));
  col = mix(col, uLight, smoothstep(0.5, 0.95, t));
  col = mix(col, uPale, 0.4 * smoothstep(0.8, 1.0, t));
  col = mix(col, uDark, 0.22 * (1.0 - smoothstep(0.0, 0.25, t)));
  // the whole orb lifts a little with the voice
  col = mix(col, uPale, 0.1 * uLevel);

  // light from the top left
  vec3 nrm = vec3(p, z);
  vec3 L = normalize(vec3(-0.5, 0.6, 0.72));
  float diff = max(0.0, dot(nrm, L));
  col *= 0.68 + 0.44 * diff;
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  col += vec3(1.0) * pow(max(0.0, dot(nrm, H)), 24.0) * 0.2;
  // darker towards the edge, with a little light bounced onto the lower rim
  col *= mix(1.0, 0.74, smoothstep(0.72, 1.0, r));
  col += uLight * 0.12 * smoothstep(0.82, 1.0, r) * max(0.0, 0.25 - nrm.y * 0.6);

  // film grain, fixed in place
  col += (hash(gl_FragCoord.xy * 0.731) - 0.5) * 0.07;

  gl_FragColor = vec4(col * alpha, alpha);
}
`;

const rgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
];

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export function LiveOrb({
  palette = "ember",
  active = false,
  level,
  className,
}: {
  palette?: OrbPalette;
  // True while this orb's voice is speaking.
  active?: boolean;
  // The voice level right now, 0 to 1. Return null (or leave it out) to
  // use a built-in speech-like rhythm.
  level?: () => number | null;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [noGl, setNoGl] = useState(false);
  const live = useRef({ active, level });
  useEffect(() => {
    live.current = { active, level };
  });

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const gl = el.getContext("webgl", { premultipliedAlpha: true, antialias: false });
    const vs = gl && compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = gl && compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl && vs && fs ? gl.createProgram() : null;
    if (!gl || !vs || !fs || !program) {
      setNoGl(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setNoGl(true);
      return;
    }
    gl.useProgram(program);

    // one big triangle covering the canvas
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const p = ORB_PALETTES[palette];
    const [light, deep, pale, vivid, dark] = p.blobs;
    gl.uniform3fv(u("uBase"), rgb(p.base));
    gl.uniform3fv(u("uLight"), rgb(light));
    gl.uniform3fv(u("uDeep"), rgb(deep));
    gl.uniform3fv(u("uPale"), rgb(pale));
    gl.uniform3fv(u("uVivid"), rgb(vivid));
    gl.uniform3fv(u("uDark"), rgb(dark));
    gl.uniform1f(u("uSeed"), p.seed * 1.37);
    const uRes = u("uRes"), uFlow = u("uFlow"), uLevel = u("uLevel"), uTwist = u("uTwist");

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let onScreen = true;
    const seen = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    seen.observe(el);

    let raf = 0;
    let last = performance.now();
    let t = 0;
    let flow = (p.seed * 0.37) % 1; // start each palette at a different point of the flow
    let fast = 0;
    let slow = 0;
    let drawn = false;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!onScreen) return;
      t += dt;

      const speaking = live.current.active && !still;
      const measured = speaking ? live.current.level?.() : 0;
      const target = speaking ? (measured ?? speechLike(t)) : 0;
      // fast follows each syllable; slow is the overall energy
      const follow = (value: number, to: number, up: number, down: number) =>
        value + (to - value) * (1 - Math.exp(-dt / (to > value ? up : down)));
      fast = follow(fast, target, 0.06, 0.26);
      slow = follow(slow, target, 0.3, 0.9);

      const moving = fast > 0.001 || slow > 0.001;
      // The liquid flows only while there is voice: steady with the overall
      // energy, surging on each syllable. With no voice it does not move.
      flow += dt * (0.3 * slow + 0.16 * fast);

      // keep the drawing buffer in step with the element's size
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const size = Math.max(2, Math.round(el.clientWidth * dpr));
      const resized = el.width !== size || el.height !== size;
      if (resized) {
        el.width = size;
        el.height = size;
        gl.viewport(0, 0, size, size);
      }
      // at rest nothing changes, so there is nothing to redraw
      if (!moving && drawn && !resized) return;
      gl.uniform2f(uRes, el.width, el.height);
      gl.uniform1f(uFlow, flow);
      gl.uniform1f(uLevel, fast);
      gl.uniform1f(uTwist, 0.9 * fast);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      drawn = true;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      seen.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [palette]);

  if (noGl) return <Orb palette={palette} active={active} level={level} className={className} />;

  return (
    <span aria-hidden className={cn("relative block shrink-0 rounded-full [container-type:size]", className)}>
      {/* soft neutral shadow on the "floor" under the sphere */}
      <span
        className="absolute rounded-[50%]"
        style={{ left: "14cqw", right: "14cqw", bottom: "-9cqw", height: "22cqw", backgroundColor: "#000", filter: "blur(9cqw)", opacity: 0.16 }}
      />
      <canvas ref={canvas} className="absolute inset-0 size-full rounded-full" />
    </span>
  );
}
