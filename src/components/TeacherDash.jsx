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
  getDoc,
  serverTimestamp,
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

const assignmentProblemBanks = {
  "1st_addition": [
    { question: "1+0", answer: 1 },
    { question: "1+1", answer: 2 },
    { question: "1+2", answer: 3 },
    { question: "1+3", answer: 4 },
    { question: "1+4", answer: 5 },
  ],
  "1st_subtraction": [],
  "2nd_addition": [],
  "2nd_subtraction": [],
  "2nd_fill_blank": [],
  "2nd_place_value": [],
  "2nd_multiplication": [],
};

function getTimestampValue(value) {
  if (!value) return 0;
  if (value?.seconds) return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatAttemptTime(value) {
  if (!value) return "No date saved";
  const date = value?.seconds ? new Date(value.seconds * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) return "No date saved";
  return date.toLocaleString();
}

function getRelativeAlertTime(value) {
  const ms = getTimestampValue(value);
  if (!ms) return "No timestamp";

  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return formatAttemptTime(value);
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
    const total = answers.reduce((sum, answer) => sum + getAnswerPercentage(answer), 0);
    return Math.round(total / answers.length);
  }

  if (attempt.problemBreakdown && typeof attempt.problemBreakdown === "object") {
    const entries = Object.entries(attempt.problemBreakdown);
    if (entries.length > 0) {
      const total = entries.reduce((sum, [, tries]) => sum + getBreakdownPercentage(tries), 0);
      return Math.round(total / entries.length);
    }
  }

  if (typeof attempt.percentCorrect === "number") return Math.round(attempt.percentCorrect);
  if (typeof attempt.score === "number") return Math.round(attempt.score);

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

function isPerfectAttempt(attempt) {
  if (!attempt) return false;

  if (Number(attempt.totalWrongGuesses || 0) === 0) return true;

  const answers = Array.isArray(attempt.answers) ? attempt.answers : [];
  if (answers.length > 0) {
    return answers.every((answer) => Number(answer?.wrongTries || 0) === 0);
  }

  if (attempt.problemBreakdown && typeof attempt.problemBreakdown === "object") {
    return Object.values(attempt.problemBreakdown).every(
      (tries) => Number(tries || 0) === 0
    );
  }

  return false;
}

function getPerfectRunCount(results) {
  return (results || []).filter(isPerfectAttempt).length;
}

function sortAlertsByUrgency(alerts) {
  return [...alerts].sort((a, b) => {
    const aUrgent = a.section === "urgent" ? 0 : 1;
    const bUrgent = b.section === "urgent" ? 0 : 1;

    if (aUrgent !== bUrgent) return aUrgent - bUrgent;
    if (a.priority !== b.priority) return a.priority - b.priority;
    return Number(a.percent ?? 100) - Number(b.percent ?? 100);
  });
}

function getRecentPerfectRuns(allResultsByStudent, students) {
  const items = [];

  students.forEach((student) => {
    const results = allResultsByStudent[student.id] || [];

    results.forEach((attempt) => {
      if (isPerfectAttempt(attempt)) {
        items.push({
          student,
          attempt,
          gameKey: attempt.gameKey || "",
          assignmentTitle: attempt.assignmentTitle || attempt.gameKey || "Assignment",
          completedAt:
            attempt.completedAt || attempt.submittedAt || attempt.createdAt || null,
        });
      }
    });
  });

  return items.sort(
    (a, b) => getTimestampValue(b.completedAt) - getTimestampValue(a.completedAt)
  );
}

function problemKey(problem) {
  return `${problem?.question ?? ""}::${problem?.answer ?? ""}`;
}

function getStudentRiskScore(results, assignmentsForClass, classroom, studentId) {
  if (!studentId) return 0;

  let score = 0;

  assignmentsForClass.forEach((assignment) => {
    const latest = getLatestAttemptForGame(results, assignment.gameKey);
    const locked =
      classroom?.studentAssignments?.[studentId]?.[assignment.gameKey] ?? false;

    if (!latest && locked) {
      score += 18;
      return;
    }

    if (!latest) {
      score += 10;
      return;
    }

    const percent = getAttemptPercent(latest);
    const wrongTries = Number(latest?.totalWrongGuesses || 0);

    if (percent < 40) score += 35;
    else if (percent < 60) score += 24;
    else if (percent < 75) score += 12;
    else if (percent < 90) score += 5;

    if (wrongTries >= 6) score += 18;
    else if (wrongTries >= 3) score += 10;
    else if (wrongTries >= 1) score += 4;
  });

  return Math.min(100, score);
}

function getSeverityFromAssignment(latestAttempt, latestPercent, latestWrongTries, locked) {
  if (!latestAttempt) return locked ? "attention" : "watch";
  if (latestPercent < 60 || latestWrongTries >= 3) return "failing";
  if (latestPercent < 75 || latestWrongTries > 0) return "attention";
  return "ok";
}

function getSeverityLabel(severity) {
  if (severity === "failing") return "Failing";
  if (severity === "attention") return "Needs Attention";
  if (severity === "watch") return "Watch";
  return "On Track";
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
  const [resetCoinsToo, setResetCoinsToo] = useState(false);

  const [resultsViewMode, setResultsViewMode] = useState("student");
  const [resultsGroupId, setResultsGroupId] = useState("");

  const [openAssignments, setOpenAssignments] = useState({});
  const [openAttempts, setOpenAttempts] = useState({});
  const [openClassAssignments, setOpenClassAssignments] = useState({});

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hideResults, setHideResults] = useState(false);
  const [showGroupsBuilder, setShowGroupsBuilder] = useState(false);
  const [showAssignmentEditor, setShowAssignmentEditor] = useState(false);
  const [showTeacherAlerts, setShowTeacherAlerts] = useState(true);
  const [showPerfectRuns, setShowPerfectRuns] = useState(true);

  const [editorGameKey, setEditorGameKey] = useState("");
  const [editorCustomQuestion, setEditorCustomQuestion] = useState("");
  const [editorCustomAnswer, setEditorCustomAnswer] = useState("");
  const [editorLastSavedAt, setEditorLastSavedAt] = useState(null);

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

    const items = assignmentsForClass.map((assignment) => {
      const locked =
        classroom?.studentAssignments?.[selectedStudent.id]?.[assignment.gameKey] ??
        false;

      const attempts = studentResults
        .filter((result) => result.gameKey === assignment.gameKey)
        .sort((a, b) => {
          const aTime = getTimestampValue(a.completedAt || a.submittedAt || a.createdAt);
          const bTime = getTimestampValue(b.completedAt || b.submittedAt || b.createdAt);
          return bTime - aTime;
        })
        .map((attempt) => ({
          ...attempt,
          answers: Array.isArray(attempt.answers) ? attempt.answers : [],
        }));

      const latestAttempt = attempts[0] || null;
      const latestPercent = latestAttempt ? getAttemptPercent(latestAttempt) : 0;
      const latestWrongTries = Number(latestAttempt?.totalWrongGuesses || 0);
      const severity = getSeverityFromAssignment(
        latestAttempt,
        latestPercent,
        latestWrongTries,
        locked
      );

      return {
        id: assignment.gameKey,
        title: assignment.title,
        locked,
        attempts,
        latestPercent,
        latestWrongTries,
        latestAttempt,
        perfectRuns: getPerfectRunCount(attempts),
        severity,
      };
    });

    return [...items].sort((a, b) => {
      const order = { failing: 0, attention: 1, watch: 2, ok: 3 };
      if (order[a.severity] !== order[b.severity]) {
        return order[a.severity] - order[b.severity];
      }
      return a.latestPercent - b.latestPercent;
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
        const riskScore = getStudentRiskScore(
          studentResultsForView,
          assignmentsForClass,
          classroom,
          student.id
        );
        const wrongTries = Number(latestAttempt?.totalWrongGuesses || 0);
        const locked =
          classroom?.studentAssignments?.[student.id]?.[assignment.gameKey] ?? false;

        const severity = getSeverityFromAssignment(
          latestAttempt,
          percent,
          wrongTries,
          locked
        );

        return {
          student,
          latestAttempt,
          completed,
          percent,
          perfectRun: latestAttempt ? isPerfectAttempt(latestAttempt) : false,
          riskScore,
          severity,
        };
      });

      const totalStudents = rows.length;
      const completedCount = rows.filter((row) => row.completed).length;
      const failingCount = rows.filter((row) => row.severity === "failing").length;
      const perfectCount = rows.filter((row) => row.perfectRun).length;

      const averagePercent =
        totalStudents > 0
          ? Math.round(
              rows.reduce((sum, row) => sum + Number(row.percent || 0), 0) / totalStudents
            )
          : 0;

      return {
        assignment,
        rows: [...rows].sort((a, b) => {
          const order = { failing: 0, attention: 1, watch: 2, ok: 3 };
          if (order[a.severity] !== order[b.severity]) {
            return order[a.severity] - order[b.severity];
          }
          if (a.percent !== b.percent) return a.percent - b.percent;
          return b.riskScore - a.riskScore;
        }),
        totalStudents,
        completedCount,
        failingCount,
        perfectCount,
        percentage: averagePercent,
      };
    });
  }, [
    assignmentsForClass,
    resultsTargetStudents,
    resultsViewMode,
    students,
    allResultsByStudent,
    classroom,
  ]);

  const classResultsSummary = useMemo(() => {
    const assignments = classAssignmentProgress;
    const totalStudents = resultsViewMode === "class"
      ? students.length
      : resultsTargetStudents.length;

    const totalAssignments = assignments.length;
    const totalPossible = totalStudents * totalAssignments;

    const completed = assignments.reduce((sum, item) => sum + item.completedCount, 0);
    const failing = assignments.reduce((sum, item) => sum + item.failingCount, 0);
    const perfect = assignments.reduce((sum, item) => sum + item.perfectCount, 0);

    const average =
      assignments.length > 0
        ? Math.round(
            assignments.reduce((sum, item) => sum + Number(item.percentage || 0), 0) /
              assignments.length
          )
        : 0;

    return {
      totalStudents,
      totalAssignments,
      totalPossible,
      completed,
      failing,
      perfect,
      average,
    };
  }, [classAssignmentProgress, resultsViewMode, students.length, resultsTargetStudents.length]);

  const teacherAlerts = useMemo(() => {
    const alerts = [];

    students.forEach((student) => {
      const results = allResultsByStudent[student.id] || [];
      const studentRiskScore = getStudentRiskScore(
        results,
        assignmentsForClass,
        classroom,
        student.id
      );

      if (studentRiskScore >= 70) {
        alerts.push({
          type: "student-high-risk",
          priority: 0,
          section: "urgent",
          percent: 0,
          studentId: student.id,
          timestamp: null,
          label: `${student.name || student.id} is high risk (${studentRiskScore})`,
          meta: "Student risk score is critically high",
        });
      }

      assignmentsForClass.forEach((assignment) => {
        const latest = getLatestAttemptForGame(results, assignment.gameKey);
        const percent = latest ? getAttemptPercent(latest) : 0;
        const wrongTries = Number(latest?.totalWrongGuesses || 0);
        const attemptTime =
          latest?.completedAt || latest?.submittedAt || latest?.createdAt || null;

        if (latest && percent < 60) {
          alerts.push({
            type: "low-score",
            priority: 1,
            section: "urgent",
            percent,
            studentId: student.id,
            timestamp: attemptTime,
            label: `${student.name || student.id} is failing ${assignment.title}`,
            meta: `${percent}% • ${formatAttemptTime(attemptTime)}`,
          });
        }

        if (latest && wrongTries >= 3) {
          alerts.push({
            type: "high-wrong-tries",
            priority: 2,
            section: "urgent",
            percent,
            studentId: student.id,
            timestamp: attemptTime,
            label: `${student.name || student.id} needs attention on ${assignment.title}`,
            meta: `${wrongTries} wrong tries • ${formatAttemptTime(attemptTime)}`,
          });
        }

        const locked =
          classroom?.studentAssignments?.[student.id]?.[assignment.gameKey] ?? false;

        if (locked && !latest) {
          alerts.push({
            type: "locked-incomplete",
            priority: 3,
            section: "normal",
            percent: 100,
            studentId: student.id,
            timestamp: null,
            label: `${student.name || student.id} has ${assignment.title} locked and incomplete`,
            meta: "Locked before completion",
          });
        }
      });

      const perfectRuns = getPerfectRunCount(results);
      if (perfectRuns > 0) {
        alerts.push({
          type: "perfect-run",
          priority: 4,
          section: "normal",
          percent: 100,
          studentId: student.id,
          timestamp: null,
          label: `${student.name || student.id} has ${perfectRuns} perfect run${perfectRuns === 1 ? "" : "s"}`,
          meta: "Great work",
        });
      }
    });

    return sortAlertsByUrgency(alerts);
  }, [students, allResultsByStudent, assignmentsForClass, classroom]);

  const urgentAlerts = useMemo(
    () => teacherAlerts.filter((item) => item.section === "urgent"),
    [teacherAlerts]
  );

  const normalAlerts = useMemo(
    () => teacherAlerts.filter((item) => item.section !== "urgent"),
    [teacherAlerts]
  );

  const recentPerfectRuns = useMemo(() => {
    return getRecentPerfectRuns(allResultsByStudent, students).slice(0, 8);
  }, [allResultsByStudent, students]);

  const editorAssignmentConfig = useMemo(() => {
    return classroom?.assignmentEditor?.[editorGameKey] || {
      selectedBuiltInProblems: [],
      customProblems: [],
    };
  }, [classroom, editorGameKey]);

  const availableBuiltInProblems = useMemo(() => {
    return assignmentProblemBanks[editorGameKey] || [];
  }, [editorGameKey]);

  const editorSelectedCount = useMemo(() => {
    const builtIn = Array.isArray(editorAssignmentConfig.selectedBuiltInProblems)
      ? editorAssignmentConfig.selectedBuiltInProblems.length
      : 0;
    const custom = Array.isArray(editorAssignmentConfig.customProblems)
      ? editorAssignmentConfig.customProblems.length
      : 0;

    return {
      builtIn,
      custom,
      total: builtIn + custom,
    };
  }, [editorAssignmentConfig]);

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
    if (!assignmentsForClass.some((a) => a.gameKey === editorGameKey)) {
      setEditorGameKey(assignmentsForClass[0]?.gameKey || "");
    }
  }, [assignmentsForClass, editorGameKey]);

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

  function jumpToStudent(studentId) {
    if (!studentId) return;
    setSelectedStudentId(studentId);
    setResultsViewMode("student");
    setHideResults(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  async function resetStudentAssignments(studentId, shouldResetCoins = false) {
    const resultsRef = collection(db, "students", String(studentId), "assignmentResults");
    const snap = await getDocs(resultsRef);

    await Promise.all(snap.docs.map((resultDoc) => deleteDoc(resultDoc.ref)));

    if (shouldResetCoins) {
      const studentRef = doc(db, "students", String(studentId));
      await updateDoc(studentRef, { coins: 0 });
    }
  }

  async function handleResetAssignments() {
    try {
      setIsResetting(true);

      if (!resetTargetStudents.length) {
        alert("Please choose a valid student, group, or class.");
        return;
      }

      await Promise.all(
        resetTargetStudents.map((student) =>
          resetStudentAssignments(student.id, resetCoinsToo)
        )
      );

      if (resetMode === "student") {
        alert(
          `That student's assignment results were reset${resetCoinsToo ? " and coins were reset too" : ""}.`
        );
      } else if (resetMode === "group") {
        alert(
          `${selectedResetGroup?.name || "That group"} was reset${resetCoinsToo ? " and coins were reset too" : ""}.`
        );
      } else {
        alert(
          `Whole class assignment results were reset${resetCoinsToo ? " and coins were reset too" : ""}.`
        );
      }

      setShowResetPanel(false);
    } catch (error) {
      console.error("Error resetting assignments:", error);
      alert("There was a problem resetting assignments.");
    } finally {
      setIsResetting(false);
    }
  }

  async function saveAssignmentEditorConfig(nextConfig) {
    if (!classroom?.id || !editorGameKey) return;

    try {
      const classRef = doc(db, "classrooms", classroom.id);
      await updateDoc(classRef, {
        [`assignmentEditor.${editorGameKey}`]: {
          ...nextConfig,
          lastUpdatedAt: serverTimestamp(),
        },
      });
      setEditorLastSavedAt(Date.now());
    } catch (error) {
      console.error("Error saving assignment editor config:", error);
      alert("Could not save assignment editor changes.");
    }
  }

  async function toggleBuiltInProblem(problem) {
    const current = Array.isArray(editorAssignmentConfig.selectedBuiltInProblems)
      ? editorAssignmentConfig.selectedBuiltInProblems
      : [];

    const key = problemKey(problem);
    const exists = current.some((item) => problemKey(item) === key);

    const next = exists
      ? current.filter((item) => problemKey(item) !== key)
      : [...current, problem];

    await saveAssignmentEditorConfig({
      selectedBuiltInProblems: next,
      customProblems: Array.isArray(editorAssignmentConfig.customProblems)
        ? editorAssignmentConfig.customProblems
        : [],
    });
  }

  async function handleAddCustomProblem() {
    const trimmedQuestion = editorCustomQuestion.trim();
    const parsedAnswer = Number(editorCustomAnswer);

    if (!trimmedQuestion) {
      alert("Please enter a problem question.");
      return;
    }

    if (Number.isNaN(parsedAnswer)) {
      alert("Please enter a valid numeric answer.");
      return;
    }

    const current = Array.isArray(editorAssignmentConfig.customProblems)
      ? editorAssignmentConfig.customProblems
      : [];

    const next = [...current, { question: trimmedQuestion, answer: parsedAnswer }];

    await saveAssignmentEditorConfig({
      selectedBuiltInProblems: Array.isArray(editorAssignmentConfig.selectedBuiltInProblems)
        ? editorAssignmentConfig.selectedBuiltInProblems
        : [],
      customProblems: next,
    });

    setEditorCustomQuestion("");
    setEditorCustomAnswer("");
  }

  async function handleRemoveCustomProblem(problemToRemove) {
    const current = Array.isArray(editorAssignmentConfig.customProblems)
      ? editorAssignmentConfig.customProblems
      : [];

    const next = current.filter(
      (problem) => problemKey(problem) !== problemKey(problemToRemove)
    );

    await saveAssignmentEditorConfig({
      selectedBuiltInProblems: Array.isArray(editorAssignmentConfig.selectedBuiltInProblems)
        ? editorAssignmentConfig.selectedBuiltInProblems
        : [],
      customProblems: next,
    });
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

            <div className="tdash__checkbox-row">
              <input
                id="reset-coins-too"
                type="checkbox"
                checked={resetCoinsToo}
                onChange={(e) => setResetCoinsToo(e.target.checked)}
              />
              <label htmlFor="reset-coins-too">Reset coins too</label>
            </div>

            <div className="tdash__reset-warning">
              {resetMode === "student"
                ? "This will remove all saved attempt history for the selected student."
                : resetMode === "group"
                ? "This will remove all saved attempt history for every student in the selected group."
                : "This will remove all saved attempt history for the whole class."}
              {resetCoinsToo ? " Coins will also be reset to 0." : ""}
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

        <section className="tdash__card">
          <div className="tdash__card-head tdash__card-head--split">
            <div className="tdash__title-row">
              <h2 className="tdash__section-title">Needs Attention First</h2>
              <span className="tdash__alert-badge">{urgentAlerts.length}</span>
            </div>
          </div>

          <div className="tdash__stack">
            {urgentAlerts.length > 0 ? (
              urgentAlerts.slice(0, 10).map((alertItem, index) => (
                <button
                  key={`${alertItem.type}-${alertItem.studentId}-${index}`}
                  type="button"
                  className="tdash__note tdash__note--danger tdash__note-button"
                  onClick={() => jumpToStudent(alertItem.studentId)}
                >
                  <div className="tdash__note-title">{alertItem.label}</div>
                  <div className="tdash__note-meta">
                    {alertItem.meta}
                    {alertItem.timestamp ? ` • ${getRelativeAlertTime(alertItem.timestamp)}` : ""}
                  </div>
                </button>
              ))
            ) : (
              <p className="tdash__empty-text">No urgent alerts right now.</p>
            )}
          </div>
        </section>

        <section className="tdash__card">
          <div className="tdash__card-head tdash__card-head--split">
            <h2 className="tdash__section-title">Teacher Alerts</h2>

            <button
              className="tdash__ghost-btn"
              type="button"
              onClick={() => setShowTeacherAlerts((prev) => !prev)}
            >
              {showTeacherAlerts ? "Hide Teacher Alerts" : "Show Teacher Alerts"}
            </button>
          </div>

          {showTeacherAlerts && (
            <div className="tdash__stack">
              {normalAlerts.length > 0 ? (
                normalAlerts.slice(0, 12).map((alertItem, index) => (
                  <button
                    key={`${alertItem.type}-${alertItem.studentId}-${index}`}
                    type="button"
                    className="tdash__note tdash__note-button"
                    onClick={() => jumpToStudent(alertItem.studentId)}
                  >
                    <div className="tdash__note-title">{alertItem.label}</div>
                    <div className="tdash__note-meta">{alertItem.meta}</div>
                  </button>
                ))
              ) : (
                <p className="tdash__empty-text">No alerts right now.</p>
              )}
            </div>
          )}
        </section>

        <section className="tdash__card">
          <div className="tdash__card-head tdash__card-head--split">
            <h2 className="tdash__section-title">Recent Perfect Runs</h2>

            <button
              className="tdash__ghost-btn"
              type="button"
              onClick={() => setShowPerfectRuns((prev) => !prev)}
            >
              {showPerfectRuns ? "Hide Perfect Runs" : "Show Perfect Runs"}
            </button>
          </div>

          {showPerfectRuns && (
            <div className="tdash__stack">
              {recentPerfectRuns.length > 0 ? (
                recentPerfectRuns.map((item, index) => (
                  <button
                    key={`${item.student.id}-${item.assignmentTitle}-${index}`}
                    type="button"
                    className="tdash__note tdash__note-button"
                    onClick={() => jumpToStudent(item.student.id)}
                  >
                    <div className="tdash__note-title">
                      <strong>{item.student.name || item.student.id}</strong> —{" "}
                      {item.assignmentTitle}
                    </div>
                    <div className="tdash__note-meta">
                      {formatAttemptTime(item.completedAt)}
                    </div>
                  </button>
                ))
              ) : (
                <p className="tdash__empty-text">No perfect runs recorded yet.</p>
              )}
            </div>
          )}
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
            <h2 className="tdash__section-title">Assignment Editor</h2>

            <button
              className="tdash__ghost-btn"
              type="button"
              onClick={() => setShowAssignmentEditor((prev) => !prev)}
            >
              {showAssignmentEditor ? "Hide Assignment Editor" : "Show Assignment Editor"}
            </button>
          </div>

          {showAssignmentEditor && (
            <div className="tdash__stack">
              <div className="tdash__note">
                {editorGameKey
                  ? `${editorSelectedCount.total} total selected • ${editorSelectedCount.builtIn} built-in • ${editorSelectedCount.custom} custom`
                  : "Choose a game to edit"}
              </div>

              <div className="tdash__field">
                <label className="tdash__label">Choose Game</label>
                <select
                  className="tdash__select"
                  value={editorGameKey}
                  onChange={(e) => setEditorGameKey(e.target.value)}
                >
                  <option value="">Select assignment</option>
                  {assignmentsForClass.map((assignment) => (
                    <option key={assignment.gameKey} value={assignment.gameKey}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
              </div>

              {editorLastSavedAt && (
                <div className="tdash__note">
                  <div className="tdash__note-title">Assignment editor saved</div>
                  <div className="tdash__note-meta">
                    {new Date(editorLastSavedAt).toLocaleString()}
                  </div>
                </div>
              )}

              {editorGameKey && (
                <div className="tdash__assignment-editor-grid">
                  <div className="tdash__problem-bank">
                    <h3 className="tdash__mini-title">Built-In Problems</h3>

                    {availableBuiltInProblems.length > 0 ? (
                      <div className="tdash__problem-list">
                        {availableBuiltInProblems.map((problem, index) => {
                          const selectedBuiltIn = Array.isArray(
                            editorAssignmentConfig.selectedBuiltInProblems
                          )
                            ? editorAssignmentConfig.selectedBuiltInProblems
                            : [];

                          const selected = selectedBuiltIn.some(
                            (item) => problemKey(item) === problemKey(problem)
                          );

                          return (
                            <button
                              key={`${problemKey(problem)}-${index}`}
                              type="button"
                              className={`tdash__problem-chip ${
                                selected ? "tdash__problem-chip--selected" : ""
                              }`}
                              onClick={() => toggleBuiltInProblem(problem)}
                            >
                              {problem.question} = {problem.answer}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="tdash__empty-text">
                        No built-in problems loaded yet for this game. Paste that game’s
                        array into assignmentProblemBanks at the top of this file.
                      </p>
                    )}
                  </div>

                  <div className="tdash__custom-problem-box">
                    <h3 className="tdash__mini-title">Add Custom Problem</h3>

                    <div className="tdash__stack">
                      <input
                        className="tdash__input"
                        type="text"
                        placeholder="Question, like 3+4"
                        value={editorCustomQuestion}
                        onChange={(e) => setEditorCustomQuestion(e.target.value)}
                      />

                      <input
                        className="tdash__input"
                        type="number"
                        placeholder="Answer"
                        value={editorCustomAnswer}
                        onChange={(e) => setEditorCustomAnswer(e.target.value)}
                      />

                      <button
                        type="button"
                        className="tdash__ghost-btn"
                        onClick={handleAddCustomProblem}
                      >
                        Add Custom Problem
                      </button>

                      <h3 className="tdash__mini-title">Saved Custom Problems</h3>

                      {Array.isArray(editorAssignmentConfig.customProblems) &&
                      editorAssignmentConfig.customProblems.length > 0 ? (
                        <div className="tdash__stack">
                          {editorAssignmentConfig.customProblems.map((problem, index) => (
                            <div
                              key={`${problemKey(problem)}-${index}`}
                              className="tdash__drop-chip"
                            >
                              <span>
                                {problem.question} = {problem.answer}
                              </span>
                              <button
                                type="button"
                                className="tdash__chip-remove"
                                onClick={() => handleRemoveCustomProblem(problem)}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="tdash__empty-text">No custom problems yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
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

            <div className="tdash__view-toggle" role="tablist" aria-label="Assignment result views">
              <button
                type="button"
                className={`tdash__view-btn ${resultsViewMode === "student" ? "tdash__view-btn--active" : ""}`}
                onClick={() => setResultsViewMode("student")}
              >
                Student
              </button>
              <button
                type="button"
                className={`tdash__view-btn ${resultsViewMode === "group" ? "tdash__view-btn--active" : ""}`}
                onClick={() => setResultsViewMode("group")}
              >
                Group
              </button>
              <button
                type="button"
                className={`tdash__view-btn ${resultsViewMode === "class" ? "tdash__view-btn--active" : ""}`}
                onClick={() => setResultsViewMode("class")}
              >
                Whole Class
              </button>
            </div>
          </div>

          {!hideResults && (
            <>
              <div className="tdash__results-top-row">
                <button
                  className="tdash__ghost-btn"
                  type="button"
                  onClick={() => setHideResults((prev) => !prev)}
                >
                  Hide Assignments
                </button>

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

              {resultsViewMode === "student" ? (
                groupedAssignments.length > 0 ? (
                  <div className="tdash__accordion-list">
                    {groupedAssignments.map((assignment) => {
                      const isOpen = !!openAssignments[assignment.id];

                      return (
                        <div
                          className={`tdash__accordion ${
                            assignment.severity === "failing"
                              ? "tdash__accordion--danger"
                              : assignment.severity === "attention"
                              ? "tdash__accordion--attention"
                              : ""
                          }`}
                          key={assignment.id}
                        >
                          <button
                            className="tdash__accordion-head"
                            type="button"
                            onClick={() => toggleAssignmentDropdown(assignment.id)}
                          >
                            <div>
                              <div className="tdash__accordion-title tdash__accordion-title-row">
                                <span
                                  className={`tdash__status-dot tdash__status-dot--${assignment.severity}`}
                                  aria-hidden="true"
                                />
                                <span>{assignment.title}</span>
                                <span className="tdash__status-label">
                                  {getSeverityLabel(assignment.severity)}
                                </span>
                              </div>
                              <div className="tdash__accordion-progress">
                                {assignment.attempts.length} attempt
                                {assignment.attempts.length === 1 ? "" : "s"} • Latest:{" "}
                                {assignment.latestPercent}%
                                {assignment.latestAttempt && (
                                  <>
                                    {" "}
                                    •{" "}
                                    {formatAttemptTime(
                                      assignment.latestAttempt.completedAt ||
                                        assignment.latestAttempt.submittedAt ||
                                        assignment.latestAttempt.createdAt
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="tdash__attempt-summary">
                              Wrong tries: {assignment.latestWrongTries} • Perfect Runs:{" "}
                              {assignment.perfectRuns}
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
                                            Wrong tries: {attempt.totalWrongGuesses ?? 0} •{" "}
                                            {getAttemptPercent(attempt)}%
                                            {isPerfectAttempt(attempt) && (
                                              <span className="tdash__pill tdash__pill--perfect">
                                                Perfect Run
                                              </span>
                                            )}
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
                <>
                  <div className="tdash__stats tdash__stats--class-summary">
                    <div className="tdash__stat tdash__stat--blue">
                      <div className="tdash__stat-number">{classResultsSummary.totalStudents}</div>
                      <div className="tdash__stat-label">Students in View</div>
                    </div>

                    <div className="tdash__stat tdash__stat--green">
                      <div className="tdash__stat-number">{classResultsSummary.completed}</div>
                      <div className="tdash__stat-label">Completed Assignments</div>
                    </div>

                    <div className="tdash__stat tdash__stat--orange">
                      <div className="tdash__stat-number">{classResultsSummary.average}%</div>
                      <div className="tdash__stat-label">Class Average</div>
                    </div>
                  </div>

                  <div className="tdash__stats tdash__stats--class-summary">
                    <div className="tdash__stat tdash__stat--danger">
                      <div className="tdash__stat-number">{classResultsSummary.failing}</div>
                      <div className="tdash__stat-label">Failing Assignments</div>
                    </div>

                    <div className="tdash__stat tdash__stat--green">
                      <div className="tdash__stat-number">{classResultsSummary.perfect}</div>
                      <div className="tdash__stat-label">Perfect Runs</div>
                    </div>

                    <div className="tdash__stat tdash__stat--blue">
                      <div className="tdash__stat-number">{classResultsSummary.totalPossible}</div>
                      <div className="tdash__stat-label">Possible Assignment Slots</div>
                    </div>
                  </div>

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
                                    {assignmentProgress.perfectCount}
                                  </div>
                                  <div className="tdash__stat-label">Perfect Runs</div>
                                </div>

                                <div className="tdash__stat tdash__stat--danger">
                                  <div className="tdash__stat-number">
                                    {assignmentProgress.failingCount}
                                  </div>
                                  <div className="tdash__stat-label">Failing</div>
                                </div>
                              </div>

                              <div className="tdash__class-student-lines">
                                {assignmentProgress.rows.length > 0 ? (
                                  assignmentProgress.rows.map((row) => (
                                    <button
                                      type="button"
                                      key={`${assignmentProgress.assignment.gameKey}-${row.student.id}`}
                                      className={`tdash__class-student-line tdash__class-student-line--button ${
                                        selectedStudentId === row.student.id
                                          ? "tdash__class-student-line--active"
                                          : ""
                                      } ${
                                        row.percent < 60
                                          ? "tdash__class-student-line--danger"
                                          : ""
                                      }`}
                                      onClick={() => jumpToStudent(row.student.id)}
                                    >
                                      <span className="tdash__class-student-name">
                                        <span
                                          className={`tdash__status-dot tdash__status-dot--${row.severity}`}
                                          aria-hidden="true"
                                        />
                                        <span>
                                          {row.student.name || `Student ${row.student.id}`}
                                        </span>
                                      </span>

                                      <span className="tdash__pill">
                                        {row.completed ? `${row.percent}%` : "Not completed"}
                                      </span>
                                    </button>
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
                </>
              )}
            </>
          )}

          {hideResults && (
            <div className="tdash__results-top-row">
              <button
                className="tdash__ghost-btn"
                type="button"
                onClick={() => setHideResults(false)}
              >
                Show Assignments
              </button>
            </div>
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