export function showFinishScreen(scene, options = {}) {
  const {
    title = "Congratulations! You Finished!",
    subtitle = "",
    topY = 100,
    subtitleY = 170,
    lineStartY = 260,
    lineGap = 60,
    titleSize = "60px",
    subtitleSize = "42px",
    lineSize = "40px",
    color = "#ffffff",
    subtitleColor = "#ffe08a",
    formatLine,
  } = options;

  const centerX = 1536 / 2;

  if (scene.endGame) scene.endGame.destroy();
  if (scene.endGameSubtitle) scene.endGameSubtitle.destroy();

  if (scene.finishTexts && Array.isArray(scene.finishTexts)) {
    scene.finishTexts.forEach((textObj) => {
      if (textObj) textObj.destroy();
    });
  }

  scene.finishTexts = [];

  if (scene.correct && scene.correct.destroy) scene.correct.destroy();
  if (scene.wrongText && scene.wrongText.destroy) scene.wrongText.destroy();

  scene.endGame = scene.add
    .text(centerX, topY, title, {
      fontSize: titleSize,
      fill: color,
      align: "center",
    })
    .setOrigin(0.5, 0)
    .setDepth(1000);

  if (subtitle) {
    scene.endGameSubtitle = scene.add
      .text(centerX, subtitleY, subtitle, {
        fontSize: subtitleSize,
        fill: subtitleColor,
        align: "center",
      })
      .setOrigin(0.5, 0)
      .setDepth(1000);
  }

  const trashes = [
    scene.trash1,
    scene.trash2,
    scene.trash3,
    scene.trash4,
    scene.trash5,
  ].filter(Boolean);

  scene.finishTexts = trashes.map((trash, index) => {
    const guessCount = scene.numGuessesPerAnswer?.[index]?.numGuess ?? 0;

    const lineText = formatLine
      ? formatLine(trash, guessCount, index)
      : `Wrong guesses for ${trash.question} = ${trash.answer}: ${guessCount}`;

    return scene.add
      .text(centerX, lineStartY + index * lineGap, lineText, {
        fontSize: lineSize,
        fill: color,
        align: "center",
      })
      .setOrigin(0.5, 0)
      .setDepth(1000);
  });

  if (window.onPhaserGameFinished) {
    window.onPhaserGameFinished();
  }
}