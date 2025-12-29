import React from "react";

export default function InstagramEmbed({ shortcode }) {
  const src = `https://www.instagram.com/reel/${shortcode}/embed`;
  return (
    <iframe
      className="v-iframe v-iframe--tall"
      title="Instagram embed"
      src={src}
      allow="encrypted-media; picture-in-picture"
      allowFullScreen
    />
  );
}
