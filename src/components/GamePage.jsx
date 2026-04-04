import { useEffect, useRef } from "react";
import "./GamePage.css";
import { createGame } from "../createGame";

export default function GamePage({ gameKey, onBack }) {
  const gameContainerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (!gameContainerRef.current || !gameKey) return;

    gameRef.current = createGame(gameContainerRef.current, gameKey);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [gameKey]);

  return (
    <div className="game-page">
      <button className="game-back-btn" onClick={onBack}>
        Back
      </button>
      <div ref={gameContainerRef} className="game-canvas-wrap" />
    </div>
  );
}