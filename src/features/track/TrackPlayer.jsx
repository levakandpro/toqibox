import React, { useMemo, useState, useEffect, useRef } from "react";

import IconTubeteika from "../../ui/IconTubeteika.jsx";
import YoutubeEmbed from "../video/YoutubeEmbed.jsx";
import TiktokEmbed from "../video/TiktokEmbed.jsx";
import InstagramEmbed from "../video/InstagramEmbed.jsx";
import { getPlayIcon } from "../../utils/playIcons.js";
import { PLAY_BUTTON_OPTIONS } from "../artist/playButtonOptions.js";

export default function TrackPlayer({ track, artist, onPlay }) {
  const [playing, setPlaying] = useState(false);
  const [closing, setClosing] = useState(false);
  const [selectedPlayButton, setSelectedPlayButton] = useState(null);
  const playButtonRef = useRef(null);

  const embed = useMemo(() => {
    if (!playing || !track) return null;

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
    track?.source,
    track?.variant,
    track?.youtubeId,
    track?.tiktokId,
    track?.instagramShortcode,
    track?.videoId,
    track?.startSeconds
  ]);

  function handlePlay() {
    if (playing || !track) return;

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

  // Загружаем выбранную кнопку плеера артиста (фон)
  useEffect(() => {
    const loadPlayButton = () => {
      if (artist?.id) {
        // Сначала проверяем localStorage
        const stored = localStorage.getItem(`toqibox:playButton:${artist.id}`);
        const buttonId = stored || artist?.play_button_id || 'default';
        
        const found = PLAY_BUTTON_OPTIONS.find(b => b.id === buttonId);
        if (found) {
          setSelectedPlayButton(found);
        } else {
          // Если не найден, используем базовый
          const defaultButton = PLAY_BUTTON_OPTIONS.find(b => b.id === 'default');
          if (defaultButton) {
            setSelectedPlayButton(defaultButton);
          }
        }
      } else {
        // Если нет артиста, используем базовый вариант
        const defaultButton = PLAY_BUTTON_OPTIONS.find(b => b.id === 'default');
        if (defaultButton) {
          setSelectedPlayButton(defaultButton);
        }
      }
    };

    loadPlayButton();

    // Слушаем кастомное событие для обновления в той же вкладке
    const handleCustomEvent = () => {
      loadPlayButton();
    };

    window.addEventListener('playButtonUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('playButtonUpdated', handleCustomEvent);
    };
  }, [artist?.id, artist?.play_button_id]);

  // Применяем HTML кнопки как фон при изменении выбранной кнопки
  useEffect(() => {
    if (!selectedPlayButton) return;
    
    // Небольшая задержка, чтобы убедиться, что ref установлен
    const timer = setTimeout(() => {
      if (playButtonRef.current) {
        // Очищаем предыдущее содержимое
        playButtonRef.current.innerHTML = '';
        playButtonRef.current.className = `tp-play-button-bg ${selectedPlayButton.component}`;
        
        // Если это базовый вариант (пустой HTML), не добавляем ничего
        if (selectedPlayButton.id === 'default' || !selectedPlayButton.html) {
          return;
        }
        
        // Создаем временный контейнер для парсинга HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = selectedPlayButton.html;
        
        // Копируем все дочерние элементы
        while (tempDiv.firstChild) {
          playButtonRef.current.appendChild(tempDiv.firstChild);
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [selectedPlayButton]);

  // Получаем иконку для отображения (всегда поверх фона)
  const playIconSrc = useMemo(() => {
    if (!track) return null;
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
          {/* Фон кнопки (uiverse.io) - всегда сзади */}
          <div 
            ref={playButtonRef} 
            className={`tp-play-button-bg ${selectedPlayButton?.component || ''}`}
            style={{ display: (selectedPlayButton && selectedPlayButton.id !== 'default' && selectedPlayButton.html) ? 'flex' : 'none' }}
          />
          {/* Иконка - всегда поверх фона */}
          {playIconSrc && (
            <span className="tp-iconWrap" aria-hidden="true">
              <img 
                src={playIconSrc} 
                alt="Play" 
                className="tp-icon"
                key={track?.play_icon || 'default'} // Принудительное обновление при изменении иконки
              />
            </span>
          )}
        </button>
      )}
    </div>
  );
}
