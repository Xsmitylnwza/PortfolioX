const vertex = /* glsl */ `
    attribute vec3 position;
    attribute vec2 uv;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragment = /* glsl */ `
    precision highp float;

    uniform sampler2D tMap;
    uniform float uActive;
    uniform float uLoaded;
    uniform float uImageAspect;
    uniform float uPlaneAspect;

    varying vec2 vUv;

    void main() {
        vec2 uv = vUv;

        if (uImageAspect > uPlaneAspect) {
            uv.x = (uv.x - 0.5) * uPlaneAspect / uImageAspect + 0.5;
        } else {
            uv.y = (uv.y - 0.5) * uImageAspect / uPlaneAspect + 0.5;
        }

        vec3 image = texture2D(tMap, uv).rgb;
        vec3 paper = vec3(0.91, 0.88, 0.82);
        vec3 placeholder = mix(vec3(0.055, 0.047, 0.043), vec3(0.36, 0.035, 0.045), vUv.y);
        vec3 source = mix(placeholder, image, uLoaded);
        float luminance = dot(source, vec3(0.299, 0.587, 0.114));
        vec3 muted = mix(vec3(luminance), source, 0.28);
        vec3 color = mix(muted * 0.48, source, uActive);

        float edge = smoothstep(0.018, 0.035, vUv.x)
            * smoothstep(0.018, 0.035, vUv.y)
            * smoothstep(0.018, 0.035, 1.0 - vUv.x)
            * smoothstep(0.018, 0.035, 1.0 - vUv.y);
        vec3 border = mix(vec3(0.89, 0.15, 0.18), paper, uActive);
        color = mix(border, color, edge);

        gl_FragColor = vec4(color, mix(0.72, 1.0, uActive));
    }
`;

export { vertex, fragment };
