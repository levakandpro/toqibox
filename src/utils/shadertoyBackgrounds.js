/**
 * Утилита для работы с ShaderToy фонами
 */

// ShaderToy эффекты (используем ТОЛЬКО эти ссылки)
export const SHADERTOY_BACKGROUNDS = [
  {
    id: "tlVGDt",
    name: "Background 1",
    url: "https://www.shadertoy.com/view/tlVGDt",
    shaderId: "tlVGDt",
  },
  {
    id: "3l23Rh",
    name: "Background 2",
    url: "https://www.shadertoy.com/view/3l23Rh",
    shaderId: "3l23Rh",
  },
  {
    id: "XlfGRj",
    name: "Background 3",
    url: "https://www.shadertoy.com/view/XlfGRj",
    shaderId: "XlfGRj",
  },
  {
    id: "MdX3zr",
    name: "Background 4",
    url: "https://www.shadertoy.com/view/MdX3zr",
    shaderId: "MdX3zr",
  },
  {
    id: "mtyGWy",
    name: "Background 5",
    url: "https://www.shadertoy.com/view/mtyGWy",
    shaderId: "mtyGWy",
  },
  {
    id: "3sySRK",
    name: "Background 6",
    url: "https://www.shadertoy.com/view/3sySRK",
    shaderId: "3sySRK",
  },
  {
    id: "3ftcW4",
    name: "Background 7",
    url: "https://www.shadertoy.com/view/3ftcW4",
    shaderId: "3ftcW4",
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
  return `https://www.shadertoy.com/embed/${shaderId}?gui=false&t=10&p=7&c=`;
}

