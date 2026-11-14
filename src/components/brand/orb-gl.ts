// The drawing and the motion of the hero's voice orbs, kept free of React
// so the same code can be run frame by frame in a test.
//
//   createOrbGl(canvas, palette)  draws one orb with WebGL
//   newOrbSim / stepOrbSim        how the orb responds to a voice level
//
// What the orb does, and why (measured from a reference recording of a
// well-made voice orb, frame by frame, against its own audio track):
//
//   At rest      a calm, softly clouded gradient on a lit sphere. It drifts
//                so slowly that two frames seconds apart look the same.
//   Speaking     nothing travels round the orb. Instead soft spiral bands of
//                lighter colour swell up around the centre, as if the liquid
//                were being stirred from the middle, and the whole surface
//                is pushed a little round the circle and in and out. How
//                strong the bands are follows the loudness of the voice,
//                about a tenth of a second behind it: they surge on a loud
//                syllable and melt away in the gap before the next word.
//                The orb also gets a little brighter while there is voice.
//   Stopping     the bands fade and the pushing relaxes, which leaves the
//                same calm gradient as before. Nothing resets or jumps.

import { ORB_PALETTES, type OrbPalette } from "@/components/brand/orb";

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;    // slow clock: the calm drift of the gradient
uniform float uPhase;   // how far the swirl has turned, in turns; moves only with the voice
uniform float uLevel;   // the voice right now, 0..1 (follows each syllable)
uniform float uEnergy;  // the voice averaged over about a second
uniform float uSeed;
uniform vec3 uBase, uLight, uDeep, uPale, uVivid, uDark;

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

