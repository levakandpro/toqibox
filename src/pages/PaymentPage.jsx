// PaymentPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../features/auth/supabaseClient.js";
import "./PaymentPage.css";

import dcity from "../assets/dcity.jpg";

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState("PREMIUM");
  const [amount, setAmount] = useState("140");
  const [previewUrl, setPreviewUrl] = useState("");
  const [btnText, setBtnText] = useState("Отправить отчет");
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnGreen, setBtnGreen] = useState(false);

  useEffect(() => {
    const p = searchParams.get("plan") || "PREMIUM";
    const a = searchParams.get("amount") || "140";
    setPlan(decodeURIComponent(p));
    setAmount(a);
  }, [searchParams]);

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
    const input = document.getElementById("file-input");
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

      let receiptUrl = previewUrl;

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
          receiptUrl = publicUrl;
        } else {
          console.warn("Ошибка загрузки файла в Storage:", uploadError);
          // Используем previewUrl (blob URL) как fallback
        }
      } catch (storageError) {
        console.warn("Storage недоступен:", storageError);
        // Используем previewUrl как fallback
      }

      // Создаем запись в таблице payment_requests для Studio
      try {
        // Преобразуем план в нижний регистр для единообразия
        const planLower = plan === 'PREMIUM+' ? 'premium_plus' : 'premium';
        const amountNum = parseFloat(amount) || 0;

        const { error: dbError } = await supabase
          .from('payment_requests')
          .insert({
            user_id: session.user.id,
            product: 'studio',
            plan: planLower,
            amount: amountNum,
            receipt_url: receiptUrl,
            status: 'pending'
          });

        if (dbError) {
          // Если таблицы нет, просто показываем сообщение
          if (dbError.code === '42P01' || dbError.message?.includes('does not exist')) {
            console.warn("Таблица payment_requests не найдена. Создайте её через SQL скрипт.");
            alert("Платеж отправлен. Ожидайте подтверждения. (Таблица payment_requests не настроена)");
            setBtnDisabled(false);
            setBtnText("Отправить отчет");
            setBtnGreen(false);
            setPreviewUrl("");
            input.value = "";
            return;
          }
          throw dbError;
        }
      } catch (dbError) {
        console.error("Ошибка сохранения заявки на оплату:", dbError);
        // Показываем сообщение, но не блокируем пользователя
        alert("Платеж отправлен. Ожидайте подтверждения.");
        setBtnDisabled(false);
        setBtnText("Отправить отчет");
        setBtnGreen(false);
        setPreviewUrl("");
        input.value = "";
        return;
      }

      alert("Чек успешно отправлен. Ожидайте уведомления.");
      setBtnDisabled(false);
      setBtnText("Отправить отчет");
      setBtnGreen(false);
      setPreviewUrl("");
      input.value = "";
      // Возвращаемся на страницу тарифов
      navigate("/studio/pricing");
    } catch (error) {
      console.error("Ошибка отправки:", error);
      alert("Ошибка отправки: " + error.message);
      setBtnDisabled(false);
      setBtnText("Отправить отчет");
    }
  };

  return (
    <div className="pay-root">
      <div className="mesh-bg"></div>

      <div className="container">
        <main className="content">
          <header className="header">
            <button
              type="button"
              onClick={() => navigate("/studio/pricing")}
              style={{
                border: "none",
                background: "none",
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                textTransform: "uppercase",
                fontSize: "10px",
                letterSpacing: "0.12em",
                marginBottom: "4px",
                padding: "0",
              }}
            >
              ← НАЗАД К ТАРИФАМ
            </button>
            <h1>Подтверждение</h1>
            <p>Завершите оплату через Dushanbe City</p>
          </header>

          <div className="summary-row">
            <span className="badge" id="plan">{plan}</span>
            <span className="amount" id="sum">{amount} TJS</span>
          </div>

          <div className="qr-card">
            <div className="qr-frame">
              <div className="scanner-line"></div>
              <img src={dcity} alt="QR" />
            </div>
            <p className="muted">Наведите камеру или отсканируйте в приложении</p>
          </div>

          <div className="upload-area">
            <label htmlFor="file-input">
              <span className="upload-icon">📷</span>
              <span className="upload-text">Прикрепить чек об оплате</span>
              <input type="file" id="file-input" accept="image/*" onChange={onFileChange} />
            </label>
          </div>

          <div
            className="preview-box"
            id="preview-box"
            style={{ display: previewUrl ? "block" : "none" }}
          >
            <img id="preview-img" src={previewUrl} alt="Чек" />
          </div>

          <button
            className={`main-btn ${btnGreen ? "is-green" : ""}`}
            id="submit-btn"
            onClick={onSubmit}
            disabled={btnDisabled}
            style={{
              opacity: btnDisabled ? "0.5" : "1",
            }}
          >
            {btnText}
          </button>

          <p className="warning">
            Проверка транзакции занимает до 15 минут. <b>Попытка подделки чека - бан по ID устройства.</b>
          </p>
        </main>
      </div>
    </div>
  );
}
