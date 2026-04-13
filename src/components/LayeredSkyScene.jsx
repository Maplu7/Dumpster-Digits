import { useMemo } from "react";
import "./LayeredSkyScene.css";

export default function LayeredSkyScene({ variant = "shop" }) {
  const isGrade1 = variant === "assignments-grade1";
  const isGrade2 = variant === "assignments-grade2";
  const isShop = variant === "shop";

  const stars = useMemo(() => {
    let count = 54;
    if (isGrade1) count = 38;
    if (isGrade2) count = 50;

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 60}%`,
      size: `${Math.random() * 3 + 1.5}px`,
      delay: `${Math.random() * 7}s`,
      duration: `${Math.random() * 4 + 4}s`,
    }));
  }, [isGrade1, isGrade2]);

  const fireflies = useMemo(() => {
    let count = 18;
    if (isGrade1) count = 16;
    if (isGrade2) count = 24;
    if (isShop) count = 20;

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${28 + Math.random() * 58}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${5 + Math.random() * 6}s`,
      size: `${Math.random() * 4 + 4}px`,
    }));
  }, [isGrade1, isGrade2, isShop]);

  return (
    <div className={`layered-scene layered-scene--${variant}`} aria-hidden="true">
      <div className="layered-scene__sky-glow" />

      <div className="layered-scene__aurora layered-scene__aurora--one" />
      <div className="layered-scene__aurora layered-scene__aurora--two" />

      <div className="layered-scene__stars">
        {stars.map((star) => (
          <span
            key={`star-${star.id}`}
            className="layered-scene__star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      <div className="layered-scene__cloud layered-scene__cloud--1" />
      <div className="layered-scene__cloud layered-scene__cloud--2" />
      <div className="layered-scene__cloud layered-scene__cloud--3" />

      <div className="layered-scene__hills layered-scene__hills--back" />
      <div className="layered-scene__hills layered-scene__hills--mid" />
      <div className="layered-scene__hills layered-scene__hills--front" />

      <div className="layered-scene__fireflies">
        {fireflies.map((bug) => (
          <span
            key={`bug-${bug.id}`}
            className="layered-scene__firefly"
            style={{
              left: bug.left,
              top: bug.top,
              width: bug.size,
              height: bug.size,
              animationDelay: bug.delay,
              animationDuration: bug.duration,
            }}
          />
        ))}
      </div>

      <div className="layered-scene__lantern-glow" />
      <div className="layered-scene__lantern-core" />

      <div className="layered-scene__flashlight-glow" />
      <div className="layered-scene__flashlight-core" />

      <div className="layered-scene__fog layered-scene__fog--one" />
      <div className="layered-scene__fog layered-scene__fog--two" />
    </div>
  );
}