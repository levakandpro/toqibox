import React from "react";
import { Link } from "react-router-dom";
import "./PricingPage.css";

import telegramIcon from "../assets/share/telegram.svg";
import gmailIcon from "../assets/share/gmail.svg";

export default function PricingPage() {
  // ВАЖНО: ссылки можешь поменять под свои маршруты
  const links = {
    login: "/login",
    signup: "/signup",
    telegram: "https://t.me/TOQIBOX",
    email: "mailto:levakandproduction@gmail.com",
  };

  return (
    <div className="tbx-pricing">
      <div className="tbx-bg" />

      <main className="tbx-wrap">
        {/* Верхний баннер */}
        <section className="tbx-card tbx-top">
          <div className="tbx-topLeft">
            <div className="tbx-topTitle">Для оплаты необходимо войти в аккаунт</div>
            <div className="tbx-topSub">
              Это нужно, чтобы мы могли активировать тариф, отслеживать срок действия и показывать статус оплаты в личном кабинете.
            </div>
            <div className="tbx-topHint">Без авторизации оплата недоступна.</div>
          </div>

          <div className="tbx-topRight">
            <Link className="tbx-btn tbx-btnPrimary" to={links.login}>
              Войти
            </Link>
            <Link className="tbx-btn tbx-btnGhost" to={links.signup}>
              Создать аккаунт
            </Link>
          </div>
        </section>

        {/* Заголовок */}
        <header className="tbx-header">
          <h1 className="tbx-h1">Выберите тариф</h1>
          <div className="tbx-subtitle">Премиум визуалы и премиум тюбетейка TOQIBOX</div>
        </header>

        {/* Тарифы */}
        <section className="tbx-grid">
          {/* PREMIUM */}
          <article className="tbx-plan tbx-card">
            <div className="tbx-planTop">
              <div className="tbx-planName">PREMIUM</div>
              <div className="tbx-badge">рекомендуем</div>
            </div>

            <div className="tbx-price">
              <span className="tbx-priceValue">100</span>
              <span className="tbx-priceMeta">c / месяц</span>
            </div>

            <ul className="tbx-list">
              <li>Без рекламы</li>
              <li>Премиум тюбетейка для кнопки Play</li>
              <li>Премиум темы оформления</li>
              <li>Красивые обложки и шапка артиста</li>
              <li>Приоритетная модерация обложек</li>
              <li>Живая поддержка</li>
            </ul>

            <div className="tbx-planBottom">
              <Link className="tbx-btn tbx-btnPrimary tbx-btnFull" to={links.login}>
                Подключить 100 TJS в мес
              </Link>
              <div className="tbx-muted">Оплата подтверждается вручную.</div>
            </div>
          </article>

          {/* PREMIUM+ */}
          <article className="tbx-plan tbx-card tbx-planPro">
            <div className="tbx-planTop">
              <div className="tbx-planName">PREMIUM+</div>
              <div className="tbx-badge tbx-badgeGold">максимум</div>
            </div>

            <div className="tbx-price">
              <span className="tbx-priceValue">1000</span>
              <span className="tbx-priceMeta">c / год</span>
            </div>

            <div className="tbx-save">
              <span className="tbx-saveDot" />
              Экономия 200 c в год (-17%)
            </div>

            <ul className="tbx-list">
              <li>Всё как в PREMIUM</li>
              <li>Золотая тюбетейка рядом с ником</li>
              <li>Больше премиум тем и вариантов Play</li>
              <li>Выбор цвета ника</li>
              <li>Видео в шапке артиста по ссылке (YouTube)</li>
              <li>Поддержка 24/7</li>
            </ul>

            <div className="tbx-planBottom">
              <Link className="tbx-btn tbx-btnPrimary tbx-btnFull" to={links.login}>
                Подключить 1000 TJS в год
              </Link>
              <div className="tbx-muted">Оплата подтверждается вручную.</div>
            </div>
          </article>
        </section>

        {/* Как проходит оплата */}
        <section className="tbx-card tbx-steps">
          <div className="tbx-stepsTitle">Как проходит оплата</div>

          <div className="tbx-stepsGrid">
            <div className="tbx-step">
              <div className="tbx-stepNum">1</div>
              <div className="tbx-stepText">
                Выберите тариф PREMIUM или PREMIUM+ на этой странице.
              </div>
            </div>

            <div className="tbx-step">
              <div className="tbx-stepNum">2</div>
              <div className="tbx-stepText">
                На следующем шаге выберите банк или ЮMoney и переведите сумму тарифа.
              </div>
            </div>

            <div className="tbx-step">
              <div className="tbx-stepNum">3</div>
              <div className="tbx-stepText">
                Загрузите скрин перевода - мы подтвердим оплату и включим доступ.
              </div>
            </div>
          </div>

          <div className="tbx-stepsCTA">
            <div className="tbx-stepsCTATitle">Для оплаты необходимо войти в аккаунт</div>
            <div className="tbx-stepsCTASub">
              Это нужно, чтобы мы могли активировать тариф, отслеживать срок действия и показывать статус оплаты в личном кабинете.
            </div>

            <div className="tbx-stepsBtns">
              <Link className="tbx-btn tbx-btnPrimary" to={links.login}>
                Войти
              </Link>
              <Link className="tbx-btn tbx-btnGhost" to={links.signup}>
                Создать аккаунт
              </Link>
            </div>

            <div className="tbx-topHint">Без авторизации оплата недоступна.</div>
          </div>
        </section>

        {/* Условия */}
        <section className="tbx-card tbx-info">
          <div className="tbx-infoTitle">Что происходит после оплаты</div>
          <ul className="tbx-list tbx-listTight">
            <li>Вы оплачиваете тариф и загружаете скрин перевода</li>
            <li>Мы вручную сверяем платёж с выпиской банка</li>
            <li>В течение 30 минут тариф активируется</li>
            <li>Статус появится в личном кабинете</li>
            <li>Вы получите уведомление в интерфейсе</li>
          </ul>

          <div className="tbx-note">
            Оплата подтверждается вручную. Возврат средств не производится. Сумма перевода должна быть точной.
          </div>
        </section>

        <section className="tbx-card tbx-warn">
          <div className="tbx-warnTitle">Защита от мошенничества</div>
          <div className="tbx-warnText">
            Мы проверяем все платежи вручную. Сверяется сумма, время перевода, банк и получатель.
            Скрины, созданные с помощью ИИ или подделанные изображения, не принимаются.
            Любая попытка обмана приведёт к пожизненной блокировке аккаунта.
          </div>
          <div className="tbx-warnAccent">
            Блокировка производится по аккаунту, устройству и внутреннему ID.
          </div>
        </section>

        {/* Контакты */}
        <footer className="tbx-card tbx-footer">
          <div className="tbx-footerTitle">Поддержка</div>
          <div className="tbx-footerSub">Пиши - решим быстро.</div>

          <div className="tbx-footerBtns">
            <a className="tbx-iconBtn" href={links.telegram} target="_blank" rel="noreferrer">
              <img className="tbx-icon" src={telegramIcon} alt="Telegram" />
              <span>Telegram</span>
            </a>

            <a className="tbx-iconBtn" href={links.email}>
              <img className="tbx-icon" src={gmailIcon} alt="Email" />
              <span>Email</span>
            </a>
          </div>

          <div className="tbx-footerFine">
            Оплата подтверждается вручную. Все действия фиксируются. Любые попытки обхода системы приводят к блокировке.
          </div>
        </footer>
      </main>
    </div>
  );
}
