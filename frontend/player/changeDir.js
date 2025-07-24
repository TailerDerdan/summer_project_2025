import { player } from "./player.js";
import { camera } from '../camera/camera.js';

export function getDir(event)
{
    const xMouse = event.clientX + camera.xView;
    const yMouse = event.clientY + camera.yView;

    let dir = Math.atan2((yMouse - player.getCenterY()), (xMouse - player.getCenterX()));
    dir = dir * 180 / Math.PI;
    dir += 90;
    if (dir < 0)
    {
        dir += 360;
    }
    return dir;
}

export function inverseDir(objForMovement)
{
    if (objForMovement.dir > 90 && objForMovement.dir < 270)
    {
        objForMovement.distX *= -1;
        objForMovement.distY *= -1;
    }
}

document.addEventListener('mousemove', (event) => {
    player.setDir(getDir(event));
});