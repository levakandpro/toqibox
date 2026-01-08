import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadCover } from "../../utils/r2Upload.js";
import { ARTIST_HEADER_BACKGROUNDS } from "../../utils/artistHeaderBackgrounds.js";
import { audioEngine } from "../../utils/audioEngine.js";
import ShaderToyPreview from "../../features/track/ShaderToyPreview.jsx";
import ShaderToyBackground from "../../features/track/ShaderToyBackground.jsx";
import VantaHeaderBackground from "../../features/artist/VantaHeaderBackground.jsx";
import srdImage from "../../assets/obl/srd.jpg";
import pulsImage from "../../assets/obl/puls.jpg";
import volniImage from "../../assets/obl/volni.jpg";
import zrnoImage from "../../assets/obl/zrno.jpg";
import focusImage from "../../assets/obl/focus.jpg";
import tqbwImage from "../../assets/obl/tqbw.jpg";
import glishImage from "../../assets/obl/glish.jpg";
import rbgImage from "../../assets/obl/rbg.jpg";
import tqmirrorImage from "../../assets/obl/tqmirror.jpg";
import pixelateImage from "../../assets/obl/TQ PIXELATE.jpg";

const STUDIO_CSS = [
  "/studio/css/base.css",
  "/studio/css/studio.css",
  "/studio/css/studio-desktop.css",
  "/studio/css/tv-error-modal.css",
];

// ===== ОПТИМИЗАЦИЯ: Throttled setState (вне компонента для производительности) =====
const throttleTimers = new Map();

function throttledSetState(setStateFn, refValue, throttleMs = 100, timerId = 'default') {
  const now = Date.now();
  const lastTime = throttleTimers.get(timerId) || 0;
  
  if (now - lastTime >= throttleMs) {
    setStateFn(refValue);
    throttleTimers.set(timerId, now);
  }
}

function ensureLink(href) {
  const existing = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
  if (existing && existing.sheet !== null) {
    // Если стиль уже загружен и применен, возвращаем сразу
    return Promise.resolve(existing);
  }
  
  // Если link существует но еще не загружен, ждем его загрузки
  if (existing) {
    return new Promise((resolve, reject) => {
      const checkLoaded = () => {
        if (existing.sheet !== null) {
          resolve(existing);
        }
      };
      
      // Проверяем сразу
      checkLoaded();
      
      // Если еще не загружен, ждем события
      if (existing.sheet === null) {
        existing.onload = () => resolve(existing);
        existing.onerror = () => reject(new Error(`Failed to load ${href}`));
        // Fallback: проверяем периодически
        const interval = setInterval(() => {
          if (existing.sheet !== null) {
            clearInterval(interval);
            resolve(existing);
          }
        }, 10);
        // Очищаем через 5 секунд
        setTimeout(() => {
          clearInterval(interval);
          if (existing.sheet === null) {
            reject(new Error(`Timeout loading ${href}`));
          }
        }, 5000);
      }
    });
  }
  
  // Создаем новый link
  return new Promise((resolve, reject) => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.studio = "1";
    
    let resolved = false;
    
    const checkLoaded = () => {
      if (resolved) return;
      // Проверяем что стиль загружен через sheet
      if (link.sheet !== null) {
        resolved = true;
        resolve(link);
      }
    };
    
    link.onload = () => {
      if (!resolved) {
        resolved = true;
        resolve(link);
      }
    };
    
    link.onerror = () => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`Failed to load ${href}`));
      }
    };
    
  // Вставляем стили синхронно перед первым рендером
  document.head.insertBefore(link, document.head.firstChild);
    
    // Если стиль уже загружен (из кеша), onload может не сработать
    // Проверяем сразу и через небольшую задержку
    checkLoaded();
    if (!resolved) {
      setTimeout(checkLoaded, 0);
    }
  });
}

// Вспомогательная функция для конвертации File в ArrayBuffer
function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Функция для извлечения waveform данных из аудио файла
async function extractWaveform(audioBuffer, samples = 150) {
  const rawData = audioBuffer.getChannelData(0); // Используем первый канал
  const blockSize = Math.floor(rawData.length / samples);
  const filteredData = [];
  
  for (let i = 0; i < samples; i++) {
    const blockStart = blockSize * i;
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(rawData[blockStart + j]);
    }
    filteredData.push(sum / blockSize);
  }
  
  // Нормализация
  const max = Math.max(...filteredData);
  if (max === 0) return filteredData;
  const multiplier = 1 / max;
  return filteredData.map(n => n * multiplier);
}

// Список доступных шрифтов (tq.ttf должен быть первым)
const AVAILABLE_FONTS = [
  { id: 'tq', name: 'TQ', file: 'tq.ttf' },
  { id: 'fyl', name: 'Fyl Regular', file: 'Fyl-Regular.ttf' },
  { id: 'system', name: 'System', file: null },
  // Добавлю остальные позже
];

const MAX_AUDIO_DURATION = 240; // 4 минуты

