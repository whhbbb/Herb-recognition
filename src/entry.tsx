import React from "react";
import ReactDOM from "react-dom/client";
import { NextUIProvider } from "@nextui-org/react";
import App from "./App";
import "./entry.css";

document.title = "中草药识别工作台";

const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#1f7a5a"/>
      <stop offset="1" stop-color="#2c9b72"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="#eaf6ef"/>
  <path d="M44 16C28 16 18 26 18 40c0 4 2 8 5 11 1-8 4-13 10-17-2 5-3 9-3 14 0 0 8-3 14-12 2-4 3-8 3-20z" fill="url(#g)"/>
  <circle cx="22" cy="42" r="2.5" fill="#0e4c39"/>
</svg>`;
const faviconHref = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;
let favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
if (!favicon) {
  favicon = document.createElement("link");
  favicon.rel = "icon";
  document.head.appendChild(favicon);
}
favicon.href = faviconHref;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <NextUIProvider>
    <App />
  </NextUIProvider>
);
