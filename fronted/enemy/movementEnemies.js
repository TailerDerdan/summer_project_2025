import { camera } from "../camera/camera.js";
import { ctx } from "../canvas.js";
import { enemies } from "./enemy.js";

export function updateMovementEnemies(updatedEnemies)
{
    enemies.forEach(elem => {
        
        const updatedElem = updatedEnemies.find(item => item.id === elem.id);
        if (updatedElem)
        {
            elem.x = updatedElem.x;
            elem.y = updatedElem.y;
            elem.dir = updatedElem.dir;
            elem.drawEnemy(ctx, camera.xView, camera.yView);
        }
    });
}