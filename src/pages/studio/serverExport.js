export async function exportViaRenderServer({
  user,
  setShowLoginModal,
  loadUserData,
  supabase,
  usageDaily,
  deviceUsageDaily,
  getExportLimits,
  effectivePlan,
  setShowLimitModal,
  photoUrl,
  audioUrl,
  audioDuration,
  selectedTemplate,
  setExportMode,
}) {
  setExportMode(true);

  if (!user) {
    setShowLoginModal(true);
    setExportMode(false);
    return { ok: false, reason: "no_user" };
  }

  try { await loadUserData(); } catch {}

  const limits = getExportLimits(effectivePlan);

  // cooldown (best-effort)
  try {
    const { data: lastExport } = await supabase
      .from("exports")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("product", "studio")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastExport?.created_at) {
      const last = new Date(lastExport.created_at);
      const now = new Date();
      const sec = (now - last) / 1000;
      const COOLDOWN = 30;
      if (sec < COOLDOWN) {
        alert(`Подождите ${Math.ceil(COOLDOWN - sec)} секунд перед следующим экспортом`);
        setExportMode(false);
        return { ok: false, reason: "cooldown" };
      }
    }
  } catch {}

  // limits
  const todayExports = usageDaily?.exports_success || 0;
  if (effectivePlan === "free") {
    const todayDevice = deviceUsageDaily?.exports_success || 0;
    if (todayExports >= limits.success || todayDevice >= limits.success) {
      setShowLimitModal(true);
      setExportMode(false);
      return { ok: false, reason: "limit" };
    }
  } else {
    if (todayExports >= limits.success) {
      setShowLimitModal(true);
      setExportMode(false);
      return { ok: false, reason: "limit" };
    }
  }

  if (!photoUrl || !audioUrl || !audioDuration) {
    alert("Загрузите фото и аудио для экспорта");
    setExportMode(false);
    return { ok: false, reason: "missing_inputs" };
  }

  // ===== helpers: upload blob: URL to Supabase Storage (bucket: studio) =====
  const isHttpUrl = (u) => /^https?:\/\//i.test(String(u || ""));
  const isBlobUrl = (u) => String(u || "").startsWith("blob:");

  const uploadBlobUrlToStudio = async ({
    blobUrl,
    folder,          // "audio" | "images"
    defaultName,     // "track.mp3" etc
    forcedContentType, // optional
  }) => {
    // 1) fetch blob from blob: URL
    const resp = await fetch(blobUrl);
    if (!resp.ok) throw new Error(`Failed to read blob: ${resp.status}`);
    const blob = await resp.blob();

    // 2) decide contentType / ext
    const contentType = forcedContentType || blob.type || "application/octet-stream";
    const extFromType = (() => {
      if (contentType === "audio/mpeg") return "mp3";
      if (contentType === "audio/mp3") return "mp3";
      if (contentType === "audio/wav") return "wav";
      if (contentType === "image/jpeg") return "jpg";
      if (contentType === "image/png") return "png";
      if (contentType === "image/webp") return "webp";
      return (defaultName?.split(".").pop() || "bin").toLowerCase();
    })();

    const filePath = `${folder}/${user.id}/${Date.now()}.${extFromType}`;

    // 3) upload to bucket "studio"
    const { error: upErr } = await supabase.storage
      .from("studio")
      .upload(filePath, blob, {
        upsert: true,
        contentType,
      });

    if (upErr) throw upErr;

    // 4) get public url
    const { data } = supabase.storage.from("studio").getPublicUrl(filePath);
    const publicUrl = data?.publicUrl;
    if (!publicUrl) throw new Error("Не удалось получить publicUrl после загрузки");
    return publicUrl;
  };

  // ===== create overlay =====
  const overlay = document.createElement("div");
  overlay.id = "server-export-overlay";
  overlay.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:99999;display:flex;align-items:center;justify-content:center;color:#fff;font-family:system-ui;";
  const box = document.createElement("div");
  box.style.cssText =
    "width:min(520px,92vw);padding:18px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(20,20,20,.85);";
  const title = document.createElement("div");
  title.textContent = "Экспортируем на сервере...";
  title.style.cssText = "font-size:16px;font-weight:700;margin-bottom:10px;";
  const barWrap = document.createElement("div");
  barWrap.style.cssText = "height:10px;background:rgba(255,255,255,.12);border-radius:999px;overflow:hidden;";
  const bar = document.createElement("div");
  bar.style.cssText = "height:100%;width:0%;background:rgba(255,255,255,.9);";
  barWrap.appendChild(bar);
  const statusLine = document.createElement("div");
  statusLine.style.cssText = "margin-top:10px;font-size:13px;opacity:.9;";
  statusLine.textContent = "Подготовка...";
  box.appendChild(title);
  box.appendChild(barWrap);
  box.appendChild(statusLine);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const cleanup = () => {
    const el = document.getElementById("server-export-overlay");
    if (el) document.body.removeChild(el);
    setExportMode(false);
  };

  const BASE = import.meta?.env?.VITE_RENDER_SERVER_URL || "http://127.0.0.1:3001";

  try {
    // ===== ensure http(s) URLs (upload blob -> studio bucket) =====
    let audioPublicUrl = String(audioUrl);
    let photoPublicUrl = String(photoUrl);

    // audio
    if (isBlobUrl(audioPublicUrl)) {
      statusLine.textContent = "Загружаем аудио...";
      bar.style.width = "5%";
      audioPublicUrl = await uploadBlobUrlToStudio({
        blobUrl: audioPublicUrl,
        folder: "audio",
        defaultName: "track.mp3",
        forcedContentType: "audio/mpeg",
      });
    } else if (!isHttpUrl(audioPublicUrl)) {
      throw new Error("audioUrl должен быть blob: или http(s)");
    }

    // photo
    if (isBlobUrl(photoPublicUrl)) {
      statusLine.textContent = "Загружаем фото...";
      bar.style.width = "10%";
      photoPublicUrl = await uploadBlobUrlToStudio({
        blobUrl: photoPublicUrl,
        folder: "images",
        defaultName: "cover.jpg",
        forcedContentType: undefined,
      });
    } else if (!isHttpUrl(photoPublicUrl)) {
      throw new Error("photoUrl должен быть blob: или http(s)");
    }

    const exportDuration = Math.min(audioDuration, limits.maxDuration);
    const plan = limits.resolution === 1080 ? "premium" : "free";

    // ===== start render job =====
    statusLine.textContent = "Отправляем задачу на рендер...";
    bar.style.width = "12%";

    const payload = {
      audioUrl: audioPublicUrl,
      durationSec: Math.round(exportDuration),
      plan,
      bgImageUrl: photoPublicUrl,
      presetId: selectedTemplate || null,
      presetParams: {},
    };

    const startRes = await fetch(`${BASE}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!startRes.ok) {
      const txt = await startRes.text().catch(() => "");
      throw new Error(`Render-server /export: ${startRes.status} ${txt}`);
    }

    const startJson = await startRes.json();
    const jobId = startJson?.job_id;
    if (!jobId) throw new Error("Render-server не вернул job_id");

    statusLine.textContent = "Рендер...";
    bar.style.width = "15%";

    while (true) {
      await new Promise((r) => setTimeout(r, 900));
      const stRes = await fetch(`${BASE}/export/${jobId}`);
      if (!stRes.ok) throw new Error(`Render-server status: ${stRes.status}`);

      const st = await stRes.json();
      const p = Math.max(0, Math.min(1, st?.progress ?? 0));
      const pct = Math.floor(p * 100);
      bar.style.width = `${pct}%`;
      statusLine.textContent = `Рендер: ${pct}%`;

      if (st?.status === "failed") throw new Error(st?.error || "Render failed");
      if (st?.status === "done") break;
    }

    bar.style.width = "100%";
    statusLine.textContent = "Готово. Скачиваем...";

    const fileRes = await fetch(`${BASE}/download/${jobId}`);
    if (!fileRes.ok) throw new Error(`Download: ${fileRes.status}`);

    const outBlob = await fileRes.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(outBlob);
    a.download = `toqibox_studio_${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    cleanup();
    return { ok: true };
  } catch (e) {
    alert("Ошибка экспорта: " + (e?.message || String(e)));
    cleanup();
    return { ok: false, reason: "error" };
  }
}
