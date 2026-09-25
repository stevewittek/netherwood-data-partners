import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import AboutPage from "../../app/about/page";
import "../../app/globals.css";
import "../../app/studio.css";

const root = document.getElementById("root")!;
const application = (
  <StrictMode>
    <AboutPage />
  </StrictMode>
);
if (root.hasChildNodes()) hydrateRoot(root, application);
else createRoot(root).render(application);
