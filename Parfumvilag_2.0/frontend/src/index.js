import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";
import "./style.css";

// React 18+ root API importálása a rendereléshez
import { createRoot } from "react-dom/client";

// Bootstrap CSS importálása (második alkalommal - az egyik valószínűleg felesleges)
import "bootstrap/dist/css/bootstrap.min.css";

// A HTML-ben lévő 'root' id-jú elem kiválasztása, ahová az alkalmazás renderelődni fog
const container = document.getElementById("root");
// React root létrehozása a kiválasztott DOM elemhez
const root = createRoot(container); // createRoot(container!) if you use TypeScript

// Az App komponens renderelése a létrehozott root elembe
root.render(
  // React.StrictMode: Segíti a potenciális problémák felderítését fejlesztés közben
  <React.StrictMode>
    <App /> {/* A fő App komponens példányosítása */}
  </React.StrictMode>
);
