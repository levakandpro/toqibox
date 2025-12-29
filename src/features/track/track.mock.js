import coverFallback from "../../assets/cover-placeholder.png";

// V1 mock: список "созданных страниц треков".
// Новые должны быть сверху - для этого createdAt обязателен.
const TRACKS = [
  {
    slug: "test",
    title: "TEST TRACK",
    artistSlug: "toqibox-artist",
    artistName: "TOQIBOX ARTIST",
    source: "youtube",
    variant: "video",
    coverUrl: "",
    createdAt: "2025-12-28T10:20:00Z",

    // YouTube full video ID (not shorts)
    youtubeId: "dQw4w9WgXcQ",
    startSeconds: 0,

    description: "Официальная страница трека - V один, мок-данные."
  },

  // Пример второго трека - можешь переименовать как хочешь
  {
    slug: "test-2",
    title: "SECOND TRACK",
    artistSlug: "toqibox-artist",
    artistName: "TOQIBOX ARTIST",
    source: "youtube",
    variant: "shorts",
    coverUrl: "",
    createdAt: "2025-12-28T12:30:00Z",

    youtubeId: "dQw4w9WgXcQ",
    startSeconds: 15,

    description: ""
  }
];

function withCoverFallback(t) {
  return {
    ...t,
    coverUrl: t.coverUrl && t.coverUrl.length > 0 ? t.coverUrl : coverFallback
  };
}

export function getMockTrackBySlug(slug) {
  const found = TRACKS.find((x) => x.slug === slug);
  return withCoverFallback(found || TRACKS[0]);
}

export function getMockTracksByArtistSlug(artistSlug) {
  return TRACKS
    .filter((t) => t.artistSlug === artistSlug)
    .map(withCoverFallback)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
