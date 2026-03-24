import Phaser from "phaser";
window.Phaser = Phaser;

import { Boot } from "./scenes/Boot";
import { Preloader } from "./scenes/Preloader";
import { Game } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";

export function createGame(parent) {
  const config = {
    type: Phaser.AUTO,
    parent,
    backgroundColor: "transparent",
    transparent: true,

    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: "100%",
      height: "100%",
    
    },

    physics: {
      default: "arcade",
      arcade: { gravity: { y: 300 }, debug: false },
    },

    scene: [Boot, Preloader, Game, GameOver],
  };

  return new Phaser.Game(config);
}
