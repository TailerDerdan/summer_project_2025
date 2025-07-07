import { ctx, canvas } from './canvas.js';

export const Player = {
    radius: 10,
    x: 100,
    y: 100,
    speed: 2.5,
}

function drawPlayer() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(Player.x, Player.y, Player.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
}

const keyDict = {};
const updateKeyDict = (event) => {

    const k = event.code;
    if (/^Key[WASD]/.test(k)) {
        event.preventDefault();
        keyDict[k] = event.type === 'keydown';
    }
};

const updateMovementPlayer = () => {

    let dist = keyDict.KeyW && (keyDict.KeyA || keyDict.KeyD) ||
            keyDict.KeyS && (keyDict.KeyA || keyDict.KeyD) ? 0.707 : 1;
    
    dist *= Player.speed;

    if (keyDict.KeyA) Player.x -= dist;
    if (keyDict.KeyW) Player.y -= dist;
    if (keyDict.KeyD) Player.x += dist;
    if (keyDict.KeyS) Player.y += dist;

    drawPlayer();
}

document.addEventListener('keydown', updateKeyDict);
document.addEventListener('keyup', updateKeyDict);

export function engine() {
    updateMovementPlayer();
    window.requestAnimationFrame(engine);
};