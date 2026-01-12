/**
 * Утилита для работы с иконками плеера
 */

import play1 from "../assets/play/play (1).svg";
import play2 from "../assets/play/play (2).svg";
import play3 from "../assets/play/play (3).svg";
import play4 from "../assets/play/play (4).svg";
import play5 from "../assets/play/play (5).svg";
import play6 from "../assets/play/play (6).svg";
import play7 from "../assets/play/play (7).svg";
import play8 from "../assets/play/play (8).svg";
import play9 from "../assets/play/play (9).svg";
import play10 from "../assets/play/play (10).svg";
import play11 from "../assets/play/play (11).svg";
import premiumplay1 from "../assets/play/premium/premiumplay (1).svg";
import premiumplay2 from "../assets/play/premium/premiumplay (2).svg";
import premiumplay3 from "../assets/play/premium/premiumplay (3).svg";
import premiumplay4 from "../assets/play/premium/premiumplay (4).svg";
import premiumplay5 from "../assets/play/premium/premiumplay (5).svg";
import premiumplay6 from "../assets/play/premium/premiumplay (6).svg";
import premiumplay7 from "../assets/play/premium/premiumplay (7).svg";
import premiumplay8 from "../assets/play/premium/premiumplay (8).svg";
import premiumplay9 from "../assets/play/premium/premiumplay (9).svg";
import premiumplay10 from "../assets/play/premium/premiumplay (10).svg";
import tubeteika from "../assets/tubeteika.svg";

// Дефолтная иконка (tubeteika)
export const DEFAULT_PLAY_ICON = "default";

// Все доступные иконки
// Первые 3 бесплатно, остальные премиум
export const PLAY_ICONS = [
  { id: "default", name: "По умолчанию", icon: tubeteika, premium: false }, // Первый - бесплатный
  { id: "play1", name: "Play 1", icon: play1, premium: false }, // Второй - бесплатный
  { id: "play2", name: "Play 2", icon: play2, premium: false }, // Третий - бесплатный
  { id: "play3", name: "Play 3", icon: play3, premium: true }, // Премиум
  { id: "play4", name: "Play 4", icon: play4, premium: true }, // Премиум
  { id: "play5", name: "Play 5", icon: play5, premium: true }, // Премиум
  { id: "play6", name: "Play 6", icon: play6, premium: true }, // Премиум
  { id: "play7", name: "Play 7", icon: play7, premium: true }, // Премиум
  { id: "play8", name: "Play 8", icon: play8, premium: true }, // Премиум
  { id: "play9", name: "Play 9", icon: play9, premium: true }, // Премиум
  { id: "play10", name: "Play 10", icon: play10, premium: true }, // Премиум
  { id: "play11", name: "Play 11", icon: play11, premium: true }, // Премиум
  { id: "premiumplay1", name: "Premium Play 1", icon: premiumplay1, premium: true },
  { id: "premiumplay2", name: "Premium Play 2", icon: premiumplay2, premium: true },
  { id: "premiumplay3", name: "Premium Play 3", icon: premiumplay3, premium: true },
  { id: "premiumplay4", name: "Premium Play 4", icon: premiumplay4, premium: true },
  { id: "premiumplay5", name: "Premium Play 5", icon: premiumplay5, premium: true },
  { id: "premiumplay6", name: "Premium Play 6", icon: premiumplay6, premium: true },
  { id: "premiumplay7", name: "Premium Play 7", icon: premiumplay7, premium: true },
  { id: "premiumplay8", name: "Premium Play 8", icon: premiumplay8, premium: true },
  { id: "premiumplay9", name: "Premium Play 9", icon: premiumplay9, premium: true },
  { id: "premiumplay10", name: "Premium Play 10", icon: premiumplay10, premium: true },
];

/**
 * Получает иконку по ID
 * @param {string|null|undefined} iconId - ID иконки
 * @returns {string} URL иконки
 */
export function getPlayIcon(iconId) {
  if (!iconId || iconId === "default") {
    return tubeteika;
  }
  
  const icon = PLAY_ICONS.find(i => i.id === iconId);
  return icon ? icon.icon : tubeteika;
}

/**
 * Получает объект иконки по ID
 * @param {string|null|undefined} iconId - ID иконки
 * @returns {Object} Объект иконки
 */
export function getPlayIconObject(iconId) {
  if (!iconId || iconId === "default") {
    return PLAY_ICONS[0];
  }
  
  return PLAY_ICONS.find(i => i.id === iconId) || PLAY_ICONS[0];
}

