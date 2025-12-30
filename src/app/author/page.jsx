// FILE: src/app/author/page.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArtistHeader from "../../features/artist/ArtistHeader.jsx";
import ArtistTracks from "../../features/artist/ArtistTracks.jsx";
import ShareSheet from "../../features/share/ShareSheet.jsx";
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

  // edit fields (local state)
  const [displayName, setDisplayName] = useState("");
  const [socInstagram, setSocInstagram] = useState("");
  const [socTiktok, setSocTiktok] = useState("");
  const [socYoutube, setSocYoutube] = useState("");
  const [headerYoutubeUrl, setHeaderYoutubeUrl] = useState("");
  const [headerStartSec, setHeaderStartSec] = useState("0");

  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState("");

  const shareUrl = useMemo(() => {
    if (!artist?.slug) return "";
    return `${window.location.origin}/a/${artist.slug}`;
  }, [artist?.slug]);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);
      setFatal("");

      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (!alive) return;

        if (!session) {
          localStorage.setItem("toqibox:returnTo", "/author");
          navigate("/login", { replace: true });
          return;
        }

        const user = session.user;
        const a = await getArtistForUser(user);

        if (!alive) return;

        // Если артиста нет - показываем заглушку
        if (!a) {
          setArtist(null);
          setLoading(false);
          return;
        }

        // Если артист есть - редиректим на его публичную страницу
        navigate(`/a/${a.slug}`, { replace: true });
      } catch (e) {
        if (!alive) return;
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
    setSaveNote("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) {
        setSaveNote("Нет сессии");
        setSaving(false);
        return;
      }

      const user = session.user;
      const created = await createArtistForUser(user);

      // Редиректим на публичную страницу артиста
      navigate(`/a/${created.slug}`, { replace: true });
    } catch (e) {
      setSaveNote(e?.message || "Ошибка создания");
      setSaving(false);
      setTimeout(() => setSaveNote(""), 2500);
    }
  };

  const onSave = async () => {
    if (!artist?.id) return;

    setSaving(true);
    setSaveNote("");

    try {
      const patch = {
        display_name: String(displayName || "").trim(),
        soc_instagram: String(socInstagram || "").trim(),
        soc_tiktok: String(socTiktok || "").trim(),
        soc_youtube: String(socYoutube || "").trim(),
        header_youtube_url: String(headerYoutubeUrl || "").trim(),
        header_start_sec: Number.isFinite(Number(headerStartSec)) ? Number(headerStartSec) : 0,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error } = await supabase
        .from("artists")
        .update(patch)
        .eq("id", artist.id)
        .select("*")
        .single();

      if (error) throw error;

      setArtist(updated);
      setSaveNote("Сохранено");
    } catch (e) {
      setSaveNote(e?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveNote(""), 2500);
    }
  };

  if (loading) {
    return (
      <div className="author-shell">
        <div className="author-loading">Открываю кабинет артиста...</div>
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
              {saveNote ? (
                <div style={{ fontSize: 14, opacity: 0.75, color: saveNote.includes("Ошибка") ? "#d00" : "#0a0" }}>
                  {saveNote}
                </div>
              ) : null}
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
      {/* ЯВНАЯ ПАНЕЛЬ РЕДАКТИРОВАНИЯ (чтобы ты наконец увидел "это оно") */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: 12,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 900, letterSpacing: 1 }}>
            РЕДАКТИРОВАНИЕ - /author
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {saveNote ? <div style={{ fontSize: 12, opacity: 0.75 }}>{saveNote}</div> : null}

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.16)",
                background: "#0b0b0b",
                color: "#fff",
                fontWeight: 800,
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Сохраняю..." : "Сохранить"}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="display_name"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.12)",
              outline: "none",
              fontSize: 14,
              background: "rgba(255,255,255,0.9)",
            }}
          />

          <div style={{ display: "grid", gap: 8 }}>
            <input
              value={socInstagram}
              onChange={(e) => setSocInstagram(e.target.value)}
              placeholder="soc_instagram"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.12)",
                outline: "none",
                fontSize: 14,
                background: "rgba(255,255,255,0.9)",
              }}
            />
            <input
              value={socTiktok}
              onChange={(e) => setSocTiktok(e.target.value)}
              placeholder="soc_tiktok"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.12)",
                outline: "none",
                fontSize: 14,
                background: "rgba(255,255,255,0.9)",
              }}
            />
            <input
              value={socYoutube}
              onChange={(e) => setSocYoutube(e.target.value)}
              placeholder="soc_youtube"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.12)",
                outline: "none",
                fontSize: 14,
                background: "rgba(255,255,255,0.9)",
              }}
            />
          </div>

          <input
            value={headerYoutubeUrl}
            onChange={(e) => setHeaderYoutubeUrl(e.target.value)}
            placeholder="header_youtube_url"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.12)",
              outline: "none",
              fontSize: 14,
              background: "rgba(255,255,255,0.9)",
            }}
          />

          <input
            value={headerStartSec}
            onChange={(e) => setHeaderStartSec(e.target.value)}
            placeholder="header_start_sec"
            inputMode="numeric"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.12)",
              outline: "none",
              fontSize: 14,
              background: "rgba(255,255,255,0.9)",
            }}
          />
        </div>
      </div>

      {/* ниже остаётся твой текущий UI как есть */}
      <ArtistHeader artistSlug={artist.slug} artist={artist} />

      <div className="a-content">
        <ArtistTracks
          artistSlug={artist.slug}
          artist={artist}
          onShare={() => setShareOpen(true)}
          editMode={true}
          editTab={"tracks"}
          editAction={""}
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
