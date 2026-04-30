import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { BaseMathGameScene } from "./BaseMathGameScene";

export class Game_1st_grade_subtraction extends BaseMathGameScene {
  constructor() {
    super("Game");
  }

  create() {
    this.initSharedGameConfig({
      gameKey: "1st_subtraction",
      assignmentTitle: "1st Grade Subtraction",
    });

    const problems = [];

    for (let n = 10; n >= 1; n--) {
      for (let j = 0; j <= n; j++) {
        problems.push({
          question: `${n}-${j}`,
          answer: n - j,
        });
      }
    }

    this.allProblems = problems;
    this.configuredProblems = this.getConfiguredProblems(this.allProblems);
    this.assignFiveQuestionAndAnswerSlots(this.configuredProblems);

    for (let i = 1; i <= 7; i++) {
      const y = 50 + (i - 1) * 100;

      this[`campGroundRow${i}`] = this.add.group({
        key: "dirtGround",
        repeat: 11,
        setXY: {
          x: 90,
          y,
          stepX: 180,
        },
        setScale: {
          x: 3,
          y: 6,
        },
      });
    }

    this.add.image(1250, 100, "greenTent", 0).setScale(3);
    this.add.image(200, 100, "greenTent", 1).setScale(3);
    this.add.image(100, 300, "horizontalLog", 3).setScale(3);
    this.add.image(1400, 200, "horizontalLog", 0).setScale(2);
    this.add.image(1480, 280, "verticalLog", 2).setScale(2);

    this.trashCan1 = new TrashCan(this, 100, 700, this.question1).setScale(1);
    this.trashCan2 = new TrashCan(this, 440, 700, this.question2).setScale(1);
    this.trashCan3 = new TrashCan(this, 740, 700, this.question3).setScale(1);
    this.trashCan4 = new TrashCan(this, 1040, 700, this.question4).setScale(1);
    this.trashCan5 = new TrashCan(this, 1340, 700, this.question5).setScale(1);

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

      this.makeTrashEasyToGrab(trash);
    });

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
  makeTrashEasyToGrab(trash) {
  if (!trash || !trash.active) return;

  if (typeof trash.makeTrashInteractive === "function") {
    trash.makeTrashInteractive();
    return;
  }

  trash.setInteractive();
  this.input.setDraggable(trash);
}

  incrementWrongGuess(trash) {
    if (trash === this.trash1) this.numGuessesPerAnswer[0].numGuess += 1;
    else if (trash === this.trash2) this.numGuessesPerAnswer[1].numGuess += 1;
    else if (trash === this.trash3) this.numGuessesPerAnswer[2].numGuess += 1;
    else if (trash === this.trash4) this.numGuessesPerAnswer[3].numGuess += 1;
    else if (trash === this.trash5) this.numGuessesPerAnswer[4].numGuess += 1;
  }

  smoothResetTrash(trash) {
    if (!trash || !trash.active) return;

    const resetX = trash.startX ?? trash.originalX ?? trash.x;
    const resetY = trash.startY ?? trash.originalY ?? trash.y;

    trash._lockedOnCan = false;
    trash._dragging = false;
    trash._wrongCooldown = true;
    trash._resettingHome = true;

    this.tweens.killTweensOf(trash);

    if (trash.body) {
      trash.body.enable = false;
      trash.body.setVelocity(0, 0);
    }

    trash.disableInteractive();

    this.tweens.add({
      targets: trash,
      x: resetX,
      y: resetY,
      angle: 0,
      duration: 320,
      ease: "Back.easeOut",
      onComplete: () => {
        if (!trash || !trash.active) return;

        trash.setPosition(resetX, resetY);
        trash.setAngle?.(0);
        trash.setAlpha?.(1);

        if (trash.trashMath) {
          trash.trashMath.clearTint?.();
        }

        if (trash.body) {
          trash.body.enable = true;
          trash.body.reset(resetX, resetY);
          trash.body.setVelocity(0, 0);
        }

        trash._lockedOnCan = false;
        trash._dragging = false;

        this.time.delayedCall(120, () => {
          if (!trash || !trash.active) return;

          trash._wrongCooldown = false;
          trash._resettingHome = false;
          this.makeTrashEasyToGrab(trash);
        });
      },
    });
  }

  putInTrash(trash, trashCan) {
    if (this.introActive) return;
    if (!trash || !trash.active) return;
    if (!trashCan || !trashCan.active) return;
    if (trashCan._disabled) return;

    if (trash._lockedOnCan) return;
    if (trash._wrongCooldown) return;
    if (trash._resettingHome) return;

    trash._lockedOnCan = true;

    if (trash.body) {
      trash.body.setVelocity(0, 0);
    }

    if (trash.answer === trashCan.answer) {
      this.playFeedbackSound(true);
      this.clearCenteredFeedback();
      this.showCenteredFeedback("That is Correct!", true);
      this.showRaccoonFeedback?.(trashCan, true);

      trashCan.markCorrect?.();
      this.popTrashCanConfetti?.(trashCan);

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
    this.triesUsed += 1;
    this.incrementWrongGuess(trash);

    this.playFeedbackSound(false);
    this.clearCenteredFeedback();
    this.showCenteredFeedback("Try again!", false);
    this.showRaccoonFeedback?.(trashCan, false);

    this.smoothResetTrash(trash);

    this.time.delayedCall(this.feedbackDuration, () => {
      this.clearCenteredFeedback();
    });
  }
}