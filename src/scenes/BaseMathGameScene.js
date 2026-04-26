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
  }

  init(data) {
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
      data?.studentId ||
      this.registry.get("studentId") ||
      ""
    ).trim();

    this.classId = String(
      data?.classId ||
      this.registry.get("classId") ||
      ""
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
      normalizedAssigned.length > 0
        ? normalizedAssigned
        : normalizedFallback;

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

    this.registry.set("studentId", this.studentId || "");
    this.registry.set("classId", this.classId || "");
    this.registry.set("gameKey", this.gameKey || "");
    this.registry.set("assignmentTitle", this.assignmentTitle || "");
    this.registry.set("assignedProblems", this.assignedProblems || []);

    this.startBackgroundMusic();

    this.events.once("shutdown", () => {
      this.cleanupSceneAudio();
      this.cleanupLiveAssignmentSync();
    });

    this.events.once("destroy", () => {
      this.cleanupSceneAudio();
      this.cleanupLiveAssignmentSync();
    });

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
        throw new Error(
          `[${this.scene.key}] save blocked: missing studentId`
        );
      }

      if (!payload.gameKey) {
        throw new Error(
          `[${this.scene.key}] save blocked: missing gameKey`
        );
      }

      const result = await saveAssignmentResult(payload);
      console.log("✅ saveAssignmentResult result", result);
      return result;
    };

    this.time.delayedCall(0, () => {
      this.showGameIntroOverlay();
    });
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

  pickUniqueProblemsByAnswer(problemPool, count = 5) {
    const shuffled = Phaser.Utils.Array.Shuffle([...(problemPool || [])]);
    const selected = [];
    const usedAnswers = new Set();

    for (const problem of shuffled) {
      const answerKey = String(problem?.answer);
      if (usedAnswers.has(answerKey)) continue;

      usedAnswers.add(answerKey);
      selected.push(problem);

      if (selected.length === count) break;
    }

    if (selected.length < count) {
      throw new Error(
        `[${this.scene.key}] Not enough unique-answer problems to choose ${count}.`
      );
    }

    return selected;
  }

  assignFiveQuestionAndAnswerSlots(problemPool) {
    const selectedProblems = this.pickUniqueProblemsByAnswer(problemPool, 5);
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

  startBackgroundMusic() {
    if (!this.cache.audio.exists("gameMusic")) return;

    const existing = this.sound.get("gameMusic");
    if (existing && existing.isPlaying) {
      this.bgMusic = existing;
      if (typeof this.bgMusic.volume === "number") {
        this.bgMusic.setVolume(0.06);
      }
      return;
    }

    this.bgMusic = this.sound.add("gameMusic", {
      loop: true,
      volume: 0.06,
    });

    this.bgMusic.play();
  }

  duckBackgroundMusic() {
    if (!this.bgMusic || !this.bgMusic.isPlaying) return;

    this.tweens.killTweensOf(this.bgMusic);

    this.tweens.add({
      targets: this.bgMusic,
      volume: 0.03,
      duration: 120,
      ease: "Sine.easeOut",
      onComplete: () => {
        this.tweens.add({
          targets: this.bgMusic,
          volume: 0.06,
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
    if (this.bgMusic) {
      try {
        if (this.bgMusic.isPlaying) {
          this.bgMusic.stop();
        }
      } catch (error) {
        console.error("Error stopping background music:", error);
      }
      this.bgMusic = null;
    }
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

  playFeedbackSound(isCorrect) {
    const key = isCorrect ? this.correctSoundKey : this.wrongSoundKey;

    if (!key) return;
    if (!this.cache.audio.exists(key)) return;

    this.duckBackgroundMusic();

    this.sound.play(key, {
      volume: isCorrect ? 0.45 : 0.4,
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

    for (let i = 0; i < 6; i++) {
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

    const fireGlow = this.add
      .ellipse(centerX, centerY - 15, width * 0.78, height * 0.62, 0xffc86b, 0.11)
      .setDepth(901)
      .setScrollFactor(0);

    const emberGlowLeft = this.add
      .ellipse(centerX - 190, centerY + 20, 180, 140, 0xff9f43, 0.07)
      .setDepth(901)
      .setScrollFactor(0);

    const emberGlowRight = this.add
      .ellipse(centerX + 215, centerY - 35, 150, 120, 0xffd977, 0.06)
      .setDepth(901)
      .setScrollFactor(0);

    const cardWidth = Math.min(900, width * 0.84);
    const cardHeight = 350;
    const cardX = centerX - cardWidth / 2;
    const cardY = centerY - cardHeight / 2;

    const cardShadow = this.add.graphics().setDepth(902).setScrollFactor(0);
    cardShadow.fillStyle(0x000000, 0.28);
    cardShadow.fillRoundedRect(cardX + 10, cardY + 14, cardWidth, cardHeight, 40);

    const cardBg = this.add.graphics().setDepth(903).setScrollFactor(0);
    cardBg.fillStyle(0xf7ecd8, 0.985);
    cardBg.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 40);
    cardBg.lineStyle(8, 0xe4a03b, 1);
    cardBg.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 40);

    const stitchedBorder = this.add.graphics().setDepth(904).setScrollFactor(0);
    stitchedBorder.lineStyle(3, 0xc08d58, 0.72);
    stitchedBorder.strokeRoundedRect(
      cardX + 18,
      cardY + 18,
      cardWidth - 36,
      cardHeight - 36,
      28
    );

    const topWarmGlow = this.add
      .ellipse(centerX, cardY + 24, cardWidth * 0.72, 52, 0xfff1c7, 0.28)
      .setDepth(904)
      .setScrollFactor(0);

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

    const leftSparkle = this.add
      .text(cardX + 58, cardY + 54, "✦", {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "26px",
        color: "#ffd86c",
        stroke: "#a46a1e",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(906)
      .setScrollFactor(0);

    const rightSparkle = this.add
      .text(cardX + cardWidth - 58, cardY + 58, "✧", {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: "24px",
        color: "#ffe9a8",
        stroke: "#a46a1e",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(906)
      .setScrollFactor(0);

    const leftBadge = this.add
      .circle(cardX + 48, cardY + cardHeight - 42, 11, 0xffb34d, 0.95)
      .setDepth(906)
      .setScrollFactor(0);

    const rightBadge = this.add
      .circle(cardX + cardWidth - 48, cardY + cardHeight - 42, 11, 0xffb34d, 0.95)
      .setDepth(906)
      .setScrollFactor(0);

    const buttonWidth = 320;
    const buttonHeight = 80;
    const buttonX = centerX - buttonWidth / 2;
    const buttonY = cardY + cardHeight - 84;

    const buttonGlow = this.add
      .ellipse(
        centerX,
        buttonY + buttonHeight / 2,
        buttonWidth + 70,
        buttonHeight + 30,
        0xffc96f,
        0.16
      )
      .setDepth(906)
      .setScrollFactor(0);

    const buttonShadow = this.add.graphics().setDepth(907).setScrollFactor(0);
    const buttonBg = this.add.graphics().setDepth(908).setScrollFactor(0);

    const drawButton = (hover = false) => {
      buttonShadow.clear();
      buttonBg.clear();

      buttonShadow.fillStyle(0x000000, 0.24);
      buttonShadow.fillRoundedRect(buttonX + 4, buttonY + 7, buttonWidth, buttonHeight, 30);

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
      fireGlow,
      emberGlowLeft,
      emberGlowRight,
      cardShadow,
      cardBg,
      stitchedBorder,
      topWarmGlow,
      title,
      subtitle,
      descriptionText,
      footerLine,
      leftSparkle,
      rightSparkle,
      leftBadge,
      rightBadge,
      buttonGlow,
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

    this.tweens.add({
      targets: [leftSparkle, rightSparkle],
      y: "-=4",
      alpha: { from: 0.82, to: 1 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: buttonGlow,
      alpha: { from: 0.12, to: 0.22 },
      scaleX: 1.04,
      scaleY: 1.08,
      duration: 950,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: buttonText,
      scale: { from: 1, to: 1.04 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
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
      coinsEarned = rewardResult?.coinReward || 0;
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