import { updateMovementPlayer } from './player/movement.js';
import {throttleBotsShoot, updateAllBullets } from './weapon/shooting.js';
import { canvas, ctx, gl, state } from './canvas.js';
import { map } from './map/map.js';
import { camera } from './camera/camera.js';
import { Clock } from './clock/clock.js';
import { player, arrEnemy, arrBot } from './player/player.js';
import { render, texture2D, updateTexture } from './shadows/shadows.js';
import { getMap } from './requests/requests.js';

import { drawRemainingBlood } from './blood/blood.js';
import {playerDeath} from "./player/KillAndDeath.js";
import {sendWebSocketMessage, stateForWS} from './ws/websocketGame.js';
import { mapName } from './ws/game.js';

import { drawAllWeaponOnMap, updateAllWeaponOnMap } from './weapon/spawnWeapon.js';
import {} from "./player/changeWeapon.js";

const clock = new Clock();

export function gameLoop()
{
    let deltaTime = clock.getElapsedTime();
    clock.restart();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    map.draw(ctx, camera.xView, camera.yView);

    arrEnemy.forEach(enemy => {
        enemy.snapshotBuffer.interpolate();
        enemy.drawCharacter(ctx, camera.xView, camera.yView)
        enemy.updateCharacter();
    })

    arrBot.forEach(bot => {
        bot.updateMovementBot(ctx, camera.xView, camera.yView);
        bot.updateCharacter();
    })

    arrBot.forEach((bot, index) => {
        if (bot.isCharacterLive && bot.weapon) {
            //throttleBotsShoot[index]();
        }
    });

    updateAllWeaponOnMap();
    drawAllWeaponOnMap(ctx, camera.xView, camera.yView);
    player.drawCurrentAmmo();

    //updateMovementBullets();

    // checkAndSendPosition();

    // sendBullets();

    updateAllBullets(ctx, camera.xView, camera.yView);

    drawRemainingBlood(ctx, camera.xView, camera.yView);

    updateMovementPlayer(camera.xView, camera.yView, deltaTime);
    player.updateCharacter();
    if (!player.isCharacterLive)
    {
        player.appearanceAfterDeathWidthDelay();
        playerDeath(stateForWS.userId)
    }

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

export const initGame = async () => {
    console.log("11111")
    if (!stateForWS?.mapName) {
        await new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (stateForWS?.mapName) {
                    console.log("||||||")
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 2000);
        });
    }
    console.log("00000")
    const gettedMap = await getMap(stateForWS.mapName);
    console.log("====")
    const imgMap = new Image();
    imgMap.src = gettedMap.image;
    map.image = imgMap;
    map.generate(ctx);
    map.fillWalls(gettedMap.walls);
    console.log("++++")
    if (stateForWS.userId === stateForWS.hostId) {
        console.log("}}}}")
        sendWebSocketMessage({
            type: "weapons_points",
            data: {
                weapons_points: [{x: 0, y: 0}]//gettedMap.weaponsPoints,
            }
        })
    }
    console.log("#99999")
    sendWebSocketMessage({
        type: "ready_to_battle",
    })
    console.log("#88888")
    // setTimeout(() => {
    //     gameLoop();
    // }, 100);
}