import React, { useMemo, useState } from "react";

import IconTubeteika from "../../ui/IconTubeteika.jsx";
import YoutubeEmbed from "../video/YoutubeEmbed.jsx";
import TiktokEmbed from "../video/TiktokEmbed.jsx";
import InstagramEmbed from "../video/InstagramEmbed.jsx";
import { getPlayIcon } from "../../utils/playIcons.js";

export default function TrackPlayer({ track, onPlay }) {
  const [playing, setPlaying] = useState(false);
  const [closing, setClosing] = useState(false);

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

  function handlePlay() {
    if (playing) return;

    const key = `toqibox:play:${track.slug}`;
    const next = Number(localStorage.getItem(key) || "0") + 1;
    localStorage.setItem(key, String(next));

    setPlaying(true);
    // Уведомляем родительский компонент о начале воспроизведения
    if (onPlay) {
      onPlay();
    }
  }

  function onClose(e) {
    // Закрываем только если клик был на фоне, а не на самом видео
    if (e.target === e.currentTarget) {
      setClosing(true);
      // Плавное закрытие видео, остаемся на странице трека
      setTimeout(() => {
        setPlaying(false);
        setClosing(false);
      }, 300);
    }
  }

  // Получаем иконку для отображения
  const playIconSrc = useMemo(() => {
    const icon = getPlayIcon(track?.play_icon);
    console.log("🎵 TrackPlayer - play_icon:", {
      trackPlayIcon: track?.play_icon,
      resolvedIcon: icon,
      trackId: track?.id,
      trackSlug: track?.slug,
    });
    return icon;
  }, [track?.play_icon, track?.id, track?.slug]);

  return (
    <div className="tp-root">
      {playing ? (
        <div className={`tp-media ${closing ? 'tp-media--closing' : ''}`} onClick={onClose}>
          <div className="tp-embedWrapper" onClick={(e) => e.stopPropagation()}>
            {embed}
          </div>
        </div>
      ) : (
        <button className="tp-play" onClick={handlePlay} aria-label="Play">
          <span className="tp-iconWrap" aria-hidden="true">
            <img 
              src={playIconSrc} 
              alt="Play" 
              className="tp-icon"
              key={track?.play_icon || 'default'} // Принудительное обновление при изменении иконки
            />
          </span>
        </button>
      )}
    </div>
  );
}
