import Phaser from "phaser";
import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { BaseMathGameScene } from "./BaseMathGameScene";

export class Game_2nd_grade_addition extends BaseMathGameScene {
  constructor() {
    super("Game");
  }

  buildAdditionProblems(topNumber) {
    return Array.from({ length: 11 }, (_, i) => ({
      question: `${topNumber}+${i}`,
      answer: topNumber + i,
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
      gameKey: "2nd_addition",
      assignmentTitle: "2nd Grade Addition",
    });

    this.problems1 = this.buildAdditionProblems(1);
    this.problems2 = this.buildAdditionProblems(2);
    this.problems3 = this.buildAdditionProblems(3);
    this.problems4 = this.buildAdditionProblems(4);
    this.problems5 = this.buildAdditionProblems(5);
    this.problems6 = this.buildAdditionProblems(6);
    this.problems7 = this.buildAdditionProblems(7);
    this.problems8 = this.buildAdditionProblems(8);
    this.problems9 = this.buildAdditionProblems(9);
    this.problems10 = this.buildAdditionProblems(10);
    this.problems11 = this.buildAdditionProblems(11);
    this.problems12 = this.buildAdditionProblems(12);
    this.problems13 = this.buildAdditionProblems(13);
    this.problems14 = this.buildAdditionProblems(14);
    this.problems15 = this.buildAdditionProblems(15);
    this.problems16 = this.buildAdditionProblems(16);
    this.problems17 = this.buildAdditionProblems(17);
    this.problems18 = this.buildAdditionProblems(18);
    this.problems19 = this.buildAdditionProblems(19);
    this.problems20 = this.buildAdditionProblems(20);
    this.problems21 = this.buildAdditionProblems(21);
    this.problems22 = this.buildAdditionProblems(22);
    this.problems23 = this.buildAdditionProblems(23);
    this.problems24 = this.buildAdditionProblems(24);
    this.problems25 = this.buildAdditionProblems(25);
    this.problems26 = this.buildAdditionProblems(26);
    this.problems27 = this.buildAdditionProblems(27);
    this.problems28 = this.buildAdditionProblems(28);
    this.problems29 = this.buildAdditionProblems(29);
    this.problems30 = this.buildAdditionProblems(30);
    this.problems31 = this.buildAdditionProblems(31);
    this.problems32 = this.buildAdditionProblems(32);
    this.problems33 = this.buildAdditionProblems(33);
    this.problems34 = this.buildAdditionProblems(34);
    this.problems35 = this.buildAdditionProblems(35);
    this.problems36 = this.buildAdditionProblems(36);
    this.problems37 = this.buildAdditionProblems(37);
    this.problems38 = this.buildAdditionProblems(38);
    this.problems39 = this.buildAdditionProblems(39);
    this.problems40 = this.buildAdditionProblems(40);
    this.problems41 = this.buildAdditionProblems(41);
    this.problems42 = this.buildAdditionProblems(42);
    this.problems43 = this.buildAdditionProblems(43);
    this.problems44 = this.buildAdditionProblems(44);
    this.problems45 = this.buildAdditionProblems(45);
    this.problems46 = this.buildAdditionProblems(46);
    this.problems47 = this.buildAdditionProblems(47);
    this.problems48 = this.buildAdditionProblems(48);
    this.problems49 = this.buildAdditionProblems(49);
    this.problems50 = this.buildAdditionProblems(50);
    this.problems51 = this.buildAdditionProblems(51);
    this.problems52 = this.buildAdditionProblems(52);
    this.problems53 = this.buildAdditionProblems(53);
    this.problems54 = this.buildAdditionProblems(54);
    this.problems55 = this.buildAdditionProblems(55);
    this.problems56 = this.buildAdditionProblems(56);
    this.problems57 = this.buildAdditionProblems(57);
    this.problems58 = this.buildAdditionProblems(58);
    this.problems59 = this.buildAdditionProblems(59);
    this.problems60 = this.buildAdditionProblems(60);
    this.problems61 = this.buildAdditionProblems(61);
    this.problems62 = this.buildAdditionProblems(62);
    this.problems63 = this.buildAdditionProblems(63);
    this.problems64 = this.buildAdditionProblems(64);
    this.problems65 = this.buildAdditionProblems(65);
    this.problems66 = this.buildAdditionProblems(66);
    this.problems67 = this.buildAdditionProblems(67);
    this.problems68 = this.buildAdditionProblems(68);
    this.problems69 = this.buildAdditionProblems(69);
    this.problems70 = this.buildAdditionProblems(70);
    this.problems71 = this.buildAdditionProblems(71);
    this.problems72 = this.buildAdditionProblems(72);
    this.problems73 = this.buildAdditionProblems(73);
    this.problems74 = this.buildAdditionProblems(74);
    this.problems75 = this.buildAdditionProblems(75);
    this.problems76 = this.buildAdditionProblems(76);
    this.problems77 = this.buildAdditionProblems(77);
    this.problems78 = this.buildAdditionProblems(78);
    this.problems79 = this.buildAdditionProblems(79);
    this.problems80 = this.buildAdditionProblems(80);
    this.problems81 = this.buildAdditionProblems(81);
    this.problems82 = this.buildAdditionProblems(82);
    this.problems83 = this.buildAdditionProblems(83);
    this.problems84 = this.buildAdditionProblems(84);
    this.problems85 = this.buildAdditionProblems(85);
    this.problems86 = this.buildAdditionProblems(86);
    this.problems87 = this.buildAdditionProblems(87);
    this.problems88 = this.buildAdditionProblems(88);
    this.problems89 = this.buildAdditionProblems(89);
    this.problems90 = this.buildAdditionProblems(90);
    this.problems91 = this.buildAdditionProblems(91);
    this.problems92 = this.buildAdditionProblems(92);
    this.problems93 = this.buildAdditionProblems(93);
    this.problems94 = this.buildAdditionProblems(94);
    this.problems95 = this.buildAdditionProblems(95);
    this.problems96 = this.buildAdditionProblems(96);
    this.problems97 = this.buildAdditionProblems(97);
    this.problems98 = this.buildAdditionProblems(98);
    this.problems99 = this.buildAdditionProblems(99);
    this.problems100 = this.buildAdditionProblems(100);

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
      ...this.problems11,
      ...this.problems12,
      ...this.problems13,
      ...this.problems14,
      ...this.problems15,
      ...this.problems16,
      ...this.problems17,
      ...this.problems18,
      ...this.problems19,
      ...this.problems20,
      ...this.problems21,
      ...this.problems22,
      ...this.problems23,
      ...this.problems24,
      ...this.problems25,
      ...this.problems26,
      ...this.problems27,
      ...this.problems28,
      ...this.problems29,
      ...this.problems30,
      ...this.problems31,
      ...this.problems32,
      ...this.problems33,
      ...this.problems34,
      ...this.problems35,
      ...this.problems36,
      ...this.problems37,
      ...this.problems38,
      ...this.problems39,
      ...this.problems40,
      ...this.problems41,
      ...this.problems42,
      ...this.problems43,
      ...this.problems44,
      ...this.problems45,
      ...this.problems46,
      ...this.problems47,
      ...this.problems48,
      ...this.problems49,
      ...this.problems50,
      ...this.problems51,
      ...this.problems52,
      ...this.problems53,
      ...this.problems54,
      ...this.problems55,
      ...this.problems56,
      ...this.problems57,
      ...this.problems58,
      ...this.problems59,
      ...this.problems60,
      ...this.problems61,
      ...this.problems62,
      ...this.problems63,
      ...this.problems64,
      ...this.problems65,
      ...this.problems66,
      ...this.problems67,
      ...this.problems68,
      ...this.problems69,
      ...this.problems70,
      ...this.problems71,
      ...this.problems72,
      ...this.problems73,
      ...this.problems74,
      ...this.problems75,
      ...this.problems76,
      ...this.problems77,
      ...this.problems78,
      ...this.problems79,
      ...this.problems80,
      ...this.problems81,
      ...this.problems82,
      ...this.problems83,
      ...this.problems84,
      ...this.problems85,
      ...this.problems86,
      ...this.problems87,
      ...this.problems88,
      ...this.problems89,
      ...this.problems90,
      ...this.problems91,
      ...this.problems92,
      ...this.problems93,
      ...this.problems94,
      ...this.problems95,
      ...this.problems96,
      ...this.problems97,
      ...this.problems98,
      ...this.problems99,
      ...this.problems100,
    ];

    this.configuredProblems = this.getConfiguredProblems(this.problems);
    const selectedProblems = this.pickFiveUniqueAnswerProblems(
      this.configuredProblems
    );
    this.assignFiveQuestionAndAnswerSlots(selectedProblems);

    for (let i = 1; i <= 7; i++) {
      const y = 50 + (i - 1) * 100;

      this[`campGroundRow${i}`] = this.add.group({
        key: "camp",
        repeat: 11,
        setXY: { x: 90, y: y, stepX: 180 },
        setScale: { x: 3, y: 6 },
      });
    }

    const mushroomSpots = [
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

    mushroomSpots.forEach(spot => {
      this.add.image(spot.x, spot.y, "mushrooms").setScale(3);
    });

    this.add.image(1250, 100, "yellowTent", 0).setScale(3);
    this.add.image(200, 100, "yellowTent", 1).setScale(3);
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