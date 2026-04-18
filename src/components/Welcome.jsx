import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import "./Welcome.css";
import CampfireScene from "../components/CampfireScene";
import { db } from "../firebase";

const ASSIGNMENTS_TITLE_COLOR = "#ffe7b4";
const DEFAULT_PROFILE_IMAGE = "/raccacoonies/what.jpeg";

const Welcome = ({
  student,
  onOpenAssignments,
  onOpenShop,
  onLogout,
}) => {
  const name = student?.name;
  const [fireBoost, setFireBoost] = useState(0);

  const [equippedImage, setEquippedImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [equippedCategory, setEquippedCategory] = useState("pfp");

  useEffect(() => {
    if (!student?.id) {
      setEquippedImage(DEFAULT_PROFILE_IMAGE);
      setEquippedCategory("pfp");
      return;
    }

    const studentRef = doc(db, "students", String(student.id));

    const unsubscribe = onSnapshot(studentRef, (snap) => {
      if (!snap.exists()) {
        setEquippedImage(DEFAULT_PROFILE_IMAGE);
        setEquippedCategory("pfp");
        return;
      }

      const data = snap.data();
      setEquippedImage(data.equippedItemImage || DEFAULT_PROFILE_IMAGE);
      setEquippedCategory(data.equippedItemCategory || "pfp");
    });

    return () => unsubscribe();
  }, [student?.id]);

  function pulseFire(action) {
    setFireBoost((n) => n + 1);
    action?.();
  }

  const profileCircleClass =
    equippedCategory === "customize"
      ? "profile-circle profile-circle--customize"
      : "profile-circle profile-circle--pfp";

  const profileImageClass =
    equippedCategory === "customize"
      ? "profile-image profile-image--customize"
      : "profile-image profile-image--pfp";

  return (
    <div className="wrapper">
      <CampfireScene boost={fireBoost} />

      <div className="welcome-content">
        <div
          className={profileCircleClass}
          style={{
            border: `6px solid ${ASSIGNMENTS_TITLE_COLOR}`,
            boxShadow: `
              0 0 0 2px rgba(255,255,255,0.18) inset,
              0 0 24px ${ASSIGNMENTS_TITLE_COLOR}55,
              0 14px 28px rgba(0,0,0,0.24)
            `,
          }}
        >
          <img
            src={equippedImage || DEFAULT_PROFILE_IMAGE}
            alt="Raccacoonie Profile"
            className={profileImageClass}
            onError={(e) => {
              e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
            }}
          />
        </div>

        <h1>WELCOME{name ? `, ${name}` : ""}:</h1>
        <p>Let's get started!</p>

        <div className="buttons">
          <button onClick={() => pulseFire(onOpenAssignments)}>
            GAMES
          </button>

          <button onClick={() => pulseFire(onOpenShop)}>
            SHOP
          </button>

          <button onClick={() => pulseFire(onLogout)}>
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;