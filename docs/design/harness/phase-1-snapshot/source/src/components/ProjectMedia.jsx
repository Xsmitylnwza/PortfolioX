import { useEffect, useRef, useState } from 'react';

const nearViewportCallbacks = new WeakMap();
const visibleCallbacks = new WeakMap();
let nearViewportObserver;
let visibleObserver;

const getObserver = (type) => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        return null;
    }

    if (type === 'near') {
        if (!nearViewportObserver) {
            nearViewportObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    nearViewportCallbacks.get(entry.target)?.(entry.isIntersecting);
                });
            }, {
                rootMargin: '240px 0px',
                threshold: 0.01
            });
        }

        return nearViewportObserver;
    }

    if (!visibleObserver) {
        visibleObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                visibleCallbacks.get(entry.target)?.(
                    entry.isIntersecting && entry.intersectionRatio >= 0.08
                );
            });
        }, {
            threshold: [0, 0.08]
        });
    }

    return visibleObserver;
};

const observeMedia = (node, type, callback) => {
    const observer = getObserver(type);
    const callbacks = type === 'near' ? nearViewportCallbacks : visibleCallbacks;

    if (!observer) {
        callback(true);
        return () => {};
    }

    callbacks.set(node, callback);
    observer.observe(node);

    return () => {
        observer.unobserve(node);
        callbacks.delete(node);
    };
};

const normalizeMedia = ({ media, image, video }) => {
    if (media && typeof media === 'object') return media;
    return {
        image: media || image,
        video
    };
};

const isAnimatedRaster = (source) => {
    if (!source || typeof source !== 'string') return false;
    const value = source.split('?')[0].split('#')[0].toLowerCase();
    return value.endsWith('.gif') || value.endsWith('.apng');
};

const getResponsiveImageProps = (image, sizes) => {
    if (!image) return {};

    try {
        const url = new URL(image);
        if (!url.hostname.includes('images.unsplash.com')) {
            return sizes ? { sizes } : {};
        }

        const widths = [400, 800, 1200, 1600];
        const srcSet = widths.map((width) => {
            const nextUrl = new URL(url);
            nextUrl.searchParams.set('w', width.toString());
            return `${nextUrl.toString()} ${width}w`;
        }).join(', ');

        return {
            srcSet,
            sizes: sizes || '(max-width: 768px) 100vw, 720px'
        };
    } catch {
        return sizes ? { sizes } : {};
    }
};

const shouldAvoidMotionMedia = () => {
    if (typeof window === 'undefined') return false;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection?.saveData;
    return Boolean(reducedMotion || saveData);
};

const useMotionMediaAllowed = () => {
    const [isAllowed, setIsAllowed] = useState(() => !shouldAvoidMotionMedia());

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        const connection = navigator.connection;
        const updatePreference = () => setIsAllowed(!shouldAvoidMotionMedia());

        motionQuery?.addEventListener?.('change', updatePreference);
        connection?.addEventListener?.('change', updatePreference);

        return () => {
            motionQuery?.removeEventListener?.('change', updatePreference);
            connection?.removeEventListener?.('change', updatePreference);
        };
    }, []);

    return isAllowed;
};

const ProjectMedia = ({
    media,
    image,
    video,
    alt,
    className,
    style,
    eager = false,
    sizes,
    waveSkip = false
}) => {
    const mediaRef = useRef(null);
    const source = normalizeMedia({ media, image, video });
    const [loadedVideo, setLoadedVideo] = useState(() => eager ? source.video : null);
    const [isVisible, setIsVisible] = useState(false);
    const motionMediaAllowed = useMotionMediaAllowed();
    const hasActiveVideo = Boolean(
        source.video
        && loadedVideo === source.video
        && motionMediaAllowed
    );
    const responsiveImageProps = getResponsiveImageProps(source.image, sizes);

    useEffect(() => {
        const node = mediaRef.current;
        if (!node || !source.video || loadedVideo === source.video || !motionMediaAllowed) {
            return undefined;
        }

        return observeMedia(node, 'near', (isNearViewport) => {
            if (isNearViewport) setLoadedVideo(source.video);
        });
    }, [loadedVideo, motionMediaAllowed, source.video]);

    useEffect(() => {
        const node = mediaRef.current;
        if (!node || !source.video || !motionMediaAllowed) return undefined;

        return observeMedia(node, 'visible', setIsVisible);
    }, [motionMediaAllowed, source.video]);

    useEffect(() => {
        const node = mediaRef.current;
        if (!(node instanceof HTMLVideoElement)) return undefined;

        if (!hasActiveVideo || !isVisible) {
            node.pause();
            return undefined;
        }

        const playRequest = node.play();
        playRequest?.catch(() => {
            // Poster stays visible when autoplay is blocked.
        });

        return () => node.pause();
    }, [hasActiveVideo, isVisible]);

    if (source.video) {
        return (
            <video
                ref={mediaRef}
                src={hasActiveVideo ? source.video : undefined}
                poster={source.image}
                role={alt ? 'img' : undefined}
                aria-label={alt || undefined}
                aria-hidden={alt ? undefined : true}
                className={className}
                style={style}
                data-media-state={hasActiveVideo && isVisible ? 'playing' : 'poster'}
                data-wave-media-skip={waveSkip ? '' : undefined}
                muted
                loop
                playsInline
                preload={eager ? 'metadata' : 'none'}
                disablePictureInPicture
                tabIndex={-1}
                onPointerEnter={() => {
                    if (motionMediaAllowed) setLoadedVideo(source.video);
                }}
            />
        );
    }

    const animated = isAnimatedRaster(source.image);

    return (
        <img
            ref={mediaRef}
            src={source.image}
            alt={alt}
            className={className}
            style={style}
            loading={eager ? 'eager' : 'lazy'}
            decoding={animated ? 'sync' : 'async'}
            fetchPriority={eager ? 'high' : 'low'}
            data-animated-media={animated ? 'true' : undefined}
            data-wave-media-skip={waveSkip ? '' : undefined}
            {...responsiveImageProps}
        />
    );
};

export default ProjectMedia;
