import Phaser from "phaser";

export function showFinishScreen(scene, options = {}) {
  const {
    title = "Congratulations!",
    subtitle = "",
    isPerfectRun = false,
    topY = 138,
    subtitleY = 210,
    lineStartY = 340,
    lineGap = 52,
    titleSize = "64px",
    subtitleSize = "30px",
    lineSize = "26px",
    color = "#ffe7b4",
    subtitleColor = "#6b3c17",
    formatLine,
  } = options;

  const width = scene.scale?.width || 1536;
  const height = scene.scale?.height || 793;
  const centerX = width / 2;

  const coinTextureKey = "xsmallRaccacoin";
  const coinPath = "/ui-assets/xsmallRaccacoin.png";

  if (subtitle && !scene.textures.exists(coinTextureKey)) {
    scene.load.image(coinTextureKey, coinPath);

    scene.load.once("complete", () => {
      showFinishScreen(scene, options);
    });

    scene.load.start();
    return;
  }

  if (scene.endGame) scene.endGame.destroy();
  if (scene.endGameSubtitle) scene.endGameSubtitle.destroy();

  if (scene.finishTexts && Array.isArray(scene.finishTexts)) {
    scene.finishTexts.forEach((textObj) => {
      if (textObj) textObj.destroy();
    });
  }

  if (scene.finishOverlay && scene.finishOverlay.destroy) {
    scene.finishOverlay.destroy(true);
  }

  scene.finishTexts = [];

  if (scene.correct?.destroy) scene.correct.destroy();
  if (scene.wrongText?.destroy) scene.wrongText.destroy();

  const trackedAnswers =
    Array.isArray(scene.numGuessesPerAnswer) && scene.numGuessesPerAnswer.length
      ? scene.numGuessesPerAnswer
      : [];

  const trashes =
    Array.isArray(scene.trashItems) && scene.trashItems.length
      ? scene.trashItems
      : [
          scene.trash1,
          scene.trash2,
          scene.trash3,
          scene.trash4,
          scene.trash5,
        ].filter(Boolean);

  const lineTexts = trackedAnswers.length
    ? trackedAnswers.map((entry, index) => {
        const trash = entry.guessedAnswer || trashes[index];
        const guessCount = entry.numGuess ?? 0;

        return formatLine
          ? formatLine(trash, guessCount, index)
          : guessCount === 0
            ? `✓ ${trash?.question ?? trash?.problemData?.question ?? "Problem"} = ${
                trash?.answer ?? trash?.problemData?.answer ?? ""
              }`
            : `Wrong guesses for ${
                trash?.question ?? trash?.problemData?.question ?? "Problem"
              } = ${trash?.answer ?? trash?.problemData?.answer ?? ""}: ${guessCount}`;
      })
    : trashes.map((trash, index) => {
        const guessCount = scene.numGuessesPerAnswer?.[index]?.numGuess ?? 0;

        return formatLine
          ? formatLine(trash, guessCount, index)
          : guessCount === 0
            ? `✓ ${trash?.question ?? trash?.problemData?.question ?? "Problem"} = ${
                trash?.answer ?? trash?.problemData?.answer ?? ""
              }`
            : `Wrong guesses for ${
                trash?.question ?? trash?.problemData?.question ?? "Problem"
              } = ${trash?.answer ?? trash?.problemData?.answer ?? ""}: ${guessCount}`;
      });

  const cardWidth = Math.min(900, width * 0.8);
  const lineAreaHeight = Math.max(120, lineTexts.length * lineGap);
  const cardHeight = 330 + lineAreaHeight;
  const cardX = centerX - cardWidth / 2;
  const cardY = 150;

  const overlay = scene.add.container(0, 0).setDepth(1000);
  scene.finishOverlay = overlay;

  const dimmer = scene.add
    .rectangle(0, 0, width, height, 0x071017, 0.78)
    .setOrigin(0);

  const glow = scene.add.ellipse(
    centerX,
    cardY + cardHeight / 2,
    width * 0.7,
    height * 0.52,
    0xffc96f,
    0.16
  );

  const sideGlowLeft = scene.add.ellipse(
    centerX - 220,
    cardY + cardHeight * 0.65,
    190,
    135,
    0xff9f43,
    0.09
  );

  const sideGlowRight = scene.add.ellipse(
    centerX + 220,
    cardY + cardHeight * 0.35,
    170,
    125,
    0xffd977,
    0.08
  );

  const cardShadow = scene.add.graphics();
  cardShadow.fillStyle(0x000000, 0.32);
  cardShadow.fillRoundedRect(cardX + 10, cardY + 14, cardWidth, cardHeight, 36);

  const cardBg = scene.add.graphics();
  cardBg.fillStyle(0xf7ecd8, 0.99);
  cardBg.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 36);
  cardBg.lineStyle(8, 0xe4a03b, 1);
  cardBg.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 36);

  const innerBorder = scene.add.graphics();
  innerBorder.lineStyle(3, 0xc08d58, 0.82);
  innerBorder.strokeRoundedRect(
    cardX + 16,
    cardY + 16,
    cardWidth - 32,
    cardHeight - 32,
    24
  );

  const topGlow = scene.add.ellipse(
    centerX,
    cardY + 22,
    cardWidth * 0.72,
    56,
    0xfff1c7,
    0.34
  );

  const sparkleLeft = scene.add
    .text(cardX + 46, cardY + 42, "✦", {
      fontFamily: "'Fjalla One', sans-serif",
      fontSize: "26px",
      color: "#ffd86c",
      stroke: "#a46a1e",
      strokeThickness: 2,
    })
    .setOrigin(0.5);

  const sparkleRight = scene.add
    .text(cardX + cardWidth - 46, cardY + 46, "✧", {
      fontFamily: "'Fjalla One', sans-serif",
      fontSize: "24px",
      color: "#ffe9a8",
      stroke: "#a46a1e",
      strokeThickness: 2,
    })
    .setOrigin(0.5);

  const perfectRunGlow = isPerfectRun
    ? scene.add.ellipse(centerX, topY + 32, 460, 110, 0xffe58a, 0.28)
    : null;

  const titleText = scene.add
    .text(centerX, topY, title, {
      fontFamily: "'Fjalla One', sans-serif",
      fontSize: titleSize,
      color: isPerfectRun ? "#fff3a3" : color,
      stroke: "#5a3e1b",
      strokeThickness: 6,
      align: "center",
    })
    .setPadding(0, 4, 0, 12)
    .setOrigin(0.5, 0)
    .setAlpha(0);

  let coinOuterGlow = null;
  let coinInnerGlow = null;
  let coinImage = null;
  let subtitleText = null;
  let subtitleLineTwoText = null;

  if (subtitle) {
    const subtitleLines = String(subtitle)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const firstLine = subtitleLines[0] || "";
    const secondLine = subtitleLines[1] || "";

    const coinSize = 42;
    const coinGap = 16;
    const rowY = subtitleY + 28;

    subtitleText = scene.add
      .text(0, rowY, firstLine, {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: subtitleSize,
        color: "#7a3f16",
        stroke: "#fff3d8",
        strokeThickness: 4,
        shadow: {
          offsetX: 0,
          offsetY: 3,
          color: "rgba(0,0,0,0.22)",
          blur: 6,
          fill: true,
        },
        align: "left",
      })
      .setPadding(0, 4, 0, 8)
      .setOrigin(0, 0.5)
      .setAlpha(0);

    const subtitleWidth = subtitleText.width || 0;
    const rowWidth = coinSize + coinGap + subtitleWidth;
    const rowLeft = centerX - rowWidth / 2;
    const coinX = rowLeft + coinSize / 2;
    const textX = rowLeft + coinSize + coinGap;

    coinOuterGlow = scene.add
      .ellipse(coinX, rowY, 78, 78, 0xffc35a, 0.18)
      .setAlpha(0);

    coinInnerGlow = scene.add
      .ellipse(coinX, rowY, 54, 54, 0xfff0a8, 0.18)
      .setAlpha(0);

    coinImage = scene.add.image(coinX, rowY, coinTextureKey);
    coinImage.setDepth(1001).setAlpha(0);

    if (coinImage.texture?.setFilter) {
      coinImage.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }

    const textureWidth =
      coinImage.texture?.source?.[0]?.width || coinImage.width || 32;

    const finalScale = coinSize / textureWidth;

    coinImage.setScale(finalScale);
    coinImage.setTint(0xfff4c4);

    subtitleText.setPosition(textX, rowY + 1);

    if (secondLine) {
      subtitleLineTwoText = scene.add
        .text(centerX, rowY + 38, secondLine, {
          fontFamily: "'Fjalla One', sans-serif",
          fontSize: "32px",
          color: subtitleColor,
          align: "center",
        })
        .setPadding(0, 2, 0, 6)
        .setOrigin(0.5, 0)
        .setAlpha(0);
    }
  }

  scene.finishTexts = lineTexts.map((lineText, index) => {
    const guessCount =
      trackedAnswers[index]?.numGuess ??
      scene.numGuessesPerAnswer?.[index]?.numGuess ??
      0;

    const lineColor = guessCount === 0 ? "#4f8f2f" : "#b24a35";

    return scene.add
      .text(centerX, lineStartY + index * lineGap, lineText, {
        fontFamily: "'Fjalla One', sans-serif",
        fontSize: lineSize,
        color: lineColor,
        stroke: guessCount === 0 ? "#eaffd5" : "#ffe0d5",
        strokeThickness: 2,
        align: "center",
      })
      .setPadding(0, 2, 0, 8)
      .setOrigin(0.5, 0)
      .setAlpha(0);
  });

  const buttonWidth = 340;
  const buttonHeight = 86;
  const buttonX = centerX - buttonWidth / 2;
  const buttonY = cardY + cardHeight - 116;

  const buttonGlow = scene.add.ellipse(
    centerX,
    buttonY + buttonHeight / 2,
    buttonWidth + 96,
    buttonHeight + 44,
    0xa8e6ff,
    0.24
  );

  const buttonShadow = scene.add.graphics();
  const buttonBg = scene.add.graphics();

  const drawButton = (hover = false) => {
    buttonShadow.clear();
    buttonBg.clear();

    buttonShadow.fillStyle(0x000000, 0.18);
    buttonShadow.fillRoundedRect(
      buttonX + 4,
      buttonY + 7,
      buttonWidth,
      buttonHeight,
      30
    );

    const topLeft = hover ? 0xffd27a : 0xffbf67;
    const topRight = hover ? 0x95e5ff : 0x6fd2ff;
    const bottomLeft = hover ? 0xa2f7e5 : 0x7debd2;
    const bottomRight = hover ? 0xcaa4ff : 0xad82ff;

    buttonBg.fillGradientStyle(topLeft, topRight, bottomLeft, bottomRight, 1);
    buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 30);
    buttonBg.lineStyle(5, 0xfffbf4, 0.99);
    buttonBg.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 30);

    buttonBg.lineStyle(2, 0xffffff, 0.34);
    buttonBg.strokeRoundedRect(
      buttonX + 8,
      buttonY + 8,
      buttonWidth - 16,
      buttonHeight - 16,
      22
    );
  };

  drawButton(false);

  const buttonText = scene.add
    .text(centerX, buttonY + buttonHeight / 2, "RETURN TO GAMES", {
      fontFamily: "'Fjalla One', sans-serif",
      fontSize: "31px",
      color: "#fffdf9",
      stroke: "#6d3f76",
      strokeThickness: 4,
      align: "center",
    })
    .setPadding(0, 4, 0, 12)
    .setOrigin(0.5)
    .setAlpha(0);

  const buttonHit = scene.add
    .zone(centerX, buttonY + buttonHeight / 2, buttonWidth, buttonHeight)
    .setInteractive({ useHandCursor: true });

  overlay.add([
    dimmer,
    glow,
    sideGlowLeft,
    sideGlowRight,
    cardShadow,
    cardBg,
    innerBorder,
    topGlow,
    sparkleLeft,
    sparkleRight,
  ]);

  if (perfectRunGlow) overlay.add(perfectRunGlow);
  overlay.add(titleText);

  if (coinOuterGlow) overlay.add(coinOuterGlow);
  if (coinInnerGlow) overlay.add(coinInnerGlow);
  if (coinImage) overlay.add(coinImage);
  if (subtitleText) overlay.add(subtitleText);
  if (subtitleLineTwoText) overlay.add(subtitleLineTwoText);

  scene.finishTexts.forEach((textObj) => overlay.add(textObj));

  overlay.add([buttonGlow, buttonShadow, buttonBg, buttonText, buttonHit]);
  overlay.setAlpha(0);

  scene.tweens.add({
    targets: overlay,
    alpha: 1,
    duration: 220,
    ease: "Sine.easeOut",
  });

  scene.tweens.add({
    targets: titleText,
    y: titleText.y - 8,
    alpha: 1,
    duration: 420,
    ease: "Back.easeOut",
  });

  if (isPerfectRun) {
    scene.tweens.add({
      targets: titleText,
      scaleX: { from: 1, to: 1.06 },
      scaleY: { from: 1, to: 1.06 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    if (perfectRunGlow) {
      scene.tweens.add({
        targets: perfectRunGlow,
        alpha: { from: 0.18, to: 0.36 },
        scaleX: 1.08,
        scaleY: 1.14,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  if (coinOuterGlow) {
    scene.tweens.add({
      targets: coinOuterGlow,
      alpha: { from: 0.1, to: 0.22 },
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  if (coinInnerGlow) {
    scene.tweens.add({
      targets: coinInnerGlow,
      alpha: { from: 0.12, to: 0.24 },
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 760,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  if (coinImage) {
    scene.tweens.add({
      targets: coinImage,
      alpha: 1,
      y: coinImage.y - 2,
      delay: 100,
      duration: 420,
      ease: "Back.easeOut",
    });

    scene.tweens.add({
      targets: coinImage,
      y: coinImage.y - 4,
      duration: 950,
      yoyo: true,
      repeat: -1,
      delay: 580,
      ease: "Sine.easeInOut",
    });
  }

  if (subtitleText) {
    scene.tweens.add({
      targets: subtitleText,
      y: subtitleText.y - 2,
      alpha: 1,
      delay: 120,
      duration: 340,
      ease: "Sine.easeOut",
    });
  }

  if (subtitleLineTwoText) {
    scene.tweens.add({
      targets: subtitleLineTwoText,
      y: subtitleLineTwoText.y - 2,
      alpha: 1,
      delay: 160,
      duration: 340,
      ease: "Sine.easeOut",
    });
  }

  scene.finishTexts.forEach((textObj, index) => {
    scene.tweens.add({
      targets: textObj,
      y: textObj.y - 4,
      alpha: 1,
      delay: 220 + index * 75,
      duration: 240,
      ease: "Sine.easeOut",
    });
  });

  scene.tweens.add({
    targets: [sparkleLeft, sparkleRight],
    y: "-=4",
    alpha: { from: 0.88, to: 1 },
    duration: 1200,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  buttonHit.on("pointerover", () => {
    drawButton(true);
  });

  buttonHit.on("pointerout", () => {
    drawButton(false);
  });

  scene.tweens.add({
    targets: buttonText,
    alpha: 1,
    y: buttonText.y - 4,
    delay: 520,
    duration: 260,
    ease: "Sine.easeOut",
  });

  scene.tweens.add({
    targets: buttonGlow,
    alpha: { from: 0.22, to: 0.34 },
    duration: 1200,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  buttonHit.on("pointerdown", () => {
    buttonHit.disableInteractive();

    scene.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: 180,
      ease: "Sine.easeIn",
      onComplete: () => {
        overlay.destroy(true);
        scene.finishOverlay = null;

        if (window.onPhaserReturnToGames) {
          window.onPhaserReturnToGames();
        }
      },
    });
  });
}