import { useEffect, useId, useRef, useState } from 'react';
import { displacementMap } from './liquid-glass/maps';

const INITIAL_LIGHT = { x: 0.28, y: 0.22 };
const FOLLOW_EASING = 0.035;

const GlassFilter = ({ id, displacementScale, aberrationIntensity, width, height }) => (
  <svg
    className="keshi-liquid-glass__filter"
    style={{ width, height }}
    aria-hidden="true"
  >
    <defs>
      <filter id={id} x="-35%" y="-35%" width="170%" height="170%" colorInterpolationFilters="sRGB">
        <feImage
          x="0"
          y="0"
          width="100%"
          height="100%"
          result="DISPLACEMENT_MAP"
          href={displacementMap}
          preserveAspectRatio="xMidYMid slice"
        />
        <feColorMatrix
          in="DISPLACEMENT_MAP"
          type="matrix"
          values="0.3 0.3 0.3 0 0
                  0.3 0.3 0.3 0 0
                  0.3 0.3 0.3 0 0
                  0 0 0 1 0"
          result="EDGE_INTENSITY"
        />
        <feComponentTransfer in="EDGE_INTENSITY" result="EDGE_MASK">
          <feFuncA type="discrete" tableValues={`0 ${aberrationIntensity * 0.05} 1`} />
        </feComponentTransfer>
        <feOffset in="SourceGraphic" dx="0" dy="0" result="CENTER_ORIGINAL" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="DISPLACEMENT_MAP"
          scale={-displacementScale}
          xChannelSelector="R"
          yChannelSelector="B"
          result="RED_DISPLACED"
        />
        <feColorMatrix
          in="RED_DISPLACED"
          type="matrix"
          values="1 0 0 0 0
                  0 0 0 0 0
                  0 0 0 0 0
                  0 0 0 1 0"
          result="RED_CHANNEL"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="DISPLACEMENT_MAP"
          scale={displacementScale * (-1 - aberrationIntensity * 0.05)}
          xChannelSelector="R"
          yChannelSelector="B"
          result="GREEN_DISPLACED"
        />
        <feColorMatrix
          in="GREEN_DISPLACED"
          type="matrix"
          values="0 0 0 0 0
                  0 1 0 0 0
                  0 0 0 0 0
                  0 0 0 1 0"
          result="GREEN_CHANNEL"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="DISPLACEMENT_MAP"
          scale={displacementScale * (-1 - aberrationIntensity * 0.1)}
          xChannelSelector="R"
          yChannelSelector="B"
          result="BLUE_DISPLACED"
        />
        <feColorMatrix
          in="BLUE_DISPLACED"
          type="matrix"
          values="0 0 0 0 0
                  0 0 0 0 0
                  0 0 1 0 0
                  0 0 0 1 0"
          result="BLUE_CHANNEL"
        />
        <feBlend in="GREEN_CHANNEL" in2="BLUE_CHANNEL" mode="screen" result="GB_COMBINED" />
        <feBlend in="RED_CHANNEL" in2="GB_COMBINED" mode="screen" result="RGB_COMBINED" />
        <feGaussianBlur
          in="RGB_COMBINED"
          stdDeviation={Math.max(0.1, 0.5 - aberrationIntensity * 0.1)}
          result="ABERRATED_BLURRED"
        />
        <feComposite in="ABERRATED_BLURRED" in2="EDGE_MASK" operator="in" result="EDGE_ABERRATION" />
        <feComponentTransfer in="EDGE_MASK" result="INVERTED_MASK">
          <feFuncA type="table" tableValues="1 0" />
        </feComponentTransfer>
        <feComposite in="CENTER_ORIGINAL" in2="INVERTED_MASK" operator="in" result="CENTER_CLEAN" />
        <feComposite in="EDGE_ABERRATION" in2="CENTER_CLEAN" operator="over" />
      </filter>
    </defs>
  </svg>
);

