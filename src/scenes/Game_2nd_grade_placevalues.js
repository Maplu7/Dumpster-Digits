import Phaser from "phaser";
import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { BaseMathGameScene } from "./BaseMathGameScene";

export class Game_2nd_grade_placevalues extends BaseMathGameScene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.image("dirtMushroom", "/backgroundCamps/dirtMushroom.jpeg");
  }

  buildPlaceValueProblems() {
    const allProblems = [];

    for (let n = 1; n <= 999; n++) {
      const ones = n % 10;
      const tens = Math.floor(n / 10) % 10;
      const hundreds = Math.floor(n / 100);

      allProblems.push({ answer: String(n), question: `${ones} → 1s` });
      allProblems.push({ answer: String(n), question: `${tens} → 10s` });

      if (hundreds !== 0) {
        allProblems.push({
          answer: String(n),
          question: `${hundreds} → 100s`,
        });
      }
    }

    return allProblems;
  }

pickFiveCleanPlaceValueProblems(problemPool) {
  const shuffled = Phaser.Utils.Array.Shuffle([...(problemPool || [])]);
  const selected = [];

  const usedAnswers = new Set();
  const usedCanLabels = new Set();
  const usedVisiblePlaceKeys = new Set();

  const getDigitsForAnswer = (answer) => {
    const n = Number(answer);

    return [
      `${n % 10}->1s`,
      `${Math.floor(n / 10) % 10}->10s`,
      `${Math.floor(n / 100)}->100s`,
    ];
  };

  for (const problem of shuffled) {
    if (!problem?.question || problem?.answer === undefined) continue;

    const question = String(problem.question).trim();
    const answer = String(problem.answer).trim();

    if (usedAnswers.has(answer)) continue;
    if (usedCanLabels.has(question)) continue;

    const visibleKeys = getDigitsForAnswer(answer);

    // This is the important fairness check:
    // If this trash number contains ANY digit/place combo already used
    // by another can/trash, skip it.
    const wouldCreateConfusingDuplicate = visibleKeys.some((key) =>
      usedVisiblePlaceKeys.has(key)
    );

    if (wouldCreateConfusingDuplicate) continue;

    usedAnswers.add(answer);
    usedCanLabels.add(question);
    visibleKeys.forEach((key) => usedVisiblePlaceKeys.add(key));

    selected.push({ question, answer });

    if (selected.length === 5) break;
  }

  return selected;
}

  create() {
    this.initSharedGameConfig({
      gameKey: "2nd_place_value",
      assignmentTitle: "2nd Grade Place Value",
    });

    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "dirtMushroom")
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(-100);

    this.add.image(1250, 100, "yellowTent", 0).setScale(3);
    this.add.image(200, 100, "yellowTent", 1).setScale(3);
    this.add.image(100, 300, "campBags", 3).setScale(3);
    this.add.image(1400, 200, "campChairStriped", 0).setScale(2);
    this.add.image(1480, 280, "campChairStriped", 2).setScale(2);

    this.problemsPlaceValues = this.buildPlaceValueProblems();
    this.configuredProblems = this.getConfiguredProblems(this.problemsPlaceValues);

    let selectedProblems = this.pickFiveCleanPlaceValueProblems(
      this.configuredProblems
    );

    if (selectedProblems.length < 5) {
      selectedProblems = this.pickFiveCleanPlaceValueProblems(
        this.problemsPlaceValues
      );
    }

    const trashOrder = Phaser.Utils.Array.Shuffle([...selectedProblems]);
    const canOrder = Phaser.Utils.Array.Shuffle([...selectedProblems]);

    this.trashItems = [
      new Trash(this, 550, 280, trashOrder[0]),
      new Trash(this, 650, 400, trashOrder[1]),
      new Trash(this, 750, 280, trashOrder[2]),
      new Trash(this, 850, 400, trashOrder[3]),
      new Trash(this, 950, 280, trashOrder[4]),
    ];

    this.trashCans = [
      new TrashCan(this, 100, 700, canOrder[0]).setScale(1),
      new TrashCan(this, 440, 700, canOrder[1]).setScale(1),
      new TrashCan(this, 740, 700, canOrder[2]).setScale(1),
      new TrashCan(this, 1040, 700, canOrder[3]).setScale(1),
      new TrashCan(this, 1340, 700, canOrder[4]).setScale(1),
    ];

    this.trashCans.forEach((can, i) => {
      can.index = i;
    });

    if (!this.anims.exists("raccoonFeedback")) {
      this.anims.create({
        key: "raccoonFeedback",
        frames: this.anims.generateFrameNumbers("raccoon", {
          start: 20,
          end: 27,
        }),
        frameRate: 7,
        repeat: -1,
      });
    }

    this.raccoonGroup = this.trashCans.map((can) =>
      this.add
        .sprite(can.x, can.y, "raccoon", 20)
        .setScale(4)
        .setDepth(999)
        .setVisible(false)
        .play("raccoonFeedback")
    );

    this.raccoonEmoteGroup = this.trashCans.map((can) =>
      this.add
        .sprite(can.x, can.y - 70, "heartEmote")
        .setScale(3)
        .setDepth(1000)
        .setVisible(false)
    );

    this.trashItems.forEach((trash, index) => {
      trash.problemData = trashOrder[index];

      trash.startX = trash.x;
      trash.startY = trash.y;
      trash.originalX = trash.x;
      trash.originalY = trash.y;

      trash._lockedOnCan = false;
      trash._wrongCooldown = false;
      trash._resettingHome = false;
      trash._dragging = false;
    });

    this.trashCans.forEach((can, index) => {
      can.problemData = canOrder[index];
      can.setTextScale?.(32);
    });

    this.numGuessesPerAnswer = this.trashItems.map((trash) => ({
      guessedAnswer: trash,
      numGuess: 0,
    }));

    this.numCorrect = 0;
    this.numWrong = 0;
    this.triesUsed = 0;

    this.setupGamePolish?.(this.trashItems, this.trashCans);
    this.setupUnifiedDragSystem?.(this.trashItems);

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

  labelKey(problem) {
    return String(problem?.question || "").trim();
  }

  placeValueMatches(trash, trashCan) {
    return (
      this.labelKey(trash?.problemData) ===
      this.labelKey(trashCan?.problemData)
    );
  }

  incrementWrongGuess(trash) {
    const found = this.numGuessesPerAnswer.find(
      (entry) => entry.guessedAnswer === trash
    );

    if (found) {
      found.numGuess++;
    }
  }

  putInTrash(trash, trashCan) {
    if (this.introActive) return;
    if (!trash?.active || !trashCan?.active) return;
    if (trashCan._disabled) return;

    if (trash._lockedOnCan || trash._wrongCooldown || trash._resettingHome) {
      return;
    }

    trash._lockedOnCan = true;
    trash._dragging = false;

    if (trash.body) {
      trash.body.setVelocity(0, 0);
    }

    if (this.placeValueMatches(trash, trashCan)) {
      this.playFeedbackSound?.(true);
      this.clearCenteredFeedback?.();
      this.showCenteredFeedback?.("That is Correct!", true);

      const trashCanIndex = trashCan.index;

      if (this.raccoonGroup?.[trashCanIndex]) {
        this.raccoonGroup[trashCanIndex].setVisible(true);
      }

      if (this.raccoonEmoteGroup?.[trashCanIndex]) {
        this.raccoonEmoteGroup[trashCanIndex].setVisible(true);
      }

      trashCan.markCorrect?.();
      this.popTrashCanConfetti?.(trashCan);
      this.polishCorrectAnswer?.(trashCan);

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

    this.numWrong++;
    this.triesUsed++;
    this.incrementWrongGuess(trash);

    trash._lockedOnCan = false;
    trash._wrongCooldown = true;
    trash._resettingHome = true;

    this.playFeedbackSound?.(false);
    this.clearCenteredFeedback?.();
    this.showCenteredFeedback?.("Try again!", false);

    this.raccoonWrong?.destroy();
    this.raccoonWrong = this.add
      .sprite(trashCan.x, trashCan.y, "raccoon", 20)
      .setScale(4)
      .setDepth(999);

    this.raccoonWrong.play("raccoonFeedback");

    this.wrongEmote?.destroy();
    this.wrongEmote = this.add
      .sprite(trashCan.x, trashCan.y - 70, "brokenHeartEmote")
      .setScale(3)
      .setDepth(1000);

    if (typeof trash.snapHome === "function") {
      trash.snapHome();
    } else if (typeof this.resetDraggedTrash === "function") {
      this.resetDraggedTrash(trash);
    } else {
      this.tweens.add({
        targets: trash,
        x: trash.startX,
        y: trash.startY,
        duration: 350,
        ease: "Back.easeOut",
      });
    }

    this.time.delayedCall(500, () => {
      if (!trash?.active) return;

      trash._wrongCooldown = false;
      trash._resettingHome = false;
      trash._lockedOnCan = false;

      if (trash.body) {
        trash.body.enable = true;
        trash.body.setVelocity(0, 0);
      }
    });

    this.time.delayedCall(this.feedbackDuration, () => {
      this.raccoonWrong?.destroy();
      this.wrongEmote?.destroy();
      this.clearCenteredFeedback?.();
    });
  }
}