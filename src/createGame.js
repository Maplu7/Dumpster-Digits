import Phaser from "phaser";

import { Preloader } from "./scenes/Preloader";
import { Game_1st_grade_addition } from "./scenes/Game_1st_grade_addition";
import { Game_1st_grade_subtraction } from "./scenes/Game_1st_grade_subtraction";
import { Game_2nd_grade_addition } from "./scenes/Game_2nd_grade_addition";
import { Game_2nd_grade_subtraction } from "./scenes/Game_2nd_grade_subtraction";
import { Game_2nd_grade_fillInTheBlank } from "./scenes/Game_2nd_grade_fillInTheBlank";
import { Game_2nd_grade_placevalues } from "./scenes/Game_2nd_grade_placevalues";
import { Game_2nd_grade_multiplication } from "./scenes/Game_2nd_grade_multiplication";
import { Game_2nd_grade_division } from "./scenes/Game_2nd_grade_division";

const GAME_WIDTH = 1536;
const GAME_HEIGHT = 793;

const GAME_SCENES = {
  "1st_addition": Game_1st_grade_addition,
  "1st_subtraction": Game_1st_grade_subtraction,
  "2nd_addition": Game_2nd_grade_addition,
  "2nd_subtraction": Game_2nd_grade_subtraction,
  "2nd_fill_blank": Game_2nd_grade_fillInTheBlank,
  "2nd_place_value": Game_2nd_grade_placevalues,
  "2nd_multiplication": Game_2nd_grade_multiplication,
  "2nd_division": Game_2nd_grade_division,
};

function getSceneForGameKey(gameKey) {
  return GAME_SCENES[gameKey] || Game_1st_grade_addition;
}

function normalizeAssignedProblems(problems) {
  if (!Array.isArray(problems)) return [];

  return problems
    .map((problem) => {
      if (!problem || typeof problem !== "object") return null;

      const question = String(problem.question ?? "").trim();
      const answer = Number(problem.answer);

      if (!question || Number.isNaN(answer)) return null;

      return { question, answer };
    })
    .filter(Boolean);
}

export function createGame(gameKey, parent = "game-container", options = {}) {
  const safeGameKey = String(gameKey || "1st_addition").trim();
  const SelectedScene = getSceneForGameKey(safeGameKey);

  const safeStudentId = String(options?.studentId || "").trim();
  const safeClassId = String(options?.classId || "").trim();
  const safeAssignedProblems = normalizeAssignedProblems(
    options?.assignedProblems
  );
  const startedAt = Number(options?.startedAt || Date.now());

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,

    backgroundColor: "#6aad11",

    pixelArt: false,
    antialias: true,
    roundPixels: true,

    // ✅ THE IMPORTANT FIX
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
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
  game.registry.set("gameKey", safeGameKey);
  game.registry.set("assignedProblems", safeAssignedProblems);
  game.registry.set("startedAt", startedAt);

  return game;
}

export default createGame;