import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { showFinishScreen } from "./utils/showFinishScreen";
import { saveAssignmentResult } from "../saveAssignmentResult";

export class Game_2nd_grade_multiplication extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  create() {
    // ✅ REQUIRED FOR FIREBASE SYNC
    this.gameKey = "2nd_multiplication";
    this.assignmentTitle = "2nd Grade Multiplication";

    this.saveResults = async () => {
      const studentId = this.studentId || this.registry.get("studentId");

      await saveAssignmentResult({
        studentId,
        gameKey: this.gameKey,
        assignmentTitle: this.assignmentTitle,
        totalWrongGuesses: this.numWrong || 0,
        numGuessesPerAnswer: this.numGuessesPerAnswer || [],
      });
    };

    // ✅ SIMPLE MULTIPLICATION PROBLEMS
    this.problems = [
      { question: "1×1", answer: 1 },
      { question: "1×2", answer: 2 },
      { question: "2×2", answer: 4 },
      { question: "2×3", answer: 6 },
      { question: "3×2", answer: 6 },
      { question: "3×3", answer: 9 },
      { question: "4×2", answer: 8 },
      { question: "5×2", answer: 10 },
      { question: "2×5", answer: 10 },
      { question: "4×3", answer: 12 }
    ];

    // BACKGROUND GRID (same as your other games)
    for (let y = 50; y <= 720; y += 100) {
      this.add.group({
        key: "camp",
        repeat: 11,
        setXY: { x: 90, y: y, stepX: 180 },
        setScale: { x: 3, y: 4 }
      });
    }

    // PICK 5 RANDOM PROBLEMS
    Phaser.Utils.Array.Shuffle(this.problems);

    this.questions = this.problems.slice(0, 5);
    this.answers = [...this.questions];

    Phaser.Utils.Array.Shuffle(this.answers);

    // CREATE TRASH CANS (answers)
    this.trashCan1 = new TrashCan(this, 100, 700, this.answers[0]);
    this.trashCan2 = new TrashCan(this, 440, 700, this.answers[1]);
    this.trashCan3 = new TrashCan(this, 740, 700, this.answers[2]);
    this.trashCan4 = new TrashCan(this, 1040, 700, this.answers[3]);
    this.trashCan5 = new TrashCan(this, 1340, 700, this.answers[4]);

    // CREATE TRASH (questions)
    this.trash1 = new Trash(this, 100, 280, this.questions[0]);
    this.trash2 = new Trash(this, 440, 340, this.questions[1]);
    this.trash3 = new Trash(this, 740, 280, this.questions[2]);
    this.trash4 = new Trash(this, 1040, 340, this.questions[3]);
    this.trash5 = new Trash(this, 1340, 280, this.questions[4]);

    // TRACK GUESSES
    this.numGuessesPerAnswer = [
      { guessedAnswer: this.trash1, numGuess: 0 },
      { guessedAnswer: this.trash2, numGuess: 0 },
      { guessedAnswer: this.trash3, numGuess: 0 },
      { guessedAnswer: this.trash4, numGuess: 0 },
      { guessedAnswer: this.trash5, numGuess: 0 }
    ];

    this.numCorrect = 0;
    this.numWrong = 0;

    const cans = [
      this.trashCan1,
      this.trashCan2,
      this.trashCan3,
      this.trashCan4,
      this.trashCan5
    ];

    const trashItems = [
      this.trash1,
      this.trash2,
      this.trash3,
      this.trash4,
      this.trash5
    ];

    // ADD OVERLAP FOR ALL
    trashItems.forEach((trash) => {
      cans.forEach((can) => {
        this.physics.add.overlap(trash, can, this.putInTrash, null, this);
      });
    });
  }

  putInTrash(trash, trashCan) {
    if (trashCan._disabled) return;

    if (trash._lockedOnCan) return;
    trash._lockedOnCan = true;

    const unlock = () => {
      trash._lockedOnCan = false;
    };

    if (trash.answer === trashCan.answer) {
      this.correct?.destroy();
      this.correct = this.add.text(30, 200, "Correct!", {
        fontSize: "80px",
        fill: "#ffffff"
      });

      trash.destroy();
      trashCan.destroy();

      this.numCorrect++;

      this.time.delayedCall(500, () => this.correct?.destroy());

      if (this.numCorrect === 5) {
        this.time.delayedCall(800, this.onFinish, [], this);
      }

      return;
    }

    // WRONG
    this.numWrong++;

    const index = [
      this.trash1,
      this.trash2,
      this.trash3,
      this.trash4,
      this.trash5
    ].indexOf(trash);

    if (index !== -1) {
      this.numGuessesPerAnswer[index].numGuess++;
    }

    this.wrongText?.destroy();
    this.wrongText = this.add.text(30, 200, "Try again!", {
      fontSize: "80px",
      fill: "#ffffff"
    });

    this.time.delayedCall(500, () => this.wrongText?.destroy());

    this.time.delayedCall(200, unlock);
  }

  async onFinish() {
    await this.saveResults();

    showFinishScreen(this, {
      formatLine: (trash, guessCount) =>
        "Wrong guesses for " +
        trash.question +
        " has " +
        trash.answer +
        ": " +
        guessCount
    });
  }
}