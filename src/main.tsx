import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles.css";
import { SmartDashboardPage } from "./routes/smart-dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SmartDashboardPage />} />
        <Route path="/smart-dashboard" element={<SmartDashboardPage />} />
        {/* Keep old bookmarks working, but route them into the current Smart Farm app. */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/survey" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
