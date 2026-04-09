export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        this.load.on('progress', (progress) => {
            bar.width = 4 + (460 * progress);
        });
    }

    preload() {
        this.load.setPath('assets');

        this.load.image('trashCan', 'trashCan.png');
        this.load.image('trash', 'can.png');   // ← put this back
        this.load.image('camp', 'campGround.png');

        this.load.image('emptyCan', 'used_can.png');

        this.load.spritesheet('usedItems', 'used_items.png', {
            frameWidth: 32,
            frameHeight: 50
        });
    }

    create() {
        this.scene.start('Game');
    }
}