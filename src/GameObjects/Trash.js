import Phaser from "phaser";

export class Trash extends Phaser.GameObjects.Container {
  constructor(scene, x, y, problem) {
    super(scene, x, y);

    this.scene = scene;

    this.answer = problem.answer;
    this.question = problem.question;

    this.startX = x;
    this.startY = y;
    this.originalX = x;
    this.originalY = y;

    this._lockedOnCan = false;
    this._dragging = false;
    this._wrongCooldown = false;
    this._resettingHome = false;

    this.piecesOfTrash = [0, 1, 2];

    this.trashMath = scene.add
      .image(
        0,
        0,
        "usedItems",
        Phaser.Utils.Array.GetRandom(this.piecesOfTrash)
      )
      .setScale(4);

    this.text = scene.add
      .text(0, 0, String(problem.answer), {
        fontSize: "23px",
        fontStyle: "bold",
        fontFamily: "Verdana",
        fill: "#000000",
      })
      .setOrigin(0.5);

    this.add([this.trashMath, this.text]);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(50, 20);

    if (this.body) {
      this.body.setSize(50, 20);
      this.body.setOffset(-10, -10);
      this.body.setAllowGravity(false);
      this.body.setVelocity(0, 0);
    }

    // Keep pickup on the trash image like your old version.
    this.trashMath.setInteractive({ draggable: true });
    scene.input.setDraggable(this.trashMath);

    this.trashMath.on("dragstart", () => {
      if (this._wrongCooldown || this._resettingHome) return;

      this._dragging = true;
      this._lockedOnCan = false;
      this.setDepth(1000);
      this.trashMath.setTint(0x00e6e6);
    });

    this.trashMath.on("drag", (pointer) => {
      if (this._wrongCooldown || this._resettingHome) return;

      this.setPosition(pointer.worldX, pointer.worldY);

      if (this.body) {
        this.body.reset(pointer.worldX, pointer.worldY);
        this.body.setVelocity(0, 0);
      }
    });

    this.trashMath.on("dragend", () => {
      this._dragging = false;
      this.trashMath.clearTint();
    });
  }

  snapHome() {
    const x = this.startX ?? this.originalX ?? this.x;
    const y = this.startY ?? this.originalY ?? this.y;

    this._lockedOnCan = false;
    this._dragging = false;
    this._wrongCooldown = true;
    this._resettingHome = true;

    this.scene.tweens.killTweensOf(this);

    if (this.body) {
      this.body.enable = false;
      this.body.setVelocity(0, 0);
    }

    this.scene.tweens.add({
      targets: this,
      x,
      y,
      angle: 0,
      duration: 300,
      ease: "Back.easeOut",
      onComplete: () => {
        if (!this.active) return;

        this.setPosition(x, y);
        this.trashMath.clearTint();

        if (this.body) {
          this.body.enable = true;
          this.body.reset(x, y);
          this.body.setVelocity(0, 0);
        }

        this._lockedOnCan = false;
        this._dragging = false;

        this.scene.time.delayedCall(120, () => {
          if (!this.active) return;

          this._wrongCooldown = false;
          this._resettingHome = false;
        });
      },
    });
  }

  setSpriteScale(scale) {
    this.trashMath.setScale(scale);
  }

  setTextScale(scale) {
    this.text.setFontSize(scale);
  }
}