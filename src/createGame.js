import Phaser from "phaser";

import { Preloader } from "./scenes/Preloader";
import { Game_1st_grade_addition } from "./scenes/Game_1st_grade_addition";
import { Game_1st_grade_subtraction } from "./scenes/Game_1st_grade_subtraction";
import { Game_2nd_grade_addition } from "./scenes/Game_2nd_grade_addition";
import { Game_2nd_grade_subtraction } from "./scenes/Game_2nd_grade_subtraction";
import { Game_2nd_grade_fillInTheBlank } from "./scenes/Game_2nd_grade_fillInTheBlank";
import { Game_2nd_grade_placevalues } from "./scenes/Game_2nd_grade_placevalues";
import { Game_2nd_grade_multiplication } from "./scenes/Game_2nd_grade_multiplication";

const GAME_WIDTH = 1536;
const GAME_HEIGHT = 793;

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

export function createGame(gameKey, parent = "game-container", options = {}) {
  const SelectedScene = getSceneForGameKey(gameKey);

  const {
    studentId = "",
    classId = "",
    assignedProblems = [],
  } = options || {};

  const safeStudentId = studentId ? String(studentId) : "";
  const safeClassId = classId ? String(classId) : "";
  const safeAssignedProblems = Array.isArray(assignedProblems)
    ? assignedProblems
    : [];

  const game = new Phaser.Game({
    type: Phaser.AUTO,

    width: GAME_WIDTH,
    height: GAME_HEIGHT,

    parent,
    backgroundColor: "#000000",

    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent,
    },

    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },

    scene: [Preloader, SelectedScene],
  });

  game.registry.set("studentId", safeStudentId);
  game.registry.set("classId", safeClassId);
  game.registry.set("gameKey", gameKey);
  game.registry.set("assignedProblems", safeAssignedProblems);

  console.log("🎮 createGame config", {
    gameKey,
    studentId: safeStudentId,
    classId: safeClassId,
    assignedProblems: safeAssignedProblems,
    size: `${GAME_WIDTH}x${GAME_HEIGHT}`,
  });

  return game;
}

export default createGame;