export class Trash extends Phaser.GameObjects.Container
{
    constructor(scene, x, y, problem)
    {
          super(scene, x, y);
          
        // Inorder to make it so text will be on
        //any piece of trash the above code 
        //needs to be replaced and instead
        //be for a container
        this.piecesOfTrash = [
          0,
          1,
          2
        ];



        this.trashMath = scene.add.image(0, 0, 'usedItems', Phaser.Utils.Array.GetRandom(this.piecesOfTrash)).setScale(4);

        this.text = scene.add.text(this.trashMath.x, this.trashMath.y, problem.answer, {
          fontSize: '23px',fontStyle: 'bold', fontFamily: 'Verdana', fill: '#000000'
        }).setOrigin(0.5);

        this.add([this.trashMath, this.text]) // Adds trash and text to the container

        this.answer = problem.answer;
        this.question = problem.question;

          scene.add.existing(this);
          scene.physics.add.existing(this);
          this.setSize(50, 20);//hit box size??
          this.body.setOffset(-10, -10);
        
        
        //this.setInteractive(new Phaser.Geom.Rectangle(0,0,this.getBounds().width, this.getBounds().height), Phaser.Geom.Rectangle.Contains, {draggable:true});
        
        this.trashMath.setInteractive({draggable: true});
       // this.trashMath.setCollideWorldBounds(true);
        //currently dragX and dragY represent trash's postion (0,0)
        //so trying to drag it immedietly postions it to the (0, 0)
        //position rather than properly follow the cursor
        
        this.trashMath.on('drag', (pointer) => {
            this.setPosition(pointer.worldX, pointer.worldY);
        });
            //worldX and worldY sets the postion to where the cursor 
            //is in the world 

        this.trashMath.on('dragstart', function(pointer) {
            this.setTint(0x00e6e6);
        });

        this.trashMath.on('dragend', function(pointer) {
            this.clearTint();
        });

    }

    setSpriteScale(scale) 
    {
      this.trashMath.setScale(scale);
    }

    setTextScale(scale)
    {
      this.text.setFontSize(scale);
    }

}