const KeshiLiquidGlass = ({
  as = 'div',
  children,
  className = '',
  displacementScale = 72,
  aberrationIntensity = 0.35,
  ...props
}) => {
  const rootRef = useRef(null);
  const frameRef = useRef(0);
  const targetRef = useRef(INITIAL_LIGHT);
  const currentRef = useRef(INITIAL_LIGHT);
  const reducedMotionRef = useRef(false);
  const filterId = `keshi-glass-${useId().replace(/:/g, '')}`;
  const [size, setSize] = useState({ width: 1, height: 1 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const paint = () => {
      const current = currentRef.current;
      const target = targetRef.current;
      current.x += (target.x - current.x) * FOLLOW_EASING;
      current.y += (target.y - current.y) * FOLLOW_EASING;

      const angle = Math.atan2(current.y - 0.5, current.x - 0.5) * 180 / Math.PI + 90;
      const offsetX = (current.x - 0.5) * 100;
      const offsetY = (current.y - 0.5) * 100;
      root.style.setProperty('--keshi-glass-light-x', `${current.x * 100}%`);
      root.style.setProperty('--keshi-glass-light-y', `${current.y * 100}%`);
      root.style.setProperty('--keshi-glass-light-angle', `${angle}deg`);
      root.style.setProperty('--keshi-glass-border-angle', `${135 + offsetX * 1.2}deg`);
      root.style.setProperty('--keshi-glass-border-stop-one', `${Math.max(10, 33 + offsetY * 0.3)}%`);
      root.style.setProperty('--keshi-glass-border-stop-two', `${Math.min(90, 66 + offsetY * 0.4)}%`);
      root.style.setProperty('--keshi-glass-border-screen-one', String(0.12 + Math.abs(offsetX) * 0.008));
      root.style.setProperty('--keshi-glass-border-screen-two', String(0.4 + Math.abs(offsetX) * 0.012));
      root.style.setProperty('--keshi-glass-border-overlay-one', String(0.32 + Math.abs(offsetX) * 0.008));
      root.style.setProperty('--keshi-glass-border-overlay-two', String(0.6 + Math.abs(offsetX) * 0.012));

      const distance = Math.abs(target.x - current.x) + Math.abs(target.y - current.y);
      frameRef.current = distance > 0.001 ? requestAnimationFrame(paint) : 0;
    };
    const queuePaint = () => {
      if (!reducedMotionRef.current && !frameRef.current) {
        frameRef.current = requestAnimationFrame(paint);
      }
    };
    const setPointerTarget = (event) => {
      if (reducedMotionRef.current) return;
      const bounds = root.getBoundingClientRect();
      targetRef.current = {
        x: Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)),
        y: Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height)),
      };
      queuePaint();
    };
    const settleReflection = () => {
      targetRef.current = INITIAL_LIGHT;
      queuePaint();
    };

    const updateSize = () => {
      const bounds = root.getBoundingClientRect();
      setSize({ width: Math.max(1, bounds.width), height: Math.max(1, bounds.height) });
    };
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      reducedMotionRef.current = motionQuery.matches;
      if (motionQuery.matches && frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };
    const resizeObserver = new ResizeObserver(updateSize);

    updateSize();
    updateMotion();
    resizeObserver.observe(root);
    motionQuery.addEventListener('change', updateMotion);
    root.addEventListener('pointermove', setPointerTarget);
    root.addEventListener('pointerleave', settleReflection);

    return () => {
      resizeObserver.disconnect();
      motionQuery.removeEventListener('change', updateMotion);
      root.removeEventListener('pointermove', setPointerTarget);
      root.removeEventListener('pointerleave', settleReflection);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const Root = as;

  return (
    <Root
      {...props}
      ref={rootRef}
      className={['keshi-liquid-glass', className].filter(Boolean).join(' ')}
      style={{
        '--keshi-glass-refraction': `url(#${filterId})`,
        ...props.style,
      }}
    >
      <GlassFilter
        id={filterId}
        displacementScale={displacementScale}
        aberrationIntensity={aberrationIntensity}
        width={size.width}
        height={size.height}
      />
      <div className="keshi-liquid-glass__glass">
        <span
          className="keshi-liquid-glass__warp"
          aria-hidden="true"
        />
        <div className="keshi-liquid-glass__content">{children}</div>
      </div>
      <span className="keshi-liquid-glass__border keshi-liquid-glass__border--screen" aria-hidden="true" />
      <span className="keshi-liquid-glass__border keshi-liquid-glass__border--overlay" aria-hidden="true" />
      <span className="keshi-liquid-glass__reflection-face" aria-hidden="true" />
      <span className="keshi-liquid-glass__reflection-rim" aria-hidden="true" />
    </Root>
  );
};

export default KeshiLiquidGlass;
