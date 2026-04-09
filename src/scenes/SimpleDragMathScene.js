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

    const canY = h * 0.72;
    const trashY1 = h * 0.28;
    const trashY2 = h * 0.36;
    const xPositions = [w * 0.12, w * 0.30, w * 0.48, w * 0.66, w * 0.84];

    this.trashCans = xPositions.map((x, index) => new TrashCan(this, x, canY, answers[index]).setScale(1));
    this.trashItems = [
      new Trash(this, xPositions[0], trashY1, questions[0]).setScale(0.6),
      new Trash(this, xPositions[1], trashY2, questions[1]).setScale(0.6),
      new Trash(this, xPositions[2], trashY1, questions[2]).setScale(0.6),
      new Trash(this, xPositions[3], trashY2, questions[3]).setScale(0.6),
      new Trash(this, xPositions[4], trashY1, questions[4]).setScale(0.6),
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
      this.correct?.destroy();
      this.correct = this.add.text(30, 200, "That is Correct!", {
        fontSize: "80px",
        fill: "#ffffff",
      });

      if (trashCan.markCorrect) trashCan.markCorrect();

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
    if (guessEntry) guessEntry.numGuess += 1;

    this.wrongText?.destroy();
    this.wrongText = this.add.text(30, 200, "Try again!", {
      fontSize: "80px",
      fill: "#ffffff",
    });

    this.time.delayedCall(550, () => this.wrongText?.destroy());
    this.triesUsed += 1;
    unlockWhenLeaving();
  }

  onCorrect() {
    this.correct?.destroy();
  }

  async onFinish() {
    this.endGame = this.add.text(250, 150, "Congratulations! You Finished!", {
      fontSize: "60px",
      fill: "#ffffff",
    });

    this.trashItems.forEach((trash, index) => {
      const entry = this.numGuessesPerAnswer[index];
      this.add.text(
        300,
        300 + index * 60,
        `Wrong guesses for ${trash.question}=${trash.answer}: ${entry?.numGuess ?? 0}`,
        { fontSize: "32px", fill: "#ffffff" }
      );
    });

    try {
      const studentId = sessionStorage.getItem("studentId");
      await finishGameWithRewards({
        studentId,
        gameKey: this.gameKey,
        assignmentTitle: this.assignmentTitle,
        totalWrongGuesses: this.numWrong,
        numGuessesPerAnswer: this.numGuessesPerAnswer,
      });
    } catch (error) {
      console.error(`Failed to save result for ${this.gameKey}:`, error);
    }

    if (window.onPhaserGameFinished) {
      window.onPhaserGameFinished();
    }
  }
}
