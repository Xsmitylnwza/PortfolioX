import { useEffect, useRef, useState } from 'react';

const normalizeMedia = ({ media, image, video }) => {
    if (media && typeof media === 'object') return media;
    return {
        image: media || image,
        video
    };
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

const ProjectMedia = ({
    media,
    image,
    video,
    alt,
    className,
    style,
    eager = false,
    sizes
}) => {
    const wrapperRef = useRef(null);
    const loadTimerRef = useRef(null);
    const [shouldLoadVideo, setShouldLoadVideo] = useState(eager);
    const source = normalizeMedia({ media, image, video });
    const responsiveImageProps = getResponsiveImageProps(source.image, sizes);

    useEffect(() => {
        if (!source.video || shouldLoadVideo) return;

        const node = wrapperRef.current;
        if (!node) return;

        let removeScrollListener = null;
        const scheduleVideoLoad = () => {
            if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current);
            loadTimerRef.current = window.setTimeout(() => {
                setShouldLoadVideo(true);
                if (removeScrollListener) removeScrollListener();
            }, 700);
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                const onScroll = () => scheduleVideoLoad();
                window.addEventListener('scroll', onScroll, { passive: true });
                window.addEventListener('wheel', onScroll, { passive: true });
                removeScrollListener = () => {
                    window.removeEventListener('scroll', onScroll);
                    window.removeEventListener('wheel', onScroll);
                };
                scheduleVideoLoad();
                observer.disconnect();
            }
        }, { rootMargin: '300px 0px' });

        observer.observe(node);
        return () => {
            observer.disconnect();
            if (removeScrollListener) removeScrollListener();
            if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current);
        };
    }, [source.video, shouldLoadVideo]);

    if (source.video) {
        if (!shouldLoadVideo) {
            return (
                <img
                    ref={wrapperRef}
                    src={source.image}
                    alt={alt}
                    className={className}
                    style={style}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    onMouseEnter={() => setShouldLoadVideo(true)}
                    {...responsiveImageProps}
                />
            );
        }

        return (
            <video
                ref={wrapperRef}
                src={source.video}
                poster={source.image}
                aria-label={alt}
                className={className}
                style={style}
                autoPlay
                muted
                loop
                playsInline
                preload={eager ? 'auto' : 'metadata'}
                disablePictureInPicture
            />
        );
    }

    return (
        <img
            src={source.image}
            alt={alt}
            className={className}
            style={style}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={eager ? 'high' : 'low'}
            {...responsiveImageProps}
        />
    );
};

export default ProjectMedia;
