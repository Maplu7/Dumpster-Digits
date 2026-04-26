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
  serverTimestamp,
} from "firebase/firestore";

import StudentGroupsBuilder from "./StudentGroupsBuilder";
import AssignmentEditor from "./teacher-dashboard/AssignmentEditor";
import AssignmentResults from "./teacher-dashboard/AssignmentResults";

import {
  assignmentCatalog,
  getProblemBankForGame,
} from "../data/assignmentProblemBanks";

import {
  buildProgressMeta,
  sortAssignmentsWorstFirst,
  sortWorstFirst,
} from "../utils/teacherProgressUtils";

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

function getMedianNumber(values = []) {
  const clean = values
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value))
    .sort((a, b) => a - b);

  if (!clean.length) return 0;

  const middle = Math.floor(clean.length / 2);

  if (clean.length % 2 === 0) {
    return Math.round((clean[middle - 1] + clean[middle]) / 2);
  }

  return Math.round(clean[middle]);
}

function getAttemptsForGame(results, gameKey) {
  return [...(results || [])]
    .filter((result) => result.gameKey === gameKey)
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
          assignmentTitle:
            attempt.assignmentTitle || attempt.gameKey || "Assignment",
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

function normalizeProblem(problem) {
  const question = String(problem?.question ?? "").trim();
  const answer = Number(problem?.answer);

  if (!question) return null;
  if (Number.isNaN(answer)) return null;

  return { question, answer };
}

function problemKey(problem) {
  return `${problem?.question ?? ""}::${problem?.answer ?? ""}`;
}

function dedupeProblems(list = []) {
  const map = new Map();

  list.forEach((problem) => {
    const normalized = normalizeProblem(problem);
    if (!normalized) return;

    map.set(problemKey(normalized), normalized);
  });

  return [...map.values()];
}

function getStudentRiskScore(results, assignmentsForClass, classroom, studentId) {
  if (!studentId) return 0;

  let score = 0;

  assignmentsForClass.forEach((assignment) => {
    const attempts = getAttemptsForGame(results, assignment.gameKey);
    const latest = attempts[0] || null;

    const medianPercent = attempts.length
      ? getMedianNumber(attempts.map((attempt) => getAttemptPercent(attempt)))
      : 0;

    const medianWrongTries = attempts.length
      ? getMedianNumber(
        attempts.map((attempt) => Number(attempt?.totalWrongGuesses || 0))
      )
      : 0;

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

    if (medianPercent < 40) score += 35;
    else if (medianPercent <= 60) score += 24;
    else if (medianPercent < 75) score += 12;
    else if (medianPercent < 90) score += 5;

    if (medianWrongTries >= 6) score += 18;
    else if (medianWrongTries >= 3) score += 10;
    else if (medianWrongTries >= 1) score += 4;
  });

  return Math.min(100, score);
}

function getSeverityFromAssignment(hasAttempts, medianPercent, medianWrongTries, locked) {
  return buildProgressMeta({
    percent: medianPercent,
    wrongTries: medianWrongTries,
    completed: hasAttempts,
    locked,
  }).severity;
}

function getSeverityLabel(severity) {
  if (severity === "failing") return "Struggling";
  if (severity === "attention") return "Needs Practice";
  if (severity === "watch") return "Not Started";

  return "On Track";
}

function getDashboardClassStatus(percent = 0) {
  const safePercent = Math.max(0, Math.min(100, Number(percent || 0)));

  if (safePercent <= 60) {
    return {
      key: "struggling",
      label: "Struggling",
      note: "60% or less",
      emoji: "🔥",
    };
  }

  if (safePercent >= 80) {
    return {
      key: "on-track",
      label: "On Track",
      note: "80% or higher",
      emoji: "🌟",
    };
  }

  return {
    key: "practice",
    label: "Needs Practice",
    note: "61% - 79%",
    emoji: "🧭",
  };
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
  const [openClassStudents, setOpenClassStudents] = useState({});

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [hideResults, setHideResults] = useState(false);
  const [showGroupsBuilder, setShowGroupsBuilder] = useState(false);
  const [showAssignmentEditor, setShowAssignmentEditor] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [showTeacherAlerts, setShowTeacherAlerts] = useState(false);
  const [showPerfectRuns, setShowPerfectRuns] = useState(false);
  const [showNeedsAttention, setShowNeedsAttention] = useState(true);
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
      classroom?.grade ?? classroom?.classGrade ?? teacher?.grade ?? teacher?.classGrade;

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
    if (managerMode === "student") {
      return selectedStudent ? [selectedStudent] : [];
    }

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
        classroom?.studentAssignments?.[selectedStudent.id]?.[assignment.gameKey] ?? false;

      const attempts = getAttemptsForGame(studentResults, assignment.gameKey);
      const latestAttempt = attempts[0] || null;

      const medianPercent = attempts.length
        ? getMedianNumber(attempts.map((attempt) => getAttemptPercent(attempt)))
        : 0;

      const medianWrongTries = attempts.length
        ? getMedianNumber(
          attempts.map((attempt) => Number(attempt?.totalWrongGuesses || 0))
        )
        : 0;

      const latestPercent = latestAttempt ? getAttemptPercent(latestAttempt) : 0;

      const severity = getSeverityFromAssignment(
        attempts.length > 0,
        medianPercent,
        medianWrongTries,
        locked
      );

      return {
        id: assignment.gameKey,
        title: assignment.title,
        locked,
        attempts,
        latestAttempt,
        latestPercent,
        latestWrongTries: Number(latestAttempt?.totalWrongGuesses || 0),
        medianPercent,
        medianWrongTries,
        perfectRuns: getPerfectRunCount(attempts),
        severity,
        needsAttentionFirst: medianPercent <= 60,
      };
    });

    return [...items].sort((a, b) => {
      if (a.needsAttentionFirst !== b.needsAttentionFirst) {
        return a.needsAttentionFirst ? -1 : 1;
      }

      if (a.medianPercent !== b.medianPercent) {
        return a.medianPercent - b.medianPercent;
      }

      return b.attempts.length - a.attempts.length;
    });
  }, [assignmentsForClass, classroom, selectedStudent, studentResults]);

  const classAssignmentProgress = useMemo(() => {
    const list = resultsViewMode === "class" ? students : resultsTargetStudents;

    const progressItems = assignmentsForClass.map((assignment) => {
      const rows = list.map((student) => {
        const studentResultsForView = allResultsByStudent[student.id] || [];
        const attempts = getAttemptsForGame(studentResultsForView, assignment.gameKey);
        const latestAttempt = attempts[0] || null;

        const locked =
          classroom?.studentAssignments?.[student.id]?.[assignment.gameKey] ?? false;

        const latestPercent = latestAttempt ? getAttemptPercent(latestAttempt) : 0;

        const medianPercent = attempts.length
          ? getMedianNumber(attempts.map((attempt) => getAttemptPercent(attempt)))
          : 0;

        const medianWrongTries = attempts.length
          ? getMedianNumber(
            attempts.map((attempt) => Number(attempt?.totalWrongGuesses || 0))
          )
          : 0;

        const progress = buildProgressMeta({
          percent: medianPercent,
          wrongTries: medianWrongTries,
          completed: attempts.length > 0,
          locked,
        });

        return {
          id: `${assignment.gameKey}-${student.id}`,
          student,
          assignment,
          locked,
          attempts,
          latestAttempt,
          latestPercent,
          latestWrongTries: Number(latestAttempt?.totalWrongGuesses || 0),
          medianPercent,
          medianWrongTries,
          perfectRuns: getPerfectRunCount(attempts),
          perfectRun: attempts.some((attempt) => isPerfectAttempt(attempt)),
          completed: attempts.length > 0,
          severity: progress.severity,
          progress,
          needsAttentionFirst: progress.severity === "failing",
        };
      });

      const sortedRows = sortWorstFirst(rows);
      const completedRows = sortedRows.filter((row) => row.completed);

      return {
        assignment,
        rows: sortedRows,
        totalStudents: sortedRows.length,
        completedCount: completedRows.length,
        failingCount: sortedRows.filter((row) => row.severity === "failing").length,
        perfectCount: sortedRows.reduce((sum, row) => sum + row.perfectRuns, 0),
        percentage: completedRows.length
          ? getMedianNumber(completedRows.map((row) => row.medianPercent))
          : 0,
      };
    });

    return sortAssignmentsWorstFirst(progressItems);
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

    const totalStudents =
      resultsViewMode === "class" ? students.length : resultsTargetStudents.length;

    const totalAssignments = assignments.length;
    const totalPossible = totalStudents * totalAssignments;

    const completed = assignments.reduce(
      (sum, item) => sum + item.completedCount,
      0
    );

    const failing = assignments.reduce(
      (sum, item) => sum + item.failingCount,
      0
    );

    const perfect = assignments.reduce(
      (sum, item) => sum + item.perfectCount,
      0
    );

    const average =
      assignments.length > 0
        ? getMedianNumber(assignments.map((item) => Number(item.percentage || 0)))
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
  }, [
    classAssignmentProgress,
    resultsViewMode,
    students.length,
    resultsTargetStudents.length,
  ]);

  const classDashboardStatus = useMemo(
    () => getDashboardClassStatus(classResultsSummary.average),
    [classResultsSummary.average]
  );

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
        const attempts = getAttemptsForGame(results, assignment.gameKey);
        const latest = attempts[0] || null;

        const percent = attempts.length
          ? getMedianNumber(attempts.map((attempt) => getAttemptPercent(attempt)))
          : 0;

        const wrongTries = attempts.length
          ? getMedianNumber(
            attempts.map((attempt) => Number(attempt?.totalWrongGuesses || 0))
          )
          : 0;

        const attemptTime =
          latest?.completedAt || latest?.submittedAt || latest?.createdAt || null;

        if (latest && percent <= 60) {
          alerts.push({
            type: "low-score",
            priority: 1,
            section: "urgent",
            percent,
            studentId: student.id,
            timestamp: attemptTime,
            label: `${student.name || student.id} is failing ${assignment.title}`,
            meta: `Median ${percent}% • ${formatAttemptTime(attemptTime)}`,
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
            meta: `Median ${wrongTries} wrong tries • ${formatAttemptTime(
              attemptTime
            )}`,
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
          label: `${student.name || student.id} has ${perfectRuns} perfect run${perfectRuns === 1 ? "" : "s"
            }`,
          meta: "Great work",
        });
      }
    });

    return sortAlertsByUrgency(alerts);
  }, [students, allResultsByStudent, assignmentsForClass, classroom]);

  const urgentAlerts = useMemo(
    () =>
      teacherAlerts
        .filter((item) => item.section === "urgent")
        .filter(
          (item) =>
            !dismissedAlerts.has(
              `${item.type}-${item.studentId}-${item.label}`
            )
        ),
    [teacherAlerts, dismissedAlerts]
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
      liveSyncEnabled: true,
      selectedPresetIds: [],
      selectedBuiltInProblems: [],
      customProblems: [],
    };
  }, [classroom, editorGameKey]);

  const availableGameBank = useMemo(
    () => getProblemBankForGame(editorGameKey),
    [editorGameKey]
  );

  const availableBuiltInProblems = useMemo(
    () =>
      Array.isArray(availableGameBank?.flatBuiltInProblems)
        ? availableGameBank.flatBuiltInProblems
        : [],
    [availableGameBank]
  );

  const availablePresets = useMemo(
    () => (Array.isArray(availableGameBank?.presets) ? availableGameBank.presets : []),
    [availableGameBank]
  );

  const resolvedEditorPreviewProblems = useMemo(() => {
    const selectedPresetIds = Array.isArray(editorAssignmentConfig.selectedPresetIds)
      ? editorAssignmentConfig.selectedPresetIds
      : [];

    const selectedBuiltIns = Array.isArray(
      editorAssignmentConfig.selectedBuiltInProblems
    )
      ? editorAssignmentConfig.selectedBuiltInProblems
      : [];

    const customProblems = Array.isArray(editorAssignmentConfig.customProblems)
      ? editorAssignmentConfig.customProblems
      : [];

    const selectedPresetProblems = availablePresets
      .filter((preset) => selectedPresetIds.includes(preset.id))
      .flatMap((preset) => (Array.isArray(preset.problems) ? preset.problems : []));

    return dedupeProblems([
      ...selectedPresetProblems,
      ...selectedBuiltIns,
      ...customProblems,
    ]);
  }, [availablePresets, editorAssignmentConfig]);

  const editorSelectedCount = useMemo(() => {
    const presets = Array.isArray(editorAssignmentConfig.selectedPresetIds)
      ? editorAssignmentConfig.selectedPresetIds.length
      : 0;

    const builtIn = Array.isArray(editorAssignmentConfig.selectedBuiltInProblems)
      ? editorAssignmentConfig.selectedBuiltInProblems.length
      : 0;

    const custom = Array.isArray(editorAssignmentConfig.customProblems)
      ? editorAssignmentConfig.customProblems.length
      : 0;

    return {
      presets,
      builtIn,
      custom,
      total: resolvedEditorPreviewProblems.length,
    };
  }, [editorAssignmentConfig, resolvedEditorPreviewProblems.length]);

  useEffect(() => {
    let unsubscribeClassroom = null;
    let unsubscribeStudents = () => { };

    async function loadTeacherClass() {
      try {
        let classDocId = teacher?.classId || null;

        if (!classDocId && teacher?.id) {
          const q = query(
            collection(db, "classrooms"),
            where("teacherID", "==", teacher.id)
          );

          const snap = await getDocs(q);

          if (!snap.empty) {
            classDocId = snap.docs[0].id;
          }
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
          setClassroom({ id: classSnap.id, ...classData });

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
                  if (filtered.some((student) => student.id === prev)) {
                    return prev;
                  }

                  return filtered[0]?.id || "";
                });
              },
              (error) => {
                console.error(`Error watching student ${studentId}:`, error);
              }
            );
          });

          unsubscribeStudents = () => {
            studentUnsubs.forEach((unsub) => {
              if (typeof unsub === "function") unsub();
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
      unsubscribers.forEach((unsub) => {
        if (typeof unsub === "function") unsub();
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
    if (!managerGroupId && studentGroups.length) {
      setManagerGroupId(studentGroups[0].id);
    }

    if (!resetGroupId && studentGroups.length) {
      setResetGroupId(studentGroups[0].id);
    }

    if (!resultsGroupId && studentGroups.length) {
      setResultsGroupId(studentGroups[0].id);
    }
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

  function toggleClassStudentDropdown(key) {
    setOpenClassStudents((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function jumpToStudent(studentId) {
    if (!studentId) return;

    setSelectedStudentId(studentId);
    setResultsViewMode("student");
    setHideResults(false);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function normalizeStudentDoc(studentId, data = {}) {
  return {
    id: studentId,
    name: data.name || `Student ${studentId}`,
    grade: data.grade ?? null,
    birthday: data.birthday ?? "",
    coins: Number(data.coins ?? 0),
    createdAt: data.createdAt ?? null,
    lastActive: data.lastActive ?? null,
    weakFamilies: data.weakFamilies || {},
    adaptiveAssignments: data.adaptiveAssignments || {},
    equippedPfp: data.equippedPfp || "",
    equippedOutfit: data.equippedOutfit || "",
    ...data,
  };
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
          `${lockedValue ? "Locked" : "Unlocked"} assignment for ${selectedStudent?.name || "the selected student"
          }.`
        );
      } else if (managerMode === "group") {
        alert(
          `${lockedValue ? "Locked" : "Unlocked"} assignment for ${selectedManagerGroup?.name || "the selected group"
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
    const resultsRef = collection(
      db,
      "students",
      String(studentId),
      "assignmentResults"
    );

    const snap = await getDocs(resultsRef);

    await Promise.all(snap.docs.map((resultDoc) => deleteDoc(resultDoc.ref)));

    if (shouldResetCoins) {
      const studentRef = doc(db, "students", String(studentId));
      await updateDoc(studentRef, { coins: 0 });
    }
  }


  async function handleResetAssignments() {
    if (isResetting) return;

    try {
      setIsResetting(true);

      if (!resetTargetStudents.length) {
        alert("Please choose a valid student, group, or class.");
        return;
      }

      const results = await Promise.allSettled(
        resetTargetStudents.map((student) =>
          resetStudentAssignments(student.id, resetCoinsToo)
        )
      );

      const failed = results.filter((r) => r.status === "rejected");

      if (failed.length > 0) {
        console.error("FAILED STUDENTS:", failed);

        alert(
          `${failed.length} student(s) failed to reset.\nCheck console for details.`
        );
        return;
      }

      alert("Reset complete!");
      setShowResetPanel(false);
    } catch (error) {
      console.error("Reset error:", error);
      alert(error.message || "Reset failed.");
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
          liveSyncEnabled: nextConfig.liveSyncEnabled !== false,
          selectedPresetIds: Array.isArray(nextConfig.selectedPresetIds)
            ? nextConfig.selectedPresetIds
            : [],
          selectedBuiltInProblems: dedupeProblems(
            nextConfig.selectedBuiltInProblems || []
          ),
          customProblems: dedupeProblems(nextConfig.customProblems || []),
          liveProblemCount: dedupeProblems([
            ...(nextConfig.selectedBuiltInProblems || []),
            ...(nextConfig.customProblems || []),
          ]).length,
          lastUpdatedAt: serverTimestamp(),
        },
      });

      setEditorLastSavedAt(Date.now());
    } catch (error) {
      console.error("Error saving assignment editor config:", error);
      alert("Could not save assignment editor changes.");
    }
  }

  async function toggleLiveSyncEnabled() {
    await saveAssignmentEditorConfig({
      ...editorAssignmentConfig,
      liveSyncEnabled: editorAssignmentConfig.liveSyncEnabled === false,
      selectedPresetIds: Array.isArray(editorAssignmentConfig.selectedPresetIds)
        ? editorAssignmentConfig.selectedPresetIds
        : [],
      selectedBuiltInProblems: Array.isArray(
        editorAssignmentConfig.selectedBuiltInProblems
      )
        ? editorAssignmentConfig.selectedBuiltInProblems
        : [],
      customProblems: Array.isArray(editorAssignmentConfig.customProblems)
        ? editorAssignmentConfig.customProblems
        : [],
    });
  }

  async function togglePreset(presetId) {
    const current = Array.isArray(editorAssignmentConfig.selectedPresetIds)
      ? editorAssignmentConfig.selectedPresetIds
      : [];

    const next = current.includes(presetId)
      ? current.filter((id) => id !== presetId)
      : [...current, presetId];

    await saveAssignmentEditorConfig({
      liveSyncEnabled: editorAssignmentConfig.liveSyncEnabled !== false,
      selectedPresetIds: next,
      selectedBuiltInProblems: Array.isArray(
        editorAssignmentConfig.selectedBuiltInProblems
      )
        ? editorAssignmentConfig.selectedBuiltInProblems
        : [],
      customProblems: Array.isArray(editorAssignmentConfig.customProblems)
        ? editorAssignmentConfig.customProblems
        : [],
    });
  }

  async function toggleBuiltInProblem(problem) {
    const current = Array.isArray(editorAssignmentConfig.selectedBuiltInProblems)
      ? editorAssignmentConfig.selectedBuiltInProblems
      : [];

    const key = problemKey(problem);
    const exists = current.some((item) => problemKey(item) === key);

    const next = exists
      ? current.filter((item) => problemKey(item) !== key)
      : [...current, normalizeProblem(problem)];

    await saveAssignmentEditorConfig({
      liveSyncEnabled: editorAssignmentConfig.liveSyncEnabled !== false,
      selectedPresetIds: Array.isArray(editorAssignmentConfig.selectedPresetIds)
        ? editorAssignmentConfig.selectedPresetIds
        : [],
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

    const next = [
      ...current,
      {
        question: trimmedQuestion,
        answer: parsedAnswer,
      },
    ];

    await saveAssignmentEditorConfig({
      liveSyncEnabled: editorAssignmentConfig.liveSyncEnabled !== false,
      selectedPresetIds: Array.isArray(editorAssignmentConfig.selectedPresetIds)
        ? editorAssignmentConfig.selectedPresetIds
        : [],
      selectedBuiltInProblems: Array.isArray(
        editorAssignmentConfig.selectedBuiltInProblems
      )
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
      liveSyncEnabled: editorAssignmentConfig.liveSyncEnabled !== false,
      selectedPresetIds: Array.isArray(editorAssignmentConfig.selectedPresetIds)
        ? editorAssignmentConfig.selectedPresetIds
        : [],
      selectedBuiltInProblems: Array.isArray(
        editorAssignmentConfig.selectedBuiltInProblems
      )
        ? editorAssignmentConfig.selectedBuiltInProblems
        : [],
      customProblems: next,
    });
  }

  async function clearEditorForGame() {
    await saveAssignmentEditorConfig({
      liveSyncEnabled: true,
      selectedPresetIds: [],
      selectedBuiltInProblems: [],
      customProblems: [],
    });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getStudentAttemptsForAssignment(studentId, gameKey) {
    const results = allResultsByStudent[studentId] || [];
    return getAttemptsForGame(results, gameKey);
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

            <button
              className="tdash__logout-btn"
              type="button"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {showResetPanel && (
          <section className="tdash__card tdash__reset-card">
            <div className="tdash__reset-head">
              <div>
                <h2 className="tdash__section-title">Reset Assignment Results</h2>
                <p className="tdash__reset-subtitle">
                  Choose who to reset. This removes saved assignment attempts.
                </p>
              </div>

              <button
                className="tdash__reset-close"
                type="button"
                onClick={() => setShowResetPanel(false)}
              >
                ✕
              </button>
            </div>

            <div className="tdash__reset-options">
              {[
                { value: "student", label: "Single Student", icon: "👩‍🎓" },
                { value: "group", label: "Group", icon: "🧺" },
                { value: "class", label: "Whole Class", icon: "🏕️" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`tdash__reset-option ${resetMode === option.value ? "tdash__reset-option--active" : ""
                    }`}
                  onClick={() => setResetMode(option.value)}
                >
                  <span>{option.icon}</span>
                  <strong>{option.label}</strong>
                </button>
              ))}
            </div>

            <div className="tdash__reset-fields">
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

              {resetMode === "class" && (
                <div className="tdash__reset-class-note">
                  This will reset all {students.length} students in this class.
                </div>
              )}
            </div>

            <label className="tdash__reset-check">
              <input
                type="checkbox"
                checked={resetCoinsToo}
                onChange={(e) => setResetCoinsToo(e.target.checked)}
              />
              <span>Reset coins too</span>
            </label>

            <div className="tdash__reset-warning">
              {resetMode === "student"
                ? "This will remove all saved attempt history for the selected student."
                : resetMode === "group"
                  ? "This will remove all saved attempt history for every student in the selected group."
                  : "This will remove all saved attempt history for the whole class."}
              {resetCoinsToo ? " Coins will also be reset to 0." : ""}
            </div>

            <div className="tdash__reset-actions">
              <button
                className="tdash__ghost-btn"
                type="button"
                onClick={() => setShowResetPanel(false)}
              >
                Cancel
              </button>

              <button
                className="tdash__danger-btn tdash__danger-btn--reset"
                type="button"
                onClick={handleResetAssignments}
                disabled={isResetting}
              >
                {isResetting ? "Resetting..." : "Confirm Reset"}
              </button>
            </div>
          </section>
        )}

        <section className="tdash__top-stats" aria-label="Class overview">
          <div className="tdash__top-stat tdash__top-stat--orange">
            <div className="tdash__top-stat-number">{students.length}</div>
            <div className="tdash__top-stat-label">Students</div>
          </div>

          <div className="tdash__top-stat tdash__top-stat--blue">
            <div className="tdash__top-stat-number">
              {assignmentsForClass.length}
            </div>
            <div className="tdash__top-stat-label">Assignments</div>
          </div>

          <div className="tdash__top-stat tdash__top-stat--green">
            <div className="tdash__top-stat-number">
              {studentResults.length}
            </div>
            <div className="tdash__top-stat-label">
              Selected Student Attempts
            </div>
          </div>
        </section>

        <section className="tdash__card">
          <div className="tdash__card-head tdash__card-head--split">
            <div className="tdash__title-row">
              <h2 className="tdash__section-title">Needs Attention First</h2>
              <span className="tdash__alert-badge">{urgentAlerts.length}</span>
            </div>

            <div className="tdash__header-actions">
              <button
                className="tdash__ghost-btn"
                onClick={() => setShowNeedsAttention((prev) => !prev)}
              >
                {showNeedsAttention ? "Hide" : "Show"}
              </button>

              <button
                className="tdash__danger-btn"
                onClick={() => {
                  const next = new Set(
                    urgentAlerts.map(
                      (alertItem) =>
                        `${alertItem.type}-${alertItem.studentId}-${alertItem.label}`
                    )
                  );
                  setDismissedAlerts(next);
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          {showNeedsAttention && (
            <div className="tdash__stack">
              {urgentAlerts.length > 0 ? (
                urgentAlerts.slice(0, 10).map((alertItem, index) => (
                  <button
                    key={`${alertItem.type}-${alertItem.studentId}-${index}`}
                    className="tdash__note tdash__note--danger tdash__note-button"
                    onClick={() => jumpToStudent(alertItem.studentId)}
                  >
                    <div className="tdash__note-title">{alertItem.label}</div>
                    <div className="tdash__note-meta">
                      {alertItem.meta}
                      {alertItem.timestamp
                        ? ` • ${getRelativeAlertTime(alertItem.timestamp)}`
                        : ""}
                    </div>
                  </button>
                ))
              ) : (
                <p className="tdash__empty-text">No urgent alerts right now.</p>
              )}
            </div>
          )}
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
                  <span className="tdash__pill">
                    {selectedStudent.name || "—"}
                  </span>
                </div>

                <div className="tdash__detail-item">
                  <span>Student ID</span>
                  <span className="tdash__pill">{selectedStudent.id}</span>
                </div>

                <div className="tdash__detail-item">
                  <span>Grade</span>
                  <span className="tdash__pill">
                    {selectedStudent.grade ?? "—"}
                  </span>
                </div>

                <div className="tdash__detail-item">
                  <span>Birthday</span>
                  <span className="tdash__pill">
                    {selectedStudent.birthday ?? "—"}
                  </span>
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

        <AssignmentEditor
          assignmentsForClass={assignmentsForClass}
          editorGameKey={editorGameKey}
          setEditorGameKey={setEditorGameKey}
          editorAssignmentConfig={editorAssignmentConfig}
          availablePresets={availablePresets}
          availableBuiltInProblems={availableBuiltInProblems}
          resolvedEditorPreviewProblems={resolvedEditorPreviewProblems}
          editorSelectedCount={editorSelectedCount}
          editorCustomQuestion={editorCustomQuestion}
          setEditorCustomQuestion={setEditorCustomQuestion}
          editorCustomAnswer={editorCustomAnswer}
          setEditorCustomAnswer={setEditorCustomAnswer}
          editorLastSavedAt={editorLastSavedAt}
          showAssignmentEditor={showAssignmentEditor}
          setShowAssignmentEditor={setShowAssignmentEditor}
          toggleLiveSyncEnabled={toggleLiveSyncEnabled}
          clearEditorForGame={clearEditorForGame}
          togglePreset={togglePreset}
          toggleBuiltInProblem={toggleBuiltInProblem}
          handleAddCustomProblem={handleAddCustomProblem}
          handleRemoveCustomProblem={handleRemoveCustomProblem}
          problemKey={problemKey}
        />

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

        <AssignmentResults
          resultsViewMode={resultsViewMode}
          setResultsViewMode={setResultsViewMode}
          resultsGroupId={resultsGroupId}
          setResultsGroupId={setResultsGroupId}
          studentGroups={studentGroups}
          hideResults={hideResults}
          setHideResults={setHideResults}
          groupedAssignments={groupedAssignments}
          classAssignmentProgress={classAssignmentProgress}
          classResultsSummary={classResultsSummary}
          openAssignments={openAssignments}
          openAttempts={openAttempts}
          openClassAssignments={openClassAssignments}
          openClassStudents={openClassStudents}
          toggleAssignmentDropdown={toggleAssignmentDropdown}
          toggleAttemptDropdown={toggleAttemptDropdown}
          toggleClassAssignmentDropdown={toggleClassAssignmentDropdown}
          toggleClassStudentDropdown={toggleClassStudentDropdown}
          getSeverityLabel={getSeverityLabel}
          formatAttemptTime={formatAttemptTime}
          getAttemptPercent={getAttemptPercent}
          getAnswerPercentage={getAnswerPercentage}
          getBreakdownPercentage={getBreakdownPercentage}
          isPerfectAttempt={isPerfectAttempt}
          getStudentAttemptsForAssignment={getStudentAttemptsForAssignment}
          jumpToStudent={jumpToStudent}
        />

        {showScrollTop && (
          <button
            className="tdash__scroll-top"
            type="button"
            onClick={scrollToTop}
          >
            ↑ Top
          </button>
        )}
      </main>
    </div >
  );
}