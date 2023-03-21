import Phaser from 'phaser';


const level = [
    [ 1, 0, 3 ],
    [ 2, 4, 1 ],
    [ 3, 4, 2 ]
]

const TWEENS_RESET = {
    y: "+=50",
    alpha: 0,
    scale: 0,
    duration: 300,
}

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

    /** @types {{box: Phaser.Physics.Arcade.Sprite, item: Phaser.GameObjects.Sprite}}  */
    selectedBoxes = []

    // keep track of how many matches 
    matchesCount = 0

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

        // prevent re-opening the box 
        if (box.getData('opened')) return;
        if (this.activeBox) return;

        // update box to active
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

        /** @type {Phaser.GameObjects.Sprite} */
        let item;
        switch (itemType) {
            case 0:
                item = this.itemsGroup.get(box.x, box.y)
                item.setTexture('burger')
                break;
            case 1:
                item = this.itemsGroup.get(box.x, box.y)
                item.setTexture('donutSprinkles')
                break;
            case 2:
                item = this.itemsGroup.get(box.x, box.y)
                item.setTexture('croissant')
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

        // identify when a box is opened
        box.setData('opened', true)
        
        
        item.setData('sorted', true)
        item.setDepth(2000)

        // keep track of the selected boxes
        this.selectedBoxes.push({box, item})

        // scale items
        item.scale = 0;
        item.alpha = 0;

        this.tweens.add({
            targets: item,
            y: "-=50",
            alpha: 1,
            scale: 1,
            duration: 500,
            onComplete: () => {

                // handle when choosen type 0 that has no match
                // stun the player for 2 seconds
                if(itemType === 0) {
                    this.handleStunPlayer()
                    return
                }


                // check for a match when selectedBoxes.length === 2
                if(this.selectedBoxes.length < 2) return
                this.checkForMatch()
            }
        })

        this.activeBox.setFrame(10)
        this.activeBox = undefined // make inactive

    }

    pausePlayer() {
        this.player.active = false
        this.player.setVelocity(0,0)
    }

    handleStunPlayer() {

        const {box, item} = this.selectedBoxes.pop();

        // change to tint of red
        item.setTint(0xff0000)
        box.setFrame(7)

        // pauses player
        this.pausePlayer()

        this.time.delayedCall(1000, () => {
            item.setTint(0xfffff)
            box.setFrame(10)
            box.setData('opened', false)

            this.tweens.add({
                targets: item,
                ...TWEENS_RESET,
                onComplete: () => {
                    this.player.active = true;
                }
            })

        })


    }


    checkForMatch() {

        const second = this.selectedBoxes.pop();
        const first = this.selectedBoxes.pop();

        if(first.item.texture !== second.item.texture) {
            first.box.setData('opened', false)
            second.box.setData('opened', false)
            // no match, shrink both items
            this.tweens.add({
                targets: [first.item, second.item],
                ...TWEENS_RESET,
                delay: 1000,
                onComplete: () => {
                    first.box.setData('opened', false)
                    second.box.setData('opened', false)
                }
            })
            return;
        }

        ++this.matchesCount

        // if there is a match
        this.time.delayedCall(1000, () => {
            first.box.setFrame(8)
            second.box.setFrame(8)

            if(this.matchesCount >= 4) {
                this.handleGameWon()
            }
            
        })

    }


    handleGameWon() {
        this.pausePlayer()

        const {width, height} = this.scale;
        this.add.text(width * 0.5, height *0.5, 'You win!', {
            fontSize: '48px'
        })
        .setOrigin(0.5)
    }

    updatePlayer() {

        // pause player from moving
        if(!this.player.active) return


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

            if (child.getData('sorted')) return;

            // @ts-ignore
            child.setDepth(child.y)
        })

    }
}