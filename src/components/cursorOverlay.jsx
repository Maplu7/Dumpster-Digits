import { useEffect, useRef, useState } from "react";
import "./cursorOverlay.css";
import pawCursor from "./images/paw-cropped.png";

export default function CursorOverlay() {
  const wrapperRef = useRef(null);
  const trailLayerRef = useRef(null);
  const [isClicking, setIsClicking] = useState(false);
  const lastTrailTimeRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const x = event.clientX;
      const y = event.clientY;

      if (wrapperRef.current) {
        wrapperRef.current.style.left = `${x}px`;
        wrapperRef.current.style.top = `${y}px`;
      }

      const now = performance.now();
      if (now - lastTrailTimeRef.current > 90) {
        lastTrailTimeRef.current = now;
        makePawPrint(x, y);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  function makePawPrint(x, y) {
    const layer = trailLayerRef.current;
    if (!layer) return;

    const print = document.createElement("span");
    print.className = "cursor-pawprint";

    const offsetX = Math.random() * 8 - 4;
    const offsetY = Math.random() * 8 + 4;
    const rotation = Math.random() * 24 - 12;
    const scale = 0.85 + Math.random() * 0.3;

    print.style.left = `${x - 2 + offsetX}px`;
    print.style.top = `${y + 8 + offsetY}px`;
    print.style.transform = `rotate(${rotation}deg) scale(${scale})`;

    layer.appendChild(print);

    setTimeout(() => {
      print.remove();
    }, 520);
  }

  return (
    <div className="cursor-overlay-layer" aria-hidden="true">
      <div ref={trailLayerRef} className="cursor-trail-layer" />
      <div ref={wrapperRef} className="cursor-wrapper">
        <img
          src={pawCursor}
          alt=""
          draggable="false"
          className={`cursor-overlay-image ${isClicking ? "clicking" : ""}`}
        />
      </div>
    </div>
  );
}