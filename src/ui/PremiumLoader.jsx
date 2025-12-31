import React from "react";
import playIcon from "../assets/play/play (6).svg";
import "../styles/premiumLoader.css";

const LOADING_MESSAGES = {
  default: "Загрузка",
  saving: "Сохранение",
  uploading: "Загрузка файла",
  processing: "Обработка",
  connecting: "Подключение",
  loading: "Загрузка данных",
  track: "Загрузка трека",
  artist: "Загрузка артиста",
  cover: "Загрузка обложки",
  social: "Сохранение ссылки",
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
        {/* Одно простое вращающееся кольцо */}
        <div className="pl-ring"></div>
        
        {/* Центральная иконка */}
        <div className="pl-icon-wrapper">
          <img 
            src={playIcon} 
            alt="" 
            className="pl-icon"
            aria-hidden="true"
          />
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

