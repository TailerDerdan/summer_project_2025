import { player, arrEnemy, arrBot } from '../player/player.js';
import { TYPE_WEAPON, InitAssaultRifle, InitShotgun, InitSniperRifle, Weapon } from './typeWeapons.js';
import { ctx } from  '../canvas.js';
import { enemy1 } from '../enemy/enemy.js';
import { bot1 } from '../bot/Bot.js';
import { Bullet } from './bullet.js';
import { camera } from '../camera/camera.js';
import { getDir, inverseDir } from '../player/changeDir.js';

const bullets = [];

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

    enemy1.soundShoot.stop();
    bot1.soundShoot.stop();

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
        }
    }

    enemy1.soundShoot.play();
    bot1.soundShoot.play();
}

function updateBotShooting() {
    if (!bot1.isCharacterLive || !bot1.weapon || !bot1.canStrike) return;

    const objForMovement = {
        dir: 0,
        distX: 0,
        distY: 0
    };

    if (bot1.weapon.type === TYPE_WEAPON.SHOTGUN)
    {
        for (let iter = 0; iter < 6; iter++)
        {
            objForMovement.dir = randomMinMax(bot1.dir - 6, bot1.dir + 6);

            getNormalizeShootingVect(objForMovement);

            inverseDir(objForMovement);

            let speedBullet = randomMinMax(bot1.weapon.speedBullet + 3, bot1.weapon.speedBullet + 7);

            changeDistXYBySpeedBullet(objForMovement, speedBullet);

            const bullet = new Bullet(
                bot1.x, bot1.y,
                speedBullet,
                objForMovement.dir,
                objForMovement.distX, objForMovement.distY,
                bot1.weapon.fireRange,
                bot1
            );
            bullets.push(bullet);
        }
    }
    else
    {
        objForMovement.dir = bot1.dir;

        getNormalizeShootingVect(objForMovement);

        inverseDir(objForMovement);

        changeDistXYBySpeedBullet(objForMovement, bot1.weapon.speedBullet);

        const bullet = new Bullet(
            bot1.x,
            bot1.y,
            bot1.weapon.speedBullet,
            objForMovement.dir,
            objForMovement.distX,
            objForMovement.distY,
            bot1.weapon.fireRange,
            bot1
        );

        bullets.push(bullet);
    }
    bot1.soundShoot.play();
}

export function throttle(func, delay)
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
            if (enemy.container.isTwoContainerConcerns(elem.container, camera.xView, camera.yView) && enemy.isCharacterLive && (elem.owner !== enemy))
            {
                bullets.splice(index, 1);
                enemy.wasCharacterWounded = true;
            }
        }

        for (const bot of arrBot) {
            if (bot.container.isTwoContainerConcerns(elem.container, camera.xView, camera.yView) && bot.isCharacterLive && (elem.owner !== bot)) {
                bullets.splice(index, 1);
                bot.wasCharacterWounded = true;
            }
        }

        if (player.container.isTwoContainerConcerns(elem.container, camera.xView, camera.yView) && player.isCharacterLive && (elem.owner !== player))
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

export let throttleBotsShoot = [];
for (const bot of arrBot) {
    const throttleBotShoot = throttle(updateBotShooting, bot.weapon.timeBetweenBul * 1000);
    throttleBotsShoot.push(throttleBotShoot);
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