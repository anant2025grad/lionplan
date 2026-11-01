"use client";

import { useEffect, useRef, useState } from "react";

/** Decorative pointer for precise mouse devices only. Native cursor remains on touch and reduced-motion devices. */
export function CircularCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => { setEnabled(media.matches); document.documentElement.classList.toggle("lion-custom-cursor", media.matches); };
    update(); media.addEventListener("change", update);
    return () => { media.removeEventListener("change", update); document.documentElement.classList.remove("lion-custom-cursor"); };
  }, []);
  useEffect(() => {
    if (!enabled) return;
    const move = (event: PointerEvent) => {
      if (!dot.current) return;
      dot.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      dot.current.dataset.active = String(Boolean((event.target as Element | null)?.closest("a, button, input, select, textarea, summary, [role='button']")));
      dot.current.style.opacity = "1";
    };
    const leave = () => { if (dot.current) dot.current.style.opacity = "0"; };
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    return () => { window.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); };
  }, [enabled]);
  return enabled ? <div ref={dot} aria-hidden="true" className="lion-cursor-dot" style={{ opacity: 0 }} /> : null;
}
