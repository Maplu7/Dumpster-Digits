import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import "./GamePage.css";
import createGame from "../createGame";
import { db } from "../firebase";
import { subscribeAssignedProblemsForGame } from "../getAssignedProblemsForGame";

const ASSIGNMENTS_TITLE_COLOR = "#ffe7b4";
const DEFAULT_PROFILE_IMAGE = "/raccacoonies/what.jpeg";

const assignmentProblemBanks = {
  "1st_addition": [
    { question: "1+0", answer: 1 },
    { question: "1+1", answer: 2 },
    { question: "1+2", answer: 3 },
    { question: "1+3", answer: 4 },
    { question: "1+4", answer: 5 },
    { question: "1+5", answer: 6 },
    { question: "1+6", answer: 7 },
    { question: "1+7", answer: 8 },
    { question: "1+8", answer: 9 },
    { question: "1+9", answer: 10 },
    { question: "1+10", answer: 11 },
  ],
  "1st_subtraction": [],
  "2nd_addition": [],
  "2nd_subtraction": [],
  "2nd_fill_blank": [],
  "2nd_place_value": [],
  "2nd_multiplication": [],
};

function resolveStudentClassId(student) {
  if (!student) return "";
  return (
    student.classId ||
    student.classID ||
    student.classroomId ||
    student.classroomID ||
    ""
  );
}

function normalizeProblems(problems) {
  if (!Array.isArray(problems)) return [];

  return problems
    .map((problem) => {
      if (!problem || typeof problem !== "object") return null;

      const question = String(problem.question ?? "").trim();
      const answer = Number(problem.answer);

      if (!question || Number.isNaN(answer)) return null;

      return { question, answer };
    })
    .filter(Boolean);
}

function problemKey(problem) {
  return `${String(problem?.question ?? "").trim()}::${Number(problem?.answer)}`;
}

function dedupeProblems(problems) {
  const seen = new Map();

  normalizeProblems(problems).forEach((problem) => {
    seen.set(problemKey(problem), problem);
  });

  return [...seen.values()];
}

function areProblemSetsEqual(a = [], b = []) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i += 1) {
    const left = a[i] || {};
    const right = b[i] || {};

    if (String(left.question) !== String(right.question)) return false;
    if (Number(left.answer) !== Number(right.answer)) return false;
  }

  return true;
}

