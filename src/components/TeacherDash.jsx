import { useEffect, useState } from "react";
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
} from "firebase/firestore";

export default function TeacherDash({ teacher, onLogout }) {
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignmentsHidden, setAssignmentsHidden] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [studentResults, setStudentResults] = useState([]);

  useEffect(() => {
    async function loadTeacherData() {
      try {
        let classData = null;
        let classDocId = null;

        if (teacher?.classId) {
          const classRef = doc(db, "classrooms", teacher.classId);
          const classSnap = await getDoc(classRef);

          if (classSnap.exists()) {
            classData = classSnap.data();
            classDocId = classSnap.id;
          }
        }

        if (!classData && teacher?.id) {
          const q = query(
            collection(db, "classrooms"),
            where("teacherID", "==", teacher.id)
          );

          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const classDoc = snapshot.docs[0];
            classData = classDoc.data();
            classDocId = classDoc.id;
          }
        }

        if (!classData) {
          setClassroom(null);
          setStudents([]);
          setSelectedStudent(null);
          setAssignments([]);
          return;
        }

        setClassroom({
          id: classDocId,
          ...classData,
        });

        const assignmentMap = classData.assignments || {};

        const loadedAssignments = [
          { id: "assignment1", title: "Assignment 1" },
          { id: "assignment2", title: "Assignment 2" },
          { id: "assignment3", title: "Assignment 3" },
          { id: "assignment4", title: "Assignment 4" },
        ].map((assignment) => ({
          ...assignment,
          locked: assignmentMap[assignment.id] ?? false,
          score: 0,
        }));

        setAssignments(loadedAssignments);

        const studentIds = classData.studentID || classData.studentIDs || [];

        if (!studentIds.length) {
          setStudents([]);
          setSelectedStudent(null);
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
        setSelectedStudent(loadedStudents[0] || null);
      } catch (error) {
        console.error("Error loading teacher dashboard data:", error);
        setStudents([]);
        setSelectedStudent(null);
        setAssignments([]);
      }
    }

    if (teacher) {
      loadTeacherData();
    }
  }, [teacher]);

  useEffect(() => {
    async function loadSelectedStudentResults() {
      if (!selectedStudent?.id) {
        setStudentResults([]);
        return;
      }

      try {
        const resultsRef = collection(
          db,
          "students",
          String(selectedStudent.id),
          "assignmentResults"
        );

        const snap = await getDocs(resultsRef);

        const results = snap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setStudentResults(results);
      } catch (error) {
        console.error("Error loading student assignment results:", error);
        setStudentResults([]);
      }
    }

    loadSelectedStudentResults();
  }, [selectedStudent]);

  async function toggleAssignmentLock(assignmentId) {
    try {
      if (!classroom?.id) return;

      const newAssignments = assignments.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, locked: !assignment.locked }
          : assignment
      );

      setAssignments(newAssignments);

      const updatedAssignment = newAssignments.find(
        (assignment) => assignment.id === assignmentId
      );

      const classRef = doc(db, "classrooms", classroom.id);

      await updateDoc(classRef, {
        [`assignments.${assignmentId}`]: updatedAssignment.locked,
      });
    } catch (error) {
      console.error("Error updating assignment lock:", error);
    }
  }

  return (
    <div className="tdash">
      <main className="tdash__main">
        <header className="tdash__header">
          <div>
            <h1 className="tdash__title">
              Welcome, {teacher?.name || "Teacher"}
            </h1>
            <p className="tdash__subtitle">
              Manage your class activities and track student progress.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div className="tdash__class-box">
              <span className="tdash__class-label">Class</span>
              <strong className="tdash__class-name">
                {classroom?.id || teacher?.classId || "No Class Found"}
              </strong>
            </div>

            <button
              onClick={onLogout}
              style={{
                padding: "10px 14px",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                background: "#ff5a5a",
                color: "white",
                fontWeight: "bold",
              }}
            >
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
              <h2 className="tdash__section-title">Assignments</h2>

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
                  <span>Class Score</span>
                </div>

                <div className="tdash__table-body">
                  {assignments.map((assignment) => (
                    <div className="tdash__row" key={assignment.id}>
                      <span className="tdash__row-title">
                        {assignment.title}
                      </span>

                      <button
                        className={
                          assignment.locked
                            ? "tdash__status tdash__status--locked"
                            : "tdash__status tdash__status--unlocked"
                        }
                        onClick={() => toggleAssignmentLock(assignment.id)}
                      >
                        {assignment.locked ? "Locked 🔒" : "Unlocked 🔓"}
                      </button>

                      <span className="tdash__score">{assignment.score}%</span>
                    </div>
                  ))}
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
                    className="tdash__student-btn"
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    style={{
                      background:
                        selectedStudent?.id === student.id ? "#e5d3a3" : "#f5f5f5",
                      fontWeight:
                        selectedStudent?.id === student.id ? "bold" : "normal",
                    }}
                  >
                    {student.name || `Student ${student.id}`} ({student.id})
                  </button>
                ))
              ) : (
                <p>No students found for this class yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="tdash__card">
          <div className="tdash__card-head">
            <h2 className="tdash__section-title">Student Details</h2>
          </div>

          {selectedStudent ? (
            <div className="tdash__details-list">
              <div className="tdash__detail-item">
                <div className="tdash__detail-title">Name</div>
                <div className="tdash__pill">
                  {selectedStudent.name || "Unknown Student"}
                </div>
              </div>

              <div className="tdash__detail-item">
                <div className="tdash__detail-title">Student ID</div>
                <div className="tdash__pill">{selectedStudent.id}</div>
              </div>

              <div className="tdash__detail-item">
                <div className="tdash__detail-title">Grade</div>
                <div className="tdash__pill">
                  {selectedStudent.grade ?? "—"}
                </div>
              </div>

              <div className="tdash__detail-item">
                <div className="tdash__detail-title">Birthday</div>
                <div className="tdash__pill">
                  {selectedStudent.birthday ?? "—"}
                </div>
              </div>

              <div style={{ marginTop: "18px" }}>
                <h3 style={{ marginBottom: "10px" }}>Assignment Results</h3>

                {studentResults.length > 0 ? (
                  studentResults.map((result) => (
                    <div
                      key={result.id}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "12px",
                        marginBottom: "12px",
                        background: "#fff",
                      }}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                        {result.assignmentTitle || result.gameKey}
                      </div>

                      <div style={{ marginBottom: "8px" }}>
                        Total Wrong Tries:{" "}
                        <strong>{result.totalWrongGuesses ?? 0}</strong>
                      </div>

                      {result.problemBreakdown && (
                        <div>
                          {Object.entries(result.problemBreakdown).map(
                            ([problem, tries]) => (
                              <div key={problem} style={{ fontSize: "14px" }}>
                                {problem}: {tries} wrong tries
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No completed assignments yet.</p>
                )}
              </div>
            </div>
          ) : (
            <p>No student selected yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}