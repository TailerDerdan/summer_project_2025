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

export const updateMovementPlayer = (xView, yView) => {

    let playerDir = player.getDir();

    let distX = keyDict.KeyW && (keyDict.KeyA || keyDict.KeyD) ||
            keyDict.KeyS && (keyDict.KeyA || keyDict.KeyD) ? SQRT_2 : MAX_DIST;
    
    let distY = keyDict.KeyW && (keyDict.KeyA || keyDict.KeyD) ||
            keyDict.KeyS && (keyDict.KeyA || keyDict.KeyD) ? SQRT_2 : MAX_DIST;

    distY *= Math.cos(playerDir * Math.PI / 180) * Math.cos(playerDir * Math.PI / 180);
    distX *= Math.cos(playerDir * Math.PI / 180) * Math.sin(playerDir * Math.PI / 180);

    let diag = Math.sqrt(distX * distX + distY * distY);

    distX /= diag;
    distY /= diag;

    if (playerDir > 90 && playerDir < 270)
    {
        distX *= -1;
        distY *= -1;
    }

    const dist = {
        distX: distX,
        distY: distY
    }

    player.changeDistXYByPhysic(dist);

    player.updatePostion(dist.distX, dist.distY, keyDict);

    player.drawPlayer(ctx, xView, yView);
}

document.addEventListener('keydown', updateKeyDict);
document.addEventListener('keyup', updateKeyDict);