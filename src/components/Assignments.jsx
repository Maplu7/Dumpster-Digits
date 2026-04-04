import { useEffect, useState } from "react";
import "./Assignments.css";
import { getAssignmentsForGrade } from "../assignmentService";

export default function Assignments({ student, onBack, onOpenGame }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssignments() {
      setLoading(true);
      const items = await getAssignmentsForGrade(student?.grade);
      setAssignments(items);
      setLoading(false);
    }

    loadAssignments();
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
            {assignments.map((assignment) => (
              <div className="assignment-card" key={assignment.id}>
                <div className="assignment-badge">
                  Grade {assignment.grade}
                </div>

                <h2>{assignment.title}</h2>
                <p>{assignment.description}</p>

                <button
                  className="assignment-play-btn"
                  onClick={() => onOpenGame(assignment.gameKey)}
                >
                  Start Game
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}