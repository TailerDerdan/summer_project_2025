import { player, arrEnemy, arrBot } from '../player/player.js';
import { TYPE_WEAPON, InitAssaultRifle, InitShotgun, InitSniperRifle, Weapon } from './typeWeapons.js';
import { ctx } from  '../canvas.js';
import { Bullet } from './bullet.js';
import { camera } from '../camera/camera.js';
import { getDir, inverseDir } from '../player/changeDir.js';
import { randomMinMax } from '../random.js';
import {playerDeath, playerKill} from '../player/KillAndDeath.js';
import { stateForWS } from '../ws/websocketGame.js';
import { enemyBullets } from "../ws/game.js";

const bullets = [];
export const playerBullets = [];

function getNormalizeShootingVect(objForMovement) {
    const angle = objForMovement.dir * Math.PI / 180;

    objForMovement.distY = Math.cos(angle) * Math.cos(angle);
    objForMovement.distX = Math.cos(angle) * Math.sin(angle);

    const diag = Math.hypot(objForMovement.distX, objForMovement.distY);
    objForMovement.distX /= diag;
    objForMovement.distY /= diag;
}

function changeDistXYBySpeedBullet(objForMovement, speedBullet) {
    objForMovement.distX *= speedBullet;
    objForMovement.distY *= speedBullet;
}

const updateBullets = (event) => {

    if (event.button === 0) {
        if ((!player.weapon) || (!player.isCharacterLive)) return;

        if (player.weapon.currentAmmo === 0) return;

        player.soundShoot.stop();

        const objForMovement = {
            dir: 0,
            distX: 0,
            distY: 0
        }

        if (player.weapon.type === TYPE_WEAPON.SHOTGUN)
        {
            for (let iter = 0; iter < 6; iter++)
            {
                objForMovement.dir = randomMinMax(player.dir - 6, player.dir + 6);

                getNormalizeShootingVect(objForMovement);

                inverseDir(objForMovement);

                let speedBullet = randomMinMax(player.weapon.speedBullet + 3, player.weapon.speedBullet + 7);

                changeDistXYBySpeedBullet(objForMovement, speedBullet);

                const bullet = new Bullet(
                    player.x, player.y,
                    speedBullet,
                    objForMovement.dir,
                    objForMovement.distX, objForMovement.distY,
                    player.weapon.fireRange,
                    player.id
                );
                playerBullets.push(bullet);
            }
            player.weapon.currentAmmo--;
        }
        else
        {
            objForMovement.dir = player.dir;

            getNormalizeShootingVect(objForMovement);

            inverseDir(objForMovement);

            changeDistXYBySpeedBullet(objForMovement, player.weapon.speedBullet);

            const bullet = new Bullet(
                player.x, player.y,
                player.weapon.speedBullet,
                objForMovement.dir,
                objForMovement.distX, objForMovement.distY,
                player.weapon.fireRange,
                player.id
            );
            playerBullets.push(bullet);
            player.weapon.currentAmmo--;
        }

        player.soundShoot.play();
    }
}

export function updateBotShooting(bot) {
    if (!bot.isCharacterLive || !bot.weapon || !bot.canStrike) return;

    const objForMovement = {
        dir: 0,
        distX: 0,
        distY: 0
    };

    if (bot.weapon.type === TYPE_WEAPON.SHOTGUN)
    {
        for (let iter = 0; iter < 6; iter++)
        {
            objForMovement.dir = randomMinMax(bot.dir - 6, bot.dir + 6);

            getNormalizeShootingVect(objForMovement);

            inverseDir(objForMovement);

            let speedBullet = randomMinMax(bot.weapon.speedBullet + 3, bot.weapon.speedBullet + 7);

            changeDistXYBySpeedBullet(objForMovement, speedBullet);

            const bullet = new Bullet(
                bot.x, bot.y,
                speedBullet,
                objForMovement.dir,
                objForMovement.distX, objForMovement.distY,
                bot.weapon.fireRange,
                null
            );
            bullets.push(bullet);
        }
    }
    else
    {
        objForMovement.dir = bot.dir;

        getNormalizeShootingVect(objForMovement);

        inverseDir(objForMovement);

        changeDistXYBySpeedBullet(objForMovement, bot.weapon.speedBullet);

        const bullet = new Bullet(
            bot.x, bot.y,
            bot.weapon.speedBullet,
            objForMovement.dir,
            objForMovement.distX,
            objForMovement.distY,
            bot.weapon.fireRange,
            null
        );

        bullets.push(bullet);
    }
    bot.soundShoot.play();
}

