import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader')
    }

    // preload textures
    preload() {
        // load sprites
        this.load.image('burger', 'textures/burger.png')
        this.load.image('croissant', 'textures/croissant.png')
        this.load.image('donutSprinkles', 'textures/donutSprinkles.png')
        this.load.image('sushiSalmon', 'textures/sushiSalmon.png')
        this.load.image('sushiSalmon', 'textures/taco.png')
        
        this.load.spritesheet('sokoban', 'textures/sokoban_tilesheet.png', { frameWidth: 64 })


    }


    create() {

        // create animations of the spirite


        // down
        this.anims.create({
            key: 'down-idle',
            frames: [{key: 'sokoban', frame: 52}]
        })

        this.anims.create({
            key: 'down-walk',
            frames: this.anims.generateFrameNumbers('sokoban', {start: 52, end: 54} ),
            frameRate: 10,
            repeat: -1,
        })


        // Up
        this.anims.create({
            key: 'up-idle',
            frames: [{key: 'sokoban', frame: 55}]
        })

        this.anims.create({
            key: 'up-walk',
            frames: this.anims.generateFrameNumbers('sokoban', {start: 55, end: 57} ),
            frameRate: 10,
            repeat: -1,
        })

        // left

        this.anims.create({
            key: 'left-idle',
            frames: [{key: 'sokoban', frame: 81}]
        })

        this.anims.create({
            key: 'left-walk',
            frames: this.anims.generateFrameNumbers('sokoban', {start: 81, end: 83} ),
            frameRate: 10,
            repeat: -1,
        })


        // right

        this.anims.create({
            key: 'right-idle',
            frames: [{key: 'sokoban', frame: 78}]
        })

        this.anims.create({
            key: 'right-walk',
            frames: this.anims.generateFrameNumbers('sokoban', {start: 78, end: 80} ),
            frameRate: 10,
            repeat: -1,
        })

        this.scene.start('game')
    }
}