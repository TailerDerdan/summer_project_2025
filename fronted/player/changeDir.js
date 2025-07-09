import { player } from './player.js';

export function changeDir()
{
    document.addEventListener('mousemove', (event) => {
        
        const xMouse = event.clientX;
        const yMouse = event.clientY;

        let dir = Math.atan2((yMouse - player.getCenterY()), (xMouse - player.getCenterX()));
        dir = dir * 180 / Math.PI;
        
        dir += 90;

        if (dir < 0)
        {
            dir += 360;
        }
        player.setDir(dir);
    });
}