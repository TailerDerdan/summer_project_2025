import { Player, drawPlayer } from './player.js';
import { changeDir } from './changeDir.js';

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

const updateMovementPlayer = () => {

    let distX = keyDict.KeyW && (keyDict.KeyA || keyDict.KeyD) ||
            keyDict.KeyS && (keyDict.KeyA || keyDict.KeyD) ? SQRT_2 : MAX_DIST;
    
    let distY = keyDict.KeyW && (keyDict.KeyA || keyDict.KeyD) ||
            keyDict.KeyS && (keyDict.KeyA || keyDict.KeyD) ? SQRT_2 : MAX_DIST;

    
    distY *= Math.cos(Player.dir * Math.PI / 180) * Math.cos(Player.dir * Math.PI / 180);
    distX *= Math.cos(Player.dir * Math.PI / 180) * Math.sin(Player.dir * Math.PI / 180);

    if ((Player.dir > 70 && Player.dir < 90) ||
        (Player.dir > 90 && Player.dir < 110) ||
        (Player.dir > 250 && Player.dir < 270) ||
        (Player.dir > 270 && Player.dir < 290))
    {
        
        console.log(distX);
        console.log(distY, "y");
        
        if (distX >= 0 && distX <= 0.5)
        {
            distX = Math.ceil(distX) * 0.6;
        }
        if (distX >= -0.5 && distX <= 0)
        {
            distX = Math.floor(distX) * 0.6;
        }
    }

    if (Player.dir > 90 && Player.dir < 270)
    {
        distX *= -1;
        distY *= -1;
    }

    distX *= Player.speed;
    distY *= Player.speed;

    if (keyDict.KeyW) 
    {
        Player.y -= distY;
        Player.x += distX;
        // console.log(distX)
    }
    if (keyDict.KeyS)
    {
        Player.y += distY;
        Player.x -= distX;
    }

    if (keyDict.KeyD) 
    {
        Player.y += distX;
        Player.x += distY;
    }
    if (keyDict.KeyA)
    {
        Player.y -= distX;
        Player.x -= distY;
    }

    drawPlayer();
}

document.addEventListener('keydown', updateKeyDict);
document.addEventListener('keyup', updateKeyDict);

export function engine() {
    updateMovementPlayer();
    changeDir();
    window.requestAnimationFrame(engine);
};