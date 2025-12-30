import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./styles/variables.css";
import "./styles/globals.css";

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
