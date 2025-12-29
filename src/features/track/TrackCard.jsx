import React from "react";
import { Link } from "react-router-dom";

export default function TrackCard({ track }) {
  return (
    <Link className="tc-link ui-card tc-card" to={`/t/${track.slug}`}>
      <div
        className="tc-cover"
        style={{ backgroundImage: `url(${track.coverUrl})` }}
        aria-hidden="true"
      />

      <div className="tc-right">
        <div className="tc-titleRow">
          <div className="tc-title">{track.title}</div>
          <div className="tc-chip">{String(track.source || "").toUpperCase()}</div>
        </div>

        <div className="tc-artist">{track.artistName}</div>
      </div>
    </Link>
  );
}
