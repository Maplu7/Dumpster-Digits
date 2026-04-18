import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { finishGameWithRewards } from "../components/finishGameWithRewards";

export class SimpleDragMathScene extends Phaser.Scene {
  constructor(sceneKey = "Game") {
    super(sceneKey);
    this.assignmentTitle = "Math Game";
    this.gameKey = "math_game";
    this.problems = [];
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.add.image(w / 2, h / 2, "camp").setDisplaySize(w, h);

    const chosen = Phaser.Utils.Array.Shuffle([...(this.problems || [])]).slice(0, 5);
    const questions = Phaser.Utils.Array.Shuffle([...chosen]);
    const answers = Phaser.Utils.Array.Shuffle([...chosen]);

    const canY = h * 0.8;
    const trashY1 = h * 0.28;
    const trashY2 = h * 0.4;
    const xPositions = [w * 0.12, w * 0.3, w * 0.48, w * 0.66, w * 0.84];

    const CAN_SCALE = 0.16;
    const TRASH_SCALE = 0.1;

    this.trashCans = xPositions.map((x, index) =>
      new TrashCan(this, x, canY, answers[index]).setScale(CAN_SCALE)
    );

    this.trashItems = [
      new Trash(this, xPositions[0], trashY1, questions[0]).setScale(TRASH_SCALE),
      new Trash(this, xPositions[1], trashY2, questions[1]).setScale(TRASH_SCALE),
      new Trash(this, xPositions[2], trashY1, questions[2]).setScale(TRASH_SCALE),
      new Trash(this, xPositions[3], trashY2, questions[3]).setScale(TRASH_SCALE),
      new Trash(this, xPositions[4], trashY1, questions[4]).setScale(TRASH_SCALE),
    ];

    this.numGuessesPerAnswer = this.trashItems.map((trash) => ({
      guessedAnswer: trash,
      numGuess: 0,
    }));

    this.numCorrect = 0;
    this.numWrong = 0;
    this.triesUsed = 0;
    this.gameIsFinished = false;

    this.trashItems.forEach((trash) => {
      this.trashCans.forEach((can) => {
        this.physics.add.overlap(trash, can, this.putInTrash, null, this);
      });
    });
  }

