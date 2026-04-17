import { useEffect, useRef, useState } from "react";
import "./cursorOverlay.css";
import pawCursor from "./images/paw.png";

export default function CursorOverlay() {
  const wrapperRef = useRef(null);
  const [isClicking, setIsClicking] = useState(false);

  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const rafRef = useRef(null);
  const sparkleLayerRef = useRef(null);
  const lastSparkleTimeRef = useRef(0);

  useEffect(() => {
    const updateCursor = () => {
      if (wrapperRef.current) {
        wrapperRef.current.style.left = `${mouseRef.current.x}px`;
        wrapperRef.current.style.top = `${mouseRef.current.y}px`;
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
      if (now - lastSparkleTimeRef.current > 90) {
        lastSparkleTimeRef.current = now;
        makeSparkle(event.clientX, event.clientY);
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

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  function makeSparkle(x, y) {
    const layer = sparkleLayerRef.current;
    if (!layer) return;

    const sparkle = document.createElement("span");
    sparkle.className = "cursor-sparkle";

    const offsetX = Math.random() * 10 - 5;
    const offsetY = Math.random() * 8 + 10;
    const size = 6 + Math.random() * 6;
    const rotation = Math.random() * 40 - 20;

    sparkle.style.left = `${x + offsetX}px`;
    sparkle.style.top = `${y + offsetY}px`;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.transform = `rotate(${rotation}deg)`;

    layer.appendChild(sparkle);

    window.setTimeout(() => {
      sparkle.remove();
    }, 500);
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