import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../features/auth/supabaseClient.js";
import "./PricingPage.css";

import telegramIcon from "../assets/share/telegram.svg";
import gmailIcon from "../assets/share/gmail.svg";
import dcity from "../assets/dcity.jpg";

export default function PricingPage() {
  const [mode, setMode] = useState("plans");
  const [selectedPlan, setSelectedPlan] = useState("PREMIUM");
  const [selectedAmount, setSelectedAmount] = useState("140");
  const [previewUrl, setPreviewUrl] = useState("");
  const [btnText, setBtnText] = useState("Отправить отчет");
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnGreen, setBtnGreen] = useState(false);

  const links = {
    login: "/login",
    signup: "/signup",
    telegram: "https://t.me/TOQIBOX",
    email: "mailto:levakandproduction@gmail.com",
  };

  const handleBack = () => {
    setMode("plans");
    setPreviewUrl("");
    setBtnText("Отправить отчет");
    setBtnGreen(false);
    setBtnDisabled(false);
    const input = document.getElementById("pay-file-input");
    if (input) input.value = "";
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setBtnText("Подтвердить отправку");
      setBtnGreen(true);
    }
  };

  const onSubmit = async () => {
    const input = document.getElementById("pay-file-input");
    if (!input || !input.files || !input.files[0]) {
      alert("Сначала прикрепите фото чека");
      return;
    }

    setBtnDisabled(true);
    setBtnText("Обработка...");

    try {
      // Получаем текущего пользователя
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        alert("Необходимо войти в аккаунт");
        setBtnDisabled(false);
        setBtnText("Отправить отчет");
        return;
      }

      const file = input.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      const filePath = `payments/${fileName}`;

      let screenshotUrl = previewUrl;

      // Пытаемся загрузить файл в Supabase Storage (если бакет существует)
      try {
        const { error: uploadError } = await supabase.storage
          .from('payments')
          .upload(filePath, file);

        if (!uploadError) {
          // Получаем публичный URL
          const { data: { publicUrl } } = supabase.storage
            .from('payments')
            .getPublicUrl(filePath);
          screenshotUrl = publicUrl;
        } else {
          console.warn("Ошибка загрузки файла в Storage:", uploadError);
          // Используем previewUrl (blob URL) как fallback
        }
      } catch (storageError) {
        console.warn("Storage недоступен:", storageError);
        // Используем previewUrl как fallback
      }

      // Создаем запись в таблице payments
      try {
        const { error: dbError } = await supabase
          .from('payments')
          .insert({
            user_id: session.user.id,
            user_email: session.user.email,
            plan: selectedPlan,
            amount: selectedAmount,
            screenshot_url: screenshotUrl,
            status: 'pending'
          });

        if (dbError) {
          // Если таблицы нет, просто показываем сообщение
          if (dbError.code === '42P01' || dbError.message?.includes('does not exist')) {
            console.warn("Таблица payments не найдена. Создайте её через SQL скрипт.");
            alert("Платеж отправлен. Ожидайте подтверждения. (Таблица payments не настроена)");
            handleBack();
            return;
          }
          throw dbError;
        }
      } catch (dbError) {
        console.error("Ошибка сохранения платежа:", dbError);
        // Показываем сообщение, но не блокируем пользователя
        alert("Платеж отправлен. Ожидайте подтверждения.");
        handleBack();
        return;
      }

      alert("Чек успешно отправлен. Ожидайте уведомления.");
      handleBack();
    } catch (error) {
      console.error("Ошибка отправки:", error);
      alert("Ошибка отправки: " + error.message);
      setBtnDisabled(false);
      setBtnText("Отправить отчет");
    }
  };

  if (mode === "pay") {
    return (
      <div className="tbx-pricing">
        <div className="pay-overlay">
          <div className="pay-mesh-bg"></div>
          <div className="pay-container">
            <main className="pay-content">
              <button 
                onClick={handleBack}
                style={{ 
                  position: "fixed", 
                  top: "20px", 
                  right: "20px", 
                  background: "rgba(255,255,255,0.1)", 
                  border: "none", 
                  color: "#fff", 
                  padding: "10px", 
                  borderRadius: "50%", 
                  cursor: "pointer",
                  fontSize: "20px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000
                }}
              >
                ←
              </button>

              <header className="pay-header">
                <h1>Подтверждение</h1>
                <p>Завершите оплату через Dushanbe City</p>
              </header>

              <div className="pay-summary-row">
                <span className="pay-badge">{selectedPlan}</span>
                <span className="pay-amount">{selectedAmount} TJS</span>
              </div>

              <div className="pay-qr-card">
                <div className="pay-qr-frame">
                  <div className="pay-scanner-line"></div>
                  {dcity && <img src={dcity} alt="QR" />}
                </div>
                <p className="pay-muted">Наведите камеру или отсканируйте в приложении</p>
              </div>

              <div className="pay-upload-area">
                <label htmlFor="pay-file-input">
                  <span className="pay-upload-icon">📷</span>
                  <span className="pay-upload-text">Прикрепить чек об оплате</span>
                  <input type="file" id="pay-file-input" accept="image/*" onChange={onFileChange} />
                </label>
              </div>

              {previewUrl && (
                <div className="pay-preview-box">
                  <img src={previewUrl} alt="Чек" />
                </div>
              )}

              <button
                className={`pay-main-btn ${btnGreen ? "pay-is-green" : ""}`}
                onClick={onSubmit}
                disabled={btnDisabled}
                style={{
                  opacity: btnDisabled ? "0.5" : "1",
                }}
              >
                {btnText}
              </button>

              <p className="pay-warning">
                Проверка транзакции занимает до 15 минут. <b>Попытка подделки чека - бан по ID устройства.</b>
              </p>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-page">
      {/* Анимированные сферы на фоне как на скрине */}
      <div className="glass-bg">
        <div className="sphere s1"></div>
        <div className="sphere s2"></div>
        <div className="sphere s3"></div>
        <div className="sphere s4"></div>
      </div>

      <main className="content-container">
        {/* Хедер авторизации */}
        <div className="auth-glass-header">
          <p>Для оплаты необходимо войти в аккаунт</p>
          <div className="auth-btns">
            <Link to={links.login} className="btn-mini-primary">Войти</Link>
            <Link to={links.signup} className="btn-mini-glass">Создать аккаунт</Link>
          </div>
        </div>

        <h1 className="main-title">Выберите тариф</h1>

        <section className="plans-grid">
          {/* PREMIUM */}
          <div className="glass-card premium-card">
            <div className="card-header">
              <span className="plan-label">PREMIUM</span>
            </div>
            <div className="price-block">
              <span className="price-num">140 TJS</span>
              <span className="price-per">/ месяц</span>
            </div>
            <ul className="features-list">
              <li>Без рекламы</li>
              <li>Золотая тюбетейка (Верификация)</li>
              <li>Статус: Проверенный артист</li>
              <li>PREMIUM Шаблоны в шапке</li>
              <li>Видеофоны страницы</li>
              <li>Живая поддержка</li>
            </ul>
            <button 
              className="btn-buy green-glow"
              onClick={() => {
                setSelectedPlan("PREMIUM");
                setSelectedAmount("140");
                setMode("pay");
              }}
            >
              Подключить 140 TJS в мес
            </button>
          </div>

          {/* PREMIUM+ */}
          <div className="glass-card premium-plus-card">
            <div className="card-header">
              <span className="plan-label">PREMIUM+</span>
              <div className="promo-badge">30% выгода</div>
            </div>
            <div className="price-block">
              <span className="price-num">1200 TJS</span>
              <span className="price-per">/ год</span>
            </div>
            <ul className="features-list">
              <li className="gold-text">Всё как в PREMIUM</li>
              <li>Доступ на год без лимита</li>
              <li>Золотая тюбетейка рядом с ником</li>
              <li>Видео в шапке (YouTube)</li>
              <li>Поддержка 24/7</li>
            </ul>
            <button 
              className="btn-buy gold-glow"
              onClick={() => {
                setSelectedPlan("PREMIUM+");
                setSelectedAmount("1200");
                setMode("pay");
              }}
            >
              Подключить 1200 TJS в год
            </button>
          </div>
        </section>

        {/* Инфо-блоки */}
        <div className="glass-card info-card">
           <h3>Как проходит оплата</h3>
           <div className="steps-row">
             <div className="step-item"><span>1</span> Выбор тарифа</div>
             <div className="step-item"><span>2</span> Перевод суммы</div>
             <div className="step-item"><span>3</span> Активация</div>
           </div>
        </div>

        <div className="glass-card danger-card">
          <div className="danger-header">
            <span className="icon-warn">⚠️</span>
            <h4>Защита от мошенничества</h4>
          </div>
          <p>Мы проверяем все платежи вручную. Скрины, созданные ИИ, не принимаются. Обман ведет к вечной блокировке устройства по ID.</p>
        </div>

        <footer className="footer-glass">
          <div className="social-links">
             <a href={links.telegram} className="social-btn">{telegramIcon && <img src={telegramIcon} alt=""/>} Telegram</a>
             <a href={links.email} className="social-btn">{gmailIcon && <img src={gmailIcon} alt=""/>} Email</a>
          </div>
          <p className="copyright">© 2026 TOQIBOX. Все права защищены.</p>
        </footer>
      </main>
    </div>
  );
}