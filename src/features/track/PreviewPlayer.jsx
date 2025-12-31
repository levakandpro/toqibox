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
  
  // Включаем воспроизведение после монтирования
  useEffect(() => {
    if (videoId && !previewEndedRef.current) {
      setIsPlaying(true);
    }
  }, [videoId]);

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
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: isPlaying ? "auto" : "none",
        opacity: isPlaying ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      {/* YouTube превью на 30 секунд */}
      {isPlaying && (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
          <YoutubeEmbed 
            videoId={videoId} 
            startSeconds={startSeconds}
          />
          {/* Overlay для остановки превью при клике */}
          <div
            onClick={handlePlayClick}
            style={{
              position: "absolute",
              inset: 0,
              cursor: "pointer",
              zIndex: 2,
            }}
            aria-label="Нажмите для воспроизведения полного видео"
          />
        </div>
      )}
    </div>
  );
}

