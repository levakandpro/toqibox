import React, { useEffect, useRef, useState } from "react";
import YoutubeEmbed from "../video/YoutubeEmbed.jsx";

/**
 * PreviewPlayer - автовоспроизведение превью YouTube видео на 30 секунд
 * @param {Object} props
 * @param {string} props.videoId - YouTube video ID
 * @param {number} props.startSeconds - Начальная секунда превью (по умолчанию 0)
 * @param {Function} props.onPreviewEnd - Callback когда превью закончилось (30 секунд)
 * @param {Function} props.onPlayClick - Callback когда пользователь кликает на главный плеер
 */
export default function PreviewPlayer({ videoId, startSeconds = 0, onPreviewEnd, onPlayClick }) {
  const [isPlaying, setIsPlaying] = useState(false); // Начинаем с false, включаем после монтирования
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef(null);
  const iframeRef = useRef(null);
  const previewEndedRef = useRef(false);
  
  // Включаем воспроизведение сразу после монтирования
  useEffect(() => {
    if (videoId && !previewEndedRef.current) {
      console.log("🎬 PreviewPlayer: Starting automatic preview playback", { videoId, startSeconds });
      // Небольшая задержка для гарантии, что компонент полностью смонтирован
      const timer = setTimeout(() => {
        if (!previewEndedRef.current) {
          console.log("🎬 PreviewPlayer: Starting playback now");
          setIsPlaying(true);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [videoId, startSeconds]);

  // Автовоспроизведение на 30 секунд
  useEffect(() => {
    if (!isPlaying || previewEndedRef.current) return;

    // Запускаем таймер на 30 секунд
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 1;
        
        // Если прошло 30 секунд, останавливаем превью
        if (newTime >= 30) {
          previewEndedRef.current = true;
          setIsPlaying(false);
          // Вызываем callback в следующем тике, чтобы избежать обновления во время рендера
          setTimeout(() => {
            if (onPreviewEnd) {
              onPreviewEnd();
            }
          }, 0);
          return 30;
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, onPreviewEnd]);

  // Останавливаем превью при клике на главный плеер
  const handlePlayClick = () => {
    previewEndedRef.current = true;
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Вызываем callback в следующем тике, чтобы избежать обновления во время рендера
    setTimeout(() => {
      if (onPlayClick) {
        onPlayClick();
      }
    }, 0);
  };

  // Останавливаем превью при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (!videoId || previewEndedRef.current) {
    return null;
  }

  return (
    <div 
      className="preview-player"
      style={{
        position: "fixed",
        top: "-9999px",
        left: "-9999px",
        width: "1px",
        height: "1px",
        zIndex: -1,
        pointerEvents: "none",
        opacity: 0,
        visibility: "hidden",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/* YouTube превью на 30 секунд - воспроизводится скрыто на фоне */}
      {isPlaying && (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&start=${startSeconds}&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&controls=0&disablekb=1&fs=0&loop=0&mute=0`}
            title="Preview player (hidden)"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{
              border: "none",
            }}
          />
        </div>
      )}
    </div>
  );
}

