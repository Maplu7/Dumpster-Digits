import {Trash} from  '../GameObjects/Trash.js'; //can copy the path
import {TrashCan} from '../GameObjects/TrashCan.js';

export class Game_2nd_grade_multiplication extends Phaser.Scene {
    constructor() {
        super('Game');

    }

    create() {
        this.problems = [
          {question: "1*0", answer: 0},
          {question: "1*1", answer: 1},
          {question: "1*2", answer: 2},
          {question: "1*3", answer: 3},
          {question: "1*4", answer: 4},
          {question: "1*5", answer: 5},
          {question: "1*6", answer: 6},
          {question: "1*7", answer: 7},
          {question: "1*8", answer: 8},
          {question: "1*9", answer: 9},
          {question: "1*10", answer: 10}
        ]; //2D array for questions and their respective answers

        this.twosProblems = [
          {question: "2*0", answer: 0},
          {question: "2*1", answer: 2},
          {question: "2*2", answer: 4},
          {question: "2*3", answer: 6},
          {question: "2*4", answer: 8},
          {question: "2*5", answer: 10},
          {question: "2*6", answer: 12},
          {question: "2*7", answer: 14},
          {question: "2*8", answer: 16},
          {question: "2*9", answer: 18},
          {question: "2*10", answer: 20}
        ]; 

        this.threesProblems = [
          {question: "3*0", answer: 0},
          {question: "3*1", answer: 3},
          {question: "3*2", answer: 6},
          {question: "3*3", answer: 9},
          {question: "3*4", answer: 12},
          {question: "3*5", answer: 15},
          {question: "3*6", answer: 18},
          {question: "3*7", answer: 21},
          {question: "3*8", answer: 24},
          {question: "3*9", answer: 27},
          {question: "3*10", answer: 30}
        ]; 

        this.foursProblems = [
          {question: "4*0", answer: 0},
          {question: "4*1", answer: 4},
          {question: "4*2", answer: 8},
          {question: "4*3", answer: 12},
          {question: "4*4", answer: 16},
          {question: "4*5", answer: 20},
          {question: "4*6", answer: 24},
          {question: "4*7", answer: 28},
          {question: "4*8", answer: 32},
          {question: "4*9", answer: 36},
          {question: "4*10", answer: 40}
        ]; 

        this.fivesProblems = [
          {question: "5*0", answer: 0},
          {question: "5*1", answer: 5},
          {question: "5*2", answer: 10},
          {question: "5*3", answer: 15},
          {question: "5*4", answer: 20},
          {question: "5*5", answer: 25},
          {question: "5*6", answer: 30},
          {question: "5*7", answer: 35},
          {question: "5*8", answer: 40},
          {question: "5*9", answer: 45},
          {question: "5*10", answer: 50}
        ]; 

        this.sixesProblems = [
          {question: "6*0", answer: 0},
          {question: "6*1", answer: 6},
          {question: "6*2", answer: 12},
          {question: "6*3", answer: 18},
          {question: "6*4", answer: 24},
          {question: "6*5", answer: 30},
          {question: "6*6", answer: 36},
          {question: "6*7", answer: 42},
          {question: "6*8", answer: 48},
          {question: "6*9", answer: 54},
          {question: "6*10", answer: 60}
        ]; 

        this.sevensProblems = [
          {question: "7*0", answer: 0},
          {question: "7*1", answer: 7},
          {question: "7*2", answer: 14},
          {question: "7*3", answer: 21},
          {question: "7*4", answer: 28},
          {question: "7*5", answer: 35},
          {question: "7*6", answer: 42},
          {question: "7*7", answer: 49},
          {question: "7*8", answer: 54},
          {question: "7*9", answer: 63},
          {question: "7*10", answer: 70}  
        ]; 

        this.eightsProblems = [
          {question: "8*0", answer: 0},
          {question: "8*1", answer: 8},
          {question: "8*2", answer: 16},
          {question: "8*3", answer: 24},
          {question: "8*4", answer: 32},
          {question: "8*5", answer: 40},
          {question: "8*6", answer: 48},
          {question: "8*7", answer: 56},
          {question: "8*8", answer: 64},
          {question: "8*9", answer: 72},
          {question: "8*10", answer: 80}
        ]; 

        this.ninesProblems = [
          {question: "9*0", answer: 0},
          {question: "9*1", answer: 9},
          {question: "9*2", answer: 18},
          {question: "9*3", answer: 27},
          {question: "9*4", answer: 36},
          {question: "9*5", answer: 45},
          {question: "9*6", answer: 54},
          {question: "9*7", answer: 63},
          {question: "9*8", answer: 72},
          {question: "9*9", answer: 81},
          {question: "9*10", answer: 90}
        ]; 

        this.tensProblems = [
          {question: "10*0", answer: 0},
          {question: "10*1", answer: 10},
          {question: "10*2", answer: 20},
          {question: "10*3", answer: 30},
          {question: "10*4", answer: 40},
          {question: "10*5", answer: 50},
          {question: "10*6", answer: 60},
          {question: "10*7", answer: 70},
          {question: "10*8", answer: 80},
          {question: "10*9", answer: 90},
          {question: "10*10", answer: 100}
        ]; 

        for(let i = 1; i<= 7; i++){
        const y = 50 + (i-1) * 100;

        this['campGroundRow${i}'] = this.add.group({
          key: 'camp',
          repeat: 11,
          setXY: {x: 90, y: y, stepX: 180},
          setScale: {x:3, y:6}
        });
      }
      
      this.problem1 = Phaser.Utils.Array.GetRandom(this.problems);
          Phaser.Utils.Array.Remove(this.problems, this.problem1);

      this.problem2 = Phaser.Utils.Array.GetRandom(this.problems);
          Phaser.Utils.Array.Remove(this.problems, this.problem2);

      this.problem3 = Phaser.Utils.Array.GetRandom(this.problems);
          Phaser.Utils.Array.Remove(this.problems, this.problem3);

      this.problem4 = Phaser.Utils.Array.GetRandom(this.problems);
          Phaser.Utils.Array.Remove(this.problems, this.problem4);

      this.problem5 = Phaser.Utils.Array.GetRandom(this.problems);
          Phaser.Utils.Array.Remove(this.problems, this.problem5);

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
      this.trash1 = new Trash(this, 550, 280, this.question1);
      this.trash2 = new Trash(this, 650, 400, this.question2);
      this.trash3 = new Trash(this, 750, 280, this.question3);
      this.trash4 = new Trash(this, 850, 400, this.question4);
      this.trash5 = new Trash(this, 950, 280, this.question5);
      //this.replacementTrash = new Trash;

        this.numGuessesPerAnswer = [
          {guessedAnswer: this.trash1, numGuess: 0},
          {guessedAnswer: this.trash2, numGuess: 0},
          {guessedAnswer: this.trash3, numGuess: 0},
          {guessedAnswer: this.trash4, numGuess: 0},
          {guessedAnswer: this.trash5, numGuess: 0}
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

    onCorrect()
    {
      this.correct.destroy();
    };


    onFinish()
    {
      this.endGame = this.add.text(250, 150, 'Congradulations! You Finished!', {fontSize: '60px', fill: '#ffffff'});
      this.guessesQuestion1 = this.add.text(300, 300, 'Number of Wrong Guesses for ' + this.trash1.question + "=" +  this.trash1.answer + " : " + this.numGuessesPerAnswer[0].numGuess, {fontSize: '40px', fill: '#ffffff'});
      this.guessesQuestion2 = this.add.text(300, 400, 'Number of Wrong Guesses for ' + this.trash2.question + "=" +  this.trash2.answer + " : "  + this.numGuessesPerAnswer[1].numGuess, {fontSize: '40px', fill: '#ffffff'});
      this.guessesQuestion3 = this.add.text(300, 500, 'Number of Wrong Guesses for ' + this.trash3.question + "=" +  this.trash3.answer + " : "  + this.numGuessesPerAnswer[2].numGuess, {fontSize: '40px', fill: '#ffffff'});
      this.guessesQuestion4 = this.add.text(300, 600, 'Number of Wrong Guesses for ' + this.trash4.question + "=" +  this.trash4.answer + " : "  + this.numGuessesPerAnswer[3].numGuess, {fontSize: '40px', fill: '#ffffff'});
      this.guessesQuestion5 = this.add.text(300, 700, 'Number of Wrong Guesses for ' + this.trash5.question + "=" +  this.trash5.answer + " : "  + this.numGuessesPerAnswer[4].numGuess, {fontSize: '40px', fill: '#ffffff'});
    };
}