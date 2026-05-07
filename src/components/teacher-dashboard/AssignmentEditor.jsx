import React, { useMemo, useState } from "react";
import "./AssignmentEditor.css";

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getPresetBadge(preset = {}) {
  if (preset.groupType === "recommended") return "Recommended";
  if (preset.adaptiveLevel === "easy") return "Easy";
  if (preset.adaptiveLevel === "practice") return "Practice";
  if (preset.adaptiveLevel === "challenge") return "Challenge";
  if (preset.adaptiveLevel === "mixed") return "Mixed";
  if (preset.adaptiveLevel === "full") return "Full";
  return "Set";
}

function getPresetTab(preset = {}) {
  if (preset.groupType === "recommended") return "recommended";
  if (preset.groupType === "full" || preset.adaptiveLevel === "full") return "full";
  return "families";
}

function getCleanPresetLabel(label = "") {
  return String(label).replace(/^Recommended:\s*/i, "").trim();
}

function getFamilyName(problem) {
  const question = String(problem?.question || "").toLowerCase();

  if (question.includes("+")) {
    const first = Number(question.split("+")[0]);
    return Number.isNaN(first) ? "Other" : `${first}s Family`;
  }

  if (question.includes("-")) {
    const second = Number(question.split("-")[1]);
    return Number.isNaN(second) ? "Other" : `Subtract ${second}s`;
  }

  if (question.includes("×") || question.includes("*")) {
    const first = Number(question.split(/[×*]/)[0]);
    return Number.isNaN(first) ? "Other" : `${first}s Family`;
  }

  if (question.includes("ones")) return "Ones Place";
  if (question.includes("tens")) return "Tens Place";
  if (question.includes("hundreds")) return "Hundreds Place";

  return "Other";
}

function getDifficulty(problem) {
  const question = String(problem?.question || "").toLowerCase();
  const answer = Number(problem?.answer);

  if (question.includes("hundreds")) return "challenge";
  if (question.includes("tens")) return "practice";
  if (question.includes("ones")) return "easy";

  const numbers = question.match(/\d+/g)?.map(Number) || [];
  const biggest = Math.max(...numbers, Number.isFinite(answer) ? answer : 0);

  if (biggest <= 10) return "easy";
  if (biggest <= 50) return "practice";
  return "challenge";
}

function getDifficultyLabel(difficulty) {
  if (difficulty === "easy") return "Easy";
  if (difficulty === "practice") return "Practice";
  if (difficulty === "challenge") return "Challenge";
  return "Other";
}

function getDifficultyIcon(difficulty) {
  if (difficulty === "easy") return "🌱";
  if (difficulty === "practice") return "🧺";
  if (difficulty === "challenge") return "🔥";
  return "✨";
}

function getWeakLabel(stats) {
  const wrong = safeNumber(stats?.wrong);
  const students = safeNumber(stats?.students);

  if (wrong > 0 && students > 0) return `${wrong} wrong tries • ${students} students`;
  if (wrong > 0) return `${wrong} wrong tries`;
  if (students > 0) return `${students} students struggling`;

  return "Needs practice";
}

