import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AboutPage from "../../app/about/page";
import "../../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AboutPage />
  </StrictMode>,
);
