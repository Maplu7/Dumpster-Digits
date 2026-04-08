import { useEffect, useMemo, useState } from "react";
import "./TeacherDash.css";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

const assignmentCatalog = [
  { gameKey: "1st_addition", title: "1st Grade Addition", grade: 1 },
  { gameKey: "1st_subtraction", title: "1st Grade Subtraction", grade: 1 },
  { gameKey: "2nd_multiplication", title: "2nd Grade Multiplication", grade: 2 },
];

export default function TeacherDash({ teacher, onLogout }) {
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentResults, setStudentResults] = useState([]);

  const [managerAssignmentId, setManagerAssignmentId] = useState("");
  const [managerMode, setManagerMode] = useState("student");

  const [resultsViewMode, setResultsViewMode] = useState("student");
  const [openAssignments, setOpenAssignments] = useState({});
  const [openAttempts, setOpenAttempts] = useState({});

  const [showResetPanel, setShowResetPanel] = useState(false);
  const [resetMode, setResetMode] = useState("student");
  const [resetStudentId, setResetStudentId] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const selectedStudent = useMemo(() => {
    return students.find((student) => student.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  useEffect(() => {
    let unsubscribeClassroom = null;

    async function setupTeacherData() {
      try {
        let classDocId = null;

        if (teacher?.classId) {
          classDocId = teacher.classId;
        } else if (teacher?.id) {
          const q = query(
            collection(db, "classrooms"),
            where("teacherID", "==", teacher.id)
          );

          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            classDocId = snapshot.docs[0].id;
          }
        }

        if (!classDocId) {
          setClassroom(null);
          setStudents([]);
          setSelectedStudentId(null);
          return;
        }

        const classRef = doc(db, "classrooms", classDocId);

        unsubscribeClassroom = onSnapshot(
          classRef,
          async (classSnap) => {
            if (!classSnap.exists()) {
              setClassroom(null);
              setStudents([]);
              setSelectedStudentId(null);
              return;
            }

            const classData = classSnap.data();

            setClassroom({
              id: classSnap.id,
              ...classData,
            });

            const studentIds = classData.studentID || classData.studentIDs || [];

            if (!studentIds.length) {
              setStudents([]);
              setSelectedStudentId(null);
              return;
            }

            const loadedStudents = await Promise.all(
              studentIds.map(async (id) => {
                const cleanId = String(id).trim();
                const studentRef = doc(db, "students", cleanId);
                const studentSnap = await getDoc(studentRef);

                if (studentSnap.exists()) {
                  return {
                    id: cleanId,
                    ...studentSnap.data(),
                  };
                }

                return {
                  id: cleanId,
                  name: `Student ${cleanId}`,
                  grade: null,
                  birthday: null,
                };
              })
            );

            setStudents(loadedStudents);

            setSelectedStudentId((prevId) => {
              const stillExists = loadedStudents.some(
                (student) => student.id === prevId
              );

              if (stillExists) return prevId;
              return loadedStudents[0]?.id || null;
            });
          },
          (error) => {
            console.error("Error watching classroom:", error);
          }
        );
      } catch (error) {
        console.error("Error loading teacher dashboard data:", error);
        setClassroom(null);
        setStudents([]);
        setSelectedStudentId(null);
      }
    }

    if (teacher) {
      setupTeacherData();
    }

    return () => {
      if (unsubscribeClassroom) unsubscribeClassroom();
    };
  }, [teacher]);

  useEffect(() => {
    let unsubscribeResults = null;

    if (!selectedStudentId) {
      setStudentResults([]);
      return;
    }

    const resultsRef = collection(
      db,
      "students",
      String(selectedStudentId),
      "assignmentResults"
    );

    unsubscribeResults = onSnapshot(
      resultsRef,
      (snap) => {
        const results = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setStudentResults(results);
      },
      (error) => {
        console.error("Error watching student assignment results:", error);
        setStudentResults([]);
      }
    );

    return () => {
      if (unsubscribeResults) unsubscribeResults();
    };
  }, [selectedStudentId]);

  useEffect(() => {
    if (selectedStudentId) {
      setResetStudentId(selectedStudentId);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    if (!selectedStudent) {
      setManagerAssignmentId("");
      return;
    }

    const available = assignmentCatalog.filter(
      (assignment) => assignment.grade === Number(selectedStudent.grade)
    );

    if (!available.some((a) => a.gameKey === managerAssignmentId)) {
      setManagerAssignmentId(available[0]?.gameKey || "");
    }
  }, [selectedStudent, managerAssignmentId]);

  const selectedStudentAssignments = useMemo(() => {
    if (!selectedStudent) return [];

    return assignmentCatalog.filter(
      (assignment) => assignment.grade === Number(selectedStudent.grade)
    );
  }, [selectedStudent]);

  const groupedAssignments = useMemo(() => {
    if (!selectedStudent) return [];

    return assignmentCatalog
      .filter(
        (assignment) => assignment.grade === Number(selectedStudent.grade)
      )
      .map((assignment) => {
        const locked =
          classroom?.studentAssignments?.[selectedStudent.id]?.[
            assignment.gameKey
          ] ?? false;

        const attempts = studentResults
          .filter((result) => result.gameKey === assignment.gameKey)
          .sort((a, b) => {
            const aTime = getTimestampValue(
              a.completedAt || a.submittedAt || a.createdAt
            );
            const bTime = getTimestampValue(
              b.completedAt || b.submittedAt || b.createdAt
            );
            return bTime - aTime;
          })
          .map((attempt) => {
            const answers = Array.isArray(attempt.answers) ? attempt.answers : [];
            return {
              ...attempt,
              answers,
            };
          });

        return {
          id: assignment.gameKey,
          title: assignment.title,
          locked,
          attempts,
        };
      });
  }, [classroom, selectedStudent, studentResults]);

  function getTimestampValue(value) {
    if (!value) return 0;
    if (value?.seconds) return value.seconds * 1000;
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  function formatAttemptTime(value) {
    if (!value) return "No date saved";

    let date;

    if (value?.seconds) {
      date = new Date(value.seconds * 1000);
    } else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) return "No date saved";
    return date.toLocaleString();
  }

  function toggleAssignmentDropdown(assignmentId) {
    setOpenAssignments((prev) => ({
      ...prev,
      [assignmentId]: !prev[assignmentId],
    }));
  }

  function toggleAttemptDropdown(attemptId) {
    setOpenAttempts((prev) => ({
      ...prev,
      [attemptId]: !prev[attemptId],
    }));
  }

  async function setAssignmentLockForStudent(studentId, assignmentId, lockedValue) {
    if (!classroom?.id || !studentId || !assignmentId) return;

    const classRef = doc(db, "classrooms", classroom.id);

    await updateDoc(classRef, {
      [`studentAssignments.${studentId}.${assignmentId}`]: lockedValue,
    });
  }

  async function handleManagerLockChange(lockedValue) {
    try {
      if (!managerAssignmentId) {
        alert("Please pick an assignment first.");
        return;
      }

      if (managerMode === "student") {
        if (!selectedStudent?.id) {
          alert("Please choose a student first.");
          return;
        }

        await setAssignmentLockForStudent(
          selectedStudent.id,
          managerAssignmentId,
          lockedValue
        );

        alert(
          `${lockedValue ? "Locked" : "Unlocked"} assignment for ${
            selectedStudent.name || "selected student"
          }.`
        );
      } else {
        if (!students.length) {
          alert("No students found in this class.");
          return;
        }

        const matchingStudents = students.filter(
          (student) =>
            assignmentCatalog.find((a) => a.gameKey === managerAssignmentId)
              ?.grade === Number(student.grade)
        );

        await Promise.all(
          matchingStudents.map((student) =>
            setAssignmentLockForStudent(student.id, managerAssignmentId, lockedValue)
          )
        );

        alert(
          `${lockedValue ? "Locked" : "Unlocked"} assignment for the whole class.`
        );
      }
    } catch (error) {
      console.error("Error changing assignment lock:", error);
      alert("There was a problem updating assignment locks.");
    }
  }

  async function resetStudentAssignments(studentId) {
    if (!studentId) return;

    const resultsRef = collection(db, "students", String(studentId), "assignmentResults");
    const snap = await getDocs(resultsRef);
    const deletePromises = snap.docs.map((resultDoc) => deleteDoc(resultDoc.ref));
    await Promise.all(deletePromises);
  }

  async function handleResetAssignments() {
    try {
      setIsResetting(true);

      if (resetMode === "student") {
        if (!resetStudentId) {
          alert("Please pick a student to reset.");
          return;
        }

        await resetStudentAssignments(resetStudentId);
        alert("That student's assignment results were reset.");
      } else {
        if (!students.length) {
          alert("No students found in this class.");
          return;
        }

        await Promise.all(
          students.map((student) => resetStudentAssignments(student.id))
        );
        alert("Whole class assignment results were reset.");
      }

      setShowResetPanel(false);
    } catch (error) {
      console.error("Error resetting assignments:", error);
      alert("There was a problem resetting assignments.");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="tdash">
      <main className="tdash__main">
        <header className="tdash__header">
          <div className="tdash__header-copy">
            <h1 className="tdash__title">
              Welcome, {teacher?.name || "Teacher"}
            </h1>
            <p className="tdash__subtitle">
              Manage your class activities and track student progress.
            </p>
          </div>

          <div className="tdash__header-actions">
            <div className="tdash__class-box">
              <span className="tdash__class-label">Class</span>
              <strong className="tdash__class-name">
                {classroom?.id || teacher?.classId || "No Class Found"}
              </strong>
            </div>

            <button
              className="tdash__reset-btn"
              onClick={() => setShowResetPanel((prev) => !prev)}
              type="button"
            >
              Reset
            </button>

            <button className="tdash__logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        {showResetPanel && (
          <section className="tdash__card tdash__reset-card">
            <div className="tdash__card-head">
              <h2 className="tdash__section-title">Reset Assignment Results</h2>
            </div>

            <div className="tdash__reset-grid">
              <div className="tdash__reset-side">
                <label className="tdash__label">Reset Mode</label>
                <select
                  className="tdash__select"
                  value={resetMode}
                  onChange={(e) => setResetMode(e.target.value)}
                >
                  <option value="student">One Student</option>
                  <option value="class">Whole Class</option>
                </select>
              </div>

              <div className="tdash__reset-side">
                <label className="tdash__label">Student</label>
                <select
                  className="tdash__select"
                  value={resetStudentId}
                  onChange={(e) => setResetStudentId(e.target.value)}
                  disabled={resetMode === "class"}
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name || `Student ${student.id}`} ({student.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="tdash__reset-warning">
              {resetMode === "student"
                ? "This will remove all saved attempt history for the selected student."
                : "This will remove all saved attempt history for the whole class."}
            </div>

            <div className="tdash__reset-actions">
              <button
                className="tdash__ghost-btn"
                onClick={() => setShowResetPanel(false)}
                type="button"
              >
                Cancel
              </button>

              <button
                className="tdash__danger-btn"
                onClick={handleResetAssignments}
                type="button"
                disabled={isResetting}
              >
                {isResetting ? "Resetting..." : "Confirm Reset"}
              </button>
            </div>
          </section>
        )}

        <section className="tdash__stats">
          <div className="tdash__stat tdash__stat--orange">
            <div className="tdash__stat-number">{students.length}</div>
            <div className="tdash__stat-label">Students</div>
          </div>

          <div className="tdash__stat tdash__stat--blue">
            <div className="tdash__stat-number">
              {selectedStudentAssignments.length}
            </div>
            <div className="tdash__stat-label">Assignments</div>
          </div>

          <div className="tdash__stat tdash__stat--green">
            <div className="tdash__stat-number">{studentResults.length}</div>
            <div className="tdash__stat-label">Total Attempts</div>
          </div>
        </section>

        <section className="tdash__grid">
          <div className="tdash__card tdash__manager-card">
            <div className="tdash__card-head">
              <h2 className="tdash__section-title">Assignment Manager</h2>
            </div>

            <div className="tdash__manager-controls">
              <div className="tdash__manager-group">
                <label className="tdash__label">Apply To</label>
                <select
                  className="tdash__select"
                  value={managerMode}
                  onChange={(e) => setManagerMode(e.target.value)}
                >
                  <option value="student">Selected Student</option>
                  <option value="class">Whole Class</option>
                </select>
              </div>

              <div className="tdash__manager-group">
                <label className="tdash__label">Assignment</label>
                <select
                  className="tdash__select"
                  value={managerAssignmentId}
                  onChange={(e) => setManagerAssignmentId(e.target.value)}
                  disabled={!selectedStudentAssignments.length}
                >
                  <option value="">Select assignment</option>
                  {selectedStudentAssignments.map((assignment) => (
                    <option key={assignment.gameKey} value={assignment.gameKey}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tdash__manager-buttons">
                <button
                  className="tdash__manager-lock"
                  type="button"
                  onClick={() => handleManagerLockChange(true)}
                >
                  Lock Assignment
                </button>

                <button
                  className="tdash__manager-unlock"
                  type="button"
                  onClick={() => handleManagerLockChange(false)}
                >
                  Unlock Assignment
                </button>
              </div>
            </div>

            <div className="tdash__manager-note">
              {managerMode === "student"
                ? `Currently editing assignments for ${
                    selectedStudent?.name || "the selected student"
                  }.`
                : "Currently editing this assignment for the whole class."}
            </div>
          </div>

          <div className="tdash__card">
            <div className="tdash__card-head">
              <h2 className="tdash__section-title">Student Details</h2>
            </div>

            <div className="tdash__student-list tdash__student-list--details">
              <h3 className="tdash__mini-title">Students</h3>

              {students.length > 0 ? (
                students.map((student) => (
                  <button
                    className={`tdash__student-btn ${
                      selectedStudentId === student.id
                        ? "tdash__student-btn--active"
                        : ""
                    }`}
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    type="button"
                  >
                    <span className="tdash__student-name">
                      {student.name || `Student ${student.id}`}
                    </span>
                    <span className="tdash__student-id">({student.id})</span>
                  </button>
                ))
              ) : (
                <p className="tdash__empty-text">
                  No students found for this class yet.
                </p>
              )}
            </div>

            {selectedStudent ? (
              <div className="tdash__details-grid">
                <div className="tdash__detail-item">
                  <span className="tdash__detail-title">Name</span>
                  <span className="tdash__pill">
                    {selectedStudent.name || "Unknown Student"}
                  </span>
                </div>

                <div className="tdash__detail-item">
                  <span className="tdash__detail-title">Student ID</span>
                  <span className="tdash__pill">{selectedStudent.id}</span>
                </div>

                <div className="tdash__detail-item">
                  <span className="tdash__detail-title">Grade</span>
                  <span className="tdash__pill">
                    {selectedStudent.grade ?? "—"}
                  </span>
                </div>

                <div className="tdash__detail-item">
                  <span className="tdash__detail-title">Birthday</span>
                  <span className="tdash__pill">
                    {selectedStudent.birthday ?? "—"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="tdash__empty-text">No student selected yet.</p>
            )}
          </div>
        </section>

        <section className="tdash__card">
          <div className="tdash__card-head">
            <h2 className="tdash__section-title">Assignment Results</h2>

            <select
              className="tdash__select tdash__results-select"
              value={resultsViewMode}
              onChange={(e) => setResultsViewMode(e.target.value)}
            >
              <option value="student">Selected Student View</option>
              <option value="class">Whole Class View</option>
            </select>
          </div>

          {resultsViewMode === "student" ? (
            groupedAssignments.length > 0 ? (
              <div className="tdash__accordion-list">
                {groupedAssignments.map((assignment) => {
                  const isOpen = !!openAssignments[assignment.id];

                  return (
                    <div className="tdash__accordion" key={assignment.id}>
                      <button
                        className="tdash__accordion-head"
                        onClick={() => toggleAssignmentDropdown(assignment.id)}
                        type="button"
                      >
                        <div className="tdash__accordion-main">
                          <span className="tdash__accordion-title">
                            {assignment.title}
                          </span>
                          <span className="tdash__accordion-progress">
                            {assignment.attempts.length} attempt
                            {assignment.attempts.length === 1 ? "" : "s"}
                          </span>
                        </div>

                        <span className="tdash__accordion-arrow">
                          {isOpen ? "▲" : "▼"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="tdash__accordion-body">
                          {assignment.attempts.length > 0 ? (
                            <div className="tdash__attempt-list">
                              {assignment.attempts.map((attempt, index) => {
                                const isAttemptOpen = !!openAttempts[attempt.id];

                                return (
                                  <div className="tdash__attempt-card" key={attempt.id}>
                                    <button
                                      className="tdash__attempt-head"
                                      onClick={() => toggleAttemptDropdown(attempt.id)}
                                      type="button"
                                    >
                                      <div className="tdash__attempt-head-main">
                                        <span className="tdash__attempt-title">
                                          Attempt {assignment.attempts.length - index}
                                        </span>
                                        <span className="tdash__attempt-date">
                                          {formatAttemptTime(
                                            attempt.completedAt ||
                                              attempt.submittedAt ||
                                              attempt.createdAt
                                          )}
                                        </span>
                                      </div>

                                      <span className="tdash__attempt-summary">
                                        Wrong tries: {attempt.totalWrongGuesses ?? 0}
                                      </span>

                                      <span className="tdash__accordion-arrow">
                                        {isAttemptOpen ? "▲" : "▼"}
                                      </span>
                                    </button>

                                    {isAttemptOpen && (
                                      <div className="tdash__attempt-body">
                                        {attempt.answers.length > 0 ? (
                                          <div className="tdash__answer-list">
                                            {attempt.answers.map((answer, answerIndex) => {
                                              const isWrong = !answer.isCorrect;

                                              return (
                                                <div
                                                  key={`${attempt.id}-${answerIndex}`}
                                                  className={`tdash__answer-row ${
                                                    isWrong
                                                      ? "tdash__answer-row--wrong"
                                                      : ""
                                                  }`}
                                                >
                                                  <div className="tdash__answer-top">
                                                    <span className="tdash__answer-problem">
                                                      {answer.problem || "Problem"}
                                                    </span>

                                                    {isWrong && (
                                                      <span className="tdash__answer-status tdash__answer-status--wrong">
                                                        Wrong
                                                      </span>
                                                    )}
                                                  </div>

                                                  <div className="tdash__answer-meta">
                                                    <span>
                                                      Student Answer:{" "}
                                                      <strong>
                                                        {String(answer.studentAnswer ?? "—")}
                                                      </strong>
                                                    </span>
                                                    <span>
                                                      Correct Answer:{" "}
                                                      <strong>
                                                        {String(answer.correctAnswer ?? "—")}
                                                      </strong>
                                                    </span>
                                                    <span>
                                                      Wrong Tries:{" "}
                                                      <strong>
                                                        {answer.wrongTries ?? 0}
                                                      </strong>
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ) : attempt.problemBreakdown ? (
                                          <div className="tdash__answer-list">
                                            {Object.entries(attempt.problemBreakdown).map(
                                              ([problem, tries]) => {
                                                const isWrong = Number(tries) > 0;

                                                return (
                                                  <div
                                                    key={`${attempt.id}-${problem}`}
                                                    className={`tdash__answer-row ${
                                                      isWrong
                                                        ? "tdash__answer-row--wrong"
                                                        : ""
                                                    }`}
                                                  >
                                                    <div className="tdash__answer-top">
                                                      <span className="tdash__answer-problem">
                                                        {problem}
                                                      </span>

                                                      {isWrong && (
                                                        <span className="tdash__answer-status tdash__answer-status--wrong">
                                                          Wrong
                                                        </span>
                                                      )}
                                                    </div>

                                                    <div className="tdash__answer-meta">
                                                      <span>
                                                        Wrong Tries:{" "}
                                                        <strong>{tries}</strong>
                                                      </span>
                                                    </div>
                                                  </div>
                                                );
                                              }
                                            )}
                                          </div>
                                        ) : (
                                          <p className="tdash__empty-text">
                                            No answer-by-answer data saved for this attempt yet.
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="tdash__empty-text">
                              This assignment has not been completed yet.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="tdash__empty-text">
                No assignments for this student’s grade yet.
              </p>
            )
          ) : (
            <div className="tdash__class-view">
              {selectedStudentAssignments.length > 0 ? (
                selectedStudentAssignments.map((assignment) => {
                  const studentsForGrade = students.filter(
                    (student) => Number(student.grade) === assignment.grade
                  );

                  return (
                    <div className="tdash__class-assignment-card" key={assignment.gameKey}>
                      <div className="tdash__class-assignment-title">
                        {assignment.title}
                      </div>

                      <div className="tdash__class-student-lines">
                        {studentsForGrade.length > 0 ? (
                          studentsForGrade.map((student) => {
                            const locked =
                              classroom?.studentAssignments?.[student.id]?.[
                                assignment.gameKey
                              ] ?? false;

                            return (
                              <div
                                key={`${assignment.gameKey}-${student.id}`}
                                className="tdash__class-student-line"
                              >
                                <span>{student.name || `Student ${student.id}`}</span>
                                <span
                                  className={`tdash__class-lock-pill ${
                                    locked
                                      ? "tdash__class-lock-pill--locked"
                                      : "tdash__class-lock-pill--unlocked"
                                  }`}
                                >
                                  {locked ? "Locked" : "Unlocked"}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <p className="tdash__empty-text">
                            No students in this grade.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="tdash__empty-text">
                  No whole class assignment view available yet.
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}