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

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
    function subtractionProblems() {
      const allProblems = [];

      for(let n = 100; n >= 0; n--)
      {
        for(let j = n; j >= 0; j--)
        {
          allProblems.push({
            answer: `${n - j}`,
            question: `${n}-${j}`
          })
        }
      }
      return allProblems;
    };

    this.problemsSubtraction = subtractionProblems();

    this.configuredProblems = this.getConfiguredProblems(this.problemsSubtraction);
//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

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
