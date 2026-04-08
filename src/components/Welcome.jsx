import React, { useState } from "react";
import "./Welcome.css";
import raccacoonie from "./images/raccacoonie.jpeg";
import CampfireScene from "../components/CampfireScene";

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
        <div className="profile-circle">
          <img src={raccacoonie} alt="Raccacoonie Profile" />
        </div>

        <h1>WELCOME{name ? `, ${name}` : ""}:</h1>
        <p>Let's get started!</p>

        <div className="buttons">
          <button onClick={() => pulseFire(onOpenAssignments)}>
            ASSIGNMENTS
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