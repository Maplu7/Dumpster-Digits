import { Trash } from '../GameObjects/Trash.js';
import { TrashCan } from '../GameObjects/TrashCan.js';
import { BaseMathGameScene } from "./BaseMathGameScene";

export class Game_1st_grade_addition extends BaseMathGameScene {
    constructor() {
        super('Game');
    }

    /*Frame Dimensions: width: 1536,
                        height: 793*/

    create() {
        this.initSharedGameConfig({
            gameKey: "1st_addition",
            assignmentTitle: "1st Grade Addition",
        });

        this.problems1 = [
          {question: "1+0", answer: 1},
          {question: "1+1", answer: 2},
          {question: "1+2", answer: 3},
          {question: "1+3", answer: 4},
          {question: "1+4", answer: 5},
          {question: "1+5", answer: 6},
          {question: "1+6", answer: 7},
          {question: "1+7", answer: 8},
          {question: "1+8", answer: 9},
          {question: "1+9", answer: 10},
          {question: "1+10", answer: 11}
        ];

        this.problems2 = [
          {question: "2+0", answer: 2},
          {question: "2+1", answer: 3},
          {question: "2+2", answer: 4},
          {question: "2+3", answer: 5},
          {question: "2+4", answer: 6},
          {question: "2+5", answer: 7},
          {question: "2+6", answer: 8},
          {question: "2+7", answer: 9},
          {question: "2+8", answer: 10},
          {question: "2+9", answer: 11},
          {question: "2+10", answer: 12}
        ];

        this.problems3 = [
          {question: "3+0", answer: 3},
          {question: "3+1", answer: 4},
          {question: "3+2", answer: 5},
          {question: "3+3", answer: 6},
          {question: "3+4", answer: 7},
          {question: "3+5", answer: 8},
          {question: "3+6", answer: 9},
          {question: "3+7", answer: 10},
          {question: "3+8", answer: 11},
          {question: "3+9", answer: 12},
          {question: "3+10", answer: 13}
        ];

        this.problems4 = [
          {question: "4+0", answer: 4},
          {question: "4+1", answer: 5},
          {question: "4+2", answer: 6},
          {question: "4+3", answer: 7},
          {question: "4+4", answer: 8},
          {question: "4+5", answer: 9},
          {question: "4+6", answer: 10},
          {question: "4+7", answer: 11},
          {question: "4+8", answer: 12},
          {question: "4+9", answer: 13},
          {question: "4+10", answer: 14}
        ];

        this.problems5 = [
          {question: "5+0", answer: 5},
          {question: "5+1", answer: 6},
          {question: "5+2", answer: 7},
          {question: "5+3", answer: 8},
          {question: "5+4", answer: 9},
          {question: "5+5", answer: 10},
          {question: "5+6", answer: 11},
          {question: "5+7", answer: 12},
          {question: "5+8", answer: 13},
          {question: "5+9", answer: 14},
          {question: "5+10", answer: 15}
        ];

        this.problems6 = [
          {question: "6+0", answer: 6},
          {question: "6+1", answer: 7},
          {question: "6+2", answer: 8},
          {question: "6+3", answer: 9},
          {question: "6+4", answer: 10},
          {question: "6+5", answer: 11},
          {question: "6+6", answer: 12},
          {question: "6+7", answer: 13},
          {question: "6+8", answer: 14},
          {question: "6+9", answer: 15},
          {question: "6+10", answer: 16}
        ];

        this.problems7 = [
          {question: "7+0", answer: 7},
          {question: "7+1", answer: 8},
          {question: "7+2", answer: 9},
          {question: "7+3", answer: 10},
          {question: "7+4", answer: 11},
          {question: "7+5", answer: 12},
          {question: "7+6", answer: 13},
          {question: "7+7", answer: 14},
          {question: "7+8", answer: 15},
          {question: "7+9", answer: 16},
          {question: "7+10", answer: 17}
        ];

        this.problems8 = [
          {question: "8+0", answer: 8},
          {question: "8+1", answer: 9},
          {question: "8+2", answer: 10},
          {question: "8+3", answer: 11},
          {question: "8+4", answer: 12},
          {question: "8+5", answer: 13},
          {question: "8+6", answer: 14},
          {question: "8+7", answer: 15},
          {question: "8+8", answer: 16},
          {question: "8+9", answer: 17},
          {question: "8+10", answer: 18}
        ];

        this.problems9 = [
          {question: "9+0", answer: 9},
          {question: "9+1", answer: 10},
          {question: "9+2", answer: 11},
          {question: "9+3", answer: 12},
          {question: "9+4", answer: 13},
          {question: "9+5", answer: 14},
          {question: "9+6", answer: 15},
          {question: "9+7", answer: 16},
          {question: "9+8", answer: 17},
          {question: "9+9", answer: 18},
          {question: "9+10", answer: 19}
        ];

        this.problems10 = [
          {question: "10+0", answer: 10},
          {question: "10+1", answer: 11},
          {question: "10+2", answer: 12},
          {question: "10+3", answer: 13},
          {question: "10+4", answer: 14},
          {question: "10+5", answer: 15},
          {question: "10+6", answer: 16},
          {question: "10+7", answer: 17},
          {question: "10+8", answer: 18},
          {question: "10+9", answer: 19},
          {question: "10+10", answer: 20}
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

        this.add.image(1250, 100, 'yellowTent', 0).setScale(3);
        this.add.image(200, 100, 'yellowTent', 1).setScale(3);
        this.add.image(100, 300, 'campFire', 3).setScale(3);
        this.add.image(1400, 200, 'campChairGreen', 0).setScale(2);
        this.add.image(1480, 280, 'campChairGreen', 2).setScale(2);

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
            const cans = [this.trashCan1, this.trashCan2, this.trashCan3, this.trashCan4, this.trashCan5]
              .filter((c) => c && c.active);

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
                this.time.delayedCall(this.feedbackDuration + 250, this.onFinish, [], this);
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

        this.time.delayedCall(this.feedbackDuration, () => this.clearCenteredFeedback());
        this.triesUsed += 1;

        unlockWhenLeaving();
    }
}