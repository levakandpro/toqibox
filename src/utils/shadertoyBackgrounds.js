/**
 * Утилита для работы с ShaderToy фонами
 */

// ShaderToy эффекты (используем ТОЛЬКО эти ссылки)
// ВАЖНО: Первый фон - дефолт для новых треков
export const SHADERTOY_BACKGROUNDS = [
  {
    id: "vanta-dots",
    name: "TubiPRO Dots",
    type: "vanta",
    effectType: "dots",
    url: null, // Vanta фон, не ShaderToy
    shaderId: null,
  },
  {
    id: "tlVGDt",
    name: "Тюбифон 1",
    url: "https://www.shadertoy.com/view/tlVGDt",
    shaderId: "tlVGDt",
  },
  {
    id: "3l23Rh",
    name: "Тюбифон 2",
    url: "https://www.shadertoy.com/view/3l23Rh",
    shaderId: "3l23Rh",
  },
  {
    id: "XlfGRj",
    name: "Тюбифон 3",
    url: "https://www.shadertoy.com/view/XlfGRj",
    shaderId: "XlfGRj",
  },
  {
    id: "MdX3zr",
    name: "Тюбифон 4",
    url: "https://www.shadertoy.com/view/MdX3zr",
    shaderId: "MdX3zr",
  },
  {
    id: "3sySRK",
    name: "Тюбифон 6",
    url: "https://www.shadertoy.com/view/3sySRK",
    shaderId: "3sySRK",
  },
];

/**
 * Получает фон по ID
 * @param {string|null|undefined} backgroundId - ID фона
 * @returns {Object|null} Объект фона или null
 */
export function getBackgroundById(backgroundId) {
  if (!backgroundId) return null;
  return SHADERTOY_BACKGROUNDS.find(bg => bg.id === backgroundId) || null;
}

/**
 * Получает URL для встраивания ShaderToy
 * @param {string} shaderId - ID шейдера
 * @returns {string} URL для iframe
 */
export function getShaderToyEmbedUrl(shaderId) {
  // Правильный формат URL для ShaderToy embed
  // Параметры: gui=false (без GUI)
  // Формат: https://www.shadertoy.com/embed/{shaderId}?gui=false
  return `https://www.shadertoy.com/embed/${shaderId}?gui=false`;
}

