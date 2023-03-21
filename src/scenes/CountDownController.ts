export default class CountDownController {
  /** @type {Phaser.Scene} */
  scene;

  /** @type {Phaser.GameObjects.Text} */
  label;

  /** @type {Phaser.Time.TimerEvent} */
  // @ts-ignore
  timerEvent;

  duration = 0;

  /**
   *
   * @param {Phaser.Scence} scene
   * @param {Phaser.GameObjects.Text} label
   */
  // @ts-ignore
  constructor(scene, label) {
    this.scene = scene;
    this.label = label;
  }

  /**
   *
   * @param {() => void} callback
   * @param {number} duration
   */

  // @ts-ignore
  start(callback, duration = 45000) {
    this.stop();
    this.duration = duration;


    this.timerEvent = this.scene.time.addEvent({
      delay: duration,
      callback: () => {
        this.label.text = '0';
        this.stop();
        if (callback) {
          callback();
        }
      },
    });
  }

  stop() {
    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = undefined;
    }
  }

  update() {
    if (!this.timerEvent || this.duration <= 0) {
      return;
    }

    const elasped = this.timerEvent.getElapsed();

    const remaining = this.duration - elasped;

    const seconds = remaining / 1000;

    this.label.text = `${seconds.toFixed(2)}`;
  }
}
