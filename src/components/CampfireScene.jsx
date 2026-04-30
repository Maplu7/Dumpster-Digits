import "./CampfireScene.css";
import { useCallback, useEffect, useRef, useState } from "react";

const SOUND_PREF_KEY = "dumpsterDigitsMuted";

export default function CampfireScene({ boost = 0 }) {
  const ambienceRef = useRef(null);
  const fireRef = useRef(null);

  const [muted, setMuted] = useState(() => {
    return localStorage.getItem(SOUND_PREF_KEY) === "true";
  });

  const startAudio = useCallback(
    async (forceMutedValue = muted) => {
      const ambience = ambienceRef.current;
      const fire = fireRef.current;

      if (!ambience || !fire) return;

      try {
        ambience.loop = true;
        fire.loop = true;

        ambience.volume = 0.12;
        fire.volume = 0.18;

        ambience.muted = forceMutedValue;
        fire.muted = forceMutedValue;

        if (ambience.paused) await ambience.play();
        if (fire.paused) await fire.play();
      } catch (err) {
        console.log("Audio autoplay blocked until interaction.", err);
      }
    },
    [muted]
  );

  useEffect(() => {
    localStorage.setItem(SOUND_PREF_KEY, String(muted));

    const ambience = ambienceRef.current;
    const fire = fireRef.current;

    if (ambience) ambience.muted = muted;
    if (fire) fire.muted = muted;

    window.dispatchEvent(
      new CustomEvent("dumpster-digits-sound", { detail: muted })
    );
  }, [muted]);

  useEffect(() => {
    const syncMuted = (event) => {
      if (typeof event?.detail === "boolean") {
        setMuted(event.detail);
      }
    };

    window.addEventListener("dumpster-digits-sound", syncMuted);

    return () => {
      window.removeEventListener("dumpster-digits-sound", syncMuted);
    };
  }, []);

  useEffect(() => {
    const handleFirstInteraction = async () => {
      await startAudio(muted);
    };

    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [startAudio, muted]);

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
    <>
      <div className={`campfire-container ${boost ? "campfire-boost" : ""}`}>
        <img src="/background8.png" alt="" className="bg" />

        <audio ref={ambienceRef} preload="auto">
          <source src="/sounds/camp-ambience.mp3" type="audio/mpeg" />
        </audio>

        <audio ref={fireRef} preload="auto">
          <source src="/sounds/fire-crackle.mp3" type="audio/mpeg" />
        </audio>

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

        <div className="smoke smoke-soft">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

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

      <button
        type="button"
        className="sound-toggle"
        onClick={async (e) => {
          e.stopPropagation();
          const nextMuted = !muted;
          setMuted(nextMuted);

          if (!nextMuted) {
            await startAudio(false);
          }
        }}
      >
        {muted ? "🔇 Muted" : "🔊 Camp Sounds"}
      </button>
    </>
  );
}