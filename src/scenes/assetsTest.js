import {Trash} from  '../GameObjects/Trash.js'; //can copy the path
import {TrashCan} from '../GameObjects/TrashCan.js';

export class assetsTest extends Phaser.Scene {
    constructor() {
        super('Game');

    }

/*Frame Dimensions: width: 1536,
                    height: 793*/

    create() {

     // this.add.image(90, 50, 'camp').setScale(3);
      for(let i = 1; i<= 7; i++){
        const y = 50 + (i-1) * 100;

        this['campGroundRow${i}'] = this.add.group({
          key: 'camp',
          repeat: 11,
          setXY: {x: 90, y: y, stepX: 180},
          setScale: {x:3, y:6}
        });
      }


      /*
        BROWSER DIMENSTIONS
          width = 1536
          height = 793
      */
      this.add.image(1250, 100, 'yellowTent', 0).setScale(3);
      this.add.image(200, 100, 'greenTent', 1).setScale(3);
      this.add.image(100, 300, 'campFire', 3).setScale(3);
      this.add.image(1400, 200, 'campChairBlue', 0).setScale(2);
      this.add.image(1480, 280, 'campChairGreen', 2).setScale(2);
      this.add.image(1480, 400, 'campChairOrange', 0).setScale(2);
      this.add.image(1480, 480, 'campChairStriped', 0).setScale(2);

      this.add.image(768, 600, 'cotGreen', 1);
      this.add.image(700, 600, 'cotTan', 1);

      this.add.image(768, 700, 'sleepingBagBlue', 0);
      this.add.image(700, 700, 'sleepingBagGreen', 0);
      this.add.image(850, 700, 'sleepingBagOrange', 0);

      this.add.image(300, 700, 'campBags', 4).setScale(3);

      this.add.image(300, 600, 'cooler', 0).setScale(2);

      this.add.image(100, 700, 'trees', 2);

      this.add.image(1000, 700, 'horizontalTable', 1);
      this.add.image(1000, 600, 'verticalTable', 1);

      this.add.image(1000, 400, 'signs', 0);

      
      this.add.image(768, 396.5, 'raccacconie', 20).setScale(4);
            this.add.image(500, 340, 'wrongEmote').setScale(3);
            this.add.image(700, 340, 'heartEmote').setScale(3);
            this.add.image(600, 340, 'brokenHeartEmote').setScale(3);
            this.add.image(800, 340, 'happyEmote').setScale(3);
            this.add.image(900, 340, 'sadEmote').setScale(3);
      

    }
}