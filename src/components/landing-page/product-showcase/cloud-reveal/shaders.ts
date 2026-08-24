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

const cloudFragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform float uProgress;

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.55;
  for (int i = 0; i < 4; i += 1) {
    sum += amp * valueNoise(p);
    p *= 2.05;
    amp *= 0.55;
  }
  return sum;
}

void main() {
  vec2 aspectUv = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) + 0.5;

  vec2 drift = vec2(0.0, -1.0) * uProgress * 0.6;
  vec2 p = aspectUv * 3.1 + drift;

  float density = fbm(p) + fbm(p * 1.7 + 4.2) * 0.5;

  float threshold = mix(0.32, 1.05, uProgress);
  float cloud = smoothstep(threshold, threshold - 0.35, density);

  float edgeFade = smoothstep(0.0, 0.15, aspectUv.y) * smoothstep(1.0, 0.85, aspectUv.y);
  float alpha = cloud * edgeFade * (1.0 - uProgress);

  vec3 cloudColor = vec3(0.98, 0.97, 0.94);
  gl_FragColor = vec4(cloudColor, clamp(alpha, 0.0, 1.0));
}
`;

export { cloudFragmentShader, screenVertexShader };