  showCenteredFeedback(message, isCorrect = true) {
    this.feedbackContainer?.destroy();
    this.correct = null;
    this.wrongText = null;

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.15;
    const textColor = isCorrect ? "#ffefc8" : "#ffd6df";

    const shadowText = this.add
      .text(3, 3, message, {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "42px",
        color: "#2f1b10",
        stroke: "#2f1b10",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5)
      .setAlpha(0.28);

    const text = this.add
      .text(0, 0, message, {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "42px",
        color: textColor,
        stroke: "#5a3e1b",
        strokeThickness: 3,
        align: "center",
      })
      .setOrigin(0.5);

    this.feedbackContainer = this.add.container(centerX, centerY, [shadowText, text]);
    this.feedbackContainer.setDepth(100);
    this.feedbackContainer.setScrollFactor(0);
    this.feedbackContainer.setAlpha(0);

    this.tweens.add({
      targets: this.feedbackContainer,
      alpha: { from: 0, to: 1 },
      y: centerY - 8,
      duration: 180,
      ease: "Sine.easeOut",
    });
  }

  clearCenteredFeedback() {
    this.feedbackContainer?.destroy();
    this.feedbackContainer = null;
    this.correct = null;
    this.wrongText = null;
  }

  putInTrash(trash, trashCan) {
    if (this.gameIsFinished) return;
    if (trashCan && trashCan._disabled) return;
    if (trash._lockedOnCan) return;

    trash._lockedOnCan = true;

    const unlockWhenLeaving = () => {
      const activeCans = (this.trashCans || []).filter((c) => c && c.active);
      const stillOverAny = activeCans.some((c) => this.physics.overlap(trash, c));

      if (!stillOverAny) {
        trash._lockedOnCan = false;

        if (trash && trash.active && trash.trashMath && !trash._dragging) {
          trash.trashMath.clearTint();
        }
      } else {
        this.time.delayedCall(100, unlockWhenLeaving);
      }
    };

    if (trash.answer === trashCan.answer) {
      this.clearCenteredFeedback();
      this.showCenteredFeedback("That is Correct!", true);

      if (trashCan.markCorrect) {
        trashCan.markCorrect();
      }

      trash.destroy();
      trashCan.destroy();

      this.numCorrect += 1;

      this.time.delayedCall(550, this.onCorrect, [], this);

      if (this.numCorrect === 5) {
        this.gameIsFinished = true;
        this.time.delayedCall(1000, this.onFinish, [], this);
      }

      return;
    }

    this.numWrong += 1;

    const guessEntry = this.numGuessesPerAnswer.find(
      (entry) => entry.guessedAnswer === trash
    );

    if (guessEntry) {
      guessEntry.numGuess += 1;
    }

    this.clearCenteredFeedback();
    this.showCenteredFeedback("Try again!", false);

    this.time.delayedCall(700, () => this.clearCenteredFeedback());

    this.triesUsed += 1;
    unlockWhenLeaving();
  }

  onCorrect() {
    this.clearCenteredFeedback();
  }

  async onFinish() {
    const { width, height } = this.scale;
    const centerX = width / 2;

    let coinsEarned = 0;

    try {
      const studentId = sessionStorage.getItem("studentId");

      coinsEarned = await finishGameWithRewards({
        studentId,
        gameKey: this.gameKey,
        assignmentTitle: this.assignmentTitle,
        totalWrongGuesses: this.numWrong,
        numGuessesPerAnswer: this.numGuessesPerAnswer,
      });
    } catch (error) {
      console.error(`Failed to save result for ${this.gameKey}:`, error);
    }

    const wrongGuessLines = this.trashItems.map((trash, index) => {
      const entry = this.numGuessesPerAnswer[index];
      return `${trash.question} → wrong tries: ${entry?.numGuess ?? 0}`;
    });

    const overlay = this.add.container(0, 0).setDepth(300);

    const dimmer = this.add
      .rectangle(0, 0, width, height, 0x071017, 0.68)
      .setOrigin(0);

    const warmGlow = this.add
      .ellipse(centerX, height * 0.34, width * 0.62, height * 0.42, 0xffc96f, 0.12);

    const cardWidth = Math.min(780, width * 0.72);
    const cardHeight = 360;
    const cardX = centerX - cardWidth / 2;
    const cardY = height * 0.18;

    const cardShadow = this.add.graphics();
    cardShadow.fillStyle(0x000000, 0.26);
    cardShadow.fillRoundedRect(cardX + 10, cardY + 12, cardWidth, cardHeight, 34);

    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xf7ecd8, 0.985);
    cardBg.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 34);
    cardBg.lineStyle(7, 0xe4a03b, 1);
    cardBg.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 34);

    const innerBorder = this.add.graphics();
    innerBorder.lineStyle(3, 0xc08d58, 0.72);
    innerBorder.strokeRoundedRect(cardX + 16, cardY + 16, cardWidth - 32, cardHeight - 32, 24);

    const title = this.add
      .text(centerX, cardY - 36, "Congratulations!", {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "56px",
        color: "#ffe7b4",
        stroke: "#5a3e1b",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const subtitle = this.add
      .text(centerX, cardY + 54, `${coinsEarned} coins earned`, {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "34px",
        color: "#6b3c17",
        align: "center",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const perfectRunBadge =
      this.numWrong === 0
        ? this.add
            .text(centerX, cardY + 94, "Perfect run • No wrong guesses", {
              fontFamily: "'Fjalla One', sans-serif",
              fontSize: "24px",
              color: "#b56a20",
              align: "center",
            })
            .setOrigin(0.5)
            .setAlpha(0)
        : null;

    const lineStartY = this.numWrong === 0 ? cardY + 150 : cardY + 130;

    const statLines = wrongGuessLines.map((line, index) =>
      this.add
        .text(centerX, lineStartY + index * 38, line, {
          fontFamily: "'Fjalla One', sans-serif",
          fontSize: "25px",
          color: "#3f2b1d",
          align: "center",
        })
        .setOrigin(0.5)
        .setAlpha(0)
    );

    const sparkleLeft = this.add
      .text(cardX + 44, cardY + 38, "✦", {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "24px",
        color: "#ffd86c",
        stroke: "#a46a1e",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    const sparkleRight = this.add
      .text(cardX + cardWidth - 44, cardY + 42, "✧", {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "22px",
        color: "#ffe9a8",
        stroke: "#a46a1e",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    overlay.add([
      dimmer,
      warmGlow,
      cardShadow,
      cardBg,
      innerBorder,
      title,
      subtitle,
      sparkleLeft,
      sparkleRight,
    ]);

    if (perfectRunBadge) {
      overlay.add(perfectRunBadge);
    }

    statLines.forEach((line) => overlay.add(line));

    overlay.setAlpha(0);

    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 260,
      ease: "Sine.easeOut",
    });

    this.tweens.add({
      targets: title,
      y: title.y - 8,
      alpha: 1,
      duration: 420,
      ease: "Back.easeOut",
    });

    this.tweens.add({
      targets: subtitle,
      y: subtitle.y - 4,
      alpha: 1,
      delay: 120,
      duration: 360,
      ease: "Sine.easeOut",
    });

    if (perfectRunBadge) {
      this.tweens.add({
        targets: perfectRunBadge,
        y: perfectRunBadge.y - 3,
        alpha: 1,
        delay: 220,
        duration: 320,
        ease: "Sine.easeOut",
      });
    }

    statLines.forEach((line, index) => {
      this.tweens.add({
        targets: line,
        y: line.y - 4,
        alpha: 1,
        delay: 260 + index * 90,
        duration: 260,
        ease: "Sine.easeOut",
      });
    });

    this.tweens.add({
      targets: [sparkleLeft, sparkleRight],
      y: "-=4",
      alpha: { from: 0.82, to: 1 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.time.delayedCall(350, () => {
      for (let i = 0; i < 10; i++) {
        const ember = this.add
          .circle(
            centerX + Phaser.Math.Between(-260, 260),
            cardY + cardHeight - 20 + Phaser.Math.Between(-20, 20),
            Phaser.Math.Between(2, 5),
            Phaser.Display.Color.HexStringToColor(
              Phaser.Utils.Array.GetRandom(["#ffd36b", "#ffb347", "#fff0b3"])
            ).color,
            0.95
          )
          .setDepth(301);

        this.tweens.add({
          targets: ember,
          y: ember.y - Phaser.Math.Between(40, 90),
          x: ember.x + Phaser.Math.Between(-20, 20),
          alpha: 0,
          duration: Phaser.Math.Between(900, 1400),
          ease: "Quad.easeOut",
          onComplete: () => ember.destroy(),
        });
      }
    });

    if (window.onPhaserGameFinished) {
      window.onPhaserGameFinished();
    }
  }
}