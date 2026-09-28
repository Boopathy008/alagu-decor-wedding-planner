import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "@/context/AuthContext";
import { startKeepAlive } from "@/utils/keepAlive";
import { site } from "@/config/site";
import "./index.css";

// Keep backend alive on free-tier hosting (pings every 14 min)
startKeepAlive(site.apiBaseUrl);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