export default function StudioDesktop() {
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoKey, setPhotoKey] = useState(null);
  const [audioDuration, setAudioDuration] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveformData, setWaveformData] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activePanel, setActivePanel] = useState('templates'); // По умолчанию VISUALS
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [showPhotoRequiredModal, setShowPhotoRequiredModal] = useState(false);
  const [showAudioRequiredModal, setShowAudioRequiredModal] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [stylesLoaded, setStylesLoaded] = useState(false);
  
  // Состояния для социальных сетей
  const [socialEnabled, setSocialEnabled] = useState(false);
  const [socialUsername, setSocialUsername] = useState('@levakandtj');
  const [selectedSocialTemplate, setSelectedSocialTemplate] = useState(null);
  const [socialStartSec, setSocialStartSec] = useState(0); // секунда появления
  const [socialDurationSec, setSocialDurationSec] = useState(5); // сколько секунд показывать
  const [socialEndSec, setSocialEndSec] = useState(5); // секунда исчезновения
  
  // Состояния для перемещения и изменения размера социального overlay
  const [socialOverlayPosition, setSocialOverlayPosition] = useState({ x: 24, y: 24 }); // в пикселях от левого нижнего угла
  const [socialOverlaySize, setSocialOverlaySize] = useState({ scale: 1 }); // масштаб
  const [isSocialDragging, setIsSocialDragging] = useState(false);
  const [isSocialResizing, setIsSocialResizing] = useState(false);
  const [isSocialSelected, setIsSocialSelected] = useState(false); // выделен ли элемент
  const socialDragStartRef = useRef(null);
  const [showLogoMenu, setShowLogoMenu] = useState(false); // меню под логотипом в шапке
  const logoMenuTimeoutRef = useRef(null); // таймер для задержки закрытия меню
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const audioElementRef = useRef(audioEngine.audio); // DEPRECATED: Используем audioEngine
  const toolsPanelRef = useRef(null);
  const isPlayingRef = useRef(false); // Для синхронного доступа в requestAnimationFrame
  const waveAmplitudeRef = useRef(0); // ссылка на текущую амплитуду волны
  const canvasRef = useRef(null); // ссылка на канвас для импульсов
  const canvasVideoRef = useRef(null); // ссылка на видео на канвасе
  
  const clampToMaxAudio = (value) => Math.max(0, Math.min(Number(value) || 0, MAX_AUDIO_DURATION));
  const syncSocialTiming = (start, duration, end) => {
    let s = clampToMaxAudio(start);
    let d = clampToMaxAudio(duration);
    let e = clampToMaxAudio(end);
    if (e < s) e = s;
    if (d < 0) d = 0;
    // если end раньше чем start+duration — пододвигаем end
    if (e < s + d) e = Math.min(MAX_AUDIO_DURATION, s + d);
    return { s, d, e };
  };

  // Состояния для текста
  const [textArtistName, setTextArtistName] = useState('TQ Артист');
  const [textTrackName, setTextTrackName] = useState('Toqibox');
  const [textFont, setTextFont] = useState('tq'); // По умолчанию tq.ttf
  const [textFontSize, setTextFontSize] = useState(48);
  const [textAlignment, setTextAlignment] = useState('center'); // left, center, right
  const [textColor, setTextColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerHue, setColorPickerHue] = useState(0); // 0-360
  const [colorPickerSaturation, setColorPickerSaturation] = useState(100); // 0-100
  const [colorPickerLightness, setColorPickerLightness] = useState(50); // 0-100
  const colorPickerRef = useRef(null);
  const [textReadability, setTextReadability] = useState(1); // 0-1
  const [textOutline, setTextOutline] = useState(false);
  const [textOutlineColor, setTextOutlineColor] = useState('#000000');
  const [showOutlineColorPicker, setShowOutlineColorPicker] = useState(false);
  const [outlinePickerHue, setOutlinePickerHue] = useState(0);
  const [outlinePickerSat, setOutlinePickerSat] = useState(0);
  const [outlinePickerLight, setOutlinePickerLight] = useState(0);
  const [textShadow, setTextShadow] = useState(false);
  const [textShadowColor, setTextShadowColor] = useState('#000000');
  const [showShadowColorPicker, setShowShadowColorPicker] = useState(false);
  const [shadowPickerHue, setShadowPickerHue] = useState(0);
  const [shadowPickerSat, setShadowPickerSat] = useState(0);
  const [shadowPickerLight, setShadowPickerLight] = useState(0);
  const [textBackground, setTextBackground] = useState(false);
  const [textLetterSpacing, setTextLetterSpacing] = useState('normal'); // tight, normal, wide
  const [textLetterSpacingValue, setTextLetterSpacingValue] = useState(0); // -0.1 to 0.2 em
  const [textLineHeight, setTextLineHeight] = useState('normal'); // compact, normal
  const [textLineHeightValue, setTextLineHeightValue] = useState(1.5); // 0.8 to 2.5
  const [textAppearance, setTextAppearance] = useState('none'); // none, plavno, plavno-up, snizu, maska, razmytie, micro-scale, two-lines, line
  const [textAnimationKey, setTextAnimationKey] = useState(0); // для перезапуска анимации
  const [showAppearanceDropdown, setShowAppearanceDropdown] = useState(false);
  const appearanceDropdownRef = useRef(null);
  const [textBreathing, setTextBreathing] = useState('none'); // none, pulse, fade, soft-scale, pulse-fade, breathe-up, soft-blur, scale-fade, color-pulse
  const [showBreathingDropdown, setShowBreathingDropdown] = useState(false);
  const breathingDropdownRef = useRef(null);
  const [textRotate, setTextRotate] = useState(0); // -90 to 90 degrees для наклона
  const [textRotateY, setTextRotateY] = useState(0); // -90 to 90 degrees для горизонтального поворота
  const [textPerspective, setTextPerspective] = useState(0); // -50 to 50 degrees для перспективы
  const [selectedProgressBar, setSelectedProgressBar] = useState(null); // выбранный шаблон прогресс-бара
  const [selectedCoverEffect, setSelectedCoverEffect] = useState(null); // выбранный эффект обложки
  const [selectedTemplate, setSelectedTemplate] = useState(1); // выбранный шаблон (1, 2, 3...)
  const [currentBeatIntensity, setCurrentBeatIntensity] = useState(0); // текущая интенсивность бита (0-1)
  const [bgBeatIntensity, setBgBeatIntensity] = useState(0); // интенсивность бита для BG фонов (0-1)
  const [photoScale, setPhotoScale] = useState(1); // масштаб фото для реакции на биты
  const [pulseIntensity, setPulseIntensity] = useState(0); // Интенсивность пульса (0-1)
  const [waveOffset, setWaveOffset] = useState(0); // смещение для эффекта волны (пиксели)
  const [grainPulseIntensity, setGrainPulseIntensity] = useState(0); // Интенсивность зерна (0 или 1, только на пиках)
  const [exposureIntensity, setExposureIntensity] = useState(0); // Интенсивность экспозиции (0-1, где 0 = норма, 1 = ярче и контрастнее)
  const [bwIntensity, setBwIntensity] = useState(0); // Интенсивность ч/б (0-1, где 0 = цветное, 1 = ч/б)
  const [glitchIntensity, setGlitchIntensity] = useState(0); // Интенсивность глитча (0-1)
  const [rgbIntensity, setRgbIntensity] = useState(0); // Интенсивность RGB split (0-1)
  const [mirrorIntensity, setMirrorIntensity] = useState(0); // Интенсивность зеркала (0-1)
  const [mirrorVariants, setMirrorVariants] = useState([]); // Варианты зеркальных отражений
  const [pixelateIntensity, setPixelateIntensity] = useState(0); // Интенсивность пикселизации (0-1)
  const grainCanvasRef = useRef(null); // ref для canvas с царапинами
  
  // ===== ОПТИМИЗАЦИЯ: Refs для интенсивностей (обновляются каждый кадр без React re-render) =====
  const bgBeatIntensityRef = useRef(0);
  const photoScaleRef = useRef(1);
  const pulseIntensityRef = useRef(0);
  const waveOffsetRef = useRef(0);
  const grainPulseIntensityRef = useRef(0);
  const exposureIntensityRef = useRef(0);
  const bwIntensityRef = useRef(0);
  const glitchIntensityRef = useRef(0);
  const rgbIntensityRef = useRef(0);
  const mirrorIntensityRef = useRef(0);
  const pixelateIntensityRef = useRef(0);
  
  // Refs для AudioContext анализа битов BG фонов (переиспользуются между сменами BG)
  const bgAudioContextRef = useRef(null);
  const bgAnalyserRef = useRef(null);
  const bgSourceRef = useRef(null);
  const audioSourceElementRef = useRef(null); // Хранит audio элемент для которого создан source
  // Состояния для цвета фона
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [backgroundPickerHue, setBackgroundPickerHue] = useState(0); // 0-360
  const [backgroundPickerSaturation, setBackgroundPickerSaturation] = useState(0); // 0-100
  const [backgroundPickerLightness, setBackgroundPickerLightness] = useState(0); // 0-100
  const backgroundColorPickerRef = useRef(null);
  const [isPlayerSelected, setIsPlayerSelected] = useState(false); // выбран ли плеер
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 50 }); // позиция плеера в процентах
  const [selectedBgId, setSelectedBgId] = useState(null); // выбранный фон из BG панели
  const [playerSize, setPlayerSize] = useState({ width: 300, height: 80 }); // размер плеера
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const playerRef = useRef(null);
  const playerColor = '#282828'; // цвет фона плеера (фиксированный)
  
  // Состояния для второго шаблона (music-card)
  const [isMusicCardSelected, setIsMusicCardSelected] = useState(false);
  const [musicCardPosition, setMusicCardPosition] = useState({ x: 50, y: 50 });
  const [musicCardSize, setMusicCardSize] = useState({ width: 320, height: 180 });
  const [isMusicCardDragging, setIsMusicCardDragging] = useState(false);
  const [isMusicCardResizing, setIsMusicCardResizing] = useState(false);
  const musicCardRef = useRef(null);
  
  // Состояния для третьего шаблона (audio-player-2)
  const [isPlayer2Selected, setIsPlayer2Selected] = useState(false);
  const [player2Position, setPlayer2Position] = useState({ x: 50, y: 50 });
  const [player2Size, setPlayer2Size] = useState({ width: 300, height: 80 });
  const [isPlayer2Dragging, setIsPlayer2Dragging] = useState(false);
  const [isPlayer2Resizing, setIsPlayer2Resizing] = useState(false);
  const player2Ref = useRef(null);
  
  // Состояния для четвертого шаблона (vinyl-player)
  const [isVinylPlayerSelected, setIsVinylPlayerSelected] = useState(false);
  const [vinylPlayerPosition, setVinylPlayerPosition] = useState({ x: 50, y: 50 });
  const [vinylPlayerSize, setVinylPlayerSize] = useState({ width: 288, height: 160 });
  const [isVinylPlayerDragging, setIsVinylPlayerDragging] = useState(false);
  const [isVinylPlayerResizing, setIsVinylPlayerResizing] = useState(false);
  const vinylPlayerRef = useRef(null);

  // Состояния для пятого шаблона (video-player)
  const [isVideoPlayerSelected, setIsVideoPlayerSelected] = useState(false);
  const [videoPlayerPosition, setVideoPlayerPosition] = useState({ x: 50, y: 50 });
  const [videoPlayerSize, setVideoPlayerSize] = useState({ width: 600, height: 50 }); // только progress bar и время
  const [isVideoPlayerDragging, setIsVideoPlayerDragging] = useState(false);
  const [isVideoPlayerResizing, setIsVideoPlayerResizing] = useState(false);
  const videoPlayerRef = useRef(null);

  // Состояния для шестого шаблона (music-card-2)
  const [isMusicCard2Selected, setIsMusicCard2Selected] = useState(false);
  const [musicCard2Position, setMusicCard2Position] = useState({ x: 50, y: 50 });
  const [musicCard2Size, setMusicCard2Size] = useState({ width: 190, height: 254 });
  const [isMusicCard2Dragging, setIsMusicCard2Dragging] = useState(false);
  const [isMusicCard2Resizing, setIsMusicCard2Resizing] = useState(false);
  const musicCard2Ref = useRef(null);

  // Состояния для седьмого шаблона (green-audio-player)
  const [isGreenPlayerSelected, setIsGreenPlayerSelected] = useState(false);
  const [greenPlayerPosition, setGreenPlayerPosition] = useState({ x: 50, y: 50 });
  const [greenPlayerSize, setGreenPlayerSize] = useState({ width: 400, height: 56 });
  const [isGreenPlayerDragging, setIsGreenPlayerDragging] = useState(false);
  const [isGreenPlayerResizing, setIsGreenPlayerResizing] = useState(false);
  const greenPlayerRef = useRef(null);

  // Состояния для шаблонов 8-17 (10 новых шаблонов)
  const [customPlayer8Selected, setCustomPlayer8Selected] = useState(false);
  const [customPlayer8Position, setCustomPlayer8Position] = useState({ x: 50, y: 50 });
  const [customPlayer8Size, setCustomPlayer8Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer8Dragging, setIsCustomPlayer8Dragging] = useState(false);
  const [isCustomPlayer8Resizing, setIsCustomPlayer8Resizing] = useState(false);
  const customPlayer8Ref = useRef(null);

  const [customPlayer9Selected, setCustomPlayer9Selected] = useState(false);
  const [customPlayer9Position, setCustomPlayer9Position] = useState({ x: 50, y: 50 });
  const [customPlayer9Size, setCustomPlayer9Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer9Dragging, setIsCustomPlayer9Dragging] = useState(false);
  const [isCustomPlayer9Resizing, setIsCustomPlayer9Resizing] = useState(false);
  const customPlayer9Ref = useRef(null);

  const [customPlayer10Selected, setCustomPlayer10Selected] = useState(false);
  const [customPlayer10Position, setCustomPlayer10Position] = useState({ x: 50, y: 50 });
  const [customPlayer10Size, setCustomPlayer10Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer10Dragging, setIsCustomPlayer10Dragging] = useState(false);
  const [isCustomPlayer10Resizing, setIsCustomPlayer10Resizing] = useState(false);
  const customPlayer10Ref = useRef(null);

  const [customPlayer11Selected, setCustomPlayer11Selected] = useState(false);
  const [customPlayer11Position, setCustomPlayer11Position] = useState({ x: 50, y: 50 });
  const [customPlayer11Size, setCustomPlayer11Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer11Dragging, setIsCustomPlayer11Dragging] = useState(false);
  const [isCustomPlayer11Resizing, setIsCustomPlayer11Resizing] = useState(false);
  const customPlayer11Ref = useRef(null);

  const [customPlayer12Selected, setCustomPlayer12Selected] = useState(false);
  const [customPlayer12Position, setCustomPlayer12Position] = useState({ x: 50, y: 50 });
  const [customPlayer12Size, setCustomPlayer12Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer12Dragging, setIsCustomPlayer12Dragging] = useState(false);
  const [isCustomPlayer12Resizing, setIsCustomPlayer12Resizing] = useState(false);
  const customPlayer12Ref = useRef(null);

  const [customPlayer13Selected, setCustomPlayer13Selected] = useState(false);
  const [customPlayer13Position, setCustomPlayer13Position] = useState({ x: 50, y: 50 });
  const [customPlayer13Size, setCustomPlayer13Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer13Dragging, setIsCustomPlayer13Dragging] = useState(false);
  const [isCustomPlayer13Resizing, setIsCustomPlayer13Resizing] = useState(false);
  const customPlayer13Ref = useRef(null);

  const [customPlayer14Selected, setCustomPlayer14Selected] = useState(false);
  const [customPlayer14Position, setCustomPlayer14Position] = useState({ x: 50, y: 50 });
  const [customPlayer14Size, setCustomPlayer14Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer14Dragging, setIsCustomPlayer14Dragging] = useState(false);
  const [isCustomPlayer14Resizing, setIsCustomPlayer14Resizing] = useState(false);
  const customPlayer14Ref = useRef(null);

  const [customPlayer15Selected, setCustomPlayer15Selected] = useState(false);
  const [customPlayer15Position, setCustomPlayer15Position] = useState({ x: 50, y: 90 });
  const [customPlayer15Size, setCustomPlayer15Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer15Dragging, setIsCustomPlayer15Dragging] = useState(false);
  const [isCustomPlayer15Resizing, setIsCustomPlayer15Resizing] = useState(false);
  const customPlayer15Ref = useRef(null);

  const [customPlayer16Selected, setCustomPlayer16Selected] = useState(false);
  const [customPlayer16Position, setCustomPlayer16Position] = useState({ x: 50, y: 50 });
  const [customPlayer16Size, setCustomPlayer16Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer16Dragging, setIsCustomPlayer16Dragging] = useState(false);
  const [isCustomPlayer16Resizing, setIsCustomPlayer16Resizing] = useState(false);
  const customPlayer16Ref = useRef(null);

  const [customPlayer17Selected, setCustomPlayer17Selected] = useState(false);
  const [customPlayer17Position, setCustomPlayer17Position] = useState({ x: 50, y: 50 });
  const [customPlayer17Size, setCustomPlayer17Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer17Dragging, setIsCustomPlayer17Dragging] = useState(false);
  const [isCustomPlayer17Resizing, setIsCustomPlayer17Resizing] = useState(false);
  const customPlayer17Ref = useRef(null);

  // Состояния для шаблонов 18-22 (5 новых премиум шаблонов)
  const [customPlayer18Selected, setCustomPlayer18Selected] = useState(false);
  const [customPlayer18Position, setCustomPlayer18Position] = useState({ x: 50, y: 50 });
  const [customPlayer18Size, setCustomPlayer18Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer18Dragging, setIsCustomPlayer18Dragging] = useState(false);
  const [isCustomPlayer18Resizing, setIsCustomPlayer18Resizing] = useState(false);
  const customPlayer18Ref = useRef(null);

  const [customPlayer19Selected, setCustomPlayer19Selected] = useState(false);
  const [customPlayer19Position, setCustomPlayer19Position] = useState({ x: 50, y: 90 });
  const [customPlayer19Size, setCustomPlayer19Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer19Dragging, setIsCustomPlayer19Dragging] = useState(false);
  const [isCustomPlayer19Resizing, setIsCustomPlayer19Resizing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 1180, height: 664 });
  const customPlayer19Ref = useRef(null);

  const [customPlayer20Selected, setCustomPlayer20Selected] = useState(false);
  const [customPlayer20Position, setCustomPlayer20Position] = useState({ x: 50, y: 50 });
  const [customPlayer20Size, setCustomPlayer20Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer20Dragging, setIsCustomPlayer20Dragging] = useState(false);
  const [isCustomPlayer20Resizing, setIsCustomPlayer20Resizing] = useState(false);
  const customPlayer20Ref = useRef(null);

  const [customPlayer21Selected, setCustomPlayer21Selected] = useState(false);
  const [customPlayer21Position, setCustomPlayer21Position] = useState({ x: 50, y: 50 });
  const [customPlayer21Size, setCustomPlayer21Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer21Dragging, setIsCustomPlayer21Dragging] = useState(false);
  const [isCustomPlayer21Resizing, setIsCustomPlayer21Resizing] = useState(false);
  const customPlayer21Ref = useRef(null);

  const [customPlayer22Selected, setCustomPlayer22Selected] = useState(false);
  const [customPlayer22Position, setCustomPlayer22Position] = useState({ x: 50, y: 90 });
  const [customPlayer22Size, setCustomPlayer22Size] = useState({ width: 1180, height: 664 });
  const [isCustomPlayer22Dragging, setIsCustomPlayer22Dragging] = useState(false);
  const [isCustomPlayer22Resizing, setIsCustomPlayer22Resizing] = useState(false);
  const customPlayer22Ref = useRef(null);

  // Загружаем CSS синхронно перед рендером и предзагружаем шрифты
  useLayoutEffect(() => {
    // Проверяем, все ли стили уже загружены и применены
    const checkAllLoaded = () => {
      return STUDIO_CSS.every(href => {
        const link = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
        // Стиль считается загруженным если есть sheet (применен браузером)
        return link && link.sheet !== null;
      });
    };
    
    // Если все стили уже загружены, сразу показываем UI
    if (checkAllLoaded()) {
      setStylesLoaded(true);
      return;
    }
    
    // Загружаем все стили и ждем их загрузки
    Promise.all(STUDIO_CSS.map(ensureLink))
      .then(() => {
        // Дополнительная проверка что стили действительно применены
        // Используем requestAnimationFrame для гарантии что браузер применил стили
        requestAnimationFrame(() => {
          // Финальная проверка
          if (checkAllLoaded()) {
            setStylesLoaded(true);
          } else {
            // Если проверка не прошла, все равно показываем UI через небольшую задержку
            setTimeout(() => setStylesLoaded(true), 50);
          }
        });
      })
      .catch((err) => {
        console.error('Error loading Studio CSS:', err);
        // Все равно показываем UI, чтобы не заблокировать пользователя
        setStylesLoaded(true);
      });
    
    // Fallback: показываем UI максимум через 1 секунду, даже если стили не загрузились
    const fallbackTimeout = setTimeout(() => {
      setStylesLoaded(true);
    }, 1000);
    
    return () => {
      clearTimeout(fallbackTimeout);
    };
    
    // Предзагружаем кастомные шрифты для предотвращения FOUT
    const fontsToPreload = [
      { href: '/studio/assets/fonts/WallIt.ttf', id: 'WallIt' },
      { href: '/assets/fonts/tq.ttf', id: 'tq' },
      { href: '/assets/fonts/Fyl-Regular.ttf', id: 'Fyl' },
    ];
    
    fontsToPreload.forEach(({ href, id }) => {
      if (!document.querySelector(`link[rel="preload"][href="${href}"]`)) {
        const fontLink = document.createElement('link');
        fontLink.rel = 'preload';
        fontLink.href = href;
        fontLink.as = 'font';
        fontLink.type = 'font/ttf';
        fontLink.crossOrigin = 'anonymous';
        document.head.appendChild(fontLink);
      }
    });
  }, []);

  // ===== PWA SETUP: Отдельный манифест и Service Worker для Studio =====
  useEffect(() => {
    // Заменяем manifest на Studio версию
    let manifestLink = document.querySelector('link[rel="manifest"]');
    const originalManifest = manifestLink ? manifestLink.href : null;
    
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = '/studio/manifest.json';
    
    // Заменяем theme-color
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const originalThemeColor = themeColorMeta ? themeColorMeta.content : null;
    
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = '#000000';
    
    // Заменяем apple-touch-icon
    let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    const originalAppleIcon = appleTouchIcon ? appleTouchIcon.href : null;
    
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleTouchIcon);
    }
    appleTouchIcon.href = '/tq/apple-touch-icon.png';
    
    // Заменяем favicon
    let faviconLink = document.querySelector('link[rel="icon"][type="image/png"]');
    const originalFavicon = faviconLink ? faviconLink.href : null;
    
    if (faviconLink) {
      faviconLink.href = '/tq/favicon.ico';
    }
    
    // Регистрируем Service Worker для Studio
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/studio/sw.js', { scope: '/studio/' })
          .then(reg => console.log('[Studio PWA] SW registered:', reg.scope))
          .catch(err => console.log('[Studio PWA] SW registration failed:', err));
      });
    }
    
    console.log('[Studio PWA] Configured with Studio manifest and icons');
    
    // Cleanup: восстанавливаем оригинальные значения при размонтировании
    return () => {
      if (originalManifest && manifestLink) {
        manifestLink.href = originalManifest;
      }
      if (originalThemeColor && themeColorMeta) {
        themeColorMeta.content = originalThemeColor;
      }
      if (originalAppleIcon && appleTouchIcon) {
        appleTouchIcon.href = originalAppleIcon;
      }
      if (originalFavicon && faviconLink) {
        faviconLink.href = originalFavicon;
      }
    };
  }, []);

  // Восстановление аудио из IndexedDB при монтировании
  useEffect(() => {
    const restoreAudio = async () => {
      try {
        const audioDataStr = localStorage.getItem('studioAudioData');
        if (!audioDataStr) return;
        
        const dbName = 'studioDB';
        const request = indexedDB.open(dbName, 1);
        
        request.onsuccess = async () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('audio')) {
            return;
          }
          
          const transaction = db.transaction(['audio'], 'readonly');
          const store = transaction.objectStore('audio');
          const getRequest = store.get('current');
          
          getRequest.onsuccess = async () => {
            const result = getRequest.result;
            if (!result || !result.blob) return;
            
            const blob = result.blob;
            const audioData = result.data;
            
            // Восстанавливаем File из Blob
            const file = new File([blob], result.name || 'audio.mp3', { type: result.type || 'audio/mpeg' });
            
            // Создаем новый URL
            const newAudioUrl = URL.createObjectURL(file);
            
            setAudioFile(file);
            setAudioUrl(newAudioUrl);
          setAudioDuration(clampToMaxAudio(audioData.duration));
            
            // Восстанавливаем waveform
            try {
              const arrayBuffer = await file.arrayBuffer();
              const audioContext = new (window.AudioContext || window.webkitAudioContext)();
              const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
              const waveform = await extractWaveform(audioBuffer, 150);
              setWaveformData(waveform);
              audioContext.close();
            } catch (err) {
              console.error("Ошибка восстановления waveform:", err);
            }
          };
        };
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('audio')) {
            db.createObjectStore('audio', { keyPath: 'id' });
          }
        };
      } catch (error) {
        console.error('Ошибка восстановления аудио:', error);
      }
    };
    
    restoreAudio();
  }, []);

  // ===== ПОДКЛЮЧЕНИЕ AUDIO ENGINE CALLBACKS =====
  useEffect(() => {
    // Подключаем колбэки audioEngine к нашим состояниям
    audioEngine.onPlayCallback = () => {
      setIsPlaying(true);
      isPlayingRef.current = true;
    };
    
    audioEngine.onPauseCallback = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
    };
    
    audioEngine.onEndedCallback = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setCurrentTime(0);
    };
    
    audioEngine.onTimeUpdateCallback = (time) => {
      const maxAllowed = audioDuration || MAX_AUDIO_DURATION;
      const nextTime = Math.min(time, maxAllowed);
      setCurrentTime(nextTime);
    };
    
    audioEngine.onLoadedMetadataCallback = (duration) => {
      const clampedDuration = Math.min(duration, MAX_AUDIO_DURATION);
      setAudioDuration(clampedDuration);
    };
    
    audioEngine.onErrorCallback = (error) => {
      console.error('[StudioDesktop] Audio error:', error);
      setIsPlaying(false);
      isPlayingRef.current = false;
    };
    
    console.log('[StudioDesktop] Audio Engine callbacks connected');
    
    return () => {
      // Cleanup при размонтировании
      audioEngine.onPlayCallback = null;
      audioEngine.onPauseCallback = null;
      audioEngine.onEndedCallback = null;
      audioEngine.onTimeUpdateCallback = null;
      audioEngine.onLoadedMetadataCallback = null;
      audioEngine.onErrorCallback = null;
    };
  }, [audioDuration]);
  
  // ===== ОПТИМИЗИРОВАННОЕ ОБНОВЛЕНИЕ ПРОГРЕССА (БЕЗ React re-render каждый кадр) =====
  const currentTimeRef = useRef(0);
  const lastProgressUpdateRef = useRef(0);
  
  useEffect(() => {
    if (!isPlaying || scrubbingRef.current) return;
    
    let rafId = null;
    
    const updateProgress = () => {
      const currentTime = audioEngine.getCurrentTime();
      const duration = audioEngine.getDuration();
      
      if (duration && isFinite(duration)) {
        const clampedTime = Math.min(currentTime, duration);
        currentTimeRef.current = clampedTime;
        
        // Обновляем React state только раз в 50ms (20 раз/сек вместо 60)
        const now = Date.now();
        if (now - lastProgressUpdateRef.current >= 50) {
          setCurrentTime(clampedTime);
          lastProgressUpdateRef.current = now;
        }
      }
      
      if (isPlayingRef.current && !scrubbingRef.current) {
        rafId = requestAnimationFrame(updateProgress);
      }
    };
    
    rafId = requestAnimationFrame(updateProgress);
    
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isPlaying]);
  
  // Восстановление фото из IndexedDB/localStorage при монтировании - ОТКЛЮЧЕНО
  // Восстановление состояния из sessionStorage при монтировании
  useEffect(() => {
    const savedState = sessionStorage.getItem('studioState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        // Аудио восстанавливается из IndexedDB, не из sessionStorage
        if (state.waveformData) setWaveformData(state.waveformData);
        if (state.textTrackName) setTextTrackName(state.textTrackName);
        if (state.textArtistName) setTextArtistName(state.textArtistName);
        if (state.selectedProgressBar !== null && state.selectedProgressBar !== undefined) setSelectedProgressBar(state.selectedProgressBar);
        if (state.textFont) setTextFont(state.textFont);
        if (state.textFontSize) setTextFontSize(state.textFontSize);
        if (state.textAlignment) setTextAlignment(state.textAlignment);
        if (state.textColor) setTextColor(state.textColor);
        if (state.textReadability !== undefined) setTextReadability(state.textReadability);
        if (state.textOutline !== undefined) setTextOutline(state.textOutline);
        if (state.textOutlineColor) setTextOutlineColor(state.textOutlineColor);
        if (state.textShadow !== undefined) setTextShadow(state.textShadow);
        if (state.textShadowColor) setTextShadowColor(state.textShadowColor);
        if (state.textBackground !== undefined) setTextBackground(state.textBackground);
        if (state.textLetterSpacing) setTextLetterSpacing(state.textLetterSpacing);
        if (state.textLetterSpacingValue !== undefined) setTextLetterSpacingValue(state.textLetterSpacingValue);
        if (state.textLineHeight) setTextLineHeight(state.textLineHeight);
        if (state.textLineHeightValue !== undefined) setTextLineHeightValue(state.textLineHeightValue);
        if (state.textAppearance) setTextAppearance(state.textAppearance);
        if (state.textBreathing) setTextBreathing(state.textBreathing);
        if (state.textRotate !== undefined) setTextRotate(state.textRotate);
        if (state.textRotateY !== undefined) setTextRotateY(state.textRotateY);
        if (state.textPerspective !== undefined) setTextPerspective(state.textPerspective);
        
        // Очищаем сохраненное состояние после восстановления
        sessionStorage.removeItem('studioState');
      } catch (error) {
        console.error('Ошибка восстановления состояния:', error);
      }
    }
  }, []);

  // Очистка audio URL только при размонтировании компонента
  useEffect(() => {
    return () => {
      // Очищаем только при полном размонтировании компонента
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []); // Пустой массив зависимостей - только при размонтировании

  // Отдельный эффект для очистки URL при изменении audioUrl
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Вычисление интенсивности бита на основе waveformData и currentTime
  useEffect(() => {
    if (!waveformData || !audioDuration || !isPlaying || !selectedCoverEffect) {
      setCurrentBeatIntensity(0);
      return;
    }

    const updateBeatIntensity = () => {
      if (!audioDuration || !waveformData) return;
      
      // Вычисляем позицию в waveform (0-1)
      const progress = currentTime / audioDuration;
      const waveformIndex = Math.floor(progress * waveformData.length);
      const intensity = waveformData[Math.min(waveformIndex, waveformData.length - 1)] || 0;
      
      setCurrentBeatIntensity(intensity);
    };

    updateBeatIntensity();
    const interval = setInterval(updateBeatIntensity, 50); // Обновляем каждые 50мс для плавности

    return () => clearInterval(interval);
  }, [waveformData, audioDuration, currentTime, isPlaying, selectedCoverEffect]);

  // Обновление currentTime во время воспроизведения и синхронизация видео
  useEffect(() => {
    if (!audioElementRef.current) return;

    const audio = audioElementRef.current;
    const updateTime = () => {
      const maxAllowed = audioDuration || MAX_AUDIO_DURATION;
      const nextTime = Math.min(audio.currentTime, maxAllowed);
      setCurrentTime(nextTime);
      if (audio.currentTime > maxAllowed) {
        audio.currentTime = maxAllowed;
        audio.pause();
        setIsPlaying(false);
      }
      
      // Синхронизируем видео на канвасе с аудио
      if (canvasVideoRef.current && audioDuration) {
        // Вычисляем позицию в цикле видео на основе текущего времени аудио
        // Если видео короче, зацикливаем его
        const videoDuration = canvasVideoRef.current.duration || 10; // fallback если duration неизвестна
        if (videoDuration > 0) {
          const loopedTime = audio.currentTime % videoDuration;
          if (Math.abs(canvasVideoRef.current.currentTime - loopedTime) > 0.1) {
            canvasVideoRef.current.currentTime = loopedTime;
          }
        }
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    
    // Также обновляем через интервал для более плавного обновления
    const interval = setInterval(updateTime, 100);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      clearInterval(interval);
    };
  }, [audioUrl, isPlaying, audioDuration]);

  // Синхронизация isPlayingRef с isPlaying для использования в requestAnimationFrame
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Синхронизация воспроизведения видео с аудио
  useEffect(() => {
    if (!canvasVideoRef.current || !audioDuration) return;

    const video = canvasVideoRef.current;
    
    if (isPlaying) {
      // Если аудио играет и currentTime в пределах длительности, играем видео
      if (currentTime < audioDuration) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    } else {
      video.pause();
    }
  }, [isPlaying, currentTime, audioDuration]);

  // Анализ битов для BG фонов - эффект "сердцебиения" на громкие кики
  useEffect(() => {
    if (!audioElementRef.current || !isPlaying || !selectedBgId) {
      // Не сбрасываем интенсивность сразу, чтобы эффект был плавным
      if (!selectedBgId) {
        setBgBeatIntensity(0);
      }
      return;
    }

    const audio = audioElementRef.current;
    let analyser = null;
    let dataArray = null;
    let animationFrameId = null;
    let lastEnergy = 0;
    let lastBeatTime = 0;
    let beatTimeoutId = null;
    const minBeatInterval = 100; // Уменьшена задержка для более частых битов

    // Используем Analyser из Audio Engine
    const initAudioAnalysis = async () => {
      try {
        // Инициализируем AudioContext в audioEngine если нужно
        audioEngine.initAudioContext();
        
        // Получаем analyser из audioEngine
        analyser = audioEngine.getAnalyser();
        bgAnalyserRef.current = analyser;
        bgAudioContextRef.current = audioEngine.getAudioContext();
        
        if (!analyser) {
          console.warn('[BG] Analyser не доступен из audioEngine');
          return;
        }
        
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        const detectBeat = () => {
          if (!analyser || !dataArray) return;

          analyser.getByteFrequencyData(dataArray);
          
          // Анализируем низкие частоты (кики/басы) - более широкий диапазон
          const lowFreqStart = 1; // ~20 Гц
          const lowFreqEnd = 10;  // ~215 Гц
          
          let lowSum = 0;
          for (let i = lowFreqStart; i <= lowFreqEnd; i++) {
            lowSum += dataArray[i];
          }
          const lowEnergy = lowSum / (lowFreqEnd - lowFreqStart + 1);
          
          const currentTime = Date.now();
          const timeSinceLastBeat = currentTime - lastBeatTime;
          
          // Определяем бит: резкий рост энергии в низких частотах
          const energyIncrease = lowEnergy - lastEnergy;
          const strongThreshold = 35; // Еще ниже порог для более чувствительной реакции
          const minEnergyIncrease = 12; // Минимальный рост для детекции бита (снижен)
          
          // Обнаруживаем громкие кики - мгновенная реакция
          if (energyIncrease > minEnergyIncrease && lowEnergy > strongThreshold && timeSinceLastBeat > minBeatInterval) {
            // Вычисляем интенсивность бита (0-1) - более сильная реакция
            const intensity = Math.min(1, (lowEnergy - strongThreshold) / 50);
            
            // ОПТИМИЗАЦИЯ: обновляем ref напрямую (без React re-render)
            bgBeatIntensityRef.current = intensity;
            lastBeatTime = currentTime;
            
            // Эффект "сердцебиения" - два быстрых удара
            if (beatTimeoutId) clearTimeout(beatTimeoutId);
            
            // Первый удар (сильный, быстрый)
            setTimeout(() => {
              bgBeatIntensityRef.current = Math.max(bgBeatIntensityRef.current, intensity * 0.9);
            }, 30);
            
            // Второй удар (как сердцебиение, быстрый)
            setTimeout(() => {
              bgBeatIntensityRef.current = intensity * 0.75;
            }, 100);
            
            // Быстрое затухание
            beatTimeoutId = setTimeout(() => {
              bgBeatIntensityRef.current = bgBeatIntensityRef.current * 0.3;
            }, 180);
            setTimeout(() => {
              bgBeatIntensityRef.current = 0;
            }, 300);
            
            // Обновляем state только раз в 100ms (throttled)
            throttledSetState(setBgBeatIntensity, bgBeatIntensityRef.current, 100);
          } else {
            // Быстрое затухание если нет бита
            if (bgBeatIntensityRef.current > 0.01) {
              bgBeatIntensityRef.current = bgBeatIntensityRef.current * 0.85;
            } else {
              bgBeatIntensityRef.current = 0;
            }
            
            // Обновляем state только раз в 100ms (throttled)
            throttledSetState(setBgBeatIntensity, bgBeatIntensityRef.current, 100);
          }
          
          lastEnergy = lowEnergy;
          animationFrameId = requestAnimationFrame(detectBeat);
        };

        detectBeat();
      } catch (err) {
        console.error('Ошибка инициализации анализа аудио для BG:', err);
      }
    };

    initAudioAnalysis();

    return () => {
      if (beatTimeoutId) {
        clearTimeout(beatTimeoutId);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      // НЕ отключаем source и analyser при смене BG - они используются повторно
      // НЕ закрываем AudioContext - он используется для всех анализов
      // Сбрасываем интенсивность только если BG не выбран
      if (!selectedBgId) {
        setBgBeatIntensity(0);
      }
    };
  }, [audioUrl, isPlaying, selectedBgId]);
  
  // Cleanup AudioContext только при размонтировании или остановке аудио
  useEffect(() => {
    return () => {
      // Закрываем AudioContext только если аудио не играет
      if (bgAudioContextRef.current && bgAudioContextRef.current.state !== 'closed' && !isPlaying) {
        try {
          if (bgSourceRef.current) {
            bgSourceRef.current.disconnect();
            bgSourceRef.current = null;
          }
          if (bgAnalyserRef.current) {
            bgAnalyserRef.current.disconnect();
            bgAnalyserRef.current = null;
          }
          bgAudioContextRef.current.close();
          bgAudioContextRef.current = null;
        } catch (e) {
          console.error('Ошибка при закрытии AudioContext для BG:', e);
        }
      }
    };
  }, [isPlaying]);

  // Анализ битов и реакция фото на удары (эффект BEAT)
  useEffect(() => {
    if (!bgAnalyserRef.current || !isPlayingRef.current || !photoUrl || selectedCoverEffect !== 'beat') {
      setPhotoScale(1);
      return;
    }

    let dataArray = null;
    let animationFrameId = null;
    let lastEnergy = 0;

    const detectBeat = () => {
      if (!bgAnalyserRef.current || !dataArray || !isPlayingRef.current) {
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }

      bgAnalyserRef.current.getByteFrequencyData(dataArray);
      
      // Анализируем только низкие частоты (40-160 Гц)
      const lowFreqStart = 2; // ~40 Гц
      const lowFreqEnd = 7;   // ~160 Гц
      
      let sum = 0;
      for (let i = lowFreqStart; i <= lowFreqEnd; i++) {
        sum += dataArray[i];
      }
      const energy = sum / (lowFreqEnd - lowFreqStart + 1);
      
      // ОПТИМИЗАЦИЯ: обновляем ref напрямую (без React re-render)
      const normalizedEnergy = Math.min(energy / 255, 1);
      const scale = 1 + (normalizedEnergy * 0.1); // Максимальный scale 1.1
      photoScaleRef.current = scale;
      
      // Обновляем state только раз в 100ms (throttled)
      throttledSetState(setPhotoScale, scale, 100);
      
      lastEnergy = energy;
      animationFrameId = requestAnimationFrame(detectBeat);
    };

    dataArray = new Uint8Array(bgAnalyserRef.current.frequencyBinCount);
    detectBeat();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setPhotoScale(1);
    };
  }, [audioUrl, isPlaying, photoUrl, selectedCoverEffect]);

  // Эффект ПУЛЬС - виньетка и яркость/контраст на сильные биты
  useEffect(() => {
    if (!bgAnalyserRef.current || !isPlayingRef.current || !photoUrl || selectedCoverEffect !== 'pulse') {
      setPulseIntensity(0);
      return;
    }

    let dataArray = null;
    let animationFrameId = null;
    let lastEnergy = 0;
    let lastBeatTime = 0;
    const minBeatInterval = 225; // Минимальная задержка между ударами (200-250 мс)

    const detectBeat = () => {
      if (!bgAnalyserRef.current || !dataArray || !isPlayingRef.current) {
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }

      bgAnalyserRef.current.getByteFrequencyData(dataArray);
      
      // Анализируем ТОЛЬКО низкие частоты (40-160 Гц)
      const lowFreqStart = 2; // ~40 Гц
      const lowFreqEnd = 7;   // ~160 Гц
      
      let lowSum = 0;
      for (let i = lowFreqStart; i <= lowFreqEnd; i++) {
        lowSum += dataArray[i];
      }
      const lowEnergy = lowSum / (lowFreqEnd - lowFreqStart + 1);
      
      // Проверяем средние и высокие частоты - должны быть низкими
      const midFreqStart = 8;  // ~160+ Гц
      const midFreqEnd = 20;   // ~430 Гц
      let midSum = 0;
      for (let i = midFreqStart; i <= midFreqEnd; i++) {
        midSum += dataArray[i];
      }
      const midEnergy = midSum / (midFreqEnd - midFreqStart + 1);
      
      // Если средние/высокие частоты слишком сильные - игнорируем
      if (midEnergy > lowEnergy * 1.5) {
        // ОПТИМИЗАЦИЯ: обновляем ref напрямую
        pulseIntensityRef.current = pulseIntensityRef.current * 0.7;
        throttledSetState(setPulseIntensity, pulseIntensityRef.current, 100);
        
        lastEnergy = lowEnergy * 0.5;
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }
      
      const currentTime = Date.now();
      const timeSinceLastBeat = currentTime - lastBeatTime;
      
      // Реакция только на редкие сильные пики низких частот
      const strongThreshold = 100;
      const energyIncrease = lowEnergy - lastEnergy;
      
      if (energyIncrease > strongThreshold && lowEnergy > 85 && timeSinceLastBeat >= minBeatInterval) {
        // ОПТИМИЗАЦИЯ: один удар → один импульс через ref
        lastBeatTime = currentTime;
        pulseIntensityRef.current = 1;
        throttledSetState(setPulseIntensity, 1, 50);
        
        // Плавно уменьшаем через ref
        const fadeOut = () => {
          pulseIntensityRef.current = pulseIntensityRef.current * 0.8;
          if (pulseIntensityRef.current > 0.02) {
            setTimeout(fadeOut, 40);
          } else {
            pulseIntensityRef.current = 0;
          }
        };
        setTimeout(fadeOut, 80);
      } else {
        // ОПТИМИЗАЦИЯ: затухание через ref
        const next = pulseIntensityRef.current * 0.75;
        pulseIntensityRef.current = next < 0.02 ? 0 : next;
        throttledSetState(setPulseIntensity, pulseIntensityRef.current, 100);
      }
      
      lastEnergy = lowEnergy * 0.5;
      animationFrameId = requestAnimationFrame(detectBeat);
    };

    dataArray = new Uint8Array(bgAnalyserRef.current.frequencyBinCount);
    detectBeat();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setPulseIntensity(0);
    };
  }, [audioUrl, isPlaying, photoUrl, selectedCoverEffect]);

  // Эффект ЭКСПОЗИЦИЯ - яркость/контраст на сильные биты
  useEffect(() => {
    if (!bgAnalyserRef.current || !isPlayingRef.current || !photoUrl || selectedCoverEffect !== 'exposure') {
      setExposureIntensity(0);
      return;
    }

    let dataArray = null;
    let animationFrameId = null;
    let lastEnergy = 0;
    let lastBeatTime = 0;
    const minBeatInterval = 175; // Минимальная задержка между ударами (150-200 мс)

    const detectBeat = () => {
      if (!bgAnalyserRef.current || !dataArray || !isPlayingRef.current) {
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }

      bgAnalyserRef.current.getByteFrequencyData(dataArray);
      
      // Анализируем ТОЛЬКО низкие частоты (40-160 Гц)
      const lowFreqStart = 2; // ~40 Гц
      const lowFreqEnd = 7;   // ~160 Гц
      
      let lowSum = 0;
      for (let i = lowFreqStart; i <= lowFreqEnd; i++) {
        lowSum += dataArray[i];
      }
      const lowEnergy = lowSum / (lowFreqEnd - lowFreqStart + 1);
      
      // Проверяем средние и высокие частоты - должны быть низкими
      const midFreqStart = 8;  // ~160+ Гц
      const midFreqEnd = 20;   // ~430 Гц
      let midSum = 0;
      for (let i = midFreqStart; i <= midFreqEnd; i++) {
        midSum += dataArray[i];
      }
      const midEnergy = midSum / (midFreqEnd - midFreqStart + 1);
      
      // ОПТИМИЗАЦИЯ: если средние/высокие частоты слишком сильные - игнорируем
      if (midEnergy > lowEnergy * 1.5) {
        exposureIntensityRef.current = 0;
        throttledSetState(setExposureIntensity, 0, 100);
        lastEnergy = lowEnergy * 0.5;
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }
      
      const currentTime = Date.now();
      const timeSinceLastBeat = currentTime - lastBeatTime;
      
      const strongThreshold = 100;
      const energyIncrease = lowEnergy - lastEnergy;
      
      if (energyIncrease > strongThreshold && lowEnergy > 85 && timeSinceLastBeat >= minBeatInterval) {
        // ОПТИМИЗАЦИЯ: сильный пик через ref
        lastBeatTime = currentTime;
        exposureIntensityRef.current = 1;
        throttledSetState(setExposureIntensity, 1, 50);
        
        const flashDuration = 60 + Math.random() * 40;
        
        // Плавное затухание через ref
        setTimeout(() => {
          const fadeDuration = 150 + Math.random() * 100;
          const fadeSteps = 20;
          const fadeStepTime = fadeDuration / fadeSteps;
          let step = 0;
          
          const fadeOut = () => {
            step++;
            const progress = step / fadeSteps;
            exposureIntensityRef.current = 1 - progress;
            
            if (step < fadeSteps) {
              setTimeout(fadeOut, fadeStepTime);
            } else {
              exposureIntensityRef.current = 0;
            }
          };
          
          fadeOut();
        }, flashDuration);
      } else {
        // ОПТИМИЗАЦИЯ: между пиками через ref
        exposureIntensityRef.current = 0;
        throttledSetState(setExposureIntensity, 0, 100);
      }
      
      lastEnergy = lowEnergy * 0.5;
      animationFrameId = requestAnimationFrame(detectBeat);
    };

    dataArray = new Uint8Array(bgAnalyserRef.current.frequencyBinCount);
    detectBeat();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setExposureIntensity(0);
    };
  }, [audioUrl, isPlaying, photoUrl, selectedCoverEffect]);

  // Эффект B/W - чёрно-белое на сильные биты
  useEffect(() => {
    if (!bgAnalyserRef.current || !isPlayingRef.current || !photoUrl || selectedCoverEffect !== 'bw') {
      setBwIntensity(0);
      return;
    }

    let dataArray = null;
    let animationFrameId = null;
    let lastEnergy = 0;
    let lastBeatTime = 0;
    let bwTimeoutId = null; // Таймер для возврата в цвет
    const minBeatInterval = 280; // Минимальная задержка между всплесками - увеличена для более редких срабатываний

    const detectBeat = () => {
      if (!bgAnalyserRef.current || !dataArray || !isPlayingRef.current) {
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }

      bgAnalyserRef.current.getByteFrequencyData(dataArray);
      
      // Анализируем ТОЛЬКО низкие частоты (40-160 Гц)
      const lowFreqStart = 2; // ~40 Гц
      const lowFreqEnd = 7;   // ~160 Гц
      
      let lowSum = 0;
      for (let i = lowFreqStart; i <= lowFreqEnd; i++) {
        lowSum += dataArray[i];
      }
      const lowEnergy = lowSum / (lowFreqEnd - lowFreqStart + 1);
      
      // Проверяем средние и высокие частоты - должны быть низкими (вокал/высокие частоты = всегда цвет)
      const midFreqStart = 8;  // ~160+ Гц
      const midFreqEnd = 20;   // ~430 Гц
      let midSum = 0;
      for (let i = midFreqStart; i <= midFreqEnd; i++) {
        midSum += dataArray[i];
      }
      const midEnergy = midSum / (midFreqEnd - midFreqStart + 1);
      
      // Если средние/высокие частоты слишком сильные (вокал) - всегда цвет, не обрабатываем
      if (midEnergy > lowEnergy * 1.5) {
        // Вокал/высокие частоты - всегда цвет, пропускаем обработку
        lastEnergy = lowEnergy * 0.5;
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }
      
      const currentTime = Date.now();
      const timeSinceLastBeat = currentTime - lastBeatTime;
      
      // Детектируем РЕЗКИЙ ВСПЛЕСК (транзиент) на битах, в тишине - ничего
      const energyIncrease = lowEnergy - lastEnergy;
      const transientThreshold = 120; // Порог для резкого всплеска (транзиента) - увеличен для более редких срабатываний
      
      // Реагируем ТОЛЬКО на самые сильные биты (резкий всплеск + достаточный уровень), в тишине - ничего
      if (energyIncrease > transientThreshold && lowEnergy > 90 && timeSinceLastBeat >= minBeatInterval) {
        // Биты (кик) → включаем B/W (bwIntensity = 1)
        lastBeatTime = currentTime;
        setBwIntensity(1);
        // Очищаем предыдущий таймер если есть
        if (bwTimeoutId) {
          clearTimeout(bwTimeoutId);
        }
        // СРАЗУ ставим таймер на принудительный возврат в цвет через 80-120 мс
        const returnDuration = 80 + Math.random() * 40; // 80-120 мс
        bwTimeoutId = setTimeout(() => {
          // ПРИНУДИТЕЛЬНО возвращаем цвет по таймеру
          setBwIntensity(0);
          bwTimeoutId = null;
        }, returnDuration);
      } else {
        // В тишине/паузах - всегда цвет (гарантируем ноль)
        if (!bwTimeoutId) {
          setBwIntensity(0);
        }
      }
      
      lastEnergy = lowEnergy * 0.5;
      animationFrameId = requestAnimationFrame(detectBeat);
    };

    dataArray = new Uint8Array(bgAnalyserRef.current.frequencyBinCount);
    detectBeat();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (bwTimeoutId) {
        clearTimeout(bwTimeoutId);
      }
      setBwIntensity(0);
    };
  }, [audioUrl, isPlaying, photoUrl, selectedCoverEffect]);

  // Эффект ГЛИТЧ - RGB split + пикселизация на сильные биты
  useEffect(() => {
    if (!bgAnalyserRef.current || !isPlayingRef.current || !photoUrl || selectedCoverEffect !== 'glitch') {
      setGlitchIntensity(0);
      return;
    }

    let dataArray = null;
    let animationFrameId = null;
    let lastEnergy = 0;
    let lastBeatTime = 0;
    let glitchTimeoutId = null;
    const minBeatInterval = 280;

    const detectBeat = () => {
      if (!bgAnalyserRef.current || !dataArray || !isPlayingRef.current) {
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }

      bgAnalyserRef.current.getByteFrequencyData(dataArray);
      
      const lowFreqStart = 2;
      const lowFreqEnd = 7;
      
      let lowSum = 0;
      for (let i = lowFreqStart; i <= lowFreqEnd; i++) {
        lowSum += dataArray[i];
      }
      const lowEnergy = lowSum / (lowFreqEnd - lowFreqStart + 1);
      
      const midFreqStart = 8;
      const midFreqEnd = 20;
      let midSum = 0;
      for (let i = midFreqStart; i <= midFreqEnd; i++) {
        midSum += dataArray[i];
      }
      const midEnergy = midSum / (midFreqEnd - midFreqStart + 1);
      
      if (midEnergy > lowEnergy * 1.5) {
        lastEnergy = lowEnergy * 0.5;
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }
      
      const currentTime = Date.now();
      const timeSinceLastBeat = currentTime - lastBeatTime;
      
      const energyIncrease = lowEnergy - lastEnergy;
      const transientThreshold = 120;
      
      if (energyIncrease > transientThreshold && lowEnergy > 90 && timeSinceLastBeat >= minBeatInterval) {
        lastBeatTime = currentTime;
        setGlitchIntensity(1);
        
        if (glitchTimeoutId) {
          clearTimeout(glitchTimeoutId);
        }
        
        const returnDuration = 80 + Math.random() * 40; // 80-120 мс
        glitchTimeoutId = setTimeout(() => {
          setGlitchIntensity(0);
          glitchTimeoutId = null;
        }, returnDuration);
      } else {
        if (!glitchTimeoutId) {
          setGlitchIntensity(0);
        }
      }
      
      lastEnergy = lowEnergy * 0.5;
      animationFrameId = requestAnimationFrame(detectBeat);
    };

    dataArray = new Uint8Array(bgAnalyserRef.current.frequencyBinCount);
    detectBeat();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (glitchTimeoutId) {
        clearTimeout(glitchTimeoutId);
      }
      setGlitchIntensity(0);
    };
  }, [audioUrl, isPlaying, photoUrl, selectedCoverEffect]);

  // Эффект RGB - RGB split на сильные биты
  useEffect(() => {
    if (!bgAnalyserRef.current || !isPlayingRef.current || !photoUrl || selectedCoverEffect !== 'rgb') {
      setRgbIntensity(0);
      return;
    }

    let dataArray = null;
    let animationFrameId = null;
    let lastEnergy = 0;
    let lastBeatTime = 0;
    let rgbTimeoutId = null;
    const minBeatInterval = 280;

    const detectBeat = () => {
      if (!bgAnalyserRef.current || !dataArray || !isPlayingRef.current) {
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }

      bgAnalyserRef.current.getByteFrequencyData(dataArray);
      
      const lowFreqStart = 2;
      const lowFreqEnd = 7;
      
      let lowSum = 0;
      for (let i = lowFreqStart; i <= lowFreqEnd; i++) {
        lowSum += dataArray[i];
      }
      const lowEnergy = lowSum / (lowFreqEnd - lowFreqStart + 1);
      
      const midFreqStart = 8;
      const midFreqEnd = 20;
      let midSum = 0;
      for (let i = midFreqStart; i <= midFreqEnd; i++) {
        midSum += dataArray[i];
      }
      const midEnergy = midSum / (midFreqEnd - midFreqStart + 1);
      
      if (midEnergy > lowEnergy * 1.5) {
        lastEnergy = lowEnergy * 0.5;
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }
      
      const currentTime = Date.now();
      const timeSinceLastBeat = currentTime - lastBeatTime;
      
      const energyIncrease = lowEnergy - lastEnergy;
      const transientThreshold = 120;
      
      if (energyIncrease > transientThreshold && lowEnergy > 90 && timeSinceLastBeat >= minBeatInterval) {
        lastBeatTime = currentTime;
        setRgbIntensity(1);
        
        if (rgbTimeoutId) {
          clearTimeout(rgbTimeoutId);
        }
        
        const returnDuration = 80 + Math.random() * 40; // 80-120 мс
        rgbTimeoutId = setTimeout(() => {
          setRgbIntensity(0);
          rgbTimeoutId = null;
        }, returnDuration);
      } else {
        if (!rgbTimeoutId) {
          setRgbIntensity(0);
        }
      }
      
      lastEnergy = lowEnergy * 0.5;
      animationFrameId = requestAnimationFrame(detectBeat);
    };

    dataArray = new Uint8Array(bgAnalyserRef.current.frequencyBinCount);
    detectBeat();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (rgbTimeoutId) {
        clearTimeout(rgbTimeoutId);
      }
      setRgbIntensity(0);
    };
  }, [audioUrl, isPlaying, photoUrl, selectedCoverEffect]);

  // Эффект MIRROR - зеркальные отражения в разных местах, меняются на биты
  useEffect(() => {
    if (!photoUrl || selectedCoverEffect !== 'mirror') {
      setMirrorVariants([]);
      return;
    }

    // Генерируем начальные варианты зеркальных отражений
    const generateVariants = () => {
      const variants = [];
      const types = ['horizontal', 'vertical', 'both'];
      
      // Всегда показываем 4 отражения
      for (let i = 0; i < 4; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        let position, size, transform;
        
        switch (type) {
          case 'horizontal':
            position = Math.random() > 0.5 ? 'right' : 'left';
            size = 15 + Math.random() * 20; // 15-35%
            transform = 'scaleX(-1)';
            break;
          case 'vertical':
            position = Math.random() > 0.5 ? 'bottom' : 'top';
            size = 15 + Math.random() * 20; // 15-35%
            transform = 'scaleY(-1)';
            break;
          case 'both':
            const corner = ['top-left', 'top-right', 'bottom-left', 'bottom-right'][Math.floor(Math.random() * 4)];
            position = corner;
            size = 10 + Math.random() * 15; // 10-25%
            transform = 'scale(-1, -1)';
            break;
        }
        
        variants.push({
          id: i,
          type,
          position,
          size,
          transform,
          opacity: 0.6 + Math.random() * 0.3, // 0.6-0.9
        });
      }
      
      return variants;
    };

    setMirrorVariants(generateVariants());

    // Меняем варианты на биты, если играет музыка
    if (!bgAnalyserRef.current || !isPlayingRef.current) {
      return;
    }

    let dataArray = null;
    let animationFrameId = null;
    let lastEnergy = 0;
    let lastBeatTime = 0;
    const minBeatInterval = 280;

    const detectBeat = () => {
      if (!bgAnalyserRef.current || !dataArray || !isPlayingRef.current) {
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }

      bgAnalyserRef.current.getByteFrequencyData(dataArray);
      
      const lowFreqStart = 2;
      const lowFreqEnd = 7;
      
      let lowSum = 0;
      for (let i = lowFreqStart; i <= lowFreqEnd; i++) {
        lowSum += dataArray[i];
      }
      const lowEnergy = lowSum / (lowFreqEnd - lowFreqStart + 1);
      
      const midFreqStart = 8;
      const midFreqEnd = 20;
      let midSum = 0;
      for (let i = midFreqStart; i <= midFreqEnd; i++) {
        midSum += dataArray[i];
      }
      const midEnergy = midSum / (midFreqEnd - midFreqStart + 1);
      
      if (midEnergy > lowEnergy * 1.5) {
        lastEnergy = lowEnergy * 0.5;
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }
      
      const currentTime = Date.now();
      const timeSinceLastBeat = currentTime - lastBeatTime;
      
      const energyIncrease = lowEnergy - lastEnergy;
      const transientThreshold = 120;
      
      if (energyIncrease > transientThreshold && lowEnergy > 90 && timeSinceLastBeat >= minBeatInterval) {
        lastBeatTime = currentTime;
        // Меняем варианты на биты
        setMirrorVariants(generateVariants());
      }
      
      lastEnergy = lowEnergy * 0.5;
      animationFrameId = requestAnimationFrame(detectBeat);
    };

    dataArray = new Uint8Array(bgAnalyserRef.current.frequencyBinCount);
    detectBeat();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setMirrorVariants([]);
    };
  }, [audioUrl, isPlaying, photoUrl, selectedCoverEffect]);

  // Эффект PIXELATE - простая пикселизация всей картинки на сильные биты
  useEffect(() => {
    if (!bgAnalyserRef.current || !isPlayingRef.current || !photoUrl || selectedCoverEffect !== 'pixelate') {
      setPixelateIntensity(0);
      return;
    }

    let dataArray = null;
    let animationFrameId = null;
    let lastEnergy = 0;
    let lastBeatTime = 0;
    let pixelateTimeoutId = null;
    const minBeatInterval = 280;

    const detectBeat = () => {
      if (!bgAnalyserRef.current || !dataArray || !isPlayingRef.current) {
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }

      bgAnalyserRef.current.getByteFrequencyData(dataArray);
      
      const lowFreqStart = 2;
      const lowFreqEnd = 7;
      
      let lowSum = 0;
      for (let i = lowFreqStart; i <= lowFreqEnd; i++) {
        lowSum += dataArray[i];
      }
      const lowEnergy = lowSum / (lowFreqEnd - lowFreqStart + 1);
      
      const midFreqStart = 8;
      const midFreqEnd = 20;
      let midSum = 0;
      for (let i = midFreqStart; i <= midFreqEnd; i++) {
        midSum += dataArray[i];
      }
      const midEnergy = midSum / (midFreqEnd - midFreqStart + 1);
      
      if (midEnergy > lowEnergy * 1.5) {
        lastEnergy = lowEnergy * 0.5;
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }
      
      const currentTime = Date.now();
      const timeSinceLastBeat = currentTime - lastBeatTime;
      
      const energyIncrease = lowEnergy - lastEnergy;
      const transientThreshold = 120;
      
      if (energyIncrease > transientThreshold && lowEnergy > 90 && timeSinceLastBeat >= minBeatInterval) {
        lastBeatTime = currentTime;
        setPixelateIntensity(1);
        
        if (pixelateTimeoutId) {
          clearTimeout(pixelateTimeoutId);
        }
        
        const returnDuration = 80 + Math.random() * 40; // 80-120 мс
        pixelateTimeoutId = setTimeout(() => {
          setPixelateIntensity(0);
          pixelateTimeoutId = null;
        }, returnDuration);
      } else {
        if (!pixelateTimeoutId) {
          setPixelateIntensity(0);
        }
      }
      
      lastEnergy = lowEnergy * 0.5;
      animationFrameId = requestAnimationFrame(detectBeat);
    };

    dataArray = new Uint8Array(bgAnalyserRef.current.frequencyBinCount);
    detectBeat();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (pixelateTimeoutId) {
        clearTimeout(pixelateTimeoutId);
      }
      setPixelateIntensity(0);
    };
  }, [audioUrl, isPlaying, photoUrl, selectedCoverEffect]);

  // Эффект ПЛЁНКА - случайные ломаные царапины поверх фото (canvas обновление)
  useLayoutEffect(() => {
    if (!photoUrl || selectedCoverEffect !== 'grain') {
      return;
    }

    const canvas = grainCanvasRef.current;
    if (!canvas) return;

    // Генерация плёночной пыли: мелкая пыль + редкие крупные дефекты
    const drawFilmDust = (canvas, width, height) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, width, height);
      
      // Базовая мелкая пыль (50-80 элементов)
      const numSmallDefects = 50 + Math.floor(Math.random() * 31);
      
      for (let i = 0; i < numSmallDefects; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const defectType = Math.random();
        
        // Разная прозрачность для реалистичности (0.4 - 0.95)
        const opacity = 0.4 + Math.random() * 0.55;
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.globalAlpha = opacity;
        
        if (defectType < 0.6) {
          // 60% - мелкие точки (кружки от 1 до 3.5px - увеличены)
          const radius = 1 + Math.random() * 2.5;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 40% - крошки (небольшие пятна неправильной формы - увеличены)
          const size = 1.5 + Math.random() * 4;
          ctx.beginPath();
          ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          // Добавляем несколько мелких точек рядом для эффекта крошки
          for (let j = 0; j < 2 + Math.floor(Math.random() * 3); j++) {
            const offsetX = (Math.random() - 0.5) * size * 1.5;
            const offsetY = (Math.random() - 0.5) * size * 1.5;
            const smallRadius = 0.5 + Math.random() * 1.2;
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, smallRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      // Редкие крупные дефекты (пятна/хлопья) - появляются иногда, не на каждый пик
      // Вероятность появления крупных дефектов: 25-35% от импульсов
      const hasLargeDefects = Math.random() < 0.3;
      
      if (hasLargeDefects) {
        // Количество крупных дефектов: 1-4 штуки
        const numLargeDefects = 1 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < numLargeDefects; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          
          // Разные размеры, хаотичные (от 5 до 15px радиус - увеличены)
          const baseSize = 5 + Math.random() * 10;
          const opacity = 0.5 + Math.random() * 0.4; // 0.5 - 0.9
          ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
          ctx.globalAlpha = opacity;
          
          // Рисуем крупное пятно/хлопье неправильной формы
          // Основное пятно
          ctx.beginPath();
          ctx.arc(x, y, baseSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Добавляем неровности для хаотичности (2-4 дополнительных пятнышка)
          const numBumps = 2 + Math.floor(Math.random() * 3);
          for (let j = 0; j < numBumps; j++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = baseSize * (0.4 + Math.random() * 0.4);
            const bumpX = x + Math.cos(angle) * distance;
            const bumpY = y + Math.sin(angle) * distance;
            const bumpSize = baseSize * (0.3 + Math.random() * 0.4);
            
            ctx.beginPath();
            ctx.arc(bumpX, bumpY, bumpSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      // Редкие царапины - появляются ОЧЕНЬ редко, не на каждый пик
      // Вероятность появления царапин: 10-15% от импульсов
      const hasScratches = Math.random() < 0.12;
      
      if (hasScratches) {
        // Количество царапин: 1-3 штуки
        const numScratches = 1 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numScratches; i++) {
          const startX = Math.random() * width;
          const startY = Math.random() * height;
          
          // Короткие царапины: разной длины (12-35px - увеличены)
          const totalLength = 12 + Math.random() * 23;
          
          // Разная прозрачность (0.5 - 0.9)
          const opacity = 0.5 + Math.random() * 0.4;
          ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
          ctx.globalAlpha = opacity;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          // Тонкие царапины (1.2 - 2.2px - увеличены)
          const thickness = 1.2 + Math.random() * 1;
          ctx.lineWidth = thickness;
          
          // Случайный начальный угол
          let angle = Math.random() * Math.PI * 2;
          
          // Ломаная линия (2-3 сегмента для коротких царапин)
          const numSegments = 2 + Math.floor(Math.random() * 2);
          const baseSegmentLength = totalLength / numSegments;
          
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          
          let currentX = startX;
          let currentY = startY;
          
          for (let seg = 0; seg < numSegments; seg++) {
            // Каждый сегмент имеет случайное отклонение угла
            angle += (Math.random() - 0.5) * 1.2; // отклонение до ±0.6 радиана
            
            // Случайная длина сегмента с вариациями
            const segLen = baseSegmentLength * (0.7 + Math.random() * 0.6);
            
            currentX += Math.cos(angle) * segLen;
            currentY += Math.sin(angle) * segLen;
            
            ctx.lineTo(currentX, currentY);
          }
          
          ctx.stroke();
        }
      }
      
      ctx.globalAlpha = 1;
    };

    const updateCanvas = () => {
      if (!canvas) return;
      const container = canvas.parentElement;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      // Убеждаемся, что canvas имеет правильный размер
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Рисуем плёночную пыль только если есть импульс
          if (grainPulseIntensity > 0) {
            drawFilmDust(canvas, rect.width, rect.height);
          } else {
            ctx.clearRect(0, 0, rect.width, rect.height);
          }
        }
      }
    };

    // Обновляем canvas при изменении размера
    window.addEventListener('resize', updateCanvas);

    // Первоначальная настройка размера - используем useLayoutEffect для синхронной инициализации
    updateCanvas();

    return () => {
      window.removeEventListener('resize', updateCanvas);
    };
  }, [photoUrl, selectedCoverEffect, grainPulseIntensity]);

  // Эффект ПЛЁНКА - плёночные царапины и пыль поверх фото (аудио-анализ)
  useEffect(() => {
    if (!bgAnalyserRef.current || !isPlayingRef.current || !photoUrl || selectedCoverEffect !== 'grain') {
      setGrainPulseIntensity(0);
      return;
    }

    let dataArray = null;
    let animationFrameId = null;
    let lastEnergy = 0;
    let lastBeatTime = 0;
    const minBeatInterval = 225; // Минимальная задержка между ударами (200-250 мс)

    const detectBeat = () => {
      if (!bgAnalyserRef.current || !dataArray || !isPlayingRef.current) {
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }

      bgAnalyserRef.current.getByteFrequencyData(dataArray);
      
      // Анализируем ТОЛЬКО низкие частоты (40-160 Гц)
      const lowFreqStart = 2; // ~40 Гц
      const lowFreqEnd = 7;   // ~160 Гц
      
      let lowSum = 0;
      for (let i = lowFreqStart; i <= lowFreqEnd; i++) {
        lowSum += dataArray[i];
      }
      const lowEnergy = lowSum / (lowFreqEnd - lowFreqStart + 1);
      
      // Проверяем средние и высокие частоты - должны быть низкими
      const midFreqStart = 8;  // ~160+ Гц
      const midFreqEnd = 20;   // ~430 Гц
      let midSum = 0;
      for (let i = midFreqStart; i <= midFreqEnd; i++) {
        midSum += dataArray[i];
      }
      const midEnergy = midSum / (midFreqEnd - midFreqStart + 1);
      
      // Если средние/высокие частоты слишком сильные - игнорируем
      if (midEnergy > lowEnergy * 1.5) {
        // Сигнал не низкий - убираем царапины
        setGrainPulseIntensity(0);
        lastEnergy = lowEnergy * 0.5;
        animationFrameId = requestAnimationFrame(detectBeat);
        return;
      }
      
      const currentTime = Date.now();
      const timeSinceLastBeat = currentTime - lastBeatTime;
      
      // Реакция только на редкие сильные пики низких частот (биты)
      const strongThreshold = 50; // Порог для сильного бита
      const energyIncrease = lowEnergy - lastEnergy;
      
      if (energyIncrease > strongThreshold && lowEnergy > 65 && timeSinceLastBeat >= minBeatInterval) {
        // Сильный пик → показываем плёночную пыль (генерируем новый случайный набор)
        lastBeatTime = currentTime;
        setGrainPulseIntensity(1);
        // Живёт 1-2 кадра (16-33 мс при 60fps) и исчезает
        setTimeout(() => {
          setGrainPulseIntensity(0);
        }, 16 + Math.random() * 17);
      } else {
        // В паузах - полностью ноль
        setGrainPulseIntensity(0);
      }
      
      lastEnergy = lowEnergy * 0.5;
      animationFrameId = requestAnimationFrame(detectBeat);
    };

    dataArray = new Uint8Array(bgAnalyserRef.current.frequencyBinCount);
    detectBeat();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setGrainPulseIntensity(0);
    };
  }, [audioUrl, isPlaying, photoUrl, selectedCoverEffect]);

  // Эффект ВОЛНЫ - синусоидальный сдвиг по оси X
  useEffect(() => {
    if (!photoUrl || selectedCoverEffect !== 'waves') {
      setWaveOffset(0);
      waveAmplitudeRef.current = 0;
      return;
    }

    let animationFrameId = null;
    let startTime = Date.now();
    const baseAmplitude = 20; // базовая амплитуда в пикселях

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000; // время в секундах
      const frequency = 0.5; // частота волны (0.5 Гц = один цикл за 2 секунды)
      const offset = Math.sin(elapsed * Math.PI * 2 * frequency) * baseAmplitude * waveAmplitudeRef.current;
      setWaveOffset(offset);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setWaveOffset(0);
      waveAmplitudeRef.current = 0;
    };
  }, [photoUrl, selectedCoverEffect]);

  // Аудио-анализ для амплитуды волны
  useEffect(() => {
    if (!bgAnalyserRef.current || !isPlayingRef.current || !photoUrl || selectedCoverEffect !== 'waves') {
      waveAmplitudeRef.current = 0;
      return;
    }

    let dataArray = null;
    let animationFrameId = null;

    const updateAmplitude = () => {
      if (!bgAnalyserRef.current || !dataArray || !isPlayingRef.current) {
        animationFrameId = requestAnimationFrame(updateAmplitude);
        return;
      }

      bgAnalyserRef.current.getByteFrequencyData(dataArray);
      
      // Анализируем все частоты для общей энергии
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const energy = sum / dataArray.length;
      
      // Нормализуем энергию (0-255 -> 0-1) и применяем к амплитуде
      const normalizedEnergy = Math.min(energy / 255, 1);
      waveAmplitudeRef.current = normalizedEnergy;
      
      animationFrameId = requestAnimationFrame(updateAmplitude);
    };

    dataArray = new Uint8Array(bgAnalyserRef.current.frequencyBinCount);
    updateAmplitude();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      waveAmplitudeRef.current = 0;
    };
  }, [audioUrl, isPlaying, photoUrl, selectedCoverEffect]);

  // Импульсы канваса - реакция на энергию трека
  useEffect(() => {
    if (!audioElementRef.current || !isPlaying) {
      return;
    }

    const audio = audioElementRef.current;
    let analyser = null;
    let dataArray = null;
    let animationFrameId = null;
    let lastEnergy = 0;
    let lastImpulseTime = 0;
    const minImpulseInterval = 300; // Минимум 300мс между импульсами для четкой реакции на бит

    const initAudioAnalysis = async () => {
      try {
        // Инициализируем AudioContext в audioEngine если нужно
        audioEngine.initAudioContext();
        
        // Получаем analyser из audioEngine
        analyser = audioEngine.getAnalyser();
        bgAnalyserRef.current = analyser;
        bgAudioContextRef.current = audioEngine.getAudioContext();
        
        if (!analyser) {
          console.warn('[Impulse] Analyser не доступен из audioEngine');
          return;
        }
        
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        const detectImpulse = () => {
          // ВАЖНО: проверяем isPlayingRef внутри loop (синхронно)
          if (!bgAnalyserRef.current || !dataArray || !isPlayingRef.current) {
            return; // Останавливаем если пауза
          }

          // Используем данные из общего analyser
          bgAnalyserRef.current.getByteFrequencyData(dataArray);
          
          const lowFreqStart = 2;
          const lowFreqEnd = 7;
          
          let lowSum = 0;
          for (let i = lowFreqStart; i <= lowFreqEnd; i++) {
            lowSum += dataArray[i];
          }
          const lowEnergy = lowSum / (lowFreqEnd - lowFreqStart + 1);
          
          const currentTime = Date.now();
          const timeSinceLastImpulse = currentTime - lastImpulseTime;
          const energyIncrease = lowEnergy - lastEnergy;
          
          const impulseThreshold = 30;
          // Импульс canvas срабатывает только если выбран эффект
          if (selectedCoverEffect !== null && energyIncrease > impulseThreshold && lowEnergy > 50 && timeSinceLastImpulse >= minImpulseInterval) {
            lastImpulseTime = currentTime;
            
            const canvas = canvasRef.current || document.querySelector('.canvas-16x9');
            if (canvas) {
              canvas.classList.add('canvas-impulse');
              setTimeout(() => {
                canvas.classList.remove('canvas-impulse');
              }, 150);
            }
          }
          
          lastEnergy = lowEnergy * 0.6;
          animationFrameId = requestAnimationFrame(detectImpulse);
        };

        detectImpulse();
      } catch (error) {
        console.error('Ошибка импульсов:', error);
      }
    };

    initAudioAnalysis();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      // НЕ отключаем общий analyser - он используется всеми эффектами
    };
  }, [audioUrl, isPlaying, selectedCoverEffect]);

  // Закрытие панели инструментов при клике вне её
  useEffect(() => {
    if (!isToolsOpen) return;

    const handleClickOutside = (event) => {
      // Не закрываем, если клик на меню логотипа
      if (event.target.closest('.header-left') || event.target.closest('[data-logo-menu]')) {
        return;
      }
      if (
        toolsPanelRef.current &&
        !toolsPanelRef.current.contains(event.target) &&
        !event.target.closest('.templates')
      ) {
        setIsToolsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isToolsOpen]);

  // Закрытие color picker при клике вне его
  const outlineColorPickerRef = useRef(null);
  const shadowColorPickerRef = useRef(null);

  useEffect(() => {
    if (!showColorPicker && !showOutlineColorPicker && !showShadowColorPicker && !showAppearanceDropdown && !showBreathingDropdown) return;

    const handleClickOutside = (event) => {
      // Не закрываем, если клик на меню логотипа
      if (event.target.closest('.header-left') || event.target.closest('[data-logo-menu]')) {
        return;
      }
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target) &&
        !event.target.closest('input[type="color"]') &&
        !event.target.closest('.color-picker-trigger')
      ) {
        setShowColorPicker(false);
      }
      if (
        outlineColorPickerRef.current &&
        !outlineColorPickerRef.current.contains(event.target) &&
        !event.target.closest('.outline-color-picker-trigger')
      ) {
        setShowOutlineColorPicker(false);
      }
      if (
        shadowColorPickerRef.current &&
        !shadowColorPickerRef.current.contains(event.target) &&
        !event.target.closest('.shadow-color-picker-trigger')
      ) {
        setShowShadowColorPicker(false);
      }
      if (
        appearanceDropdownRef.current &&
        !appearanceDropdownRef.current.contains(event.target)
      ) {
        setShowAppearanceDropdown(false);
      }
      if (
        breathingDropdownRef.current &&
        !breathingDropdownRef.current.contains(event.target)
      ) {
        setShowBreathingDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker, showOutlineColorPicker, showShadowColorPicker, showAppearanceDropdown, showBreathingDropdown]);

  // Логика показа социального overlay
  // В режиме редактирования показываем всегда (если включено и шаблон выбран)
  // При воспроизведении применяем временные ограничения
  const shouldShowSocialOverlay = Boolean(
    socialEnabled && selectedSocialTemplate && (
      !isPlaying || // Показываем всегда когда не играет (для редактирования)
      (currentTime >= socialStartSec && currentTime <= socialEndSec) // При воспроизведении - по времени
    )
  );

  // Дебаг для соцсетей
  useEffect(() => {
    if (socialEnabled && selectedSocialTemplate) {
      console.log('Social overlay state:', {
        socialEnabled,
        selectedSocialTemplate,
        isPlaying,
        currentTime,
        socialStartSec,
        socialEndSec,
        shouldShowSocialOverlay,
        position: socialOverlayPosition
      });
    }
  }, [socialEnabled, selectedSocialTemplate, isPlaying, currentTime, socialStartSec, socialEndSec, shouldShowSocialOverlay, socialOverlayPosition]);

  // Обновление размера канваса для рамки шаблона 19
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = document.querySelector('.canvas-16x9');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Конвертация HSL в HEX
  const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  // Конвертация HEX в HSL
  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
        default: h = 0;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Инициализация color picker при открытии (только один раз при открытии)
  useEffect(() => {
    if (showColorPicker) {
      const hsl = hexToHsl(textColor);
      setColorPickerHue(hsl.h);
      setColorPickerSaturation(hsl.s);
      setColorPickerLightness(hsl.l);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showColorPicker]); // Убираем textColor из зависимостей, чтобы избежать циклического обновления

  // Обновление цвета при изменении HSL (только когда picker открыт)
  useEffect(() => {
    if (showColorPicker) {
      const newColor = hslToHex(colorPickerHue, colorPickerSaturation, colorPickerLightness);
      // Проверяем, что цвет действительно изменился, чтобы избежать лишних обновлений
      if (newColor.toLowerCase() !== textColor.toLowerCase()) {
        setTextColor(newColor);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorPickerHue, colorPickerSaturation, colorPickerLightness, showColorPicker]);

  // Инициализация background color picker при открытии
  useEffect(() => {
    if (showBackgroundColorPicker) {
      const hsl = hexToHsl(backgroundColor);
      setBackgroundPickerHue(hsl.h);
      setBackgroundPickerSaturation(hsl.s);
      setBackgroundPickerLightness(hsl.l);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBackgroundColorPicker]);

  // Обновление background цвета при изменении HSL
  useEffect(() => {
    if (showBackgroundColorPicker) {
      const newColor = hslToHex(backgroundPickerHue, backgroundPickerSaturation, backgroundPickerLightness);
      if (newColor.toLowerCase() !== backgroundColor.toLowerCase()) {
        setBackgroundColor(newColor);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundPickerHue, backgroundPickerSaturation, backgroundPickerLightness, showBackgroundColorPicker]);

  // Инициализация outline color picker при открытии
  useEffect(() => {
    if (showOutlineColorPicker) {
      const hsl = hexToHsl(textOutlineColor);
      setOutlinePickerHue(hsl.h);
      setOutlinePickerSat(hsl.s);
      setOutlinePickerLight(hsl.l);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOutlineColorPicker]);

  // Обновление outline цвета при изменении HSL
  useEffect(() => {
    if (showOutlineColorPicker) {
      const newColor = hslToHex(outlinePickerHue, outlinePickerSat, outlinePickerLight);
      if (newColor.toLowerCase() !== textOutlineColor.toLowerCase()) {
        setTextOutlineColor(newColor);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outlinePickerHue, outlinePickerSat, outlinePickerLight, showOutlineColorPicker]);

  // Инициализация shadow color picker при открытии
  useEffect(() => {
    if (showShadowColorPicker) {
      const hsl = hexToHsl(textShadowColor);
      setShadowPickerHue(hsl.h);
      setShadowPickerSat(hsl.s);
      setShadowPickerLight(hsl.l);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showShadowColorPicker]);

  // Обновление shadow цвета при изменении HSL
  useEffect(() => {
    if (showShadowColorPicker) {
      const newColor = hslToHex(shadowPickerHue, shadowPickerSat, shadowPickerLight);
      if (newColor.toLowerCase() !== textShadowColor.toLowerCase()) {
        setTextShadowColor(newColor);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shadowPickerHue, shadowPickerSat, shadowPickerLight, showShadowColorPicker]);

  // Закрытие background color picker при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Не закрываем, если клик на меню логотипа
      if (event.target.closest('.header-left') || event.target.closest('[data-logo-menu]')) {
        return;
      }
      if (backgroundColorPickerRef.current && !backgroundColorPickerRef.current.contains(event.target)) {
        // Проверяем, что клик не был на кнопке открытия picker
        const button = event.target.closest('button');
        if (!button || !button.querySelector('div[style*="background"]')) {
          setShowBackgroundColorPicker(false);
        }
      }
    };

    if (showBackgroundColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBackgroundColorPicker]);

  // ===== АУДИО: Устанавливаем src через Audio Engine =====
  useEffect(() => {
    audioEngine.setSrc(audioUrl);
    if (!audioUrl) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setCurrentTime(0);
    }
  }, [audioUrl]);

  // ===== АУДИО: Play/Pause через Audio Engine =====
  const handlePlayPause = async () => {
    if (!hasUserInteracted) setHasUserInteracted(true);
    if (!audioUrl) return;
    
    try {
      await audioEngine.toggle();
      // Перезапускаем текстовую анимацию при play
      if (audioEngine.isPlaying()) {
        setTextAnimationKey(prev => prev + 1);
      }
    } catch (err) {
      console.error('[StudioDesktop] Play/Pause error:', err);
    }
  };
  
  // ===== АУДИО: Stop через Audio Engine =====
  const handleStop = () => {
    audioEngine.stop();
  };

  // Обработчик нажатия клавиш для управления аудио (пробел, стрелки)
  useEffect(() => {
    if (!audioUrl) return; // Если аудио не выбрано, не обрабатываем клавиши

    const handleKeyDown = (event) => {
      // Проверяем, что пользователь не находится в поле ввода
      const target = event.target;
      const isInput = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.isContentEditable;
      
      if (isInput) return; // Не обрабатываем, если фокус в поле ввода

      // Пробел - воспроизведение/пауза
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault(); // Предотвращаем прокрутку страницы
        if (!hasUserInteracted) {
          setHasUserInteracted(true);
        }
        handlePlayPause();
      }
      // Стрелка влево - перемотка назад на 5 секунд
      else if (event.code === 'ArrowLeft' || event.key === 'ArrowLeft') {
        event.preventDefault();
        if (audioElementRef.current) {
          const newTime = Math.max(0, audioElementRef.current.currentTime - 5);
          audioElementRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        }
      }
      // Стрелка вправо - перемотка вперед на 5 секунд
      else if (event.code === 'ArrowRight' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (audioElementRef.current && audioDuration) {
          const newTime = Math.min(audioDuration, audioElementRef.current.currentTime + 5);
          audioElementRef.current.currentTime = newTime;
          setCurrentTime(newTime);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [audioUrl, isPlaying, audioDuration]);

  // Обработчик перемотки в начало
  // ===== АУДИО: Restart (в начало) через Audio Engine =====
  const handleRewind = () => {
    if (!audioUrl) return;
    
    // Просто ставим currentTime в 0
    // Если играет - продолжит играть с начала
    // Если на паузе - просто переместится в начало
    audioEngine.seek(0);
    setCurrentTime(0);
    
    console.log('[Restart] Перемотка в начало');
  };

  // Обработчики для перетаскивания и изменения размера плеера
  const dragStartRef = useRef(null);

  const handlePlayerMouseDown = (e) => {
    if (e.target.closest('.play-btn, .pause-btn, .progress-bar, .progress, .resize-handle')) {
      return; // Не начинаем перетаскивание при клике на кнопки, прогресс-бар или ручки изменения размера
    }
    e.stopPropagation();
    setIsPlayerSelected(true);
    setIsDragging(true);
    const canvas = e.currentTarget.closest('.canvas');
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    dragStartRef.current = {
      mouseStartX: mouseX,
      mouseStartY: mouseY,
      playerStartX: playerPosition.x,
      playerStartY: playerPosition.y,
      canvasWidth: canvasRect.width,
      canvasHeight: canvasRect.height,
    };
  };

  const handlePlayerResizeMouseDown = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    dragStartRef.current = {
      startWidth: playerSize.width,
      startHeight: playerSize.height,
      startX: e.clientX,
      startY: e.clientY,
    };
  };

  // Обработчики для перемещения и изменения размера социального overlay
  const handleSocialMouseDown = (e) => {
    if (e.target.closest('.social-resize-handle')) {
      return; // Не начинаем перетаскивание при клике на ручку изменения размера
    }
    e.stopPropagation();
    e.preventDefault(); // Предотвращаем выделение текста
    setIsSocialSelected(true); // Выделяем элемент
    setIsSocialDragging(true);
    const canvas = e.currentTarget.closest('.canvas');
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    socialDragStartRef.current = {
      mouseStartX: mouseX,
      mouseStartY: mouseY,
      overlayStartX: socialOverlayPosition.x,
      overlayStartY: socialOverlayPosition.y,
      canvasWidth: canvasRect.width,
      canvasHeight: canvasRect.height,
    };
  };
  
  // Снятие выделения при клике вне элемента
  useEffect(() => {
    const handleCanvasClick = (e) => {
      // Не закрываем, если клик на меню логотипа
      if (e.target.closest('.header-left') || e.target.closest('[data-logo-menu]')) {
        return;
      }
      if (isSocialSelected && !e.target.closest('.social-overlay-container')) {
        setIsSocialSelected(false);
      }
    };
    
    if (isSocialSelected) {
      document.addEventListener('mousedown', handleCanvasClick);
      return () => {
        document.removeEventListener('mousedown', handleCanvasClick);
      };
    }
  }, [isSocialSelected]);

  const handleSocialResizeMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsSocialResizing(true);
    const container = e.currentTarget.closest('.social-overlay-container');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    socialDragStartRef.current = {
      startScale: socialOverlaySize.scale,
      startX: e.clientX,
      startY: e.clientY,
      startDistance: Math.sqrt(
        Math.pow(e.clientX - (containerRect.left + containerRect.width / 2), 2) +
        Math.pow(e.clientY - (containerRect.bottom), 2)
      ),
    };
  };

  useEffect(() => {
    if (!isDragging && !isResizing && !isMusicCardDragging && !isMusicCardResizing && !isPlayer2Dragging && !isPlayer2Resizing && !isVinylPlayerDragging && !isVinylPlayerResizing && !isVideoPlayerDragging && !isVideoPlayerResizing && !isMusicCard2Dragging && !isMusicCard2Resizing && !isGreenPlayerDragging && !isGreenPlayerResizing && !isCustomPlayer8Dragging && !isCustomPlayer8Resizing && !isCustomPlayer9Dragging && !isCustomPlayer9Resizing && !isCustomPlayer10Dragging && !isCustomPlayer10Resizing && !isCustomPlayer11Dragging && !isCustomPlayer11Resizing && !isCustomPlayer12Dragging && !isCustomPlayer12Resizing && !isCustomPlayer13Dragging && !isCustomPlayer13Resizing && !isCustomPlayer14Dragging && !isCustomPlayer14Resizing && !isCustomPlayer15Dragging && !isCustomPlayer15Resizing && !isCustomPlayer16Dragging && !isCustomPlayer16Resizing && !isCustomPlayer17Dragging && !isCustomPlayer17Resizing && !isSocialDragging && !isSocialResizing) return;

    const handleMouseMove = (e) => {
      if (isDragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const canvasRect = canvas.getBoundingClientRect();
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setPlayerPosition({
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(0, Math.min(100, newY)),
        });
      } else if (isMusicCardDragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const canvasRect = canvas.getBoundingClientRect();
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setMusicCardPosition({
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(0, Math.min(100, newY)),
        });
      } else if (isResizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const deltaY = e.clientY - dragStartRef.current.startY;
        setPlayerSize({
          width: Math.max(200, dragStartRef.current.startWidth + deltaX),
          height: Math.max(60, dragStartRef.current.startHeight + deltaY),
        });
      } else if (isMusicCardResizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const deltaY = e.clientY - dragStartRef.current.startY;
        setMusicCardSize({
          width: Math.max(250, Math.min(500, dragStartRef.current.startWidth + deltaX)),
          height: Math.max(120, Math.min(300, dragStartRef.current.startHeight + deltaY)),
        });
      } else if (isPlayer2Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const canvasRect = canvas.getBoundingClientRect();
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setPlayer2Position({
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(0, Math.min(100, newY)),
        });
      } else if (isPlayer2Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const deltaY = e.clientY - dragStartRef.current.startY;
        setPlayer2Size({
          width: Math.max(200, Math.min(600, dragStartRef.current.startWidth + deltaX)),
          height: Math.max(60, Math.min(200, dragStartRef.current.startHeight + deltaY)),
        });
      } else if (isVinylPlayerDragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const canvasRect = canvas.getBoundingClientRect();
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setVinylPlayerPosition({
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(0, Math.min(100, newY)),
        });
      } else if (isVinylPlayerResizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const deltaY = e.clientY - dragStartRef.current.startY;
        setVinylPlayerSize({
          width: Math.max(250, Math.min(500, dragStartRef.current.startWidth + deltaX)),
          height: Math.max(120, Math.min(300, dragStartRef.current.startHeight + deltaY)),
        });
      } else if (isVideoPlayerDragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const canvasRect = canvas.getBoundingClientRect();
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setVideoPlayerPosition({
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(0, Math.min(100, newY)),
        });
      } else if (isVideoPlayerResizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const deltaY = e.clientY - dragStartRef.current.startY;
        setVideoPlayerSize({
          width: Math.max(200, Math.min(1200, dragStartRef.current.startWidth + deltaX)),
          height: Math.max(40, Math.min(100, dragStartRef.current.startHeight + deltaY)),
        });
      } else if (isMusicCard2Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const canvasRect = canvas.getBoundingClientRect();
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setMusicCard2Position({
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(0, Math.min(100, newY)),
        });
      } else if (isMusicCard2Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const deltaY = e.clientY - dragStartRef.current.startY;
        setMusicCard2Size({
          width: Math.max(150, Math.min(400, dragStartRef.current.startWidth + deltaX)),
          height: Math.max(200, Math.min(500, dragStartRef.current.startHeight + deltaY)),
        });
      } else if (isGreenPlayerDragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const canvasRect = canvas.getBoundingClientRect();
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setGreenPlayerPosition({
          x: Math.max(0, Math.min(100, newX)),
          y: Math.max(0, Math.min(100, newY)),
        });
      } else if (isGreenPlayerResizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const deltaY = e.clientY - dragStartRef.current.startY;
        setGreenPlayerSize({
          width: Math.max(300, Math.min(1200, dragStartRef.current.startWidth + deltaX)),
          height: Math.max(42, Math.min(168, dragStartRef.current.startHeight + deltaY)),
        });
      } else if (isCustomPlayer8Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer8Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer8Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer8Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isCustomPlayer9Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer9Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer9Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer9Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isCustomPlayer10Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer10Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer10Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer10Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isCustomPlayer11Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer11Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer11Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer11Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isCustomPlayer12Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer12Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer12Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer12Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isCustomPlayer13Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer13Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer13Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer13Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isCustomPlayer14Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer14Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer14Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer14Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isCustomPlayer15Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer15Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer15Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer15Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isCustomPlayer16Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer16Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer16Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer16Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isCustomPlayer17Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer17Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer17Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer17Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isCustomPlayer18Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer18Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer18Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer18Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isCustomPlayer19Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer19Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer19Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer19Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isCustomPlayer20Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer20Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer20Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer20Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isCustomPlayer21Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer21Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer21Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer21Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isCustomPlayer22Dragging && dragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas || !dragStartRef.current.canvasWidth) return;
        const deltaX = e.clientX - dragStartRef.current.mouseStartX;
        const deltaY = e.clientY - dragStartRef.current.mouseStartY;
        const deltaXPercent = (deltaX / dragStartRef.current.canvasWidth) * 100;
        const deltaYPercent = (deltaY / dragStartRef.current.canvasHeight) * 100;
        const newX = dragStartRef.current.playerStartX + deltaXPercent;
        const newY = dragStartRef.current.playerStartY + deltaYPercent;
        setCustomPlayer22Position({ x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) });
      } else if (isCustomPlayer22Resizing && dragStartRef.current) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const newWidth = dragStartRef.current.startWidth + deltaX;
        const newHeight = newWidth * (9 / 16);
        setCustomPlayer22Size({ width: Math.max(640, Math.min(3840, newWidth)), height: Math.max(360, Math.min(2160, newHeight)) });
      } else if (isSocialDragging && socialDragStartRef.current) {
        const canvas = document.querySelector('.canvas');
        if (!canvas) return;
        const canvasRect = canvas.getBoundingClientRect();
        const deltaX = e.clientX - socialDragStartRef.current.mouseStartX;
        const deltaY = e.clientY - socialDragStartRef.current.mouseStartY;
        const newX = socialDragStartRef.current.overlayStartX + deltaX;
        const newY = socialDragStartRef.current.overlayStartY - deltaY; // Инвертируем Y, так как позиция от нижнего края
        setSocialOverlayPosition({
          x: Math.max(0, Math.min(canvasRect.width - 200, newX)),
          y: Math.max(0, Math.min(canvasRect.height - 100, newY)),
        });
      } else if (isSocialResizing && socialDragStartRef.current) {
        const container = document.querySelector('.social-overlay-container');
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;
        const centerY = containerRect.bottom;
        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        );
        const initialDistance = socialDragStartRef.current.startDistance || 50;
        const newScale = Math.max(0.5, Math.min(3, (distance / initialDistance) * socialDragStartRef.current.startScale));
        setSocialOverlaySize({ scale: newScale });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsMusicCardDragging(false);
      setIsMusicCardResizing(false);
      setIsPlayer2Dragging(false);
      setIsPlayer2Resizing(false);
      setIsVinylPlayerDragging(false);
      setIsVinylPlayerResizing(false);
      setIsVideoPlayerDragging(false);
      setIsVideoPlayerResizing(false);
      setIsMusicCard2Dragging(false);
      setIsMusicCard2Resizing(false);
      setIsGreenPlayerDragging(false);
      setIsGreenPlayerResizing(false);
      setIsCustomPlayer8Dragging(false);
      setIsCustomPlayer8Resizing(false);
      setIsCustomPlayer9Dragging(false);
      setIsCustomPlayer9Resizing(false);
      setIsCustomPlayer10Dragging(false);
      setIsCustomPlayer10Resizing(false);
      setIsCustomPlayer11Dragging(false);
      setIsCustomPlayer11Resizing(false);
      setIsCustomPlayer12Dragging(false);
      setIsCustomPlayer12Resizing(false);
      setIsCustomPlayer13Dragging(false);
      setIsCustomPlayer13Resizing(false);
      setIsCustomPlayer14Dragging(false);
      setIsCustomPlayer14Resizing(false);
      setIsCustomPlayer15Dragging(false);
      setIsCustomPlayer15Resizing(false);
      setIsCustomPlayer16Dragging(false);
      setIsCustomPlayer16Resizing(false);
      setIsCustomPlayer17Dragging(false);
      setIsCustomPlayer17Resizing(false);
      setIsCustomPlayer18Dragging(false);
      setIsCustomPlayer18Resizing(false);
      setIsCustomPlayer19Dragging(false);
      setIsCustomPlayer19Resizing(false);
      setIsCustomPlayer20Dragging(false);
      setIsCustomPlayer20Resizing(false);
      setIsCustomPlayer21Dragging(false);
      setIsCustomPlayer21Resizing(false);
      setIsCustomPlayer22Dragging(false);
      setIsCustomPlayer22Resizing(false);
      setIsSocialDragging(false);
      setIsSocialResizing(false);
      dragStartRef.current = null;
      socialDragStartRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, isMusicCardDragging, isMusicCardResizing, isPlayer2Dragging, isPlayer2Resizing, isVinylPlayerDragging, isVinylPlayerResizing, isVideoPlayerDragging, isVideoPlayerResizing, isMusicCard2Dragging, isMusicCard2Resizing, isGreenPlayerDragging, isGreenPlayerResizing, isCustomPlayer8Dragging, isCustomPlayer8Resizing, isCustomPlayer9Dragging, isCustomPlayer9Resizing, isCustomPlayer10Dragging, isCustomPlayer10Resizing, isCustomPlayer11Dragging, isCustomPlayer11Resizing, isCustomPlayer12Dragging, isCustomPlayer12Resizing, isCustomPlayer13Dragging, isCustomPlayer13Resizing, isCustomPlayer14Dragging, isCustomPlayer14Resizing, isCustomPlayer15Dragging, isCustomPlayer15Resizing, isCustomPlayer16Dragging, isCustomPlayer16Resizing, isCustomPlayer17Dragging, isCustomPlayer17Resizing, isCustomPlayer18Dragging, isCustomPlayer18Resizing, isCustomPlayer19Dragging, isCustomPlayer19Resizing, isCustomPlayer20Dragging, isCustomPlayer20Resizing, isCustomPlayer21Dragging, isCustomPlayer21Resizing, isCustomPlayer22Dragging, isCustomPlayer22Resizing, isSocialDragging, isSocialResizing, playerPosition.x, playerPosition.y, musicCardPosition.x, musicCardPosition.y, player2Position.x, player2Position.y, vinylPlayerPosition.x, vinylPlayerPosition.y, videoPlayerPosition.x, videoPlayerPosition.y, musicCard2Position.x, musicCard2Position.y, greenPlayerPosition.x, greenPlayerPosition.y, customPlayer8Position.x, customPlayer8Position.y, customPlayer9Position.x, customPlayer9Position.y, customPlayer10Position.x, customPlayer10Position.y, customPlayer11Position.x, customPlayer11Position.y, customPlayer12Position.x, customPlayer12Position.y, customPlayer13Position.x, customPlayer13Position.y, customPlayer14Position.x, customPlayer14Position.y, customPlayer15Position.x, customPlayer15Position.y, customPlayer16Position.x, customPlayer16Position.y, customPlayer17Position.x, customPlayer17Position.y, customPlayer18Position.x, customPlayer18Position.y, customPlayer19Position.x, customPlayer19Position.y, customPlayer20Position.x, customPlayer20Position.y, customPlayer21Position.x, customPlayer21Position.y, customPlayer22Position.x, customPlayer22Position.y]);

  // Форматирование времени
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Обработчик клика на премиум шаблоны - перенаправляет на страницу тарифов
  const handlePremiumClick = (e) => {
    e.stopPropagation();
    
    // Сохраняем состояние в sessionStorage перед переходом
    const stateToSave = {
      photoUrl: photoUrl,
      photoKey: photoKey,
      audioDuration: audioDuration,
      audioUrl: audioUrl,
      waveformData: waveformData,
      textTrackName: textTrackName,
      textArtistName: textArtistName,
      selectedProgressBar: selectedProgressBar,
      textFont: textFont,
      textFontSize: textFontSize,
      textAlignment: textAlignment,
      textColor: textColor,
      textReadability: textReadability,
      textOutline: textOutline,
      textOutlineColor: textOutlineColor,
      textShadow: textShadow,
      textShadowColor: textShadowColor,
      textBackground: textBackground,
      textLetterSpacing: textLetterSpacing,
      textLetterSpacingValue: textLetterSpacingValue,
      textLineHeight: textLineHeight,
      textLineHeightValue: textLineHeightValue,
      textAppearance: textAppearance,
      textBreathing: textBreathing,
      textRotate: textRotate,
      textRotateY: textRotateY,
      textPerspective: textPerspective,
    };
    sessionStorage.setItem('studioState', JSON.stringify(stateToSave));
    
    navigate('/pricing?returnTo=/studio');
  };
  
  // Восстановление состояния из sessionStorage при монтировании
  useEffect(() => {
    const savedState = sessionStorage.getItem('studioState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.photoUrl) setPhotoUrl(state.photoUrl);
        if (state.photoKey) setPhotoKey(state.photoKey);
        if (state.audioDuration) setAudioDuration(clampToMaxAudio(state.audioDuration));
        if (state.audioUrl) setAudioUrl(state.audioUrl);
        if (state.waveformData) setWaveformData(state.waveformData);
        if (state.textTrackName) setTextTrackName(state.textTrackName);
        if (state.textArtistName) setTextArtistName(state.textArtistName);
        if (state.selectedProgressBar) setSelectedProgressBar(state.selectedProgressBar);
        if (state.textFont) setTextFont(state.textFont);
        if (state.textFontSize) setTextFontSize(state.textFontSize);
        if (state.textAlignment) setTextAlignment(state.textAlignment);
        if (state.textColor) setTextColor(state.textColor);
        if (state.textReadability !== undefined) setTextReadability(state.textReadability);
        if (state.textOutline !== undefined) setTextOutline(state.textOutline);
        if (state.textOutlineColor) setTextOutlineColor(state.textOutlineColor);
        if (state.textShadow !== undefined) setTextShadow(state.textShadow);
        if (state.textShadowColor) setTextShadowColor(state.textShadowColor);
        if (state.textBackground !== undefined) setTextBackground(state.textBackground);
        if (state.textLetterSpacing) setTextLetterSpacing(state.textLetterSpacing);
        if (state.textLetterSpacingValue !== undefined) setTextLetterSpacingValue(state.textLetterSpacingValue);
        if (state.textLineHeight) setTextLineHeight(state.textLineHeight);
        if (state.textLineHeightValue !== undefined) setTextLineHeightValue(state.textLineHeightValue);
        if (state.textAppearance) setTextAppearance(state.textAppearance);
        if (state.textBreathing) setTextBreathing(state.textBreathing);
        if (state.textRotate !== undefined) setTextRotate(state.textRotate);
        if (state.textRotateY !== undefined) setTextRotateY(state.textRotateY);
        if (state.textPerspective !== undefined) setTextPerspective(state.textPerspective);
      } catch (error) {
        console.error('Ошибка восстановления состояния:', error);
      }
    }
  }, []);

  // Обработчик клика на waveform для перемотки
  // ===== ОПТИМИЗАЦИЯ: Throttled setState для визуальных эффектов =====
  // ===== SEEK BAR: Состояние scrubbing =====
  const [isScrubbing, setIsScrubbing] = useState(false);
  const scrubbingRef = useRef(false);
  
  // ===== SEEK BAR: Клик по waveform =====
  const handleWaveformClick = (e) => {
    const duration = audioEngine.getDuration();
    
    // Защита: если нет src или duration неизвестна
    if (!audioUrl || !duration || !isFinite(duration) || duration === 0) return;
    
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    const targetTime = ratio * duration;
    
    // Seek через Audio Engine
    audioEngine.seek(targetTime);
    setCurrentTime(targetTime);
  };
  
  // ===== SEEK BAR: Pointer Events для drag =====
  const handleWaveformPointerDown = (e) => {
    const duration = audioEngine.getDuration();
    if (!audioUrl || !duration || !isFinite(duration) || duration === 0) return;
    
    const container = e.currentTarget;
    container.setPointerCapture(e.pointerId);
    
    setIsScrubbing(true);
    scrubbingRef.current = true;
    
    // Сразу применяем seek
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    const targetTime = ratio * duration;
    
    audioEngine.seek(targetTime);
    setCurrentTime(targetTime);
  };
  
  const handleWaveformPointerMove = (e) => {
    if (!scrubbingRef.current) return;
    
    const duration = audioEngine.getDuration();
    if (!duration || !isFinite(duration) || duration === 0) return;
    
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    const targetTime = ratio * duration;
    
    audioEngine.seek(targetTime);
    setCurrentTime(targetTime);
  };
  
  const handleWaveformPointerUp = (e) => {
    if (!scrubbingRef.current) return;
    
    const container = e.currentTarget;
    container.releasePointerCapture(e.pointerId);
    
    setIsScrubbing(false);
    scrubbingRef.current = false;
  };
  
  const handleWaveformPointerCancel = (e) => {
    if (!scrubbingRef.current) return;
    
    setIsScrubbing(false);
    scrubbingRef.current = false;
  };

  // Конфигурация панелей
  const panelConfig = {
    templates: {
      title: 'ВИЗУАЛЫ',
      subtitle: 'by levakand',
      showLoader: true,
    },
    text: {
      title: 'Текст',
      subtitle: 'Оформление трека',
      showLoader: false,
    },
    cover: {
      title: 'ИМПУЛЬС',
      subtitle: 'Коллекция реакций',
      showLoader: false,
    },
    background: {
      title: 'Фон',
      subtitle: 'Настройка фона',
      showLoader: false,
    },
    form: {
      title: 'Форма',
      subtitle: 'Настройки формы',
      showLoader: false,
    },
    waves: {
      title: 'Волны',
      subtitle: 'Настройки волн',
      showLoader: false,
    },
    particles: {
      title: 'BG',
      subtitle: 'Видео фоны',
      showLoader: false,
    },
    social: {
      title: 'Соцсети',
      subtitle: 'Интеграция соцсетей',
      showLoader: false,
    },
    progressbars: {
      title: 'Прогресс бары',
      subtitle: 'Настройки прогресс баров',
      showLoader: false,
    },
  };

  // Функция для получения font-family по ID шрифта
  const getFontFamily = (fontId) => {
    const font = AVAILABLE_FONTS.find(f => f.id === fontId);
    if (!font || !font.file) return 'system-ui, sans-serif';
    if (fontId === 'tq') return '"TQ", system-ui, sans-serif';
    if (fontId === 'fyl') return '"Fyl", system-ui, sans-serif';
    return 'system-ui, sans-serif';
  };

  // Функция для получения letter-spacing значения
  const getLetterSpacing = (spacing, customValue) => {
    if (spacing === 'custom' && customValue !== undefined) {
      return `${customValue}em`;
    }
    if (spacing === 'tight') return '-0.02em';
    if (spacing === 'wide') return '0.05em';
    return 'normal';
  };

  // Функция для получения line-height значения
  const getLineHeight = (height, customValue) => {
    if (height === 'custom' && customValue !== undefined) {
      return `${customValue}`;
    }
    if (height === 'compact') return '1.2';
    return '1.5';
  };

  // Обработчик выбора инструмента
  const handleToolSelect = (toolId) => {
    // Проверяем фото для всех панелей кроме templates, background и particles (BG можно выбирать без фото)
    const panelsRequiringPhoto = ['text', 'cover', 'form', 'waves', 'social', 'progressbars'];
    if (panelsRequiringPhoto.includes(toolId) && !photoUrl) {
      setShowPhotoRequiredModal(true);
      return;
    }
    // Проверяем аудио для BG (particles)
    if (toolId === 'particles' && !audioDuration) {
      setShowAudioRequiredModal(true);
      return;
    }
    setActivePanel(toolId);
  };

  // Обработчик переключения панели инструментов
  const handleToolsToggle = () => {
    // Активируем анимации при первом взаимодействии
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
    setIsToolsOpen(!isToolsOpen);
  };

  // Рендер контента правой панели
  const renderPanelContent = () => {
    switch (activePanel) {
      case 'text':
        return (
          <div className="panel-content" style={{ padding: '10px', width: '100%' }}>
            {/* Поля ввода текста */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Имя артиста */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Имя артиста
                </label>
                <input
                  className="input"
                  type="text"
                  value={textArtistName}
                  onChange={(e) => setTextArtistName(e.target.value)}
                  placeholder="TQ Артист"
                  style={{
                    margin: '0',
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    padding: '8px 14px',
                    fontSize: '13px',
                    borderRadius: '9999px',
                    boxShadow: 'inset 2px 5px 10px rgb(5, 5, 5)',
                    color: '#fff',
                  }}
                />
              </div>

              {/* Название трека */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Название трека
                </label>
                <input
                  className="input"
                  type="text"
                  value={textTrackName}
                  onChange={(e) => setTextTrackName(e.target.value)}
                  placeholder="Toqibox"
                  style={{
                    margin: '0',
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    padding: '8px 14px',
                    fontSize: '13px',
                    borderRadius: '9999px',
                    boxShadow: 'inset 2px 5px 10px rgb(5, 5, 5)',
                    color: '#fff',
                  }}
                />
              </div>
            </div>

            {/* Разделитель */}
            <div style={{ 
              height: '1px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              marginTop: '8px',
              marginBottom: '8px'
            }}></div>

            {/* Основные настройки */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ 
                fontSize: '10px', 
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: '6px'
              }}>
                Основные
              </div>
              
              {/* Шрифт */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Шрифт
                </label>
                <select
                  value={textFont}
                  onChange={(e) => setTextFont(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '11px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {AVAILABLE_FONTS.map((font) => (
                    <option key={font.id} value={font.id} style={{ background: '#1a1a1a', color: '#fff' }}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Выравнивание */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Выравнивание
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { value: 'left', label: 'Лево' },
                    { value: 'center', label: 'По центру' },
                    { value: 'right', label: 'Право' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTextAlignment(value)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        background: textAlignment === value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                        border: `1px solid ${textAlignment === value ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Цвет */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Цвет
                </label>
                <div style={{ position: 'relative' }}>
                  {/* Кнопка для открытия color picker */}
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '6px',
                        background: textColor,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  </button>

                  {/* Кастомный color picker */}
                  {showColorPicker && (
                    <div
                      ref={colorPickerRef}
                      style={{
                        position: 'absolute',
                        top: '48px',
                        left: 0,
                        zIndex: 1000,
                        background: 'rgba(18, 17, 17, 0.98)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        padding: '12px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                        minWidth: '220px',
                      }}
                    >
                      {/* Большой квадрат выбора цвета */}
                      <div
                        style={{
                          width: '200px',
                          height: '200px',
                          position: 'relative',
                          marginBottom: '12px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          cursor: 'crosshair',
                          background: `linear-gradient(to right, hsl(${colorPickerHue}, 100%, 50%), transparent),
                                      linear-gradient(to top, black, transparent)`,
                        }}
                        onMouseDown={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          const s = Math.round((x / rect.width) * 100);
                          const l = Math.round(100 - (y / rect.height) * 100);
                          setColorPickerSaturation(Math.max(0, Math.min(100, s)));
                          setColorPickerLightness(Math.max(0, Math.min(100, l)));
                          
                          const handleMove = (moveEvent) => {
                            const newX = moveEvent.clientX - rect.left;
                            const newY = moveEvent.clientY - rect.top;
                            const newS = Math.round((newX / rect.width) * 100);
                            const newL = Math.round(100 - (newY / rect.height) * 100);
                            setColorPickerSaturation(Math.max(0, Math.min(100, newS)));
                            setColorPickerLightness(Math.max(0, Math.min(100, newL)));
                          };
                          
                          const handleUp = () => {
                            document.removeEventListener('mousemove', handleMove);
                            document.removeEventListener('mouseup', handleUp);
                          };
                          
                          document.addEventListener('mousemove', handleMove);
                          document.addEventListener('mouseup', handleUp);
                        }}
                      >
                        {/* Индикатор выбранной позиции */}
                        <div
                          style={{
                            position: 'absolute',
                            left: `${colorPickerSaturation}%`,
                            top: `${100 - colorPickerLightness}%`,
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            border: '2px solid white',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.5)',
                          }}
                        />
                      </div>

                      {/* Ползунок оттенка (Hue) */}
                      <div style={{ marginBottom: '12px' }}>
                        <div
                          style={{
                            width: '100%',
                            height: '20px',
                            borderRadius: '10px',
                            background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                            position: 'relative',
                            cursor: 'pointer',
                          }}
                          onMouseDown={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const hue = Math.round((x / rect.width) * 360);
                            setColorPickerHue(Math.max(0, Math.min(360, hue)));
                            
                            const handleMove = (moveEvent) => {
                              const newX = moveEvent.clientX - rect.left;
                              const newHue = Math.round((newX / rect.width) * 360);
                              setColorPickerHue(Math.max(0, Math.min(360, newHue)));
                            };
                            
                            const handleUp = () => {
                              document.removeEventListener('mousemove', handleMove);
                              document.removeEventListener('mouseup', handleUp);
                            };
                            
                            document.addEventListener('mousemove', handleMove);
                            document.addEventListener('mouseup', handleUp);
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              left: `${(colorPickerHue / 360) * 100}%`,
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '4px',
                              height: '24px',
                              background: 'white',
                              borderRadius: '2px',
                              boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.5)',
                              pointerEvents: 'none',
                            }}
                          />
                        </div>
                      </div>

                      {/* RGB поля ввода */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        {['R', 'G', 'B'].map((label, index) => {
                          const r = parseInt(textColor.slice(1, 3), 16);
                          const g = parseInt(textColor.slice(3, 5), 16);
                          const b = parseInt(textColor.slice(5, 7), 16);
                          const values = [r, g, b];
                          
                          return (
                            <div key={label} style={{ flex: 1 }}>
                              <input
                                type="number"
                                min="0"
                                max="255"
                                value={values[index]}
                                onChange={(e) => {
                                  const val = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
                                  const newRgb = [...values];
                                  newRgb[index] = val;
                                  const newHex = `#${newRgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
                                  setTextColor(newHex);
                                  const newHsl = hexToHsl(newHex);
                                  setColorPickerHue(newHsl.h);
                                  setColorPickerSaturation(newHsl.s);
                                  setColorPickerLightness(newHsl.l);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '6px 8px',
                                  background: 'rgba(0, 0, 0, 0.3)',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  borderRadius: '6px',
                                  color: '#fff',
                                  fontSize: '12px',
                                  textAlign: 'center',
                                  outline: 'none',
                                }}
                              />
                              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', marginTop: '4px' }}>
                                {label}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Текущий цвет и HEX */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: textColor,
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            flexShrink: 0,
                          }}
                        />
                        <input
                          type="text"
                          value={textColor.toUpperCase()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                              if (val.length === 7) {
                                setTextColor(val);
                                const hsl = hexToHsl(val);
                                setColorPickerHue(hsl.h);
                                setColorPickerSaturation(hsl.s);
                                setColorPickerLightness(hsl.l);
                              } else {
                                setTextColor(val);
                              }
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Читаемость */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Читаемость
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={textReadability}
                  onChange={(e) => setTextReadability(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px', textAlign: 'right' }}>
                  {Math.round(textReadability * 100)}%
                </div>
              </div>

              {/* Обводка */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Обводка
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {[
                    { value: false, label: 'Выкл' },
                    { value: true, label: 'Вкл' }
                  ].map(({ value, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setTextOutline(value)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: textOutline === value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                        border: `1px solid ${textOutline === value ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  {textOutline && (
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <button
                        type="button"
                        className="outline-color-picker-trigger"
                        onClick={() => setShowOutlineColorPicker(!showOutlineColorPicker)}
                        style={{
                          width: '32px',
                          height: '32px',
                          padding: '0',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '4px',
                            background: textOutlineColor,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        />
                      </button>

                      {showOutlineColorPicker && (
                        <div
                          ref={outlineColorPickerRef}
                          style={{
                            position: 'absolute',
                            top: '40px',
                            right: 0,
                            zIndex: 1001,
                            background: 'rgba(18, 17, 17, 0.98)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '10px',
                            padding: '8px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                            minWidth: '180px',
                          }}
                        >
                          {/* Компактный квадрат выбора цвета */}
                          <div
                            style={{
                              width: '160px',
                              height: '120px',
                              position: 'relative',
                              marginBottom: '6px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              cursor: 'crosshair',
                              background: `linear-gradient(to right, hsl(${outlinePickerHue}, 100%, 50%), transparent),
                                          linear-gradient(to top, black, transparent)`,
                            }}
                            onMouseDown={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const y = e.clientY - rect.top;
                              const s = Math.round((x / rect.width) * 100);
                              const l = Math.round(100 - (y / rect.height) * 100);
                              setOutlinePickerSat(Math.max(0, Math.min(100, s)));
                              setOutlinePickerLight(Math.max(0, Math.min(100, l)));
                              
                              const handleMove = (moveEvent) => {
                                const newX = moveEvent.clientX - rect.left;
                                const newY = moveEvent.clientY - rect.top;
                                const newS = Math.round((newX / rect.width) * 100);
                                const newL = Math.round(100 - (newY / rect.height) * 100);
                                setOutlinePickerSat(Math.max(0, Math.min(100, newS)));
                                setOutlinePickerLight(Math.max(0, Math.min(100, newL)));
                              };
                              
                              const handleUp = () => {
                                document.removeEventListener('mousemove', handleMove);
                                document.removeEventListener('mouseup', handleUp);
                              };
                              
                              document.addEventListener('mousemove', handleMove);
                              document.addEventListener('mouseup', handleUp);
                            }}
                          >
                            <div
                              style={{
                                position: 'absolute',
                                left: `${outlinePickerSat}%`,
                                top: `${100 - outlinePickerLight}%`,
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                border: '2px solid white',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.5)',
                              }}
                            />
                          </div>

                          {/* Ползунок оттенка */}
                          <div style={{ marginBottom: '6px' }}>
                            <div
                              style={{
                                width: '100%',
                                height: '14px',
                                borderRadius: '7px',
                                background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                                position: 'relative',
                                cursor: 'pointer',
                              }}
                              onMouseDown={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const newHue = Math.round((x / rect.width) * 360);
                                setOutlinePickerHue(Math.max(0, Math.min(360, newHue)));
                                
                                const handleMove = (moveEvent) => {
                                  const newX = moveEvent.clientX - rect.left;
                                  const newHue = Math.round((newX / rect.width) * 360);
                                  setOutlinePickerHue(Math.max(0, Math.min(360, newHue)));
                                };
                                
                                const handleUp = () => {
                                  document.removeEventListener('mousemove', handleMove);
                                  document.removeEventListener('mouseup', handleUp);
                                };
                                
                                document.addEventListener('mousemove', handleMove);
                                document.addEventListener('mouseup', handleUp);
                              }}
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  left: `${(outlinePickerHue / 360) * 100}%`,
                                  top: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  width: '2px',
                                  height: '18px',
                                  background: 'white',
                                  borderRadius: '1px',
                                  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.5)',
                                  pointerEvents: 'none',
                                }}
                              />
                            </div>
                          </div>

                          {/* HEX поле */}
                          <input
                            type="text"
                            value={textOutlineColor.toUpperCase()}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                                if (val.length === 7) {
                                  setTextOutlineColor(val);
                                  const hsl = hexToHsl(val);
                                  setOutlinePickerHue(hsl.h);
                                  setOutlinePickerSat(hsl.s);
                                  setOutlinePickerLight(hsl.l);
                                } else {
                                  setTextOutlineColor(val);
                                }
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '4px 6px',
                              background: 'rgba(0, 0, 0, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '10px',
                              fontFamily: 'monospace',
                              outline: 'none',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Тень */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Тень
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {[
                    { value: false, label: 'Выкл' },
                    { value: true, label: 'Вкл' }
                  ].map(({ value, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setTextShadow(value)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: textShadow === value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                        border: `1px solid ${textShadow === value ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  {textShadow && (
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <button
                        type="button"
                        className="shadow-color-picker-trigger"
                        onClick={() => setShowShadowColorPicker(!showShadowColorPicker)}
                        style={{
                          width: '32px',
                          height: '32px',
                          padding: '0',
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '4px',
                            background: textShadowColor,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        />
                      </button>

                      {showShadowColorPicker && (
                        <div
                          ref={shadowColorPickerRef}
                          style={{
                            position: 'absolute',
                            top: '40px',
                            right: 0,
                            zIndex: 1001,
                            background: 'rgba(18, 17, 17, 0.98)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '10px',
                            padding: '8px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                            minWidth: '180px',
                          }}
                        >
                          {/* Компактный квадрат выбора цвета */}
                          <div
                            style={{
                              width: '160px',
                              height: '120px',
                              position: 'relative',
                              marginBottom: '6px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              cursor: 'crosshair',
                              background: `linear-gradient(to right, hsl(${shadowPickerHue}, 100%, 50%), transparent),
                                          linear-gradient(to top, black, transparent)`,
                            }}
                            onMouseDown={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const y = e.clientY - rect.top;
                              const s = Math.round((x / rect.width) * 100);
                              const l = Math.round(100 - (y / rect.height) * 100);
                              setShadowPickerSat(Math.max(0, Math.min(100, s)));
                              setShadowPickerLight(Math.max(0, Math.min(100, l)));
                              
                              const handleMove = (moveEvent) => {
                                const newX = moveEvent.clientX - rect.left;
                                const newY = moveEvent.clientY - rect.top;
                                const newS = Math.round((newX / rect.width) * 100);
                                const newL = Math.round(100 - (newY / rect.height) * 100);
                                setShadowPickerSat(Math.max(0, Math.min(100, newS)));
                                setShadowPickerLight(Math.max(0, Math.min(100, newL)));
                              };
                              
                              const handleUp = () => {
                                document.removeEventListener('mousemove', handleMove);
                                document.removeEventListener('mouseup', handleUp);
                              };
                              
                              document.addEventListener('mousemove', handleMove);
                              document.addEventListener('mouseup', handleUp);
                            }}
                          >
                            <div
                              style={{
                                position: 'absolute',
                                left: `${shadowPickerSat}%`,
                                top: `${100 - shadowPickerLight}%`,
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                border: '2px solid white',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none',
                                boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.5)',
                              }}
                            />
                          </div>

                          {/* Ползунок оттенка */}
                          <div style={{ marginBottom: '6px' }}>
                            <div
                              style={{
                                width: '100%',
                                height: '14px',
                                borderRadius: '7px',
                                background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                                position: 'relative',
                                cursor: 'pointer',
                              }}
                              onMouseDown={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const newHue = Math.round((x / rect.width) * 360);
                                setShadowPickerHue(Math.max(0, Math.min(360, newHue)));
                                
                                const handleMove = (moveEvent) => {
                                  const newX = moveEvent.clientX - rect.left;
                                  const newHue = Math.round((newX / rect.width) * 360);
                                  setShadowPickerHue(Math.max(0, Math.min(360, newHue)));
                                };
                                
                                const handleUp = () => {
                                  document.removeEventListener('mousemove', handleMove);
                                  document.removeEventListener('mouseup', handleUp);
                                };
                                
                                document.addEventListener('mousemove', handleMove);
                                document.addEventListener('mouseup', handleUp);
                              }}
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  left: `${(shadowPickerHue / 360) * 100}%`,
                                  top: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  width: '2px',
                                  height: '18px',
                                  background: 'white',
                                  borderRadius: '1px',
                                  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.5)',
                                  pointerEvents: 'none',
                                }}
                              />
                            </div>
                          </div>

                          {/* HEX поле */}
                          <input
                            type="text"
                            value={textShadowColor.toUpperCase()}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                                if (val.length === 7) {
                                  setTextShadowColor(val);
                                  const hsl = hexToHsl(val);
                                  setShadowPickerHue(hsl.h);
                                  setShadowPickerSat(hsl.s);
                                  setShadowPickerLight(hsl.l);
                                } else {
                                  setTextShadowColor(val);
                                }
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '4px 6px',
                              background: 'rgba(0, 0, 0, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '10px',
                              fontFamily: 'monospace',
                              outline: 'none',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Фон-подложка */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Фон-подложка
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { value: false, label: 'Выкл' },
                    { value: true, label: 'Вкл' }
                  ].map(({ value, label }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setTextBackground(value)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: textBackground === value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                        border: `1px solid ${textBackground === value ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Разделитель */}
            <div style={{ 
              height: '1px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              marginTop: '12px',
              marginBottom: '12px'
            }}></div>

            {/* Типографика */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                Типографика
              </div>

              {/* Межбуквенное */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Межбуквенное
                </label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  {[
                    { value: 'tight', label: 'Плотно' },
                    { value: 'normal', label: 'Обычно' },
                    { value: 'wide', label: 'Широко' },
                    { value: 'custom', label: 'Своё' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setTextLetterSpacing(value);
                        if (value === 'tight') setTextLetterSpacingValue(-0.02);
                        if (value === 'normal') setTextLetterSpacingValue(0);
                        if (value === 'wide') setTextLetterSpacingValue(0.05);
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        background: textLetterSpacing === value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                        border: `1px solid ${textLetterSpacing === value ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="range"
                    min="-0.1"
                    max="0.2"
                    step="0.01"
                    value={textLetterSpacingValue}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTextLetterSpacingValue(val);
                      setTextLetterSpacing('custom');
                    }}
                    style={{
                      flex: 1,
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  />
                  <div style={{ 
                    fontSize: '10px', 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    minWidth: '50px',
                    textAlign: 'right',
                    fontFamily: 'monospace'
                  }}>
                    {textLetterSpacingValue > 0 ? '+' : ''}{textLetterSpacingValue.toFixed(2)}em
                  </div>
                </div>
              </div>

              {/* Межстрочное */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Межстрочное
                </label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  {[
                    { value: 'compact', label: 'Компактно' },
                    { value: 'normal', label: 'Обычно' },
                    { value: 'custom', label: 'Своё' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setTextLineHeight(value);
                        if (value === 'compact') setTextLineHeightValue(1.2);
                        if (value === 'normal') setTextLineHeightValue(1.5);
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 4px',
                        background: textLineHeight === value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                        border: `1px solid ${textLineHeight === value ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.1"
                    value={textLineHeightValue}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTextLineHeightValue(val);
                      setTextLineHeight('custom');
                    }}
                    style={{
                      flex: 1,
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  />
                  <div style={{ 
                    fontSize: '10px', 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    minWidth: '40px',
                    textAlign: 'right',
                    fontFamily: 'monospace'
                  }}>
                    {textLineHeightValue.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Разделитель */}
            <div style={{ 
              height: '1px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              marginTop: '12px',
              marginBottom: '12px'
            }}></div>

            {/* Анимация */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.9)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                Анимация
              </div>

              {/* Появление */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Появление
                </label>
                <div 
                  ref={appearanceDropdownRef}
                  className="appearance-dropdown"
                  style={{ position: 'relative', width: '100%' }}
                >
                  <button
                    type="button"
                    className={`appearance-dropdown-trigger ${showAppearanceDropdown ? 'active' : ''}`}
                    onClick={() => setShowAppearanceDropdown(!showAppearanceDropdown)}
                  >
                    <span>
                      {textAppearance === 'none' ? 'Нет' :
                       textAppearance === 'plavno' ? 'Плавно' :
                       textAppearance === 'plavno-up' ? 'Плавно вверх' :
                       textAppearance === 'snizu' ? 'Снизу' :
                       textAppearance === 'maska' ? 'Маска' :
                       textAppearance === 'razmytie' ? 'Размытие' :
                       textAppearance === 'micro-scale' ? 'Микро-масштаб' :
                       textAppearance === 'two-lines' ? 'Две строки' :
                       textAppearance === 'line' ? 'Линия' : 'Нет'}
                    </span>
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 12 12" 
                      fill="none" 
                      style={{
                        transform: showAppearanceDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {showAppearanceDropdown && (
                    <div 
                      className="appearance-dropdown-menu"
                    >
                      {[
                        { value: 'none', label: 'Нет' },
                        { value: 'plavno', label: 'Плавно' },
                        { value: 'plavno-up', label: 'Плавно вверх' },
                        { value: 'snizu', label: 'Снизу' },
                        { value: 'maska', label: 'Маска' },
                        { value: 'razmytie', label: 'Размытие' },
                        { value: 'micro-scale', label: 'Микро-масштаб' },
                        { value: 'two-lines', label: 'Две строки' },
                        { value: 'line', label: 'Линия' },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          className={`appearance-dropdown-item ${textAppearance === value ? 'active' : ''}`}
                          onClick={() => {
                            setTextAppearance(value);
                            setTextAnimationKey(prev => prev + 1);
                            setShowAppearanceDropdown(false);
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Дыхание */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Дыхание
                </label>
                <div 
                  ref={breathingDropdownRef}
                  className="appearance-dropdown"
                  style={{ position: 'relative', width: '100%' }}
                >
                  <button
                    type="button"
                    className={`appearance-dropdown-trigger ${showBreathingDropdown ? 'active' : ''}`}
                    onClick={() => setShowBreathingDropdown(!showBreathingDropdown)}
                  >
                    <span>
                      {textBreathing === 'none' ? 'Нет' :
                       textBreathing === 'pulse' ? 'Пульсация' :
                       textBreathing === 'fade' ? 'Прозрачность' :
                       textBreathing === 'soft-scale' ? 'Мягкое масштабирование' :
                       textBreathing === 'pulse-fade' ? 'Пульсация + Прозрачность' :
                       textBreathing === 'breathe-up' ? 'Дыхание вверх' :
                       textBreathing === 'soft-blur' ? 'Мягкое размытие' :
                       textBreathing === 'scale-fade' ? 'Масштаб + Прозрачность' :
                       textBreathing === 'color-pulse' ? 'Пульсация цвета' : 'Нет'}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {showBreathingDropdown && (
                    <div 
                      className="appearance-dropdown-menu"
                    >
                      {[
                        { value: 'none', label: 'Нет' },
                        { value: 'pulse', label: 'Пульсация' },
                        { value: 'fade', label: 'Прозрачность' },
                        { value: 'soft-scale', label: 'Мягкое масштабирование' },
                        { value: 'pulse-fade', label: 'Пульсация + Прозрачность' },
                        { value: 'breathe-up', label: 'Дыхание вверх' },
                        { value: 'soft-blur', label: 'Мягкое размытие' },
                        { value: 'scale-fade', label: 'Масштаб + Прозрачность' },
                        { value: 'color-pulse', label: 'Пульсация цвета' },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          className={`appearance-dropdown-item ${textBreathing === value ? 'active' : ''}`}
                          onClick={() => {
                            setTextBreathing(value);
                            setShowBreathingDropdown(false);
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Псевдо-3D */}
              {/* Наклон */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Наклон
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="1"
                    value={textRotate}
                    onChange={(e) => setTextRotate(parseInt(e.target.value))}
                    style={{
                      flex: 1,
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  />
                  <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', minWidth: '40px', textAlign: 'right' }}>
                    {textRotate > 0 ? '+' : ''}{textRotate}°
                  </div>
                </div>
              </div>

              {/* Горизонтальный поворот */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Горизонтальный поворот
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="1"
                    value={textRotateY}
                    onChange={(e) => setTextRotateY(parseInt(e.target.value))}
                    style={{
                      flex: 1,
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  />
                  <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', minWidth: '40px', textAlign: 'right' }}>
                    {textRotateY > 0 ? '+' : ''}{textRotateY}°
                  </div>
                </div>
              </div>

              {/* Перспектива */}
              <div>
                <label style={{ 
                  fontSize: '10px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Перспектива
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={textPerspective}
                    onChange={(e) => setTextPerspective(parseInt(e.target.value))}
                    style={{
                      flex: 1,
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  />
                  <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', minWidth: '40px', textAlign: 'right' }}>
                    {textPerspective > 0 ? '+' : ''}{textPerspective}°
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'cover':
        return (
          <div className="panel-content" style={{ padding: '12px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.85)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px'
            }}>
              Выберите эффект
            </div>

            {/* Кнопка НЕТ - отключить все эффекты */}
            <button
              type="button"
              onClick={() => setSelectedCoverEffect(null)}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedCoverEffect === null ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedCoverEffect === null ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                marginBottom: '8px',
              }}
            >
              НЕТ
            </button>

            {/* Эффект - Биение сердца */}
            <button
              type="button"
              onClick={() => setSelectedCoverEffect(selectedCoverEffect === 'beat' ? null : 'beat')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedCoverEffect === 'beat' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedCoverEffect === 'beat' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600 }}>Биение сердца</div>
              <div style={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                backgroundImage: `url(${srdImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px', 
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
              </div>
            </button>

            {/* Эффект - TQ Пульс */}
            <button
              type="button"
              onClick={() => setSelectedCoverEffect(selectedCoverEffect === 'pulse' ? null : 'pulse')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedCoverEffect === 'pulse' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedCoverEffect === 'pulse' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600 }}>TQ Пульс</div>
              <div style={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                backgroundImage: `url(${pulsImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px', 
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
              </div>
            </button>

            {/* Эффект - TQ Волны */}
            <button
              type="button"
              onClick={() => setSelectedCoverEffect(selectedCoverEffect === 'waves' ? null : 'waves')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedCoverEffect === 'waves' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedCoverEffect === 'waves' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600 }}>TQ Волны</div>
              <div style={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                backgroundImage: `url(${volniImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px', 
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
              </div>
            </button>

            {/* Эффект - TQ Плёнка */}
            <button
              type="button"
              onClick={() => setSelectedCoverEffect(selectedCoverEffect === 'grain' ? null : 'grain')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedCoverEffect === 'grain' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedCoverEffect === 'grain' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600 }}>TQ Плёнка</div>
              <div style={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                backgroundImage: `url(${zrnoImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px', 
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
              </div>
            </button>

            {/* Эффект - TQ Экспозиция */}
            <button
              type="button"
              onClick={() => setSelectedCoverEffect(selectedCoverEffect === 'exposure' ? null : 'exposure')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedCoverEffect === 'exposure' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedCoverEffect === 'exposure' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600 }}>TQ Экспозиция</div>
              <div style={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                backgroundImage: `url(${focusImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px', 
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
              </div>
            </button>

            {/* Эффект - TQ B/W */}
            <button
              type="button"
              onClick={() => setSelectedCoverEffect(selectedCoverEffect === 'bw' ? null : 'bw')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedCoverEffect === 'bw' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedCoverEffect === 'bw' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600 }}>TQ B/W</div>
              <div style={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                backgroundImage: `url(${tqbwImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px', 
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
              </div>
            </button>

            {/* Эффект - TQ Глитч */}
            <button
              type="button"
              onClick={() => setSelectedCoverEffect(selectedCoverEffect === 'glitch' ? null : 'glitch')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedCoverEffect === 'glitch' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedCoverEffect === 'glitch' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600 }}>TQ Глитч</div>
              <div style={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                backgroundImage: `url(${glishImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px', 
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
              </div>
            </button>

            {/* Эффект - TQ RGB */}
            <button
              type="button"
              onClick={() => setSelectedCoverEffect(selectedCoverEffect === 'rgb' ? null : 'rgb')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedCoverEffect === 'rgb' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedCoverEffect === 'rgb' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600 }}>TQ RGB</div>
              <div style={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                backgroundImage: `url(${rbgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px', 
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
              </div>
            </button>

            {/* Эффект - TQ MIRROR */}
            <button
              type="button"
              onClick={() => setSelectedCoverEffect(selectedCoverEffect === 'mirror' ? null : 'mirror')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedCoverEffect === 'mirror' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedCoverEffect === 'mirror' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600 }}>TQ MIRROR</div>
              <div style={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                backgroundImage: `url(${tqmirrorImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px', 
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
              </div>
            </button>

            {/* Эффект - TQ PIXELATE */}
            <button
              type="button"
              onClick={() => setSelectedCoverEffect(selectedCoverEffect === 'pixelate' ? null : 'pixelate')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedCoverEffect === 'pixelate' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedCoverEffect === 'pixelate' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600 }}>TQ PIXELATE</div>
              <div style={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                backgroundImage: `url(${pixelateImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '8px', 
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
              </div>
            </button>
          </div>
        );
      case 'background':
        return (
          <div className="panel-content" style={{ padding: '12px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.85)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px'
            }}>
              Цвет фона
            </div>

            {/* Выбор цвета фона */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '6px',
                    background: backgroundColor,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </button>

              {/* Кастомный color picker */}
              {showBackgroundColorPicker && (
                <div
                  ref={backgroundColorPickerRef}
                  style={{
                    position: 'absolute',
                    top: '48px',
                    left: 0,
                    zIndex: 1000,
                    background: 'rgba(18, 17, 17, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '10px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    minWidth: '170px',
                  }}
                >
                  {/* Большой квадрат выбора цвета */}
                  <div
                    style={{
                      width: '140px',
                      height: '140px',
                      position: 'relative',
                      marginBottom: '12px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'crosshair',
                      background: `linear-gradient(to right, hsl(${backgroundPickerHue}, 100%, 50%), transparent),
                                  linear-gradient(to top, black, transparent)`,
                    }}
                    onMouseDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const s = Math.round((x / rect.width) * 100);
                      const l = Math.round(100 - (y / rect.height) * 100);
                      setBackgroundPickerSaturation(Math.max(0, Math.min(100, s)));
                      setBackgroundPickerLightness(Math.max(0, Math.min(100, l)));
                      
                      const handleMove = (moveEvent) => {
                        const newX = moveEvent.clientX - rect.left;
                        const newY = moveEvent.clientY - rect.top;
                        const newS = Math.round((newX / rect.width) * 100);
                        const newL = Math.round(100 - (newY / rect.height) * 100);
                        setBackgroundPickerSaturation(Math.max(0, Math.min(100, newS)));
                        setBackgroundPickerLightness(Math.max(0, Math.min(100, newL)));
                      };
                      
                      const handleUp = () => {
                        document.removeEventListener('mousemove', handleMove);
                        document.removeEventListener('mouseup', handleUp);
                      };
                      
                      document.addEventListener('mousemove', handleMove);
                      document.addEventListener('mouseup', handleUp);
                    }}
                  >
                    {/* Индикатор выбранной позиции */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${backgroundPickerSaturation}%`,
                        top: `${100 - backgroundPickerLightness}%`,
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '2px solid white',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.5)',
                      }}
                    />
                  </div>

                  {/* Ползунок оттенка (Hue) */}
                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '100%',
                        height: '20px',
                        borderRadius: '10px',
                        background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      onMouseDown={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const hue = Math.round((x / rect.width) * 360);
                        setBackgroundPickerHue(Math.max(0, Math.min(360, hue)));
                        
                        const handleMove = (moveEvent) => {
                          const newX = moveEvent.clientX - rect.left;
                          const newHue = Math.round((newX / rect.width) * 360);
                          setBackgroundPickerHue(Math.max(0, Math.min(360, newHue)));
                        };
                        
                        const handleUp = () => {
                          document.removeEventListener('mousemove', handleMove);
                          document.removeEventListener('mouseup', handleUp);
                        };
                        
                        document.addEventListener('mousemove', handleMove);
                        document.addEventListener('mouseup', handleUp);
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: `${(backgroundPickerHue / 360) * 100}%`,
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '4px',
                          height: '24px',
                          background: 'white',
                          borderRadius: '2px',
                          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.5)',
                          pointerEvents: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* RGB поля ввода */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    {['R', 'G', 'B'].map((label, index) => {
                      const r = parseInt(backgroundColor.slice(1, 3), 16);
                      const g = parseInt(backgroundColor.slice(3, 5), 16);
                      const b = parseInt(backgroundColor.slice(5, 7), 16);
                      const values = [r, g, b];
                      
                      return (
                        <div key={label} style={{ flex: 1 }}>
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={values[index]}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
                              const newRgb = [...values];
                              newRgb[index] = val;
                              const newHex = `#${newRgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
                              setBackgroundColor(newHex);
                              const newHsl = hexToHsl(newHex);
                              setBackgroundPickerHue(newHsl.h);
                              setBackgroundPickerSaturation(newHsl.s);
                              setBackgroundPickerLightness(newHsl.l);
                            }}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              background: 'rgba(0, 0, 0, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '6px',
                              color: '#fff',
                              fontSize: '12px',
                              textAlign: 'center',
                              outline: 'none',
                            }}
                          />
                          <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', marginTop: '4px' }}>
                            {label}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Текущий цвет и HEX */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: backgroundColor,
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        flexShrink: 0,
                      }}
                    />
                    <input
                      type="text"
                      value={backgroundColor.toUpperCase()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                          if (val.length === 7) {
                            setBackgroundColor(val);
                            const hsl = hexToHsl(val);
                            setBackgroundPickerHue(hsl.h);
                            setBackgroundPickerSaturation(hsl.s);
                            setBackgroundPickerLightness(hsl.l);
                          } else {
                            setBackgroundColor(val);
                          }
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'form':
        return (
          <div className="panel-content">
            <div style={{ padding: '20px', color: 'rgba(255,255,255,0.7)' }}>Настройки формы</div>
          </div>
        );
      case 'waves':
        return (
          <div className="panel-content">
            <div style={{ padding: '20px', color: 'rgba(255,255,255,0.7)' }}>Настройки волн</div>
          </div>
        );
      case 'particles':
        // Переименовываем фоны для студии с TQ и названиями в стиле рэпа/хип-хопа
        const studioBackgrounds = ARTIST_HEADER_BACKGROUNDS.map((bg, index) => {
          const tqNames = [
            'TQ Cobweb Trap',
            'TQ Custom Flex',
            'TQ Hexagon Hustle',
            'TQ Tunnel Vision',
            'TQ Spin That Beat',
            'TQ FXAA Drop',
            'TQ Digital Bop',
            'TQ Galaxy Trip',
            'TQ Ice & Fire',
            'TQ Particle Swag',
            'TQ Rotating Flow',
            'TQ Wave Vibe',
            'TQ Flower Matrix',
            'TQ Photon Blast',
            'TQ Explosive Wave',
            'TQ Blob Flex',
            'TQ Spiral Wave',
            'TQ SINUS Flow',
            'TQ Lame Tunnel',
            'TQ Wave Lines',
            'TQ Raster Swag',
            'TQ Rotating Rings',
            'TQ Wave Distortion',
            'TQ Particle Explosion',
            'TQ Particle Explosion 2',
            'TQ Burisaba Circle',
            'TQ Butitoba Circle',
            'TQ Butitoba Circle 2',
            'TQ Fractal Wave',
          ];
          return {
            ...bg,
            name: tqNames[index] || `TQ ${bg.name}`
          };
        });
        
        return (
          <div className="panel-content" style={{ padding: '12px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.85)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'block',
              marginBottom: '12px'
            }}>
              Видео фоны
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {studioBackgrounds.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => {
                    setSelectedBgId(bg.id);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedBgId === bg.id ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.3)',
                    border: selectedBgId === bg.id ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '70px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                >
                  {/* Превью фона */}
                  {bg.type === 'shadertoy' && bg.shaderId && (
                    <div style={{
                      width: '85px',
                      height: '70px',
                      flexShrink: 0,
                      borderRadius: '4px',
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#000',
                    }}>
                      <ShaderToyPreview
                        backgroundId={bg.id}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </div>
                  )}
                  {/* Название и премиум метка */}
                  <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '4px',
                    minWidth: 0,
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{bg.name}</span>
                    {bg.premium && (
                      <span style={{ 
                        fontSize: '9px', 
                        color: 'rgba(255, 215, 0, 0.8)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        PREMIUM
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'social':
        return (
          <div className="panel-content" style={{ padding: '12px' }}>
            {/* Тумблер "Соцсети" */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                fontSize: '11px', 
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.85)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '8px'
              }}>
                Соцсети
              </label>
              <button
                type="button"
                onClick={() => setSocialEnabled(!socialEnabled)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: socialEnabled ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                  border: `1px solid ${socialEnabled ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {socialEnabled ? 'Включено' : 'Выключено'}
              </button>
            </div>

            {/* Поле "@username" */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                fontSize: '11px', 
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.85)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '8px'
              }}>
                @username
              </label>
              <input
                type="text"
                value={socialUsername}
                onChange={(e) => setSocialUsername(e.target.value)}
                placeholder="@levakandtj"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Тайминг появления/исчезновения */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
              <div>
                <label style={{ 
                  fontSize: '11px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Секунда старта
                </label>
                <input
                  type="number"
                  min="0"
                  max={MAX_AUDIO_DURATION}
                  step="0.1"
                  value={socialStartSec}
                  onChange={(e) => {
                    const nextStart = clampToMaxAudio(e.target.value);
                    const { s, d, e: endVal } = syncSocialTiming(nextStart, socialDurationSec, socialEndSec);
                    setSocialStartSec(s);
                    setSocialDurationSec(d);
                    setSocialEndSec(endVal);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  fontSize: '11px', 
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Длительность (сек)
                </label>
                <input
                  type="number"
                  min="0"
                  max={MAX_AUDIO_DURATION}
                  step="0.1"
                  value={socialDurationSec}
                  onChange={(e) => {
                    const nextDur = clampToMaxAudio(e.target.value);
                    const { s, d, e: endVal } = syncSocialTiming(socialStartSec, nextDur, socialEndSec);
                    setSocialStartSec(s);
                    setSocialDurationSec(d);
                    setSocialEndSec(endVal);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                fontSize: '11px', 
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.85)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '6px'
              }}>
                Секунда скрытия
              </label>
              <input
                type="number"
                min="0"
                max={MAX_AUDIO_DURATION}
                step="0.1"
                value={socialEndSec}
                onChange={(e) => {
                  const nextEnd = clampToMaxAudio(e.target.value);
                  const { s, d, e: endVal } = syncSocialTiming(socialStartSec, socialDurationSec, nextEnd);
                  setSocialStartSec(s);
                  setSocialDurationSec(d);
                  setSocialEndSec(endVal);
                }}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', marginBottom: '12px' }}>
              Аудио и таймеры ограничены 4 минутами (240 сек). Секунда скрытия должна быть ≥ секунды старта; длительность не может выходить за пределы.
            </div>

            {/* Сетка шаблонов */}
            <div>
              <label style={{ 
                fontSize: '11px', 
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.85)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '8px'
              }}>
                ВИЗУАЛЫ
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v1' ? null : 'v1')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v1' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v1' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  {/* Превью шаблона */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    pointerEvents: 'none',
                  }}>
                    {/* Иконка YouTube (превью) */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      borderRadius: '6px',
                    }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        backdropFilter: 'blur(0px)',
                        borderRadius: '8px',
                        border: '1px solid rgba(156, 156, 156, 0.466)',
                      }}>
                        <svg
                          viewBox="0 0 576 512"
                          fill="white"
                          height="1.2em"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ width: '18px', height: '18px' }}
                        >
                          <path
                            d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"
                          ></path>
                        </svg>
                      </div>
                      <div style={{
                        position: 'absolute',
                        content: '""',
                        width: '100%',
                        height: '100%',
                        background: '#ff0000',
                        zIndex: -1,
                        borderRadius: '8px',
                        pointerEvents: 'none',
                      }}></div>
                    </div>
                    
                    {/* Текст @username (превью) */}
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: 'EducationalGothic, sans-serif',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V2 - Instagram */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v2' ? null : 'v2')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v2' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v2' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  {/* Превью шаблона */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    pointerEvents: 'none',
                  }}>
                    {/* Иконка Instagram (превью) */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="1.2em"
                        viewBox="0 0 448 512"
                        style={{ width: '18px', height: '18px' }}
                      >
                        <path
                          d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
                          fill="white"
                        ></path>
                      </svg>
                    </div>
                    
                    {/* Текст @username (превью) */}
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: 'EducationalGothic, sans-serif',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V3 - YouTube с иконкой Play */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v3' ? null : 'v3')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v3' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v3' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '12px',
                    marginTop: '8px',
                  }}
                >
                  {/* Превью шаблона */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    pointerEvents: 'none',
                  }}>
                    {/* Кнопка YouTube с Play иконкой (превью) */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #d32f2f',
                      padding: '0 8px',
                      textAlign: 'center',
                      width: '100px',
                      height: '32px',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      fontWeight: 'normal',
                      borderRadius: '3px',
                      background: '#e53935',
                      color: 'white',
                      boxShadow: '0 3px 0 #d32f2f, 0 3px 2px rgba(0, 0, 0, 0.2)',
                    }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        style={{ width: '16px', height: '16px', marginRight: '6px' }}
                      >
                        <path
                          d="M12 39c-.549 0-1.095-.15-1.578-.447A3.008 3.008 0 0 1 9 36V12c0-1.041.54-2.007 1.422-2.553a3.014 3.014 0 0 1 2.919-.132l24 12a3.003 3.003 0 0 1 0 5.37l-24 12c-.42.21-.885.315-1.341.315z"
                          fill="#ffffff"
                        ></path>
                      </svg>
                      <span style={{ fontSize: '10px' }}>YOUTUBE</span>
                    </div>
                    
                    {/* Текст @username (превью) */}
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: 'EducationalGothic, sans-serif',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V4 - YouTube с круглым hover эффектом */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v4' ? null : 'v4')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v4' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v4' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  {/* Превью шаблона */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    pointerEvents: 'none',
                  }}>
                    {/* Кнопка YouTube (превью) */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '8px',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                      background: '#CD201F',
                    }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 576 512"
                        style={{ width: '20px', height: '20px' }}
                        fill="white"
                      >
                        <path
                          d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"
                        ></path>
                      </svg>
                    </div>
                    
                    {/* Текст @username (превью) */}
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: 'EducationalGothic, sans-serif',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V5 - Telegram */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v5' ? null : 'v5')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v5' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v5' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  {/* Превью шаблона */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    pointerEvents: 'none',
                  }}>
                    {/* Кнопка Telegram (превью) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '45px',
                      height: '45px',
                      border: 'none',
                      borderRadius: '50%',
                      boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.199)',
                      background: '#24a1de',
                    }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        style={{ width: '25px', height: '25px' }}
                      >
                        <path
                          d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"
                          fill="white"
                        ></path>
                      </svg>
                    </div>
                    
                    {/* Текст @username (превью) */}
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: 'EducationalGothic, sans-serif',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V6 - Telegram с hover эффектом */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v6' ? null : 'v6')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v6' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v6' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  {/* Превью шаблона */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    pointerEvents: 'none',
                  }}>
                    {/* Кнопка Telegram (превью) */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      borderRadius: '6px',
                    }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        backdropFilter: 'blur(0px)',
                        borderRadius: '8px',
                        border: '1px solid rgba(156, 156, 156, 0.466)',
                      }}>
                        <svg
                          viewBox="0 0 496 512"
                          height="1.2em"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="white"
                          style={{ width: '18px', height: '18px' }}
                        >
                          <path
                            d="M248 8C111 8 0 119 0 256S111 504 248 504 496 393 496 256 385 8 248 8zM363 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3 .7-104.6 69.1-14.8 10.2-26.9 9.9c-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3q.8-6.7 18.5-13.7 108.4-47.2 144.6-62.3c68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9a10.5 10.5 0 0 1 3.5 6.7A43.8 43.8 0 0 1 363 176.7z"
                            fill="white"
                          ></path>
                        </svg>
                      </div>
                      <div style={{
                        position: 'absolute',
                        content: '""',
                        width: '100%',
                        height: '100%',
                        background: '#24a1de',
                        zIndex: -1,
                        borderRadius: '8px',
                        pointerEvents: 'none',
                      }}></div>
                    </div>
                    
                    {/* Текст @username (превью) */}
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '13px',
                      fontWeight: 500,
                      fontFamily: 'EducationalGothic, sans-serif',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V7 - yo.svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v7' ? null : 'v7')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v7' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v7' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/yo.svg" alt="yo" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V8 - 45.svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v8' ? null : 'v8')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v8' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v8' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
                    <div style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/45.svg" alt="45" style={{ width: '26px', height: '26px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V9 - ddd.svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v9' ? null : 'v9')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v9' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v9' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/ddd.svg" alt="ddd" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V10 - ffddd.svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v10' ? null : 'v10')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v10' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v10' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/ffddd.svg" alt="ffddd" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V11 - ccxx.svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v11' ? null : 'v11')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v11' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v11' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/ccxx.svg" alt="ccxx" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V12 - ccc.svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v12' ? null : 'v12')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v12' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v12' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/ccc.svg" alt="ccc" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V13 - vv.svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v13' ? null : 'v13')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v13' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v13' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/vv.svg" alt="vv" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V14 - gff.svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v14' ? null : 'v14')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v14' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v14' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/gff.svg" alt="gff" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V15 - fddds.svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v15' ? null : 'v15')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v15' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v15' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/fddds.svg" alt="fddds" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V16 - dddse.svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v16' ? null : 'v16')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v16' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v16' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/dddse.svg" alt="dddse" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V17 - ccc).svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v17' ? null : 'v17')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v17' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v17' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/ccc).svg" alt="ccc)" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V18 - ty.svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v18' ? null : 'v18')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v18' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v18' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/ty.svg" alt="ty" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Шаблон V19 - ssss.svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v19' ? null : 'v19')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v19' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v19' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/ssss.svg" alt="ssss" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Разделитель PREMIUM */}
                <div style={{
                  marginTop: '24px',
                  marginBottom: '16px',
                  padding: '12px 0',
                  borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(18, 17, 17, 0.98)',
                  padding: '0 8px',
                  fontSize: '9px',
                    fontWeight: 700,
                  color: 'rgba(255, 215, 0, 0.85)',
                    textTransform: 'uppercase',
                  letterSpacing: '1px',
                    fontFamily: 'EducationalGothic, sans-serif',
                  }}>
                    PREMIUM
                  </div>
                </div>
                
                {/* Премиум шаблоны */}
                {/* V20 - srr.svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v20' ? null : 'v20')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v20' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v20' ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/srr.svg" alt="srr" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* V21 - sdsdsd.svg */}
                <button
                  type="button"
                  onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === 'v21' ? null : 'v21')}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: selectedSocialTemplate === 'v21' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${selectedSocialTemplate === 'v21' ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '4px',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                    <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="/soc/sdsdsd.svg" alt="sdsdsd" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '11px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                      {socialUsername}
                    </div>
                  </div>
                </button>
                
                {/* Генерация премиум шаблонов V22-V67 */}
                {[
                  { v: 'v22', file: '6yyy.svg', name: '6yyy' },
                  { v: 'v23', file: 'ffffs.svg', name: 'ffffs' },
                  { v: 'v24', file: 'uyu.svg', name: 'uyu' },
                  { v: 'v25', file: 'hghghg.svg', name: 'hghghg' },
                  { v: 'v26', file: '6565.svg', name: '6565' },
                  { v: 'v27', file: 'bbvbc.svg', name: 'bbvbc' },
                  { v: 'v28', file: 'rtt.svg', name: 'rtt' },
                  { v: 'v29', file: '554554.svg', name: '554554' },
                  { v: 'v30', file: 'cxcx.svg', name: 'cxcx' },
                  { v: 'v31', file: 'fdsfsdf.svg', name: 'fdsfsdf' },
                  { v: 'v32', file: 'gggdfgfd.svg', name: 'gggdfgfd' },
                  { v: 'v33', file: 'csccsc.svg', name: 'csccsc' },
                  { v: 'v34', file: 'fffde.svg', name: 'fffde' },
                  { v: 'v35', file: '5ty5t.svg', name: '5ty5t' },
                  { v: 'v36', file: 'h6h6h.svg', name: 'h6h6h' },
                  { v: 'v37', file: 'fffff3.svg', name: 'fffff3' },
                  { v: 'v38', file: 'scsc.svg', name: 'scsc' },
                  { v: 'v39', file: 'ddd32.svg', name: 'ddd32' },
                  { v: 'v40', file: '12.png', name: '12' },
                  { v: 'v41', file: '10464230.png', name: '10464230' },
                  { v: 'v42', file: '10464410.png', name: '10464410' },
                  { v: 'v43', file: '10900025.png', name: '10900025' },
                  { v: 'v44', file: 'connection.png', name: 'connection' },
                  { v: 'v45', file: 'social (1).png', name: 'social1' },
                  { v: 'v46', file: 'social.png', name: 'social' },
                  { v: 'v47', file: 'tik-tok (1).png', name: 'tiktok1' },
                  { v: 'v48', file: 'tiktok.png', name: 'tiktok' },
                  { v: 'v49', file: 'tik-tok.png', name: 'tik-tok' },
                  { v: 'v50', file: 'video.png', name: 'video' },
                  { v: 'v51', file: 'youtube.png', name: 'youtube' },
                  { v: 'v52', file: 'pngwing.com.png', name: 'pngwing1' },
                  { v: 'v53', file: 'pngwing.com (1).png', name: 'pngwing2' },
                  { v: 'v54', file: 'pngwing.com (2).png', name: 'pngwing3' },
                  { v: 'v55', file: 'pngwing.com (3).png', name: 'pngwing4' },
                  { v: 'v56', file: 'pngwing.com (4).png', name: 'pngwing5' },
                  { v: 'v57', file: 'pngwing.com (5).png', name: 'pngwing6' },
                  { v: 'v58', file: 'pngwing.com (6).png', name: 'pngwing7' },
                  { v: 'v59', file: 'pngwing.com (7).png', name: 'pngwing8' },
                  { v: 'v60', file: 'pngwing.com (8).png', name: 'pngwing9' },
                  { v: 'v61', file: 'pngwing.com (9).png', name: 'pngwing10' },
                  { v: 'v62', file: 'pngwing.com (10).png', name: 'pngwing11' },
                  { v: 'v63', file: 'pngwing.com (11).png', name: 'pngwing12' },
                  { v: 'v64', file: 'pngwing.com (12).png', name: 'pngwing13' },
                  { v: 'v65', file: 'pngwing.com (13).png', name: 'pngwing14' },
                  { v: 'v66', file: 'pngwing.com (14).png', name: 'pngwing15' },
                  { v: 'v67', file: 'pngwing.com (15).png', name: 'pngwing16' },
                ].map(({ v, file, name }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedSocialTemplate(selectedSocialTemplate === v ? null : v)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: selectedSocialTemplate === v ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                      border: `2px solid ${selectedSocialTemplate === v ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
                      borderRadius: '6px',
                      color: '#fff',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '12px',
                      marginTop: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}>
                      <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={`/soc/${file}`} alt={name} style={{ width: '36px', height: '36px' }} />
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', fontWeight: 500, fontFamily: 'EducationalGothic, sans-serif' }}>
                        {socialUsername}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'progressbars':
        return (
          <div className="panel-content" style={{ padding: '12px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.85)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px'
            }}>
              Выберите шаблон
            </div>

            {/* Шаблон 22 - Минималистичный премиум */}
            <button
              type="button"
              onClick={() => setSelectedProgressBar(selectedProgressBar === 'custom-player-22' ? null : 'custom-player-22')}
              style={{
                width: '100%',
                padding: '10px',
                background: selectedProgressBar === 'custom-player-22' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-22' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                marginTop: '10px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Минималистичный премиум</div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'rgba(15, 15, 15, 0.95)', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '28px', pointerEvents: 'none', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ width: '100%', height: '2px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '1px', marginBottom: '24px', position: 'relative' }}>
                  <div style={{ width: '45%', height: '100%', background: 'linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)', borderRadius: '1px', boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', fontFamily: 'system-ui, -apple-system', fontWeight: 400, letterSpacing: '1px', zIndex: 1 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedProgressBar(selectedProgressBar === 'audio-player' ? null : 'audio-player')}
              style={{
                width: '100%',
                padding: '10px',
                background: selectedProgressBar === 'audio-player' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'audio-player' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>Аудио-плеер</div>

              <div 
                className="audio-player-preview"
                style={{
                  width: '100%',
                  height: '60px',
                  background: '#282828',
                  borderRadius: '6px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  pointerEvents: 'none',
                }}
              >
                <div 
                  style={{
                    width: '48px',
                    height: '48px',
                    background: photoUrl ? `url(${photoUrl})` : 'rgba(255, 255, 255, 0.2)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '50%',
                    flexShrink: 0,
                  }}
                ></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#fff', 
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '2px'
                  }}>
                    {textTrackName || 'Название трека'}
                  </div>
                  <div style={{ 
                    fontSize: '9px', 
                    color: '#b3b3b3',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {textArtistName || 'Исполнитель'}
                  </div>
                  <div style={{
                    width: '100%',
                    height: '2px',
                    background: '#4f4f4f',
                    borderRadius: '1px',
                    marginTop: '4px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: '50%',
                      height: '100%',
                      background: '#1db954',
                    }}></div>
                  </div>
                </div>
                <div style={{
                  width: '16px',
                  height: '16px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 16 16" fill="currentColor" height="12" width="12" xmlns="http://www.w3.org/2000/svg" style={{ color: 'white' }}>
                    <path fill="white" d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
                  </svg>
                </div>
              </div>
            </button>
            
            {/* Второй шаблон - Music Card */}
            <button
              type="button"
              onClick={() => setSelectedProgressBar(selectedProgressBar === 'music-card' ? null : 'music-card')}
              style={{
                width: '100%',
                padding: '10px',
                background: selectedProgressBar === 'music-card' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'music-card' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                marginTop: '10px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Music Card</div>

              <div 
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  margin: '0 auto',
                  background: '#ffffff',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  pointerEvents: 'none',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', color: '#eab308' }}>
                      <path d="M9 18V5l12-2v13"></path>
                      <circle cx="6" cy="18" r="3"></circle>
                      <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                    <div style={{ marginLeft: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                        {textTrackName || 'Timro Mann'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {textArtistName || 'Dibbya Subba'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', color: '#ef4444' }}>
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                    </svg>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', color: '#6b7280' }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                </div>
                <div style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', color: '#6b7280' }}>
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    </svg>
                    <div style={{ width: '100%', marginLeft: '12px' }}>
                      <div style={{
                        position: 'relative',
                        marginTop: '4px',
                        height: '4px',
                        background: '#e5e7eb',
                        borderRadius: '9999px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          background: '#eab308',
                          width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '50%',
                        }}></div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                      {audioDuration ? `${Math.round((currentTime / audioDuration) * 100)}%` : '50%'}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '12px',
                  }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(audioDuration || 0)}</span>
                  </div>
                </div>
              </div>
            </button>
            
            {/* Третий шаблон - Audio Player 2 */}
            <button
              type="button"
              onClick={handlePremiumClick}
              style={{
                width: '100%',
                padding: '10px',
                background: selectedProgressBar === 'audio-player-2' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'audio-player-2' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                marginTop: '10px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Audio Player 2
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffd700', background: 'rgba(255, 215, 0, 0.2)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>PREMIUM</span>
              </div>

              <div 
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  margin: '0 auto',
                  height: '60px',
                  background: '#f3f3f3',
                  borderRadius: '8px',
                  padding: '8px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <div style={{ fontSize: '12px', color: '#333', margin: 0, fontWeight: 500 }}>
                      {textTrackName || 'Song Title'}
                    </div>
                    <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>
                      {textArtistName || 'Artist'}
                    </p>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '3px',
                    background: '#ddd',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginBottom: '4px',
                  }}>
                    <div style={{
                      width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%',
                      height: '100%',
                      background: '#ff5500',
                    }}></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none', fontSize: '12px', color: '#666', marginRight: '6px', padding: 0, pointerEvents: 'none' }}>
                      <svg viewBox="0 0 16 16" fill="currentColor" height="12" width="12" xmlns="http://www.w3.org/2000/svg">
                        <path d="M.5 3.5A.5.5 0 0 0 0 4v8a.5.5 0 0 0 1 0V8.753l6.267 3.636c.54.313 1.233-.066 1.233-.697v-2.94l6.267 3.636c.54.314 1.233-.065 1.233-.696V4.308c0-.63-.693-1.01-1.233-.696L8.5 7.248v-2.94c0-.63-.692-1.01-1.233-.696L1 7.248V4a.5.5 0 0 0-.5-.5z"></path>
                      </svg>
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none', fontSize: '12px', color: '#666', marginRight: '6px', padding: 0, pointerEvents: 'none' }}>
                      <svg viewBox="0 0 16 16" fill="currentColor" height="12" width="12" xmlns="http://www.w3.org/2000/svg">
                        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
                      </svg>
                    </button>
                    <div style={{
                      width: '60px',
                      height: '3px',
                      background: '#ccc',
                      position: 'relative',
                      marginLeft: '8px',
                      borderRadius: '2px',
                    }}>
                      <div style={{
                        height: '100%',
                        background: '#666',
                        width: '50%',
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
            
            {/* Четвертый шаблон - Vinyl Player */}
            <button
              type="button"
              onClick={handlePremiumClick}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'vinyl-player' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'vinyl-player' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Vinyl Player
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffd700', background: 'rgba(255, 215, 0, 0.2)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>PREMIUM</span>
              </div>

              <div 
                style={{
                  width: '100%',
                  maxWidth: '288px',
                  margin: '0 auto',
                  height: '120px',
                  background: '#ffffff',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '16px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '60px', marginBottom: '8px' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', marginTop: '-16px', marginLeft: '-12px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      border: '3px solid #a1a1aa',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      backgroundImage: photoUrl ? `url(${photoUrl})` : 'black',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}></div>
                    <div style={{ position: 'absolute', zIndex: 10, width: '16px', height: '16px', background: 'white', border: '3px solid #a1a1aa', borderRadius: '50%', top: '24px', left: '24px' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', paddingLeft: '8px', overflow: 'hidden' }}>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: '#000', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{textTrackName || 'Music Name'}</p>
                    <p style={{ fontSize: '11px', color: '#71717a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{textArtistName || 'Singer & artist'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', margin: '0 8px', background: '#e0e7ff', borderRadius: '4px', minHeight: '12px', padding: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#71717a', paddingLeft: '8px', display: 'block' }}>{formatTime(currentTime)}</span>
                  <div style={{ flexGrow: 1, height: '3px', margin: '0 6px', background: '#d1d5db', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#666', width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%' }}></div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#71717a', paddingRight: '8px', display: 'block' }}>{formatTime(audioDuration || 0)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: '8px', gap: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="19 20 9 12 19 4 19 20"></polygon>
                    <line x1="5" y1="19" x2="5" y2="5"></line>
                  </svg>
                  {!isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="6" y="4" width="4" height="16"></rect>
                      <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 4 15 12 5 20 5 4"></polygon>
                    <line x1="19" y1="5" x2="19" y2="19"></line>
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </div>
              </div>
            </button>

            {/* Пятый шаблон - Video Player */}
            <button
              type="button"
              onClick={handlePremiumClick}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'video-player' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'video-player' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Video Player
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffd700', background: 'rgba(255, 215, 0, 0.2)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>PREMIUM</span>
              </div>

              <div 
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  pointerEvents: 'none',
                  position: 'relative',
                }}
              >
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(170, 163, 163, 0.356)',
                  borderRadius: '4px',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%',
                    height: '100%',
                    background: 'rgb(167, 57, 57)',
                    borderRadius: '4px',
                  }}></div>
                </div>
                <p style={{ fontSize: '0.85em', color: 'rgb(241, 239, 239)', margin: 0, textAlign: 'right' }}>
                  {formatTime(currentTime)} / {formatTime(audioDuration || 0)}
                </p>
              </div>
            </button>

            {/* Шестой шаблон - Music Card 2 */}
            <button
              type="button"
              onClick={() => setSelectedProgressBar(selectedProgressBar === 'music-card-2' ? null : 'music-card-2')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'music-card-2' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'music-card-2' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Music Card 2</div>

              <div 
                style={{
                  width: '100%',
                  height: '254px',
                  background: 'lightgrey',
                  borderRadius: '10px',
                  position: 'relative',
                  overflow: 'hidden',
                  pointerEvents: 'none',
                }}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
                  zIndex: 10,
                  position: 'absolute',
                  background: 'rgba(255, 255, 255, 0.55)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                  backdropFilter: 'blur(8.5px)',
                  WebkitBackdropFilter: 'blur(8.5px)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <span style={{
                    width: '70px',
                    border: '1px solid rgba(180, 177, 177, 0.308)',
                    display: 'block',
                    margin: '0 auto 12px',
                    textAlign: 'center',
                    fontSize: '10px',
                    borderRadius: '12px',
                    fontFamily: 'Roboto, sans-serif',
                    color: 'rgba(102, 100, 100, 0.911)',
                    padding: '4px',
                  }}>Music</span>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(216, 212, 212, 0.726)',
                    margin: '0 auto 30px',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg viewBox="0 0 16 16" fill="currentColor" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 13c0 1.105-1.12 2-2.5 2S4 14.105 4 13s1.12-2 2.5-2 2.5.895 2.5 2z"></path>
                      <path d="M9 3v10H8V3h1z" fillRule="evenodd"></path>
                      <path d="M8 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 13 2.22V4L8 5V2.82z"></path>
                    </svg>
                  </div>
                  <span style={{
                    width: '150px',
                    height: '20px',
                    fontSize: '12px',
                    fontWeight: 500,
                    fontFamily: 'Roboto, sans-serif',
                    padding: '0 5px',
                    margin: '0 auto',
                    display: 'block',
                    overflow: 'hidden',
                    textAlign: 'center',
                    color: 'rgba(50, 49, 51, 0.637)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}>{textTrackName || 'One piece first ending'}</span>
                  <span style={{
                    width: '120px',
                    height: '20px',
                    fontSize: '9px',
                    fontWeight: 500,
                    fontFamily: 'Roboto, sans-serif',
                    padding: '0 5px',
                    margin: '8px auto',
                    display: 'block',
                    overflow: 'hidden',
                    textAlign: 'center',
                    color: 'rgba(50, 49, 51, 0.637)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}>{textArtistName || 'Desconhecido'}</span>
                </div>
              </div>
            </button>

            {/* Седьмой шаблон - Green Audio Player */}
            <button
              type="button"
              onClick={() => setSelectedProgressBar(selectedProgressBar === 'green-audio-player' ? null : 'green-audio-player')}
              style={{
                width: '100%',
                padding: '10px',
                background: selectedProgressBar === 'green-audio-player' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'green-audio-player' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                marginTop: '10px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Green Audio Player</div>

              <div 
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#fff',
                  borderRadius: '6px',
                  boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.07)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ cursor: 'pointer' }}>
                  <svg viewBox="0 0 18 24" height="16" width="12" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 12L0 24V0" fillRule="evenodd" fill="#566574"></path>
                  </svg>
                </div>
                <div style={{ 
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '12px',
                  lineHeight: '14px',
                  color: '#55606e',
                  display: 'flex',
                  flexGrow: 1,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginLeft: '24px',
                  marginRight: '24px',
                }}>
                  <span>{formatTime(currentTime)}</span>
                  <div style={{
                    flexGrow: 1,
                    background: '#d8d8d8',
                    cursor: 'pointer',
                    position: 'relative',
                    marginLeft: '16px',
                    marginRight: '16px',
                    borderRadius: '2px',
                    height: '4px',
                  }}>
                    <div style={{
                      background: '#44bfa3',
                      borderRadius: 'inherit',
                      position: 'absolute',
                      width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%',
                      height: '100%',
                    }}></div>
                  </div>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ cursor: 'pointer' }}>
                    <svg viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z" fillRule="evenodd" fill="#566574"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            {/* Шаблон 8 - Минималистичный горизонтальный */}
            <button
              type="button"
              onClick={() => setSelectedProgressBar(selectedProgressBar === 'custom-player-8' ? null : 'custom-player-8')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'custom-player-8' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-8' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Минималистичный</div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'transparent', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px', pointerEvents: 'none' }}>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', marginBottom: '12px' }}>
                  <div style={{ width: '40%', height: '100%', background: '#fff', borderRadius: '2px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '12px' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
              </div>
            </button>

            {/* Шаблон 9 - Стеклянный (Glassmorphism) */}
            <button
              type="button"
              onClick={() => setSelectedProgressBar(selectedProgressBar === 'custom-player-9' ? null : 'custom-player-9')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'custom-player-9' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-9' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Стеклянный</div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'transparent', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px', pointerEvents: 'none' }}>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', marginBottom: '16px' }}>
                  <div style={{ width: '50%', height: '100%', background: 'rgba(255,255,255,0.8)', borderRadius: '3px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
              </div>
            </button>

            {/* Шаблон 10 - Неоморфный */}
            <button
              type="button"
              onClick={() => setSelectedProgressBar(selectedProgressBar === 'custom-player-10' ? null : 'custom-player-10')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'custom-player-10' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-10' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Неоморфный</div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'transparent', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '30px', pointerEvents: 'none' }}>
                <div style={{ width: '100%', height: '8px', background: '#d1d9e6', borderRadius: '4px', boxShadow: 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff', marginBottom: '20px', position: 'relative' }}>
                  <div style={{ width: '45%', height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '4px', boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4a5568', fontSize: '13px', fontWeight: 600 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
              </div>
            </button>

            {/* Шаблон 11 - Темный с неоном */}
            <button
              type="button"
              onClick={handlePremiumClick}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'custom-player-11' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-11' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Неоновый
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffd700', background: 'rgba(255, 215, 0, 0.2)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>PREMIUM</span>
              </div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'transparent', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px', pointerEvents: 'none' }}>
                <div style={{ width: '100%', height: '3px', background: '#1a1a1a', borderRadius: '2px', marginBottom: '16px', position: 'relative' }}>
                  <div style={{ width: '55%', height: '100%', background: '#00ff88', borderRadius: '2px', boxShadow: '0 0 10px rgba(0, 255, 136, 0.8)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00ff88', fontSize: '14px', fontFamily: 'monospace', textShadow: '0 0 10px rgba(0, 255, 136, 0.5)' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
              </div>
            </button>

            {/* Шаблон 12 - Градиентный */}
            <button
              type="button"
              onClick={() => setSelectedProgressBar(selectedProgressBar === 'custom-player-12' ? null : 'custom-player-12')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'custom-player-12' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-12' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Градиентный</div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'transparent', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '28px', pointerEvents: 'none' }}>
                <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.4)', borderRadius: '3px', marginBottom: '18px' }}>
                  <div style={{ width: '60%', height: '100%', background: '#fff', borderRadius: '3px', boxShadow: '0 2px 8px rgba(255,255,255,0.5)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '15px', fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
              </div>
            </button>

            {/* Шаблон 13 - Ретро */}
            <button
              type="button"
              onClick={handlePremiumClick}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'custom-player-13' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-13' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Ретро
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffd700', background: 'rgba(255, 215, 0, 0.2)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>PREMIUM</span>
              </div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'transparent', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px', pointerEvents: 'none' }}>
                <div style={{ width: '100%', height: '6px', background: '#1a0f0a', borderRadius: '3px', border: '1px solid #654321', marginBottom: '14px' }}>
                  <div style={{ width: '35%', height: '100%', background: 'linear-gradient(90deg, #ff6b35 0%, #f7931e 100%)', borderRadius: '3px', boxShadow: '0 0 8px rgba(255, 107, 53, 0.6)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff6b35', fontSize: '13px', fontFamily: 'monospace', textShadow: '0 0 5px rgba(255, 107, 53, 0.8)' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
              </div>
            </button>

            {/* Шаблон 14 - Футуристичный */}
            <button
              type="button"
              onClick={handlePremiumClick}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'custom-player-14' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-14' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Футуристичный
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffd700', background: 'rgba(255, 215, 0, 0.2)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>PREMIUM</span>
              </div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'transparent', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '26px', pointerEvents: 'none' }}>
                <div style={{ width: '100%', height: '4px', background: 'rgba(138, 43, 226, 0.2)', borderRadius: '2px', marginBottom: '16px', position: 'relative' }}>
                  <div style={{ width: '48%', height: '100%', background: 'linear-gradient(90deg, #8a2be2 0%, #ba55d3 100%)', borderRadius: '2px', boxShadow: '0 0 15px rgba(138, 43, 226, 0.8)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ba55d3', fontSize: '14px', fontFamily: 'monospace', fontWeight: 600, textShadow: '0 0 10px rgba(186, 85, 211, 0.6)' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
              </div>
            </button>

            {/* Шаблон 16 - Вертикальный карточный */}
            <button
              type="button"
              onClick={handlePremiumClick}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'custom-player-16' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-16' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Вертикальный
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffd700', background: 'rgba(255, 215, 0, 0.2)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>PREMIUM</span>
              </div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'transparent', borderRadius: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px', pointerEvents: 'none' }}>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.3)', borderRadius: '3px', marginTop: 'auto' }}>
                  <div style={{ width: '38%', height: '100%', background: '#fff', borderRadius: '3px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '13px', marginTop: '12px' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
              </div>
            </button>

            {/* Шаблон 17 - С визуализацией */}
            <button
              type="button"
              onClick={() => setSelectedProgressBar(selectedProgressBar === 'custom-player-17' ? null : 'custom-player-17')}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'custom-player-17' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-17' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>С визуализацией</div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'transparent', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '22px', pointerEvents: 'none', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: '60px', left: '0', right: '0', height: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3px', padding: '0 20px' }}>
                  {[...Array(20)].map((_, i) => (
                    <div key={i} style={{ width: '4px', height: `${20 + Math.random() * 60}%`, background: 'linear-gradient(180deg, #00d4ff 0%, #5b86e5 100%)', borderRadius: '2px', opacity: 0.7 }}></div>
                  ))}
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginBottom: '14px', zIndex: 1 }}>
                  <div style={{ width: '52%', height: '100%', background: 'linear-gradient(90deg, #00d4ff 0%, #5b86e5 100%)', borderRadius: '2px', boxShadow: '0 0 10px rgba(0, 212, 255, 0.6)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00d4ff', fontSize: '13px', fontFamily: 'monospace', zIndex: 1 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
              </div>
            </button>

            {/* Шаблон 18 - Голографический (PREMIUM) */}
            <button
              type="button"
              onClick={handlePremiumClick}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'custom-player-18' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-18' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Голографический
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffd700', background: 'rgba(255, 215, 0, 0.2)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>PREMIUM</span>
              </div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg, rgba(0, 150, 255, 0.1) 0%, rgba(255, 0, 150, 0.1) 100%)', borderRadius: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '28px', pointerEvents: 'none', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)', backgroundSize: '200% 200%', animation: 'shimmer 3s infinite' }}></div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(0, 150, 255, 0.2)', borderRadius: '3px', marginBottom: '18px', position: 'relative', zIndex: 1, boxShadow: '0 0 20px rgba(0, 150, 255, 0.3)' }}>
                  <div style={{ width: '55%', height: '100%', background: 'linear-gradient(90deg, #0096ff 0%, #ff0096 100%)', borderRadius: '3px', boxShadow: '0 0 25px rgba(0, 150, 255, 0.8), 0 0 15px rgba(255, 0, 150, 0.6)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '14px', fontWeight: 600, textShadow: '0 0 10px rgba(0, 150, 255, 0.8), 0 0 5px rgba(255, 0, 150, 0.6)', zIndex: 1 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
              </div>
            </button>

            {/* Шаблон 19 - Кинематографический (PREMIUM) */}
            <button
              type="button"
              onClick={handlePremiumClick}
              style={{
                width: '100%',
                padding: '10px',
                background: selectedProgressBar === 'custom-player-19' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-19' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '8px',
                color: '#fff',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                marginTop: '10px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-block', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Кинематографический
                </span>
                <span style={{ fontSize: '8px', fontWeight: 700, color: '#ffd700', background: 'rgba(255, 215, 0, 0.18)', padding: '1px 4px', borderRadius: '3px', letterSpacing: '0.35px', lineHeight: 1 }}>PREMIUM</span>
              </div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(20, 20, 20, 0.9) 100%)', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '18px', pointerEvents: 'none', position: 'relative', border: '1px solid rgba(255, 215, 0, 0.25)' }}>
                <div style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '2px', background: 'linear-gradient(90deg, transparent, #ffd700, transparent)' }}></div>
                <div style={{ width: '100%', height: '5px', background: 'rgba(255, 215, 0, 0.14)', borderRadius: '3px', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '50%', height: '100%', background: 'linear-gradient(90deg, #ffd700 0%, #ffed4e 100%)', borderRadius: '3px', boxShadow: '0 0 12px rgba(255, 215, 0, 0.65)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffd700', fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '1.2px', textShadow: '0 0 10px rgba(255, 215, 0, 0.8)', zIndex: 1 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '2px', background: 'linear-gradient(90deg, transparent, #ffd700, transparent)' }}></div>
              </div>
            </button>

            {/* Шаблон 20 - Неоморфный премиум (PREMIUM) */}
            <button
              type="button"
              onClick={handlePremiumClick}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'custom-player-20' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-20' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Неоморфный премиум
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffd700', background: 'rgba(255, 215, 0, 0.2)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>PREMIUM</span>
              </div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(145deg, #e0e0e0, #f5f5f5)', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '30px', pointerEvents: 'none', boxShadow: 'inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff' }}>
                <div style={{ width: '100%', height: '10px', background: 'linear-gradient(145deg, #d0d0d0, #e8e8e8)', borderRadius: '5px', marginBottom: '20px', boxShadow: 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff', position: 'relative' }}>
                  <div style={{ width: '48%', height: '100%', background: 'linear-gradient(145deg, #667eea, #764ba2)', borderRadius: '5px', boxShadow: '6px 6px 12px #bebebe, -6px -6px 12px #ffffff' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4a5568', fontSize: '14px', fontWeight: 700 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
              </div>
            </button>

            {/* Шаблон 21 - Анимированный градиент (PREMIUM) */}
            <button
              type="button"
              onClick={handlePremiumClick}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'custom-player-21' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-21' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Анимированный градиент
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffd700', background: 'rgba(255, 215, 0, 0.2)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>PREMIUM</span>
              </div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #4facfe, #667eea)', backgroundSize: '400% 400%', borderRadius: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '26px', pointerEvents: 'none', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)' }}></div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '3px', marginBottom: '16px', position: 'relative', zIndex: 1, backdropFilter: 'blur(10px)' }}>
                  <div style={{ width: '52%', height: '100%', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)', borderRadius: '3px', boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '14px', fontWeight: 600, textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)', zIndex: 1 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
              </div>
            </button>

            {/* Шаблон 15 - С обложкой слева */}
            <button
              type="button"
              onClick={handlePremiumClick}
              style={{
                width: '100%',
                padding: '12px',
                background: selectedProgressBar === 'custom-player-15' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                border: `1px solid ${selectedProgressBar === 'custom-player-15' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`,
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                С обложкой
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffd700', background: 'rgba(255, 215, 0, 0.2)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>PREMIUM</span>
              </div>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'transparent', borderRadius: '10px', display: 'flex', alignItems: 'center', padding: '16px', gap: '16px', pointerEvents: 'none' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ width: '100%', height: '5px', background: '#333', borderRadius: '3px', marginBottom: '12px' }}>
                    <div style={{ width: '42%', height: '100%', background: '#1db954', borderRadius: '3px' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '12px' }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(audioDuration || 0)}</span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        );
      case 'templates':
      default:
        const templates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76];
        
        const templateNames = {
          1: 'NONE',
          2: 'VOID', 3: 'NEXUS', 4: 'AURORA', 5: 'PULSE', 6: 'FLUX', 7: 'NEBULA', 8: 'QUANTUM', 9: 'COSMOS', 10: 'STELLAR',
          11: 'VORTEX', 12: 'MATRIX', 14: 'HYPER', 15: 'NEON', 16: 'PLASMA', 17: 'CRYSTAL', 18: 'FUSION', 19: 'RADIANT', 20: 'INFINITY',
          21: 'NOVA', 22: 'ECHO', 23: 'SPARK', 24: 'WAVE', 25: 'BEAM', 26: 'STREAM', 27: 'FLOW', 28: 'RUSH', 29: 'BURST', 30: 'BLAZE',
          31: 'FLARE', 32: 'GLOW', 33: 'SHINE', 34: 'LUSTER', 35: 'GLEAM', 36: 'TWINKLE', 37: 'SHIMMER', 38: 'RADIANCE', 39: 'ILLUMINE', 40: 'LUMINOUS',
          41: 'BRIGHT', 42: 'DAZZLE', 43: 'SPARKLE', 44: 'GLIMMER', 45: 'SANDGLASS', 46: 'FLOW', 47: 'VOID', 48: 'RINGS', 49: 'DOTS', 50: 'SPECTRUM',
          51: 'FRACTAL', 52: 'TUNNEL', 53: 'DICE', 54: 'CORE', 55: 'SPHERE', 56: 'GRID', 57: 'MILK', 58: 'PINK', 59: 'WAVE',           60: 'SLICE',
          61: 'GRID', 62: 'CIRCLES', 63: 'SURFACE', 64: 'SPHERE', 65: 'PARTICLES', 66: 'SPECTRO', 67: 'ORBITS', 68: 'LINES', 69: 'SPIRAL', 70: 'RINGS', 71: 'GEOMETRY', 72: 'TORUS', 73: 'SPHERE2', 74: 'CIRCLES2', 75: 'ROTATE', 76: 'MORPH'
        };
        
        return (
          <div className="templates-grid">
            {templates.map((templateNum, index) => (
            <button
                key={templateNum}
              type="button"
                className={`tpl ${selectedTemplate === templateNum ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTemplate(templateNum);
                  // Добавляем класс для эффекта переключения на канвасе
                  const canvas = canvasRef.current || document.querySelector('.canvas-16x9');
                  if (canvas) {
                    canvas.classList.add('template-switching');
                    setTimeout(() => {
                      canvas.classList.remove('template-switching');
                    }, 400);
                  }
                }}
              onMouseEnter={templateNum !== 1 ? canvasPreviewOn : undefined}
              onMouseLeave={templateNum !== 1 ? canvasPreviewOff : undefined}
            >
              <div className="tpl-thumb">
                {templateNum !== 1 && (
                  <ShaderToyPreview 
                    backgroundId={`template-${templateNum}`}
                    priority={index < 12} // Первые 12 - приоритетные
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                    }}
                  />
                )}
              </div>
            </button>
            ))}
          </div>
        );
    }
  };

  // hover feedback for canvas (visual only)
  const canvasPreviewOn = () => {
    const el = document.querySelector(".canvas");
    if (!el) return;
    el.classList.add("is-preview");
  };

  const canvasPreviewOff = () => {
    const el = document.querySelector(".canvas");
    if (!el) return;
    el.classList.remove("is-preview");
  };

  // Обработчик клика на кнопку "ФОТО"
  const handlePhotoClick = () => {
    console.log("Клик на кнопку ФОТО");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("fileInputRef.current не найден");
    }
  };

  // Обработчик клика на кнопку "ЗАГРУЗИТЬ" (АУДИО)
  const handleAudioClick = () => {
    console.log("Клик на кнопку ЗАГРУЗИТЬ АУДИО");
    if (audioInputRef.current) {
      audioInputRef.current.click();
    } else {
      console.error("audioInputRef.current не найден");
    }
  };

  // Обработчик сброса фото и аудио
  const handleReset = () => {
    // Сбрасываем фото
    setPhotoUrl(null);
    setPhotoKey(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Сбрасываем аудио
    setAudioFile(null);
    setAudioUrl(null);
    setAudioDuration(null);
    setWaveformData(null);
    setCurrentTime(0);
    setIsPlaying(false);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
    }
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
    
    // Очищаем localStorage
    localStorage.removeItem('studioPhotoKey');
    localStorage.removeItem('studioPhotoUrl');
    localStorage.removeItem('studioAudioData');
    
    console.log('Фото и аудио сброшены');
  };

  // Форматирование времени (секунды -> ММ:СС)
  const formatDuration = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Обработчик выбора аудио файла
  const handleAudioChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("Аудио файл не выбран");
      return;
    }

    // Проверка типа файла - только MP3
    if (!file.type.includes('audio/mpeg') && !file.name.toLowerCase().endsWith('.mp3')) {
      alert("Поддерживаются только MP3 файлы");
      e.target.value = "";
      return;
    }

    console.log("Выбран аудио файл:", file.name, file.type, file.size);

    // Очищаем предыдущее аудио если есть
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Очищаем AudioContext refs при загрузке нового аудио
    console.log('Очищаем AudioContext refs перед загрузкой нового аудио');
    if (bgSourceRef.current) {
      try {
        bgSourceRef.current.disconnect();
      } catch (e) {
        console.warn('Ошибка при отключении source:', e);
      }
      bgSourceRef.current = null;
    }
    if (bgAnalyserRef.current) {
      try {
        bgAnalyserRef.current.disconnect();
      } catch (e) {
        console.warn('Ошибка при отключении analyser:', e);
      }
      bgAnalyserRef.current = null;
    }
    audioSourceElementRef.current = null;

    try {
      // Создаем URL для файла и загружаем для получения длительности
      const newAudioUrl = URL.createObjectURL(file);
      const audio = new Audio(newAudioUrl);
      audio._hasMediaSource = false; // Помечаем что это НЕ подключено к AudioContext
      audio._isTemporary = true; // Это временный audio только для проверки длительности
      
      // Ждем загрузки метаданных
      await new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', () => {
          const duration = audio.duration;
          
          // Проверка длительности - строго до 4 минут (240 секунд)
          if (duration > 240) {
            URL.revokeObjectURL(newAudioUrl);
            alert(`Длительность аудио (${formatDuration(duration)}) превышает 4 минуты. Максимальная длительность: 04:00`);
            e.target.value = "";
            reject(new Error("Duration too long"));
            return;
          }

          console.log("Длительность аудио:", duration, formatDuration(duration));
          setAudioDuration(clampToMaxAudio(duration));
          setAudioFile(file);
          setAudioUrl(newAudioUrl); // Сохраняем URL для воспроизведения
          
          // Сохраняем аудио в IndexedDB для сохранения при переключении шаблонов
          try {
            const audioData = {
              name: file.name,
              type: file.type,
              size: file.size,
              duration: duration,
            };
            localStorage.setItem('studioAudioData', JSON.stringify(audioData));
            
            // Сохраняем файл в IndexedDB
            const dbName = 'studioDB';
            const dbVersion = 1;
            const request = indexedDB.open(dbName, dbVersion);
            
            request.onerror = () => {
              // IndexedDB недоступен (приватный режим или ограничения браузера) - не критично
              console.log('IndexedDB недоступен, аудио будет работать без сохранения в БД');
            };
            request.onsuccess = async () => {
              const db = request.result;
              const transaction = db.transaction(['audio'], 'readwrite');
              const store = transaction.objectStore('audio');
              // Сохраняем файл как Blob
              const blob = new Blob([file], { type: file.type });
              store.put({ id: 'current', blob: blob, name: file.name, type: file.type, data: audioData });
            };
            
            request.onupgradeneeded = (event) => {
              const db = event.target.result;
              if (!db.objectStoreNames.contains('audio')) {
                db.createObjectStore('audio', { keyPath: 'id' });
              }
            };
          } catch (err) {
            console.error('Ошибка сохранения аудио:', err);
          }
          
          resolve();
          
          // Извлекаем waveform данные асинхронно (после resolve)
          (async () => {
            try {
              const arrayBuffer = file.arrayBuffer ? await file.arrayBuffer() : await fileToArrayBuffer(file);
              const audioContext = new (window.AudioContext || window.webkitAudioContext)();
              const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
              const waveform = await extractWaveform(audioBuffer, 150);
              setWaveformData(waveform);
              audioContext.close();
            } catch (err) {
              console.error("Ошибка декодирования аудио для waveform:", err);
            }
          })();
        });
        
        audio.addEventListener('error', (err) => {
          URL.revokeObjectURL(newAudioUrl);
          console.error("Ошибка загрузки аудио:", err);
          alert("Ошибка при чтении аудио файла");
          e.target.value = "";
          reject(err);
        });
        
        audio.load();
      });
    } catch (error) {
      console.error("Ошибка обработки аудио:", error);
      if (error.message !== "Duration too long") {
        alert("Ошибка при обработке аудио файла");
      }
    }

    // Сбрасываем input для возможности повторной загрузки того же файла
    e.target.value = "";
  };

  // Обработчик выбора файла
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("Файл не выбран");
      return;
    }

    console.log("Выбран файл:", file.name, file.type, file.size);

    // В dev режиме сохраняем фото в IndexedDB
    if (import.meta.env.DEV) {
      console.log("🔧 Dev режим: сохраняем фото в IndexedDB");
      const localUrl = URL.createObjectURL(file);
      setPhotoKey("studio/photo-local");
      setPhotoUrl(localUrl);
      
      // Сохраняем фото в IndexedDB
      const dbName = 'studioDB';
      const dbVersion = 2; // Увеличиваем версию для создания photo store
      const request = indexedDB.open(dbName, dbVersion);
      
      request.onerror = () => {
        // IndexedDB недоступен (приватный режим или ограничения браузера) - не критично
        console.log('IndexedDB недоступен для фото, фото будет работать без сохранения в БД');
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('photo')) {
          db.createObjectStore('photo', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['photo'], 'readwrite');
        const store = transaction.objectStore('photo');
        const blob = new Blob([file], { type: file.type });
        store.put({ id: 'current', blob: blob, name: file.name, type: file.type });
        console.log('Фото сохранено в IndexedDB');
      };
      
      // Сохраняем ключ в localStorage
      localStorage.setItem('studioPhotoKey', 'studio/photo-local');
      
      // Сбрасываем input для возможности повторной загрузки того же файла
      e.target.value = "";
      return;
    }

    try {
      console.log("Начинаем загрузку фото в R2...");
      // Загружаем фото в R2 (только в продакшене)
      const { key, publicUrl } = await uploadCover({
        type: "studio_photo",
        id: "", // не используется для studio_photo
        file,
      });

      console.log("Фото загружено:", { key, publicUrl });
      setPhotoKey(key);
      setPhotoUrl(publicUrl);
      // Сохраняем фото в localStorage
      localStorage.setItem('studioPhotoUrl', publicUrl);
      localStorage.setItem('studioPhotoKey', key);
    } catch (error) {
      console.error("Ошибка загрузки фото:", error);
      alert("Ошибка загрузки фото: " + error.message);
    }

    // Сбрасываем input для возможности повторной загрузки того же файла
    e.target.value = "";
  };

  // Обработчик экспорта (заглушка)
  const handleExport = async () => {
    // TODO: Реализовать экспорт MP4
    
    // После успешного экспорта удаляем файл из R2
    if (photoKey) {
      // Для удаления нужен endpoint, но по требованиям V1 - просто очищаем state
      // Файл останется в R2, но будет перезаписан при следующей загрузке
      setPhotoUrl(null);
      setPhotoKey(null);
    }
  };

  // Функции для управления меню логотипа с задержкой
  const openLogoMenu = () => {
    if (logoMenuTimeoutRef.current) {
      clearTimeout(logoMenuTimeoutRef.current);
      logoMenuTimeoutRef.current = null;
    }
    setShowLogoMenu(true);
  };

  const closeLogoMenu = () => {
    if (logoMenuTimeoutRef.current) {
      clearTimeout(logoMenuTimeoutRef.current);
    }
    logoMenuTimeoutRef.current = setTimeout(() => {
      setShowLogoMenu(false);
    }, 300); // Увеличена задержка для плавного перехода мыши
  };

  const keepLogoMenuOpen = () => {
    if (logoMenuTimeoutRef.current) {
      clearTimeout(logoMenuTimeoutRef.current);
      logoMenuTimeoutRef.current = null;
    }
    // Убеждаемся, что меню открыто
    if (!showLogoMenu) {
      setShowLogoMenu(true);
    }
  };

  // Cleanup таймера при размонтировании
  useEffect(() => {
    return () => {
      if (logoMenuTimeoutRef.current) {
        clearTimeout(logoMenuTimeoutRef.current);
      }
    };
  }, []);

  // Закрытие меню при клике вне его
  useEffect(() => {
    if (!showLogoMenu) return;

    const handleClickOutside = (event) => {
      // Не закрываем, если клик на header-left или на само меню
      if (
        event.target.closest('.header-left') ||
        event.target.closest('[data-logo-menu]')
      ) {
        return;
      }
      // Закрываем меню при клике вне его
      setShowLogoMenu(false);
      if (logoMenuTimeoutRef.current) {
        clearTimeout(logoMenuTimeoutRef.current);
        logoMenuTimeoutRef.current = null;
      }
    };

    // Используем небольшую задержку, чтобы не закрыть меню сразу после открытия
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLogoMenu]);

  // Не рендерим UI пока стили не загружены
  if (!stylesLoaded) {
    return null;
  }

  return (
    <div className={`studio-page ${audioDuration ? 'with-audio-duration' : ''}`}>
      {/* HEADER */}
      <header className="studio-header" style={{ height: '48px', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: '12px', padding: '0 12px', borderBottom: '1px solid #3d3c3c', background: '#121111', position: 'relative', zIndex: 10002 }}>
        <div
          className="header-left"
          style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', cursor: 'pointer', zIndex: 10001 }}
          onMouseEnter={() => {
            if (logoMenuTimeoutRef.current) {
              clearTimeout(logoMenuTimeoutRef.current);
              logoMenuTimeoutRef.current = null;
            }
            setShowLogoMenu(true);
          }}
          onMouseLeave={closeLogoMenu}
        >
          <div className="studio-logo" style={{ width: '36px', height: '36px', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="/studio/assets/tq.png" alt="TQ" draggable="false" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          </div>

          <div className="studio-brand" style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
            <div className="studio-title" style={{ fontSize: '20px', letterSpacing: '3px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>STUDIO</div>
            <div className="studio-subtitle" style={{ marginTop: '-2px', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.45)', fontWeight: '500' }}>MUSIC VISUALS</div>
          </div>

          {showLogoMenu && (
            <div
              data-logo-menu="true"
              onMouseEnter={keepLogoMenuOpen}
              onMouseLeave={closeLogoMenu}
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                background: 'rgba(12, 12, 12, 0.97)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '6px 8px',
                minWidth: '180px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.55)',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                zIndex: 10000,
                pointerEvents: 'auto',
                visibility: 'visible',
                opacity: 1,
                transform: 'none',
              }}
            >
              <a
                href="https://toqibox.win"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  keepLogoMenuOpen();
                }}
                onMouseEnter={(e) => {
                  keepLogoMenuOpen();
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 6px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  fontSize: '12px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                <img
                  src="/assets/logotoqi.png"
                  alt="TOQIBOX"
                  style={{ width: '16px', height: '16px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                />
                <span>Главная TOQIBOX</span>
              </a>

              <a
                href="https://dushanbemotion.com"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  keepLogoMenuOpen();
                }}
                onMouseEnter={(e) => {
                  keepLogoMenuOpen();
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 6px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  fontSize: '12px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                <img
                  src="/assets/dm.png"
                  alt="DushanbeMotion"
                  style={{ width: '16px', height: '16px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                />
                <span>DushanbeMotion</span>
              </a>

              <a
                href="https://www.instagram.com/levakandtj/"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  keepLogoMenuOpen();
                }}
                onMouseEnter={(e) => {
                  keepLogoMenuOpen();
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 6px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  fontSize: '12px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                <img
                  src="/assets/inst.svg"
                  alt="Instagram"
                  style={{ width: '16px', height: '16px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                />
                <span>Instagram</span>
              </a>

              <a
                href="https://www.youtube.com/@LevakandProduction"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  keepLogoMenuOpen();
                }}
                onMouseEnter={(e) => {
                  keepLogoMenuOpen();
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 6px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  fontSize: '12px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                <img
                  src="/assets/you.svg"
                  alt="YouTube"
                  style={{ width: '16px', height: '16px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                />
                <span>YouTube</span>
              </a>

              <a
                href="https://t.me/levakandprod"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  keepLogoMenuOpen();
                }}
                onMouseEnter={(e) => {
                  keepLogoMenuOpen();
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 6px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  fontSize: '12px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                <img
                  src="/assets/tg.svg"
                  alt="Telegram"
                  style={{ width: '16px', height: '16px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                />
                <span>Telegram</span>
              </a>

              <a
                href="https://vk.com/levakand"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  keepLogoMenuOpen();
                }}
                onMouseEnter={(e) => {
                  keepLogoMenuOpen();
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 6px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#fff',
                  fontSize: '12px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                <img
                  src="/assets/vk.svg"
                  alt="VK"
                  style={{ width: '16px', height: '16px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                />
                <span>VK</span>
              </a>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/studio/pricing');
                }}
                onMouseEnter={(e) => {
                  keepLogoMenuOpen();
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(227,10,10,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                style={{
                  marginTop: '4px',
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(227, 10, 10, 0.55)',
                  background: 'linear-gradient(135deg, #e30a0a 0%, #ff3333 100%)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  transition: 'all 0.2s ease',
                }}
              >
                Тарифы
              </button>
            </div>
          )}
        </div>

        <div className="header-center" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          {/* Timeline - главный элемент */}
          {audioDuration && (
            <div className="timeline-container" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Компактные кнопки управления */}
              <div className="audio-controls-compact" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <button
                  type="button"
                  className="audio-btn-compact"
                  onClick={handlePlayPause}
                  disabled={!audioUrl}
                  title={!audioUrl ? "Сначала загрузите аудио" : (isPlaying ? "Пауза" : "Воспроизвести")}
                  style={{ opacity: audioUrl ? 1 : 0.5, cursor: audioUrl ? 'pointer' : 'not-allowed' }}
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <button
                  type="button"
                  className="audio-btn-compact"
                  onClick={handleStop}
                  disabled={!audioUrl}
                  title={!audioUrl ? "Сначала загрузите аудио" : "Стоп"}
                  style={{ opacity: audioUrl ? 1 : 0.5, cursor: audioUrl ? 'pointer' : 'not-allowed' }}
                >
                  ⏹
                </button>
                <button
                  type="button"
                  className="audio-btn-compact"
                  onClick={handleRewind}
                  disabled={!audioUrl}
                  title={!audioUrl ? "Сначала загрузите аудио" : "В начало"}
                  style={{ opacity: audioUrl ? 1 : 0.5, cursor: audioUrl ? 'pointer' : 'not-allowed' }}
                >
                  ⏮
                </button>
              </div>
              {/* Waveform - главный элемент timeline */}
              {waveformData && (
                <div 
                  className="audio-waveform" 
                  onClick={handleWaveformClick}
                  onPointerDown={handleWaveformPointerDown}
                  onPointerMove={handleWaveformPointerMove}
                  onPointerUp={handleWaveformPointerUp}
                  onPointerCancel={handleWaveformPointerCancel}
                  style={{ 
                    flex: 1, 
                    minWidth: 0, 
                    height: '32px', 
                    position: 'relative', 
                    cursor: audioUrl && audioDuration ? 'pointer' : 'not-allowed',
                    touchAction: 'none',
                    userSelect: 'none'
                  }}>
                  <svg viewBox="0 0 150 22" preserveAspectRatio="none" className="waveform-svg" style={{ width: '100%', height: '100%', display: 'block' }}>
                    <path
                      d={(() => {
                        let topPath = waveformData.reduce((path, value, index) => {
                          const x = index;
                          const y = 11 - (value * 9);
                          return path + (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
                        }, '');
                        let bottomPath = waveformData.reduceRight((path, value, index) => {
                          const x = index;
                          const y = 11 + (value * 9);
                          return path + ` L ${x} ${y}`;
                        }, '');
                        return topPath + bottomPath + ' Z';
                      })()}
                      fill="rgba(255, 255, 255, 0.2)"
                      stroke="none"
                    />
                    {audioDuration && currentTime >= 0 && (
                      <line
                        x1={(currentTime / audioDuration) * 150}
                        y1="0"
                        x2={(currentTime / audioDuration) * 150}
                        y2="22"
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth="1.5"
                        className="waveform-playhead"
                      />
                    )}
                  </svg>
                </div>
              )}
              {/* Время - читается сразу */}
              {audioDuration && (
                <div style={{ flexShrink: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', fontFamily: 'monospace', whiteSpace: 'nowrap', minWidth: '80px', textAlign: 'right' }}>
                  {formatTime(currentTime)} / {formatTime(audioDuration)}
                </div>
              )}
            </div>
          )}
          {/* Загрузка - на втором плане */}
          <div className="header-actions-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button type="button" className="btn-23" onClick={handleAudioClick}>
              <span className="text">АУДИО</span>
            <span aria-hidden="" className="marquee">
                МРЗ
            </span>
          </button>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/mpeg,.mp3"
            style={{ display: "none" }}
            onChange={handleAudioChange}
          />
          <button type="button" className="btn-23" onClick={handlePhotoClick}>
            <span className="text">ФОТО</span>
            <span aria-hidden="" className="marquee">
              16:9
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
            {(photoUrl || audioUrl) && (
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '4px 8px',
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  lineHeight: '1',
                  minWidth: 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
                title="Сбросить фото и аудио"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="button" data-text="Awesome" onClick={handleExport}>
            <span className="actual-text">&nbsp;ЭКСПОРТ&nbsp;</span>
            <span aria-hidden="true" className="hover-text">
              &nbsp;ЭКСПОРТ&nbsp;
            </span>
          </button>
        </div>
      </header>



      {/* Вертикальная панель инструментов */}
      <div ref={toolsPanelRef} className={`tools-panel ${isToolsOpen ? 'tools-panel-open' : ''} ${hasUserInteracted ? 'has-interacted' : ''}`}>
        <button
          type="button"
          className={`tool-btn ${activePanel === 'templates' ? 'active' : ''}`}
          onClick={() => handleToolSelect('templates')}
        >
          ВИЗУАЛЫ
        </button>
          <button
            type="button"
            className={`tool-btn ${activePanel === 'text' ? 'active' : ''}`}
            onClick={() => handleToolSelect('text')}
          >
            Текст
          </button>
          <button
            type="button"
            className={`tool-btn ${activePanel === 'cover' ? 'active' : ''}`}
            onClick={() => handleToolSelect('cover')}
          >
          Импульс
          </button>
          <button
            type="button"
            className={`tool-btn ${activePanel === 'background' ? 'active' : ''}`}
            onClick={() => handleToolSelect('background')}
          >
            Фон
          </button>
          <button
            type="button"
            className={`tool-btn ${activePanel === 'particles' ? 'active' : ''}`}
            onClick={() => handleToolSelect('particles')}
          >
          BG
          </button>
          <button
            type="button"
            className={`tool-btn ${activePanel === 'social' ? 'active' : ''}`}
            onClick={() => handleToolSelect('social')}
          >
            Соцсети
          </button>
          <button
            type="button"
            className={`tool-btn ${activePanel === 'progressbars' ? 'active' : ''}`}
            onClick={() => handleToolSelect('progressbars')}
          >
            P.BAR
          </button>
        </div>

      {/* BODY */}
      <main className="studio-root desktop">
        {/* CANVAS */}
        <section className="canvas-wrap">
          <div 
            ref={canvasRef}
            className={`canvas canvas-16x9 ${photoUrl ? 'has-photo' : ''} ${activePanel === 'background' ? 'background-active' : ''} ${selectedTemplate >= 2 && selectedTemplate <= 76 && selectedTemplate !== 13 ? 'has-template' : ''} ${isPlaying ? 'is-playing' : ''} ${hasUserInteracted ? 'has-interacted' : ''}`}
            style={{ 
              zIndex: 1, 
              backgroundColor: activePanel === 'background' ? backgroundColor : undefined,
              background: activePanel === 'background' ? backgroundColor : undefined,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
            onMouseDown={(e) => {
              // Предотвращаем выделение текста на канвасе
              if (!e.target.closest('.social-overlay-container')) {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  selection.removeAllRanges();
                }
              }
            }}
            onClick={(e) => {
              // Активируем анимации при первом взаимодействии
              if (!hasUserInteracted) {
                setHasUserInteracted(true);
              }
              if (e.target === e.currentTarget || e.target.closest('.canvas-image, .canvas-video')) {
                setIsPlayerSelected(false);
                setIsMusicCardSelected(false);
                setIsPlayer2Selected(false);
                setIsVinylPlayerSelected(false);
                setIsVideoPlayerSelected(false);
                setIsMusicCard2Selected(false);
                setIsGreenPlayerSelected(false);
                setIsSocialSelected(false);
              }
            }}
          >
            {/* Рендерим шаблоны (шейдеры) если выбраны (не шаблон 1 - НЕТ) */}
            {selectedTemplate >= 2 && selectedTemplate <= 76 && selectedTemplate !== 13 && (
              <div key={`template-${selectedTemplate}`} style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 10,
                pointerEvents: 'none',
                display: 'block',
                opacity: 1,
                visibility: 'visible',
                mixBlendMode: 'screen',
              }}>
                <ShaderToyBackground backgroundId={`template-${selectedTemplate}`} beatIntensity={bgBeatIntensity} />
              </div>
            )}
            {/* Рендерим выбранный фон на канвасе - работает бесконечно */}
            {selectedBgId && (() => {
              const selectedBg = ARTIST_HEADER_BACKGROUNDS.find(bg => bg.id === selectedBgId);
              if (!selectedBg) return null;
              
              if (selectedBg.type === 'shadertoy' && selectedBg.shaderId) {
                return (
                  <div key={`bg-${selectedBg.id}`} style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    pointerEvents: 'none',
                    display: 'block',
                    opacity: 1,
                    visibility: 'visible',
                    transform: `scale(${1 + bgBeatIntensity * 0.05})`, // Легкий эффект пульсации
                    transformOrigin: 'center center',
                    transition: 'transform 0.05s cubic-bezier(0.34, 1.56, 0.64, 1)', // Мгновенная резкая реакция
                  }}>
                    <ShaderToyBackground backgroundId={selectedBg.id} beatIntensity={bgBeatIntensity} />
                  </div>
                );
              } else if (selectedBg.type === 'vanta' && selectedBg.effectType) {
                return (
                  <div key={`bg-${selectedBg.id}`} style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    pointerEvents: 'none',
                    display: 'block',
                    opacity: 1,
                    visibility: 'visible',
                    transform: `scale(${1 + bgBeatIntensity * 0.05})`, // Легкий эффект пульсации
                    transformOrigin: 'center center',
                    transition: 'transform 0.05s cubic-bezier(0.34, 1.56, 0.64, 1)', // Мгновенная резкая реакция
                  }}>
                    <VantaHeaderBackground 
                      effectType={selectedBg.effectType}
                      color={selectedBg.color || 0xe30a0a}
                      color1={selectedBg.color1 || null}
                      color2={selectedBg.color2 || null}
                      beatIntensity={bgBeatIntensity}
                    />
                  </div>
                );
              }
              return null;
            })()}
            {photoUrl ? (
              <>
                <img
                  className="canvas-image"
                  src={photoUrl}
                  alt="Preview"
                  style={{
                    transform: selectedCoverEffect === 'waves' 
                      ? `translateX(${waveOffset}px) scale(${photoScale})`
                      : selectedCoverEffect === 'grain' || selectedCoverEffect === 'exposure' || selectedCoverEffect === 'bw' || selectedCoverEffect === 'glitch' || selectedCoverEffect === 'rgb' || selectedCoverEffect === 'mirror'
                        ? 'scale(1)'
                        : `scale(${photoScale})`,
                    transition: selectedCoverEffect === 'waves' 
                      ? 'none'
                      : selectedCoverEffect === 'grain'
                        ? 'none'
                        : selectedCoverEffect === 'pulse' 
                          ? 'filter 0.2s ease-out'
                          : selectedCoverEffect === 'exposure'
                            ? 'filter 0.3s ease-out' // Плавный переход для экспозиции
                          : selectedCoverEffect === 'bw'
                            ? 'filter 0.3s ease-out' // Плавный переход для возврата в цвет
                          : selectedCoverEffect === 'glitch' || selectedCoverEffect === 'rgb'
                            ? 'filter 0.05s ease-out' // Быстрый переход для глитча/RGB
                            : 'transform 0.15s ease-out',
                    filter: selectedCoverEffect === 'pulse' && audioDuration && currentTime < audioDuration
                      ? `brightness(${1 + pulseIntensity * 0.15}) contrast(${1 + pulseIntensity * 0.1})`
                      : selectedCoverEffect === 'exposure' && audioDuration && currentTime < audioDuration
                        ? `brightness(${1 + exposureIntensity * 0.25}) contrast(${1 + exposureIntensity * 0.15})` // Усиление яркости и контраста на пик
                        : selectedCoverEffect === 'bw' && audioDuration && currentTime < audioDuration
                          ? `saturate(${1 - bwIntensity})` // 0 = ч/б, 1 = цветное
                      : 'none',
                  }}
                />
                {/* Виньетка для эффекта ПУЛЬС */}
                {selectedCoverEffect === 'pulse' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `radial-gradient(ellipse at center, transparent ${60 - pulseIntensity * 10}%, rgba(0, 0, 0, ${0.15 + pulseIntensity * 0.25}) 100%)`,
                      pointerEvents: 'none',
                      zIndex: 1,
                      transition: 'background 0.2s ease-out',
                    }}
                  />
                )}
                {/* Плёночные царапины для эффекта ПЛЁНКА */}
                {selectedCoverEffect === 'grain' && (
                  <canvas
                    ref={grainCanvasRef}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      zIndex: 2,
                      mixBlendMode: 'normal',
                      opacity: grainPulseIntensity > 0 ? 1 : 0,
                      transition: 'opacity 0.05s ease-out',
                    }}
                  />
                )}
                {/* ГЛИТЧ эффект - RGB split (красный и cyan) как на картинке */}
                {selectedCoverEffect === 'glitch' && glitchIntensity > 0 && (
                  <>
                    {/* Красный канал - смещен вправо-вниз */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${photoUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        mixBlendMode: 'screen',
                        transform: `translate(${8 * glitchIntensity}px, ${4 * glitchIntensity}px)`,
                        filter: 'brightness(0.5) sepia(1) saturate(5) hue-rotate(0deg)',
                        opacity: glitchIntensity,
                        zIndex: 3,
                        pointerEvents: 'none',
                        transition: 'none',
                      }}
                    />
                    {/* Cyan канал - смещен влево-вверх */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${photoUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        mixBlendMode: 'screen',
                        transform: `translate(${-8 * glitchIntensity}px, ${-4 * glitchIntensity}px)`,
                        filter: 'brightness(0.5) sepia(1) saturate(5) hue-rotate(180deg)',
                        opacity: glitchIntensity,
                        zIndex: 3,
                        pointerEvents: 'none',
                        transition: 'none',
                      }}
                    />
                  </>
                )}
                {/* RGB эффект - цветные каналы накладываются друг на друга */}
                {selectedCoverEffect === 'rgb' && rgbIntensity > 0 && (
                  <>
                    {/* Красный канал */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${photoUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        mixBlendMode: 'multiply',
                        filter: 'brightness(1.2) contrast(1.1) saturate(0) sepia(1) saturate(3) hue-rotate(0deg)',
                        opacity: 0.4 * rgbIntensity,
                        zIndex: 3,
                        pointerEvents: 'none',
                        transition: 'opacity 0.1s ease-out',
                      }}
                    />
                    {/* Зеленый канал */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${photoUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        mixBlendMode: 'multiply',
                        filter: 'brightness(1.2) contrast(1.1) saturate(0) sepia(1) saturate(3) hue-rotate(90deg)',
                        opacity: 0.4 * rgbIntensity,
                        zIndex: 3,
                        pointerEvents: 'none',
                        transition: 'opacity 0.1s ease-out',
                      }}
                    />
                    {/* Синий канал */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${photoUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        mixBlendMode: 'multiply',
                        filter: 'brightness(1.2) contrast(1.1) saturate(0) sepia(1) saturate(3) hue-rotate(240deg)',
                        opacity: 0.4 * rgbIntensity,
                        zIndex: 3,
                        pointerEvents: 'none',
                        transition: 'opacity 0.1s ease-out',
                      }}
                    />
                  </>
                )}
                {/* MIRROR эффект - зеркальные отражения в разных местах */}
                {selectedCoverEffect === 'mirror' && mirrorVariants.map((variant) => {
                  let style = {
                    position: 'absolute',
                    backgroundImage: `url(${photoUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: variant.transform,
                    opacity: variant.opacity,
                    zIndex: 3,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s ease-out',
                  };

                  if (variant.type === 'horizontal') {
                    style[variant.position] = 0;
                    style.top = 0;
                    style.width = `${variant.size}%`;
                    style.height = '100%';
                  } else if (variant.type === 'vertical') {
                    style[variant.position] = 0;
                    style.left = 0;
                    style.width = '100%';
                    style.height = `${variant.size}%`;
                  } else if (variant.type === 'both') {
                    const [vertical, horizontal] = variant.position.split('-');
                    style[vertical] = 0;
                    style[horizontal] = 0;
                    style.width = `${variant.size}%`;
                    style.height = `${variant.size}%`;
                  }

                  return (
                    <div key={variant.id} style={style} />
                  );
                })}
                {/* PIXELATE эффект - пиксели появляются под бит поверх изображения */}
                {selectedCoverEffect === 'pixelate' && pixelateIntensity > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: `url(${photoUrl})`,
                      backgroundSize: `${100 / (8 + pixelateIntensity * 25)}%`, // Уменьшаем для пикселей
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      imageRendering: 'pixelated',
                      imageRendering: 'crisp-edges',
                      opacity: pixelateIntensity,
                      zIndex: 3,
                      pointerEvents: 'none',
                      transition: 'opacity 0.05s ease-out',
                      transform: `scale(${1 + pixelateIntensity * 0.1})`, // Небольшой эффект масштабирования
                      transformOrigin: 'center center',
                    }}
                  />
                )}
              </>
            ) : (
              <>
                {activePanel !== 'background' && !selectedBgId && (
              <video
                    ref={canvasVideoRef}
                className="canvas-video"
                src="/studio/assets/tqlogov.mp4"
                autoPlay
                loop
                muted
                playsInline
                    style={{ width: '180px', height: '180px' }}
                    onLoadedMetadata={(e) => {
                      // Синхронизируем видео с аудио при загрузке, если аудио есть
                      if (audioElementRef.current && audioDuration) {
                        const videoDuration = e.target.duration || 10;
                        if (videoDuration > 0) {
                          const audioTime = audioElementRef.current.currentTime || 0;
                          const loopedTime = audioTime % videoDuration;
                          e.target.currentTime = loopedTime;
                        }
                      }
                    }}
                  />
                )}
              </>
            )}
            {!photoUrl && activePanel !== 'background' && !selectedBgId && selectedTemplate === 1 && <div className="canvas-label">ПРЕДПРОСМОТР 16:9</div>}
            
            {/* Social overlay - показывается на канвасе когда шаблон выбран */}
            {selectedSocialTemplate && (
              <div 
                className="social-overlay-container"
                onMouseDown={handleSocialMouseDown}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  position: 'absolute',
                  left: `${socialOverlayPosition.x}px`,
                  bottom: `${socialOverlayPosition.y}px`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  zIndex: isSocialSelected ? 101 : 100,
                  pointerEvents: 'auto',
                  opacity: shouldShowSocialOverlay ? 1 : 0,
                  transform: `translateY(0) scale(${socialOverlaySize.scale})`,
                  transition: (isSocialDragging || isSocialResizing)
                    ? 'none'
                    : 'opacity 0.3s ease, transform 0.3s ease',
                  visibility: shouldShowSocialOverlay ? 'visible' : 'hidden',
                  cursor: isSocialDragging ? 'grabbing' : 'grab',
                  border: isSocialSelected ? '2px dashed rgba(255, 255, 255, 0.8)' : '2px solid transparent',
                  borderRadius: '8px',
                  padding: isSocialSelected ? '4px' : '0',
                  background: isSocialSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                }}
              >
                {/* Шаблон V1 - YouTube */}
                {selectedSocialTemplate === 'v1' && (
                  <button className="social-btn-youtube" style={{
                    width: `${45 * socialOverlaySize.scale}px`,
                    height: `${45 * socialOverlaySize.scale}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    background: 'transparent',
                    position: 'relative',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                  }}>
                    <span className="social-svg-container" style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'transparent',
                      backdropFilter: 'blur(0px)',
                      letterSpacing: '0.8px',
                      borderRadius: '10px',
                      transition: 'all 0.3s',
                      border: '1px solid rgba(156, 156, 156, 0.466)',
                    }}>
                      <svg
                        viewBox="0 0 576 512"
                        fill="white"
                        height="1.6em"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ width: '24px', height: '24px' }}
                      >
                        <path
                          d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"
                        ></path>
                      </svg>
                    </span>
                    <span className="social-bg" style={{
                      position: 'absolute',
                      content: '""',
                      width: '100%',
                      height: '100%',
                      background: '#ff0000',
                      zIndex: -1,
                      borderRadius: '10px',
                      pointerEvents: 'none',
                      transition: 'all 0.3s',
                    }}></span>
                  </button>
                )}
                
                {/* Шаблон V2 - Instagram */}
                {selectedSocialTemplate === 'v2' && (
                  <button className="social-btn-instagram" style={{
                    border: 'none',
                    borderRadius: '50%',
                    width: '45px',
                    height: '45px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transitionDuration: '.4s',
                    cursor: 'pointer',
                    position: 'relative',
                    background: '#f09433',
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    overflow: 'hidden',
                    pointerEvents: 'auto',
                  }}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      height="1.5em" 
                      viewBox="0 0 448 512" 
                      className="social-svg-icon-instagram"
                      style={{
                        transitionDuration: '.3s',
                      }}
                    >
                      <path 
                        d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
                        fill="white"
                      ></path>
                    </svg>
                    <span className="social-text-instagram" style={{
                      position: 'absolute',
                      color: 'rgb(255, 255, 255)',
                      width: '120px',
                      fontWeight: 600,
                      opacity: 0,
                      transitionDuration: '.4s',
                    }}>Instagram</span>
                  </button>
                )}
                
                {/* Шаблон V3 - YouTube с иконкой Play */}
                {selectedSocialTemplate === 'v3' && (
                  <button className="social-btn-youtube-v3" style={{
                    overflow: 'hidden',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #d32f2f',
                    fontFamily: '"Istok Web", sans-serif',
                    letterSpacing: '1px',
                    padding: '0 12px',
                    textAlign: 'center',
                    width: '120px',
                    height: '40px',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    fontWeight: 'normal',
                    borderRadius: '3px',
                    outline: 'none',
                    userSelect: 'none',
                    cursor: 'pointer',
                    transform: 'translateY(0px)',
                    position: 'relative',
                    boxShadow: 'inset 0 30px 30px -15px rgba(255, 255, 255, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.3), inset 0 1px 20px rgba(0, 0, 0, 0), 0 3px 0 #d32f2f, 0 3px 2px rgba(0, 0, 0, 0.2), 0 5px 10px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.1)',
                    background: '#e53935',
                    color: 'white',
                    textShadow: '0 1px 0 rgba(0, 0, 0, 0.3)',
                    transition: '150ms all ease-in-out',
                    pointerEvents: 'auto',
                  }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="social-icon-v3"
                      style={{
                        marginRight: '8px',
                        width: '24px',
                        height: '24px',
                        transition: 'all 0.5s ease-in-out',
                      }}
                    >
                      <path
                        d="M12 39c-.549 0-1.095-.15-1.578-.447A3.008 3.008 0 0 1 9 36V12c0-1.041.54-2.007 1.422-2.553a3.014 3.014 0 0 1 2.919-.132l24 12a3.003 3.003 0 0 1 0 5.37l-24 12c-.42.21-.885.315-1.341.315z"
                        fill="#ffffff"
                      ></path>
                    </svg>
                    <span className="social-text-v3" style={{
                      transition: 'all 0.5s ease-in-out',
                    }}>YOUTUBE</span>
                  </button>
                )}
                
                {/* Шаблон V4 - YouTube с круглым hover эффектом */}
                {selectedSocialTemplate === 'v4' && (
                  <div style={{ position: 'relative' }}>
                    <button className="social-btn-youtube-v4" style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '8px',
                      borderRadius: '6px',
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
                      background: '#CD201F',
                      color: 'white',
                      fontFamily: 'sans-serif',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.5s ease',
                      pointerEvents: 'auto',
                      position: 'relative',
                    }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 576 512"
                        style={{ width: '24px', height: '24px' }}
                        fill="currentColor"
                      >
                        <path
                          d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"
                        ></path>
                      </svg>
                      <span className="social-text-youtube-v4" style={{
                        position: 'absolute',
                        opacity: 0,
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: 600,
                        transform: 'translateY(0)',
                        transition: 'all 0.7s ease',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                      }}>
                        Youtube
                      </span>
                    </button>
                  </div>
                )}
                
                {/* Шаблон V5 - Telegram */}
                {selectedSocialTemplate === 'v5' && (
                  <button className="social-btn-telegram-v5" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    width: '45px',
                    height: '45px',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transitionDuration: '0.3s',
                    boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.199)',
                    background: '#24a1de',
                    pointerEvents: 'auto',
                  }}>
                    <div className="social-sign-telegram-v5" style={{
                      width: '100%',
                      transitionDuration: '0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        style={{ width: '25px', height: '25px' }}
                      >
                        <path
                          d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"
                          fill="white"
                        ></path>
                      </svg>
                    </div>
                    <div className="social-text-telegram-v5" style={{
                      position: 'absolute',
                      right: '0%',
                      width: '0%',
                      opacity: 0,
                      color: 'white',
                      fontSize: '1.2em',
                      fontWeight: 600,
                      transitionDuration: '0.3s',
                    }}>
                      Telegram
                    </div>
                  </button>
                )}
                
                {/* Шаблон V6 - Telegram с hover эффектом */}
                {selectedSocialTemplate === 'v6' && (
                  <button className="social-btn-telegram-v6" style={{
                    width: '45px',
                    height: '45px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    background: 'transparent',
                    position: 'relative',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    pointerEvents: 'auto',
                  }}>
                    <span className="social-svg-container-telegram-v6" style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'transparent',
                      backdropFilter: 'blur(0px)',
                      letterSpacing: '0.8px',
                      borderRadius: '10px',
                      transition: 'all 0.3s',
                      border: '1px solid rgba(156, 156, 156, 0.466)',
                    }}>
                      <svg
                        viewBox="0 0 496 512"
                        height="1.6em"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="white"
                        style={{ width: '24px', height: '24px' }}
                      >
                        <path
                          d="M248 8C111 8 0 119 0 256S111 504 248 504 496 393 496 256 385 8 248 8zM363 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3 .7-104.6 69.1-14.8 10.2-26.9 9.9c-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3q.8-6.7 18.5-13.7 108.4-47.2 144.6-62.3c68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9a10.5 10.5 0 0 1 3.5 6.7A43.8 43.8 0 0 1 363 176.7z"
                          fill="white"
                        ></path>
                      </svg>
                    </span>
                    <span className="social-bg-telegram-v6" style={{
                      position: 'absolute',
                      content: '""',
                      width: '100%',
                      height: '100%',
                      background: '#24a1de',
                      zIndex: -1,
                      borderRadius: '10px',
                      pointerEvents: 'none',
                      transition: 'all 0.3s',
                    }}></span>
                  </button>
                )}
                
                {/* Шаблон V7 - yo.svg */}
                {selectedSocialTemplate === 'v7' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/soc/yo.svg" alt="yo" style={{ width: '45px', height: '45px', pointerEvents: 'auto', cursor: 'pointer', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', draggable: false }} />
                    <div style={{
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 500,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      fontFamily: 'EducationalGothic, sans-serif',
                      pointerEvents: 'none',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                )}
                
                {/* Шаблон V8 - 45.svg */}
                {selectedSocialTemplate === 'v8' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/soc/45.svg" alt="45" style={{ width: '45px', height: '45px', pointerEvents: 'auto', cursor: 'pointer' }} />
                    <div style={{
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 500,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      fontFamily: 'EducationalGothic, sans-serif',
                      pointerEvents: 'none',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                )}
                
                {/* Шаблон V9 - ddd.svg */}
                {selectedSocialTemplate === 'v9' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/soc/ddd.svg" alt="ddd" style={{ width: '45px', height: '45px', pointerEvents: 'auto', cursor: 'pointer' }} />
                    <div style={{
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 500,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      fontFamily: 'EducationalGothic, sans-serif',
                      pointerEvents: 'none',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                )}
                
                {/* Шаблон V10 - ffddd.svg */}
                {selectedSocialTemplate === 'v10' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/soc/ffddd.svg" alt="ffddd" style={{ width: '45px', height: '45px', pointerEvents: 'auto', cursor: 'pointer' }} />
                    <div style={{
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 500,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      fontFamily: 'EducationalGothic, sans-serif',
                      pointerEvents: 'none',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                )}
                
                {/* Шаблон V11 - ccxx.svg */}
                {selectedSocialTemplate === 'v11' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/soc/ccxx.svg" alt="ccxx" style={{ width: '45px', height: '45px', pointerEvents: 'auto', cursor: 'pointer' }} />
                    <div style={{
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 500,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      fontFamily: 'EducationalGothic, sans-serif',
                      pointerEvents: 'none',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                )}
                
                {/* Шаблон V12 - ccc.svg */}
                {selectedSocialTemplate === 'v12' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/soc/ccc.svg" alt="ccc" style={{ width: '45px', height: '45px', pointerEvents: 'auto', cursor: 'pointer' }} />
                    <div style={{
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 500,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      fontFamily: 'EducationalGothic, sans-serif',
                      pointerEvents: 'none',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                )}
                
                {/* Шаблон V13 - vv.svg */}
                {selectedSocialTemplate === 'v13' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/soc/vv.svg" alt="vv" style={{ width: '45px', height: '45px', pointerEvents: 'auto', cursor: 'pointer' }} />
                    <div style={{
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 500,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      fontFamily: 'EducationalGothic, sans-serif',
                      pointerEvents: 'none',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                )}
                
                {/* Шаблон V14 - gff.svg */}
                {selectedSocialTemplate === 'v14' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/soc/gff.svg" alt="gff" style={{ width: '45px', height: '45px', pointerEvents: 'auto', cursor: 'pointer' }} />
                    <div style={{
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 500,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      fontFamily: 'EducationalGothic, sans-serif',
                      pointerEvents: 'none',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                )}
                
                {/* Шаблон V15 - fddds.svg */}
                {selectedSocialTemplate === 'v15' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/soc/fddds.svg" alt="fddds" style={{ width: '45px', height: '45px', pointerEvents: 'auto', cursor: 'pointer' }} />
                    <div style={{
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 500,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      fontFamily: 'EducationalGothic, sans-serif',
                      pointerEvents: 'none',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                )}
                
                {/* Шаблон V16 - dddse.svg */}
                {selectedSocialTemplate === 'v16' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/soc/dddse.svg" alt="dddse" style={{ width: '45px', height: '45px', pointerEvents: 'auto', cursor: 'pointer' }} />
                    <div style={{
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 500,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      fontFamily: 'EducationalGothic, sans-serif',
                      pointerEvents: 'none',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                )}
                
                {/* Шаблон V17 - ccc).svg */}
                {selectedSocialTemplate === 'v17' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/soc/ccc).svg" alt="ccc)" style={{ width: '45px', height: '45px', pointerEvents: 'auto', cursor: 'pointer' }} />
                    <div style={{
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 500,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      fontFamily: 'EducationalGothic, sans-serif',
                      pointerEvents: 'none',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                )}
                
                {/* Шаблон V18 - ty.svg */}
                {selectedSocialTemplate === 'v18' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/soc/ty.svg" alt="ty" style={{ width: '45px', height: '45px', pointerEvents: 'auto', cursor: 'pointer' }} />
                    <div style={{
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 500,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      fontFamily: 'EducationalGothic, sans-serif',
                      pointerEvents: 'none',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                )}
                
                {/* Шаблон V19 - ssss.svg */}
                {selectedSocialTemplate === 'v19' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/soc/ssss.svg" alt="ssss" style={{ width: '45px', height: '45px', pointerEvents: 'auto', cursor: 'pointer' }} />
                    <div style={{
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 500,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      fontFamily: 'EducationalGothic, sans-serif',
                      pointerEvents: 'none',
                    }}>
                      {socialUsername}
                    </div>
                  </div>
                )}
                
                {/* Премиум шаблоны на канвасе V20-V67 */}
                {[
                  { v: 'v20', file: 'srr.svg' },
                  { v: 'v21', file: 'sdsdsd.svg' },
                  { v: 'v22', file: '6yyy.svg' },
                  { v: 'v23', file: 'ffffs.svg' },
                  { v: 'v24', file: 'uyu.svg' },
                  { v: 'v25', file: 'hghghg.svg' },
                  { v: 'v26', file: '6565.svg' },
                  { v: 'v27', file: 'bbvbc.svg' },
                  { v: 'v28', file: 'rtt.svg' },
                  { v: 'v29', file: '554554.svg' },
                  { v: 'v30', file: 'cxcx.svg' },
                  { v: 'v31', file: 'fdsfsdf.svg' },
                  { v: 'v32', file: 'gggdfgfd.svg' },
                  { v: 'v33', file: 'csccsc.svg' },
                  { v: 'v34', file: 'fffde.svg' },
                  { v: 'v35', file: '5ty5t.svg' },
                  { v: 'v36', file: 'h6h6h.svg' },
                  { v: 'v37', file: 'fffff3.svg' },
                  { v: 'v38', file: 'scsc.svg' },
                  { v: 'v39', file: 'ddd32.svg' },
                  { v: 'v40', file: '12.png' },
                  { v: 'v41', file: '10464230.png' },
                  { v: 'v42', file: '10464410.png' },
                  { v: 'v43', file: '10900025.png' },
                  { v: 'v44', file: 'connection.png' },
                  { v: 'v45', file: 'social (1).png' },
                  { v: 'v46', file: 'social.png' },
                  { v: 'v47', file: 'tik-tok (1).png' },
                  { v: 'v48', file: 'tiktok.png' },
                  { v: 'v49', file: 'tik-tok.png' },
                  { v: 'v50', file: 'video.png' },
                  { v: 'v51', file: 'youtube.png' },
                  { v: 'v52', file: 'pngwing.com.png' },
                  { v: 'v53', file: 'pngwing.com (1).png' },
                  { v: 'v54', file: 'pngwing.com (2).png' },
                  { v: 'v55', file: 'pngwing.com (3).png' },
                  { v: 'v56', file: 'pngwing.com (4).png' },
                  { v: 'v57', file: 'pngwing.com (5).png' },
                  { v: 'v58', file: 'pngwing.com (6).png' },
                  { v: 'v59', file: 'pngwing.com (7).png' },
                  { v: 'v60', file: 'pngwing.com (8).png' },
                  { v: 'v61', file: 'pngwing.com (9).png' },
                  { v: 'v62', file: 'pngwing.com (10).png' },
                  { v: 'v63', file: 'pngwing.com (11).png' },
                  { v: 'v64', file: 'pngwing.com (12).png' },
                  { v: 'v65', file: 'pngwing.com (13).png' },
                  { v: 'v66', file: 'pngwing.com (14).png' },
                  { v: 'v67', file: 'pngwing.com (15).png' },
                ].map(({ v, file }) => 
                  selectedSocialTemplate === v && (
                    <div key={v} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={`/soc/${file}`} alt={file} style={{ width: '45px', height: '45px', pointerEvents: 'auto', cursor: 'pointer' }} />
                      <div style={{
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: 500,
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                        fontFamily: 'EducationalGothic, sans-serif',
                      }}>
                        {socialUsername}
                      </div>
                    </div>
                  )
                ).filter(Boolean)}
                
                {/* Текст @username - показывается только для шаблонов V1-V6 (кнопки с эффектами) */}
                {selectedSocialTemplate && ['v1', 'v2', 'v3', 'v4', 'v5', 'v6'].includes(selectedSocialTemplate) && (
                  <div style={{
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 500,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                    fontFamily: 'EducationalGothic, sans-serif',
                    pointerEvents: 'none',
                  }}>
                    {socialUsername}
                  </div>
                )}
                
                {/* Ручка для изменения размера - показывается только когда элемент выделен */}
                {isSocialSelected && (
                  <div
                    className="social-resize-handle"
                    onMouseDown={handleSocialResizeMouseDown}
                    style={{
                      position: 'absolute',
                      bottom: '-8px',
                      right: '-8px',
                      width: '16px',
                      height: '16px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '2px solid rgba(255, 215, 0, 0.8)',
                      borderRadius: '50%',
                      cursor: 'nwse-resize',
                      zIndex: 102,
                      pointerEvents: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: 'rgba(255, 215, 0, 1)',
                      borderRadius: '2px',
                    }}></div>
                  </div>
                )}
              </div>
            )}
            
            {/* Текст на canvas (показывается только когда загружено фото) */}
            {photoUrl && (
              <div 
                className={[
                  'canvas-text-overlay',
                  textAppearance !== 'none' ? `text-anim--${textAppearance}` : '',
                  textAlignment === 'center' ? 'text-align-center' : '',
                  textBreathing !== 'none' && isPlaying ? `text-breathing--${textBreathing}` : ''
                ].filter(Boolean).join(' ')}
                key={textAnimationKey}
                data-align={textAlignment}
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: textAlignment === 'left' ? '24px' : textAlignment === 'center' ? '50%' : 'auto',
                  right: textAlignment === 'right' ? '24px' : 'auto',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  pointerEvents: 'none',
                  alignItems: textAlignment === 'left' ? 'flex-start' : textAlignment === 'center' ? 'center' : 'flex-end',
                  ...((textPerspective !== 0 || textRotateY !== 0) ? { 
                    perspective: '1200px',
                    perspectiveOrigin: 'center center'
                  } : {}),
                }}
              >
                {/* Имя артиста */}
                <div
                  className={textAppearance === 'two-lines' ? 'text-line-1' : ''}
                  style={{
                    fontFamily: getFontFamily(textFont),
                    fontSize: `${textFontSize}px`,
                    color: textColor,
                    textAlign: textAlignment,
                    lineHeight: getLineHeight(textLineHeight, textLineHeightValue),
                    letterSpacing: getLetterSpacing(textLetterSpacing, textLetterSpacingValue),
                    textShadow: textShadow ? `0 2px 8px ${textShadowColor}` : 'none',
                    WebkitTextStroke: textOutline ? `1px ${textOutlineColor}` : 'none',
                    WebkitTextFillColor: textColor,
                    backgroundColor: textBackground ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
                    padding: textBackground ? '4px 8px' : '0',
                    borderRadius: textBackground ? '4px' : '0',
                    opacity: textReadability,
                    transform: `${textRotate !== 0 ? `rotate(${textRotate}deg) ` : ''}${textRotateY !== 0 ? `rotateY(${textRotateY}deg) ` : ''}${textPerspective !== 0 ? `rotateX(${textPerspective}deg)` : ''}`.trim() || 'none',
                    transformStyle: (textPerspective !== 0 || textRotateY !== 0) ? 'preserve-3d' : 'flat',
                  }}
                >
                  {textArtistName}
                </div>
                
                {/* Название трека */}
                <div
                  className={textAppearance === 'two-lines' ? 'text-line-2' : ''}
                  style={{
                    fontFamily: getFontFamily('fyl'), // Всегда Fyl для названия трека
                    fontSize: `${textFontSize * 0.85}px`,
                    color: textColor,
                    textAlign: textAlignment,
                    lineHeight: getLineHeight(textLineHeight, textLineHeightValue),
                    letterSpacing: getLetterSpacing(textLetterSpacing, textLetterSpacingValue),
                    textShadow: textShadow ? `0 2px 8px ${textShadowColor}` : 'none',
                    WebkitTextStroke: textOutline ? `1px ${textOutlineColor}` : 'none',
                    WebkitTextFillColor: textColor,
                    backgroundColor: textBackground ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
                    padding: textBackground ? '4px 8px' : '0',
                    borderRadius: textBackground ? '4px' : '0',
                    opacity: textReadability,
                    transform: `${textRotate !== 0 ? `rotate(${textRotate}deg) ` : ''}${textRotateY !== 0 ? `rotateY(${textRotateY}deg) ` : ''}${textPerspective !== 0 ? `rotateX(${textPerspective}deg)` : ''}`.trim() || 'none',
                    transformStyle: (textPerspective !== 0 || textRotateY !== 0) ? 'preserve-3d' : 'flat',
                  }}
                >
                  {textTrackName}
                </div>
              </div>
            )}

            {/* Music Card шаблон */}
            {photoUrl && audioUrl && selectedProgressBar === 'music-card' && (
              <div 
                ref={musicCardRef}
                style={{
                  position: 'absolute',
                  left: `${musicCardPosition.x}%`,
                  top: `${musicCardPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${musicCardSize.width}px`,
                  maxWidth: '320px',
                  background: '#ffffff',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: isMusicCardDragging ? 'grabbing' : 'grab',
                  outline: isMusicCardSelected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setIsMusicCardSelected(true);
                  setIsMusicCardDragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  const mouseX = e.clientX;
                  const mouseY = e.clientY;
                  dragStartRef.current = {
                    mouseStartX: mouseX,
                    mouseStartY: mouseY,
                    playerStartX: musicCardPosition.x,
                    playerStartY: musicCardPosition.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setIsMusicCardSelected(true);
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', color: '#eab308' }}>
                      <path d="M9 18V5l12-2v13"></path>
                      <circle cx="6" cy="18" r="3"></circle>
                      <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                    <div style={{ marginLeft: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                        {textTrackName || 'Timro Mann'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {textArtistName || 'Dibbya Subba'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', color: '#ef4444' }}>
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                    </svg>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', color: '#6b7280' }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                </div>
                <div style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px', color: '#6b7280' }}>
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    </svg>
                    <div style={{ width: '100%', marginLeft: '12px' }}>
                      <div style={{
                        position: 'relative',
                        marginTop: '4px',
                        height: '4px',
                        background: '#e5e7eb',
                        borderRadius: '9999px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          background: '#eab308',
                          width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '50%',
                        }}></div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                      {audioDuration ? `${Math.round((currentTime / audioDuration) * 100)}%` : '50%'}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '12px',
                  }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(audioDuration || 0)}</span>
                  </div>
                </div>
                {isMusicCardSelected && (
                  <>
                    <div 
                      className="resize-handle resize-handle-se"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsMusicCardResizing(true);
                        dragStartRef.current = {
                          startWidth: musicCardSize.width,
                          startHeight: musicCardSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-sw"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsMusicCardResizing(true);
                        dragStartRef.current = {
                          startWidth: musicCardSize.width,
                          startHeight: musicCardSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-ne"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsMusicCardResizing(true);
                        dragStartRef.current = {
                          startWidth: musicCardSize.width,
                          startHeight: musicCardSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-nw"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsMusicCardResizing(true);
                        dragStartRef.current = {
                          startWidth: musicCardSize.width,
                          startHeight: musicCardSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                  </>
                )}
              </div>
            )}

            {/* Audio Player 2 шаблон */}
            {photoUrl && audioUrl && selectedProgressBar === 'audio-player-2' && (
              <div 
                ref={player2Ref}
                style={{
                  position: 'absolute',
                  left: `${player2Position.x}%`,
                  top: `${player2Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${player2Size.width}px`,
                  height: `${player2Size.height}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f3f3f3',
                  borderRadius: '8px',
                  padding: '8px',
                  boxSizing: 'border-box',
                  cursor: isPlayer2Dragging ? 'grabbing' : 'grab',
                  outline: isPlayer2Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle, .play-btn, .pause-btn, .skip-btn, .volume-btn, .volume-slider')) return;
                  e.stopPropagation();
                  setIsPlayer2Selected(true);
                  setIsPlayer2Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  const mouseX = e.clientX;
                  const mouseY = e.clientY;
                  dragStartRef.current = {
                    mouseStartX: mouseX,
                    mouseStartY: mouseY,
                    playerStartX: player2Position.x,
                    playerStartY: player2Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle, .play-btn, .pause-btn, .skip-btn, .volume-btn, .volume-slider')) {
                    setIsPlayer2Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                  }
                }}
              >
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <div style={{ fontSize: '16px', color: '#333', margin: 0, fontWeight: 500 }}>
                      {textTrackName || 'Song Title'}
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                      {textArtistName || 'Artist'}
                    </p>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '4px',
                    background: '#ddd',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginBottom: '4px',
                  }}>
                    <div style={{
                      width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%',
                      height: '100%',
                      background: '#ff5500',
                    }}></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                    <button 
                      className="skip-btn"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none', fontSize: '16px', color: '#666', marginRight: '8px', padding: 0 }}
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M.5 3.5A.5.5 0 0 0 0 4v8a.5.5 0 0 0 1 0V8.753l6.267 3.636c.54.313 1.233-.066 1.233-.697v-2.94l6.267 3.636c.54.314 1.233-.065 1.233-.696V4.308c0-.63-.693-1.01-1.233-.696L8.5 7.248v-2.94c0-.63-.692-1.01-1.233-.696L1 7.248V4a.5.5 0 0 0-.5-.5z"></path>
                      </svg>
                    </button>
                    {!isPlaying ? (
                      <button 
                        className="play-btn"
                        onClick={handlePlayPause}
                        disabled={!audioUrl}
                        style={{ background: 'none', border: 'none', cursor: audioUrl ? 'pointer' : 'not-allowed', outline: 'none', fontSize: '16px', color: '#666', marginRight: '8px', padding: 0, opacity: audioUrl ? 1 : 0.5 }}
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                          <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
                        </svg>
                      </button>
                    ) : (
                      <button 
                        className="pause-btn"
                        onClick={handlePlayPause}
                        disabled={!audioUrl}
                        style={{ background: 'none', border: 'none', cursor: audioUrl ? 'pointer' : 'not-allowed', outline: 'none', fontSize: '16px', color: '#666', marginRight: '8px', padding: 0, opacity: audioUrl ? 1 : 0.5 }}
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                          <path fill="#424242" d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"></path>
                        </svg>
                      </button>
                    )}
                    <button 
                      className="volume-btn"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none', fontSize: '16px', color: '#666', marginRight: '8px', padding: 0 }}
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#424242" d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"></path>
                        <path fill="#424242" d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"></path>
                        <path fill="#424242" d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"></path>
                      </svg>
                    </button>
                    <div 
                      className="volume-slider"
                      style={{
                        width: '100px',
                        height: '5px',
                        background: '#ccc',
                        position: 'relative',
                        marginLeft: '10px',
                        borderRadius: '2px',
                      }}
                    >
                      <div style={{
                        height: '100%',
                        background: '#666',
                        width: '50%',
                      }}></div>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        background: '#666',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        cursor: 'pointer',
                      }}></div>
                    </div>
                  </div>
                </div>
                {isPlayer2Selected && (
                  <>
                    <div 
                      className="resize-handle resize-handle-se"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsPlayer2Resizing(true);
                        dragStartRef.current = {
                          startWidth: player2Size.width,
                          startHeight: player2Size.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-sw"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsPlayer2Resizing(true);
                        dragStartRef.current = {
                          startWidth: player2Size.width,
                          startHeight: player2Size.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-ne"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsPlayer2Resizing(true);
                        dragStartRef.current = {
                          startWidth: player2Size.width,
                          startHeight: player2Size.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-nw"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsPlayer2Resizing(true);
                        dragStartRef.current = {
                          startWidth: player2Size.width,
                          startHeight: player2Size.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                  </>
                )}
              </div>
            )}

            {/* Vinyl Player шаблон */}
            {photoUrl && audioUrl && selectedProgressBar === 'vinyl-player' && (
              <div 
                ref={vinylPlayerRef}
                style={{
                  position: 'absolute',
                  left: `${vinylPlayerPosition.x}%`,
                  top: `${vinylPlayerPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${vinylPlayerSize.width}px`,
                  height: `${vinylPlayerSize.height}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#ffffff',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '16px',
                  padding: '12px',
                  cursor: isVinylPlayerDragging ? 'grabbing' : 'grab',
                  outline: isVinylPlayerSelected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle, input[type="range"]')) return;
                  e.stopPropagation();
                  setIsVinylPlayerSelected(true);
                  setIsVinylPlayerDragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  const mouseX = e.clientX;
                  const mouseY = e.clientY;
                  dragStartRef.current = {
                    mouseStartX: mouseX,
                    mouseStartY: mouseY,
                    playerStartX: vinylPlayerPosition.x,
                    playerStartY: vinylPlayerPosition.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle, input[type="range"]')) {
                    setIsVinylPlayerSelected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                  }
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '80px', marginBottom: '12px' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '96px', height: '96px', marginTop: '-24px', marginLeft: '-16px' }}>
                    <div style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      border: '4px solid #a1a1aa',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      backgroundImage: photoUrl ? `url(${photoUrl})` : 'black',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      animation: isPlaying ? 'spin 3s linear infinite' : 'none',
                    }}></div>
                    <div style={{ position: 'absolute', zIndex: 10, width: '24px', height: '24px', background: 'white', border: '4px solid #a1a1aa', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', top: '36px', left: '36px' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', paddingLeft: '12px', overflow: 'hidden' }}>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#000' }}>{textTrackName || 'Music Name'}</p>
                    <p style={{ fontSize: '14px', color: '#71717a', margin: 0 }}>{textArtistName || 'Singer & artist'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', margin: '0 12px', background: '#e0e7ff', borderRadius: '6px', minHeight: '16px', padding: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#71717a', paddingLeft: '12px', display: 'block' }}>{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={audioDuration || 100}
                    value={currentTime}
                    onChange={(e) => {
                      if (audioElementRef.current) {
                        const newTime = parseFloat(e.target.value);
                        audioElementRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                      }
                    }}
                    style={{
                      flexGrow: 1,
                      height: '4px',
                      margin: '0 8px',
                      background: '#d1d5db',
                      borderRadius: '9999px',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#71717a', paddingRight: '12px', display: 'block' }}>{formatTime(audioDuration || 0)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexGrow: 1, margin: '0 12px', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '100%', cursor: 'pointer' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 1 21 5 17 9"></polyline>
                      <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                      <polyline points="7 23 3 19 7 15"></polyline>
                      <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                    </svg>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '100%', cursor: 'pointer' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="19 20 9 12 19 4 19 20"></polygon>
                      <line x1="5" y1="19" x2="5" y2="5"></line>
                    </svg>
                  </div>
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '48px', 
                      height: '100%', 
                      cursor: audioUrl ? 'pointer' : 'not-allowed',
                      opacity: audioUrl ? 1 : 0.5,
                      pointerEvents: audioUrl ? 'auto' : 'none'
                    }}
                    onClick={handlePlayPause}
                  >
                    {!isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '100%', cursor: 'pointer' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 4 15 12 5 20 5 4"></polygon>
                      <line x1="19" y1="5" x2="19" y2="19"></line>
                    </svg>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '100%', cursor: 'pointer' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                  </div>
                </div>
                {isVinylPlayerSelected && (
                  <>
                    <div 
                      className="resize-handle resize-handle-se"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsVinylPlayerResizing(true);
                        dragStartRef.current = {
                          startWidth: vinylPlayerSize.width,
                          startHeight: vinylPlayerSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-sw"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsVinylPlayerResizing(true);
                        dragStartRef.current = {
                          startWidth: vinylPlayerSize.width,
                          startHeight: vinylPlayerSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-ne"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsVinylPlayerResizing(true);
                        dragStartRef.current = {
                          startWidth: vinylPlayerSize.width,
                          startHeight: vinylPlayerSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-nw"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsVinylPlayerResizing(true);
                        dragStartRef.current = {
                          startWidth: vinylPlayerSize.width,
                          startHeight: vinylPlayerSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                  </>
                )}
              </div>
            )}

            {/* Video Player шаблон */}
            {photoUrl && audioUrl && selectedProgressBar === 'video-player' && (
              <div 
                ref={videoPlayerRef}
                style={{
                  position: 'absolute',
                  left: `${videoPlayerPosition.x}%`,
                  top: `${videoPlayerPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${videoPlayerSize.width}px`,
                  height: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  cursor: isVideoPlayerDragging ? 'grabbing' : 'grab',
                  outline: isVideoPlayerSelected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setIsVideoPlayerSelected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerDragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  const mouseX = e.clientX;
                  const mouseY = e.clientY;
                  dragStartRef.current = {
                    mouseStartX: mouseX,
                    mouseStartY: mouseY,
                    playerStartX: videoPlayerPosition.x,
                    playerStartY: videoPlayerPosition.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setIsVideoPlayerSelected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                  }
                }}
              >
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(170, 163, 163, 0.356)',
                  borderRadius: '4px',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%',
                    height: '100%',
                    background: 'rgb(167, 57, 57)',
                    borderRadius: '4px',
                  }}></div>
                </div>
                <p style={{ fontSize: '0.85em', color: 'rgb(241, 239, 239)', margin: 0, textAlign: 'right' }}>
                  {formatTime(currentTime)} / {formatTime(audioDuration || 0)}
                </p>
                {isVideoPlayerSelected && (
                  <>
                    <div 
                      className="resize-handle resize-handle-se"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsVideoPlayerResizing(true);
                        dragStartRef.current = {
                          startWidth: videoPlayerSize.width,
                          startHeight: videoPlayerSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-sw"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsVideoPlayerResizing(true);
                        dragStartRef.current = {
                          startWidth: videoPlayerSize.width,
                          startHeight: videoPlayerSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-ne"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsVideoPlayerResizing(true);
                        dragStartRef.current = {
                          startWidth: videoPlayerSize.width,
                          startHeight: videoPlayerSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-nw"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsVideoPlayerResizing(true);
                        dragStartRef.current = {
                          startWidth: videoPlayerSize.width,
                          startHeight: videoPlayerSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                  </>
                )}
              </div>
            )}

            {/* Music Card 2 шаблон */}
            {photoUrl && audioUrl && selectedProgressBar === 'music-card-2' && (
              <div 
                ref={musicCard2Ref}
                style={{
                  position: 'absolute',
                  left: `${musicCard2Position.x}%`,
                  top: `${musicCard2Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${musicCard2Size.width}px`,
                  height: `${musicCard2Size.height}px`,
                  background: 'lightgrey',
                  borderRadius: '10px',
                  cursor: isMusicCard2Dragging ? 'grabbing' : 'grab',
                  outline: isMusicCard2Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                  overflow: 'hidden',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle, svg')) return;
                  e.stopPropagation();
                  setIsMusicCard2Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  const mouseX = e.clientX;
                  const mouseY = e.clientY;
                  dragStartRef.current = {
                    mouseStartX: mouseX,
                    mouseStartY: mouseY,
                    playerStartX: musicCard2Position.x,
                    playerStartY: musicCard2Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle, svg')) {
                    setIsMusicCard2Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                  }
                }}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
                  zIndex: 10,
                  position: 'absolute',
                  background: 'rgba(255, 255, 255, 0.55)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                  backdropFilter: 'blur(8.5px)',
                  WebkitBackdropFilter: 'blur(8.5px)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                  <span style={{
                    width: '70px',
                    border: '1px solid rgba(180, 177, 177, 0.308)',
                    display: 'block',
                    margin: '0 auto 12px',
                    textAlign: 'center',
                    fontSize: '10px',
                    borderRadius: '12px',
                    fontFamily: 'Roboto, sans-serif',
                    color: 'rgba(102, 100, 100, 0.911)',
                    padding: '4px',
                  }}>Music</span>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(216, 212, 212, 0.726)',
                    margin: '0 auto 30px',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg viewBox="0 0 16 16" fill="currentColor" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 13c0 1.105-1.12 2-2.5 2S4 14.105 4 13s1.12-2 2.5-2 2.5.895 2.5 2z"></path>
                      <path d="M9 3v10H8V3h1z" fillRule="evenodd"></path>
                      <path d="M8 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 13 2.22V4L8 5V2.82z"></path>
                    </svg>
                  </div>
                  <span style={{
                    width: '90%',
                    height: '20px',
                    fontSize: '12px',
                    fontWeight: 500,
                    fontFamily: 'Roboto, sans-serif',
                    padding: '0 5px',
                    margin: '0 auto',
                    display: 'block',
                    overflow: 'hidden',
                    textAlign: 'center',
                    color: 'rgba(50, 49, 51, 0.637)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}>{textTrackName || 'One piece first ending'}</span>
                  <span style={{
                    width: '80%',
                    height: '20px',
                    fontSize: '9px',
                    fontWeight: 500,
                    fontFamily: 'Roboto, sans-serif',
                    padding: '0 5px',
                    margin: '8px auto',
                    display: 'block',
                    overflow: 'hidden',
                    textAlign: 'center',
                    color: 'rgba(50, 49, 51, 0.637)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}>{textArtistName || 'Desconhecido'}</span>
                  <div style={{
                    width: '100px',
                    margin: '15px auto 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 5px',
                    cursor: 'pointer',
                  }} onMouseDown={(e) => e.stopPropagation()}>
                    <svg viewBox="0 0 16 16" className="color" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg" style={{ fill: 'rgba(82, 79, 79, 0.829)', transform: 'rotate(180deg)' }}>
                      <path d="M7.596 7.304a.802.802 0 0 1 0 1.392l-6.363 3.692C.713 12.69 0 12.345 0 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692Z"></path>
                      <path d="M15.596 7.304a.802.802 0 0 1 0 1.392l-6.363 3.692C8.713 12.69 8 12.345 8 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692Z"></path>
                    </svg>
                    <svg viewBox="0 0 16 16" className="color" fill="currentColor" height="18" width="18" xmlns="http://www.w3.org/2000/svg" style={{ fill: 'rgba(82, 79, 79, 0.829)' }} onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}>
                      <path d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"></path>
                    </svg>
                    <svg viewBox="0 0 16 16" className="color" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg" style={{ fill: 'rgba(82, 79, 79, 0.829)' }}>
                      <path d="M7.596 7.304a.802.802 0 0 1 0 1.392l-6.363 3.692C.713 12.69 0 12.345 0 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692Z"></path>
                      <path d="M15.596 7.304a.802.802 0 0 1 0 1.392l-6.363 3.692C8.713 12.69 8 12.345 8 11.692V4.308c0-.653.713-.998 1.233-.696l6.363 3.692Z"></path>
                    </svg>
                  </div>
                  <div style={{
                    width: '100%',
                    margin: '35px auto 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '2px 23px',
                  }} onMouseDown={(e) => e.stopPropagation()}>
                    <svg viewBox="0 0 16 16" className="color1" fill="currentColor" height="14" width="14" xmlns="http://www.w3.org/2000/svg" style={{ fill: 'rgba(29, 28, 28, 0.829)', cursor: 'pointer' }}>
                      <path d="M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5z" fillRule="evenodd"></path>
                      <path d="M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z"></path>
                    </svg>
                    <svg viewBox="0 0 16 16" className="color1" fill="currentColor" height="14" width="14" xmlns="http://www.w3.org/2000/svg" style={{ fill: 'rgba(29, 28, 28, 0.829)', cursor: 'pointer' }}>
                      <path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z"></path>
                      <path d="M12 3v10h-1V3h1z" fillRule="evenodd"></path>
                      <path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z"></path>
                      <path d="M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5z" fillRule="evenodd"></path>
                    </svg>
                    <svg viewBox="0 0 16 16" className="color1" fill="currentColor" height="14" width="14" xmlns="http://www.w3.org/2000/svg" style={{ fill: 'rgba(29, 28, 28, 0.829)', cursor: 'pointer' }}>
                      <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595L8 6.236zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.55 7.55 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z"></path>
                    </svg>
                    <svg viewBox="0 0 16 16" className="color1" fill="currentColor" height="14" width="14" xmlns="http://www.w3.org/2000/svg" style={{ fill: 'rgba(29, 28, 28, 0.829)', cursor: 'pointer' }}>
                      <path d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z" fillRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                <div style={{
                  width: `${(60 / 190) * 100}%`,
                  height: `${(60 / 254) * 100}%`,
                  aspectRatio: '1',
                  background: 'rgb(131, 25, 163)',
                  filter: 'drop-shadow(0 0 10px rgb(131, 25, 163))',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: `${(30 / 254) * 100}%`,
                  left: `${(20 / 190) * 100}%`,
                  animation: 'musicCard2One 5s infinite',
                }}></div>
                <div style={{
                  width: `${(60 / 190) * 100}%`,
                  height: `${(60 / 254) * 100}%`,
                  aspectRatio: '1',
                  background: 'rgb(29, 209, 149)',
                  filter: 'drop-shadow(0 0 10px rgb(29, 209, 149))',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: `${(90 / 254) * 100}%`,
                  left: `${(90 / 190) * 100}%`,
                  animation: 'musicCard2Two 5s infinite',
                }}></div>
                {isMusicCard2Selected && (
                  <>
                    <div 
                      className="resize-handle resize-handle-se"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsMusicCard2Resizing(true);
                        dragStartRef.current = {
                          startWidth: musicCard2Size.width,
                          startHeight: musicCard2Size.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-sw"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsMusicCard2Resizing(true);
                        dragStartRef.current = {
                          startWidth: musicCard2Size.width,
                          startHeight: musicCard2Size.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-ne"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsMusicCard2Resizing(true);
                        dragStartRef.current = {
                          startWidth: musicCard2Size.width,
                          startHeight: musicCard2Size.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-nw"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsMusicCard2Resizing(true);
                        dragStartRef.current = {
                          startWidth: musicCard2Size.width,
                          startHeight: musicCard2Size.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                  </>
                )}
              </div>
            )}

            {/* Green Audio Player шаблон */}
            {photoUrl && audioUrl && selectedProgressBar === 'green-audio-player' && (
              <div 
                ref={greenPlayerRef}
                style={{
                  position: 'absolute',
                  left: `${greenPlayerPosition.x}%`,
                  top: `${greenPlayerPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${greenPlayerSize.width}px`,
                  height: `${greenPlayerSize.height}px`,
                  minWidth: '300px',
                  boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.07)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  cursor: isGreenPlayerDragging ? 'grabbing' : 'grab',
                  outline: isGreenPlayerSelected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle, svg, .slider, .progress, .pin')) return;
                  e.stopPropagation();
                  setIsGreenPlayerSelected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerDragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  const mouseX = e.clientX;
                  const mouseY = e.clientY;
                  dragStartRef.current = {
                    mouseStartX: mouseX,
                    mouseStartY: mouseY,
                    playerStartX: greenPlayerPosition.x,
                    playerStartY: greenPlayerPosition.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle, svg, .slider, .progress, .pin')) {
                    setIsGreenPlayerSelected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                  }
                }}
              >
                <div className="play-pause-btn" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}>
                  <svg viewBox="0 0 18 24" height="24" width="18" xmlns="http://www.w3.org/2000/svg">
                    <path className="play-pause-icon" d={isPlaying ? "M0 0h6v24H0V0zm12 0h6v24h-6V0z" : "M18 12L0 24V0"} fillRule="evenodd" fill="#566574"></path>
                  </svg>
                </div>

                <div className="controls" style={{ 
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '16px',
                  lineHeight: '18px',
                  color: '#55606e',
                  display: 'flex',
                  flexGrow: 1,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginLeft: '24px',
                  marginRight: '24px',
                }}>
                  <span className="current-time">{formatTime(currentTime)}</span>
                  <div data-direction="horizontal" className="slider" style={{
                    flexGrow: 1,
                    background: '#d8d8d8',
                    cursor: 'pointer',
                    position: 'relative',
                    marginLeft: '16px',
                    marginRight: '16px',
                    borderRadius: '2px',
                    height: '4px',
                  }}>
                    <div className="progress" style={{
                      background: '#44bfa3',
                      borderRadius: 'inherit',
                      position: 'absolute',
                      width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%',
                      height: '100%',
                    }}>
                      <div data-method="rewind" id="progress-pin" className="pin" style={{
                        height: '16px',
                        width: '16px',
                        borderRadius: '8px',
                        background: '#44bfa3',
                        position: 'absolute',
                        right: '-8px',
                        top: '-6px',
                        boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.32)',
                      }}></div>
                    </div>
                  </div>
                  <span className="total-time">{formatTime(audioDuration || 0)}</span>
                </div>

                <div className="volume" style={{ position: 'relative' }}>
                  <div className="volume-btn" style={{ cursor: 'pointer' }}>
                    <svg viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <path id="speaker" d="M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z" fillRule="evenodd" fill="#566574"></path>
                    </svg>
                  </div>
                </div>

                {isGreenPlayerSelected && (
                  <>
                    <div 
                      className="resize-handle resize-handle-se"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsGreenPlayerResizing(true);
                        dragStartRef.current = {
                          startWidth: greenPlayerSize.width,
                          startHeight: greenPlayerSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-sw"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsGreenPlayerResizing(true);
                        dragStartRef.current = {
                          startWidth: greenPlayerSize.width,
                          startHeight: greenPlayerSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-ne"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsGreenPlayerResizing(true);
                        dragStartRef.current = {
                          startWidth: greenPlayerSize.width,
                          startHeight: greenPlayerSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-nw"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsGreenPlayerResizing(true);
                        dragStartRef.current = {
                          startWidth: greenPlayerSize.width,
                          startHeight: greenPlayerSize.height,
                          startX: e.clientX,
                          startY: e.clientY,
                        };
                      }}
                    ></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 8 - Минималистичный горизонтальный */}
            {photoUrl && audioUrl && selectedProgressBar === 'custom-player-8' && (
              <div 
                ref={customPlayer8Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer8Position.x}%`,
                  top: `${customPlayer8Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer8Size.width}px`,
                  height: `${customPlayer8Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '20px',
                  cursor: isCustomPlayer8Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer8Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer8Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer9Selected(false);
                  setCustomPlayer10Selected(false);
                  setCustomPlayer11Selected(false);
                  setCustomPlayer12Selected(false);
                  setCustomPlayer13Selected(false);
                  setCustomPlayer14Selected(false);
                  setCustomPlayer15Selected(false);
                  setCustomPlayer16Selected(false);
                  setCustomPlayer17Selected(false);
                  setIsCustomPlayer8Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer8Position.x,
                    playerStartY: customPlayer8Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer8Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer9Selected(false);
                    setCustomPlayer10Selected(false);
                    setCustomPlayer11Selected(false);
                    setCustomPlayer12Selected(false);
                    setCustomPlayer13Selected(false);
                    setCustomPlayer14Selected(false);
                    setCustomPlayer15Selected(false);
                    setCustomPlayer16Selected(false);
                    setCustomPlayer17Selected(false);
                  }
                }}
              >
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', marginBottom: '12px' }}>
                  <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: '#fff', borderRadius: '2px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '12px' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                {customPlayer8Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer8Resizing(true); dragStartRef.current = { startWidth: customPlayer8Size.width, startHeight: customPlayer8Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer8Resizing(true); dragStartRef.current = { startWidth: customPlayer8Size.width, startHeight: customPlayer8Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer8Resizing(true); dragStartRef.current = { startWidth: customPlayer8Size.width, startHeight: customPlayer8Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer8Resizing(true); dragStartRef.current = { startWidth: customPlayer8Size.width, startHeight: customPlayer8Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 9 - Стеклянный (Glassmorphism) */}
            {photoUrl && audioUrl && selectedProgressBar === 'custom-player-9' && (
              <div 
                ref={customPlayer9Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer9Position.x}%`,
                  top: `${customPlayer9Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer9Size.width}px`,
                  height: `${customPlayer9Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '24px',
                  cursor: isCustomPlayer9Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer9Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer9Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer8Selected(false);
                  setCustomPlayer10Selected(false);
                  setCustomPlayer11Selected(false);
                  setCustomPlayer12Selected(false);
                  setCustomPlayer13Selected(false);
                  setCustomPlayer14Selected(false);
                  setCustomPlayer15Selected(false);
                  setCustomPlayer16Selected(false);
                  setCustomPlayer17Selected(false);
                  setIsCustomPlayer9Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer9Position.x,
                    playerStartY: customPlayer9Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer9Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer8Selected(false);
                    setCustomPlayer10Selected(false);
                    setCustomPlayer11Selected(false);
                    setCustomPlayer12Selected(false);
                    setCustomPlayer13Selected(false);
                    setCustomPlayer14Selected(false);
                    setCustomPlayer15Selected(false);
                    setCustomPlayer16Selected(false);
                    setCustomPlayer17Selected(false);
                  }
                }}
              >
                {photoUrl && <div style={{ position: 'absolute', top: '20px', left: '20px', width: '80px', height: '80px', borderRadius: '8px', backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>}
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', marginBottom: '16px' }}>
                  <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: 'rgba(255,255,255,0.8)', borderRadius: '3px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                {customPlayer9Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer9Resizing(true); dragStartRef.current = { startWidth: customPlayer9Size.width, startHeight: customPlayer9Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer9Resizing(true); dragStartRef.current = { startWidth: customPlayer9Size.width, startHeight: customPlayer9Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer9Resizing(true); dragStartRef.current = { startWidth: customPlayer9Size.width, startHeight: customPlayer9Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer9Resizing(true); dragStartRef.current = { startWidth: customPlayer9Size.width, startHeight: customPlayer9Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 10 - Неоморфный */}
            {photoUrl && audioUrl && selectedProgressBar === 'custom-player-10' && (
              <div 
                ref={customPlayer10Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer10Position.x}%`,
                  top: `${customPlayer10Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer10Size.width}px`,
                  height: `${customPlayer10Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '30px',
                  cursor: isCustomPlayer10Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer10Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer10Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer8Selected(false);
                  setCustomPlayer9Selected(false);
                  setCustomPlayer11Selected(false);
                  setCustomPlayer12Selected(false);
                  setCustomPlayer13Selected(false);
                  setCustomPlayer14Selected(false);
                  setCustomPlayer15Selected(false);
                  setCustomPlayer16Selected(false);
                  setCustomPlayer17Selected(false);
                  setIsCustomPlayer10Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer10Position.x,
                    playerStartY: customPlayer10Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer10Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer8Selected(false);
                    setCustomPlayer9Selected(false);
                    setCustomPlayer11Selected(false);
                    setCustomPlayer12Selected(false);
                    setCustomPlayer13Selected(false);
                    setCustomPlayer14Selected(false);
                    setCustomPlayer15Selected(false);
                    setCustomPlayer16Selected(false);
                    setCustomPlayer17Selected(false);
                  }
                }}
              >
                <div style={{ width: '100%', height: '8px', background: '#d1d9e6', borderRadius: '4px', boxShadow: 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff', marginBottom: '20px', position: 'relative' }}>
                  <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '4px', boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4a5568', fontSize: '13px', fontWeight: 600 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                {customPlayer10Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer10Resizing(true); dragStartRef.current = { startWidth: customPlayer10Size.width, startHeight: customPlayer10Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer10Resizing(true); dragStartRef.current = { startWidth: customPlayer10Size.width, startHeight: customPlayer10Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer10Resizing(true); dragStartRef.current = { startWidth: customPlayer10Size.width, startHeight: customPlayer10Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer10Resizing(true); dragStartRef.current = { startWidth: customPlayer10Size.width, startHeight: customPlayer10Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 11 - Темный с неоном */}
            {photoUrl && audioUrl && selectedProgressBar === 'custom-player-11' && (
              <div 
                ref={customPlayer11Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer11Position.x}%`,
                  top: `${customPlayer11Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer11Size.width}px`,
                  height: `${customPlayer11Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '24px',
                  cursor: isCustomPlayer11Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer11Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer11Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer8Selected(false);
                  setCustomPlayer9Selected(false);
                  setCustomPlayer10Selected(false);
                  setCustomPlayer12Selected(false);
                  setCustomPlayer13Selected(false);
                  setCustomPlayer14Selected(false);
                  setCustomPlayer15Selected(false);
                  setCustomPlayer16Selected(false);
                  setCustomPlayer17Selected(false);
                  setIsCustomPlayer11Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer11Position.x,
                    playerStartY: customPlayer11Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer11Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer8Selected(false);
                    setCustomPlayer9Selected(false);
                    setCustomPlayer10Selected(false);
                    setCustomPlayer12Selected(false);
                    setCustomPlayer13Selected(false);
                    setCustomPlayer14Selected(false);
                    setCustomPlayer15Selected(false);
                    setCustomPlayer16Selected(false);
                    setCustomPlayer17Selected(false);
                  }
                }}
              >
                <div style={{ width: '100%', height: '3px', background: '#1a1a1a', borderRadius: '2px', marginBottom: '16px', position: 'relative' }}>
                  <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: '#00ff88', borderRadius: '2px', boxShadow: '0 0 10px rgba(0, 255, 136, 0.8)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00ff88', fontSize: '14px', fontFamily: 'monospace', textShadow: '0 0 10px rgba(0, 255, 136, 0.5)' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                {customPlayer11Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer11Resizing(true); dragStartRef.current = { startWidth: customPlayer11Size.width, startHeight: customPlayer11Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer11Resizing(true); dragStartRef.current = { startWidth: customPlayer11Size.width, startHeight: customPlayer11Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer11Resizing(true); dragStartRef.current = { startWidth: customPlayer11Size.width, startHeight: customPlayer11Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer11Resizing(true); dragStartRef.current = { startWidth: customPlayer11Size.width, startHeight: customPlayer11Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 12 - Градиентный */}
            {photoUrl && audioUrl && selectedProgressBar === 'custom-player-12' && (
              <div 
                ref={customPlayer12Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer12Position.x}%`,
                  top: `${customPlayer12Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer12Size.width}px`,
                  height: `${customPlayer12Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '28px',
                  cursor: isCustomPlayer12Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer12Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer12Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer8Selected(false);
                  setCustomPlayer9Selected(false);
                  setCustomPlayer10Selected(false);
                  setCustomPlayer11Selected(false);
                  setCustomPlayer13Selected(false);
                  setCustomPlayer14Selected(false);
                  setCustomPlayer15Selected(false);
                  setCustomPlayer16Selected(false);
                  setCustomPlayer17Selected(false);
                  setIsCustomPlayer12Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer12Position.x,
                    playerStartY: customPlayer12Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer12Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer8Selected(false);
                    setCustomPlayer9Selected(false);
                    setCustomPlayer10Selected(false);
                    setCustomPlayer11Selected(false);
                    setCustomPlayer13Selected(false);
                    setCustomPlayer14Selected(false);
                    setCustomPlayer15Selected(false);
                    setCustomPlayer16Selected(false);
                    setCustomPlayer17Selected(false);
                  }
                }}
              >
                {photoUrl && <div style={{ position: 'absolute', top: '24px', right: '24px', width: '100px', height: '100px', borderRadius: '12px', backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}></div>}
                <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.4)', borderRadius: '3px', marginBottom: '18px' }}>
                  <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: '#fff', borderRadius: '3px', boxShadow: '0 2px 8px rgba(255,255,255,0.5)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '15px', fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                {customPlayer12Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer12Resizing(true); dragStartRef.current = { startWidth: customPlayer12Size.width, startHeight: customPlayer12Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer12Resizing(true); dragStartRef.current = { startWidth: customPlayer12Size.width, startHeight: customPlayer12Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer12Resizing(true); dragStartRef.current = { startWidth: customPlayer12Size.width, startHeight: customPlayer12Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer12Resizing(true); dragStartRef.current = { startWidth: customPlayer12Size.width, startHeight: customPlayer12Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 13 - Ретро */}
            {photoUrl && audioUrl && selectedProgressBar === 'custom-player-13' && (
              <div 
                ref={customPlayer13Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer13Position.x}%`,
                  top: `${customPlayer13Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer13Size.width}px`,
                  height: `${customPlayer13Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '20px',
                  cursor: isCustomPlayer13Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer13Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer13Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer8Selected(false);
                  setCustomPlayer9Selected(false);
                  setCustomPlayer10Selected(false);
                  setCustomPlayer11Selected(false);
                  setCustomPlayer12Selected(false);
                  setCustomPlayer14Selected(false);
                  setCustomPlayer15Selected(false);
                  setCustomPlayer16Selected(false);
                  setCustomPlayer17Selected(false);
                  setIsCustomPlayer13Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer13Position.x,
                    playerStartY: customPlayer13Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer13Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer8Selected(false);
                    setCustomPlayer9Selected(false);
                    setCustomPlayer10Selected(false);
                    setCustomPlayer11Selected(false);
                    setCustomPlayer12Selected(false);
                    setCustomPlayer14Selected(false);
                    setCustomPlayer15Selected(false);
                    setCustomPlayer16Selected(false);
                    setCustomPlayer17Selected(false);
                  }
                }}
              >
                <div style={{ width: '100%', height: '6px', background: '#1a0f0a', borderRadius: '3px', border: '1px solid #654321', marginBottom: '14px' }}>
                  <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: 'linear-gradient(90deg, #ff6b35 0%, #f7931e 100%)', borderRadius: '3px', boxShadow: '0 0 8px rgba(255, 107, 53, 0.6)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff6b35', fontSize: '13px', fontFamily: 'monospace', textShadow: '0 0 5px rgba(255, 107, 53, 0.8)' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                {customPlayer13Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer13Resizing(true); dragStartRef.current = { startWidth: customPlayer13Size.width, startHeight: customPlayer13Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer13Resizing(true); dragStartRef.current = { startWidth: customPlayer13Size.width, startHeight: customPlayer13Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer13Resizing(true); dragStartRef.current = { startWidth: customPlayer13Size.width, startHeight: customPlayer13Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer13Resizing(true); dragStartRef.current = { startWidth: customPlayer13Size.width, startHeight: customPlayer13Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 14 - Футуристичный */}
            {photoUrl && audioUrl && selectedProgressBar === 'custom-player-14' && (
              <div 
                ref={customPlayer14Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer14Position.x}%`,
                  top: `${customPlayer14Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer14Size.width}px`,
                  height: `${customPlayer14Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '26px',
                  cursor: isCustomPlayer14Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer14Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer14Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer8Selected(false);
                  setCustomPlayer9Selected(false);
                  setCustomPlayer10Selected(false);
                  setCustomPlayer11Selected(false);
                  setCustomPlayer12Selected(false);
                  setCustomPlayer13Selected(false);
                  setCustomPlayer15Selected(false);
                  setCustomPlayer16Selected(false);
                  setCustomPlayer17Selected(false);
                  setIsCustomPlayer14Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer14Position.x,
                    playerStartY: customPlayer14Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer14Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer8Selected(false);
                    setCustomPlayer9Selected(false);
                    setCustomPlayer10Selected(false);
                    setCustomPlayer11Selected(false);
                    setCustomPlayer12Selected(false);
                    setCustomPlayer13Selected(false);
                    setCustomPlayer15Selected(false);
                    setCustomPlayer16Selected(false);
                    setCustomPlayer17Selected(false);
                  }
                }}
              >
                <div style={{ width: '100%', height: '4px', background: 'rgba(138, 43, 226, 0.2)', borderRadius: '2px', marginBottom: '16px', position: 'relative' }}>
                  <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: 'linear-gradient(90deg, #8a2be2 0%, #ba55d3 100%)', borderRadius: '2px', boxShadow: '0 0 15px rgba(138, 43, 226, 0.8)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ba55d3', fontSize: '14px', fontFamily: 'monospace', fontWeight: 600, textShadow: '0 0 10px rgba(186, 85, 211, 0.6)' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                {customPlayer14Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer14Resizing(true); dragStartRef.current = { startWidth: customPlayer14Size.width, startHeight: customPlayer14Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer14Resizing(true); dragStartRef.current = { startWidth: customPlayer14Size.width, startHeight: customPlayer14Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer14Resizing(true); dragStartRef.current = { startWidth: customPlayer14Size.width, startHeight: customPlayer14Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer14Resizing(true); dragStartRef.current = { startWidth: customPlayer14Size.width, startHeight: customPlayer14Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 15 - С обложкой слева */}
            {photoUrl && audioUrl && selectedProgressBar === 'custom-player-15' && (
              <div 
                ref={customPlayer15Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer15Position.x}%`,
                  top: `${customPlayer15Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer15Size.width}px`,
                  height: `${customPlayer15Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  gap: '16px',
                  cursor: isCustomPlayer15Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer15Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer15Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer8Selected(false);
                  setCustomPlayer9Selected(false);
                  setCustomPlayer10Selected(false);
                  setCustomPlayer11Selected(false);
                  setCustomPlayer12Selected(false);
                  setCustomPlayer13Selected(false);
                  setCustomPlayer14Selected(false);
                  setCustomPlayer16Selected(false);
                  setCustomPlayer17Selected(false);
                  setIsCustomPlayer15Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer15Position.x,
                    playerStartY: customPlayer15Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer15Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer8Selected(false);
                    setCustomPlayer9Selected(false);
                    setCustomPlayer10Selected(false);
                    setCustomPlayer11Selected(false);
                    setCustomPlayer12Selected(false);
                    setCustomPlayer13Selected(false);
                    setCustomPlayer14Selected(false);
                    setCustomPlayer16Selected(false);
                    setCustomPlayer17Selected(false);
                  }
                }}
              >
                {photoUrl && <div style={{ width: '80px', height: '80px', borderRadius: '8px', backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }}></div>}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ width: '100%', height: '5px', background: '#333', borderRadius: '3px', marginBottom: '12px' }}>
                    <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: '#1db954', borderRadius: '3px' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '12px' }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(audioDuration || 0)}</span>
                  </div>
                </div>
                {customPlayer15Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer15Resizing(true); dragStartRef.current = { startWidth: customPlayer15Size.width, startHeight: customPlayer15Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer15Resizing(true); dragStartRef.current = { startWidth: customPlayer15Size.width, startHeight: customPlayer15Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer15Resizing(true); dragStartRef.current = { startWidth: customPlayer15Size.width, startHeight: customPlayer15Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer15Resizing(true); dragStartRef.current = { startWidth: customPlayer15Size.width, startHeight: customPlayer15Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 16 - Вертикальный карточный */}
            {photoUrl && audioUrl && selectedProgressBar === 'custom-player-16' && (
              <div 
                ref={customPlayer16Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer16Position.x}%`,
                  top: `${customPlayer16Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer16Size.width}px`,
                  height: `${customPlayer16Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '24px',
                  cursor: isCustomPlayer16Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer16Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer16Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer8Selected(false);
                  setCustomPlayer9Selected(false);
                  setCustomPlayer10Selected(false);
                  setCustomPlayer11Selected(false);
                  setCustomPlayer12Selected(false);
                  setCustomPlayer13Selected(false);
                  setCustomPlayer14Selected(false);
                  setCustomPlayer15Selected(false);
                  setCustomPlayer17Selected(false);
                  setIsCustomPlayer16Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer16Position.x,
                    playerStartY: customPlayer16Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer16Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer8Selected(false);
                    setCustomPlayer9Selected(false);
                    setCustomPlayer10Selected(false);
                    setCustomPlayer11Selected(false);
                    setCustomPlayer12Selected(false);
                    setCustomPlayer13Selected(false);
                    setCustomPlayer14Selected(false);
                    setCustomPlayer15Selected(false);
                    setCustomPlayer17Selected(false);
                  }
                }}
              >
                {photoUrl && <div style={{ width: '120px', height: '120px', borderRadius: '12px', backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', margin: '0 auto', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}></div>}
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.3)', borderRadius: '3px', marginTop: 'auto' }}>
                  <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: '#fff', borderRadius: '3px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '13px', marginTop: '12px' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                {customPlayer16Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer16Resizing(true); dragStartRef.current = { startWidth: customPlayer16Size.width, startHeight: customPlayer16Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer16Resizing(true); dragStartRef.current = { startWidth: customPlayer16Size.width, startHeight: customPlayer16Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer16Resizing(true); dragStartRef.current = { startWidth: customPlayer16Size.width, startHeight: customPlayer16Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer16Resizing(true); dragStartRef.current = { startWidth: customPlayer16Size.width, startHeight: customPlayer16Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 17 - С визуализацией */}
            {photoUrl && audioUrl && selectedProgressBar === 'custom-player-17' && (
              <div 
                ref={customPlayer17Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer17Position.x}%`,
                  top: `${customPlayer17Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer17Size.width}px`,
                  height: `${customPlayer17Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '22px',
                  cursor: isCustomPlayer17Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer17Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer17Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer8Selected(false);
                  setCustomPlayer9Selected(false);
                  setCustomPlayer10Selected(false);
                  setCustomPlayer11Selected(false);
                  setCustomPlayer12Selected(false);
                  setCustomPlayer13Selected(false);
                  setCustomPlayer14Selected(false);
                  setCustomPlayer15Selected(false);
                  setCustomPlayer16Selected(false);
                  setIsCustomPlayer17Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer17Position.x,
                    playerStartY: customPlayer17Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer17Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer8Selected(false);
                    setCustomPlayer9Selected(false);
                    setCustomPlayer10Selected(false);
                    setCustomPlayer11Selected(false);
                    setCustomPlayer12Selected(false);
                    setCustomPlayer13Selected(false);
                    setCustomPlayer14Selected(false);
                    setCustomPlayer15Selected(false);
                    setCustomPlayer16Selected(false);
                  }
                }}
              >
                <div style={{ position: 'absolute', bottom: '60px', left: '0', right: '0', height: '40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '3px', padding: '0 20px' }}>
                  {[...Array(20)].map((_, i) => (
                    <div key={i} style={{ width: '4px', height: `${20 + Math.random() * 60}%`, background: 'linear-gradient(180deg, #00d4ff 0%, #5b86e5 100%)', borderRadius: '2px', opacity: 0.7 }}></div>
                  ))}
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginBottom: '14px', zIndex: 1 }}>
                  <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: 'linear-gradient(90deg, #00d4ff 0%, #5b86e5 100%)', borderRadius: '2px', boxShadow: '0 0 10px rgba(0, 212, 255, 0.6)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00d4ff', fontSize: '13px', fontFamily: 'monospace', zIndex: 1 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                {customPlayer17Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer17Resizing(true); dragStartRef.current = { startWidth: customPlayer17Size.width, startHeight: customPlayer17Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer17Resizing(true); dragStartRef.current = { startWidth: customPlayer17Size.width, startHeight: customPlayer17Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer17Resizing(true); dragStartRef.current = { startWidth: customPlayer17Size.width, startHeight: customPlayer17Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer17Resizing(true); dragStartRef.current = { startWidth: customPlayer17Size.width, startHeight: customPlayer17Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 18 - Голографический */}
            {audioUrl && selectedProgressBar === 'custom-player-18' && (
              <div 
                ref={customPlayer18Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer18Position.x}%`,
                  top: `${customPlayer18Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer18Size.width}px`,
                  height: `${customPlayer18Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '28px',
                  cursor: isCustomPlayer18Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer18Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 100,
                  userSelect: 'none',
                  overflow: 'hidden',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer18Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer8Selected(false);
                  setCustomPlayer9Selected(false);
                  setCustomPlayer10Selected(false);
                  setCustomPlayer11Selected(false);
                  setCustomPlayer12Selected(false);
                  setCustomPlayer13Selected(false);
                  setCustomPlayer14Selected(false);
                  setCustomPlayer15Selected(false);
                  setCustomPlayer16Selected(false);
                  setCustomPlayer17Selected(false);
                  setCustomPlayer19Selected(false);
                  setCustomPlayer20Selected(false);
                  setCustomPlayer21Selected(false);
                  setCustomPlayer22Selected(false);
                  setIsCustomPlayer18Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer18Position.x,
                    playerStartY: customPlayer18Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer18Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer8Selected(false);
                    setCustomPlayer9Selected(false);
                    setCustomPlayer10Selected(false);
                    setCustomPlayer11Selected(false);
                    setCustomPlayer12Selected(false);
                    setCustomPlayer13Selected(false);
                    setCustomPlayer14Selected(false);
                    setCustomPlayer15Selected(false);
                    setCustomPlayer16Selected(false);
                    setCustomPlayer17Selected(false);
                    setCustomPlayer19Selected(false);
                    setCustomPlayer20Selected(false);
                    setCustomPlayer21Selected(false);
                    setCustomPlayer22Selected(false);
                  }
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)', backgroundSize: '200% 200%', animation: 'shimmer 3s infinite' }}></div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(0, 150, 255, 0.2)', borderRadius: '3px', marginBottom: '18px', position: 'relative', zIndex: 1, boxShadow: '0 0 20px rgba(0, 150, 255, 0.3)' }}>
                  <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: 'linear-gradient(90deg, #0096ff 0%, #ff0096 100%)', borderRadius: '3px', boxShadow: '0 0 25px rgba(0, 150, 255, 0.8), 0 0 15px rgba(255, 0, 150, 0.6)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '14px', fontWeight: 600, textShadow: '0 0 10px rgba(0, 150, 255, 0.8), 0 0 5px rgba(255, 0, 150, 0.6)', zIndex: 1 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                {customPlayer18Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer18Resizing(true); dragStartRef.current = { startWidth: customPlayer18Size.width, startHeight: customPlayer18Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer18Resizing(true); dragStartRef.current = { startWidth: customPlayer18Size.width, startHeight: customPlayer18Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer18Resizing(true); dragStartRef.current = { startWidth: customPlayer18Size.width, startHeight: customPlayer18Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer18Resizing(true); dragStartRef.current = { startWidth: customPlayer18Size.width, startHeight: customPlayer18Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 19 - Кинематографический */}
            {photoUrl && audioUrl && selectedProgressBar === 'custom-player-19' && (
              <div 
                ref={customPlayer19Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer19Position.x}%`,
                  top: `${customPlayer19Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer19Size.width}px`,
                  height: `${customPlayer19Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: 0,
                  cursor: isCustomPlayer19Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer19Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                  position: 'relative',
                  boxSizing: 'border-box',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer19Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer8Selected(false);
                  setCustomPlayer9Selected(false);
                  setCustomPlayer10Selected(false);
                  setCustomPlayer11Selected(false);
                  setCustomPlayer12Selected(false);
                  setCustomPlayer13Selected(false);
                  setCustomPlayer14Selected(false);
                  setCustomPlayer15Selected(false);
                  setCustomPlayer16Selected(false);
                  setCustomPlayer17Selected(false);
                  setCustomPlayer18Selected(false);
                  setCustomPlayer20Selected(false);
                  setCustomPlayer21Selected(false);
                  setCustomPlayer22Selected(false);
                  setIsCustomPlayer19Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer19Position.x,
                    playerStartY: customPlayer19Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer19Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer8Selected(false);
                    setCustomPlayer9Selected(false);
                    setCustomPlayer10Selected(false);
                    setCustomPlayer11Selected(false);
                    setCustomPlayer12Selected(false);
                    setCustomPlayer13Selected(false);
                    setCustomPlayer14Selected(false);
                    setCustomPlayer15Selected(false);
                    setCustomPlayer16Selected(false);
                    setCustomPlayer17Selected(false);
                    setCustomPlayer18Selected(false);
                    setCustomPlayer20Selected(false);
                    setCustomPlayer21Selected(false);
                    setCustomPlayer22Selected(false);
                  }
                }}
              >
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 215, 0, 0.15)', borderRadius: '4px', marginBottom: '20px', position: 'relative', zIndex: 1, padding: '0 32px' }}>
                  <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: 'linear-gradient(90deg, #ffd700 0%, #ffed4e 100%)', borderRadius: '4px', boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffd700', fontSize: '16px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '2px', textShadow: '0 0 15px rgba(255, 215, 0, 0.9)', zIndex: 1, padding: '0 32px' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                {customPlayer19Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer19Resizing(true); dragStartRef.current = { startWidth: customPlayer19Size.width, startHeight: customPlayer19Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer19Resizing(true); dragStartRef.current = { startWidth: customPlayer19Size.width, startHeight: customPlayer19Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer19Resizing(true); dragStartRef.current = { startWidth: customPlayer19Size.width, startHeight: customPlayer19Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer19Resizing(true); dragStartRef.current = { startWidth: customPlayer19Size.width, startHeight: customPlayer19Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 20 - Неоморфный премиум */}
            {audioUrl && selectedProgressBar === 'custom-player-20' && (
              <div 
                ref={customPlayer20Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer20Position.x}%`,
                  top: `${customPlayer20Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer20Size.width}px`,
                  height: `${customPlayer20Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '30px',
                  cursor: isCustomPlayer20Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer20Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 100,
                  userSelect: 'none',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer20Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer8Selected(false);
                  setCustomPlayer9Selected(false);
                  setCustomPlayer10Selected(false);
                  setCustomPlayer11Selected(false);
                  setCustomPlayer12Selected(false);
                  setCustomPlayer13Selected(false);
                  setCustomPlayer14Selected(false);
                  setCustomPlayer15Selected(false);
                  setCustomPlayer16Selected(false);
                  setCustomPlayer17Selected(false);
                  setCustomPlayer18Selected(false);
                  setCustomPlayer19Selected(false);
                  setCustomPlayer21Selected(false);
                  setCustomPlayer22Selected(false);
                  setIsCustomPlayer20Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer20Position.x,
                    playerStartY: customPlayer20Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer20Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer8Selected(false);
                    setCustomPlayer9Selected(false);
                    setCustomPlayer10Selected(false);
                    setCustomPlayer11Selected(false);
                    setCustomPlayer12Selected(false);
                    setCustomPlayer13Selected(false);
                    setCustomPlayer14Selected(false);
                    setCustomPlayer15Selected(false);
                    setCustomPlayer16Selected(false);
                    setCustomPlayer17Selected(false);
                    setCustomPlayer18Selected(false);
                    setCustomPlayer19Selected(false);
                    setCustomPlayer21Selected(false);
                    setCustomPlayer22Selected(false);
                  }
                }}
              >
                <div style={{ width: '100%', height: '10px', background: 'linear-gradient(145deg, #d0d0d0, #e8e8e8)', borderRadius: '5px', marginBottom: '20px', boxShadow: 'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff', position: 'relative' }}>
                  <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: 'linear-gradient(145deg, #667eea, #764ba2)', borderRadius: '5px', boxShadow: '6px 6px 12px #bebebe, -6px -6px 12px #ffffff' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4a5568', fontSize: '14px', fontWeight: 700 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                {customPlayer20Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer20Resizing(true); dragStartRef.current = { startWidth: customPlayer20Size.width, startHeight: customPlayer20Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer20Resizing(true); dragStartRef.current = { startWidth: customPlayer20Size.width, startHeight: customPlayer20Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer20Resizing(true); dragStartRef.current = { startWidth: customPlayer20Size.width, startHeight: customPlayer20Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer20Resizing(true); dragStartRef.current = { startWidth: customPlayer20Size.width, startHeight: customPlayer20Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 21 - Анимированный градиент */}
            {audioUrl && selectedProgressBar === 'custom-player-21' && (
              <div 
                ref={customPlayer21Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer21Position.x}%`,
                  top: `${customPlayer21Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer21Size.width}px`,
                  height: `${customPlayer21Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '26px',
                  cursor: isCustomPlayer21Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer21Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 100,
                  userSelect: 'none',
                  overflow: 'hidden',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer21Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer8Selected(false);
                  setCustomPlayer9Selected(false);
                  setCustomPlayer10Selected(false);
                  setCustomPlayer11Selected(false);
                  setCustomPlayer12Selected(false);
                  setCustomPlayer13Selected(false);
                  setCustomPlayer14Selected(false);
                  setCustomPlayer15Selected(false);
                  setCustomPlayer16Selected(false);
                  setCustomPlayer17Selected(false);
                  setCustomPlayer18Selected(false);
                  setCustomPlayer19Selected(false);
                  setCustomPlayer20Selected(false);
                  setCustomPlayer22Selected(false);
                  setIsCustomPlayer21Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer21Position.x,
                    playerStartY: customPlayer21Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer21Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer8Selected(false);
                    setCustomPlayer9Selected(false);
                    setCustomPlayer10Selected(false);
                    setCustomPlayer11Selected(false);
                    setCustomPlayer12Selected(false);
                    setCustomPlayer13Selected(false);
                    setCustomPlayer14Selected(false);
                    setCustomPlayer15Selected(false);
                    setCustomPlayer16Selected(false);
                    setCustomPlayer17Selected(false);
                    setCustomPlayer18Selected(false);
                    setCustomPlayer19Selected(false);
                    setCustomPlayer20Selected(false);
                    setCustomPlayer22Selected(false);
                  }
                }}
              >
                <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '3px', marginBottom: '16px', position: 'relative', zIndex: 1, backdropFilter: 'blur(10px)' }}>
                  <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)', borderRadius: '3px', boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '14px', fontWeight: 600, textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)', zIndex: 1 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                {customPlayer21Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer21Resizing(true); dragStartRef.current = { startWidth: customPlayer21Size.width, startHeight: customPlayer21Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer21Resizing(true); dragStartRef.current = { startWidth: customPlayer21Size.width, startHeight: customPlayer21Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer21Resizing(true); dragStartRef.current = { startWidth: customPlayer21Size.width, startHeight: customPlayer21Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer21Resizing(true); dragStartRef.current = { startWidth: customPlayer21Size.width, startHeight: customPlayer21Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Шаблон 22 - Минималистичный премиум */}
            {photoUrl && audioUrl && selectedProgressBar === 'custom-player-22' && (
              <div 
                ref={customPlayer22Ref}
                style={{
                  position: 'absolute',
                  left: `${customPlayer22Position.x}%`,
                  top: `${customPlayer22Position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${customPlayer22Size.width}px`,
                  height: `${customPlayer22Size.height}px`,
                  aspectRatio: '16/9',
                  background: 'transparent',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '28px',
                  cursor: isCustomPlayer22Dragging ? 'grabbing' : 'grab',
                  outline: customPlayer22Selected ? '2px solid #4ade80' : 'none',
                  outlineOffset: '2px',
                  zIndex: 10,
                  userSelect: 'none',
                  position: 'relative',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onMouseDown={(e) => {
                  if (e.target.closest('.resize-handle')) return;
                  e.stopPropagation();
                  setCustomPlayer22Selected(true);
                  setIsPlayerSelected(false);
                  setIsMusicCardSelected(false);
                  setIsPlayer2Selected(false);
                  setIsVinylPlayerSelected(false);
                  setIsVideoPlayerSelected(false);
                  setIsMusicCard2Selected(false);
                  setIsGreenPlayerSelected(false);
                  setCustomPlayer8Selected(false);
                  setCustomPlayer9Selected(false);
                  setCustomPlayer10Selected(false);
                  setCustomPlayer11Selected(false);
                  setCustomPlayer12Selected(false);
                  setCustomPlayer13Selected(false);
                  setCustomPlayer14Selected(false);
                  setCustomPlayer15Selected(false);
                  setCustomPlayer16Selected(false);
                  setCustomPlayer17Selected(false);
                  setCustomPlayer18Selected(false);
                  setCustomPlayer19Selected(false);
                  setCustomPlayer20Selected(false);
                  setCustomPlayer21Selected(false);
                  setIsCustomPlayer22Dragging(true);
                  const canvas = e.currentTarget.closest('.canvas');
                  if (!canvas) return;
                  const canvasRect = canvas.getBoundingClientRect();
                  dragStartRef.current = {
                    mouseStartX: e.clientX,
                    mouseStartY: e.clientY,
                    playerStartX: customPlayer22Position.x,
                    playerStartY: customPlayer22Position.y,
                    canvasWidth: canvasRect.width,
                    canvasHeight: canvasRect.height,
                  };
                }}
                onClick={(e) => {
                  if (!e.target.closest('.resize-handle')) {
                    setCustomPlayer22Selected(true);
                    setIsPlayerSelected(false);
                    setIsMusicCardSelected(false);
                    setIsPlayer2Selected(false);
                    setIsVinylPlayerSelected(false);
                    setIsVideoPlayerSelected(false);
                    setIsMusicCard2Selected(false);
                    setIsGreenPlayerSelected(false);
                    setCustomPlayer8Selected(false);
                    setCustomPlayer9Selected(false);
                    setCustomPlayer10Selected(false);
                    setCustomPlayer11Selected(false);
                    setCustomPlayer12Selected(false);
                    setCustomPlayer13Selected(false);
                    setCustomPlayer14Selected(false);
                    setCustomPlayer15Selected(false);
                    setCustomPlayer16Selected(false);
                    setCustomPlayer17Selected(false);
                    setCustomPlayer18Selected(false);
                    setCustomPlayer19Selected(false);
                    setCustomPlayer20Selected(false);
                    setCustomPlayer21Selected(false);
                  }
                }}
              >
                <div style={{ width: '100%', height: '2px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '1px', marginBottom: '24px', position: 'relative' }}>
                  <div style={{ width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%', height: '100%', background: 'linear-gradient(90deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)', borderRadius: '1px', boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px', fontFamily: 'system-ui, -apple-system', fontWeight: 400, letterSpacing: '1px', zIndex: 1 }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(audioDuration || 0)}</span>
                </div>
                {customPlayer22Selected && (
                  <>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer22Resizing(true); dragStartRef.current = { startWidth: customPlayer22Size.width, startHeight: customPlayer22Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer22Resizing(true); dragStartRef.current = { startWidth: customPlayer22Size.width, startHeight: customPlayer22Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer22Resizing(true); dragStartRef.current = { startWidth: customPlayer22Size.width, startHeight: customPlayer22Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => { e.stopPropagation(); setIsCustomPlayer22Resizing(true); dragStartRef.current = { startWidth: customPlayer22Size.width, startHeight: customPlayer22Size.height, startX: e.clientX, startY: e.clientY }; }}></div>
                  </>
                )}
              </div>
            )}

            {/* Аудио-плеер шаблон */}
            {photoUrl && audioUrl && selectedProgressBar === 'audio-player' && (
              <div 
                ref={playerRef}
                className={`audio-player ${isPlayerSelected ? 'selected' : ''}`}
                style={{
                  left: `${playerPosition.x}%`,
                  top: `${playerPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${playerSize.width}px`,
                  height: `${playerSize.height}px`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  backgroundColor: playerColor,
                }}
                onMouseDown={handlePlayerMouseDown}
                onClick={(e) => {
                  if (!e.target.closest('.play-btn, .pause-btn, .progress-bar, .progress')) {
                    setIsPlayerSelected(true);
                  }
                }}
              >
                <div 
                  className="album-cover"
                  style={{
                    backgroundImage: photoUrl ? `url(${photoUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                ></div>
                <div className="player-controls">
                  <div className="song-info">
                    <div className="song-title">{textTrackName}</div>
                    <p className="artist">{textArtistName}</p>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress"
                      style={{
                        width: audioDuration ? `${(currentTime / audioDuration) * 100}%` : '0%',
                      }}
                    ></div>
                  </div>
                  <div className="buttons">
                    {!isPlaying ? (
                      <button className="play-btn" onClick={handlePlayPause} disabled={!audioUrl} style={{ opacity: audioUrl ? 1 : 0.5, cursor: audioUrl ? 'pointer' : 'not-allowed' }}>
                        <svg viewBox="0 0 16 16" className="bi bi-play-fill" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg" style={{ color: 'white' }}>
                          <path fill="white" d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
                        </svg>
                      </button>
                    ) : (
                      <button className="pause-btn" onClick={handlePlayPause} disabled={!audioUrl} style={{ opacity: audioUrl ? 1 : 0.5, cursor: audioUrl ? 'pointer' : 'not-allowed' }}>
                        <svg viewBox="0 0 16 16" className="bi bi-pause-fill" fill="currentColor" height="16" width="16" xmlns="http://www.w3.org/2000/svg" style={{ color: 'white' }}>
                          <path fill="white" d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {isPlayerSelected && (
                  <>
                    <div 
                      className="resize-handle resize-handle-se"
                      onMouseDown={handlePlayerResizeMouseDown}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-sw"
                      onMouseDown={handlePlayerResizeMouseDown}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-ne"
                      onMouseDown={handlePlayerResizeMouseDown}
                    ></div>
                    <div 
                      className="resize-handle resize-handle-nw"
                      onMouseDown={handlePlayerResizeMouseDown}
                    ></div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT PANEL */}
        <aside 
          className="templates"
          onClick={(e) => {
            // Открываем панель при клике на разделитель (левая граница)
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX <= 10 && !isToolsOpen) {
              handleToolsToggle();
            }
          }}
          style={{ cursor: 'pointer', position: 'relative' }}
        >
          {/* Стрелка для открытия/закрытия панели инструментов */}
            <button
              type="button"
            className={`tools-toggle-btn ${isToolsOpen ? 'tools-toggle-btn-open' : ''}`}
              onClick={handleToolsToggle}
            >
            <div className={`arrow ${isToolsOpen ? 'arrow-down' : ''}`}>
                <div className="arrow-top"></div>
                <div className="arrow-bottom"></div>
              </div>
            </button>
          <div className="templates-head">
            <div>
              <div className="templates-title">
                {panelConfig[activePanel]?.title || 'Шаблоны'}
                {panelConfig[activePanel]?.showLoader && (
                  <div className="loader">
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                  </div>
                )}
              </div>
              <div className="templates-sub">{panelConfig[activePanel]?.subtitle || 'by levakand'}</div>
            </div>
          </div>

          {renderPanelContent()}
        </aside>
      </main>

      {/* Модалка с требованием аудио */}
      {showAudioRequiredModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            cursor: 'pointer',
          }}
          onClick={() => setShowAudioRequiredModal(false)}
        >
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '32px',
              cursor: 'default',
              maxWidth: '600px',
              padding: '40px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Видео */}
            <video
              src="/assets/tq.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}
            />
            {/* Текст */}
            <div style={{
              textAlign: 'center',
              color: '#fff',
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 600,
                margin: '0 0 12px 0',
                letterSpacing: '0.5px',
              }}>
                Сначала выберите аудио файл
              </h2>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
                lineHeight: '1.5',
              }}>
                Для выбора фонов необходимо загрузить аудио файл
              </p>
            </div>
            {/* Кнопка закрытия */}
            <button
              onClick={() => setShowAudioRequiredModal(false)}
              style={{
                padding: '12px 32px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Модалка с требованием фото */}
      {showPhotoRequiredModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            cursor: 'pointer',
          }}
          onClick={() => setShowPhotoRequiredModal(false)}
        >
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              cursor: 'default',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* TV Error компонент */}
            <div className="tv-error-wrapper">
              <div className="tv-error-main">
                <div className="tv-error-antenna">
                  <div className="tv-error-antenna-shadow"></div>
                  <div className="tv-error-a1"></div>
                  <div className="tv-error-a1d"></div>
                  <div className="tv-error-a2"></div>
                  <div className="tv-error-a2d"></div>
                  <div className="tv-error-a-base"></div>
                </div>
                <div className="tv-error-tv">
                  <div className="tv-error-cruve">
                    <svg
                      className="tv-error-curve-svg"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      viewBox="0 0 189.929 189.929"
                      xmlSpace="preserve"
                    >
                      <path
                        d="M70.343,70.343c-30.554,30.553-44.806,72.7-39.102,115.635l-29.738,3.951C-5.442,137.659,11.917,86.34,49.129,49.13
                        C86.34,11.918,137.664-5.445,189.928,1.502l-3.95,29.738C143.041,25.54,100.895,39.789,70.343,70.343z"
                      />
                    </svg>
                  </div>
                  <div className="tv-error-display-div">
                    <div className="tv-error-screen-out">
                      <div className="tv-error-screen-out1">
                        <div className="tv-error-screen">
                          <span className="tv-error-notfound-text">TQ ERROR :(</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="tv-error-lines">
                    <div className="tv-error-line1"></div>
                    <div className="tv-error-line2"></div>
                    <div className="tv-error-line3"></div>
                  </div>
                  <div className="tv-error-buttons-div">
                    <div className="tv-error-b1"><div></div></div>
                    <div className="tv-error-b2"></div>
                    <div className="tv-error-speakers">
                      <div className="tv-error-g1">
                        <div className="tv-error-g11"></div>
                        <div className="tv-error-g12"></div>
                        <div className="tv-error-g13"></div>
                      </div>
                      <div className="tv-error-g"></div>
                      <div className="tv-error-g"></div>
                    </div>
                  </div>
                </div>
                <div className="tv-error-bottom">
                  <div className="tv-error-base1"></div>
                  <div className="tv-error-base2"></div>
                  <div className="tv-error-base3"></div>
                </div>
              </div>
            </div>

            {/* Текст под TV */}
            <div style={{
              color: '#fff',
              fontSize: '16px',
              fontWeight: 500,
              textAlign: 'center',
              letterSpacing: '0.5px',
            }}>
              Сначала загрузите фото (16:9)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
