import Phaser from 'phaser';


const level = [
    [ 1, 0, 3 ],
    [ 2, 4, 1 ],
    [ 3, 2, 0 ]
]

export default class Game extends Phaser.Scene {

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors

    // store the players
    /** @type {Phaser.Physics.Arcade.Sprite} */
    player

    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    boxGroup

    /** @type {Phaser.Physics.Arcade.Sprite} */
    activeBox

    /** @type {Phaser.GameObjects.Group} */
    itemsGroup



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

        this.itemsGroup = this.add.group()

        this.physics.add.collider(this.player, this.boxGroup, this.handlePlayerBoxCollide, undefined, this)

    }


    createBoxes() {
        const { width } = this.scale;
        let y = 150;
        let xPer = 0.25

        const level_row_length = level.length;
        const level_col_length = level[ 0 ].length;

        for (let row = 0; row < level_row_length; ++row) {
            for (let col = 0; col < level_col_length; ++col) {
                /** @type {Phaser.Physics.Arcade.Sprite} */
                const box = this.boxGroup.get(width * xPer, y, 'sokoban', 10)
                box
                    .setSize(64, 32)
                    .setOffset(0, 32)
                    .setData('itemType', level[ row ][ col ])

                xPer += 0.25
            }
            xPer = 0.25;
            y += 150;
        }

    }


    /**
     * 
     * @param {Phaser.Physics.Arcade.Sprite} player 
     * @param {Phaser.Physics.Arcade.Sprite} box
     */
    handlePlayerBoxCollide(player, box) {
        if (this.activeBox) return;

        this.activeBox = box;
        this.activeBox.setFrame(9)
    }

    /**
     * 
     * @param {Phaser.Physics.Arcade.Sprite} box 
     */
    openBox(box) {
        if (!box) return;

        const itemType = box.getData('itemType')
        console.log(box, itemType)
        /** @type {Phaser.GameObjects.Sprite} */
        let item;
        switch (itemType) {
            case 0:
                item = this.itemsGroup.get(box.x, box.y)
                item.setTexture('burger')
                item.setVisible(true)
                break;
            case 1:
                item = this.itemsGroup.get(box.x, box.y)
                item.setTexture('donutSprinkle')
                break;
            case 2:
                item = this.itemsGroup.get(box.x, box.y)
                item.setTexture('crossiant')
                break;
            case 3:
                item = this.itemsGroup.get(box.x, box.y)
                item.setTexture('sushiSalmon')
                break;
            case 4: // unknown item
                item = this.itemsGroup.get(box.x, box.y)
                item.setTexture('taco')
                break;
        }

        if (!item) return;

        // scale items
        item.scale = 0;
        item.alpha = 0;

        this.tweens.add({
            targets: item,
            y: "-=50",
            alpha: 1,
            scale: 1,
            duration: 500
        })

        this.activeBox = undefined // make inactive

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

        const spaceJustPressed = Phaser.Input.Keyboard.JustUp(this.cursors.space)
        if (spaceJustPressed && this.activeBox) {
            // open the box
            this.openBox(this.activeBox)
        }


    }

    updateActiveBox() {
        if (!this.activeBox) return;

        // check the distance with activeBox and player
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.activeBox.x, this.activeBox.y)

        if (distance < 64) return

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