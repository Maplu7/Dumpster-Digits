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
        // load shared sounds FIRST from public root
        this.load.audio('correctSfx', '/sounds/right.mp3');
        this.load.audio('wrongSfx', '/sounds/wrong.mp3');
        this.load.audio("gameMusic", "/sounds/game.mp3");

        this.load.image("raccacoin", "/ui-assets/raccacoin.png");

        this.load.setPath('assets');

        // SINGLE IMAGES
        this.load.image('camp', 'campGround.png');
        this.load.image('clovers', 'campClovers.png');
        this.load.image('mushrooms', 'campMushrooms.png');
        this.load.image('verticalLog', 'campLogVertical.png');
        this.load.image('horizontalLog', 'campLogHorizontal.png');
        this.load.image('dirtGround', 'campDirt.png');
        this.load.image('patchyDirtGround', 'campDirtPatchy.png');
        this.load.image('fenceHorizontal', 'campFenceHorizontal.png');
        this.load.image('fenceVertical', 'campFenceVertical.png');

        // EMOTES
        this.load.image('wrongEmote', 'emote_cross.png');
        this.load.image('heartEmote', 'emote_heart.png');
        this.load.image('brokenHeartEmote', 'emote_heartBroken.png');
        this.load.image('happyEmote', 'emote_faceHappy.png');
        this.load.image('sadEmote', 'emote_faceSad.png');

        // MAIN SPRITES
        this.load.spritesheet('trashCan', 'Garden_Planters_RubberTire.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('usedItems', 'used_items.png', {
            frameWidth: 32,
            frameHeight: 50
        });

        this.load.spritesheet('raccacconie', 'RACCOONSPRITESHEET.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // DECORATIVE SPRITES
        this.load.spritesheet('yellowTent', 'campTentsYellow.png', {
            frameWidth: 64,
            frameHeight: 106
        });

        this.load.spritesheet('greenTent', 'campTentsGreen.png', {
            frameWidth: 67,
            frameHeight: 108
        });

        this.load.spritesheet('campChairGreen', 'campChairsGreen.png', {
            frameWidth: 32,
            frameHeight: 50
        });

        this.load.spritesheet('campChairBlue', 'campChairsBlue.png', {
            frameWidth: 32,
            frameHeight: 50
        });

        this.load.spritesheet('campChairOrange', 'campChairsOrange.png', {
            frameWidth: 31,
            frameHeight: 48
        });

        this.load.spritesheet('campChairStriped', 'campChairsStriped.png', {
            frameWidth: 31,
            frameHeight: 48
        });

        this.load.spritesheet('cotGreen', 'campCotGreen.png', {
            frameWidth: 30,
            frameHeight: 64
        });

        this.load.spritesheet('cotTan', 'campCotTan.png', {
            frameWidth: 32,
            frameHeight: 64
        });

        this.load.spritesheet('sleepingBagBlue', 'campSleepingBagBlue.png', {
            frameWidth: 31,
            frameHeight: 66
        });

        this.load.spritesheet('sleepingBagGreen', 'campSleepingBagGreen.png', {
            frameWidth: 32,
            frameHeight: 63
        });

        this.load.spritesheet('sleepingBagOrange', 'campSleepingBagOrange.png', {
            frameWidth: 30,
            frameHeight: 63
        });

        this.load.spritesheet('campBags', 'campBags.png', {
            frameWidth: 33,
            frameHeight: 33
        });

        this.load.spritesheet('cooler', 'campCooler.png', {
            frameWidth: 29,
            frameHeight: 34
        });

        this.load.spritesheet('campFire', 'campFires.png', {
            frameWidth: 33,
            frameHeight: 34
        });

        this.load.spritesheet('trees', 'campTrees.png', {
            frameWidth: 50,
            frameHeight: 102
        });

        this.load.spritesheet('horizontalTable', 'campTableHorizontal.png', {
            frameWidth: 32,
            frameHeight: 31
        });

        this.load.spritesheet('verticalTable', 'campTableVertical.png', {
            frameWidth: 24,
            frameHeight: 45
        });

        this.load.spritesheet('signs', 'campSigns.png', {
            frameWidth: 32,
            frameHeight: 33
        });
    }

    create() {
        const coinTexture = this.textures.get("raccacoin");
        if (coinTexture) {
            coinTexture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }

        this.scene.start('Game');
    }
}
