/**
 * Утилита для работы с фонами шапки страницы автора
 * ОТДЕЛЬНЫЙ список фонов, НЕ из треков!
 */

// Фоны для шапки страницы автора
export const ARTIST_HEADER_BACKGROUNDS = [
  {
    id: "custom-shader-1",
    name: "Custom Shader 1",
    type: "shadertoy",
    shaderId: "custom-shader-1",
    premium: false, // Первый - бесплатный
  },
  {
    id: "hexagon-x5",
    name: "Hexagon X5",
    type: "shadertoy",
    shaderId: "hexagon-x5",
    premium: false, // Второй - бесплатный
  },
  {
    id: "traced-tunnel",
    name: "Traced Tunnel",
    type: "shadertoy",
    shaderId: "traced-tunnel",
    premium: false, // Третий - бесплатный
  },
  {
    id: "spin-effect",
    name: "Spin Effect",
    type: "shadertoy",
    shaderId: "spin-effect",
    premium: true,
  },
  {
    id: "fxaa-effect",
    name: "FXAA Effect",
    type: "shadertoy",
    shaderId: "fxaa-effect",
    premium: true,
  },
  {
    id: "digital-clock",
    name: "Digital Clock",
    type: "shadertoy",
    shaderId: "digital-clock",
    premium: true,
  },
  {
    id: "galaxy-trip",
    name: "Galaxy Trip",
    type: "shadertoy",
    shaderId: "galaxy-trip",
    premium: true,
  },
  {
    id: "ice-and-fire",
    name: "Ice and Fire",
    type: "shadertoy",
    shaderId: "ice-and-fire",
    premium: true,
  },
  {
    id: "particle-field",
    name: "Particle Field",
    type: "shadertoy",
    shaderId: "particle-field",
    premium: true,
  },
  {
    id: "rotating-particles",
    name: "Rotating Particles",
    type: "shadertoy",
    shaderId: "rotating-particles",
    premium: true,
  },
  {
    id: "wave-particles",
    name: "Wave Particles",
    type: "shadertoy",
    shaderId: "wave-particles",
    premium: true,
  },
  {
    id: "flower-matrix",
    name: "Flower Matrix",
    type: "shadertoy",
    shaderId: "flower-matrix",
    premium: true,
  },
  {
    id: "photon-torpedo",
    name: "Photon Torpedo",
    type: "shadertoy",
    shaderId: "photon-torpedo",
    premium: true,
  },
  {
    id: "explosive",
    name: "Explosive",
    type: "shadertoy",
    shaderId: "explosive",
    premium: true,
  },
  {
    id: "blobs",
    name: "Blobs",
    type: "shadertoy",
    shaderId: "blobs",
    premium: true,
  },
  {
    id: "spiral-waves",
    name: "Spiral Waves",
    type: "shadertoy",
    shaderId: "spiral-waves",
    premium: true,
  },
  {
    id: "sinus",
    name: "SINUS",
    type: "shadertoy",
    shaderId: "sinus",
    premium: true,
  },
  {
    id: "lame-tunnel",
    name: "Lame Tunnel",
    type: "shadertoy",
    shaderId: "lame-tunnel",
    premium: true,
  },
  {
    id: "wave-lines",
    name: "Wave Lines",
    type: "shadertoy",
    shaderId: "wave-lines",
    premium: true,
  },
  {
    id: "raster-lines",
    name: "Raster Lines",
    type: "shadertoy",
    shaderId: "raster-lines",
    premium: true,
  },
  {
    id: "rotating-rings",
    name: "Rotating Rings",
    type: "shadertoy",
    shaderId: "rotating-rings",
    premium: true,
  },
  {
    id: "wave-distortion",
    name: "Wave Distortion",
    type: "shadertoy",
    shaderId: "wave-distortion",
    premium: true,
  },
  {
    id: "particle-explosions",
    name: "Particle Explosions",
    type: "shadertoy",
    shaderId: "particle-explosions",
    premium: true,
  },
  {
    id: "particle-explosions-2",
    name: "Particle Explosions 2",
    type: "shadertoy",
    shaderId: "particle-explosions-2",
    premium: true,
  },
  {
    id: "burisaba-circle",
    name: "Burisaba Circle",
    type: "shadertoy",
    shaderId: "burisaba-circle",
    premium: true,
  },
  {
    id: "butitoba-circle",
    name: "Butitoba Circle",
    type: "shadertoy",
    shaderId: "butitoba-circle",
    premium: true,
  },
  {
    id: "butitoba-circle-2",
    name: "Butitoba Circle 2",
    type: "shadertoy",
    shaderId: "butitoba-circle-2",
    premium: true,
  },
  {
    id: "fractal-distortion",
    name: "Fractal Distortion",
    type: "shadertoy",
    shaderId: "fractal-distortion",
    premium: true, // 4-й и далее - премиум
  },
];

/**
 * Получает фон по ID
 * @param {string|null|undefined} backgroundId - ID фона
 * @returns {Object|null} Объект фона или null
 */
export function getArtistHeaderBackgroundById(backgroundId) {
  if (!backgroundId) return null;
  return ARTIST_HEADER_BACKGROUNDS.find(bg => bg.id === backgroundId) || null;
}

