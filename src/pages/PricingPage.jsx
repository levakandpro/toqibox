import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../features/auth/supabaseClient.js";
import "./PricingPage.css";

import telegramIcon from "../assets/share/telegram.svg";
import gmailIcon from "../assets/share/gmail.svg";
import dcity from "../assets/dcity.jpg";

export default function PricingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [mode, setMode] = useState("plans");
  const [selectedPlan, setSelectedPlan] = useState("PREMIUM");
  const [selectedAmount, setSelectedAmount] = useState("140");
  const [previewUrl, setPreviewUrl] = useState("");
  const [btnText, setBtnText] = useState("Отправить отчет");
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnGreen, setBtnGreen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      // Путь должен быть БЕЗ префикса "payments/", т.к. bucket уже "payments"
      const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;

      // КРИТИЧЕСКИ ВАЖНО: Файл ДОЛЖЕН быть загружен в Storage, иначе blob URL не будет работать
      // Загружаем файл в Supabase Storage
      let screenshotUrl = null;
      try {
        const { error: uploadError } = await supabase.storage
          .from('payments')
          .upload(filePath, file, {
            upsert: false, // Не перезаписывать существующие файлы
            cacheControl: '3600',
          });

        if (uploadError) {
          console.error("Ошибка загрузки файла в Storage:", uploadError);
          
          // Проверяем конкретную ошибку "Bucket not found"
          if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
            alert(`Ошибка: Storage бакет "payments" не найден.\n\nЧтобы исправить:\n1. Откройте Supabase Dashboard\n2. Перейдите в Storage\n3. Создайте бакет с названием "payments"\n4. Включите Public access в настройках бакета\n5. Добавьте Policy: разрешить INSERT для авторизованных пользователей`);
          } else {
            alert(`Ошибка загрузки чека: ${uploadError.message || 'Storage недоступен. Обратитесь в поддержку.'}`);
          }
          
          setBtnDisabled(false);
          setBtnText("Отправить отчет");
          return;
        }

        // Получаем публичный URL только после успешной загрузки
        const { data: { publicUrl } } = supabase.storage
          .from('payments')
          .getPublicUrl(filePath);
        
        if (!publicUrl) {
          throw new Error('Не удалось получить публичный URL файла');
        }
        
        screenshotUrl = publicUrl;
        console.log('[Payment] Файл успешно загружен в Storage:', screenshotUrl);
      } catch (storageError) {
        console.error("Критическая ошибка Storage:", storageError);
        alert(`Ошибка загрузки чека: ${storageError.message || 'Storage недоступен. Обратитесь в поддержку.'}`);
        setBtnDisabled(false);
        setBtnText("Отправить отчет");
        return;
      }

      // Проверяем, что получили валидный URL (НЕ blob URL)
      if (!screenshotUrl || screenshotUrl.startsWith('blob:')) {
        alert('Ошибка: не удалось загрузить чек. Попробуйте еще раз или обратитесь в поддержку.');
        setBtnDisabled(false);
        setBtnText("Отправить отчет");
        return;
      }

      // Создаем запись в таблице payment_requests для TOQIBOX
      try {
        // Преобразуем план в нижний регистр для единообразия
        const planLower = selectedPlan === 'PREMIUM+' ? 'premium_plus' : 'premium';
        const amountNum = parseFloat(selectedAmount) || 0;

        // Перед созданием новой заявки отменяем старые pending заявки для того же продукта
        console.log('[Payment] Отменяем старые pending заявки для TOQIBOX...');
        await supabase
          .from('payment_requests')
          .update({
            status: 'rejected',
            rejected_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id)
          .eq('product', 'toqibox')
          .eq('status', 'pending');

        console.log('[Payment] Сохраняем заявку в БД:', {
          user_id: session.user.id,
          product: 'toqibox',
          plan: planLower,
          amount: amountNum,
          receipt_url: screenshotUrl,
        });

        const { data: insertedData, error: dbError } = await supabase
          .from('payment_requests')
          .insert({
            user_id: session.user.id,
            product: 'toqibox',
            plan: planLower,
            amount: amountNum,
            receipt_url: screenshotUrl,
            status: 'pending'
          })
          .select();

        if (dbError) {
          console.error('[Payment] Ошибка сохранения в БД:', dbError);
          // Если таблицы нет, просто показываем сообщение
          if (dbError.code === '42P01' || dbError.message?.includes('does not exist')) {
            console.warn("Таблица payment_requests не найдена. Создайте её через SQL скрипт.");
            alert("Ошибка: Таблица payment_requests не найдена. Обратитесь в поддержку.");
            setBtnDisabled(false);
            setBtnText("Отправить отчет");
            return;
          }
          // Ошибка duplicate key - уникальный индекс
          if (dbError.code === '23505' || dbError.message?.includes('duplicate key') || dbError.message?.includes('unique constraint')) {
            console.error("Ошибка: уже есть pending заявка для этого продукта");
            alert("Ошибка отправки заявки: у вас уже есть активная заявка на оплату для TOQIBOX. Дождитесь её обработки или обратитесь в поддержку.");
            setBtnDisabled(false);
            setBtnText("Отправить отчет");
            return;
          }
          // Ошибка RLS - политики не позволяют вставить
          if (dbError.code === '42501' || dbError.message?.includes('permission denied') || dbError.message?.includes('RLS')) {
            console.error("Ошибка RLS: нет прав на вставку. Проверьте политики payment_requests.");
            alert("Ошибка сохранения: нет прав доступа. Обратитесь в поддержку.");
            setBtnDisabled(false);
            setBtnText("Отправить отчет");
            return;
          }
          throw dbError;
        }

        console.log('[Payment] ✅ Заявка успешно сохранена:', insertedData);

        // Отправляем уведомление в Telegram после успешного сохранения
        if (insertedData && insertedData.length > 0 && insertedData[0] && insertedData[0].id) {
          const paymentRequestId = insertedData[0].id;
          console.log('[Payment] 📤 Отправляем уведомление в Telegram для заявки:', paymentRequestId);
          
          // Небольшая задержка, чтобы заявка точно сохранилась в БД
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          try {
            // Вызываем серверный endpoint для уведомления в Telegram
            console.log('[Payment] Вызываем /api/tg/notify-payment-request с payment_request_id:', paymentRequestId);
            const notifyResponse = await fetch('/api/tg/notify-payment-request', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ payment_request_id: paymentRequestId })
            });

            const responseText = await notifyResponse.text().catch(() => 'Unknown error');
            
            // Пытаемся распарсить JSON для более детального вывода
            let errorDetails = responseText;
            try {
              const parsed = JSON.parse(responseText);
              errorDetails = JSON.stringify(parsed, null, 2);
              console.error('[Payment] ❌ Детали ошибки (JSON):', parsed);
            } catch (e) {
              console.error('[Payment] ❌ Детали ошибки (текст):', responseText);
            }
            
            if (!notifyResponse.ok) {
              console.error('[Payment] ❌ Ошибка отправки уведомления в Telegram:');
              console.error('  Status:', notifyResponse.status, notifyResponse.statusText);
              console.error('  Response:', errorDetails);
              console.warn('[Payment] ⚠️ Заявка сохранена, но уведомление в Telegram не отправлено.');
              console.warn('[Payment] Проверьте переменные окружения в Cloudflare Pages:');
              console.warn('  - TELEGRAM_BOT_TOKEN');
              console.warn('  - TELEGRAM_ADMIN_CHAT_ID');
              console.warn('  - SUPABASE_URL');
              console.warn('  - SUPABASE_SERVICE_ROLE_KEY');
            } else {
              try {
                const result = JSON.parse(responseText || '{}');
                console.log('[Payment] ✅ Уведомление в Telegram отправлено:', result);
              } catch (parseError) {
                console.log('[Payment] ✅ Уведомление отправлено (ответ не JSON):', responseText.substring(0, 200));
              }
            }
          } catch (notifyError) {
            // Не блокируем успешную отправку заявки, если уведомление не отправилось
            console.error('[Payment] ❌ Критическая ошибка при отправке уведомления в Telegram:', notifyError);
            console.warn('[Payment] ⚠️ Заявка сохранена в БД, но уведомление в Telegram не отправлено. Проверьте логи Cloudflare Pages Functions и переменные окружения.');
          }
        }
      } catch (dbError) {
        console.error("[Payment] Критическая ошибка сохранения заявки:", dbError);
        alert(`Ошибка отправки заявки: ${dbError.message || 'Неизвестная ошибка'}. Обратитесь в поддержку.`);
        setBtnDisabled(false);
        setBtnText("Отправить отчет");
        return;
      }

      // Показываем красивое модальное окно успеха
      setShowSuccessModal(true);
      setBtnDisabled(false);
      setBtnText("Отправить отчет");
      setBtnGreen(false);
      setPreviewUrl("");
      input.value = "";
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
                onClick={() => {
                  if (returnTo) {
                    navigate(returnTo);
                  } else {
                    handleBack();
                  }
                }}
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

        {/* Модальное окно успеха */}
        {showSuccessModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              backdropFilter: 'blur(10px)',
            }}
            onClick={() => {
              setShowSuccessModal(false);
              handleBack();
              if (returnTo) {
                navigate(returnTo);
              }
            }}
          >
            <div
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                padding: '32px 40px',
                maxWidth: '420px',
                width: '90%',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  margin: '0 auto 24px',
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#ffffff',
                  textAlign: 'center',
                  marginBottom: '12px',
                  lineHeight: 1.3,
                }}
              >
                Чек успешно отправлен
              </h2>

              <p
                style={{
                  fontSize: '15px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'center',
                  marginBottom: '32px',
                  lineHeight: 1.6,
                }}
              >
                Ваша заявка на оплату получена. Ожидайте уведомления о статусе проверки.
              </p>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  handleBack();
                  if (returnTo) {
                    navigate(returnTo);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: '#22c55e',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#16a34a';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#22c55e';
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}
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
        {/* Кнопка "Назад" если есть returnTo */}
        {returnTo && (
          <button
            onClick={() => navigate(returnTo)}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 1000,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            ← Назад
          </button>
        )}

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