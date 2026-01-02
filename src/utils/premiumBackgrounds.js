/**
 * Утилита для работы с премиум фонами
 */

// Премиум фоны
export const PREMIUM_BACKGROUNDS = [
  {
    id: "vanta-rings",
    name: "TubiPRO Rings",
    type: "vanta",
    effectType: "rings",
  },
  {
    id: "vanta-dots",
    name: "TubiPRO Dots",
    type: "vanta",
    effectType: "dots",
  },
  {
    id: "vanta-birds",
    name: "TubiPRO Birds",
    type: "vanta",
    effectType: "birds",
  },
  {
    id: "vanta-cells",
    name: "TubiPRO Cells",
    type: "vanta",
    effectType: "cells",
    color1: 0x268686, // Первый цвет (темно-бирюзовый)
    color2: 0x35f2b7, // Второй цвет (светло-бирюзовый)
  },
  {
    id: "vanta-net",
    name: "TubiPRO Net",
    type: "vanta",
    effectType: "net",
  },
  {
    id: "vanta-fog",
    name: "TubiPRO Fog",
    type: "vanta",
    effectType: "fog",
  },
  {
    id: "vanta-waves",
    name: "TubiPRO Waves",
    type: "vanta",
    effectType: "waves",
  },
  {
    id: "vanta-trunk",
    name: "TubiPRO Trunk",
    type: "vanta",
    effectType: "trunk",
    color: 0xea1255, // Розовый (по умолчанию)
  },
  {
    id: "3ftcW4",
    name: "TubiPRO",
    type: "shadertoy",
    shaderId: "3ftcW4",
    url: "https://www.shadertoy.com/view/3ftcW4",
  },
  {
    id: "mtyGWy",
    name: "TubiPRO",
    type: "shadertoy",
    shaderId: "mtyGWy",
    url: "https://www.shadertoy.com/view/mtyGWy",
  },
  {
    id: "bumpedWarp",
    name: "TubiPRO",
    type: "shadertoy",
    shaderId: "bumpedWarp",
    url: "https://www.shadertoy.com/view/MlSSDV",
  },
  {
    id: "quadTree2026",
    name: "TubiPRO",
    type: "shadertoy",
    shaderId: "quadTree2026",
    url: "https://www.shadertoy.com/view/",
  },
  {
    id: "octgrams",
    name: "TubiPRO",
    type: "shadertoy",
    shaderId: "octgrams",
    url: "https://www.shadertoy.com/view/",
  },
  {
    id: "universeWithin",
    name: "TubiPRO",
    type: "shadertoy",
    shaderId: "universeWithin",
    url: "https://www.shadertoy.com/view/",
  },
];

/**
 * Получает премиум фон по ID
 * @param {string|null|undefined} backgroundId - ID фона
 * @returns {Object|null} Объект фона или null
 */
export function getPremiumBackgroundById(backgroundId) {
  if (!backgroundId) return null;
  return PREMIUM_BACKGROUNDS.find(bg => bg.id === backgroundId) || null;
}

