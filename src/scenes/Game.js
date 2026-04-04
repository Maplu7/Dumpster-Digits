import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { saveAssignmentResult } from "../saveAssignmentResult";

export class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  create() {
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
      { question: "1+10", answer: 11 },
    ];

    this.twosProblems = [
      { question: "2+0", answer: 2 },
      { question: "2+1", answer: 3 },
      { question: "2+2", answer: 4 },
      { question: "2+3", answer: 5 },
      { question: "2+4", answer: 6 },
      { question: "2+5", answer: 7 },
      { question: "2+6", answer: 8 },
      { question: "2+7", answer: 9 },
      { question: "2+8", answer: 10 },
      { question: "2+9", answer: 11 },
      { question: "2+10", answer: 12 },
    ];

    this.threesProblems = [
      { question: "3+0", answer: 3 },
      { question: "3+1", answer: 4 },
      { question: "3+2", answer: 5 },
      { question: "3+3", answer: 6 },
      { question: "3+4", answer: 7 },
      { question: "3+5", answer: 8 },
      { question: "3+6", answer: 9 },
      { question: "3+7", answer: 10 },
      { question: "3+8", answer: 11 },
      { question: "3+9", answer: 12 },
      { question: "3+10", answer: 13 },
    ];

    this.foursProblems = [
      { question: "4+0", answer: 4 },
      { question: "4+1", answer: 5 },
      { question: "4+2", answer: 6 },
      { question: "4+3", answer: 7 },
      { question: "4+4", answer: 8 },
      { question: "4+5", answer: 9 },
      { question: "4+6", answer: 10 },
      { question: "4+7", answer: 11 },
      { question: "4+8", answer: 12 },
      { question: "4+9", answer: 13 },
      { question: "4+10", answer: 14 },
    ];

    this.fivesProblems = [
      { question: "5+0", answer: 5 },
      { question: "5+1", answer: 6 },
      { question: "5+2", answer: 7 },
      { question: "5+3", answer: 8 },
      { question: "5+4", answer: 9 },
      { question: "5+5", answer: 10 },
      { question: "5+6", answer: 11 },
      { question: "5+7", answer: 12 },
      { question: "5+8", answer: 13 },
      { question: "5+9", answer: 14 },
      { question: "5+10", answer: 15 },
    ];

    this.sixesProblems = [
      { question: "6+0", answer: 6 },
      { question: "6+1", answer: 7 },
      { question: "6+2", answer: 8 },
      { question: "6+3", answer: 9 },
      { question: "6+4", answer: 10 },
      { question: "6+5", answer: 11 },
      { question: "6+6", answer: 12 },
      { question: "6+7", answer: 13 },
      { question: "6+8", answer: 14 },
      { question: "6+9", answer: 15 },
      { question: "6+10", answer: 16 },
    ];

    this.sevensProblems = [
      { question: "7+0", answer: 7 },
      { question: "7+1", answer: 8 },
      { question: "7+2", answer: 9 },
      { question: "7+3", answer: 10 },
      { question: "7+4", answer: 11 },
      { question: "7+5", answer: 12 },
      { question: "7+6", answer: 13 },
      { question: "7+7", answer: 14 },
      { question: "7+8", answer: 15 },
      { question: "7+9", answer: 16 },
      { question: "7+10", answer: 17 },
    ];

    this.eightsProblems = [
      { question: "8+0", answer: 8 },
      { question: "8+1", answer: 9 },
      { question: "8+2", answer: 10 },
      { question: "8+3", answer: 11 },
      { question: "8+4", answer: 12 },
      { question: "8+5", answer: 13 },
      { question: "8+6", answer: 14 },
      { question: "8+7", answer: 15 },
      { question: "8+8", answer: 16 },
      { question: "8+9", answer: 17 },
      { question: "8+10", answer: 18 },
    ];

    this.ninesProblems = [
      { question: "9+0", answer: 9 },
      { question: "9+1", answer: 10 },
      { question: "9+2", answer: 11 },
      { question: "9+3", answer: 12 },
      { question: "9+4", answer: 13 },
      { question: "9+5", answer: 14 },
      { question: "9+6", answer: 15 },
      { question: "9+7", answer: 16 },
      { question: "9+8", answer: 17 },
      { question: "9+9", answer: 18 },
      { question: "9+10", answer: 19 },
    ];

    this.tensProblems = [
      { question: "10+0", answer: 10 },
      { question: "10+1", answer: 11 },
      { question: "10+2", answer: 12 },
      { question: "10+3", answer: 13 },
      { question: "10+4", answer: 14 },
      { question: "10+5", answer: 15 },
      { question: "10+6", answer: 16 },
      { question: "10+7", answer: 17 },
      { question: "10+8", answer: 18 },
      { question: "10+9", answer: 19 },
      { question: "10+10", answer: 20 },
    ];

    this.add.image(90, 50, "camp").setScale(3);
    this.campGround = this.add.group({
      key: "camp",
      repeat: 11,
      setXY: { x: 90, y: 50, stepX: 180 },
      setScale: { x: 3, y: 3 },
    });

    this.problem1 = Phaser.Utils.Array.GetRandom(this.problems);
    Phaser.Utils.Array.Remove(this.problems, this.problem1);

    this.problem2 = Phaser.Utils.Array.GetRandom(this.problems);
    Phaser.Utils.Array.Remove(this.problems, this.problem2);

    this.problem3 = Phaser.Utils.Array.GetRandom(this.problems);
    Phaser.Utils.Array.Remove(this.problems, this.problem3);

    this.problem4 = Phaser.Utils.Array.GetRandom(this.problems);
    Phaser.Utils.Array.Remove(this.problems, this.problem4);

    this.problem5 = Phaser.Utils.Array.GetRandom(this.problems);
    Phaser.Utils.Array.Remove(this.problems, this.problem5);

    this.possibleQuestions = [
      this.problem1,
      this.problem2,
      this.problem3,
      this.problem4,
      this.problem5,
    ];

    this.question1 = Phaser.Utils.Array.GetRandom(this.possibleQuestions);
    Phaser.Utils.Array.Remove(this.possibleQuestions, this.question1);

    this.question2 = Phaser.Utils.Array.GetRandom(this.possibleQuestions);
    Phaser.Utils.Array.Remove(this.possibleQuestions, this.question2);

    this.question3 = Phaser.Utils.Array.GetRandom(this.possibleQuestions);
    Phaser.Utils.Array.Remove(this.possibleQuestions, this.question3);

    this.question4 = Phaser.Utils.Array.GetRandom(this.possibleQuestions);
    Phaser.Utils.Array.Remove(this.possibleQuestions, this.question4);

    this.question5 = Phaser.Utils.Array.GetRandom(this.possibleQuestions);
    Phaser.Utils.Array.Remove(this.possibleQuestions, this.question5);

    this.possibleAnswers = [
      this.problem1,
      this.problem2,
      this.problem3,
      this.problem4,
      this.problem5,
    ];

    this.answer1 = Phaser.Utils.Array.GetRandom(this.possibleAnswers);
    Phaser.Utils.Array.Remove(this.possibleAnswers, this.answer1);

    this.answer2 = Phaser.Utils.Array.GetRandom(this.possibleAnswers);
    Phaser.Utils.Array.Remove(this.possibleAnswers, this.answer2);

    this.answer3 = Phaser.Utils.Array.GetRandom(this.possibleAnswers);
    Phaser.Utils.Array.Remove(this.possibleAnswers, this.answer3);

    this.answer4 = Phaser.Utils.Array.GetRandom(this.possibleAnswers);
    Phaser.Utils.Array.Remove(this.possibleAnswers, this.answer4);

    this.answer5 = Phaser.Utils.Array.GetRandom(this.possibleAnswers);
    Phaser.Utils.Array.Remove(this.possibleAnswers, this.answer5);

    this.trashCan1 = new TrashCan(this, 100, 700, this.answer1).setScale(1);
    this.trashCan2 = new TrashCan(this, 440, 700, this.answer2).setScale(1);
    this.trashCan3 = new TrashCan(this, 740, 700, this.answer3).setScale(1);
    this.trashCan4 = new TrashCan(this, 1040, 700, this.answer4).setScale(1);
    this.trashCan5 = new TrashCan(this, 1340, 700, this.answer5).setScale(1);

    this.trash1 = new Trash(this, 100, 280, this.question1).setScale(0.6);
    this.trash2 = new Trash(this, 440, 340, this.question2).setScale(0.6);
    this.trash3 = new Trash(this, 740, 280, this.question3).setScale(0.6);
    this.trash4 = new Trash(this, 1040, 340, this.question4).setScale(0.6);
    this.trash5 = new Trash(this, 1340, 280, this.question5).setScale(0.6);

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

    this.physics.add.overlap(this.trash1, this.trashCan1, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash1, this.trashCan2, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash1, this.trashCan3, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash1, this.trashCan4, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash1, this.trashCan5, this.putInTrash, null, this);

    this.physics.add.overlap(this.trash2, this.trashCan1, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash2, this.trashCan2, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash2, this.trashCan3, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash2, this.trashCan4, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash2, this.trashCan5, this.putInTrash, null, this);

    this.physics.add.overlap(this.trash3, this.trashCan1, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash3, this.trashCan2, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash3, this.trashCan3, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash3, this.trashCan4, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash3, this.trashCan5, this.putInTrash, null, this);

    this.physics.add.overlap(this.trash4, this.trashCan1, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash4, this.trashCan2, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash4, this.trashCan3, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash4, this.trashCan4, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash4, this.trashCan5, this.putInTrash, null, this);

    this.physics.add.overlap(this.trash5, this.trashCan1, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash5, this.trashCan2, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash5, this.trashCan3, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash5, this.trashCan4, this.putInTrash, null, this);
    this.physics.add.overlap(this.trash5, this.trashCan5, this.putInTrash, null, this);
  }

  putInTrash(trash, trashCan) {
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
        this.time.delayedCall(1000, this.onFinish, [], this);
      }

      return;
    }

    this.numWrong += 1;

    if (trash === this.trash1) {
      this.numGuessesPerAnswer[0].numGuess++;
    } else if (trash === this.trash2) {
      this.numGuessesPerAnswer[1].numGuess++;
    } else if (trash === this.trash3) {
      this.numGuessesPerAnswer[2].numGuess++;
    } else if (trash === this.trash4) {
      this.numGuessesPerAnswer[3].numGuess++;
    } else if (trash === this.trash5) {
      this.numGuessesPerAnswer[4].numGuess++;
    }

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
    this.correct.destroy();
  }

  async onFinish() {
    this.endGame = this.add.text(250, 150, "Congradulations! You Finished!", {
      fontSize: "60px",
      fill: "#ffffff",
    });

    this.guessesQuestion1 = this.add.text(
      300,
      300,
      "Number of Wrong Guesses for " +
        this.trash1.question +
        "=" +
        this.trash1.answer +
        " : " +
        this.numGuessesPerAnswer[0].numGuess,
      { fontSize: "40px", fill: "#ffffff" }
    );

    this.guessesQuestion2 = this.add.text(
      300,
      400,
      "Number of Wrong Guesses for " +
        this.trash2.question +
        "=" +
        this.trash2.answer +
        " : " +
        this.numGuessesPerAnswer[1].numGuess,
      { fontSize: "40px", fill: "#ffffff" }
    );

    this.guessesQuestion3 = this.add.text(
      300,
      500,
      "Number of Wrong Guesses for " +
        this.trash3.question +
        "=" +
        this.trash3.answer +
        " : " +
        this.numGuessesPerAnswer[2].numGuess,
      { fontSize: "40px", fill: "#ffffff" }
    );

    this.guessesQuestion4 = this.add.text(
      300,
      600,
      "Number of Wrong Guesses for " +
        this.trash4.question +
        "=" +
        this.trash4.answer +
        " : " +
        this.numGuessesPerAnswer[3].numGuess,
      { fontSize: "40px", fill: "#ffffff" }
    );

    this.guessesQuestion5 = this.add.text(
      300,
      700,
      "Number of Wrong Guesses for " +
        this.trash5.question +
        "=" +
        this.trash5.answer +
        " : " +
        this.numGuessesPerAnswer[4].numGuess,
      { fontSize: "40px", fill: "#ffffff" }
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
  }
}