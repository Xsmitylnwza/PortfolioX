import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import ProjectMedia from './ProjectMedia';
import { isVideoSource, resolveMediaSource, getMediaKindMeta } from './ProjectDetailsMediaSource';
import type { ProjectMedia as MediaSource } from '../data/projectTypes';

interface KindMeta { kind: string; mark: string }
interface OriginRect { left: number; top: number; width: number; height: number }
interface LightboxState { source: string; alt?: string; kindMeta: KindMeta | null; originRect: OriginRect | null }
interface CaseMediaFrameProps {
  image?: string; video?: string; media?: MediaSource; alt?: string;
  eager?: boolean; sizes?: string; className?: string; label?: string;
  kindLabel?: string; transitionTarget?: boolean; waveSkip?: boolean; cover?: boolean;
}
interface CaseMediaLightboxProps {
  open: boolean;
  source?: string;
  alt?: string;
  kindMeta?: KindMeta | null;
  originRect?: OriginRect | null;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}

const easeOutExpo = 'cubic-bezier(0.22, 1, 0.36, 1)';

const CaseMediaLightbox = ({ open, source, alt, kindMeta, originRect, returnFocusRef, onClose }: CaseMediaLightboxProps) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.documentElement.style.overflow;
    const previousFocus = document.activeElement;
    const returnFocusTarget = returnFocusRef?.current || previousFocus;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.classList.add('case-lightbox-open');

    const shell = shellRef.current;
    const stage = stageRef.current;
    const focusableSelector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'video[controls]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== 'Tab' || !shell) return;

      const focusable = [...shell.querySelectorAll<HTMLElement>(focusableSelector)]
        .filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) {
        event.preventDefault();
        shell.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const focusOutside = !shell.contains(document.activeElement);

      if (event.shiftKey && (document.activeElement === first || focusOutside)) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && (document.activeElement === last || focusOutside)) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', onKeyDown);

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });
    let openAnim: Animation | null = null;
    const closeTimer = 0;

    // FLIP open: from thumbnail rect -> centered stage.
    if (shell && stage && originRect && originRect.width > 0 && originRect.height > 0) {
      const dest = stage.getBoundingClientRect();
      const scaleX = originRect.width / Math.max(dest.width, 1);
      const scaleY = originRect.height / Math.max(dest.height, 1);
      const scale = Math.min(scaleX, scaleY);
      const originCx = originRect.left + originRect.width / 2;
      const originCy = originRect.top + originRect.height / 2;
      const destCx = dest.left + dest.width / 2;
      const destCy = dest.top + dest.height / 2;
      const dx = originCx - destCx;
      const dy = originCy - destCy;

      shell.classList.add('is-open');
      try {
        openAnim = stage.animate(
          [
            {
              transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`,
              borderRadius: '0.95rem',
            },
            {
              transform: 'translate3d(0, 0, 0) scale(1)',
              borderRadius: '1.1rem',
            },
          ],
          {
            duration: 920,
            easing: easeOutExpo,
            fill: 'both',
          },
        );
      } catch {
        // Fall back to CSS class transition only.
      }
    } else if (shell) {
      shell.classList.add('is-open');
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.cancelAnimationFrame(focusFrame);
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.classList.remove('case-lightbox-open');
      window.clearTimeout(closeTimer);
      try {
        openAnim?.cancel?.();
      } catch {
        /* ignore */
      }
      if (returnFocusTarget instanceof HTMLElement && returnFocusTarget.isConnected) {
        returnFocusTarget.focus({ preventScroll: true });
      }
    };
  }, [open, onClose, originRect, returnFocusRef]);

  if (!open || !source || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={shellRef}
      className="case-lightbox"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onClick={onClose}
    >
      <div className="case-lightbox__veil" />
      <button
        ref={closeButtonRef}
        type="button"
        className="case-lightbox__close"
        onClick={onClose}
        data-cursor="default"
        aria-label="Close fullscreen demo"
      >
        <Icon icon="lucide:x" aria-hidden="true" />
      </button>
      <div
        ref={stageRef}
        className="case-lightbox__stage"
        onClick={(event) => event.stopPropagation()}
      >
        <p id={titleId} className="case-lightbox__title">
          {alt || 'Project demo'}
        </p>
        {kindMeta && (
          <span className="case-lightbox__kind" aria-hidden="true">
            <span className="case-lightbox__kind-dot" />
            {kindMeta.mark}
          </span>
        )}
        {isVideoSource(source) ? (
          <video
            className="case-lightbox__media"
            src={source}
            autoPlay
            muted
             loop
             playsInline
             controls
             tabIndex={0}
             aria-label={alt || 'Project demo'}
           />
        ) : (
          <img
            className="case-lightbox__media"
            src={source}
            alt={alt || 'Project demo'}
            draggable={false}
          />
        )}
      </div>
    </div>,
    document.body,
  );
};

const CaseMediaFrame = ({
  image,
  video,
  media,
  alt,
  eager = false,
  sizes,
  className = '',
  label,
  kindLabel,
  transitionTarget = false,
  waveSkip = false,
  cover = false,
}: CaseMediaFrameProps) => {
  const frameRef = useRef<HTMLButtonElement>(null);
  const source = resolveMediaSource({ media, image, video });
  const kindMeta = useMemo(
    () => (source && (cover || kindLabel)
      ? { kind: 'image', mark: kindLabel || 'Project illustration' }
      : getMediaKindMeta(source)),
    [cover, kindLabel, source],
  );
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const canExpand = Boolean(source);

  const openLightbox = useCallback(() => {
    if (!canExpand) return;
    const rect = frameRef.current?.getBoundingClientRect?.();
    setLightbox({
      source,
      alt,
      kindMeta,
      originRect: rect
        ? {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          }
        : null,
    });
  }, [alt, canExpand, kindMeta, source]);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  return (
    <>
      <button
        ref={frameRef}
        type="button"
        className={[
          'case-media__frame',
          cover ? 'case-media__frame--cover' : '',
          kindMeta ? `case-media__frame--${kindMeta.kind}` : '',
          kindMeta ? 'case-media__frame--demo' : '',
          canExpand ? 'case-media__frame--expandable' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-cursor={canExpand ? 'view' : 'default'}
        data-cursor-text={canExpand ? '' : undefined}
        data-wave-follow
        data-media-kind={kindMeta?.kind || undefined}
        data-poster-transition-target={transitionTarget ? '' : undefined}
        onClick={openLightbox}
        aria-label={canExpand ? `Open fullscreen ${cover ? 'image' : 'demo'}: ${alt || 'media'}` : undefined}
      >
        {label && <span className="case-media__label">{label}</span>}
        {kindMeta && (
          <span className="case-media__kind" aria-hidden="true">
            <span className="case-media__kind-dot" />
            {kindMeta.mark}
          </span>
        )}
        <ProjectMedia
          image={image}
          video={video}
          media={media}
          alt={alt}
          eager={eager}
          sizes={sizes}
          waveSkip={waveSkip}
        />
      </button>

      <CaseMediaLightbox
        open={Boolean(lightbox)}
        source={lightbox?.source}
        alt={lightbox?.alt}
        kindMeta={lightbox?.kindMeta}
        originRect={lightbox?.originRect}
        returnFocusRef={frameRef}
        onClose={closeLightbox}
      />
    </>
  );
};

export default CaseMediaFrame;
