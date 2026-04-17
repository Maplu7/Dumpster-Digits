import { Trash } from '../GameObjects/Trash.js';
import { TrashCan } from '../GameObjects/TrashCan.js';
import { showFinishScreen } from "./utils/showFinishScreen";
import { saveAssignmentResult } from "../saveAssignmentResult";

export class Game_2nd_grade_subtraction extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.gameKey = "2nd_subtraction";
    this.assignmentTitle = "2nd Grade Subtraction";

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

    this.problems = [
      { question: "10-1", answer: 9 },
      { question: "10-2", answer: 8 },
      { question: "10-3", answer: 7 },
      { question: "10-4", answer: 6 },
      { question: "10-5", answer: 5 },
      { question: "10-6", answer: 4 },
      { question: "10-7", answer: 3 },
      { question: "10-8", answer: 2 },
      { question: "10-9", answer: 1 },
      { question: "10-10", answer: 0 }
    ];

    for (let i = 1; i <= 7; i++) {
      const y = 50 + (i - 1) * 100;

      this[`campGroundRow${i}`] = this.add.group({
        key: 'camp',
        repeat: 11,
        setXY: { x: 90, y: y, stepX: 180 },
        setScale: { x: 3, y: 6 }
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

    this.possibleQuestions = [
      this.problem1,
      this.problem2,
      this.problem3,
      this.problem4,
      this.problem5
    ];

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

    this.possibleAnswers = [
      this.problem1,
      this.problem2,
      this.problem3,
      this.problem4,
      this.problem5
    ];

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
      { guessedAnswer: this.trash5, numGuess: 0 }
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
    if (trashCan && trashCan._disabled) return;
    if (trash._lockedOnCan) return;

    trash._lockedOnCan = true;

    const unlockWhenLeaving = () => {
      const cans = [
        this.trashCan1,
        this.trashCan2,
        this.trashCan3,
        this.trashCan4,
        this.trashCan5
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
      this.correct?.destroy();
      this.correct = this.add.text(30, 200, "That is Correct!", {
        fontSize: "80px",
        fill: "#ffffff",
      });

      if (trashCan.markCorrect) trashCan.markCorrect();

      trash.destroy();
      trashCan.destroy();

      this.numCorrect += 1;
      this.time.delayedCall(550, this.onCorrect, [], this);

      if (this.numCorrect === 5) {
        this.time.delayedCall(550, this.onFinish, [], this);
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

    this.wrongText?.destroy();
    this.wrongText = this.add.text(30, 200, "Try again!", {
      fontSize: "80px",
      fill: "#ffffff",
    });

    this.time.delayedCall(550, () => this.wrongText?.destroy());
    this.triesUsed += 1;

    unlockWhenLeaving();
  }

  onCorrect() {
    this.correct?.destroy();
  }

  async onFinish() {
    let coinsEarned = 0;

    try {
      const rewardResult = await this.saveResults();
      console.log("rewardResult:", rewardResult);
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