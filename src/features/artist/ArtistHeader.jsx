import React, { useMemo } from "react";
import { getMockArtistBySlug } from "./artist.mock.js";

import artistCoverFallback from "../../assets/covers/artist-cover-placeholder.png";
import verifGold from "../../assets/verifgold.svg";

export default function ArtistHeader({ artistSlug }) {
  const artist = useMemo(() => getMockArtistBySlug(artistSlug), [artistSlug]);

  const coverUrl = artistCoverFallback;
  const isPremium = !!artist?.isPremium;

  return (
    <section className="ah-root">
      <div
        className="ah-cover"
        style={{ backgroundImage: `url(${coverUrl})` }}
        aria-hidden="true"
      />

      <div className="ah-overlay" aria-hidden="true" />

      {/* Имя артиста под обложкой */}
      <div className="ah-content">
        <div className="ah-name">
          {artist?.name || "ARTIST"}
          {isPremium && (
            <img
              src={verifGold}
              alt=""
              className="ah-verifGold"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </section>
  );
}
