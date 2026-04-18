import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import "./GamePage.css";
import createGame from "../createGame";
import { db } from "../firebase";
import { getAssignedProblemsForGame } from "../getAssignedProblemsForGame";

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

export default function GamePage({ gameKey, onFinishReturn, student }) {
  const gameContainerRef = useRef(null);
  const gameRef = useRef(null);

  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const [equippedImage, setEquippedImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [equippedCategory, setEquippedCategory] = useState("pfp");

  useEffect(() => {
    let cancelled = false;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverflowX = document.body.style.overflowX;
    const previousBodyOverflowY = document.body.style.overflowY;

    async function bootGame() {
      setIsLoadingGame(true);

      if (!gameContainerRef.current || !gameKey) {
        setIsLoadingGame(false);
        return;
      }

      const studentId = student?.id || null;
      const classId = resolveStudentClassId(student);
      const fallbackProblems = assignmentProblemBanks[gameKey] || [];

      try {
        // lock page scroll while inside the game
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.overflowX = "hidden";
        document.body.style.overflowY = "hidden";

        // only leave the game when the Phaser return button is clicked
        window.onPhaserReturnToGames = () => {
          if (!cancelled) {
            document.documentElement.style.overflow = previousHtmlOverflow;
            document.body.style.overflow = previousBodyOverflow;
            document.body.style.overflowX = previousBodyOverflowX;
            document.body.style.overflowY = previousBodyOverflowY;
            onFinishReturn?.();
          }
        };

        // do NOT auto-return on finish anymore
        window.onPhaserGameFinished = () => {};

        const assignedProblems = await getAssignedProblemsForGame({
          classId,
          gameKey,
          fallbackProblems,
        });

        if (cancelled || !gameContainerRef.current) return;

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
    }

    bootGame();

    return () => {
      cancelled = true;
      window.onPhaserReturnToGames = null;
      window.onPhaserGameFinished = null;

      // always restore scroll when leaving the game page
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
    onFinishReturn,
    student?.id,
    student?.classId,
    student?.classID,
    student?.classroomId,
    student?.classroomID,
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