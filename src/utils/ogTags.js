/**
 * Утилита для управления Open Graph и Twitter Card meta тегами
 * Профессиональная реализация для социальных сетей
 */

const SITE_NAME = "TOQIBOX";
const SITE_URL = "https://toqibox.win";
const DEFAULT_IMAGE = `${SITE_URL}/web-app-manifest-512x512.png`;
const R2_PUBLIC_BASE = "https://cdn.toqibox.win";

/**
 * Получает URL изображения для OG
 * @param {string|null} coverKey - Ключ обложки в R2
 * @returns {string} URL изображения
 */
function getOgImage(coverKey) {
  if (coverKey) {
    return `${R2_PUBLIC_BASE}/${coverKey}`;
  }
  return DEFAULT_IMAGE;
}

/**
 * Устанавливает или обновляет meta тег
 * @param {string} property - Свойство (og:title, twitter:card и т.д.)
 * @param {string} content - Содержимое тега
 * @param {string} tagType - Тип тега: 'property' или 'name'
 */
function setMetaTag(property, content, tagType = 'property') {
  if (!content) return;

  // Удаляем существующий тег
  const existing = document.querySelector(`meta[${tagType}="${property}"]`);
  if (existing) {
    existing.remove();
  }

  // Создаем новый тег
  const meta = document.createElement('meta');
  meta.setAttribute(tagType, property);
  meta.setAttribute('content', content);
  document.head.appendChild(meta);
}

/**
 * Устанавливает Open Graph теги для страницы артиста
 * @param {Object} params - Параметры
 * @param {string} params.artistName - Имя артиста
 * @param {string} params.slug - Slug артиста
 * @param {string|null} params.coverKey - Ключ обложки в R2
 * @param {number} params.tracksCount - Количество треков
 */
export function setArtistOgTags({ artistName, slug, coverKey = null, tracksCount = 0 }) {
  const url = `${SITE_URL}/a/${slug}`;
  const title = `${artistName} | ${SITE_NAME}`;
  const description = tracksCount > 0 
    ? `${artistName} на ${SITE_NAME}. ${tracksCount} ${tracksCount === 1 ? 'трек' : tracksCount < 5 ? 'трека' : 'треков'}.`
    : `${artistName} на ${SITE_NAME}. Официальная страница артиста.`;
  const image = getOgImage(coverKey);

  // Open Graph теги
  setMetaTag('og:type', 'profile');
  setMetaTag('og:title', title);
  setMetaTag('og:description', description);
  setMetaTag('og:image', image);
  setMetaTag('og:image:width', '1200');
  setMetaTag('og:image:height', '630');
  setMetaTag('og:image:type', 'image/png');
  setMetaTag('og:url', url);
  setMetaTag('og:site_name', SITE_NAME);
  setMetaTag('og:locale', 'ru_RU');

  // Twitter Card теги
  setMetaTag('twitter:card', 'summary_large_image', 'name');
  setMetaTag('twitter:title', title, 'name');
  setMetaTag('twitter:description', description, 'name');
  setMetaTag('twitter:image', image, 'name');
  setMetaTag('twitter:site', '@toqibox', 'name');

  // Стандартные meta теги
  setMetaTag('title', title, 'name');
  setMetaTag('description', description, 'name');
  
  // Canonical URL для SEO
  setCanonicalUrl(url);
}

/**
 * Устанавливает canonical URL
 * @param {string} url - Canonical URL
 */
function setCanonicalUrl(url) {
  if (!url) return;
  
  // Удаляем существующий canonical
  const existing = document.querySelector('link[rel="canonical"]');
  if (existing) {
    existing.remove();
  }
  
  // Создаем новый canonical link
  const link = document.createElement('link');
  link.rel = 'canonical';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Устанавливает Open Graph теги для страницы трека
 * @param {Object} params - Параметры
 * @param {string} params.trackTitle - Название трека
 * @param {string} params.artistName - Имя артиста
 * @param {string} params.slug - Slug трека
 * @param {string|null} params.coverKey - Ключ обложки в R2
 * @param {string} params.source - Источник (youtube, tiktok, instagram)
 * @param {string|null} [params.artistSlug] - Slug артиста (опционально)
 */
export function setTrackOgTags({ trackTitle, artistName, slug, coverKey = null, source = 'youtube', artistSlug = null }) {
  const url = `${SITE_URL}/t/${slug}`;
  const title = `${trackTitle} - ${artistName} | ${SITE_NAME}`;
  const description = `Слушай "${trackTitle}" от ${artistName} на ${SITE_NAME}. Официальная страница трека.`;
  const image = getOgImage(coverKey);

  // Open Graph теги
  setMetaTag('og:type', 'music.song');
  setMetaTag('og:title', title);
  setMetaTag('og:description', description);
  setMetaTag('og:image', image);
  setMetaTag('og:image:width', '1200');
  setMetaTag('og:image:height', '630');
  setMetaTag('og:image:type', 'image/png');
  setMetaTag('og:url', url);
  setMetaTag('og:site_name', SITE_NAME);
  setMetaTag('og:locale', 'ru_RU');

  // Music-specific OG теги (если есть artistSlug)
  if (artistSlug) {
    setMetaTag('music:musician', `${SITE_URL}/a/${artistSlug}`, 'property');
  }

  // Twitter Card теги
  setMetaTag('twitter:card', 'summary_large_image', 'name');
  setMetaTag('twitter:title', title, 'name');
  setMetaTag('twitter:description', description, 'name');
  setMetaTag('twitter:image', image, 'name');
  setMetaTag('twitter:site', '@toqibox', 'name');

  // Стандартные meta теги
  setMetaTag('title', title, 'name');
  setMetaTag('description', description, 'name');
  
  // Canonical URL для SEO
  setCanonicalUrl(url);
}

/**
 * Очищает все OG теги (для возврата к дефолтным)
 */
export function clearOgTags() {
  const ogTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], meta[property^="music:"]');
  ogTags.forEach(tag => tag.remove());
}

