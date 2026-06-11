import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./page";
import "../index.css"; // loads global css with Tailwind rules

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Home />
  </StrictMode>
);
