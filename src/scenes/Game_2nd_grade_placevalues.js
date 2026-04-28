import Phaser from "phaser";
import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { BaseMathGameScene } from "./BaseMathGameScene";

export class Game_2nd_grade_placevalues extends BaseMathGameScene {
  constructor() {
    super("Game");
  }

  buildPlaceValueProblems() {
    const allProblems = [];

    for (let n = 1; n <= 999; n++) {
      const ones = n % 10;
      const tens = Math.floor(n / 10) % 10;
      const hundreds = Math.floor(n / 100);

      allProblems.push({
        answer: n,
        question: `${ones} → 1s`,
      });

      allProblems.push({
        answer: n,
        question: `${tens} → 10s`,
      });

      if (hundreds > 0) {
        allProblems.push({
          answer: n,
          question: `${hundreds} → 100s`,
        });
      }
    }

    return allProblems;
  }

  pickFiveProblemsAllowingDuplicateLabels(problemPool) {
    const safePool = Array.isArray(problemPool) ? problemPool : [];
    const shuffled = Phaser.Utils.Array.Shuffle([...safePool]);
    const selected = [];
    const usedExactProblems = new Set();

    for (const problem of shuffled) {
      if (!problem) continue;

      const key = `${problem.question}::${problem.answer}`;
      if (usedExactProblems.has(key)) continue;

      usedExactProblems.add(key);
      selected.push(problem);

      if (selected.length === 5) break;
    }

    if (selected.length === 0) {
      console.warn("[Place Value] No problems found.");
      return [];
    }

    while (selected.length < 5) {
      const clone = selected[selected.length % selected.length];

      selected.push({
        ...clone,
        __duplicateSlot: true,
      });
    }

    return selected.slice(0, 5);
  }

  assignPlaceValueSlots(selectedProblems) {
    const trashOrder = Phaser.Utils.Array.Shuffle([...selectedProblems]);
    const canOrder = Phaser.Utils.Array.Shuffle([...selectedProblems]);

    [
      this.trashProblem1,
      this.trashProblem2,
      this.trashProblem3,
      this.trashProblem4,
      this.trashProblem5,
    ] = trashOrder;

    [
      this.canProblem1,
      this.canProblem2,
      this.canProblem3,
      this.canProblem4,
      this.canProblem5,
    ] = canOrder;
  }

  create() {
    this.initSharedGameConfig({
      gameKey: "2nd_place_value",
      assignmentTitle: "2nd Grade Place Value",
    });

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

    this.add.image(1250, 100, "yellowTent", 0).setScale(3);
    this.add.image(200, 100, "yellowTent", 1).setScale(3);
    this.add.image(100, 300, "campBags", 3).setScale(3);
    this.add.image(1400, 200, "campChairStriped", 0).setScale(2);
    this.add.image(1480, 280, "campChairStriped", 2).setScale(2);

    this.problemsPlaceValues = this.buildPlaceValueProblems();
    this.configuredProblems = this.getConfiguredProblems(
      this.problemsPlaceValues
    );

    const selectedProblems = this.pickFiveProblemsAllowingDuplicateLabels(
      this.configuredProblems
    );

    this.assignPlaceValueSlots(selectedProblems);

    this.trashItems = [
      new Trash(this, 550, 280, this.trashProblem1),
      new Trash(this, 650, 400, this.trashProblem2),
      new Trash(this, 750, 280, this.trashProblem3),
      new Trash(this, 850, 400, this.trashProblem4),
      new Trash(this, 950, 280, this.trashProblem5),
    ];

    this.trashCans = [
      new TrashCan(this, 100, 700, this.canProblem1).setScale(1),
      new TrashCan(this, 440, 700, this.canProblem2).setScale(1),
      new TrashCan(this, 740, 700, this.canProblem3).setScale(1),
      new TrashCan(this, 1040, 700, this.canProblem4).setScale(1),
      new TrashCan(this, 1340, 700, this.canProblem5).setScale(1),
    ];

    this.trashItems.forEach((trash, index) => {
      trash.problemData = selectedProblems[index];
      trash.startX = trash.x;
      trash.startY = trash.y;
      trash.originalX = trash.x;
      trash.originalY = trash.y;
      trash._lockedOnCan = false;
      trash._dragging = false;
    });

    const canProblems = [
      this.canProblem1,
      this.canProblem2,
      this.canProblem3,
      this.canProblem4,
      this.canProblem5,
    ];

    this.trashCans.forEach((can, index) => {
      can.problemData = canProblems[index];
      can.setTextScale?.(20);
    });

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

  problemMatches(trash, trashCan) {
    const trashLabel = String(trash?.problemData?.question || "").trim();
    const canLabel = String(trashCan?.problemData?.question || "").trim();

    return Boolean(trashLabel && canLabel && trashLabel === canLabel);
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

    if (this.problemMatches(trash, trashCan)) {
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