void main() {
  vec2 p = (gl_FragCoord.xy / uRes - 0.5) * 2.0;
  float r = length(p);
  float alpha = 1.0 - smoothstep(0.985, 1.0, r);
  if (alpha <= 0.0) { gl_FragColor = vec4(0.0); return; }

  // the sphere: height of the surface here, for the lens effect and the light
  float z = sqrt(max(0.0, 1.0 - r * r));
  vec2 s = p * (1.0 - 0.22 * z);
  float rs = length(s);
  vec2 dir = s / max(rs, 0.0001);

  // 1. The liquid's unevenness: how far each part is pushed round the
  // circle and in or out. Read from the direction, not the angle, so it is
  // seamless all the way round. The first one flows outward with the voice.
  float n1 = fbm3(vec3(dir * 1.25, rs * 1.7 - uPhase * 0.6) + uSeed);
  float n2 = fbm3(vec3(dir * 1.9 + 4.7, rs * 2.3 + uTime * 0.2) + uSeed * 1.7);
  float push = (n1 - 0.5) * mix(0.25, 0.8, uLevel);
  float bulge = (n2 - 0.5) * (0.14 + 0.1 * uLevel);
  float th = atan(s.y, s.x) + push;
  float rr = rs + bulge;
  vec2 q = rr * vec2(cos(th), sin(th));

  // 2. The calm picture: broad soft clouds of colour, drifting very slowly.
  vec2 w = q * 1.05 + vec2(uSeed * 1.3, uSeed * 0.7) + vec2(uTime * 0.02, -uTime * 0.014);
  float c1 = fbm3(vec3(w, uTime * 0.025));
  float t = fbm3(vec3(w * 1.2 + 0.8 * vec2(c1, 1.0 - c1), uTime * 0.02 + 3.0));
  t = smoothstep(0.2, 0.75, t);

  // Mostly the middle of the palette, in wide bands that melt into each
  // other. The deepest tone is softened and the darkest only tints the low end.
  vec3 low = mix(uDeep, uBase, 0.55);
  vec3 col = mix(low, uBase, smoothstep(0.0, 0.32, t));
  col = mix(col, uVivid, smoothstep(0.2, 0.6, t));
  col = mix(col, uLight, smoothstep(0.45, 0.95, t));
  col = mix(col, uPale, 0.25 * smoothstep(0.8, 1.0, t));
  col = mix(col, uDark, 0.1 * (1.0 - smoothstep(0.0, 0.25, t)));

  // 3. The swirl: soft spiral bands of lighter colour around the centre,
  // laid over the calm picture like light through stirred liquid. A
  // one-armed spiral that turns as the voice speaks, with a looser second
  // one turning the other way. Noise bends the bands, changes how thick
  // they are and lets stretches of them fade out, so they read as liquid
  // and not as a drawn spiral.
  float n3 = fbm3(vec3(dir * 1.6 + 9.1, rs * 2.1 - uPhase * 0.9) + uSeed * 0.6);
  // a slow, smooth bend, so the bands wander instead of wriggling
  float bend = (noise3(vec3(dir * 0.9 + 2.3, rs * 1.3 - uPhase * 0.5) + uSeed) - 0.5) * 5.2;
  float wave = 0.5 + 0.5 * sin(th + rr * 17.0 - uPhase * 6.2832 + bend);
  float wave2 = 0.5 + 0.5 * sin(th * 2.0 - rr * 9.0 + uPhase * 3.77 + n2 * 4.0);
  // broad, soft bands: about half of each ring is lit
  float swirl = 0.78 * pow(wave, mix(1.0, 1.5, n2)) + 0.22 * pow(wave2, 1.5);
  swirl *= mix(0.6, 1.0, smoothstep(0.3, 0.7, n3));
  // calm under the play button, and easing off at the rim
  float where = smoothstep(0.1, 0.34, r) * (1.0 - 0.4 * smoothstep(0.82, 1.0, r));
  // loud syllables stand out; quiet speech only hints at the bands
  float voice = pow(uLevel, 1.2);
  vec3 tint = mix(uLight, uPale, 0.72);
  col = mix(col, tint, 0.88 * voice * where * swirl);
  // deeper colour in the troughs between the bands, for depth
  col = mix(col, mix(uDeep, uBase, 0.3), 0.32 * voice * where * (1.0 - swirl));
  // the whole orb is a little brighter while there is voice
  col = mix(col, uPale, 0.1 * uLevel + 0.1 * uEnergy);

  // light from the top left
  vec3 nrm = vec3(p, z);
  vec3 L = normalize(vec3(-0.5, 0.6, 0.72));
  float diff = max(0.0, dot(nrm, L));
  col *= 0.78 + 0.34 * diff;
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  col += vec3(1.0) * pow(max(0.0, dot(nrm, H)), 24.0) * 0.18;
  // darker towards the edge, with a little light bounced onto the lower rim
  col *= mix(1.0, 0.8, smoothstep(0.72, 1.0, r));
  col += uLight * 0.12 * smoothstep(0.82, 1.0, r) * max(0.0, 0.25 - nrm.y * 0.6);

  // film grain, fixed in place
  col += (grain(gl_FragCoord.xy * 0.731) - 0.5) * 0.07;

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
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("orb shader:", gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

// ---------------------------------------------------------------- motion

export type OrbSim = {
  time: number;   // slow clock for the calm drift
  phase: number;  // how far the swirl has turned, in turns
  fast: number;   // the level, following each syllable
  slow: number;   // the level, averaged over about a second
};

export function newOrbSim(seed = 0): OrbSim {
  return { time: seed * 3.1, phase: (seed * 0.37) % 1, fast: 0, slow: 0 };
}

// Advance the orb by `dt` seconds towards a voice level of `target` (0..1).
export function stepOrbSim(s: OrbSim, dt: number, target: number) {
  const follow = (value: number, to: number, up: number, down: number) =>
    value + (to - value) * (1 - Math.exp(-dt / (to > value ? up : down)));
  // The bands answer the voice about a tenth of a second behind it, and
  // take a little longer to melt away than to rise.
  s.fast = follow(s.fast, target, 0.1, 0.26);
  s.slow = follow(s.slow, target, 0.3, 0.9);
  // The swirl turns only while there is voice.
  s.phase += dt * (0.42 * s.slow + 0.3 * s.fast);
  // The calm drift is very slow and does not care about the voice, so the
  // resting picture is the same before and after someone speaks.
  s.time += dt;
}

// True once the voice has gone and the swirl has fully settled.
export const orbAtRest = (s: OrbSim) => s.fast < 0.002 && s.slow < 0.002;

// ---------------------------------------------------------------- drawing

export type OrbGl = {
  draw: (sim: OrbSim) => void;
  dispose: () => void;
};

export function createOrbGl(
  canvas: HTMLCanvasElement,
  palette: OrbPalette,
  options: { preserveDrawingBuffer?: boolean } = {}
): OrbGl | null {
  const gl = canvas.getContext("webgl", {
    premultipliedAlpha: true,
    antialias: false,
    preserveDrawingBuffer: options.preserveDrawingBuffer ?? false,
  });
  const vs = gl && compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = gl && compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const program = gl && vs && fs ? gl.createProgram() : null;
  if (!gl || !vs || !fs || !program) return null;
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
  const p = ORB_PALETTES[palette];
  const [light, deep, pale, vivid, dark] = p.blobs;
  gl.uniform3fv(u("uBase"), rgb(p.base));
  gl.uniform3fv(u("uLight"), rgb(light));
  gl.uniform3fv(u("uDeep"), rgb(deep));
  gl.uniform3fv(u("uPale"), rgb(pale));
  gl.uniform3fv(u("uVivid"), rgb(vivid));
  gl.uniform3fv(u("uDark"), rgb(dark));
  gl.uniform1f(u("uSeed"), p.seed * 1.37);
  const uRes = u("uRes"), uTime = u("uTime"), uPhase = u("uPhase"), uLevel = u("uLevel"), uEnergy = u("uEnergy");

  return {
    draw(sim) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, sim.time);
      gl.uniform1f(uPhase, sim.phase);
      gl.uniform1f(uLevel, sim.fast);
      gl.uniform1f(uEnergy, sim.slow);
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
