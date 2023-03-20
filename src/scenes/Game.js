import Phaser from 'phaser';

export default class Game extends Phaser.Scene {

    /** @type {Phaser.Types.Keyboard.CursorKeys} */
    cursors

    // store the players
    /** @type {Phaser.Physics.Arcade.Sprite} */
    player

    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    boxGroup

    constructor() {
        super('game')
    }

    init() {
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    create() {
        const { width, height } = this.scale;

        this.player = this.physics.add.sprite(width * 0.5, height * 0.6, 'sokoban')
            .setSize(40, 16)
            .setOffset(12, 38)
            .play('down-idle')

        this.boxGroup = this.physics.add.staticGroup()

        this.createBoxes()

        this.physics.add.collider(this.player, this.boxGroup, this.handlePlayerBoxCollide, undefined, this)

    }


    createBoxes() {
        const { width } = this.scale;
        let y = 150;
        let xPer = 0.25

        for (let row = 0; row < 3; ++row) {
            for (let col = 0; col < 3; ++col) {

                /** @type {Phaser.Physics.Arcade.Sprite} */
                const box = this.boxGroup.get(width * xPer, y, 'sokoban', 10)
                box
                    .setSize(64, 32)
                    .setOffset(0, 32)
                xPer += 0.25
            }
            xPer = 0.25;
            y += 150;
        }

    }


    /**
     * 
     * @param {Phaser.Physics.Arcade.Sprite} obj1 
     Phaser.Physics.Arcade.Sprite @param {*} obj2 
     */
    handlePlayerBoxCollide(player, box) {
       if(this.activeBox) return;

       this.activeBox = box;
       this.activeBox.setFrame(9)
    }


    updatePlayer() {
        // determine veolocity
        const speed = 200;

        if (this.cursors.left.isDown) {
            this.player.setVelocity(-speed, 0)
            this.player.play('left-walk', true)
        } else if (this.cursors.right.isDown) {
            this.player.setVelocity(speed, 0)
            this.player.play('right-walk', true)
        } else if (this.cursors.up.isDown) {
            this.player.setVelocity(0, -speed)
            this.player.play('up-walk', true)
        }
        else if (this.cursors.down.isDown) {
            this.player.setVelocity(0, speed)
            this.player.play('down-walk', true)
        }
        else {
            this.player.setVelocity(0, 0)
            const key = this.player.anims.currentAnim.key
            const [ direction, ] = key.split('-')

            this.player.play(`${direction}-idle`)
        }


    }

    updateActiveBox() {
        if (!this.activeBox) return;

        // check the distance with activeBox and player
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.activeBox.x, this.activeBox.y)

        if(distance < 64) return

        this.activeBox.setFrame(10) // return to gray box
        this.activeBox = undefined
    }


    update() {

        this.updatePlayer()
        this.updateActiveBox()

        // sort boxes using depth sort by the y values
        this.children.each(c => {
            /** @types {Phaser.Physics.Arcade.Sprite} */
            
            const child = c;
            // @ts-ignore
            child.setDepth(child.y)
        })

    }
}