import React from "react";

export default function YoutubeEmbed({ videoId, startSeconds = 0 }) {
  const s = Math.max(0, Number(startSeconds || 0));
  const src =
    `https://www.youtube-nocookie.com/embed/${videoId}` +
    `?autoplay=1&playsinline=1&start=${s}` +
    `&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0`;

  return (
    <iframe
      className="v-iframe v-iframe--wide"
      title="YouTube player"
      src={src}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
    />
  );
}
