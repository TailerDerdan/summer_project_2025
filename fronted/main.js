import { updateMovementPlayer } from './player/movement.js'
import { updateMovementBullets } from './weapon/shooting.js';
import { canvas, ctx, gl, state } from './canvas.js';
import { enemy1 } from './enemy/enemy.js';
import { map } from './map/map.js';
import { camera } from './camera/camera.js';
import {} from './player/changeDir.js';
import { Clock } from './clock/clock.js';
import { player } from './player/player.js';
import { render, texture2D, updateTexture } from './shadows/shadows.js';

const clock = new Clock();
map.generate(ctx);

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

    updateTexture();
    render(state);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture2D);

    window.requestAnimationFrame(gameLoop);
}

setTimeout(() => {
    gameLoop();
}, 1000);