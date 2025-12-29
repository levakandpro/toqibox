import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ArtistHeader from "../../../features/artist/ArtistHeader.jsx";
import ArtistTracks from "../../../features/artist/ArtistTracks.jsx";

import ShareSheet from "../../../features/share/ShareSheet.jsx";

import { supabase } from "../../../features/auth/supabaseClient.js";

export default function ArtistPage() {
  const navigate = useNavigate();
  const { slug = "artist" } = useParams();
  const [searchParams] = useSearchParams();

  const [shareOpen, setShareOpen] = useState(false);

  const shareUrl = useMemo(() => {
    return `${window.location.origin}/a/${slug}`;
  }, [slug]);

  const edit = searchParams.get("edit") === "1";
  const tab = searchParams.get("tab") || "";
  const action = searchParams.get("action") || "";

  useEffect(() => {
    let alive = true;

    const run = async () => {
      // Если кто-то пришёл по ссылке edit-mode (например после "Добавить трек")
      // и он не залогинен - отправляем на /login и сохраняем returnTo
      if (!edit) return;

      try {
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data?.session;

        if (!alive) return;

        if (!hasSession) {
          const current = `${window.location.pathname}${window.location.search || ""}`;
          localStorage.setItem("toqibox:returnTo", current);
          navigate("/login", { replace: false });
        }
      } catch (e) {
        const current = `${window.location.pathname}${window.location.search || ""}`;
        localStorage.setItem("toqibox:returnTo", current);
        navigate("/login", { replace: false });
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [edit, navigate]);

  return (
    <div className="a-page">
      <ArtistHeader artistSlug={slug} />

      <div className="a-content">
        <ArtistTracks
          artistSlug={slug}
          onShare={() => setShareOpen(true)}
          editMode={edit}
          editTab={tab}
          editAction={action}
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
