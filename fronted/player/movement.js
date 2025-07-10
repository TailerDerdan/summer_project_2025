import { player } from './player.js';
import { ctx } from './../canvas.js';

const SQRT_2 = 0.707;
const MAX_DIST = 1;
const MIN_DIST = 0;

const keyDict = {};
const updateKeyDict = (event) => {

    const k = event.code;
    if (/^Key[WASD]/.test(k)) {
        event.preventDefault();
        keyDict[k] = event.type === 'keydown';
    }
};

export const updateMovementPlayer = () => {

    let playerDir = player.getDir();

    let distX = keyDict.KeyW && (keyDict.KeyA || keyDict.KeyD) ||
            keyDict.KeyS && (keyDict.KeyA || keyDict.KeyD) ? SQRT_2 : MAX_DIST;
    
    let distY = keyDict.KeyW && (keyDict.KeyA || keyDict.KeyD) ||
            keyDict.KeyS && (keyDict.KeyA || keyDict.KeyD) ? SQRT_2 : MAX_DIST;

    
    distY *= Math.cos(playerDir * Math.PI / 180) * Math.cos(playerDir * Math.PI / 180);
    distX *= Math.cos(playerDir * Math.PI / 180) * Math.sin(playerDir * Math.PI / 180);

    if ((playerDir > 65 && playerDir < 90) ||
        (playerDir > 90 && playerDir < 115) ||
        (playerDir > 245 && playerDir < 270) ||
        (playerDir > 270 && playerDir < 305))
    {        
        if (distX >= 0 && distX <= 0.5)
        {
            distX = Math.ceil(distX) * 0.8;
        }
        if (distX >= -0.5 && distX <= 0)
        {
            distX = Math.floor(distX) * 0.8;
        }
        distY *= 2;
    }

    if (playerDir > 90 && playerDir < 270)
    {
        distX *= -1;
        distY *= -1;
    }

    let speedPlayer = player.getSpeed();

    distX *= speedPlayer;
    distY *= speedPlayer;

    distX /= player.getWeapon().weight * 2;
    distY /= player.getWeapon().weight * 2;

    if (keyDict.KeyW) 
    {
        player.setY(player.getY() - distY);
        player.setX(player.getX() + distX);
    }
    if (keyDict.KeyS)
    {
        player.setY(player.getY() + distY);
        player.setX(player.getX() - distX);
    }

    if (keyDict.KeyD) 
    {
        player.setY(player.getY() + distY);
        player.setX(player.getX() + distX);
    }
    if (keyDict.KeyA)
    {
        player.setY(player.getY() - distY);
        player.setX(player.getX() - distX);
    }

    player.drawPlayer(ctx);
}

document.addEventListener('keydown', updateKeyDict);
document.addEventListener('keyup', updateKeyDict);