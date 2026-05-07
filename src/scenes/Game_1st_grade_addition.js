import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { BaseMathGameScene } from "./BaseMathGameScene";

export class Game_1st_grade_addition extends BaseMathGameScene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.image("campClover", "/backgroundCamps/campClover.jpeg");
  }

  create() {
    this.initSharedGameConfig({
      gameKey: "1st_addition",
      assignmentTitle: "1st Grade Addition",
    });

    this.add
      .image(this.scale.width / 2, this.scale.height / 2, "campClover")
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(-100);

    function additionProblems() {
      const allProblems = [];

      for (let n = 0; n <= 10; n++) {
        for (let j = 0; j <= 10; j++) {
          allProblems.push({
            question: `${n}+${j}`,
            answer: n + j,
          });
        }
      }

      return allProblems;
    }

    this.allProblems = additionProblems();
    this.configuredProblems = this.getConfiguredProblems(this.allProblems);
    this.assignFiveQuestionAndAnswerSlots(this.configuredProblems);

    this.add.image(1250, 100, "yellowTent", 0).setScale(3);
    this.add.image(200, 100, "yellowTent", 1).setScale(3);
    this.add.image(100, 300, "campFire", 3).setScale(3);
    this.add.image(1400, 200, "campChairGreen", 0).setScale(2);
    this.add.image(1480, 280, "campChairGreen", 2).setScale(2);

    this.trashCan1 = new TrashCan(this, 100, 700, this.question1).setScale(1);
    this.trashCan2 = new TrashCan(this, 440, 700, this.question2).setScale(1);
    this.trashCan3 = new TrashCan(this, 740, 700, this.question3).setScale(1);
    this.trashCan4 = new TrashCan(this, 1040, 700, this.question4).setScale(1);
    this.trashCan5 = new TrashCan(this, 1340, 700, this.question5).setScale(1);

    // ---------------------------------------------------------------------
    // Synced raccoons: one hidden raccoon is locked to each trash can
    // ---------------------------------------------------------------------
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

    this.raccoon1 = this.add
      .sprite(this.trashCan1.x, this.trashCan1.y, "raccoon", 20)
      .setScale(4)
      .setDepth(999)
      .setVisible(false);

    this.raccoon2 = this.add
      .sprite(this.trashCan2.x, this.trashCan2.y, "raccoon", 20)
      .setScale(4)
      .setDepth(999)
      .setVisible(false);

    this.raccoon3 = this.add
      .sprite(this.trashCan3.x, this.trashCan3.y, "raccoon", 20)
      .setScale(4)
      .setDepth(999)
      .setVisible(false);

    this.raccoon4 = this.add
      .sprite(this.trashCan4.x, this.trashCan4.y, "raccoon", 20)
      .setScale(4)
      .setDepth(999)
      .setVisible(false);

    this.raccoon5 = this.add
      .sprite(this.trashCan5.x, this.trashCan5.y, "raccoon", 20)
      .setScale(4)
      .setDepth(999)
      .setVisible(false);

    this.raccoonGroup = [
      this.raccoon1,
      this.raccoon2,
      this.raccoon3,
      this.raccoon4,
      this.raccoon5,
    ];

    this.raccoonGroup.forEach((raccoon) => {
      raccoon.play("raccoonFeedback");
    });

    // ---------------------------------------------------
// Emotes above raccoons
// ---------------------------------------------------

this.raccoonEmote1 = this.add
  .sprite(this.trashCan1.x, this.trashCan1.y - 70, "heartEmote")
  .setScale(3)
  .setDepth(1000)
  .setVisible(false);

this.raccoonEmote2 = this.add
  .sprite(this.trashCan2.x, this.trashCan2.y - 70, "heartEmote")
  .setScale(3)
  .setDepth(1000)
  .setVisible(false);

this.raccoonEmote3 = this.add
  .sprite(this.trashCan3.x, this.trashCan3.y - 70, "heartEmote")
  .setScale(3)
  .setDepth(1000)
  .setVisible(false);

this.raccoonEmote4 = this.add
  .sprite(this.trashCan4.x, this.trashCan4.y - 70, "heartEmote")
  .setScale(3)
  .setDepth(1000)
  .setVisible(false);

this.raccoonEmote5 = this.add
  .sprite(this.trashCan5.x, this.trashCan5.y - 70, "heartEmote")
  .setScale(3)
  .setDepth(1000)
  .setVisible(false);

this.raccoonEmoteGroup = [
  this.raccoonEmote1,
  this.raccoonEmote2,
  this.raccoonEmote3,
  this.raccoonEmote4,
  this.raccoonEmote5,
];
    // ---------------------------------------------------------------------

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

  incrementWrongGuess(trash) {
    if (trash === this.trash1) this.numGuessesPerAnswer[0].numGuess += 1;
    else if (trash === this.trash2) this.numGuessesPerAnswer[1].numGuess += 1;
    else if (trash === this.trash3) this.numGuessesPerAnswer[2].numGuess += 1;
    else if (trash === this.trash4) this.numGuessesPerAnswer[3].numGuess += 1;
    else if (trash === this.trash5) this.numGuessesPerAnswer[4].numGuess += 1;
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

    const trashCanIndex = trashCan.index;

    if (this.raccoonGroup && this.raccoonGroup[trashCanIndex]) {
      this.raccoonGroup[trashCanIndex].setVisible(true);
    }

    // ✅ show heart emote above the matching raccoon
    if (this.raccoonEmoteGroup && this.raccoonEmoteGroup[trashCanIndex]) {
      this.raccoonEmoteGroup[trashCanIndex].setVisible(true);
    }

    trashCan.markCorrect?.();
    this.popTrashCanConfetti(trashCan);

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

// ✅ temporary wrong raccoon
this.raccoonWrong?.destroy();
this.raccoonWrong = this.add
  .sprite(trashCan.x, trashCan.y, "raccoon", 20)
  .setScale(4)
  .setDepth(999);

this.raccoonWrong.play("raccoonFeedback");

// ✅ broken heart emote
this.wrongEmote?.destroy();
this.wrongEmote = this.add
  .sprite(trashCan.x, trashCan.y - 70, "brokenHeartEmote")
  .setScale(3)
  .setDepth(1000);

this.time.delayedCall(this.feedbackDuration, () => {
  this.raccoonWrong?.destroy();
  this.wrongEmote?.destroy();
  this.clearCenteredFeedback();
});

trash._lockedOnCan = false;
trash.snapHome();
  }
}