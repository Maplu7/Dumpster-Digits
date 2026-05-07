import Phaser from "phaser";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { showFinishScreen } from "./utils/showFinishScreen";
import { saveAssignmentResult } from "../saveAssignmentResult";

export class BaseMathGameScene extends Phaser.Scene {
  constructor(sceneKey = "Game") {
    super(sceneKey);

    this.assignedProblems = [];
    this.bgMusic = null;
    this.studentId = "";
    this.classId = "";
    this.gameKey = "";
    this.assignmentTitle = "";
    this.saveResults = null;
    this.unsubscribeLiveProblems = null;

    this.confettiEmitter = null;
    this.trashConfettiKeys = [];

    this.raccoonSpots = new Map();
    this.activeFeedbackRaccoon = null;
    this.activeFeedbackEmote = null;

    this.feedbackContainer = null;

    this.gameMusicVolume = 0.025;
    this.gameMusicDuckedVolume = 0.012;
    this.correctSfxVolume = 0.25;
    this.wrongSfxVolume = 0.22;
    this.feedbackDuration = 1100;
  }

  init(data = {}) {
    const fromDataProblems = Array.isArray(data?.assignedProblems)
      ? data.assignedProblems
      : [];

    const fromRegistryProblems = this.registry.get("assignedProblems");

    this.assignedProblems =
      fromDataProblems.length > 0
        ? fromDataProblems
        : Array.isArray(fromRegistryProblems)
          ? fromRegistryProblems
          : [];

    this.studentId = String(
      data?.studentId || this.registry.get("studentId") || ""
    ).trim();

    this.classId = String(
      data?.classId || this.registry.get("classId") || ""
    ).trim();

    console.log("🧩 BaseMathGameScene init", {
      scene: this.scene.key,
      studentId: this.studentId,
      classId: this.classId,
      assignedProblems: this.assignedProblems,
    });
  }

  normalizeProblem(problem) {
    if (!problem || typeof problem !== "object") return null;

    const question = String(problem.question ?? "").trim();
    const answer = Number(problem.answer);

    if (!question || Number.isNaN(answer)) return null;

    return { question, answer };
  }

  problemKey(problem) {
    return `${String(problem?.question ?? "").trim()}::${Number(problem?.answer)}`;
  }

  dedupeProblems(problems = []) {
    const seen = new Map();

    (Array.isArray(problems) ? problems : []).forEach((problem) => {
      const normalized = this.normalizeProblem(problem);
      if (!normalized) return;
      seen.set(this.problemKey(normalized), normalized);
    });

    return [...seen.values()];
  }

  getConfiguredProblems(fallbackProblems = []) {
    const normalizedAssigned = this.dedupeProblems(this.assignedProblems);
    const normalizedFallback = this.dedupeProblems(fallbackProblems);

    const problems =
      normalizedAssigned.length > 0 ? normalizedAssigned : normalizedFallback;

    console.log("🧠 Loaded Problems:", problems);
    return problems;
  }

  updateAssignedProblems(newProblems = []) {
    this.assignedProblems = this.dedupeProblems(newProblems);
    this.registry.set("assignedProblems", this.assignedProblems);

    console.log("🔄 Scene assigned problems updated", {
      scene: this.scene.key,
      gameKey: this.gameKey,
      classId: this.classId,
      count: this.assignedProblems.length,
      assignedProblems: this.assignedProblems,
    });

    if (typeof this.onAssignedProblemsUpdated === "function") {
      this.onAssignedProblemsUpdated(this.assignedProblems);
    }
  }

