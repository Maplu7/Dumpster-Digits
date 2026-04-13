import { Trash } from "../GameObjects/Trash.js";
import { TrashCan } from "../GameObjects/TrashCan.js";
import { showFinishScreen } from "./utils/showFinishScreen";
import { saveAssignmentResult } from "../saveAssignmentResult";

export class Game_1st_grade_addition extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  /*Frame Dimensions: width: 1536,
                      height: 793*/

  create() {
    this.gameKey = "1st_addition";
    this.assignmentTitle = "1st Grade Addition";

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
      { question: "1+0", answer: 1 },
      { question: "1+1", answer: 2 },
      { question: "1+2", answer: 3 },
      { question: "1+3", answer: 4 },
      { question: "1+4", answer: 5 },
      { question: "1+5", answer: 6 },
      { question: "1+6", answer: 7 },
      { question: "1+7", answer: 8 },
      { question: "1+8", answer: 9 },
      { question: "1+9", answer: 10 },
      { question: "1+10", answer: 11 }
    ]; //2D array for questions and their respective answers

    this.problems2 = [
      { question: "2+0", answer: 2 },
      { question: "2+1", answer: 3 },
      { question: "2+2", answer: 4 },
      { question: "2+3", answer: 5 },
      { question: "2+4", answer: 6 },
      { question: "2+5", answer: 7 },
      { question: "2+6", answer: 8 },
      { question: "2+7", answer: 9 },
      { question: "2+8", answer: 10 },
      { question: "2+9", answer: 11 },
      { question: "2+10", answer: 12 }
    ];

    this.problems3 = [
      { question: "3+0", answer: 3 },
      { question: "3+1", answer: 4 },
      { question: "3+2", answer: 5 },
      { question: "3+3", answer: 6 },
      { question: "3+4", answer: 7 },
      { question: "3+5", answer: 8 },
      { question: "3+6", answer: 9 },
      { question: "3+7", answer: 10 },
      { question: "3+8", answer: 11 },
      { question: "3+9", answer: 12 },
      { question: "3+10", answer: 13 }
    ];

    this.problems4 = [
      { question: "4+0", answer: 4 },
      { question: "4+1", answer: 5 },
      { question: "4+2", answer: 6 },
      { question: "4+3", answer: 7 },
      { question: "4+4", answer: 8 },
      { question: "4+5", answer: 9 },
      { question: "4+6", answer: 10 },
      { question: "4+7", answer: 11 },
      { question: "4+8", answer: 12 },
      { question: "4+9", answer: 13 },
      { question: "4+10", answer: 14 }
    ];

    this.problems5 = [
      { question: "5+0", answer: 5 },
      { question: "5+1", answer: 6 },
      { question: "5+2", answer: 7 },
      { question: "5+3", answer: 8 },
      { question: "5+4", answer: 9 },
      { question: "5+5", answer: 10 },
      { question: "5+6", answer: 11 },
      { question: "5+7", answer: 12 },
      { question: "5+8", answer: 13 },
      { question: "5+9", answer: 14 },
      { question: "5+10", answer: 15 }
    ];

    this.problems6 = [
      { question: "6+0", answer: 6 },
      { question: "6+1", answer: 7 },
      { question: "6+2", answer: 8 },
      { question: "6+3", answer: 9 },
      { question: "6+4", answer: 10 },
      { question: "6+5", answer: 11 },
      { question: "6+6", answer: 12 },
      { question: "6+7", answer: 13 },
      { question: "6+8", answer: 14 },
      { question: "6+9", answer: 15 },
      { question: "6+10", answer: 16 }
    ];

    this.problems7 = [
      { question: "7+0", answer: 7 },
      { question: "7+1", answer: 8 },
      { question: "7+2", answer: 9 },
      { question: "7+3", answer: 10 },
      { question: "7+4", answer: 11 },
      { question: "7+5", answer: 12 },
      { question: "7+6", answer: 13 },
      { question: "7+7", answer: 14 },
      { question: "7+8", answer: 15 },
      { question: "7+9", answer: 16 },
      { question: "7+10", answer: 17 }
    ];

    this.problems8 = [
      { question: "8+0", answer: 8 },
      { question: "8+1", answer: 9 },
      { question: "8+2", answer: 10 },
      { question: "8+3", answer: 11 },
      { question: "8+4", answer: 12 },
      { question: "8+5", answer: 13 },
      { question: "8+6", answer: 14 },
      { question: "8+7", answer: 15 },
      { question: "8+8", answer: 16 },
      { question: "8+9", answer: 17 },
      { question: "8+10", answer: 18 }
    ];

    this.problems9 = [
      { question: "9+0", answer: 9 },
      { question: "9+1", answer: 10 },
      { question: "9+2", answer: 11 },
      { question: "9+3", answer: 12 },
      { question: "9+4", answer: 13 },
      { question: "9+5", answer: 14 },
      { question: "9+6", answer: 15 },
      { question: "9+7", answer: 16 },
      { question: "9+8", answer: 17 },
      { question: "9+9", answer: 18 },
      { question: "9+10", answer: 19 }
    ];

    this.problems10 = [
      { question: "10+0", answer: 10 },
      { question: "10+1", answer: 11 },
      { question: "10+2", answer: 12 },
      { question: "10+3", answer: 13 },
      { question: "10+4", answer: 14 },
      { question: "10+5", answer: 15 },
      { question: "10+6", answer: 16 },
      { question: "10+7", answer: 17 },
      { question: "10+8", answer: 18 },
      { question: "10+9", answer: 19 },
      { question: "10+10", answer: 20 }
    ];

    this.problems11 = [
      { question: "11+0", answer: 11 },
      { question: "11+1", answer: 12 },
      { question: "11+2", answer: 13 },
      { question: "11+3", answer: 14 },
      { question: "11+4", answer: 15 },
      { question: "11+5", answer: 16 },
      { question: "11+6", answer: 17 },
      { question: "11+7", answer: 18 },
      { question: "11+8", answer: 19 },
      { question: "11+9", answer: 20 },
      { question: "11+10", answer: 21 }
    ];

    this.problems12 = [
      { question: "12+0", answer: 12 },
      { question: "12+1", answer: 13 },
      { question: "12+2", answer: 14 },
      { question: "12+3", answer: 15 },
      { question: "12+4", answer: 16 },
      { question: "12+5", answer: 17 },
      { question: "12+6", answer: 18 },
      { question: "12+7", answer: 19 },
      { question: "12+8", answer: 20 },
      { question: "12+9", answer: 21 },
      { question: "12+10", answer: 22 }
    ];

    this.problems13 = [
      { question: "13+0", answer: 13 },
      { question: "13+1", answer: 14 },
      { question: "13+2", answer: 15 },
      { question: "13+3", answer: 16 },
      { question: "13+4", answer: 17 },
      { question: "13+5", answer: 18 },
      { question: "13+6", answer: 19 },
      { question: "13+7", answer: 20 },
      { question: "13+8", answer: 21 },
      { question: "13+9", answer: 22 },
      { question: "13+10", answer: 23 }
    ];

    this.problems14 = [
      { question: "14+0", answer: 14 },
      { question: "14+1", answer: 15 },
      { question: "14+2", answer: 16 },
      { question: "14+3", answer: 17 },
      { question: "14+4", answer: 18 },
      { question: "14+5", answer: 19 },
      { question: "14+6", answer: 20 },
      { question: "14+7", answer: 21 },
      { question: "14+8", answer: 22 },
      { question: "14+9", answer: 23 },
      { question: "14+10", answer: 24 }
    ];

    this.problems15 = [
      { question: "15+0", answer: 15 },
      { question: "15+1", answer: 16 },
      { question: "15+2", answer: 17 },
      { question: "15+3", answer: 18 },
      { question: "15+4", answer: 19 },
      { question: "15+5", answer: 20 },
      { question: "15+6", answer: 21 },
      { question: "15+7", answer: 22 },
      { question: "15+8", answer: 23 },
      { question: "15+9", answer: 24 },
      { question: "15+10", answer: 25 }
    ];

    this.problems16 = [
      { question: "16+0", answer: 16 },
      { question: "16+1", answer: 17 },
      { question: "16+2", answer: 18 },
      { question: "16+3", answer: 19 },
      { question: "16+4", answer: 20 },
      { question: "16+5", answer: 21 },
      { question: "16+6", answer: 22 },
      { question: "16+7", answer: 23 },
      { question: "16+8", answer: 24 },
      { question: "16+9", answer: 25 },
      { question: "16+10", answer: 26 }
    ];

    this.problems17 = [
      { question: "17+0", answer: 17 },
      { question: "17+1", answer: 18 },
      { question: "17+2", answer: 19 },
      { question: "17+3", answer: 20 },
      { question: "17+4", answer: 21 },
      { question: "17+5", answer: 22 },
      { question: "17+6", answer: 23 },
      { question: "17+7", answer: 24 },
      { question: "17+8", answer: 25 },
      { question: "17+9", answer: 26 },
      { question: "17+10", answer: 27 }
    ];

    this.problems18 = [
      { question: "18+0", answer: 18 },
      { question: "18+1", answer: 19 },
      { question: "18+2", answer: 20 },
      { question: "18+3", answer: 21 },
      { question: "18+4", answer: 22 },
      { question: "18+5", answer: 23 },
      { question: "18+6", answer: 24 },
      { question: "18+7", answer: 25 },
      { question: "18+8", answer: 26 },
      { question: "18+9", answer: 27 },
      { question: "18+10", answer: 28 }
    ];

    this.problems19 = [
      { question: "19+0", answer: 19 },
      { question: "19+1", answer: 20 },
      { question: "19+2", answer: 21 },
      { question: "19+3", answer: 22 },
      { question: "19+4", answer: 23 },
      { question: "19+5", answer: 24 },
      { question: "19+6", answer: 25 },
      { question: "19+7", answer: 26 },
      { question: "19+8", answer: 27 },
      { question: "19+9", answer: 28 },
      { question: "19+10", answer: 29 }
    ];

    this.problems20 = [
      { question: "20+0", answer: 20 },
      { question: "20+1", answer: 21 },
      { question: "20+2", answer: 22 },
      { question: "20+3", answer: 23 },
      { question: "20+4", answer: 24 },
      { question: "20+5", answer: 25 },
      { question: "20+6", answer: 26 },
      { question: "20+7", answer: 27 },
      { question: "20+8", answer: 28 },
      { question: "20+9", answer: 29 },
      { question: "20+10", answer: 30 }
    ];

    this.problems21 = [
      { question: "21+0", answer: 21 },
      { question: "21+1", answer: 22 },
      { question: "21+2", answer: 23 },
      { question: "21+3", answer: 24 },
      { question: "21+4", answer: 25 },
      { question: "21+5", answer: 26 },
      { question: "21+6", answer: 27 },
      { question: "21+7", answer: 28 },
      { question: "21+8", answer: 29 },
      { question: "21+9", answer: 30 },
      { question: "21+10", answer: 31 }
    ];

    this.problems22 = [
      { question: "22+0", answer: 22 },
      { question: "22+1", answer: 23 },
      { question: "22+2", answer: 24 },
      { question: "22+3", answer: 25 },
      { question: "22+4", answer: 26 },
      { question: "22+5", answer: 27 },
      { question: "22+6", answer: 28 },
      { question: "22+7", answer: 29 },
      { question: "22+8", answer: 30 },
      { question: "22+9", answer: 31 },
      { question: "22+10", answer: 32 }
    ];

    this.problems23 = [
      { question: "23+0", answer: 23 },
      { question: "23+1", answer: 24 },
      { question: "23+2", answer: 25 },
      { question: "23+3", answer: 26 },
      { question: "23+4", answer: 27 },
      { question: "23+5", answer: 28 },
      { question: "23+6", answer: 29 },
      { question: "23+7", answer: 30 },
      { question: "23+8", answer: 31 },
      { question: "23+9", answer: 32 },
      { question: "23+10", answer: 33 }
    ];

    this.problems24 = [
      { question: "24+0", answer: 24 },
      { question: "24+1", answer: 25 },
      { question: "24+2", answer: 26 },
      { question: "24+3", answer: 27 },
      { question: "24+4", answer: 28 },
      { question: "24+5", answer: 29 },
      { question: "24+6", answer: 30 },
      { question: "24+7", answer: 31 },
      { question: "24+8", answer: 32 },
      { question: "24+9", answer: 33 },
      { question: "24+10", answer: 34 }
    ];

    this.problems25 = [
      { question: "25+0", answer: 25 },
      { question: "25+1", answer: 26 },
      { question: "25+2", answer: 27 },
      { question: "25+3", answer: 28 },
      { question: "25+4", answer: 29 },
      { question: "25+5", answer: 30 },
      { question: "25+6", answer: 31 },
      { question: "25+7", answer: 32 },
      { question: "25+8", answer: 33 },
      { question: "25+9", answer: 34 },
      { question: "25+10", answer: 35 }
    ];

    this.problems26 = [
      { question: "26+0", answer: 26 },
      { question: "26+1", answer: 27 },
      { question: "26+2", answer: 28 },
      { question: "26+3", answer: 29 },
      { question: "26+4", answer: 30 },
      { question: "26+5", answer: 31 },
      { question: "26+6", answer: 32 },
      { question: "26+7", answer: 33 },
      { question: "26+8", answer: 34 },
      { question: "26+9", answer: 35 },
      { question: "26+10", answer: 36 }
    ];

    this.problems27 = [
      { question: "27+0", answer: 27 },
      { question: "27+1", answer: 28 },
      { question: "27+2", answer: 29 },
      { question: "27+3", answer: 30 },
      { question: "27+4", answer: 31 },
      { question: "27+5", answer: 32 },
      { question: "27+6", answer: 33 },
      { question: "27+7", answer: 34 },
      { question: "27+8", answer: 35 },
      { question: "27+9", answer: 36 },
      { question: "27+10", answer: 37 }
    ];

    this.problems28 = [
      { question: "28+0", answer: 28 },
      { question: "28+1", answer: 29 },
      { question: "28+2", answer: 30 },
      { question: "28+3", answer: 31 },
      { question: "28+4", answer: 32 },
      { question: "28+5", answer: 33 },
      { question: "28+6", answer: 34 },
      { question: "28+7", answer: 35 },
      { question: "28+8", answer: 36 },
      { question: "28+9", answer: 37 },
      { question: "28+10", answer: 38 }
    ];

    this.problems29 = [
      { question: "29+0", answer: 29 },
      { question: "29+1", answer: 30 },
      { question: "29+2", answer: 31 },
      { question: "29+3", answer: 32 },
      { question: "29+4", answer: 33 },
      { question: "29+5", answer: 34 },
      { question: "29+6", answer: 35 },
      { question: "29+7", answer: 36 },
      { question: "29+8", answer: 37 },
      { question: "29+9", answer: 38 },
      { question: "29+10", answer: 39 }
    ];

    this.problems30 = [
      { question: "30+0", answer: 30 },
      { question: "30+1", answer: 31 },
      { question: "30+2", answer: 32 },
      { question: "30+3", answer: 33 },
      { question: "30+4", answer: 34 },
      { question: "30+5", answer: 35 },
      { question: "30+6", answer: 36 },
      { question: "30+7", answer: 37 },
      { question: "30+8", answer: 38 },
      { question: "30+9", answer: 39 },
      { question: "30+10", answer: 40 }
    ];

    this.problems31 = [
      { question: "31+0", answer: 31 },
      { question: "31+1", answer: 32 },
      { question: "31+2", answer: 33 },
      { question: "31+3", answer: 34 },
      { question: "31+4", answer: 35 },
      { question: "31+5", answer: 36 },
      { question: "31+6", answer: 37 },
      { question: "31+7", answer: 38 },
      { question: "31+8", answer: 39 },
      { question: "31+9", answer: 40 },
      { question: "31+10", answer: 41 }
    ];

    this.problems32 = [
      { question: "32+0", answer: 32 },
      { question: "32+1", answer: 33 },
      { question: "32+2", answer: 34 },
      { question: "32+3", answer: 35 },
      { question: "32+4", answer: 36 },
      { question: "32+5", answer: 37 },
      { question: "32+6", answer: 38 },
      { question: "32+7", answer: 39 },
      { question: "32+8", answer: 40 },
      { question: "32+9", answer: 41 },
      { question: "32+10", answer: 42 }
    ];

    this.problems33 = [
      { question: "33+0", answer: 33 },
      { question: "33+1", answer: 34 },
      { question: "33+2", answer: 35 },
      { question: "33+3", answer: 36 },
      { question: "33+4", answer: 37 },
      { question: "33+5", answer: 38 },
      { question: "33+6", answer: 39 },
      { question: "33+7", answer: 40 },
      { question: "33+8", answer: 41 },
      { question: "33+9", answer: 42 },
      { question: "33+10", answer: 43 }
    ];

    this.problems34 = [
      { question: "34+0", answer: 34 },
      { question: "34+1", answer: 35 },
      { question: "34+2", answer: 36 },
      { question: "34+3", answer: 37 },
      { question: "34+4", answer: 38 },
      { question: "34+5", answer: 39 },
      { question: "34+6", answer: 40 },
      { question: "34+7", answer: 41 },
      { question: "34+8", answer: 42 },
      { question: "34+9", answer: 43 },
      { question: "34+10", answer: 44 }
    ];

    this.problems35 = [
      { question: "35+0", answer: 35 },
      { question: "35+1", answer: 36 },
      { question: "35+2", answer: 37 },
      { question: "35+3", answer: 38 },
      { question: "35+4", answer: 39 },
      { question: "35+5", answer: 40 },
      { question: "35+6", answer: 41 },
      { question: "35+7", answer: 42 },
      { question: "35+8", answer: 43 },
      { question: "35+9", answer: 44 },
      { question: "35+10", answer: 45 }
    ];

    this.problems36 = [
      { question: "36+0", answer: 36 },
      { question: "36+1", answer: 37 },
      { question: "36+2", answer: 38 },
      { question: "36+3", answer: 39 },
      { question: "36+4", answer: 40 },
      { question: "36+5", answer: 41 },
      { question: "36+6", answer: 42 },
      { question: "36+7", answer: 43 },
      { question: "36+8", answer: 44 },
      { question: "36+9", answer: 45 },
      { question: "36+10", answer: 46 }
    ];

    this.problems37 = [
      { question: "37+0", answer: 37 },
      { question: "37+1", answer: 38 },
      { question: "37+2", answer: 39 },
      { question: "37+3", answer: 40 },
      { question: "37+4", answer: 41 },
      { question: "37+5", answer: 42 },
      { question: "37+6", answer: 43 },
      { question: "37+7", answer: 44 },
      { question: "37+8", answer: 45 },
      { question: "37+9", answer: 46 },
      { question: "37+10", answer: 47 }
    ];

    this.problems38 = [
      { question: "38+0", answer: 38 },
      { question: "38+1", answer: 39 },
      { question: "38+2", answer: 40 },
      { question: "38+3", answer: 41 },
      { question: "38+4", answer: 42 },
      { question: "38+5", answer: 43 },
      { question: "38+6", answer: 44 },
      { question: "38+7", answer: 45 },
      { question: "38+8", answer: 46 },
      { question: "38+9", answer: 47 },
      { question: "38+10", answer: 48 }
    ];

    this.problems39 = [
      { question: "39+0", answer: 39 },
      { question: "39+1", answer: 40 },
      { question: "39+2", answer: 41 },
      { question: "39+3", answer: 42 },
      { question: "39+4", answer: 43 },
      { question: "39+5", answer: 44 },
      { question: "39+6", answer: 45 },
      { question: "39+7", answer: 46 },
      { question: "39+8", answer: 47 },
      { question: "39+9", answer: 48 },
      { question: "39+10", answer: 49 }
    ];

    this.problems40 = [
      { question: "40+0", answer: 40 },
      { question: "40+1", answer: 41 },
      { question: "40+2", answer: 42 },
      { question: "40+3", answer: 43 },
      { question: "40+4", answer: 44 },
      { question: "40+5", answer: 45 },
      { question: "40+6", answer: 46 },
      { question: "40+7", answer: 47 },
      { question: "40+8", answer: 48 },
      { question: "40+9", answer: 49 },
      { question: "40+10", answer: 50 }
    ];

    // 41–50
    this.problems41 = [
      { question: "41+0", answer: 41 },
      { question: "41+1", answer: 42 },
      { question: "41+2", answer: 43 },
      { question: "41+3", answer: 44 },
      { question: "41+4", answer: 45 },
      { question: "41+5", answer: 46 },
      { question: "41+6", answer: 47 },
      { question: "41+7", answer: 48 },
      { question: "41+8", answer: 49 },
      { question: "41+9", answer: 50 },
      { question: "41+10", answer: 51 }
    ];

    this.problems42 = [
      { question: "42+0", answer: 42 },
      { question: "42+1", answer: 43 },
      { question: "42+2", answer: 44 },
      { question: "42+3", answer: 45 },
      { question: "42+4", answer: 46 },
      { question: "42+5", answer: 47 },
      { question: "42+6", answer: 48 },
      { question: "42+7", answer: 49 },
      { question: "42+8", answer: 50 },
      { question: "42+9", answer: 51 },
      { question: "42+10", answer: 52 }
    ];

    this.problems43 = [
      { question: "43+0", answer: 43 },
      { question: "43+1", answer: 44 },
      { question: "43+2", answer: 45 },
      { question: "43+3", answer: 46 },
      { question: "43+4", answer: 47 },
      { question: "43+5", answer: 48 },
      { question: "43+6", answer: 49 },
      { question: "43+7", answer: 50 },
      { question: "43+8", answer: 51 },
      { question: "43+9", answer: 52 },
      { question: "43+10", answer: 53 }
    ];

    this.problems44 = [
      { question: "44+0", answer: 44 },
      { question: "44+1", answer: 45 },
      { question: "44+2", answer: 46 },
      { question: "44+3", answer: 47 },
      { question: "44+4", answer: 48 },
      { question: "44+5", answer: 49 },
      { question: "44+6", answer: 50 },
      { question: "44+7", answer: 51 },
      { question: "44+8", answer: 52 },
      { question: "44+9", answer: 53 },
      { question: "44+10", answer: 54 }
    ];

    this.problems45 = [
      { question: "45+0", answer: 45 },
      { question: "45+1", answer: 46 },
      { question: "45+2", answer: 47 },
      { question: "45+3", answer: 48 },
      { question: "45+4", answer: 49 },
      { question: "45+5", answer: 50 },
      { question: "45+6", answer: 51 },
      { question: "45+7", answer: 52 },
      { question: "45+8", answer: 53 },
      { question: "45+9", answer: 54 },
      { question: "45+10", answer: 55 }
    ];

    this.problems46 = [
      { question: "46+0", answer: 46 },
      { question: "46+1", answer: 47 },
      { question: "46+2", answer: 48 },
      { question: "46+3", answer: 49 },
      { question: "46+4", answer: 50 },
      { question: "46+5", answer: 51 },
      { question: "46+6", answer: 52 },
      { question: "46+7", answer: 53 },
      { question: "46+8", answer: 54 },
      { question: "46+9", answer: 55 },
      { question: "46+10", answer: 56 }
    ];

    this.problems47 = [
      { question: "47+0", answer: 47 },
      { question: "47+1", answer: 48 },
      { question: "47+2", answer: 49 },
      { question: "47+3", answer: 50 },
      { question: "47+4", answer: 51 },
      { question: "47+5", answer: 52 },
      { question: "47+6", answer: 53 },
      { question: "47+7", answer: 54 },
      { question: "47+8", answer: 55 },
      { question: "47+9", answer: 56 },
      { question: "47+10", answer: 57 }
    ];

    this.problems48 = [
      { question: "48+0", answer: 48 },
      { question: "48+1", answer: 49 },
      { question: "48+2", answer: 50 },
      { question: "48+3", answer: 51 },
      { question: "48+4", answer: 52 },
      { question: "48+5", answer: 53 },
      { question: "48+6", answer: 54 },
      { question: "48+7", answer: 55 },
      { question: "48+8", answer: 56 },
      { question: "48+9", answer: 57 },
      { question: "48+10", answer: 58 }
    ];

    this.problems49 = [
      { question: "49+0", answer: 49 },
      { question: "49+1", answer: 50 },
      { question: "49+2", answer: 51 },
      { question: "49+3", answer: 52 },
      { question: "49+4", answer: 53 },
      { question: "49+5", answer: 54 },
      { question: "49+6", answer: 55 },
      { question: "49+7", answer: 56 },
      { question: "49+8", answer: 57 },
      { question: "49+9", answer: 58 },
      { question: "49+10", answer: 59 }
    ];

    this.problems50 = [
      { question: "50+0", answer: 50 },
      { question: "50+1", answer: 51 },
      { question: "50+2", answer: 52 },
      { question: "50+3", answer: 53 },
      { question: "50+4", answer: 54 },
      { question: "50+5", answer: 55 },
      { question: "50+6", answer: 56 },
      { question: "50+7", answer: 57 },
      { question: "50+8", answer: 58 },
      { question: "50+9", answer: 59 },
      { question: "50+10", answer: 60 }
    ];

    // 51–60
    this.problems51 = [
      { question: "51+0", answer: 51 },
      { question: "51+1", answer: 52 },
      { question: "51+2", answer: 53 },
      { question: "51+3", answer: 54 },
      { question: "51+4", answer: 55 },
      { question: "51+5", answer: 56 },
      { question: "51+6", answer: 57 },
      { question: "51+7", answer: 58 },
      { question: "51+8", answer: 59 },
      { question: "51+9", answer: 60 },
      { question: "51+10", answer: 61 }
    ];

    this.problems52 = [
      { question: "52+0", answer: 52 },
      { question: "52+1", answer: 53 },
      { question: "52+2", answer: 54 },
      { question: "52+3", answer: 55 },
      { question: "52+4", answer: 56 },
      { question: "52+5", answer: 57 },
      { question: "52+6", answer: 58 },
      { question: "52+7", answer: 59 },
      { question: "52+8", answer: 60 },
      { question: "52+9", answer: 61 },
      { question: "52+10", answer: 62 }
    ];

    this.problems53 = [
      { question: "53+0", answer: 53 },
      { question: "53+1", answer: 54 },
      { question: "53+2", answer: 55 },
      { question: "53+3", answer: 56 },
      { question: "53+4", answer: 57 },
      { question: "53+5", answer: 58 },
      { question: "53+6", answer: 59 },
      { question: "53+7", answer: 60 },
      { question: "53+8", answer: 61 },
      { question: "53+9", answer: 62 },
      { question: "53+10", answer: 63 }
    ];

    this.problems54 = [
      { question: "54+0", answer: 54 },
      { question: "54+1", answer: 55 },
      { question: "54+2", answer: 56 },
      { question: "54+3", answer: 57 },
      { question: "54+4", answer: 58 },
      { question: "54+5", answer: 59 },
      { question: "54+6", answer: 60 },
      { question: "54+7", answer: 61 },
      { question: "54+8", answer: 62 },
      { question: "54+9", answer: 63 },
      { question: "54+10", answer: 64 }
    ];

    this.problems55 = [
      { question: "55+0", answer: 55 },
      { question: "55+1", answer: 56 },
      { question: "55+2", answer: 57 },
      { question: "55+3", answer: 58 },
      { question: "55+4", answer: 59 },
      { question: "55+5", answer: 60 },
      { question: "55+6", answer: 61 },
      { question: "55+7", answer: 62 },
      { question: "55+8", answer: 63 },
      { question: "55+9", answer: 64 },
      { question: "55+10", answer: 65 }
    ];

    this.problems56 = [
      { question: "56+0", answer: 56 },
      { question: "56+1", answer: 57 },
      { question: "56+2", answer: 58 },
      { question: "56+3", answer: 59 },
      { question: "56+4", answer: 60 },
      { question: "56+5", answer: 61 },
      { question: "56+6", answer: 62 },
      { question: "56+7", answer: 63 },
      { question: "56+8", answer: 64 },
      { question: "56+9", answer: 65 },
      { question: "56+10", answer: 66 }
    ];

    this.problems57 = [
      { question: "57+0", answer: 57 },
      { question: "57+1", answer: 58 },
      { question: "57+2", answer: 59 },
      { question: "57+3", answer: 60 },
      { question: "57+4", answer: 61 },
      { question: "57+5", answer: 62 },
      { question: "57+6", answer: 63 },
      { question: "57+7", answer: 64 },
      { question: "57+8", answer: 65 },
      { question: "57+9", answer: 66 },
      { question: "57+10", answer: 67 }
    ];

    this.problems58 = [
      { question: "58+0", answer: 58 },
      { question: "58+1", answer: 59 },
      { question: "58+2", answer: 60 },
      { question: "58+3", answer: 61 },
      { question: "58+4", answer: 62 },
      { question: "58+5", answer: 63 },
      { question: "58+6", answer: 64 },
      { question: "58+7", answer: 65 },
      { question: "58+8", answer: 66 },
      { question: "58+9", answer: 67 },
      { question: "58+10", answer: 68 }
    ];

    this.problems59 = [
      { question: "59+0", answer: 59 },
      { question: "59+1", answer: 60 },
      { question: "59+2", answer: 61 },
      { question: "59+3", answer: 62 },
      { question: "59+4", answer: 63 },
      { question: "59+5", answer: 64 },
      { question: "59+6", answer: 65 },
      { question: "59+7", answer: 66 },
      { question: "59+8", answer: 67 },
      { question: "59+9", answer: 68 },
      { question: "59+10", answer: 69 }
    ];

    this.problems60 = [
      { question: "60+0", answer: 60 },
      { question: "60+1", answer: 61 },
      { question: "60+2", answer: 62 },
      { question: "60+3", answer: 63 },
      { question: "60+4", answer: 64 },
      { question: "60+5", answer: 65 },
      { question: "60+6", answer: 66 },
      { question: "60+7", answer: 67 },
      { question: "60+8", answer: 68 },
      { question: "60+9", answer: 69 },
      { question: "60+10", answer: 70 }
    ];

    this.problems61 = [
      { question: "61+0", answer: 61 },
      { question: "61+1", answer: 62 },
      { question: "61+2", answer: 63 },
      { question: "61+3", answer: 64 },
      { question: "61+4", answer: 65 },
      { question: "61+5", answer: 66 },
      { question: "61+6", answer: 67 },
      { question: "61+7", answer: 68 },
      { question: "61+8", answer: 69 },
      { question: "61+9", answer: 70 },
      { question: "61+10", answer: 71 }
    ];

    this.problems62 = [
      { question: "62+0", answer: 62 },
      { question: "62+1", answer: 63 },
      { question: "62+2", answer: 64 },
      { question: "62+3", answer: 65 },
      { question: "62+4", answer: 66 },
      { question: "62+5", answer: 67 },
      { question: "62+6", answer: 68 },
      { question: "62+7", answer: 69 },
      { question: "62+8", answer: 70 },
      { question: "62+9", answer: 71 },
      { question: "62+10", answer: 72 }
    ];

    this.problems63 = [
      { question: "63+0", answer: 63 },
      { question: "63+1", answer: 64 },
      { question: "63+2", answer: 65 },
      { question: "63+3", answer: 66 },
      { question: "63+4", answer: 67 },
      { question: "63+5", answer: 68 },
      { question: "63+6", answer: 69 },
      { question: "63+7", answer: 70 },
      { question: "63+8", answer: 71 },
      { question: "63+9", answer: 72 },
      { question: "63+10", answer: 73 }
    ];

    this.problems64 = [
      { question: "64+0", answer: 64 },
      { question: "64+1", answer: 65 },
      { question: "64+2", answer: 66 },
      { question: "64+3", answer: 67 },
      { question: "64+4", answer: 68 },
      { question: "64+5", answer: 69 },
      { question: "64+6", answer: 70 },
      { question: "64+7", answer: 71 },
      { question: "64+8", answer: 72 },
      { question: "64+9", answer: 73 },
      { question: "64+10", answer: 74 }
    ];

    this.problems65 = [
      { question: "65+0", answer: 65 },
      { question: "65+1", answer: 66 },
      { question: "65+2", answer: 67 },
      { question: "65+3", answer: 68 },
      { question: "65+4", answer: 69 },
      { question: "65+5", answer: 70 },
      { question: "65+6", answer: 71 },
      { question: "65+7", answer: 72 },
      { question: "65+8", answer: 73 },
      { question: "65+9", answer: 74 },
      { question: "65+10", answer: 75 }
    ];

    this.problems66 = [
      { question: "66+0", answer: 66 },
      { question: "66+1", answer: 67 },
      { question: "66+2", answer: 68 },
      { question: "66+3", answer: 69 },
      { question: "66+4", answer: 70 },
      { question: "66+5", answer: 71 },
      { question: "66+6", answer: 72 },
      { question: "66+7", answer: 73 },
      { question: "66+8", answer: 74 },
      { question: "66+9", answer: 75 },
      { question: "66+10", answer: 76 }
    ];

    this.problems67 = [
      { question: "67+0", answer: 67 },
      { question: "67+1", answer: 68 },
      { question: "67+2", answer: 69 },
      { question: "67+3", answer: 70 },
      { question: "67+4", answer: 71 },
      { question: "67+5", answer: 72 },
      { question: "67+6", answer: 73 },
      { question: "67+7", answer: 74 },
      { question: "67+8", answer: 75 },
      { question: "67+9", answer: 76 },
      { question: "67+10", answer: 77 }
    ];

    this.problems68 = [
      { question: "68+0", answer: 68 },
      { question: "68+1", answer: 69 },
      { question: "68+2", answer: 70 },
      { question: "68+3", answer: 71 },
      { question: "68+4", answer: 72 },
      { question: "68+5", answer: 73 },
      { question: "68+6", answer: 74 },
      { question: "68+7", answer: 75 },
      { question: "68+8", answer: 76 },
      { question: "68+9", answer: 77 },
      { question: "68+10", answer: 78 }
    ];

    this.problems69 = [
      { question: "69+0", answer: 69 },
      { question: "69+1", answer: 70 },
      { question: "69+2", answer: 71 },
      { question: "69+3", answer: 72 },
      { question: "69+4", answer: 73 },
      { question: "69+5", answer: 74 },
      { question: "69+6", answer: 75 },
      { question: "69+7", answer: 76 },
      { question: "69+8", answer: 77 },
      { question: "69+9", answer: 78 },
      { question: "69+10", answer: 79 }
    ];

    this.problems70 = [
      { question: "70+0", answer: 70 },
      { question: "70+1", answer: 71 },
      { question: "70+2", answer: 72 },
      { question: "70+3", answer: 73 },
      { question: "70+4", answer: 74 },
      { question: "70+5", answer: 75 },
      { question: "70+6", answer: 76 },
      { question: "70+7", answer: 77 },
      { question: "70+8", answer: 78 },
      { question: "70+9", answer: 79 },
      { question: "70+10", answer: 80 }
    ];

    this.problems71 = [
      { question: "71+0", answer: 71 },
      { question: "71+1", answer: 72 },
      { question: "71+2", answer: 73 },
      { question: "71+3", answer: 74 },
      { question: "71+4", answer: 75 },
      { question: "71+5", answer: 76 },
      { question: "71+6", answer: 77 },
      { question: "71+7", answer: 78 },
      { question: "71+8", answer: 79 },
      { question: "71+9", answer: 80 },
      { question: "71+10", answer: 81 }
    ];

    this.problems72 = [
      { question: "72+0", answer: 72 },
      { question: "72+1", answer: 73 },
      { question: "72+2", answer: 74 },
      { question: "72+3", answer: 75 },
      { question: "72+4", answer: 76 },
      { question: "72+5", answer: 77 },
      { question: "72+6", answer: 78 },
      { question: "72+7", answer: 79 },
      { question: "72+8", answer: 80 },
      { question: "72+9", answer: 81 },
      { question: "72+10", answer: 82 }
    ];

    this.problems73 = [
      { question: "73+0", answer: 73 },
      { question: "73+1", answer: 74 },
      { question: "73+2", answer: 75 },
      { question: "73+3", answer: 76 },
      { question: "73+4", answer: 77 },
      { question: "73+5", answer: 78 },
      { question: "73+6", answer: 79 },
      { question: "73+7", answer: 80 },
      { question: "73+8", answer: 81 },
      { question: "73+9", answer: 82 },
      { question: "73+10", answer: 83 }
    ];

    this.problems74 = [
      { question: "74+0", answer: 74 },
      { question: "74+1", answer: 75 },
      { question: "74+2", answer: 76 },
      { question: "74+3", answer: 77 },
      { question: "74+4", answer: 78 },
      { question: "74+5", answer: 79 },
      { question: "74+6", answer: 80 },
      { question: "74+7", answer: 81 },
      { question: "74+8", answer: 82 },
      { question: "74+9", answer: 83 },
      { question: "74+10", answer: 84 }
    ];

    this.problems75 = [
      { question: "75+0", answer: 75 },
      { question: "75+1", answer: 76 },
      { question: "75+2", answer: 77 },
      { question: "75+3", answer: 78 },
      { question: "75+4", answer: 79 },
      { question: "75+5", answer: 80 },
      { question: "75+6", answer: 81 },
      { question: "75+7", answer: 82 },
      { question: "75+8", answer: 83 },
      { question: "75+9", answer: 84 },
      { question: "75+10", answer: 85 }
    ];

    this.problems76 = [
      { question: "76+0", answer: 76 },
      { question: "76+1", answer: 77 },
      { question: "76+2", answer: 78 },
      { question: "76+3", answer: 79 },
      { question: "76+4", answer: 80 },
      { question: "76+5", answer: 81 },
      { question: "76+6", answer: 82 },
      { question: "76+7", answer: 83 },
      { question: "76+8", answer: 84 },
      { question: "76+9", answer: 85 },
      { question: "76+10", answer: 86 }
    ];

    this.problems77 = [
      { question: "77+0", answer: 77 },
      { question: "77+1", answer: 78 },
      { question: "77+2", answer: 79 },
      { question: "77+3", answer: 80 },
      { question: "77+4", answer: 81 },
      { question: "77+5", answer: 82 },
      { question: "77+6", answer: 83 },
      { question: "77+7", answer: 84 },
      { question: "77+8", answer: 85 },
      { question: "77+9", answer: 86 },
      { question: "77+10", answer: 87 }
    ];

    this.problems78 = [
      { question: "78+0", answer: 78 },
      { question: "78+1", answer: 79 },
      { question: "78+2", answer: 80 },
      { question: "78+3", answer: 81 },
      { question: "78+4", answer: 82 },
      { question: "78+5", answer: 83 },
      { question: "78+6", answer: 84 },
      { question: "78+7", answer: 85 },
      { question: "78+8", answer: 86 },
      { question: "78+9", answer: 87 },
      { question: "78+10", answer: 88 }
    ];

    this.problems79 = [
      { question: "79+0", answer: 79 },
      { question: "79+1", answer: 80 },
      { question: "79+2", answer: 81 },
      { question: "79+3", answer: 82 },
      { question: "79+4", answer: 83 },
      { question: "79+5", answer: 84 },
      { question: "79+6", answer: 85 },
      { question: "79+7", answer: 86 },
      { question: "79+8", answer: 87 },
      { question: "79+9", answer: 88 },
      { question: "79+10", answer: 89 }
    ];

    this.problems80 = [
      { question: "80+0", answer: 80 },
      { question: "80+1", answer: 81 },
      { question: "80+2", answer: 82 },
      { question: "80+3", answer: 83 },
      { question: "80+4", answer: 84 },
      { question: "80+5", answer: 85 },
      { question: "80+6", answer: 86 },
      { question: "80+7", answer: 87 },
      { question: "80+8", answer: 88 },
      { question: "80+9", answer: 89 },
      { question: "80+10", answer: 90 }
    ];

    this.problems81 = [
      { question: "81+0", answer: 81 },
      { question: "81+1", answer: 82 },
      { question: "81+2", answer: 83 },
      { question: "81+3", answer: 84 },
      { question: "81+4", answer: 85 },
      { question: "81+5", answer: 86 },
      { question: "81+6", answer: 87 },
      { question: "81+7", answer: 88 },
      { question: "81+8", answer: 89 },
      { question: "81+9", answer: 90 },
      { question: "81+10", answer: 91 }
    ];

    this.problems82 = [
      { question: "82+0", answer: 82 },
      { question: "82+1", answer: 83 },
      { question: "82+2", answer: 84 },
      { question: "82+3", answer: 85 },
      { question: "82+4", answer: 86 },
      { question: "82+5", answer: 87 },
      { question: "82+6", answer: 88 },
      { question: "82+7", answer: 89 },
      { question: "82+8", answer: 90 },
      { question: "82+9", answer: 91 },
      { question: "82+10", answer: 92 }
    ];

    this.problems83 = [
      { question: "83+0", answer: 83 },
      { question: "83+1", answer: 84 },
      { question: "83+2", answer: 85 },
      { question: "83+3", answer: 86 },
      { question: "83+4", answer: 87 },
      { question: "83+5", answer: 88 },
      { question: "83+6", answer: 89 },
      { question: "83+7", answer: 90 },
      { question: "83+8", answer: 91 },
      { question: "83+9", answer: 92 },
      { question: "83+10", answer: 93 }
    ];

    this.problems84 = [
      { question: "84+0", answer: 84 },
      { question: "84+1", answer: 85 },
      { question: "84+2", answer: 86 },
      { question: "84+3", answer: 87 },
      { question: "84+4", answer: 88 },
      { question: "84+5", answer: 89 },
      { question: "84+6", answer: 90 },
      { question: "84+7", answer: 91 },
      { question: "84+8", answer: 92 },
      { question: "84+9", answer: 93 },
      { question: "84+10", answer: 94 }
    ];

    this.problems85 = [
      { question: "85+0", answer: 85 },
      { question: "85+1", answer: 86 },
      { question: "85+2", answer: 87 },
      { question: "85+3", answer: 88 },
      { question: "85+4", answer: 89 },
      { question: "85+5", answer: 90 },
      { question: "85+6", answer: 91 },
      { question: "85+7", answer: 92 },
      { question: "85+8", answer: 93 },
      { question: "85+9", answer: 94 },
      { question: "85+10", answer: 95 }
    ];

    this.problems86 = [
      { question: "86+0", answer: 86 },
      { question: "86+1", answer: 87 },
      { question: "86+2", answer: 88 },
      { question: "86+3", answer: 89 },
      { question: "86+4", answer: 90 },
      { question: "86+5", answer: 91 },
      { question: "86+6", answer: 92 },
      { question: "86+7", answer: 93 },
      { question: "86+8", answer: 94 },
      { question: "86+9", answer: 95 },
      { question: "86+10", answer: 96 }
    ];

    this.problems87 = [
      { question: "87+0", answer: 87 },
      { question: "87+1", answer: 88 },
      { question: "87+2", answer: 89 },
      { question: "87+3", answer: 90 },
      { question: "87+4", answer: 91 },
      { question: "87+5", answer: 92 },
      { question: "87+6", answer: 93 },
      { question: "87+7", answer: 94 },
      { question: "87+8", answer: 95 },
      { question: "87+9", answer: 96 },
      { question: "87+10", answer: 97 }
    ];

    this.problems88 = [
      { question: "88+0", answer: 88 },
      { question: "88+1", answer: 89 },
      { question: "88+2", answer: 90 },
      { question: "88+3", answer: 91 },
      { question: "88+4", answer: 92 },
      { question: "88+5", answer: 93 },
      { question: "88+6", answer: 94 },
      { question: "88+7", answer: 95 },
      { question: "88+8", answer: 96 },
      { question: "88+9", answer: 97 },
      { question: "88+10", answer: 98 }
    ];

    this.problems89 = [
      { question: "89+0", answer: 89 },
      { question: "89+1", answer: 90 },
      { question: "89+2", answer: 91 },
      { question: "89+3", answer: 92 },
      { question: "89+4", answer: 93 },
      { question: "89+5", answer: 94 },
      { question: "89+6", answer: 95 },
      { question: "89+7", answer: 96 },
      { question: "89+8", answer: 97 },
      { question: "89+9", answer: 98 },
      { question: "89+10", answer: 99 }
    ];

    this.problems90 = [
      { question: "90+0", answer: 90 },
      { question: "90+1", answer: 91 },
      { question: "90+2", answer: 92 },
      { question: "90+3", answer: 93 },
      { question: "90+4", answer: 94 },
      { question: "90+5", answer: 95 },
      { question: "90+6", answer: 96 },
      { question: "90+7", answer: 97 },
      { question: "90+8", answer: 98 },
      { question: "90+9", answer: 99 },
      { question: "90+10", answer: 100 }
    ];

    this.problems91 = [
      { question: "91+0", answer: 91 },
      { question: "91+1", answer: 92 },
      { question: "91+2", answer: 93 },
      { question: "91+3", answer: 94 },
      { question: "91+4", answer: 95 },
      { question: "91+5", answer: 96 },
      { question: "91+6", answer: 97 },
      { question: "91+7", answer: 98 },
      { question: "91+8", answer: 99 },
      { question: "91+9", answer: 100 },
      { question: "91+10", answer: 101 }
    ];

    this.problems92 = [
      { question: "92+0", answer: 92 },
      { question: "92+1", answer: 93 },
      { question: "92+2", answer: 94 },
      { question: "92+3", answer: 95 },
      { question: "92+4", answer: 96 },
      { question: "92+5", answer: 97 },
      { question: "92+6", answer: 98 },
      { question: "92+7", answer: 99 },
      { question: "92+8", answer: 100 },
      { question: "92+9", answer: 101 },
      { question: "92+10", answer: 102 }
    ];

    this.problems93 = [
      { question: "93+0", answer: 93 },
      { question: "93+1", answer: 94 },
      { question: "93+2", answer: 95 },
      { question: "93+3", answer: 96 },
      { question: "93+4", answer: 97 },
      { question: "93+5", answer: 98 },
      { question: "93+6", answer: 99 },
      { question: "93+7", answer: 100 },
      { question: "93+8", answer: 101 },
      { question: "93+9", answer: 102 },
      { question: "93+10", answer: 103 }
    ];

    this.problems94 = [
      { question: "94+0", answer: 94 },
      { question: "94+1", answer: 95 },
      { question: "94+2", answer: 96 },
      { question: "94+3", answer: 97 },
      { question: "94+4", answer: 98 },
      { question: "94+5", answer: 99 },
      { question: "94+6", answer: 100 },
      { question: "94+7", answer: 101 },
      { question: "94+8", answer: 102 },
      { question: "94+9", answer: 103 },
      { question: "94+10", answer: 104 }
    ];

    this.problems95 = [
      { question: "95+0", answer: 95 },
      { question: "95+1", answer: 96 },
      { question: "95+2", answer: 97 },
      { question: "95+3", answer: 98 },
      { question: "95+4", answer: 99 },
      { question: "95+5", answer: 100 },
      { question: "95+6", answer: 101 },
      { question: "95+7", answer: 102 },
      { question: "95+8", answer: 103 },
      { question: "95+9", answer: 104 },
      { question: "95+10", answer: 105 }
    ];

    this.problems96 = [
      { question: "96+0", answer: 96 },
      { question: "96+1", answer: 97 },
      { question: "96+2", answer: 98 },
      { question: "96+3", answer: 99 },
      { question: "96+4", answer: 100 },
      { question: "96+5", answer: 101 },
      { question: "96+6", answer: 102 },
      { question: "96+7", answer: 103 },
      { question: "96+8", answer: 104 },
      { question: "96+9", answer: 105 },
      { question: "96+10", answer: 106 }
    ];

    this.problems97 = [
      { question: "97+0", answer: 97 },
      { question: "97+1", answer: 98 },
      { question: "97+2", answer: 99 },
      { question: "97+3", answer: 100 },
      { question: "97+4", answer: 101 },
      { question: "97+5", answer: 102 },
      { question: "97+6", answer: 103 },
      { question: "97+7", answer: 104 },
      { question: "97+8", answer: 105 },
      { question: "97+9", answer: 106 },
      { question: "97+10", answer: 107 }
    ];

    this.problems98 = [
      { question: "98+0", answer: 98 },
      { question: "98+1", answer: 99 },
      { question: "98+2", answer: 100 },
      { question: "98+3", answer: 101 },
      { question: "98+4", answer: 102 },
      { question: "98+5", answer: 103 },
      { question: "98+6", answer: 104 },
      { question: "98+7", answer: 105 },
      { question: "98+8", answer: 106 },
      { question: "98+9", answer: 107 },
      { question: "98+10", answer: 108 }
    ];

    this.problems99 = [
      { question: "99+0", answer: 99 },
      { question: "99+1", answer: 100 },
      { question: "99+2", answer: 101 },
      { question: "99+3", answer: 102 },
      { question: "99+4", answer: 103 },
      { question: "99+5", answer: 104 },
      { question: "99+6", answer: 105 },
      { question: "99+7", answer: 106 },
      { question: "99+8", answer: 107 },
      { question: "99+9", answer: 108 },
      { question: "99+10", answer: 109 }
    ];

    this.problems100 = [
      { question: "100+0", answer: 100 },
      { question: "100+1", answer: 101 },
      { question: "100+2", answer: 102 },
      { question: "100+3", answer: 103 },
      { question: "100+4", answer: 104 },
      { question: "100+5", answer: 105 },
      { question: "100+6", answer: 106 },
      { question: "100+7", answer: 107 },
      { question: "100+8", answer: 108 },
      { question: "100+9", answer: 109 },
      { question: "100+10", answer: 110 }
    ];


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
    this.trash1 = new Trash(this, 100, 280, this.question1).setScale(0.6);
    this.trash2 = new Trash(this, 440, 340, this.question2).setScale(0.6);
    this.trash3 = new Trash(this, 740, 280, this.question3).setScale(0.6);
    this.trash4 = new Trash(this, 1040, 340, this.question4).setScale(0.6);
    this.trash5 = new Trash(this, 1340, 280, this.question5).setScale(0.6);
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