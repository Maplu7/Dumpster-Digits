import { Trash } from '../GameObjects/Trash.js'; //can copy the path
import { TrashCan } from '../GameObjects/TrashCan.js';
import { showFinishScreen } from "./utils/showFinishScreen";
import { saveAssignmentResult } from "../saveAssignmentResult";

export class Game_2nd_grade_fillInTheBlank extends Phaser.Scene {
  constructor() {
    super('Game');

  }
  /*Frame Dimensions: width: 1536,
                      height: 793*/

  create() {
    this.gameKey = "2nd_fill_blank";
    this.assignmentTitle = "2nd Grade Fill in the Blank";
    this.saveResults = async () => {
  const studentId = this.studentId || this.registry.get("studentId");

  return await saveAssignmentResult({
    studentId,
    gameKey: this.gameKey,
    assignmentTitle: this.assignmentTitle,
    totalWrongGuesses: this.numWrong || 0,
    numGuessesPerAnswer: this.numGuessesPerAnswer || [],
  });
};


    this.problems1 = [
      { question: "1+_=1", answer: 0 },
      { question: "1+_=2", answer: 1 },
      { question: "1+_=3", answer: 2 },
      { question: "1+_=4", answer: 3 },
      { question: "1+_=5", answer: 4 },
      { question: "1+_=6", answer: 5 },
      { question: "1+_=7", answer: 6 },
      { question: "1+_=8", answer: 7 },
      { question: "1+_=9", answer: 8 },
      { question: "1+_=10", answer: 9 },
      { question: "1+_=11", answer: 10 }
    ]; //2D array for questions and their respective answers


    // this.add.image(90, 50, 'camp').setScale(3);
    this.campGroundR1 = this.add.group({
      key: 'camp',
      repeat: 11,
      setXY: { x: 90, y: 50, stepX: 180 },
      setScale: { x: 3, y: 4 },

    });

    this.campGroundR2 = this.add.group({ //a DYNAMIC physics group
      key: 'camp',
      repeat: 11,
      setXY: { x: 90, y: 200, stepX: 180 },
      setScale: { x: 3, y: 4 }
      //develop 12 stars that will start ad 12X3, and will move by 70 horizontally each time
    });

    this.campGroundR3 = this.add.group({ //a DYNAMIC physics group
      key: 'camp',
      repeat: 11,
      setXY: { x: 90, y: 300, stepX: 180 },
      setScale: { x: 3, y: 4 }
      //develop 12 stars that will start ad 12X3, and will move by 70 horizontally each time
    });

    this.campGroundR4 = this.add.group({ //a DYNAMIC physics group
      key: 'camp',
      repeat: 11,
      setXY: { x: 90, y: 400, stepX: 180 },
      setScale: { x: 3, y: 4 }
      //develop 12 stars that will start ad 12X3, and will move by 70 horizontally each time
    });

    this.campGroundR5 = this.add.group({ //a DYNAMIC physics group
      key: 'camp',
      repeat: 11,
      setXY: { x: 90, y: 500, stepX: 180 },
      setScale: { x: 3, y: 4 }
      //develop 12 stars that will start ad 12X3, and will move by 70 horizontally each time
    });

    this.campGroundR6 = this.add.group({ //a DYNAMIC physics group
      key: 'camp',
      repeat: 11,
      setXY: { x: 90, y: 600, stepX: 180 },
      setScale: { x: 3, y: 4 }
      //develop 12 stars that will start ad 12X3, and will move by 70 horizontally each time
    });

    this.campGroundR7 = this.add.group({ //a DYNAMIC physics group
      key: 'camp',
      repeat: 11,
      setXY: { x: 90, y: 720, stepX: 180 },
      setScale: { x: 3, y: 4 }
      //develop 12 stars that will start ad 12X3, and will move by 70 horizontally each time
    });

    this.problem1 = Phaser.Utils.Array.GetRandom(this.problems1);
    Phaser.Utils.Array.Remove(this.problems1, this.problem1);

    this.problem2 = Phaser.Utils.Array.GetRandom(this.problems1);
    Phaser.Utils.Array.Remove(this.problems1, this.problem2);

    this.problem3 = Phaser.Utils.Array.GetRandom(this.problems1);
    Phaser.Utils.Array.Remove(this.problems1, this.problem3);

    this.problem4 = Phaser.Utils.Array.GetRandom(this.problems1);
    Phaser.Utils.Array.Remove(this.problems1, this.problem4);

    this.problem5 = Phaser.Utils.Array.GetRandom(this.problems1);
    Phaser.Utils.Array.Remove(this.problems1, this.problem5);

    //createes and array of randomized problems
    this.possibleQuestions = [
      this.problem1,
      this.problem2,
      this.problem3,
      this.problem4,
      this.problem5
    ]

    //each question is one of the random problems
    this.question1 = Phaser.Utils.Array.GetRandom(this.possibleQuestions);
    Phaser.Utils.Array.Remove(this.possibleQuestions, this.question1);

    this.question2 = Phaser.Utils.Array.GetRandom(this.possibleQuestions);
    Phaser.Utils.Array.Remove(this.possibleQuestions, this.question2);

    this.question3 = Phaser.Utils.Array.GetRandom(this.possibleQuestions);
    Phaser.Utils.Array.Remove(this.possibleQuestions, this.question3);

    this.question4 = Phaser.Utils.Array.GetRandom(this.possibleQuestions);
    Phaser.Utils.Array.Remove(this.possibleQuestions, this.question4);

    this.question5 = Phaser.Utils.Array.GetRandom(this.possibleQuestions);
    Phaser.Utils.Array.Remove(this.possibleQuestions, this.question5);

    // creates an array of randomized answers
    this.possibleAnswers = [
      this.problem1,
      this.problem2,
      this.problem3,
      this.problem4,
      this.problem5
    ]

    //assign a random answer to one of the answer#
    this.answer1 = Phaser.Utils.Array.GetRandom(this.possibleAnswers);
    Phaser.Utils.Array.Remove(this.possibleAnswers, this.answer1);

    this.answer2 = Phaser.Utils.Array.GetRandom(this.possibleAnswers);
    Phaser.Utils.Array.Remove(this.possibleAnswers, this.answer2);

    this.answer3 = Phaser.Utils.Array.GetRandom(this.possibleAnswers);
    Phaser.Utils.Array.Remove(this.possibleAnswers, this.answer3);

    this.answer4 = Phaser.Utils.Array.GetRandom(this.possibleAnswers);
    Phaser.Utils.Array.Remove(this.possibleAnswers, this.answer4);

    this.answer5 = Phaser.Utils.Array.GetRandom(this.possibleAnswers);
    Phaser.Utils.Array.Remove(this.possibleAnswers, this.answer5);


    // creates trashcans and their individual answers
    this.trashCan1 = new TrashCan(this, 100, 700, this.answer1).setScale(1);
    this.trashCan2 = new TrashCan(this, 440, 700, this.answer2).setScale(1);
    this.trashCan3 = new TrashCan(this, 740, 700, this.answer3).setScale(1);
    this.trashCan4 = new TrashCan(this, 1040, 700, this.answer4).setScale(1);
    this.trashCan5 = new TrashCan(this, 1340, 700, this.answer5).setScale(1);


    // Createse trash and their individual questions
    this.trash1 = new Trash(this, 100, 280, this.question1).setScale(1);
    this.trash2 = new Trash(this, 440, 340, this.question2).setScale(1);
    this.trash3 = new Trash(this, 740, 280, this.question3).setScale(1);
    this.trash4 = new Trash(this, 1040, 340, this.question4).setScale(1);
    this.trash5 = new Trash(this, 1340, 280, this.question5).setScale(1);
    //this.replacementTrash = new Trash;

    this.numGuessesPerAnswer = [
      { guessedAnswer: this.trash1, numGuess: 0 },
      { guessedAnswer: this.trash2, numGuess: 0 },
      { guessedAnswer: this.trash3, numGuess: 0 },
      { guessedAnswer: this.trash4, numGuess: 0 },
      { guessedAnswer: this.trash5, numGuess: 0 }
    ];

    //////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////
    this.numCorrect = 0; //Will keep track of number of right guesses
    this.numWrong = 0; //Will keep track of number of wrong guesses
    //this.triesUsed = 0;
    //this.numTries1 = 0;
    //this.numTriesUsed = this.add.text(20, 20, 'Num Tries: 3', {fontSize: '40px', fill: "#ffffff"});


    //March 3
    // Will trigger when a piece of trash is over a garbage can
    this.physics.add.overlap(this.trash1, this.trashCan1,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash1, this.trashCan2,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash1, this.trashCan3,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash1, this.trashCan4,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash1, this.trashCan5,
      this.putInTrash, null, this);


    this.physics.add.overlap(this.trash2, this.trashCan1,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash2, this.trashCan2,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash2, this.trashCan3,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash2, this.trashCan4,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash2, this.trashCan5,
      this.putInTrash, null, this);

    this.physics.add.overlap(this.trash3, this.trashCan1,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash3, this.trashCan2,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash3, this.trashCan3,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash3, this.trashCan4,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash3, this.trashCan5,
      this.putInTrash, null, this);

    this.physics.add.overlap(this.trash4, this.trashCan1,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash4, this.trashCan2,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash4, this.trashCan3,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash4, this.trashCan4,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash4, this.trashCan5,
      this.putInTrash, null, this);

    this.physics.add.overlap(this.trash5, this.trashCan1,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash5, this.trashCan2,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash5, this.trashCan3,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash5, this.trashCan4,
      this.putInTrash, null, this);
    this.physics.add.overlap(this.trash5, this.trashCan5,
      this.putInTrash, null, this);


    /*this.testText = this.add.text(this.trash.x, this.trash.y, '3+4', {
      fontSize: '15px', fill: '#ffffff'
    }); //Obviously this only attaches text to one piece of trash
        //it would be annoying/time consuming to do this for each and every
        //possible equation that could appear.*/

  }


