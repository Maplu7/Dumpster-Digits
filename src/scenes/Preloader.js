export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        this.load.setPath('assets/new');

        this.load.image('camp', 'ground.png');
        this.load.image('trash', 'trash.png');
        this.load.image('emptyCan', 'emptes.png');
        this.load.image('trashCan', 'trashCan.png');
        this.load.image('cardboardBox', 'cardboardbox.png');

        this.load.image('wrongBubble', 'emote_cross.png');
        this.load.image('happyBubble', 'emote_faceHappy.png');
        this.load.image('heartBubble', 'emote_heart.png');

        this.load.image('usedItemsRow', 'trashes.png');
    }

    create() {
        this.scene.start('Game');
    }
}