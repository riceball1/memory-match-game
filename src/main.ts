import Phaser from "phaser";
import config from "./config";

import Preloader from "./scenes/Preloader";
import Game from "./scenes/Game";

new Phaser.Game(
  Object.assign(config, {
    scene: [Preloader, Game],
  })
);

export default new Phaser.Game(config);
