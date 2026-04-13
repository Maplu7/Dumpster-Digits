import { useCallback, useEffect, useRef, useState } from "react";

const SOUND_PREF_KEY = "dumpsterDigitsMuted";

export default function useAmbience(src, volume = 0.12) {
  const audioRef = useRef(null);

  const [muted, setMuted] = useState(() => {
    return localStorage.getItem(SOUND_PREF_KEY) === "true";
  });

  const startAudio = useCallback(async (forceMutedValue = muted) => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.loop = true;
      audio.volume = volume;
      audio.muted = forceMutedValue;

      if (audio.paused) {
        await audio.play();
      }
    } catch (err) {
      console.log("Audio autoplay blocked until interaction.", err);
    }
  }, [muted, volume]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.preload = "auto";
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [src, volume, muted]);

  useEffect(() => {
    localStorage.setItem(SOUND_PREF_KEY, String(muted));

    if (audioRef.current) {
      audioRef.current.muted = muted;
    }

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

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [startAudio, muted]);

  return { muted, setMuted, startAudio };
}