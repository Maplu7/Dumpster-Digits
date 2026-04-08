import "./CampfireScene.css";
import { useEffect, useRef, useState } from "react";

export default function CampfireScene({ boost = 0 }) {
  const ambienceRef = useRef(null);
  const fireRef = useRef(null);
  const startedRef = useRef(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const ambience = ambienceRef.current;
    const fire = fireRef.current;

    if (!ambience || !fire) return;

    ambience.volume = 0.12;
    fire.volume = 0.18;
    ambience.loop = true;
    fire.loop = true;
    ambience.muted = muted;
    fire.muted = muted;
  }, [muted]);

  useEffect(() => {
    const ambience = ambienceRef.current;
    const fire = fireRef.current;

    if (!ambience || !fire) return;

    ambience.volume = 0.12;
    fire.volume = 0.18;
    ambience.loop = true;
    fire.loop = true;

    const startAudio = async () => {
      if (startedRef.current) return;
      startedRef.current = true;

      try {
        await ambience.play();
        await fire.play();
      } catch (err) {
        console.log("Audio autoplay blocked until user interaction.", err);
        startedRef.current = false;
      }
    };

    const handleFirstInteraction = async () => {
      await startAudio();
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };

    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);

  const stars = [
    { cls: "star-1", size: "sm" },
    { cls: "star-2", size: "md" },
    { cls: "star-3", size: "sm" },
    { cls: "star-4", size: "lg" },
    { cls: "star-5", size: "sm" },
    { cls: "star-6", size: "md" },
    { cls: "star-7", size: "sm" },
    { cls: "star-8", size: "md" },
    { cls: "star-9", size: "sm" },
    { cls: "star-10", size: "lg" },
    { cls: "star-11", size: "sm" },
    { cls: "star-12", size: "md" },
    { cls: "star-13", size: "sm" },
    { cls: "star-14", size: "md" },
    { cls: "star-15", size: "sm" },
    { cls: "star-16", size: "sm" },
    { cls: "star-17", size: "md" },
    { cls: "star-18", size: "sm" },
  ];

  return (
    <div className={`campfire-container ${boost ? "campfire-boost" : ""}`}>
      <img src="/background8.png" alt="" className="bg" />

      <audio ref={ambienceRef} preload="auto">
        <source src="/sounds/camp-ambience.mp3" type="audio/mpeg" />
      </audio>

      <audio ref={fireRef} preload="auto">
        <source src="/sounds/fire-crackle.mp3" type="audio/mpeg" />
      </audio>

      <button
        type="button"
        className="sound-toggle"
        onClick={() => setMuted((prev) => !prev)}
      >
        {muted ? "🔇 Muted" : "🔊 Camp Sounds"}
      </button>

      <div className="moon-glow" />
      <div className="moon-shimmer" />

      <div className="lantern-glow" />
      <div className="lantern-core" />
      <div className="tent-edge-glow" />

      <div className="stars-layer">
        {stars.map((star, i) => (
          <span
            key={i}
            className={`star ${star.size} ${star.cls}`}
            style={{
              animationDuration: `${3.5 + (i % 5) * 1.2}s`,
              animationDelay: `${i * 0.45}s`,
            }}
          />
        ))}
      </div>

      <div className="shooting-star shooting-star-1">
        <span className="trail-glow" />
        <span className="trail-sparkles" />
      </div>

      <div className="shooting-star shooting-star-2">
        <span className="trail-glow" />
        <span className="trail-sparkles" />
      </div>

      <div className="shooting-star shooting-star-3">
        <span className="trail-glow" />
        <span className="trail-sparkles" />
      </div>

      <div className="fire-ground-glow" />
      <div className="fire-shell" />
      <div className="flame flame-back" />
      <div className="flame flame-left" />
      <div className="flame flame-center" />
      <div className="flame flame-right" />
      <div className="flame-core" />
      <div className="sparks" />

      <div className="rock-glow-left" />
      <div className="rock-glow-right" />

      <div className="ember ember-1" />
      <div className="ember ember-2" />
      <div className="ember ember-3" />
      <div className="ember ember-4" />
      <div className="ember ember-5" />
      <div className="ember ember-6" />

      <div className="firefly firefly-1" />
      <div className="firefly firefly-2" />
      <div className="firefly firefly-3" />
      <div className="firefly firefly-4" />
      <div className="firefly firefly-5" />
      <div className="firefly firefly-6" />
      <div className="firefly firefly-7" />
      <div className="firefly firefly-8" />
      <div className="firefly firefly-9" />
      <div className="firefly firefly-10" />
      <div className="firefly firefly-11" />
      <div className="firefly firefly-12" />
      <div className="firefly firefly-13" />
      <div className="firefly firefly-14" />
      <div className="firefly firefly-15" />
      <div className="firefly firefly-16" />
    </div>
  );
}