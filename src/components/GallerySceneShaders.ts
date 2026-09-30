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
uniform float uTime;
uniform float uLayer;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vFacet;
void main(){
  vec3 pos = position;
  float angle = atan(pos.y, pos.x);
  float ring = length(pos.xy) + 1e-5;

  // Hard faceting: quantize ring angle so the torus reads as broken metal plates.
  float facets = mix(7.0, 13.0, fract(uLayer * 0.37));
  float stepped = floor(angle / 6.2831853 * facets + 0.5) / facets * 6.2831853;
  float mixFacet = 0.62 + uLayer * 0.05;
  float facetedAngle = mix(angle, stepped, mixFacet);
  float c = cos(facetedAngle);
  float s = sin(facetedAngle);

  // Squircle + jagged crush so rings feel angular / half-collapsed.
  float squircle = pow(pow(abs(c), 6.0) + pow(abs(s), 6.0), -0.1667);
  float crush = 0.82 + 0.18 * sin(facetedAngle * facets * 0.5 + uLayer * 1.7);
  float dent = 0.07 * sin(facetedAngle * 5.0 + uLayer * 2.1 + uTime * 0.15)
             + 0.04 * sin(pos.z * 18.0 + uLayer);
  float radius = ring * mix(1.0, squircle, 0.55) * crush * (1.0 + dent);
  pos.xy = vec2(c, s) * radius;

  // Axial plate offsets: overlapping broken layers.
  pos.z += 0.035 * sin(facetedAngle * 3.0 + uLayer) + uLayer * 0.012;
  pos *= 1.0 + 0.02 * sin(facetedAngle * 2.0 - uTime * 0.1 + uLayer);

  // Faceted normals: less smooth shading, more hard metal panels.
  vec3 n = normalize(normal);
  n.xy = mix(n.xy, vec2(c, s), 0.55);
  n = normalize(n + 0.18 * vec3(sin(facetedAngle * facets), cos(facetedAngle * facets), 0.2));

  vec4 view = modelViewMatrix * vec4(pos, 1.0);
  vPosition = view.xyz;
  vNormal = normalize(normalMatrix * n);
  vFacet = facetedAngle * facets;
  gl_Position = projectionMatrix * view;
}`;

const sculptureFragment = /* glsl */ `
precision highp float;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vFacet;
uniform float uTime;
uniform float uOpacity;
uniform float uLayer;
void main(){
  vec3 n = normalize(vNormal);
  vec3 viewDir = normalize(-vPosition);

  // Multi-light chrome / brushed silver steel.
  vec3 key = normalize(vec3(-0.55, 0.85, 0.95));
  vec3 fill = normalize(vec3(0.75, 0.15, 0.55));
  vec3 rimL = normalize(vec3(-0.2, -0.35, 1.0));

  float ndotv = max(dot(n, viewDir), 0.0);
  float fresnel = pow(1.0 - ndotv, 3.2);

  float diffKey = max(dot(n, key), 0.0);
  float diffFill = max(dot(n, fill), 0.0) * 0.35;
  float diff = 0.12 + 0.72 * diffKey + diffFill;

  vec3 halfKey = normalize(key + viewDir);
  float specKey = pow(max(dot(n, halfKey), 0.0), 96.0);
  float specSoft = pow(max(dot(n, halfKey), 0.0), 18.0);
  float rim = pow(max(dot(n, rimL), 0.0), 2.0) * fresnel;

  // Micro plate seams + brushed grain on silver metal.
  float seam = smoothstep(0.42, 0.5, abs(fract(vFacet) - 0.5));
  float brush = 0.5 + 0.5 * sin((vPosition.x * 38.0 + vPosition.y * 11.0) + uTime * 0.4);
  float flake = 0.5 + 0.5 * sin(vFacet * 2.7 + uLayer * 4.0);

  // Bright pure silver / polished chrome, little to no graphite.
  vec3 steelDark = vec3(0.34, 0.36, 0.39);
  vec3 steelMid = vec3(0.78, 0.80, 0.84);
  vec3 chrome = vec3(0.96, 0.97, 0.99);
  vec3 highlight = vec3(1.0, 1.0, 1.0);

  vec3 color = mix(steelDark, steelMid, diff);
  color = mix(color, chrome, fresnel * 0.88 + specSoft * 0.48);
  color += highlight * (specKey * 1.15 + rim * 0.55);
  color *= 0.94 + brush * 0.08;
  color *= 0.92 + seam * 0.14;
  color += chrome * flake * 0.06;

  // Force cool bright silver (desaturate warmth).
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(luma), color, 0.22);
  color = mix(color, chrome, 0.28);
  color = min(color * 1.12, vec3(1.0));

  gl_FragColor = vec4(color, uOpacity);
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
