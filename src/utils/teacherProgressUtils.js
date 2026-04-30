// src/utils/teacherProgressUtils.js

// 🔥 CENTRALIZED PROGRESS LOGIC
// 0–60  = red / Needs attention
// 61–79 = orange / Struggling
// 80+   = green / On Track

function clampPercent(percent = 0) {
  const number = Number(percent);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function safeNumber(value = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function getProgressSeverity(
  percent = 0,
  wrongTries = 0,
  completed = false,
  locked = false
) {
  const safePercent = clampPercent(percent);

  if (locked) return "locked";
  if (!completed) return "watch";
  if (safePercent <= 60) return "failing";
  if (safePercent <= 79) return "attention";

  return safePercent === 100 ? "perfect" : "ok";
}

export function getSeverityLabel(severity) {
  if (severity === "failing") return "Needs attention 🔴";
  if (severity === "attention") return "Struggling 🟠";
  if (severity === "ok") return "On track 🟢";
  if (severity === "perfect") return "Perfect ⭐";
  if (severity === "locked") return "Locked 🔒";
  if (severity === "watch") return "Not started";
  return "Not started";
}

// ✅ This keeps the same name your dashboard already expects
export function buildProgressMeta({
  percent = 0,
  wrongTries = 0,
  completed = false,
  locked = false,
}) {
  const safePercent = clampPercent(percent);
  const safeWrong = safeNumber(wrongTries);

  const severity = getProgressSeverity(
    safePercent,
    safeWrong,
    completed,
    locked
  );

  return {
    percent: safePercent,
    wrongTries: safeWrong,
    completed,
    locked,
    severity,
    label: getSeverityLabel(severity),

    // ✅ These match AssignmentResults.css
    fillClass: `tdash-results__bar-fill--${severity}`,

    cardClass:
      severity === "failing"
        ? "tdash-results__card--failing"
        : severity === "attention"
        ? "tdash-results__card--attention"
        : severity === "perfect"
        ? "tdash-results__card--perfect"
        : severity === "locked"
        ? "tdash-results__card--locked"
        : severity === "watch"
        ? "tdash-results__card--empty"
        : "tdash-results__card--ok",
  };
}

// ✅ Sort students inside one assignment:
// Needs attention first, then struggling, then on track, not started last
export function sortWorstFirst(rows = []) {
  return [...rows].sort((a, b) => {
    const aCompleted = !!a.completed;
    const bCompleted = !!b.completed;

    if (aCompleted !== bCompleted) {
      return aCompleted ? -1 : 1;
    }

    const aPercent = clampPercent(a.medianPercent ?? a.latestPercent);
    const bPercent = clampPercent(b.medianPercent ?? b.latestPercent);

    if (aPercent !== bPercent) {
      return aPercent - bPercent;
    }

    const aWrong = safeNumber(a.medianWrongTries ?? a.latestWrongTries);
    const bWrong = safeNumber(b.medianWrongTries ?? b.latestWrongTries);

    return bWrong - aWrong;
  });
}

// ✅ Sort assignments:
// Worst class performance first
export function sortAssignmentsWorstFirst(assignments = []) {
  return [...assignments].sort((a, b) => {
    const aPercent = clampPercent(a.percentage);
    const bPercent = clampPercent(b.percentage);

    if (aPercent !== bPercent) {
      return aPercent - bPercent;
    }

    return safeNumber(b.failingCount) - safeNumber(a.failingCount);
  });
}