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

export default function Assignments({ student, onBack, onOpenGame }) {
  const [assignments, setAssignments] = useState([]);
  const [completedMap, setCompletedMap] = useState({});
  const [lockMap, setLockMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeResults = null;
    let unsubscribeClassroom = null;

    async function loadAssignmentsAndWatch() {
      setLoading(true);

      const items = await getAssignmentsForGrade(student?.grade);
      setAssignments(items);

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

      unsubscribeResults = onSnapshot(
        resultsRef,
        (snapshot) => {
          const completed = {};
          snapshot.forEach((docSnap) => {
            completed[docSnap.id] = true;
          });
          setCompletedMap(completed);
        },
        (error) => {
          console.error("Error watching completed assignments:", error);
        }
      );

      const classQ = query(
        collection(db, "classrooms"),
        where("studentID", "array-contains", String(student.id))
      );

      unsubscribeClassroom = onSnapshot(
        classQ,
        (snapshot) => {
          if (!snapshot.empty) {
            const classData = snapshot.docs[0].data();
            const studentLocks =
              classData?.studentAssignments?.[String(student.id)] || {};
            setLockMap(studentLocks);
          } else {
            setLockMap({});
          }

          setLoading(false);
        },
        (error) => {
          console.error("Error watching classroom locks:", error);
          setLoading(false);
        }
      );
    }

    loadAssignmentsAndWatch();

    return () => {
      if (unsubscribeResults) unsubscribeResults();
      if (unsubscribeClassroom) unsubscribeClassroom();
    };
  }, [student]);

  return (
    <div className="assignments-page">
      <div className="assignments-shell">
        <div className="assignments-header">
          <div>
            <h1 className="assignments-title">Assignments</h1>
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
            {assignments.map((assignment) => {
              const isCompleted = completedMap[assignment.gameKey] === true;
              const isLocked = lockMap[assignment.gameKey] === true;

              return (
                <div className="assignment-card" key={assignment.id}>
                  <div className="assignment-badge">
                    Grade {assignment.grade}
                  </div>

                  <h2>{assignment.title}</h2>
                  <p>{assignment.description}</p>

                  <div
                    style={{
                      marginBottom: "8px",
                      fontWeight: "bold",
                      color: isCompleted ? "#2e7d32" : "#8a5a5a",
                    }}
                  >
                    {isCompleted ? "Completed ✅" : "Not completed yet"}
                  </div>

                  <div
                    style={{
                      marginBottom: "14px",
                      fontWeight: "bold",
                      color: isLocked ? "#b23a48" : "#2b6cb0",
                    }}
                  >
                    {isLocked ? "Locked 🔒" : "Unlocked 🔓"}
                  </div>

                  <button
                    className="assignment-play-btn"
                    onClick={() => onOpenGame(assignment.gameKey)}
                    disabled={isLocked}
                    style={{
                      opacity: isLocked ? 0.6 : 1,
                      cursor: isLocked ? "not-allowed" : "pointer",
                    }}
                  >
                    {isLocked
                      ? "Locked"
                      : isCompleted
                      ? "Play Again"
                      : "Start Game"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}