  putInTrash(trash, trashCan) {
    // if this can is already solved, ignore
    if (trashCan && trashCan._disabled) return;

    // stop overlap-per-frame spam
    if (trash._lockedOnCan) return;
    trash._lockedOnCan = true;

    // unlock only after leaving all cans
    const unlockWhenLeaving = () => {
      const cans = [this.trashCan1, this.trashCan2, this.trashCan3, this.trashCan4, this.trashCan5]
        .filter((c) => c && c.active);

      const stillOverAny = cans.some((c) => this.physics.overlap(trash, c));

      if (!stillOverAny) {
        trash._lockedOnCan = false;

        // restore tint if not dragging
        if (trash && trash.active && trash.trashMath && !trash._dragging) {
          trash.trashMath.clearTint();
        }
      } else {
        this.time.delayedCall(100, unlockWhenLeaving);
      }
    };

    // Check if the trash can is the correct one
    if (trash.answer === trashCan.answer) {
      this.correct?.destroy();
      this.correct = this.add.text(30, 200, "That is Correct!", {
        fontSize: "80px",
        fill: "#ffffff",
      });

      // destorying trash, and trash can
      if (trashCan.markCorrect) trashCan.markCorrect();

      // remove trash
      trash.destroy();
      trashCan.destroy();

      this.numCorrect += 1;
      this.time.delayedCall(550, this.onCorrect, [], this);

      if (this.numCorrect === 5) {
        // keep hidden during play; toast shows final number
        this.time.delayedCall(1000, this.onFinish, [], this);
      }

      return;
    }

    // Wrong (count once)
    this.numWrong += 1;

    // keep hidden, but update stored number for toast

    if (trash === this.trash1) {
      this.numGuessesPerAnswer[0].numGuess++;
    }
    else if (trash === this.trash2) {
      this.numGuessesPerAnswer[1].numGuess++;
    }
    else if (trash === this.trash3) {
      this.numGuessesPerAnswer[2].numGuess++;
    }
    else if (trash == this.trash4) {
      this.numGuessesPerAnswer[3].numGuess++;
    }
    else if (trash == this.trash5) {
      this.numGuessesPerAnswer[4].numGuess++;
    };

    this.wrongText?.destroy();
    this.wrongText = this.add.text(30, 200, "Try again!", {
      fontSize: "80px",
      fill: "#ffffff",
    });

    this.time.delayedCall(550, () => this.wrongText?.destroy());
    this.triesUsed += 1;

    // allow another wrong count only after leaving cans
    unlockWhenLeaving();
  }

  onCorrect() {
    this.correct.destroy();
  };


   async onFinish() {
  let coinsEarned = 0;

  try {
    const rewardResult = await this.saveResults();
    console.log("rewardResult:", rewardResult); // 👈 keep this for testing
    coinsEarned = rewardResult?.coinReward || 0;
  } catch (error) {
    console.error("Save failed:", error);
  }

  showFinishScreen(this, {
    title: "Congratulations!",
    subtitle: `You earned ${coinsEarned} coins!`,
    formatLine: (trash, guessCount) =>
      "Wrong guesses for " +
      trash.question +
      " has " +
      trash.answer +
      ": " +
      guessCount,
  });
}
}