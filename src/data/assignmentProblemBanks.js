// src/data/assignmentProblemBanks.js

function cleanProblems(list = []) {
  const seen = new Set();

  return list
    .map((p) => ({
      question: String(p?.question ?? "").trim(),
      answer: Number(p?.answer),
    }))
    .filter((p) => p.question && !Number.isNaN(p.answer))
    .filter((p) => {
      const key = `${p.question}::${p.answer}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function makePreset(id, label, description, problems, meta = {}) {
  return {
    id,
    label,
    description,
    problems: cleanProblems(problems),
    ...meta,
  };
}

function flattenPresets(presets = []) {
  return cleanProblems(presets.flatMap((preset) => preset.problems || []));
}

export const assignmentCatalog = [
  { gameKey: "1st_addition", title: "1st Grade Addition", grade: 1 },
  { gameKey: "1st_subtraction", title: "1st Grade Subtraction", grade: 1 },
  { gameKey: "2nd_addition", title: "2nd Grade Addition", grade: 2 },
  { gameKey: "2nd_subtraction", title: "2nd Grade Subtraction", grade: 2 },
  { gameKey: "2nd_fill_blank", title: "2nd Grade Fill in the Blank", grade: 2 },
  { gameKey: "2nd_place_value", title: "2nd Grade Place Value", grade: 2 },
  { gameKey: "2nd_multiplication", title: "2nd Grade Multiplication", grade: 2 },
  { gameKey: "2nd_division", title: "2nd Grade Division", grade: 2 },
];

/* -----------------------------
   AUTO-GENERATORS
----------------------------- */

function makeAdditionFamilies(maxFamily = 10, maxOther = 10) {
  return Array.from({ length: maxFamily + 1 }, (_, family) => ({
    family,
    problems: cleanProblems(
      Array.from({ length: maxOther + 1 }, (_, other) => ({
        question: `${family}+${other}`,
        answer: family + other,
      }))
    ),
  }));
}

function makeSubtractionFamilies(maxFamily = 10) {
  return Array.from({ length: maxFamily + 1 }, (_, family) => ({
    family,
    problems: cleanProblems(
      Array.from({ length: maxFamily + 1 }, (_, start) => {
        const top = Math.max(start, family);
        return {
          question: `${top}-${family}`,
          answer: top - family,
        };
      })
    ),
  }));
}

function makeMultiplicationFamilies(maxFamily = 10, maxOther = 10) {
  return Array.from({ length: maxFamily + 1 }, (_, family) => ({
    family,
    problems: cleanProblems(
      Array.from({ length: maxOther + 1 }, (_, other) => ({
        question: `${family}×${other}`,
        answer: family * other,
      }))
    ),
  }));
}

function makeDivisionFamilies(maxFamily = 10, maxOther = 10) {
  return Array.from({ length: maxFamily + 1 }, (_, family) => ({
    family,
    problems: cleanProblems(
      Array.from({ length: maxOther + 1 }, (_, other) => {
        if (family === 0) {
          return {
            question: `${other}÷1`,
            answer: other,
          };
        }

        return {
          question: `${family * other}÷${family}`,
          answer: other,
        };
      })
    ),
  }));
}

function makeFillBlankFamilies(maxFamily = 10) {
  return Array.from({ length: maxFamily + 1 }, (_, family) => ({
    family,
    problems: cleanProblems([
      ...Array.from({ length: 11 }, (_, other) => ({
        question: `__ + ${other} = ${family + other}`,
        answer: family,
      })),
      ...Array.from({ length: 11 }, (_, other) => ({
        question: `${family + other} - __ = ${other}`,
        answer: family,
      })),
    ]),
  }));
}

function makePlaceValueFamilies() {
  return [
    {
      family: "ones",
      label: "Ones",
      problems: cleanProblems(
        Array.from({ length: 90 }, (_, i) => {
          const number = i + 10;
          return {
            question: `How many ones are in ${number}?`,
            answer: number % 10,
          };
        })
      ),
    },
    {
      family: "tens",
      label: "Tens",
      problems: cleanProblems(
        Array.from({ length: 90 }, (_, i) => {
          const number = i + 10;
          return {
            question: `How many tens are in ${number}?`,
            answer: Math.floor(number / 10),
          };
        })
      ),
    },
    {
      family: "hundreds",
      label: "Hundreds",
      problems: cleanProblems(
        Array.from({ length: 900 }, (_, i) => {
          const number = i + 100;
          return {
            question: `How many hundreds are in ${number}?`,
            answer: Math.floor(number / 100),
          };
        })
      ),
    },
  ];
}

/* -----------------------------
   PRESET BUILDERS
----------------------------- */

function buildFamilyPresets({
  families,
  labelPrefix = "",
  descriptionVerb = "Practice",
  easyMax = 3,
  practiceMax = 7,
}) {
  const familyPresets = families.map((group) => {
    const family = group.family;
    const label = group.label || `${family}s`;

    let adaptiveLevel = "challenge";
    if (typeof family === "number" && family <= easyMax) adaptiveLevel = "easy";
    else if (typeof family === "number" && family <= practiceMax) {
      adaptiveLevel = "practice";
    }

    return makePreset(
      `family_${family}`,
      labelPrefix ? `${labelPrefix} ${label}` : label,
      `${descriptionVerb} the ${label} family.`,
      group.problems,
      {
        groupType: "number-family",
        family,
        adaptiveLevel,
        highlightWeakGroups: true,
      }
    );
  });

  return [
    ...familyPresets,

    makePreset(
      "recommended_easy",
      "Recommended: Easy Start",
      "Good for students who need the simplest families first.",
      familyPresets
        .filter((preset) => preset.adaptiveLevel === "easy")
        .flatMap((preset) => preset.problems),
      {
        groupType: "recommended",
        adaptiveLevel: "easy",
        highlightWeakGroups: true,
      }
    ),

    makePreset(
      "recommended_practice",
      "Recommended: Extra Practice",
      "Good for students who are close but still need review.",
      familyPresets
        .filter((preset) => preset.adaptiveLevel === "practice")
        .flatMap((preset) => preset.problems),
      {
        groupType: "recommended",
        adaptiveLevel: "practice",
        highlightWeakGroups: true,
      }
    ),

    makePreset(
      "recommended_challenge",
      "Recommended: Challenge",
      "Good for students who are ready for harder families.",
      familyPresets
        .filter((preset) => preset.adaptiveLevel === "challenge")
        .flatMap((preset) => preset.problems),
      {
        groupType: "recommended",
        adaptiveLevel: "challenge",
        highlightWeakGroups: true,
      }
    ),

    makePreset(
      "mixed_review",
      "Mixed Review",
      "A smaller mix from all number families.",
      familyPresets.flatMap((preset, index) =>
        index % 2 === 0 ? preset.problems.slice(0, 5) : preset.problems.slice(2, 7)
      ),
      {
        groupType: "mixed",
        adaptiveLevel: "mixed",
      }
    ),

    makePreset(
      "full_game_set",
      "Full Set",
      "Every problem from this game’s auto-generated families.",
      familyPresets.flatMap((preset) => preset.problems),
      {
        groupType: "full",
        adaptiveLevel: "full",
      }
    ),
  ];
}

/* -----------------------------
   GAME BANKS
----------------------------- */

const firstAdditionPresets = buildFamilyPresets({
  families: makeAdditionFamilies(10, 10),
  descriptionVerb: "Practice adding",
});

const firstSubtractionPresets = buildFamilyPresets({
  families: makeSubtractionFamilies(10),
  labelPrefix: "Subtract",
  descriptionVerb: "Practice subtracting",
});

const secondAdditionPresets = buildFamilyPresets({
  families: makeAdditionFamilies(20, 20),
  descriptionVerb: "Practice adding",
  easyMax: 5,
  practiceMax: 12,
});

const secondSubtractionPresets = buildFamilyPresets({
  families: makeSubtractionFamilies(20),
  labelPrefix: "Subtract",
  descriptionVerb: "Practice subtracting",
  easyMax: 5,
  practiceMax: 12,
});

const fillBlankPresets = buildFamilyPresets({
  families: makeFillBlankFamilies(20),
  labelPrefix: "Missing",
  descriptionVerb: "Practice finding",
  easyMax: 5,
  practiceMax: 12,
});

const multiplicationPresets = buildFamilyPresets({
  families: makeMultiplicationFamilies(10, 10),
  descriptionVerb: "Practice multiplying by",
  easyMax: 3,
  practiceMax: 7,
});

const divisionPresets = buildFamilyPresets({
  families: makeDivisionFamilies(10, 10),
  descriptionVerb: "Practice dividing by",
  easyMax: 3,
  practiceMax: 7,
});

const placeValuePresets = buildFamilyPresets({
  families: makePlaceValueFamilies(),
  descriptionVerb: "Practice",
});

/* -----------------------------
   EXPORTS
----------------------------- */

export const assignmentProblemBanks = {
  "1st_addition": {
    presets: firstAdditionPresets,
    flatBuiltInProblems: flattenPresets(firstAdditionPresets),
  },

  "1st_subtraction": {
    presets: firstSubtractionPresets,
    flatBuiltInProblems: flattenPresets(firstSubtractionPresets),
  },

  "2nd_addition": {
    presets: secondAdditionPresets,
    flatBuiltInProblems: flattenPresets(secondAdditionPresets),
  },

  "2nd_subtraction": {
    presets: secondSubtractionPresets,
    flatBuiltInProblems: flattenPresets(secondSubtractionPresets),
  },

  "2nd_fill_blank": {
    presets: fillBlankPresets,
    flatBuiltInProblems: flattenPresets(fillBlankPresets),
  },

  "2nd_place_value": {
    presets: placeValuePresets,
    flatBuiltInProblems: flattenPresets(placeValuePresets),
  },

  "2nd_multiplication": {
    presets: multiplicationPresets,
    flatBuiltInProblems: flattenPresets(multiplicationPresets),
  },

  "2nd_division": {
    presets: divisionPresets,
    flatBuiltInProblems: flattenPresets(divisionPresets),
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