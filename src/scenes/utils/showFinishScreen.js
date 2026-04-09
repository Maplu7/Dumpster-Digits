export function showFinishScreen(scene, options = {}) {
  const {
    title = "Congratulations! You Finished!",
    topY = 110,
    lineStartY = 240,
    lineGap = 60,
    titleSize = "60px",
    lineSize = "40px",
    color = "#ffffff",
    formatLine,
  } = options;

  const centerX = 1536 / 2;

  // clear any old finish text if it already exists
  scene.endGame?.destroy();

  if (scene.finishTexts && Array.isArray(scene.finishTexts)) {
    scene.finishTexts.forEach((textObj) => textObj?.destroy());
  }

  scene.finishTexts = [];

  // also clear any leftover feedback text
  scene.correct?.destroy?.();
  scene.wrongText?.destroy?.();

  scene.endGame = scene.add
    .text(centerX, topY, title, {
      fontSize: titleSize,
      fill: color,
      padding: { x: 0, y: 0 },
      backgroundColor: "transparent",
    })
    .setOrigin(0.5, 0)
    .setDepth(1000);

  const trashes = [
    scene.trash1,
    scene.trash2,
    scene.trash3,
    scene.trash4,
    scene.trash5,
  ];

  scene.finishTexts = trashes.map((trash, index) => {
    const guessCount = scene.numGuessesPerAnswer?.[index]?.numGuess ?? 0;

    const lineText = formatLine
      ? formatLine(trash, guessCount, index)
      : `Wrong guesses for ${trash.question} = ${trash.answer}: ${guessCount}`;

    return scene.add
      .text(centerX, lineStartY + index * lineGap, lineText, {
        fontSize: lineSize,
        fill: color,
        padding: { x: 0, y: 0 },
        backgroundColor: "transparent",
      })
      .setOrigin(0.5, 0)
      .setDepth(1000);
  });

  if (window.onPhaserGameFinished) {
    window.onPhaserGameFinished();
  }
}