import { useEffect, useState } from "react";
import "./Assignments.css";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAssignmentsForGrade } from "../assignmentService";
import { getAssignmentTheme } from "./appTheme";
import StarTwinkleOverlay from "./StarTwinkleOverlay";
import LayeredSkyScene from "../components/LayeredSkyScene";
import useAmbience from "../hooks/useAmbience";

function getPreviewProblem(gameKey) {
  switch (gameKey) {
    case "1st_addition":
      return "1 + 5";
    case "1st_subtraction":
      return "5 - 1";
    case "2nd_addition":
      return "8 + 7";
    case "2nd_subtraction":
      return "15 - 6";
    case "2nd_fill_blank":
      return "4 + _ = 10";
    case "2nd_place_value":
      return "42 → 4 tens";
    case "2nd_multiplication":
      return "2 × 3";
    default:
      return "1 + 5";
  }
}

function getAssignmentOrder(gameKey) {
  if (gameKey === "1st_addition") return 0;
  if (gameKey === "1st_subtraction") return 1;
  if (gameKey === "2nd_addition") return 2;
  if (gameKey === "2nd_subtraction") return 3;
  if (gameKey === "2nd_fill_blank") return 4;
  if (gameKey === "2nd_place_value") return 5;
  if (gameKey === "2nd_multiplication") return 6;
  return 99;
}

function getGameLabel(gameKey) {
  switch (gameKey) {
    case "1st_addition":
      return "Addition";
    case "1st_subtraction":
      return "Subtraction";
    case "2nd_addition":
      return "2nd Grade Addition";
    case "2nd_subtraction":
      return "2nd Grade Subtraction";
    case "2nd_fill_blank":
      return "Fill in the Blank";
    case "2nd_place_value":
      return "Place Value";
    case "2nd_multiplication":
      return "Multiplication";
    default:
      return "Game";
  }
}

export default function Assignments({
  student,
  onBack,
  onOpenGame,
  externalAssignments,
  externalCompletedMap,
  externalLockMap,
}) {
  const usingExternalData = Array.isArray(externalAssignments);
  const [assignments, setAssignments] = useState([]);
  const [completedMap, setCompletedMap] = useState({});
  const [lockMap, setLockMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useAmbience("/sounds/camp-ambience.mp3", 0.15);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    if (usingExternalData) {
      const safeAssignments = Array.isArray(externalAssignments)
        ? [...externalAssignments].sort(
            (a, b) =>
              getAssignmentOrder(a?.gameKey) - getAssignmentOrder(b?.gameKey)
          )
        : [];

      setAssignments(safeAssignments);
      setCompletedMap(externalCompletedMap || {});
      setLockMap(externalLockMap || {});
      setLoading(false);
      return;
    }

    let unsubscribeResults = null;
    let unsubscribeClassroom = null;

    async function loadAssignmentsAndWatch() {
      setLoading(true);

      const items = await getAssignmentsForGrade(student?.grade);

      const sortedItems = Array.isArray(items)
        ? [...items].sort(
            (a, b) =>
              getAssignmentOrder(a?.gameKey) - getAssignmentOrder(b?.gameKey)
          )
        : [];

      setAssignments(sortedItems);

      if (!student?.id) {
        setLoading(false);
        return;
      }

      const resultsRef = collection(
        db,
        "students",
        String(student.id),
        "assignmentResults"
      );

      unsubscribeResults = onSnapshot(resultsRef, (snapshot) => {
        const completed = {};
        snapshot.forEach((docSnap) => {
          const gameKey = docSnap.data()?.gameKey;
          if (gameKey) completed[gameKey] = true;
        });
        setCompletedMap(completed);
      });

      const classQ = query(
        collection(db, "classrooms"),
        where("studentID", "array-contains", String(student.id))
      );

      unsubscribeClassroom = onSnapshot(classQ, (snapshot) => {
        if (!snapshot.empty) {
          const classData = snapshot.docs[0].data();
          const studentLocks =
            classData?.studentAssignments?.[String(student.id)] || {};
          setLockMap(studentLocks);
        } else {
          setLockMap({});
        }

        setLoading(false);
      });
    }

    loadAssignmentsAndWatch();

    return () => {
      if (unsubscribeResults) unsubscribeResults();
      if (unsubscribeClassroom) unsubscribeClassroom();
    };
  }, [
    student,
    usingExternalData,
    externalAssignments,
    externalCompletedMap,
    externalLockMap,
  ]);

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

          <button className="assignments-back-btn" onClick={onBack}>
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
              const isCompleted = completedMap[assignment?.gameKey] === true;
              const isLocked = lockMap[assignment?.gameKey] === true;
              const theme = getAssignmentTheme(assignment?.gameKey);
              const previewProblem = getPreviewProblem(assignment?.gameKey);

              return (
                <div
                  className={`assignment-polaroid ${
                    index % 2 === 0 ? "tilt-left" : "tilt-right"
                  }`}
                  key={assignment?.id || index}
                  onClick={() => {
                    if (!isLocked && assignment?.gameKey) {
                      onOpenGame(assignment.gameKey);
                    }
                  }}
                >
                  <div className="assignment-grade-pill">
                    Grade {assignment?.grade ?? "?"}
                  </div>

                  <div className="assignment-polaroid-photo">
                    <StarTwinkleOverlay
                      image={theme.preview}
                      alt="preview"
                      problem={previewProblem}
                    />
                  </div>

                  <div className="assignment-polaroid-caption">
                    <h2>{getGameLabel(assignment?.gameKey)}</h2>

                    <p className="assignment-description">
                      {assignment?.description || ""}
                    </p>

                    <div className="assignment-status-wrap">
                      <div
                        className={`assignment-status ${
                          isCompleted ? "done" : "todo"
                        }`}
                      >
                        {isCompleted ? "Completed ✅" : "Not completed yet"}
                      </div>

                      <div
                        className={`assignment-status ${
                          isLocked ? "locked" : "unlocked"
                        }`}
                      >
                        {isLocked ? "Locked 🔒" : "Unlocked 🔓"}
                      </div>
                    </div>

                    <button
                      className="assignment-play-btn"
                      disabled={isLocked}
                      style={{
                        background: theme.accent,
                        "--btn-glow": `${theme.accent}99`,
                      }}
                    >
                      {isCompleted ? "Play Again" : "Start Game"}
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