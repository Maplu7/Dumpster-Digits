import { useMemo, useState } from "react";
import "./LayeredSkyScene.css";

export default function LayeredSkyScene({
  variant = "assignments-grade1",
  editLights = false,
}) {
  const isGrade1 = variant === "assignments-grade1";
  const isGrade2 = variant === "assignments-grade2";
  const isShop = variant === "shop";

  const defaultLightCount = isGrade1 ? 15 : isGrade2 ? 10 : isShop ? 10 : 9;

  const [extraLights, setExtraLights] = useState([]);
  const [draggingLight, setDraggingLight] = useState(null);
  const [draggingLantern, setDraggingLantern] = useState(null);

  const stringLights = useMemo(() => {
    const base = Array.from({ length: defaultLightCount }, (_, i) => ({
      id: i + 1,
      isExtra: false,
    }));

    return [...base, ...extraLights];
  }, [defaultLightCount, extraLights]);

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

  function getPercent(e) {
    const rect = e.currentTarget.getBoundingClientRect();

    return {
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    };
  }

  function onMove(e) {
    if (!editLights) return;

    const { x, y } = getPercent(e);

    if (draggingLantern) {
      e.currentTarget.style.setProperty(
        `--${draggingLantern}-x`,
        `${x.toFixed(1)}%`
      );
      e.currentTarget.style.setProperty(
        `--${draggingLantern}-y`,
        `${y.toFixed(1)}%`
      );
      return;
    }

    if (draggingLight) {
      const el = e.currentTarget.querySelector(
        `.layered-scene__string-light--${draggingLight}`
      );

      if (el) {
        el.style.left = `${x.toFixed(1)}%`;
        el.style.top = `${y.toFixed(1)}%`;
      }
    }
  }

  function onUp(e) {
    if (!editLights) return;

    const { x, y } = getPercent(e);

    if (draggingLantern) {
      console.log(
        `.layered-scene--${variant} {\n  --${draggingLantern}-x: ${x.toFixed(
          1
        )}%;\n  --${draggingLantern}-y: ${y.toFixed(1)}%;\n}`
      );
      setDraggingLantern(null);
    }

    if (draggingLight) {
      console.log(
        `.layered-scene--${variant} .layered-scene__string-light--${draggingLight} {\n  left: ${x.toFixed(
          1
        )}%;\n  top: ${y.toFixed(1)}%;\n}`
      );
      setDraggingLight(null);
    }
  }

  function addLight(e) {
    if (!editLights) return;
    if (e.target.closest(".layered-scene__string-light")) return;
    if (e.target.closest(".lantern-drag")) return;

    const { x, y } = getPercent(e);
    const id = stringLights.length + 1;

    setExtraLights((prev) => [
      ...prev,
      {
        id,
        isExtra: true,
        left: `${x.toFixed(1)}%`,
        top: `${y.toFixed(1)}%`,
      },
    ]);

    console.log(
      `.layered-scene--${variant} .layered-scene__string-light--${id} {\n  left: ${x.toFixed(
        1
      )}%;\n  top: ${y.toFixed(1)}%;\n}`
    );
  }

  return (
    <div
      className={`layered-scene layered-scene--${variant} ${
        editLights ? "layered-scene--edit" : ""
      }`}
      aria-hidden={!editLights}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onDoubleClick={addLight}
    >
      {editLights && (
        <div className="layered-scene__edit-help">
          Drag lights. Double-click empty spots to add lights. Drag 🔥 and 🪵 to move lantern glows.
        </div>
      )}

      {editLights && (
        <>
          <div
            className="lantern-drag lantern-drag--top"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDraggingLantern("lantern");
            }}
          >
            🔥
          </div>

          <div
            className="lantern-drag lantern-drag--floor"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDraggingLantern("floor-lantern");
            }}
          >
            🪵
          </div>
        </>
      )}

      <div className="layered-scene__sky-glow" />

      <div className="layered-scene__aurora layered-scene__aurora--one" />
      <div className="layered-scene__aurora layered-scene__aurora--two" />

      <div className="layered-scene__string-lights">
        {stringLights.map((light, index) => (
          <span
            key={`string-light-${light.id}`}
            className={`layered-scene__string-light layered-scene__string-light--${light.id}`}
            style={
              light.isExtra
                ? {
                    left: light.left,
                    top: light.top,
                  }
                : undefined
            }
            onMouseDown={(e) => {
              if (!editLights) return;
              e.preventDefault();
              e.stopPropagation();
              setDraggingLight(light.id);
            }}
          >
            {editLights && (
              <span className="layered-scene__string-light-label">
                {light.id}
              </span>
            )}

            <span
              className="layered-scene__string-light-bulb"
              style={{
                animationDelay: `${index * 0.16}s`,
                animationDuration: `${1.65 + (index % 5) * 0.18}s`,
              }}
            />
          </span>
        ))}
      </div>

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

      <div className="layered-scene__floor-lantern-glow" />
      <div className="layered-scene__floor-lantern-core" />

      <div className="layered-scene__fog layered-scene__fog--one" />
      <div className="layered-scene__fog layered-scene__fog--two" />
    </div>
  );
}