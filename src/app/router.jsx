import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./page.jsx";
import TrackPage from "./t/[slug]/page.jsx";
import ArtistPage from "./a/[slug]/page.jsx";
import AuthorPage from "./author/page.jsx";
import CreatePage from "./create/page.jsx";
import ManagePage from "./manage/page.jsx";

import LoginPage from "./login/page.jsx";
import AuthCallbackPage from "./auth/callback/page.jsx";
import PricingPage from "../pages/PricingPage.jsx";
import PaymentPage from "../pages/PaymentPage.jsx";
import AdminPage from "./admin/page.jsx";
import ErrorPage from "./error/page.jsx";



export default function AppRouter() {
  return (
    <Routes>
      <Route path="/t/:slug" element={<TrackPage />} />
      <Route path="/a/:slug" element={<ArtistPage />} />

      {/* auth (V1) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route path="/author" element={<AuthorPage />} />
      <Route path="/create" element={<CreatePage />} />
      <Route path="/manage" element={<ManagePage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/admin" element={<AdminPage />} />

      <Route path="/error" element={<ErrorPage />} />

      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/t/test" replace />} />
    </Routes>
  );
}
