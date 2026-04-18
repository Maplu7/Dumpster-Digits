import Phaser from "phaser";
import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { BaseMathGameScene } from "./BaseMathGameScene";

export class Game_2nd_grade_fillInTheBlank extends BaseMathGameScene {
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
      gameKey: "2nd_fill_blank",
      assignmentTitle: "2nd Grade Fill in the Blank",
    });

    this.problems1 = [
      { question: "1+__=1", answer: 0 },
      { question: "1+__=2", answer: 1 },
      { question: "1+__=3", answer: 2 },
      { question: "1+__=4", answer: 3 },
      { question: "1+__=5", answer: 4 },
      { question: "1+__=6", answer: 5 },
      { question: "1+__=7", answer: 6 },
      { question: "1+__=8", answer: 7 },
      { question: "1+__=9", answer: 8 },
      { question: "1+__=10", answer: 9 },
      { question: "1+__=11", answer: 10 },
    ];

    this.problems2 = [
      { question: "2+__=2", answer: 0 },
      { question: "2+__=3", answer: 1 },
      { question: "2+__=4", answer: 2 },
      { question: "2+__=5", answer: 3 },
      { question: "2+__=6", answer: 4 },
      { question: "2+__=7", answer: 5 },
      { question: "2+__=8", answer: 6 },
      { question: "2+__=9", answer: 7 },
      { question: "2+__=10", answer: 8 },
      { question: "2+__=11", answer: 9 },
      { question: "2+__=12", answer: 10 },
    ];

    this.problems3 = [
      { question: "3+__=3", answer: 0 },
      { question: "3+__=4", answer: 1 },
      { question: "3+__=5", answer: 2 },
      { question: "3+__=6", answer: 3 },
      { question: "3+__=7", answer: 4 },
      { question: "3+__=8", answer: 5 },
      { question: "3+__=9", answer: 6 },
      { question: "3+__=10", answer: 7 },
      { question: "3+__=11", answer: 8 },
      { question: "3+__=12", answer: 9 },
      { question: "3+__=13", answer: 10 },
    ];

    this.problems4 = [
      { question: "4+__=4", answer: 0 },
      { question: "4+__=5", answer: 1 },
      { question: "4+__=6", answer: 2 },
      { question: "4+__=7", answer: 3 },
      { question: "4+__=8", answer: 4 },
      { question: "4+__=9", answer: 5 },
      { question: "4+__=10", answer: 6 },
      { question: "4+__=11", answer: 7 },
      { question: "4+__=12", answer: 8 },
      { question: "4+__=13", answer: 9 },
      { question: "4+__=14", answer: 10 },
    ];

    this.problems5 = [
      { question: "5+__=5", answer: 0 },
      { question: "5+__=6", answer: 1 },
      { question: "5+__=7", answer: 2 },
      { question: "5+__=8", answer: 3 },
      { question: "5+__=9", answer: 4 },
      { question: "5+__=10", answer: 5 },
      { question: "5+__=11", answer: 6 },
      { question: "5+__=12", answer: 7 },
      { question: "5+__=13", answer: 8 },
      { question: "5+__=14", answer: 9 },
      { question: "5+__=15", answer: 10 },
    ];

    this.problems6 = [
      { question: "6+__=6", answer: 0 },
      { question: "6+__=7", answer: 1 },
      { question: "6+__=8", answer: 2 },
      { question: "6+__=9", answer: 3 },
      { question: "6+__=10", answer: 4 },
      { question: "6+__=11", answer: 5 },
      { question: "6+__=12", answer: 6 },
      { question: "6+__=13", answer: 7 },
      { question: "6+__=14", answer: 8 },
      { question: "6+__=15", answer: 9 },
      { question: "6+__=16", answer: 10 },
    ];

    this.problems7 = [
      { question: "7+__=7", answer: 0 },
      { question: "7+__=8", answer: 1 },
      { question: "7+__=9", answer: 2 },
      { question: "7+__=10", answer: 3 },
      { question: "7+__=11", answer: 4 },
      { question: "7+__=12", answer: 5 },
      { question: "7+__=13", answer: 6 },
      { question: "7+__=14", answer: 7 },
      { question: "7+__=15", answer: 8 },
      { question: "7+__=16", answer: 9 },
      { question: "7+__=17", answer: 10 },
    ];

    this.problems8 = [
      { question: "8+__=8", answer: 0 },
      { question: "8+__=9", answer: 1 },
      { question: "8+__=10", answer: 2 },
      { question: "8+__=11", answer: 3 },
      { question: "8+__=12", answer: 4 },
      { question: "8+__=13", answer: 5 },
      { question: "8+__=14", answer: 6 },
      { question: "8+__=15", answer: 7 },
      { question: "8+__=16", answer: 8 },
      { question: "8+__=17", answer: 9 },
      { question: "8+__=18", answer: 10 },
    ];

    this.problems9 = [
      { question: "9+__=9", answer: 0 },
      { question: "9+__=10", answer: 1 },
      { question: "9+__=11", answer: 2 },
      { question: "9+__=12", answer: 3 },
      { question: "9+__=13", answer: 4 },
      { question: "9+__=14", answer: 5 },
      { question: "9+__=15", answer: 6 },
      { question: "9+__=16", answer: 7 },
      { question: "9+__=17", answer: 8 },
      { question: "9+__=18", answer: 9 },
      { question: "9+__=19", answer: 10 },
    ];

    this.problems10 = [
      { question: "10+__=10", answer: 0 },
      { question: "10+__=11", answer: 1 },
      { question: "10+__=12", answer: 2 },
      { question: "10+__=13", answer: 3 },
      { question: "10+__=14", answer: 4 },
      { question: "10+__=15", answer: 5 },
      { question: "10+__=16", answer: 6 },
      { question: "10+__=17", answer: 7 },
      { question: "10+__=18", answer: 8 },
      { question: "10+__=19", answer: 9 },
      { question: "10+__=20", answer: 10 },
    ];

    this.problems = [
      ...this.problems1,
      ...this.problems2,
      ...this.problems3,
      ...this.problems4,
      ...this.problems5,
      ...this.problems6,
      ...this.problems7,
      ...this.problems8,
      ...this.problems9,
      ...this.problems10,
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

        if (trash && trash.active && trash.trashMath && !trash._dragging) {
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

      if (trashCan.markCorrect) trashCan.markCorrect();

      trash.destroy();
      trashCan.destroy();

      this.numCorrect += 1;
      this.time.delayedCall(this.feedbackDuration, this.onCorrect, [], this);

      if (this.numCorrect === 5) {
        this.time.delayedCall(this.feedbackDuration + 250, this.onFinish, [], this);
      }

      return;
    }

    this.numWrong += 1;

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