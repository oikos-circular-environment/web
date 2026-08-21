const waveVertexShader = /* glsl */ `
precision highp float;

attribute vec2 position;
attribute vec2 uv;
attribute vec2 iOffset;
attribute vec2 iScale;
attribute float iOpacity;

varying vec2 vUv;
varying float vOpacity;

void main() {
  vUv = uv;
  vOpacity = iOpacity;
  gl_Position = vec4(iOffset + position * iScale, 0.0, 1.0);
}
`;

const waveFragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying float vOpacity;

uniform float uRings;

const float PI = 3.141592653589793;
const float EDGE = 0.006737947;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = dot(p, p);
  if (r > 1.0) discard;

  float brush = (exp(-r * 5.0) - EDGE) / (1.0 - EDGE);
  brush *= 0.55 + 0.45 * cos(sqrt(r) * PI * 2.0 * uRings);

  gl_FragColor = vec4(vec3(brush * vOpacity * vOpacity), 1.0);
}
`;

const screenVertexShader = /* glsl */ `
precision highp float;

attribute vec2 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const compositeFragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform sampler2D uPristine;
uniform sampler2D uDegraded;
uniform sampler2D uField;

uniform vec2 uResolution;
uniform vec2 uTextureSize;
uniform vec2 uTexel;

uniform float uStrength;
uniform float uSwirl;
uniform float uDispersion;
uniform float uGlint;
uniform float uFieldClamp;
uniform float uRevealGain;
uniform vec2 uRevealEdge;
uniform float uRevealMax;
uniform vec3 uTint;
uniform float uTintAmount;
uniform float uGrayscale;
uniform float uEncodeSrgb;

vec2 coverUv(vec2 uv, vec2 resolution, vec2 texSize) {
  vec2 safeTexSize = max(texSize, vec2(1.0));
  float screenAspect = resolution.x / resolution.y;
  float imageAspect = safeTexSize.x / safeTexSize.y;
  vec2 scale = screenAspect > imageAspect
    ? vec2(1.0, imageAspect / screenAspect)
    : vec2(screenAspect / imageAspect, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

vec3 linearToSrgb(vec3 c) {
  vec3 clamped = clamp(c, 0.0, 1.0);
  return mix(
    clamped * 12.92,
    1.055 * pow(clamped, vec3(1.0 / 2.4)) - 0.055,
    step(vec3(0.0031308), clamped)
  );
}

void main() {
  float amount = min(texture2D(uField, vUv).r, uFieldClamp);

  float dx = texture2D(uField, vUv + vec2(uTexel.x, 0.0)).r
           - texture2D(uField, vUv - vec2(uTexel.x, 0.0)).r;
  float dy = texture2D(uField, vUv + vec2(0.0, uTexel.y)).r
           - texture2D(uField, vUv - vec2(0.0, uTexel.y)).r;
  vec2 gradient = vec2(dx, dy);

  vec2 displacement = gradient * uStrength;
  float angle = uSwirl * amount;
  float cs = cos(angle);
  float sn = sin(angle);
  vec2 offset = vec2(
    displacement.x * cs - displacement.y * sn,
    displacement.x * sn + displacement.y * cs
  );

  vec2 uv = coverUv(vUv, uResolution, uTextureSize);
  vec2 uvOff = uv + offset;

  float reveal = smoothstep(uRevealEdge.x, uRevealEdge.y, amount * uRevealGain);
  reveal = min(reveal, uRevealMax);

  vec3 pristine = texture2D(uPristine, uvOff).rgb;

  vec2 push = offset * uDispersion;
  vec3 degraded = vec3(
    texture2D(uDegraded, uvOff + push).r,
    texture2D(uDegraded, uvOff).g,
    texture2D(uDegraded, uvOff - push).b
  );

  vec3 color = mix(pristine, degraded, reveal);

  color = mix(color, color * uTint, uTintAmount * reveal);

  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(color, vec3(luma), uGrayscale * reveal);

  float glintStrength = pow(clamp(length(gradient) * 40.0, 0.0, 1.0), 2.0);
  color += glintStrength * uGlint * amount;

  vec3 outColor = mix(color, linearToSrgb(color), uEncodeSrgb);
  gl_FragColor = vec4(outColor, 1.0);
}
`;

export {
  compositeFragmentShader,
  screenVertexShader,
  waveFragmentShader,
  waveVertexShader,
};
