// frontend/authority/main.jsx
import "leaflet/dist/leaflet.css"; // Ensure Leaflet styles are loaded globally
import "./styles/theme.css";       // Ensure your custom & Tailwind styles are loaded globally
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);