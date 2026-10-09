// Ray-marched black hole. Units: Schwarzschild radius = 1.
//
// Each pixel fires a light ray from the camera and steps it forward, bending it
// toward the hole with the classic photon-orbit approximation
//   a = -1.5 * h² * r̂ / r⁴   (h = |pos × vel|, conserved angular momentum)
// which reproduces the Einstein ring and the "Interstellar" look where the far
// side of the accretion disk appears bent over the top of the shadow.
// Rays that fall inside r < 1 are captured (black); rays that cross the disk
// plane pick up its glow; escaped rays sample a procedural starfield.

export const VERTEX = /* glsl */ `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uZoom;     // apparent size of the hole (1 = default framing)
uniform vec2 uCenter;    // screen offset of the hole, in units of screen height
uniform vec2 uLook;      // camera nudge from the pointer, -1..1
uniform vec3 uHot;
uniform vec3 uMid;
uniform vec3 uCool;
uniform vec3 uBg;
uniform vec3 uStar;
uniform float uStars;    // 0..1 starfield strength
uniform float uOpaque;   // 1: paint background, 0: transparent around the hole

out vec4 outColor;

const int STEPS = 180;
const float DISK_IN = 2.6;
const float DISK_OUT = 9.5;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + 11.7;
    a *= 0.5;
  }
  return v;
}

vec3 sky(vec3 dir) {
  // direction -> equirectangular coordinates
  vec2 uv = vec2(atan(dir.z, dir.x), asin(clamp(dir.y, -1.0, 1.0)));
  vec3 col = vec3(0.0);
  for (int layer = 0; layer < 3; layer++) {
    float scale = 30.0 + float(layer) * 34.0;
    vec2 g = uv * scale + float(layer) * 17.3;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float h = hash(id);
    if (h > 0.88) {
      vec2 o = vec2(hash(id + 1.3), hash(id + 7.1)) - 0.5;
      float d = length(f - o * 0.6);
      float tw = 0.65 + 0.35 * sin(uTime * (0.8 + h * 2.5) + h * 40.0);
      col += uStar * smoothstep(0.09, 0.0, d) * tw * (h - 0.88) * 9.0;
    }
  }
  float n = fbm(uv * 2.2 + vec2(uTime * 0.004, 0.0));
  col += mix(uCool, uMid, n) * pow(n, 3.2) * 0.22;
  return col;
}

// glow of the disk where the ray crosses the plane y = 0
vec4 diskAt(vec3 hit, vec3 rayDir) {
  float r = length(hit.xz);
  if (r < DISK_IN || r > DISK_OUT) return vec4(0.0);
  float t = (r - DISK_IN) / (DISK_OUT - DISK_IN);
  float phi = atan(hit.z, hit.x);
  // Keplerian: inner parts orbit faster
  float omega = 2.2 / pow(r, 1.5);
  float swirl = fbm(vec2(phi * 2.0 - uTime * omega * 3.0, r * 1.4));
  float streaks = fbm(vec2(phi * 7.0 - uTime * omega * 3.0, r * 6.0));
  // relativistic beaming: material moving toward the camera is brighter
  vec3 orbit = normalize(vec3(-hit.z, 0.0, hit.x));
  float doppler = 1.0 + 0.75 * dot(orbit, -rayDir);
  float edge = smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.65, 1.0, t));
  float intensity = edge * (0.25 + 0.75 * swirl + 0.35 * streaks) * pow(1.0 - t, 1.6) * doppler * doppler;
  vec3 c = mix(uHot, uMid, smoothstep(0.0, 0.3, t));
  c = mix(c, uCool, smoothstep(0.3, 1.0, t));
  float alpha = clamp(intensity * 1.2, 0.0, 1.0);
  return vec4(c * intensity * 2.2, alpha);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y - uCenter;

  // camera slightly above the disk plane, orbiting a little with the pointer
  float elev = 0.16 + uLook.y * 0.12;
  float yaw = uLook.x * 0.35 + uTime * 0.01;
  float dist = 26.0;
  vec3 ro = dist * vec3(sin(yaw) * cos(elev), sin(elev), -cos(yaw) * cos(elev));
  vec3 fw = normalize(-ro);
  vec3 rt = normalize(cross(vec3(0, 1, 0), fw));
  vec3 up = cross(fw, rt);
  float fov = 0.62 / max(uZoom, 0.001);
  vec3 rd = normalize(fw + (p.x * rt + p.y * up) * fov);

  vec3 pos = ro;
  vec3 vel = rd;
  vec3 h = cross(pos, vel);
  float h2 = dot(h, h);

  vec3 col = vec3(0.0);
  float alpha = 0.0;
  bool captured = false;

  for (int i = 0; i < STEPS; i++) {
    float r2 = dot(pos, pos);
    if (r2 < 1.0) { captured = true; break; }
    if (r2 > dist * dist * 1.6 && dot(pos, vel) > 0.0) break;
    float r = sqrt(r2);
    // small steps near the disk so grazing rays don't skip its edge
    float dt = r < 12.0 ? clamp(0.06 * r, 0.03, 0.45) : 1.2;
    vec3 acc = -1.5 * h2 * pos / (r2 * r2 * r);
    vec3 next = pos + vel * dt;
    vel += acc * dt;
    if (pos.y * next.y < 0.0) {
      vec3 hit = mix(pos, next, pos.y / (pos.y - next.y));
      vec4 d = diskAt(hit, normalize(vel));
      col += (1.0 - alpha) * d.rgb;
      alpha += (1.0 - alpha) * d.a;
      if (alpha > 0.98) break;
    }
    pos = next;
  }

  vec3 behind = vec3(0.0);
  if (!captured) behind = uOpaque * uBg + sky(normalize(vel)) * uStars;
  // soft tone map on the glow only, so the hot inner disk doesn't clip but
  // the theme background keeps its exact colour
  col = col / (1.0 + col * 0.35) + (1.0 - alpha) * behind;
  // the shadow itself: pure black, opaque even in transparent mode
  float outA = uOpaque > 0.5 ? 1.0 : clamp(max(alpha, captured ? 1.0 : 0.0), 0.0, 1.0);
  outColor = vec4(col, outA);
}
`;
