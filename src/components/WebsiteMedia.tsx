import { useEffect, useRef, useState } from 'react';

type WebsiteMediaProps = {
  src: string;
  poster: string;
  label: string;
  className?: string;
  priority?: boolean;
};

/** A silent decorative loop that respects reduced motion and viewport visibility. */
export default function WebsiteMedia({
  src,
  poster,
  label,
  className,
  priority = false,
}: WebsiteMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inView, setInView] = useState(priority);
  const [pausedByVisitor, setPausedByVisitor] = useState(false);
  const [motionRequested, setMotionRequested] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || priority || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '240px 0px',
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if ((reducedMotion && !motionRequested) || pausedByVisitor || !inView) {
      video.pause();
      return;
    }
    const playback = video.play();
    if (playback) void playback.catch(() => undefined);
  }, [inView, motionRequested, pausedByVisitor, reducedMotion]);

  const motionEnabled = inView && !pausedByVisitor && (!reducedMotion || motionRequested);

  return (
    <div className={['website-media', className].filter(Boolean).join(' ')}>
      <img
        className="website-media-poster"
        src={poster}
        alt=""
        aria-hidden="true"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
      />
      <video
        ref={videoRef}
        className="website-media-video"
        aria-hidden="true"
        muted
        playsInline
        loop
        autoPlay={!reducedMotion && !pausedByVisitor}
        preload={priority ? 'metadata' : 'none'}
        poster={poster}
        hidden={reducedMotion && !motionRequested}
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        className="website-media-control"
        type="button"
        aria-pressed={motionEnabled}
        onClick={() => {
          if (motionEnabled) {
            setPausedByVisitor(true);
          } else {
            setMotionRequested(true);
            setPausedByVisitor(false);
          }
        }}
      >
        {motionEnabled ? `Pause ${label}` : `Play ${label}`}
      </button>
    </div>
  );
}