function throttle(func, delay)
{
    let isThrottled = false;
    let waitingArgs;

    const timoutFunc = () => {
        if (waitingArgs == null)
        {
            isThrottled = false;
        }
        else
        {
            func(...waitingArgs);
            waitingArgs = null;
            setTimeout(timoutFunc, delay);
        }
    }

    return (...args) => {
        if (isThrottled)
        {
            waitingArgs = args;
            return;
        }

        func(...args);
        isThrottled = true;

        setTimeout(timoutFunc, delay);
    }
}

export let throttleBotsShoot = [];
for (const bot of arrBot) {
    if (bot.weapon) {
        const throttleBotShoot = throttle(() => updateBotShooting(bot), bot.weapon.timeBetweenBul * 1000);
        throttleBotsShoot.push(throttleBotShoot);
    }
}

let throttleUpd = throttle(updateBullets, player.weapon.timeBetweenBul * 1000);

function throttleUpdateBullets(event)
{
    throttleUpd(event);
}

document.addEventListener('mousedown', throttleUpdateBullets);

function updatePlayerBulletsOnMap(ctx, xView, yView, bullets) {
    bullets.forEach((bullet, index) => {
        for (const [id, enemy] of arrEnemy) {
            if (enemy.container.isTwoContainerConcerns(bullet.container, camera.xView, camera.yView) &&
                enemy.isCharacterLive &&
                (bullet.ownerId.toString() !== enemy.id.toString())
            )
            {
                bullets.splice(index, 1);
                enemy.wasCharacterWounded = true;
                if (bullet.ownerId.toString() === player.id.toString()) {
                    playerKill(player.id);
                }
            }
        }

        bullet.setX(bullet.getX() + bullet.getDistX());
        bullet.setY(bullet.getY() - bullet.getDistY());

        const remainingDist = bullet.getRemainingDist(bullet.getFireRange());
        if (remainingDist >= -4 && remainingDist <= 4) {
            enemyBullets.splice(index, 1);
        }

        bullet.drawBullet(ctx, xView, yView);
    });
}

function updateEnemyBulletsOnMap(ctx, xView, yView, bullets) {
    bullets.forEach((bullet, index) => {
        if (player.container.isTwoContainerConcerns(bullet.container, camera.xView, camera.yView) &&
            player.isCharacterLive
        )
        {
            bullets.splice(index, 1);
            player.wasCharacterWounded = true;
            playerDeath(player.id);
        }

        bullet.setX(bullet.getX() + bullet.getDistX());
        bullet.setY(bullet.getY() - bullet.getDistY());

        const remainingDist = bullet.getRemainingDist(bullet.getFireRange());
        if (remainingDist >= -4 && remainingDist <= 4) {
            enemyBullets.splice(index, 1);
        }

        bullet.drawBullet(ctx, xView, yView);
    });
}

export function updateAllBullets(ctx, xView, yView) {
    updateEnemyBulletsOnMap(ctx, xView, yView, enemyBullets);
    updatePlayerBulletsOnMap(ctx, xView, yView, playerBullets);
}

// let intervalId = 0;
// document.addEventListener('mousedown', (event) => {
//     intervalId = setInterval(() => {updateBullets(event);}, player.weapon.timeBetweenBul * 1000);
// })
// document.addEventListener('mouseup', () => {
//     clearInterval(intervalId);
// })