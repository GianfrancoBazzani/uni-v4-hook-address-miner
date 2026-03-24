import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { Header } from "./components/header";
import "./index.css";
import AsciiNoise from "./lib/asciinoise/asciinoise.tsx";
import App from "./App.tsx";
import Footer from "./components/footer.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AsciiNoise />
    <Header />
    <App />
    <Footer />
    <Analytics />
  </StrictMode>
);

