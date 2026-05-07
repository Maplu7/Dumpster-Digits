import React, { useMemo, useState } from "react";
import { buildProgressMeta } from "../../utils/teacherProgressUtils";
import "./AssignmentResults.css";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(safeNumber(value, 0))));
}

function plural(value, singular, pluralText = `${singular}s`) {
  return `${value} ${value === 1 ? singular : pluralText}`;
}

function getAttemptTimestamp(attempt) {
  const raw = attempt?.completedAt || attempt?.submittedAt || attempt?.createdAt;

  if (!raw) return 0;
  if (typeof raw.toDate === "function") return raw.toDate().getTime();
  if (typeof raw.seconds === "number") return raw.seconds * 1000;

  const parsed = new Date(raw).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortAttemptsLatestFirst(attempts = []) {
  return [...attempts].sort(
    (a, b) => getAttemptTimestamp(b) - getAttemptTimestamp(a)
  );
}

function getSeverityLabel(severity) {
  if (severity === "failing") return "Needs attention 🔴";
  if (severity === "attention") return "Struggling 🟠";
  if (severity === "ok" || severity === "good") return "On track 🟢";
  if (severity === "perfect") return "Perfect ⭐";
  if (severity === "locked") return "Locked 🔒";

  return "Not started";
}

function getAttemptDateValue(attempt) {
  return attempt?.completedAt || attempt?.submittedAt || attempt?.createdAt || null;
}

function getProblemLabelFromAnswer(answer) {
  return (
    answer?.problem ||
    answer?.question ||
    answer?.prompt ||
    "Unknown problem"
  );
}

/* -------------------------------------------------------------------------- */
/* Small UI pieces                                                            */
/* -------------------------------------------------------------------------- */

function ProgressBar({
  percent = 0,
  wrongTries = 0,
  completed = true,
  locked = false,
  label = "Progress",
}) {
  const progress = buildProgressMeta({
    percent: clampPercent(percent),
    wrongTries: safeNumber(wrongTries),
    completed,
    locked,
  });

  return (
    <div
      className="tdash-results__bar-wrap"
      aria-label={`${label}: ${progress.percent} / 100`}
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={progress.percent}
    >
      <div
        className={`tdash-results__bar-fill ${progress.fillClass}`}
        style={{ width: `${progress.percent}%` }}
      />
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  variant = "",
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`tdash-results__pill ${variant} ${
        active ? "tdash-results__pill--active" : ""
      }`}
      onClick={onClick}
    >
      <span className="tdash-results__pill-icon">{icon}</span>
      <strong>{value}</strong>
      <span>{label}</span>
    </button>
  );
}

function EmptyState({ children }) {
  return <p className="tdash__empty-text">{children}</p>;
}

/* -------------------------------------------------------------------------- */
/* Insight helpers                                                            */
/* -------------------------------------------------------------------------- */

function collectMissedProblemStats(
  classAssignmentProgress = [],
  getStudentAttemptsForAssignment
) {
  const missed = new Map();

  function addMiss(problem, wrong, studentName, assignmentTitle = "") {
    const safeProblem = String(problem || "").trim();
    const safeWrong = safeNumber(wrong);

    if (!safeProblem || safeWrong <= 0) return;

    const current = missed.get(safeProblem) || {
      problem: safeProblem,
      assignmentTitle,
      misses: 0,
      students: new Map(),
    };

    current.misses += safeWrong;
    current.students.set(
      studentName,
      (current.students.get(studentName) || 0) + safeWrong
    );

    if (!current.assignmentTitle && assignmentTitle) {
      current.assignmentTitle = assignmentTitle;
    }

    missed.set(safeProblem, current);
  }

  classAssignmentProgress.forEach((assignmentProgress) => {
    const gameKey =
      assignmentProgress?.assignment?.gameKey || assignmentProgress?.gameKey;

    const assignmentTitle =
      assignmentProgress?.assignment?.title ||
      assignmentProgress?.assignmentTitle ||
      gameKey ||
      "Unknown game";

    (assignmentProgress?.rows || []).forEach((row) => {
      const studentId = row?.student?.id;
      const studentName = row?.student?.name || `Student ${studentId}`;

      if (!studentId || !gameKey) return;

      const attempts = getStudentAttemptsForAssignment?.(studentId, gameKey) || [];

      attempts.forEach((attempt) => {
        if (attempt?.problemBreakdown && typeof attempt.problemBreakdown === "object") {
          Object.entries(attempt.problemBreakdown).forEach(([problem, tries]) => {
            addMiss(problem, tries, studentName, assignmentTitle);
          });
        }

        if (Array.isArray(attempt?.answers)) {
          attempt.answers.forEach((answer) => {
            addMiss(
              getProblemLabelFromAnswer(answer),
              answer?.wrongTries,
              studentName,
              assignmentTitle
            );
          });
        }
      });
    });
  });

  return [...missed.values()]
    .map((item) => ({
      ...item,
      students: [...item.students.entries()]
        .map(([name, misses]) => ({ name, misses }))
        .sort((a, b) => b.misses - a.misses),
    }))
    .sort((a, b) => b.misses - a.misses);
}

