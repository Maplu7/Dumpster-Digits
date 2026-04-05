import Phaser from "phaser";
window.Phaser = Phaser;

import { Boot } from "./scenes/Boot";
import { Preloader } from "./scenes/Preloader";
import { Game } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { Game_1st_grade_subtraction } from "./scenes/Game_1st_grade_subtraction";
import { Game_2nd_grade_multiplication } from "./scenes/Game_2nd_grade_multiplication";

function getSelectedScene(gameKey) {
  switch (gameKey) {
    case "1st_subtraction":
      return Game_1st_grade_subtraction;
    case "2nd_multiplication":
      return Game_2nd_grade_multiplication;
    case "1st_addition":
    default:
      return Game;
  }
}

export function createGame(parent, gameKey = "1st_addition") {
  const SelectedScene = getSelectedScene(gameKey);

  const config = {
    type: Phaser.AUTO,
    parent,
    backgroundColor: "transparent",
    transparent: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    physics: {
      default: "arcade",
      arcade: { gravity: { y: 300 }, debug: false },
    },
    scene: [Boot, Preloader, SelectedScene, GameOver],
  };

  return new Phaser.Game(config);
}