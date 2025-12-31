import React from "react";
import playIcon from "../assets/play/play (6).svg";
import "../styles/premiumLoader.css";

const LOADING_MESSAGES = {
  default: "Загрузка...",
  saving: "Сохранение...",
  uploading: "Загрузка файла...",
  processing: "Обработка...",
  connecting: "Подключение...",
  loading: "Загрузка данных...",
  track: "Загрузка трека...",
  artist: "Загрузка артиста...",
  cover: "Загрузка обложки...",
  social: "Сохранение ссылки...",
};

export default function PremiumLoader({ 
  message = "default", 
  size = "medium",
  fullScreen = false,
  overlay = false 
}) {
  const displayMessage = typeof message === "string" && message in LOADING_MESSAGES 
    ? LOADING_MESSAGES[message] 
    : message || LOADING_MESSAGES.default;

  const sizeClasses = {
    small: "pl-small",
    medium: "pl-medium",
    large: "pl-large",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.medium;

  const content = (
    <div className={`premium-loader ${sizeClass} ${fullScreen ? "pl-fullscreen" : ""} ${overlay ? "pl-overlay" : ""}`}>
      <div className="pl-container">
        {/* Внешнее кольцо - пульсирующее */}
        <div className="pl-ring pl-ring-outer">
          <div className="pl-ring-inner"></div>
        </div>
        
        {/* Среднее кольцо - вращающееся */}
        <div className="pl-ring pl-ring-middle">
          <div className="pl-ring-glow"></div>
        </div>
        
        {/* Внутреннее кольцо - пульсирующее с градиентом */}
        <div className="pl-ring pl-ring-inner">
          <div className="pl-ring-gradient"></div>
        </div>
        
        {/* Центральная иконка */}
        <div className="pl-icon-wrapper">
          <img 
            src={playIcon} 
            alt="" 
            className="pl-icon"
            aria-hidden="true"
          />
          <div className="pl-icon-glow"></div>
        </div>
        
        {/* Частицы вокруг */}
        <div className="pl-particles">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="pl-particle"
              style={{
                '--particle-index': i,
                '--particle-delay': `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Текст загрузки */}
      <div className="pl-message">
        <span className="pl-message-text">{displayMessage}</span>
        <div className="pl-message-dots">
          <span className="pl-dot">.</span>
          <span className="pl-dot">.</span>
          <span className="pl-dot">.</span>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="pl-fullscreen-wrapper">
        {content}
      </div>
    );
  }

  return content;
}

