/**
 * Единый Audio Engine для всего проекта
 * Один HTMLAudioElement + один AudioContext + один AnalyserNode
 * Создается один раз и больше не пересоздается
 */

class AudioEngine {
  constructor() {
    // Один audio элемент навсегда
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audio.preload = 'auto';
    
    // Один AudioContext навсегда
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    
    // Колбэки для событий
    this.onPlayCallback = null;
    this.onPauseCallback = null;
    this.onEndedCallback = null;
    this.onTimeUpdateCallback = null;
    this.onLoadedMetadataCallback = null;
    this.onErrorCallback = null;
    
    // Подписываемся на события audio
    this.audio.addEventListener('play', () => {
      console.log('[AudioEngine] ▶ Playing');
      if (this.onPlayCallback) this.onPlayCallback();
    });
    
    this.audio.addEventListener('pause', () => {
      console.log('[AudioEngine] ⏸ Paused');
      if (this.onPauseCallback) this.onPauseCallback();
    });
    
    this.audio.addEventListener('ended', () => {
      console.log('[AudioEngine] ⏹ Ended');
      if (this.onEndedCallback) this.onEndedCallback();
    });
    
    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.audio.currentTime);
      }
    });
    
    this.audio.addEventListener('loadedmetadata', () => {
      console.log('[AudioEngine] Loaded metadata, duration:', this.audio.duration);
      if (this.onLoadedMetadataCallback) {
        this.onLoadedMetadataCallback(this.audio.duration);
      }
    });
    
    this.audio.addEventListener('error', (e) => {
      console.error('[AudioEngine] Error:', e);
      if (this.onErrorCallback) this.onErrorCallback(e);
    });
    
    console.log('[AudioEngine] Initialized');
  }
  
  /**
   * Инициализация AudioContext и Analyser (вызывается один раз при первом взаимодействии)
   */
  initAudioContext() {
    if (this.audioContext) return; // Уже создан
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.15;
      
      // Создаем source от audio элемента
      this.source = this.audioContext.createMediaElementSource(this.audio);
      
      // Подключаем: source -> analyser -> destination
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      console.log('[AudioEngine] AudioContext and Analyser created');
    } catch (err) {
      console.error('[AudioEngine] Failed to create AudioContext:', err);
    }
  }
  
  /**
   * Установить источник аудио (только при выборе нового файла)
   */
  setSrc(url) {
    if (!url) {
      this.audio.pause();
      this.audio.src = '';
      this.audio.currentTime = 0;
      console.log('[AudioEngine] Source cleared');
      return;
    }
    
    this.audio.pause();
    this.audio.src = url;
    this.audio.load();
    console.log('[AudioEngine] Source set:', url);
  }
  
  /**
   * Play/Pause toggle
   */
  async toggle() {
    if (!this.audio.src) {
      console.log('[AudioEngine] No source, cannot play');
      return;
    }
    
    // Инициализируем AudioContext при первом взаимодействии
    if (!this.audioContext) {
      this.initAudioContext();
    }
    
    // Возобновляем AudioContext если suspended
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    if (this.audio.paused) {
      await this.play();
    } else {
      this.pause();
    }
  }
  
  /**
   * Play
   */
  async play() {
    if (!this.audio.src) {
      console.log('[AudioEngine] No source, cannot play');
      return;
    }
    
    // Инициализируем AudioContext при первом взаимодействии
    if (!this.audioContext) {
      this.initAudioContext();
    }
    
    // Возобновляем AudioContext если suspended
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    try {
      await this.audio.play();
    } catch (err) {
      console.error('[AudioEngine] Play failed:', err);
      throw err;
    }
  }
  
  /**
   * Pause
   */
  pause() {
    this.audio.pause();
  }
  
  /**
   * Stop (pause + reset to start)
   */
  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    console.log('[AudioEngine] Stopped');
  }
  
  /**
   * Seek to time
   */
  seek(time) {
    this.audio.currentTime = time;
  }
  
  /**
   * Get current time
   */
  getCurrentTime() {
    return this.audio.currentTime;
  }
  
  /**
   * Get duration
   */
  getDuration() {
    return this.audio.duration || 0;
  }
  
  /**
   * Is playing?
   */
  isPlaying() {
    return !this.audio.paused;
  }
  
  /**
   * Get analyser (для визуалов)
   */
  getAnalyser() {
    return this.analyser;
  }
  
  /**
   * Get AudioContext (для визуалов)
   */
  getAudioContext() {
    return this.audioContext;
  }
  
  /**
   * Set volume (0-1)
   */
  setVolume(volume) {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Get volume
   */
  getVolume() {
    return this.audio.volume;
  }
}

// Экспортируем единственный экземпляр (singleton)
export const audioEngine = new AudioEngine();
