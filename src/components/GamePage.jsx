import { useEffect, useRef, useState } from "react";
import "./GamePage.css";
import createGame from "../createGame";

export default function GamePage({ gameKey, onFinishReturn, student }) {
  const gameContainerRef = useRef(null);
  const gameRef = useRef(null);
  const [gameFinished, setGameFinished] = useState(false);

  useEffect(() => {
    setGameFinished(false);

    if (!gameContainerRef.current || !gameKey) return;

    window.onPhaserGameFinished = () => {
      setGameFinished(true);
    };

    gameRef.current = createGame(
      gameKey,
      gameContainerRef.current,
      student?.id || null
    );

    return () => {
      window.onPhaserGameFinished = null;

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [gameKey, student?.id]);

  return (
    <div className="game-page">
      <div ref={gameContainerRef} className="game-canvas-wrap" />

      {gameFinished && (
        <div className="game-finish-overlay">
          <button className="game-finish-btn" onClick={onFinishReturn}>
            Return to Games
          </button>
        </div>
      )}
    </div>
  );
}