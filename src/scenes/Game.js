import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { saveAssignmentResult } from "../saveAssignmentResult";

export class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.problems = [
      { question: "1+0", answer: 1 },
      { question: "1+1", answer: 2 },
      { question: "1+2", answer: 3 },
      { question: "1+3", answer: 4 },
      { question: "1+4", answer: 5 },
      { question: "1+5", answer: 6 },
      { question: "1+6", answer: 7 },
      { question: "1+7", answer: 8 },
      { question: "1+8", answer: 9 },
      { question: "1+9", answer: 10 },
    ];

    this.add.image(w / 2, h / 2, "camp").setDisplaySize(w, h);

    const chosen = Phaser.Utils.Array.Shuffle([...this.problems]).slice(0, 5);
    const questions = Phaser.Utils.Array.Shuffle([...chosen]);
    const answers = Phaser.Utils.Array.Shuffle([...chosen]);

    const canY = h * 0.72;
    const trashY1 = h * 0.28;
    const trashY2 = h * 0.36;

    const x1 = w * 0.12;
    const x2 = w * 0.30;
    const x3 = w * 0.48;
    const x4 = w * 0.66;
    const x5 = w * 0.84;

    this.trashCan1 = new TrashCan(this, x1, canY, answers[0]).setScale(1);
    this.trashCan2 = new TrashCan(this, x2, canY, answers[1]).setScale(1);
    this.trashCan3 = new TrashCan(this, x3, canY, answers[2]).setScale(1);
    this.trashCan4 = new TrashCan(this, x4, canY, answers[3]).setScale(1);
    this.trashCan5 = new TrashCan(this, x5, canY, answers[4]).setScale(1);

    this.trash1 = new Trash(this, x1, trashY1, questions[0]).setScale(0.6);
    this.trash2 = new Trash(this, x2, trashY2, questions[1]).setScale(0.6);
    this.trash3 = new Trash(this, x3, trashY1, questions[2]).setScale(0.6);
    this.trash4 = new Trash(this, x4, trashY2, questions[3]).setScale(0.6);
    this.trash5 = new Trash(this, x5, trashY1, questions[4]).setScale(0.6);

    this.numGuessesPerAnswer = [
      { guessedAnswer: this.trash1, numGuess: 0 },
      { guessedAnswer: this.trash2, numGuess: 0 },
      { guessedAnswer: this.trash3, numGuess: 0 },
      { guessedAnswer: this.trash4, numGuess: 0 },
      { guessedAnswer: this.trash5, numGuess: 0 },
    ];

    this.numCorrect = 0;
    this.numWrong = 0;
    this.triesUsed = 0;
    this.gameIsFinished = false;

    const allTrash = [this.trash1, this.trash2, this.trash3, this.trash4, this.trash5];
    const allCans = [this.trashCan1, this.trashCan2, this.trashCan3, this.trashCan4, this.trashCan5];

    allTrash.forEach((trash) => {
      allCans.forEach((can) => {
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
      const cans = [
        this.trashCan1,
        this.trashCan2,
        this.trashCan3,
        this.trashCan4,
        this.trashCan5,
      ].filter((c) => c && c.active);

      const stillOverAny = cans.some((c) => this.physics.overlap(trash, c));

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

    if (trash === this.trash1) this.numGuessesPerAnswer[0].numGuess++;
    else if (trash === this.trash2) this.numGuessesPerAnswer[1].numGuess++;
    else if (trash === this.trash3) this.numGuessesPerAnswer[2].numGuess++;
    else if (trash === this.trash4) this.numGuessesPerAnswer[3].numGuess++;
    else if (trash === this.trash5) this.numGuessesPerAnswer[4].numGuess++;

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

    this.guessesQuestion1 = this.add.text(
      300,
      300,
      `Wrong guesses for ${this.trash1.question}=${this.trash1.answer}: ${this.numGuessesPerAnswer[0].numGuess}`,
      { fontSize: "32px", fill: "#ffffff" }
    );

    this.guessesQuestion2 = this.add.text(
      300,
      360,
      `Wrong guesses for ${this.trash2.question}=${this.trash2.answer}: ${this.numGuessesPerAnswer[1].numGuess}`,
      { fontSize: "32px", fill: "#ffffff" }
    );

    this.guessesQuestion3 = this.add.text(
      300,
      420,
      `Wrong guesses for ${this.trash3.question}=${this.trash3.answer}: ${this.numGuessesPerAnswer[2].numGuess}`,
      { fontSize: "32px", fill: "#ffffff" }
    );

    this.guessesQuestion4 = this.add.text(
      300,
      480,
      `Wrong guesses for ${this.trash4.question}=${this.trash4.answer}: ${this.numGuessesPerAnswer[3].numGuess}`,
      { fontSize: "32px", fill: "#ffffff" }
    );

    this.guessesQuestion5 = this.add.text(
      300,
      540,
      `Wrong guesses for ${this.trash5.question}=${this.trash5.answer}: ${this.numGuessesPerAnswer[4].numGuess}`,
      { fontSize: "32px", fill: "#ffffff" }
    );

    try {
      const studentId = sessionStorage.getItem("studentId");

      await saveAssignmentResult({
        studentId,
        gameKey: "1st_addition",
        assignmentTitle: "1st Grade Addition",
        totalWrongGuesses: this.numWrong,
        numGuessesPerAnswer: this.numGuessesPerAnswer,
      });
    } catch (error) {
      console.error("Failed to save addition result:", error);
    }

    if (window.onPhaserGameFinished) {
      window.onPhaserGameFinished();
    }
  }
}