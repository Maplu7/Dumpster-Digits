import Phaser from "phaser";
import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { BaseMathGameScene } from "./BaseMathGameScene";

export class Game_2nd_grade_multiplication extends BaseMathGameScene {
  constructor() {
    super("Game");
  }

  pickFiveUniqueAnswerProblems(problemPool) {
    const shuffled = Phaser.Utils.Array.Shuffle([...problemPool]);
    const selected = [];
    const usedAnswers = new Set();

    for (const problem of shuffled) {
      const answerKey = String(problem.answer);
      if (usedAnswers.has(answerKey)) continue;

      usedAnswers.add(answerKey);
      selected.push(problem);

      if (selected.length === 5) break;
    }

    return selected;
  }

  create() {
    this.initSharedGameConfig({
      gameKey: "2nd_multiplication",
      assignmentTitle: "2nd Grade Multiplication",
    });

    this.onesProblems = [
      { question: "1×0", answer: 0 },
      { question: "1×1", answer: 1 },
      { question: "1×2", answer: 2 },
      { question: "1×3", answer: 3 },
      { question: "1×4", answer: 4 },
      { question: "1×5", answer: 5 },
      { question: "1×6", answer: 6 },
      { question: "1×7", answer: 7 },
      { question: "1×8", answer: 8 },
      { question: "1×9", answer: 9 },
      { question: "1×10", answer: 10 },
    ];

    this.twosProblems = [
      { question: "2×0", answer: 0 },
      { question: "2×1", answer: 2 },
      { question: "2×2", answer: 4 },
      { question: "2×3", answer: 6 },
      { question: "2×4", answer: 8 },
      { question: "2×5", answer: 10 },
      { question: "2×6", answer: 12 },
      { question: "2×7", answer: 14 },
      { question: "2×8", answer: 16 },
      { question: "2×9", answer: 18 },
      { question: "2×10", answer: 20 },
    ];

    this.threesProblems = [
      { question: "3×0", answer: 0 },
      { question: "3×1", answer: 3 },
      { question: "3×2", answer: 6 },
      { question: "3×3", answer: 9 },
      { question: "3×4", answer: 12 },
      { question: "3×5", answer: 15 },
      { question: "3×6", answer: 18 },
      { question: "3×7", answer: 21 },
      { question: "3×8", answer: 24 },
      { question: "3×9", answer: 27 },
      { question: "3×10", answer: 30 },
    ];

    this.foursProblems = [
      { question: "4×0", answer: 0 },
      { question: "4×1", answer: 4 },
      { question: "4×2", answer: 8 },
      { question: "4×3", answer: 12 },
      { question: "4×4", answer: 16 },
      { question: "4×5", answer: 20 },
      { question: "4×6", answer: 24 },
      { question: "4×7", answer: 28 },
      { question: "4×8", answer: 32 },
      { question: "4×9", answer: 36 },
      { question: "4×10", answer: 40 },
    ];

    this.fivesProblems = [
      { question: "5×0", answer: 0 },
      { question: "5×1", answer: 5 },
      { question: "5×2", answer: 10 },
      { question: "5×3", answer: 15 },
      { question: "5×4", answer: 20 },
      { question: "5×5", answer: 25 },
      { question: "5×6", answer: 30 },
      { question: "5×7", answer: 35 },
      { question: "5×8", answer: 40 },
      { question: "5×9", answer: 45 },
      { question: "5×10", answer: 50 },
    ];

    this.sixesProblems = [
      { question: "6×0", answer: 0 },
      { question: "6×1", answer: 6 },
      { question: "6×2", answer: 12 },
      { question: "6×3", answer: 18 },
      { question: "6×4", answer: 24 },
      { question: "6×5", answer: 30 },
      { question: "6×6", answer: 36 },
      { question: "6×7", answer: 42 },
      { question: "6×8", answer: 48 },
      { question: "6×9", answer: 54 },
      { question: "6×10", answer: 60 },
    ];

    this.sevensProblems = [
      { question: "7×0", answer: 0 },
      { question: "7×1", answer: 7 },
      { question: "7×2", answer: 14 },
      { question: "7×3", answer: 21 },
      { question: "7×4", answer: 28 },
      { question: "7×5", answer: 35 },
      { question: "7×6", answer: 42 },
      { question: "7×7", answer: 49 },
      { question: "7×8", answer: 56 },
      { question: "7×9", answer: 63 },
      { question: "7×10", answer: 70 },
    ];

    this.eightsProblems = [
      { question: "8×0", answer: 0 },
      { question: "8×1", answer: 8 },
      { question: "8×2", answer: 16 },
      { question: "8×3", answer: 24 },
      { question: "8×4", answer: 32 },
      { question: "8×5", answer: 40 },
      { question: "8×6", answer: 48 },
      { question: "8×7", answer: 56 },
      { question: "8×8", answer: 64 },
      { question: "8×9", answer: 72 },
      { question: "8×10", answer: 80 },
    ];

    this.ninesProblems = [
      { question: "9×0", answer: 0 },
      { question: "9×1", answer: 9 },
      { question: "9×2", answer: 18 },
      { question: "9×3", answer: 27 },
      { question: "9×4", answer: 36 },
      { question: "9×5", answer: 45 },
      { question: "9×6", answer: 54 },
      { question: "9×7", answer: 63 },
      { question: "9×8", answer: 72 },
      { question: "9×9", answer: 81 },
      { question: "9×10", answer: 90 },
    ];

    this.tensProblems = [
      { question: "10×0", answer: 0 },
      { question: "10×1", answer: 10 },
      { question: "10×2", answer: 20 },
      { question: "10×3", answer: 30 },
      { question: "10×4", answer: 40 },
      { question: "10×5", answer: 50 },
      { question: "10×6", answer: 60 },
      { question: "10×7", answer: 70 },
      { question: "10×8", answer: 80 },
      { question: "10×9", answer: 90 },
      { question: "10×10", answer: 100 },
    ];

    this.problems = [
      ...this.onesProblems,
      ...this.twosProblems,
      ...this.threesProblems,
      ...this.foursProblems,
      ...this.fivesProblems,
      ...this.sixesProblems,
      ...this.sevensProblems,
      ...this.eightsProblems,
      ...this.ninesProblems,
      ...this.tensProblems,
    ];

    for (let i = 1; i <= 7; i++) {
      const y = 50 + (i - 1) * 100;

      this[`campGroundRow${i}`] = this.add.group({
        key: "camp",
        repeat: 11,
        setXY: { x: 90, y, stepX: 180 },
        setScale: { x: 3, y: 6 },
      });
    }

    this.add.image(1250, 100, "yellowTent", 0).setScale(3);
    this.add.image(200, 100, "yellowTent", 1).setScale(3);
    this.add.image(100, 300, "campFire", 3).setScale(3);
    this.add.image(1400, 200, "campChairGreen", 0).setScale(2);
    this.add.image(1480, 280, "campChairGreen", 2).setScale(2);

    const selectedProblems = this.pickFiveUniqueAnswerProblems(this.problems);
    const questionOrder = Phaser.Utils.Array.Shuffle([...selectedProblems]);
    const answerOrder = Phaser.Utils.Array.Shuffle([...selectedProblems]);

    [
      this.question1,
      this.question2,
      this.question3,
      this.question4,
      this.question5,
    ] = questionOrder;

    [
      this.answer1,
      this.answer2,
      this.answer3,
      this.answer4,
      this.answer5,
    ] = answerOrder;

    this.trashCan1 = new TrashCan(this, 100, 700, this.answer1).setScale(1);
    this.trashCan2 = new TrashCan(this, 440, 700, this.answer2).setScale(1);
    this.trashCan3 = new TrashCan(this, 740, 700, this.answer3).setScale(1);
    this.trashCan4 = new TrashCan(this, 1040, 700, this.answer4).setScale(1);
    this.trashCan5 = new TrashCan(this, 1340, 700, this.answer5).setScale(1);

    this.trash1 = new Trash(this, 550, 280, this.question1);
    this.trash2 = new Trash(this, 650, 400, this.question2);
    this.trash3 = new Trash(this, 750, 280, this.question3);
    this.trash4 = new Trash(this, 850, 400, this.question4);
    this.trash5 = new Trash(this, 950, 280, this.question5);

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

    this.trashGroup = this.physics.add.group([
      this.trash1,
      this.trash2,
      this.trash3,
      this.trash4,
      this.trash5,
    ]);

    this.trashCanGroup = this.physics.add.group([
      this.trashCan1,
      this.trashCan2,
      this.trashCan3,
      this.trashCan4,
      this.trashCan5,
    ]);

    this.physics.add.overlap(
      this.trashGroup,
      this.trashCanGroup,
      this.putInTrash,
      null,
      this
    );
  }

