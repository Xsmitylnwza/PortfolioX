const getMediaExtension = (source) => {
  const value = String(source || '').split('?')[0].split('#')[0].toLowerCase();
  const match = value.match(/\.([a-z0-9]+)$/);
  return match?.[1] || '';
};

const isGifSource = (source) => {
  const ext = getMediaExtension(source);
  return ext === 'gif' || ext === 'apng';
};

const isVideoSource = (source) => {
  const ext = getMediaExtension(source);
  return ext === 'mp4' || ext === 'webm' || ext === 'ogg' || ext === 'mov';
};

const resolveMediaSource = ({ media, image, video } = {}) => {
  let imageSrc = '';
  let videoSrc = '';

  if (media && typeof media === 'object') {
    imageSrc = String(media.image || '');
    videoSrc = String(media.video || '');
  } else if (typeof media === 'string') {
    imageSrc = media;
  } else {
    imageSrc = String(image || '');
    videoSrc = String(video || '');
  }

  // Prefer GIF/APNG for demos so expand uses a real image, not an mp4 path in <img>.
  if (isGifSource(imageSrc)) return imageSrc;
  if (videoSrc) return videoSrc;
  return imageSrc;
};

const getMediaKindMeta = (source) => {
  if (isGifSource(source)) {
    return { kind: 'gif', mark: 'Demo · GIF' };
  }
  if (getMediaExtension(source) === 'webp') {
    return { kind: 'webp', mark: 'Demo · Motion' };
  }
  if (isVideoSource(source)) {
    return { kind: 'video', mark: 'Demo · Film' };
  }
  return null;
};

export { isGifSource, isVideoSource, resolveMediaSource, getMediaKindMeta };
