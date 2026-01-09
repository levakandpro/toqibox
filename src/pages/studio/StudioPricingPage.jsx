import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudioPricingPage.css";

export default function StudioPricingPage() {
  const navigate = useNavigate();
  const [showRulesModal, setShowRulesModal] = useState(false);

  const plans = [
    {
      id: "free",
      name: "FREE",
      price: "0 TJS",
      pricePeriod: "",
      description: "Подходит для знакомства со TQ Studio",
      features: {
        dailyLimit: "До 3 видео в день",
        quality: "Качество экспорта: 720p",
        included: [
          "Ограниченный набор видео-шаблонов",
          "Ограниченный набор фото-пакетов",
          "Ограниченный набор шрифтов",
          "Ограниченный набор кнопок",
          "Ограниченный набор визуалов",
          "Ограниченный набор стикеров",
        ],
      },
      popular: false,
      buttonText: "Начать бесплатно",
      buttonAction: () => navigate("/studio"),
    },
    {
      id: "premium",
      name: "PREMIUM",
      price: "160 TJS",
      pricePeriod: "в месяц",
      description: "Подходит для регулярной работы и авторов",
      features: {
        dailyLimit: "До 10 видео в день",
        quality: "Качество экспорта: 1080p Full HD",
        included: [
          "Все premium-функции Studio",
          "Все шаблоны и материалы",
          "Полный доступ ко всем визуалам",
          "Полный доступ ко всем кнопкам",
          "Полный доступ ко всем шрифтам",
          "Полный доступ ко всем пакетам",
          "Без ограничений по категориям контента",
        ],
      },
      popular: true,
      buttonText: "Выбрать PREMIUM",
      buttonAction: () =>
        navigate(
          `/payment?plan=${encodeURIComponent("PREMIUM")}&amount=160`
        ),
    },
    {
      id: "premium-plus",
      name: "PREMIUM+",
      price: "1400 TJS",
      pricePeriod: "в год",
      description: "Подходит для студий и активного продакшена",
      features: {
        dailyLimit: "До 20 видео в день",
        quality: "Качество экспорта: 1080p Full HD",
        included: [
          "Всё, что есть в PREMIUM",
          "Увеличенный дневной лимит видео",
          "Экономия около 30% при оплате за год",
        ],
      },
      popular: false,
      buttonText: "Выбрать PREMIUM+",
      buttonAction: () =>
        navigate(
          `/payment?plan=${encodeURIComponent("PREMIUM+")}&amount=1400`
        ),
    },
  ];

  return (
    <div className="studio-pricing-page">
      <div className="studio-pricing-container">
        <div className="studio-pricing-header">
          <button
            className="studio-pricing-back-btn"
            onClick={() => navigate("/studio")}
          >
            НАЗАД В СТУДИЮ
          </button>
          <h1 className="studio-pricing-title">Тарифы TQ Studio</h1>
          <p className="studio-pricing-subtitle">
            Выберите план, который подходит именно вам
          </p>
        </div>

        <div className="studio-pricing-plans">
            {plans.map((plan) => (
            <div
              key={plan.id}
              className={`studio-pricing-card ${plan.popular ? "popular" : ""}`}
            >
              {plan.popular && (
                <div className="studio-pricing-badge">Популярный</div>
              )}
              
              <div className="studio-pricing-card-content">
                <div className="studio-pricing-card-header">
                  <div>
                    <h2 className="studio-pricing-plan-name">{plan.name}</h2>
                    <p className="studio-pricing-description">{plan.description}</p>
                  </div>
                  <div className="studio-pricing-price-block">
                    <p>
                      <span className="studio-pricing-price-amount">{plan.price}</span>
                      {plan.pricePeriod && (
                        <span className="studio-pricing-price-period">
                          {" "}{plan.pricePeriod}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="studio-pricing-features-block">
                  <div className="studio-pricing-feature-item">
                    <span className="studio-pricing-feature-label">Лимит:</span>
                    <span className="studio-pricing-feature-value">
                      {plan.features.dailyLimit}
                    </span>
                  </div>
                  <div className="studio-pricing-feature-item">
                    <span className="studio-pricing-feature-label">Качество:</span>
                    <span className="studio-pricing-feature-value">
                      {plan.features.quality}
                    </span>
                  </div>
                  
                  <div className="studio-pricing-included">
                    <h3 className="studio-pricing-included-title">Включено:</h3>
                    <ul className="studio-pricing-included-list">
                      {plan.features.included.map((item, index) => (
                        <li key={index} className="studio-pricing-included-item">
                          <span className="studio-pricing-check">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="studio-pricing-card-footer">
                <button
                  className={`studio-pricing-button ${
                    plan.popular ? "primary" : "secondary"
                  }`}
                  onClick={plan.buttonAction}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="studio-pricing-rules">
          <div className="studio-pricing-rules-content">
            <div 
              className="studio-pricing-rules-title-wrapper"
              onClick={() => setShowRulesModal(true)}
            >
              <h3 className="studio-pricing-rules-title">ПРАВИЛА ИСПОЛЬЗОВАНИЯ КОНТЕНТА</h3>
            </div>
          </div>
        </div>
      </div>

      {showRulesModal && (
        <div className="rules-modal-overlay" onClick={() => setShowRulesModal(false)}>
          <div
            className="rules-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rules-modal-header">
              <h3>ПРАВИЛА ИСПОЛЬЗОВАНИЯ КОНТЕНТА</h3>
              <button className="rules-close" onClick={() => setShowRulesModal(false)}>✕</button>
            </div>
            <div className="rules-modal-body">
              <div className="rules-section">
                <h4>1. Общие положения</h4>
                <p>Настоящие Правила определяют порядок использования контента, создаваемого пользователем с помощью сервиса TQ Studio. Используя сервис, пользователь подтверждает, что ознакомился с настоящими Правилами и принимает их в полном объёме.</p>
              </div>

              <div className="rules-section">
                <h4>2. Права на создаваемый контент</h4>
                <p>Все видео, визуалы и материалы, созданные пользователем в TQ Studio, принадлежат пользователю. TQ Studio не претендует на авторские или исключительные права на созданный пользователем контент. Пользователь вправе свободно публиковать, распространять и использовать созданные видео на любых платформах и носителях.</p>
              </div>

              <div className="rules-section">
                <h4>3. Права на материалы сервиса</h4>
                <p>Шаблоны, визуальные элементы, кнопки, шрифты, анимации и другие материалы, предоставляемые в составе сервиса, являются интеллектуальной собственностью TQ Studio или его правообладателей. Пользователь получает неисключительную лицензию на использование этих материалов только в рамках создания конечного видео. Запрещено: перепродавать шаблоны и элементы отдельно; извлекать, копировать или распространять материалы сервиса вне созданного видео; использовать материалы для создания конкурирующих сервисов или продуктов.</p>
              </div>

              <div className="rules-section">
                <h4>4. Ответственность пользователя</h4>
                <p>Пользователь самостоятельно несёт ответственность за законность используемого аудио, изображений и иных загружаемых материалов; соблюдение авторских прав третьих лиц; содержание создаваемых видео. TQ Studio не проверяет контент пользователя на наличие нарушений авторских прав и не несёт ответственности за такие нарушения.</p>
              </div>

              <div className="rules-section">
                <h4>5. Ограничения по контенту</h4>
                <p>Запрещено создавать и распространять контент, который нарушает законы страны пользователя или международные нормы; содержит призывы к насилию, экстремизму, ненависти; содержит незаконный, вредоносный или вводящий в заблуждение материал. TQ Studio оставляет за собой право ограничить доступ к сервису при выявлении грубых нарушений.</p>
              </div>

              <div className="rules-section">
                <h4>6. Использование в коммерческих целях</h4>
                <p>Пользователь вправе использовать созданные видео в коммерческих целях, в рекламе, в социальных сетях, на цифровых платформах и сайтах. Пользователь самостоятельно отвечает за соответствие такого использования законодательству и правилам платформ.</p>
              </div>

              <h3 className="rules-modal-subtitle">ОГРАНИЧЕНИЯ СЕРВИСА</h3>

              <div className="rules-section">
                <h4>1. Технические ограничения</h4>
                <p>Максимальная длительность одного видео — до четырёх минут; лимиты на количество экспортов в сутки зависят от выбранного тарифа; доступные форматы и качество экспорта определяются тарифным планом.</p>
              </div>

              <div className="rules-section">
                <h4>2. Ограничения тарифов</h4>
                <p>Бесплатный и платные тарифы имеют чётко зафиксированные лимиты, указанные на странице тарифов. Неиспользованные лимиты не переносятся, если иное не указано явно. TQ Studio оставляет за собой право изменять лимиты тарифов с предварительным уведомлением пользователей.</p>
              </div>

              <div className="rules-section">
                <h4>3. Доступность сервиса</h4>
                <p>TQ Studio стремится обеспечить стабильную работу сервиса, однако не гарантирует бесперебойную доступность в случаях: технических работ; обновлений; сбоев у сторонних провайдеров; форс-мажорных обстоятельств.</p>
              </div>

              <div className="rules-section">
                <h4>4. Ограничение ответственности</h4>
                <p>TQ Studio не несёт ответственности за упущенную выгоду; потерю данных по причинам, не зависящим от сервиса; невозможность использования сервиса по причинам, связанным с устройствами или сетью пользователя. Сервис предоставляется «как есть».</p>
              </div>

              <div className="rules-section">
                <h4>5. Борьба с злоупотреблениями</h4>
                <p>Запрещено: обходить лимиты тарифов; использовать множественные аккаунты для злоупотребления бесплатным доступом; применять автоматизированные средства для экспорта. При выявлении нарушений TQ Studio вправе временно ограничить доступ, приостановить аккаунт, отказать в обслуживании без компенсации.</p>
              </div>

              <div className="rules-section">
                <h4>6. Изменения условий</h4>
                <p>TQ Studio вправе обновлять настоящие Правила и Ограничения. Актуальная версия всегда доступна на сайте и применяется с момента публикации.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
