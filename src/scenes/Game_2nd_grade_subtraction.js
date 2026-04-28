import Phaser from "phaser";
import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { BaseMathGameScene } from "./BaseMathGameScene";

export class Game_2nd_grade_subtraction extends BaseMathGameScene {
  constructor() {
    super("Game");
  }

  buildSubtractionProblems(topNumber) {
    return Array.from({ length: topNumber + 1 }, (_, i) => ({
      question: `${topNumber}-${i}`,
      answer: topNumber - i,
    }));
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
      gameKey: "2nd_subtraction",
      assignmentTitle: "2nd Grade Subtraction",
    });

    this.problems1 = this.buildSubtractionProblems(1);
    this.problems2 = this.buildSubtractionProblems(2);
    this.problems3 = this.buildSubtractionProblems(3);
    this.problems4 = this.buildSubtractionProblems(4);
    this.problems5 = this.buildSubtractionProblems(5);
    this.problems6 = this.buildSubtractionProblems(6);
    this.problems7 = this.buildSubtractionProblems(7);
    this.problems8 = this.buildSubtractionProblems(8);
    this.problems9 = this.buildSubtractionProblems(9);
    this.problems10 = this.buildSubtractionProblems(10);

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

    this.configuredProblems = this.getConfiguredProblems(this.problems);
    const selectedProblems = this.pickFiveUniqueAnswerProblems(
      this.configuredProblems
    );
    this.assignFiveQuestionAndAnswerSlots(selectedProblems);

    for (let i = 1; i <= 7; i++) {
      const y = 50 + (i - 1) * 100;

      this[`campGroundRow${i}`] = this.add.group({
        key: "dirtGround",
        repeat: 11,
        setXY: { x: 90, y: y, stepX: 180 },
        setScale: { x: 3, y: 6 },
      });
    }

    const cloverSpots = [
      { x: 80, y: 70 },
      { x: 220, y: 140 },
      { x: 420, y: 90 },
      { x: 620, y: 180 },
      { x: 820, y: 70 },
      { x: 1020, y: 160 },
      { x: 1220, y: 100 },
      { x: 1420, y: 180 },

      { x: 150, y: 320 },
      { x: 350, y: 420 },
      { x: 550, y: 300 },
      { x: 760, y: 430 },
      { x: 980, y: 340 },
      { x: 1180, y: 420 },
      { x: 1380, y: 350 },

      { x: 100, y: 560 },
      { x: 280, y: 650 },
      { x: 500, y: 580 },
      { x: 700, y: 670 },
      { x: 930, y: 590 },
      { x: 1160, y: 660 },
      { x: 1380, y: 600 }
    ];

    cloverSpots.forEach(spot => {
      this.add.image(spot.x, spot.y, "clovers").setScale(3);
    });

    this.add.image(1250, 100, "greenTent", 0).setScale(3);
    this.add.image(200, 100, "greenTent", 1).setScale(3);
    this.add.image(100, 300, "campFire", 3).setScale(3);
    this.add.image(1400, 200, "campChairGreen", 0).setScale(2);
    this.add.image(1480, 280, "campChairGreen", 2).setScale(2);

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

    this.trashGroup = this.physics.add.group();
    this.trashGroup.add(this.trash1);
    this.trashGroup.add(this.trash2);
    this.trashGroup.add(this.trash3);
    this.trashGroup.add(this.trash4);
    this.trashGroup.add(this.trash5);

    this.trashCanGroup = this.physics.add.group();
    this.trashCanGroup.add(this.trashCan1);
    this.trashCanGroup.add(this.trashCan2);
    this.trashCanGroup.add(this.trashCan3);
    this.trashCanGroup.add(this.trashCan4);
    this.trashCanGroup.add(this.trashCan5);

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
        this.time.delayedCall(
          this.feedbackDuration + 250,
          this.onFinish,
          [],
          this
        );
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

    this.playFeedbackSound(false);
    this.clearCenteredFeedback();
    this.showCenteredFeedback("Try again!", false);

    this.time.delayedCall(
      this.feedbackDuration,
      () => this.clearCenteredFeedback()
    );
    this.triesUsed += 1;

    unlockWhenLeaving();
  }
}