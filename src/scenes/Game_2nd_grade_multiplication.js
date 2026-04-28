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

    for (let i = 1; i <= 7; i++) {
      this.add.group({
        key: "camp",
        repeat: 11,
        setXY: {
          x: 90,
          y: 50 + (i - 1) * 100,
          stepX: 180,
        },
        setScale: {
          x: 3,
          y: 6,
        },
      });
    }

    this.add.image(1250, 100, "yellowTent", 0).setScale(3);
    this.add.image(200, 100, "yellowTent", 1).setScale(3);
    this.add.image(100, 300, "campFire", 3).setScale(3);
    this.add.image(1400, 200, "campChairGreen", 0).setScale(2);
    this.add.image(1480, 280, "campChairGreen", 2).setScale(2);

    this.trashItems = [
      new Trash(this, 550, 280, this.question1),
      new Trash(this, 650, 400, this.question2),
      new Trash(this, 750, 280, this.question3),
      new Trash(this, 850, 400, this.question4),
      new Trash(this, 950, 280, this.question5),
    ];

    this.trashCans = [
      new TrashCan(this, 100, 700, this.answer1).setScale(1),
      new TrashCan(this, 440, 700, this.answer2).setScale(1),
      new TrashCan(this, 740, 700, this.answer3).setScale(1),
      new TrashCan(this, 1040, 700, this.answer4).setScale(1),
      new TrashCan(this, 1340, 700, this.answer5).setScale(1),
    ];

    this.numGuessesPerAnswer = this.trashItems.map((trash) => ({
      guessedAnswer: trash,
      numGuess: 0,
    }));

    this.numCorrect = 0;
    this.numWrong = 0;
    this.triesUsed = 0;

    this.setupGamePolish(this.trashItems, this.trashCans);
    this.setupUnifiedDragSystem(this.trashItems);

    this.trashGroup = this.physics.add.group(this.trashItems);
    this.trashCanGroup = this.physics.add.group(this.trashCans);

    this.physics.add.overlap(
      this.trashGroup,
      this.trashCanGroup,
      this.putInTrash,
      null,
      this
    );
  }

  incrementWrongGuess(trash) {
    const index = this.trashItems.findIndex((item) => item === trash);

    if (index >= 0 && this.numGuessesPerAnswer[index]) {
      this.numGuessesPerAnswer[index].numGuess += 1;
    }
  }

  putInTrash(trash, trashCan) {
    if (this.introActive) return;
    if (!trash?.active || !trashCan?.active) return;
    if (trashCan._disabled) return;
    if (trash._lockedOnCan) return;

    trash._lockedOnCan = true;
    trash._dragging = false;

    if (trash.body) {
      trash.body.setVelocity(0, 0);
    }

    if (trash.answer === trashCan.answer) {
      this.playFeedbackSound(true);
      this.clearCenteredFeedback();
      this.showCenteredFeedback("That is Correct!", true);
      this.showRaccoonFeedback(trashCan, true);

      trashCan.markCorrect?.();
      this.popTrashCanConfetti(trashCan);
      this.polishCorrectAnswer(trashCan);

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
    this.showRaccoonFeedback(trashCan, false);

    this.time.delayedCall(this.feedbackDuration, () => {
      this.clearCenteredFeedback();
    });

    this.polishWrongAnswer(trash);
  }
}