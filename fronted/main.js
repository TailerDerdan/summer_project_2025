import { updateMovementPlayer } from './player/movement.js'
import { updateMovementBullets } from './weapon/shooting.js';
import { canvas, ctx } from './canvas.js';
import { changeDir } from './player/changeDir.js';
import { enemy1 } from './enemy/enemy.js';

function gameLoop()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    enemy1.drawEnemy(ctx);
    updateMovementPlayer();
    changeDir();
    updateMovementBullets();
    window.requestAnimationFrame(gameLoop);
}

gameLoop();