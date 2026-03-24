export class TrashCan extends Phaser.GameObjects.Container
{
    constructor(scene, x, y, problem)
    {
          super(scene, x, y);
          
        // Inorder to make it so text will be on
        //any piece of trash the above code 
        //needs to be replaced and instead
        //be for a container

        this.trashCanMath = scene.add.sprite(0, 0, 'trashCan').setScale(3);
        this.text = scene.add.text(this.trashCanMath.x - 25, this.trashCanMath.y, problem.answer, {
          fontSize: '40px', fill: '#ffffff'
        });

        this.add([this.trashCanMath, this.text]) // Adds trash and text to the container

        this.answer = problem.answer;

          scene.add.existing(this);
          scene.physics.add.existing(this);
          this.setSize(-150, 90);//hit box size??
          this.body.setOffset(-100, -20);
        
        this.trashCanMath.setInteractive(new Phaser.Geom.Rectangle(0,0,this.getBounds().width, this.getBounds().height), Phaser.Geom.Rectangle.Contains);
        this.body.allowGravity = false;
    }


    /*
 this.trash1.on('dragstart', function(pointer) {
        this.physics.add.collider(this.trash1, this.trashCans);
        if(this.physics.overlap(this.trash1, this.trashCans)) {
          this.trash1.x = pointer.prevPosition.x;
          this.trash1.y = pointerPosition.y;
        }
        this.setTint(0x00e6e6);
      })
      this. trash1.on('dragend', function(pointer){
        this.clearTint();
      });
    */

}