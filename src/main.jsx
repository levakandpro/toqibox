import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import * as THREE from "three";

import App from "./App.jsx";
import "./styles/variables.css";
import "./styles/globals.css";

// Make THREE global for Vanta.js
window.THREE = THREE;

// Игнорируем ошибки загрузки favicon от внешних доменов (Google OAuth и т.д.)
// Это не критичные ошибки, они не влияют на работу приложения

// Перехватываем ошибки загрузки ресурсов на уровне window
window.addEventListener('error', (event) => {
  const url = event.target?.src || event.target?.href || '';
  // Игнорируем ошибки favicon от внешних доменов
  if (url.includes('favicon.ico') && 
      (url.includes('google.com') || url.includes('gstatic.com'))) {
    event.preventDefault(); // Предотвращаем показ ошибки в консоли
    return false;
  }
  // Игнорируем другие не критичные ошибки загрузки ресурсов от внешних доменов
  if (url.includes('google.com') || url.includes('gstatic.com')) {
    const errorMessage = event.message || '';
    if (errorMessage.includes('ERR_BLOCKED_BY_CLIENT')) {
      event.preventDefault();
      return false;
    }
  }
}, true); // Используем capture phase для перехвата всех ошибок

// Также фильтруем ошибки в console.error
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  // Игнорируем ошибки favicon от внешних доменов
  if (message.includes('favicon.ico') && message.includes('ERR_BLOCKED_BY_CLIENT')) {
    return; // Не показываем эту ошибку
  }
  // Игнорируем другие не критичные ошибки загрузки ресурсов от внешних доменов
  if (message.includes('net::ERR_BLOCKED_BY_CLIENT') && 
      (message.includes('google.com') || message.includes('gstatic.com'))) {
    return; // Не показываем эти ошибки
  }
  originalError.apply(console, args);
};

// Принудительная очистка кеша в dev режиме
if (import.meta.env.DEV) {
  // Добавляем версию к скриптам для предотвращения кеширования
  const scripts = document.querySelectorAll('script[type="module"]');
  scripts.forEach(script => {
    if (script.src) {
      script.src = script.src + '?v=' + Date.now();
    }
  });
  
  // Очищаем старый кеш при загрузке
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
