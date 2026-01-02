import React, { useEffect, useRef, useState } from "react";

export default function YoutubeEmbed({ videoId, startSeconds = 0, vertical = false, lazy = false }) {
  const [shouldLoad, setShouldLoad] = useState(!lazy);
  const iframeRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!lazy || shouldLoad) return;

    // Используем Intersection Observer для lazy loading
    if (iframeRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
              if (observerRef.current) {
                observerRef.current.disconnect();
              }
            }
          });
        },
        { rootMargin: "50px" }
      );
      observerRef.current.observe(iframeRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, shouldLoad]);

  const s = Math.max(0, Number(startSeconds || 0));
  const src = shouldLoad
    ? `https://www.youtube-nocookie.com/embed/${videoId}` +
      `?autoplay=1&playsinline=1&start=${s}` +
      `&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0` +
      `&controls=0&disablekb=1&fs=0&loop=0&mute=0`
    : undefined;

  return (
    <iframe
      ref={iframeRef}
      className={`v-iframe ${vertical ? "v-iframe--tall" : "v-iframe--wide"}`}
      title="YouTube player"
      src={src}
      loading={lazy ? "lazy" : "eager"}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      scrolling="no"
      style={{ overflow: "hidden", backgroundColor: "#000000" }}
    />
  );
}
