import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import TrackCard from "../track/TrackCard.jsx";
import { getMockTracksByArtistSlug } from "../track/track.mock.js";
import { getMockArtistBySlug } from "./artist.mock.js";

import shareIcon from "../../assets/share.svg";

import youtubeIcon from "../../assets/soc/youtube.svg";
import tiktokIcon from "../../assets/soc/tiktok.svg";
import instagramIcon from "../../assets/soc/instagram.svg";

export default function ArtistTracks({ artistSlug, onShare }) {
  const navigate = useNavigate();

  const artist = useMemo(() => getMockArtistBySlug(artistSlug), [artistSlug]);

  const tracks = useMemo(
    () => getMockTracksByArtistSlug(artistSlug),
    [artistSlug]
  );

  const socials = [
    {
      key: "youtube",
      href:
        artist?.youtubeUrl && artist.youtubeUrl.trim().length > 0
          ? artist.youtubeUrl
          : "https://youtube.com",
      icon: youtubeIcon,
      label: "YouTube",
    },
    {
      key: "tiktok",
      href:
        artist?.tiktokUrl && artist.tiktokUrl.trim().length > 0
          ? artist.tiktokUrl
          : "https://tiktok.com",
      icon: tiktokIcon,
      label: "TikTok",
    },
    {
      key: "instagram",
      href:
        artist?.instagramUrl && artist.instagramUrl.trim().length > 0
          ? artist.instagramUrl
          : "https://instagram.com",
      icon: instagramIcon,
      label: "Instagram",
    },
  ];

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    const first = tracks?.[0]?.slug;
    navigate(first ? `/t/${first}` : "/t/test");
  };

  return (
    <section className="at-root">
      <div className="at-head">
        <div className="at-title">
          Релизы

          <button
            type="button"
            className="at-share"
            onClick={onShare}
            aria-label="Поделиться"
          >
            <img src={shareIcon} alt="" aria-hidden="true" />
          </button>

          <div className="at-socials" aria-label="Соцсети артиста">
            {socials.map((s) => (
              <a
                key={s.key}
                className="at-social"
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
              >
                <img src={s.icon} alt="" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="at-back"
          onClick={handleBack}
          aria-label="Назад"
        >
          ← назад
        </button>
      </div>

      <div className="at-grid">
        {tracks.map((t) => (
          <TrackCard key={t.slug} track={t} />
        ))}
      </div>
    </section>
  );
}
