import "./installSesLockdown.js";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ContextProviders } from "./contexts/providers.tsx";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ContextProviders>
      <App />
    </ContextProviders>
  </React.StrictMode>
);
