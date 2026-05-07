import { useCallback, useEffect, useRef, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import "./GamePage.css";
import createGame from "../createGame";
import { db } from "../firebase";
import { subscribeAssignedProblemsForGame } from "../getAssignedProblemsForGame";

const ASSIGNMENTS_TITLE_COLOR = "#ffe7b4";
const DEFAULT_PROFILE_IMAGE = "/raccacoonies/what.jpeg";

const outfitImages = {
  "outfit-chef": "/raccacoonies/CHEF_RACCO.png",
  "outfit-argg": "/raccacoonies/ARGG.png",
  knight: "/raccacoonies/knight.png",
  fairy: "/raccacoonies/fairy.png",
  princess: "/raccacoonies/princess.png",
  sleepy: "/raccacoonies/eppy.png",
  wizard: "/raccacoonies/wizard.png",
  sable: "/raccacoonies/sable.png",
  dragon: "/raccacoonies/dragon.png",
};

const pfpImages = {
  1: "/raccacoonies/happy.png",
  2: "/raccacoonies/angy.png",
  3: "/raccacoonies/crying.jpeg",
  4: "/raccacoonies/woah.png",
  5: "/raccacoonies/bleh.jpeg",
  6: "/raccacoonies/thinking.jpeg",
  7: "/raccacoonies/confused.jpeg",
  8: "/raccacoonies/bleh_2.jpeg",
  9: "/raccacoonies/what.jpeg",
  10: "/raccacoonies/playing_dead.png",
  11: "/raccacoonies/furious.png",
  12: "/raccacoonies/blush.jpeg",
};

const emoteImages = {
  heart: "/emotes/heart.png",
  brokenHeart: "/emotes/brokenHeart.png",
  angry: "/emotes/angry.png",
  sleepy: "/emotes/sleepy.png",
  cry: "/emotes/cry.png",
};

const fallbackProblemBanks = {
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
  "1st_subtraction": [
    { question: "1-0", answer: 1 },
    { question: "2-1", answer: 1 },
    { question: "3-1", answer: 2 },
    { question: "4-1", answer: 3 },
    { question: "5-2", answer: 3 },
  ],
  "2nd_addition": [],
  "2nd_subtraction": [],
  "2nd_fill_blank": [],
  "2nd_place_value": [],
  "2nd_multiplication": [],
  "2nd_division": [],
};

function resolveStudentClassId(student) {
  return String(
    student?.classId ||
      student?.classID ||
      student?.classroomId ||
      student?.classroomID ||
      ""
  ).trim();
}

function normalizeProblem(problem) {
  if (!problem || typeof problem !== "object") return null;

  const question = String(problem.question ?? "").trim();
  const answer = Number(problem.answer);

  if (!question || Number.isNaN(answer)) return null;

  return { question, answer };
}

function dedupeProblems(problems = []) {
  const seen = new Map();

  (Array.isArray(problems) ? problems : []).forEach((problem) => {
    const normalized = normalizeProblem(problem);
    if (!normalized) return;

    seen.set(`${normalized.question}::${normalized.answer}`, normalized);
  });

  return [...seen.values()];
}

function areProblemSetsEqual(a = [], b = []) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;

  return a.every((problem, index) => {
    return (
      String(problem?.question) === String(b[index]?.question) &&
      Number(problem?.answer) === Number(b[index]?.answer)
    );
  });
}

