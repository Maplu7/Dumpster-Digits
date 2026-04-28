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

    this.setSize(110, 110);

    this.body.setSize(110, 110);
    this.body.setOffset(-55, -55);
    this.body.setAllowGravity(false);
    this.body.setVelocity(0, 0);

    // ✅ Make the WHOLE trash container draggable, not just the image.
    this.setInteractive(
      new Phaser.Geom.Rectangle(-70, -70, 140, 140),
      Phaser.Geom.Rectangle.Contains
    );

    scene.input.setDraggable(this);

    this.on("dragstart", () => {
      if (this._wrongCooldown || this._resettingHome) return;

      this._dragging = true;
      this._lockedOnCan = false;
      this.setDepth(1000);
      this.trashMath.setTint(0x00e6e6);
    });

    this.on("drag", (pointer, dragX, dragY) => {
      if (this._wrongCooldown || this._resettingHome) return;

      this.setPosition(dragX, dragY);

      if (this.body) {
        this.body.reset(dragX, dragY);
        this.body.setVelocity(0, 0);
      }
    });

    this.on("dragend", () => {
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

    this.disableInteractive();

    this.scene.tweens.killTweensOf(this);

    this.scene.tweens.add({
      targets: this,
      x,
      y,
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

        this.scene.time.delayedCall(150, () => {
          if (!this.active) return;

          this._wrongCooldown = false;
          this._resettingHome = false;

          this.setInteractive(
            new Phaser.Geom.Rectangle(-70, -70, 140, 140),
            Phaser.Geom.Rectangle.Contains
          );

          this.scene.input.setDraggable(this);
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