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
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArtists: 0,
    totalTracks: 0,
    premiumUsers: 0,
    premiumPlusUsers: 0,
  });
  
  // Studio данные
  const [studioUsers, setStudioUsers] = useState([]);
  const [studioExports, setStudioExports] = useState([]);
  
  // TOQIBOX подписки
  const [toqiboxUsers, setToqiboxUsers] = useState([]);
  const [studioStats, setStudioStats] = useState({
    activePremium: 0,
    activePremiumPlus: 0,
    exportsToday: 0,
    exportsTotal: 0,
  });
  
  // Studio фильтры
  const [studioExportStatusFilter, setStudioExportStatusFilter] = useState("all"); // all, success, failed, canceled
  const [studioExportUserFilter, setStudioExportUserFilter] = useState("");
  const [studioExportTodayFilter, setStudioExportTodayFilter] = useState(false);
  
  // UI состояния
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [subscriptionsSubTab, setSubscriptionsSubTab] = useState("toqibox"); // toqibox или studio
  
  // Поиск и фильтры
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all"); // all, pending, approved, rejected
  const [premiumFilter, setPremiumFilter] = useState("all"); // all, premium, premium_plus, none
  const [paymentRequestStatusFilter, setPaymentRequestStatusFilter] = useState("pending"); // all, pending, approved, rejected - по умолчанию pending (для вкладки "Заявки на оплату")
  const [paymentRequestProductFilter, setPaymentRequestProductFilter] = useState("all"); // all, studio, toqibox
  
  // Модальные окна
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [approveDays, setApproveDays] = useState(30);
  const [showEditArtistModal, setShowEditArtistModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState(null);

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

        let isAdmin = !!admin;
        
        // Fallback: проверка по email для надежности
        if (!isAdmin && session.user.email === "levakandproduction@gmail.com") {
          isAdmin = true;
          console.log("🔑 Admin access granted by email:", session.user.email);
        }

        if (!isAdmin) {
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

      // Загружаем заявки на оплату
      let paymentRequestsData = [];
      try {
        console.log('[Admin] Загружаем заявки на оплату...');
        
        // Проверяем, является ли текущий пользователь админом
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: adminCheck } = await supabase
            .from("admins")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("is_active", true)
            .maybeSingle();
          console.log('[Admin] Проверка прав админа:', {
            userId: session.user.id,
            email: session.user.email,
            isAdmin: !!adminCheck,
            adminRecord: adminCheck
          });
        }
        
        const { data, error } = await supabase
          .from("payment_requests")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("[Admin] Ошибка загрузки payment_requests:", error);
          console.error("[Admin] Детали ошибки:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
        } else {
          console.log('[Admin] Загружено заявок на оплату:', data?.length || 0);
          paymentRequestsData = data || [];
          
          // Получаем email для каждой заявки из auth.users через функцию
          paymentRequestsData = await Promise.all(
            (paymentRequestsData || []).map(async (request) => {
              try {
                // Пытаемся получить email из auth.users через admin функцию или из payments
                const { data: paymentData } = await supabase
                  .from("payments")
                  .select("user_email")
                  .eq("user_id", request.user_id)
                  .limit(1)
                  .maybeSingle();
                
                return {
                  ...request,
                  user_email: paymentData?.user_email || null,
                };
              } catch (err) {
                console.warn('[Admin] Ошибка получения email для заявки:', request.id, err);
                return request;
              }
            })
          );
        }
      } catch (e) {
        console.error("[Admin] Критическая ошибка загрузки заявок на оплату:", e);
      }

      setUsers(usersWithEmail);
      setArtists(artistsData || []);
      setTracks(tracksData || []);
      setPayments(paymentsData || []);
      setPaymentRequests(paymentRequestsData || []);

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

      // Загружаем Studio и TOQIBOX данные
      await loadStudioData();
      await loadToqiboxSubscriptions();
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка TOQIBOX подписок
  const loadToqiboxSubscriptions = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, toqibox_plan, toqibox_plan_expires_at')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Ошибка загрузки TOQIBOX профилей:', profilesError);
        setToqiboxUsers([]);
      } else {
        // Рассчитываем статус для каждого пользователя
        const usersWithStatus = (profilesData || []).map(profile => {
          const plan = profile.toqibox_plan || 'free';
          const expiresAt = profile.toqibox_plan_expires_at;
          
          let status = 'free';
          if (plan === 'premium' || plan === 'premium_plus') {
            if (expiresAt) {
              const expires = new Date(expiresAt);
              const now = new Date();
              status = expires > now ? 'active' : 'expired';
            } else {
              status = 'expired';
            }
          }
          
          return {
            ...profile,
            status,
          };
        });
        
        setToqiboxUsers(usersWithStatus);
      }
    } catch (error) {
      console.error('Ошибка загрузки TOQIBOX подписок:', error);
    }
  };

  // Загрузка Studio данных
  const loadStudioData = async () => {
    try {
      // Загружаем пользователей с Studio тарифами из profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, studio_plan, studio_plan_expires_at, studio_approved_at, studio_approved_by')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Ошибка загрузки Studio профилей:', profilesError);
        setStudioUsers([]);
      } else {
        // Пытаемся получить email из payments для каждого пользователя
        const profilesWithEmail = await Promise.all(
          (profilesData || []).map(async (profile) => {
            try {
              const { data: paymentData } = await supabase
                .from('payments')
                .select('user_email')
                .eq('user_id', profile.id)
                .limit(1)
                .maybeSingle();
              
              return {
                ...profile,
                email: paymentData?.user_email || null,
              };
            } catch {
              return profile;
            }
          })
        );
        
        // Рассчитываем статус для каждого пользователя
        const usersWithStatus = profilesWithEmail.map(profile => {
          const plan = profile.studio_plan || 'free';
          const expiresAt = profile.studio_plan_expires_at;
          
          let status = 'free';
          if (plan === 'premium' || plan === 'premium_plus') {
            if (expiresAt) {
              const expires = new Date(expiresAt);
              const now = new Date();
              status = expires > now ? 'active' : 'expired';
            } else {
              status = 'expired';
            }
          }
          
          return {
            ...profile,
            status,
          };
        });
        
        setStudioUsers(usersWithStatus);
        
        // Подсчитываем статистику Studio
        const activePremium = usersWithStatus.filter(u => 
          u.studio_plan === 'premium' && u.status === 'active'
        ).length;
        const activePremiumPlus = usersWithStatus.filter(u => 
          u.studio_plan === 'premium_plus' && u.status === 'active'
        ).length;
        
        setStudioStats(prev => ({
          ...prev,
          activePremium,
          activePremiumPlus,
        }));
      }

      // Загружаем экспорты Studio
      const { data: exportsData, error: exportsError } = await supabase
        .from('exports')
        .select('*')
        .eq('product', 'studio')
        .order('created_at', { ascending: false });

      if (exportsError) {
        console.error('Ошибка загрузки Studio экспортов:', exportsError);
        setStudioExports([]);
      } else {
        setStudioExports(exportsData || []);
        
        // Подсчитываем статистику экспортов
        const today = new Date().toISOString().split('T')[0];
        const exportsToday = (exportsData || []).filter(e => {
          const exportDate = new Date(e.created_at).toISOString().split('T')[0];
          return exportDate === today && e.status === 'success';
        }).length;
        const exportsTotal = (exportsData || []).filter(e => e.status === 'success').length;
        
        setStudioStats(prev => ({
          ...prev,
          exportsToday,
          exportsTotal,
        }));
      }
    } catch (error) {
      console.error('Ошибка загрузки Studio данных:', error);
    }
  };

  // Управление Studio тарифами
  const handleStudioApprove = async (userId, planType) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminId = session?.user?.id || null;
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      const updateData = {
        studio_plan: planType,
        studio_plan_expires_at: expiresAt.toISOString(),
        studio_approved_at: new Date().toISOString(),
        studio_approved_by: adminId,
      };
      
      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);
      
      await loadStudioData();
    } catch (error) {
      console.error('Ошибка обновления Studio тарифа:', error);
      alert('Ошибка: ' + error.message);
    }
  };

  const handleStudioRemove = async (userId) => {
    if (!confirm('Убрать премиум подписку и вернуть пользователя на бесплатный план?')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminId = session?.user?.id || null;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          studio_plan: 'free',
          studio_plan_expires_at: null,
          studio_approved_at: null,
          studio_approved_by: null,
        })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Обновляем данные
      await loadStudioData();
      await loadData(); // Также обновляем общие данные
      
      alert('Премиум подписка успешно убрана. Пользователь переведен на бесплатный план.');
    } catch (error) {
      console.error('Ошибка снятия Studio тарифа:', error);
      alert('Ошибка: ' + error.message);
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

  const filteredPaymentRequests = useMemo(() => {
    let filtered = paymentRequests;

    // Автоматический фильтр по статусу в зависимости от активной вкладки
    let statusFilter = paymentRequestStatusFilter;
    if (activeTab === "payment_requests") {
      // Вкладка "Заявки на оплату" - только ожидающие
      statusFilter = "pending";
    } else if (activeTab === "payment_requests_approved") {
      // Вкладка "Одобренные заявки"
      statusFilter = "approved";
    } else if (activeTab === "payment_requests_rejected") {
      // Вкладка "Отклоненные заявки"
      statusFilter = "rejected";
    }

    // Фильтр по статусу
    if (statusFilter !== "all") {
      filtered = filtered.filter(pr => pr.status === statusFilter);
    }

    // Фильтр по продукту
    if (paymentRequestProductFilter !== "all") {
      filtered = filtered.filter(pr => pr.product === paymentRequestProductFilter);
    }

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pr => 
        (pr.user_id || "").toLowerCase().includes(query) ||
        (pr.plan || "").toLowerCase().includes(query) ||
        (pr.product || "").toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [paymentRequests, paymentRequestStatusFilter, paymentRequestProductFilter, searchQuery, activeTab]);

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

  // Одобрение заявки на оплату (идемпотентное)
  const handleApprovePaymentRequest = async (requestId, userId, product, plan) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminId = session?.user?.id || null;
      
      // Идемпотентное обновление: UPDATE только если status='pending'
      const { data: updatedRequest, error: updateError } = await supabase
        .from('payment_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: adminId,
        })
        .eq('id', requestId)
        .eq('status', 'pending')
        .select();

      // Проверяем, что обновлена ровно 1 запись (affected_rows === 1)
      if (updateError) {
        throw updateError;
      }

      if (!updatedRequest || updatedRequest.length !== 1) {
        alert('Заявка уже обработана или не найдена. Повторное продление не выполнено.');
        await loadData();
        return;
      }

      // Только если обновление успешно - продлеваем план
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Обновляем профиль пользователя в зависимости от продукта
      if (product === 'studio') {
        await supabase
          .from('profiles')
          .update({
            studio_plan: plan,
            studio_plan_expires_at: expiresAt.toISOString(),
          })
          .eq('id', userId);
      } else if (product === 'toqibox') {
        await supabase
          .from('profiles')
          .update({
            toqibox_plan: plan,
            toqibox_plan_expires_at: expiresAt.toISOString(),
          })
          .eq('id', userId);
      }

      await loadData();
      alert('Заявка одобрена. Подписка активирована на 30 дней. Заявка перемещена в раздел "Одобренные".');
    } catch (error) {
      console.error('Ошибка одобрения заявки:', error);
      alert('Ошибка: ' + error.message);
    }
  };

  // Отклонение заявки на оплату (идемпотентное)
  const handleRejectPaymentRequest = async (requestId) => {
    if (!confirm('Отклонить эту заявку?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminId = session?.user?.id || null;

      // Идемпотентное обновление: UPDATE только если status='pending'
      const { data: updatedRequest, error: updateError } = await supabase
        .from('payment_requests')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: adminId,
        })
        .eq('id', requestId)
        .eq('status', 'pending')
        .select();

      // Проверяем, что обновлена ровно 1 запись (affected_rows === 1)
      if (updateError) {
        throw updateError;
      }

      if (!updatedRequest || updatedRequest.length !== 1) {
        alert('Заявка уже обработана или не найдена.');
        await loadData();
        return;
      }

      await loadData();
      alert('Заявка отклонена. Заявка перемещена в раздел "Отклоненные".');
    } catch (error) {
      console.error('Ошибка отклонения заявки:', error);
      alert('Ошибка: ' + error.message);
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
        <div className="stat-card">
          <div className="stat-value">{studioStats.activePremium}</div>
          <div className="stat-label">Активный PREMIUM (Studio)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{studioStats.activePremiumPlus}</div>
          <div className="stat-label">Активный PREMIUM+ (Studio)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{studioStats.exportsToday}</div>
          <div className="stat-label">Экспортов сегодня (Studio)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{studioStats.exportsTotal}</div>
          <div className="stat-label">Экспортов всего (Studio)</div>
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
        {(activeTab === "payment_requests" || activeTab === "payment_requests_approved" || activeTab === "payment_requests_rejected") && (
          <select
            value={paymentRequestProductFilter}
            onChange={(e) => setPaymentRequestProductFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">Все продукты</option>
            <option value="studio">Studio</option>
            <option value="toqibox">TOQIBOX</option>
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
          Подписки ({filteredPayments.length})
        </button>
        <button
          className={activeTab === "studio" ? "active" : ""}
          onClick={() => setActiveTab("studio")}
        >
          TQ STUDIO ({studioUsers.length})
        </button>
        <button
          className={activeTab === "payment_requests" ? "active" : ""}
          onClick={() => {
            setActiveTab("payment_requests");
            setPaymentRequestStatusFilter("pending");
          }}
        >
          Заявки на оплату ({paymentRequests.filter(pr => pr.status === 'pending').length})
        </button>
        <button
          className={activeTab === "payment_requests_approved" ? "active" : ""}
          onClick={() => {
            setActiveTab("payment_requests_approved");
            setPaymentRequestStatusFilter("approved");
          }}
        >
          Одобренные ({paymentRequests.filter(pr => pr.status === 'approved').length})
        </button>
        <button
          className={activeTab === "payment_requests_rejected" ? "active" : ""}
          onClick={() => {
            setActiveTab("payment_requests_rejected");
            setPaymentRequestStatusFilter("rejected");
          }}
        >
          Отклоненные ({paymentRequests.filter(pr => pr.status === 'rejected').length})
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
          <div>
            {/* Под-вкладки для подписок */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #d2d2d7' }}>
              <button
                className={subscriptionsSubTab === "toqibox" ? "active" : ""}
                onClick={() => setSubscriptionsSubTab("toqibox")}
                style={{
                  padding: '8px 16px',
                  background: subscriptionsSubTab === "toqibox" ? '#f5f5f7' : 'transparent',
                  border: 'none',
                  borderBottom: subscriptionsSubTab === "toqibox" ? '2px solid #007aff' : '2px solid transparent',
                  color: subscriptionsSubTab === "toqibox" ? '#007aff' : '#86868b',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Подписки TOQIBOX ({toqiboxUsers.length})
              </button>
              <button
                className={subscriptionsSubTab === "studio" ? "active" : ""}
                onClick={() => setSubscriptionsSubTab("studio")}
                style={{
                  padding: '8px 16px',
                  background: subscriptionsSubTab === "studio" ? '#f5f5f7' : 'transparent',
                  border: 'none',
                  borderBottom: subscriptionsSubTab === "studio" ? '2px solid #007aff' : '2px solid transparent',
                  color: subscriptionsSubTab === "studio" ? '#007aff' : '#86868b',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Подписки Studio ({studioUsers.length})
              </button>
            </div>

            {/* Подписки TOQIBOX */}
            {subscriptionsSubTab === "toqibox" && (
              <div className="admin-list">
                {toqiboxUsers.length === 0 ? (
                  <div className="admin-empty">Подписки TOQIBOX не найдены</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #d2d2d7' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Email/ID</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Plan</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Expires At</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {toqiboxUsers.map((user) => {
                        const statusColors = {
                          active: "#10b981",
                          expired: "#f59e0b",
                          free: "#6b7280"
                        };
                        const statusLabels = {
                          active: "Активен",
                          expired: "Истёк",
                          free: "Бесплатный"
                        };
                        
                        return (
                          <tr key={user.id} style={{ borderBottom: '1px solid #f5f5f7' }}>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1d1d1f', marginBottom: '4px' }}>
                                {user.email || '—'}
                              </div>
                              <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#6b7280' }}>{user.id}</div>
                            </td>
                            <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600, color: '#1d1d1f' }}>
                              {user.toqibox_plan === 'free' || !user.toqibox_plan ? 'БЕСПЛАТНЫЙ' : (user.toqibox_plan || 'free').toUpperCase()}
                            </td>
                            <td style={{ padding: '12px', fontSize: '11px', color: '#1d1d1f' }}>
                              {user.toqibox_plan_expires_at 
                                ? new Date(user.toqibox_plan_expires_at).toLocaleString("ru-RU")
                                : '-'}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span 
                                className="badge-status" 
                                style={{ 
                                  backgroundColor: statusColors[user.status],
                                  fontSize: '10px',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  color: '#ffffff'
                                }}
                              >
                                {statusLabels[user.status]}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Подписки Studio */}
            {subscriptionsSubTab === "studio" && (
              <div className="admin-list">
                {studioUsers.length === 0 ? (
                  <div className="admin-empty">Подписки Studio не найдены</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #d2d2d7' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Email/ID</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Plan</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Expires At</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Статус</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studioUsers.map((user) => {
                        const statusColors = {
                          active: "#10b981",
                          expired: "#f59e0b",
                          free: "#6b7280"
                        };
                        const statusLabels = {
                          active: "Активен",
                          expired: "Истёк",
                          free: "Бесплатный"
                        };
                        
                        return (
                          <tr key={user.id} style={{ borderBottom: '1px solid #f5f5f7' }}>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1d1d1f', marginBottom: '4px' }}>
                                {user.email || '—'}
                              </div>
                              <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#6b7280' }}>{user.id}</div>
                            </td>
                            <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600, color: '#1d1d1f' }}>
                              {user.studio_plan === 'free' || !user.studio_plan ? 'БЕСПЛАТНЫЙ' : (user.studio_plan || 'free').toUpperCase()}
                            </td>
                            <td style={{ padding: '12px', fontSize: '11px', color: '#1d1d1f' }}>
                              {user.studio_plan_expires_at 
                                ? new Date(user.studio_plan_expires_at).toLocaleString("ru-RU")
                                : '-'}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span 
                                className="badge-status" 
                                style={{ 
                                  backgroundColor: statusColors[user.status],
                                  fontSize: '10px',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  color: '#ffffff'
                                }}
                              >
                                {statusLabels[user.status]}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button
                                  className="btn-success"
                                  onClick={() => handleStudioApprove(user.id, 'premium')}
                                  style={{ fontSize: '11px', padding: '6px 12px' }}
                                >
                                  Дать PREMIUM на 30 дней
                                </button>
                                <button
                                  className="btn-success"
                                  onClick={() => handleStudioApprove(user.id, 'premium_plus')}
                                  style={{ fontSize: '11px', padding: '6px 12px' }}
                                >
                                  Дать PREMIUM+ на 30 дней
                                </button>
                                <button
                                  className="btn-danger"
                                  onClick={() => handleStudioRemove(user.id)}
                                  style={{ fontSize: '11px', padding: '6px 12px' }}
                                  title="Убрать премиум подписку и вернуть пользователя на бесплатный план"
                                >
                                  Убрать премиум
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "studio" && (
          <div>
            {/* Таблица пользователей Studio */}
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: '#1d1d1f' }}>Подписки Studio</h2>
            <div className="admin-list" style={{ marginBottom: '32px' }}>
              {studioUsers.length === 0 ? (
                <div className="admin-empty">Пользователи не найдены</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #d2d2d7' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Email/ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Тариф</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Истекает</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Статус</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studioUsers.map((user) => {
                      const statusColors = {
                        active: "#10b981",
                        expired: "#f59e0b",
                        free: "#6b7280"
                      };
                      const statusLabels = {
                        active: "Активен",
                        expired: "Истёк",
                        free: "Бесплатный"
                      };
                      
                      return (
                        <tr key={user.id} style={{ borderBottom: '1px solid #f5f5f7' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1d1d1f', marginBottom: '4px' }}>
                              {user.email || '—'}
                            </div>
                            <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#6b7280' }}>{user.id}</div>
                          </td>
                          <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600, color: '#1d1d1f' }}>
                            {(user.studio_plan || 'free').toUpperCase()}
                          </td>
                          <td style={{ padding: '12px', fontSize: '11px', color: '#1d1d1f' }}>
                            {user.studio_plan_expires_at 
                              ? new Date(user.studio_plan_expires_at).toLocaleString("ru-RU")
                              : '-'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span 
                              className="badge-status" 
                              style={{ 
                                backgroundColor: statusColors[user.status],
                                fontSize: '10px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                color: '#ffffff'
                              }}
                            >
                              {statusLabels[user.status]}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                className="btn-success"
                                onClick={() => handleStudioApprove(user.id, 'premium')}
                                style={{ fontSize: '11px', padding: '6px 12px' }}
                              >
                                Дать PREMIUM на 30 дней
                              </button>
                              <button
                                className="btn-success"
                                onClick={() => handleStudioApprove(user.id, 'premium_plus')}
                                style={{ fontSize: '11px', padding: '6px 12px' }}
                              >
                                Дать PREMIUM+ на 30 дней
                              </button>
                                <button
                                  className="btn-danger"
                                  onClick={() => handleStudioRemove(user.id)}
                                  style={{ fontSize: '11px', padding: '6px 12px' }}
                                  title="Убрать премиум подписку и вернуть пользователя на бесплатный план"
                                >
                                  Убрать премиум
                                </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Таблица экспортов Studio */}
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: '#1d1d1f' }}>Экспорты Studio</h2>
            
            {/* Фильтры экспортов */}
            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#1d1d1f' }}>
                <input
                  type="checkbox"
                  checked={studioExportTodayFilter}
                  onChange={(e) => setStudioExportTodayFilter(e.target.checked)}
                  style={{ marginRight: '4px' }}
                />
                Только сегодня
              </label>
              <select
                value={studioExportStatusFilter}
                onChange={(e) => setStudioExportStatusFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  background: '#ffffff',
                  border: '1px solid #d2d2d7',
                  borderRadius: '6px',
                  color: '#1d1d1f',
                  fontSize: '12px',
                }}
              >
                <option value="all">Все статусы</option>
                <option value="success">Успешно</option>
                <option value="failed">Ошибка</option>
                <option value="canceled">Отменено</option>
              </select>
              <input
                type="text"
                placeholder="Фильтр по user_id или email"
                value={studioExportUserFilter}
                onChange={(e) => setStudioExportUserFilter(e.target.value)}
                style={{
                  padding: '6px 10px',
                  background: '#ffffff',
                  border: '1px solid #d2d2d7',
                  borderRadius: '6px',
                  color: '#1d1d1f',
                  fontSize: '12px',
                  minWidth: '200px',
                }}
              />
            </div>

            <div className="admin-list">
              {(() => {
                let filteredExports = studioExports;
                
                // Фильтр по статусу
                if (studioExportStatusFilter !== 'all') {
                  filteredExports = filteredExports.filter(e => e.status === studioExportStatusFilter);
                }
                
                // Фильтр по user_id
                if (studioExportUserFilter) {
                  filteredExports = filteredExports.filter(e => 
                    e.user_id?.toLowerCase().includes(studioExportUserFilter.toLowerCase())
                  );
                }
                
                // Фильтр по сегодня
                if (studioExportTodayFilter) {
                  const today = new Date().toISOString().split('T')[0];
                  filteredExports = filteredExports.filter(e => {
                    const exportDate = new Date(e.created_at).toISOString().split('T')[0];
                    return exportDate === today;
                  });
                }
                
                return filteredExports.length === 0 ? (
                  <div className="admin-empty">Экспорты не найдены</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #d2d2d7' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Дата создания</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Пользователь</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Статус</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Длительность</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Разрешение</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExports.map((exportItem) => {
                        const statusColors = {
                          success: "#10b981",
                          failed: "#ef4444",
                          canceled: "#f59e0b"
                        };
                        const statusLabels = {
                          success: "Успешно",
                          failed: "Ошибка",
                          canceled: "Отменено"
                        };
                        
                        return (
                          <tr key={exportItem.id} style={{ borderBottom: '1px solid #f5f5f7' }}>
                            <td style={{ padding: '12px', fontSize: '11px', color: '#1d1d1f' }}>
                              {new Date(exportItem.created_at).toLocaleString("ru-RU")}
                            </td>
                            <td style={{ padding: '12px', fontSize: '11px', fontFamily: 'monospace', color: '#86868b' }}>
                              {exportItem.user_id}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span 
                                className="badge-status" 
                                style={{ 
                                  backgroundColor: statusColors[exportItem.status] || '#6b7280',
                                  fontSize: '10px',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  color: '#ffffff'
                                }}
                              >
                                {statusLabels[exportItem.status] || exportItem.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontSize: '11px', color: '#1d1d1f' }}>
                              {exportItem.duration_seconds || 0}с
                            </td>
                            <td style={{ padding: '12px', fontSize: '11px', color: '#1d1d1f' }}>
                              {exportItem.resolution || '-'}p
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === "payment_requests" && (
          <div className="admin-list">
            {filteredPaymentRequests.length === 0 ? (
              <div className="admin-empty">
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#1d1d1f' }}>
                  Нет заявок, ожидающих обработки
                </div>
                <div style={{ fontSize: '12px', color: '#86868b', lineHeight: '1.5', maxWidth: '500px', margin: '0 auto' }}>
                  Здесь отображаются только новые заявки, которые требуют проверки и одобрения.
                  После обработки заявки переносятся в соответствующие разделы "Одобренные" или "Отклоненные".
                </div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #d2d2d7' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Дата</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Пользователь</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Продукт</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Тариф</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Сумма</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Чек</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Статус</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPaymentRequests.map((request) => {
                    // Получаем email пользователя из request или users
                    const userEmail = request.user_email || users.find(u => u.id === request.user_id)?.email || null;
                    
                    const statusColors = {
                      pending: "#f59e0b",
                      approved: "#10b981",
                      rejected: "#ef4444"
                    };
                    const statusLabels = {
                      pending: "Ожидает",
                      approved: "Одобрена",
                      rejected: "Отклонена"
                    };
                    
                    const productLabels = {
                      studio: "Подписка Studio",
                      toqibox: "Подписка TOQIBOX"
                    };
                    
                    return (
                      <tr 
                        key={request.id} 
                        style={{ 
                          borderBottom: '1px solid #f5f5f7',
                          backgroundColor: request.status === 'approved' ? '#f0fdf4' : request.status === 'rejected' ? '#fef2f2' : 'transparent',
                          opacity: request.status !== 'pending' ? 0.85 : 1
                        }}
                      >
                        <td style={{ padding: '12px', fontSize: '11px', color: '#1d1d1f' }}>
                          {new Date(request.created_at).toLocaleString("ru-RU")}
                        </td>
                        <td style={{ padding: '12px', fontSize: '11px', fontFamily: 'monospace', color: '#1d1d1f' }}>
                          <div>{userEmail || '—'}</div>
                          <div style={{ fontSize: '9px', opacity: 0.5, marginTop: '2px', color: '#86868b' }}>{request.user_id}</div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600, color: '#1d1d1f' }}>
                          {productLabels[request.product] || request.product}
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600, color: '#1d1d1f' }}>
                          {(request.plan || '').toUpperCase()}
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', color: '#1d1d1f' }}>
                          {request.amount} TJS
                        </td>
                        <td style={{ padding: '12px' }}>
                          {request.receipt_url ? (
                            <button
                              className="btn-edit"
                              onClick={() => {
                                console.log('[Admin] Открываем чек:', {
                                  requestId: request.id,
                                  receiptUrl: request.receipt_url,
                                  isBlob: request.receipt_url?.startsWith('blob:'),
                                  isStorage: request.receipt_url?.includes('supabase.co')
                                });
                                setSelectedReceiptUrl(request.receipt_url);
                                setShowReceiptModal(true);
                              }}
                              style={{ fontSize: '11px', padding: '6px 12px' }}
                            >
                              Просмотр
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', opacity: 0.5, color: '#86868b' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span 
                            className="badge-status" 
                            style={{ 
                              backgroundColor: statusColors[request.status] || '#6b7280',
                              fontSize: '10px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              color: '#ffffff'
                            }}
                          >
                            {statusLabels[request.status] || request.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {request.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                className="btn-success"
                                onClick={() => handleApprovePaymentRequest(request.id, request.user_id, request.product, request.plan)}
                                style={{ fontSize: '11px', padding: '6px 12px' }}
                              >
                                Одобрить
                              </button>
                              <button
                                className="btn-danger"
                                onClick={() => handleRejectPaymentRequest(request.id)}
                                style={{ fontSize: '11px', padding: '6px 12px' }}
                              >
                                Отклонить
                              </button>
                            </div>
                          )}
                          {request.status === 'approved' && request.approved_at && (
                            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 500 }}>
                              ✓ Одобрено: {new Date(request.approved_at).toLocaleString("ru-RU")}
                            </div>
                          )}
                          {request.status === 'rejected' && request.rejected_at && (
                            <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 500 }}>
                              ✗ Отклонено: {new Date(request.rejected_at).toLocaleString("ru-RU")}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Вкладка одобренных заявок */}
        {activeTab === "payment_requests_approved" && (
          <div className="admin-list">
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: '#1d1d1f' }}>Одобренные заявки</h2>
            {filteredPaymentRequests.length === 0 ? (
              <div className="admin-empty">
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#1d1d1f' }}>
                  Нет одобренных заявок
                </div>
                <div style={{ fontSize: '12px', color: '#86868b', lineHeight: '1.5', maxWidth: '500px', margin: '0 auto' }}>
                  Здесь отображаются все одобренные заявки на оплату.
                </div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #d2d2d7' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Дата заявки</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Пользователь</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Продукт</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Тариф</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Сумма</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Чек</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Одобрено</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPaymentRequests.map((request) => {
                    const userEmail = request.user_email || users.find(u => u.id === request.user_id)?.email || null;
                    const productLabels = {
                      studio: "Подписка Studio",
                      toqibox: "Подписка TOQIBOX"
                    };
                    
                    return (
                      <tr 
                        key={request.id} 
                        style={{ 
                          borderBottom: '1px solid #f5f5f7',
                          backgroundColor: '#f0fdf4'
                        }}
                      >
                        <td style={{ padding: '12px', fontSize: '11px', color: '#1d1d1f' }}>
                          {new Date(request.created_at).toLocaleString("ru-RU")}
                        </td>
                        <td style={{ padding: '12px', fontSize: '11px', fontFamily: 'monospace', color: '#1d1d1f' }}>
                          <div>{userEmail || '—'}</div>
                          <div style={{ fontSize: '9px', opacity: 0.5, marginTop: '2px', color: '#86868b' }}>{request.user_id}</div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600, color: '#1d1d1f' }}>
                          {productLabels[request.product] || request.product}
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600, color: '#1d1d1f' }}>
                          {(request.plan || '').toUpperCase()}
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', color: '#1d1d1f' }}>
                          {request.amount} TJS
                        </td>
                        <td style={{ padding: '12px' }}>
                          {request.receipt_url ? (
                            <button
                              className="btn-edit"
                              onClick={() => {
                                setSelectedReceiptUrl(request.receipt_url);
                                setShowReceiptModal(true);
                              }}
                              style={{ fontSize: '11px', padding: '6px 12px' }}
                            >
                              Просмотр
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#86868b' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', fontSize: '11px', color: '#10b981', fontWeight: 500 }}>
                          {request.approved_at ? new Date(request.approved_at).toLocaleString("ru-RU") : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Вкладка отклоненных заявок */}
        {activeTab === "payment_requests_rejected" && (
          <div className="admin-list">
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: '#1d1d1f' }}>Отклоненные заявки</h2>
            {filteredPaymentRequests.length === 0 ? (
              <div className="admin-empty">
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#1d1d1f' }}>
                  Нет отклоненных заявок
                </div>
                <div style={{ fontSize: '12px', color: '#86868b', lineHeight: '1.5', maxWidth: '500px', margin: '0 auto' }}>
                  Здесь отображаются все отклоненные заявки на оплату.
                </div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #d2d2d7' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Дата заявки</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Пользователь</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Продукт</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Тариф</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Сумма</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Чек</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#86868b' }}>Отклонено</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPaymentRequests.map((request) => {
                    const userEmail = request.user_email || users.find(u => u.id === request.user_id)?.email || null;
                    const productLabels = {
                      studio: "Подписка Studio",
                      toqibox: "Подписка TOQIBOX"
                    };
                    
                    return (
                      <tr 
                        key={request.id} 
                        style={{ 
                          borderBottom: '1px solid #f5f5f7',
                          backgroundColor: '#fef2f2'
                        }}
                      >
                        <td style={{ padding: '12px', fontSize: '11px', color: '#1d1d1f' }}>
                          {new Date(request.created_at).toLocaleString("ru-RU")}
                        </td>
                        <td style={{ padding: '12px', fontSize: '11px', fontFamily: 'monospace', color: '#1d1d1f' }}>
                          <div>{userEmail || '—'}</div>
                          <div style={{ fontSize: '9px', opacity: 0.5, marginTop: '2px', color: '#86868b' }}>{request.user_id}</div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600, color: '#1d1d1f' }}>
                          {productLabels[request.product] || request.product}
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', fontWeight: 600, color: '#1d1d1f' }}>
                          {(request.plan || '').toUpperCase()}
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', color: '#1d1d1f' }}>
                          {request.amount} TJS
                        </td>
                        <td style={{ padding: '12px' }}>
                          {request.receipt_url ? (
                            <button
                              className="btn-edit"
                              onClick={() => {
                                setSelectedReceiptUrl(request.receipt_url);
                                setShowReceiptModal(true);
                              }}
                              style={{ fontSize: '11px', padding: '6px 12px' }}
                            >
                              Просмотр
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#86868b' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', fontSize: '11px', color: '#ef4444', fontWeight: 500 }}>
                          {request.rejected_at ? new Date(request.rejected_at).toLocaleString("ru-RU") : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

      {/* Модальное окно просмотра чека */}
      {showReceiptModal && selectedReceiptUrl && (
        <div className="admin-modal-overlay" onClick={() => {
          setShowReceiptModal(false);
          setSelectedReceiptUrl(null);
        }}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3>Просмотр чека</h3>
            {selectedReceiptUrl && (
              <div style={{ marginBottom: '12px', fontSize: '11px', color: '#86868b', wordBreak: 'break-all' }}>
                URL: {selectedReceiptUrl}
              </div>
            )}
            <div style={{ marginBottom: '20px' }}>
              <img 
                src={selectedReceiptUrl} 
                alt="Чек об оплате" 
                onError={(e) => {
                  console.error('[Admin] Ошибка загрузки чека:', {
                    url: selectedReceiptUrl,
                    error: e,
                    isBlob: selectedReceiptUrl?.startsWith('blob:')
                  });
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: '8px',
                  border: '1px solid #d2d2d7'
                }} 
              />
              <div style={{ 
                display: 'none', 
                padding: '40px', 
                textAlign: 'center', 
                color: '#ef4444',
                border: '2px dashed #ef4444',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Ошибка загрузки чека</div>
                <div style={{ fontSize: '12px', color: '#86868b', marginBottom: '12px' }}>
                  URL может быть недействительным (blob URL) или файл не найден в Storage
                </div>
                <div style={{ fontSize: '11px', color: '#86868b', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {selectedReceiptUrl}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedReceiptUrl(null);
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
