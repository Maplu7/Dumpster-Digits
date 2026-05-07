import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { BaseMathGameScene } from "./BaseMathGameScene";

export class Game_2nd_grade_division extends BaseMathGameScene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.image("campMushroom", "/backgroundCamps/campMushroom.jpeg");
  }

  create() {
    this.initSharedGameConfig({
      gameKey: "2nd_division",
      assignmentTitle: "2nd Grade Division",
    });

    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "campMushroom")
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(-100);

    const problems = [];

    for (let divisor = 1; divisor <= 10; divisor++) {
      for (let quotient = 0; quotient <= 10; quotient++) {
        const dividend = divisor * quotient;

        if (dividend <= 100) {
          problems.push({
            question: `${dividend} ÷ ${divisor}`,
            answer: quotient,
          });
        }
      }
    }

    this.problems = problems;
    this.configuredProblems = this.getConfiguredProblems(this.problems);
    this.assignFiveQuestionAndAnswerSlots(this.configuredProblems);

    this.add.image(1250, 100, "greenTent", 0).setScale(3);
    this.add.image(200, 100, "greenTent", 1).setScale(3);
    this.add.image(100, 300, "campFire", 3).setScale(3);
    this.add.image(1400, 200, "campChairGreen", 0).setScale(2);
    this.add.image(1480, 280, "campChairGreen", 2).setScale(2);

    this.trashCan1 = new TrashCan(this, 100, 700, this.question1).setScale(1);
    this.trashCan2 = new TrashCan(this, 440, 700, this.question2).setScale(1);
    this.trashCan3 = new TrashCan(this, 740, 700, this.question3).setScale(1);
    this.trashCan4 = new TrashCan(this, 1040, 700, this.question4).setScale(1);
    this.trashCan5 = new TrashCan(this, 1340, 700, this.question5).setScale(1);

    // -----------------------------
    // RACCOONS + EMOTES
    // -----------------------------
    this.trashCan1.index = 0;
    this.trashCan2.index = 1;
    this.trashCan3.index = 2;
    this.trashCan4.index = 3;
    this.trashCan5.index = 4;

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

    this.raccoonGroup = [
      this.add.sprite(this.trashCan1.x, this.trashCan1.y, "raccoon", 20),
      this.add.sprite(this.trashCan2.x, this.trashCan2.y, "raccoon", 20),
      this.add.sprite(this.trashCan3.x, this.trashCan3.y, "raccoon", 20),
      this.add.sprite(this.trashCan4.x, this.trashCan4.y, "raccoon", 20),
      this.add.sprite(this.trashCan5.x, this.trashCan5.y, "raccoon", 20),
    ];

    this.raccoonGroup.forEach((raccoon) => {
      raccoon
        .setScale(4)
        .setDepth(999)
        .setVisible(false)
        .play("raccoonFeedback");
    });

    this.raccoonEmoteGroup = [
      this.add.sprite(this.trashCan1.x, this.trashCan1.y - 70, "heartEmote"),
      this.add.sprite(this.trashCan2.x, this.trashCan2.y - 70, "heartEmote"),
      this.add.sprite(this.trashCan3.x, this.trashCan3.y - 70, "heartEmote"),
      this.add.sprite(this.trashCan4.x, this.trashCan4.y - 70, "heartEmote"),
      this.add.sprite(this.trashCan5.x, this.trashCan5.y - 70, "heartEmote"),
    ];

    this.raccoonEmoteGroup.forEach((emote) => {
      emote.setScale(3).setDepth(1000).setVisible(false);
    });
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

  incrementWrongGuess(trash) {
    const found = this.numGuessesPerAnswer.find(
      (entry) => entry.guessedAnswer === trash
    );
    if (found) found.numGuess++;
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

    if (Number(trash.answer) === Number(trashCan.answer)) {
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