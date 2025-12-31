// FILE: src/app/author/page.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArtistHeader from "../../features/artist/ArtistHeader.jsx";
import ArtistTracks from "../../features/artist/ArtistTracks.jsx";
import AddTrackSection from "../../features/artist/AddTrackSection.jsx";
import ShareSheet from "../../features/share/ShareSheet.jsx";
import PremiumLoader from "../../ui/PremiumLoader.jsx";
import { supabase } from "../../features/auth/supabaseClient.js";

import "./author.css";

function slugifyBase(input) {
  const s = (input || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

  return s || "artist";
}

function randSuffix(len = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function getArtistForUser(user) {
  const { data: existing, error: selErr } = await supabase
    .from("artists")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (selErr) throw selErr;
  return existing || null;
}

async function createArtistForUser(user) {
  const base = slugifyBase(user?.user_metadata?.full_name || user?.email || "artist");

  for (let attempt = 0; attempt < 8; attempt++) {
    const slug = attempt === 0 ? `${base}-${randSuffix(5)}` : `${base}-${randSuffix(7)}`;

    const payload = {
      user_id: user.id,
      slug,
      display_name: "TOQIBOX ARTIST",
      header_start_sec: 0,
    };

    const { data: created, error: insErr } = await supabase
      .from("artists")
      .insert(payload)
      .select("*")
      .single();

    if (!insErr) return created;

    const msg = (insErr?.message || "").toLowerCase();
    const isUnique =
      insErr?.code === "23505" ||
      msg.includes("duplicate key") ||
      msg.includes("unique") ||
      msg.includes("artists_slug_key");

    if (!isUnique) throw insErr;
  }

  throw new Error("Не удалось создать артиста: slug collisions");
}

export default function AuthorPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [artist, setArtist] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [fatal, setFatal] = useState("");
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [tracks, setTracks] = useState([]);

  const [saving, setSaving] = useState(false);

  const shareUrl = useMemo(() => {
    if (!artist?.slug) return "";
    return `${window.location.origin}/a/${artist.slug}`;
  }, [artist?.slug]);

  // Функция для загрузки треков артиста
  const loadTracks = async (artistId) => {
    if (!artistId) {
      setTracks([]);
      return;
    }

    try {
      const { data: tracksData, error: tracksError } = await supabase
        .from("tracks")
        .select("*")
        .eq("artist_id", artistId)
        .order("created_at", { ascending: false });

      if (tracksError) {
        console.error("Error loading tracks:", tracksError);
        setTracks([]);
        return;
      }

      // Функция для извлечения YouTube ID из ссылки
      const extractYoutubeId = (url) => {
        if (!url) return null;
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
      };

      // Преобразуем треки из БД в формат для TrackCard
      const formattedTracks = (tracksData || []).map(track => {
        const youtubeId = extractYoutubeId(track.link);
        return {
          id: track.id,
          slug: track.slug,
          title: track.title,
          link: track.link,
          cover_key: track.cover_key,
          play_icon: track.play_icon || null,
          preview_start_seconds: track.preview_start_seconds || 0,
          source: track.source || "youtube",
          variant: "video",
          coverUrl: null,
          artistSlug: artist?.slug,
          artistName: artist?.display_name || artist?.name,
          youtubeId: youtubeId,
          startSeconds: 0,
          createdAt: track.created_at,
        };
      });

      setTracks(formattedTracks);
    } catch (e) {
      console.error("Error loading tracks:", e);
      setTracks([]);
    }
  };

  // Функция для обновления данных артиста и треков
  const refreshArtist = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session?.user) return;

      const a = await getArtistForUser(session.user);
      if (a) {
        setArtist(a);
        await loadTracks(a.id);
      }
    } catch (e) {
      console.error("Error refreshing artist:", e);
    }
  };

  useEffect(() => {
    let alive = true;
    let redirected = false;

    const run = async () => {
      setLoading(true);
      setFatal("");

      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (!alive || redirected) return;

        if (!session) {
          localStorage.setItem("toqibox:returnTo", "/author");
          navigate("/login", { replace: true });
          return;
        }

        const user = session.user;
        const a = await getArtistForUser(user);

        if (!alive || redirected) return;

        // Если артиста нет - показываем заглушку
        if (!a) {
          setArtist(null);
          setLoading(false);
          return;
        }

        // Если артист есть - показываем страницу редактирования (не редиректим)
        // Редактирование происходит прямо на /author
        if (!alive || redirected) return;
        setArtist(a);
        await loadTracks(a.id);
        setLoading(false);
      } catch (e) {
        if (!alive || redirected) return;
        setFatal(e?.message || "Ошибка загрузки кабинета");
        setLoading(false);
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const onCreate = async () => {
    setSaving(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) {
        setSaving(false);
        return;
      }

      const user = session.user;
      const created = await createArtistForUser(user);

      // Редиректим на публичную страницу артиста
      navigate(`/a/${created.slug}`, { replace: true });
    } catch (e) {
      console.error("Ошибка создания артиста:", e);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="author-shell">
        <PremiumLoader fullScreen message="connecting" />
      </div>
    );
  }

  if (fatal) {
    return (
      <div className="author-shell">
        <div className="author-fatal">
          <div className="author-fatal__title">Не удалось открыть кабинет</div>
          <div className="author-fatal__text">{fatal}</div>
          <button
            className="author-fatal__btn"
            onClick={() => {
              localStorage.setItem("toqibox:returnTo", "/author");
              navigate("/login", { replace: true });
            }}
            type="button"
          >
            Войти заново
          </button>
        </div>
      </div>
    );
  }

  // Если артиста нет - показываем заглушку с кнопкой создания
  if (!artist) {
    return (
      <div className="author-shell">
        <div style={{ 
          minHeight: "100vh", 
          display: "grid", 
          placeItems: "center", 
          padding: 20,
          textAlign: "center"
        }}>
          <div style={{ maxWidth: 500 }}>
            <h1 style={{ 
              fontSize: "clamp(32px, 5vw, 48px)", 
              fontWeight: 800, 
              marginBottom: 20,
              letterSpacing: "0.05em"
            }}>
              Создай страницу артиста
            </h1>
            <p style={{ 
              fontSize: 16, 
              opacity: 0.7, 
              marginBottom: 40,
              lineHeight: 1.6
            }}>
              У тебя ещё нет страницы артиста. Создай её, чтобы начать добавлять треки и делиться своей музыкой.
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center" }}>
              <button
                type="button"
                onClick={onCreate}
                disabled={saving}
                style={{
                  padding: "14px 28px",
                  borderRadius: 999,
                  border: "1px solid rgba(0,0,0,0.16)",
                  background: "#0b0b0b",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  letterSpacing: "0.05em",
                  cursor: saving ? "default" : "pointer",
                  opacity: saving ? 0.7 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {saving ? "Создаю..." : "Создать страницу артиста"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EDIT PAGE (CANON) - если артист есть
  return (
    <div className="a-page is-edit">
      <ArtistHeader artistSlug={artist.slug} artist={artist} isOwner={true} onUpdate={refreshArtist} />

      {showAddTrack && (
        <AddTrackSection 
          artist={artist} 
          isOwner={true}
          onTrackAdded={() => {
            refreshArtist();
            setShowAddTrack(false);
          }}
          onCancel={() => setShowAddTrack(false)}
        />
      )}

      <div className="a-content">
        <ArtistTracks
          artistSlug={artist.slug}
          artist={artist}
          isOwner={true}
          onShare={() => setShareOpen(true)}
          onUpdate={refreshArtist}
          tracks={tracks}
          onAddTrack={() => setShowAddTrack(true)}
        />
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title="TOQIBOX"
      />
    </div>
  );
}
