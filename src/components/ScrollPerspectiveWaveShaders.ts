const surfaceVertex = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uScrollVelocity;
uniform float uIntensity;
varying vec2 vUv;
varying float vWave;
varying float vSlope;

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    float waveBase = sin(worldPosition.y * 0.0055 + uTime * 0.8) * uScrollVelocity;
    vec3 newPosition = position;
    newPosition.z += waveBase * 15.0 * 0.5 * uIntensity;

    vUv = uv;
    vWave = waveBase * uIntensity;
    vSlope = cos(worldPosition.y * 0.0055 + uTime * 0.8) * uScrollVelocity * uIntensity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}`;

const surfaceFragment = /* glsl */ `
precision highp float;
uniform vec3 uSurfaceColor;
uniform float uSurfaceOpacity;
varying vec2 vUv;
varying float vWave;
varying float vSlope;

float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
    float grain = (hash(floor(vUv * 900.0)) - 0.5) * 0.012;
    float light = 1.0 + vSlope * 0.025 + vWave * 0.004;
    vec3 color = clamp(uSurfaceColor * light + grain, vec3(0.0), vec3(1.0));
    gl_FragColor = vec4(color, uSurfaceOpacity);
}`;

const mediaFragment = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform float uImageAspect;
uniform float uPlaneAspect;
uniform float uFitMode;
uniform float uRadius;
uniform vec2 uPlaneSize;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    float fitAlpha = 1.0;

    if (uFitMode < 0.5) {
        if (uImageAspect > uPlaneAspect) {
            uv.x = (uv.x - 0.5) * uPlaneAspect / uImageAspect + 0.5;
        } else {
            uv.y = (uv.y - 0.5) * uImageAspect / uPlaneAspect + 0.5;
        }
    } else if (uFitMode < 1.5) {
        if (uImageAspect > uPlaneAspect) {
            float visibleHeight = uPlaneAspect / uImageAspect;
            uv.y = (uv.y - 0.5) / visibleHeight + 0.5;
            fitAlpha = step(0.0, uv.y) * step(uv.y, 1.0);
        } else {
            float visibleWidth = uImageAspect / uPlaneAspect;
            uv.x = (uv.x - 0.5) / visibleWidth + 0.5;
            fitAlpha = step(0.0, uv.x) * step(uv.x, 1.0);
        }
    }

    vec4 media = texture2D(tMap, clamp(uv, 0.0, 1.0));
    float radius = min(uRadius, min(uPlaneSize.x, uPlaneSize.y) * 0.5);
    vec2 halfSize = uPlaneSize * 0.5;
    vec2 point = abs((vUv - 0.5) * uPlaneSize);
    vec2 corner = point - (halfSize - vec2(radius));
    float distanceToEdge = length(max(corner, 0.0))
        + min(max(corner.x, corner.y), 0.0)
        - radius;
    float roundedAlpha = 1.0 - smoothstep(-0.75, 0.75, distanceToEdge);

    gl_FragColor = vec4(media.rgb, media.a * fitAlpha * roundedAlpha);
}`;

/**
 * Reusable scroll-perspective module.
 *
 * Interface:
 * - mark layout anchors with `data-wave-surface`;
 * - mark visible DOM groups with `data-wave-follow`;
 * - mark text/container boxes with `data-wave-capture` to rasterize them into
 *   the same WebGL mesh/vertex wave as media (method 2);
 * - place the wrapper below a `[data-wave-host]` ancestor when its canvas must
 *   escape a contained/painted route layer;
 * - use `surfaceOpacity={0}` for follower/stage motion without a visible paper plane;
 * - tune `intensity` per page when the default wave needs to be calmer or stronger;
 * - enable `syncStage` only when a persistent GalleryScene should share the wave.
 */
export { surfaceVertex, surfaceFragment, mediaFragment };
