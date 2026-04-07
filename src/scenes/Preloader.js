export class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    this.load.on("progress", (progress) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.setPath("assets");

    this.load.image("sky", "sky.png");
    this.load.image("space", "space.png");
    this.load.image("dump", "dump.png");
    this.load.image("dirt", "dirt.png");
    this.load.image("trashCan", "trashCan.png");
    this.load.image("trash", "can.png");
    this.load.image("camp", "campGround.png");
  }

  create() {
    this.scene.start("Game");
  }
}