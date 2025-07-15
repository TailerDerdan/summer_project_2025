import { player } from './../player/player.js';
import { TYPE_WEAPON, InitAssaultRifle, InitShotgun, InitSniperRifle, Weapon } from './typeWeapons.js';
import { ctx } from  './../canvas.js';
import { enemy1 } from '../enemy/enemy.js';
import { Bullet } from './bullet.js';
import { camera } from '../camera/camera.js';
import { getDir, inverseDir } from '../player/changeDir.js';

const bullets = [];

const updateBullets = (event) => {

    if (!player.weapon) return;

    if (!player.isPlayerLive) return;

    enemy1.soundShoot.stop();

    const objForMovement = {
        dir: 0,
        distX: 0,
        distY: 0
    }

    objForMovement.dir = player.dir;

    objForMovement.distY = Math.cos(objForMovement.dir * Math.PI / 180) * Math.cos(objForMovement.dir * Math.PI / 180);
    objForMovement.distX = Math.cos(objForMovement.dir * Math.PI / 180) * Math.sin(objForMovement.dir * Math.PI / 180);

    let diag = Math.sqrt(objForMovement.distX * objForMovement.distX + objForMovement.distY * objForMovement.distY);
    objForMovement.distX /= diag;
    objForMovement.distY /= diag;

    inverseDir(objForMovement);

    let speedBullet = player.weapon.speedBullet;

    objForMovement.distX *= speedBullet;
    objForMovement.distY *= speedBullet;

    const bullet = new Bullet(player.x, player.y, speedBullet, objForMovement.dir, objForMovement.distX, objForMovement.distY, player.weapon.fireRange);
    bullets.push(bullet);
    enemy1.soundShoot.play();
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
            let obj = elem;
            bullets.splice(index, 1);
            obj = null;
        }
        if (enemy1.container.isTwoContainerConcerns(elem.container, camera.xView, camera.yView) && enemy1.isEnemyLive)
        {
            let obj = elem;
            bullets.splice(index, 1);
            obj = null;
            enemy1.wasEnemyWounded = true;
        }

        elem.setY(elem.getY() - elem.getDistY());
        elem.setX(elem.getX() + elem.getDistX());

        elem.drawBullet(ctx, camera.xView, camera.yView);
    });
}

// let throttleUpd = throttle(updateBullets, player.weapon.timeBetweenBul * 1000);

// function throttleUpdateBullets(event)
// {
//     throttleUpd(event);
// }

// document.addEventListener('mousedown', throttleUpdateBullets);

let intervalId = 0;
document.addEventListener('mousedown', (event) => {
    intervalId = setInterval(() => {updateBullets(event);}, player.weapon.timeBetweenBul * 1000);
})
document.addEventListener('mouseup', () => {
    clearInterval(intervalId);
})