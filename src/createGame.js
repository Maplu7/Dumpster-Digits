export function createGame(gameKey, parent = "game-container", studentId = null) {
  const SelectedScene = getSceneForGameKey(gameKey);

  return new Phaser.Game({
    type: Phaser.AUTO,
    width: 1536,
    height: 793,
    parent,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [Preloader, SelectedScene],
    callbacks: {
      postBoot: (game) => {
        game.registry.set("studentId", studentId);
      },
    },
  });
}