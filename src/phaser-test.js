import Phaser from "phaser";
import { Preloader } from "./scenes/Preloader.js";
import { Game_1st_grade_addition } from "./scenes/Game_1st_grade_addition.js";

const config = {
  type: Phaser.AUTO,
  width: 1536,
  height: 864,
  parent: document.body,
  backgroundColor: "#1a1a1a",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [Preloader, Game_1st_grade_addition],
};

const game = new Phaser.Game(config);
game.registry.set("studentId", "test-user");

window.game = game;
console.log("Standalone Phaser test loaded");