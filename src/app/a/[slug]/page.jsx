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
    let timeoutId = null;

    const checkOwner = async (artistData) => {
      if (!artistData) return false;
      
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          return false;
        }

        const session = sessionData?.session;
        const userId = session?.user?.id;

        if (artistData && userId) {
          return userId === artistData.user_id;
        }
        return false;
      } catch (e) {
        return false;
      }
    };

    const run = async () => {
      console.log("🚀 Starting load for slug:", slug);
      setLoading(true);

      // Таймаут на случай, если запрос зависнет
      timeoutId = setTimeout(() => {
        if (alive) {
          console.warn("⚠️ Loading timeout after 5s, showing page anyway");
          setLoading(false);
          setArtist(null);
        }
      }, 5000);

      try {
        console.log("📡 Fetching artist from Supabase...");
        // Загружаем артиста из БД
        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (!alive) {
          console.log("❌ Component unmounted, aborting");
          return;
        }

        if (artistError) {
          console.error("❌ Artist query error:", artistError);
          setArtist(null);
          setLoading(false);
          return;
        }

        console.log("✅ Artist loaded:", artistData ? "found" : "not found");

        // Сразу показываем контент, не ждем проверки владельца
        setArtist(artistData || null);
        setLoading(false);

        // Проверяем владельца асинхронно, не блокируя отображение
        if (artistData) {
          checkOwner(artistData).then((owner) => {
            if (!alive) return;
            console.log("🔍 Owner check result:", { slug, owner, artistUserId: artistData?.user_id });
            setIsOwner(owner);
          }).catch((err) => {
            console.error("Error checking owner:", err);
          });
        }
      } catch (e) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (!alive) return;
        console.error("❌ Error loading artist:", e);
        setArtist(null);
        setLoading(false);
      }
    };

    run();

    return () => {
      alive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    // Слушаем изменения сессии
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!alive) return;
      
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
          console.log("🔍 Auth state change - Owner check:", { slug, owner, artistUserId: artistData?.user_id });
          setIsOwner(owner);
        }
      } catch (e) {
        console.error("Error in auth state change:", e);
      }
    });

    subscriptionRef.current = subscription;

    return () => {
      alive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
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

  console.log("🎨 Rendering ArtistPage:", { slug, hasArtist: !!artist, isOwner, artistId: artist?.id });

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
