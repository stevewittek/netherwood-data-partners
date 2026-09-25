import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import SiteRouter from "../app/SiteRouter";
import "../app/globals.css";
import "../app/studio.css";

const root = document.getElementById("root")!;
const application = (
  <StrictMode>
    <SiteRouter />
  </StrictMode>
);
// GitHub Pages serves the same 404 document for unknown article/service paths.
// Those render a route-specific missing state, so don't hydrate unrelated markup.
if (root.hasChildNodes() && root.dataset.clientRoute !== "true")
  hydrateRoot(root, application);
else createRoot(root).render(application);
