import React from "react";

export default function TiktokEmbed({ videoId }) {
  const src = `https://www.tiktok.com/embed/v2/${videoId}`;
  return (
    <iframe
      className="v-iframe v-iframe--tall"
      title="TikTok embed"
      src={src}
      allow="encrypted-media; picture-in-picture"
      allowFullScreen
      scrolling="no"
      style={{ overflow: "hidden", backgroundColor: "#000000" }}
    />
  );
}
