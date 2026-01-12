import React from "react";
import { useNavigate } from "react-router-dom";
import "./ErrorPage.css";

/**
 * Красивая страница ошибки в стиле мировых соцсетей
 * @param {Object} props
 * @param {number} props.code - Код ошибки (404, 500, etc.)
 * @param {string} props.title - Заголовок ошибки
 * @param {string} props.message - Основное сообщение
 * @param {string} props.hint - Дополнительная подсказка
 * @param {string} props.buttonText - Текст кнопки
 * @param {string} props.buttonAction - Действие кнопки: 'home' | 'back' | 'retry' | 'login' | 'custom'
 * @param {Function} props.onButtonClick - Кастомный обработчик кнопки
 */
export default function ErrorPage({
  code = 404,
  title = "Страница не найдена",
  message = "Похоже, эта страница не существует или была удалена.",
  hint = "Проверьте правильность ссылки или вернитесь на главную страницу.",
  buttonText = null,
  buttonAction = "home",
  onButtonClick = null,
}) {
  const navigate = useNavigate();

  const getButtonText = () => {
    if (buttonText) return buttonText;
    
    switch (buttonAction) {
      case "back":
        return "Вернуться назад";
      case "retry":
        return "Попробовать снова";
      case "login":
        return "Войти";
      case "home":
      default:
        return "На главную";
    }
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
      return;
    }

    switch (buttonAction) {
      case "back":
        navigate(-1);
        break;
      case "retry":
        window.location.reload();
        break;
      case "login":
        navigate("/login");
        break;
      case "home":
      default:
        navigate("/");
        break;
    }
  };

  // Иконки для разных типов ошибок
  const getIcon = () => {
    switch (code) {
      case 404:
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" opacity="0.3"/>
            <path d="M40 40L80 80M80 40L40 80" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        );
      case 500:
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
            <path d="M60 30V70M60 85V90" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="60" cy="95" r="3" fill="currentColor"/>
          </svg>
        );
      case 403:
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="35" y="45" width="50" height="60" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
            <path d="M50 45V35C50 30.5817 53.5817 27 58 27H62C66.4183 27 70 30.5817 70 35V45" stroke="currentColor" strokeWidth="3"/>
          </svg>
        );
      default:
        return (
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
            <path d="M60 35V65M60 75V80" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="60" cy="85" r="3" fill="currentColor"/>
          </svg>
        );
    }
  };

  return (
    <div className="error-page">
      <div className="error-page__container">
        <div className="error-page__icon">
          {getIcon()}
        </div>
        
        <div className="error-page__code">{code}</div>
        
        <h1 className="error-page__title">{title}</h1>
        
        <p className="error-page__message">{message}</p>
        
        {hint && (
          <p className="error-page__hint">{hint}</p>
        )}
        
        <button 
          className="error-page__button"
          onClick={handleButtonClick}
          type="button"
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
}
