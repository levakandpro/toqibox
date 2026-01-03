import coverDefault from "../../assets/cover.png";

import { getMockTrackBySlug } from "../track/track.mock.js";

const ARTISTS = {
  "toqibox-artist": {
    slug: "toqibox-artist",
    name: "TOQIBOX ARTIST",
    bio: "Короткое описание артиста - V один, мок.",
    coverUrl: coverDefault,

    // premium-флаг для будущего gold/вериф
    isPremium: true,

    socials: [
      { label: "YouTube", url: "https://youtube.com" },
      { label: "TikTok", url: "https://tiktok.com" },
      { label: "Instagram", url: "https://instagram.com" },
    ],
    tracks: ["test", "tiktok", "insta"].map(getMockTrackBySlug),
  },
};

export function getMockArtistBySlug(slug) {
  if (ARTISTS[slug]) return ARTISTS[slug];
  return {
    ...ARTISTS["toqibox-artist"],
    slug,
    name: slug.replace(/[-_]/g, " ").toUpperCase(),
  };
}