  initSharedGameConfig({ gameKey, assignmentTitle }) {
    this.gameKey = String(gameKey || this.registry.get("gameKey") || "").trim();
    this.assignmentTitle = assignmentTitle || this.gameKey;

    this.feedbackDuration = 1100;
    this.correctSoundKey = "correctSfx";
    this.wrongSoundKey = "wrongSfx";

    this.introActive = false;
    this.introOverlay = null;
    this._introShown = false;

    this.raccoonSpots = new Map();
    this.activeFeedbackRaccoon = null;
    this.activeFeedbackEmote = null;

    this.registry.set("studentId", this.studentId || "");
    this.registry.set("classId", this.classId || "");
    this.registry.set("gameKey", this.gameKey || "");
    this.registry.set("assignmentTitle", this.assignmentTitle || "");
    this.registry.set("assignedProblems", this.assignedProblems || []);

    this.startBackgroundMusic();

    this.events.once("shutdown", () => this.cleanupScene());
    this.events.once("destroy", () => this.cleanupScene());

    this.saveResults = async () => {
      const studentId = String(
        this.studentId || this.registry.get("studentId") || ""
      ).trim();

      const gameKey = String(
        this.gameKey || this.registry.get("gameKey") || ""
      ).trim();

      const payload = {
        studentId,
        gameKey,
        assignmentTitle: this.assignmentTitle || gameKey,
        totalWrongGuesses: Number(this.numWrong || 0),
        numGuessesPerAnswer: Array.isArray(this.numGuessesPerAnswer)
          ? this.numGuessesPerAnswer
          : [],
      };

      console.log("💾 saveResults payload", payload);

      if (!payload.studentId) {
        throw new Error(`[${this.scene.key}] save blocked: missing studentId`);
      }

      if (!payload.gameKey) {
        throw new Error(`[${this.scene.key}] save blocked: missing gameKey`);
      }

      const result = await saveAssignmentResult(payload);
      console.log("✅ saveAssignmentResult result", result);
      return result;
    };

    this.time.delayedCall(0, () => this.showGameIntroOverlay());
    this.time.delayedCall(0, () => this.createConfettiSystem());
  }

  cleanupScene() {
    this.cleanupSceneAudio();
    this.cleanupLiveAssignmentSync();
    this.destroyConfettiEmitter();
    this.destroyRaccoonFeedback();
    this.clearCenteredFeedback();
  }

  setupGamePolish(trashItems = [], trashCans = []) {
    this.gameMusicVolume = 0.025;
    this.gameMusicDuckedVolume = 0.012;
    this.correctSfxVolume = 0.25;
    this.wrongSfxVolume = 0.22;

    trashItems.forEach((trash) => {
      if (!trash) return;

      trash.startX = trash.x;
      trash.startY = trash.y;
      trash.originalX = trash.x;
      trash.originalY = trash.y;
      trash._lockedOnCan = false;
      trash._dragging = false;

      this.applyGameFont(trash);
    });

    trashCans.forEach((can) => {
      if (!can) return;

      can.baseScaleX = can.scaleX;
      can.baseScaleY = can.scaleY;

      this.applyGameFont(can);
      this.addAnswerTextGlow(can);
      this.addCanHoverPolish(can);
    });
  }

  setupUnifiedDragSystem() {
    // Compatibility only. Do not add drag behavior here.
  }

  getTextObjectsFromGameObject(gameObject) {
    return [
      gameObject?.trashMath,
      gameObject?.answerText,
      gameObject?.questionText,
      gameObject?.labelText,
      gameObject?.text,
    ].filter(Boolean);
  }

  applyGameFont(gameObject) {
    const textObjects = this.getTextObjectsFromGameObject(gameObject);

    textObjects.forEach((textObj) => {
      if (!textObj || typeof textObj.setStyle !== "function") return;

      textObj.setStyle({
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: textObj.style?.fontSize || "34px",
        color: textObj.style?.color || "#fff6d8",
        stroke: textObj.style?.stroke || "#5a3518",
        strokeThickness: textObj.style?.strokeThickness ?? 4,
        align: "center",
      });

      textObj.setPadding?.(0, 4, 0, 10);
    });
  }

  addAnswerTextGlow(can) {
    this.getTextObjectsFromGameObject(can).forEach((textObj) => {
      if (!textObj || typeof textObj.setShadow !== "function") return;
      textObj.setShadow(0, 0, "#fff1a8", 10, true, true);
    });
  }

