import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import "./Welcome.css";
import CampfireScene from "../components/CampfireScene";
import { db } from "../firebase";

const ASSIGNMENTS_TITLE_COLOR = "#ffe7b4";
const DEFAULT_PROFILE_IMAGE = "/raccacoonies/what.jpeg";

const outfitImages = {
  "outfit-chef": "/raccacoonies/CHEF_RACCO.png",
  "outfit-argg": "/raccacoonies/ARGG.png",
  knight: "/raccacoonies/knight.png",
  fairy: "/raccacoonies/fairy.png",
  princess: "/raccacoonies/princess.png",
  sleepy: "/raccacoonies/eppy.png",
  wizard: "/raccacoonies/wizard.png",
  sable: "/raccacoonies/sable.png",
  dragon: "/raccacoonies/dragon.png",
};

const pfpImages = {
  1: "/raccacoonies/happy.png",
  2: "/raccacoonies/angy.png",
  3: "/raccacoonies/crying.jpeg",
  4: "/raccacoonies/woah.png",
  5: "/raccacoonies/bleh.jpeg",
  6: "/raccacoonies/thinking.jpeg",
  7: "/raccacoonies/confused.jpeg",
  8: "/raccacoonies/bleh_2.jpeg",
  9: "/raccacoonies/what.jpeg",
  10: "/raccacoonies/playing_dead.png",
  11: "/raccacoonies/furious.png",
  12: "/raccacoonies/blush.jpeg",
};

const emoteImages = {
  heart: "/emotes/heart.png",
  brokenHeart: "/emotes/brokenHeart.png",
  angry: "/emotes/angry.png",
  sleepy: "/emotes/sleepy.png",
  cry: "/emotes/cry.png",
};

const Welcome = ({ student, onOpenAssignments, onOpenShop, onLogout }) => {
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

      const equippedOutfit = data.equippedOutfit || "";
      const equippedPfp = data.equippedPfp || "";
      const equippedEmote = data.equippedEmote || "";

      if (equippedOutfit && outfitImages[equippedOutfit]) {
        setEquippedImage(outfitImages[equippedOutfit]);
        setEquippedCategory("outfit");
      } else if (equippedPfp && pfpImages[equippedPfp]) {
        setEquippedImage(pfpImages[equippedPfp]);
        setEquippedCategory("pfp");
      } else if (equippedEmote && emoteImages[equippedEmote]) {
        setEquippedImage(emoteImages[equippedEmote]);
        setEquippedCategory("emote");
      } else {
        setEquippedImage(DEFAULT_PROFILE_IMAGE);
        setEquippedCategory("pfp");
      }
    });

    return () => unsubscribe();
  }, [student?.id]);

  function pulseFire(action) {
    setFireBoost((n) => n + 1);
    action?.();
  }

  const profileCircleClass =
    equippedCategory === "outfit"
      ? "profile-circle profile-circle--outfit"
      : equippedCategory === "emote"
      ? "profile-circle profile-circle--emote"
      : "profile-circle profile-circle--pfp";

  const profileImageClass =
    equippedCategory === "outfit"
      ? "profile-image profile-image--outfit"
      : equippedCategory === "emote"
      ? "profile-image profile-image--emote"
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

        <h1>WELCOME{name ? `, ${name} :` : ""}</h1>
        <p>Let's get started!</p>

        <div className="buttons">
          <button onClick={() => pulseFire(onOpenAssignments)}>GAMES</button>
          <button onClick={() => pulseFire(onOpenShop)}>SHOP</button>
          <button onClick={() => pulseFire(onLogout)}>LOGOUT</button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;