export class TrashCan extends Phaser.GameObjects.Container
{
    constructor(scene, x, y, problem)
    {
        super(scene, x, y);

        this.trashCanMath = scene.add.sprite(0, 0, 'trashCan').setScale(3);

        this.text = scene.add.text(0, 38, String(problem.answer), {
            fontSize: '40px',
            fill: '#ffffff'
        });
        this.text.setOrigin(0.5, 0.5);

        this.add([this.trashCanMath, this.text]);

        this.answer = problem.answer;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setSize(-150, 90);
        this.body.setOffset(-100, -20);

        this.trashCanMath.setInteractive(
            new Phaser.Geom.Rectangle(
                -this.trashCanMath.displayWidth / 2,
                -this.trashCanMath.displayHeight / 2,
                this.trashCanMath.displayWidth,
                this.trashCanMath.displayHeight
            ),
            Phaser.Geom.Rectangle.Contains
        );

        // ❌ removed tint logic completely

        this.body.allowGravity = false;
    }
}