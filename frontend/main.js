import { updateMovementPlayer } from './player/movement.js';
import {throttleBotsShoot, updateMovementBullets} from './weapon/shooting.js';
import { canvas, ctx, gl, state } from './canvas.js';
import { map } from './map/map.js';
import { camera } from './camera/camera.js';
import { Clock } from './clock/clock.js';
import { player, arrEnemy, arrBot } from './player/player.js';
import { render, texture2D, updateTexture } from './shadows/shadows.js';
//import {recordDeath, recordKill} from "./game.js";
import { getMap } from './requests/requests.js';
import { stateForWS } from './websocketGame.js';
import { checkAndSendPosition } from './game.js';
import { sendBullets, updateAllBullets } from './game.js';

const clock = new Clock();

function gameLoop()
{
    let deltaTime = clock.getElapsedTime();
    clock.restart();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    map.draw(ctx, camera.xView, camera.yView);

    //player.drawCharacter(ctx, camera.xView, camera.yView);
    updateMovementPlayer(camera.xView, camera.yView, deltaTime);
    player.drawBlood(ctx, camera.xView, camera.yView);
    player.updateCharacter();
    if (!player.isCharacterLive)
    {
        player.appearanceAfterDeathWidthDelay();
        //recordDeath();
    }

    arrEnemy.forEach(enemy => {
        enemy.drawCharacter(ctx, camera.xView, camera.yView)
        enemy.drawBlood(ctx, camera.xView, camera.yView);
        enemy.updateCharacter();
    })

    // arrBot.forEach(bot => {
    //     //bot.drawCharacter(ctx, camera.xView, camera.yView);
    //     bot.drawBlood(ctx, camera.xView, camera.yView);
    //     bot.updateMovementBot(ctx, camera.xView, camera.yView);
    //     bot.updateCharacter();
    // })
    //
    // arrBot.forEach((bot, index) => {
    //     if (bot.isCharacterLive && bot.weapon) {
    //         throttleBotsShoot[index]();
    //     }
    // });

    //updateMovementBullets();

    checkAndSendPosition();

    sendBullets();

    updateAllBullets(ctx, camera.xView, camera.yView);

    camera.update();
    updateTexture();
    render(state);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture2D);
    if (!stateForWS.gameIsRun) {
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
    }, 100);
}

initGame();