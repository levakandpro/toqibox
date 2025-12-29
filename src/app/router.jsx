import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import TrackPage from "./t/[slug]/page.jsx";
import ArtistPage from "./a/[slug]/page.jsx";
import CreatePage from "./create/page.jsx";
import ManagePage from "./manage/page.jsx";

import LoginPage from "./login/page.jsx";
import AuthCallbackPage from "./auth/callback/page.jsx";



export default function AppRouter() {
  return (
    <Routes>
      <Route path="/t/:slug" element={<TrackPage />} />
      <Route path="/a/:slug" element={<ArtistPage />} />

      {/* auth (V1) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route path="/create" element={<CreatePage />} />
      <Route path="/manage" element={<ManagePage />} />

      {/* удобный дефолт для разработки */}
      <Route path="/" element={<Navigate to="/t/test" replace />} />
      <Route path="*" element={<Navigate to="/t/test" replace />} />
    </Routes>
  );
}