export default function GamePage({ gameKey, onFinishReturn, student }) {
  const gameContainerRef = useRef(null);
  const gameRef = useRef(null);
  const previousProblemsRef = useRef([]);

  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const [equippedImage, setEquippedImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [equippedCategory, setEquippedCategory] = useState("pfp");

  useEffect(() => {
    let cancelled = false;
    let unsubscribeAssignedProblems = null;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverflowX = document.body.style.overflowX;
    const previousBodyOverflowY = document.body.style.overflowY;

    setIsLoadingGame(true);
    previousProblemsRef.current = [];

    if (!gameContainerRef.current || !gameKey) {
      setIsLoadingGame(false);
      return () => {};
    }

    const studentId =
      String(student?.id || sessionStorage.getItem("studentId") || "").trim();

    const classId = String(resolveStudentClassId(student)).trim();
    const fallbackProblems = dedupeProblems(assignmentProblemBanks[gameKey] || []);

    console.log("🎯 FINAL studentId being passed to game:", studentId);
    console.log("🚀 Booting game with:", {
      gameKey,
      studentId,
      classId,
      fallbackProblems,
    });

    if (!studentId) {
      console.warn("⛔ Game blocked: missing studentId");
      setIsLoadingGame(false);
      return () => {};
    }

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "hidden";

    window.onPhaserReturnToGames = () => {
      if (!cancelled) {
        document.documentElement.style.overflow = previousHtmlOverflow;
        document.body.style.overflow = previousBodyOverflow;
        document.body.style.overflowX = previousBodyOverflowX;
        document.body.style.overflowY = previousBodyOverflowY;
        onFinishReturn?.();
      }
    };

    window.onPhaserGameFinished = () => {};

    const rebuildGame = (assignedProblemsRaw) => {
      if (cancelled || !gameContainerRef.current) return;

      const assignedProblems = dedupeProblems(assignedProblemsRaw);

      if (
        gameRef.current &&
        areProblemSetsEqual(previousProblemsRef.current, assignedProblems)
      ) {
        setIsLoadingGame(false);
        return;
      }

      previousProblemsRef.current = assignedProblems;

      if (gameRef.current) {
        try {
          gameRef.current.destroy(true);
        } catch (error) {
          console.error("Error destroying previous Phaser game:", error);
        }
        gameRef.current = null;
      }

      try {
        gameRef.current = createGame(gameKey, gameContainerRef.current, {
          studentId,
          classId,
          assignedProblems,
        });
      } catch (error) {
        console.error("Error creating game:", error);
      } finally {
        if (!cancelled) {
          setIsLoadingGame(false);
        }
      }
    };

    unsubscribeAssignedProblems = subscribeAssignedProblemsForGame(
      {
        classId,
        gameKey,
        fallbackProblems,
      },
      rebuildGame,
      (error) => {
        console.error("Error watching assigned problems for game:", error);
        if (!cancelled) setIsLoadingGame(false);
      }
    );

    return () => {
      cancelled = true;

      if (typeof unsubscribeAssignedProblems === "function") {
        unsubscribeAssignedProblems();
      }

      window.onPhaserReturnToGames = null;
      window.onPhaserGameFinished = null;

      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overflowX = previousBodyOverflowX;
      document.body.style.overflowY = previousBodyOverflowY;

      if (gameRef.current) {
        try {
          gameRef.current.destroy(true);
        } catch (error) {
          console.error("Error destroying Phaser game:", error);
        }
        gameRef.current = null;
      }
    };
  }, [
    gameKey,
    student?.id,
    student?.classId,
    student?.classID,
    student?.classroomId,
    student?.classroomID,
    onFinishReturn,
  ]);

  useEffect(() => {
    if (!student?.id) {
      setEquippedImage(DEFAULT_PROFILE_IMAGE);
      setEquippedCategory("pfp");
      return;
    }

    const studentRef = doc(db, "students", String(student.id));

    const unsubscribe = onSnapshot(studentRef, (snap) => {
      if (!snap.exists()) {
        setEquippedImage(DEFAULT_PROFILE_IMAGE);
        setEquippedCategory("pfp");
        return;
      }

      const data = snap.data();

      setEquippedImage(
        typeof data.equippedItemImage === "string" && data.equippedItemImage.trim()
          ? data.equippedItemImage
          : DEFAULT_PROFILE_IMAGE
      );

      setEquippedCategory(data.equippedItemCategory || "pfp");
    });

    return () => unsubscribe();
  }, [student?.id]);

  const isCustomize = equippedCategory === "customize";

  return (
    <div className="game-page">
      <div
        className={`game-profile-shell ${
          isCustomize
            ? "game-profile-shell--customize"
            : "game-profile-shell--pfp"
        }`}
        style={{
          border: `6px solid ${ASSIGNMENTS_TITLE_COLOR}`,
          boxShadow: `
            0 0 0 2px rgba(255,255,255,0.18) inset,
            0 0 24px ${ASSIGNMENTS_TITLE_COLOR}55,
            0 14px 28px rgba(0,0,0,0.24)
          `,
        }}
      >
        <img
          key={equippedImage}
          src={equippedImage}
          alt="Raccacoonie Profile"
          className={`game-profile-image ${
            isCustomize
              ? "game-profile-image--customize"
              : "game-profile-image--pfp"
          }`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_PROFILE_IMAGE;
          }}
        />
      </div>

      {isLoadingGame && <p className="game-loading-text">Loading game...</p>}

      <div ref={gameContainerRef} className="game-canvas-wrap" />
    </div>
  );
}