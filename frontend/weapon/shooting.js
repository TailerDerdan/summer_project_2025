import { player, arrEnemy, arrBot } from '../player/player.js';
import { TYPE_WEAPON, InitAssaultRifle, InitShotgun, InitSniperRifle, Weapon } from './typeWeapons.js';
import { ctx } from  '../canvas.js';
import { Bullet } from './bullet.js';
import { camera } from '../camera/camera.js';
import { getDir, inverseDir } from '../player/changeDir.js';

const bullets = [];
export const playerBullets = [];

function randomMinMax(min, max)
{
    return Math.random() * (max - min) + min;
}

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

    if ((!player.weapon) || (!player.isCharacterLive)) return;

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
                player
            );
            bullets.push(bullet);
            playerBullets.push({
                x: bullet.x,
                y: bullet.y,
                distX: bullet.distX,
                distY: bullet.distY,
            });
        }
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
            player
        );
        bullets.push(bullet);
        playerBullets.push({
            x: bullet.x,
            y: bullet.y,
            distX: bullet.distX,
            distY: bullet.distY,
        });
    }

    player.soundShoot.play();
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
                bot
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
            bot
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

export function updateMovementBullets()
{
    bullets.forEach((elem, index) => {

        let remainingDist = elem.getRemainingDist(elem.getFireRange());

        if (remainingDist >= -4 && remainingDist <= 4)
        {
            bullets.splice(index, 1);
        }

        for (const enemy of arrEnemy) {
            if (enemy.container.isTwoContainerConcerns(elem.container, camera.xView, camera.yView) &&
                enemy.isCharacterLive &&
                (elem.owner !== enemy)
            )
            {
                bullets.splice(index, 1);
                enemy.wasCharacterWounded = true;
            }
        }

        for (const bot of arrBot) {
            if (bot.container.isTwoContainerConcerns(elem.container, camera.xView, camera.yView) &&
                bot.isCharacterLive &&
                elem.owner !== bot
            ) {
                bullets.splice(index, 1);
                bot.wasCharacterWounded = true;
            }
        }

        if (player.container.isTwoContainerConcerns(elem.container, camera.xView, camera.yView) &&
            player.isCharacterLive &&
            elem.owner !== player
        )
        {
            bullets.splice(index, 1);
            player.wasCharacterWounded = true;
        }

        elem.setY(elem.getY() - elem.getDistY());
        elem.setX(elem.getX() + elem.getDistX());

        elem.drawBullet(ctx, camera.xView, camera.yView);
    });
}

let throttleUpd = throttle(updateBullets, player.weapon.timeBetweenBul * 1000);

// export let throttleBotsShoot = [];
// for (const bot of arrBot) {
//     const throttleBotShoot = throttle(updateBotShooting(bot), bot.weapon.timeBetweenBul * 1000);
//     throttleBotsShoot.push(throttleBotShoot);
// }

export let throttleBotsShoot = [];
for (const bot of arrBot) {
    if (bot.weapon) {
        const throttleBotShoot = throttle(() => updateBotShooting(bot), bot.weapon.timeBetweenBul * 1000);
        throttleBotsShoot.push(throttleBotShoot);
    }
}

function throttleUpdateBullets(event)
{
    throttleUpd(event);
}

document.addEventListener('mousedown', throttleUpdateBullets);

// let intervalId = 0;
// document.addEventListener('mousedown', (event) => {
//     intervalId = setInterval(() => {updateBullets(event);}, player.weapon.timeBetweenBul * 1000);
// })
// document.addEventListener('mouseup', () => {
//     clearInterval(intervalId);
// })