import { useEffect, useRef, useState } from "react";
import "./GamePage.css";
import { createGame } from "../createGame";

export default function GamePage({ gameKey, onFinishReturn }) {
  const gameContainerRef = useRef(null);
  const gameRef = useRef(null);
  const [gameFinished, setGameFinished] = useState(false);

  useEffect(() => {
    setGameFinished(false);

    if (!gameContainerRef.current || !gameKey) return;

    window.onPhaserGameFinished = () => {
      setGameFinished(true);
    };

    gameRef.current = createGame(gameContainerRef.current, gameKey);

    return () => {
      window.onPhaserGameFinished = null;

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [gameKey]);

  return (
    <div className="game-page">
      {gameFinished && (
        <button className="game-finish-btn" onClick={onFinishReturn}>
          Return to Welcome
        </button>
      )}

      <div ref={gameContainerRef} className="game-canvas-wrap" />
    </div>
  );
}