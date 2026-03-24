import { useEffect, useRef, useState } from "react";
import { createGame } from "../createGame";
import "./GamePage.css";

export default function GamePage({ onBack }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [toast, setToast] = useState(null);

  function restartGame() {
    // close toast
    setToast(null);

    // destroy old game
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    // create a fresh game
    if (containerRef.current) {
      gameRef.current = createGame(containerRef.current);
    }
  }

  useEffect(() => {
    function onToast(e) {
      const detail = e.detail;
      setToast(detail);

      window.clearTimeout(window.__toastTimer);
      if (detail.type !== "finish") {
        window.__toastTimer = window.setTimeout(() => setToast(null), 1200);
      }
    }

    window.addEventListener("toast", onToast);
    return () => {
      window.removeEventListener("toast", onToast);
      window.clearTimeout(window.__toastTimer);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = createGame(containerRef.current);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="gamePage">
      <div ref={containerRef} id="game-container" />

      {toast && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              toast.type === "finish" ? "rgba(0,0,0,0.35)" : "transparent",
            pointerEvents: toast.type === "finish" ? "auto" : "none",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              width: toast.type === "finish" ? 520 : "auto",
              padding: toast.type === "finish" ? "28px 28px" : "14px 22px",
              borderRadius: 20,
              color: "white",
              border: "2px solid rgba(255,255,255,.18)",
              background: "rgba(20, 20, 40, 0.30)",
              backdropFilter: "blur(18px)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
              fontSize: toast.type === "finish" ? 36 : 32,
              fontFamily: "Fjalla One, sans-serif",
              whiteSpace: "pre-line",
              textAlign: "center",
            }}
          >
            {toast.text}

            {toast.type === "finish" && (
              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={restartGame}
                  style={{
                    fontSize: 26,
                    padding: "14px 20px",
                    borderRadius: 16,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "Fjalla One, sans-serif",
                  }}
                >
                  Try Again
                </button>

                <button
                  onClick={onBack}
                  style={{
                    fontSize: 26,
                    padding: "14px 20px",
                    borderRadius: 16,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "Fjalla One, sans-serif",
                  }}
                >
                  Back to Home
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}