  addCanHoverPolish(can) {
    if (!can || !can.active) return;

    can.setInteractive?.({ useHandCursor: true });

    const makeGlow = () => {
      if (can._hoverGlow?.active) return;

      can._hoverGlow = this.add
        .circle(can.x, can.y, 76, 0xfff0a8, 0.24)
        .setDepth((can.depth || 0) - 1);

      this.tweens.add({
        targets: can._hoverGlow,
        scaleX: 1.18,
        scaleY: 1.18,
        alpha: 0.38,
        duration: 240,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    };

    const removeGlow = () => {
      if (!can._hoverGlow) return;

      this.tweens.killTweensOf(can._hoverGlow);
      can._hoverGlow.destroy();
      can._hoverGlow = null;
    };

    can.on?.("pointerover", () => {
      makeGlow();

      this.tweens.killTweensOf(can);
      this.tweens.add({
        targets: can,
        scaleX: can.baseScaleX * 1.08,
        scaleY: can.baseScaleY * 1.08,
        angle: 2,
        duration: 90,
        yoyo: true,
        repeat: 2,
        ease: "Sine.easeInOut",
      });
    });

    can.on?.("pointerout", () => {
      removeGlow();

      this.tweens.killTweensOf(can);
      this.tweens.add({
        targets: can,
        scaleX: can.baseScaleX,
        scaleY: can.baseScaleY,
        angle: 0,
        duration: 120,
        ease: "Sine.easeOut",
      });
    });
  }

  polishCorrectAnswer(trashCan) {
    if (!trashCan || !trashCan.active) return;

    this.tweens.add({
      targets: trashCan,
      scaleX: trashCan.scaleX * 1.13,
      scaleY: trashCan.scaleY * 1.13,
      duration: 120,
      yoyo: true,
      ease: "Back.easeOut",
    });
  }

  polishWrongAnswer(trash) {
    if (!trash || !trash.active) return;

    trash._lockedOnCan = false;

    this.tweens.add({
      targets: trash,
      x: trash.x + 12,
      duration: 55,
      yoyo: true,
      repeat: 3,
      ease: "Sine.easeInOut",
      onComplete: () => {
        if (trash?.active && typeof trash.snapHome === "function") {
          trash.snapHome();
        }
      },
    });
  }

  pickUniqueProblemsByAnswer(problemPool, count = 5) {
    const normalizedPool = this.dedupeProblems(problemPool);

    if (normalizedPool.length === 0) {
      console.warn(`[${this.scene.key}] No valid problems found.`);
      return [];
    }

    const shuffled = Phaser.Utils.Array.Shuffle([...normalizedPool]);
    const selected = [];
    const usedAnswers = new Set();

    for (const problem of shuffled) {
      const answerKey = String(problem?.answer);
      if (usedAnswers.has(answerKey)) continue;

      usedAnswers.add(answerKey);
      selected.push(problem);

      if (selected.length === count) break;
    }

    const backupPool = selected.length > 0 ? selected : shuffled;

    while (selected.length < count) {
      const clone = backupPool[selected.length % backupPool.length];
      selected.push({ ...clone, __duplicateSlot: true });
    }

    return selected.slice(0, count);
  }

  assignFiveQuestionAndAnswerSlots(problemPool) {
    const selectedProblems = this.pickUniqueProblemsByAnswer(problemPool, 5);
    if (selectedProblems.length === 0) return [];

    const questionOrder = Phaser.Utils.Array.Shuffle([...selectedProblems]);
    const answerOrder = Phaser.Utils.Array.Shuffle([...selectedProblems]);

    [
      this.question1,
      this.question2,
      this.question3,
      this.question4,
      this.question5,
    ] = questionOrder;

    [
      this.answer1,
      this.answer2,
      this.answer3,
      this.answer4,
      this.answer5,
    ] = answerOrder;

    return selectedProblems;
  }

  createRaccoonAnimation() {
    if (!this.textures.exists("raccoon")) {
      console.warn(
        `[${this.scene.key}] Missing raccoon texture. Make sure Preloader loads "raccoon".`
      );
      return false;
    }

    if (!this.anims.exists("raccoonFeedback")) {
      this.anims.create({
        key: "raccoonFeedback",
        frames: this.anims.generateFrameNumbers("raccoon", {
          start: 20,
          end: 27,
        }),
        frameRate: 7,
        repeat: -1,
      });
    }

    return true;
  }

  showRaccoonFeedback(trashCan, isCorrect) {
    if (!trashCan) return;
    if (!this.createRaccoonAnimation()) return;

    if (isCorrect) {
      const key = `${Math.round(trashCan.x)}_${Math.round(
        trashCan.y
      )}_correct`;

      if (this.raccoonSpots.has(key)) return;

      const raccoon = this.add
        .sprite(trashCan.x, trashCan.y, "raccoon", 20)
        .setScale(3.2)
        .setDepth(999);

      let emote = null;

      if (this.textures.exists("heartEmote")) {
        emote = this.add
          .sprite(raccoon.x, raccoon.y - 62, "heartEmote")
          .setScale(2.4)
          .setDepth(1000);
      }

      raccoon.play("raccoonFeedback");

      this.raccoonSpots.set(key, {
        raccoon,
        emote,
      });

      return;
    }

    this.activeFeedbackRaccoon?.destroy();
    this.activeFeedbackEmote?.destroy();

    const raccoon = this.add
      .sprite(trashCan.x, trashCan.y, "raccoon", 20)
      .setScale(3.2)
      .setDepth(999);

    let emote = null;

    if (this.textures.exists("brokenHeartEmote")) {
      emote = this.add
        .sprite(raccoon.x, raccoon.y - 62, "brokenHeartEmote")
        .setScale(2.4)
        .setDepth(1000);
    }

    raccoon.play("raccoonFeedback");

    this.activeFeedbackRaccoon = raccoon;
    this.activeFeedbackEmote = emote;

    this.time.delayedCall(850, () => {
      if (!raccoon?.active) return;

      this.tweens.add({
        targets: [raccoon, emote].filter(Boolean),
        alpha: 0,
        y: "-=20",
        duration: 220,
        ease: "Sine.easeOut",
        onComplete: () => {
          raccoon?.destroy();
          emote?.destroy();

          if (this.activeFeedbackRaccoon === raccoon) {
            this.activeFeedbackRaccoon = null;
            this.activeFeedbackEmote = null;
          }
        },
      });
    });
  }

  destroyRaccoonFeedback() {
    this.activeFeedbackRaccoon?.destroy();
    this.activeFeedbackEmote?.destroy();

    this.activeFeedbackRaccoon = null;
    this.activeFeedbackEmote = null;

    if (!this.raccoonSpots) return;

    this.raccoonSpots.forEach((entry) => {
      entry?.raccoon?.destroy();
      entry?.emote?.destroy();
    });

    this.raccoonSpots.clear();
  }

  createConfettiSystem() {
    this.trashConfettiKeys = [
      "trashConfettiPaper",
      "trashConfettiYellow",
      "trashConfettiSoda",
      "trashConfettiBlue",
      "trashConfettiPaper2",
      "trashConfettiRock",
      "trashConfettiOrange",
      "trashConfettiOrangePeel",
      "trashConfettiApple",
      "trashConfettiStone",
      "trashConfettiGreen",
      "trashConfettiWater",
      "trashConfettiCap",
      "trashConfettiPop",
      "trashConfettiBanana",
      "trashConfettiLeaf",
      "trashConfettiCardboard",
      "trashConfettiPart",
      "trashConfettiFishBone",
      "trashConfettiPurple",
    ].filter((key) => this.textures.exists(key));

    if (this.trashConfettiKeys.length === 0) {
      console.warn(
        `[${this.scene.key}] No trash confetti textures loaded. Check Preloader file names and /public/confetti paths.`
      );
    }
  }

  popTrashCanConfetti(trashCan) {
    if (!trashCan) return;

    if (
      !Array.isArray(this.trashConfettiKeys) ||
      this.trashConfettiKeys.length === 0
    ) {
      this.createConfettiSystem();
    }

    const keys = this.trashConfettiKeys || [];
    if (keys.length === 0) return;

    const startX = trashCan.x;
    const startY = trashCan.y - 25;

    for (let i = 0; i < 24; i += 1) {
      const key = Phaser.Utils.Array.GetRandom(keys);

      const piece = this.add
        .image(startX, startY, key)
        .setScale(Phaser.Math.FloatBetween(0.16, 0.34))
        .setDepth(2000)
        .setAlpha(1);

      const flyX = startX + Phaser.Math.Between(-190, 190);
      const flyY = startY + Phaser.Math.Between(-210, -70);

      this.tweens.add({
        targets: piece,
        x: flyX,
        y: flyY,
        angle: Phaser.Math.Between(-420, 420),
        duration: Phaser.Math.Between(320, 520),
        ease: "Quad.easeOut",
        onComplete: () => {
          this.tweens.add({
            targets: piece,
            y: piece.y + Phaser.Math.Between(90, 190),
            x: piece.x + Phaser.Math.Between(-35, 35),
            angle: piece.angle + Phaser.Math.Between(-260, 260),
            alpha: 0,
            duration: Phaser.Math.Between(520, 820),
            ease: "Quad.easeIn",
            onComplete: () => piece.destroy(),
          });
        },
      });
    }

    const glow = this.add
      .circle(startX, startY, 34, 0xfff0a8, 0.35)
      .setDepth(1999);

    this.tweens.add({
      targets: glow,
      scaleX: 2.1,
      scaleY: 2.1,
      alpha: 0,
      duration: 220,
      ease: "Quad.easeOut",
      onComplete: () => glow.destroy(),
    });
  }

  destroyConfettiEmitter() {
    this.confettiEmitter = null;
    this.trashConfettiKeys = [];
  }

  cleanupLiveAssignmentSync() {
    if (typeof this.unsubscribeLiveProblems === "function") {
      try {
        this.unsubscribeLiveProblems();
      } catch (error) {
        console.error("Error cleaning up live assignment sync:", error);
      }
    }

    this.unsubscribeLiveProblems = null;
  }

  startBackgroundMusic() {
    if (!this.cache.audio.exists("gameMusic")) return;

    this.gameMusicVolume = this.gameMusicVolume ?? 0.025;
    this.gameMusicDuckedVolume = this.gameMusicDuckedVolume ?? 0.012;
    this.correctSfxVolume = this.correctSfxVolume ?? 0.25;
    this.wrongSfxVolume = this.wrongSfxVolume ?? 0.22;

    const existing = this.sound.get("gameMusic");

    if (existing && existing.isPlaying) {
      this.bgMusic = existing;
      this.bgMusic.setVolume(this.gameMusicVolume);
      return;
    }

    this.bgMusic = this.sound.add("gameMusic", {
      loop: true,
      volume: this.gameMusicVolume,
    });

    this.bgMusic.play();
  }

  duckBackgroundMusic() {
    if (!this.bgMusic || !this.bgMusic.isPlaying) return;

    const normalVolume = this.gameMusicVolume ?? 0.025;
    const duckedVolume = this.gameMusicDuckedVolume ?? 0.012;

    this.tweens.killTweensOf(this.bgMusic);

    this.tweens.add({
      targets: this.bgMusic,
      volume: duckedVolume,
      duration: 120,
      ease: "Sine.easeOut",
      onComplete: () => {
        this.tweens.add({
          targets: this.bgMusic,
          volume: normalVolume,
          duration: 280,
          delay: 120,
          ease: "Sine.easeOut",
        });
      },
    });
  }

  fadeOutBackgroundMusic() {
    if (!this.bgMusic || !this.bgMusic.isPlaying) return;

    this.tweens.killTweensOf(this.bgMusic);

    this.tweens.add({
      targets: this.bgMusic,
      volume: 0,
      duration: 500,
      ease: "Sine.easeOut",
      onComplete: () => {
        if (this.bgMusic && this.bgMusic.isPlaying) {
          this.bgMusic.stop();
        }

        this.bgMusic = null;
      },
    });
  }

  cleanupSceneAudio() {
    if (!this.bgMusic) return;

    try {
      if (this.bgMusic.isPlaying) {
        this.bgMusic.stop();
      }
    } catch (error) {
      console.error("Error stopping background music:", error);
    }

    this.bgMusic = null;
  }

  playFeedbackSound(isCorrect) {
    const key = isCorrect ? this.correctSoundKey : this.wrongSoundKey;

    if (!key) return;
    if (!this.cache.audio.exists(key)) return;

    this.duckBackgroundMusic();

    this.sound.play(key, {
      volume: isCorrect
        ? this.correctSfxVolume ?? 0.25
        : this.wrongSfxVolume ?? 0.22,
    });
  }

  showCenteredFeedback(message, isCorrect) {
    this.feedbackContainer?.destroy();
    this.correct = null;
    this.wrongText = null;

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height * 0.15;
    const textColor = isCorrect ? "#ffefc8" : "#ffd6df";

    const shadowText = this.add
      .text(3, 3, message, {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "42px",
        color: "#2f1b10",
        stroke: "#2f1b10",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5)
      .setAlpha(0.28);

    const text = this.add
      .text(0, 0, message, {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "42px",
        color: textColor,
        stroke: "#5a3e1b",
        strokeThickness: 3,
        align: "center",
      })
      .setOrigin(0.5);

    this.feedbackContainer = this.add.container(centerX, centerY, [
      shadowText,
      text,
    ]);

    this.feedbackContainer.setDepth(100);
    this.feedbackContainer.setScrollFactor(0);
    this.feedbackContainer.setAlpha(0);

    this.tweens.add({
      targets: this.feedbackContainer,
      alpha: { from: 0, to: 1 },
      y: centerY - 8,
      duration: 180,
      ease: "Sine.easeOut",
    });

    this.tweens.add({
      targets: this.feedbackContainer,
      y: centerY - 14,
      duration: this.feedbackDuration,
      ease: "Sine.easeOut",
    });

    if (isCorrect) {
      this.createCorrectSparkles(centerX, centerY);
    }
  }

  createCorrectSparkles(x, y) {
    const sparkleChars = ["✦", "✧", "•", "⋆"];

    for (let i = 0; i < 6; i += 1) {
      const sparkle = this.add
        .text(
          x + Phaser.Math.Between(-38, 38),
          y + Phaser.Math.Between(-12, 12),
          Phaser.Utils.Array.GetRandom(sparkleChars),
          {
            fontFamily: "'Fjalla One', sans-serif",
            fontSize: `${Phaser.Math.Between(16, 24)}px`,
            color: "#fff1bf",
            stroke: "#7a5426",
            strokeThickness: 2,
          }
        )
        .setOrigin(0.5)
        .setDepth(99)
        .setAlpha(0.95)
        .setScrollFactor(0);

      this.tweens.add({
        targets: sparkle,
        x: sparkle.x + Phaser.Math.Between(-30, 30),
        y: sparkle.y + Phaser.Math.Between(-28, -52),
        alpha: 0,
        scale: 0.6,
        duration: 650,
        ease: "Quad.easeOut",
        onComplete: () => sparkle.destroy(),
      });
    }
  }

  clearCenteredFeedback() {
    this.feedbackContainer?.destroy();
    this.feedbackContainer = null;
    this.correct = null;
    this.wrongText = null;
  }

  onCorrect() {
    this.clearCenteredFeedback();
  }

  isPerfectRun() {
    if (!Array.isArray(this.numGuessesPerAnswer)) return false;

    return (
      Number(this.numWrong || 0) === 0 &&
      this.numGuessesPerAnswer.every(
        (entry) => Number(entry?.numGuess || 0) === 0
      )
    );
  }

  getCelebrationMessage() {
    return this.isPerfectRun() ? "Perfect run!" : "";
  }

  getFinishSubtitle(coinsEarned) {
    if (this.isPerfectRun()) {
      return `${coinsEarned} coins earned\nNo wrong guesses`;
    }

    return `${coinsEarned} coins earned`;
  }

  async fetchGameDescription() {
    try {
      const q = query(
        collection(db, "assignments"),
        where("gameKey", "==", this.gameKey),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();

        return (
          data?.description ||
          `Get ready for ${this.assignmentTitle}. Have fun playing the game!`
        );
      }
    } catch (error) {
      console.error("Could not load game description:", error);
    }

    return `Get ready for ${this.assignmentTitle}. Have fun playing the game!`;
  }

  async showGameIntroOverlay() {
    if (this._introShown) return;

    this._introShown = true;
    this.introActive = true;

    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    const dimmer = this.add
      .rectangle(0, 0, width, height, 0x071017, 0.62)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(900)
      .setInteractive();

    const cardWidth = Math.min(900, width * 0.84);
    const cardHeight = 350;
    const cardX = centerX - cardWidth / 2;
    const cardY = centerY - cardHeight / 2;

    const cardShadow = this.add.graphics().setDepth(902).setScrollFactor(0);
    cardShadow.fillStyle(0x000000, 0.28);
    cardShadow.fillRoundedRect(
      cardX + 10,
      cardY + 14,
      cardWidth,
      cardHeight,
      40
    );

    const cardBg = this.add.graphics().setDepth(903).setScrollFactor(0);
    cardBg.fillStyle(0xf7ecd8, 0.985);
    cardBg.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 40);
    cardBg.lineStyle(8, 0xe4a03b, 1);
    cardBg.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 40);

    const title = this.add
      .text(centerX, cardY + 56, this.assignmentTitle || "Game Time!", {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "42px",
        color: "#6b3c17",
        align: "center",
      })
      .setPadding(0, 4, 0, 12)
      .setOrigin(0.5)
      .setDepth(905)
      .setScrollFactor(0);

    const subtitle = this.add
      .text(centerX, cardY + 100, "Read this first, then have fun playing!", {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "21px",
        color: "#b56a20",
        align: "center",
      })
      .setPadding(0, 2, 0, 10)
      .setOrigin(0.5)
      .setDepth(905)
      .setScrollFactor(0);

    const descriptionText = this.add
      .text(centerX, cardY + 150, "Loading instructions...", {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "24px",
        color: "#3f2b1d",
        align: "center",
        wordWrap: { width: cardWidth - 160, useAdvancedWrap: true },
        lineSpacing: 10,
      })
      .setPadding(0, 4, 0, 12)
      .setOrigin(0.5)
      .setDepth(905)
      .setScrollFactor(0);

    const footerLine = this.add
      .text(centerX, cardY + 224, "Have fun playing the game!", {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "27px",
        color: "#5f3818",
        align: "center",
      })
      .setPadding(0, 4, 0, 12)
      .setOrigin(0.5)
      .setDepth(905)
      .setScrollFactor(0);

    const buttonWidth = 320;
    const buttonHeight = 80;
    const buttonX = centerX - buttonWidth / 2;
    const buttonY = cardY + cardHeight - 84;

    const buttonShadow = this.add.graphics().setDepth(907).setScrollFactor(0);
    const buttonBg = this.add.graphics().setDepth(908).setScrollFactor(0);

    const drawButton = (hover = false) => {
      buttonShadow.clear();
      buttonBg.clear();

      buttonShadow.fillStyle(0x000000, 0.24);
      buttonShadow.fillRoundedRect(
        buttonX + 4,
        buttonY + 7,
        buttonWidth,
        buttonHeight,
        30
      );

      const topLeft = hover ? 0xffb35b : 0xffa04f;
      const topRight = hover ? 0xffd86c : 0xffcb6b;
      const bottomLeft = hover ? 0x4fdc87 : 0x39c774;
      const bottomRight = hover ? 0x38c0ff : 0x2ea5ff;

      buttonBg.fillGradientStyle(topLeft, topRight, bottomLeft, bottomRight, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 30);
      buttonBg.lineStyle(5, 0xfff9ef, 0.98);
      buttonBg.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 30);
    };

    drawButton(false);

    const buttonText = this.add
      .text(centerX, buttonY + buttonHeight / 2, "LET’S PLAY!", {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "34px",
        color: "#fffdf9",
        stroke: "#794217",
        strokeThickness: 4,
        align: "center",
      })
      .setPadding(0, 4, 0, 12)
      .setOrigin(0.5)
      .setDepth(909)
      .setScrollFactor(0);

    const buttonHit = this.add
      .zone(centerX, buttonY + buttonHeight / 2, buttonWidth, buttonHeight)
      .setDepth(910)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    const pieces = [
      dimmer,
      cardShadow,
      cardBg,
      title,
      subtitle,
      descriptionText,
      footerLine,
      buttonShadow,
      buttonBg,
      buttonText,
      buttonHit,
    ];

    this.introOverlay = this.add.container(0, -height, pieces);
    this.introOverlay.setDepth(900);

    this.tweens.add({
      targets: this.introOverlay,
      y: 0,
      duration: 760,
      ease: "Back.easeOut",
    });

    buttonHit.on("pointerover", () => {
      drawButton(true);
      this.tweens.add({
        targets: buttonText,
        scale: 1.07,
        duration: 120,
      });
    });

    buttonHit.on("pointerout", () => {
      drawButton(false);
      this.tweens.add({
        targets: buttonText,
        scale: 1,
        duration: 120,
      });
    });

    buttonHit.on("pointerdown", () => {
      this.closeGameIntroOverlay();
    });

    const description = await this.fetchGameDescription();
    if (descriptionText?.active) {
      descriptionText.setText(description);
    }
  }

