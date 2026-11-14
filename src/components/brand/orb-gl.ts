// The drawing and the motion of the hero's voice orbs, kept free of React
// so the same code can be stepped frame by frame in a test.
//
//   createOrbGl(canvas, palette)  draws one orb with WebGL
//   newOrbSim / stepOrbSim        how the orb responds to a voice level
//
// The behaviour is modelled on a reference recording of a well-made voice
// orb, measured frame by frame against its own audio track.
//
//   At rest      a soft, high-key gradient (deep tones to warm cream) on a
//                lightly lit sphere. It drifts so slowly that it reads as
//                still.
//   Speaking     the orb behaves like liquid being stirred from the middle:
//                - each syllable sends a soft ring rippling outward from
//                  around the play button, like a drop landing in water
//                - the liquid is wound round the centre, more the longer
//                  and louder the voice goes on, with a little spring in it,
//                  so the colours sweep into spiral bands
//                - the whole surface turns slowly, in rounds
//                - the dark tones lift and the folds catch the light, with a
//                  lit edge and a shadowed edge, so they look raised
//   Stopping     the rings fade, the winding springs back and settles, and
//                the turning coasts to a stop. What is left is the same calm
//                gradient, resting where the liquid stopped. Nothing jumps.

import { ORB_PALETTES, type OrbPalette } from "@/components/brand/orb";

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const MAX_RIPPLES = 4;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;    // slow clock: the calm drift of the gradient
uniform float uTwist;   // how far the middle is wound past the rim, radians
uniform float uSpin;    // how far the whole liquid has turned, radians
uniform float uLevel;   // the voice right now, 0..1 (follows each syllable)
uniform float uEnergy;  // the voice averaged over about a second
uniform vec4 uRip[${MAX_RIPPLES}];  // ripples: radius, strength, width, unused
uniform float uSeed;
uniform vec2 uWin;  // the part of the noise field spread over the colour ramp
uniform vec3 uS0, uS1, uS2, uS3, uS4, uS5;  // colour stops, deep to cream

