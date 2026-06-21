"use client";

import { useEffect } from "react";

const MATERIAL_SYMBOLS_ID = "material-symbols-outlined-css";
const MATERIAL_SYMBOLS_HREF =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap";

export default function MaterialSymbolsLoader() {
  useEffect(() => {
    if (document.getElementById(MATERIAL_SYMBOLS_ID)) return;
    const link = document.createElement("link");
    link.id = MATERIAL_SYMBOLS_ID;
    link.rel = "stylesheet";
    link.href = MATERIAL_SYMBOLS_HREF;
    document.head.appendChild(link);
  }, []);

  return null;
}