  closeGameIntroOverlay() {
    if (!this.introOverlay) {
      this.introActive = false;
      return;
    }

    const overlay = this.introOverlay;
    this.introOverlay = null;

    this.tweens.add({
      targets: overlay,
      y: -this.scale.height,
      alpha: 0,
      duration: 420,
      ease: "Cubic.easeIn",
      onComplete: () => {
        overlay.destroy(true);
        this.introActive = false;
      },
    });
  }

  createCampgroundBackground(textureKey = null) {
    const backgroundOptions = [
      "campClover",
      "campLeaf",
      "campRock",
      "dirtClover",
      "dirtLeaf",
      "dirtLef",
      "dirtMushroom",
    ];

    const chosenTexture =
      textureKey || Phaser.Utils.Array.GetRandom(backgroundOptions);

    const width = this.scale.width;
    const height = this.scale.height;

    const bg = this.add
      .tileSprite(0, 0, width, height, chosenTexture)
      .setOrigin(0)
      .setDepth(-100);

    bg.setTileScale(2, 2);

    const resize = (gameSize) => {
      bg.setSize(gameSize.width, gameSize.height);
    };

    this.scale.on("resize", resize);

    return bg;
  }

  async onFinish() {
    let coinsEarned = 0;
    const perfectRun = this.isPerfectRun();

    try {
      if (typeof this.saveResults !== "function") {
        throw new Error(
          `[${this.scene.key}] saveResults is missing. Make sure this scene calls initSharedGameConfig(...).`
        );
      }

      const rewardResult = await this.saveResults();

      console.log("rewardResult:", rewardResult);

      coinsEarned =
        rewardResult?.coinReward ??
        rewardResult?.coinsEarned ??
        rewardResult?.reward ??
        0;
    } catch (error) {
      console.error("Save failed:", error);
    }

    this.fadeOutBackgroundMusic();

    showFinishScreen(this, {
      title: perfectRun ? "Perfect Run!" : "Congratulations!",
      subtitle: this.getFinishSubtitle(coinsEarned),
      isPerfectRun: perfectRun,
      topY: 138,
      subtitleY: 210,
      lineStartY: perfectRun ? 308 : 286,
      lineGap: 46,
      formatLine: (trash, guessCount) =>
        `${trash.question} → wrong tries: ${guessCount}`,
    });

    this.time.delayedCall(300, () => {
      if (window.onPhaserGameFinished) {
        window.onPhaserGameFinished();
      }
    });
  }
}