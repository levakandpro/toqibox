import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import TrackPlayer from "../../../features/track/TrackPlayer.jsx";
import PreviewPlayer from "../../../features/track/PreviewPlayer.jsx";
import TubeteikaReaction from "../../../features/reaction/TubeteikaReaction.jsx";
import ShareSheet from "../../../features/share/ShareSheet.jsx";
import { getMockTrackBySlug } from "../../../features/track/track.mock.js";
import { getMockArtistBySlug } from "../../../features/artist/artist.mock.js";

import { supabase } from "../../../features/auth/supabaseClient.js";
import { setTrackOgTags, clearOgTags } from "../../../utils/ogTags.js";

import verifGold from "../../../assets/verifgold.svg";
import shareIcon from "../../../assets/share.svg";

export default function TrackPage() {
  const navigate = useNavigate();
  const { slug = "test" } = useParams();

  const [track, setTrack] = useState(null);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [mainPlayerPlaying, setMainPlayerPlaying] = useState(false);

  // Функция для извлечения YouTube ID из ссылки
  const extractYoutubeId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Загружаем трек из БД
  useEffect(() => {
    let alive = true;

    const loadTrack = async () => {
      setLoading(true);
      try {
        // Загружаем трек из БД
        const { data: trackData, error: trackError } = await supabase
          .from("tracks")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (trackError) {
          console.error("Error loading track:", trackError);
          // Fallback на мок, если трек не найден
          const mockTrack = getMockTrackBySlug(slug);
          if (alive) {
            setTrack(mockTrack);
            const mockArtist = getMockArtistBySlug(mockTrack.artistSlug);
            setArtist(mockArtist);
          }
          setLoading(false);
          return;
        }

        if (!trackData) {
          // Fallback на мок, если трек не найден
          const mockTrack = getMockTrackBySlug(slug);
          if (alive) {
            setTrack(mockTrack);
            const mockArtist = getMockArtistBySlug(mockTrack.artistSlug);
            setArtist(mockArtist);
          }
          setLoading(false);
          return;
        }

        // Загружаем артиста
        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select("*")
          .eq("id", trackData.artist_id)
          .maybeSingle();

        if (artistError) {
          console.error("Error loading artist:", artistError);
        }

        if (alive) {
          // Преобразуем трек из БД в формат для компонента
          const youtubeId = extractYoutubeId(trackData.link);
          const formattedTrack = {
            id: trackData.id,
            slug: trackData.slug,
            title: trackData.title,
            link: trackData.link,
            cover_key: trackData.cover_key, // Ключ обложки в R2
            play_icon: trackData.play_icon || null, // Иконка плеера
            preview_start_seconds: trackData.preview_start_seconds || 0, // Начало превью
            artistSlug: artistData?.slug || "unknown",
            artistName: artistData?.display_name || artistData?.name || "Unknown Artist",
            source: trackData.source || "youtube",
            variant: "video",
            coverUrl: null,
            youtubeId: youtubeId,
            startSeconds: 0,
            createdAt: trackData.created_at,
          };

          console.log("🎵 Загружен трек:", {
            slug: formattedTrack.slug,
            play_icon: formattedTrack.play_icon,
            trackData: trackData,
          });

          setTrack(formattedTrack);
          setArtist(artistData || null);
        }
      } catch (e) {
        console.error("Error loading track:", e);
        // Fallback на мок
        const mockTrack = getMockTrackBySlug(slug);
        if (alive) {
          setTrack(mockTrack);
          const mockArtist = getMockArtistBySlug(mockTrack.artistSlug);
          setArtist(mockArtist);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadTrack();

    return () => {
      alive = false;
    };
  }, [slug]);

  const isPremium = !!artist?.isPremium;

  const shareUrl = useMemo(() => {
    return `${window.location.origin}/t/${slug}`;
  }, [slug]);

  // Обновляем Open Graph теги при загрузке данных трека
  useEffect(() => {
    if (!track || !artist) {
      clearOgTags();
      return;
    }

    setTrackOgTags({
      trackTitle: track.title,
      artistName: track.artistName,
      slug: track.slug,
      coverKey: track.cover_key || null,
      source: track.source || "youtube",
      artistSlug: track.artistSlug || null,
    });

    // Очищаем теги при размонтировании
    return () => {
      clearOgTags();
    };
  }, [track, artist]);

  const handleShare = () => {
    setShareOpen(true);
  };

  const sourceLabel = useMemo(() => {
    if (!track) return "";
    const source = String(track.source || "").toLowerCase();
    const variant = String(track.variant || "").toLowerCase();

    if (source === "youtube") return "Shorts";
    if (source === "instagram") return "Reels";
    if (source === "tiktok") return "Tik Tok";

    return (track.source || "").toUpperCase();
  }, [track?.source, track?.variant]);

  const sourceType = useMemo(() => {
    if (!track) return null;
    const source = String(track.source || "").toLowerCase();

    if (source === "youtube") return "shorts";
    if (source === "instagram") return "reels";
    if (source === "tiktok") return "tiktok";

    return null;
  }, [track?.source]);

  const handleAddTrack = async (e) => {
    e.preventDefault();

    try {
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data?.session;

      if (!hasSession) {
        localStorage.setItem("toqibox:returnTo", "/author");
        navigate("/login", { replace: true });
        return;
      }

      navigate("/author", { replace: true });
    } catch (err) {
      localStorage.setItem("toqibox:returnTo", "/author");
      navigate("/login", { replace: true });
    }
  };

  if (loading || !track) {
    return (
      <div className="t-page">
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <div style={{ opacity: 0.7 }}>Загрузка...</div>
        </div>
      </div>
    );
  }

  // Получаем обложку для фона
  const coverUrl = track.coverUrl || (track.youtubeId 
    ? `https://img.youtube.com/vi/${track.youtubeId}/maxresdefault.jpg`
    : null);

  return (
    <div className="t-page">
      {coverUrl && (
        <div
          className="t-cover"
          style={{ backgroundImage: `url(${coverUrl})` }}
          aria-hidden="true"
        />
      )}
      <div className="t-overlay" aria-hidden="true" />

      <header className="t-header">
        <button
          className="t-share"
          onClick={handleShare}
          aria-label="Share"
          type="button"
        >
          <img src={shareIcon} alt="" className="t-shareIcon" />
        </button>

        {/* Канон: "Добавить трек" всегда ведёт в /author (через проверку сессии) */}
        <Link to="/author" className="t-addTrack" onClick={handleAddTrack}>
          Добавить трек
        </Link>

        <div className="t-headerRight">
          {sourceType && (
            <span className="t-source">
              <svg
                className="t-formatIcon"
                viewBox="0 0 10 10"
                aria-hidden="true"
              >
                <path
                  d="M2 2 L7 5 L2 8 Z"
                  fill="rgba(144, 238, 144, 0.8)"
                  stroke="rgba(144, 238, 144, 0.6)"
                  strokeWidth="0.3"
                />
              </svg>
              {sourceLabel}
            </span>
          )}
        </div>
      </header>

      <main className="t-center" style={{ position: "relative" }}>
        {/* Превью-плеер: автовоспроизведение 30 секунд до нажатия главного плеера */}
        {/* Временно отключено для отладки */}
        {false && track?.youtubeId && !previewEnded && !mainPlayerPlaying && (
          <PreviewPlayer
            videoId={track.youtubeId}
            startSeconds={track.preview_start_seconds || 0}
            onPreviewEnd={() => {
              setPreviewEnded(true);
            }}
            onPlayClick={() => {
              setPreviewEnded(true);
              setMainPlayerPlaying(true);
            }}
          />
        )}
        {/* Главный плеер */}
        <TrackPlayer 
          track={track} 
          onPlay={() => {
            setPreviewEnded(true);
            setMainPlayerPlaying(true);
          }}
        />
      </main>

      <footer className="t-bottom">
        <div className="t-meta">
          <div className="t-title">{track.title}</div>

          <Link className="t-artist" to={`/a/${track.artistSlug}`}>
            <span className="t-artistName">{track.artistName}</span>

            {isPremium ? (
              <img
                src={verifGold}
                alt=""
                className="t-verifGold"
                aria-hidden="true"
              />
            ) : null}
          </Link>
        </div>

        <div className="t-actions">
          <TubeteikaReaction trackSlug={track.slug} />
        </div>
      </footer>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title={track.title}
      />
    </div>
  );
}
