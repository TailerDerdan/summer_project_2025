import { updateMovementPlayer } from './player/movement.js'
import { updateMovementBullets } from './weapon/shooting.js';
import { canvas, ctx } from './canvas.js';
import { map } from './map/map.js';
import { camera } from './camera/camera.js';
import {} from './player/changeDir.js';
// import { sendDataByWS } from './ws/ws.js'


function gameLoop()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
// ------------------------------------------------------------------- //
    map.draw(ctx, camera.xView, camera.yView);
// ------------------------------------------------------------------- //
    updateMovementBullets();
    updateMovementPlayer(camera.xView, camera.yView);
    camera.update();
// ------------------------------------------------------------------- //
    // sendDataByWS();
    window.requestAnimationFrame(gameLoop);
}

gameLoop();