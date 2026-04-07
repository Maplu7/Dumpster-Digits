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
  const [assignmentsHidden, setAssignmentsHidden] = useState(false);
  const [studentResults, setStudentResults] = useState([]);

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

  const assignments = useMemo(() => {
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

        const matchingResult = studentResults.find(
          (result) => result.gameKey === assignment.gameKey
        );

        return {
          id: assignment.gameKey,
          title: assignment.title,
          locked,
          score: matchingResult ? "Completed ✅" : "Not started",
        };
      });
  }, [classroom, selectedStudent, studentResults]);

  async function toggleAssignmentLock(assignmentId) {
    try {
      if (!classroom?.id || !selectedStudent?.id) return;

      const currentLocked =
        classroom?.studentAssignments?.[selectedStudent.id]?.[assignmentId] ??
        false;

      const newLocked = !currentLocked;

      const classRef = doc(db, "classrooms", classroom.id);

      await updateDoc(classRef, {
        [`studentAssignments.${selectedStudent.id}.${assignmentId}`]: newLocked,
      });
    } catch (error) {
      console.error("Error updating assignment lock:", error);
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

            <button className="tdash__logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="tdash__stats">
          <div className="tdash__stat tdash__stat--orange">
            <div className="tdash__stat-number">{students.length}</div>
            <div className="tdash__stat-label">Students</div>
          </div>

          <div className="tdash__stat tdash__stat--blue">
            <div className="tdash__stat-number">{assignments.length}</div>
            <div className="tdash__stat-label">Assignments</div>
          </div>

          <div className="tdash__stat tdash__stat--green">
            <div className="tdash__stat-number">{studentResults.length}</div>
            <div className="tdash__stat-label">Completed Games</div>
          </div>
        </section>

        <section className="tdash__grid">
          <div className="tdash__card tdash__card--wide">
            <div className="tdash__card-head">
              <h2 className="tdash__section-title">
                {selectedStudent
                  ? `${selectedStudent.name}'s Assignments`
                  : "Assignments"}
              </h2>

              <button
                className="tdash__ghost-btn"
                onClick={() => setAssignmentsHidden((prev) => !prev)}
              >
                {assignmentsHidden ? "Show" : "Hide"}
              </button>
            </div>

            {!assignmentsHidden && (
              <>
                <div className="tdash__table-head">
                  <span>Assignment</span>
                  <span>Status</span>
                  <span>Progress</span>
                </div>

                <div className="tdash__table-body">
                  {assignments.length > 0 ? (
                    assignments.map((assignment) => (
                      <div className="tdash__row" key={assignment.id}>
                        <span className="tdash__row-title">
                          {assignment.title}
                        </span>

                        <button
                          className={`tdash__status ${
                            assignment.locked
                              ? "tdash__status--locked"
                              : "tdash__status--unlocked"
                          }`}
                          onClick={() => toggleAssignmentLock(assignment.id)}
                        >
                          {assignment.locked ? "Locked 🔒" : "Unlocked 🔓"}
                        </button>

                        <span className="tdash__score">{assignment.score}</span>
                      </div>
                    ))
                  ) : (
                    <p className="tdash__empty-text">
                      No assignments for this student’s grade yet.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="tdash__card">
            <div className="tdash__card-head">
              <h2 className="tdash__section-title">Students</h2>
            </div>

            <div className="tdash__student-list">
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
          </div>
        </section>

        <section className="tdash__card">
          <div className="tdash__card-head">
            <h2 className="tdash__section-title">Student Details</h2>
          </div>

          {selectedStudent ? (
            <>
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

              <div className="tdash__results">
                <h3 className="tdash__results-title">Assignment Results</h3>

                {studentResults.length > 0 ? (
                  <div className="tdash__results-list">
                    {studentResults.map((result) => (
                      <div className="tdash__result-card" key={result.id}>
                        <div className="tdash__result-title">
                          {result.assignmentTitle || result.gameKey}
                        </div>

                        <div className="tdash__result-meta">
                          Total Wrong Tries:{" "}
                          <strong>{result.totalWrongGuesses ?? 0}</strong>
                        </div>

                        {result.problemBreakdown && (
                          <div className="tdash__result-breakdown">
                            {Object.entries(result.problemBreakdown).map(
                              ([problem, tries]) => (
                                <div
                                  key={problem}
                                  className="tdash__result-line"
                                >
                                  <span>{problem}</span>
                                  <span>{tries} wrong tries</span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="tdash__empty-text">
                    No completed assignments yet.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="tdash__empty-text">No student selected yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}