export default function AssignmentEditor({
  assignmentsForClass = [],
  editorGameKey,
  setEditorGameKey,
  editorAssignmentConfig = {},
  availablePresets = [],
  availableBuiltInProblems = [],
  editorSelectedCount = {},
  editorCustomQuestion = "",
  setEditorCustomQuestion,
  editorCustomAnswer = "",
  setEditorCustomAnswer,
  editorLastSavedAt,
  showAssignmentEditor,
  setShowAssignmentEditor,
  toggleLiveSyncEnabled,
  clearEditorForGame,
  togglePreset,
  toggleBuiltInProblem,
  selectAllPresets,
  selectAllBuiltInProblems,
  selectFamilyBuiltInProblems,
  handleAddCustomProblem,
  handleRemoveCustomProblem,
  problemKey,
  weakFamilyStats = {},
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [presetTab, setPresetTab] = useState("recommended");
  const [openDifficulties, setOpenDifficulties] = useState({
    easy: true,
    practice: true,
    challenge: true,
    other: true,
  });
  const [openFamilies, setOpenFamilies] = useState({});
  const [dragSelecting, setDragSelecting] = useState(false);
  const [dragMode, setDragMode] = useState("select");
  const [dragTouchedKeys, setDragTouchedKeys] = useState(new Set());

  const liveSyncOn = editorAssignmentConfig?.liveSyncEnabled !== false;

  const selectedPresetIds = Array.isArray(editorAssignmentConfig?.selectedPresetIds)
    ? editorAssignmentConfig.selectedPresetIds
    : [];

  const selectedBuiltInProblems = Array.isArray(
    editorAssignmentConfig?.selectedBuiltInProblems
  )
    ? editorAssignmentConfig.selectedBuiltInProblems
    : [];

  const customProblems = Array.isArray(editorAssignmentConfig?.customProblems)
    ? editorAssignmentConfig.customProblems
    : [];

  const safeProblemKey = (problem) => {
    try {
      if (typeof problemKey === "function") return problemKey(problem);
      return `${problem?.question ?? ""}::${problem?.answer ?? ""}`;
    } catch {
      return `${problem?.question ?? ""}::${problem?.answer ?? ""}`;
    }
  };

  const activeAssignment = assignmentsForClass.find(
    (assignment) => assignment.gameKey === editorGameKey
  );

  const selectedBuiltInKeys = useMemo(() => {
    return new Set(selectedBuiltInProblems.map((problem) => safeProblemKey(problem)));
  }, [selectedBuiltInProblems]);

  const sortedPresets = useMemo(() => {
    const order = { recommended: 0, families: 1, full: 2 };

    return [...availablePresets].sort((a, b) => {
      const aTab = getPresetTab(a);
      const bTab = getPresetTab(b);

      if (order[aTab] !== order[bTab]) return order[aTab] - order[bTab];

      return String(a.label || "").localeCompare(String(b.label || ""), undefined, {
        numeric: true,
      });
    });
  }, [availablePresets]);

  const recommendedPresets = useMemo(() => {
    return sortedPresets.filter((preset) => getPresetTab(preset) === "recommended");
  }, [sortedPresets]);

  const visiblePresets = useMemo(() => {
    return sortedPresets.filter((preset) => getPresetTab(preset) === presetTab);
  }, [sortedPresets, presetTab]);

  const filteredBuiltIns = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return availableBuiltInProblems;

    return availableBuiltInProblems.filter((problem) => {
      const question = String(problem?.question ?? "").toLowerCase();
      const answer = String(problem?.answer ?? "").toLowerCase();
      const family = getFamilyName(problem).toLowerCase();
      const difficulty = getDifficultyLabel(getDifficulty(problem)).toLowerCase();
      const fullExpression = `${question} ${answer}`.toLowerCase();

      return (
        question.includes(term) ||
        answer.includes(term) ||
        family.includes(term) ||
        difficulty.includes(term) ||
        fullExpression.includes(term)
      );
    });
  }, [availableBuiltInProblems, searchTerm]);

  const groupedByDifficulty = useMemo(() => {
    const groups = {
      easy: {},
      practice: {},
      challenge: {},
      other: {},
    };

    filteredBuiltIns.forEach((problem) => {
      const difficulty = getDifficulty(problem);
      const family = getFamilyName(problem);

      if (!groups[difficulty]) groups[difficulty] = {};
      if (!groups[difficulty][family]) groups[difficulty][family] = [];

      groups[difficulty][family].push(problem);
    });

    return Object.entries(groups)
      .map(([difficulty, families]) => ({
        difficulty,
        families: Object.entries(families).sort(([a], [b]) =>
          a.localeCompare(b, undefined, { numeric: true })
        ),
      }))
      .filter((group) => group.families.length > 0);
  }, [filteredBuiltIns]);

  const strongestRecommended =
    recommendedPresets.find((preset) => preset.adaptiveLevel === "easy") ||
    recommendedPresets.find((preset) => preset.groupType === "recommended") ||
    recommendedPresets[0];

  const totalAvailableBuiltIns = availableBuiltInProblems.length;
  const filteredCount = filteredBuiltIns.length;

  function handleSubmitCustomProblem(event) {
    event.preventDefault();
    handleAddCustomProblem?.();
  }

  function quickAddRecommended() {
    if (!strongestRecommended) return;

    if (!selectedPresetIds.includes(strongestRecommended.id)) {
      togglePreset?.(strongestRecommended.id);
    }
  }

  function assignRecommendedToWholeClass() {
    recommendedPresets.forEach((preset) => {
      if (!selectedPresetIds.includes(preset.id)) {
        togglePreset?.(preset.id);
      }
    });
  }

  function selectWeakFamilies() {
    const weakProblems = [];

    groupedByDifficulty.forEach(({ families }) => {
      families.forEach(([family, problems]) => {
        const stats = weakFamilyStats?.[family];

        const isWeak =
          !!stats ||
          safeNumber(stats?.wrong) > 5 ||
          /7s|8s|9s|challenge|hundreds/i.test(family);

        if (isWeak) {
          weakProblems.push(...problems);
        }
      });
    });

    selectFamilyBuiltInProblems?.(weakProblems);
  }

  function toggleWholeFamily(problems = []) {
    selectFamilyBuiltInProblems?.(problems);
  }

  function setProblemSelected(problem, shouldSelect) {
    if (!problem) return;

    const key = safeProblemKey(problem);
    const selected = selectedBuiltInKeys.has(key);

    if (selected === shouldSelect) return;

    toggleBuiltInProblem?.(problem);
  }

  function handleProblemPointerDown(problem) {
    if (!problem) return;

    const key = safeProblemKey(problem);
    const isSelected = selectedBuiltInKeys.has(key);
    const mode = isSelected ? "deselect" : "select";

    setDragSelecting(true);
    setDragMode(mode);
    setDragTouchedKeys(new Set([key]));
    setProblemSelected(problem, mode === "select");
  }

  function handleProblemPointerEnter(problem) {
    if (!dragSelecting || !problem) return;

    const key = safeProblemKey(problem);

    setDragTouchedKeys((prev) => {
      if (prev.has(key)) return prev;

      const next = new Set(prev);
      next.add(key);
      setProblemSelected(problem, dragMode === "select");
      return next;
    });
  }

  function stopDragging() {
    if (!dragSelecting) return;

    setDragSelecting(false);
    setDragTouchedKeys(new Set());
    setDragMode("select");
  }

  function toggleDifficulty(difficulty) {
    setOpenDifficulties((prev) => ({
      ...prev,
      [difficulty]: !prev[difficulty],
    }));
  }

  function toggleFamilyOpen(family) {
    setOpenFamilies((prev) => ({
      ...prev,
      [family]: !prev[family],
    }));
  }

  function openAllFamilies() {
    const next = {};

    groupedByDifficulty.forEach(({ families }) => {
      families.forEach(([family]) => {
        next[family] = true;
      });
    });

    setOpenFamilies(next);
  }

  function closeAllFamilies() {
    setOpenFamilies({});
  }

  return (
    <section
      className="assignment-editor"
      onPointerUp={stopDragging}
      onPointerLeave={stopDragging}
    >
      <div className="assignment-editor__header">
        <div>
          <h2 className="assignment-editor__title">Assignment Editor</h2>
          <p className="assignment-editor__subtitle">
            Choose recommended sets, pick weak families, or drag across exact problems.
          </p>
        </div>

        <button
          className="assignment-editor__toggle"
          type="button"
          onClick={() => setShowAssignmentEditor?.((prev) => !prev)}
        >
          {showAssignmentEditor ? "Hide Editor" : "Show Editor"}
        </button>
      </div>

      {showAssignmentEditor && (
        <div className="assignment-editor__body">
          <div className="assignment-editor__toolbar">
            <label className="assignment-editor__field assignment-editor__field--game">
              <span>Game</span>

              <select
                value={editorGameKey || ""}
                onChange={(event) => {
                  setEditorGameKey?.(event.target.value);
                  setSearchTerm("");
                  setPresetTab("recommended");
                  setOpenFamilies({});
                }}
              >
                <option value="">Select assignment</option>

                {assignmentsForClass.map((assignment) => (
                  <option key={assignment.gameKey} value={assignment.gameKey}>
                    {assignment.title}
                  </option>
                ))}
              </select>
            </label>

            {editorGameKey && (
              <div className="assignment-editor__toolbar-actions">
                <div
                  className={`assignment-editor__sync ${
                    liveSyncOn
                      ? "assignment-editor__sync--on"
                      : "assignment-editor__sync--off"
                  }`}
                >
                  <span />
                  Live Sync {liveSyncOn ? "ON" : "OFF"}
                </div>

                <button type="button" onClick={toggleLiveSyncEnabled}>
                  {liveSyncOn ? "Turn Off" : "Turn On"}
                </button>

                <button
                  className="assignment-editor__danger"
                  type="button"
                  onClick={clearEditorForGame}
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {editorLastSavedAt && (
            <div className="assignment-editor__saved">
              Saved {new Date(editorLastSavedAt).toLocaleString()}
            </div>
          )}

          {!editorGameKey ? (
            <div className="assignment-editor__empty">
              Choose a game above to edit its problem list.
            </div>
          ) : (
            <>
              <div className="assignment-editor__selected-game">
                Editing: <strong>{activeAssignment?.title || editorGameKey}</strong>
              </div>

              <div className="assignment-editor__summary">
                <div>
                  <strong>{editorSelectedCount?.total ?? 0}</strong>
                  <span>Live Problems</span>
                </div>

                <div>
                  <strong>{editorSelectedCount?.presets ?? 0}</strong>
                  <span>Sets</span>
                </div>

                <div>
                  <strong>{editorSelectedCount?.builtIn ?? 0}</strong>
                  <span>Families Picked</span>
                </div>

                <div>
                  <strong>{editorSelectedCount?.custom ?? 0}</strong>
                  <span>Custom</span>
                </div>
              </div>

              <div className="assignment-editor__quick-row">
                <button type="button" onClick={quickAddRecommended}>
                  Quick Add:{" "}
                  {strongestRecommended
                    ? getCleanPresetLabel(strongestRecommended.label)
                    : "Recommended"}
                </button>

                <button type="button" onClick={selectAllPresets}>
                  1-Click Assign All
                </button>

                <button type="button" onClick={selectAllBuiltInProblems}>
                  Pick Family
                </button>

                <button type="button" onClick={selectWeakFamilies}>
                  Auto Pick Weak Families
                </button>
              </div>

              <div className="assignment-editor__panel assignment-editor__panel--wide">
                <div className="assignment-editor__panel-head assignment-editor__panel-head--split">
                  <div>
                    <h3>Choose Practice Sets</h3>
                    <p>
                      Recommended sets are first. Families let you pick number groups.
                    </p>
                  </div>

                  <div className="assignment-editor__tabs">
                    {["recommended", "families", "full"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        className={
                          presetTab === tab ? "assignment-editor__tab--active" : ""
                        }
                        onClick={() => setPresetTab(tab)}
                      >
                        {tab[0].toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {Array.isArray(visiblePresets) && visiblePresets.length > 0 ? (
                  <div className="assignment-editor__preset-grid">
                    {visiblePresets.map((preset) => {
                      const selected = selectedPresetIds.includes(preset.id);
                      const problemCount = Array.isArray(preset.problems)
                        ? preset.problems.length
                        : 0;

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          className={`assignment-editor__preset ${
                            selected ? "assignment-editor__preset--selected" : ""
                          } ${
                            preset.highlightWeakGroups
                              ? "assignment-editor__preset--weak-ready"
                              : ""
                          }`}
                          onClick={() => togglePreset?.(preset.id)}
                        >
                          <span className="assignment-editor__preset-check">
                            {selected ? "✓" : "+"}
                          </span>

                          <span className="assignment-editor__preset-copy">
                            <span className="assignment-editor__preset-row">
                              <strong>{getCleanPresetLabel(preset.label)}</strong>
                              <em
                                className={`assignment-editor__badge assignment-editor__badge--${
                                  preset.adaptiveLevel || "set"
                                }`}
                              >
                                {getPresetBadge(preset)}
                              </em>
                            </span>

                            <small>{problemCount} problems</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="assignment-editor__empty">
                    No sets in this tab yet.
                  </div>
                )}
              </div>

              <div className="assignment-editor__compact-row">
                <div className="assignment-editor__panel assignment-editor__panel--compact">
                  <details className="assignment-editor__mini-details" open>
                    <summary>
                      <span>Add Your Own Problem</span>
                      <small>Optional</small>
                    </summary>

                    <p>Make a custom question for this game.</p>

                    <form
                      className="assignment-editor__custom-form"
                      onSubmit={handleSubmitCustomProblem}
                    >
                      <input
                        type="text"
                        placeholder="Question, like 3 + 4"
                        value={editorCustomQuestion}
                        onChange={(event) =>
                          setEditorCustomQuestion?.(event.target.value)
                        }
                      />

                      <input
                        type="number"
                        placeholder="Answer"
                        value={editorCustomAnswer}
                        onChange={(event) =>
                          setEditorCustomAnswer?.(event.target.value)
                        }
                      />

                      <button type="submit">Add</button>
                    </form>

                    {customProblems.length > 0 && (
                      <div className="assignment-editor__custom-list">
                        {customProblems.map((problem, index) => (
                          <div
                            key={`${safeProblemKey(problem)}-custom-${index}`}
                            className="assignment-editor__custom-chip"
                          >
                            <span>
                              {problem.question} = <strong>{problem.answer}</strong>
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRemoveCustomProblem?.(problem)}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </details>
                </div>

                <div className="assignment-editor__panel assignment-editor__panel--compact family-picker">
                  <div className="family-picker__top">
                    <div>
                      <h3>Pick Families</h3>
                      <p>Grouped by difficulty. Drag across chips to select many.</p>
                    </div>

                    <span className="family-picker__tag">Optional</span>
                  </div>

                  <div className="family-picker__tools">
                    <input
                      className="family-picker__search"
                      type="text"
                      placeholder="Search family, difficulty, question, or answer..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />

                    <div className="family-picker__tiny-actions">
                      <button type="button" onClick={openAllFamilies}>
                        Open All
                      </button>
                      <button type="button" onClick={closeAllFamilies}>
                        Close All
                      </button>
                    </div>
                  </div>

                  <div className="family-picker__meta">
                    Showing {filteredCount} of {totalAvailableBuiltIns} problems
                  </div>

                  {groupedByDifficulty.length > 0 ? (
                    <div className="family-picker__difficulty-list">
                      {groupedByDifficulty.map(({ difficulty, families }) => {
                        const isDifficultyOpen = openDifficulties[difficulty];

                        return (
                          <section
                            key={difficulty}
                            className={`family-difficulty family-difficulty--${difficulty}`}
                          >
                            <button
                              type="button"
                              className="family-difficulty__header"
                              onClick={() => toggleDifficulty(difficulty)}
                            >
                              <span>
                                {getDifficultyIcon(difficulty)}{" "}
                                {getDifficultyLabel(difficulty)}
                              </span>

                              <em>{families.length} families</em>

                              <strong>{isDifficultyOpen ? "▲" : "▼"}</strong>
                            </button>

                            {isDifficultyOpen && (
                              <div className="family-difficulty__body">
                                {families.map(([family, problems]) => {
                                  const allSelected =
                                    problems.length > 0 &&
                                    problems.every((problem) =>
                                      selectedBuiltInKeys.has(safeProblemKey(problem))
                                    );

                                  const selectedCount = problems.filter((problem) =>
                                    selectedBuiltInKeys.has(safeProblemKey(problem))
                                  ).length;

                                  const weakStats = weakFamilyStats?.[family];
                                  const weakFromData =
                                    !!weakStats ||
                                    safeNumber(weakStats?.wrong) > 5 ||
                                    /7s|8s|9s|challenge|hundreds/i.test(family);

                                  const isFamilyOpen = openFamilies[family] ?? false;

                                  return (
                                    <article
                                      key={family}
                                      className={`family-card ${
                                        allSelected ? "family-card--selected" : ""
                                      } ${weakFromData ? "family-card--weak" : ""}`}
                                    >
                                      <div className="family-card__main">
                                        <button
                                          type="button"
                                          className="family-card__left"
                                          onClick={() => toggleFamilyOpen(family)}
                                        >
                                          <span className="family-card__icon">
                                            {allSelected
                                              ? "✨"
                                              : weakFromData
                                              ? "🔥"
                                              : "🧺"}
                                          </span>

                                          <div>
                                            <h4>{family}</h4>
                                            <p>
                                              {problems.length} problems
                                              {selectedCount > 0
                                                ? ` • ${selectedCount} selected`
                                                : ""}
                                              {weakFromData
                                                ? ` • ${getWeakLabel(weakStats)}`
                                                : ""}
                                            </p>
                                          </div>
                                        </button>

                                        {weakFromData && (
                                          <span className="family-card__weak-chip">
                                            Weak spot
                                          </span>
                                        )}

                                        <button
                                          type="button"
                                          className={`family-card__select ${
                                            allSelected
                                              ? "family-card__select--selected"
                                              : ""
                                          }`}
                                          onClick={() => toggleWholeFamily(problems)}
                                        >
                                          {allSelected ? "Selected" : "Pick Family"}
                                        </button>

                                        <button
                                          type="button"
                                          className="family-card__open"
                                          onClick={() => toggleFamilyOpen(family)}
                                        >
                                          {isFamilyOpen ? "▲" : "▼"}
                                        </button>
                                      </div>

                                      {isFamilyOpen && (
                                        <div className="family-card__problems">
                                          {problems.map((problem, index) => {
                                            const key = safeProblemKey(problem);
                                            const selected =
                                              selectedBuiltInKeys.has(key);

                                            return (
                                              <button
                                                key={`${key}-${index}`}
                                                type="button"
                                                className={`family-problem ${
                                                  selected
                                                    ? "family-problem--selected"
                                                    : ""
                                                } ${
                                                  dragTouchedKeys.has(key)
                                                    ? "family-problem--dragged"
                                                    : ""
                                                }`}
                                                onPointerDown={() =>
                                                  handleProblemPointerDown(problem)
                                                }
                                                onPointerEnter={() =>
                                                  handleProblemPointerEnter(problem)
                                                }
                                              >
                                                <span>{problem.question}</span>
                                                <strong>{problem.answer}</strong>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </article>
                                  );
                                })}
                              </div>
                            )}
                          </section>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="family-picker__empty">
                      <span>🔎</span>
                      <p>No families match your search.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}