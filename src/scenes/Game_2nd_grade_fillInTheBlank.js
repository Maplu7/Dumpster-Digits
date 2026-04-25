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
      { question: "1+?=1", answer: 0 },
      { question: "1+?=2", answer: 1 },
      { question: "1+?=3", answer: 2 },
      { question: "1+?=4", answer: 3 },
      { question: "1+?=5", answer: 4 },
      { question: "1+?=6", answer: 5 },
      { question: "1+?=7", answer: 6 },
      { question: "1+?=8", answer: 7 },
      { question: "1+?=9", answer: 8 },
      { question: "1+?=10", answer: 9 },
      { question: "1+?=11", answer: 10 },
    ];

    this.problems2 = [
      { question: "2+?=2", answer: 0 },
      { question: "2+?=3", answer: 1 },
      { question: "2+?=4", answer: 2 },
      { question: "2+?=5", answer: 3 },
      { question: "2+?=6", answer: 4 },
      { question: "2+?=7", answer: 5 },
      { question: "2+?=8", answer: 6 },
      { question: "2+?=9", answer: 7 },
      { question: "2+?=10", answer: 8 },
      { question: "2+?=11", answer: 9 },
      { question: "2+?=12", answer: 10 },
    ];

    this.problems3 = [
      { question: "3+?=3", answer: 0 },
      { question: "3+?=4", answer: 1 },
      { question: "3+?=5", answer: 2 },
      { question: "3+?=6", answer: 3 },
      { question: "3+?=7", answer: 4 },
      { question: "3+?=8", answer: 5 },
      { question: "3+?=9", answer: 6 },
      { question: "3+?=10", answer: 7 },
      { question: "3+?=11", answer: 8 },
      { question: "3+?=12", answer: 9 },
      { question: "3+?=13", answer: 10 },
    ];

    this.problems4 = [
      { question: "4+?=4", answer: 0 },
      { question: "4+?=5", answer: 1 },
      { question: "4+?=6", answer: 2 },
      { question: "4+?=7", answer: 3 },
      { question: "4+?=8", answer: 4 },
      { question: "4+?=9", answer: 5 },
      { question: "4+?=10", answer: 6 },
      { question: "4+?=11", answer: 7 },
      { question: "4+?=12", answer: 8 },
      { question: "4+?=13", answer: 9 },
      { question: "4+?=14", answer: 10 },
    ];

    this.problems5 = [
      { question: "5+?=5", answer: 0 },
      { question: "5+?=6", answer: 1 },
      { question: "5+?=7", answer: 2 },
      { question: "5+?=8", answer: 3 },
      { question: "5+?=9", answer: 4 },
      { question: "5+?=10", answer: 5 },
      { question: "5+?=11", answer: 6 },
      { question: "5+?=12", answer: 7 },
      { question: "5+?=13", answer: 8 },
      { question: "5+?=14", answer: 9 },
      { question: "5+?=15", answer: 10 },
    ];

    this.problems6 = [
      { question: "6+?=6", answer: 0 },
      { question: "6+?=7", answer: 1 },
      { question: "6+?=8", answer: 2 },
      { question: "6+?=9", answer: 3 },
      { question: "6+?=10", answer: 4 },
      { question: "6+?=11", answer: 5 },
      { question: "6+?=12", answer: 6 },
      { question: "6+?=13", answer: 7 },
      { question: "6+?=14", answer: 8 },
      { question: "6+?=15", answer: 9 },
      { question: "6+?=16", answer: 10 },
    ];

    this.problems7 = [
      { question: "7+?=7", answer: 0 },
      { question: "7+?=8", answer: 1 },
      { question: "7+?=9", answer: 2 },
      { question: "7+?=10", answer: 3 },
      { question: "7+?=11", answer: 4 },
      { question: "7+?=12", answer: 5 },
      { question: "7+?=13", answer: 6 },
      { question: "7+?=14", answer: 7 },
      { question: "7+?=15", answer: 8 },
      { question: "7+?=16", answer: 9 },
      { question: "7+?=17", answer: 10 },
    ];

    this.problems8 = [
      { question: "8+?=8", answer: 0 },
      { question: "8+?=9", answer: 1 },
      { question: "8+?=10", answer: 2 },
      { question: "8+?=11", answer: 3 },
      { question: "8+?=12", answer: 4 },
      { question: "8+?=13", answer: 5 },
      { question: "8+?=14", answer: 6 },
      { question: "8+?=15", answer: 7 },
      { question: "8+?=16", answer: 8 },
      { question: "8+?=17", answer: 9 },
      { question: "8+?=18", answer: 10 },
    ];

    this.problems9 = [
      { question: "9+?=9", answer: 0 },
      { question: "9+?=10", answer: 1 },
      { question: "9+?=11", answer: 2 },
      { question: "9+?=12", answer: 3 },
      { question: "9+?=13", answer: 4 },
      { question: "9+?=14", answer: 5 },
      { question: "9+?=15", answer: 6 },
      { question: "9+?=16", answer: 7 },
      { question: "9+?=17", answer: 8 },
      { question: "9+?=18", answer: 9 },
      { question: "9+?=19", answer: 10 },
    ];

    this.problems10 = [
      { question: "10+?=10", answer: 0 },
      { question: "10+?=11", answer: 1 },
      { question: "10+?=12", answer: 2 },
      { question: "10+?=13", answer: 3 },
      { question: "10+?=14", answer: 4 },
      { question: "10+?=15", answer: 5 },
      { question: "10+?=16", answer: 6 },
      { question: "10+?=17", answer: 7 },
      { question: "10+?=18", answer: 8 },
      { question: "10+?=19", answer: 9 },
      { question: "10+?=20", answer: 10 },
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

//---------------------------------------------------------------------------------
//---------------------  RACCOON ANIMATION----------------------------------------
//-------------------------------------------------------------------------------

  // Check if the trash can is the correct one
    // raccacconie animation
          this.anims.create ({
          key: 'raccoonFeedback',
          frames: this.anims.generateFrameNumbers ('raccoon', {start: 20, end: 27}),
          frameRate: 7,
          repeat: -1
        });

  if (trash.answer === trashCan.answer) {
    this.correct?.destroy();
    this.correct = this.add.text(30, 200, "That is Correct!", {
      fontSize: "80px",
      fill: "#ffffff",
    });

    this.raccoon = this.add.sprite(trashCan.x,trashCan.y, 'raccoon', 20).setScale(4); //UPDATE
    this.emoteCorrect = this.add.sprite(this.raccoon.x, this.raccoon.y - 70, 'heartEmote').setScale(3); //UPDATE
    
    // destorying trash, and trash can
    if (trashCan.markCorrect) trashCan.markCorrect();
    this.raccoon.play('raccoonFeedback'); //UPDATE

    trash.destroy();
   trashCan.destroy();

    this.numCorrect += 1;
    this.time.delayedCall(550, this.onCorrect, [], this);

    if (this.numCorrect === 5) {
      // keep hidden during play; toast shows final number
      this.time.delayedCall(550, this.onFinish, [], this);
    }

    return;
  };//END OF IS_CORRECT code
  

  // Wrong (count once)
  this.numWrong += 1;

  this.raccoonWrong = this.add.sprite(trashCan.x, trashCan.y, 'raccoon', 20).setScale(4); //UPDATE VVV
  this.emoteWrong = this.add.sprite(this.raccoonWrong.x, this.raccoonWrong.y - 70, 'brokenHeartEmote').setScale(3);
  
  // keep hidden, but update stored number for toast
  if(trash === this.trash1){
    this.numGuessesPerAnswer[0].numGuess++;
  }
  else if(trash === this.trash2){
    this.numGuessesPerAnswer[1].numGuess++;
  }
  else if(trash === this.trash3){
    this.numGuessesPerAnswer[2].numGuess++;
  }
  else if(trash == this.trash4){
    this.numGuessesPerAnswer[3].numGuess++;
  }
  else if(trash == this.trash5){
    this.numGuessesPerAnswer[4].numGuess++;
  };

  this.raccoonWrong.play('raccoonFeedback'); //UPDATE
  
  this.wrongText?.destroy();
  this.wrongText = this.add.text(30, 200, "Try again!", {
    fontSize: "80px",
    fill: "#ffffff",
  });
  

  this.time.delayedCall(550, () => this.wrongText?.destroy());

  this.time.delayedCall(800, () => this.emoteWrong?.destroy()); //UPDATE
  this.time.delayedCall(800, () => this.raccoonWrong?.destroy()); //UPDATE
  this.triesUsed += 1;
//------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------

    unlockWhenLeaving();
  }
}
