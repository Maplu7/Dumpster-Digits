export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    init() {

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload() {
        //  Load the assets for the game(assets are images added into the folder on computer)
        this.load.setPath('assets')

// SINGLE IMAGES
//-----------------------NATURE-----------------------------------
        this.load.image('camp', 'campGround.png');
        this.load.image('clovers', 'campClovers.png');
        this.load.image('mushrooms', 'campMushrooms.png');
        this.load.image('verticalLog', 'campLogVertical.png');
        this.load.image('horizontalLog', 'campLogHorizontal.png');
        this.load.image('dirtGround', 'campDirt.png');
        this.load.image('patchyDirtGround', 'campDirtPatchy.png');
        this.load.image('fenceHorizontal', 'campFenceHorizontal.png');
        this.load.image('fenceVertical', 'campFenceVertical.png');

//-----------------------EMOTES-------------------------------------
        this.load.image('wrongEmote', 'emote_cross.png');
        this.load.image('heartEmote', 'emote_heart.png');
        this.load.image('brokenHeartEmote', 'emote_heartBroken.png');
        this.load.image('happyEmote', 'emote_faceHappy.png');
        this.load.image('sadEmote', 'emote_faceSad.png');

// SPRTIE SHEETS
    // MAIN SPRITES
        this.load.spritesheet('trashCan', 'Garden_Planters_RubberTire.png', 
        {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('usedItems', 'used_items.png', 
        {
            frameWidth: 32,
            frameHeight: 50
        });

        this.load.spritesheet('raccacconie', 'RACCOONSPRITESHEET.png',
        {
            frameWidth: 32,
            frameHeight: 32   
        });
//----------------------------------------------------------------------
    //DECORATIVE SPRITES
//-----------------------------TENTS--------------------------------------
        this.load.spritesheet('yellowTent', 'campTentsYellow.png', 
        {
            frameWidth: 63.5,
            frameHeight: 106
        });  
        this.load.spritesheet('greenTent', 'campTentsGreen.png', 
        {
            frameWidth: 66.5,
            frameHeight: 108
        });
 //--------------------------CHAIRS----------------------------------------        
         this.load.spritesheet('campChairGreen', 'campChairsGreen.png', 
        {
            frameWidth: 32,
            frameHeight: 50
        }); 
        this.load.spritesheet('campChairBlue', 'campChairsBlue.png',
        {
            frameWidth: 32,
            frameHeight: 50
        });
        this.load.spritesheet('campChairOrange', 'campChairsOrange.png',
        {
            frameWidth: 30.66,
            frameHeight: 48
        });
        this.load.spritesheet('campChairStriped', 'campChairsStriped.png',
        {
            frameWidth: 30.66,
            frameHeight: 48
        });
//-----------------------SLEEPING BAGS-------------------------------------
        this.load.spritesheet('cotGreen', 'campCotGreen.png',
        {
            frameWidth: 30,
            frameHeight: 64
        });
        this.load.spritesheet('cotTan', 'campCotTan.png',
        {
            frameWidth: 32,
            frameHeight: 64
        });
        this.load.spritesheet('sleepingBagBlue', 'campSleepingBagBlue.png',
        {
            frameWidth: 31,
            frameHeight: 66
        });
        this.load.spritesheet('sleepingBagGreen', 'campSleepingBagGreen.png',
        {
            frameWidth: 31.5,
            frameHeight: 63
        });
        this.load.spritesheet('sleepingBagOrange', 'campSleepingBagOrange.png',
        {
            frameWidth: 30,
            frameHeight: 63   
        });
//------------------------MISC ITEMS--------------------------------------
        this.load.spritesheet('campBags', 'campBags.png',
        {
            frameWidth: 32.5,
            frameHeight: 33.33
        });

        this.load.spritesheet('cooler', 'campCooler.png',
        {
            frameWidth: 29,
            frameHeight: 34
        });

        this.load.spritesheet('campFire', 'campFires.png', 
        {
            frameWidth: 32.5,
            frameHeight: 34
        });

        this.load.spritesheet('trees', 'campTrees.png', 
        {
            frameWidth: 43,
            frameHeight: 102
        });

        this.load.spritesheet('horizontalTable', 'campTableHorizontal.png', 
        {
            frameWidth: 32,
            frameHeight: 31
        });

        this.load.spritesheet('verticalTable', 'campTableVertical.png', 
        {
            frameWidth: 24,
            frameHeight: 45
        });

        this.load.spritesheet('signs', 'campSigns.png', 
        {
            frameWidth: 32,
            frameHeight: 33
        });
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('Game');
    }
}
