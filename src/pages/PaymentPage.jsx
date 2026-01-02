// PaymentPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./PaymentPage.css";

import dcity from "../assets/dcity.jpg";

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
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

  const onSubmit = () => {
    const input = document.getElementById("file-input");
    if (!input || !input.files || !input.files[0]) {
      alert("Сначала прикрепите фото чека");
      return;
    }

    setBtnDisabled(true);
    setBtnText("Обработка...");

    setTimeout(() => {
      alert("Чек успешно отправлен. Ожидайте уведомления.");
      setBtnDisabled(false);
      setBtnText("Отправить отчет");
      setBtnGreen(false);
      setPreviewUrl("");
      input.value = "";
    }, 1500);
  };

  return (
    <div className="pay-root">
      <div className="mesh-bg"></div>

      <div className="container">
        <main className="content">
          <header className="header">
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