export default function GamePage({ gameKey, onFinishReturn, student }) {
  const gameContainerRef = useRef(null);
  const gameRef = useRef(null);
  const previousProblemsRef = useRef([]);
  const startedAtRef = useRef(Date.now());
  const returningRef = useRef(false);

  const [isLoadingGame, setIsLoadingGame] = useState(true);
  const [isReturning, setIsReturning] = useState(false);
  const [finishInfo, setFinishInfo] = useState(null);
  const [equippedImage, setEquippedImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [equippedCategory, setEquippedCategory] = useState("pfp");

  const destroyGame = useCallback(() => {
    if (!gameRef.current) return;

    try {
      gameRef.current.destroy(true);
    } catch (error) {
      console.error("Error destroying Phaser game:", error);
    }

    gameRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsubscribeAssignedProblems = null;
    let unsubscribeReset = null;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverflowX = document.body.style.overflowX;
    const previousBodyOverflowY = document.body.style.overflowY;

    const restoreScroll = () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overflowX = previousBodyOverflowX;
      document.body.style.overflowY = previousBodyOverflowY;
    };

    const returnToGames = (reason = "finished") => {
      if (cancelled || returningRef.current) return;

      returningRef.current = true;
      setIsReturning(true);

      console.log("🎮 Returning to games:", reason);

      destroyGame();
      restoreScroll();

      window.setTimeout(() => {
        if (!cancelled) {
          onFinishReturn?.();
        }
      }, 180);
    };

    const handleGameFinished = (payload = {}) => {
      console.log("🏁 Phaser game finished:", payload);

      setFinishInfo({
        coinsEarned: Number(payload?.coinsEarned || 0),
        totalCoins:
          payload?.totalCoins === null || payload?.totalCoins === undefined
            ? null
            : Number(payload.totalCoins),
        perfectRun: Boolean(payload?.perfectRun),
        totalWrongGuesses: Number(payload?.totalWrongGuesses || 0),
        coinsSynced: Boolean(payload?.coinsSynced),
        gameKey,
      });
    };

    const handleCoinsSynced = (payload = {}) => {
      console.log("🪙 Coins synced:", payload);

      setFinishInfo((previous) => ({
        ...(previous || {}),
        coinsEarned: Number(payload?.coinsEarned ?? previous?.coinsEarned ?? 0),
        totalCoins:
          payload?.totalCoins === null || payload?.totalCoins === undefined
            ? previous?.totalCoins ?? null
            : Number(payload.totalCoins),
        perfectRun: Boolean(payload?.perfectRun ?? previous?.perfectRun),
        totalWrongGuesses: Number(
          payload?.totalWrongGuesses ?? previous?.totalWrongGuesses ?? 0
        ),
        coinsSynced: true,
        gameKey,
      }));
    };

    const handleReturnEvent = (event) => {
      returnToGames(event?.detail?.reason || "custom-event");
    };

    const handleFinishedEvent = (event) => {
      handleGameFinished(event?.detail || {});
    };

    const handleCoinsEvent = (event) => {
      handleCoinsSynced(event?.detail || {});
    };

    setIsLoadingGame(true);
    setIsReturning(false);
    setFinishInfo(null);
    returningRef.current = false;
    previousProblemsRef.current = [];
    startedAtRef.current = Date.now();

    const studentId = String(
      student?.id || sessionStorage.getItem("studentId") || ""
    ).trim();

    const classId = resolveStudentClassId(student);
    const studentGrade = student?.grade || student?.gradeLevel || "";
    const fallbackProblems = dedupeProblems(fallbackProblemBanks[gameKey] || []);

    if (!gameContainerRef.current || !gameKey) {
      setIsLoadingGame(false);
      return () => {};
    }

    if (!studentId) {
      console.warn("⛔ Game blocked: missing studentId");
      setIsLoadingGame(false);
      return () => {};
    }

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "hidden";

    window.onPhaserReturnToGames = () => returnToGames("phaser-global");
    window.onPhaserGameFinished = handleGameFinished;
    window.onPhaserCoinsSynced = handleCoinsSynced;

    window.addEventListener("phaser:returnToGames", handleReturnEvent);
    window.addEventListener("phaser:gameFinished", handleFinishedEvent);
    window.addEventListener("phaser:coinsSynced", handleCoinsEvent);

    unsubscribeReset = onSnapshot(
      doc(db, "students", studentId),
      (snap) => {
        if (!snap.exists() || cancelled) return;

        const data = snap.data();
        const resetVersion = Number(data?.resetVersion || 0);

        if (resetVersion && resetVersion > startedAtRef.current) {
          console.log("🔥 Game killed due to teacher reset");
          returnToGames("teacher-reset");
        }

        if (typeof data?.coins === "number") {
          setFinishInfo((previous) =>
            previous
              ? {
                  ...previous,
                  totalCoins: data.coins,
                  coinsSynced: true,
                }
              : previous
          );
        }
      },
      (error) => {
        console.error("Error watching student reset/coins:", error);
      }
    );

    const rebuildGame = (assignedProblemsRaw) => {
      if (cancelled || !gameContainerRef.current || returningRef.current) return;

      const assignedProblems = dedupeProblems(assignedProblemsRaw);

      console.log("🔴 GamePage received live problems:", {
        gameKey,
        classId,
        studentId,
        studentGrade,
        count: assignedProblems.length,
        assignedProblems,
      });

      if (
        gameRef.current &&
        areProblemSetsEqual(previousProblemsRef.current, assignedProblems)
      ) {
        setIsLoadingGame(false);
        return;
      }

      previousProblemsRef.current = assignedProblems;

      destroyGame();

      try {
        gameRef.current = createGame(gameKey, gameContainerRef.current, {
          studentId,
          classId,
          studentGrade,
          assignedProblems,
          startedAt: startedAtRef.current,
          onFinished: handleGameFinished,
          onCoinsSynced: handleCoinsSynced,
          onReturnToGames: () => returnToGames("phaser-callback"),
        });
      } catch (error) {
        console.error("Error creating Phaser game:", error);
      } finally {
        if (!cancelled) {
          setIsLoadingGame(false);
        }
      }
    };

    unsubscribeAssignedProblems = subscribeAssignedProblemsForGame(
      {
        classId,
        studentId,
        studentGrade,
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

      if (typeof unsubscribeReset === "function") {
        unsubscribeReset();
      }

      window.removeEventListener("phaser:returnToGames", handleReturnEvent);
      window.removeEventListener("phaser:gameFinished", handleFinishedEvent);
      window.removeEventListener("phaser:coinsSynced", handleCoinsEvent);

      delete window.onPhaserReturnToGames;
      delete window.onPhaserGameFinished;
      delete window.onPhaserCoinsSynced;

      restoreScroll();
      destroyGame();
    };
  }, [
    gameKey,
    student?.id,
    student?.grade,
    student?.gradeLevel,
    student?.classId,
    student?.classID,
    student?.classroomId,
    student?.classroomID,
    onFinishReturn,
    destroyGame,
  ]);

  useEffect(() => {
    if (!student?.id) {
      setEquippedImage(DEFAULT_PROFILE_IMAGE);
      setEquippedCategory("pfp");
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "students", String(student.id)),
      (snap) => {
        if (!snap.exists()) {
          setEquippedImage(DEFAULT_PROFILE_IMAGE);
          setEquippedCategory("pfp");
          return;
        }

        const data = snap.data();

        const equippedItemImage =
          typeof data.equippedItemImage === "string" &&
          data.equippedItemImage.trim()
            ? data.equippedItemImage.trim()
            : "";

        const equippedItemCategory =
          typeof data.equippedItemCategory === "string"
            ? data.equippedItemCategory.trim()
            : "";

        if (equippedItemImage) {
          setEquippedImage(equippedItemImage);
          setEquippedCategory(equippedItemCategory || "pfp");
          return;
        }

        const equippedOutfit = data.equippedOutfit || "";
        const equippedPfp = data.equippedPfp || "";
        const equippedEmote = data.equippedEmote || "";

        if (equippedOutfit && outfitImages[equippedOutfit]) {
          setEquippedImage(outfitImages[equippedOutfit]);
          setEquippedCategory("outfit");
        } else if (equippedPfp && pfpImages[equippedPfp]) {
          setEquippedImage(pfpImages[equippedPfp]);
          setEquippedCategory("pfp");
        } else if (equippedEmote && emoteImages[equippedEmote]) {
          setEquippedImage(emoteImages[equippedEmote]);
          setEquippedCategory("emote");
        } else {
          setEquippedImage(DEFAULT_PROFILE_IMAGE);
          setEquippedCategory("pfp");
        }
      },
      (error) => {
        console.error("Error syncing equipped profile item:", error);
      }
    );

    return () => unsubscribe();
  }, [student?.id]);

  const safeCategory =
    equippedCategory === "outfit" || equippedCategory === "emote"
      ? equippedCategory
      : "pfp";

  return (
    <div className={`game-page ${isReturning ? "game-page--returning" : ""}`}>
      <div
        className={`game-profile-shell game-profile-shell--${safeCategory}`}
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
          src={equippedImage || DEFAULT_PROFILE_IMAGE}
          alt="Raccacoonie Profile"
          className={`game-profile-image game-profile-image--${safeCategory}`}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = DEFAULT_PROFILE_IMAGE;
          }}
        />
      </div>

      {isLoadingGame && <p className="game-loading-text">Loading game...</p>}

      {finishInfo?.coinsEarned > 0 && !isReturning && (
        <div className="game-coin-sync-toast">
          <span className="game-coin-sync-toast__sparkle">✦</span>
          <span>+{finishInfo.coinsEarned} coins earned!</span>
          {finishInfo.coinsSynced && <small>Synced</small>}
        </div>
      )}

      {isReturning && (
        <div className="game-return-fade">
          <div className="game-return-card">
            <span>Returning to games...</span>
          </div>
        </div>
      )}

      <div ref={gameContainerRef} className="game-canvas-wrap" />
    </div>
  );
}