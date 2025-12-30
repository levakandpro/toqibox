// FILE: src/app/a/[slug]/page.jsx

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";

import ArtistHeader from "../../../features/artist/ArtistHeader.jsx";
import ArtistTracks from "../../../features/artist/ArtistTracks.jsx";

import ShareSheet from "../../../features/share/ShareSheet.jsx";
import { supabase } from "../../../features/auth/supabaseClient.js";

export default function ArtistPage() {
  const { slug = "artist" } = useParams();

  const [shareOpen, setShareOpen] = useState(false);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const refreshArtist = async () => {
    try {
      const { data: artistData, error: artistError } = await supabase
        .from("artists")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (artistError) throw artistError;
      if (artistData) {
        setArtist(artistData);
      }
    } catch (e) {
      console.error("Error refreshing artist:", e);
    }
  };

  const shareUrl = useMemo(() => {
    return `${window.location.origin}/a/${slug}`;
  }, [slug]);

  const subscriptionRef = useRef(null);

  useEffect(() => {
    let alive = true;

    const checkOwner = async (artistData) => {
      try {
        // Проверяем владельца с повторной попыткой
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          return false;
        }

        const session = sessionData?.session;
        const userId = session?.user?.id;

        // Отладочная информация
        console.log("Check owner:", {
          hasSession: !!session,
          userId,
          artistUserId: artistData?.user_id,
          isOwner: artistData && userId ? userId === artistData.user_id : false,
        });

        if (artistData && userId) {
          return userId === artistData.user_id;
        }
        return false;
      } catch (e) {
        console.error("Error checking owner:", e);
        return false;
      }
    };

    const run = async () => {
      setLoading(true);

      try {
        // Загружаем артиста из БД
        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (artistError) throw artistError;

        if (!alive) return;

        setArtist(artistData);

        // Проверяем владельца
        const owner = await checkOwner(artistData);
        if (!alive) return;
        setIsOwner(owner);

        setLoading(false);
      } catch (e) {
        if (!alive) return;
        console.error("Error loading artist:", e);
        setLoading(false);
      }
    };

    run();

    // Дополнительные проверки сессии через задержки (для мобильных)
    const timeoutId1 = setTimeout(async () => {
      if (!alive) return;
      
      try {
        const { data: artistData } = await supabase
          .from("artists")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (artistData) {
          const owner = await checkOwner(artistData);
          if (!alive) return;
          setIsOwner(owner);
        }
      } catch (e) {
        console.error("Error in delayed check 1:", e);
      }
    }, 500);

    const timeoutId2 = setTimeout(async () => {
      if (!alive) return;
      
      try {
        const { data: artistData } = await supabase
          .from("artists")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (artistData) {
          const owner = await checkOwner(artistData);
          if (!alive) return;
          setIsOwner(owner);
        }
      } catch (e) {
        console.error("Error in delayed check 2:", e);
      }
    }, 1500);

    // Слушаем изменения сессии (важно для мобильных устройств)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!alive) return;
      
      console.log("Auth state changed:", event, {
        hasSession: !!session,
        userId: session?.user?.id,
      });
      
      // Получаем актуальные данные артиста
      try {
        const { data: artistData } = await supabase
          .from("artists")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (artistData && !alive) return;
        
        if (artistData) {
          const owner = await checkOwner(artistData);
          if (!alive) return;
          console.log("Setting isOwner to:", owner);
          setIsOwner(owner);
        }
      } catch (e) {
        console.error("Error in auth state change:", e);
      }
    });

    subscriptionRef.current = subscription;

    return () => {
      alive = false;
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="a-page">
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <div style={{ opacity: 0.7 }}>Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="a-page">
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          <div style={{ opacity: 0.7 }}>Артист не найден</div>
        </div>
      </div>
    );
  }

  return (
    <div className="a-page">
      <ArtistHeader artist={artist} isOwner={isOwner} onUpdate={refreshArtist} />

      <div className="a-content">
        <ArtistTracks 
          artist={artist} 
          isOwner={isOwner}
          onShare={() => setShareOpen(true)} 
        />
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title="TOQIBOX"
      />
    </div>
  );
}
