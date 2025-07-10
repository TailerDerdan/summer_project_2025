import { player } from './../player/player.js';
import { TYPE_WEAPON, InitAssaultRifle, InitShotgun, InitSniperRifle, Weapon, Bullet } from './typeWeapons.js';
import { ctx } from  './../canvas.js';
import { enemy1 } from '../enemy/enemy.js';

const bullets = [];

const updateBullets = (event) => {

    if (!player.getWeapon()) return;

    const xMouse = event.clientX;
    const yMouse = event.clientY;

    let dir = Math.atan2((yMouse - player.getCenterY()), (xMouse - player.getCenterX()));
    dir = dir * 180 / Math.PI;
    
    dir += 90;

    if (dir < 0)
    {
        dir += 360;
    }

    let distY = Math.cos(dir * Math.PI / 180) * Math.cos(dir * Math.PI / 180);
    let distX = Math.cos(dir * Math.PI / 180) * Math.sin(dir * Math.PI / 180);

    if (dir > 90 && dir < 270)
    {
        distX *= -1;
        distY *= -1;
    }

    if ((dir > 60 && dir < 90) ||
        (dir > 90 && dir < 120) ||
        (dir > 240 && dir < 270) ||
        (dir > 270 && dir < 300))
    {        
        if (distX >= 0 && distX <= 0.5)
        {
            distX = Math.ceil(distX) * 0.8;
        }
        if (distX >= -0.5 && distX <= 0)
        {
            distX = Math.floor(distX) * 0.8;
        }
    }

    let speedBullet = player.getWeapon().speedBullet;

    distX *= speedBullet;
    distY *= speedBullet;

    const bullet = new Bullet(player.getX(), player.getY(), speedBullet, dir, distX, distY, player.getWeapon().fireRange);
    bullets.push(bullet);
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

let throttleUpd = throttle(updateBullets, player.getWeapon().timeBetweenBul * 1000);

function throttleUpdateBullets(event)
{
    throttleUpd(event);
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

        if (enemy1.container.isTwoContainerConcerns(elem.container))
        {
            let obj = elem;
            bullets.splice(index, 1);
            obj = null;
        }

        elem.setY(elem.getY() - elem.getDistY());
        elem.setX(elem.getX() + elem.getDistX());

        elem.drawBullet(ctx);
    });
}

document.addEventListener('mousedown', throttleUpdateBullets);