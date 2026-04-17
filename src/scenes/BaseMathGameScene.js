import { Trash } from "../GameObjects/Trash";
import { TrashCan } from "../GameObjects/TrashCan";
import { finishGameWithRewards } from "../components/finishGameWithRewards";

const TITLE_STYLE = {
  fontFamily: "Arial",
  fontSize: "58px",
  color: "#f1c75b",
  fontStyle: "bold",
  stroke: "#624500",
  strokeThickness: 6,
  align: "center",
};

const BODY_STYLE = {
  fontFamily: "Arial",
  fontSize: "28px",
  color: "#fff9ea",
  stroke: "#2d2011",
  strokeThickness: 4,
};

export class BaseMathGameScene extends Phaser.Scene {
  constructor(sceneKey, config) {
    super(sceneKey);
    this.sceneConfig = config;
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.problems = this.sceneConfig.problems;

    this.addCampBackground(w, h);

    const chosen = Phaser.Utils.Array.Shuffle([...this.problems]).slice(0, 5);
    const questions = Phaser.Utils.Array.Shuffle([...chosen]);
    const answers = Phaser.Utils.Array.Shuffle([...chosen]);

    const canY = h * 0.80;
    const trashY1 = h * 0.28;
    const trashY2 = h * 0.40;
    const xs = [w * 0.12, w * 0.30, w * 0.48, w * 0.66, w * 0.84];

    const CAN_SCALE = 0.16;
    const TRASH_SCALE = 0.10;

    this.trashCans = xs.map((x, index) =>
      new TrashCan(this, x, canY, answers[index]).setScale(CAN_SCALE)
    );

    this.trashItems = [
      new Trash(this, xs[0], trashY1, questions[0]).setScale(TRASH_SCALE),
      new Trash(this, xs[1], trashY2, questions[1]).setScale(TRASH_SCALE),
      new Trash(this, xs[2], trashY1, questions[2]).setScale(TRASH_SCALE),
      new Trash(this, xs[3], trashY2, questions[3]).setScale(TRASH_SCALE),
      new Trash(this, xs[4], trashY1, questions[4]).setScale(TRASH_SCALE),
    ];

    this.numGuessesPerAnswer = this.trashItems.map((trash) => ({
      guessedAnswer: trash,
      numGuess: 0,
    }));

    this.numCorrect = 0;
    this.numWrong = 0;
    this.gameIsFinished = false;

    this.trashItems.forEach((trash) => {
      this.trashCans.forEach((can) => {
        this.physics.add.overlap(trash, can, this.handleTrashDrop, null, this);
      });
    });
  }

  addCampBackground(w, h) {
    const bg = this.add.image(w / 2, h / 2, "camp");

    // fill the screen with one background image
    bg.setDisplaySize(w, h).setAlpha(0.96);

    // subtle dark overlay so text still reads nicely
    this.add.rectangle(w / 2, h / 2, w, h, 0x120d08, 0.10);
  }

  handleTrashDrop(trash) {
    if (this.gameIsFinished || !trash?.active) return;

    const matchingCan = this.trashCans.find(
      (can) => can?.active && this.physics.overlap(trash, can)
    );

    if (!matchingCan) {
      trash.snapHome?.();
      return;
    }

    if (trash.answer === matchingCan.answer) {
      this.showFeedback("That is Correct!", "#fff2a8");

      matchingCan.markCorrect?.();

      if (trash.disableBody) trash.disableBody(true, true);
      if (matchingCan.disableBody) matchingCan.disableBody(true, true);

      trash.destroy();
      matchingCan.destroy();

      this.numCorrect += 1;

      if (this.numCorrect === 5) {
        this.gameIsFinished = true;
        this.time.delayedCall(700, () => this.onFinish(), [], this);
      }

      return;
    }

    this.numWrong += 1;

    const guessEntry = this.numGuessesPerAnswer.find(
      (item) => item.guessedAnswer === trash
    );

    if (guessEntry) {
      guessEntry.numGuess += 1;
    }

    this.showFeedback("Try again!", "#ffd7d7");
    trash.snapHome?.();
  }

  showFeedback(message, color) {
    this.feedbackText?.destroy();

    this.feedbackText = this.add
      .text(40, 60, message, {
        fontFamily: "Arial",
        fontSize: "46px",
        color,
        stroke: "#3c2b16",
        strokeThickness: 6,
      })
      .setDepth(50);

    this.time.delayedCall(600, () => this.feedbackText?.destroy());
  }

  async onFinish() {
    const w = this.scale.width;

    const panel = this.add
      .rectangle(w / 2, 250, Math.min(900, w * 0.9), 360, 0x1f1710, 0.72)
      .setStrokeStyle(6, 0xf1c75b)
      .setDepth(30);

    this.add
      .text(w / 2, 125, "Congratulations! You Finished!", TITLE_STYLE)
      .setOrigin(0.5)
      .setDepth(31);

    this.numGuessesPerAnswer.forEach((entry, index) => {
      this.add
        .text(
          w / 2 - 360,
          190 + index * 42,
          `${entry.guessedAnswer.question} = ${entry.guessedAnswer.answer}  •  Wrong guesses: ${entry.numGuess}`,
          BODY_STYLE
        )
        .setDepth(31);
    });

    let reward = 0;

    try {
      const studentId = sessionStorage.getItem("studentId");

      reward = await finishGameWithRewards({
        studentId,
        gameKey: this.sceneConfig.gameKey,
        assignmentTitle: this.sceneConfig.assignmentTitle,
        totalWrongGuesses: this.numWrong,
        numGuessesPerAnswer: this.numGuessesPerAnswer,
      });
    } catch (error) {
      console.error(`Failed to finish ${this.sceneConfig.gameKey}:`, error);
    }

    this.add
      .text(
        w / 2,
        425,
        reward > 0 ? `You earned ${reward} coins!` : "Assignment saved!",
        { ...BODY_STYLE, color: "#f6df87", fontSize: "34px" }
      )
      .setOrigin(0.5)
      .setDepth(31);

    panel.setDepth(30);

    if (window.onPhaserGameFinished) {
      window.onPhaserGameFinished();
    }
  }
}