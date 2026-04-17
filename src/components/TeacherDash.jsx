import { useEffect, useMemo, useState } from "react";
import "./TeacherDash.css";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import StudentGroupsBuilder from "./StudentGroupsBuilder";

const assignmentCatalog = [
  { gameKey: "1st_addition", title: "1st Grade Addition", grade: 1 },
  { gameKey: "1st_subtraction", title: "1st Grade Subtraction", grade: 1 },
  { gameKey: "2nd_addition", title: "2nd Grade Addition", grade: 2 },
  { gameKey: "2nd_subtraction", title: "2nd Grade Subtraction", grade: 2 },
  { gameKey: "2nd_fill_blank", title: "2nd Grade Fill in the Blank", grade: 2 },
  { gameKey: "2nd_place_value", title: "2nd Grade Place Value", grade: 2 },
  { gameKey: "2nd_multiplication", title: "2nd Grade Multiplication", grade: 2 },
];

function getTimestampValue(value) {
  if (!value) return 0;
  if (value?.seconds) return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatAttemptTime(value) {
  if (!value) return "No date saved";

  const date = value?.seconds
    ? new Date(value.seconds * 1000)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return "No date saved";
  return date.toLocaleString();
}

function getAnswerPercentage(answer) {
  const wrongTries = Number(answer?.wrongTries || 0);
  const isCorrect = answer?.isCorrect !== false;

  if (!isCorrect) return 0;
  return Math.max(0, 100 - wrongTries * 25);
}

function getBreakdownPercentage(tries) {
  const wrongTries = Number(tries || 0);
  return Math.max(0, 100 - wrongTries * 25);
}

function getAttemptPercent(attempt) {
  if (!attempt) return 0;

  const answers = Array.isArray(attempt.answers) ? attempt.answers : [];
  if (answers.length > 0) {
    const total = answers.reduce(
      (sum, answer) => sum + getAnswerPercentage(answer),
      0
    );
    return Math.round(total / answers.length);
  }

  if (attempt.problemBreakdown && typeof attempt.problemBreakdown === "object") {
    const entries = Object.entries(attempt.problemBreakdown);
    if (entries.length > 0) {
      const total = entries.reduce(
        (sum, [, tries]) => sum + getBreakdownPercentage(tries),
        0
      );
      return Math.round(total / entries.length);
    }
  }

  if (typeof attempt.percentCorrect === "number") {
    return Math.round(attempt.percentCorrect);
  }

  if (typeof attempt.score === "number") {
    return Math.round(attempt.score);
  }

  return 0;
}

function getLatestAttemptForGame(results, gameKey) {
  return [...results]
    .filter((result) => result.gameKey === gameKey)
    .sort((a, b) => {
      const aTime = getTimestampValue(a.completedAt || a.submittedAt || a.createdAt);
      const bTime = getTimestampValue(b.completedAt || b.submittedAt || b.createdAt);
      return bTime - aTime;
    })[0] || null;
}

export default function TeacherDash({ teacher, onLogout }) {
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [allResultsByStudent, setAllResultsByStudent] = useState({});

  const [managerMode, setManagerMode] = useState("student");
  const [managerAssignmentId, setManagerAssignmentId] = useState("");
  const [managerGroupId, setManagerGroupId] = useState("");

  const [resetMode, setResetMode] = useState("student");
  const [resetStudentId, setResetStudentId] = useState("");
  const [resetGroupId, setResetGroupId] = useState("");
  const [showResetPanel, setShowResetPanel] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [resultsViewMode, setResultsViewMode] = useState("student");
  const [resultsGroupId, setResultsGroupId] = useState("");

  const [openAssignments, setOpenAssignments] = useState({});
  const [openAttempts, setOpenAttempts] = useState({});
  const [openClassAssignments, setOpenClassAssignments] = useState({});

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hideResults, setHideResults] = useState(false);
  const [showGroupsBuilder, setShowGroupsBuilder] = useState(false);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const resolvedGrade = useMemo(() => {
    const directGrade =
      classroom?.grade ??
      classroom?.classGrade ??
      teacher?.grade ??
      teacher?.classGrade;

    const parsedDirect = Number(directGrade);
    if (!Number.isNaN(parsedDirect)) return parsedDirect;

    const selectedGrade = Number(selectedStudent?.grade);
    if (!Number.isNaN(selectedGrade)) return selectedGrade;

    const firstStudentGrade = Number(students[0]?.grade);
    if (!Number.isNaN(firstStudentGrade)) return firstStudentGrade;

    return null;
  }, [classroom, teacher, selectedStudent, students]);

  const assignmentsForClass = useMemo(() => {
    if (resolvedGrade == null) return [];
    return assignmentCatalog.filter(
      (assignment) => Number(assignment.grade) === Number(resolvedGrade)
    );
  }, [resolvedGrade]);

  const studentGroups = useMemo(() => {
    const raw = classroom?.studentGroups || {};
    return Object.entries(raw).map(([id, group]) => ({
      id,
      name: group?.name || "Untitled Group",
      studentIds: Array.isArray(group?.studentIds) ? group.studentIds : [],
    }));
  }, [classroom]);

  const selectedManagerGroup = useMemo(
    () => studentGroups.find((group) => group.id === managerGroupId) || null,
    [studentGroups, managerGroupId]
  );

  const selectedResetGroup = useMemo(
    () => studentGroups.find((group) => group.id === resetGroupId) || null,
    [studentGroups, resetGroupId]
  );

  const selectedResultsGroup = useMemo(
    () => studentGroups.find((group) => group.id === resultsGroupId) || null,
    [studentGroups, resultsGroupId]
  );

  const managerTargetStudents = useMemo(() => {
    if (managerMode === "student") return selectedStudent ? [selectedStudent] : [];

    if (managerMode === "group") {
      if (!selectedManagerGroup) return [];
      return students.filter((student) =>
        selectedManagerGroup.studentIds.includes(student.id)
      );
    }

    return students;
  }, [managerMode, selectedStudent, selectedManagerGroup, students]);

  const resetTargetStudents = useMemo(() => {
    if (resetMode === "student") {
      const found = students.find((student) => student.id === resetStudentId);
      return found ? [found] : [];
    }

    if (resetMode === "group") {
      if (!selectedResetGroup) return [];
      return students.filter((student) =>
        selectedResetGroup.studentIds.includes(student.id)
      );
    }

    return students;
  }, [resetMode, resetStudentId, selectedResetGroup, students]);

  const resultsTargetStudents = useMemo(() => {
    if (resultsViewMode === "group") {
      if (!selectedResultsGroup) return [];
      return students.filter((student) =>
        selectedResultsGroup.studentIds.includes(student.id)
      );
    }

    return students;
  }, [resultsViewMode, selectedResultsGroup, students]);

  const groupedAssignments = useMemo(() => {
    if (!selectedStudent) return [];

    return assignmentsForClass.map((assignment) => {
      const locked =
        classroom?.studentAssignments?.[selectedStudent.id]?.[assignment.gameKey] ??
        false;

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
        .map((attempt) => ({
          ...attempt,
          answers: Array.isArray(attempt.answers) ? attempt.answers : [],
        }));

      return {
        id: assignment.gameKey,
        title: assignment.title,
        locked,
        attempts,
      };
    });
  }, [assignmentsForClass, classroom, selectedStudent, studentResults]);

  const classAssignmentProgress = useMemo(() => {
    const list = resultsViewMode === "class" ? students : resultsTargetStudents;

    return assignmentsForClass.map((assignment) => {
      const rows = list.map((student) => {
        const studentResultsForView = allResultsByStudent[student.id] || [];
        const latestAttempt = getLatestAttemptForGame(
          studentResultsForView,
          assignment.gameKey
        );

        const percent = latestAttempt ? getAttemptPercent(latestAttempt) : 0;
        const completed = !!latestAttempt;

        return {
          student,
          latestAttempt,
          completed,
          percent,
        };
      });

      const totalStudents = rows.length;
      const completedCount = rows.filter((row) => row.completed).length;

      const averagePercent =
        totalStudents > 0
          ? Math.round(
              rows.reduce((sum, row) => sum + Number(row.percent || 0), 0) /
                totalStudents
            )
          : 0;

      return {
        assignment,
        rows,
        totalStudents,
        completedCount,
        percentage: averagePercent,
      };
    });
  }, [assignmentsForClass, resultsTargetStudents, resultsViewMode, students, allResultsByStudent]);

  useEffect(() => {
    let unsubscribeClassroom = null;
    let unsubscribeStudents = () => {};

    async function loadTeacherClass() {
      try {
        let classDocId = teacher?.classId || null;

        if (!classDocId && teacher?.id) {
          const q = query(
            collection(db, "classrooms"),
            where("teacherID", "==", teacher.id)
          );
          const snap = await getDocs(q);
          if (!snap.empty) classDocId = snap.docs[0].id;
        }

        if (!classDocId) {
          setClassroom(null);
          setStudents([]);
          setSelectedStudentId("");
          return;
        }

        const classRef = doc(db, "classrooms", classDocId);

        unsubscribeClassroom = onSnapshot(classRef, (classSnap) => {
          if (!classSnap.exists()) {
            unsubscribeStudents();
            setClassroom(null);
            setStudents([]);
            setSelectedStudentId("");
            return;
          }

          const classData = classSnap.data();

          setClassroom({
            id: classSnap.id,
            ...classData,
          });

          const studentIds = (classData.studentID || classData.studentIDs || []).map(
            (id) => String(id).trim()
          );

          if (!studentIds.length) {
            unsubscribeStudents();
            setStudents([]);
            setSelectedStudentId("");
            return;
          }

          unsubscribeStudents();

          const studentMap = {};
          const studentUnsubs = studentIds.map((studentId) => {
            const studentRef = doc(db, "students", studentId);

            return onSnapshot(
              studentRef,
              (studentSnap) => {
                if (studentSnap.exists()) {
                  studentMap[studentId] = {
                    id: studentId,
                    ...studentSnap.data(),
                  };
                } else {
                  studentMap[studentId] = {
                    id: studentId,
                    name: `Student ${studentId}`,
                    grade: null,
                    birthday: null,
                    coins: 0,
                  };
                }

                const rawClassGrade =
                  classData.grade ??
                  classData.classGrade ??
                  teacher?.grade ??
                  teacher?.classGrade;

                const parsedClassGrade = Number(rawClassGrade);

                const loadedStudents = studentIds
                  .map((id) => studentMap[id])
                  .filter(Boolean);

                const filtered = Number.isNaN(parsedClassGrade)
                  ? loadedStudents
                  : loadedStudents.filter(
                      (student) => Number(student.grade) === parsedClassGrade
                    );

                filtered.sort((a, b) =>
                  String(a.name || a.id).localeCompare(String(b.name || b.id))
                );

                setStudents(filtered);

                setSelectedStudentId((prev) => {
                  if (filtered.some((student) => student.id === prev)) return prev;
                  return filtered[0]?.id || "";
                });
              },
              (error) => {
                console.error(`Error watching student ${studentId}:`, error);
              }
            );
          });

          unsubscribeStudents = () => {
            studentUnsubs.forEach((unsubscribe) => {
              if (typeof unsubscribe === "function") unsubscribe();
            });
          };
        });
      } catch (error) {
        console.error("Error loading teacher dashboard:", error);
        setClassroom(null);
        setStudents([]);
        setSelectedStudentId("");
      }
    }

    if (teacher) loadTeacherClass();

    return () => {
      if (unsubscribeClassroom) unsubscribeClassroom();
      unsubscribeStudents();
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
    const validStudents = students.filter((student) => !!student?.id);

    if (!validStudents.length) {
      setAllResultsByStudent({});
      return;
    }

    const unsubscribers = validStudents.map((student) => {
      const resultsRef = collection(
        db,
        "students",
        String(student.id),
        "assignmentResults"
      );

      return onSnapshot(
        resultsRef,
        (snap) => {
          const results = snap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));

          setAllResultsByStudent((prev) => ({
            ...prev,
            [student.id]: results,
          }));
        },
        (error) => {
          console.error(`Error watching all results for ${student.id}:`, error);
          setAllResultsByStudent((prev) => ({
            ...prev,
            [student.id]: [],
          }));
        }
      );
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") unsubscribe();
      });
    };
  }, [students]);

  useEffect(() => {
    if (selectedStudentId) setResetStudentId(selectedStudentId);
  }, [selectedStudentId]);

  useEffect(() => {
    if (!assignmentsForClass.some((a) => a.gameKey === managerAssignmentId)) {
      setManagerAssignmentId(assignmentsForClass[0]?.gameKey || "");
    }
  }, [assignmentsForClass, managerAssignmentId]);

  useEffect(() => {
    if (!managerGroupId && studentGroups.length) setManagerGroupId(studentGroups[0].id);
    if (!resetGroupId && studentGroups.length) setResetGroupId(studentGroups[0].id);
    if (!resultsGroupId && studentGroups.length) setResultsGroupId(studentGroups[0].id);
  }, [studentGroups, managerGroupId, resetGroupId, resultsGroupId]);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 220);
    }

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  function toggleClassAssignmentDropdown(assignmentId) {
    setOpenClassAssignments((prev) => ({
      ...prev,
      [assignmentId]: !prev[assignmentId],
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
        alert("Please choose an assignment first.");
        return;
      }

      if (!managerTargetStudents.length) {
        alert("Please choose a valid student, group, or class.");
        return;
      }

      await Promise.all(
        managerTargetStudents.map((student) =>
          setAssignmentLockForStudent(student.id, managerAssignmentId, lockedValue)
        )
      );

      if (managerMode === "student") {
        alert(
          `${lockedValue ? "Locked" : "Unlocked"} assignment for ${
            selectedStudent?.name || "the selected student"
          }.`
        );
      } else if (managerMode === "group") {
        alert(
          `${lockedValue ? "Locked" : "Unlocked"} assignment for ${
            selectedManagerGroup?.name || "the selected group"
          }.`
        );
      } else {
        alert(`${lockedValue ? "Locked" : "Unlocked"} assignment for the whole class.`);
      }
    } catch (error) {
      console.error("Error updating locks:", error);
      alert("There was a problem updating assignment locks.");
    }
  }

  async function resetStudentAssignments(studentId) {
    const resultsRef = collection(db, "students", String(studentId), "assignmentResults");
    const snap = await getDocs(resultsRef);
    await Promise.all(snap.docs.map((resultDoc) => deleteDoc(resultDoc.ref)));
  }

  async function handleResetAssignments() {
    try {
      setIsResetting(true);

      if (!resetTargetStudents.length) {
        alert("Please choose a valid student, group, or class.");
        return;
      }

      await Promise.all(
        resetTargetStudents.map((student) => resetStudentAssignments(student.id))
      );

      if (resetMode === "student") {
        alert("That student's assignment results were reset.");
      } else if (resetMode === "group") {
        alert(`${selectedResetGroup?.name || "That group"} was reset.`);
      } else {
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

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="tdash">
      <main className="tdash__main">
        <header className="tdash__header">
          <div>
            <h1 className="tdash__title">Welcome, {teacher?.name || "Teacher"}</h1>
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
              type="button"
              onClick={() => setShowResetPanel((prev) => !prev)}
            >
              Reset
            </button>

            <button className="tdash__logout-btn" type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        {showResetPanel && (
          <section className="tdash__card tdash__reset-card">
            <div className="tdash__card-head">
              <h2 className="tdash__section-title">Reset Assignment Results</h2>
            </div>

            <div className="tdash__two-col">
              <div className="tdash__field">
                <label className="tdash__label">Reset Mode</label>
                <select
                  className="tdash__select"
                  value={resetMode}
                  onChange={(e) => setResetMode(e.target.value)}
                >
                  <option value="student">Single Student</option>
                  <option value="group">Group</option>
                  <option value="class">Whole Class</option>
                </select>
              </div>

              {resetMode === "student" && (
                <div className="tdash__field">
                  <label className="tdash__label">Student</label>
                  <select
                    className="tdash__select"
                    value={resetStudentId}
                    onChange={(e) => setResetStudentId(e.target.value)}
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name || `Student ${student.id}`} ({student.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {resetMode === "group" && (
                <div className="tdash__field">
                  <label className="tdash__label">Group</label>
                  <select
                    className="tdash__select"
                    value={resetGroupId}
                    onChange={(e) => setResetGroupId(e.target.value)}
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
            </div>

            <div className="tdash__reset-warning">
              {resetMode === "student"
                ? "This will remove all saved attempt history for the selected student."
                : resetMode === "group"
                ? "This will remove all saved attempt history for every student in the selected group."
                : "This will remove all saved attempt history for the whole class."}
            </div>

            <div className="tdash__actions">
              <button
                className="tdash__ghost-btn"
                type="button"
                onClick={() => setShowResetPanel(false)}
              >
                Cancel
              </button>
              <button
                className="tdash__danger-btn"
                type="button"
                onClick={handleResetAssignments}
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
            <div className="tdash__stat-number">{assignmentsForClass.length}</div>
            <div className="tdash__stat-label">Assignments</div>
          </div>

          <div className="tdash__stat tdash__stat--green">
            <div className="tdash__stat-number">{studentResults.length}</div>
            <div className="tdash__stat-label">Total Attempts</div>
          </div>
        </section>

        <section className="tdash__grid">
          <section className="tdash__card">
            <div className="tdash__card-head">
              <h2 className="tdash__section-title">Assignment Manager</h2>
            </div>

            <div className="tdash__stack">
              <div className="tdash__field">
                <label className="tdash__label">Apply To</label>
                <select
                  className="tdash__select"
                  value={managerMode}
                  onChange={(e) => setManagerMode(e.target.value)}
                >
                  <option value="student">Single Student</option>
                  <option value="group">Group</option>
                  <option value="class">Whole Class</option>
                </select>
              </div>

              {managerMode === "student" && (
                <div className="tdash__field">
                  <label className="tdash__label">Student</label>
                  <select
                    className="tdash__select"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name || `Student ${student.id}`} ({student.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {managerMode === "group" && (
                <div className="tdash__field">
                  <label className="tdash__label">Group</label>
                  <select
                    className="tdash__select"
                    value={managerGroupId}
                    onChange={(e) => setManagerGroupId(e.target.value)}
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

              <div className="tdash__field">
                <label className="tdash__label">Assignment</label>
                <select
                  className="tdash__select"
                  value={managerAssignmentId}
                  onChange={(e) => setManagerAssignmentId(e.target.value)}
                >
                  <option value="">Select assignment</option>
                  {assignmentsForClass.map((assignment) => (
                    <option key={assignment.gameKey} value={assignment.gameKey}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tdash__actions tdash__actions--left">
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
          </section>

          <section className="tdash__card">
            <div className="tdash__card-head">
              <h2 className="tdash__section-title">Student Details</h2>
            </div>

            <div className="tdash__field">
              <label className="tdash__label">Select Student</label>
              <select
                className="tdash__select"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {students.length > 0 ? (
                  students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name || `Student ${student.id}`} ({student.id})
                    </option>
                  ))
                ) : (
                  <option value="">No students found</option>
                )}
              </select>
            </div>

            {selectedStudent && (
              <div className="tdash__details-grid">
                <div className="tdash__detail-item">
                  <span>Name</span>
                  <span className="tdash__pill">{selectedStudent.name || "—"}</span>
                </div>
                <div className="tdash__detail-item">
                  <span>Student ID</span>
                  <span className="tdash__pill">{selectedStudent.id}</span>
                </div>
                <div className="tdash__detail-item">
                  <span>Grade</span>
                  <span className="tdash__pill">{selectedStudent.grade ?? "—"}</span>
                </div>
                <div className="tdash__detail-item">
                  <span>Birthday</span>
                  <span className="tdash__pill">{selectedStudent.birthday ?? "—"}</span>
                </div>
                <div className="tdash__detail-item tdash__detail-item--full">
                  <span>Coins</span>
                  <span className="tdash__pill tdash__coins-pill">
                    {selectedStudent.coins ?? 0}
                  </span>
                </div>
              </div>
            )}
          </section>
        </section>

        <section className="tdash__card">
          <div className="tdash__card-head tdash__card-head--split">
            <h2 className="tdash__section-title">Student Groups</h2>

            <button
              className="tdash__ghost-btn"
              type="button"
              onClick={() => setShowGroupsBuilder((prev) => !prev)}
            >
              {showGroupsBuilder ? "Hide Student Groups" : "Show Student Groups"}
            </button>
          </div>

          {showGroupsBuilder && (
            <StudentGroupsBuilder
              classroom={classroom}
              students={students}
              studentGroups={studentGroups}
              setManagerGroupId={setManagerGroupId}
              setResetGroupId={setResetGroupId}
              setResultsGroupId={setResultsGroupId}
            />
          )}
        </section>

        <section className="tdash__card">
          <div className="tdash__card-head tdash__card-head--split">
            <h2 className="tdash__section-title">Assignment Results</h2>

            <div className="tdash__results-actions">
              <div className="tdash__results-top-row">
                <button
                  className="tdash__ghost-btn"
                  type="button"
                  onClick={() => setHideResults((prev) => !prev)}
                >
                  {hideResults ? "Show Assignments" : "Hide Assignments"}
                </button>

                <select
                  className="tdash__select tdash__results-select"
                  value={resultsViewMode}
                  onChange={(e) => setResultsViewMode(e.target.value)}
                >
                  <option value="student">Single Student</option>
                  <option value="group">Group</option>
                  <option value="class">Whole Class</option>
                </select>
              </div>

              {resultsViewMode === "group" && (
                <select
                  className="tdash__select tdash__results-select"
                  value={resultsGroupId}
                  onChange={(e) => setResultsGroupId(e.target.value)}
                >
                  <option value="">Select a group</option>
                  {studentGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {!hideResults &&
            (resultsViewMode === "student" ? (
              groupedAssignments.length > 0 ? (
                <div className="tdash__accordion-list">
                  {groupedAssignments.map((assignment) => {
                    const isOpen = !!openAssignments[assignment.id];

                    return (
                      <div className="tdash__accordion" key={assignment.id}>
                        <button
                          className="tdash__accordion-head"
                          type="button"
                          onClick={() => toggleAssignmentDropdown(assignment.id)}
                        >
                          <div>
                            <div className="tdash__accordion-title">{assignment.title}</div>
                            <div className="tdash__accordion-progress">
                              {assignment.attempts.length} attempt
                              {assignment.attempts.length === 1 ? "" : "s"}
                            </div>
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
                                        type="button"
                                        onClick={() => toggleAttemptDropdown(attempt.id)}
                                      >
                                        <div>
                                          <div className="tdash__attempt-title">
                                            Attempt {assignment.attempts.length - index}
                                          </div>
                                          <div className="tdash__attempt-date">
                                            {formatAttemptTime(
                                              attempt.completedAt ||
                                                attempt.submittedAt ||
                                                attempt.createdAt
                                            )}
                                          </div>
                                        </div>

                                        <div className="tdash__attempt-summary">
                                          Wrong tries: {attempt.totalWrongGuesses ?? 0}
                                        </div>

                                        <span className="tdash__accordion-arrow">
                                          {isAttemptOpen ? "▲" : "▼"}
                                        </span>
                                      </button>

                                      {isAttemptOpen && (
                                        <div className="tdash__attempt-body">
                                          {attempt.answers.length > 0 ? (
                                            <div className="tdash__answer-list">
                                              {attempt.answers.map((answer, answerIndex) => {
                                                const isWrong =
                                                  answer.isCorrect === false ||
                                                  Number(answer.wrongTries || 0) > 0;

                                                const answerPercent =
                                                  getAnswerPercentage(answer);

                                                return (
                                                  <div
                                                    key={`${attempt.id}-${answerIndex}`}
                                                    className={`tdash__answer-row ${
                                                      isWrong ? "tdash__answer-row--wrong" : ""
                                                    }`}
                                                  >
                                                    <div className="tdash__answer-top">
                                                      <span className="tdash__answer-problem">
                                                        {answer.problem || "Problem"}
                                                      </span>

                                                      {isWrong && (
                                                        <span className="tdash__answer-status">
                                                          Wrong
                                                        </span>
                                                      )}
                                                    </div>

                                                    <div className="tdash__answer-meta">
                                                      <div className="tdash__answer-meta-item">
                                                        <span className="tdash__answer-meta-label">
                                                          Wrong Tries:
                                                        </span>
                                                        <strong>{answer.wrongTries ?? 0}</strong>
                                                      </div>

                                                      <div className="tdash__answer-meta-item">
                                                        <span className="tdash__answer-meta-label">
                                                          Correct Answer:
                                                        </span>
                                                        <strong>
                                                          {String(answer.correctAnswer ?? "—")}
                                                        </strong>
                                                      </div>

                                                      <div className="tdash__answer-meta-item">
                                                        <span className="tdash__answer-meta-label">
                                                          Percentage:
                                                        </span>
                                                        <strong>{answerPercent}%</strong>
                                                      </div>
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
                                                  const answerPercent =
                                                    getBreakdownPercentage(tries);

                                                  return (
                                                    <div
                                                      key={`${attempt.id}-${problem}`}
                                                      className={`tdash__answer-row ${
                                                        isWrong ? "tdash__answer-row--wrong" : ""
                                                      }`}
                                                    >
                                                      <div className="tdash__answer-top">
                                                        <span className="tdash__answer-problem">
                                                          {problem}
                                                        </span>
                                                        {isWrong && (
                                                          <span className="tdash__answer-status">
                                                            Wrong
                                                          </span>
                                                        )}
                                                      </div>

                                                      <div className="tdash__answer-meta">
                                                        <div className="tdash__answer-meta-item">
                                                          <span className="tdash__answer-meta-label">
                                                            Wrong Tries:
                                                          </span>
                                                          <strong>{tries}</strong>
                                                        </div>

                                                        <div className="tdash__answer-meta-item">
                                                          <span className="tdash__answer-meta-label">
                                                            Percentage:
                                                          </span>
                                                          <strong>{answerPercent}%</strong>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  );
                                                }
                                              )}
                                            </div>
                                          ) : (
                                            <p className="tdash__empty-text">
                                              No answer-by-answer data saved yet.
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
                {classAssignmentProgress.map((assignmentProgress) => {
                  const isOpen = !!openClassAssignments[assignmentProgress.assignment.gameKey];

                  return (
                    <div
                      className="tdash__class-assignment-card"
                      key={assignmentProgress.assignment.gameKey}
                    >
                      <button
                        className="tdash__accordion-head"
                        type="button"
                        onClick={() =>
                          toggleClassAssignmentDropdown(
                            assignmentProgress.assignment.gameKey
                          )
                        }
                      >
                        <div>
                          <div className="tdash__accordion-title">
                            {assignmentProgress.assignment.title}
                          </div>
                          <div className="tdash__accordion-progress">
                            {assignmentProgress.completedCount} of{" "}
                            {assignmentProgress.totalStudents} students completed it
                          </div>
                        </div>

                        <div className="tdash__attempt-summary">
                          Class Percentage: {assignmentProgress.percentage}%
                        </div>

                        <span className="tdash__accordion-arrow">
                          {isOpen ? "▲" : "▼"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="tdash__accordion-body">
                          <div className="tdash__stats" style={{ marginBottom: "16px" }}>
                            <div className="tdash__stat tdash__stat--blue">
                              <div className="tdash__stat-number">
                                {assignmentProgress.completedCount}
                              </div>
                              <div className="tdash__stat-label">Completed</div>
                            </div>

                            <div className="tdash__stat tdash__stat--green">
                              <div className="tdash__stat-number">
                                {assignmentProgress.rows.filter((row) => row.percent > 0).length}
                              </div>
                              <div className="tdash__stat-label">Scored Above 0%</div>
                            </div>

                            <div className="tdash__stat tdash__stat--orange">
                              <div className="tdash__stat-number">
                                {assignmentProgress.percentage}%
                              </div>
                              <div className="tdash__stat-label">Class Percentage</div>
                            </div>
                          </div>

                          <div className="tdash__class-student-lines">
                            {assignmentProgress.rows.length > 0 ? (
                              assignmentProgress.rows.map((row) => (
                                <div
                                  key={`${assignmentProgress.assignment.gameKey}-${row.student.id}`}
                                  className={`tdash__class-student-line ${
                                    selectedStudentId === row.student.id
                                      ? "tdash__class-student-line--active"
                                      : ""
                                  }`}
                                >
                                  <span>
                                    {row.student.name || `Student ${row.student.id}`}
                                  </span>

                                  <span className="tdash__pill">
                                    {row.completed ? `${row.percent}%` : "Not completed"}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="tdash__empty-text">No students in this view.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

          {hideResults && (
            <p className="tdash__empty-text">Assignments are currently hidden.</p>
          )}
        </section>

        {showScrollTop && (
          <button className="tdash__scroll-top" type="button" onClick={scrollToTop}>
            ↑ Top
          </button>
        )}
      </main>
    </div>
  );
}