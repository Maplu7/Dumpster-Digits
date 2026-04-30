import { useEffect, useMemo, useRef, useState } from "react";
import "./Assignments.css";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { subscribeAssignmentsForGrade } from "../assignmentService";
import { getAssignmentTheme } from "./appTheme";
import StarTwinkleOverlay from "./StarTwinkleOverlay";
import LayeredSkyScene from "../components/LayeredSkyScene";
import useAmbience from "../hooks/useAmbience";

const PREVIEW_PROBLEMS = {
  "1st_addition": "1 + 5",
  "1st_subtraction": "5 - 1",
  "2nd_addition": "8 + 7",
  "2nd_division": "12 ÷ 4",
  "2nd_subtraction": "15 - 6",
  "2nd_fill_blank": "4 + _ = 10",
  "2nd_place_value": "42 → 4 tens",
  "2nd_multiplication": "2 × 3",
};

const GAME_LABELS = {
  "1st_addition": "Addition",
  "1st_subtraction": "Subtraction",
  "2nd_addition": "2nd Grade Addition",
  "2nd_division": "2nd Grade Division",
  "2nd_subtraction": "2nd Grade Subtraction",
  "2nd_fill_blank": "Fill in the Blank",
  "2nd_place_value": "Place Value",
  "2nd_multiplication": "Multiplication",
};

const ASSIGNMENT_ORDER = {
  "1st_addition": 0,
  "1st_subtraction": 1,
  "2nd_addition": 2,
  "2nd_division": 3,
  "2nd_subtraction": 4,
  "2nd_fill_blank": 5,
  "2nd_place_value": 6,
  "2nd_multiplication": 7,
};

const ALL_GAME_KEYS = [
  "1st_addition",
  "1st_subtraction",
  "2nd_addition",
  "2nd_subtraction",
  "2nd_division",
  "2nd_fill_blank",
  "2nd_place_value",
  "2nd_multiplication",
];

function ensureStudentAssignments(map = {}) {
  const updated = {};

  for (const studentId in map) {
    updated[studentId] = { ...map[studentId] };

    for (const key of ALL_GAME_KEYS) {
      if (!(key in updated[studentId])) {
        updated[studentId][key] = false;
      }
    }
  }

  return updated;
}

function getPreviewProblem(gameKey) {
  return PREVIEW_PROBLEMS[gameKey] || "1 + 5";
}

function getGameLabel(gameKey) {
  return GAME_LABELS[gameKey] || "Game";
}

function getAssignmentOrder(gameKey) {
  return ASSIGNMENT_ORDER[gameKey] ?? 99;
}

function sortAssignments(items = []) {
  return [...items].sort(
    (a, b) => getAssignmentOrder(a?.gameKey) - getAssignmentOrder(b?.gameKey)
  );
}

function buildCompletedMap(snapshot) {
  const completed = {};

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const gameKey = data?.gameKey || docSnap.id;

    if (gameKey) {
      completed[gameKey] = true;
    }
  });

  return completed;
}

