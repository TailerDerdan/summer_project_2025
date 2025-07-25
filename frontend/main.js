import { updateMovementPlayer } from './player/movement.js'
import { updateMovementBullets } from './weapon/shooting.js';
import { canvas, ctx, gl, state } from './canvas.js';
import { enemy1 } from './enemy/enemy.js';
import { map } from './map/map.js';
import { camera } from './camera/camera.js';
import {} from './player/changeDir.js';
import { Clock } from './clock/clock.js';
import { player, arrEnemy } from './player/player.js';
import { render, texture2D, updateTexture } from './shadows/shadows.js';
import {gameIsRun, recordKill} from "./game.js";
import { getMap } from './requests/requests.js';

const clock = new Clock();

function gameLoop()
{
    let deltaTime = clock.getElapsedTime();
    clock.restart();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    map.draw(ctx, camera.xView, camera.yView);

    // arrEnemy.forEach(enemy => {
    //     enemy1.drawEnemy(ctx, enemy.x, enemy.y)
    //     enemy1.drawBlood(ctx, enemy.x, enemy.y);
    //     enemy1.updateEnemy();
    // })

    enemy1.drawEnemy(ctx, camera.xView, camera.yView);
    enemy1.drawBlood(ctx, enemy.x, enemy.y);
    enemy1.updateEnemy();
    updateMovementBullets();

    updateMovementPlayer(camera.xView, camera.yView, deltaTime);
    if (!player.isPlayerLive)
    {
        player.appearanceAfterDeathWidthDelay();
    }

    camera.update();
    recordKill()
    updateTexture();
    render(state);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture2D);
    if (!gameIsRun) {
        console.log("game over")
        return
    }
    window.requestAnimationFrame(gameLoop);
}

const initGame = async () => {
    const gettedMap = await getMap();
    const imgMap = new Image();
    imgMap.src = gettedMap.image;
    map.image = imgMap;
    map.generate(ctx);
    map.fillWalls(gettedMap.walls);
    setTimeout(() => {
        gameLoop();
    }, 3000);
}

initGame();