float hash1(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise3(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash1(i), hash1(i + vec3(1.0, 0.0, 0.0)), f.x),
                 mix(hash1(i + vec3(0.0, 1.0, 0.0)), hash1(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(hash1(i + vec3(0.0, 0.0, 1.0)), hash1(i + vec3(1.0, 0.0, 1.0)), f.x),
                 mix(hash1(i + vec3(0.0, 1.0, 1.0)), hash1(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
// three octaves, each much quieter than the last: broad, soft shapes
float fbm3(vec3 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise3(p); p = p * 1.9 + vec3(11.3, 7.7, 5.1); a *= 0.45; }
  return v / 0.826;
}
float grain(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
// six colour stops, evenly spaced, melting into each other
vec3 ramp(float t) {
  t = clamp(t, 0.0, 1.0) * 5.0;
  vec3 c = mix(uS0, uS1, smoothstep(0.0, 1.0, t));
  c = mix(c, uS2, smoothstep(1.0, 2.0, t));
  c = mix(c, uS3, smoothstep(2.0, 3.0, t));
  c = mix(c, uS4, smoothstep(3.0, 4.0, t));
  return mix(c, uS5, smoothstep(4.0, 5.0, t));
}

void main() {
  vec2 p = (gl_FragCoord.xy / uRes - 0.5) * 2.0;
  float r = length(p);
  // a clean, slightly soft edge about a pixel and a half wide
  float alpha = 1.0 - smoothstep(1.0 - 3.0 / uRes.x, 1.0, r);

  // the sphere: height of the surface here, for the lens effect and the light
  float z = sqrt(max(0.0, 1.0 - r * r));
  vec2 s = p * (1.0 - 0.18 * z);
  float rs = length(s);
  vec2 dir = s / max(rs, 0.0001);

  // The liquid's unevenness, read from the direction (not the angle) so it
  // is seamless all the way round. It shifts as the liquid turns.
  float n1 = fbm3(vec3(dir * 1.3, rs * 1.6 - uTime * 0.05 - uSpin * 0.06) + uSeed);

  // Ripples: soft rings travelling outward from around the button. Each is
  // a light crest with a slightly darker crease either side, like a fold in
  // liquid. Their radius wobbles a little so they are never perfect circles.
  float rw = rs + (n1 - 0.5) * 0.09;
  float ring = 0.0;
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    float d = (rw - uRip[i].x) / uRip[i].z;
    float d2 = d * d;
    ring += uRip[i].y * (1.0 - 1.2 * d2) * exp(-d2);
  }

  // Winding: the middle is turned further than the rim, so the colours
  // sweep into spiral bands. The whole liquid also turns by uSpin, and the
  // unevenness pushes it around a little more while the voice is up.
  float wind = uTwist * pow(1.0 - min(rs, 1.0), 1.15);
  float th = atan(s.y, s.x) + uSpin + wind + (n1 - 0.5) * (0.3 + 0.85 * uLevel);
  // the rings push the liquid outward as they pass
  float rr = rs - 0.08 * ring;
  vec2 q = rr * vec2(cos(th), sin(th));

  // The calm picture, seen through the motion: one soft sweep of colour
  // across the orb, from deep on one side to cream on the other (its
  // direction differs per palette), with gentle clouding on top. The sweep
  // guarantees every orb shows the whole range; when the liquid winds, the
  // sweep itself becomes the spiral bands.
  float ga = uSeed * 2.3 + 0.8;
  vec2 gdir = vec2(cos(ga), sin(ga));
  vec2 w = q * 1.25 + vec2(uSeed * 1.3, uSeed * 0.7) + vec2(uTime * 0.02, -uTime * 0.014);
  float c1 = fbm3(vec3(w, uTime * 0.025));
  float cloud = fbm3(vec3(w * 1.1 + 0.35 * vec2(c1, 1.0 - c1), uTime * 0.02 + 3.0));
  float t = 0.5 + 0.34 * dot(q, gdir) + 0.75 * (cloud - 0.47);
#ifdef DEBUG_RAW
  gl_FragColor = vec4(vec3(t), 1.0);
  return;
#endif
  // spread the field's usual range over the whole ramp (measured: see the
  // note by TONE_WINDOW below)
  t = smoothstep(uWin.x, uWin.y, t);

  // Voice: the tones gather towards the light end (the dark ones lift a
  // lot, the brightest ease down a little), so the folds and rings carry
  // the picture while someone speaks. Then the rings shine on top.
  float voiced = clamp(1.3 * uEnergy + 0.5 * uLevel, 0.0, 1.0);
  t = mix(t, 0.82 + (t - 0.82) * 0.6, voiced);
  t += 0.32 * ring * (1.0 - 0.6 * t);
  t = clamp(t, 0.0, 1.0);

  vec3 col = ramp(t);

#ifdef HAS_DERIV
  // Relief: the colour field is treated as the height of the liquid's
  // surface, lit from the top left, so folds and rings look raised. Gentle
  // at rest, clearer while the voice is up.
  vec2 grad = vec2(dFdx(t), dFdy(t)) * (uRes.x * 0.5);
  float relief = 0.03 + 0.11 * uEnergy + 0.08 * uLevel;
  float shade = dot(grad, vec2(-0.55, 0.62)) * relief;
  col *= 1.0 + clamp(shade, -0.28, 0.24);
#endif

  // the sphere's light, from the top left
  vec3 nrm = vec3(p, z);
  vec3 L = normalize(vec3(-0.5, 0.6, 0.72));
  float diff = max(0.0, dot(nrm, L));
  col *= 0.86 + 0.2 * diff;
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  col += vec3(1.0) * pow(max(0.0, dot(nrm, H)), 26.0) * 0.12;
  // a little darker towards the edge, with light bounced onto the lower rim
  col *= mix(1.0, 0.88, smoothstep(0.75, 1.0, r));
  col += uS5 * 0.1 * smoothstep(0.84, 1.0, r) * max(0.0, 0.25 - nrm.y * 0.6);

  // film grain, fixed in place
  col += (grain(gl_FragCoord.xy * 0.731) - 0.5) * 0.06;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0) * alpha, alpha);
}
`;

type Rgb = [number, number, number];

const rgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
];
const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// Six colour stops from a palette: deep tones at one end, warm cream at the
// other, with the middle lifted towards the pale colour so the orb reads as
// soft and luminous rather than saturated.
function colourStops(palette: OrbPalette): Rgb[] {
  const p = ORB_PALETTES[palette];
  const base = rgb(p.base);
  const [light, deep, pale, , dark] = p.blobs.map(rgb) as [Rgb, Rgb, Rgb, Rgb, Rgb];
  // The upper stops lighten the base colour itself (with only a touch of
  // the "light" colour), so they keep the base's hue instead of drifting
  // towards yellow or green.
  return [
    mixRgb(mixRgb(deep, dark, 0.25), pale, 0.08),
    mixRgb(mixRgb(deep, base, 0.35), pale, 0.06),
    mixRgb(base, pale, 0.08),
    mixRgb(base, pale, 0.35),
    mixRgb(mixRgb(base, pale, 0.6), light, 0.25),
    mixRgb(mixRgb(base, pale, 0.78), light, 0.15),
  ];
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("orb shader:", gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

// ---------------------------------------------------------------- motion

type Ripple = { age: number; amp: number };

export type OrbSim = {
  time: number;     // slow clock for the calm drift
  fast: number;     // the level, following each syllable
  slow: number;     // the level, averaged over about a second
  onset: number;    // the level, lightly smoothed, to spot each new syllable
  twist: number;    // how far the middle is wound, radians
  twistV: number;
  spin: number;     // how far the liquid has turned, radians
  spinV: number;
  ripples: Ripple[];
  sinceRipple: number;
};

export function newOrbSim(seed = 0): OrbSim {
  return {
    time: seed * 3.1,
    fast: 0,
    slow: 0,
    onset: 0,
    twist: 0,
    twistV: 0,
    spin: (seed * 0.37) % (2 * Math.PI),
    spinV: 0,
    ripples: [],
    sinceRipple: 1,
  };
}

const TWO_PI = Math.PI * 2;
// how the winding answers the voice: a soft spring, slightly under-damped,
// so the liquid sloshes a little and settles instead of snapping
const TWIST_HZ = 1.8;
const TWIST_DAMPING = 0.55;

// Advance the orb by `dt` seconds towards a voice level of `target` (0..1).
export function stepOrbSim(s: OrbSim, dt: number, target: number) {
  const steps = Math.max(1, Math.ceil(dt * 240));
  const h = dt / steps;
  const k = (TWO_PI * TWIST_HZ) ** 2;
  const c = 2 * TWIST_DAMPING * TWO_PI * TWIST_HZ;
  const follow = (value: number, to: number, up: number, down: number) =>
    value + (to - value) * (1 - Math.exp(-h / (to > value ? up : down)));

  for (let n = 0; n < steps; n++) {
    s.fast = follow(s.fast, target, 0.05, 0.18);
    s.slow = follow(s.slow, target, 0.35, 1.0);
    s.onset = follow(s.onset, s.fast, 0.15, 0.15);

    // A new syllable sends a ring out.
    s.sinceRipple += h;
    if (s.fast - s.onset > 0.07 && s.fast > 0.2 && s.sinceRipple > 0.22) {
      s.ripples.push({ age: 0, amp: Math.min(1, 0.35 + 0.8 * s.fast) });
      if (s.ripples.length > MAX_RIPPLES) s.ripples.shift();
      s.sinceRipple = 0;
    }
    for (const r of s.ripples) r.age += h;

    // Winding builds with the voice and springs back when it stops.
    const goal = 3.4 * s.slow + 1.4 * s.fast;
    s.twistV += (k * (goal - s.twist) - c * s.twistV) * h;
    s.twist += s.twistV * h;

    // The liquid turns while there is voice, and coasts to a stop after.
    s.spinV = follow(s.spinV, 0.9 * s.slow + 0.5 * s.fast, 0.4, 1.1);
    s.spin = (s.spin + s.spinV * h) % TWO_PI;

    s.time += h;
  }
  s.ripples = s.ripples.filter((r) => r.age < 1.6);
}

// One ring's radius, strength and width at its age. Rings start just
// outside the play button (which covers about the middle quarter of the
// orb's radius), so every ring is seen from its first moment.
function rippleShape(r: Ripple): [number, number, number] {
  const a = r.age;
  return [
    0.28 + 0.85 * a - 0.15 * a * a,
    r.amp * (1 - Math.exp(-a / 0.05)) * Math.exp(-a / 0.7),
    0.11 + 0.09 * a,
  ];
}

// True once the voice has gone and the liquid has fully settled.
export const orbAtRest = (s: OrbSim) =>
  s.fast < 0.002 &&
  s.slow < 0.002 &&
  Math.abs(s.twist) < 0.003 &&
  Math.abs(s.twistV) < 0.01 &&
  s.spinV < 0.002 &&
  s.ripples.length === 0;

// ---------------------------------------------------------------- drawing

export type OrbGl = {
  draw: (sim: OrbSim) => void;
  dispose: () => void;
};

// TONE_WINDOW: the noise field's values are bunched in the middle, so only
// this part of its range is spread over the colour ramp. Measured from the
// raw field (the `debugRaw` option draws it in grey) over all the hero's
// palettes, and chosen so the resting orb's spread of brightness matches
// the reference recording's.
const TONE_WINDOW: [number, number] = [0.03, 0.97];

export function createOrbGl(
  canvas: HTMLCanvasElement,
  palette: OrbPalette,
  options: { preserveDrawingBuffer?: boolean; debugRaw?: boolean; toneWindow?: [number, number] } = {}
): OrbGl | null {
  const toneWindow = options.toneWindow ?? TONE_WINDOW;
  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: true,
    antialias: false,
    preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
  });
  if (!gl) return null;
  // Screen-space derivatives give the folds their light and shadow. Almost
  // every browser has them; without them the orb is simply drawn flat.
  const deriv = Boolean(gl.getExtension("OES_standard_derivatives"));
  const fragSrc =
    (deriv ? "#extension GL_OES_standard_derivatives : enable\n#define HAS_DERIV 1\n" : "") +
    (options.debugRaw ? "#define DEBUG_RAW 1\n" : "") +
    FRAG;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
  const program = vs && fs ? gl.createProgram() : null;
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // one big triangle covering the canvas
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(program, name);
  colourStops(palette).forEach((stop, i) => gl.uniform3fv(u(`uS${i}`), stop));
  gl.uniform1f(u("uSeed"), ORB_PALETTES[palette].seed * 1.37);
  gl.uniform2f(u("uWin"), toneWindow[0], toneWindow[1]);
  const uRes = u("uRes"), uTime = u("uTime"), uTwist = u("uTwist"), uSpin = u("uSpin");
  const uLevel = u("uLevel"), uEnergy = u("uEnergy"), uRip = u("uRip");
  const rip = new Float32Array(MAX_RIPPLES * 4);

  return {
    draw(sim) {
      rip.fill(0);
      for (let i = 0; i < MAX_RIPPLES; i++) {
        const r = sim.ripples[i];
        const [radius, strength, width] = r ? rippleShape(r) : [0, 0, 1];
        rip[i * 4] = radius;
        rip[i * 4 + 1] = strength;
        rip[i * 4 + 2] = width;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, sim.time);
      gl.uniform1f(uTwist, sim.twist);
      gl.uniform1f(uSpin, sim.spin);
      gl.uniform1f(uLevel, sim.fast);
      gl.uniform1f(uEnergy, sim.slow);
      gl.uniform4fv(uRip, rip);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

export const orbSeed = (palette: OrbPalette) => ORB_PALETTES[palette].seed;
