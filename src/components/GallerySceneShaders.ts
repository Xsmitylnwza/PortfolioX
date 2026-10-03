const planeVertex = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uBendH;
uniform float uBendV;
uniform float uTime;
uniform float uPhase;
varying vec2 vUv;
varying float vDepth;
void main() {
    vUv = uv;
    vec3 pos = position;
    float archX = position.x * position.x;
    float archY = position.y * position.y;
    pos.z -= archX * uBendH + archY * uBendV;
    pos.z += sin((uv.y + uPhase) * 5.2 + uTime * 0.72) * 0.018;
    vec4 view = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -view.z;
    gl_Position = projectionMatrix * view;
}`;

const planeFragment = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform float uLoaded;
uniform float uImageAspect;
uniform float uPlaneAspect;
uniform float uHover;
uniform float uRowOpacity;
uniform float uSceneOpacity;
uniform float uCardReveal;
varying vec2 vUv;
varying float vDepth;
void main() {
    vec2 uv = vUv;
    if (!gl_FrontFacing) uv.x = 1.0 - uv.x;
    vec3 image = texture2D(tMap, uv).rgb;
    vec3 placeholder = mix(vec3(.055,.018,.022), vec3(.34,.055,.06), vUv.y);
    vec3 color = mix(placeholder, image, uLoaded);
    float lum = dot(color, vec3(.299,.587,.114));
    color = mix(vec3(lum), color, .88 + uHover * .12);
    gl_FragColor = vec4(color, uRowOpacity * uSceneOpacity * uCardReveal);
}`;

const sculptureVertex = /* glsl */ `
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vLocal;
void main(){
  // Rigid folds: the surface never deforms, so reflections stay attached to it.
  vec4 view = modelViewMatrix * vec4(position, 1.0);
  vPosition = view.xyz;
  vLocal = position;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * view;
}`;

const sculptureFragment = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vLocal;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform float uOpacity;
uniform float uLayer;
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float softbox(vec3 ray, vec3 center, vec3 right, vec2 halfSize, float softness) {
  vec3 direction = normalize(center);
  vec3 horizontal = normalize(right);
  vec3 vertical = normalize(cross(direction, horizontal));
  float facing = dot(ray, direction);
  vec2 uv = vec2(dot(ray, horizontal), dot(ray, vertical)) / max(facing, 0.001);
  vec2 edge = abs(uv) - halfSize;
  vec2 coverage = 1.0 - smoothstep(vec2(-softness), vec2(softness), edge);
  return coverage.x * coverage.y * smoothstep(0.0, 0.3, facing);
}
vec3 studioReflection(vec3 ray) {
  // High-key product studio: broad, very soft boxes on a bright room, like
  // photographed bullion. Satin roughness, so no hard strip lights to swim.
  float blur = 0.3;
  float key = softbox(ray, vec3(-0.45, 0.55, 0.70), vec3(0.84, 0.0, 0.54), vec2(0.9, 0.9), blur);
  float fill = softbox(ray, vec3(0.75, 0.20, 0.55), vec3(0.59, 0.0, -0.80), vec2(0.7, 1.0), blur);
  float shade = softbox(ray, vec3(0.10, -0.55, 0.80), vec3(1.0, 0.0, -0.12), vec2(0.8, 0.5), blur);
  vec3 room = vec3(mix(0.05, 0.34, smoothstep(-0.8, 0.9, ray.y)));
  return (room + vec3(key * 3.0 + fill * 1.1)) * (1.0 - shade * 0.7);
}
void main(){
  // Fine cast-silver texture, fixed in object space so it turns with the metal.
  vec3 p = vLocal * 58.0 + uLayer * 3.1;
  vec3 bump = vec3(noise(p), noise(p + 19.7), noise(p + 41.3)) - 0.5;
  bump += (vec3(noise(p * 3.1), noise(p * 3.1 + 7.3), noise(p * 3.1 + 13.9)) - 0.5) * 0.45;
  vec3 n = normalize(vNormal + normalMatrix * bump * 0.09);
  if (!gl_FrontFacing) n = -n;
  vec3 viewDir = normalize(-vPosition);
  vec3 reflectedView = reflect(-viewDir, n);
  // normalMatrix is in view space. Transpose the view rotation to sample the room in world space.
  vec3 reflectedWorld = normalize(vec3(
    dot(viewMatrix[0].xyz, reflectedView),
    dot(viewMatrix[1].xyz, reflectedView),
    dot(viewMatrix[2].xyz, reflectedView)
  ));
  vec3 normalWorld = normalize(vec3(dot(viewMatrix[0].xyz, n), dot(viewMatrix[1].xyz, n), dot(viewMatrix[2].xyz, n)));
  float ndotv = clamp(dot(n, viewDir), 0.0, 1.0);
  // Satin silver: soft environment reflection plus a broad, geometry-anchored
  // sheen so each facet keeps a stable value as the bloom turns.
  vec3 silver = vec3(0.90, 0.905, 0.92);
  vec3 fresnel = silver + (vec3(1.0) - silver) * pow(1.0 - ndotv, 5.0);
  float facetLight = 0.55 + 0.45 * clamp(dot(normalWorld, normalize(vec3(-0.35, 0.75, 0.55))), 0.0, 1.0);
  vec3 radiance = studioReflection(reflectedWorld) * fresnel * mix(1.0, facetLight, 0.55);
  // Recessed cast pits catch less light.
  radiance *= 0.94 + 0.06 * smoothstep(-0.3, 0.3, bump.x + bump.y);
  vec3 mapped = radiance * 1.15 / (vec3(1.0) + radiance * 1.15);
  gl_FragColor = vec4(pow(mapped, vec3(1.0 / 2.2)), uOpacity);
}`;

const gridVertex = /* glsl */ `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uScrollWave;
varying vec3 vGridPosition;
varying float vViewDepth;
void main(){
 vec3 pos=position;
 float wave=sin(pos.y*0.42+uTime*0.8)*uScrollWave;
 pos.z+=wave*0.16;
 pos.x*=1.0+wave*0.003;
 vec4 view=modelViewMatrix*vec4(pos,1.);
 vGridPosition=pos;
 vViewDepth=-view.z;
 gl_Position=projectionMatrix*view;
}`;

const gridFragment = /* glsl */ `
precision highp float;
uniform float uOpacity;
varying vec3 vGridPosition;
varying float vViewDepth;
void main(){
  // Radial falloff follows the cylindrical cage so sides feel rounder than flat x-plane shading.
  float radius = length(vGridPosition.xz);
  float side = smoothstep(9.2, 15.0, radius);
  float distanceShade = smoothstep(4.0, 26.0, vViewDepth);
  float heightShade = smoothstep(0.3, 1.0, abs(vGridPosition.y) / 10.0);
  float centerLight = exp(-pow((vGridPosition.x / 14.2 + 0.1) * 2.35, 2.0));
  float shade = 0.78 + side * 0.18 + distanceShade * 0.08 + heightShade * 0.05 - centerLight * 0.08;
  gl_FragColor = vec4(0.0, 0.0, 0.0, uOpacity * clamp(shade, 0.62, 1.0));
}
`;

export { planeVertex, planeFragment, sculptureVertex, sculptureFragment, gridVertex, gridFragment };
