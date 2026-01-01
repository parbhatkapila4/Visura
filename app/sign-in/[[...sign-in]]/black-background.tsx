"use client";

import { useEffect } from "react";

export default function BlackBackground() {
  useEffect(() => {
    document.body.style.backgroundColor = "#000000";
    document.documentElement.style.backgroundColor = "#000000";

    const wrapper = document.querySelector("body > div");
    if (wrapper) {
      (wrapper as HTMLElement).style.backgroundColor = "#000000";
    }

    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
      if (wrapper) {
        (wrapper as HTMLElement).style.backgroundColor = "";
      }
    };
  }, []);

  return null;
}
