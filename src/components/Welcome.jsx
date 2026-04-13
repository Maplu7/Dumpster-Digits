import React, { useState } from "react";
import "./Welcome.css";
import raccacoonie from "./images/raccacoonie.jpeg";
import CampfireScene from "../components/CampfireScene";

const ASSIGNMENTS_TITLE_COLOR = "#ffe7b4";

const Welcome = ({
  student,
  onOpenAssignments,
  onOpenShop,
  onLogout,
}) => {
  const name = student?.name;
  const [fireBoost, setFireBoost] = useState(0);

  function pulseFire(action) {
    setFireBoost((n) => n + 1);
    action?.();
  }

  return (
    <div className="wrapper">
      <CampfireScene boost={fireBoost} />

      <div className="welcome-content">
        <div
          className="profile-circle"
          style={{
            border: `6px solid ${ASSIGNMENTS_TITLE_COLOR}`,
            boxShadow: `0 0 22px ${ASSIGNMENTS_TITLE_COLOR}55`,
          }}
        >
          <img src={raccacoonie} alt="Raccacoonie Profile" />
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