  putInTrash(trash, trashCan) {
    if (this.introActive) return;
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

        if (trash?.trashMath && !trash._dragging) {
          trash.trashMath.clearTint();
        }
      } else {
        this.time.delayedCall(100, unlockWhenLeaving);
      }
    };

    if (trash.answer === trashCan.answer) {
      this.playFeedbackSound(true);
      this.clearCenteredFeedback();
      this.showCenteredFeedback("That is Correct!", true);

      trashCan.markCorrect?.();
      trash.destroy();
      trashCan.destroy();

      this.numCorrect++;
      this.time.delayedCall(this.feedbackDuration, this.onCorrect, [], this);

      if (this.numCorrect === 5) {
        this.time.delayedCall(this.feedbackDuration + 250, this.onFinish, [], this);
      }

      return;
    }

    this.numWrong++;

    const index = [
      this.trash1,
      this.trash2,
      this.trash3,
      this.trash4,
      this.trash5,
    ].indexOf(trash);

    if (index !== -1) {
      this.numGuessesPerAnswer[index].numGuess++;
    }

    this.playFeedbackSound(false);
    this.clearCenteredFeedback();
    this.showCenteredFeedback("Try again!", false);

    this.time.delayedCall(this.feedbackDuration, () => this.clearCenteredFeedback());
    this.triesUsed += 1;

    unlockWhenLeaving();
  }
}