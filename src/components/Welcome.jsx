import React from "react";
import "./Welcome.css";

const Welcome = ({ student, onPlayGame,onOpenShop, onLogout }) => {
  const name = student?.name;

  return (
        <div className='wrapper welcome-bg'>
          <div className="profile-icon">
            <img src="/raccacconie-icon.png" alt="Raccacoonie Profile" />
          </div>

          <h1>WELCOME{name ? `, ${name}` : ""}:</h1>
          <p>Let's get started!</p>

      <div className="buttons">
        <button onClick={onPlayGame}>PLAY GAME</button>
         <button>ASSIGNMENTS</button>
         <button onClick={onOpenShop}>SHOP</button>
        <button onClick={onLogout}>LOGOUT</button>
      </div>
    </div>
  );
};

export default Welcome;
