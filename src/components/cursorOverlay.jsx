import { useEffect, useRef, useState } from "react";
import "./cursorOverlay.css";
import pawCursor from "./images/paw.png";

export default function CursorOverlay() {
  const wrapperRef = useRef(null);
  const sparkleLayerRef = useRef(null);
  const [isClicking, setIsClicking] = useState(false);

  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const rafRef = useRef(null);
  const lastSparkleTimeRef = useRef(0);

  useEffect(() => {
    const updateCursor = () => {
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0)`;
      }
      rafRef.current = null;
    };

    const handleMouseMove = (event) => {
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateCursor);
      }

      const now = performance.now();
      if (now - lastSparkleTimeRef.current > 85) {
        lastSparkleTimeRef.current = now;
        makeSparkle();
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    updateCursor();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function makeSparkle() {
    const layer = sparkleLayerRef.current;
    if (!layer) return;

    const sparkle = document.createElement("span");
    sparkle.className = "cursor-sparkle";

    // 🎯 anchor closer to ACTUAL mouse tip (not center of paw)
    const baseX = mouseRef.current.x - 20;
    const baseY = mouseRef.current.y + 18;

    // 🌙 CURVED TRAIL (arc shape)
    const curve = Math.sin(performance.now() * 0.01) * 8;

    const offsetX = (Math.random() * 10 - 5) + curve - 6; // ← more LEFT
    const offsetY = Math.random() * 10 + 6;

    const size = 8 + Math.random() * 7;
    const rotation = Math.random() * 50 - 25;

    sparkle.style.left = `${baseX + offsetX}px`;
    sparkle.style.top = `${baseY + offsetY}px`;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.transform = `rotate(${rotation}deg)`;

    layer.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 480);
  }

  return (
    <div className="cursor-overlay-layer" aria-hidden="true">
      <div ref={sparkleLayerRef} className="cursor-sparkle-layer" />
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