import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles.css";
import { HomePage } from "./routes/index";
import { DashboardPage } from "./routes/dashboard";
function App() { return <BrowserRouter><Routes><Route path="/" element={<HomePage />} /><Route path="/dashboard" element={<DashboardPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter>; }
createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);