export default function Assignments({
  student,
  onBack,
  onOpenGame,
  externalAssignments,
  externalLockMap,
}) {
  const [assignments, setAssignments] = useState([]);
  const [completedMap, setCompletedMap] = useState({});
  const [lockMap, setLockMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const lastResetVersionRef = useRef(0);

  const studentId = useMemo(() => String(student?.id || "").trim(), [student?.id]);

  useAmbience("/sounds/camp-ambience.mp3", 0.15);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 200);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let unsubscribeAssignments = null;
    let unsubscribeResults = null;
    let unsubscribeClassroom = null;
    let unsubscribeStudentReset = null;

    setLoading(true);
    setCompletedMap({});
    setLockMap({});

    if (Array.isArray(externalAssignments)) {
      setAssignments(sortAssignments(externalAssignments));
      setLoading(false);
    } else {
      unsubscribeAssignments = subscribeAssignmentsForGrade(
        student?.grade,
        (items) => {
          setAssignments(sortAssignments(Array.isArray(items) ? items : []));
          setLoading(false);
        },
        (error) => {
          console.error("Error watching assignments:", error);
          setAssignments([]);
          setLoading(false);
        }
      );
    }

    if (!studentId) {
      setLoading(false);

      return () => {
        if (typeof unsubscribeAssignments === "function") {
          unsubscribeAssignments();
        }
      };
    }

    const studentRef = doc(db, "students", studentId);

    unsubscribeStudentReset = onSnapshot(
      studentRef,
      (snap) => {
        if (!snap.exists()) return;

        const data = snap.data();
        const resetVersion = Number(data?.resetVersion || 0);

        if (
          resetVersion &&
          resetVersion !== lastResetVersionRef.current
        ) {
          lastResetVersionRef.current = resetVersion;

          // Instant reset across the student assignments page
          setCompletedMap({});
        }
      },
      (error) => {
        console.error("Error watching student reset state:", error);
      }
    );

    const resultsRef = collection(db, "students", studentId, "assignmentResults");

    unsubscribeResults = onSnapshot(
      resultsRef,
      (snapshot) => {
        setCompletedMap(buildCompletedMap(snapshot));
      },
      (error) => {
        console.error("Error watching assignment results:", error);
        setCompletedMap({});
      }
    );

    const classQ = query(
      collection(db, "classrooms"),
      where("studentID", "array-contains", studentId)
    );

    unsubscribeClassroom = onSnapshot(
      classQ,
      (snapshot) => {
        if (!snapshot.empty) {
          const classData = snapshot.docs[0].data();
          const safeAssignments = ensureStudentAssignments(
            classData?.studentAssignments || {}
          );

          setLockMap(safeAssignments?.[studentId] || {});
        } else {
          setLockMap({});
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error watching classroom locks:", error);
        setLockMap({});
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribeAssignments === "function") unsubscribeAssignments();
      if (typeof unsubscribeResults === "function") unsubscribeResults();
      if (typeof unsubscribeClassroom === "function") unsubscribeClassroom();
      if (typeof unsubscribeStudentReset === "function") unsubscribeStudentReset();
    };
  }, [studentId, student?.grade, externalAssignments]);

  useEffect(() => {
    if (externalLockMap && Object.keys(externalLockMap).length > 0) {
      setLockMap(externalLockMap);
    }
  }, [externalLockMap]);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="assignments-page">
      <LayeredSkyScene variant="assignments" />

      <div className="assignments-shell">
        <div className="assignments-header">
          <div>
            <h1 className="assignments-title">Games</h1>
            <p className="assignments-subtitle">
              {student?.name || "Student"} — Grade {student?.grade ?? "?"}
            </p>
          </div>

          <button className="assignments-back-btn" type="button" onClick={onBack}>
            Back
          </button>
        </div>

        {loading ? (
          <div className="assignments-empty">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="assignments-empty">
            No assignments found for this grade yet.
          </div>
        ) : (
          <div className="assignments-grid">
            {assignments.map((assignment, index) => {
              const gameKey = assignment?.gameKey;
              const isCompleted = completedMap[gameKey] === true;
              const isLocked = lockMap[gameKey] === true;
              const theme = getAssignmentTheme(gameKey);
              const previewProblem = getPreviewProblem(gameKey);

              return (
                <div
                  className={`assignment-polaroid ${index % 2 === 0 ? "tilt-left" : "tilt-right"
                    } ${isLocked ? "assignment-polaroid--locked" : ""}`}
                  key={assignment?.id || gameKey || index}
                  role="button"
                  tabIndex={isLocked ? -1 : 0}
                  onClick={() => {
                    if (!isLocked && gameKey) {
                      onOpenGame(gameKey);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      !isLocked &&
                      gameKey &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      onOpenGame(gameKey);
                    }
                  }}
                >
                  <div className="assignment-grade-pill">
                    Grade {assignment?.grade ?? "?"}
                  </div>

                  <div className="assignment-polaroid-photo">
                    <StarTwinkleOverlay
                      image={theme.preview}
                      alt={`${getGameLabel(gameKey)} preview`}
                      problem={previewProblem}
                    />
                  </div>

                  <div className="assignment-polaroid-caption">
                    <h2>{getGameLabel(gameKey)}</h2>

                    <p className="assignment-description">
                      {assignment?.description || ""}
                    </p>

                    <div className="assignment-status-wrap">
                      <div
                        className={`assignment-status ${isCompleted ? "done" : "todo"
                          }`}
                      >
                        {isCompleted ? "Completed ✅" : "Not completed yet"}
                      </div>

                      <div
                        className={`assignment-status ${isLocked ? "locked" : "unlocked"
                          }`}
                      >
                        {isLocked ? "Locked 🔒" : "Unlocked 🔓"}
                      </div>
                    </div>

                    <button
                      className="assignment-play-btn"
                      type="button"
                      disabled={isLocked}
                      style={{
                        background: theme.accent,
                        "--btn-glow": `${theme.accent}99`,
                      }}
                      onClick={(event) => {
                        event.stopPropagation();

                        if (!isLocked && gameKey) {
                          onOpenGame(gameKey);
                        }
                      }}
                    >
                      {isLocked
                        ? "Locked"
                        : isCompleted
                          ? "Play Again"
                          : "Start Game"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showScrollTop && (
        <button
          className="scroll-top-btn"
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}