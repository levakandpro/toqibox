import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import TrackPlayer from "../../../features/track/TrackPlayer.jsx";
import TubeteikaReaction from "../../../features/reaction/TubeteikaReaction.jsx";
import ShareSheet from "../../../features/share/ShareSheet.jsx";
import { getMockTrackBySlug } from "../../../features/track/track.mock.js";
import { getMockArtistBySlug } from "../../../features/artist/artist.mock.js";

import { supabase } from "../../../features/auth/supabaseClient.js";

import verifGold from "../../../assets/verifgold.svg";
import shareIcon from "../../../assets/share.svg";

export default function TrackPage() {
  const navigate = useNavigate();

  const { slug = "test" } = useParams();
  const track = useMemo(() => getMockTrackBySlug(slug), [slug]);

  const [shareOpen, setShareOpen] = useState(false);

  const artist = useMemo(
    () => getMockArtistBySlug(track.artistSlug),
    [track.artistSlug]
  );
  const isPremium = !!artist?.isPremium;

  const shareUrl = useMemo(() => {
    return `${window.location.origin}/t/${slug}`;
  }, [slug]);

  const handleShare = () => {
    setShareOpen(true);
  };

  const sourceLabel = useMemo(() => {
    const source = String(track.source || "").toLowerCase();
    const variant = String(track.variant || "").toLowerCase();

    if (source === "youtube") return "Shorts";
    if (source === "instagram") return "Reels";
    if (source === "tiktok") return "Tik Tok";

    return (track.source || "").toUpperCase();
  }, [track.source, track.variant]);

  const sourceType = useMemo(() => {
    const source = String(track.source || "").toLowerCase();

    if (source === "youtube") return "shorts";
    if (source === "instagram") return "reels";
    if (source === "tiktok") return "tiktok";

    return null;
  }, [track.source]);

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

  return (
    <div className="t-page">
      <div
        className="t-cover"
        style={{ backgroundImage: `url(${track.coverUrl})` }}
        aria-hidden="true"
      />
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

      <main className="t-center">
        <TrackPlayer track={track} />
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
