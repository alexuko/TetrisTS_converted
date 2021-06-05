import * as controller from './controller' 

controller.playBtn.addEventListener("click", controller.startGame);
controller.pauseButton.addEventListener('click', controller.pauseGame);
["keydown", "keyup"].forEach((e) => window.addEventListener(e, controller.keyControl));