function getTeacherRecommendations({ summary, worstAssignment, mostMissed }) {
  const recommendations = [];

  if (summary.failing > 0) {
    recommendations.push(
      `Review with ${plural(summary.failing, "student")} needing attention.`
    );
  }

  if (mostMissed?.problem) {
    recommendations.push(`Use "${mostMissed.problem}" as a warm-up problem.`);
  }

  if (worstAssignment?.assignment?.title || worstAssignment?.gameKey) {
    recommendations.push(
      `Start with ${
        worstAssignment.assignment?.title || worstAssignment.gameKey
      }; it has the lowest class progress.`
    );
  }

  if (!recommendations.length) {
    recommendations.push("Class is on track. Keep assigning mixed review.");
  }

  return recommendations;
}

/* -------------------------------------------------------------------------- */
/* Attempt details                                                            */
/* -------------------------------------------------------------------------- */

function AttemptDetails({
  attempt,
  attemptKey,
  isOpen,
  isLatest = false,
  mostMissedProblem = "",
  toggleAttemptDropdown,
  formatAttemptTime,
  getAttemptPercent,
  getAnswerPercentage,
  getBreakdownPercentage,
  isPerfectAttempt,
}) {
  const percent = clampPercent(getAttemptPercent(attempt));
  const wrongTries = safeNumber(attempt?.totalWrongGuesses);
  const perfect = isPerfectAttempt(attempt);

  const answers = Array.isArray(attempt?.answers) ? attempt.answers : [];
  const breakdownEntries =
    attempt?.problemBreakdown && typeof attempt.problemBreakdown === "object"
      ? Object.entries(attempt.problemBreakdown)
      : [];

  return (
    <div
      className={`tdash-results__attempt-card ${
        isLatest ? "tdash-results__attempt-card--latest" : ""
      }`}
    >
      <button
        className="tdash-results__attempt-head"
        type="button"
        onClick={() => toggleAttemptDropdown(attemptKey)}
        aria-expanded={isOpen}
      >
        <div>
          <div className="tdash-results__attempt-title">
            Attempt
            {isLatest && (
              <span className="tdash-results__latest-badge">
                Latest attempt
              </span>
            )}
          </div>

          <div className="tdash-results__muted">
            {formatAttemptTime(getAttemptDateValue(attempt))}
          </div>
        </div>

        <div className="tdash-results__attempt-score">
          <span>Score: {percent} / 100</span>
          <span>•</span>
          <span>{wrongTries} wrong</span>
          {perfect && <span className="tdash-results__badge">Perfect</span>}
        </div>

        <span className="tdash-results__arrow">{isOpen ? "▲" : "▼"}</span>
      </button>

      <ProgressBar
        percent={percent}
        wrongTries={wrongTries}
        completed
        label="Attempt progress"
      />

      {isOpen && (
        <div className="tdash-results__attempt-body">
          {answers.length > 0 ? (
            <div className="tdash-results__answer-list">
              {answers.map((answer, index) => {
                const problem = getProblemLabelFromAnswer(answer);
                const wrong = safeNumber(answer?.wrongTries);
                const isWrong = answer?.isCorrect === false || wrong > 0;
                const isMostMissed = problem === mostMissedProblem;
                const answerPercent = clampPercent(getAnswerPercentage(answer));

                return (
                  <div
                    key={`${attempt?.id || attemptKey}-answer-${index}`}
                    className={`tdash-results__answer-row ${
                      isWrong ? "tdash-results__answer-row--wrong" : ""
                    } ${
                      isMostMissed
                        ? "tdash-results__answer-row--most-missed"
                        : ""
                    }`}
                  >
                    <div className="tdash-results__answer-main">
                      <strong>{problem}</strong>

                      <div className="tdash-results__answer-tags">
                        {isMostMissed && (
                          <span className="tdash-results__most-missed-tag">
                            Most missed
                          </span>
                        )}

                        {isWrong && (
                          <span className="tdash-results__wrong-tag">
                            Needs review
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="tdash-results__answer-meta">
                      <span>Wrong tries: {wrong}</span>
                      <span>Correct: {String(answer?.correctAnswer ?? "—")}</span>
                      <span>Score: {answerPercent} / 100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : breakdownEntries.length > 0 ? (
            <div className="tdash-results__answer-list">
              {breakdownEntries.map(([problem, tries]) => {
                const wrong = safeNumber(tries);
                const isWrong = wrong > 0;
                const isMostMissed = problem === mostMissedProblem;
                const answerPercent = clampPercent(getBreakdownPercentage(wrong));

                return (
                  <div
                    key={`${attempt?.id || attemptKey}-breakdown-${problem}`}
                    className={`tdash-results__answer-row ${
                      isWrong ? "tdash-results__answer-row--wrong" : ""
                    } ${
                      isMostMissed
                        ? "tdash-results__answer-row--most-missed"
                        : ""
                    }`}
                  >
                    <div className="tdash-results__answer-main">
                      <strong>{problem}</strong>

                      <div className="tdash-results__answer-tags">
                        {isMostMissed && (
                          <span className="tdash-results__most-missed-tag">
                            Most missed
                          </span>
                        )}

                        {isWrong && (
                          <span className="tdash-results__wrong-tag">
                            Needs review
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="tdash-results__answer-meta">
                      <span>Wrong tries: {wrong}</span>
                      <span>Score: {answerPercent} / 100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState>No answer data saved yet.</EmptyState>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Student view                                                               */
/* -------------------------------------------------------------------------- */

function StudentAssignmentView({
  groupedAssignments,
  openAssignments,
  openAttempts,
  toggleAssignmentDropdown,
  toggleAttemptDropdown,
  formatAttemptTime,
  getAttemptPercent,
  getAnswerPercentage,
  getBreakdownPercentage,
  isPerfectAttempt,
}) {
  if (!groupedAssignments.length) {
    return <EmptyState>No assignments for this student's grade yet.</EmptyState>;
  }

  return (
    <div className="tdash-results__list">
      {groupedAssignments.map((assignment) => {
        const isOpen = !!openAssignments[assignment.id];
        const attempts = sortAttemptsLatestFirst(assignment.attempts || []);

        const progress = buildProgressMeta({
          percent: clampPercent(assignment.medianPercent),
          wrongTries: safeNumber(assignment.medianWrongTries),
          completed: attempts.length > 0,
          locked: assignment.locked,
        });

        return (
          <article
            key={assignment.id}
            className={`tdash-results__assignment ${progress.cardClass}`}
          >
            <button
              className="tdash-results__assignment-head"
              type="button"
              onClick={() => toggleAssignmentDropdown(assignment.id)}
              aria-expanded={isOpen}
            >
              <div className="tdash-results__assignment-main">
                <div className="tdash-results__title-row">
                  <span
                    className={`tdash__status-dot tdash__status-dot--${progress.severity}`}
                  />
                  <h3>{assignment.title}</h3>
                  <span className="tdash-results__status">
                    {getSeverityLabel(progress.severity)}
                  </span>
                </div>

                <div className="tdash-results__muted">
                  {plural(attempts.length, "attempt")}
                  {assignment.latestAttempt && (
                    <>
                      {" "}
                      • Latest {clampPercent(assignment.latestPercent)} / 100 •{" "}
                      {formatAttemptTime(
                        getAttemptDateValue(assignment.latestAttempt)
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="tdash-results__summary-block">
                <div className="tdash-results__summary-line">
                  <span>Overall class score: {progress.percent} / 100</span>
                  <span>•</span>
                  <span>{progress.wrongTries} wrong</span>
                  <span>•</span>
                  <span>⭐ {safeNumber(assignment.perfectRuns)}</span>
                </div>

                <ProgressBar
                  percent={progress.percent}
                  wrongTries={progress.wrongTries}
                  completed={attempts.length > 0}
                  locked={assignment.locked}
                  label={`${assignment.title} progress`}
                />
              </div>

              <span className="tdash-results__arrow">{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
              <div className="tdash-results__assignment-body">
                {attempts.length > 0 ? (
                  attempts.map((attempt, index) => {
                    const attemptKey = attempt.id || `${assignment.id}-${index}`;

                    return (
                      <AttemptDetails
                        key={attemptKey}
                        attempt={{ ...attempt, id: attemptKey }}
                        attemptKey={attemptKey}
                        isLatest={index === 0}
                        isOpen={!!openAttempts[attemptKey]}
                        toggleAttemptDropdown={toggleAttemptDropdown}
                        formatAttemptTime={formatAttemptTime}
                        getAttemptPercent={getAttemptPercent}
                        getAnswerPercentage={getAnswerPercentage}
                        getBreakdownPercentage={getBreakdownPercentage}
                        isPerfectAttempt={isPerfectAttempt}
                      />
                    );
                  })
                ) : (
                  <EmptyState>This assignment has not been completed yet.</EmptyState>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Class / group view                                                         */
/* -------------------------------------------------------------------------- */

function normalizeClassRows(rows = []) {
  return [...rows].sort((a, b) => {
    const aCompleted = !!a.completed;
    const bCompleted = !!b.completed;

    if (aCompleted !== bCompleted) return aCompleted ? -1 : 1;

    const aPercent = clampPercent(a.medianPercent ?? a.latestPercent);
    const bPercent = clampPercent(b.medianPercent ?? b.latestPercent);

    if (aPercent !== bPercent) return aPercent - bPercent;

    return (
      safeNumber(b.medianWrongTries ?? b.latestWrongTries) -
      safeNumber(a.medianWrongTries ?? a.latestWrongTries)
    );
  });
}

function filterClassRows(rows, filter) {
  if (filter === "completed") return rows.filter((row) => !!row.completed);

  if (filter === "struggling") {
    return rows.filter(
      (row) =>
        !!row.completed &&
        clampPercent(row.medianPercent ?? row.latestPercent) <= 60
    );
  }

  if (filter === "perfect") {
    return rows.filter(
      (row) =>
        !!row.completed &&
        (safeNumber(row.perfectRuns) > 0 ||
          clampPercent(row.medianPercent ?? row.latestPercent) === 100)
    );
  }

  return rows;
}

function ClassAssignmentView({
  classAssignmentProgress,
  classResultsSummary,
  openClassAssignments,
  openClassStudents,
  openAttempts,
  toggleClassAssignmentDropdown,
  toggleClassStudentDropdown,
  toggleAttemptDropdown,
  formatAttemptTime,
  getAttemptPercent,
  getAnswerPercentage,
  getBreakdownPercentage,
  isPerfectAttempt,
  getStudentAttemptsForAssignment,
  jumpToStudent,
}) {
  const [classFilter, setClassFilter] = useState("all");

  const missedProblemStats = useMemo(
    () =>
      collectMissedProblemStats(
        classAssignmentProgress,
        getStudentAttemptsForAssignment
      ),
    [classAssignmentProgress, getStudentAttemptsForAssignment]
  );

  const sortedAssignments = useMemo(
    () =>
      [...classAssignmentProgress].sort(
        (a, b) => clampPercent(a.percentage) - clampPercent(b.percentage)
      ),
    [classAssignmentProgress]
  );

  if (!classAssignmentProgress.length) {
    return <EmptyState>No whole-class progress has been loaded yet.</EmptyState>;
  }

  const mostMissed = missedProblemStats[0];
  const worstAssignment = sortedAssignments[0];

  const summary = {
    totalStudents: safeNumber(classResultsSummary.totalStudents),
    completed: safeNumber(classResultsSummary.completed),
    average: clampPercent(classResultsSummary.average),
    failing: safeNumber(classResultsSummary.failing),
    perfect: safeNumber(classResultsSummary.perfect),
    mostMissed: classResultsSummary.mostMissed || mostMissed?.problem || "—",
  };

  const recommendations = getTeacherRecommendations({
    summary,
    worstAssignment,
    mostMissed,
  });

  return (
    <>
      <div className="tdash-results__insights-panel">
        <div>
          <h3>Teacher Insights</h3>
          <p>Quick suggestions based on class results.</p>
        </div>

        <div className="tdash-results__insight-grid">
          <div className="tdash-results__insight-card">
            <span>🧠</span>
            <strong>{mostMissed ? mostMissed.problem : "—"}</strong>

            {mostMissed?.assignmentTitle && (
              <p className="tdash-results__insight-game">
                From: {mostMissed.assignmentTitle}
              </p>
            )}

            {mostMissed ? (
              <>
                <p>{mostMissed.misses} total misses</p>

                <div className="tdash-results__missed-by">
                  <strong>Missed by:</strong>

                  <div className="tdash-results__missed-list">
                    {mostMissed.students.map((student) => (
                      <span key={student.name}>
                        {student.name} ({student.misses})
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p>No missed problems yet</p>
            )}
          </div>

          <div className="tdash-results__insight-card">
            <span>📉</span>
            <strong>
              {worstAssignment?.assignment?.title ||
                worstAssignment?.gameKey ||
                "—"}
            </strong>
            <p>Lowest class progress</p>
          </div>

          <div className="tdash-results__insight-card tdash-results__insight-card--wide">
            <span>✨</span>
            <strong>Recommendations</strong>

            <ul>
              {recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="tdash-results__stats-bar">
        <StatPill
          icon="👩‍🎓"
          value={summary.totalStudents}
          label="all"
          active={classFilter === "all"}
          onClick={() => setClassFilter("all")}
        />
        <StatPill
          icon="✅"
          value={summary.completed}
          label="completed"
          variant="tdash-results__pill--completed"
          active={classFilter === "completed"}
          onClick={() => setClassFilter("completed")}
        />
        <StatPill
          icon="📊"
          value={`${summary.average} / 100`}
          label="median"
          variant="tdash-results__pill--median"
          active={classFilter === "all"}
          onClick={() => setClassFilter("all")}
        />
        <StatPill
          icon="🔥"
          value={summary.failing}
          label="needs attention"
          variant="tdash-results__pill--danger"
          active={classFilter === "struggling"}
          onClick={() => setClassFilter("struggling")}
        />
        <StatPill
          icon="⭐"
          value={summary.perfect}
          label="perfect"
          variant="tdash-results__pill--perfect"
          active={classFilter === "perfect"}
          onClick={() => setClassFilter("perfect")}
        />
        <StatPill
          icon="🧠"
          value={summary.mostMissed}
          label="most missed"
          variant="tdash-results__pill--insight"
          onClick={() => setClassFilter("struggling")}
        />
      </div>

      <div className="tdash-results__list">
        {sortedAssignments.map((assignmentProgress) => {
          const assignment = assignmentProgress.assignment || {};
          const gameKey = assignment.gameKey || assignmentProgress.gameKey;

          if (!gameKey) return null;

          const completedCount = safeNumber(assignmentProgress.completedCount);
          const totalStudents = safeNumber(assignmentProgress.totalStudents);
          const classPercent = clampPercent(assignmentProgress.percentage);
          const failingCount = safeNumber(assignmentProgress.failingCount);
          const perfectCount = safeNumber(assignmentProgress.perfectCount);

          const filteredRows = filterClassRows(
            normalizeClassRows(assignmentProgress.rows || []),
            classFilter
          );

          const isOpen = !!openClassAssignments[gameKey];

          const assignmentProgressMeta = buildProgressMeta({
            percent: classPercent,
            wrongTries: failingCount,
            completed: completedCount > 0,
          });

          return (
            <article
              key={gameKey}
              className={`tdash-results__assignment ${assignmentProgressMeta.cardClass}`}
            >
              <button
                className="tdash-results__assignment-head"
                type="button"
                onClick={() => toggleClassAssignmentDropdown(gameKey)}
                aria-expanded={isOpen}
              >
                <div className="tdash-results__assignment-main">
                  <div className="tdash-results__title-row">
                    <span
                      className={`tdash__status-dot tdash__status-dot--${assignmentProgressMeta.severity}`}
                    />
                    <h3>{assignment.title || gameKey}</h3>
                    <span className="tdash-results__status">
                      {getSeverityLabel(assignmentProgressMeta.severity)}
                    </span>
                  </div>

                  <div className="tdash-results__muted">
                    {completedCount} of {totalStudents} students have completed this assignment
                    {classFilter !== "all" && (
                      <>
                        {" "}
                        • Showing {plural(filteredRows.length, "matching student")}
                      </>
                    )}
                  </div>
                </div>

                <div className="tdash-results__summary-block">
                  <div className="tdash-results__summary-line">
                    <span>Overall class score: {classPercent} / 100</span>
                    <span>•</span>
                    <span>{failingCount} need attention</span>
                    <span>•</span>
                    <span>⭐ {perfectCount}</span>
                  </div>

                  <ProgressBar
                    percent={classPercent}
                    wrongTries={failingCount}
                    completed={completedCount > 0}
                    label={`${assignment.title || gameKey} class progress`}
                  />
                </div>

                <span className="tdash-results__arrow">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="tdash-results__assignment-body">
                  {filteredRows.length > 0 ? (
                    filteredRows.map((row) => {
                      const student = row.student || {};
                      const studentId = student.id;

                      if (!studentId) return null;

                      const studentKey = `${gameKey}-${studentId}`;
                      const isStudentOpen = !!openClassStudents[studentKey];

                      const studentAttempts = sortAttemptsLatestFirst(
                        getStudentAttemptsForAssignment(studentId, gameKey) || []
                      );

                      const latestAttempt = studentAttempts[0];
                      const medianPercent = clampPercent(
                        row.medianPercent ?? row.latestPercent
                      );
                      const medianWrongTries = safeNumber(
                        row.medianWrongTries ?? row.latestWrongTries
                      );

                      const progress =
                        row.progress ||
                        buildProgressMeta({
                          percent: medianPercent,
                          wrongTries: medianWrongTries,
                          completed: !!row.completed,
                          locked: row.locked,
                        });

                      const needsAttention =
                        !!row.completed && progress.percent <= 60;
                      const isPerfect =
                        !!row.completed &&
                        (safeNumber(row.perfectRuns) > 0 ||
                          progress.percent === 100);

                      return (
                        <div
                          key={studentKey}
                          className={`tdash-results__student-card ${
                            progress.cardClass
                          } ${
                            needsAttention
                              ? "tdash-results__student-card--struggling"
                              : ""
                          } ${
                            isPerfect
                              ? "tdash-results__student-card--perfect"
                              : ""
                          }`}
                        >
                          <div className="tdash-results__student-head">
                            <button
                              className="tdash-results__student-toggle"
                              type="button"
                              onClick={() => toggleClassStudentDropdown(studentKey)}
                              aria-expanded={isStudentOpen}
                            >
                              <div>
                                <div className="tdash-results__title-row">
                                  <span
                                    className={`tdash__status-dot tdash__status-dot--${progress.severity}`}
                                  />
                                  <h4>{student.name || `Student ${studentId}`}</h4>

                                  <span className="tdash-results__status">
                                    {getSeverityLabel(progress.severity)}
                                  </span>

                                  {needsAttention && (
                                    <span className="tdash-results__help-chip">
                                      Needs attention
                                    </span>
                                  )}

                                  {isPerfect && (
                                    <span className="tdash-results__latest-chip tdash-results__latest-chip--perfect">
                                      Perfect
                                    </span>
                                  )}
                                </div>

                                <div className="tdash-results__muted">
                                  {row.completed ? (
                                    <>
                                      {plural(studentAttempts.length, "attempt")}
                                      {" • "}
                                      Latest {clampPercent(row.latestPercent)} / 100
                                      {latestAttempt && (
                                        <>
                                          {" • "}
                                          {formatAttemptTime(
                                            getAttemptDateValue(latestAttempt)
                                          )}
                                        </>
                                      )}
                                    </>
                                  ) : (
                                    "Not completed yet"
                                  )}
                                </div>
                              </div>
                            </button>

                            <div className="tdash-results__student-side">
                              <div className="tdash-results__summary-line">
                                <span>Student score: {progress.percent} / 100</span>
                                <span>•</span>
                                <span>{progress.wrongTries} wrong</span>
                                <span>•</span>
                                <span>⭐ {safeNumber(row.perfectRuns)}</span>
                              </div>

                              <ProgressBar
                                percent={progress.percent}
                                wrongTries={progress.wrongTries}
                                completed={!!row.completed}
                                locked={row.locked}
                                label={`${student.name || studentId} progress`}
                              />
                            </div>

                            <button
                              type="button"
                              className="tdash-results__open-student"
                              onClick={(event) => {
                                event.stopPropagation();
                                jumpToStudent(studentId);
                              }}
                            >
                              Open Student
                            </button>

                            <button
                              type="button"
                              className="tdash-results__arrow-btn"
                              onClick={() => toggleClassStudentDropdown(studentKey)}
                            >
                              {isStudentOpen ? "▲" : "▼"}
                            </button>
                          </div>

                          {isStudentOpen && (
                            <div className="tdash-results__student-body">
                              {studentAttempts.length > 0 ? (
                                studentAttempts.map((attempt, index) => {
                                  const attemptKey = `class-${studentKey}-${
                                    attempt.id || index
                                  }`;

                                  return (
                                    <AttemptDetails
                                      key={attemptKey}
                                      attempt={{
                                        ...attempt,
                                        id: attempt.id || attemptKey,
                                      }}
                                      attemptKey={attemptKey}
                                      isLatest={index === 0}
                                      mostMissedProblem={mostMissed?.problem}
                                      isOpen={!!openAttempts[attemptKey]}
                                      toggleAttemptDropdown={toggleAttemptDropdown}
                                      formatAttemptTime={formatAttemptTime}
                                      getAttemptPercent={getAttemptPercent}
                                      getAnswerPercentage={getAnswerPercentage}
                                      getBreakdownPercentage={getBreakdownPercentage}
                                      isPerfectAttempt={isPerfectAttempt}
                                    />
                                  );
                                })
                              ) : (
                                <EmptyState>
                                  This student hasn't attempted this assignment yet.
                                </EmptyState>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <EmptyState>No students match this filter.</EmptyState>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Main export                                                                */
/* -------------------------------------------------------------------------- */

export default function AssignmentResults({
  resultsViewMode,
  setResultsViewMode,
  resultsGroupId,
  setResultsGroupId,
  studentGroups = [],
  hideResults,
  setHideResults,
  groupedAssignments = [],
  classAssignmentProgress = [],
  classResultsSummary = {},
  openAssignments = {},
  openAttempts = {},
  openClassAssignments = {},
  openClassStudents = {},
  toggleAssignmentDropdown,
  toggleAttemptDropdown,
  toggleClassAssignmentDropdown,
  toggleClassStudentDropdown,
  formatAttemptTime,
  getAttemptPercent,
  getAnswerPercentage,
  getBreakdownPercentage,
  isPerfectAttempt,
  getStudentAttemptsForAssignment,
  jumpToStudent,
}) {
  const isClassLikeView =
    resultsViewMode === "class" || resultsViewMode === "group";

  return (
    <section className="tdash__card tdash-results">
      <div className="tdash__card-head tdash__card-head--split tdash-results__top">
        <div>
          <h2 className="tdash__section-title">Assignment Results</h2>
          <p className="tdash-results__subtitle">
            Students who need attention are shown first. Use the pills to filter
            the whole-class view.
          </p>
        </div>

        <div className="tdash-results__controls">
          <div
            className="tdash__view-toggle"
            role="tablist"
            aria-label="Assignment result views"
          >
            <button
              type="button"
              className={`tdash__view-btn ${
                resultsViewMode === "student" ? "tdash__view-btn--active" : ""
              }`}
              onClick={() => setResultsViewMode("student")}
            >
              Student
            </button>

            <button
              type="button"
              className={`tdash__view-btn ${
                resultsViewMode === "group" ? "tdash__view-btn--active" : ""
              }`}
              onClick={() => setResultsViewMode("group")}
            >
              Group
            </button>

            <button
              type="button"
              className={`tdash__view-btn ${
                resultsViewMode === "class" ? "tdash__view-btn--active" : ""
              }`}
              onClick={() => setResultsViewMode("class")}
            >
              Whole Class
            </button>
          </div>

          <button
            className="tdash__ghost-btn"
            type="button"
            onClick={() => setHideResults((prev) => !prev)}
          >
            {hideResults ? "Show Results" : "Hide Results"}
          </button>
        </div>
      </div>

      {!hideResults && (
        <>
          {resultsViewMode === "group" && (
            <div className="tdash-results__group-picker">
              <label className="tdash__label">Group</label>
              <select
                className="tdash__select tdash__results-select"
                value={resultsGroupId}
                onChange={(event) => setResultsGroupId(event.target.value)}
              >
                <option value="">Select a group</option>
                {studentGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {resultsViewMode === "student" ? (
            <StudentAssignmentView
              groupedAssignments={groupedAssignments}
              openAssignments={openAssignments}
              openAttempts={openAttempts}
              toggleAssignmentDropdown={toggleAssignmentDropdown}
              toggleAttemptDropdown={toggleAttemptDropdown}
              formatAttemptTime={formatAttemptTime}
              getAttemptPercent={getAttemptPercent}
              getAnswerPercentage={getAnswerPercentage}
              getBreakdownPercentage={getBreakdownPercentage}
              isPerfectAttempt={isPerfectAttempt}
            />
          ) : isClassLikeView && resultsViewMode === "group" && !resultsGroupId ? (
            <EmptyState>Pick a group to see group progress.</EmptyState>
          ) : (
            <ClassAssignmentView
              classAssignmentProgress={classAssignmentProgress}
              classResultsSummary={classResultsSummary}
              openClassAssignments={openClassAssignments}
              openClassStudents={openClassStudents}
              openAttempts={openAttempts}
              toggleClassAssignmentDropdown={toggleClassAssignmentDropdown}
              toggleClassStudentDropdown={toggleClassStudentDropdown}
              toggleAttemptDropdown={toggleAttemptDropdown}
              formatAttemptTime={formatAttemptTime}
              getAttemptPercent={getAttemptPercent}
              getAnswerPercentage={getAnswerPercentage}
              getBreakdownPercentage={getBreakdownPercentage}
              isPerfectAttempt={isPerfectAttempt}
              getStudentAttemptsForAssignment={getStudentAttemptsForAssignment}
              jumpToStudent={jumpToStudent}
            />
          )}
        </>
      )}
    </section>
  );
}