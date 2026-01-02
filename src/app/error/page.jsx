import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/error.css";

export default function ErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Получаем сообщение об ошибке из state или используем дефолтное
  const errorMessage = location.state?.error || "TOQI ERROR";
  const errorDetails = location.state?.details || null;

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="error-page-container">
      <div className="tv-container">
        <div className="tv-screen">
          <div className="static"></div>
          <div className="error-text">{errorMessage}</div>
          {errorDetails && (
            <div className="error-details">{errorDetails}</div>
          )}
        </div>
        <div className="tv-stand"></div>
      </div>
      
      <div className="error-actions">
        <button onClick={handleGoHome} className="error-btn">
          На главную
        </button>
        <button onClick={handleReload} className="error-btn">
          Перезагрузить
        </button>
      </div>
    </div>
  );
}

