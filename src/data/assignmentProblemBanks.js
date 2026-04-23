// src/data/assignmentProblemBanks.js

function cloneProblems(list = []) {
  return list.map((problem) => ({
    question: String(problem?.question ?? "").trim(),
    answer: Number(problem?.answer),
  }));
}

export const assignmentCatalog = [
  { gameKey: "1st_addition", title: "1st Grade Addition", grade: 1 },
  { gameKey: "1st_subtraction", title: "1st Grade Subtraction", grade: 1 },
  { gameKey: "2nd_addition", title: "2nd Grade Addition", grade: 2 },
  { gameKey: "2nd_subtraction", title: "2nd Grade Subtraction", grade: 2 },
  { gameKey: "2nd_fill_blank", title: "2nd Grade Fill in the Blank", grade: 2 },
  { gameKey: "2nd_place_value", title: "2nd Grade Place Value", grade: 2 },
  { gameKey: "2nd_multiplication", title: "2nd Grade Multiplication", grade: 2 },
];

/*
  Put the arrays from each game in here.
  Each game can have:
  - presets: whole groups/sets the teacher can enable for the week
  - flatBuiltInProblems: optional one big bank for per-problem toggling

  You can paste as many preset arrays as you want.
*/

export const assignmentProblemBanks = {
  "1st_addition": {
    presets: [
      {
        id: "week_1",
        label: "Week 1",
        problems: cloneProblems([
          { question: "1+0", answer: 1 },
          { question: "1+1", answer: 2 },
          { question: "1+2", answer: 3 },
          { question: "1+3", answer: 4 },
          { question: "1+4", answer: 5 },
        ]),
      },
      {
        id: "week_2",
        label: "Week 2",
        problems: cloneProblems([
          { question: "2+0", answer: 2 },
          { question: "2+1", answer: 3 },
          { question: "2+2", answer: 4 },
          { question: "2+3", answer: 5 },
          { question: "2+4", answer: 6 },
        ]),
      },
    ],
    flatBuiltInProblems: cloneProblems([
      { question: "1+0", answer: 1 },
      { question: "1+1", answer: 2 },
      { question: "1+2", answer: 3 },
      { question: "1+3", answer: 4 },
      { question: "1+4", answer: 5 },
      { question: "2+0", answer: 2 },
      { question: "2+1", answer: 3 },
      { question: "2+2", answer: 4 },
      { question: "2+3", answer: 5 },
      { question: "2+4", answer: 6 },
    ]),
  },

  "1st_subtraction": {
    presets: [],
    flatBuiltInProblems: [],
  },

  "2nd_addition": {
    presets: [],
    flatBuiltInProblems: [],
  },

  "2nd_subtraction": {
    presets: [],
    flatBuiltInProblems: [],
  },

  "2nd_fill_blank": {
    presets: [],
    flatBuiltInProblems: [],
  },

  "2nd_place_value": {
    presets: [],
    flatBuiltInProblems: [],
  },

  "2nd_multiplication": {
    presets: [],
    flatBuiltInProblems: [],
  },
};

export function getProblemBankForGame(gameKey) {
  return (
    assignmentProblemBanks[gameKey] || {
      presets: [],
      flatBuiltInProblems: [],
    }
  );
}