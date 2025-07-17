import { updateMovementPlayer } from './player/movement.js'
import { updateMovementBullets } from './weapon/shooting.js';
import { canvas, ctx } from './canvas.js';
import { enemy1 } from './enemy/enemy.js';
import { map } from './map/map.js';
import { camera } from './camera/camera.js';
import {} from './player/changeDir.js';
import { Clock } from './clock/clock.js';
import { player } from './player/player.js';

const clock = new Clock();

function gameLoop()
{
    let deltaTime = clock.getElapsedTime();
    clock.restart();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    map.draw(ctx, camera.xView, camera.yView);

    enemy1.drawEnemy(ctx, camera.xView, camera.yView);
    enemy1.drawBlood(ctx, camera.xView, camera.yView);

    enemy1.updateEnemy();

    updateMovementBullets();

    updateMovementPlayer(camera.xView, camera.yView, deltaTime);
    if (!player.isPlayerLive)
    {
        player.appearanceAfterDeathWidthDelay();
    }

    camera.update();

    window.requestAnimationFrame(gameLoop);
}

gameLoop();