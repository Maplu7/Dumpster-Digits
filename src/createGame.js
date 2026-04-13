import Phaser from "phaser";

import { Preloader } from "./scenes/Preloader";
import { Game_1st_grade_addition } from "./scenes/Game_1st_grade_addition";
import { Game_1st_grade_subtraction } from "./scenes/Game_1st_grade_subtraction";
import { Game_2nd_grade_addition } from "./scenes/Game_2nd_grade_addition";
import { Game_2nd_grade_subtraction } from "./scenes/Game_2nd_grade_subtraction";
import { Game_2nd_grade_fillInTheBlank } from "./scenes/Game_2nd_grade_fillInTheBlank";
import { Game_2nd_grade_placevalues } from "./scenes/Game_2nd_grade_placevalues";
import { Game_2nd_grade_multiplication } from "./scenes/Game_2nd_grade_multiplication";

function getSceneForGameKey(gameKey) {
  switch (gameKey) {
    case "1st_addition":
      return Game_1st_grade_addition;
    case "1st_subtraction":
      return Game_1st_grade_subtraction;
    case "2nd_addition":
      return Game_2nd_grade_addition;
    case "2nd_subtraction":
      return Game_2nd_grade_subtraction;
    case "2nd_fill_blank":
      return Game_2nd_grade_fillInTheBlank;
    case "2nd_place_value":
      return Game_2nd_grade_placevalues;
    case "2nd_multiplication":
      return Game_2nd_grade_multiplication;
    default:
      return Game_1st_grade_addition;
  }
}

export function createGame(gameKey, parent = "game-container", studentId = null) {
  const SelectedScene = getSceneForGameKey(gameKey);

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 1536,
    height: 793,
    parent,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [Preloader, SelectedScene],
  });

  game.registry.set("studentId", studentId ? String(studentId) : "");
  game.registry.set("gameKey", gameKey);
  return game;
}

export default createGame;