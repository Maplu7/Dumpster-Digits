export class Trash extends Phaser.GameObjects.Container
{
    constructor(scene, x, y, problem)
    {
        super(scene, x, y);

        this.trashMath = scene.add.sprite(0, 0, 'trash').setScale(2);

        this.text = scene.add.text(0, 20, problem.question, {
            fontSize: '40px',
            fill: '#ffffff'
        });
        this.text.setOrigin(0.5, 0.5);

        this.add([this.trashMath, this.text]);

        this.answer = problem.answer;
        this.question = problem.question;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setSize(50, 20);
        this.body.setOffset(-10, -10);

        this.trashMath.setInteractive({ draggable: true });

        this.trashMath.on('drag', (pointer) => {
            this.setPosition(pointer.worldX, pointer.worldY);
        });

        this.trashMath.on('dragstart', function() {
            this.setTint(0x00e6e6);
        });

        this.trashMath.on('dragend', function() {
            this.clearTint();
        });

        this.body.allowGravity = false;
    }
}