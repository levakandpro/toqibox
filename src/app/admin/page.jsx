import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../features/auth/supabaseClient.js";
import "./admin.css";

export default function AdminPage() {
  const navigate = useNavigate();
  
  // Состояния для авторизации
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState("");

  // Основные данные
  const [users, setUsers] = useState([]);
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArtists: 0,
    totalTracks: 0,
    premiumUsers: 0,
    premiumPlusUsers: 0,
  });
  
  // UI состояния
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  
  // Поиск и фильтры
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all"); // all, pending, approved, rejected
  const [premiumFilter, setPremiumFilter] = useState("all"); // all, premium, premium_plus, none
  
  // Модальные окна
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [approveDays, setApproveDays] = useState(30);
  const [showEditArtistModal, setShowEditArtistModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);

  // Проверка авторизации и прав доступа
  useEffect(() => {
    const checkAdminAccess = async () => {
      setCheckingAuth(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setAuthError("Требуется авторизация");
          setIsAuthorized(false);
          setCheckingAuth(false);
          // Редиректим на логин через 2 секунды
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 2000);
          return;
        }

        // Проверяем, является ли пользователь админом
        const { data: admin, error: adminError } = await supabase
          .from("admins")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("is_active", true)
          .single();

        if (adminError || !admin) {
          // В локальной разработке разрешаем доступ без проверки
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          if (isLocal && import.meta.env.DEV) {
            console.warn("⚠️ Локальная разработка: доступ к админке разрешен без проверки");
            setIsAuthorized(true);
          } else {
            setAuthError("Доступ запрещен. Вы не являетесь администратором.");
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Ошибка проверки доступа:", error);
        setAuthError("Ошибка проверки доступа: " + error.message);
        setIsAuthorized(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  // Загрузка данных
  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Загружаем артистов
      const { data: artistsData, error: artistsError } = await supabase
        .from("artists")
        .select("*")
        .order("created_at", { ascending: false });

      if (artistsError) {
        console.error("Ошибка загрузки артистов:", artistsError);
      }

      // Загружаем треки
      const { data: tracksData, error: tracksError } = await supabase
        .from("tracks")
        .select("id, artist_id, title, slug, created_at, views_count, likes_count")
        .order("created_at", { ascending: false });

      if (tracksError) {
        console.warn("Ошибка загрузки треков:", tracksError);
      }

      // Создаем уникальный список пользователей из артистов
      const uniqueUsers = new Map();
      artistsData?.forEach(a => {
        if (a.user_id && !uniqueUsers.has(a.user_id)) {
          // Подсчитываем количество артистов и треков для каждого пользователя
          const userArtists = artistsData.filter(art => art.user_id === a.user_id);
          const userTracks = tracksData?.filter(t => 
            userArtists.some(art => art.id === t.artist_id)
          ) || [];
          
          uniqueUsers.set(a.user_id, { 
            id: a.user_id, 
            created_at: a.created_at,
            artistsCount: userArtists.length,
            tracksCount: userTracks.length,
          });
        }
      });
      
      const usersData = Array.from(uniqueUsers.values()).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      // Пытаемся получить email пользователей через RPC функцию или напрямую
      // В локальной разработке можем пропустить это
      const usersWithEmail = await Promise.all(
        usersData.map(async (user) => {
          try {
            // Пытаемся получить email из таблицы payments или других источников
            const { data: paymentData } = await supabase
              .from("payments")
              .select("user_email")
              .eq("user_id", user.id)
              .limit(1)
              .single();
            
            return {
              ...user,
              email: paymentData?.user_email || null,
            };
          } catch {
            return user;
          }
        })
      );

      // Загружаем платежи (все, не только pending)
      let paymentsData = [];
      try {
        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          console.warn("Таблица payments не найдена или ошибка:", error);
        } else {
          paymentsData = data || [];
        }
      } catch (e) {
        console.warn("Ошибка загрузки платежей:", e);
      }

      setUsers(usersWithEmail);
      setArtists(artistsData || []);
      setTracks(tracksData || []);
      setPayments(paymentsData || []);

      // Статистика
      const premiumCount = artistsData?.filter(a => 
        a.premium_type && 
        a.premium_until && 
        new Date(a.premium_until) > new Date()
      ).length || 0;
      
      const premiumPlusCount = artistsData?.filter(a => 
        a.premium_type === "premium_plus" && 
        a.premium_until && 
        new Date(a.premium_until) > new Date()
      ).length || 0;

      setStats({
        totalUsers: usersWithEmail.length,
        totalArtists: artistsData?.length || 0,
        totalTracks: tracksData?.length || 0,
        premiumUsers: premiumCount,
        premiumPlusUsers: premiumPlusCount,
      });
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация данных
  const filteredArtists = useMemo(() => {
    let filtered = artists;

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        (a.display_name || a.slug || "").toLowerCase().includes(query) ||
        (a.slug || "").toLowerCase().includes(query)
      );
    }

    // Фильтр по премиуму
    if (premiumFilter !== "all") {
      filtered = filtered.filter(a => {
        if (premiumFilter === "none") {
          return !a.premium_type || !a.premium_until || new Date(a.premium_until) <= new Date();
        }
        if (premiumFilter === "premium") {
          return a.premium_type === "premium" && a.premium_until && new Date(a.premium_until) > new Date();
        }
        if (premiumFilter === "premium_plus") {
          return a.premium_type === "premium_plus" && a.premium_until && new Date(a.premium_until) > new Date();
        }
        return true;
      });
    }

    return filtered;
  }, [artists, searchQuery, premiumFilter]);

  const filteredPayments = useMemo(() => {
    let filtered = payments;

    // Фильтр по статусу
    if (paymentStatusFilter !== "all") {
      filtered = filtered.filter(p => p.status === paymentStatusFilter);
    }

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        (p.user_email || "").toLowerCase().includes(query) ||
        (p.user_id || "").toLowerCase().includes(query) ||
        (p.plan || "").toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [payments, paymentStatusFilter, searchQuery]);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        (u.email || "").toLowerCase().includes(query) ||
        (u.id || "").toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [users, searchQuery]);

  // Обработчики
  const handleApprovePayment = async (paymentId, userId, planType, days) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const untilDate = new Date();
      untilDate.setDate(untilDate.getDate() + days);
      
      // Обновляем статус платежа
      await supabase
        .from("payments")
        .update({ 
          status: "approved", 
          approved_at: new Date().toISOString(),
          approved_by: session?.user?.id || null
        })
        .eq("id", paymentId);

      // Обновляем премиум у артиста
      const artist = artists.find(a => a.user_id === userId);
      if (artist) {
        await supabase
          .from("artists")
          .update({
            premium_type: planType,
            premium_until: untilDate.toISOString(),
            verified: true,
          })
          .eq("id", artist.id);
      }

      setShowApproveModal(false);
      setSelectedPayment(null);
      await loadData();
    } catch (error) {
      console.error("Ошибка подтверждения платежа:", error);
      alert("Ошибка: " + error.message);
    }
  };

  const handleExtendPremium = async (artistId, days) => {
    try {
      const artist = artists.find(a => a.id === artistId);
      if (!artist) return;

      const currentUntil = artist.premium_until ? new Date(artist.premium_until) : new Date();
      currentUntil.setDate(currentUntil.getDate() + days);

      await supabase
        .from("artists")
        .update({ premium_until: currentUntil.toISOString() })
        .eq("id", artistId);

      await loadData();
    } catch (error) {
      console.error("Ошибка продления премиума:", error);
      alert("Ошибка: " + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Удалить пользователя? Это удалит все его данные.")) return;
    
    try {
      await supabase.from("artists").delete().eq("user_id", userId);
      await supabase.from("payments").delete().eq("user_id", userId);
      await loadData();
      alert("Данные пользователя удалены. Для полного удаления из auth используйте Supabase Dashboard.");
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Ошибка: " + error.message);
    }
  };

  const handleDeleteArtist = async (artistId) => {
    if (!confirm("Удалить артиста?")) return;
    
    try {
      await supabase.from("artists").delete().eq("id", artistId);
      await loadData();
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Ошибка: " + error.message);
    }
  };

  const handleEditArtist = async (artistData) => {
    try {
      await supabase
        .from("artists")
        .update({
          display_name: artistData.display_name,
          slug: artistData.slug,
        })
        .eq("id", artistData.id);
      
      setShowEditArtistModal(false);
      setSelectedArtist(null);
      await loadData();
    } catch (error) {
      console.error("Ошибка редактирования артиста:", error);
      alert("Ошибка: " + error.message);
    }
  };

  // Показываем загрузку или ошибку авторизации
  if (checkingAuth) {
    return (
      <div className="admin-container">
        <div className="admin-loading">Проверка доступа...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="admin-container">
        <div className="admin-error">
          <h2>Доступ запрещен</h2>
          <p>{authError || "Вы не являетесь администратором"}</p>
          <button onClick={() => navigate("/login")}>Войти</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Админ-панель</h1>
        <button 
          className="btn-refresh" 
          onClick={loadData}
          title="Обновить данные"
        >
          🔄
        </button>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Пользователей</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalArtists}</div>
          <div className="stat-label">Артистов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalTracks}</div>
          <div className="stat-label">Треков</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.premiumUsers}</div>
          <div className="stat-label">PREMIUM</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.premiumPlusUsers}</div>
          <div className="stat-label">PREMIUM+</div>
        </div>
      </div>

      {/* Поиск и фильтры */}
      <div className="admin-filters">
        <input
          type="text"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-search"
        />
        {activeTab === "payments" && (
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">Все статусы</option>
            <option value="pending">Ожидающие</option>
            <option value="approved">Подтвержденные</option>
            <option value="rejected">Отклоненные</option>
          </select>
        )}
        {activeTab === "artists" && (
          <select
            value={premiumFilter}
            onChange={(e) => setPremiumFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">Все</option>
            <option value="premium">PREMIUM</option>
            <option value="premium_plus">PREMIUM+</option>
            <option value="none">Без премиума</option>
          </select>
        )}
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Пользователи ({filteredUsers.length})
        </button>
        <button
          className={activeTab === "artists" ? "active" : ""}
          onClick={() => setActiveTab("artists")}
        >
          Артисты ({filteredArtists.length})
        </button>
        <button
          className={activeTab === "payments" ? "active" : ""}
          onClick={() => setActiveTab("payments")}
        >
          Платежи ({filteredPayments.length})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "users" && (
          <div className="admin-list">
            {filteredUsers.length === 0 ? (
              <div className="admin-empty">Пользователи не найдены</div>
            ) : (
              filteredUsers.map((user, index) => (
                <div key={user.id} className={`admin-item ${index === 0 ? "latest" : ""}`}>
                  <div className="item-main">
                    <div className="item-title">
                      {user.email || user.id}
                      {index === 0 && <span className="badge-new">Новый</span>}
                    </div>
                    <div className="item-meta">
                      {new Date(user.created_at).toLocaleString("ru-RU")} • 
                      Артистов: {user.artistsCount || 0} • 
                      Треков: {user.tracksCount || 0}
                    </div>
                  </div>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Удалить
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "artists" && (
          <div className="admin-list">
            {filteredArtists.length === 0 ? (
              <div className="admin-empty">Артисты не найдены</div>
            ) : (
              filteredArtists.map((artist) => {
                const isPremium = artist.premium_type && artist.premium_until && new Date(artist.premium_until) > new Date();
                const premiumType = artist.premium_type === "premium_plus" ? "PREMIUM+" : artist.premium_type === "premium" ? "PREMIUM" : "Обычный";
                const artistTracks = tracks.filter(t => t.artist_id === artist.id);
                
                return (
                  <div key={artist.id} className="admin-item">
                    <div className="item-main">
                      <div className="item-title">
                        <a href={`/a/${artist.slug}`} target="_blank" rel="noopener noreferrer">
                          {artist.display_name || artist.slug}
                        </a>
                        {isPremium && (
                          <span className={`badge-premium ${artist.premium_type === "premium_plus" ? "gold" : ""}`}>
                            {premiumType}
                          </span>
                        )}
                      </div>
                      <div className="item-meta">
                        <a href={`/a/${artist.slug}`} target="_blank" rel="noopener noreferrer">
                          /a/{artist.slug}
                        </a>
                        {" • "}
                        {artist.premium_until ? `До ${new Date(artist.premium_until).toLocaleDateString("ru-RU")}` : "Без премиума"}
                        {" • "}
                        Треков: {artistTracks.length}
                      </div>
                      {isPremium && (
                        <div className="item-actions">
                          <button onClick={() => handleExtendPremium(artist.id, 7)}>+7 дней</button>
                          <button onClick={() => handleExtendPremium(artist.id, 14)}>+14 дней</button>
                          <button onClick={() => handleExtendPremium(artist.id, 21)}>+21 день</button>
                          <button onClick={() => handleExtendPremium(artist.id, 30)}>+30 дней</button>
                        </div>
                      )}
                    </div>
                    <div className="item-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => {
                          setSelectedArtist(artist);
                          setShowEditArtistModal(true);
                        }}
                      >
                        Редактировать
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteArtist(artist.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="admin-list">
            {filteredPayments.length === 0 ? (
              <div className="admin-empty">Платежи не найдены</div>
            ) : (
              filteredPayments.map((payment) => {
                const statusColors = {
                  pending: "#f59e0b",
                  approved: "#10b981",
                  rejected: "#ef4444"
                };
                const statusLabels = {
                  pending: "Ожидает",
                  approved: "Подтвержден",
                  rejected: "Отклонен"
                };
                
                return (
                  <div key={payment.id} className="admin-item payment-item">
                    <div className="item-main">
                      <div className="item-title">
                        {payment.plan} • {payment.amount} TJS
                        <span 
                          className="badge-status" 
                          style={{ backgroundColor: statusColors[payment.status] }}
                        >
                          {statusLabels[payment.status]}
                        </span>
                      </div>
                      <div className="item-meta">
                        {payment.user_email || payment.user_id} • {new Date(payment.created_at).toLocaleString("ru-RU")}
                        {payment.approved_at && ` • Подтвержден: ${new Date(payment.approved_at).toLocaleString("ru-RU")}`}
                      </div>
                      {payment.screenshot_url && (
                        <div className="payment-screenshot">
                          <img src={payment.screenshot_url} alt="Чек" />
                        </div>
                      )}
                    </div>
                    <div className="payment-actions">
                      {payment.status === "pending" && (
                        <>
                          <button
                            className="btn-success"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setApproveDays(30);
                              setShowApproveModal(true);
                            }}
                          >
                            Подтвердить
                          </button>
                          <button
                            className="btn-danger"
                            onClick={async () => {
                              await supabase.from("payments").update({ status: "rejected" }).eq("id", payment.id);
                              await loadData();
                            }}
                          >
                            Отклонить
                          </button>
                        </>
                      )}
                      {payment.status === "approved" && (
                        <span className="text-success">✓ Подтвержден</span>
                      )}
                      {payment.status === "rejected" && (
                        <span className="text-danger">✕ Отклонен</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Модальное окно подтверждения платежа */}
      {showApproveModal && selectedPayment && (
        <div className="admin-modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Подтвердить платеж</h3>
            <p>План: {selectedPayment.plan}</p>
            <p>Сумма: {selectedPayment.amount} TJS</p>
            <div className="modal-field">
              <label>Количество дней:</label>
              <input
                type="number"
                min="1"
                max="365"
                value={approveDays}
                onChange={(e) => setApproveDays(Number(e.target.value))}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-success"
                onClick={() => handleApprovePayment(
                  selectedPayment.id,
                  selectedPayment.user_id,
                  selectedPayment.plan === "PREMIUM+" ? "premium_plus" : "premium",
                  approveDays
                )}
              >
                Подтвердить ({approveDays} дней)
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedPayment(null);
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования артиста */}
      {showEditArtistModal && selectedArtist && (
        <div className="admin-modal-overlay" onClick={() => setShowEditArtistModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Редактировать артиста</h3>
            <div className="modal-field">
              <label>Имя:</label>
              <input
                type="text"
                value={selectedArtist.display_name || ""}
                onChange={(e) => setSelectedArtist({...selectedArtist, display_name: e.target.value})}
              />
            </div>
            <div className="modal-field">
              <label>Slug:</label>
              <input
                type="text"
                value={selectedArtist.slug || ""}
                onChange={(e) => setSelectedArtist({...selectedArtist, slug: e.target.value})}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-success"
                onClick={() => handleEditArtist(selectedArtist)}
              >
                Сохранить
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowEditArtistModal(false);
                  setSelectedArtist(null);
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
