import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { BaseMathGameScene } from "./BaseMathGameScene";

export class Game_2nd_grade_multiplication extends BaseMathGameScene {
  constructor() {
    super("Game");
  }

  create() {
    this.initSharedGameConfig({
      gameKey: "2nd_multiplication",
      assignmentTitle: "2nd Grade Multiplication",
    });

    // -----------------------------
    // CLEAN PROBLEM GENERATION
    // -----------------------------
    const problems = [];

    for (let n = 0; n <= 10; n++) {
      for (let j = 0; j <= 10; j++) {
        problems.push({
          question: `${n}×${j}`,
          answer: n * j,
        });
      }
    }

    this.problems = problems;
    this.configuredProblems = this.getConfiguredProblems(this.problems);
    this.assignFiveQuestionAndAnswerSlots(this.configuredProblems);

    // -----------------------------
    // GROUND
    // -----------------------------
    for (let i = 1; i <= 7; i++) {
      this.add.group({
        key: "dirtGround",
        repeat: 11,
        setXY: {
          x: 90,
          y: 50 + (i - 1) * 100,
          stepX: 180,
        },
        setScale: { x: 3, y: 6 },
      });
    }

    // -----------------------------
    // MUSHROOMS
    // -----------------------------
    const mushroomSpots = [
      { x: 80, y: 70 }, { x: 220, y: 140 }, { x: 420, y: 90 },
      { x: 620, y: 180 }, { x: 820, y: 70 }, { x: 1020, y: 160 },
      { x: 1220, y: 100 }, { x: 1420, y: 180 },

      { x: 150, y: 320 }, { x: 350, y: 420 }, { x: 550, y: 300 },
      { x: 760, y: 430 }, { x: 980, y: 340 }, { x: 1180, y: 420 },
      { x: 1380, y: 350 },

      { x: 100, y: 560 }, { x: 280, y: 650 }, { x: 500, y: 580 },
      { x: 700, y: 670 }, { x: 930, y: 590 }, { x: 1160, y: 660 },
      { x: 1380, y: 600 },
    ];

    mushroomSpots.forEach((spot) => {
      this.add.image(spot.x, spot.y, "mushrooms").setScale(3);
    });

    // -----------------------------
    // BACKGROUND OBJECTS
    // -----------------------------
    this.add.image(1250, 100, "greenTent", 0).setScale(3);
    this.add.image(200, 100, "greenTent", 1).setScale(3);
    this.add.image(100, 300, "campFire", 3).setScale(3);
    this.add.image(1400, 200, "campChairGreen", 0).setScale(2);
    this.add.image(1480, 280, "campChairGreen", 2).setScale(2);

    // -----------------------------
    // CANS = PROBLEMS
    // -----------------------------
    this.trashCan1 = new TrashCan(this, 100, 700, this.question1);
    this.trashCan2 = new TrashCan(this, 440, 700, this.question2);
    this.trashCan3 = new TrashCan(this, 740, 700, this.question3);
    this.trashCan4 = new TrashCan(this, 1040, 700, this.question4);
    this.trashCan5 = new TrashCan(this, 1340, 700, this.question5);

    // -----------------------------
    // TRASH = ANSWERS
    // -----------------------------
    this.trash1 = new Trash(this, 550, 280, {
      question: String(this.answer1.answer),
      answer: this.answer1.answer,
    });

    this.trash2 = new Trash(this, 650, 400, {
      question: String(this.answer2.answer),
      answer: this.answer2.answer,
    });

    this.trash3 = new Trash(this, 750, 280, {
      question: String(this.answer3.answer),
      answer: this.answer3.answer,
    });

    this.trash4 = new Trash(this, 850, 400, {
      question: String(this.answer4.answer),
      answer: this.answer4.answer,
    });

    this.trash5 = new Trash(this, 950, 280, {
      question: String(this.answer5.answer),
      answer: this.answer5.answer,
    });

    // -----------------------------
    // STATE FLAGS (IMPORTANT)
    // -----------------------------
    [
      this.trash1,
      this.trash2,
      this.trash3,
      this.trash4,
      this.trash5,
    ].forEach((trash) => {
      trash.startX = trash.x;
      trash.startY = trash.y;
      trash.originalX = trash.x;
      trash.originalY = trash.y;
      trash._lockedOnCan = false;
      trash._dragging = false;
      trash._wrongCooldown = false;
      trash._resettingHome = false;
    });

    // -----------------------------
    // TRACKING
    // -----------------------------
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

    // -----------------------------
    // PHYSICS
    // -----------------------------
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

  incrementWrongGuess(trash) {
    if (trash === this.trash1) this.numGuessesPerAnswer[0].numGuess++;
    else if (trash === this.trash2) this.numGuessesPerAnswer[1].numGuess++;
    else if (trash === this.trash3) this.numGuessesPerAnswer[2].numGuess++;
    else if (trash === this.trash4) this.numGuessesPerAnswer[3].numGuess++;
    else if (trash === this.trash5) this.numGuessesPerAnswer[4].numGuess++;
  }

  putInTrash(trash, trashCan) {
    if (this.introActive) return;
    if (!trash?.active || !trashCan?.active) return;
    if (trashCan._disabled) return;
    if (trash._lockedOnCan || trash._wrongCooldown || trash._resettingHome) return;

    trash._lockedOnCan = true;

    if (trash.body) {
      trash.body.setVelocity(0, 0);
    }

    // ✅ CORRECT
    if (trash.answer === trashCan.answer) {
      this.playFeedbackSound(true);
      this.clearCenteredFeedback();
      this.showCenteredFeedback("That is Correct!", true);
      this.showRaccoonFeedback?.(trashCan, true);

      trashCan.markCorrect?.();
      this.popTrashCanConfetti?.(trashCan);

      trash.destroy();
      trashCan.destroy();

      this.numCorrect++;

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

    // ❌ WRONG
    this.numWrong++;
    this.triesUsed++;
    this.incrementWrongGuess(trash);

    trash._wrongCooldown = true;
    trash._resettingHome = true;
    trash._lockedOnCan = false;

    this.playFeedbackSound(false);
    this.clearCenteredFeedback();
    this.showCenteredFeedback("Try again!", false);
    this.showRaccoonFeedback?.(trashCan, false);

    trash.snapHome?.() || this.resetDraggedTrash?.(trash);

    this.time.delayedCall(500, () => {
      if (!trash?.active) return;

      trash._wrongCooldown = false;
      trash._resettingHome = false;

      if (trash.body) {
        trash.body.enable = true;
        trash.body.setVelocity(0, 0);
      }
    });

    this.time.delayedCall(this.feedbackDuration, () => {
      this.clearCenteredFeedback();
    });
  }
}