import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import IconTubeteika from "../../ui/IconTubeteika.jsx";
import YoutubeEmbed from "../video/YoutubeEmbed.jsx";
import TiktokEmbed from "../video/TiktokEmbed.jsx";
import InstagramEmbed from "../video/InstagramEmbed.jsx";

export default function TrackPlayer({ track }) {
  const [playing, setPlaying] = useState(false);
  const [closing, setClosing] = useState(false);
  const navigate = useNavigate();

  const embed = useMemo(() => {
    if (!playing) return null;

    const source = String(track.source || "").toLowerCase();
    const variant = String(track.variant || "").toLowerCase();

    if (source === "youtube") {
      return (
        <YoutubeEmbed
          videoId={track.youtubeId}
          startSeconds={track.startSeconds || 0}
        />
      );
    }

    if (source === "tiktok") {
      return <TiktokEmbed videoId={track.tiktokId} />;
    }

    if (source === "instagram") {
      return <InstagramEmbed shortcode={track.instagramShortcode} />;
    }

    if (track.videoId) {
      if (source === "youtube") {
        return (
          <YoutubeEmbed
            videoId={track.videoId}
            startSeconds={track.startSeconds || 0}
          />
        );
      }
      if (source === "tiktok") return <TiktokEmbed videoId={track.videoId} />;
      if (source === "instagram")
        return <InstagramEmbed shortcode={track.videoId} />;
    }

    return null;
  }, [
    playing,
    track.source,
    track.variant,
    track.youtubeId,
    track.tiktokId,
    track.instagramShortcode,
    track.videoId,
    track.startSeconds
  ]);

  function onPlay() {
    if (playing) return;

    const key = `toqibox:play:${track.slug}`;
    const next = Number(localStorage.getItem(key) || "0") + 1;
    localStorage.setItem(key, String(next));

    setPlaying(true);
  }

  function onClose(e) {
    // Закрываем только если клик был на фоне, а не на самом видео
    if (e.target === e.currentTarget) {
      setClosing(true);
      // Плавный переход после анимации закрытия
      setTimeout(() => {
        setPlaying(false);
        setClosing(false);
        navigate("/", { replace: true });
      }, 300);
    }
  }

  return (
    <div className="tp-root">
      {playing ? (
        <div className={`tp-media ${closing ? 'tp-media--closing' : ''}`} onClick={onClose}>
          <div className="tp-embedWrapper" onClick={(e) => e.stopPropagation()}>
            {embed}
          </div>
        </div>
      ) : (
        <button className="tp-play" onClick={onPlay} aria-label="Play">
          <span className="tp-iconWrap" aria-hidden="true">
            <IconTubeteika className="tp-icon" />
          </span>


        </button>
      )}
    </div>
  );
}
