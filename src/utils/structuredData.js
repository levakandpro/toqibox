/**
 * Structured Data (JSON-LD) для SEO
 * Используется для улучшения индексации поисковыми системами
 */

const SITE_URL = "https://toqibox.win";

/**
 * Создает JSON-LD разметку для страницы артиста
 * @param {Object} params
 * @param {string} params.artistName - Имя артиста
 * @param {string} params.slug - Slug артиста
 * @param {string|null} params.coverKey - Ключ обложки в R2
 * @param {number} params.tracksCount - Количество треков
 * @param {Array} params.tracks - Массив треков
 */
export function createArtistStructuredData({ artistName, slug, coverKey = null, tracksCount = 0, tracks = [] }) {
  const url = `${SITE_URL}/a/${slug}`;
  const image = coverKey ? `https://cdn.toqibox.win/${coverKey}` : `${SITE_URL}/web-app-manifest-512x512.png`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": artistName,
    "url": url,
    "image": image,
    "sameAs": [], // Можно добавить ссылки на соцсети
  };

  // Добавляем треки как MusicRecording
  if (tracks && tracks.length > 0) {
    structuredData.track = tracks.slice(0, 10).map(track => ({
      "@type": "MusicRecording",
      "name": track.title,
      "url": `${SITE_URL}/t/${track.slug}`,
      "image": track.cover_key ? `https://cdn.toqibox.win/${track.cover_key}` : image,
    }));
  }

  return structuredData;
}

/**
 * Устанавливает JSON-LD разметку в head документа
 * @param {Object} structuredData - JSON-LD объект
 */
export function setStructuredData(structuredData) {
  // Удаляем существующий JSON-LD
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }

  // Создаем новый script с JSON-LD
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData, null, 2);
  document.head.appendChild(script);
}

/**
 * Очищает JSON-LD разметку
 */
export function clearStructuredData() {
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }
}
