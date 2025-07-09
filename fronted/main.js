import { updateMovementPlayer } from './player/movement.js'
import { updateMovementBullets } from './weapon/shooting.js';
import { canvas, ctx } from './canvas.js';
import { changeDir } from './player/changeDir.js';

function gameLoop()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateMovementPlayer();
    changeDir();
    updateMovementBullets();
    window.requestAnimationFrame(gameLoop);
}

gameLoop();